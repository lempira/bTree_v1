import "./polyfills";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { WalletProvider, useInitializeProviders, PROVIDER_ID } from "@txnlab/use-wallet";
import { PeraWalletConnect } from "@perawallet/connect";
import { router } from "./router";
import "./index.css";

const networkEnv = (import.meta.env.VITE_NETWORK as string | undefined)?.toUpperCase() ?? "TESTNET";
const isLocalNet = networkEnv === "LOCALNET";
const providerNetwork = networkEnv === "MAINNET" ? "MainNet" : "TestNet";
const nodeServer = isLocalNet
  ? "http://localhost"
  : providerNetwork === "MainNet"
    ? "https://mainnet-api.algonode.cloud"
    : "https://testnet-api.algonode.cloud";

function WalletApp(): JSX.Element {
  const providers = useInitializeProviders({
    providers: isLocalNet
      ? [
          {
            id: PROVIDER_ID.KMD,
            clientOptions: {
              wallet: "unencrypted-default-wallet",
              password: "",
              host: "http://localhost",
              port: 4002,
              token: "a".repeat(64),
            },
          },
        ]
      : [
          { id: PROVIDER_ID.PERA, clientStatic: PeraWalletConnect },
        ],
    nodeConfig: {
      network: isLocalNet ? "SandNet" : providerNetwork,
      nodeServer,
      nodePort: isLocalNet ? 4001 : 443,
      nodeToken: isLocalNet ? "a".repeat(64) : "",
    },
  });

  return (
    <WalletProvider value={providers}>
      <RouterProvider router={router} />
    </WalletProvider>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Missing <div id=\"root\"> in index.html");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <WalletApp />
  </React.StrictMode>
);
