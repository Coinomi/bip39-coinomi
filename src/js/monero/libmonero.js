const fromHexString = hexString => new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
const toHexString = bytes => bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

const wasm_data_buffer = fromHexString(wasm_data);

var Module = {
  instantiateWasm: function(imports, successCallback) {
    var wasmInstantiate = WebAssembly.instantiate(wasm_data_buffer, imports).then(function(output) {
      successCallback(output.instance);
    }).catch(function(e) {
      console.log('wasm instantiation failed! ' + e);
    });
    return {}; // Compiling asynchronously, no exports.
  },
  lib: {},
};

Module.lib.fromHexString = fromHexString;
Module.lib.toHexString = toHexString;

sc_reduce32 = function(data) {
    var dataLen = data.length * data.BYTES_PER_ELEMENT;
    var dataPtr = Module._malloc(dataLen);
    var dataHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, dataLen);
    dataHeap.set(data);
    Module.ccall('sc_reduce32', null, ['number'], [dataHeap.byteOffset]);
    var res = new Uint8Array(dataHeap);
    Module._free(dataHeap.byteOffset);
    return res;
};

Module.lib.sc_reduce32 = sc_reduce32;

secret_key_to_public_key = function(data) {
    var outLen = data.length * data.BYTES_PER_ELEMENT;
    var outPtr = Module._malloc(outLen);
    var outHeap = new Uint8Array(Module.HEAPU8.buffer, outPtr, outLen);
    var ok = Module.ccall('secret_key_to_public_key', 'boolean', ['array', 'number'], [data, outHeap.byteOffset]);
    var res = null;
    if (ok) res = new Uint8Array(outHeap);
    Module._free(outHeap.byteOffset);
    return res;
};

Module.lib.secret_key_to_public_key = secret_key_to_public_key;

cn_fast_hash = function(data) {
    var outLen = 32;
    var outPtr = Module._malloc(outLen);
    var outHeap = new Uint8Array(Module.HEAPU8.buffer, outPtr, outLen);
    Module.ccall('cn_fast_hash', null, ['array', 'number', 'number'], [data, data.length * data.BYTES_PER_ELEMENT, outHeap.byteOffset]);
    var res = new Uint8Array(outHeap);
    Module._free(outHeap.byteOffset);
    return res;
};

Module.lib.cn_fast_hash = cn_fast_hash;

hash_to_scalar = function(data) {
    return sc_reduce32(cn_fast_hash(data));
};

Module.lib.hash_to_scalar = hash_to_scalar;

get_subaddress_secret_key = function(data, major, minor) {
    var outLen = 32;
    var outPtr = Module._malloc(outLen);
    var outHeap = new Uint8Array(Module.HEAPU8.buffer, outPtr, outLen);
    Module.ccall('get_subaddress_secret_key', null, ['array', 'number', 'number', 'number'], [data, major, minor, outHeap.byteOffset]);
    var res = new Uint8Array(outHeap);
    Module._free(outHeap.byteOffset);
    return res;
};

Module.lib.get_subaddress_secret_key = get_subaddress_secret_key;

sc_add = function(data1, data2) {
    var outLen = 32;
    var outPtr = Module._malloc(outLen);
    var outHeap = new Uint8Array(Module.HEAPU8.buffer, outPtr, outLen);
    Module.ccall('sc_add', null, ['number', 'array', 'array'], [outHeap.byteOffset, data1, data2]);
    var res = new Uint8Array(outHeap);
    Module._free(outHeap.byteOffset);
    return res;
};

Module.lib.sc_add = sc_add;

scalarmultKey = function(P, a) {
    var outLen = 32;
    var outPtr = Module._malloc(outLen);
    var outHeap = new Uint8Array(Module.HEAPU8.buffer, outPtr, outLen);
    var ok = Module.ccall('scalarmultKey', 'boolean', ['number', 'array', 'array'], [outHeap.byteOffset, P, a]);
    var res = null;
    if (ok) res = new Uint8Array(outHeap);
    Module._free(outHeap.byteOffset);
    return res;
}

Module.lib.scalarmultKey = scalarmultKey;

