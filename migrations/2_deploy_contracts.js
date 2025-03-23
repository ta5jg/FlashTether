const FlashTetherTRC20 = artifacts.require("FlashTetherTRC20");

module.exports = function (deployer, network, accounts) {
    const initialSupply = 1000; // Başlangıç arzı
    const maxSupply = 100000; // Maksimum arz
    const feeWallet  = [0]; // Ücret cüzdanı
    const priceFeed = "0x3E7d1eAB13ad0104d2750B8863b489D65364e32D"; // ⚠️ Burada yanlış olabilir!
    
    deployer.deploy(FlashTetherTRC20, initialSupply, maxSupply, feeWallet, priceFeed);
};