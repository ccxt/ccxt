import UserPreferences from "./user_preferences";

// User Account Operations
export default interface User {
  TFAEnabled: string;
  affiliateID: string;
  country: string;
  created: Date;
  email: string;
  firstname: string;
  geoipCountry: string;
  geoipRegion: string;
  id: number;
  lastUpdated: Date;
  lastname: string;
  ownerId: number;
  pgpPubKey: string;
  phone: string;
  restrictedEngineFields: Object;
  typ: string;
  username: string;

  preferences: UserPreferences;
}
