import './globals.css';

export const metadata = {
  title: 'Content Intelligence | Roteiros Instagram',
  description: 'Plataforma de inteligência de conteúdo para dermatologia — transcrições, métricas e IA',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
