// Affiliate affiliate
export default interface Affiliate {
  account: number;
  affiliatePayout: number;
  currency: string;
  execComm: number;
  execTurnover: number;
  payoutPcnt: number;
  pendingPayout: number;
  prevComm: number;
  prevPayout: number;
  prevTimestamp: Date;
  prevTurnover: number;
  referralDiscount: number;
  referrerAccount: number;
  timestamp: Date;
  totalComm: number;
  totalReferrals: number;
  totalTurnover: number;
}
