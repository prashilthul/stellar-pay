'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { stellar } from '@/lib/stellar-helper';
import { FaArrowUp, FaArrowDown, FaClock, FaChevronRight } from 'react-icons/fa';
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
  limit?: number;
}

export default function TransactionHistory({ publicKey, limit = 10 }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
        const payments = await server
          .payments()
          .forAccount(publicKey)
          .order('desc')
          .limit(limit)
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
  }, [publicKey, limit]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOutgoing = (tx: Transaction) => tx.from === publicKey && tx.to !== publicKey;
  const isIncoming = (tx: Transaction) => tx.to === publicKey && tx.from !== publicKey;
  const isSelf = (tx: Transaction) => tx.from === publicKey && tx.to === publicKey;

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-surface-soft border border-hairline rounded animate-pulse w-full"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 bg-accent-rose/5 border border-accent-rose/20 rounded">
        <p className="text-accent-rose text-[10px] font-bold uppercase tracking-widest">{error}</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-hairline rounded">
        <FaClock className="text-muted mx-auto mb-4" size={24} />
        <p className="text-muted text-[10px] font-bold uppercase tracking-widest">No activity found in ledger</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx, idx) => (
        <motion.a
          key={tx.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          href={stellar.getExplorerLink(tx.hash, 'tx')}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-4 bg-canvas border border-hairline hover:border-primary/40 rounded transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
              isSelf(tx) ? 'bg-primary/10 group-hover:bg-primary/20' :
              isOutgoing(tx) ? 'bg-accent-rose/10 group-hover:bg-accent-rose/20' : 
              'bg-accent-emerald/10 group-hover:bg-accent-emerald/20'
            }`}>
              {isSelf(tx) ? (
                <FaArrowDown className="text-primary rotate-45" size={12} />
              ) : isOutgoing(tx) ? (
                <FaArrowUp className="text-accent-rose" size={12} />
              ) : (
                <FaArrowDown className="text-accent-emerald" size={12} />
              )}
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-xs tracking-tight italic ${
                  isSelf(tx) ? 'text-primary' : isOutgoing(tx) ? 'text-on-dark' : 'text-accent-emerald'
                }`}>
                  {isSelf(tx) ? 'INTERNAL' : isOutgoing(tx) ? 'DEBIT' : 'CREDIT'}
                </span>
                <span className={`font-mono text-xs font-bold ${
                  isSelf(tx) ? 'text-primary' : isOutgoing(tx) ? 'text-on-dark' : 'text-accent-emerald'
                }`}>
                  {isSelf(tx) ? '' : isOutgoing(tx) ? '-' : '+'}{tx.amount} {tx.asset}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-muted-soft text-[9px] font-bold uppercase tracking-widest">
                  {formatDate(tx.createdAt)}
                </p>
                <div className="w-1 h-1 rounded-full bg-hairline"></div>
                <p className="text-muted-soft text-[9px] font-mono">
                  {isSelf(tx) ? 'Self-Transfer' : stellar.formatAddress(isOutgoing(tx) ? (tx.to || '') : (tx.from || ''), 6, 6)}
                </p>
              </div>
            </div>
          </div>
          
          <FaChevronRight className="text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" size={10} />
        </motion.a>
      ))}
    </div>
  );
}
