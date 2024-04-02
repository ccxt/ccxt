
using System;
using Org.BouncyCastle.Crypto;

namespace Org.BouncyCastle.Pqc.Crypto.Saber
{
    public class SABERParameters
        : ICipherParameters
    {

        public static SABERParameters lightsaberkem128r3 = new SABERParameters("lightsaberkem128r3", 2, 128);
        public static SABERParameters saberkem128r3 = new SABERParameters("saberkem128r3", 3, 128);
        public static SABERParameters firesaberkem128r3 = new SABERParameters("firesaberkem128r3", 4, 128);

        public static SABERParameters lightsaberkem192r3 = new SABERParameters("lightsaberkem192r3", 2, 192);
        public static SABERParameters saberkem192r3 = new SABERParameters("saberkem192r3", 3, 192);
        public static SABERParameters firesaberkem192r3 = new SABERParameters("firesaberkem192r3", 4, 192);

        public static SABERParameters lightsaberkem256r3 = new SABERParameters("lightsaberkem256r3", 2, 256);
        public static SABERParameters saberkem256r3 = new SABERParameters("saberkem256r3", 3, 256);
        public static SABERParameters firesaberkem256r3 = new SABERParameters("firesaberkem256r3", 4, 256);

        private String name;
        private int l;
        private int defaultKeySize;
        private SABEREngine engine;

        public SABERParameters(String name, int l, int defaultKeySize)
        {
            this.name = name;
            this.l = l;
            this.defaultKeySize = defaultKeySize;
            this.engine = new SABEREngine(l, defaultKeySize);
        }

        public String Name => name;

        public int L => l;

        public int DefaultKeySize => defaultKeySize;

        internal SABEREngine GetEngine()
        {
            return engine;
        }
    }
}