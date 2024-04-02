using System;
using System.IO;

namespace Org.BouncyCastle.Tls.Crypto
{
    /// <summary>Interface supporting the generation of key material and other SSL/TLS secret values from PRFs.
    /// </summary>
    public interface TlsSecret
    {
        /// <summary>Calculate an HMAC with this secret's data as the key.</summary>
        /// <param name="cryptoHashAlgorithm">the hash algorithm to instantiate HMAC with. See
        /// <see cref="CryptoHashAlgorithm"/> for values.</param>
        /// <param name="buf">array containing the input data.</param>
        /// <param name="off">offset into the input array the input starts at.</param>
        /// <param name="len">the length of the input data.</param>
        byte[] CalculateHmac(int cryptoHashAlgorithm, byte[] buf, int off, int len);

        /// <summary>Return a new secret based on applying a PRF to this one.</summary>
        /// <param name="prfAlgorithm">PRF algorithm to use.</param>
        /// <param name="label">the label details.</param>
        /// <param name="seed">the seed details.</param>
        /// <param name="length">the size (in bytes) of the secret to generate.</param>
        /// <returns>the new secret.</returns>
        TlsSecret DeriveUsingPrf(int prfAlgorithm, string label, byte[] seed, int length);

        /// <summary>Destroy the internal state of the secret.</summary>
        /// <remarks>
        /// After this call, any attempt to use the <see cref="TlsSecret"/> will result in an
        /// <see cref="InvalidOperationException"/> being thrown.
        /// </remarks>
        void Destroy();

        /// <summary>Return an encrypted copy of the data this secret is based on.</summary>
        /// <param name="encryptor">the encryptor to use for protecting the internal data.</param>
        /// <returns>an encrypted copy of this secret's internal data.</returns>
        /// <exception cref="IOException"/>
        byte[] Encrypt(TlsEncryptor encryptor);

        /// <summary>Return the internal data from this secret.</summary>
        /// <remarks>
        /// The <see cref="TlsSecret"/> does not keep a copy of the data. After this call, any attempt to use the
        /// <see cref="TlsSecret"/> will result in an <see cref="InvalidOperationException"/> being thrown.
        /// </remarks>
        /// <returns>the secret's internal data.</returns>
        byte[] Extract();

        /// <summary>RFC 5869 HKDF-Expand function, with this secret's data as the pseudo-random key ('prk').</summary>
        /// <param name="cryptoHashAlgorithm">the hash algorithm to instantiate HMAC with. See
        /// <see cref="CryptoHashAlgorithm"/> for values.</param>
        /// <param name="info">optional context and application specific information (can be zero-length).</param>
        /// <param name="length">length of output keying material in octets.</param>
        /// <returns> output keying material (of 'length' octets).</returns>
        TlsSecret HkdfExpand(int cryptoHashAlgorithm, byte[] info, int length);

        /// <summary>RFC 5869 HKDF-Extract function, with this secret's data as the 'salt'.</summary>
        /// <remarks>
        /// The <see cref="TlsSecret"/> does not keep a copy of the data. After this call, any attempt to use
        /// the <see cref="TlsSecret"/> will result in an <see cref="InvalidOperationException"/> being thrown.
        /// </remarks>
        /// <param name="cryptoHashAlgorithm">the hash algorithm to instantiate HMAC with. See
        /// <see cref="CryptoHashAlgorithm"/> for values.</param>
        /// <param name="ikm">input keying material.</param>
        /// <returns>a pseudo-random key (of HashLen octets).</returns>
        TlsSecret HkdfExtract(int cryptoHashAlgorithm, TlsSecret ikm);

        bool IsAlive();
    }
}
