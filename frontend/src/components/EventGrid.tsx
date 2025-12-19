import type { Event } from "../types/Event";
import EventCard from "./EventCard";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

interface Props {
  events: Event[];
}

const EventGrid = ({ events }: Props) => {
  const { connected, network } = useWallet();
  const isTestnet = network?.name === "testnet";

  return (
    <div className="event-grid">
      {events.map((event) => (
        <EventCard
          key={event._id}
          event={event}
          walletConnected={connected}
          isTestnet={isTestnet}
        />
      ))}
    </div>
  );
};

export default EventGrid;
