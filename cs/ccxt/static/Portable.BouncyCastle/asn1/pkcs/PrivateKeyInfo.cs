using System;

using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Utilities.Collections;

namespace Org.BouncyCastle.Asn1.Pkcs
{
    /**
     *  RFC 5958
     *
     *  <pre>
     *  [IMPLICIT TAGS]
     *
     *  OneAsymmetricKey ::= SEQUENCE {
     *      version                   Version,
     *      privateKeyAlgorithm       PrivateKeyAlgorithmIdentifier,
     *      privateKey                PrivateKey,
     *      attributes            [0] Attributes OPTIONAL,
     *      ...,
     *      [[2: publicKey        [1] PublicKey OPTIONAL ]],
     *      ...
     *  }
     *
     *  PrivateKeyInfo ::= OneAsymmetricKey
     *
     *  Version ::= INTEGER { v1(0), v2(1) } (v1, ..., v2)
     *
     *  PrivateKeyAlgorithmIdentifier ::= AlgorithmIdentifier
     *                                     { PUBLIC-KEY,
     *                                       { PrivateKeyAlgorithms } }
     *
     *  PrivateKey ::= OCTET STRING
     *                     -- Content varies based on type of key.  The
     *                     -- algorithm identifier dictates the format of
     *                     -- the key.
     *
     *  PublicKey ::= BIT STRING
     *                     -- Content varies based on type of key.  The
     *                     -- algorithm identifier dictates the format of
     *                     -- the key.
     *
     *  Attributes ::= SET OF Attribute { { OneAsymmetricKeyAttributes } }
     *  </pre>
     */
    public class PrivateKeyInfo
        : Asn1Encodable
    {
        private readonly DerInteger version;
        private readonly AlgorithmIdentifier privateKeyAlgorithm;
        private readonly Asn1OctetString privateKey;
        private readonly Asn1Set attributes;
        private readonly DerBitString publicKey;

        public static PrivateKeyInfo GetInstance(Asn1TaggedObject obj, bool explicitly)
        {
            return GetInstance(Asn1Sequence.GetInstance(obj, explicitly));
        }

        public static PrivateKeyInfo GetInstance(
            object obj)
        {
            if (obj == null)
                return null;
            if (obj is PrivateKeyInfo)
                return (PrivateKeyInfo)obj;
            return new PrivateKeyInfo(Asn1Sequence.GetInstance(obj));
        }

        private static int GetVersionValue(DerInteger version)
        {
            BigInteger bigValue = version.Value;
            if (bigValue.CompareTo(BigInteger.Zero) < 0 || bigValue.CompareTo(BigInteger.One) > 0)
                throw new ArgumentException("invalid version for private key info", "version");

            return bigValue.IntValue;
        }

        public PrivateKeyInfo(
            AlgorithmIdentifier privateKeyAlgorithm,
            Asn1Encodable privateKey)
            : this(privateKeyAlgorithm, privateKey, null, null)
        {
        }

        public PrivateKeyInfo(
            AlgorithmIdentifier privateKeyAlgorithm,
            Asn1Encodable privateKey,
            Asn1Set attributes)
            : this(privateKeyAlgorithm, privateKey, attributes, null)
        {
        }

        public PrivateKeyInfo(
            AlgorithmIdentifier privateKeyAlgorithm,
            Asn1Encodable privateKey,
            Asn1Set attributes,
            byte[] publicKey)
        {
            this.version = new DerInteger(publicKey != null ? BigInteger.One : BigInteger.Zero);
            this.privateKeyAlgorithm = privateKeyAlgorithm;
            this.privateKey = new DerOctetString(privateKey);
            this.attributes = attributes;
            this.publicKey = publicKey == null ? null : new DerBitString(publicKey);
        }

        private PrivateKeyInfo(Asn1Sequence seq)
        {
            var e = seq.GetEnumerator();

            this.version = DerInteger.GetInstance(CollectionUtilities.RequireNext(e));

            int versionValue = GetVersionValue(version);

            this.privateKeyAlgorithm = AlgorithmIdentifier.GetInstance(CollectionUtilities.RequireNext(e));
            this.privateKey = Asn1OctetString.GetInstance(CollectionUtilities.RequireNext(e));

            int lastTag = -1;
            while (e.MoveNext())
            {
                Asn1TaggedObject tagged = (Asn1TaggedObject)e.Current;

                int tag = tagged.TagNo;
                if (tag <= lastTag)
                    throw new ArgumentException("invalid optional field in private key info", "seq");

                lastTag = tag;

                switch (tag)
                {
                case 0:
                {
                    this.attributes = Asn1Set.GetInstance(tagged, false);
                    break;
                }
                case 1:
                {
                    if (versionValue < 1)
                        throw new ArgumentException("'publicKey' requires version v2(1) or later", "seq");

                    this.publicKey = DerBitString.GetInstance(tagged, false);
                    break;
                }
                default:
                {
                    throw new ArgumentException("unknown optional field in private key info", "seq");
                }
                }
            }
        }

        public virtual DerInteger Version
        {
            get { return version; }
        }

        public virtual Asn1Set Attributes
        {
            get { return attributes; }
        }

        /// <summary>Return true if a public key is present, false otherwise.</summary>
        public virtual bool HasPublicKey
        {
            get { return publicKey != null; }
        }

        public virtual AlgorithmIdentifier PrivateKeyAlgorithm
        {
            get { return privateKeyAlgorithm; }
        }

        public virtual Asn1OctetString PrivateKeyData
        {
            get { return privateKey; }
        } 

        public virtual Asn1Object ParsePrivateKey()
        {
            return Asn1Object.FromByteArray(privateKey.GetOctets());
        }

        /// <summary>For when the public key is an ASN.1 encoding.</summary>
        public virtual Asn1Object ParsePublicKey()
        {
            return publicKey == null ? null : Asn1Object.FromByteArray(publicKey.GetOctets());
        }

        /// <summary>Return the public key as a raw bit string.</summary>
        public virtual DerBitString PublicKeyData
        {
            get { return publicKey; }
        }

        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector(version, privateKeyAlgorithm, privateKey);
            v.AddOptionalTagged(false, 0, attributes);
            v.AddOptionalTagged(false, 1, publicKey);
            return new DerSequence(v);
        }
    }
}
