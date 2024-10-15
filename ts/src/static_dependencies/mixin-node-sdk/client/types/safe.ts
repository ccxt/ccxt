export interface SafeWithdrawalRecipient {
    amount: string;
    destination: string;
    tag?: string;
  }
  
  export interface SafeMixinRecipient {
    members: string[];
    threshold: number;
    mixAddress: string;
    amount: string;
  }
  
export type SafeTransactionRecipient = SafeWithdrawalRecipient | SafeMixinRecipient;
