import './globals.css';
import { AuthProvider } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import { GoogleOAuthProvider } from '@react-oauth/google';

export const metadata = {
  title: 'voca — Хятад хэл сурах',
  description: 'Хятад хэлийг хялбархан, хурдан сурах платформ',
};

const GOOGLE_CLIENT_ID = '963221731155-sfi0kc8kccit4mgbr3kok3piduufo2be.apps.googleusercontent.com';

export default function RootLayout({ children }) {
  return (
    <html lang="mn">
      <body>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <AuthProvider>
            <div style={{ display: 'flex', minHeight: '100vh' }}>
              <Navbar />
              <main
                className="main-content"
                style={{
                  flex: 1,
                  marginLeft: 'var(--sidebar-w)',
                  minHeight: '100vh',
                  overflow: 'auto',
                }}
              >
                {children}
              </main>
            </div>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
