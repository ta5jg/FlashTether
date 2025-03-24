import React, { useEffect, useState } from 'react'
import TronWeb from 'tronweb'

// 👇 Ana kontrat adresini buraya gir (Mainnet ya da Shasta)
const PRICE_FEED_ADDRESS = 'TLPSWiouRf4Y8ZPmmCCbya12d1TKVfipwJ' // <- Güncel adres

const PriceViewer = () => {
    const [price, setPrice] = useState(null)
    const [error, setError] = useState(null)
    const [priceChange, setPriceChange] = useState(null)
    const [balance, setBalance] = useState(null)

    useEffect(() => {
        let intervalId

        const fetchPrice = async () => {
            try {
                if (!window.tronWeb || !window.tronWeb.ready) {
                    setError('TronLink cüzdanı bağlı değil veya erişilemiyor.')
                    return
                }

                const tronWeb = window.tronWeb
                const contract = await tronWeb.contract().at(PRICE_FEED_ADDRESS)
                const roundData = await contract.latestRoundData().call()

                const rawPrice = roundData.price.toString()
                const formatted = (parseInt(rawPrice) / 100000000).toFixed(2)

                setPrice(prev => {
                    if (prev && formatted > prev) {
                        setPriceChange('up')
                    } else if (prev && formatted < prev) {
                        setPriceChange('down')
                    } else {
                        setPriceChange(null)
                    }
                    return formatted
                })

                const userAddress = tronWeb.defaultAddress.base58
                const tokenContract = await tronWeb.contract().at('TU5wtivZ2wPi3AzXpPJrnDHnVQgkqr8LcB')
                const rawBalance = await tokenContract.balanceOf(userAddress).call()
                const balanceFormatted = (rawBalance.toNumber() / 10 ** 6).toFixed(2)
                setBalance(balanceFormatted)
            } catch (err) {
                console.error('⚠️ Fiyat okunamadı:', err.message)
                setError('Fiyat okunamadı: ' + err.message)
            }
        }

        fetchPrice()
        intervalId = setInterval(fetchPrice, 10000)

        return () => clearInterval(intervalId)
    }, [])

    const priceStyle = {
        color:
            priceChange === 'up'
                ? 'limegreen'
                : priceChange === 'down'
                ? 'red'
                : 'white',
        fontWeight: 'bold',
        fontSize: '1.2rem'
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <h2 style={{ color: '#ffd700', fontSize: '1.8rem', marginBottom: '1rem' }}>Flash Tether USD Fiyatı</h2>
            {error && <p style={{ color: 'red', marginTop: '0.5rem' }}>{error}</p>}
            {price ? (
                <p style={priceStyle}>
                    Güncel Fiyat: ${price}{' '}
                    {priceChange === 'up' && <span style={{ color: 'limegreen' }}>🔼</span>}
                    {priceChange === 'down' && <span style={{ color: 'red' }}>🔽</span>}
                </p>
            ) : (
                !error && <p>Fiyat alınıyor…</p>
            )}
            {balance && (
                <p style={{ color: 'lightblue', marginTop: '0.5rem' }}>
                    Cüzdan Bakiyesi: {balance} USDTz ≈ ${(balance * price).toFixed(2)} USD
                </p>
            )}
        </div>
    )
}

export default PriceViewer