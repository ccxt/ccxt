// Quote Best Bid/Offer Snapshots & Historical Bins
export default interface Quote {
  askPrice: number;
  askSize: number;
  bidPrice: number;
  bidSize: number;
  symbol: string;
  timestamp: Date;
}
