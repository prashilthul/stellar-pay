/**
 * TransactionHistory Component
 *
 * Displays recent transactions for the connected wallet
 */

'use client';

import { useState, useEffect } from 'react';
import { stellar } from '@/lib/stellar-helper';
import { FaArrowUp, FaArrowDown, FaClock, FaExternalLinkAlt } from 'react-icons/fa';
import * as StellarSdk from '@stellar/stellar-sdk';

interface Transaction {
  id: string;
  type: string;
  amount?: string;
  asset?: string;
  from?: string;
  to?: string;
  createdAt: string;
  hash: string;
}

interface TransactionHistoryProps {
  publicKey: string;
}

export default function TransactionHistory({ publicKey }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Create a temporary server instance for fetching transactions
        const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

        // Get recent transactions
        const payments = await server
          .payments()
          .forAccount(publicKey)
          .order('desc')
          .limit(10)
          .call();

        const txData = payments.records.map((payment: any) => ({
          id: payment.id,
          type: payment.type,
          amount: payment.amount,
          asset: payment.asset_type === 'native' ? 'XLM' : payment.asset_code,
          from: payment.from,
          to: payment.to,
          createdAt: payment.created_at,
          hash: payment.transaction_hash,
        }));

        setTransactions(txData);
      } catch (err: any) {
        console.error('Error fetching transactions:', err);
        setError('Failed to fetch transaction history');
      } finally {
        setLoading(false);
      }
    };

    if (publicKey) {
      fetchTransactions();
    }
  }, [publicKey]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOutgoing = (tx: Transaction) => tx.from === publicKey;

  if (loading) {
    return (
      <div className="bg-[var(--surface-card)] border border-[var(--hairline)] rounded-2xl p-8 fade-in">
        <div className="flex items-center gap-3 mb-4">
          <FaClock className="text-[var(--primary)] text-2xl" />
          <h2 className="text-[24px] font-bold text-[var(--on-dark)]">Recent Transactions</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--primary)] border-r-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[var(--surface-card)] border border-[var(--hairline)] rounded-2xl p-8 fade-in">
        <div className="flex items-center gap-3 mb-4">
          <FaClock className="text-[var(--accent-rose)] text-2xl" />
          <h2 className="text-[24px] font-bold text-[var(--on-dark)]">Recent Transactions</h2>
        </div>
        <div className="bg-[var(--surface-soft)] border border-[var(--hairline)] rounded-lg p-4">
          <p className="text-[var(--accent-rose)] text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-[var(--surface-card)] border border-[var(--hairline)] rounded-2xl p-8 fade-in">
        <div className="flex items-center gap-3 mb-4">
          <FaClock className="text-[var(--primary)] text-2xl" />
          <h2 className="text-[24px] font-bold text-[var(--on-dark)]">Recent Transactions</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-[var(--muted)]">No transactions yet</p>
          <p className="text-[var(--muted-soft)] text-sm mt-2">Your transaction history will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--hairline)] rounded-2xl p-8 fade-in">
      <div className="flex items-center gap-3 mb-6">
        <FaClock className="text-[var(--primary)] text-2xl" />
        <h2 className="text-[24px] font-bold text-[var(--on-dark)]">Recent Transactions</h2>
      </div>

      <div className="space-y-3">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="bg-[var(--surface-soft)] rounded-xl p-4 border border-[var(--hairline)] hover:border-[var(--hairline-strong)] transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  isOutgoing(tx) ? 'bg-[var(--surface-elevated)]' : 'bg-[var(--surface-elevated)]'
                }`}>
                  {isOutgoing(tx) ? (
                    <FaArrowUp className="text-[var(--accent-rose)]" />
                  ) : (
                    <FaArrowDown className="text-[var(--accent-emerald)]" />
                  )}
                </div>
                <div>
                  <p className="text-[var(--on-dark)] font-medium">
                    {isOutgoing(tx) ? 'Sent' : 'Received'} {tx.amount} {tx.asset}
                  </p>
                  <p className="text-[var(--muted)] text-sm">
                    {formatDate(tx.createdAt)}
                  </p>
                </div>
              </div>
              <a
                href={stellar.getExplorerLink(tx.hash, 'tx')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--primary)] hover:text-[var(--primary-active)] transition-colors"
                title="View on Stellar Expert"
              >
                <FaExternalLinkAlt />
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <a
          href={stellar.getExplorerLink(publicKey, 'account')}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--primary)] hover:text-[var(--primary-active)] text-sm underline"
        >
          View all transactions on Stellar Expert →
        </a>
      </div>
    </div>
  );
}