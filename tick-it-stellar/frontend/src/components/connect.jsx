import axios from "axios";
import { useNavigate } from "react-router-dom";

const backend = import.meta.env.VITE_PUBLIC_BACKEND_URL;

const NavbarConnect = () => {
    const navigate = useNavigate();
    const address = localStorage.getItem("address");

    const handleClick = async () => {
        if (!address) {
            navigate("/login");
            return;
        }

        try {
            // check user
            const userRes = await axios.get(`${backend}/api/user/${address}`);
            const user = userRes.data.data;

            localStorage.setItem("address", user.walletAddress);
            localStorage.setItem("email", user.email);
            localStorage.setItem("verified", String(user.isVerified));

            // login for token
            const loginRes = await axios.post(`${backend}/api/wallet/login`, {
                address,
            });

            localStorage.setItem("token", loginRes.data.data.token);

            navigate("/dashboard");
        } catch (e) {
            navigate("/login");
        }
    };

    const connected = Boolean(address);

    return (
        <button
            onClick={handleClick}
            disabled={connected}
            className={`
                px-4 py-2 rounded-md text-sm font-semibold transition
                ${connected
                ? "bg-blue-900 text-blue-200 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"}
            `}
        >
            {connected ? "Connected" : "Connect"}
        </button>
    );
};

export default NavbarConnect;
