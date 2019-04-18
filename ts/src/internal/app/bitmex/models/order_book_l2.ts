// OrderBookL2 order book l2
export default interface OrderBookL2 {
  id: number;
  price: number;
  side: string;
  size: number;
  symbol: string;
}
