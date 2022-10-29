# Solidity API

## MediDocContract

### Document

```solidity
struct Document {
  string fileName;
  string fileCID;
  string fileKey;
  string fileHash;
  address issuer;
  address owner;
  uint256 timestamp;
}
```

### user_docs

```solidity
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
function getDocument(address owner, string fileHash) public view returns (struct MediDocContract.Document)
```

### getDocuments

```solidity
function getDocuments() public view returns (struct MediDocContract.Document[])
```

### strcmp

```solidity
function strcmp(string s1, string s2) public pure returns (bool)
```

## UserContract

### keys

```solidity
mapping(address => struct UserContract.User) keys
```

### User

```solidity
struct User {
  string userType;
  string pkey;
}
```

### LogUser

```solidity
event LogUser(address user)
```

### add

```solidity
function add(string _userType, string pKey) public
```

### getSelf

```solidity
function getSelf() public view returns (struct UserContract.User)
```

returns the public key of the user

### get

```solidity
function get(address user) public view returns (struct UserContract.User)
```

returns the public key of the user

### exists

```solidity
function exists() public view returns (bool)
```

### strcmp

```solidity
function strcmp(string s1, string s2) public pure returns (bool)
```

## ShareContract

### SharedInfo

```solidity
struct SharedInfo {
  string fileName;
  string fileCid;
  string fileKey;
  address owner;
  address sharedwith;
  uint256 timestamp;
}
```

### infos

```solidity
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

