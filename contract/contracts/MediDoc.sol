// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract MediDocContract {
    struct Document{
        string fileName;
        string  fileCID; // file CID generated by ipfs
        string fileKey;
        string fileHash;
        address issuer;
        address  owner; // address of the owner of the document
        uint timestamp;
    }

    // state variables
    // map (wallet_address -> map hash -> Document))
    //mapping(address => mapping(string => Document)) user_documents;
    mapping(address => Document[]) user_docs;

    // events
    event FileUploadLog(
        string fileCID,  
        address creator,
        address owner);


    function addDocument(
        string memory fileName, 
        string memory fileCID,
        string memory fileKey,
        string memory fileHash, 
        address ownerAddress
        ) public {
        Document memory doc = Document(
            fileName, fileCID, fileKey, fileHash, msg.sender,ownerAddress, block.timestamp
        );
        //user_documents[ownerAddress][fileHash] = doc;
        user_docs[ownerAddress].push(doc);
        emit FileUploadLog(fileName,msg.sender, ownerAddress);
    }

    function getDocument(address owner,string memory fileHash) public view returns(Document memory) {
        Document[] memory docs = user_docs[owner];
        for(uint i = 0; i<docs.length; i++){
            if(strcmp(docs[i].fileHash, fileHash))
                return docs[i];
        }
        revert("Not found");
       // return user_documents[msg.sender][fileHash];
    }

    function getDocuments() public view returns(Document[] memory){
        return user_docs[msg.sender];
    }

    // private files
    // ===========  private functions ====================
    function strcmp(string memory s1, string memory s2) public pure returns(bool){
        return keccak256(abi.encodePacked(s1)) == keccak256(abi.encodePacked(s2));
    }
}