// Trade Individual & Bucketed Trades
export default interface Trade {
  foreignNotional: number;
  grossValue: number;
  homeNotional: number;
  price: number;
  side: string;
  size: number;
  symbol: string;
  tickDirection: string;
  timestamp: Date;
  trdMatchID: string;
}
