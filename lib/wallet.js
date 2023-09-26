'use strict';
const request = require('request-promise');
const http = require('http');

class Wallet {
    constructor(hostname, port, user, pass, timeout) {
        this.hostname = hostname || '127.0.0.1';
        this.port = port || 18082;
        this.user = user || '';
        this.pass = pass || '';
        this.timeout = timeout || 5000;
    }

    init() {
        return this._request('get_balance')
            .then((result) => {
                console.log('Initialization successful:', result);
            })
            .catch((error) => {
                console.error('Initialization failed:', error);
                throw error;
            });
    }
}

// general API wallet request
Wallet.prototype._request = function (method, params = '') {
    let options = {
        forever: true,
        timeout: this.timeout,
        json: {'jsonrpc': '2.0', 'id': '0', 'method': method},
        agent: new http.Agent({
            keepAlive: true,
            maxSockets: 1
        })
    };

    if (params) {
        options['json']['params'] = params;
    }
    if (this.user) {
        options['auth'] = {
            'user': this.user,
            'pass': this.pass,
            'sendImmediately': false
        }
    }
    return request.post(`http://${this.hostname}:${this.port}/json_rpc`, options)
        .then((result) => {
            if (result.hasOwnProperty('result')) {
                return result.result;
            } else {
                return result;
            }
        })
        .catch((error) => {
            throw new Error('Server is not reachable.');
        });
};

/**
 * Wallet Methods
 * @type {Wallet}
 */

// creates a new wallet
Wallet.prototype.create_wallet = function(filename, password, language) {
    let method = 'create_wallet';
    let params = {
        filename: filename || 'haven_wallet',
        'password': password || '',
        'language': language || 'English'
    };
    return this._request(method, params);
};

// open a wallet
Wallet.prototype.open_wallet = function(filename, password) {
    let method = 'open_wallet';
    let params = {
        filename: filename || 'haven_wallet',
        'password': password || ''
    };
    return this._request(method, params);
};

// returns the wallet's current block height.
Wallet.prototype.get_height = function() {
    let method = 'get_height';
    return this._request(method);
};

// stops the wallet
Wallet.prototype.stop_wallet = function() {
    let method = 'stop_wallet';
    return this._request(method);
};

// returns the wallet balance
Wallet.prototype.get_balance = function(asset_name = 'XHV', account_index = 0, address_indices = 0) {
    let method = 'get_balance';
    let params = {};
    params.asset_type = asset_name;
    params.account_index = account_index;
    params.address_indices = address_indices;
    return this._request(method, params);
};

// return the wallet address
Wallet.prototype.get_address = function(account_index = 0, address_indices = 0) {
    let method = 'get_address';
    let params = {};
    params.account_index = account_index;
    params.address_indices = address_indices;
    return this._request(method, params);
};

// create a wallet account
Wallet.prototype.create_account = function(tag = '') {
    let method = 'create_account';
    let params = {};
    params.tag = tag;
    return this._request(method, params);
};

// label a wallet account
Wallet.prototype.label_account = function(account_index = 0, label = '') {
    let method = 'label_account';
    let params = {};
    params.account_index = account_index;
    params.label = label;
    return this._request(method, params);
};

// get account tags
Wallet.prototype.get_account_tags = function() {
    let method = 'get_account_tags';
    return this._request(method);
};

// tag a wallet account(s)
Wallet.prototype.tag_accounts = function(tag = '', accounts = []) {
    let method = 'tag_accounts';
    let params = {};
    params.tag = tag;
    params.account = accounts;
    return this._request(method, params);
};

// untag a wallet account(s)
Wallet.prototype.untag_accounts = function(accounts = []) {
    let method = 'untag_accounts';
    let params = {};
    params.account = accounts;
    return this._request(method, params);
};

// set description for an account tag.
Wallet.prototype.set_account_tag_description = function(tag = '', description = '') {
    let method = 'set_account_tag_description';
    let params = {};
    params.tag = tag;
    params.description = description;
    return this._request(method, params);
};

// create a wallet subaddress
Wallet.prototype.create_address = function(account_index = 0, label = '') {
    let method = 'create_address';
    let params = {};
    params.account_index = account_index;
    params.label = label;
    return this._request(method, params);
};

// label a wallet subaddress
Wallet.prototype.label_address = function(account_index = 0, address_indices = 0, label = '') {
    let method = 'label_address';
    let params = {};
    params.index = {'major': account_index, 'minor': address_indices};
    params.label = label;
    return this._request(method, params);
};

