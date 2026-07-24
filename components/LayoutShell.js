'use client';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/auth';
import useTrialCountdown from '@/lib/useTrialCountdown';

const AUTH_PATHS = ['/login', '/register'];
// Хэвлэх/PDF-д зориулсан цэвэр хуудсууд — sidebar/navbar-гүй, дэлгэц дүүрэн
const NO_CHROME_PREFIXES = ['/vocab/print'];

export default function LayoutShell({ children }) {
  const path = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const isAuth = AUTH_PATHS.includes(path);
  const noChrome = NO_CHROME_PREFIXES.some(p => path.startsWith(p));

  // 7 хоногийн Premium туршилт аль ч хуудсан дээр байхад дуусмагц Pricing руу чиглүүлнэ.
  useTrialCountdown(user, () => {
    if (path !== '/pricing') router.push('/pricing?reason=trial_expired');
  });

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
