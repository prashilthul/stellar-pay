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
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <FaClock className="text-blue-400 text-2xl" />
          <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-400 border-r-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <FaClock className="text-red-400 text-2xl" />
          <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <FaClock className="text-blue-400 text-2xl" />
          <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-slate-400">No transactions yet</p>
          <p className="text-slate-500 text-sm mt-2">Your transaction history will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <FaClock className="text-blue-400 text-2xl" />
        <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
      </div>

      <div className="space-y-3">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  isOutgoing(tx) ? 'bg-red-500/20' : 'bg-green-500/20'
                }`}>
                  {isOutgoing(tx) ? (
                    <FaArrowUp className="text-red-400" />
                  ) : (
                    <FaArrowDown className="text-green-400" />
                  )}
                </div>
                <div>
                  <p className="text-white font-medium">
                    {isOutgoing(tx) ? 'Sent' : 'Received'} {tx.amount} {tx.asset}
                  </p>
                  <p className="text-slate-400 text-sm">
                    {formatDate(tx.createdAt)}
                  </p>
                </div>
              </div>
              <a
                href={stellar.getExplorerLink(tx.hash, 'tx')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
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
          className="text-blue-400 hover:text-blue-300 text-sm underline"
        >
          View all transactions on Stellar Expert →
        </a>
      </div>
    </div>
  );
}