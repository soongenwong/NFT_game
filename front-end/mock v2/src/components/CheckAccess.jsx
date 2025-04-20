import React, { useEffect, useState } from "react";
import '../styles.css';  // Go up one level and import styles.css

export default function CheckAccess({ rentedNfts }) {
  const ACCESS_DURATION_MS = 5 * 60 * 1000; // 5 minutes
  const [now, setNow] = useState(Date.now());

  // Update the "now" time every second to refresh countdowns
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval); // cleanup when unmounted
  }, []);

  const getTimeRemaining = (rentedAt) => {
    const expiresAt = rentedAt + ACCESS_DURATION_MS;
    const timeLeft = Math.max(0, expiresAt - now);
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    return timeLeft > 0 ? `${minutes}m ${seconds}s` : "Expired";
  };

  return (
    <div className="check-access-section">
      <h2>Your NFT Access:</h2>
      {rentedNfts.length > 0 ? (
        <div className="rented-nfts-list">
          {rentedNfts.map(({ id, rentedAt }) => (
            <div className="rented-nft-card" key={id}>
              <h4>NFT: {id}</h4>
              <p>
                Time remaining: <strong>{getTimeRemaining(rentedAt)}</strong>
              </p>
              <div className={getTimeRemaining(rentedAt) === "Expired" ? "expired" : "active"}>
                {getTimeRemaining(rentedAt) === "Expired" ? "Expired" : "Active"}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No access yet. Rent an NFT to play a game.</p>
      )}
    </div>
  );
}
