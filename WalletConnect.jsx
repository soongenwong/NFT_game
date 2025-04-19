import { useEffect, useState } from "react";
import { web3Enable, web3Accounts } from "@polkadot/extension-dapp";

export default function WalletConnect({ onAccountSelected }) {
  const [accounts, setAccounts] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function connectWallet() {
      const extensions = await web3Enable("NFT Rental Game");
      if (extensions.length === 0) {
        alert("Polkadot extension not found or not allowed!");
        return;
      }

      const accs = await web3Accounts();
      setAccounts(accs);
    }

    connectWallet();
  }, []);

  const handleSelect = (account) => {
    setSelected(account.address);
    onAccountSelected(account.address);
  };

  return (
    <div className="wallet-box">
      <h3>Connect Wallet</h3>
      {accounts.length > 0 ? (
        accounts.map((acc) => (
          <button key={acc.address} onClick={() => handleSelect(acc)}>
            {acc.meta.name || "Unnamed"} — {acc.address.slice(0, 6)}...
          </button>
        ))
      ) : (
        <p>Looking for wallet…</p>
      )}
      {selected && <p>✅ Connected: {selected}</p>}
    </div>
  );
}
