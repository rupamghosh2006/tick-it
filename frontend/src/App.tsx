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
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">🎟️ All Events</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            key={event._id}
            className="bg-white rounded-xl shadow p-5 hover:shadow-lg transition"
          >
            <img
              src={event.imageUrl}
              alt={event.eventName}
              className="h-40 w-full object-cover rounded-lg mb-3"
            />

            <h2 className="text-xl font-semibold mb-2">
              {event.eventName}
            </h2>

            <p className="text-gray-600 text-sm mb-2">
              {event.eventDescription}
            </p>

            <p className="text-sm">🌐 {event.mode}</p>
            <p className="text-sm">
              🎫 Seats: {event.soldSeats}/{event.maxSeats}
            </p>

            <p className="font-semibold mt-2">
              {event.ticketPrice} APT
            </p>

            <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
