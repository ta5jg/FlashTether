const Migrations = artifacts.require("Migrations");

module.exports = function (deployer) {
  contracts_build_directory: "./build/contracts"  // BU SATIRI EKLEYİN
  deployer.deploy(Migrations);
};