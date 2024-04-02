using System;

namespace Org.BouncyCastle.Pqc.Crypto.Crystals.Dilithium
{
    internal class Reduce
    {
        public static int MontgomeryReduce(long a)
        {
            int t;
            t = (int)(a * DilithiumEngine.QInv);
            t = (int)((a - (long)((long)t * (long)DilithiumEngine.Q)) >> 32);
            //Console.Write("{0}, ", t);
            return t;
        }

        public static int Reduce32(int a)
        {
            int t;
            t = (a + (1 << 22)) >> 23;
            t = a - t * DilithiumEngine.Q;
            return t;
        }
        
        public static int ConditionalAddQ(int a)
        {
            a += (a >> 31) & DilithiumEngine.Q;
            return a;
        }


    }
}
