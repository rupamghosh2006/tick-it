import { useEffect, useState } from "react";
import WalletBar from "./components/WalletBar";
import EventGrid from "./components/EventGrid";
import type { Event } from "./types/Event";

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
        setEvents(Array.isArray(json.data) ? json.data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <div className="page">Loading events…</div>;
  if (error) return <div className="page error">{error}</div>;

  return (
    <div className="page">
      <WalletBar />
      <h1 className="page-title">🎟️ All Events</h1>
      <EventGrid events={events} />
    </div>
  );
};

export default App;
