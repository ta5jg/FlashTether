
// updatePrice.js

require("dotenv").config();
const TronWeb = require("tronweb");

// Ortamdan değerleri al
const privateKey = process.env.PRIVATE_KEY_SHASTA;
const contractAddress = process.env.MOCK_PRICE_FEED_ADDRESS;

const tronWeb = new TronWeb({
                                fullHost: "https://api.shasta.trongrid.io",
                                privateKey
                            });

async function updatePrice(newPriceInt) {
    try {
        const contract = await tronWeb.contract().at(contractAddress);
        const tx = await contract.setMockPrice(newPriceInt).send();
        console.log(`✅ Fiyat güncellendi: ${newPriceInt}`);
        console.log(`📦 İşlem ID: ${tx}`);
    } catch (error) {
        console.error("🚨 Hata oluştu:", error);
    }
}

// Komut satırından değer gönderildiyse çalıştır
const newPrice = process.argv[2];
if (!newPrice) {
    console.error("❌ Yeni fiyatı girmelisiniz. Örn: node updatePrice.js 101000000");
    process.exit(1);
}

updatePrice(parseInt(newPrice));
