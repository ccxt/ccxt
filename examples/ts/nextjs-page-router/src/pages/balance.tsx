import ccxt, { Balances } from 'ccxt'

// This is for showcase purposes in prod move this to environment variable like process.env.BINANCEUSDM_API_KEY
const apiKey = ""
const secret = ""

export async function getServerSideProps () {
  const exchange = new ccxt.kraken({ apiKey, secret })
  const balances = await exchange.fetchBalance()
  // remove undefined values to prevent serializing error
  Object.keys(balances).forEach(key => balances[key] === undefined && delete balances[key])
  return {
    props: {
      balances,
    },
  }
}

export default function Balance({balances}: {balances: Balances}) {
  return (
    <main className={`flex min-h-screen flex-col items-center justify-between p-24`}>
      <table>
        <thead>
          <tr>
            <th>Currency</th>
            <th>Free</th>
            <th>Used</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(balances).map((currency: string) => (
            balances[currency].free !== undefined && (
              <tr key={currency}>
                <td>{currency}</td>
                <td>{balances[currency].free}</td>
                <td>{balances[currency].used}</td>
                <td>{balances[currency].total}</td>
              </tr>
            )
          ))}
        </tbody>
      </table>
    </main>
  )
}
