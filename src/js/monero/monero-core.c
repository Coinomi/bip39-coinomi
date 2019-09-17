#include <stdint.h>

#include "crypto-ops.h"
#include "hash.h"
#include "int-util.h"
#include "monero-core.h"

bool secret_key_to_public_key(const secret_key sec, public_key pub) {
    ge_p3 point;
    if (sc_check(sec) != 0) {
      return false;
    }
    ge_scalarmult_base(&point, sec);
    ge_p3_tobytes(pub, &point);
    return true;
}

void hash_to_scalar(const void *data, size_t length, void *res) {
    cn_fast_hash(data, length, res);
    sc_reduce32(res);
}

void get_subaddress_secret_key(const secret_key sec, uint32_t major, uint32_t minor, secret_key res) {
    const char prefix[] = "SubAddr";
    const size_t len = sizeof(prefix) + 32 + 2 * sizeof(uint32_t);
    char data[len];
    memcpy(data, prefix, sizeof(prefix));
    memcpy(data + sizeof(prefix), sec, 32);
    uint32_t idx = SWAP32LE(major);
    memcpy(data + sizeof(prefix) + 32, &idx, sizeof(uint32_t));
    idx = SWAP32LE(minor);
    memcpy(data + sizeof(prefix) + 32 + sizeof(uint32_t), &idx, sizeof(uint32_t));
    hash_to_scalar(data, len, res);
}

//does a * P where a is a scalar and P is an arbitrary point
bool scalarmultKey(unsigned char *aP, const unsigned char *P, const unsigned char *a) {
    ge_p3 A;
    ge_p2 R;
    if (ge_frombytes_vartime(&A, P) != 0) return false;
    ge_scalarmult(&R, a, &A);
    ge_tobytes(aP, &R);
    return true;
}

