import './globals.css';
import { AuthProvider } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import { GoogleOAuthProvider } from '@react-oauth/google';

export const metadata = {
  title: 'voca — Хятад хэл сурах',
  description: 'Хятад хэл сурах платформ',
};

const GOOGLE_CLIENT_ID = '963221731155-sfi0kc8kccit4mgbr3kok3piduufo2be.apps.googleusercontent.com';

export default function RootLayout({ children }) {
  return (
    <html lang="mn">
      <body>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <AuthProvider>
            <Navbar />
            <main style={{ minHeight: 'calc(100vh - 60px)', paddingTop: 60 }}>
              {children}
            </main>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
