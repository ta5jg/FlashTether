// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract FlashTetherTRC20 is Ownable, Pausable, ReentrancyGuard {
    string public name = "Flash Tether";
    string public symbol = "USDTz";
    uint8 public decimals = 6;
    uint256 public totalSupply;
    uint256 public maxSupply;
    uint256 public transactionFeePercentage;

    address public feeWallet;
    AggregatorV3Interface internal priceFeed;

    mapping(address => uint256) private balances;
    mapping(address => mapping(address => uint256)) private allowances;
    mapping(address => bool) public blacklisted;
    mapping(address => bool) public feeExempted;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    event Blacklisted(address indexed account);
    event Whitelisted(address indexed account);

    constructor(
        uint256 initialSupply,
        uint256 _maxSupply,
        address _feeWallet,
        address _priceFeed
    ) {
        require(initialSupply <= _maxSupply, "Initial > max supply");
        totalSupply = initialSupply * (10 ** decimals);
        maxSupply = _maxSupply * (10 ** decimals);
        feeWallet = _feeWallet;
        transactionFeePercentage = 100; // 1%
        priceFeed = AggregatorV3Interface(_priceFeed);
        balances[msg.sender] = totalSupply;
        transferOwnership(msg.sender);
    }

    modifier notBlacklisted(address account) {
        require(!blacklisted[account], "Blacklisted");
        _;
    }

    function balanceOf(address account) public view returns (uint256) {
        return balances[account];
    }

    function transfer(address to, uint256 value) public whenNotPaused notBlacklisted(msg.sender) returns (bool) {
        require(balances[msg.sender] >= value, "Insufficient balance");
        uint256 fee = feeExempted[msg.sender] ? 0 : (value * transactionFeePercentage) / 10000;
        balances[msg.sender] -= value;
        balances[feeWallet] += fee;
        balances[to] += (value - fee);
        emit Transfer(msg.sender, feeWallet, fee);
        emit Transfer(msg.sender, to, value - fee);
        return true;
    }

    function approve(address spender, uint256 value) public whenNotPaused notBlacklisted(msg.sender) returns (bool) {
        allowances[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) public whenNotPaused notBlacklisted(from) returns (bool) {
        require(balances[from] >= value, "Insufficient balance");
        require(allowances[from][msg.sender] >= value, "Allowance exceeded");
        uint256 fee = (value * transactionFeePercentage) / 10000;
        balances[from] -= value;
        balances[feeWallet] += fee;
        balances[to] += (value - fee);
        allowances[from][msg.sender] -= value;
        emit Transfer(from, feeWallet, fee);
        emit Transfer(from, to, value - fee);
        return true;
    }

    function allowance(address owner_, address spender) public view returns (uint256) {
        return allowances[owner_][spender];
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply + amount <= maxSupply, "Exceeds max supply");
        balances[to] += amount;
        totalSupply += amount;
        emit TokensMinted(to, amount);
    }

    function burn(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        totalSupply -= amount;
        emit TokensBurned(msg.sender, amount);
    }

    function blacklist(address account) external onlyOwner {
        blacklisted[account] = true;
        emit Blacklisted(account);
    }

    function whitelist(address account) external onlyOwner {
        blacklisted[account] = false;
        emit Whitelisted(account);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function getLatestPrice() public view returns (int) {
        (, int price,,,) = priceFeed.latestRoundData();
        return price;
    }
}