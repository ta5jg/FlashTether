const TronWeb = require("tronweb");
const FlashTetherTRC20 = artifacts.require("FlashTetherTRC20");
const MockPriceFeed = artifacts.require("MockPriceFeed");

module.exports = async function (deployer) {
    console.log("🔁 Deploy işlemi başlatılıyor...");
    
    const tronWeb = new TronWeb({
                                    fullHost: "https://api.shasta.trongrid.io",
                                    privateKey: process.env.PRIVATE_KEY_SHASTA,
                                });
    
    const owner = tronWeb.address.fromPrivateKey(process.env.PRIVATE_KEY_SHASTA);
    console.log("👤 Fee Wallet (owner):", owner);
    
    // 1. MockPriceFeed deploy
    await deployer.deploy(MockPriceFeed);
    const priceFeed = await MockPriceFeed.deployed();
    console.log("📈 PriceFeed adresi:", priceFeed.address);
    
    // 2. FlashTetherTRC20 deploy
    const name = "Flash Tether";
    const symbol = "USDTz";
    const initialSupply = 1000; // 1000 token (multiplied in contract)
    const maxSupply = 10000;
    
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