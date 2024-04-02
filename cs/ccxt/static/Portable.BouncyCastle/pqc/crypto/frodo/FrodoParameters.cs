
using System;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Digests;

namespace Org.BouncyCastle.Pqc.Crypto.Frodo
{
    public class FrodoParameters
        : ICipherParameters
    {

        private static short[] cdf_table640  = {4643, 13363, 20579, 25843, 29227, 31145, 32103, 32525, 32689, 32745, 32762, 32766, 32767};
        private static short[] cdf_table976  = {5638, 15915, 23689, 28571, 31116, 32217, 32613, 32731, 32760, 32766, 32767};
        private static short[] cdf_table1344 = {9142, 23462, 30338, 32361, 32725, 32765, 32767};

        public static FrodoParameters frodokem19888r3 = new FrodoParameters("frodokem19888", 640, 15, 2, cdf_table640, new ShakeDigest(128), new FrodoMatrixGenerator.Aes128MatrixGenerator(640, (1<<15)));
        public static FrodoParameters frodokem19888shaker3 = new FrodoParameters("frodokem19888shake", 640, 15, 2, cdf_table640, new ShakeDigest(128), new FrodoMatrixGenerator.Shake128MatrixGenerator(640, (1<<15)));

        public static FrodoParameters frodokem31296r3 = new FrodoParameters("frodokem31296", 976, 16, 3, cdf_table976, new ShakeDigest(256), new FrodoMatrixGenerator.Aes128MatrixGenerator(976, (1<<16)));
        public static FrodoParameters frodokem31296shaker3 = new FrodoParameters("frodokem31296shake", 976, 16, 3, cdf_table976, new ShakeDigest(256), new FrodoMatrixGenerator.Shake128MatrixGenerator(976, (1<<16)));

        public static FrodoParameters frodokem43088r3 = new FrodoParameters("frodokem43088", 1344, 16, 4, cdf_table1344, new ShakeDigest(256), new FrodoMatrixGenerator.Aes128MatrixGenerator(1344, (1<<16)));
        public static FrodoParameters frodokem43088shaker3 = new FrodoParameters("frodokem43088shake", 1344, 16, 4, cdf_table1344, new ShakeDigest(256), new FrodoMatrixGenerator.Shake128MatrixGenerator(1344, (1<<16)));

        private String name;
        private int n;
        private int d;
        private int b;
        private short[] cdf_table;
        private IDigest digest;
        private FrodoMatrixGenerator mGen;
        private int defaultKeySize;
        private FrodoEngine engine;

        public FrodoParameters(String name, int n, int d, int b, short[] cdf_table, IDigest digest, FrodoMatrixGenerator mGen)
        {
            this.name = name;
            this.n = n;
            this.d = d;
            this.b = b;
            this.cdf_table = cdf_table;
            this.digest = digest;
            this.mGen = mGen;
            this.defaultKeySize = B * FrodoEngine.nbar * FrodoEngine.nbar;
            this.engine = new FrodoEngine(n, d, b, cdf_table, digest, mGen);
        }

        public FrodoEngine Engine => engine;

        public int N => n;

        public String Name => name;

        public int D => d;

        public int B => b;

        public short[] CdfTable => cdf_table;

        public IDigest Digest => digest;

        public int DefaultKeySize => defaultKeySize;

        public FrodoMatrixGenerator MGen => mGen;
    }
} 
