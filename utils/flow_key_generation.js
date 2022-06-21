const rlp = require('rlp');
const EC = require('elliptic').ec;

const ec = new EC('p256');

const encodePublicKeyForFlow = (publicKey, signatureAlgorithm = 1, hashAlgorithm = 3, weight = 1000) =>
  rlp
    .encode([
      Buffer.from(publicKey, 'hex'), // publicKey hex to binary
      signatureAlgorithm, // P256
      hashAlgorithm, // SHA3-256
      weight, // give key full weight
    ])
    .toString('hex');

const genKeys = (signatureAlgorithm = 1, hashAlgorithm = 3, weight = 1000) => {
  const keys = ec.genKeyPair();
  const privateKey = keys.getPrivate('hex');
  const publicKey = keys.getPublic('hex').replace(/^04/, '');
  return {
    publicKey,
    privateKey,
    flowKey: encodePublicKeyForFlow(publicKey, signatureAlgorithm, hashAlgorithm, weight),
  };
};

module.exports = {
  genKeys,
};
