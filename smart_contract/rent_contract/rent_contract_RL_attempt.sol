// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

contract NFTRentLight {
    uint256 public rentalDuration = 5 minutes; // You can adjust this as needed

    struct NFT {
        uint256 id;
        bool isRented;
    }

    struct Rental {
        uint256 nftId;
        uint256 startTime;
        bool active;
    }

    // Store available NFTs
    NFT[] public availableNfts;

    // Rentals mapped to user addresses
    mapping(address => Rental) public rentals;

    // --- ADMIN FUNCTION: Add NFTs to the rentable pool ---
    function store(uint256 nftId) public {
        availableNfts.push(NFT(nftId, false));
    }

    // --- Get all currently available NFTs ---
    function getAvailableNfts() public view returns (uint256[] memory) {
        uint256 count = 0;

        // Count available
        for (uint i = 0; i < availableNfts.length; i++) {
            if (!availableNfts[i].isRented) {
                count++;
            }
        }

        uint256[] memory result = new uint256[](count);
        uint256 idx = 0;
        for (uint i = 0; i < availableNfts.length; i++) {
            if (!availableNfts[i].isRented) {
                result[idx++] = availableNfts[i].id;
            }
        }

        return result;
    }

    // --- Rent an available NFT ---
    function rentNft(uint256 nftId) public {
        require(!rentals[msg.sender].active, "Already renting");

        bool found = false;
        for (uint i = 0; i < availableNfts.length; i++) {
            if (availableNfts[i].id == nftId && !availableNfts[i].isRented) {
                availableNfts[i].isRented = true;
                found = true;
                break;
            }
        }

        require(found, "NFT not available");

        rentals[msg.sender] = Rental({
            nftId: nftId,
            startTime: block.timestamp,
            active: true
        });
    }

    // --- Check what NFT user has rented (0 if none) ---
    function checkAccess() public view returns (uint256) {
        Rental memory r = rentals[msg.sender];
        if (!r.active) return 0;

        // Auto-expire if time is up
        if (block.timestamp > r.startTime + rentalDuration) {
            return 0;
        }

        return r.nftId;
    }

    // --- Get when current user's rental started ---
    function getUserStartTime() public view returns (uint256) {
        return rentals[msg.sender].startTime;
    }

    // --- End rental early ---
    function endRental() public {
        require(rentals[msg.sender].active, "No active rental");

        uint256 rentedId = rentals[msg.sender].nftId;

        // Mark NFT as available again
        for (uint i = 0; i < availableNfts.length; i++) {
            if (availableNfts[i].id == rentedId) {
                availableNfts[i].isRented = false;
                break;
            }
        }

        // Clear rental
        rentals[msg.sender].active = false;
    }

    // --- View function to show user's current NFT (if still valid) ---
    function getUserNfts() public view returns (uint256) {
        Rental memory r = rentals[msg.sender];
        if (!r.active || block.timestamp > r.startTime + rentalDuration) {
            return 0;
        }
        return r.nftId;
    }
}
