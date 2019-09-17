FROM ubuntu:18.04

RUN apt update && apt install -y git python nodejs cmake default-jre xxd
RUN cd /root && git clone https://github.com/emscripten-core/emsdk.git
RUN cd /root/emsdk && ./emsdk install latest
RUN cd /root/emsdk && ./emsdk activate latest


