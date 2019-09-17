#pragma once

#include <stdbool.h>
#include <stddef.h>

typedef unsigned char *public_key;
typedef unsigned char *secret_key;
typedef unsigned char *key_derivation;
typedef unsigned char *ec_scalar;

bool secret_key_to_public_key(const secret_key sec, public_key pub);
bool scalarmultKey(unsigned char *aP, const unsigned char *P, const unsigned char *a);
