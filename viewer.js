import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const MOCK_PRICE_FEED_ADDRESS = 'TSywCWhWogVU8An5TVZmZbvEZfmaS9BBDM';
const MOCK_PRICE_FEED_ABI = [
    {
        inputs: [],
        name: 'latestRoundData',
        outputs: [
            { internalType: 'uint80', name: 'roundId', type: 'uint80' },
            { internalType: 'int256', name: 'price', type: 'int256' },
            { internalType: 'uint256', name: 'startedAt', type: 'uint256' },
            { internalType: 'uint256', name: 'updatedAt', type: 'uint256' },
            { internalType: 'uint80', name: 'answeredInRound', type: 'uint80' },
        ],
        stateMutability: 'view',
        type: 'function',
    },
];

export default function TokenPriceViewer() {
    const [price, setPrice] = useState(null);
    
    useEffect(() => {
        const fetchPrice = async () => {
            try {
                const tronWeb = window.tronWeb;
                if (!tronWeb || !tronWeb.defaultAddress.base58) {
                    console.error('TronLink not connected');
                    return;
                }
                
                const contract = await tronWeb.contract(MOCK_PRICE_FEED_ABI, MOCK_PRICE_FEED_ADDRESS);
                const data = await contract.latestRoundData().call();
                const fetchedPrice = parseInt(data.price) / 1e8;
                setPrice(fetchedPrice.toFixed(2));
            } catch (error) {
                console.error('Fiyat alınamadı:', error);
            }
        };
        
        fetchPrice();
        const interval = setInterval(fetchPrice, 10000); // 10 saniyede bir güncelle
        return () => clearInterval(interval);
    }, []);
    
    return (
        <div className="p-4 max-w-md mx-auto mt-10 text-center rounded-2xl shadow-xl bg-white">
            <h1 className="text-2xl font-bold mb-2">USDTz Token Fiyatı</h1>
            {price !== null ? (
                <p className="text-xl">${price} USD</p>
            ) : (
                 <p className="text-gray-500">Fiyat yükleniyor...</p>
             )}
        </div>
    );
}
