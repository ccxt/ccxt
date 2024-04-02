using System;
using System.Collections.Generic;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Crmf;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Math;

namespace Org.BouncyCastle.Crmf
{
    public class CertificateRequestMessageBuilder
    {
        private readonly BigInteger _certReqId;
        private X509ExtensionsGenerator _extGenerator;
        private CertTemplateBuilder _templateBuilder;
        private IList<IControl> m_controls = new List<IControl>();
        private ISignatureFactory _popSigner;
        private PKMacBuilder _pkMacBuilder;
        private char[] _password;
        private GeneralName _sender;
        private int _popoType = ProofOfPossession.TYPE_KEY_ENCIPHERMENT;
        private PopoPrivKey _popoPrivKey;
        private Asn1Null _popRaVerified;
        private PKMacValue _agreeMac;

        public CertificateRequestMessageBuilder(BigInteger certReqId)
        {
            this._certReqId = certReqId;
            this._extGenerator = new X509ExtensionsGenerator();
            this._templateBuilder = new CertTemplateBuilder();
        }

        public CertificateRequestMessageBuilder SetPublicKey(SubjectPublicKeyInfo publicKeyInfo)
        {
            if (publicKeyInfo != null)
            {
                _templateBuilder.SetPublicKey(publicKeyInfo);
            }

            return this;
        }

        public CertificateRequestMessageBuilder SetIssuer(X509Name issuer)
        {
            if (issuer != null)
            {
                _templateBuilder.SetIssuer(issuer);
            }

            return this;
        }

        public CertificateRequestMessageBuilder SetSubject(X509Name subject)
        {
            if (subject != null)
            {
                _templateBuilder.SetSubject(subject);
            }

            return this;
        }

        public CertificateRequestMessageBuilder SetSerialNumber(BigInteger serialNumber)
        {
            if (serialNumber != null)
            {
                _templateBuilder.SetSerialNumber(new DerInteger(serialNumber));
            }

            return this;
        }

        public CertificateRequestMessageBuilder SetValidity(DateTime? notBefore, DateTime? notAfter)
        {
            _templateBuilder.SetValidity(new OptionalValidity(CreateTime(notBefore), CreateTime(notAfter)));
            return this;
        }

        public CertificateRequestMessageBuilder AddExtension(DerObjectIdentifier oid, bool critical,
            Asn1Encodable value)
        {
            _extGenerator.AddExtension(oid, critical, value);
            return this;
        }

        public CertificateRequestMessageBuilder AddExtension(DerObjectIdentifier oid, bool critical,
            byte[] value)
        {
            _extGenerator.AddExtension(oid, critical, value);
            return this;
        }

        public CertificateRequestMessageBuilder AddControl(IControl control)
        {
            m_controls.Add(control);
            return this;
        }

        public CertificateRequestMessageBuilder SetProofOfPossessionSignKeySigner(ISignatureFactory popoSignatureFactory)
        {
            if (_popoPrivKey != null || _popRaVerified != null || _agreeMac != null)
            {
                throw new InvalidOperationException("only one proof of possession is allowed.");
            }

            this._popSigner = popoSignatureFactory;

            return this;
        }

        public CertificateRequestMessageBuilder SetProofOfPossessionSubsequentMessage(SubsequentMessage msg)
        {
            if (_popoPrivKey != null || _popRaVerified != null || _agreeMac != null)
            {
                throw new InvalidOperationException("only one proof of possession is allowed.");
            }

            this._popoType = ProofOfPossession.TYPE_KEY_ENCIPHERMENT;
            this._popoPrivKey = new PopoPrivKey(msg);

            return this;
        }


        public CertificateRequestMessageBuilder SetProofOfPossessionSubsequentMessage(int type, SubsequentMessage msg)
        {
            if (_popoPrivKey != null || _popRaVerified != null || _agreeMac != null)
            {
                throw new InvalidOperationException("only one proof of possession is allowed.");
            }

            if (type != ProofOfPossession.TYPE_KEY_ENCIPHERMENT && type != ProofOfPossession.TYPE_KEY_AGREEMENT)
            {
                throw new ArgumentException("type must be ProofOfPossession.TYPE_KEY_ENCIPHERMENT || ProofOfPossession.TYPE_KEY_AGREEMENT");
            }

            this._popoType = type;
            this._popoPrivKey = new PopoPrivKey(msg);
            return this;
        }

