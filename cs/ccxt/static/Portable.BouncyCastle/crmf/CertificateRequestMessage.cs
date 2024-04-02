using System;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Crmf;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Operators;

namespace Org.BouncyCastle.Crmf
{
    public class CertificateRequestMessage
    {
        public static readonly int popRaVerified = Org.BouncyCastle.Asn1.Crmf.ProofOfPossession.TYPE_RA_VERIFIED;
        public static readonly int popSigningKey = Org.BouncyCastle.Asn1.Crmf.ProofOfPossession.TYPE_SIGNING_KEY;
        public static readonly int popKeyEncipherment = Org.BouncyCastle.Asn1.Crmf.ProofOfPossession.TYPE_KEY_ENCIPHERMENT;
        public static readonly int popKeyAgreement = Org.BouncyCastle.Asn1.Crmf.ProofOfPossession.TYPE_KEY_AGREEMENT;

        private readonly CertReqMsg certReqMsg;
        private readonly Controls controls;

        private static CertReqMsg ParseBytes(byte[] encoding)
        {
            return CertReqMsg.GetInstance(encoding);
        }

        /// <summary>
        /// Create a CertificateRequestMessage from the passed in bytes.
        /// </summary>
        /// <param name="encoded">BER/DER encoding of the CertReqMsg structure.</param>
        public CertificateRequestMessage(byte[] encoded)
            : this(CertReqMsg.GetInstance(encoded))
        {
        }

        public CertificateRequestMessage(CertReqMsg certReqMsg)
        {
            this.certReqMsg = certReqMsg;
            this.controls = certReqMsg.CertReq.Controls;
        }

        /// <summary>
        /// Return the underlying ASN.1 object defining this CertificateRequestMessage object.
        /// </summary>
        /// <returns>A CertReqMsg</returns>
        public CertReqMsg ToAsn1Structure()
        {
            return certReqMsg;
        }

        /// <summary>
        /// Return the certificate template contained in this message.
        /// </summary>
        /// <returns>a CertTemplate structure.</returns>
        public CertTemplate GetCertTemplate()
        {
            return this.certReqMsg.CertReq.CertTemplate;
        }

        /// <summary>
        /// Return whether or not this request has control values associated with it.
        /// </summary>
        /// <returns>true if there are control values present, false otherwise.</returns>
        public bool HasControls
        {
            get { return controls != null; }
        }

        /// <summary>
        /// Return whether or not this request has a specific type of control value.
        /// </summary>
        /// <param name="objectIdentifier">the type OID for the control value we are checking for.</param>
        /// <returns>true if a control value of type is present, false otherwise.</returns>
        public bool HasControl(DerObjectIdentifier objectIdentifier)
        {
            return FindControl(objectIdentifier) != null;
        }

        /// <summary>
        /// Return a control value of the specified type.
        /// </summary>
        /// <param name="type">the type OID for the control value we are checking for.</param>
        /// <returns>the control value if present, null otherwise.</returns>
        public IControl GetControl(DerObjectIdentifier type)
        {
            AttributeTypeAndValue found = FindControl(type);
            if (found != null)
            {
                if (found.Type.Equals(CrmfObjectIdentifiers.id_regCtrl_pkiArchiveOptions))
                {
                    return new PkiArchiveControl(PkiArchiveOptions.GetInstance(found.Value));
                }

                if (found.Type.Equals(CrmfObjectIdentifiers.id_regCtrl_regToken))
                {
                    return new RegTokenControl(DerUtf8String.GetInstance(found.Value));
                }

                if (found.Type.Equals(CrmfObjectIdentifiers.id_regCtrl_authenticator))
                {
                    return new AuthenticatorControl(DerUtf8String.GetInstance(found.Value));
                }
            }
            return null;
        }

