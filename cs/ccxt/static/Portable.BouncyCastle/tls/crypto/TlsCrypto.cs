using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Math;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Tls.Crypto
{
    /// <summary>Service and object creation interface for the primitive types and services that are associated with
    /// cryptography in the API.</summary>
    public interface TlsCrypto
    {
        /// <summary>Return true if this TlsCrypto would use a stream verifier for any of the passed in algorithms.
        /// </summary>
        /// <remarks>This method is only relevant to handshakes negotiating (D)TLS 1.2.</remarks>
        /// <param name="signatureAndHashAlgorithms">A <see cref="IList{T}">list</see> of
        /// <see cref="SignatureAndHashAlgorithm"/> values.</param>
        /// <returns>true if this instance would use a stream verifier for any of the passed in algorithms, otherwise
        /// false.</returns>
        bool HasAnyStreamVerifiers(IList<SignatureAndHashAlgorithm> signatureAndHashAlgorithms);

        /// <summary>Return true if this TlsCrypto would use a stream verifier for any of the passed in algorithms.
        /// </summary>
        /// <remarks>This method is only relevant to handshakes negotiating (D)TLS versions older than 1.2.</remarks>
        /// <param name="clientCertificateTypes">An array of <see cref="ClientCertificateType"/> values.</param>
        /// <returns>true if this instance would use a stream verifier for any of the passed in algorithms, otherwise
        /// false.</returns>
        bool HasAnyStreamVerifiersLegacy(short[] clientCertificateTypes);

        /// <summary>Return true if this TlsCrypto can support the passed in hash algorithm.</summary>
        /// <param name="cryptoHashAlgorithm">the algorithm of interest.</param>
        /// <returns>true if cryptoHashAlgorithm is supported, false otherwise.</returns>
        bool HasCryptoHashAlgorithm(int cryptoHashAlgorithm);

        /// <summary>Return true if this TlsCrypto can support the passed in signature algorithm (not necessarily in
        /// combination with EVERY hash algorithm).</summary>
        /// <param name="cryptoSignatureAlgorithm">the algorithm of interest.</param>
        /// <returns>true if cryptoSignatureAlgorithm is supported, false otherwise.</returns>
        bool HasCryptoSignatureAlgorithm(int cryptoSignatureAlgorithm);

        /// <summary>Return true if this TlsCrypto can support DH key agreement.</summary>
        /// <returns>true if this instance can support DH key agreement, false otherwise.</returns>
        bool HasDHAgreement();

        /// <summary>Return true if this TlsCrypto can support ECDH key agreement.</summary>
        /// <returns>true if this instance can support ECDH key agreement, false otherwise.</returns>
        bool HasECDHAgreement();

        /// <summary>Return true if this TlsCrypto can support the passed in block/stream encryption algorithm.
        /// </summary>
        /// <param name="encryptionAlgorithm">the algorithm of interest.</param>
        /// <returns>true if encryptionAlgorithm is supported, false otherwise.</returns>
        bool HasEncryptionAlgorithm(int encryptionAlgorithm);

        /// <summary>Return true if this TlsCrypto can support HKDF with the passed in hash algorithm.</summary>
        /// <param name="cryptoHashAlgorithm">the algorithm of interest.</param>
        /// <returns>true if HKDF is supported with cryptoHashAlgorithm, false otherwise.</returns>
        bool HasHkdfAlgorithm(int cryptoHashAlgorithm);

        /// <summary>Return true if this TlsCrypto can support the passed in MAC algorithm.</summary>
        /// <param name="macAlgorithm">the algorithm of interest.</param>
        /// <returns>true if macAlgorithm is supported, false otherwise.</returns>
        bool HasMacAlgorithm(int macAlgorithm);

        /// <summary>Return true if this TlsCrypto supports the passed in <see cref="NamedGroup">named group</see>
        /// value.</summary>
        /// <returns>true if this instance supports the passed in <see cref="NamedGroup">named group</see> value.
        /// </returns>
        bool HasNamedGroup(int namedGroup);

        /// <summary>Return true if this TlsCrypto can support RSA encryption/decryption.</summary>
        /// <returns>true if this instance can support RSA encryption/decryption, false otherwise.</returns>
        bool HasRsaEncryption();

        /// <summary>Return true if this TlsCrypto can support the passed in signature algorithm (not necessarily in
        /// combination with EVERY hash algorithm).</summary>
        /// <returns>true if signatureAlgorithm is supported, false otherwise.</returns>
        bool HasSignatureAlgorithm(short signatureAlgorithm);

        /// <summary>Return true if this TlsCrypto can support the passed in signature algorithm.</summary>
        /// <param name="sigAndHashAlgorithm">the algorithm of interest.</param>
        /// <returns>true if sigAndHashAlgorithm is supported, false otherwise.</returns>
        bool HasSignatureAndHashAlgorithm(SignatureAndHashAlgorithm sigAndHashAlgorithm);

        /// <summary>Return true if this TlsCrypto can support the passed in signature scheme.</summary>
        /// <param name="signatureScheme">the scheme of interest.</param>
        /// <returns>true if signatureScheme is supported, false otherwise.</returns>
        bool HasSignatureScheme(int signatureScheme);

        /// <summary>Return true if this TlsCrypto can support SRP authentication.</summary>
        /// <returns>true if this instance can support SRP authentication, false otherwise.</returns>
        bool HasSrpAuthentication();

        /// <summary>Create a TlsSecret object based on provided data.</summary>
        /// <param name="data">the data to base the TlsSecret on.</param>
        /// <returns>a TlsSecret based on the provided data.</returns>
        TlsSecret CreateSecret(byte[] data);

        /// <summary>Create a TlsSecret object containing a randomly-generated RSA PreMasterSecret</summary>
        /// <param name="clientVersion">the client version to place in the first 2 bytes</param>
        /// <returns>a TlsSecret containing the PreMasterSecret.</returns>
        TlsSecret GenerateRsaPreMasterSecret(ProtocolVersion clientVersion);

        /// <summary>Return the primary (safest) SecureRandom for this crypto.</summary>
        /// <returns>a SecureRandom suitable for key generation.</returns>
        SecureRandom SecureRandom { get; }

        /// <summary>Create a TlsCertificate from an ASN.1 binary encoding of an X.509 certificate.</summary>
        /// <param name="encoding">DER/BER encoding of the certificate of interest.</param>
        /// <returns>a TlsCertificate.</returns>
        /// <exception cref="IOException">if there is an issue on decoding or constructing the certificate.</exception>
        TlsCertificate CreateCertificate(byte[] encoding);

        /// <summary>Create a cipher for the specified encryption and MAC algorithms.</summary>
        /// <remarks>
        /// See enumeration classes <see cref="EncryptionAlgorithm"/>, <see cref="MacAlgorithm"/> for appropriate
        /// argument values.
        /// </remarks>
        /// <param name="cryptoParams">context specific parameters.</param>
        /// <param name="encryptionAlgorithm">the encryption algorithm to be employed by the cipher.</param>
        /// <param name="macAlgorithm">the MAC algorithm to be employed by the cipher.</param>
        /// <returns>a <see cref="TlsCipher"/> implementing the encryption and MAC algorithms.</returns>
        /// <exception cref="IOException"/>
        TlsCipher CreateCipher(TlsCryptoParameters cryptoParams, int encryptionAlgorithm, int macAlgorithm);

        /// <summary>Create a domain object supporting the domain parameters described in dhConfig.</summary>
        /// <param name="dhConfig">the config describing the DH parameters to use.</param>
        /// <returns>a TlsDHDomain supporting the parameters in dhConfig.</returns>
        TlsDHDomain CreateDHDomain(TlsDHConfig dhConfig);

        /// <summary>Create a domain object supporting the domain parameters described in ecConfig.</summary>
        /// <param name="ecConfig">the config describing the EC parameters to use.</param>
        /// <returns>a TlsECDomain supporting the parameters in ecConfig.</returns>
        TlsECDomain CreateECDomain(TlsECConfig ecConfig);

        /// <summary>Adopt the passed in secret, creating a new copy of it.</summary>
        /// <param name="secret">the secret to make a copy of.</param>
        /// <returns>a TlsSecret based on the original secret.</returns>
        TlsSecret AdoptSecret(TlsSecret secret);

        /// <summary>Create a suitable hash for the hash algorithm identifier passed in.</summary>
        /// <remarks>
        /// See enumeration class <see cref="CryptoHashAlgorithm"/> for appropriate argument values.
        /// </remarks>
        /// <param name="cryptoHashAlgorithm">the hash algorithm the hash needs to implement.</param>
        /// <returns>a <see cref="TlsHash"/>.</returns>
        TlsHash CreateHash(int cryptoHashAlgorithm);

        /// <summary>Create a suitable HMAC for the MAC algorithm identifier passed in.</summary>
        /// <remarks>
        /// See enumeration class <see cref="MacAlgorithm"/> for appropriate argument values.
        /// </remarks>
        /// <param name="macAlgorithm">the MAC algorithm the HMAC needs to match.</param>
        /// <returns>a <see cref="TlsHmac"/>.</returns>
        TlsHmac CreateHmac(int macAlgorithm);

        /// <summary>Create a suitable HMAC using the hash algorithm identifier passed in.</summary>
        /// <remarks>
        /// See enumeration class <see cref="CryptoHashAlgorithm"/> for appropriate argument values.
        /// </remarks>
        /// <param name="cryptoHashAlgorithm">the hash algorithm the HMAC should use.</param>
        /// <returns>a <see cref="TlsHmac"/>.</returns>
        TlsHmac CreateHmacForHash(int cryptoHashAlgorithm);

        /// <summary>Create a nonce generator.</summary>
        /// <remarks>
        /// Each call should construct a new generator, and the generator should be returned from this call only after
        /// automatically seeding from this <see cref="TlsCrypto"/>'s entropy source, and from the provided additional
        /// seed material. The output of each returned generator must be completely independent of the others.
        /// </remarks>
        /// <param name="additionalSeedMaterial">context-specific seed material</param>
        /// <returns>a <see cref="TlsNonceGenerator"/>.</returns>
        TlsNonceGenerator CreateNonceGenerator(byte[] additionalSeedMaterial);

        /// <summary>Create an SRP-6 client.</summary>
        /// <param name="srpConfig">client config.</param>
        /// <returns>an initialised SRP6 client object.</returns>
        TlsSrp6Client CreateSrp6Client(TlsSrpConfig srpConfig);

        /// <summary>Create an SRP-6 server.</summary>
        /// <param name="srpConfig">server config.</param>
        /// <param name="srpVerifier">the SRP6 verifier value.</param>
        /// <returns>an initialised SRP6 server object.</returns>
        TlsSrp6Server CreateSrp6Server(TlsSrpConfig srpConfig, BigInteger srpVerifier);

        /// <summary>Create an SRP-6 verifier generator.</summary>
        /// <param name="srpConfig">generator config.</param>
        /// <returns>an initialized SRP6 verifier generator.</returns>
        TlsSrp6VerifierGenerator CreateSrp6VerifierGenerator(TlsSrpConfig srpConfig);

        /// <summary>Setup an initial "secret" for a chain of HKDF calls (RFC 5869), containing a string of HashLen
        /// zeroes.</summary>
        /// <param name="cryptoHashAlgorithm">the hash algorithm to instantiate HMAC with. See
        /// <see cref="CryptoHashAlgorithm"/> for values.</param>
        TlsSecret HkdfInit(int cryptoHashAlgorithm);
    }
}
