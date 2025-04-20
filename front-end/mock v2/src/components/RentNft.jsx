import React from "react";
import '../styles.css';  // Go up one level and import styles.css

export default function RentNft({ availableNfts, onRent }) {
  return (
    <div className="nft-section">
      <h2>Rent an NFT</h2>
      <div className="nft-grid">
        {availableNfts.map((nft) => (
          <div className="nft-card" key={nft.id}>
            <p><strong>{nft.name}</strong></p>
            <p>Game: {nft.game}</p>
            <button className="rent-button" onClick={() => onRent(nft.id)}>
              Rent {nft.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
