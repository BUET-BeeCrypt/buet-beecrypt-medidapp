
![image](https://github.com/user-attachments/assets/41e15032-34a3-4a8e-94e4-b6cd56a60817)

# How to run the project
```
cd contract
npm i
npx hardhat compile
npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```
copy the abi files from contract/artifacts/contracts/ to frontend/src/abi
```
cd frontend
npm i
npm start
```


# Solidity API Documentation

## MediDocContract

### Document

```solidity
// document information
struct Document {
  string fileName;
  string fileCID; // CID to download file from IPFS
  string fileKey; // key to dycrypt encrypted file
  string fileHash; // file hash to verify file
  address issuer; // address who uploaded the file
  address owner; // address who owns the file
  uint256 timestamp; // upload time in seconds
}
```

### user_docs

```solidity
// key: user wallet id, value: array of documents
mapping(address => struct MediDocContract.Document[]) user_docs
```

### FileUploadLog

```solidity
event FileUploadLog(string fileCID, address creator, address owner)
```

### addDocument

```solidity
function addDocument(string fileName, string fileCID, string fileKey, string fileHash, address ownerAddress) public
```

### getDocument

```solidity
// get the document by owner and file hash
// also used in file verification
function getDocument(address owner, string fileHash) public view returns (struct MediDocContract.Document)
```

### getDocuments

```solidity
// returns all the documents that user owns
function getDocuments() public view returns (struct MediDocContract.Document[])
```

### strcmp

```solidity
function strcmp(string s1, string s2) public pure returns (bool)
```

## UserContract

### keys

```solidity
// key: user wallet id, value: user information
mapping(address => struct UserContract.User) users
```

### User

```solidity
struct User {
  string userType; // user can be doctor / patient
  string pkey; // public key to encrypt file
}
```

### LogUser

```solidity
event LogUser(address user)
```

### add

```solidity
// add a user to the chain
function add(string _userType, string pKey) public
```

### getSelf

```solidity
// get the user information by wallet id
function getSelf() public view returns (struct UserContract.User)
```

returns the public key of the user

### get

```solidity
// get other user information by wallet id to get the public key
function get(address user) public view returns (struct UserContract.User)
```

returns the public key of the user

### exists

```solidity
// return true is the user is registered(public key is saved in the chain)
function exists() public view returns (bool)
```

### strcmp

```solidity
function strcmp(string s1, string s2) public pure returns (bool)
```

## ShareContract

### SharedInfo

```solidity
// shared file information
struct SharedInfo {
  string fileName;
  string fileCid;
  string fileKey; // key to dycrypt the file encrypted with the public key of the reciever
  address owner;
  address sharedwith;
  uint256 timestamp; //  time when the file is shared in seconds
}
```

### infos

```solidity
// key: walllet id of the user with whom the file is shared with, value: array of shared files
mapping(address => struct ShareContract.SharedInfo[]) infos
```

### addSharedInfo

```solidity
function addSharedInfo(string fileName, string fileCid, string fileKey, address receiver) public
```

### getSharedInfos

```solidity
function getSharedInfos() public view returns (struct ShareContract.SharedInfo[])
```

