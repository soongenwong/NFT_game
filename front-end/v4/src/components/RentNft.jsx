import React from "react";

export default function RentNft({ availableNfts, onRent }) {
  const handleRentClick = (nftId) => {
    if (onRent) {
      onRent(nftId);
    }
  };

  return (
    <div>
      <h3>Rent an NFT:</h3>
      {availableNfts && availableNfts.length > 0 ? (
        <div>
          {availableNfts.map((nftId) => (
            <div key={nftId} style={{ marginBottom: "10px" }}>
              <p>NFT ID: {nftId}</p>
              <button onClick={() => handleRentClick(nftId)}>Rent NFT {nftId}</button>
            </div>
          ))}
        </div>
      ) : (
        <p>No NFTs available for rent at the moment.</p>
      )}
    </div>
  );
}
