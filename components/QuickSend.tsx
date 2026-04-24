/**
 * QuickSend Component
 *
 * Quick payment buttons with preset amounts for fast transactions
 */

'use client';

import { useState } from 'react';
import { stellar } from '@/lib/stellar-helper';
import { FaBolt } from 'react-icons/fa';

interface QuickSendProps {
  publicKey: string;
  onSuccess?: () => void;
}

export default function QuickSend({ publicKey, onSuccess }: QuickSendProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const presetAmounts = [1, 5, 10, 50];

  const handleQuickSend = async (amount: number) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // For demo purposes, send to a testnet faucet address
      const testnetAddress = 'GB7TDSU7H27KZALPJHFLZVJ2R4YRT6K7QV6W6SO3HJZLDQD7BZQK7VQ';

      const result = await stellar.sendPayment({
        from: publicKey,
        to: testnetAddress,
        amount: amount.toString(),
        memo: 'Quick send payment',
      });

      if (result.success) {
        setSuccess(`Successfully sent ${amount} XLM!`);
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 2000);
      }
    } catch (err: any) {
      console.error('Quick send error:', err);
      setError('Failed to send payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--hairline)] rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <FaBolt className="text-[var(--primary)] text-xl" />
        <h3 className="text-[18px] font-semibold text-[var(--on-dark)]">Quick Send</h3>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-[var(--surface-soft)] border border-[var(--accent-rose)] rounded-lg">
          <p className="text-[var(--accent-rose)] text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-[var(--surface-soft)] border border-[var(--accent-emerald)] rounded-lg">
          <p className="text-[var(--accent-emerald)] text-sm">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {presetAmounts.map((amount) => (
          <button
            key={amount}
            onClick={() => handleQuickSend(amount)}
            disabled={loading}
            className="p-4 bg-[var(--surface-soft)] border border-[var(--hairline)] rounded-lg hover:border-[var(--primary)] hover:bg-[var(--surface-elevated)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-[24px] font-bold text-[var(--primary)]">{amount}</div>
            <div className="text-[var(--muted)] text-xs">XLM</div>
          </button>
        ))}
      </div>

      <p className="text-[var(--muted-soft)] text-xs mt-4">
        Sends to testnet faucet address for demo purposes
      </p>
    </div>
  );
}