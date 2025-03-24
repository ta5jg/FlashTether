import { useEffect, useState } from "react";
import TronWeb from "tronweb";
import tokenAbi from "../abi/FlashTetherTRC20.json";
import priceFeedAbi from "../abi/MockPriceFeed.json";

const tokenAddress = "TQRxLWhxnoUv8aSJZwdLYAjWCv9on8SqHX"; // FlashTetherTRC20
const priceFeedAddress = "TLPSWiouRf4Y8ZPmmCCbya12d1TKVfipwJ"; // MockPriceFeed
const trackedWallet = "TCCDA8P8z7ZK3Dy2ytHW9iL4uE57Kbmnng";

const formatNumber = (number) => {
    return new Intl.NumberFormat("en-US", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(number);
};

export default function BalanceViewer() {
    const [price, setPrice] = useState(null);
    const [walletBalance, setWalletBalance] = useState(null);
    const [trackedBalance, setTrackedBalance] = useState(null);
    const [error, setError] = useState("");
    
    useEffect(() => {
        async function fetchPriceAndBalance() {
            try {
                if (!window.tronWeb || !window.tronWeb.defaultAddress.base58) {
                    setError("TronLink cüzdanı bağlı değil.");
                    return;
                }
                
                const tronWeb = window.tronWeb;
                const account = tronWeb.defaultAddress.base58;
                
                const tokenContract = await tronWeb.contract(tokenAbi.abi, tokenAddress);
                const feedContract = await tronWeb.contract(priceFeedAbi.abi, priceFeedAddress);
                
                const latestData = await feedContract.latestRoundData().call();
                const rawPrice = Number(latestData.price.toString());
                const usdPrice = rawPrice / 100000000;
                
                setPrice(usdPrice);
                
                const balance = await tokenContract.balanceOf(account).call();
                const tracked = await tokenContract.balanceOf(trackedWallet).call();
                
                setWalletBalance(Number(balance.toString()) / 10 ** 6);
                setTrackedBalance(Number(tracked.toString()) / 10 ** 6);
            } catch (err) {
                setError("Fiyat veya bakiye okunamadı: " + err.message);
            }
        }
        
        fetchPriceAndBalance();
    }, []);
    
    return (
        <div style={{ color: "white", padding: "2rem" }}>
            <h1 style={{ color: "#ffd700" }}>Flash Tether USD Fiyatı</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            
            {price !== null && (
                <>
                    <h2>Güncel Fiyat: ${formatNumber(price)}</h2>
                    {walletBalance !== null && (
                        <p>
                            Bağlı Cüzdan Bakiyesi: {formatNumber(walletBalance)} USDTz ≈ $
                            {formatNumber(walletBalance * price)} USD
                        </p>
                    )}
                    {trackedBalance !== null && (
                        <p style={{ color: "#90caf9" }}>
                            İzlenen Cüzdan Bakiyesi: {formatNumber(trackedBalance)} USDTz ≈ $
                            {formatNumber(trackedBalance * price)} USD
                        </p>
                    )}
                </>
            )}
        </div>
    );
}