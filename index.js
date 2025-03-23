require("dotenv").config();
const express = require("express");
const Web3 = require("web3");

const app = express();
app.use(express.json());
app.use(require("cors")());

const web3 = new Web3("https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID");
const contractABI = [ /* Sözleşme ABI'si buraya gelecek */ ];
const contractAddress = "0xYourContractAddress";
const tokenDecimals = 6;

const contract = new web3.eth.Contract(contractABI, contractAddress);

app.get("/balance/:wallet", async (req, res) => {
    try {
        const wallet = req.params.wallet;
        const tokenBalance = await contract.methods.balanceOf(wallet).call();
        const pricePerToken = await contract.methods.usdPricePerToken().call();
        
        const balanceInTokens = tokenBalance / (10 ** tokenDecimals);
        const balanceInUSD = (balanceInTokens * pricePerToken) / (10 ** tokenDecimals);
        
        res.json({ wallet, balance: balanceInTokens, usdValue: balanceInUSD });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));