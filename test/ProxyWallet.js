var ProxyWallet = artifacts.require("./ProxyWallet.sol");

var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));

contract('Initialize ProxyWallet Smart-Contract.', function (accounts) {

    it("Initialized the ProxyWallet project.", function () {
        return ProxyWallet.deployed().then(function (instance) {
            ProxyWalletInstance = instance;
            return ProxyWalletInstance.version();
        }).then((version) => {
            assert.equal(version, "0.0.1", 'Correct version.');
        })
    });

    it("Check owner account hash.", function () {
        return ProxyWallet.deployed().then(function (instance) {
            ProxyWalletInstance = instance;
            return ProxyWalletInstance.owner();
        }).then((owner) => {
            //console.log(owner);
            assert.equal(owner, accounts[0], 'Correct owner.');
        })
    });

    it("Save & Check administrators account.", function () {
        return ProxyWallet.deployed().then(function (instance) {
            ProxyWalletInstance = instance;
            return ProxyWalletInstance.addAdministrator(accounts[2], { from: accounts[0] });
        }).then((receipt) => {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'AdministratorAdded', 'should be the "AdministratorAdded" event');
            assert.equal(receipt.logs[0].args.admin, accounts[2], 'correct admin account added.');

            return ProxyWalletInstance.addAdministrator(accounts[1], { from: accounts[0] });
        }).then(assert.fail).catch(function (error) {
            assert(error.message.indexOf('revert') >= 0, 'Admin account already exist.');

            return ProxyWalletInstance.getAllAdministrators()
        }).then((reply) => {
            assert.equal(reply.length, 3, 'correct length of admin accounts.');
        })
    });

    it("Check account has Eth balance.", function () {
        return ProxyWallet.deployed().then(function (instance) {
            ProxyWalletInstance = instance;
            return web3.eth.getBalance(accounts[0])
        }).then((balance)=>{
            console.log(web3.utils.fromWei(balance));
        })

    })

})