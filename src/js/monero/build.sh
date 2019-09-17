OUTPUT="monero.js"

# Compile C to js
emcc monero-core.c crypto-ops.c crypto-ops-data.c hash.c keccak.c -o monero-core.js -s EXPORTED_FUNCTIONS='["_sc_reduce32", "_secret_key_to_public_key", "_cn_fast_hash", "_get_subaddress_secret_key", "_sc_add", "_scalarmultKey"]' -s EXTRA_EXPORTED_RUNTIME_METHODS='["ccall", "cwrap"]' -s WASM=1

# Create closure for WASM + custom functions
echo 'XMRModule = function() {' > $OUTPUT
echo 'var wasm_data = "" + ' >> $OUTPUT

# Convert wasm byte data to a hex multiline variable
xxd -p -c 70 monero-core.wasm | sed 's/.*/"&"+/' >> $OUTPUT
echo '"";' >> $OUTPUT

# Add list of english words for bytes -> seed
cat monero-words-english.js >> $OUTPUT

# Add custom helper methods
cat libmonero.js >> $OUTPUT

# Add WASM code
cat monero-core.js >> $OUTPUT

# Finalize closure
echo 'return Module;' >> $OUTPUT
echo '}();' >> $OUTPUT

