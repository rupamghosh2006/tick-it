import { useEffect, useState } from "react";

interface Event {
  _id: string;
  eventName: string;
  eventDescription: string;
  mode: string;
  ticketPrice: number;
  imageUrl: string;
  maxSeats: number;
  soldSeats: number;
  createdAt: string;
}

const API_URL = "https://tick-it-nq29.onrender.com/api/events";

const App = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Failed to fetch events");

        const json = await res.json();
        console.log("API response:", json);

        // ✅ CORRECT ACCESS
        if (Array.isArray(json.data)) {
          setEvents(json.data);
        } else {
          setEvents([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <div className="p-6">Loading events...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
  <div className="page">
    <h1 className="page-title">🎟️ All Events</h1>

    <div className="event-grid">
      {events.map((event) => (
        <div className="event-card" key={event._id}>
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

            <p className="event-price">₹ {event.ticketPrice}</p>

            <button className="event-btn">View Details</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);
};

export default App;
