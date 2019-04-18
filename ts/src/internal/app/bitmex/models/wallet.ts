// Wallet wallet
export default interface Wallet {
  account: number;
  addr: string;
  amount: number;
  confirmedDebit: number;
  currency: string;
  deltaAmount: number;
  deltaDeposited: number;
  deltaTransferIn: number;
  deltaTransferOut: number;
  deltaWithdrawn: number;
  deposited: number;
  pendingCredit: number;
  pendingDebit: number;
  prevAmount: number;
  prevDeposited: number;
  prevTimestamp: Date;
  prevTransferIn: number;
  prevTransferOut: number;
  prevWithdrawn: number;
  script: string;
  timestamp: Date;
  transferIn: number;
  transferOut: number;
  withdrawalLock: string[];
  withdrawn: number;
}
