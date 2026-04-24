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
        const errorMessage = err.message || 'Unable to fetch balance';
        setError(errorMessage);
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
      <div className="bg-[var(--surface-card)] border border-[var(--hairline)] rounded-2xl p-8 fade-in">
        <div className="flex items-center gap-3 mb-4">
          <FaWallet className="text-[var(--primary)] text-2xl" />
          <h2 className="text-[24px] font-bold text-[var(--on-dark)]">Balance</h2>
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
          <FaWallet className="text-[var(--accent-rose)] text-2xl" />
          <h2 className="text-[24px] font-bold text-[var(--on-dark)]">Balance</h2>
        </div>
        <div className="bg-[var(--surface-soft)] border border-[var(--hairline)] rounded-lg p-4">
          <p className="text-[var(--accent-rose)] text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--hairline)] rounded-2xl p-8 fade-in">
      <div className="flex items-center gap-3 mb-4">
        <FaCoins className="text-[var(--primary)] text-2xl" />
        <h2 className="text-[24px] font-bold text-[var(--on-dark)]">Your Balance</h2>
      </div>

      <div className="bg-[var(--surface-soft)] rounded-xl p-6 border border-[var(--hairline)] pulse-glow">
        <div className="flex items-baseline gap-2">
          <span className="stat-display">
            {parseFloat(balance).toFixed(2)}
          </span>
          <span className="text-[18px] text-[var(--body)]">XLM</span>
        </div>
        <p className="text-[var(--muted)] text-sm mt-2">
          Stellar Lumens on Testnet
        </p>
        <div className="mt-3 pt-3 border-t border-[var(--hairline)]">
          <p className="text-[var(--muted)] text-xs">
            ≈ ${(parseFloat(balance) * 0.1).toFixed(2)} USD (estimated)
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <a
          href="https://stellarterm.com/testnet/xlm-native"
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 bg-[var(--surface-soft)] border border-[var(--hairline)] rounded-lg text-center hover:border-[var(--hairline-strong)] transition-colors"
        >
          <p className="text-[var(--accent-emerald)] text-sm font-medium">Get Testnet XLM</p>
          <p className="text-[var(--muted)] text-xs mt-1">StellarTerm Faucet</p>
        </a>
        <a
          href="https://laboratory.stellar.org/#account-creator?network=test"
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 bg-[var(--surface-soft)] border border-[var(--hairline)] rounded-lg text-center hover:border-[var(--hairline-strong)] transition-colors"
        >
          <p className="text-[var(--accent-blue)] text-sm font-medium">Account Creator</p>
          <p className="text-[var(--muted)] text-xs mt-1">Stellar Laboratory</p>
        </a>
      </div>

      <div className="mt-4 p-3 bg-[var(--surface-soft)] border border-[var(--hairline)] rounded-lg">
        <p className="text-[var(--body)] text-xs">
          Need more XLM? Use the faucets above to get free testnet XLM for development.
        </p>
      </div>
    </div>
  );
}