
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract UserContract{
    // state variables 
    mapping(address => string) keys;

    event LogUser(address user);

    // saves users public key
    function addKey(string memory pKey) public {
        keys[msg.sender] = pKey;
    }

    // ============== views ============================
    /**
     * returns the public key of the user
     */
    function getSelfKey() public view returns(string memory){
        return keys[msg.sender];
    }

    /**
     * returns the public key of the user
     */
    function getKey(address user) public view returns(string memory){
        return keys[user];
    }

    function exists() public view returns (bool){
        return !strcmp(keys[msg.sender],"");
    }

    // ===========  private functions ====================
    function strcmp(string memory s1, string memory s2) public pure returns(bool){
        return keccak256(abi.encodePacked(s1)) == keccak256(abi.encodePacked(s2));
    }
}