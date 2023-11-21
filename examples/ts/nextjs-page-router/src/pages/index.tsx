export default function Home() {
  return (
    <main className={`flex min-h-screen flex-col items-center space-y-10`}>
        <a className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 w-120 m-4" href="/balance">Balance - Using Server Side calls</a>
        <a className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 w-120 m-4" href="/tickers">Tickers - Using Client Side websockets</a>
    </main>
  )
}
