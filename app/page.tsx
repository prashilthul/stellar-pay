'use client';

import { useState } from 'react';
import WalletConnection from '@/components/WalletConnection';
import BalanceDisplay from '@/components/BalanceDisplay';
import PaymentForm from '@/components/PaymentForm';

export default function Home() {
  const [publicKey, setPublicKey] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = (key: string) => {
    setPublicKey(key);
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    setPublicKey('');
    setIsConnected(false);
  };

  const handlePaymentSuccess = () => {
    // Refresh balance after successful payment
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Stellar Payment App
          </h1>
          <p className="text-xl text-slate-400">
            Send XLM payments on the Stellar Testnet
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-blue-300 text-sm">Testnet Network</span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <WalletConnection
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />

          {isConnected && (
            <>
              <BalanceDisplay publicKey={publicKey} />
              <PaymentForm
                publicKey={publicKey}
                onSuccess={handlePaymentSuccess}
              />
            </>
          )}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-block p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-2">
              Stellar White Belt Challenge
            </h3>
            <p className="text-slate-400 text-sm">
              A simple payment dApp demonstrating wallet connection, balance display, and XLM transactions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}