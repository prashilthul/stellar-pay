'use client';

import { useState } from 'react';
import WalletConnection from '@/components/WalletConnection';
import BalanceDisplay from '@/components/BalanceDisplay';
import PaymentForm from '@/components/PaymentForm';
import TransactionHistory from '@/components/TransactionHistory';
import NetworkStatus from '@/components/NetworkStatus';
import AccountInfo from '@/components/AccountInfo';
import AddressBook from '@/components/AddressBook';
import MemoTemplates from '@/components/MemoTemplates';
import { stellar } from '@/lib/stellar-helper';

export default function Home() {
  const [publicKey, setPublicKey] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'send' | 'history'>('dashboard');

  const handleConnect = (key: string) => {
    setPublicKey(key);
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    setPublicKey('');
    setIsConnected(false);
  };

  const handlePaymentSuccess = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[var(--canvas)] flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-[var(--surface-card)] border-b border-[var(--hairline)] p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-bold text-[var(--on-dark)]">Stellar</h1>
            <p className="text-[var(--muted)] text-xs">Payment Dashboard</p>
          </div>
          {isConnected && (
            <div className="badge badge-yellow text-xs">Testnet</div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-[var(--surface-card)] border-r border-[var(--hairline)] p-6 flex-col">
        <div className="mb-8">
          <h1 className="text-[24px] font-bold text-[var(--on-dark)] tracking-tight">
            Stellar
          </h1>
          <p className="text-[var(--muted)] text-sm">Payment Dashboard</p>
        </div>

        {isConnected && (
          <nav className="space-y-2 flex-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-[var(--primary)] text-[var(--on-primary)]'
                  : 'text-[var(--body)] hover:bg-[var(--surface-soft)]'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('send')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'send'
                  ? 'bg-[var(--primary)] text-[var(--on-primary)]'
                  : 'text-[var(--body)] hover:bg-[var(--surface-soft)]'
              }`}
            >
              Send Payment
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'history'
                  ? 'bg-[var(--primary)] text-[var(--on-primary)]'
                  : 'text-[var(--body)] hover:bg-[var(--surface-soft)]'
              }`}
            >
              Transaction History
            </button>
          </nav>
        )}

        <div className="mt-auto">
          <NetworkStatus />
        </div>
      </aside>

      {/* Mobile Navigation */}
      {isConnected && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--surface-card)] border-t border-[var(--hairline)] z-50">
          <div className="flex justify-around p-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                activeTab === 'dashboard'
                  ? 'text-[var(--primary)]'
                  : 'text-[var(--muted)]'
              }`}
            >
              <div className="text-lg">Dashboard</div>
            </button>
            <button
              onClick={() => setActiveTab('send')}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                activeTab === 'send'
                  ? 'text-[var(--primary)]'
                  : 'text-[var(--muted)]'
              }`}
            >
              <div className="text-lg">Send</div>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                activeTab === 'history'
                  ? 'text-[var(--primary)]'
                  : 'text-[var(--muted)]'
              }`}
            >
              <div className="text-lg">History</div>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-20 md:pb-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div>
              <h2 className="text-[24px] md:text-[32px] font-bold text-[var(--on-dark)]">
                {isConnected ? 'Dashboard' : 'Welcome'}
              </h2>
              <p className="text-[var(--body)] text-sm md:text-base mt-1">
                {isConnected ? 'Manage your Stellar assets' : 'Connect your wallet to get started'}
              </p>
            </div>
            {isConnected && (
              <div className="hidden md:flex items-center gap-3">
                <div className="badge badge-yellow">Testnet</div>
              </div>
            )}
          </div>

          {!isConnected ? (
            <div className="flex items-center justify-center min-h-[300px] md:min-h-[400px]">
              <WalletConnection
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
              />
            </div>
          ) : (
            <>
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && (
                <div className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <BalanceDisplay publicKey={publicKey} />
                    <AccountInfo publicKey={publicKey} />
                  </div>

                  {/* New Features Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    <AddressBook />
                    <MemoTemplates />
                  </div>

                  <MemoTemplates />

                  {/* Quick Actions */}
                  <div className="bg-[var(--surface-card)] border border-[var(--hairline)] rounded-2xl p-4 md:p-6">
                    <h3 className="text-[16px] md:text-[18px] font-semibold text-[var(--on-dark)] mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                      <button
                        onClick={() => setActiveTab('send')}
                        className="p-3 md:p-4 bg-[var(--surface-soft)] border border-[var(--hairline)] rounded-lg hover:border-[var(--hairline-strong)] transition-colors text-center"
                      >
                        <div className="text-xl md:text-2xl mb-2">Send</div>
                        <div className="text-xs md:text-sm text-[var(--body)]">Send XLM</div>
                      </button>
                      <a
                        href="https://stellarterm.com/testnet/xlm-native"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 md:p-4 bg-[var(--surface-soft)] border border-[var(--hairline)] rounded-lg hover:border-[var(--hairline-strong)] transition-colors text-center"
                      >
                        <div className="text-xl md:text-2xl mb-2">Get XLM</div>
                        <div className="text-xs md:text-sm text-[var(--body)]">Get XLM</div>
                      </a>
                      <a
                        href={stellar.getExplorerLink(publicKey, 'account')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 md:p-4 bg-[var(--surface-soft)] border border-[var(--hairline)] rounded-lg hover:border-[var(--hairline-strong)] transition-colors text-center"
                      >
                        <div className="text-xl md:text-2xl mb-2">Explorer</div>
                        <div className="text-xs md:text-sm text-[var(--body)]">Explorer</div>
                      </a>
                      <button
                        onClick={handleDisconnect}
                        className="p-3 md:p-4 bg-[var(--surface-soft)] border border-[var(--hairline)] rounded-lg hover:border-[var(--accent-rose)] transition-colors text-center"
                      >
                        <div className="text-xl md:text-2xl mb-2">Disconnect</div>
                        <div className="text-xs md:text-sm text-[var(--body)]">Disconnect</div>
                      </button>
                    </div>
                  </div>

                  {/* Recent Transactions Preview */}
                  <div className="bg-[var(--surface-card)] border border-[var(--hairline)] rounded-2xl p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[16px] md:text-[18px] font-semibold text-[var(--on-dark)]">Recent Activity</h3>
                      <button
                        onClick={() => setActiveTab('history')}
                        className="text-[var(--primary)] hover:text-[var(--primary-active)] text-sm"
                      >
                        View All
                      </button>
                    </div>
                    <TransactionHistory publicKey={publicKey} />
                  </div>
                </div>
              )}

              {/* Send Tab */}
              {activeTab === 'send' && (
                <div className="max-w-2xl">
                  <PaymentForm
                    publicKey={publicKey}
                    onSuccess={handlePaymentSuccess}
                  />
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <TransactionHistory publicKey={publicKey} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}