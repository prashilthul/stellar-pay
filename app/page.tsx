'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaWallet, FaHistory, FaPaperPlane, FaAddressBook, 
  FaInfoCircle, FaThLarge, FaCog, FaSignOutAlt, FaNetworkWired
} from 'react-icons/fa';
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'send' | 'history' | 'addressbook'>('dashboard');
  const [prefill, setPrefill] = useState<{ address?: string; memo?: string }>({});
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const autoConnect = async () => {
      const savedAddress = localStorage.getItem('stellar_wallet_address');
      if (savedAddress) {
        const installed = await stellar.isFreighterInstalled();
        if (installed) {
          setPublicKey(savedAddress);
          setIsConnected(true);
        }
      }
    };
    autoConnect();
  }, []);

  const handleConnect = (key: string) => {
    setPublicKey(key);
    setIsConnected(true);
    localStorage.setItem('stellar_wallet_address', key);
  };

  const handleDisconnect = () => {
    setPublicKey('');
    setIsConnected(false);
    localStorage.removeItem('stellar_wallet_address');
    stellar.disconnect();
  };

  if (!isMounted) return <div className="min-h-screen bg-[#0a0a0a]" />;

  const NavItem = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-4 px-6 py-4 w-full transition-all duration-300 relative group ${
        activeTab === id ? 'text-primary' : 'text-muted hover:text-on-dark'
      }`}
    >
      {activeTab === id && (
        <motion.div 
          layoutId="activeNav"
          className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      <Icon className={`text-lg transition-transform group-hover:scale-110 ${activeTab === id ? 'text-primary' : 'text-muted'}`} />
      <span className="font-bold uppercase tracking-[0.2em] text-[10px]">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-canvas flex flex-col md:flex-row text-on-dark font-inter selection:bg-primary selection:text-on-primary">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 bg-surface-soft border-r border-hairline flex-col sticky top-0 h-screen z-20">
        <div className="p-10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center rotate-45">
              <div className="-rotate-45 text-on-primary font-bold text-lg">S</div>
            </div>
            <h1 className="text-xl font-bold tracking-tighter italic">
              STELLAR<span className="text-primary font-black">PAY</span>
            </h1>
          </div>
          
        </div>

        {isConnected ? (
          <nav className="flex-1">
            <NavItem id="dashboard" label="Dashboard" icon={FaThLarge} />
            <NavItem id="send" label="New Payment" icon={FaPaperPlane} />
            <NavItem id="history" label="Ledger History" icon={FaHistory} />
            <NavItem id="addressbook" label="Address Book" icon={FaAddressBook} />
          </nav>
        ) : (
          <div className="px-10 py-12 flex-1">
            <div className="p-6 border border-hairline rounded-lg bg-surface-card/30">
              <p className="text-muted text-xs leading-relaxed">
                Connect your Stellar identity to access the high-performance terminal.
              </p>
            </div>
          </div>
        )}

        <div className="p-8 border-t border-hairline bg-canvas/30 backdrop-blur-sm">
          <NetworkStatus />
          {isConnected && (
            <button 
              onClick={handleDisconnect}
              className="mt-6 flex items-center gap-2 text-muted-soft hover:text-error transition-colors text-[10px] font-bold uppercase tracking-widest"
            >
              <FaSignOutAlt /> Terminate Session
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Header & Nav */}
      <header className="md:hidden sticky top-0 z-50 bg-canvas/80 backdrop-blur-md border-b border-hairline px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center rotate-45">
            <div className="-rotate-45 text-on-primary font-bold text-sm">S</div>
          </div>
          <span className="font-bold tracking-tighter italic text-sm">STELLAR<span className="text-primary font-black">PAY</span></span>
        </div>
        <div className="flex items-center gap-4">
           {isConnected && <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />}
           <FaNetworkWired className="text-muted" />
        </div>
      </header>

      {/* Mobile Bottom Bar */}
      {isConnected && (
        <nav className="md:hidden fixed bottom-6 left-6 right-6 z-50 bg-surface-card/90 backdrop-blur-xl border border-hairline rounded-2xl shadow-2xl p-2 flex justify-around items-center">
          {[
            { id: 'dashboard', icon: FaThLarge },
            { id: 'send', icon: FaPaperPlane },
            { id: 'history', icon: FaHistory },
            { id: 'addressbook', icon: FaAddressBook }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`p-4 rounded-xl transition-all duration-300 ${
                activeTab === item.id ? 'bg-primary text-on-primary' : 'text-muted'
              }`}
            >
              <item.icon size={18} />
            </button>
          ))}
        </nav>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden relative">
        <div className="max-w-6xl mx-auto p-8 md:p-16 pb-32 md:pb-16">
          <AnimatePresence mode="wait">
            {!isConnected ? (
              <motion.div 
                key="connect"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center min-h-[60vh] text-center"
              >
                <div className="mb-12 relative">
                   <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
                   <div className="w-24 h-24 bg-surface-card border border-hairline rounded-3xl flex items-center justify-center relative z-10 shadow-2xl">
                      <FaWallet className="text-4xl text-primary" />
                   </div>
                </div>
                <h2 className="text-5xl md:text-7xl font-bold tracking-tighter italic mb-6">
                  ENGINEERED FOR <br/>
                  <span className="text-primary">PERFORMANCE.</span>
                </h2>
                <p className="text-muted max-w-lg mx-auto mb-12 text-lg leading-relaxed">
                  The high-contrast payment terminal for the Stellar network. Zero atmospheric decoration. Pure blockchain voltage.
                </p>
                <WalletConnection onConnect={handleConnect} onDisconnect={handleDisconnect} />
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="space-y-12"
              >
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tighter italic uppercase">
                      {activeTab === 'dashboard' && "Protocol Overview"}
                      {activeTab === 'send' && "Execute Transaction"}
                      {activeTab === 'history' && "Ledger Audit"}
                      {activeTab === 'addressbook' && "Identity Registry"}
                    </h2>
                    <p className="text-muted mt-2 font-medium">
                      {activeTab === 'dashboard' && `Active Session: ${stellar.formatAddress(publicKey, 8, 8)}`}
                      {activeTab === 'send' && "Direct peer-to-peer asset transfer"}
                      {activeTab === 'history' && "Immutable record of all account actions"}
                      {activeTab === 'addressbook' && "Manage frequent recipient identities"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 bg-surface-soft border border-hairline px-4 py-2 rounded">
                    <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-dark">Connected to SDF Testnet</span>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="grid grid-cols-1 gap-12">
                  {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-8">
                        <BalanceDisplay publicKey={publicKey} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <AccountInfo publicKey={publicKey} />
                          <div className="bg-surface-card border border-hairline rounded-lg p-8 flex flex-col justify-between">
                             <div>
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-6">Quick Operations</h3>
                                <div className="space-y-4">
                                   <button 
                                      onClick={() => setActiveTab('send')}
                                      className="flex items-center justify-between w-full p-4 bg-canvas border border-hairline rounded hover:border-primary transition-all group"
                                   >
                                      <span className="font-bold text-xs uppercase tracking-widest group-hover:text-primary transition-colors">Transfer Assets</span>
                                      <FaPaperPlane size={12} className="text-muted group-hover:text-primary" />
                                   </button>
                                   <button 
                                      onClick={() => setActiveTab('addressbook')}
                                      className="flex items-center justify-between w-full p-4 bg-canvas border border-hairline rounded hover:border-primary transition-all group"
                                   >
                                      <span className="font-bold text-xs uppercase tracking-widest group-hover:text-primary transition-colors">Directory</span>
                                      <FaAddressBook size={12} className="text-muted group-hover:text-primary" />
                                   </button>
                                </div>
                             </div>
                             <a 
                                href="https://laboratory.stellar.org/" 
                                target="_blank"
                                className="mt-8 text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
                             >
                                Open Stellar Lab →
                             </a>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-8">
                        <div className="bg-surface-card border border-hairline rounded-lg p-8">
                           <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-6">Recent Activity</h3>
                           <TransactionHistory publicKey={publicKey} limit={5} />
                           <button 
                              onClick={() => setActiveTab('history')}
                              className="w-full mt-8 py-3 text-[10px] font-bold text-on-dark uppercase tracking-widest border border-hairline rounded hover:bg-surface-soft transition-colors"
                           >
                              View Full Audit Log
                           </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'send' && (
                    <div className="max-w-3xl mx-auto w-full">
                      <PaymentForm 
                        publicKey={publicKey} 
                        onSuccess={() => setActiveTab('history')} 
                        initialAddress={prefill.address}
                        initialMemo={prefill.memo}
                      />
                    </div>
                  )}

                  {activeTab === 'history' && (
                    <div className="bg-surface-card border border-hairline rounded-lg p-10">
                      <TransactionHistory publicKey={publicKey} />
                    </div>
                  )}

                  {activeTab === 'addressbook' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                       <AddressBook onSelectAddress={(addr) => {
                          setPrefill({ address: addr });
                          setActiveTab('send');
                       }} />
                       <MemoTemplates onSelectMemo={(memo) => {
                          setPrefill({ memo: memo });
                          setActiveTab('send');
                       }} />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}