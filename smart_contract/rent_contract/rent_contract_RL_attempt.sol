// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTRentContract is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Maps tokenId to gameId
    mapping(uint256 => uint256) public tokenGameId;

    // Maps tokenId to rental start timestamp
    mapping(uint256 => uint256) public rentalStartTime;

    // Rental duration: 5 minutes
    uint256 public constant RENTAL_DURATION = 5 minutes;

    // Keep track of all minted tokenIds
    uint256[] private allTokenIds;

    constructor() ERC721("NFTRent", "NFR") {}

    /// @notice Admin function to mint NFTs and assign them to the contract (available for rent)
    function store(uint256 gameId) public {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(address(this), newTokenId);
        tokenGameId[newTokenId] = gameId;
        allTokenIds.push(newTokenId);
    }

    /// @notice Rent an available NFT with the given gameId
    function rentNft(uint256 gameId) public {
        // Look for an available NFT with the desired gameId
        for (uint256 i = 0; i < allTokenIds.length; i++) {
            uint256 tokenId = allTokenIds[i];

            if (
                tokenGameId[tokenId] == gameId &&
                _isAvailable(tokenId)
            ) {
                // Transfer to user
                _transfer(address(this), msg.sender, tokenId);
                rentalStartTime[tokenId] = block.timestamp;
                return;
            }
        }

        revert("No available NFTs for this game");
    }

    /// @notice Check access to a game (returns gameId if access is valid)
    function checkAccess() public view returns (uint256) {
        for (uint256 i = 0; i < allTokenIds.length; i++) {
            uint256 tokenId = allTokenIds[i];
            if (
                ownerOf(tokenId) == msg.sender &&
                rentalStartTime[tokenId] + RENTAL_DURATION > block.timestamp
            ) {
                return tokenGameId[tokenId];
            }
        }
        return 0;
    }

    /// @notice Returns number of available NFTs for rent
    function getAvailableNfts() public view returns (uint256 count) {
        for (uint256 i = 0; i < allTokenIds.length; i++) {
            if (_isAvailable(allTokenIds[i])) {
                count++;
            }
        }
    }

    /// @notice Returns the count of NFTs the user currently holds that are active (not expired)
    function getUserNfts() public view returns (uint256 count) {
        for (uint256 i = 0; i < allTokenIds.length; i++) {
            uint256 tokenId = allTokenIds[i];
            if (
                ownerOf(tokenId) == msg.sender &&
                rentalStartTime[tokenId] + RENTAL_DURATION > block.timestamp
            ) {
                count++;
            }
        }
    }

    /// @notice View helper to get access expiration for user's tokens (used by front-end)
    function retrieve() public view returns (uint256) {
        for (uint256 i = 0; i < allTokenIds.length; i++) {
            uint256 tokenId = allTokenIds[i];
            if (ownerOf(tokenId) == msg.sender) {
                return rentalStartTime[tokenId];
            }
        }
        return 0;
    }

    /// @dev Internal: check if an NFT is available to rent
    function _isAvailable(uint256 tokenId) internal view returns (bool) {
        return (
            ownerOf(tokenId) == address(this) ||
            rentalStartTime[tokenId] + RENTAL_DURATION <= block.timestamp
        );
    }
}
