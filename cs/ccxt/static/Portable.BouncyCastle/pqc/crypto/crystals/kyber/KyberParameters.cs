
using System;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Pqc.Crypto.Crystals.Kyber;

namespace Org.BouncyCastle.Pqc.Crypto.Crystals.Kyber
{
    public class KyberParameters
        : ICipherParameters
    {

        public static KyberParameters kyber512 = new KyberParameters("kyber512", 2);
        public static KyberParameters kyber768 = new KyberParameters("kyber768", 3);
        public static KyberParameters kyber1024 = new KyberParameters("kyber1024", 4);

        private String name;
        private int k;
        private KyberEngine engine;

        public KyberParameters(String name, int k)
        {
            this.name = name;
            this.k = k;
            this.engine = new KyberEngine(k);
        }

        public String Name => name;

        public int K => k;

        public int DefaultKeySize => 64 * k;

        internal KyberEngine GetEngine()
        {
            return engine;
        }
    }
}