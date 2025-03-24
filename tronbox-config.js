module.exports = {
    contracts_directory: "./contracts",
    contracts_build_directory: "./build/contracts",
    networks: {
        shasta: {
            privateKey: process.env.PRIVATE_KEY_SHASTA,
            fullHost: "https://api.shasta.trongrid.io",
            network_id: "2",
        },
    },
    compilers: {
        solc: {
            version: "0.8.0",
        },
    },
};
