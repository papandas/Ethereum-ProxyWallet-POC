App = {
  web3Provider: null,
  myProfile: {},
  contracts: {},
  account: '0x0',
  loading: false,

  init: function () {
    console.log("App initialized...")
    return App.initWeb3();
  },

  initWeb3: function () {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContracts();
  },

  initContracts: function () {
    $.getJSON("ProxyWallet.json", function (proxyWallet) {
      App.contracts.ProxyWallet = TruffleContract(proxyWallet);
      App.contracts.ProxyWallet.setProvider(App.web3Provider);
      App.contracts.ProxyWallet.deployed().then(function (proxyWallet) {
        console.log("Contract Address:", 'https://rinkeby.etherscan.io/address/' + proxyWallet.address);
      });

      return App.render();
    })
  },

  render: function () {
    if (App.loading) {
      return;
    }
    App.loading = true;

    var loader = $('#loader');
    var content = $('#content');

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        console.log("Account Address:", 'https://rinkeby.etherscan.io/address/' + account);
      }
    });

    App.LoadLandingPage();
  },

  LoadLandingPage: function () {
    App.contracts.ProxyWallet.deployed().then(function (instance) {
      ProxyWalletInstance = instance;
      return ProxyWalletInstance.version();
    }).then((version) => {
      console.log("Version: " + version);

      let addr = web3.eth.accounts[0]
      console.log(addr);
      let msg = 'I really did make this message'

      let signature = web3.eth.sign(addr, '0x' + App.toHex(msg))

      console.log(signature)
    })
  },

  toHex: function (str) {

    var hex = ''

    for (var i = 0; i < str.length; i++) {

      hex += '' + str.charCodeAt(i).toString(16)

    }

    return hex

  }





}

$(function () {
  $(window).load(function () {
    App.init();
  })
});
