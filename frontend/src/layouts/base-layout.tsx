import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import {Outlet} from "react-router";
import {Toaster} from "sonner";

export default function App() {
    return (
        <AptosWalletAdapterProvider autoConnect={false}>
            <Toaster />
            <Outlet />
        </AptosWalletAdapterProvider>
    );
}
