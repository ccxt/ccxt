using System;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Math;

namespace Org.BouncyCastle.Tls.Crypto
{
    /// <summary>Interface providing the functional representation of a single X.509 certificate.</summary>
    public interface TlsCertificate
    {
        /// <summary>Return an encryptor based on the public key in this certificate.</summary>
        /// <param name="tlsCertificateRole"><see cref="TlsCertificateRole"/></param>
        /// <returns>a <see cref="TlsEncryptor"/> based on this certificate's public key.</returns>
        /// <exception cref="IOException"/>
        TlsEncryptor CreateEncryptor(int tlsCertificateRole);

        /// <param name="signatureAlgorithm"><see cref="SignatureAlgorithm"/></param>
        /// <exception cref="IOException"/>
        TlsVerifier CreateVerifier(short signatureAlgorithm);

        /// <param name="signatureScheme"><see cref="SignatureScheme"/></param>
        /// <exception cref="IOException"/>
        Tls13Verifier CreateVerifier(int signatureScheme);

        /// <exception cref="IOException"/>
        byte[] GetEncoded();

        /// <exception cref="IOException"/>
        byte[] GetExtension(DerObjectIdentifier extensionOid);

        BigInteger SerialNumber { get; }

        /// <returns>the OID of this certificate's 'signatureAlgorithm', as a string.</returns>
        string SigAlgOid { get; }

        /// <exception cref="IOException"/>
        Asn1Encodable GetSigAlgParams();

        /// <returns><see cref="SignatureAlgorithm"/></returns>
        /// <exception cref="IOException"/>
        short GetLegacySignatureAlgorithm();

        /// <param name="signatureAlgorithm"><see cref="SignatureAlgorithm"/></param>
        /// <returns>true if (and only if) this certificate can be used to verify the given signature algorithm.
        /// </returns>
        /// <exception cref="IOException"/>
        bool SupportsSignatureAlgorithm(short signatureAlgorithm);

        /// <exception cref="IOException"/>
        bool SupportsSignatureAlgorithmCA(short signatureAlgorithm);

        /// <param name="tlsCertificateRole"><see cref="TlsCertificateRole"/></param>
        /// <exception cref="IOException"/>
        TlsCertificate CheckUsageInRole(int tlsCertificateRole);
    }
}
