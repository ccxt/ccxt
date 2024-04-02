using System;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Crmf;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Operators;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crmf
{
    public class ProofOfPossessionSigningKeyBuilder
    {
        private CertRequest _certRequest;
        private SubjectPublicKeyInfo _pubKeyInfo;
        private GeneralName _name;
        private PKMacValue _publicKeyMAC;

        public ProofOfPossessionSigningKeyBuilder(CertRequest certRequest)
        {
            this._certRequest = certRequest;
        }

        public ProofOfPossessionSigningKeyBuilder(SubjectPublicKeyInfo pubKeyInfo)
        {
            this._pubKeyInfo = pubKeyInfo;
        }

        public ProofOfPossessionSigningKeyBuilder SetSender(GeneralName name)
        {
            this._name = name;

            return this;
        }

        public ProofOfPossessionSigningKeyBuilder SetPublicKeyMac(PKMacBuilder generator, char[] password)
        {
            IMacFactory fact = generator.Build(password);

            IStreamCalculator calc = fact.CreateCalculator();
            byte[] d = _pubKeyInfo.GetDerEncoded();
            calc.Stream.Write(d, 0, d.Length);
            calc.Stream.Flush();
            Platform.Dispose(calc.Stream);

            this._publicKeyMAC = new PKMacValue(
                (AlgorithmIdentifier)fact.AlgorithmDetails,
                new DerBitString(((IBlockResult)calc.GetResult()).Collect()));

            return this;
        }

        public PopoSigningKey Build(ISignatureFactory signer)
        {
            if (_name != null && _publicKeyMAC != null)
            {
                throw new InvalidOperationException("name and publicKeyMAC cannot both be set.");
            }

            PopoSigningKeyInput popo;

            IStreamCalculator calc = signer.CreateCalculator();
            using (Stream sigStream = calc.Stream)
            {
                if (_certRequest != null)
                {
                    popo = null;
                    _certRequest.EncodeTo(sigStream, Asn1Encodable.Der);
                }
                else if (_name != null)
                {
                    popo = new PopoSigningKeyInput(_name, _pubKeyInfo);
                    popo.EncodeTo(sigStream, Asn1Encodable.Der);
                }
                else
                {
                    popo = new PopoSigningKeyInput(_publicKeyMAC, _pubKeyInfo);
                    popo.EncodeTo(sigStream, Asn1Encodable.Der);
                }
            }

            var signature = ((IBlockResult)calc.GetResult()).Collect();

            return new PopoSigningKey(popo, (AlgorithmIdentifier)signer.AlgorithmDetails, new DerBitString(signature));
        }
    }
}
