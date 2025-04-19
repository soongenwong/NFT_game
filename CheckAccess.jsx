import React, { useEffect, useState } from "react";

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
    <div>
      <h3>Your NFT Access:</h3>
      {rentedNfts.length > 0 ? (
        <ul>
          {rentedNfts.map(({ id, rentedAt }) => (
            <li key={id}>
              NFT: {id} — Time remaining: {getTimeRemaining(rentedAt)}
            </li>
          ))}
        </ul>
      ) : (
        <p>No access yet. Rent an NFT to play a game.</p>
      )}
    </div>
  );
}
