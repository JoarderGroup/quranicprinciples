export const metadata = {
  title: 'Quranic Principles',
  description: 'QP',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
