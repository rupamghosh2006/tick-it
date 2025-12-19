export interface Event {
  _id: string;
  eventName: string;
  eventDescription: string;
  mode: string;
  ticketPrice: number;
  imageUrl: string;
  maxSeats: number;
  soldSeats: number;
}
