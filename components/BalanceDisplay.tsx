'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { stellar } from '@/lib/stellar-helper';
import { FaCoins, FaExternalLinkAlt, FaFaucet } from 'react-icons/fa';

interface BalanceDisplayProps {
  publicKey: string;
}

export default function BalanceDisplay({ publicKey }: BalanceDisplayProps) {
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await stellar.getBalance(publicKey);
        setBalance(result.xlm);
      } catch (err: any) {
        console.error('Error fetching balance:', err);
        setError(err.message || 'Unable to fetch balance');
      } finally {
        setLoading(false);
      }
    };

    if (publicKey) {
      fetchBalance();
    }
  }, [publicKey]);

  if (loading) {
    return (
      <div className="bg-surface-card border border-hairline rounded-lg p-10 animate-pulse">
        <div className="w-24 h-4 bg-hairline rounded mb-8" />
        <div className="w-48 h-12 bg-hairline rounded mb-4" />
        <div className="w-32 h-4 bg-hairline rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface-card border border-hairline rounded-lg p-10">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-rose mb-4">Balance Error</h3>
        <p className="text-on-dark text-sm font-medium">{error}</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-surface-card border border-hairline rounded-lg p-10 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <FaCoins size={80} />
      </div>
      
      <div className="relative z-10">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-8">Available Assets</h3>
        
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline gap-4">
            <span className="text-6xl md:text-7xl font-bold tracking-tighter text-primary italic">
              {parseFloat(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xl font-black text-on-dark italic tracking-tighter">XLM</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
             <div className="px-2 py-1 bg-surface-soft border border-hairline rounded text-[10px] font-bold text-muted uppercase tracking-widest">
               Native Asset
             </div>
             <div className="text-muted-soft text-sm font-medium">
               ≈ ${(parseFloat(balance) * 0.1).toLocaleString()} USD
             </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-hairline grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="https://stellarterm.com/testnet/xlm-native"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 bg-canvas border border-hairline rounded hover:border-primary transition-all group/link"
          >
            <div>
               <p className="text-[10px] font-bold uppercase tracking-widest text-on-dark">StellarTerm Faucet</p>
               <p className="text-muted-soft text-[10px] font-medium mt-1">Acquire Testnet XLM</p>
            </div>
            <FaFaucet className="text-muted group-hover/link:text-primary transition-colors" />
          </a>
          <a
            href="https://laboratory.stellar.org/#account-creator?network=test"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 bg-canvas border border-hairline rounded hover:border-primary transition-all group/link"
          >
            <div>
               <p className="text-[10px] font-bold uppercase tracking-widest text-on-dark">SDF Laboratory</p>
               <p className="text-muted-soft text-[10px] font-medium mt-1">Network Debugger</p>
            </div>
            <FaExternalLinkAlt className="text-muted group-hover/link:text-primary transition-colors" size={12} />
          </a>
        </div>
      </div>
    </motion.div>
  );
}