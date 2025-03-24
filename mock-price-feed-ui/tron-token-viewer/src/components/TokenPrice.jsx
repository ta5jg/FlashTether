import React, { useEffect, useState } from 'react';
import TronWeb from 'tronweb';

const PriceViewer = () => {
    const [price, setPrice] = useState(null);
    const [balance, setBalance] = useState(null);
    const [usdValue, setUsdValue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const priceFeedAddress = "TSywCWhWogVU8An5TVZmZbvEZfmaS9BBDM"; // MockPriceFeed
    const tokenAddress = "TU5wtivZ2wPi3AzXpPJrnDHnVQgkqr8LcB"; // FlashTetherTRC20
    
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            if (!window.tronWeb || !window.tronWeb.ready) {
                setError("TronLink cüzdanı bağlı değil veya erişilemiyor.");
                setLoading(false);
                return;
            }
            
            const tronWeb = window.tronWeb;
            
            const priceFeedContract = await tronWeb.contract().at(priceFeedAddress);
            const tokenContract = await tronWeb.contract().at(tokenAddress);
            
            const roundData = await priceFeedContract.latestRoundData().call();
            const rawPrice = roundData.price;
            const formattedPrice = Number(rawPrice) / 100000000;
            setPrice(formattedPrice);
            
            const account = tronWeb.defaultAddress.base58;
            const balanceData = await tokenContract.balanceOf(account).call();
            const tokenBalance = Number(balanceData.toString()) / 1e6;
            setBalance(tokenBalance);
            
            const totalUSD = tokenBalance * formattedPrice;
            setUsdValue(totalUSD.toFixed(2));
        } catch (err) {
            setError("Fiyat okunamadı: " + err.message);
        }
        
        setLoading(false);
    };
    
    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);
    
    return (
        <div className="p-4 max-w-xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Hello from Flash Tether App!</h1>
            <div className="bg-gray-800 text-white p-6 rounded-2xl shadow-xl">
                <h2 className="text-xl font-semibold mb-2">Flash Tether USD Fiyatı</h2>
                {loading ? (
                    <p className="text-gray-400">Fiyat alınıyor...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : (
                        <>
                            <p className="text-green-400 text-2xl">Güncel Fiyat: ${price}</p>
                            <p className="mt-2 text-sm">Cüzdan Bakiyesi: {balance} USDTz</p>
                            <p className="text-sm text-blue-300">USD Karşılığı: ${usdValue}</p>
                        </>
                    )}
                <button
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl"
                    onClick={fetchData}
                >
                    Yenile
                </button>
            </div>
        </div>
    );
};

export default PriceViewer;
