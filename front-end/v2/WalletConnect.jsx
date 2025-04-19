import { useEffect, useState } from "react";

export default function WalletConnect({ onAccountSelected }) {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const checkWallet = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            if (onAccountSelected) onAccountSelected(accounts[0]); // Pass the account back to parent if necessary
          }
        } catch (error) {
          console.error("Error checking wallet:", error);
        }
      }
    };

    checkWallet();

    // Listen for wallet/account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0]);
        if (onAccountSelected) onAccountSelected(accounts[0]);
      });
    }
  }, [onAccountSelected]);

  // Function to connect wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
        if (onAccountSelected) onAccountSelected(accounts[0]);
      } catch (error) {
        console.error("User denied wallet connection");
      }
    } else {
      alert("MetaMask not found! Please install it.");
    }
  };

  return (
    <div className="wallet-box">
      <h3>Connect Wallet</h3>
      {account ? (
        <p>✅ Connected: {account.slice(0, 6)}...{account.slice(-4)}</p>
      ) : (
        <button onClick={connectWallet}>Connect MetaMask</button>
      )}
    </div>
  );
}
