// APIKey Persistent API Keys for Developers
export default interface APIKey {
  cidr: string;
  created: Date;
  enabled: boolean;
  id: string;
  name: string;
  nonce: number;
  permissions: Object[];
  secret: string;
  userId: number;
}