// transfer Haven to a single recipient, or a group of recipients
Wallet.prototype.transfer = function(destinations, account_index = 0, subaddr_indices = 0, options) {
    if(typeof options === 'undefined') options = {};
    if(Array.isArray(destinations)) {
        destinations.forEach((dest) => dest.amount = convert(dest.amount));
    } else {
        destinations.amount = convert(destinations.amount);
        destinations = [destinations];
    }
    let method = 'transfer';
    let params = {
        destinations: destinations,
        account_index: account_index,
        subaddr_indices: subaddr_indices,
        priority: parseInt(options.priority) || 0,
        mixin: parseInt(options.mixin) || 10,
        ring_size: parseInt(options.ring_size) || 11,
        unlock_time: parseInt(options.unlockTime) || 0,
        do_not_relay: options.do_not_relay || false,
        get_tx_hex: options.get_tx_hex || false,
        get_tx_keys: options.get_tx_key || false,
        get_tx_metadata: options.get_tx_metadata || false
    };
    return this._request(method, params);
};

// split a transfer into more than one tx if necessary
Wallet.prototype.transfer_split = function(destinations, account_index = 0, subaddr_indices = 0, options) {
    if(typeof options === 'undefined') options = {};
    if(Array.isArray(destinations)) {
        destinations.forEach((dest) => dest.amount = convert(dest.amount));
    } else {
        destinations.amount = convert(destinations.amount);
        destinations = [destinations];
    }
    let method = 'transfer_split';
    let params = {
        destinations: destinations,
        account_index: account_index,
        subaddr_indices: subaddr_indices,
        priority: parseInt(options.priority) || 0,
        mixin: parseInt(options.mixin) || 10,
        ring_size: parseInt(options.ring_size) || 11,
        unlock_time: parseInt(options.unlockTime) || 0,
        do_not_relay: options.do_not_relay || false,
        get_tx_hex: options.get_tx_hex || false,
        get_tx_keys: options.get_tx_key || false,
        get_tx_metadata: options.get_tx_metadata || false,
        new_algorithm: options.new_algorithm || false
    };
    return this._request(method, params);
};

// send all dust outputs back to the wallet
Wallet.prototype.sweep_dust = function() {
    let method = 'sweep_dust';
    return this._request(method);
};

// send all outputs to an address
Wallet.prototype.sweep_all = function(address, account_index= 0, subaddr_indices = 0, options) {
    let method = 'sweep_all';
    let params = {
        address: address,
        account_index: account_index,
        subaddr_indices: subaddr_indices,
        priority: parseInt(options.priority) || 0,
        mixin: parseInt(options.mixin) || 10,
        ring_size: parseInt(options.ring_size) || 11,
        unlock_time: parseInt(options.unlockTime) || 0,
        do_not_relay: options.do_not_relay || false,
        get_tx_hex: options.get_tx_hex || false,
        get_tx_keys: options.get_tx_key || false,
        get_tx_metadata: options.get_tx_metadata || false
    };
    if(typeof options.below_amount === 'number') params.below_amount = options.below_amount;

    return this._request(method, params);
};

// send all of a specific unlocked output to an address.
Wallet.prototype.sweep_single = function(address, key_image, account_index= 0, subaddr_indices = 0, options) {
    let method = 'sweep_single';
    let params = {
        address: address,
        key_image: key_image,
        account_index: account_index,
        subaddr_indices: subaddr_indices,
        priority: parseInt(options.priority) || 0,
        mixin: parseInt(options.mixin) || 10,
        ring_size: parseInt(options.ring_size) || 11,
        unlock_time: parseInt(options.unlockTime) || 0,
        do_not_relay: options.do_not_relay || false,
        get_tx_hex: options.get_tx_hex || false,
        get_tx_keys: options.get_tx_key || false,
        get_tx_metadata: options.get_tx_metadata || false
    };
    if(typeof options.below_amount === 'number') params.below_amount = options.below_amount;

    return this._request(method, params);
};

// haven onshore
Wallet.prototype.onshore = function(destinations, account_index = 0, subaddr_indices = 0, options) {
    if(typeof options === 'undefined') options = {};
    if(Array.isArray(destinations)) {
        destinations.forEach((dest) => dest.amount = convert(dest.amount));
    } else {
        destinations.amount = convert(destinations.amount);
        destinations = [destinations];
    }
    let method = 'onshore';
    let params = {
        destinations: destinations,
        account_index: account_index,
        subaddr_indices: subaddr_indices,
        priority: parseInt(options.priority) || 0,
        mixin: parseInt(options.mixin) || 10,
        ring_size: parseInt(options.ring_size) || 11,
        unlock_time: parseInt(options.unlockTime) || 0,
        do_not_relay: options.do_not_relay || false,
        get_tx_hex: options.get_tx_hex || false,
        get_tx_keys: options.get_tx_key || false,
        get_tx_metadata: options.get_tx_metadata || false,
        new_algorithm: options.new_algorithm || false
    };
    return this._request(method, params);
};

