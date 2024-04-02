
using System;
using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.SphincsPlus
{
    public class SPHINCSPlusPrivateKeyParameters
        : SPHINCSPlusKeyParameters
    {
        internal SK sk;
        internal PK pk;

        public SPHINCSPlusPrivateKeyParameters(SPHINCSPlusParameters parameters, byte[] skpkEncoded)
            : base(true, parameters)
        {
            int n = parameters.N;
            if (skpkEncoded.Length != 4 * n)
            {
                throw new ArgumentException("private key encoding does not match parameters");
            }

            this.sk = new SK(Arrays.CopyOfRange(skpkEncoded, 0, n), Arrays.CopyOfRange(skpkEncoded, n, 2 * n));
            this.pk = new PK(Arrays.CopyOfRange(skpkEncoded, 2 * n, 3 * n),
                Arrays.CopyOfRange(skpkEncoded, 3 * n, 4 * n));
        }

        internal SPHINCSPlusPrivateKeyParameters(SPHINCSPlusParameters parameters, SK sk, PK pk)
            : base(true, parameters)
        {
            this.sk = sk;
            this.pk = pk;
        }

        public byte[] GetSeed()
        {
            return Arrays.Clone(sk.seed);
        }

        public byte[] GetPrf()
        {
            return Arrays.Clone(sk.prf);
        }

        public byte[] GetPublicSeed()
        {
            return Arrays.Clone(pk.seed);
        }

        public byte[] GetPublicKey()
        {
            return Arrays.Concatenate(pk.seed, pk.root);
        }

        public byte[] GetEncoded()
        {
            return Arrays.Concatenate(Pack.UInt32_To_BE(SPHINCSPlusParameters.GetID(GetParameters())),
                Arrays.ConcatenateAll(sk.seed, sk.prf, pk.seed, pk.root));
        }

        public byte[] GetEncodedPublicKey()
        {
            return Arrays.ConcatenateAll(Pack.UInt32_To_BE(SPHINCSPlusParameters.GetID(GetParameters())), pk.seed, pk.root);
        }
    }
}