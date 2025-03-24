// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract FlashTetherTRC20 {
    string public name;
    string public symbol;
    uint8 public decimals = 6;
    uint256 public totalSupply;
    uint256 public maxSupply;
    uint256 public transactionFeePercentage;

    address public owner;
    address public feeWallet;
    bool public paused;
    bool private locked;

    mapping(address => uint256) private balances;
    mapping(address => mapping(address => uint256)) private allowed;
    mapping(address => bool) public blacklisted;
    mapping(address => bool) public feeExempted;

    AggregatorV3Interface internal priceFeed;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier notBlacklisted(address account) {
        require(!blacklisted[account], "Blacklisted address");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Token transfers are paused");
        _;
    }

    modifier nonReentrant() {
        require(!locked, "ReentrancyGuard: reentrant call");
        locked = true;
        _;
        locked = false;
    }

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    event TokenPriceChecked(uint256 tokenAmount, uint256 usdValue);

    constructor(
        string memory _name,
        string memory _symbol,
        address _feeWallet,
        uint256 _initialSupply,
        uint256 _maxSupply,
        address _priceFeed
    ) {
        require(_initialSupply <= _maxSupply, "Initial supply exceeds max supply");

        name = _name;
        symbol = _symbol;
        owner = msg.sender;
        feeWallet = _feeWallet;
        totalSupply = _initialSupply * (10 ** decimals);
        maxSupply = _maxSupply * (10 ** decimals);
        balances[owner] = totalSupply;
        transactionFeePercentage = 100;
        paused = false;
        locked = false;
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }

    function transfer(address to, uint256 value) external whenNotPaused notBlacklisted(msg.sender) returns (bool) {
        require(balances[msg.sender] >= value, "Insufficient balance");
        uint256 fee = feeExempted[msg.sender] ? 0 : (value * transactionFeePercentage) / 10000;
        balances[msg.sender] -= value;
        balances[feeWallet] += fee;
        balances[to] += (value - fee);
        emit Transfer(msg.sender, feeWallet, fee);
        emit Transfer(msg.sender, to, value - fee);
        return true;
    }

    function approve(address spender, uint256 value) external returns (bool) {
        allowed[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        require(balances[from] >= value, "Insufficient balance");
        require(allowed[from][msg.sender] >= value, "Allowance exceeded");
        uint256 fee = (value * transactionFeePercentage) / 10000;
        balances[from] -= value;
        balances[feeWallet] += fee;
        balances[to] += (value - fee);
        allowed[from][msg.sender] -= value;
        emit Transfer(from, feeWallet, fee);
        emit Transfer(from, to, value - fee);
        return true;
    }

    function allowance(address _owner, address spender) external view returns (uint256) {
        return allowed[_owner][spender];
    }

    function mint(uint256 amount) external onlyOwner {
        require(totalSupply + amount <= maxSupply, "Exceeds max supply");
        balances[owner] += amount;
        totalSupply += amount;
        emit TokensMinted(owner, amount);
    }

    function burn(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        totalSupply -= amount;
        emit TokensBurned(msg.sender, amount);
    }

    function getLatestPrice() public view returns (int256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return price;
    }

    function getUSDValue(uint256 tokenAmount) public view returns (uint256) {
        (, int price,,,) = priceFeed.latestRoundData();
        require(price > 0, "Invalid price from oracle");
        return uint256(price) * tokenAmount / (10 ** decimals);
    }
}
