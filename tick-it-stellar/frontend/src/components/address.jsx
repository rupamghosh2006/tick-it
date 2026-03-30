import { useWallet } from "../contexts/wallet-context";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const backend = import.meta.env.VITE_PUBLIC_BACKEND_URL;

const Address = ({ onSuccess }) => {
    const { connect, walletAddress, isConnected, isConnecting } = useWallet();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleConnect = async () => {
        setLoading(true);
        try {
            const result = await connect();
            toast.success("Wallet connected");
            
            const addr = walletAddress || result?.publicKey;
            if (addr) {
                localStorage.setItem("address", addr);
                
                const userRes = await axios.get(`${backend}/api/user/${addr}`);
                if (userRes.data?.success) {
                    const u = userRes.data.data;
                    localStorage.setItem("email", u.email || "");
                    localStorage.setItem("verified", String(u.isVerified || false));
                }
            }
            
            if (onSuccess) {
                onSuccess(addr);
            }
            navigate("/dashboard");
        } catch (e) {
            console.error(e);
            toast.error("Wallet connection failed. Please install Freighter wallet extension.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleConnect}
            disabled={loading || isConnecting}
            aria-busy={loading || isConnecting}
            className="relative text-4xl font-semibold text-white pb-2 hover:scale-105 transition disabled:opacity-60"
        >
            Connect to Stellar
            {loading && (
                <span className="absolute left-0 bottom-0 h-[2px] w-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 bg-[length:200%_100%] animate-[gradient-move_1.5s_linear_infinite]" />
            )}
        </button>
    );
};

export default Address;
