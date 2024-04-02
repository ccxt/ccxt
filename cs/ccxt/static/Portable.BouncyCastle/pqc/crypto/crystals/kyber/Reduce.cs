
namespace Org.BouncyCastle.Pqc.Crypto.Crystals.Kyber
{
    internal static class Reduce
    {
        public static short MontgomeryReduce(int a)
        {
            int t;
            short u;

            u = (short)(a * KyberEngine.QInv);
            t = (int)(u * KyberEngine.Q);
            t = a - t;
            t >>= 16;
            return (short)t;
        }

        public static short BarrettReduce(short a)
        {
            short t;
            short v = (short)(((1U << 26) + (KyberEngine.Q / 2)) / KyberEngine.Q);
            t = (short)((v * a) >> 26);
            t = (short)(t * KyberEngine.Q);
            return (short)(a - t);
        }
        
        public static short CondSubQ(short a)
        {
            a -= KyberEngine.Q;
            a += (short) ((a >> 15) & KyberEngine.Q);
            return a;
        }

    }
}
