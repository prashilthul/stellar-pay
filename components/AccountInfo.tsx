/**
 * AccountInfo Component
 *
 * Displays detailed account information including signers and thresholds
 */

'use client';

import { useState, useEffect } from 'react';
import { stellar } from '@/lib/stellar-helper';
import { FaUser, FaKey, FaShieldAlt, FaInfoCircle } from 'react-icons/fa';

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
      <div className="bg-[var(--surface-card)] border border-[var(--hairline)] rounded-2xl p-6 fade-in">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-4 border-solid border-[var(--primary)] border-r-transparent"></div>
          <span className="text-[var(--muted)]">Loading account information...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[var(--surface-card)] border border-[var(--hairline)] rounded-2xl p-6 fade-in">
        <div className="bg-[var(--surface-soft)] border border-[var(--hairline)] rounded-lg p-4">
          <p className="text-[var(--accent-rose)] text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!accountData) {
    return null;
  }

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--hairline)] rounded-2xl p-6 fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FaInfoCircle className="text-[var(--primary)] text-xl" />
          <h3 className="text-[18px] font-semibold text-[var(--on-dark)]">Account Information</h3>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-[var(--primary)] hover:text-[var(--primary-active)] text-sm underline"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      <div className="space-y-3">
        <div className="bg-[var(--surface-soft)] rounded-lg p-3">
          <p className="text-[var(--muted)] text-xs mb-1">Account ID</p>
          <p className="text-[var(--on-dark)] font-mono text-sm break-all">
            {accountData.id}
          </p>
        </div>

        <div className="bg-[var(--surface-soft)] rounded-lg p-3">
          <p className="text-[var(--muted)] text-xs mb-1">Sequence Number</p>
          <p className="text-[var(--on-dark)] font-mono">
            {accountData.sequence}
          </p>
        </div>

        {showDetails && (
          <>
            <div className="bg-[var(--surface-soft)] rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <FaKey className="text-[var(--primary)]" />
                <p className="text-[var(--muted)] text-xs">Signers ({accountData.signers.length})</p>
              </div>
              <div className="space-y-2">
                {accountData.signers.map((signer: any, index: number) => (
                  <div key={index} className="bg-[var(--surface-elevated)] rounded p-2">
                    <p className="text-[var(--on-dark)] text-xs font-mono break-all">
                      {signer.key}
                    </p>
                    <p className="text-[var(--muted)] text-xs mt-1">
                      Weight: {signer.weight}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[var(--surface-soft)] rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <FaShieldAlt className="text-[var(--accent-emerald)]" />
                <p className="text-[var(--muted)] text-xs">Thresholds</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[var(--surface-elevated)] rounded p-2 text-center">
                  <p className="text-[var(--muted)] text-xs">Low</p>
                  <p className="text-[var(--on-dark)] font-semibold">{accountData.thresholds.low_threshold}</p>
                </div>
                <div className="bg-[var(--surface-elevated)] rounded p-2 text-center">
                  <p className="text-[var(--muted)] text-xs">Medium</p>
                  <p className="text-[var(--on-dark)] font-semibold">{accountData.thresholds.med_threshold}</p>
                </div>
                <div className="bg-[var(--surface-elevated)] rounded p-2 text-center">
                  <p className="text-[var(--muted)] text-xs">High</p>
                  <p className="text-[var(--on-dark)] font-semibold">{accountData.thresholds.high_threshold}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}