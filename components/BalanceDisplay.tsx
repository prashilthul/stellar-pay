/**
 * BalanceDisplay Component
 *
 * Displays the connected wallet's XLM balance
 */

'use client';

import { useState, useEffect } from 'react';
import { stellar } from '@/lib/stellar-helper';
import { FaWallet, FaCoins } from 'react-icons/fa';

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
        setError('Failed to fetch balance');
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
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <FaWallet className="text-blue-400 text-2xl" />
          <h2 className="text-xl font-bold text-white">Balance</h2>
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
          <FaWallet className="text-red-400 text-2xl" />
          <h2 className="text-xl font-bold text-white">Balance</h2>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <FaCoins className="text-yellow-400 text-2xl" />
        <h2 className="text-xl font-bold text-white">Your Balance</h2>
      </div>

      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-white">
            {parseFloat(balance).toFixed(2)}
          </span>
          <span className="text-xl text-slate-300">XLM</span>
        </div>
        <p className="text-slate-400 text-sm mt-2">
          Stellar Lumens on Testnet
        </p>
      </div>

      <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <p className="text-yellow-200/90 text-xs">
          💡 <strong>Need more XLM?</strong> Visit the Stellar Testnet Faucet to get free testnet XLM for development.
        </p>
      </div>
    </div>
  );
}