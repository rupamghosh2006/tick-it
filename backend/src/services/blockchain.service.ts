import { aptos } from "../config/aptosClient.js";
import { Account, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";

/** CHECK IF TicketStore resource exists */
export const accountResourceExists = async (address: string) => {
  try {
    await aptos.getAccountResource({
      accountAddress: address,
      resourceType:
        "0x3ac8fb61e5cf94b535fe02152ddcaf2bffbdd2974a3f2cf01782048638985db5::ticket::TicketStore",
    });

    return true;
  } catch (err) {
    return false;
  }
};

/** INITIALIZE TicketStore */
export const initTicketStore = async (privateKey: string) => {
  console.log("🔧 Initializing TicketStore...");

  const privKey = new Ed25519PrivateKey(privateKey);
  const account = Account.fromPrivateKey({ privateKey: privKey });

  const exists = await accountResourceExists(account.accountAddress.toString());
  if (exists) {
    console.log("ℹ Resource already initialized");
    return "exists";
  }

  const tx = await aptos.transaction.build.simple({
    sender: account.accountAddress,
    data: {
      function:
        "0x3ac8fb61e5cf94b535fe02152ddcaf2bffbdd2974a3f2cf01782048638985db5::ticket::init_store",
      functionArguments: [],
    },
  });

  const committed = await aptos.signAndSubmitTransaction({
    signer: account,
    transaction: tx,
  });

  await aptos.waitForTransaction({ transactionHash: committed.hash });

  console.log("🎉 TicketStore initialized:", committed.hash);
  return committed.hash;
};

/** BUY TICKET */
export const buyTicketOnChain = async ({
  privateKey,
  eventId,
  price,
  host,
}: {
  privateKey: string;
  eventId: number;
  price: number;
  host: string;
}) => {
  console.log("🚀 Starting on-chain transaction...");

  const privKey = new Ed25519PrivateKey(privateKey);
  const account = Account.fromPrivateKey({ privateKey: privKey });

  // Make sure TicketStore exists
  await initTicketStore(privateKey);

  const tx = await aptos.transaction.build.simple({
    sender: account.accountAddress,
    data: {
      function:
        "0x3ac8fb61e5cf94b535fe02152ddcaf2bffbdd2974a3f2cf01782048638985db5::ticket::buy_ticket_with_payment",
      functionArguments: [BigInt(eventId), BigInt(price), host],
    },
  });

  const committed = await aptos.signAndSubmitTransaction({
    signer: account,
    transaction: tx,
  });

  await aptos.waitForTransaction({ transactionHash: committed.hash });

  console.log("🎉 Successfully purchased ticket:", committed.hash);

  return committed.hash;
};
