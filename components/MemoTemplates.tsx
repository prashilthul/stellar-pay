'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTrash, FaTag, FaTimes } from 'react-icons/fa';

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
    const saved = localStorage.getItem('stellar_memo_templates');
    if (saved) setTemplates(JSON.parse(saved));
  };

  const saveTemplates = (updatedTemplates: MemoTemplate[]) => {
    localStorage.setItem('stellar_memo_templates', JSON.stringify(updatedTemplates));
    setTemplates(updatedTemplates);
  };

  const handleAddTemplate = () => {
    if (!newName.trim() || !newMemo.trim()) {
      setError('Parameters required');
      return;
    }
    if (newMemo.length > 28) {
      setError('Exceeds 28 byte limit');
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

  const defaultTemplates = [
    { name: 'RENT_PAY', memo: 'Monthly Rent' },
    { name: 'INV_STLR', memo: 'Invoice #001' },
    { name: 'GEN_TX', memo: 'General Transfer' },
  ];

  return (
    <div className="bg-surface-card border border-hairline rounded-lg p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Transmission Presets</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-primary hover:text-primary-active text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
        >
          {showAddForm ? <FaTimes /> : <FaPlus />} {showAddForm ? 'Close' : 'New Preset'}
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
                <label className="text-[9px] font-bold uppercase tracking-widest text-muted-soft mb-2 block">Preset Label</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-surface-soft border border-hairline rounded px-3 py-2 text-xs text-on-dark focus:outline-none focus:border-primary transition-colors"
                  placeholder="e.g. INVOICE_V1"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest text-muted-soft mb-2 block">Memo String (Max 28)</label>
                <input
                  type="text"
                  value={newMemo}
                  onChange={(e) => setNewMemo(e.target.value)}
                  maxLength={28}
                  className="w-full bg-surface-soft border border-hairline rounded px-3 py-2 text-xs text-on-dark font-mono focus:outline-none focus:border-primary transition-colors"
                  placeholder="Reference text"
                />
              </div>
              {error && <p className="text-accent-rose text-[9px] font-bold uppercase">{error}</p>}
              <button 
                onClick={handleAddTemplate}
                className="w-full bg-primary text-on-primary text-[10px] font-bold uppercase tracking-widest py-3 rounded hover:bg-primary-active transition-colors"
              >
                Register Preset
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {templates.length === 0 && (
          <div className="grid grid-cols-1 gap-2 mb-6">
             <p className="text-muted-soft text-[9px] font-bold uppercase tracking-widest mb-2">Default Clusters</p>
             {defaultTemplates.map((t) => (
                <button
                  key={t.name}
                  onClick={() => onSelectMemo?.(t.memo)}
                  className="flex items-center justify-between p-3 bg-canvas border border-hairline rounded hover:border-primary transition-all group"
                >
                  <span className="text-[10px] font-bold text-on-dark font-mono italic">{t.name}</span>
                  <span className="text-[10px] text-muted-soft">{t.memo}</span>
                </button>
             ))}
          </div>
        )}

        {templates.map((template) => (
          <div key={template.id} className="group bg-canvas border border-hairline rounded p-4 hover:border-primary/40 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <FaTag className="text-muted group-hover:text-primary transition-colors" size={12} />
                <div className="min-w-0">
                  <p className="text-on-dark font-bold text-xs truncate italic">{template.name}</p>
                  <p className="text-muted-soft font-mono text-[10px] truncate mt-1">{template.memo}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-4">
                {onSelectMemo && (
                  <button
                    onClick={() => onSelectMemo(template.memo)}
                    className="text-primary hover:text-primary-active text-[9px] font-bold uppercase tracking-widest"
                  >
                    Select
                  </button>
                )}
                <button
                  onClick={() => saveTemplates(templates.filter(t => t.id !== template.id))}
                  className="text-muted-soft hover:text-accent-rose transition-colors"
                >
                  <FaTrash size={10} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}