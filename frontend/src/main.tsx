import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./ErrorBoundary";

ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
).render(
  <React.StrictMode>
    <AptosWalletAdapterProvider autoConnect>
      <AuthProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </AuthProvider>
    </AptosWalletAdapterProvider>
  </React.StrictMode>
);
