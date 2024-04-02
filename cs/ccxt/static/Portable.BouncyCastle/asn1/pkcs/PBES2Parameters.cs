using System;

namespace Org.BouncyCastle.Asn1.Pkcs
{
    public class PbeS2Parameters
        : Asn1Encodable
    {
        private readonly KeyDerivationFunc func;
        private readonly EncryptionScheme scheme;

        public static PbeS2Parameters GetInstance(object obj)
        {
            if (obj == null)
                return null;
            PbeS2Parameters existing = obj as PbeS2Parameters;
            if (existing != null)
                return existing;
            return new PbeS2Parameters(Asn1Sequence.GetInstance(obj));
        }

        public PbeS2Parameters(KeyDerivationFunc keyDevFunc, EncryptionScheme encScheme)
        {
            this.func = keyDevFunc;
            this.scheme = encScheme;
        }

        private PbeS2Parameters(Asn1Sequence seq)
        {
            if (seq.Count != 2)
                throw new ArgumentException("Wrong number of elements in sequence", "seq");

            Asn1Sequence funcSeq = (Asn1Sequence)seq[0].ToAsn1Object();

            // TODO Not sure if this special case is really necessary/appropriate
            if (funcSeq[0].Equals(PkcsObjectIdentifiers.IdPbkdf2))
            {
                func = new KeyDerivationFunc(PkcsObjectIdentifiers.IdPbkdf2,
                    Pbkdf2Params.GetInstance(funcSeq[1]));
            }
            else
            {
                func = new KeyDerivationFunc(funcSeq);
            }

            scheme = EncryptionScheme.GetInstance(seq[1].ToAsn1Object());
        }

        public KeyDerivationFunc KeyDerivationFunc
        {
            get { return func; }
        }

        public EncryptionScheme EncryptionScheme
        {
            get { return scheme; }
        }

        public override Asn1Object ToAsn1Object()
        {
            return new DerSequence(func, scheme);
        }
    }
}
