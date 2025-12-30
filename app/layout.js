import './globals.css';

export const metadata = {
  title: 'Pastebin Lite',
  description: 'Share text snippets with optional expiry',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}