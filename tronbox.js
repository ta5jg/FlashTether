const path = require("path");
require('dotenv').config();
const TronWeb = require('tronweb');

// Mainnet ve Shasta için ayrı private key tanımı
const privateKeyMainnet = process.env.PRIVATE_KEY_MAINNET;
const privateKeyShasta = process.env.PRIVATE_KEY_SHASTA;

const tronWebMainnet = new TronWeb({
                                     fullHost: 'https://api.trongrid.io',
                                     privateKey: privateKeyMainnet,
                                   });

const tronWebShasta = new TronWeb({
                                    fullHost: 'https://api.shasta.trongrid.io',
                                    privateKey: privateKeyShasta,
                                  });

module.exports = {
  contracts_directory: "./contracts",
  contracts_build_directory: path.join(__dirname, "build/contracts"),
  networks: {
    mainnet: {
      privateKey: privateKeyMainnet,
      address: tronWebMainnet.address.fromPrivateKey(privateKeyMainnet),
      userFeePercentage: 50,
      feeLimit: 1000 * 1e6,
      fullHost: 'https://api.trongrid.io',
      network_id: '1',
    },
    shasta: {
      privateKey: privateKeyShasta,
      address: tronWebShasta.address.fromPrivateKey(privateKeyShasta),
      userFeePercentage: 50,
      feeLimit: 1000 * 1e6,
      fullHost: 'https://api.shasta.trongrid.io',
      network_id: '2',
    },
  },
  compilers: {
    solc: {
      version: '0.8.0',
    },
  },
};