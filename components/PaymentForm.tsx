'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { stellar } from '@/lib/stellar-helper';
import { FaPaperPlane, FaCheckCircle, FaExclamationTriangle, FaTerminal, FaChevronDown } from 'react-icons/fa';
import AddressBook from './AddressBook';
import MemoTemplates from './MemoTemplates';

interface PaymentFormProps {
  publicKey: string;
  onSuccess?: () => void;
  initialAddress?: string;
  initialMemo?: string;
}

export default function PaymentForm({ publicKey, onSuccess, initialAddress, initialMemo }: PaymentFormProps) {
  const [recipient, setRecipient] = useState(initialAddress || '');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState(initialMemo || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ recipient?: string; amount?: string }>({});
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [txHash, setTxHash] = useState('');
  const [showAddressBook, setShowAddressBook] = useState(false);
  const [showMemoTemplates, setShowMemoTemplates] = useState(false);
  const [recentAddresses, setRecentAddresses] = useState<any[]>([]);
  const [recentMemos, setRecentMemos] = useState<any[]>([]);
  const [availableBalance, setAvailableBalance] = useState<number>(0);

  useEffect(() => {
    if (initialAddress) setRecipient(initialAddress);
    if (initialMemo) setMemo(initialMemo);
  }, [initialAddress, initialMemo]);

  useEffect(() => {
    if (typeof window !== 'undefined' && publicKey) {
      const fetchBalance = async () => {
        try {
          const bal = await stellar.getBalance(publicKey);
          setAvailableBalance(parseFloat(bal.xlm));
        } catch (e) {
          console.error('Failed to fetch balance for validation:', e);
        }
      };
      fetchBalance();
      
      try {
        const savedAddresses = JSON.parse(localStorage.getItem('stellar_address_book') || '[]');
        const savedMemos = JSON.parse(localStorage.getItem('stellar_memo_templates') || '[]');
        setRecentAddresses(savedAddresses.slice(0, 3));
        setRecentMemos(savedMemos.slice(0, 3));
      } catch (e) {
        console.error('Failed to load recent items:', e);
      }
    }
  }, [publicKey]);

  const validateForm = (): boolean => {
    const newErrors: { recipient?: string; amount?: string } = {};

    if (!recipient.trim()) {
      newErrors.recipient = 'Recipient address is required';
    } else if (recipient.length !== 56 || !recipient.startsWith('G')) {
      newErrors.recipient = 'Invalid Stellar address structure';
    }

    if (!amount.trim()) {
      newErrors.amount = 'Asset amount is required';
    } else {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        newErrors.amount = 'Positive value required';
      } else if (numAmount > availableBalance) {
        newErrors.amount = `Insufficient funds (Available: ${availableBalance.toFixed(2)} XLM)`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

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
          message: `Operation verified. Ledger updated.`,
        });

        setRecipient('');
        setAmount('');
        setMemo('');
        setErrors({});

        if (onSuccess) {
          setTimeout(onSuccess, 3000);
        }
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setAlert({
        type: 'error',
        message: error.message || 'Transmission failed. Verify network status.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-card border border-hairline rounded-lg p-10 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
      
      <div className="flex items-center gap-3 mb-10">
        <FaTerminal className="text-primary" size={14} />
        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-dark">
          Transaction Execution Unit
        </h2>
      </div>

      <AnimatePresence mode="wait">
        {alert && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`mb-8 p-6 border rounded overflow-hidden ${
              alert.type === 'success'
                ? 'bg-accent-emerald/5 border-accent-emerald/20'
                : 'bg-accent-rose/5 border-accent-rose/20'
            }`}
          >
            <div className="flex items-start gap-4">
               {alert.type === 'success' ? (
                 <FaCheckCircle className="text-accent-emerald mt-1 flex-shrink-0" />
               ) : (
                 <FaExclamationTriangle className="text-accent-rose mt-1 flex-shrink-0" />
               )}
               <div>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${
                    alert.type === 'success' ? 'text-accent-emerald' : 'text-accent-rose'
                  }`}>
                    {alert.type === 'success' ? 'Protocol Success' : 'Protocol Error'}
                  </p>
                  <p className="text-on-dark text-sm mt-1 font-medium leading-relaxed">{alert.message}</p>
                  {txHash && (
                    <a
                      href={stellar.getExplorerLink(txHash, 'tx')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-4 text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
                    >
                      View Receipt →
                    </a>
                  )}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="group">
          <div className="flex items-center justify-between mb-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted group-focus-within:text-primary transition-colors">
              Destination Identity
            </label>
            <button
              type="button"
              onClick={() => setShowAddressBook(!showAddressBook)}
              className="text-primary hover:text-primary-active text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"
            >
              Directory <FaChevronDown size={8} className={`transition-transform ${showAddressBook ? 'rotate-180' : ''}`} />
            </button>
          </div>
          <div className="relative">
             <input
               type="text"
               placeholder="G..."
               value={recipient}
               onChange={(e) => setRecipient(e.target.value)}
               className={`w-full bg-canvas border ${
                 errors.recipient ? 'border-accent-rose' : 'border-hairline group-focus-within:border-primary'
               } rounded p-4 text-on-dark font-mono text-sm placeholder:text-muted-soft focus:outline-none transition-all`}
             />
          </div>
          
          {/* Quick Select Bubbles for Address */}
          <div className="flex flex-wrap gap-2 mt-3">
            {recentAddresses.map((addr) => (
              <button
                key={addr.id}
                type="button"
                onClick={() => setRecipient(addr.address)}
                className="px-3 py-1.5 bg-surface-soft border border-hairline rounded-full text-[10px] font-bold text-body hover:border-primary hover:text-primary transition-all flex items-center gap-2"
              >
                <div className="w-1 h-1 rounded-full bg-primary" />
                {addr.name}
              </button>
            ))}
          </div>

          {errors.recipient && (
            <p className="text-accent-rose text-[10px] font-bold uppercase tracking-widest mt-2">{errors.recipient}</p>
          )}
        </div>

        <AnimatePresence>
          {showAddressBook && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
               <AddressBook onSelectAddress={(address) => { setRecipient(address); setShowAddressBook(false); }} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="group">
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-3 group-focus-within:text-primary transition-colors">
              Asset Quantity (XLM)
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full bg-canvas border ${
                  errors.amount ? 'border-accent-rose' : 'border-hairline group-focus-within:border-primary'
                } rounded p-4 text-on-dark font-mono text-base placeholder:text-muted-soft focus:outline-none transition-all`}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                 <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Native</span>
              </div>
            </div>
            {errors.amount && (
              <p className="text-accent-rose text-[10px] font-bold uppercase tracking-widest mt-2">{errors.amount}</p>
            )}
          </div>

          <div className="group">
            <div className="flex items-center justify-between mb-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted group-focus-within:text-primary transition-colors">
                Transmission Memo
              </label>
              <button
                type="button"
                onClick={() => setShowMemoTemplates(!showMemoTemplates)}
                className="text-primary hover:text-primary-active text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"
              >
                Log Entry <FaChevronDown size={8} className={`transition-transform ${showMemoTemplates ? 'rotate-180' : ''}`} />
              </button>
            </div>
            <input
              type="text"
              placeholder="System reference"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              maxLength={28}
              className="w-full bg-canvas border border-hairline group-focus-within:border-primary rounded p-4 text-on-dark font-mono text-sm placeholder:text-muted-soft focus:outline-none transition-all"
            />
            
            <div className="flex flex-wrap gap-2 mt-3">
              {recentMemos.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setMemo(t.memo)}
                  className="px-3 py-1.5 bg-surface-soft border border-hairline rounded-full text-[10px] font-bold text-body hover:border-primary hover:text-primary transition-all flex items-center gap-2"
                >
                  <FaTerminal size={8} className="text-primary" />
                  {t.name}
                </button>
              ))}
            </div>

            <div className="flex justify-end mt-2">
               <span className="text-[9px] font-bold text-muted uppercase tracking-widest">{memo.length}/28 BYTE</span>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showMemoTemplates && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
               <MemoTemplates onSelectMemo={(m) => { setMemo(m); setShowMemoTemplates(false); }} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-8 border-t border-hairline">
          <button
            type="submit"
            disabled={loading || !recipient || !amount}
            className="w-full bg-primary text-on-primary font-bold py-5 rounded flex items-center justify-center gap-4 hover:bg-primary-active transition-all disabled:opacity-30 disabled:grayscale group"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-on-primary border-r-transparent" />
            ) : (
              <>
                <span className="uppercase tracking-[0.2em] text-xs">Execute Transmission</span>
                <FaPaperPlane className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </>
            )}
          </button>
          <div className="mt-6 flex items-center justify-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-accent-rose animate-pulse" />
             <p className="text-muted-soft text-[9px] font-bold uppercase tracking-widest leading-relaxed">
               Irreversible Operation. Verify parameters.
             </p>
          </div>
        </div>
      </form>
    </motion.div>
  );
}