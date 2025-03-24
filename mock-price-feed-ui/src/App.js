import React, { useEffect, useState } from "react";
import TronWeb from "tronweb";

const CONTRACT_ADDRESS = "TSywCWhWogVU8An5TVZmZbvEZfmaS9BBDM"; // MockPriceFeed address
const ABI = [
  {
    "inputs": [],
    "name": "latestRoundData",
    "outputs": [
      { "internalType": "uint80", "name": "roundId", "type": "uint80" },
      { "internalType": "int256", "name": "price", "type": "int256" },
      { "internalType": "uint256", "name": "startedAt", "type": "uint256" },
      { "internalType": "uint256", "name": "timeStamp", "type": "uint256" },
      { "internalType": "uint80", "name": "answeredInRound", "type": "uint80" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

function App() {
  const [price, setPrice] = useState(null);
  const [tronWeb, setTronWeb] = useState(null);
  
  useEffect(() => {
    const init = async () => {
      if (window.tronWeb && window.tronWeb.ready) {
        setTronWeb(window.tronWeb);
      } else {
        console.warn("TronLink yüklü değil veya bağlı değil.");
      }
    };
    init();
  }, []);
  
  useEffect(() => {
    if (tronWeb) {
      const fetchPrice = async () => {
        try {
          const contract = await tronWeb.contract(ABI, CONTRACT_ADDRESS);
          const data = await contract.latestRoundData().call();
          const priceInt = parseInt(data.price._hex);
          setPrice((priceInt / 1e8).toFixed(2)); // USD formatına çevir
        } catch (err) {
          console.error("Fiyat alınamadı:", err);
        }
      };
      
      fetchPrice();
      const interval = setInterval(fetchPrice, 10000); // Her 10 saniyede bir güncelle
      return () => clearInterval(interval);
    }
  }, [tronWeb]);
  
  return (
      <div style={{ textAlign: "center", marginTop: "50px", fontFamily: "Arial" }}>
        <h1>🟢 USDTz Token Fiyatı</h1>
        {price !== null ? (
            <h2>{price} USD</h2>
        ) : (
             <p>Fiyat yükleniyor... Lütfen TronLink'e bağlanın.</p>
         )}
      </div>
  );
}

export default App;