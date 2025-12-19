import { useWallet } from "@aptos-labs/wallet-adapter-react";

const WalletBar = () => {
  const { connect, connected, account, network } = useWallet();

  const isTestnet = network?.name === "testnet";

  return (
    <div className="wallet-bar">
      {connected && account ? (
        <span className="wallet-connected">
          🟣 {account.address.toString().slice(0, 6)}...
          {account.address.toString().slice(-4)}
        </span>
      ) : (
        <button className="wallet-btn" onClick={() => connect("Petra")}>
          Connect Wallet
        </button>
      )}

      {connected && !isTestnet && (
        <p className="wallet-error">
          Please switch wallet to <b>Testnet</b>
        </p>
      )}
    </div>
  );
};

export default WalletBar;
