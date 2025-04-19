import { useState } from "react";
import WalletConnect from "./components/WalletConnect"; // Assuming you have this component
import RentNft from "./components/RentNft"; // Component to rent NFTs
import CheckAccess from "./components/CheckAccess"; // Optional: Component to show user's rented NFTs

export default function App() {
  const [account, setAccount] = useState(null); // Track wallet address
  const [rentedNfts, setRentedNfts] = useState([]); // Track rented NFTs

  // Mock list of available NFTs to rent
  const availableNfts = [
    { id: "nft1", name: "NFT 1", game: "Game 1" },
    { id: "nft2", name: "NFT 2", game: "Game 2" },
    { id: "nft3", name: "NFT 3", game: "Game 3" },
  ];

  // Handle renting an NFT
  const rentNftHandler = (nftId) => {
    const alreadyRented = rentedNfts.some((nft) => nft.id === nftId);
    if (!alreadyRented) {
      const now = Date.now(); // current timestamp
      setRentedNfts((prev) => [...prev, { id: nftId, rentedAt: now }]);
    }
  };  

  return (
    <div>
      {!account && <WalletConnect onAccountSelected={setAccount} />} {/* Connect wallet */}
      {account && (
        <div>
          <p>Wallet connected: {account}</p>

          {/* Display the available NFTs to rent */}
          <div>
            <h3>Available NFTs to Rent:</h3>
            {availableNfts.map((nft) => (
              <div key={nft.id}>
                <p>{nft.name} - {nft.game}</p>
                <button onClick={() => rentNftHandler(nft.id)}>
                  Rent {nft.name}
                </button>
              </div>
            ))}
          </div>

          {/* Display the user's rented NFTs */}
          <div>
            <h3>Your Current NFT Wallet:</h3>
            {rentedNfts.length > 0 ? (
              <ul>
              {rentedNfts.map(({ id, rentedAt }) => {
                const nft = availableNfts.find((nft) => nft.id === id);
                return (
                  <li key={id}>
                    {nft.name} - {nft.game}
                  </li>
                );
              })}
            </ul>
            ) : (
              <p>No NFTs rented yet.</p>
            )}
          </div>

          {/* Optional: Check NFT access */}
          <CheckAccess rentedNfts={rentedNfts} />
        </div>
      )}
    </div>
  );
}
