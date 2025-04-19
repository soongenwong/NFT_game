import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

// Hardcode the ABI and Contract Address
const contractAddress = "0x3d0de6f85806104ddf6c6ba1810fe2a9acce360d";
const abi = [
	{
		"inputs": [],
		"name": "endRental",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "nftId",
				"type": "uint256"
			}
		],
		"name": "rentNft",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "nftId",
				"type": "uint256"
			}
		],
		"name": "store",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "availableNfts",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isRented",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "checkAccess",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAvailableNfts",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getUserNfts",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getUserStartTime",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "rentalDuration",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "rentals",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "nftId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "startTime",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "active",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

export default function CheckAccess({ rentedNfts, account }) {
  const [accessTimes, setAccessTimes] = useState({}); // Track remaining access times for each NFT
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize contract and check access
    const checkAccess = async () => {
      if (window.ethereum && rentedNfts.length > 0) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const contract = new ethers.Contract(contractAddress, abi, signer);

          // For each rented NFT, check the access time
          const times = {};
          for (let nft of rentedNfts) {
            const accessTime = await contract.checkAccess(nft.id);
            times[nft.id] = accessTime.toNumber(); // Assuming accessTime is a BigNumber
          }

          setAccessTimes(times);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching access times:", error);
          setLoading(false);
        }
      }
    };

    checkAccess();
  }, [rentedNfts, account]);

  const getTimeRemaining = (accessTime) => {
    if (!accessTime) return "Expired";
    const timeLeft = Math.max(0, accessTime - Date.now());
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    return timeLeft > 0 ? `${minutes}m ${seconds}s` : "Expired";
  };

  return (
    <div>
      <h3>Your NFT Access:</h3>
      {loading ? (
        <p>Loading access times...</p>
      ) : rentedNfts.length > 0 ? (
        <ul>
          {rentedNfts.map((nft) => (
            <li key={nft.id}>
              NFT: {nft.name} — Time remaining: {getTimeRemaining(accessTimes[nft.id])}
            </li>
          ))}
        </ul>
      ) : (
        <p>No access yet. Rent an NFT to play a game.</p>
      )}
    </div>
  );
}
