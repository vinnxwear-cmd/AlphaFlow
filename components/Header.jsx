export default function Header() {
  return (
    <header className="w-full bg-slate-900 text-slate-100 py-4">
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="font-bold">AlphaFlow</div>
        <nav>
          <a className="mr-4" href="/">Home</a>
          <a className="mr-4" href="/dashboard">Dashboard</a>
          <a href="/auth/login">Login</a>
        </nav>
      </div>
    </header>
  )
}