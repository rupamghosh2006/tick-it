import WalletBar from "./components/WalletBar";
import EventGrid from "./components/EventGrid";
import { useEffect, useState } from "react";
import type { Event } from "./types/Event";

const API_URL = "https://tick-it-nq29.onrender.com/api/events";

const App = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((json) => setEvents(json.data || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page">Loading…</div>;

  return (
    <div className="page">
      <WalletBar />
      <h1 className="page-title">🎟️ All Events</h1>
      <EventGrid events={events} />
    </div>
  );
};

export default App;
