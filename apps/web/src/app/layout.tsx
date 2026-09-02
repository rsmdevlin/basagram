import type { Metadata } from 'next';
import './globals.css';
import Navigation from './components/Navigation';

export const metadata: Metadata = {
  title: 'Basagram — Премиум Мессенджер',
  description: 'Современный мессенджер с реал-тайм коммуникацией',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
