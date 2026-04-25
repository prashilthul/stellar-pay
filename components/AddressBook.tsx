'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTrash, FaCopy, FaCheck, FaUserCircle, FaTimes } from 'react-icons/fa';
import { stellar } from '@/lib/stellar-helper';

interface Address {
  id: string;
  name: string;
  address: string;
  createdAt: string;
}

interface AddressBookProps {
  onSelectAddress?: (address: string) => void;
}

export default function AddressBook({ onSelectAddress }: AddressBookProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = () => {
    const saved = localStorage.getItem('stellar_address_book');
    if (saved) setAddresses(JSON.parse(saved));
  };

  const saveAddresses = (updatedAddresses: Address[]) => {
    localStorage.setItem('stellar_address_book', JSON.stringify(updatedAddresses));
    setAddresses(updatedAddresses);
  };

  const handleAddAddress = () => {
    if (!newName.trim() || !newAddress.trim()) {
      setError('Required parameters missing');
      return;
    }
    if (newAddress.length !== 56 || !newAddress.startsWith('G')) {
      setError('Invalid address structure');
      return;
    }

    const newEntry: Address = {
      id: Date.now().toString(),
      name: newName.trim(),
      address: newAddress.trim(),
      createdAt: new Date().toISOString(),
    };

    saveAddresses([...addresses, newEntry]);
    setNewName('');
    setNewAddress('');
    setShowAddForm(false);
    setError(null);
  };

  return (
    <div className="bg-surface-card border border-hairline rounded-lg p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Identity Registry</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-primary hover:text-primary-active text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
        >
          {showAddForm ? <FaTimes /> : <FaPlus />} {showAddForm ? 'Close' : 'Register New'}
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 p-6 bg-canvas border border-hairline rounded overflow-hidden"
          >
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest text-muted-soft mb-2 block">Alias</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-surface-soft border border-hairline rounded px-3 py-2 text-xs text-on-dark focus:outline-none focus:border-primary transition-colors"
                  placeholder="e.g. Primary Cold Wallet"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest text-muted-soft mb-2 block">Public Key</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full bg-surface-soft border border-hairline rounded px-3 py-2 text-xs text-on-dark font-mono focus:outline-none focus:border-primary transition-colors"
                  placeholder="G..."
                />
              </div>
              {error && <p className="text-accent-rose text-[9px] font-bold uppercase">{error}</p>}
              <button 
                onClick={handleAddAddress}
                className="w-full bg-primary text-on-primary text-[10px] font-bold uppercase tracking-widest py-3 rounded hover:bg-primary-active transition-colors"
              >
                Commit to Registry
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {addresses.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-hairline rounded">
            <p className="text-muted-soft text-[10px] font-bold uppercase tracking-widest">Registry Empty</p>
          </div>
        ) : (
          addresses.map((addr) => (
            <div key={addr.id} className="group bg-canvas border border-hairline rounded p-4 hover:border-primary/40 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="mt-1">
                    <FaUserCircle className="text-muted group-hover:text-primary transition-colors" size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-on-dark font-bold text-xs truncate italic">{addr.name}</p>
                    <p className="text-muted-soft font-mono text-[10px] truncate mt-1">{addr.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  {onSelectAddress && (
                    <button
                      onClick={() => onSelectAddress(addr.address)}
                      className="text-primary hover:text-primary-active text-[9px] font-bold uppercase tracking-widest"
                    >
                      Use
                    </button>
                  )}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(addr.address);
                      setCopied(addr.id);
                      setTimeout(() => setCopied(null), 2000);
                    }}
                    className="text-muted-soft hover:text-on-dark transition-colors"
                  >
                    {copied === addr.id ? <FaCheck className="text-accent-emerald" size={10} /> : <FaCopy size={10} />}
                  </button>
                  <button
                    onClick={() => saveAddresses(addresses.filter(a => a.id !== addr.id))}
                    className="text-muted-soft hover:text-accent-rose transition-colors"
                  >
                    <FaTrash size={10} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}