// TradeBin trade bin
export default interface TradeBin {
  close: number;
  foreignNotional: number;
  high: number;
  homeNotional: number;
  lastSize: number;
  low: number;
  open: number;
  symbol: string;
  timestamp: Date;
  trades: number;
  turnover: number;
  volume: number;
  vwap: number;
}
