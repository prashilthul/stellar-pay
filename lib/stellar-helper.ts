/**
 * Stellar Helper - Blockchain Logic with Freighter API
 */

import * as StellarSdk from '@stellar/stellar-sdk';
import { signTransaction, setAllowed, getAddress } from '@stellar/freighter-api';

export interface Balance {
  xlm: string;
  assets: Array<{ code: string; issuer: string; balance: string }>;
}

export interface TransactionResult {
  hash: string;
  success: boolean;
  fee?: number;
}

export interface AccountInfo {
  id: string;
  sequence: string;
  balances: any[];
  signers: any[];
  thresholds: any;
}

export class StellarHelper {
  private server: StellarSdk.Horizon.Server;
  private networkPassphrase: string;
  private publicKey: string | null = null;
  private readonly NETWORKS = {
    testnet: {
      horizon: 'https://horizon-testnet.stellar.org',
      passphrase: 'Test SDF Network ; September 2015',
      explorer: 'testnet'
    },
    mainnet: {
      horizon: 'https://horizon.stellar.org',
      passphrase: 'Public Global Stellar Network ; September 2015',
      explorer: 'public'
    }
  };

  constructor(network: 'testnet' | 'mainnet' = 'testnet') {
    const config = this.NETWORKS[network];
    this.server = new StellarSdk.Horizon.Server(config.horizon);
    this.networkPassphrase = config.passphrase;
  }

  /**
   * Check if Freighter wallet is installed and available
   */
  async isFreighterInstalled(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
    // The @stellar/freighter-api might be more reliable
    // We check both the window object and the API's isConnected helper
    try {
      const { isConnected } = await import('@stellar/freighter-api');
      const connected = await isConnected();
      return !!connected;
    } catch (e) {
      return !!(window as any).freighter;
    }
  }

  /**
   * Connect to Stellar wallet
   */
  async connectWallet(): Promise<string> {
    if (typeof window === 'undefined') {
      throw new Error('Wallet can only be connected in the browser');
    }

    const installed = await this.isFreighterInstalled();
    if (!installed) {
      throw new Error('Freighter wallet not found. Please install the extension from the Chrome Web Store.');
    }

    try {
      // First check if we can access the API
      const isAllowed = await setAllowed();
      if (!isAllowed) {
        throw new Error('Access to Freighter was denied by the user.');
      }

      const { address } = await getAddress();
      if (!address) {
        throw new Error('No account found in Freighter. Please create or import an account.');
      }

      this.publicKey = address;
      return address;
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      if (error.message.includes('User denied')) {
        throw new Error('Connection request was rejected.');
      }
      throw new Error(error.message || 'Wallet connection failed');
    }
  }

  /**
   * Get account balance
   */
  async getBalance(publicKey: string): Promise<Balance> {
    try {
      const account = await this.server.loadAccount(publicKey);

      const xlmBalance = account.balances.find(
        (b) => b.asset_type === 'native'
      );

      const assets = account.balances
        .filter((b) => b.asset_type !== 'native')
        .map((b: any) => ({
          code: b.asset_code,
          issuer: b.asset_issuer,
          balance: b.balance,
        }));

      return {
        xlm: xlmBalance && 'balance' in xlmBalance ? xlmBalance.balance : '0',
        assets,
      };
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw new Error('Failed to fetch account balance');
    }
  }

  /**
   * Send payment transaction
   */
  async sendPayment(params: {
    from: string;
    to: string;
    amount: string;
    memo?: string;
  }): Promise<TransactionResult> {
    try {
      const account = await this.server.loadAccount(params.from);

      // Calculate fee based on current network conditions
      const fee = await this.server.fetchBaseFee();

      const transactionBuilder = new StellarSdk.TransactionBuilder(account, {
        fee: fee.toString(),
        networkPassphrase: this.networkPassphrase,
      }).addOperation(
        StellarSdk.Operation.payment({
          destination: params.to,
          asset: StellarSdk.Asset.native(),
          amount: params.amount,
        })
      );

      if (params.memo) {
        transactionBuilder.addMemo(StellarSdk.Memo.text(params.memo));
      }

      const transaction = transactionBuilder.setTimeout(180).build();

      const { signedTxXdr } = await signTransaction(transaction.toXDR(), {
        networkPassphrase: this.networkPassphrase,
        address: params.from,
      });

      const transactionToSubmit = StellarSdk.TransactionBuilder.fromXDR(
        signedTxXdr,
        this.networkPassphrase
      );

      const result = await this.server.submitTransaction(
        transactionToSubmit as StellarSdk.Transaction
      );

      return {
        hash: result.hash,
        success: result.successful,
        fee: Number(fee),
      };
    } catch (error: any) {
      console.error('Payment error:', error);

      // Provide more specific error messages
      if (error.response && error.response.data && error.response.data.extras) {
        const extras = error.response.data.extras;
        if (extras.result_codes) {
          throw new Error(`Transaction failed: ${extras.result_codes.operations.join(', ')}`);
        }
      }

      throw error;
    }
  }

  /**
   * Get account information
   */
  async getAccountInfo(publicKey: string): Promise<AccountInfo> {
    try {
      const account = await this.server.loadAccount(publicKey);
      return {
        id: account.accountId(),
        sequence: account.sequenceNumber(),
        balances: account.balances,
        signers: account.signers,
        thresholds: account.thresholds,
      };
    } catch (error) {
      console.error('Error fetching account info:', error);
      throw new Error('Failed to fetch account information');
    }
  }

  /**
   * Estimate current network fee
   */
  async estimateFee(): Promise<number> {
    try {
      return await this.server.fetchBaseFee();
    } catch (error) {
      console.error('Error estimating fee:', error);
      return Number(StellarSdk.BASE_FEE);
    }
  }

  /**
   * Get recent transactions
   */
  async getRecentTransactions(
    publicKey: string,
    limit: number = 10
  ): Promise<Array<{
    id: string;
    type: string;
    amount?: string;
    asset?: string;
    from?: string;
    to?: string;
    createdAt: string;
    hash: string;
  }>> {
    try {
      const payments = await this.server
        .payments()
        .forAccount(publicKey)
        .order('desc')
        .limit(limit)
        .call();

      return payments.records.map((payment: any) => ({
        id: payment.id,
        type: payment.type,
        amount: payment.amount,
        asset: payment.asset_type === 'native' ? 'XLM' : payment.asset_code,
        from: payment.from,
        to: payment.to,
        createdAt: payment.created_at,
        hash: payment.transaction_hash,
      }));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw new Error('Failed to fetch transaction history');
    }
  }

  /**
   * Get explorer link for transaction or account
   */
  getExplorerLink(hash: string, type: 'tx' | 'account' = 'tx'): string {
    const network = this.networkPassphrase === this.NETWORKS.testnet.passphrase ? 'testnet' : 'public';
    return `https://stellar.expert/explorer/${network}/${type}/${hash}`;
  }

  /**
   * Format address for display
   */
  formatAddress(address: string, startChars: number = 4, endChars: number = 4): string {
    if (address.length <= startChars + endChars) {
      return address;
    }
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
  }

  /**
   * Validate Stellar address
   */
  isValidAddress(address: string): boolean {
    try {
      StellarSdk.StrKey.decodeEd25519PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Disconnect wallet
   */
  disconnect(): boolean {
    this.publicKey = null;
    return true;
  }

  /**
   * Get current network
   */
  getNetwork(): 'testnet' | 'mainnet' {
    return this.networkPassphrase === this.NETWORKS.testnet.passphrase ? 'testnet' : 'mainnet';
  }
}

export const stellar = new StellarHelper('testnet');