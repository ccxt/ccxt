// Funding Swap Funding History
export default interface Funding {
  fundingInterval: Date;
  fundingRate: number;
  fundingRateDaily: number;
  symbol: string;
  timestamp: Date;
}
