// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface AggregatorV3Interface {
    function latestRoundData() external view returns (
        uint80 roundId,
        int price,
        uint startedAt,
        uint timeStamp,
        uint80 answeredInRound
    );
}

contract MockPriceFeed is AggregatorV3Interface {
    int private mockPrice = 100000000; // 1.00 USD

    function latestRoundData()
    public
    view
    override
    returns (
        uint80 roundId,
        int price,
        uint startedAt,
        uint timeStamp,
        uint80 answeredInRound
    )
    {
        return (1, mockPrice, block.timestamp, block.timestamp, 1);
    }

    // Fiyatı değiştirmek için bir fonksiyon
    function setMockPrice(int newPrice) external {
        mockPrice = newPrice;
    }
}