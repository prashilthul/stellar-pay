'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { stellar } from '@/lib/stellar-helper';
import { FaWallet, FaCopy, FaCheck, FaExclamationTriangle, FaDownload } from 'react-icons/fa';
import { MdLogout } from 'react-icons/md';

interface WalletConnectionProps {
  onConnect: (publicKey: string) => void;
  onDisconnect: () => void;
}

export default function WalletConnection({ onConnect, onDisconnect }: WalletConnectionProps) {
  const [publicKey, setPublicKey] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isFreighterInstalled, setIsFreighterInstalled] = useState(false);

  useEffect(() => {
    const checkWallet = async (retries = 5) => {
      for (let i = 0; i < retries; i++) {
        const installed = await stellar.isFreighterInstalled();
        if (installed) {
          setIsFreighterInstalled(true);
          return;
        }
        await new Promise(r => setTimeout(r, 500));
      }
      setIsFreighterInstalled(false);
    };
    checkWallet();
  }, []);

  const handleConnect = async () => {
    setError(null);
    try {
      setLoading(true);
      const key = await stellar.connectWallet();
      setPublicKey(key);
      setIsConnected(true);
      onConnect(key);
    } catch (error: any) {
      console.error('Connection error:', error);
      setError(error.message || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    stellar.disconnect();
    setPublicKey('');
    setIsConnected(false);
    onDisconnect();
  };

  const handleCopyAddress = async () => {
    await navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {!isConnected ? (
          <motion.div 
            key="disconnected"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="bg-surface-card border border-hairline rounded-lg p-10 shadow-2xl relative overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 rounded-full" />
            
            <h2 className="text-3xl font-bold text-on-dark mb-4 tracking-tighter italic uppercase">
              Identity <span className="text-primary">Verification</span>
            </h2>
            <p className="text-muted text-sm mb-8 leading-relaxed">
              Connect your Stellar wallet to authorize this session and access the ledger.
            </p>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-accent-rose/10 border border-accent-rose/30 rounded flex items-start gap-3"
              >
                <FaExclamationTriangle className="text-accent-rose mt-1 flex-shrink-0" />
                <p className="text-accent-rose text-xs font-bold uppercase tracking-wide leading-tight">
                  {error}
                </p>
              </motion.div>
            )}

            {!isFreighterInstalled ? (
              <a
                href="https://www.freighter.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-primary text-on-primary font-bold py-4 rounded flex items-center justify-center gap-3 hover:bg-primary-active transition-all group"
              >
                <FaDownload className="group-hover:translate-y-1 transition-transform" />
                <span className="uppercase tracking-widest text-xs">Install Freighter</span>
              </a>
            ) : (
              <button
                onClick={handleConnect}
                disabled={loading}
                className="w-full bg-primary text-on-primary font-bold py-4 rounded flex items-center justify-center gap-3 hover:bg-primary-active transition-all disabled:opacity-50 group"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-on-primary border-r-transparent" />
                ) : (
                  <>
                    <FaWallet className="group-hover:rotate-12 transition-transform" />
                    <span className="uppercase tracking-widest text-xs">Initialize Connection</span>
                  </>
                )}
              </button>
            )}

            <div className="mt-8 pt-8 border-t border-hairline">
              <p className="text-muted-soft text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-center">Compatible Protocols</p>
              <div className="flex justify-center gap-6 grayscale opacity-50">
                 <span className="text-[10px] font-black tracking-tighter italic">FREIGHTER</span>
                 <span className="text-[10px] font-black tracking-tighter italic">SOROBAN</span>
                 <span className="text-[10px] font-black tracking-tighter italic">HORIZON</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="connected"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="bg-surface-card border border-hairline rounded-lg p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-accent-emerald rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent-emerald">Secure Link Active</span>
              </div>
              <button
                onClick={handleDisconnect}
                className="text-muted-soft hover:text-accent-rose text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors"
              >
                <MdLogout size={14} /> Terminate
              </button>
            </div>

            <div className="bg-canvas rounded border border-hairline p-6 group">
              <p className="text-muted-soft text-[9px] font-bold uppercase tracking-[0.2em] mb-3">Signer Key</p>
              <div className="flex items-center justify-between gap-4">
                <p className="text-primary font-mono text-xs break-all leading-relaxed tracking-tight group-hover:text-primary-active transition-colors">
                  {publicKey}
                </p>
                <button
                  onClick={handleCopyAddress}
                  className="p-2 hover:bg-surface-soft rounded transition-all text-muted hover:text-primary"
                  title="Copy Key"
                >
                  {copied ? <FaCheck className="text-accent-emerald" /> : <FaCopy />}
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <a
                href={stellar.getExplorerLink(publicKey, 'account')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-active text-[10px] font-bold uppercase tracking-widest underline underline-offset-4"
              >
                View Ledger Identity →
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}