// haven offshore
Wallet.prototype.offshore = function(destinations, account_index = 0, subaddr_indices = 0, options) {
    if(typeof options === 'undefined') options = {};
    if(Array.isArray(destinations)) {
        destinations.forEach((dest) => dest.amount = convert(dest.amount));
    } else {
        destinations.amount = convert(destinations.amount);
        destinations = [destinations];
    }
    let method = 'offshore';
    let params = {
        destinations: destinations,
        account_index: account_index,
        subaddr_indices: subaddr_indices,
        priority: parseInt(options.priority) || 0,
        mixin: parseInt(options.mixin) || 10,
        ring_size: parseInt(options.ring_size) || 11,
        unlock_time: parseInt(options.unlockTime) || 0,
        do_not_relay: options.do_not_relay || false,
        get_tx_hex: options.get_tx_hex || false,
        get_tx_keys: options.get_tx_key || false,
        get_tx_metadata: options.get_tx_metadata || false,
        new_algorithm: options.new_algorithm || false
    };
    return this._request(method, params);
};

// same as transfer_split, but sends xUSD between wallets.
Wallet.prototype.offshore_transfer = function(destinations, account_index = 0, subaddr_indices = 0, options) {
    if(typeof options === 'undefined') options = {};
    if(Array.isArray(destinations)) {
        destinations.forEach((dest) => dest.amount = convert(dest.amount));
    } else {
        destinations.amount = convert(destinations.amount);
        destinations = [destinations];
    }
    let method = 'offshore_transfer';
    let params = {
        destinations: destinations,
        account_index: account_index,
        subaddr_indices: subaddr_indices,
        priority: parseInt(options.priority) || 0,
        mixin: parseInt(options.mixin) || 10,
        ring_size: parseInt(options.ring_size) || 11,
        unlock_time: parseInt(options.unlockTime) || 0,
        do_not_relay: options.do_not_relay || false,
        get_tx_hex: options.get_tx_hex || false,
        get_tx_keys: options.get_tx_key || false,
        get_tx_metadata: options.get_tx_metadata || false,
        new_algorithm: options.new_algorithm || false
    };
    return this._request(method, params);
};

// send all xusd outputs to an address
Wallet.prototype.offshore_sweep_all = function(address, account_index= 0, subaddr_indices = 0, options) {
    let method = 'offshore_sweep_all';
    let params = {
        address: address,
        account_index: account_index,
        subaddr_indices: subaddr_indices,
        priority: parseInt(options.priority) || 0,
        mixin: parseInt(options.mixin) || 10,
        ring_size: parseInt(options.ring_size) || 11,
        unlock_time: parseInt(options.unlockTime) || 0,
        do_not_relay: options.do_not_relay || false,
        get_tx_hex: options.get_tx_hex || false,
        get_tx_keys: options.get_tx_key || false,
        get_tx_metadata: options.get_tx_metadata || false
    };
    if(typeof options.below_amount === 'number') params.below_amount = options.below_amount;

    return this._request(method, params);
};

// haven xusd to xasset conversion
Wallet.prototype.xusd_to_xasset = function(destinations, convert_to, account_index = 0, subaddr_indices = 0, options) {
    if(typeof options === 'undefined') options = {};
    if(Array.isArray(destinations)) {
        destinations.forEach((dest) => dest.amount = convert(dest.amount));
    } else {
        destinations.amount = convert(destinations.amount);
        destinations = [destinations];
    }
    let method = 'xusd_to_xasset';
    let params = {
        destinations: destinations,
        asset_type: convert_to,
        account_index: account_index,
        subaddr_indices: subaddr_indices,
        priority: parseInt(options.priority) || 0,
        mixin: parseInt(options.mixin) || 10,
        ring_size: parseInt(options.ring_size) || 11,
        unlock_time: parseInt(options.unlockTime) || 0,
        do_not_relay: options.do_not_relay || false,
        get_tx_hex: options.get_tx_hex || false,
        get_tx_keys: options.get_tx_key || false,
        get_tx_metadata: options.get_tx_metadata || false,
        new_algorithm: options.new_algorithm || false
    };
    return this._request(method, params);
};

