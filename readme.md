# Coinomi BIP39 Tool

A tool for converting BIP39 mnemonic phrases to addresses and private keys.

Originally based on https://github.com/iancoleman/bip39/

Added BIP39 support for:
- AION
- Algorand
- Decred
- Monero
- NEM
- Smartcash
- Tron



## Standalone offline version

Download `bip39-standalone.html` from
[the releases](https://github.com/Coinomi/bip39-coinomi/releases).

Open the file in a browser by double clicking it.

This can be compiled from source using the command `python compile.py`

## Security Measures
As the first step of usage: Make sure your device is completely offline and cannot connect to the internet in any say.

As the last: Before connecting the device to the internet close the browser window and overwrite/wipe the clipboard of any keys or seeds you may have copied. 

## Usage

Enter your BIP39 phrase into the 'BIP39 Phrase' field, or press
'Generate Random Phrase'

If required, set the derivation path, although the defaults are quite usable.

See the table for a list of addresses generated from the phrase.

Toggle columns to blank to easily copy/paste a single column of data, eg to
import private keys into a wallet or supply someone with a list of addresses.

The BIP32 keys can be used at [bip32.org](https://bip32.org) if desired.
