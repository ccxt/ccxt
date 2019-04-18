// Transaction transaction
export default interface Transaction {
  account: number;
  address: string;
  amount: number;
  currency: string;
  fee: number;
  text: string;
  timestamp: Date;
  transactID: string;
  transactStatus: string;
  transactTime: Date;
  transactType: string;
  tx: string;
}