// haven xusd to xasset conversion
Wallet.prototype.xasset_to_xusd = function(destinations, convert_from, account_index = 0, subaddr_indices = 0, options) {
    if(typeof options === 'undefined') options = {};
    if(Array.isArray(destinations)) {
        destinations.forEach((dest) => dest.amount = convert(dest.amount));
    } else {
        destinations.amount = convert(destinations.amount);
        destinations = [destinations];
    }
    let method = 'xasset_to_xusd';
    let params = {
        destinations: destinations,
        asset_type: convert_from,
        account_index: account_index,
        subaddr_indices: subaddr_indices,
        priority: parseInt(options.priority) || 0,
        mixin: parseInt(options.mixin) || 10,
        ring_size: parseInt(options.ring_size) || 11,
        unlock_time: parseInt(options.unlockTime) || 0,
        do_not_relay: options.do_not_relay || false,
        get_tx_hex: options.get_tx_hex || false,
        get_tx_keys: options.get_tx_key || false,
        get_tx_metadata: options.get_tx_metadata || false,
        new_algorithm: options.new_algorithm || false
    };
    return this._request(method, params);
};

// same as transfer_split, but sends xAssets between wallets.
Wallet.prototype.xasset_transfer = function(destinations, asset_type, account_index = 0, subaddr_indices = 0, options) {
    if(typeof options === 'undefined') options = {};
    if(Array.isArray(destinations)) {
        destinations.forEach((dest) => dest.amount = convert(dest.amount));
    } else {
        destinations.amount = convert(destinations.amount);
        destinations = [destinations];
    }
    let method = 'xasset_transfer';
    let params = {
        destinations: destinations,
        asset_type: asset_type,
        account_index: account_index,
        subaddr_indices: subaddr_indices,
        priority: parseInt(options.priority) || 0,
        mixin: parseInt(options.mixin) || 10,
        ring_size: parseInt(options.ring_size) || 11,
        unlock_time: parseInt(options.unlockTime) || 0,
        do_not_relay: options.do_not_relay || false,
        get_tx_hex: options.get_tx_hex || false,
        get_tx_keys: options.get_tx_key || false,
        get_tx_metadata: options.get_tx_metadata || false,
        new_algorithm: options.new_algorithm || false
    };
    return this._request(method, params);
};

// get all wallet transfers
Wallet.prototype.get_transfers = function(tx_in, tx_out, tx_pending, tx_failed, tx_pool, filter_by_height, min_height, max_height, account_index= 0, subaddr_indices = 0, options) {
    let method = 'get_transfers';
    let params = {
        in: tx_in || false,
        out: tx_out || false,
        pending: tx_pending || false,
        failed: tx_failed || false,
        pool: tx_pool || false,
        filter_by_height: filter_by_height || false,
        min_height: parseInt(options.min_height),
        max_height: parseInt(options.max_height),
        account_index: account_index,
        subaddr_indices: subaddr_indices
    };

    return this._request(method, params);
};

// get all wallet transfers
Wallet.prototype.get_transfer_by_txid = function(txid, account_index= 0) {
    let method = 'get_transfer_by_txid';
    let params = {
        txid: txid,
        account_index: account_index
    };

    return this._request(method, params);
};

// get a list of incoming payments using a given payment ID
Wallet.prototype.getPayments = function(pid, types) {
    let method = 'get_payments';
    let params = {};
    params.payment_id = pid;
    params.types = types;
    return this._request(method, params);
};

// get a list of incoming payments using a single payment ID or list of payment IDs from a given height
Wallet.prototype.getBulkPayments = function(pids, minHeight, types) {
    let method = 'get_bulk_payments';
    let params = {};
    params.payment_ids = pids;
    params.min_block_height = minHeight;
    params.types = types;
    return this._request(method, params);
};

// return a list of incoming transfers to the wallet (type can be "all", "available", or "unavailable")
Wallet.prototype.incomingTransfers = function(type) {
    let method = 'incoming_transfers';
    let params = {};
    params.transfer_type = type;
    return this._request(method, params);
};

// return the spend key or view private key (type can be 'mnemonic' seed or 'view_key')
Wallet.prototype.queryKey = function(type) {
    let method = 'query_key';
    let params = {};
    params.key_type = type;
    return this._request(method, params);
};

// make an integrated address from the wallet address and a payment id
Wallet.prototype.integratedAddress = function(pid) {
    let method = 'make_integrated_address';
    let params = {};
    params.payment_id = pid;
    return this._request(method, params);
};

// retrieve the standard address and payment id from an integrated address
Wallet.prototype.splitIntegrated = function(address) {
    let method = 'split_integrated_address';
    let params = {};
    params.integrated_address = address;
    return this._request(method, params);
};

// return the current block height
Wallet.prototype.height = function() {
    let method = 'getheight';
    return this._request(method);
};

// stop the current process
Wallet.prototype.stopWallet = function() {
    let method = 'stop_wallet';
    return this._request(method);
};

// save the current wallet file
Wallet.prototype.store = function() {
    let method = 'store';
    return this._request(method);
};

module.exports = Wallet;

// helper function to convert Haven amount to atomic units
function convert(amount) {
    let number = Number(amount) * 1e12;
    // remove any decimals
    number = number.toFixed(0);
    return Number(number);
}
