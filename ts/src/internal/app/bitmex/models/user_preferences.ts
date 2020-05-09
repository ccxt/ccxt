// UserPreferences user preferences
export default interface UserPreferences {
  alertOnLiquidations: boolean;
  animationsEnabled: boolean;
  announcementsLastSeen: Date;
  chatChannelID: number;
  colorTheme: string;
  currency: string;
  debug: boolean;
  disableEmails: string[];
  disablePush: string[];
  hideConfirmDialogs: string[];
  hideConnectionModal: boolean;
  hideFromLeaderboard: boolean;
  hideNameFromLeaderboard: boolean;
  hideNotifications: string[];
  locale: string;
  msgsSeen: string[];
  orderBookBinning: Object;
  orderBookType: string;
  orderClearImmediate: boolean;
  orderControlsPlusMinus: boolean;
  showLocaleNumbers: boolean;
  sounds: string[];
  strictIPCheck: boolean;
  strictTimeout: boolean;
  tickerGroup: string;
  tickerPinned: boolean;
  tradeLayout: string;
}
