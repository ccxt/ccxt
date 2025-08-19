import { MAX_SUBACCOUNT_NUMBER } from './constants';
import LocalWallet from './modules/local-wallet';

export class SubaccountInfo {
  readonly wallet: LocalWallet;
  // TODO, change address to Wallet object when implementing validator functions
  readonly subaccountNumber: number;

  constructor(wallet: LocalWallet, subaccountNumber: number = 0) {
    if (subaccountNumber < 0 || subaccountNumber > MAX_SUBACCOUNT_NUMBER) {
      throw new Error(`Subaccount number must be between 0 and ${MAX_SUBACCOUNT_NUMBER}`);
    }
    this.wallet = wallet;
    this.subaccountNumber = subaccountNumber;
  }

  get address(): string {
    const address = this.wallet.address;
    if (address !== undefined) {
      return address;
    } else {
      throw new Error('Address not set');
    }
  }
}
