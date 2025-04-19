// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTRentContract is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Maps tokenId to gameId
    mapping(uint256 => uint256) public tokenGameId;

    // Maps tokenId to rental timestamp (start time)
    mapping(uint256 => uint256) public rentalStartTime;

    // Maps user to their rented NFTs
    mapping(address => uint256[]) public userNFTs;

    constructor() ERC721("NFTRent", "NFR") {}

    /*
     * rentNft
     * Called by frontend when user clicks "Rent"
     * Mints a new NFT, tracks its gameId and start time
     */
    function rentNft(uint256 gameId) public {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(msg.sender, newTokenId);
        tokenGameId[newTokenId] = gameId;
        rentalStartTime[newTokenId] = block.timestamp;
        userNFTs[msg.sender].push(newTokenId);
    }

    /*
     * checkAccess
     * Returns the gameId of the user's most recently rented NFT
     */
    function checkAccess() public view returns (uint256) {
        uint256[] memory nfts = userNFTs[msg.sender];
        if (nfts.length == 0) return 0;
        return tokenGameId[nfts[nfts.length - 1]];
    }

    /*
     * getAvailableNfts
     * Placeholder: would return count or list of available NFTs to rent
     */
    function getAvailableNfts() public pure returns (uint256) {
        return 42;
    }

    /*
     * getUserNfts
     * Returns the number of NFTs currently rented by the caller
     */
    function getUserNfts() public view returns (uint256) {
        return userNFTs[msg.sender].length;
    }
}