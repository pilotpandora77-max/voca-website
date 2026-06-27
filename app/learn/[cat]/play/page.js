'use client';
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useLang } from '@/lib/LangContext';
import { findCategory } from '@/lib/courses';
import WordGames from '@/components/WordGames';

export default function CategoryPlayPage() {
  const { user, loading: authLoad } = useAuth();
  const { lang, langInfo } = useLang();
  const router = useRouter();
  const { cat } = useParams();
  const category = findCategory(lang, cat);

  useEffect(() => { if (!authLoad && !user) router.push('/login'); }, [authLoad, user]);

  if (authLoad) return null;
  if (!category || category.words.length < 4) return (
    <div style={{ padding: 60, textAlign: 'center' }}>
      <div style={{ fontSize: 44, marginBottom: 12 }}>🎮</div>
      <h2 style={{ color: 'var(--text)', marginBottom: 8 }}>Энэ ангилалд тоглоом тоглоход хангалттай үг алга</h2>
      <Link href={`/learn/${cat}`} className="btn btn-purple" style={{ marginTop: 16, textDecoration: 'none' }}>Буцах</Link>
    </div>
  );

  return (
    <div style={{ padding: '24px 28px 48px', maxWidth: 760, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Link href={`/learn/${cat}`} style={{ color: 'var(--text-sub)', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>← Буцах</Link>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)' }}>{category.emoji} {category.name} — Тоглоом</h1>
      </div>
      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 22 }}>Энэ ангиллын {category.words.length} үгээр тоглоомоор дамжуулан цээжлээрэй.</p>
      <WordGames words={category.words} sttLang={langInfo.sttLang} />
    </div>
  );
}
