import './globals.css';
import { AuthProvider } from '@/lib/auth';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'voca — Хятад хэл сурах',
  description: 'Хятад хэл сурах платформ',
};

export default function RootLayout({ children }) {
  return (
    <html lang="mn">
      <body>
        <AuthProvider>
          <Navbar />
          <main style={{ minHeight: 'calc(100vh - 60px)', paddingTop: 60 }}>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
