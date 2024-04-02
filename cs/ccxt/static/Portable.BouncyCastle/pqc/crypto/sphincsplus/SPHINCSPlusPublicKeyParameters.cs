using System;
using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.SphincsPlus
{
    public class SPHINCSPlusPublicKeyParameters
        : SPHINCSPlusKeyParameters
    {
        private PK pk;

        public SPHINCSPlusPublicKeyParameters(SPHINCSPlusParameters parameters, byte[] pkEncoded)
            : base(false, parameters)
        {
            int n = parameters.N;
            if (pkEncoded.Length != 2 * n)
            {
                throw new ArgumentException("public key encoding does not match parameters");
            }

            this.pk = new PK(Arrays.CopyOfRange(pkEncoded, 0, n), Arrays.CopyOfRange(pkEncoded, n, 2 * n));
        }

        internal SPHINCSPlusPublicKeyParameters(SPHINCSPlusParameters parameters, PK pk)
            : base(false, parameters)
        {
            this.pk = pk;
        }

        public byte[] GetSeed()
        {
            return Arrays.Clone(pk.seed);
        }

        public byte[] GetRoot()
        {
            return Arrays.Clone(pk.root);
        }

        public byte[] GetEncoded()
        {
            return Arrays.ConcatenateAll(Pack.UInt32_To_BE(SPHINCSPlusParameters.GetID(GetParameters())), pk.seed, pk.root);
        }
    }
}