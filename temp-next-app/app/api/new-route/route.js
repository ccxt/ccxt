import { NextResponse } from "next/server";
export async function GET(request) { return NextResponse.json({ message: "Hello World" }); }
export async function POST(request) { return NextResponse.json({ message: "Hello World" }); }



import CCXT from 'ccxt';
const exchange = new CCXT['binance']()
console.log(await exchange.fetch('https://api.ipify.org'));
