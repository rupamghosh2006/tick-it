import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../contexts/wallet-context";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_PUBLIC_BACKEND_URL;

export default function FollowUpForm() {
    const navigate = useNavigate();
    const { connect, walletAddress, isConnected } = useWallet();

    const [step, setStep] = useState("wallet");
    const [address, setAddress] = useState(null);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    const onWalletSuccess = async () => {
        try {
            const result = await connect();
            const addr = walletAddress || result?.publicKey;
            if (addr) {
                setAddress(addr);
                setStep("email");
            }
        } catch (error) {
            console.error("Wallet connection failed:", error);
        }
    };

    const post = async (url, body) => {
        const res = await fetch(`${BACKEND_URL}${url}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Request failed");
        return res.json();
    };

    const submitEmail = async () => {
        if (!address || !email) return;
        setLoading(true);
        try {
            await post("/api/verify", { address, email });
            setStep("name");
        } catch (error) {
            console.error("Email verification failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const submitName = async () => {
        if (!address || !name) return;
        setLoading(true);
        try {
            await post("/api/profile", {address, name});
            navigate("/dashboard");
        } catch (error) {
            console.error("Profile update failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-24 space-y-6">
            {step === "wallet" && (
                <button
                    onClick={onWalletSuccess}
                    className="w-full py-3 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                    Connect Stellar Wallet
                </button>
            )}

            {step === "email" && (
                <div className="space-y-3">
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full px-4 py-2 rounded bg-neutral-900 border border-neutral-700 text-white"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button
                        disabled={loading}
                        onClick={submitEmail}
                        className="w-full py-2 rounded bg-white text-black font-semibold"
                    >
                        Continue
                    </button>
                </div>
            )}

            {step === "name" && (
                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="Full name"
                        className="w-full px-4 py-2 rounded bg-neutral-900 border border-neutral-700 text-white"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <button
                        disabled={loading}
                        onClick={submitName}
                        className="w-full py-2 rounded bg-white text-black font-semibold"
                    >
                        Finish
                    </button>
                </div>
            )}
        </div>
    );
}
