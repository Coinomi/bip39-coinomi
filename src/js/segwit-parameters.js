(function() {

// p2wpkh

bitcoinjs.bitcoin.networks.groestlcoin.p2wpkh = {
    baseNetwork: "groestlcoin",
    messagePrefix: '\x1cGroestlCoin Signed Message:\n',
    bech32: 'grs',
    bip32: {
        public: 0x04b24746,
        private: 0x04b2430c
    },
    pubKeyHash: 0x24,
    scriptHash: 0x05,
    wif: 0x80
};

bitcoinjs.bitcoin.networks.groestlcoin.p2wpkhInP2sh = {
    baseNetwork: "groestlcoin",
    messagePrefix: '\x1cGroestlCoin Signed Message:\n',
    bech32: 'grs',
    bip32: {
        public: 0x049d7cb2,
        private: 0x049d7878
    },
    pubKeyHash: 0x24,
    scriptHash: 0x05,
    wif: 0x80
};
})();