        public AttributeTypeAndValue FindControl(DerObjectIdentifier type)
        {
            if (controls == null)
            {
                return null;
            }

            AttributeTypeAndValue[] tAndV = controls.ToAttributeTypeAndValueArray();
            AttributeTypeAndValue found = null;

            for (int i = 0; i < tAndV.Length; i++)
            {
                if (tAndV[i].Type.Equals(type))
                {
                    found = tAndV[i];
                    break;
                }
            }

            return found;
        }

        /// <summary>
        /// Return whether or not this request message has a proof-of-possession field in it.
        /// </summary>
        /// <returns>true if proof-of-possession is present, false otherwise.</returns>
        public bool HasProofOfPossession
        {
            get { return certReqMsg.Popo != null; }
        }

        /// <summary>
        /// Return the type of the proof-of-possession this request message provides.
        /// </summary>
        /// <returns>one of: popRaVerified, popSigningKey, popKeyEncipherment, popKeyAgreement</returns>
        public int ProofOfPossession
        {
            get { return certReqMsg.Popo.Type; }
        }

        /// <summary>
        /// Return whether or not the proof-of-possession (POP) is of the type popSigningKey and
        /// it has a public key MAC associated with it.
        /// </summary>
        /// <returns>true if POP is popSigningKey and a PKMAC is present, false otherwise.</returns>
        public bool HasSigningKeyProofOfPossessionWithPkMac
        {
            get
            {
                ProofOfPossession pop = certReqMsg.Popo;

                if (pop.Type == popSigningKey)
                {
                    PopoSigningKey popoSign = PopoSigningKey.GetInstance(pop.Object);

                    return popoSign.PoposkInput.PublicKeyMac != null;
                }

                return false;
            }
        }

        /// <summary>
        /// Return whether or not a signing key proof-of-possession (POP) is valid.
        /// </summary>
        /// <param name="verifierProvider">a provider that can produce content verifiers for the signature contained in this POP.</param>
        /// <returns>true if the POP is valid, false otherwise.</returns>
        /// <exception cref="InvalidOperationException">if there is a problem in verification or content verifier creation.</exception>
        /// <exception cref="InvalidOperationException">if POP not appropriate.</exception>
        public bool IsValidSigningKeyPop(IVerifierFactoryProvider verifierProvider)
        {
            ProofOfPossession pop = certReqMsg.Popo;
            if (pop.Type == popSigningKey)
            {
                PopoSigningKey popoSign = PopoSigningKey.GetInstance(pop.Object);
                if (popoSign.PoposkInput != null && popoSign.PoposkInput.PublicKeyMac != null)
                {
                    throw new InvalidOperationException("verification requires password check");
                }
                return verifySignature(verifierProvider, popoSign);
            }

            throw new InvalidOperationException("not Signing Key type of proof of possession");
        }

        private bool verifySignature(IVerifierFactoryProvider verifierFactoryProvider, PopoSigningKey signKey)
        {
            IVerifierFactory verifer;
            IStreamCalculator calculator;
            try
            {
                verifer = verifierFactoryProvider.CreateVerifierFactory(signKey.AlgorithmIdentifier);
                calculator = verifer.CreateCalculator();
            }
            catch (Exception ex)
            {
                throw new CrmfException("unable to create verifier: " + ex.Message, ex);
            }

            if (signKey.PoposkInput != null)
            {
                byte[] b = signKey.GetDerEncoded();
                calculator.Stream.Write(b, 0, b.Length);
            }
            else
            {
                byte[] b = certReqMsg.CertReq.GetDerEncoded();
                calculator.Stream.Write(b, 0, b.Length);
            }

            DefaultVerifierResult result = (DefaultVerifierResult)calculator.GetResult();

            return result.IsVerified(signKey.Signature.GetBytes());
        }

        /// <summary>
        /// Return the ASN.1 encoding of the certReqMsg we wrap.
        /// </summary>
        /// <returns>a byte array containing the binary encoding of the certReqMsg.</returns>
        public byte[] GetEncoded()
        {
            return certReqMsg.GetEncoded();
        }
    }
}
