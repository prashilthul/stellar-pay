/**
 * PaymentForm Component
 *
 * Allows users to send XLM payments
 */

'use client';

import { useState } from 'react';
import { stellar } from '@/lib/stellar-helper';
import { FaPaperPlane, FaCheckCircle } from 'react-icons/fa';
import AddressBook from './AddressBook';
import MemoTemplates from './MemoTemplates';

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
  const [showAddressBook, setShowAddressBook] = useState(false);
  const [showMemoTemplates, setShowMemoTemplates] = useState(false);

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

      // Show confirmation dialog for large amounts
      const numAmount = parseFloat(amount);
      if (numAmount > 100) {
        const confirmed = window.confirm(
          `You are about to send ${numAmount} XLM. This is a large amount. Are you sure you want to proceed?`
        );
        if (!confirmed) {
          setLoading(false);
          return;
        }
      }

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
      } else if (error.message.includes('Transaction failed')) {
        errorMessage += error.message;
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
    <div className="bg-[var(--surface-card)] border border-[var(--hairline)] rounded-2xl p-8 fade-in">
      <h2 className="text-[32px] font-bold text-[var(--on-dark)] mb-6 flex items-center gap-2">
        <FaPaperPlane className="text-[var(--primary)]" />
        Send Payment
      </h2>

      {alert && (
        <div className={`mb-4 p-4 rounded-lg border fade-in ${
          alert.type === 'success'
            ? 'bg-[var(--surface-soft)] border-[var(--accent-emerald)]'
            : 'bg-[var(--surface-soft)] border-[var(--accent-rose)]'
        }`}>
          <p className={alert.type === 'success' ? 'text-[var(--accent-emerald)]' : 'text-[var(--accent-rose)]'}>
            {alert.message}
          </p>
        </div>
      )}

      {txHash && (
        <div className="mb-4 p-4 bg-[var(--surface-soft)] border border-[var(--accent-emerald)] rounded-lg fade-in">
          <div className="flex items-start gap-3">
            <FaCheckCircle className="text-[var(--accent-emerald)] text-xl flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className="text-[var(--accent-emerald)] font-semibold mb-2">Transaction Confirmed!</p>
              <p className="text-[var(--muted)] text-sm mb-2">Transaction Hash:</p>
              <p className="text-[var(--body)] text-xs font-mono break-all mb-3">{txHash}</p>
              <a
                href={stellar.getExplorerLink(txHash, 'tx')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--primary)] hover:text-[var(--primary-active)] text-sm underline"
              >
                View on Stellar Expert →
              </a>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-[var(--body)] text-sm font-medium">
              Recipient Address
            </label>
            <button
              type="button"
              onClick={() => setShowAddressBook(!showAddressBook)}
              className="text-[var(--primary)] hover:text-[var(--primary-active)] text-sm"
            >
              {showAddressBook ? 'Hide Address Book' : 'Address Book'}
            </button>
          </div>
          <input
            type="text"
            placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className={`w-full bg-[var(--surface-card)] border ${
              errors.recipient ? 'border-[var(--accent-rose)]' : 'border-[var(--hairline)]'
            } rounded-lg px-4 py-3 text-[var(--on-dark)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all`}
          />
          {errors.recipient && (
            <p className="text-[var(--accent-rose)] text-xs mt-1 fade-in">{errors.recipient}</p>
          )}
          {recipient && !errors.recipient && (
            <p className="text-[var(--accent-emerald)] text-xs mt-1 fade-in">
              Valid Stellar address
            </p>
          )}
        </div>

        {showAddressBook && (
          <AddressBook onSelectAddress={(address) => setRecipient(address)} />
        )}

        <div>
          <label className="block text-[var(--body)] text-sm font-medium mb-2">
            Amount (XLM)
          </label>
          <div className="relative">
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full bg-[var(--surface-card)] border ${
                errors.amount ? 'border-[var(--accent-rose)]' : 'border-[var(--hairline)]'
              } rounded-lg px-4 py-3 text-[var(--on-dark)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all`}
            />
            {amount && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="text-[var(--muted)] text-sm">XLM</span>
              </div>
            )}
          </div>
          {errors.amount && (
            <p className="text-[var(--accent-rose)] text-xs mt-1 fade-in">{errors.amount}</p>
          )}
          {amount && !errors.amount && (
            <>
              <p className="text-[var(--muted)] text-xs mt-1 fade-in">
                ≈ ${(parseFloat(amount) * 0.1).toFixed(2)} USD (estimated)
              </p>
              <p className="text-[var(--accent-emerald)] text-xs mt-1 fade-in">
                ✓ Valid amount
              </p>
            </>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-[var(--body)] text-sm font-medium">
              Memo (Optional)
            </label>
            <button
              type="button"
              onClick={() => setShowMemoTemplates(!showMemoTemplates)}
              className="text-[var(--primary)] hover:text-[var(--primary-active)] text-sm"
            >
              {showMemoTemplates ? 'Hide Templates' : 'Memo Templates'}
            </button>
          </div>
          <input
            type="text"
            placeholder="Payment for..."
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            maxLength={28}
            className="w-full bg-[var(--surface-card)] border border-[var(--hairline)] rounded-lg px-4 py-3 text-[var(--on-dark)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
          />
          <p className="text-[var(--muted-soft)] text-xs mt-1">
            {memo.length}/28 characters
          </p>
        </div>

        {showMemoTemplates && (
          <MemoTemplates onSelectMemo={(selectedMemo) => setMemo(selectedMemo)} />
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || !recipient || !amount}
            className="w-full btn-primary py-4 px-6 flex items-center justify-center gap-3 btn-hover"
          >
            {loading ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-4 border-solid border-[var(--on-primary)] border-r-transparent"></div>
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

      <div className="mt-4 p-3 bg-[var(--surface-soft)] border border-[var(--hairline)] rounded-lg">
        <p className="text-[var(--body)] text-xs">
          Double-check the recipient address before sending. Transactions on the blockchain are irreversible!
        </p>
      </div>

      <div className="mt-3 p-3 bg-[var(--surface-soft)] border border-[var(--hairline)] rounded-lg">
        <p className="text-[var(--body)] text-xs">
          Tip: You can add a memo to help the recipient identify your payment.
        </p>
      </div>
    </div>
  );
}