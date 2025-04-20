import { useEffect, useState } from "react";

export default function WalletConnect({ onAccountSelected }) {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (!window.ethereum) {
        console.warn("MetaMask not found");
        return;
      }

      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          updateAccount(accounts[0]);
        }
      } catch (error) {
        console.error("Error checking wallet:", error);
      }
    };

    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        updateAccount(accounts[0]);
      } else {
        setAccount(null);
        if (onAccountSelected) onAccountSelected(null);
      }
    };

    const updateAccount = (acc) => {
      setAccount(acc);
      if (onAccountSelected) onAccountSelected(acc);
    };

    checkWalletConnection();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      }
    };
  }, [onAccountSelected]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not found! Please install it.");
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        if (onAccountSelected) onAccountSelected(accounts[0]);
      }
    } catch (error) {
      console.error("User denied wallet connection", error);
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
