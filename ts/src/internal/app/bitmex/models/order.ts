// Order Placement, Cancellation, Amending, and History
export default interface Order {
  account: number;
  avgPx: number;
  clOrdID: string;
  clOrdLinkID: string;
  contingencyType: string;
  cumQty: number;
  currency: string;
  displayQty: number;
  exDestination: string;
  execInst: string;
  leavesQty: number;
  multiLegReportingType: string;
  ordRejReason: string;
  ordStatus: string;
  ordType: string;
  orderID: string;
  orderQty: number;
  pegOffsetValue: number;
  pegPriceType: string;
  price: number;
  sellCurrency: string;
  side: string;
  simpleCumQty: number;
  simpleLeavesQty: number;
  simpleOrderQty: number;
  stopPx: number;
  symbol: string;
  text: string;
  timeInForce: string;
  timestamp: Date;
  transactTime: Date;
  triggered: string;
  workingIndicator: boolean;
}
