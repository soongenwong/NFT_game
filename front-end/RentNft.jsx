import React from "react";

export default function RentNft({ availableNfts, onRent }) {
  return (
    <div>
      <h3>Rent an NFT:</h3>
      {availableNfts.map((nft) => (
        <div key={nft.id}>
          <p>{nft.name} - {nft.game}</p>
          <button onClick={() => onRent(nft.id)}>
            Rent {nft.name}
          </button>
        </div>
      ))}
    </div>
  );
}
