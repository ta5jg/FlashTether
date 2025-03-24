const TronWeb = require("tronweb");
const MockPriceFeed = artifacts.require("MockPriceFeed");
const FlashTetherTRC20 = artifacts.require("FlashTetherTRC20");

module.exports = async function (deployer, network) {
    console.log("🔁 Deploy işlemi başlatılıyor...");
    const isMainnet = network === "mainnet";
    const fullHost = isMainnet ? "https://api.trongrid.io" : "https://api.shasta.trongrid.io";
    const privateKey = isMainnet ? process.env.PRIVATE_KEY_MAINNET : process.env.PRIVATE_KEY_SHASTA;
    
    const tronWeb = new TronWeb({ fullHost, privateKey });
    const owner = tronWeb.address.fromPrivateKey(privateKey);
    
    console.log("👤 Fee Wallet (owner):", owner);
    
    // 1. MockPriceFeed deploy
    await deployer.deploy(MockPriceFeed);
    const priceFeed = await MockPriceFeed.deployed();
    console.log("📈 PriceFeed adresi:", priceFeed.address);
    
    // 2. FlashTetherTRC20 deploy
    const name = "Flash Tether";
    const symbol = "USDTz";
    const initialSupply = 1_000_000_000_000; // 1 Trilyon
    const maxSupply = 10_000_000_000_000;    // 10 Trilyon
    
    await deployer.deploy(
        FlashTetherTRC20,
        name,
        symbol,
        owner,
        initialSupply,
        maxSupply,
        priceFeed.address
    );
    
    const token = await FlashTetherTRC20.deployed();
    console.log("✅ Token başarıyla oluşturuldu!");
    console.log("📦 Token adresi:", token.address);
};