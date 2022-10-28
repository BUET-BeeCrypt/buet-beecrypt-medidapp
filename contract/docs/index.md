# Solidity API

## MediDocContract

### State

```solidity
enum State {
  Verified,
  Unverified
}
```

### Document

```solidity
struct Document {
  string fileName;
  string fileCID;
  string fileKey;
  string fileHash;
  address owner;
  enum MediDocContract.State state;
  uint256 timestamp;
}
```

### user_documents

```solidity
mapping(address => mapping(string => struct MediDocContract.Document)) user_documents
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
function getDocument(string fileHash) public view returns (struct MediDocContract.Document)
```

### verify

```solidity
function verify(string fileCID) public
```

### isVerified

```solidity
function isVerified(string fileCID) public view returns (bool)
```

### isVerified2

```solidity
function isVerified2(address owner, string fileCID) public view returns (bool)
```

## UserContract

### keys

```solidity
mapping(address => string) keys
```

### LogUser

```solidity
event LogUser(address user)
```

### addKey

```solidity
function addKey(string pKey) public
```

### getSelfKey

```solidity
function getSelfKey() public view returns (string)
```

returns the public key of the user

### getKey

```solidity
function getKey(address user) public view returns (string)
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

## Lock

### unlockTime

```solidity
uint256 unlockTime
```

### owner

```solidity
address payable owner
```

### Withdrawal

```solidity
event Withdrawal(uint256 amount, uint256 when)
```

### constructor

```solidity
constructor(uint256 _unlockTime) public payable
```

### withdraw

```solidity
function withdraw() public
```

