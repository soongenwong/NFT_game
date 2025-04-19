// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 * @custom:dev-run-script ./scripts/deploy_with_ethers.ts
 */
contract NFTRentContract {

    uint256 number;
    uint256 gameId;

    /**
     * @dev Store value in variable
     * @param num value to store
     */
    function store(uint256 num) public {
        number = num;
    }

    /**
     * @dev Return value 
     * @return value of 'number'
     */
    function retrieve() public view returns (uint256){
        return number;
    }

    
    function rentNft(uint256 num) public {
        gameId = num;
    }

    function checkAccess() public view returns (uint256){
        return gameId;
    }

    function getAvailableNfts() public view returns (uint256){
        return gameId;
    }

    function getUserNfts() public view returns (uint256){
        return gameId;
    }

}