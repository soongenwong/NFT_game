// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

contract NFTRentLight {

    struct Rental {
        uint256 gameId;
        uint256 startTime;
        bool active;
    }

    // Tracks current rental per user
    mapping(address => Rental) public rentals;

    function rentGame(uint256 gameId) public {
        require(!rentals[msg.sender].active, "Already renting");

        rentals[msg.sender] = Rental({
            gameId: gameId,
            startTime: block.timestamp,
            active: true
        });
    }

    function checkAccess() public view returns (uint256) {
        Rental memory r = rentals[msg.sender];
        if (!r.active) return 0;
        return r.gameId;
    }

    function getUserStartTime() public view returns (uint256) {
        return rentals[msg.sender].startTime;
    }

    function endRental() public {
        require(rentals[msg.sender].active, "No active rental");
        rentals[msg.sender].active = false;
    }
}