// Settlement Historical Settlement Data
export default interface Settlement {
  bankrupt: number;
  optionStrikePrice: number;
  optionUnderlyingPrice: number;
  settledPrice: number;
  settlementType: string;
  symbol: string;
  taxBase: number;
  taxRate: number;
  timestamp: Date;
}
