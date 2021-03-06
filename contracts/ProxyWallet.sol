pragma solidity ^0.4.24;

/**
 * @title Proxy Wallet.
 * @author Tap Trust
 * @dev Proof of concept implementation of a Solidity proxy wallet.
 * Unlike most authentication in Ethereum contracts,
 * the address of the transaction sender is arbitrary,
 * but it includes a signed message that can be authenticated
 * as being from either the account owner or a dApp
 * for whom the account owner has created a session with permissions.
 */
contract ProxyWallet {

  address public owner;

  struct Information {
    address deviceId;
    bytes32 keyOne;
    bytes32 keyTwo;
    string subject;
    bytes32 hashedData;
    bytes32 r;
    bytes32 s;
    uint8 v;
  }

  mapping(string => Information) private info;

  // List of administrator addresses
  address[] public administrators;
  mapping(address => bool) public isAdministrator;

  // Owner Username
  string private ownerUsername;

  // Owner Public Key
  string private ownerPublicKey;

  string public version = "0.0.1";

  modifier isOwner() {
    if (msg.sender == owner) _;
  }

  /**
   * @dev Requires that a valid administrator address was provided.
   * @param _admin address Administrator address.
   */
  modifier onlyValidAdministrator(address _admin) {
    require(_admin != address(0));
    _;
  }

  /**
   * @dev Requires that a valid administrator list was provided.
   * @param _administrators address[] List of administrators.
   */
  modifier onlyValidAdministrators(address[] _administrators) {
    require(_administrators.length > 0);
    _;
  }

  /**
   * @dev Requires that a valid username of the user was provided.
   * @param _username string Username of the user.
   */
  modifier onlyValidUsername(string _username) {
    require(bytes(_username).length > 0);
    _;
  }

  /**
   * @dev Requires that a valid public key of the user was provided.
   * @param _publicKey string Public key of the user.
   */
  modifier onlyValidPublicKey(string _publicKey) {
    require(bytes(_publicKey).length > 0);
    _;
  }

  modifier refundGasCost()
  {
    uint remainingGasStart = msg.gas;

    _;

    uint remainingGasEnd = msg.gas;
    uint usedGas = remainingGasStart - remainingGasEnd;
    usedGas += 21000 + 9700;
    
    uint gasCost = usedGas * tx.gasprice;
    
    tx.origin.transfer(gasCost);
  }

  /**
   * Fired when username is set.
   */
  event UsernameSet(address indexed from, string username);

  /**
   * Fired when public key is set.
   */
  event PublicKeySet(address indexed from, string publicKey);

  /**
   * Fired when administrator is added.
   */
  event AdministratorAdded(address indexed admin);

  event GasRefundEvent(address sender);

  /**
   * @dev Proxy Wallet constructor.
   * @param _administrators address[] List of administrator addresses.
   * @param _username string Username of the user.
   * @param _publicKey string Public key of the user.
   */
  constructor(address[] _administrators, string _username, string _publicKey) onlyValidAdministrators(_administrators) public {
    owner = msg.sender;
    
    setOwnerUsername(_username);

    setOwnerPublicKey(_publicKey);

    for (uint256 i = 0; i < _administrators.length; i++) {
      addAdministrator(_administrators[i]);
    }
  }

  //constructor() public {
    //owner = msg.sender;
    //admins[msg.sender] = true;
  //}

  /**
   * @dev Set owner username.
   * @param _username Username of the user.
   */
  function setOwnerUsername(string _username) onlyValidUsername(_username) internal {
    ownerUsername = _username;
    emit UsernameSet(msg.sender, _username);
  }

  /**
   * @dev Set owner public key.
   * @param _publicKey Public key of the user.
   */
  function setOwnerPublicKey(string _publicKey) onlyValidPublicKey(_publicKey) internal {
    ownerPublicKey = _publicKey;
    emit PublicKeySet(msg.sender, _publicKey);
  }

  /**
   * @dev Add a new administrator to the contract.
   * @param _admin address The address of the administrator to add.
   */
  function addAdministrator(address _admin) isOwner public {
    require(!isAdministrator[_admin]);

    administrators.push(_admin);
    isAdministrator[_admin] = true;

    emit AdministratorAdded(_admin);
  }


  function getAllAdministrators() public view returns (address[]){
    return administrators;
  }


  function addData(string dataId, address deviceId, bytes32 first, bytes32 second , bytes32 hashed, string desc ,bytes32 r, bytes32 s , uint8 v) public {
    
    info[dataId] = Information(deviceId, first, second, desc, hashed, r, s, v);

  }

  function getPublicKey(string dataId) public constant returns(bytes32, bytes32)  {
    return (info[dataId].keyOne, info[dataId].keyTwo);
  }
  function getSignature(string dataId) public constant returns(bytes32, bytes32, uint8)  {
    return (info[dataId].r, info[dataId].s, info[dataId].v);
  }
  function getOther(string dataId) public constant returns(address,string,bytes32)  {
    return (info[dataId].deviceId, info[dataId].subject, info[dataId].hashedData);
  }

  function kill() public {
    require(msg.sender == owner);
    selfdestruct(msg.sender);
  }


  function refundGasCostFunction() external refundGasCost {
    emit GasRefundEvent(msg.sender);  
  }

}
