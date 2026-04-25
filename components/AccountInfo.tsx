'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { stellar } from '@/lib/stellar-helper';
import { FaShieldAlt, FaTerminal } from 'react-icons/fa';

interface AccountInfoProps {
  publicKey: string;
}

interface AccountData {
  id: string;
  sequence: string;
  signers: any[];
  thresholds: any;
}

export default function AccountInfo({ publicKey }: AccountInfoProps) {
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchAccountInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        const info = await stellar.getAccountInfo(publicKey);
        setAccountData(info);
      } catch (err: any) {
        console.error('Error fetching account info:', err);
        setError('Failed to fetch account information');
      } finally {
        setLoading(false);
      }
    };

    if (publicKey) {
      fetchAccountInfo();
    }
  }, [publicKey]);

  if (loading) {
    return (
      <div className="bg-surface-card border border-hairline rounded-lg p-8 animate-pulse">
        <div className="w-1/2 h-3 bg-hairline rounded mb-6" />
        <div className="w-full h-8 bg-hairline rounded" />
      </div>
    );
  }

  if (error || !accountData) {
    return null;
  }

  return (
    <div className="bg-surface-card border border-hairline rounded-lg p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <FaTerminal className="text-muted" size={10} />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Node Identity</h3>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-primary hover:text-primary-active text-[10px] font-bold uppercase tracking-widest"
        >
          {showDetails ? '[ Hide Specs ]' : '[ View Specs ]'}
        </button>
      </div>

      <div className="space-y-6 flex-1">
        <div className="group">
          <p className="text-muted-soft text-[9px] font-bold uppercase tracking-[0.2em] mb-2 group-hover:text-muted transition-colors">Signer Key</p>
          <div className="bg-canvas border border-hairline rounded p-4 group-hover:border-hairline-strong transition-colors">
             <p className="text-on-dark font-mono text-[11px] break-all leading-relaxed">
               {accountData.id}
             </p>
          </div>
        </div>

        <AnimatePresence>
          {showDetails && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden space-y-6"
            >
              <div className="pt-4 border-t border-hairline">
                <p className="text-muted-soft text-[9px] font-bold uppercase tracking-[0.2em] mb-3">Sequence Vector</p>
                <p className="text-primary font-mono text-xs">{accountData.sequence}</p>
              </div>

              <div className="pt-4 border-t border-hairline">
                <div className="flex items-center gap-2 mb-3">
                  <FaShieldAlt className="text-muted" size={10} />
                  <p className="text-muted-soft text-[9px] font-bold uppercase tracking-[0.2em]">Security Thresholds</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { l: 'LOW', v: accountData.thresholds.low_threshold },
                    { l: 'MED', v: accountData.thresholds.med_threshold },
                    { l: 'HIGH', v: accountData.thresholds.high_threshold }
                  ].map((t) => (
                    <div key={t.l} className="bg-canvas border border-hairline p-2 text-center rounded">
                      <p className="text-[9px] text-muted-soft font-bold mb-1">{t.l}</p>
                      <p className="text-xs font-mono text-on-dark">{t.v}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-hairline">
                <p className="text-muted-soft text-[9px] font-bold uppercase tracking-[0.2em] mb-3">Authorized Signers</p>
                <div className="space-y-2">
                  {accountData.signers.map((signer: any, index: number) => (
                    <div key={index} className="bg-canvas border border-hairline rounded p-2 flex justify-between items-center">
                      <p className="text-muted-soft text-[9px] font-mono truncate mr-4">
                        {signer.key}
                      </p>
                      <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">W:{signer.weight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {!showDetails && (
        <div className="mt-8 pt-8 border-t border-hairline flex items-center gap-6">
           <div className="flex flex-col">
              <span className="text-muted-soft text-[8px] font-bold uppercase tracking-widest">Signers</span>
              <span className="text-on-dark text-xs font-bold font-mono">{accountData.signers.length}</span>
           </div>
           <div className="flex flex-col">
              <span className="text-muted-soft text-[8px] font-bold uppercase tracking-widest">Master Weight</span>
              <span className="text-accent-emerald text-xs font-bold font-mono">{accountData.signers[0]?.weight || 1}</span>
           </div>
        </div>
      )}
    </div>
  );
}