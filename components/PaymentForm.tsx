/**
 * PaymentForm Component
 *
 * Allows users to send XLM payments
 */

'use client';

import { useState } from 'react';
import { stellar } from '@/lib/stellar-helper';
import { FaPaperPlane, FaCheckCircle } from 'react-icons/fa';

interface PaymentFormProps {
  publicKey: string;
  onSuccess?: () => void;
}

export default function PaymentForm({ publicKey, onSuccess }: PaymentFormProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ recipient?: string; amount?: string }>({});
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [txHash, setTxHash] = useState('');

  const validateForm = (): boolean => {
    const newErrors: { recipient?: string; amount?: string } = {};

    if (!recipient.trim()) {
      newErrors.recipient = 'Recipient address is required';
    } else if (recipient.length !== 56 || !recipient.startsWith('G')) {
      newErrors.recipient = 'Invalid Stellar address (must start with G and be 56 characters)';
    } else if (!/^[G][A-Z0-9]{55}$/.test(recipient)) {
      newErrors.recipient = 'Invalid Stellar address format';
    }

    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        newErrors.amount = 'Amount must be a positive number';
      } else if (numAmount < 0.0000001) {
        newErrors.amount = 'Amount is too small (minimum: 0.0000001 XLM)';
      } else if (numAmount > 1000000) {
        newErrors.amount = 'Amount is too large (maximum: 1,000,000 XLM)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setAlert(null);
      setTxHash('');

      const result = await stellar.sendPayment({
        from: publicKey,
        to: recipient,
        amount: amount,
        memo: memo || undefined,
      });

      if (result.success) {
        setTxHash(result.hash);
        setAlert({
          type: 'success',
          message: `Payment sent successfully! 🎉`,
        });

        setRecipient('');
        setAmount('');
        setMemo('');
        setErrors({});

        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      let errorMessage = 'Failed to send payment. ';

      if (error.message.includes('insufficient')) {
        errorMessage += 'Insufficient balance. Please fund your wallet with testnet XLM.';
      } else if (error.message.includes('destination')) {
        errorMessage += 'Invalid destination account. Please check the recipient address.';
      } else if (error.message.includes('network')) {
        errorMessage += 'Network error. Please check your connection and try again.';
      } else {
        errorMessage += error.message || 'Please try again.';
      }

      setAlert({
        type: 'error',
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <FaPaperPlane className="text-blue-400" />
        Send Payment
      </h2>

      {alert && (
        <div className={`mb-4 p-4 rounded-lg border ${
          alert.type === 'success'
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-red-500/10 border-red-500/30'
        }`}>
          <p className={alert.type === 'success' ? 'text-green-400' : 'text-red-400'}>
            {alert.message}
          </p>
        </div>
      )}

      {txHash && (
        <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <FaCheckCircle className="text-green-400 text-xl flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className="text-green-400 font-semibold mb-2">Transaction Confirmed!</p>
              <p className="text-white/70 text-sm mb-2">Transaction Hash:</p>
              <p className="text-white/90 text-xs font-mono break-all mb-3">{txHash}</p>
              <a
                href={stellar.getExplorerLink(txHash, 'tx')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm underline"
              >
                View on Stellar Expert →
              </a>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className={`w-full bg-white/5 border ${
              errors.recipient ? 'border-red-500' : 'border-slate-600'
            } rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.recipient && (
            <p className="text-red-400 text-xs mt-1">{errors.recipient}</p>
          )}
        </div>

        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">
            Amount (XLM)
          </label>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`w-full bg-white/5 border ${
              errors.amount ? 'border-red-500' : 'border-slate-600'
            } rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.amount && (
            <p className="text-red-400 text-xs mt-1">{errors.amount}</p>
          )}
        </div>

        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">
            Memo (Optional)
          </label>
          <input
            type="text"
            placeholder="Payment for..."
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full bg-white/5 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-4 border-solid border-white border-r-transparent"></div>
                Sending...
              </>
            ) : (
              <>
                <FaPaperPlane />
                Send Payment
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-blue-200/90 text-xs">
          ⚠️ <strong>Double-check</strong> the recipient address before sending. Transactions on the blockchain are irreversible!
        </p>
      </div>
    </div>
  );
}