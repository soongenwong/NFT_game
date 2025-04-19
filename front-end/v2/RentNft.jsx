import React, { useEffect, useState } from "react";
import Web3 from "web3";

// Contract ABI and Address
const CONTRACT_ADDRESS = "0x3d0de6f85806104ddf6c6ba1810fe2a9acce360d";
const CONTRACT_ABI = [
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

export default function RentNft({ onRent }) {
  const [web3, setWeb3] = useState(null); // Web3 instance
  const [contract, setContract] = useState(null); // Contract instance
  const [availableNfts, setAvailableNfts] = useState([]); // Available NFTs

  useEffect(() => {
    const initWeb3 = async () => {
      // Initialize web3 with the provider (MetaMask)
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        // Set up contract instance
        const contractInstance = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
        setContract(contractInstance);

        // Fetch available NFTs
        const available = await contractInstance.methods.getAvailableNfts().call();
        setAvailableNfts(available); // Assuming available NFTs are returned as an array
      } else {
        console.error("Ethereum wallet is not available");
      }
    };

    initWeb3();
  }, []);

  // Rent NFT handler
  const handleRentNft = async (nftId) => {
    if (contract && web3) {
      try {
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0]; // Get the first account

        // Call rentNft function from the smart contract
        await contract.methods.rentNft(nftId).send({ from: account });

        // Execute any further actions after renting (like updating UI, etc.)
        if (onRent) {
          onRent(nftId);
        }
      } catch (error) {
        console.error("Error renting NFT:", error);
      }
    }
  };

  return (
    <div>
      <h3>Rent an NFT:</h3>
      {availableNfts.length > 0 ? (
        <div>
          {availableNfts.map((nftId) => (
            <div key={nftId}>
              <p>NFT ID: {nftId}</p>
              <button onClick={() => handleRentNft(nftId)}>Rent NFT {nftId}</button>
            </div>
          ))}
        </div>
      ) : (
        <p>No NFTs available for rent at the moment.</p>
      )}
    </div>
  );
}
