
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Pqc.Crypto.Crystals.Dilithium
{
    public class DilithiumParameters
        : ICipherParameters
        {
        public static DilithiumParameters Dilithium2 = new DilithiumParameters(2);
        public static DilithiumParameters Dilithium3 = new DilithiumParameters(3);
        public static DilithiumParameters Dilithium5 = new DilithiumParameters(5);

        private int k;

        private DilithiumParameters(int param)
        {
            k = param;
        }

        internal DilithiumEngine GetEngine(SecureRandom Random)
        {
            return new DilithiumEngine(k, Random);
        }
    }
}
