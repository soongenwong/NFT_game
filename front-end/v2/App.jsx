import React, { useState, useEffect } from "react";
import Web3 from "web3";
import WalletConnect from "./components/WalletConnect";
import RentNft from "./components/RentNft";
import CheckAccess from "./components/CheckAccess";

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

export default function App() {
  const [account, setAccount] = useState(null);
  const [rentedNfts, setRentedNfts] = useState([]);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    if (account) {
      const initWeb3 = async () => {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        const contractInstance = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
        setContract(contractInstance);
      };

      initWeb3();
    }
  }, [account]);

  const fetchAvailableNfts = async () => {
    if (contract) {
      try {
        const nftIds = await contract.methods.getAvailableNfts().call();
        return nftIds;
      } catch (err) {
        console.error("Failed to fetch NFTs:", err);
      }
    }
    return [];
  };  

  const rentNftHandler = async (nftId) => {
    if (contract && account) {
      try {
        await contract.methods.rentNft(nftId).send({ from: account });
        setRentedNfts((prev) => [...prev, { id: nftId, rentedAt: Date.now() }]);
      } catch (err) {
        console.error("Error renting NFT:", err);
      }
    }
  };

  // ✅ Mint (store) NFTs for testing
  const mintNftHandler = async (nftId) => {
    if (contract && account) {
      try {
        await contract.methods.store(nftId).send({ from: account });
        console.log(`NFT ID ${nftId} added to contract.`);
      } catch (err) {
        console.error(`Failed to store NFT ID ${nftId}:`, err);
      }
    }
  };

  return (
    <div className="App">
      <WalletConnect onAccountSelected={setAccount} />

      {account && (
        <div>
          <p>Wallet connected: {account}</p>

          {/* ✅ Admin test mint buttons */}
          <div style={{ margin: "20px 0" }}>
            <h4>Admin: Mint Test NFTs</h4>
            <button onClick={() => mintNftHandler(1)}>Add NFT ID 1</button>
            <button onClick={() => mintNftHandler(2)}>Add NFT ID 2</button>
            <button onClick={() => mintNftHandler(3)}>Add NFT ID 3</button>
          </div>

          <div>
            <h3>Available NFTs to Rent:</h3>
            <RentNft availableNfts={fetchAvailableNfts()} onRent={rentNftHandler} />
          </div>

          <div>
            <h3>Your Current NFT Wallet:</h3>
            <CheckAccess rentedNfts={rentedNfts} availableNfts={fetchAvailableNfts()} />
          </div>
        </div>
      )}
    </div>
  );
}
