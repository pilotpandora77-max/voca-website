'use client';
import { useState } from 'react';
import NewWordTab from './NewWordTab';
import SearchTab from './SearchTab';
import CategoryTab from './CategoryTab';
import MyWordsTab from './MyWordsTab';
import FileImportTab from './FileImportTab';

const TABS = [
  { id: 'search',   label: 'Хайж нэмэх' },
  { id: 'new',      label: 'Шинэ үг нэмэх' },
  { id: 'category', label: 'Ангилаас нэмэх' },
  { id: 'mywords',  label: 'Миний үгс' },
  { id: 'import',   label: 'Файл оруулах' },
];

// 5-табтай "Үг нэмэх" модал. Таб бүр өөрийн гэсэн орон нутгийн draft/state-тэй,
// таб солиход алдагдахгүй (бүгд нэг зэрэг mount хийгдээд CSS-ээр л нуугдана).
export default function AddWordModal({
  open, onClose, words, activeGroup, derivedGroups, setWordGroup, defaultGroup, defaultLang, onAdded,
}) {
  const [activeTab, setActiveTab] = useState('new');
  const [aiLang, setAiLang] = useState(defaultLang || 'en');

  if (!open) return null;

  const targetGroup = activeGroup || defaultGroup;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,10,30,0.4)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(4px)',
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="card" style={{ width: 760, maxWidth: '95vw', padding: 0, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px 0' }}>
          <h2 style={{ fontWeight: 900, fontSize: 18 }}>Үг нэмэх</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--muted)', lineHeight: 1, padding: 4 }}>×</button>
        </div>

        <div style={{ display: 'flex', gap: 4, padding: '14px 24px 0', borderBottom: '1.5px solid var(--border)', overflowX: 'auto' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              padding: '8px 14px', background: 'none', border: 'none',
              borderBottom: `2px solid ${activeTab === t.id ? 'var(--purple)' : 'transparent'}`,
              color: activeTab === t.id ? 'var(--purple)' : 'var(--text-sub)', fontWeight: 800, fontSize: 13,
              cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', marginBottom: -1.5,
            }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
          <div style={{ display: activeTab === 'search' ? 'block' : 'none' }}>
            <SearchTab aiLang={aiLang} setAiLang={setAiLang} targetGroup={targetGroup} onAdded={onAdded} />
          </div>
          <div style={{ display: activeTab === 'new' ? 'block' : 'none' }}>
            <NewWordTab aiLang={aiLang} setAiLang={setAiLang} targetGroup={targetGroup}
              onSaved={() => { onAdded?.(); onClose(); }} onCancel={onClose} />
          </div>
          <div style={{ display: activeTab === 'category' ? 'block' : 'none' }}>
            <CategoryTab aiLang={aiLang} setAiLang={setAiLang} targetGroup={targetGroup} onAdded={onAdded} />
          </div>
          <div style={{ display: activeTab === 'mywords' ? 'block' : 'none' }}>
            <MyWordsTab words={words} activeGroup={targetGroup} setWordGroup={setWordGroup} onDone={onClose} />
          </div>
          <div style={{ display: activeTab === 'import' ? 'block' : 'none' }}>
            <FileImportTab aiLang={aiLang} setAiLang={setAiLang} targetGroup={targetGroup} onAdded={onAdded} />
          </div>
        </div>
      </div>
    </div>
  );
}
