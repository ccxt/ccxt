// GlobalNotification Account Notifications
export default interface GlobalNotification {
  body: string;
  closable: boolean;
  date: Date;
  id: number;
  persist: boolean;
  sound: string;
  title: string;
  ttl: number;
  type: string;
  waitForVisibility: boolean;
}
