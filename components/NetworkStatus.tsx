'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaServer } from 'react-icons/fa';
import * as StellarSdk from '@stellar/stellar-sdk';

interface NetworkStatus {
  status: 'connected' | 'disconnected' | 'error';
  latestLedger: number;
  fee: number;
  latency: number;
}

export default function NetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    status: 'disconnected',
    latestLedger: 0,
    fee: 0,
    latency: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkNetworkStatus = async () => {
      try {
        const startTime = Date.now();
        const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
        
        const ledger = await server.ledgers().order('desc').limit(1).call();
        const latestLedger = ledger.records[0]?.sequence || 0;
        const fee = await server.fetchBaseFee();
        const latency = Date.now() - startTime;

        setNetworkStatus({
          status: 'connected',
          latestLedger,
          fee,
          latency,
        });
      } catch (error) {
        console.error('Network status check failed:', error);
        setNetworkStatus(prev => ({ ...prev, status: 'error' }));
      } finally {
        setLoading(false);
      }
    };

    checkNetworkStatus();
    const interval = setInterval(checkNetworkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && networkStatus.latestLedger === 0) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <div className="w-1.5 h-1.5 rounded-full bg-muted" />
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted">Synchronizing...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${
              networkStatus.status === 'connected' ? 'bg-accent-emerald shadow-[0_0_8px_rgba(0,255,102,0.5)]' : 'bg-accent-rose'
            }`} />
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-on-dark">
              {networkStatus.status === 'connected' ? 'SDF_TESTNET_ACTIVE' : 'NETWORK_OFFLINE'}
            </span>
         </div>
         <span className="text-[9px] font-mono text-muted">{networkStatus.latency}ms</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-canvas/50 border border-hairline p-2 rounded">
          <p className="text-[7px] font-bold text-muted-soft uppercase mb-1">Last Ledger</p>
          <p className="text-[10px] font-mono text-on-dark tabular-nums">{networkStatus.latestLedger}</p>
        </div>
        <div className="bg-canvas/50 border border-hairline p-2 rounded">
          <p className="text-[7px] font-bold text-muted-soft uppercase mb-1">Base Fee</p>
          <p className="text-[10px] font-mono text-on-dark tabular-nums">{networkStatus.fee} STRP</p>
        </div>
      </div>
    </div>
  );
}