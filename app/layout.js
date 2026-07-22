import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { LangProvider } from '@/lib/LangContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import LayoutShell from '@/components/LayoutShell';

export const metadata = {
  title: 'voca — Хятад хэл сурах',
  description: 'Хятад хэлийг хялбархан, хурдан сурах платформ',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

const GOOGLE_CLIENT_ID = '963221731155-sfi0kc8kccit4mgbr3kok3piduufo2be.apps.googleusercontent.com';

export default function RootLayout({ children }) {
  return (
    <html lang="mn">
      <body>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <AuthProvider>
            <LangProvider>
              <LayoutShell>{children}</LayoutShell>
            </LangProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
