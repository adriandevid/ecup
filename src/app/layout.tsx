import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FutChamp - Sistema de Campeonatos de Futebol',
  description: 'Organize campeonatos de futebol com pontos corridos e mata-mata',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
