import { horizonServer, fromString, toString, CONTRACT_ID, NETWORK_PASSPHRASE } from "../config/stellarClient.js";
import { Keypair, TransactionBuilder, Operation, Asset, Account } from '@stellar/stellar-sdk';

export const hasTicketForEvent = async (owner: string, eventId: string, host: string): Promise<boolean> => {
  try {
    const account = await horizonServer.loadAccount(owner);
    const key = `ticket_${host}_${eventId}_${owner}`;
    const subEntry = account.data().get(key);
    return !!subEntry;
  } catch {
    return false;
  }
};

export const initTicketStore = async (host: string): Promise<string> => {
  console.log("Initializing ticket store for host:", host);
  return host;
};

export const buyTicketOnChain = async ({
  buyerKeypair,
  eventId,
  price,
  host,
}: {
  buyerKeypair: Keypair;
  eventId: string;
  price: number;
  host: string;
}): Promise<{ hash: string; ticketId: number }> => {
  console.log("Starting on-chain ticket purchase...");

  const priceInStroops = Math.round(price * 10000000);

  const buyerAccount = await horizonServer.loadAccount(buyerKeypair.publicKey());

  const ticketId = Date.now();

  const transaction = new TransactionBuilder(buyerAccount, {
    fee: '100',
    networkPassphrase: NETWORK_PASSPHRASE,
    timebounds: await horizonServer.fetchTimebounds(300),
  })
    .addOperation(
      Operation.payment({
        destination: host,
        asset: Asset.native(),
        amount: priceInStroops.toString(),
      })
    )
    .addOperation(
      Operation.manageData({
        name: `ticket_${host}_${eventId}_${buyerKeypair.publicKey()}`,
        value: ticketId.toString(),
      })
    )
    .setTimeout(300)
    .build();

  transaction.sign(buyerKeypair);

  const result = await horizonServer.submitTransaction(transaction);

  console.log("Ticket purchased successfully:", result.hash);
  return { hash: result.hash, ticketId };
};

export const getTicketCount = async (owner: string): Promise<number> => {
  try {
    const account = await horizonServer.loadAccount(owner);
    let count = 0;
    
    for (const [key] of account.data()) {
      if (key.startsWith('ticket_')) {
        count++;
      }
    }
    
    return count;
  } catch {
    return 0;
  }
};

export const getTicketsForOwner = async (owner: string): Promise<Array<{ eventId: string; host: string; ticketId: string }>> => {
  try {
    const account = await horizonServer.loadAccount(owner);
    const tickets: Array<{ eventId: string; host: string; ticketId: string }> = [];
    
    for (const [key, value] of account.data()) {
      if (key.startsWith('ticket_')) {
        const parts = key.replace('ticket_', '').split('_');
        if (parts.length >= 3) {
          tickets.push({
            host: parts[0],
            eventId: parts[1],
            ticketId: value.value(),
          });
        }
      }
    }
    
    return tickets;
  } catch {
    return [];
  }
};
