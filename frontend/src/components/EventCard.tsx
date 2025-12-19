import type { Event } from "../types/Event";

interface Props {
  event: Event;
  walletConnected: boolean;
  isTestnet: boolean;
}

const EventCard = ({ event, walletConnected, isTestnet }: Props) => {
  return (
    <div className="event-card">
      <img
        src={event.imageUrl}
        alt={event.eventName}
        className="event-image"
      />

      <div className="event-content">
        <h2 className="event-title">{event.eventName}</h2>
        <p className="event-desc">{event.eventDescription}</p>

        <p className="event-meta">🌐 {event.mode}</p>
        <p className="event-meta">
          🎫 Seats: {event.soldSeats}/{event.maxSeats}
        </p>

        <p className="event-price">{event.ticketPrice} APT</p>

        <button
          className="event-btn"
          disabled={!walletConnected || !isTestnet}
          title={
            walletConnected
              ? "View event"
              : "Connect wallet to continue"
          }
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default EventCard;
