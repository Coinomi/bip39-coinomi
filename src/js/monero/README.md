sudo docker run -d --name emscripten -v $(pwd)/src:/root/src ubuntu:18.04 sleep infinity
sudo docker exec -it emscripten bash
---
apt update -y
apt install -y git python nodejs cmake default-jre xxd

git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh

cd /root/src
emcc monero-core.c crypto-ops.c crypto-ops-data.c hash.c keccak.c -o monero-core.js -s EXPORTED_FUNCTIONS='["_sc_reduce32", "_secret_key_to_public_key", "_cn_fast_hash", "_get_subaddress_secret_key", "_sc_add", "_scalarmultKey"]' -s EXTRA_EXPORTED_RUNTIME_METHODS='["ccall", "cwrap"]' -s WASM=1

