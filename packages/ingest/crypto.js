/**
 * Provides encryption and decryption methods with a consistent API but
 * differing mechanisms for dealing with encryption keys.
 */

const forge = require('node-forge');
const { S3, KMS } = require('./aws');

/**
 * Provides encryption and decryption methods using a keypair stored in S3
 */
class S3KeyPairProvider {
  /**
   * Encrypt the given string using the given public key stored in the internal bucket
   *
   * @param {string} str - The string to encrypt
   * @param {string} keyId - The name of the public key to use for encryption
   * @param {string} bucket - the optional bucket name. if not provided will
   *                          use env variable "internal"
   * @param {stack} stack - the optional stack name. if not provided will
   *                        use env variable "stackName"
   * @returns {Promise} the encrypted string
   */
  static async encrypt(str, keyId = 'public.pub', bucket = null, stack = null) {
    // Download the publickey
    const pki = forge.pki;
    const b = bucket || process.env.internal;
    const s = stack || process.env.stackName;
    const pub = await S3.get(b, `${s}/crypto/${keyId}`);

    const publicKey = pki.publicKeyFromPem(pub.Body.toString());
    return forge.util.encode64(publicKey.encrypt(str));
  }

  /**
   * Decrypt the given string using the given private key stored in the internal bucket
   *
   * @param {string} str - The string to encrypt
   * @param {string} keyId - The name of the public key to use for encryption
   * @param {string} bucket - the optional bucket name. if not provided will
   *                          use env variable "internal"
   * @param {stack} stack - the optional stack name. if not provided will
   *                        use env variable "stackName"
   * @returns {Promise} the encrypted string
   */
  static async decrypt(str, keyId = 'private.pem', bucket = null, stack = null) {
    const pki = forge.pki;
    const b = bucket || process.env.internal;
    const s = stack || process.env.stackName;
    const priv = await S3.get(b, `${s}/crypto/${keyId}`);

    const decoded = forge.util.decode64(str);
    const privateKey = pki.privateKeyFromPem(priv.Body.toString());
    return privateKey.decrypt(decoded);
  }
}

module.exports = {
  S3KeyPairProvider: S3KeyPairProvider,
  KmsProvider: KMS,
  // Use S3 by default. This will be the case until KMS is available in operations
  DefaultProvider: S3KeyPairProvider
};
