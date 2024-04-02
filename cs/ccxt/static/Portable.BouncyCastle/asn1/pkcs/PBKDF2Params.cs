using System;

using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Pkcs
{
    public class Pbkdf2Params
        : Asn1Encodable
    {
        private static AlgorithmIdentifier algid_hmacWithSHA1 = new AlgorithmIdentifier(PkcsObjectIdentifiers.IdHmacWithSha1, DerNull.Instance);

        private readonly Asn1OctetString     octStr;
        private readonly DerInteger          iterationCount, keyLength;
        private readonly AlgorithmIdentifier prf;

        public static Pbkdf2Params GetInstance(
            object obj)
        {
            if (obj == null || obj is Pbkdf2Params)
                return (Pbkdf2Params)obj;

            if (obj is Asn1Sequence)
                return new Pbkdf2Params((Asn1Sequence)obj);

            throw new ArgumentException("Unknown object in factory: " + Platform.GetTypeName(obj), "obj");
        }

        public Pbkdf2Params(
            Asn1Sequence seq)
        {
            if (seq.Count < 2 || seq.Count > 4)
                throw new ArgumentException("Wrong number of elements in sequence", "seq");

            this.octStr = (Asn1OctetString)seq[0];
            this.iterationCount = (DerInteger)seq[1];

            Asn1Encodable kl = null, d = null;
            if (seq.Count > 3)
            {
                kl = seq[2];
                d = seq[3];
            }
            else if (seq.Count > 2)
            {
                if (seq[2] is DerInteger)
                {
                    kl = seq[2];
                }
                else
                {
                    d = seq[2];
                }
            }
            if (kl != null)
            {
                keyLength = (DerInteger)kl;
            }
            if (d != null)
            {
                prf = AlgorithmIdentifier.GetInstance(d);
            }
        }

        public Pbkdf2Params(
            byte[] salt,
            int iterationCount)
        {
            this.octStr = new DerOctetString(salt);
            this.iterationCount = new DerInteger(iterationCount);
        }

        public Pbkdf2Params(
            byte[]  salt,
            int     iterationCount,
            int     keyLength)
            : this(salt, iterationCount)
        {
            this.keyLength = new DerInteger(keyLength);
        }

        public Pbkdf2Params(
            byte[] salt,
            int iterationCount,
            int keyLength,
            AlgorithmIdentifier prf)
            : this(salt, iterationCount, keyLength)
        {
            this.prf = prf;
        }

        public Pbkdf2Params(
            byte[] salt,
            int iterationCount,
            AlgorithmIdentifier prf)
            : this(salt, iterationCount)
        {
            this.prf = prf;
        }

        public byte[] GetSalt()
        {
            return octStr.GetOctets();
        }

        public BigInteger IterationCount
        {
            get { return iterationCount.Value; }
        }

        public BigInteger KeyLength
        {
            get { return keyLength == null ? null : keyLength.Value; }
        }

        public bool IsDefaultPrf
        {
            get { return prf == null || prf.Equals(algid_hmacWithSHA1); }
        }

        public AlgorithmIdentifier Prf
        {
            get { return prf != null ? prf : algid_hmacWithSHA1; }
        }

        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector(octStr, iterationCount);
            v.AddOptional(keyLength);

            if (!IsDefaultPrf)
            {
                v.Add(prf);
            }

            return new DerSequence(v);
        }
    }
}
