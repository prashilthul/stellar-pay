/**
 * NetworkStatus Component
 *
 * Displays current Stellar network status and connection information
 */

'use client';

import { useState, useEffect } from 'react';
import { FaServer, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
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
        setLoading(true);
        const startTime = Date.now();

        const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

        // Get latest ledger
        const ledger = await server.ledgers().order('desc').limit(1).call();
        const latestLedger = ledger.records[0]?.sequence || 0;

        // Get current fee
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
        setNetworkStatus(prev => ({
          ...prev,
          status: 'error',
        }));
      } finally {
        setLoading(false);
      }
    };

    checkNetworkStatus();

    // Check network status every 30 seconds
    const interval = setInterval(checkNetworkStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (networkStatus.status) {
      case 'connected':
        return 'text-green-400';
      case 'disconnected':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const getStatusIcon = () => {
    switch (networkStatus.status) {
      case 'connected':
        return <FaCheckCircle className="text-green-400" />;
      case 'disconnected':
        return <FaExclamationTriangle className="text-yellow-400" />;
      case 'error':
        return <FaExclamationTriangle className="text-red-400" />;
      default:
        return <FaServer className="text-slate-400" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-[var(--surface-card)] border border-[var(--hairline)] rounded-2xl p-6 fade-in">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-4 border-solid border-[var(--primary)] border-r-transparent"></div>
          <span className="text-[var(--muted)]">Checking network status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--hairline)] rounded-2xl p-6 fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FaServer className="text-[var(--primary)] text-xl" />
          <h3 className="text-[18px] font-semibold text-[var(--on-dark)]">Network Status</h3>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {networkStatus.status.charAt(0).toUpperCase() + networkStatus.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[var(--surface-soft)] rounded-lg p-3">
          <p className="text-[var(--muted)] text-xs mb-1">Latest Ledger</p>
          <p className="text-[var(--on-dark)] font-semibold">
            {networkStatus.latestLedger.toLocaleString()}
          </p>
        </div>

        <div className="bg-[var(--surface-soft)] rounded-lg p-3">
          <p className="text-[var(--muted)] text-xs mb-1">Base Fee</p>
          <p className="text-[var(--on-dark)] font-semibold">
            {networkStatus.fee} stroops
          </p>
        </div>

        <div className="bg-[var(--surface-soft)] rounded-lg p-3">
          <p className="text-[var(--muted)] text-xs mb-1">Latency</p>
          <p className="text-[var(--on-dark)] font-semibold">
            {networkStatus.latency}ms
          </p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-[var(--surface-soft)] border border-[var(--hairline)] rounded-lg">
        <p className="text-[var(--body)] text-xs">
          Stellar Testnet - For development purposes only. Transactions have no real value.
        </p>
      </div>
    </div>
  );
}