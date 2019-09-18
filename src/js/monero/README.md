# Coinomi BIP39 XMR Support

## Summary

Forked from https://github.com/iancoleman/bip39/

Supports seeds used by the Coinomi wallet, Ledger hardware wallets and should
be compatible with other wallets too that use BIP39 (not tested).

WARNING! DO NOT ENTER YOUR SEED PHRASE INTO ANY INTERNET WEB PAGE!

The right way to use this tool is to download the single html page (index.html)
locally, disconnect from the internet, open a browser in incognito mode and
drag the index.html file in it to open. These are minimum precautions, if in
doubt ask someone you know and trust (but don't give them the seed).

## Usage

- Open the index.html page in a browser.
- Type your seed in the text area next to `BIP39 Mnemonic`. For a demo, just
  click `Generate` for a random mnemonic.
- Choose `XMR - Monero` in the `Coin` select dropdown.
- Get the XMR wallet seed words (25 words) next to `XMR Seed Words`. Putting
  this 25-word seed into any Monero wallet (CLI or GUI) will restore the wallet.

## How it works

This fork adds support for XMR private spend key derivation according to the
following sources:

- https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
- https://github.com/satoshilabs/slips/blob/master/slip-0044.md
- https://github.com/LedgerHQ/ledger-app-monero/tree/master/tools/python

The tricky part with Monero is that it uses a different curve from Bitcoin and
derivatives (ed25519 vs secp256k1) and the BIP39/44 derivation is modified
a bit. The steps are:

- Calculate the derivation as usual (e.g. m / 44' / 128' / 0' / 0' )
- perform an extra SHA3 on the result of the derivation
- perform sc_reduce32 to the SHA3 result to get a valid ed25519 scalar

The BIP44 scheme is also interpreted slightly different to support subaddresses.
Instead of calculating the derivation for subaddresses directly (from 
m / 44' / 128' / <account>' / <subaddress>') we always use the derivation
m / 44' / 128' / <account>' / 0' and we then use the Monero-specific
subaddress generation (note here that BIP44 account is not the subaddress 
account mentioned in the Monero core CLI and GUI wallets).

All the Monero-specific functionality is encapsulated in a single js file which
requires ES6 and WebAssembly support to function. 

## Library Generation (monero.js)

The basic functions are taken directly from C-source files found in the Monero
project sources. Some extremely small modifications have been made to the files
to make standalone compilation easier. Verifying the files is rather easy
by doing a diff comparison for the following Monero project source files (taken
from release v0.13):

- `crypto-ops.c`
- `crypto-ops.h`
- `hash.c`
- `hash-ops.h`
- `keccak.c`
- `crypto.h`
- `crypto-ops-data.c`
- `hash.h`
- `int-util.h`
- `keccak.h`

Some of the needed functionality was in C++ files and has been moved into C
files (very short and easy to inspect):

- `monero-core.c`
- `monero-core.h`

Finally, some bridging functions, helper functions and some extra calculations
are implemented in javascript:

- `libmonero.js`
- `monero-words-english.js`

These files are compiled, mixed and merged into a single `monero.js` final
product by using a fresh version of emscripten and the `build.sh` script.
It is possible and easy to tweak the build process to generate pure js code
instead of webassembly (in asm.js form) for anyone wishing to use this where
webassembly is not supported.

For those who do not wish to install emscripten or mess-up their systems, a
docker setup has been provided that will create an emscripten environment
supporting the compilation. Using this is very very simple:

Assuming current dir is `bip39-monero/src/js/monero`:

```
sudo docker build -t emscripten ./docker
sudo docker run -it --rm -v $(pwd):/root/src emscripten bash
```

While inside the docker container do:

```
source /root/emsdk/emsdk_env.sh
cd /root/src
./build.sh
exit
```

