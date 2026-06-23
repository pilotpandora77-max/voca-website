'use client';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';

const AUTH_PATHS = ['/login', '/register'];

export default function LayoutShell({ children }) {
  const path = usePathname();
  const isAuth = AUTH_PATHS.includes(path);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {!isAuth && <Navbar />}
      <main
        className="main-content"
        style={{
          flex: 1,
          marginLeft: isAuth ? 0 : 'var(--sidebar-w)',
          minHeight: '100vh',
          overflow: 'auto',
        }}
      >
        {children}
      </main>
    </div>
  );
}
