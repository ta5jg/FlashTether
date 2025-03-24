const path = require("path");
require('dotenv').config();
const TronWeb = require('tronweb');

// .env dosyasından özel anahtarı al
const privateKey = process.env.PRIVATE_KEY_SHASTA;

// TronWeb nesnesini oluştur
const tronWeb = new TronWeb({
                              fullHost: 'https://api.shasta.trongrid.io',
                              privateKey
                            });

// Private key'den Base58 adres türet
const walletAddress = tronWeb.address.fromPrivateKey(privateKey);

module.exports = {
  contracts_directory: "./contracts",
  contracts_build_directory: path.join(__dirname, "build/contracts"),
  networks: {
    shasta: {
      privateKey,  // Private key burada kalıyor ama doğrudan adres olarak kullanılmayacak
      address: walletAddress,  // Özel anahtardan doğru formatta türetilmiş adres
      userFeePercentage: 50,
      feeLimit: 1000 * 1e6,
      fullHost: 'https://api.shasta.trongrid.io',
      network_id: '2'
    },
  },
  compilers: {
    solc: {
      version: '0.8.0',
    },
  },
};