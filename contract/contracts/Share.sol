// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract ShareContract{
    struct SharedInfo{
        string fileName;
        string fileCid;
        string fileKey;
        address owner;
        address sharedwith;
        uint timestamp;
    }

    mapping(address => SharedInfo[]) infos;

    // owner calls the function
    function addSharedInfo(
        string memory fileName,
        string memory fileCid,
        string memory fileKey,
        address receiver
    ) public {
        SharedInfo memory info = SharedInfo(
            fileName, fileCid, fileKey, msg.sender, receiver, block.timestamp
        );
        infos[receiver].push(info);
    }

    function getSharedInfos() public view returns(SharedInfo [] memory){
        return infos[msg.sender];
    }
}