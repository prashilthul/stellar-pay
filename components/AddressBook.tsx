/**
 * AddressBook Component
 *
 * Manage saved addresses for quick access
 */

'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaCopy, FaCheck } from 'react-icons/fa';

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
    try {
      const saved = localStorage.getItem('stellar_address_book');
      if (saved) {
        setAddresses(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const saveAddresses = (updatedAddresses: Address[]) => {
    try {
      localStorage.setItem('stellar_address_book', JSON.stringify(updatedAddresses));
      setAddresses(updatedAddresses);
    } catch (error) {
      console.error('Error saving addresses:', error);
    }
  };

  const handleAddAddress = () => {
    if (!newName.trim() || !newAddress.trim()) {
      setError('Name and address are required');
      return;
    }

    if (newAddress.length !== 56 || !newAddress.startsWith('G')) {
      setError('Invalid Stellar address');
      return;
    }

    const newAddressEntry: Address = {
      id: Date.now().toString(),
      name: newName.trim(),
      address: newAddress.trim(),
      createdAt: new Date().toISOString(),
    };

    saveAddresses([...addresses, newAddressEntry]);
    setNewName('');
    setNewAddress('');
    setShowAddForm(false);
    setError(null);
  };

  const handleDeleteAddress = (id: string) => {
    saveAddresses(addresses.filter(addr => addr.id !== id));
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(address);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSelectAddress = (address: string) => {
    if (onSelectAddress) {
      onSelectAddress(address);
    }
  };

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--hairline)] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[18px] font-semibold text-[var(--on-dark)]">Address Book</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary px-4 py-2 flex items-center gap-2"
        >
          <FaPlus />
          Add Address
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 bg-[var(--surface-soft)] border border-[var(--hairline)] rounded-lg">
          <div className="space-y-4">
            <div>
              <label className="block text-[var(--body)] text-sm font-medium mb-2">
                Name
              </label>
              <input
                type="text"
                placeholder="Friend, Business, etc."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-[var(--surface-card)] border border-[var(--hairline)] rounded-lg px-4 py-3 text-[var(--on-dark)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
              />
            </div>

            <div>
              <label className="block text-[var(--body)] text-sm font-medium mb-2">
                Stellar Address
              </label>
              <input
                type="text"
                placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="w-full bg-[var(--surface-card)] border border-[var(--hairline)] rounded-lg px-4 py-3 text-[var(--on-dark)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
              />
            </div>

            {error && (
              <p className="text-[var(--accent-rose)] text-sm">{error}</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleAddAddress}
                className="btn-primary px-4 py-2"
              >
                Save Address
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewName('');
                  setNewAddress('');
                  setError(null);
                }}
                className="btn-secondary px-4 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {addresses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-[var(--muted)]">No saved addresses yet</p>
          <p className="text-[var(--muted-soft)] text-sm mt-1">
            Add frequently used addresses for quick access
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="bg-[var(--surface-soft)] border border-[var(--hairline)] rounded-lg p-4 hover:border-[var(--hairline-strong)] transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--on-dark)] font-medium mb-1">{addr.name}</p>
                  <p className="text-[var(--muted)] text-xs font-mono break-all mb-2">
                    {addr.address}
                  </p>
                  <p className="text-[var(--muted-soft)] text-xs">
                    Added {new Date(addr.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {onSelectAddress && (
                    <button
                      onClick={() => handleSelectAddress(addr.address)}
                      className="text-[var(--primary)] hover:text-[var(--primary-active)] text-sm"
                      title="Use this address"
                    >
                      Use
                    </button>
                  )}
                  <button
                    onClick={() => handleCopyAddress(addr.address)}
                    className="text-[var(--body)] hover:text-[var(--on-dark)] transition-colors"
                    title="Copy address"
                  >
                    {copied === addr.address ? (
                      <FaCheck className="text-[var(--accent-emerald)]" />
                    ) : (
                      <FaCopy />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="text-[var(--accent-rose)] hover:text-[var(--accent-rose)] transition-colors"
                    title="Delete address"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}