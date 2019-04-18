// UserEvent User Events for auditing
export default interface UserEvent {
  created: Date;
  createdById: number;
  eventMeta: Object;
  eventStatus: string;
  eventType: string;
  geoipCountry: string;
  geoipSubRegion: string;
  id: number;
  ip: string;
  status: string;
  type: string;
  userId: number;
}
