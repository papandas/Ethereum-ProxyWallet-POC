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

    function toHex(str) {
        var hex = ''
        for (var i = 0; i < str.length; i++) {
            hex += '' + str.charCodeAt(i).toString(16)
        }
        return hex
    }

    var node = web3.version.node;
    console.log('Using node=' + node);
    var testrpc = false;
    var geth = false;
    var parity = true;
    if (node === 'Geth') geth = true;
    if (node === 'EthereumJS TestRPC') testrpc = true;
    if (node === 'Parity') parity = true;

    console.log("testrpc=" + testrpc)

    async function generateSignature(address, message) {
        console.log('Generating signature');
        console.log('  address=' + address);
        if (testrpc) {
            var encoded = web3.utils.sha3(message);
        }
        if (geth || parity) {
            encoded = '0x' + Buffer.from(message).toString('hex');
        }
        console.log('  encoded message=' + encoded);
        return web3.eth.sign(address, encoded);
    }

    async function verifySignature(address, message, sig) {
        console.log('Verifying signature');
        console.log('  address=' + address);
        let encoded;

        if (testrpc) {
            //encoded = web3.sha3(message);
            encoded = util.hashPersonalMessage(util.toBuffer(web3.sha3(message)))
        } else if (geth || parity) {

            //encoded = web3.sha3('\x19Ethereum Signed Message:\n32' + web3.sha3(message).substr(2));
            encoded = util.hashPersonalMessage(util.toBuffer(web3.sha3(message)))

        }
        console.log('  encoded message=' + encoded.toString('hex'));
        if (sig.slice(0, 2) === '0x') sig = sig.substr(2);
        if (testrpc || geth) {
            var r = '0x' + sig.substr(0, 64);
            var s = '0x' + sig.substr(64, 64);
            var v = web3.toDecimal(sig.substr(128, 2)) + 27
        }
        if (parity) {
            v = '0x' + sig.substr(0, 2);
            r = '0x' + sig.substr(2, 64);
            s = '0x' + sig.substr(66, 64);
        }
        console.log('  r: ' + r);
        console.log('  s: ' + s);
        console.log('  v: ' + v);

        var ret = {};
        ret.r = r;
        ret.s = s;
        ret.v = v;
        ret.encoded = '0x' + encoded.toString('hex');
        return ret;
    }

    it("Recover the address and check signature.", function () {

        var address = accounts[0];
        console.log("owner=" + address);
        const message = 'Lorem ipsum mark mark dolor sit amet, consectetur adipiscing elit. Tubulum fuisse, qua illum, cuius is condemnatus est rogatione, P. Eaedem res maneant alio modo.';

        //var sig = await generateSignature(address, message);
        ///var ret = await verifySignature(address, message, sig);

        //var sig, ret;

        return ProxyWallet.deployed().then(async function (instance) {
            ProxyWalletInstance = instance;
            let sig = await generateSignature(address, message);
            console.log("sig =>", sig)
            let ret = await verifySignature(address, message, sig);
            return ProxyWalletInstance.recoverAddr(ret.encoded, ret.v, ret.r, ret.s)
        }).then((data)=>{
            console.log(data);
        })

    })


    /*it("Recover the address and check signature.", function () {
        let addr = accounts[0]
        let msg = 'I really did make this message'
        console.log(msg, addr)
        let signature = web3.eth.sign(addr, '0x' + toHex(msg))
        console.log(signature)

        signature = signature.substr(2);
        const r = '0x' + signature.slice(0, 64)
        const s = '0x' + signature.slice(64, 128)
        const v = '0x' + signature.slice(128, 130)
        const v_decimal = web3.toDecimal(v)

        let fixed_msg = `\x19Ethereum Signed Message:\n${msg.length}${msg}`
        let fixed_msg_sha = web3.sha3(fixed_msg)

        const message = web3.utils.sha3('\x19Ethereum Signed Message:\n32' + 'Message to sign here.');
        const unlockedAccount = accounts[0];
        const signature = web3.eth.sign(unlockedAccount, message).slice(2);
        console.log(signature)
        r = signature.slice(0, 64)
        s = '0x' + signature.slice(64, 128)
        v = web3.toDecimal(signature.slice(128, 130)) + 27;

        return ProxyWallet.deployed().then(function (instance) {
            ProxyWalletInstance = instance;
            return ProxyWalletInstance.recoverAddr(message, v, r, s);
        }).then((receipt) => {
            console.log(unlockedAccount);
            console.log(receipt);
        })

    })*/


})