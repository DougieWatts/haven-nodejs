'use strict';
const request = require('request-promise');
const http = require('http');

class Daemon {
    constructor(hostname, port, user, pass, timeout) {
        this.hostname = hostname || '127.0.0.1';
        this.port = port || 18082;
        this.user = user || '';
        this.pass = pass || '';
        this.timeout = timeout || 5000;
    }

    init() {
        return this._request('get_info')
            .then((result) => {
                // Proceed
            })
            .catch((error) => {
                // Proceed
            });
    }
}

// general API daemon request
Daemon.prototype._request = function (method, params = '', interfaceName = 'json_rpc') {
    let options = {
        forever: true,
        timeout: this.timeout,
        agent: new http.Agent({
            keepAlive: true,
            maxSockets: 1
        })
    };
    if (interfaceName === 'json_rpc') {
        options.json = {'jsonrpc': '2.0', 'id': '0', 'method': method};
    }

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
    return request.post(`http://${this.hostname}:${this.port}/${interfaceName}`, options)
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
 *
 * Look up how many blocks are in the longest chain known to the node
 *
 * @param  none
 *
 * @return object  Example: {
 *   "count": 993163,
 *   "status": "OK"
 * }
 *
 */

Daemon.prototype.getblockcount = function() {
    let method = 'getblockcount';
    return this._request(method);
};

/**
 *
 * Get the coinbase amount and the fees amount for n last blocks starting at particular height
 *
 *
 * @return object
 *
 */

Daemon.prototype.get_coinbase_tx_sum = function(height, count) {
    let method = 'get_coinbase_tx_sum';
    let params = {};
    params.height = height || 0;
    params.count = count || 1;
    return this._request(method, params);
};

/**
 *
 * Look up a block's hash by its height
 *
 * @param  number  $height   Height of block to look up
 *
 * @return string  Example: 'e22cf75f39ae720e8b71b3d120a5ac03f0db50bba6379e2850975b4859190bc6'
 *
 */

Daemon.prototype.on_getblockhash = function(height) {
    let method = 'on_getblockhash';
    let params = {};
    params.height = height || 0;
    return this._request(method, params);
};

/**
 *
 * Look up the block header of the latest block in the longest chain known to the node
 *
 * @param  none
 *
 * @return object  Example: {
 *   "block_header": {
 *     "depth": 0,
 *     "difficulty": 746963928,
 *     "hash": "ac0f1e226268d45c99a16202fdcb730d8f7b36ea5e5b4a565b1ba1a8fc252eb0",
 *     "height": 990793,
 *     "major_version": 1,
 *     "minor_version": 1,
 *     "nonce": 1550,
 *     "orphan_status": false,
 *     "prev_hash": "386575e3b0b004ed8d458dbd31bff0fe37b280339937f971e06df33f8589b75c",
 *     "reward": 6856609225169,
 *     "timestamp": 1457589942
 *   },
 *   "status": "OK"
 * }
 *
 */

Daemon.prototype.getlastblockheader = function() {
    let method = 'getlastblockheader';
    return this._request(method);
};

/**
 *
 * Look up a block header from a block hash
 *
 * @param  string  $hash  The block's SHA256 hash
 *
 * @return object  Example: {
 *   "block_header": {
 *     "depth": 78376,
 *     "difficulty": 815625611,
 *     "hash": "e22cf75f39ae720e8b71b3d120a5ac03f0db50bba6379e2850975b4859190bc6",
 *     "height": 912345,
 *     "major_version": 1,
 *     "minor_version": 2,
 *     "nonce": 1646,
 *     "orphan_status": false,
 *     "prev_hash": "b61c58b2e0be53fad5ef9d9731a55e8a81d972b8d90ed07c04fd37ca6403ff78",
 *     "reward": 7388968946286,
 *     "timestamp": 1452793716
 *   },
 *   "status": "OK"
 * }
 *
 */

Daemon.prototype.getblockheaderbyhash = function(hash) {
    let method = 'getblockheaderbyhash';
    let params = {};
    params.hash = hash;
    return this._request(method);
};

/**
 *
 * Look up a block header by height
 *
 * @param  int     $height  Height of block
 *
 * @return object  Example: {
 *   "block_header": {
 *     "depth": 78376,
 *     "difficulty": 815625611,
 *     "hash": "e22cf75f39ae720e8b71b3d120a5ac03f0db50bba6379e2850975b4859190bc6",
 *     "height": 912345,
 *     "major_version": 1,
 *     "minor_version": 2,
 *     "nonce": 1646,
 *     "orphan_status": false,
 *     "prev_hash": "b61c58b2e0be53fad5ef9d9731a55e8a81d972b8d90ed07c04fd37ca6403ff78",
 *     "reward": 7388968946286,
 *     "timestamp": 1452793716
 *   },
 *   "status": "OK"
 * }
 *
 */

Daemon.prototype.getblockheaderbyheight = function(height) {
    let method = 'getblockheaderbyheight';
    let params = {};
    params.height = height || 0;
    return this._request(method, params);
};

/**
 *
 * Look up block information by SHA256 hash
 *
 * @param  string  $hash  SHA256 hash of block
 *
 * @return object  Example: {
 *   "blob": "...",
 *   "block_header": {
 *     "depth": 12,
 *     "difficulty": 964985344,
 *     "hash": "510ee3c4e14330a7b96e883c323a60ebd1b5556ac1262d0bc03c24a3b785516f",
 *     "height": 993056,
 *     "major_version": 1,
 *     "minor_version": 2,
 *     "nonce": 2036,
 *     "orphan_status": false,
 *     "prev_hash": "0ea4af6547c05c965afc8df6d31509ff3105dc7ae6b10172521d77e09711fd6d",
 *     "reward": 6932043647005,
 *     "timestamp": 1457720227
 *   },
 *   "json": "...",
 *   "status": "OK"
 * }
 *
 */

Daemon.prototype.get_block_by_hash = function(hash) {
    let method = 'get_block';
    let params = {};
    params.hash = hash;
    return this._request(method);
};

/**
 *
 * Look up block information by height
 *
 * @param  int     $height  Height of block
 *
 * @return object  Example: {
 *   "blob": "...",
 *   "block_header": {
 *     "depth": 80694,
 *     "difficulty": 815625611,
 *     "hash": "e22cf75f39ae720e8b71b3d120a5ac03f0db50bba6379e2850975b4859190bc6",
 *     "height": 912345,
 *     "major_version": 1,
 *     "minor_version": 2,
 *     "nonce": 1646,
 *     "orphan_status": false,
 *     "prev_hash": "b61c58b2e0be53fad5ef9d9731a55e8a81d972b8d90ed07c04fd37ca6403ff78",
 *     "reward": 7388968946286,
 *     "timestamp": 1452793716
 *   },
 *   "json": "...",
 *   "status": "OK"
 * }
 *
 */

Daemon.prototype.get_block_by_height = function(height) {
    let method = 'get_block';
    let params = {};
    params.height = height || 0;
    return this._request(method, params);
};

/**
 *
 * Look up incoming and outgoing connections to your node
 *
 * @param  none
 *
 * @return object  Example: {
 *   "connections": [{
 *     "avg_download": 0,
 *     "avg_upload": 0,
 *     "current_download": 0,
 *     "current_upload": 0,
 *     "incoming": false,
 *     "ip": "76.173.170.133",
 *     "live_time": 1865,
 *     "local_ip": false,
 *     "localhost": false,
 *     "peer_id": "3bfe29d6b1aa7c4c",
 *     "port": "18080",
 *     "recv_count": 116396,
 *     "recv_idle_time": 23,
 *     "send_count": 176893,
 *     "send_idle_time": 1457726610,
 *     "state": "state_normal"
 *   },{
 *   ..
 *   }],
 *   "status": "OK"
 * }
 *
 */

Daemon.prototype.get_connections = function() {
    let method = 'get_connections';
    return this._request(method);
};

/**
 *
 * Look up general information about the state of your node and the network
 *
 * @param  none
 *
 * @return object  Example: {
 *   "alt_blocks_count": 5,
 *   "difficulty": 972165250,
 *   "grey_peerlist_size": 2280,
 *   "height": 993145,
 *   "incoming_connections_count": 0,
 *   "outgoing_connections_count": 8,
 *   "status": "OK",
 *   "target": 60,
 *   "target_height": 993137,
 *   "testnet": false,
 *   "top_block_hash": "",
 *   "tx_count": 564287,
 *   "tx_pool_size": 45,
 *   "white_peerlist_size": 529
 * }
 *
 */

Daemon.prototype.get_info = function() {
    let method = 'get_info';
    return this._request(method);
};

/**
 *
 * Ban another node by IP
 *
 * @param  array  $bans  Array of IP addresses to ban
 *
 * @return object  Example: {
 *   "status": "OK"
 * }
 *
 */

Daemon.prototype.set_bans = function(bans) {
    let method = 'set_bans';
    let params = {};
    if (typeof bans === 'string' || bans instanceof String)
    {
        bans = Array(bans);
    }
    params.bans = bans;

    return this._request(method);
};

/**
 *
 * Get list of banned IPs
 *
 * @param  none
 *
 * @return object  Example: {
 *   "bans": [{
 *     "ip": 838969536,
 *     "seconds": 1457748792
 *   }],
 *   "status": "OK"
 * }
 *
 */

Daemon.prototype.get_bans = function() {
    let method = 'get_bans';
    return this._request(method);
};

/**
 *
 * Look up transactions by hash
 *
 * @param  string    $tx_hashes  string list of tx hashes
 * @param  boolean   $decode_json  decode as json
 *
 * @return object
 */

Daemon.prototype.get_transactions = function(txs_hashes, decode_as_json = true, prune = false) {
    let params = {
        txs_hashes: txs_hashes,
        decode_as_json: decode_as_json,
        prune: prune
    };
    return this._request(null, params, 'get_transactions');
};

module.exports = Daemon;

// helper function to convert Haven amount to atomic units
function convert(amount) {
    let number = Number(amount) * 1e12;
    // remove any decimals
    number = number.toFixed(0);
    return Number(number);
}