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

## Screenshots
##### Index
![menu](https://github.com/ccxt/ccxt/assets/12142844/645b5fe8-fd13-44f8-bded-20733843ccea)
##### Client side websocket example
![websocket](https://github.com/ccxt/ccxt/assets/12142844/7c28f8c9-aefd-4db3-8aff-6ff06b93a8bc)
##### Server side private endpoint fetch balance
![balance](https://github.com/ccxt/ccxt/assets/12142844/bd253903-43ea-4225-a7ca-193aaa29f42a)

