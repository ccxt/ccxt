This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Description

This app demonstrates the use of ccxt with a nextjs project. It showcases the use of both ccxt as a server side package and also to be running in the client:

- **/tickers**: uses the **clients Window websockets** to connect to the exchange and stream ticker values

- **/balance**: uses a **server side call** to protect exposing any api keys and fetches and shows the user balance.

## Getting Started

1. install the dependencies:

```bash
npm run install
```


2. Set the keys in pages/balance.tsx

3. Run the app:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
