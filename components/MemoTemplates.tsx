/**
 * MemoTemplates Component
 *
 * Save and reuse common memos for payments
 */

'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaCheck } from 'react-icons/fa';

interface MemoTemplate {
  id: string;
  name: string;
  memo: string;
  createdAt: string;
}

interface MemoTemplatesProps {
  onSelectMemo?: (memo: string) => void;
}

export default function MemoTemplates({ onSelectMemo }: MemoTemplatesProps) {
  const [templates, setTemplates] = useState<MemoTemplate[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newMemo, setNewMemo] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    try {
      const saved = localStorage.getItem('stellar_memo_templates');
      if (saved) {
        setTemplates(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const saveTemplates = (updatedTemplates: MemoTemplate[]) => {
    try {
      localStorage.setItem('stellar_memo_templates', JSON.stringify(updatedTemplates));
      setTemplates(updatedTemplates);
    } catch (error) {
      console.error('Error saving templates:', error);
    }
  };

  const handleAddTemplate = () => {
    if (!newName.trim() || !newMemo.trim()) {
      setError('Name and memo are required');
      return;
    }

    if (newMemo.length > 28) {
      setError('Memo cannot exceed 28 characters');
      return;
    }

    const newTemplate: MemoTemplate = {
      id: Date.now().toString(),
      name: newName.trim(),
      memo: newMemo.trim(),
      createdAt: new Date().toISOString(),
    };

    saveTemplates([...templates, newTemplate]);
    setNewName('');
    setNewMemo('');
    setShowAddForm(false);
    setError(null);
  };

  const handleDeleteTemplate = (id: string) => {
    saveTemplates(templates.filter(t => t.id !== id));
  };

  const handleSelectTemplate = (memo: string) => {
    if (onSelectMemo) {
      onSelectMemo(memo);
    }
  };

  const defaultTemplates = [
    { name: 'Rent', memo: 'Monthly rent payment' },
    { name: 'Invoice', memo: 'Invoice payment' },
    { name: 'Thanks', memo: 'Thank you!' },
    { name: 'Service', memo: 'Service payment' },
  ];

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--hairline)] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[18px] font-semibold text-[var(--on-dark)]">Memo Templates</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary px-4 py-2 flex items-center gap-2"
        >
          <FaPlus />
          Add Template
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 bg-[var(--surface-soft)] border border-[var(--hairline)] rounded-lg">
          <div className="space-y-4">
            <div>
              <label className="block text-[var(--body)] text-sm font-medium mb-2">
                Template Name
              </label>
              <input
                type="text"
                placeholder="Rent, Invoice, etc."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-[var(--surface-card)] border border-[var(--hairline)] rounded-lg px-4 py-3 text-[var(--on-dark)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
              />
            </div>

            <div>
              <label className="block text-[var(--body)] text-sm font-medium mb-2">
                Memo Text
              </label>
              <input
                type="text"
                placeholder="Payment for..."
                value={newMemo}
                onChange={(e) => setNewMemo(e.target.value)}
                maxLength={28}
                className="w-full bg-[var(--surface-card)] border border-[var(--hairline)] rounded-lg px-4 py-3 text-[var(--on-dark)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
              />
              <p className="text-[var(--muted-soft)] text-xs mt-1">
                {newMemo.length}/28 characters
              </p>
            </div>

            {error && (
              <p className="text-[var(--accent-rose)] text-sm">{error}</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleAddTemplate}
                className="btn-primary px-4 py-2"
              >
                Save Template
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewName('');
                  setNewMemo('');
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

      {templates.length === 0 && (
        <div className="mb-4">
          <p className="text-[var(--muted)] text-sm mb-3">Quick templates:</p>
          <div className="grid grid-cols-2 gap-2">
            {defaultTemplates.map((template) => (
              <button
                key={template.name}
                onClick={() => handleSelectTemplate(template.memo)}
                className="p-2 bg-[var(--surface-soft)] border border-[var(--hairline)] rounded-lg hover:border-[var(--primary)] transition-colors text-left"
              >
                <p className="text-[var(--on-dark)] text-sm font-medium">{template.name}</p>
                <p className="text-[var(--muted)] text-xs">{template.memo}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {templates.length > 0 && (
        <div className="space-y-2">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-[var(--surface-soft)] border border-[var(--hairline)] rounded-lg p-3 hover:border-[var(--hairline-strong)] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--on-dark)] text-sm font-medium">{template.name}</p>
                  <p className="text-[var(--muted)] text-xs">{template.memo}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {onSelectMemo && (
                    <button
                      onClick={() => handleSelectTemplate(template.memo)}
                      className="text-[var(--primary)] hover:text-[var(--primary-active)] text-sm"
                      title="Use this memo"
                    >
                      Use
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="text-[var(--accent-rose)] hover:text-[var(--accent-rose)] transition-colors"
                    title="Delete template"
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