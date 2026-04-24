/**
 * FeeEstimator Component
 *
 * Shows current network fees and estimates transaction costs
 */

'use client';

import { useState, useEffect } from 'react';
import { stellar } from '@/lib/stellar-helper';
import { FaGasPump } from 'react-icons/fa';

export default function FeeEstimator() {
  const [currentFee, setCurrentFee] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFee = async () => {
      try {
        setLoading(true);
        const fee = await stellar.estimateFee();
        setCurrentFee(fee);
      } catch (error) {
        console.error('Error fetching fee:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFee();

    // Update fee every 30 seconds
    const interval = setInterval(fetchFee, 30000);
    return () => clearInterval(interval);
  }, []);

  const estimateTransactionCost = (operations: number) => {
    return (currentFee * operations) / 1000000; // Convert stroops to XLM
  };

  if (loading) {
    return (
      <div className="bg-[var(--surface-card)] border border-[var(--hairline)] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <FaGasPump className="text-[var(--primary)] text-xl" />
          <h3 className="text-[18px] font-semibold text-[var(--on-dark)]">Network Fees</h3>
        </div>
        <div className="flex items-center justify-center py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-4 border-solid border-[var(--primary)] border-r-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--hairline)] rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <FaGasPump className="text-[var(--primary)] text-xl" />
        <h3 className="text-[18px] font-semibold text-[var(--on-dark)]">Network Fees</h3>
      </div>

      <div className="space-y-4">
        <div className="bg-[var(--surface-soft)] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--muted)] text-xs mb-1">Current Base Fee</p>
              <p className="text-[var(--on-dark)] font-semibold">
                {currentFee} stroops
              </p>
            </div>
            <div className="text-right">
              <p className="text-[var(--muted)] text-xs mb-1">In XLM</p>
              <p className="text-[var(--primary)] font-semibold">
                {(currentFee / 1000000).toFixed(6)} XLM
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[var(--muted)] text-xs mb-2">Estimated Transaction Costs</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--body)]">1 operation</span>
              <span className="text-[var(--on-dark)] font-mono">
                {estimateTransactionCost(1).toFixed(6)} XLM
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--body)]">2 operations</span>
              <span className="text-[var(--on-dark)] font-mono">
                {estimateTransactionCost(2).toFixed(6)} XLM
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--body)]">3 operations</span>
              <span className="text-[var(--on-dark)] font-mono">
                {estimateTransactionCost(3).toFixed(6)} XLM
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 bg-[var(--surface-soft)] border border-[var(--hairline)] rounded-lg">
          <p className="text-[var(--muted)] text-xs">
            Fees are dynamic and adjust based on network congestion
          </p>
        </div>
      </div>
    </div>
  );
}