'use client';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';

const AUTH_PATHS = ['/login', '/register'];
// Хэвлэх/PDF-д зориулсан цэвэр хуудсууд — sidebar/navbar-гүй, дэлгэц дүүрэн
const NO_CHROME_PREFIXES = ['/vocab/print'];

export default function LayoutShell({ children }) {
  const path = usePathname();
  const isAuth = AUTH_PATHS.includes(path);
  const noChrome = NO_CHROME_PREFIXES.some(p => path.startsWith(p));

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {!isAuth && !noChrome && <Navbar />}
      <main
        className="main-content"
        style={{
          flex: 1,
          marginLeft: (isAuth || noChrome) ? 0 : 'var(--sidebar-w)',
          minHeight: '100vh',
          overflow: 'auto',
        }}
      >
        {children}
      </main>
    </div>
  );
}
