using System;

using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cmp
{
    public class PbmParameter
        : Asn1Encodable
    {
        private Asn1OctetString salt;
        private AlgorithmIdentifier owf;
        private DerInteger iterationCount;
        private AlgorithmIdentifier mac;

        private PbmParameter(Asn1Sequence seq)
        {
            salt = Asn1OctetString.GetInstance(seq[0]);
            owf = AlgorithmIdentifier.GetInstance(seq[1]);
            iterationCount = DerInteger.GetInstance(seq[2]);
            mac = AlgorithmIdentifier.GetInstance(seq[3]);
        }

        public static PbmParameter GetInstance(object obj)
        {
            if (obj is PbmParameter)
                return (PbmParameter)obj;

            if (obj is Asn1Sequence)
                return new PbmParameter((Asn1Sequence)obj);

            throw new ArgumentException("Invalid object: " + Platform.GetTypeName(obj), "obj");
        }

        public PbmParameter(
            byte[] salt,
            AlgorithmIdentifier owf,
            int iterationCount,
            AlgorithmIdentifier mac)
            : this(new DerOctetString(salt), owf, new DerInteger(iterationCount), mac)
        {
        }

        public PbmParameter(
            Asn1OctetString salt,
            AlgorithmIdentifier owf,
            DerInteger iterationCount,
            AlgorithmIdentifier mac)
        {
            this.salt = salt;
            this.owf = owf;
            this.iterationCount = iterationCount;
            this.mac = mac;
        }

        public virtual Asn1OctetString Salt
        {
            get { return salt; }
        }

        public virtual AlgorithmIdentifier Owf
        {
            get { return owf; }
        }

        public virtual DerInteger IterationCount
        {
            get { return iterationCount; }
        }

        public virtual AlgorithmIdentifier Mac
        {
            get { return mac; }
        }

        /**
         * <pre>
         *  PbmParameter ::= SEQUENCE {
         *                        salt                OCTET STRING,
         *                        -- note:  implementations MAY wish to limit acceptable sizes
         *                        -- of this string to values appropriate for their environment
         *                        -- in order to reduce the risk of denial-of-service attacks
         *                        owf                 AlgorithmIdentifier,
         *                        -- AlgId for a One-Way Function (SHA-1 recommended)
         *                        iterationCount      INTEGER,
         *                        -- number of times the OWF is applied
         *                        -- note:  implementations MAY wish to limit acceptable sizes
         *                        -- of this integer to values appropriate for their environment
         *                        -- in order to reduce the risk of denial-of-service attacks
         *                        mac                 AlgorithmIdentifier
         *                        -- the MAC AlgId (e.g., DES-MAC, Triple-DES-MAC [PKCS11],
         *    }   -- or HMAC [RFC2104, RFC2202])
         * </pre>
         * @return a basic ASN.1 object representation.
         */
        public override Asn1Object ToAsn1Object()
        {
            return new DerSequence(salt, owf, iterationCount, mac);
        }
    }
}
