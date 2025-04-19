import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

// Contract config
const contractAddress = "0xAE651Add31054570455D2D41F4295D5B6447dbfa";
const abi = [
  {
    "inputs": [],
    "name": "endRental",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "nftId", "type": "uint256" }],
    "name": "rentNft",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "nftId", "type": "uint256" }],
    "name": "store",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "availableNfts",
    "outputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "bool", "name": "isRented", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "checkAccess",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAvailableNfts",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getUserNfts",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getUserStartTime",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "rentalDuration",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "rentals",
    "outputs": [
      { "internalType": "uint256", "name": "nftId", "type": "uint256" },
      { "internalType": "uint256", "name": "startTime", "type": "uint256" },
      { "internalType": "bool", "name": "active", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export default function CheckAccess({ rentedNfts, account }) {
  const [accessTimes, setAccessTimes] = useState({});
  const [countdowns, setCountdowns] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval;

    const checkAccess = async () => {
      if (window.ethereum && rentedNfts.length > 0) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const contract = new ethers.Contract(contractAddress, abi, signer);

          const times = {};
          for (let nft of rentedNfts) {
            const accessTime = await contract.checkAccess(nft.id || nft);
            times[nft.id || nft] = accessTime.toNumber(); // seconds
          }

          setAccessTimes(times);

          // Start live countdowns
          interval = setInterval(() => {
            const updatedCountdowns = {};
            Object.keys(times).forEach((id) => {
              const accessTimeMs = times[id] * 1000;
              const timeLeft = accessTimeMs - Date.now();
              updatedCountdowns[id] = timeLeft > 0 ? timeLeft : 0;
            });
            setCountdowns(updatedCountdowns);
          }, 1000);
        } catch (error) {
          console.error("Error fetching access times:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkAccess();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [rentedNfts, account]);

  const formatTime = (ms) => {
    if (!ms || ms <= 0) return "Expired";
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div>
      <h3>Your NFT Access:</h3>
      {loading ? (
        <p>Loading access times...</p>
      ) : rentedNfts.length > 0 ? (
        <ul>
          {rentedNfts.map((nft) => {
            const id = nft.id || nft;
            const name = nft.name || `NFT ${id}`;
            const timeDisplay = formatTime(countdowns[id]);

            return (
              <li key={id}>
                {name} — Time remaining: <strong>{timeDisplay}</strong>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No access yet. Rent an NFT to play a game.</p>
      )}
    </div>
  );
}
