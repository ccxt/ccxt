// AccessToken access token
export default interface AccessToken {
  created: Date;
  id: string;
  ttl: number;
  userId: number;
}
