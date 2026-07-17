export const metadata = {
  title: 'Quranic Principles',
  description: 'A journal connecting Quranic wisdom to the real lives of Muslims around the world.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#060F0C' }}>
        {children}
      </body>
    </html>
  )
}