        public CertificateRequestMessageBuilder SetProofOfPossessionAgreeMac(PKMacValue macValue)
        {
            if (_popSigner != null || _popRaVerified != null || _popoPrivKey != null)
            {
                throw new InvalidOperationException("only one proof of possession allowed");
            }

            this._agreeMac = macValue;
            return this;
        }

        public CertificateRequestMessageBuilder SetProofOfPossessionRaVerified()
        {
            if (_popSigner != null || _popoPrivKey != null)
            {
                throw new InvalidOperationException("only one proof of possession allowed");
            }

            this._popRaVerified = DerNull.Instance;

            return this;
        }

        public CertificateRequestMessageBuilder SetAuthInfoPKMAC(PKMacBuilder pkmacFactory, char[] password)
        {
            this._pkMacBuilder = pkmacFactory;
            this._password = password;

            return this;
        }

        public CertificateRequestMessageBuilder SetAuthInfoSender(X509Name sender)
        {
            return SetAuthInfoSender(new GeneralName(sender));
        }

        public CertificateRequestMessageBuilder SetAuthInfoSender(GeneralName sender)
        {
            this._sender = sender;
            return this;
        }

        public CertificateRequestMessage Build()
        {
            Asn1EncodableVector v = new Asn1EncodableVector(new DerInteger(this._certReqId));

            if (!this._extGenerator.IsEmpty)
            {
                this._templateBuilder.SetExtensions(_extGenerator.Generate());
            }

            v.Add(_templateBuilder.Build());

            if (m_controls.Count > 0)
            {
                Asn1EncodableVector controlV = new Asn1EncodableVector();

                foreach (var control in m_controls)
                {
                    controlV.Add(new AttributeTypeAndValue(control.Type, control.Value));
                }

                v.Add(new DerSequence(controlV));
            }

            CertRequest request = CertRequest.GetInstance(new DerSequence(v));

            v = new Asn1EncodableVector(request);

            if (_popSigner != null)
            {
                CertTemplate template = request.CertTemplate;

                if (template.Subject == null || template.PublicKey == null)
                {
                    SubjectPublicKeyInfo pubKeyInfo = request.CertTemplate.PublicKey;

                    ProofOfPossessionSigningKeyBuilder builder = new ProofOfPossessionSigningKeyBuilder(pubKeyInfo);

                    if (_sender != null)
                    {
                        builder.SetSender(_sender);
                    }
                    else
                    {
                        //PKMACValueGenerator pkmacGenerator = new PKMACValueGenerator(_pkmacBuilder);

                        builder.SetPublicKeyMac(_pkMacBuilder, _password);
                    }

                    v.Add(new ProofOfPossession(builder.Build(_popSigner)));
                }
                else
                {
                    ProofOfPossessionSigningKeyBuilder builder = new ProofOfPossessionSigningKeyBuilder(request);

                    v.Add(new ProofOfPossession(builder.Build(_popSigner)));
                }
            }
            else if (_popoPrivKey != null)
            {
                v.Add(new ProofOfPossession(_popoType, _popoPrivKey));
            }
            else if (_agreeMac != null)
            {
                v.Add(new ProofOfPossession(ProofOfPossession.TYPE_KEY_AGREEMENT,
                        PopoPrivKey.GetInstance(new DerTaggedObject(false, PopoPrivKey.agreeMAC, _agreeMac), true)));

            }
            else if (_popRaVerified != null)
            {
                v.Add(new ProofOfPossession());
            }

            return new CertificateRequestMessage(CertReqMsg.GetInstance(new DerSequence(v)));
        }

        private static Time CreateTime(DateTime? dateTime)
        {
            return dateTime == null ? null : new Time(dateTime.Value);
        }
    }
}
