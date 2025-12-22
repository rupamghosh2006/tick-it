import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const backend = import.meta.env.VITE_PUBLIC_BACKEND_URL;

const Address = ({ onSuccess }) => {
    const { connect, account, connected } = useWallet();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const connectFlow = async () => {
        if (!connected) {
            try {
                await connect("Petra");
            } catch {
                window.open("https://petra.app", "_blank");
                throw new Error("Connect failed");
            }
        }

        let addr = account?.address?.toString();

        if (!addr && window.aptos?.account) {
            const acc = await window.aptos.account();
            addr = acc?.address;
        }

        if (!addr) throw new Error("No address");

        // check existence
        const userRes = await axios.get(`${backend}/api/user/${addr}`);
        if (userRes.data?.success) {
            const u = userRes.data.data;
            localStorage.setItem("address", u.walletAddress);
            localStorage.setItem("email", u.email);
            localStorage.setItem("verified", String(u.isVerified));
        }

        // login for token
        const loginRes = await axios.post(`${backend}/api/wallet/login`, {
            address: addr,
        });

        localStorage.setItem("token", loginRes.data.data.token);

        onSuccess(addr);
        navigate("/dashboard");
    };

    const handleConnect = async () => {
        setLoading(true);
        try {
            await connectFlow();
            toast.success("Wallet connected");
        } catch (e) {
            try {
                // retry once
                await connectFlow();
                toast.success("Wallet connected");
            } catch (e2) {
                console.error(e2);
                toast.error("Wallet connection failed");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleConnect}
            disabled={loading}
            aria-busy={loading}
            className="relative text-4xl font-semibold text-white pb-2 hover:scale-105 transition disabled:opacity-60"
        >
            Connect to Aptos
            {loading && (
                <span className="absolute left-0 bottom-0 h-[2px] w-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 bg-[length:200%_100%] animate-[gradient-move_1.5s_linear_infinite]" />
            )}
        </button>
    );
};

export default Address;
