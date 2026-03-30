import { WalletProvider } from "../contexts/wallet-context";
import { Outlet } from "react-router";
import { Toaster } from "sonner";

export default function App() {
    return (
        <WalletProvider>
            <Toaster />
            <Outlet />
        </WalletProvider>
    );
}
