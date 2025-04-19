// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol"; // Optional for versions < 0.8.0

/**
 * @title NFTRental
 * @notice A basic contract to facilitate renting ERC721 NFTs for temporary access.
 * Owners list their NFTs with a price, renters pay to get access for a duration.
 * Access is checked via this contract, not by transferring the NFT.
 * NOTE: Requires NFT owners to approve this contract via the ERC721 contract's `approve` function first.
 */
contract NFTRental is ReentrancyGuard {
    using SafeMath for uint256; // Only needed if Solidity version < 0.8.0

    struct Listing {
        address payable lender; // Address of the NFT owner offering the rental
        uint256 pricePerBlock;  // Rental price in wei per block duration
        bool isListed;         // Flag indicating if the NFT is currently listed
    }

    struct RentalAgreement {
        address renter;         // Address of the user renting the NFT
        uint256 rentedAtBlock;  // Block number when the rental started
        uint256 rentalDurationBlocks; // Duration of the rental in blocks
        uint256 rentalFeePaid; // Total fee paid for this specific rental
    }

    // Mapping: NFT Contract Address -> Token ID -> Listing Details
    mapping(address => mapping(uint256 => Listing)) public listings;

    // Mapping: NFT Contract Address -> Token ID -> Active Rental Agreement
    // We only store the *active* rental here. Expired rentals are implicitly inactive.
    mapping(address => mapping(uint256 => RentalAgreement)) public activeRentals;

    // Mapping: Lender Address -> Accumulated Rent Balance (to be withdrawn)
    mapping(address => uint256) public lenderBalances;

    // --- Events ---

    event NFTListed(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed lender,
        uint256 pricePerBlock
    );

    event NFTUnlisted(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed lender
    );

    event NFTRented(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed lender,
        address renter,
        uint256 durationBlocks,
        uint256 rentalFee,
        uint256 expiresAtBlock
    );

    event RentWithdrawn(
        address indexed lender,
        uint256 amount
    );

    // --- Errors ---
    error NotNFTOwner(address caller, address nftContract, uint256 tokenId);
    error AlreadyListed(address nftContract, uint256 tokenId);
    error NotListed(address nftContract, uint256 tokenId);
    error NotLender(address caller, address nftContract, uint256 tokenId);
    error CurrentlyRented(address nftContract, uint256 tokenId);
    error InsufficientPayment(uint256 required, uint256 sent);
    error InvalidDuration();
    error NoBalanceToWithdraw(address lender);
    error TransferFailed();

    // --- Functions ---

    /**
     * @notice List an owned NFT for rent.
     * @dev Requires prior approval of this contract via the NFT contract's `approve` function.
     * @param _nftContract Address of the ERC721 NFT contract.
     * @param _tokenId The ID of the NFT to list.
     * @param _pricePerBlock The rental price in wei per block.
     */
    function listNFT(
        address _nftContract,
        uint256 _tokenId,
        uint256 _pricePerBlock
    ) external {
        IERC721 nft = IERC721(_nftContract);
        address owner = nft.ownerOf(_tokenId);
        if (owner != msg.sender) {
            revert NotNFTOwner(msg.sender, _nftContract, _tokenId);
        }

        // Check if already listed by someone else (shouldn't happen if owner check is correct, but good practice)
        // Also prevents relisting if already listed by the owner. Use updateListing if needed.
        if (listings[_nftContract][_tokenId].isListed) {
             revert AlreadyListed(_nftContract, _tokenId);
        }

        // Optional: Check if this contract is approved for the token
        // require(nft.getApproved(_tokenId) == address(this), "Contract not approved for this NFT");

        listings[_nftContract][_tokenId] = Listing({
            lender: payable(msg.sender),
            pricePerBlock: _pricePerBlock,
            isListed: true
        });

        emit NFTListed(_nftContract, _tokenId, msg.sender, _pricePerBlock);
    }

    /**
     * @notice Update the price for a listed NFT.
     * @param _nftContract Address of the ERC721 NFT contract.
     * @param _tokenId The ID of the NFT.
     * @param _newPricePerBlock The new rental price in wei per block.
     */
    function updateListingPrice(
        address _nftContract,
        uint256 _tokenId,
        uint256 _newPricePerBlock
    ) external {
        Listing storage listing = listings[_nftContract][_tokenId];
        if (!listing.isListed) {
            revert NotListed(_nftContract, _tokenId);
        }
        if (listing.lender != msg.sender) {
            revert NotLender(msg.sender, _nftContract, _tokenId);
        }
        // Optional: Consider disallowing price updates while actively rented.
        // if (isCurrentlyRented(_nftContract, _tokenId)) {
        //     revert CurrentlyRented(_nftContract, _tokenId);
        // }

        listing.pricePerBlock = _newPricePerBlock;
        // Re-emit event to signal price change
        emit NFTListed(_nftContract, _tokenId, msg.sender, _newPricePerBlock);
    }


    /**
     * @notice Unlist an NFT, making it unavailable for new rentals.
     * @dev Does not affect active rentals.
     * @param _nftContract Address of the ERC721 NFT contract.
     * @param _tokenId The ID of the NFT to unlist.
     */
    function unlistNFT(address _nftContract, uint256 _tokenId) external {
        Listing storage listing = listings[_nftContract][_tokenId];
        if (!listing.isListed) {
            revert NotListed(_nftContract, _tokenId);
        }
        if (listing.lender != msg.sender) {
             revert NotLender(msg.sender, _nftContract, _tokenId);
        }

        listing.isListed = false;
        // Or use delete: delete listings[_nftContract][_tokenId];

        emit NFTUnlisted(_nftContract, _tokenId, msg.sender);
    }

    /**
     * @notice Rent a listed NFT for a specified duration in blocks.
     * @param _nftContract Address of the ERC721 NFT contract.
     * @param _tokenId The ID of the NFT to rent.
     * @param _durationBlocks The desired rental duration in blocks.
     */
    function rentNFT(
        address _nftContract,
        uint256 _tokenId,
        uint256 _durationBlocks
    ) external payable nonReentrant {
        Listing storage listing = listings[_nftContract][_tokenId];

        if (!listing.isListed) {
            revert NotListed(_nftContract, _tokenId);
        }
        if (_durationBlocks == 0) {
             revert InvalidDuration();
        }

        // Check if it's currently rented and if that rental has expired
        if (isCurrentlyRented(_nftContract, _tokenId)) {
             revert CurrentlyRented(_nftContract, _tokenId);
        }

        // Calculate required fee (using SafeMath if needed for <0.8.0)
        uint256 rentalFee;
        // Using Solidity >= 0.8.0 built-in checks
        rentalFee = listing.pricePerBlock * _durationBlocks;


        if (msg.value < rentalFee) {
             revert InsufficientPayment(rentalFee, msg.value);
        }

        // Store the rental agreement
        activeRentals[_nftContract][_tokenId] = RentalAgreement({
            renter: msg.sender,
            rentedAtBlock: block.number,
            rentalDurationBlocks: _durationBlocks,
            rentalFeePaid: rentalFee // Store the actual fee paid for record keeping
        });

        // Add funds to lender's balance (Checks-Effects-Interaction: Effect before external call/transfer)
        lenderBalances[listing.lender] += rentalFee;

        // Refund excess payment, if any
        if (msg.value > rentalFee) {
            payable(msg.sender).transfer(msg.value - rentalFee);
        }

        uint256 expiresAtBlock = block.number + _durationBlocks;
        emit NFTRented(
            _nftContract,
            _tokenId,
            listing.lender,
            msg.sender,
            _durationBlocks,
            rentalFee,
            expiresAtBlock
        );
    }

     /**
      * @notice Allows lenders to withdraw their accumulated rental earnings.
      */
    function withdrawRent() external nonReentrant {
        uint256 amount = lenderBalances[msg.sender];
        if (amount == 0) {
            revert NoBalanceToWithdraw(msg.sender);
        }

        // Checks-Effects-Interaction: Set balance to 0 *before* transfer
        lenderBalances[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            // If transfer fails, revert state change
            lenderBalances[msg.sender] = amount;
            revert TransferFailed();
        }

        emit RentWithdrawn(msg.sender, amount);
    }

    // --- View Functions (for checking access) ---

    /**
     * @notice Check if a specific address currently has active rental access to an NFT.
     * @dev This is the function the game client/server would likely call.
     * @param _user The address to check (potential renter).
     * @param _nftContract The NFT contract address.
     * @param _tokenId The NFT token ID.
     * @return bool True if the user has an active rental, false otherwise.
     */
    function checkAccess(
        address _user,
        address _nftContract,
        uint256 _tokenId
    ) public view returns (bool) {
        RentalAgreement storage rental = activeRentals[_nftContract][_tokenId];

        // Check if there is an active rental agreement for this user
        if (rental.renter != _user || rental.renter == address(0)) {
            return false; // Not rented by this user or no active rental recorded
        }

        // Check if the rental period has expired (using block number)
        // Use >= for expiration check: if current block is the expiry block, it's expired.
        if (block.number >= (rental.rentedAtBlock + rental.rentalDurationBlocks)) {
           // Clean up expired rental? Could add a function for this, but view func shouldn't change state.
           // For now, just return false if expired.
            return false;
        }

        return true; // User is the renter and rental is still active
    }

    /**
     * @notice Helper function to check if an NFT is currently rented (regardless of renter).
     * @param _nftContract The NFT contract address.
     * @param _tokenId The NFT token ID.
     * @return bool True if there's an active (non-expired) rental, false otherwise.
     */
    function isCurrentlyRented(
        address _nftContract,
        uint256 _tokenId
    ) public view returns (bool) {
         RentalAgreement storage rental = activeRentals[_nftContract][_tokenId];
         if (rental.renter == address(0)) {
             return false; // No rental recorded
         }
         // Check expiration
         if (block.number >= (rental.rentedAtBlock + rental.rentalDurationBlocks)) {
             return false; // Rental recorded, but it's expired
         }
         return true; // There is an active, non-expired rental
    }

    /**
     * @notice Get details of the current active rental for an NFT.
     * @param _nftContract The NFT contract address.
     * @param _tokenId The NFT token ID.
     * @return renter The address of the current renter (or address(0) if none).
     * @return rentedAtBlock The block number the rental started.
     * @return rentalDurationBlocks The duration of the rental in blocks.
     * @return expiresAtBlock The block number the rental expires.
     */
    function getActiveRentalDetails(
        address _nftContract,
        uint256 _tokenId
    ) public view returns (address renter, uint256 rentedAtBlock, uint256 rentalDurationBlocks, uint256 expiresAtBlock) {
        RentalAgreement storage rental = activeRentals[_nftContract][_tokenId];
        if(rental.renter == address(0) || block.number >= (rental.rentedAtBlock + rental.rentalDurationBlocks)) {
            // No active rental or it's expired
            return (address(0), 0, 0, 0);
        }
        return (rental.renter, rental.rentedAtBlock, rental.rentalDurationBlocks, rental.rentedAtBlock + rental.rentalDurationBlocks);
    }

    // --- Fallback Functions ---
    // Optional: Add receive() and fallback() if you want the contract to accept plain Ether transfers
    // receive() external payable {}
    // fallback() external payable {}

}