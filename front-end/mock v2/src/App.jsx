import { useState } from "react";
import WalletConnect from "./components/WalletConnect";
import RentNft from "./components/RentNft";
import CheckAccess from "./components/CheckAccess";
import './styles.css';

export default function App() {
  const [account, setAccount] = useState(null);
  const [rentedNfts, setRentedNfts] = useState([]);

  const availableNfts = [
    { id: "nft1", name: "NFT 1", game: "Game 1" },
    { id: "nft2", name: "NFT 2", game: "Game 2" },
    { id: "nft3", name: "NFT 3", game: "Game 3" },
  ];

  const rentNftHandler = (nftId) => {
    const alreadyRented = rentedNfts.some((nft) => nft.id === nftId);
    if (!alreadyRented) {
      const now = Date.now();
      setRentedNfts((prev) => [...prev, { id: nftId, rentedAt: now }]);
    }
  };

  return (
    <div className="app-container">
      <h1 className="app-title">🎮 NFT Game Rental Hub</h1>

      {!account ? (
        <div className="wallet-section">
          <WalletConnect onAccountSelected={setAccount} />
        </div>
      ) : (
        <div className="main-content">
          <p className="wallet-info">Wallet connected: {account}</p>

          <section className="nft-section">
            <h2>Available NFTs to Rent</h2>
            <div className="nft-grid">
              {availableNfts.map((nft) => (
                <div className="nft-card" key={nft.id}>
                  <p><strong>{nft.name}</strong></p>
                  <p>Game: {nft.game}</p>
                  <button onClick={() => rentNftHandler(nft.id)} className="rent-button">
                    Rent Now
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="nft-section">
            <h2>Your Current NFT Wallet</h2>
            {rentedNfts.length > 0 ? (
              <ul className="rented-list">
                {rentedNfts.map(({ id }) => {
                  const nft = availableNfts.find((nft) => nft.id === id);
                  return (
                    <li key={id}>
                      ✅ {nft.name} - {nft.game}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>No NFTs rented yet.</p>
            )}
          </section>

          <section className="nft-section">
            <CheckAccess rentedNfts={rentedNfts} account={account} />
          </section>
        </div>
      )}
    </div>
  );
}
