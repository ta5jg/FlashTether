// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

// Chainlink Fiyat Besleme Arayüzü
//import "@chainlink/contracts/src/v0.8/interfaces/FeedRegistryInterface.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract TokenPriceOracle {

    AggregatorV3Interface internal priceFeed;  // 🔹 priceFeed burada tanımlandı!

    constructor() {
        // Shasta testnet için USDT/USD fiyat feed adresi
        AggregatorV3Interface priceFeed = AggregatorV3Interface(0x3E7d1eAB13ad0104d2750B8863b489D65364e32D);  // Shasta testnet adresi
    }

    function _getLatestPrice() public view returns (int) {
        (
            uint80 roundID,
            int price,
            uint startedAt,
            uint timeStamp,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();
        return price;  // Örneğin: 99980000 (USDT/USD fiyatı 0.9998 olarak dönebilir)
    }
}

interface ITRC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address who) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract FlashTetherTRC20 is ITRC20 {
    string public name = "Flash Tether";
    string public symbol = "USDTz";
    uint8 public decimals = 6;
    uint256 public override totalSupply;
    uint256 public maxSupply;
    uint256 public usdPricePerToken;
    uint256 public transactionFeePercentage;

    address public owner;
    address public feeWallet;
    bool public paused;

    mapping(address => uint256) private balances;
    mapping(address => mapping(address => uint256)) private allowed;
    mapping(address => bool) public blacklisted;
    mapping(address => bool) public feeExempted;

    AggregatorV3Interface internal priceFeed;  // 🔹 priceFeed burada tanımlandı!

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

    bool private locked;

    event Paused(address account);
    event Unpaused(address account);
    event TokenPurchased(address indexed buyer, uint256 usdtAmount, uint256 tokensReceived);
    event TransferWithUSDValue(address indexed from, address indexed to, uint256 tokenAmount, uint256 usdValue);
    event Blacklisted(address indexed account);
    event Whitelisted(address indexed account);
    event TokenPriceUpdated(uint256 newPrice);
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);

    constructor(uint256 initialSupply, uint256 _maxSupply, address _feeWallet, address _priceFeed) {
        require(initialSupply <= _maxSupply, "Exceeds max supply");
        owner = msg.sender;
        totalSupply = initialSupply * (10 ** decimals);
        maxSupply = _maxSupply * (100 ** decimals);
        balances[owner] = totalSupply;
        transactionFeePercentage = 100;
        feeWallet = _feeWallet;
        paused = false;
        locked = false;
        priceFeed = AggregatorV3Interface(_priceFeed); // Burada tanımlıyoruz!
    }

    function balanceOf(address account) external view override returns (uint256) {
        return balances[account];
    }

    function transfer(address to, uint256 value) external override whenNotPaused notBlacklisted(msg.sender) returns (bool) {
        require(balances[msg.sender] >= value, "Insufficient balance");
        uint256 fee = feeExempted[msg.sender] ? 0 : (value * transactionFeePercentage) / 10000;
        balances[msg.sender] -= value;
        balances[feeWallet] += fee;
        balances[to] += (value - fee);
        emit Transfer(msg.sender, feeWallet, fee);
        emit Transfer(msg.sender, to, value - fee);
        emit TransferWithUSDValue(msg.sender, to, value - fee, getUSDValue(value - fee));
        return true;
    }

    function buyToken(uint256 usdtAmount) external whenNotPaused {
        uint256 tokensToReceive = (usdtAmount * (10 ** decimals)) / usdPricePerToken;
        require(totalSupply + tokensToReceive <= maxSupply, "Exceeds max supply");
        balances[msg.sender] += tokensToReceive;
        totalSupply += tokensToReceive;
        emit TokenPurchased(msg.sender, usdtAmount, tokensToReceive);
    }

    function approve(address spender, uint256 value) external override returns (bool) {
        allowed[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external override returns (bool) {
        require(balances[from] >= value, "Insufficient balance");
        require(allowed[from][msg.sender] >= value, "Allowance exceeded");
        uint256 fee = (value * transactionFeePercentage) / 10000;
        balances[from] -= value;
        balances[feeWallet] += fee;
        balances[to] += (value - fee);
        allowed[from][msg.sender] -= value;
        emit Transfer(from, feeWallet, fee);
        emit Transfer(from, to, value - fee);
        emit TransferWithUSDValue(from, to, value - fee, getUSDValue(value - fee));
        return true;
    }

    function allowance(address _owner, address spender) external view override returns (uint256) {
        return allowed[_owner][spender];
    }

    function pause() external onlyOwner {
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused(msg.sender);
    }

    function blacklistAddress(address account) external onlyOwner {
        blacklisted[account] = true;
        emit Blacklisted(account);
    }

    function whitelistAddress(address account) external onlyOwner {
        blacklisted[account] = false;
        emit Whitelisted(account);
    }

    function getUSDBalance(address account) external view returns (uint256) {
        return getUSDValue(balances[account]);
    }

    function getUSDValue(uint256 tokenAmount) public view returns (uint256) {
        int price = testLatestPrice();  // Chainlink fiyat feed'inden fiyatı alıyoruz
        return uint256(price) * tokenAmount / (10 ** decimals);
    }

    function updateTokenPrice(uint256 newPrice) external onlyOwner {
        usdPricePerToken = newPrice;
        emit TokenPriceUpdated(newPrice);
    }

    // Yeni Eklenen Fonksiyonlar

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

    string public logoURL = "https://raw.githubusercontent.com/ta5jg/usdtz/refs/heads/main/logo.png";

    function getLogoURL() external view returns (string memory) {
        return logoURL;
    }

    // Chainlink fiyat feed'ini almak için fonksiyon
// Fiyat feed'ini almak için bu fonksiyonu kullanabilirsiniz
    function testLatestPrice() public view returns (int256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return price;
    }
}