function base58_encode(data) {
    var ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
    var ALPHABET_MAP = {}
	var BYTES_TO_LENGTHS = [0, 2, 3, 5, 6, 7, 9, 10, 11];
    var BASE = ALPHABET.length

    // pre-compute lookup table
    for (var z = 0; z < ALPHABET.length; z++) {
        var x = ALPHABET.charAt(z)
        if (ALPHABET_MAP[x] !== undefined) throw new TypeError(x + ' is ambiguous')
        ALPHABET_MAP[x] = z
    }

    function encode_partial(data, pos) {
        var len = 8;
        if (pos + len > data.length) len = data.length - pos;
        var digits = [0]
        for (var i = 0; i < len; ++i) {
            for (var j = 0, carry = data[pos + i]; j < digits.length; ++j) {
                carry += digits[j] << 8
                digits[j] = carry % BASE
                carry = (carry / BASE) | 0
            }

            while (carry > 0) {
                digits.push(carry % BASE)
                carry = (carry / BASE) | 0
            }
        }

        var res = '';
        // deal with leading zeros
        for (var k = digits.length; k < BYTES_TO_LENGTHS[len]; ++k) res += ALPHABET[0]
        // convert digits to a string
        for (var q = digits.length - 1; q >= 0; --q) res += ALPHABET[digits[q]]
        return res;
    }

    var res = '';
    for (var i = 0; i < data.length; i += 8) {
        res += encode_partial(data, i);
    }
    return res;
}

Module.lib.base58_encode = base58_encode;

MONERO_MAINNET = 0;
MONERO_TESTNET = 1;
MONERO_STAGENET = 2;

Module.lib.MONERO_MAINNET = MONERO_MAINNET;
Module.lib.MONERO_TESTNET = MONERO_TESTNET;
Module.lib.MONERO_STAGENET = MONERO_STAGENET;

pub_keys_to_address = function(net, is_subaddress, public_spend_key, public_view_key) {
    var prefix;
    if (net == MONERO_MAINNET) {
        prefix = '12';
        if (is_subaddress) prefix = '2A';
    } else if (net == MONERO_TESTNET) {
        prefix = '35';
        if (is_subaddress) prefix = '3F';
    } else if (net == MONERO_STAGENET) {
        prefix = '18';
        if (is_subaddress) prefix = '24';
    } else {
        throw "Invalid net: " + net;
    }
    res_hex = prefix + toHexString(public_spend_key) + toHexString(public_view_key);
    checksum = cn_fast_hash(fromHexString(res_hex));
    res_hex += toHexString(checksum).substring(0,8);
    return base58_encode(fromHexString(res_hex));
};

Module.lib.pub_keys_to_address = pub_keys_to_address;

var makeCRCTable = function(){
    var c;
    var crcTable = [];
    for(var n =0; n < 256; n++){
        c = n;
        for(var k =0; k < 8; k++){
            c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        crcTable[n] = c;
    }
    return crcTable;
}

var crc32 = function(str) {
    var crcTable = window.crcTable || (window.crcTable = makeCRCTable());
    var crc = 0 ^ (-1);

    for (var i = 0; i < str.length; i++ ) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
    }

    return (crc ^ (-1)) >>> 0;
};

secret_spend_key_to_words = function(secret_spend_key) {
    var seed = [];
    var for_checksum = '';
    for (var i = 0; i < 32; i += 4) {
        var w0 = 0;
        for (var j = 3; j >= 0; j--) w0 = w0 * 256 + secret_spend_key[i + j];
        var w1 = w0 % monero_words_english.length;
        var w2 = ((w0 / monero_words_english.length | 0) + w1) % monero_words_english.length;
        var w3 = (((w0 / monero_words_english.length | 0) / monero_words_english.length | 0) + w2) % monero_words_english.length;
        seed.push(monero_words_english[w1]);
        seed.push(monero_words_english[w2]);
        seed.push(monero_words_english[w3]);
        for_checksum += monero_words_english[w1].substring(0, monero_words_english_prefix_len);
        for_checksum += monero_words_english[w2].substring(0, monero_words_english_prefix_len);
        for_checksum += monero_words_english[w3].substring(0, monero_words_english_prefix_len);
    }
    seed.push(seed[crc32(for_checksum) % 24]);
    return seed.join(' ');
};

Module.lib.secret_spend_key_to_words = secret_spend_key_to_words;
