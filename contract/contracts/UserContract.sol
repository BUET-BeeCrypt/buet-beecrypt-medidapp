
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract UserContract{


    // state variables 
    mapping(address => User) keys;

    struct User{
        string userType;
        string pkey;
    }

    event LogUser(address user);

    // saves users public key
    function add(string memory _userType, string memory pKey) public {
        User memory user = User(_userType, pKey);
        keys[msg.sender] = user; 
    }

    // ============== views ============================
    /**
     * returns the public key of the user
     */
    function getSelf() public view returns(User memory){
        return keys[msg.sender];
    }

    /**
     * returns the public key of the user
     */
    function get(address user) public view returns(User memory){
        return keys[user];
    }

    function exists() public view returns (bool){
        return !strcmp(keys[msg.sender].userType,"");
    }

    // ===========  private functions ====================
    function strcmp(string memory s1, string memory s2) public pure returns(bool){
        return keccak256(abi.encodePacked(s1)) == keccak256(abi.encodePacked(s2));
    }
}