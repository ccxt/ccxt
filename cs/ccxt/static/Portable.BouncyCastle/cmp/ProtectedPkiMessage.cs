using System;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Cmp;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crmf;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.X509;

namespace Org.BouncyCastle.Cmp
{
    /// <summary>
    /// Wrapper for a PKIMessage with protection attached to it.
    /// </summary>
    public class ProtectedPkiMessage
    {
        private readonly PkiMessage pkiMessage;

        /// <summary>
        /// Wrap a general message.
        /// </summary>
        /// <exception cref="ArgumentException">If the general message does not have protection.</exception>
        /// <param name="pkiMessage">The General message</param>
        public ProtectedPkiMessage(GeneralPkiMessage pkiMessage)
        {
            if (!pkiMessage.HasProtection)
                throw new ArgumentException("pki message not protected");

            this.pkiMessage = pkiMessage.ToAsn1Structure();
        }

        /// <summary>
        /// Wrap a PKI message.
        /// </summary>
        /// <exception cref="ArgumentException">If the PKI message does not have protection.</exception>
        /// <param name="pkiMessage">The PKI message</param>
        public ProtectedPkiMessage(PkiMessage pkiMessage)
        {
            if (null == pkiMessage.Header.ProtectionAlg)
                throw new ArgumentException("pki message not protected");

            this.pkiMessage = pkiMessage;
        }

        /// <summary>
        /// Message header
        /// </summary>
        public PkiHeader Header
        {
            get { return pkiMessage.Header; }
        }

        /// <summary>
        /// Message Body
        /// </summary>
        public PkiBody Body
        {
            get { return pkiMessage.Body; }
        }

        /// <summary>
        /// Return the underlying ASN.1 structure contained in this object.
        /// </summary>
        /// <returns>PKI Message structure</returns>
        public PkiMessage ToAsn1Message()
        {
            return pkiMessage;
        }

        /// <summary>
        /// Determine whether the message is protected by a password based MAC. Use verify(PKMACBuilder, char[])
        /// to verify the message if this method returns true.
        /// </summary>
        /// <returns>true if protection MAC PBE based, false otherwise.</returns>
        public bool HasPasswordBasedMacProtected
        {
            get { return Header.ProtectionAlg.Algorithm.Equals(CmpObjectIdentifiers.passwordBasedMac); }
        }

        /// <summary>
        /// Return the extra certificates associated with this message.
        /// </summary>
        /// <returns>an array of extra certificates, zero length if none present.</returns>
        public X509Certificate[] GetCertificates()
        {
            CmpCertificate[] certs = pkiMessage.GetExtraCerts();
            if (null == certs)
                return new X509Certificate[0];

            X509Certificate[] res = new X509Certificate[certs.Length];
            for (int t = 0; t < certs.Length; t++)
            {
                res[t] = new X509Certificate(X509CertificateStructure.GetInstance(certs[t].GetEncoded()));
            }

            return res;
        }

        /// <summary>
        /// Verify a message with a public key based signature attached.
        /// </summary>
        /// <param name="verifierFactory">a factory of signature verifiers.</param>
        /// <returns>true if the provider is able to create a verifier that validates the signature, false otherwise.</returns>      
        public bool Verify(IVerifierFactory verifierFactory)
        {
            IStreamCalculator streamCalculator = verifierFactory.CreateCalculator();

            IVerifier result = (IVerifier)Process(streamCalculator);

            return result.IsVerified(pkiMessage.Protection.GetBytes());
        }

        private object Process(IStreamCalculator streamCalculator)
        {
            Asn1EncodableVector avec = new Asn1EncodableVector();
            avec.Add(pkiMessage.Header);
            avec.Add(pkiMessage.Body);
            byte[] enc = new DerSequence(avec).GetDerEncoded();

            streamCalculator.Stream.Write(enc, 0, enc.Length);
            streamCalculator.Stream.Flush();
            Platform.Dispose(streamCalculator.Stream);

            return streamCalculator.GetResult();
        }

        /// <summary>
        /// Verify a message with password based MAC protection.
        /// </summary>
        /// <param name="pkMacBuilder">MAC builder that can be used to construct the appropriate MacCalculator</param>
        /// <param name="password">the MAC password</param>
        /// <returns>true if the passed in password and MAC builder verify the message, false otherwise.</returns>
        /// <exception cref="InvalidOperationException">if algorithm not MAC based, or an exception is thrown verifying the MAC.</exception>
        public bool Verify(PKMacBuilder pkMacBuilder, char[] password)
        {
            if (!CmpObjectIdentifiers.passwordBasedMac.Equals(pkiMessage.Header.ProtectionAlg.Algorithm))
                throw new InvalidOperationException("protection algorithm is not mac based");

            PbmParameter parameter = PbmParameter.GetInstance(pkiMessage.Header.ProtectionAlg.Parameters);

            pkMacBuilder.SetParameters(parameter);

            IBlockResult result = (IBlockResult)Process(pkMacBuilder.Build(password).CreateCalculator());

            return Arrays.ConstantTimeAreEqual(result.Collect(), this.pkiMessage.Protection.GetBytes());
        }
    }
}
