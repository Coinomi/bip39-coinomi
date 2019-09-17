sudo docker build -t emscripten ./docker

sudo docker run -it --rm --name monero-bip39 -v $(pwd):/root/src emscripten bash
---
source /root/emsdk/emsdk_env.sh
cd /root/src
./build.sh

