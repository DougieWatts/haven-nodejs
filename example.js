var havenWallet = require('./lib/wallet');
var havenDaemon = require('./lib/dameon');

var Wallet = new havenWallet();
var Daemon = new havenDaemon();

// wallet examples

Wallet.create_wallet('haven_wallet').then(function(result){
    console.log(result);
});

Wallet.open_wallet('haven_wallet').then((result) => {
    console.log(result);
});

Wallet.get_address().then((result) => {
    console.log(result);
});

Wallet.get_balance().then((result) => {
    console.log(result);
})

// daemon examples

Daemon.getblockcount().then(function(result){
    console.log(result);
});
