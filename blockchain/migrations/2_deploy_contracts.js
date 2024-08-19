const PGHD = artifacts.require("PGHD");

module.exports = function(deployer) {
  deployer.deploy(PGHD);
};
