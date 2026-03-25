import nacl from 'tweetnacl'
import { decodeBase64, encodeBase64 } from 'tweetnacl-util'

/**
 * RootSpace E2EE Utilities
 * Uses Curve25519 for authenticated encryption (Box).
 */
export class CryptoUtils {
  static generateKeyPair() {
    return nacl.box.keyPair()
  }

  static encrypt(message, recipientPublicKey, senderPrivateKey) {
    const nonce = nacl.randomBytes(nacl.box.nonceLength)
    const messageUint8 = new TextEncoder().encode(JSON.stringify(message))
    const encrypted = nacl.box(messageUint8, nonce, recipientPublicKey, senderPrivateKey)

    return {
      ciphertext: encodeBase64(encrypted),
      nonce: encodeBase64(nonce),
    }
  }

  static decrypt(ciphertextBase64, nonceBase64, senderPublicKey, recipientPrivateKey) {
    const ciphertext = decodeBase64(ciphertextBase64)
    const nonce = decodeBase64(nonceBase64)
    const decrypted = nacl.box.open(ciphertext, nonce, senderPublicKey, recipientPrivateKey)

    if (!decrypted) {
      throw new Error('Failed to decrypt: Invalid key or corrupted payload.')
    }

    return JSON.parse(new TextDecoder().decode(decrypted))
  }
}
