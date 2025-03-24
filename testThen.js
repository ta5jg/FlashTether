const FlashTetherTRC20 = artifacts.require("FlashTetherTRC20");

FlashTetherTRC20.deployed()
                .then(instance => instance.testLatestPrice())
                .then(result => {
                    console.log("Fiyat:", result[0].toString(), "Başarılı mı?", result[1]);
                })
                .catch(error => {
                    console.error("Hata:", error);
                });