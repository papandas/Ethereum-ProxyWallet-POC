var ProxyWallet = artifacts.require("./ProxyWallet.sol");

const account_one = "0xbF7EED930bfdafe97F76d2744A88F6b0E2835e82";
const account_two = "0x1bb8170DaD52EA162E074BC0BaA139dEeD15b5a6";

module.exports = function(deployer) {
  deployer.deploy(ProxyWallet, [account_one, account_two], "username", "privatekey" );
};
