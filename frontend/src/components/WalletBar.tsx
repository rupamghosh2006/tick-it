import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { loginWithWallet } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

const WalletBar = () => {
  const {
    connect,
    disconnect,
    connected,
    account,
    network,
    wallets,
  } = useWallet();

  const { token, login, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isTestnet = network?.name === "testnet";

  const petraWallet = wallets.find(
    (w) => w.name.toLowerCase().includes("petra")
  );

  // Backend login
  useEffect(() => {
    if (!connected || !account?.address || token) return;

    (async () => {
      try {
        setLoading(true);
        const res = await loginWithWallet(account.address.toString());
        login(res.token, res.address);
      } catch (err) {
        setError("Wallet login failed");
      } finally {
        setLoading(false);
      }
    })();
  }, [connected, account?.address, token, login]);

  return (
    <div className="wallet-bar">
      {!connected ? (
        <button
          className="wallet-btn"
          onClick={() => petraWallet && connect(petraWallet.name)}
        >
          Connect Wallet
        </button>
      ) : (
        <>
          <span className="wallet-connected">
            🟣 {account?.address.toString().slice(0, 6)}...
            {account?.address.toString().slice(-4)}
          </span>

          <button
            className="wallet-btn"
            onClick={() => {
              disconnect();
              logout(); // clear JWT
            }}
          >
            Disconnect
          </button>
        </>
      )}

      {connected && !isTestnet && (
        <p className="wallet-error">
          Switch wallet to <b>Testnet</b>
        </p>
      )}

      {loading && <p>Authenticating wallet…</p>}
      {error && <p className="wallet-error">{error}</p>}
    </div>
  );
};

export default WalletBar;
