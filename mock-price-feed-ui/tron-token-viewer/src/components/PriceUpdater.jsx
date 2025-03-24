// src/components/PriceViewer.jsx
import React, { useEffect, useState } from 'react';
import TronWeb from 'tronweb';

const CONTRACT_ADDRESS = 'TSywCWhWogVU8An5TVZmZbvEZfmaS9BBDM';
const ABI = [
    {
        "inputs": [],
        "name": "latestRoundData",
        "outputs": [
            { "internalType": "uint80", "name": "roundId", "type": "uint80" },
            { "internalType": "int256", "name": "price", "type": "int256" },
            { "internalType": "uint256", "name": "startedAt", "type": "uint256" },
            { "internalType": "uint256", "name": "updatedAt", "type": "uint256" },
            { "internalType": "uint80", "name": "answeredInRound", "type": "uint80" }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

const PriceViewer = () => {
    const [price, setPrice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const getPrice = async () => {
        try {
            setLoading(true);
            setError(null);
            
            if (!window.tronWeb || !window.tronWeb.ready) {
                throw new Error('TronLink cüzdanı bağlı değil veya erişilemiyor.');
            }
            
            const contract = await window.tronWeb.contract(ABI, CONTRACT_ADDRESS);
            const data = await contract.latestRoundData().call();
            
            const rawPrice = data.price.toString();
            const formattedPrice = (parseInt(rawPrice) / 100000000).toFixed(2);
            setPrice(formattedPrice);
        } catch (err) {
            console.error('Fiyat okunamadı:', err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        getPrice();
        const interval = setInterval(() => {
            getPrice();
        }, 30000); // 30 saniyede bir yenile
        return () => clearInterval(interval);
    }, []);
    
    return (
        <div>
            <h2>Flash Tether USD Fiyatı</h2>
            {loading ? (
                <p>Fiyat alınıyor...</p>
            ) : error ? (
                <p style={{ color: 'red' }}>Fiyat okunamadı: {error}</p>
            ) : (
                    <p>Güncel Fiyat: <strong>${price}</strong></p>
                )}
            <button onClick={getPrice} style={{ marginTop: '10px' }}>Fiyatı Yenile</button>
        </div>
    );
};

export default PriceViewer;
