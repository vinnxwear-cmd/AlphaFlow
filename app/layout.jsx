import '../styles/globals.css'
import Header from '../components/Header'

export const metadata = {
  title: 'AlphaFlow'
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <Header />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  )
}