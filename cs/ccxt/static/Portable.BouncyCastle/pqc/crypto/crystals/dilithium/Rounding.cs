using System;

namespace Org.BouncyCastle.Pqc.Crypto.Crystals.Dilithium
{
    internal class Rounding
    {
        public static int[] Power2Round(int a)
        {
            int[] r = new int[2];

            r[0] = (a + (1 << (DilithiumEngine.D - 1)) - 1) >> DilithiumEngine.D;
            r[1] = a - (r[0] << DilithiumEngine.D);
            return r;
        }

        public static int[] Decompose(int a, int gamma2)
        {
            int a0, a1;
            a1 = (a + 127) >> 7;
            if (gamma2 == (DilithiumEngine.Q - 1) / 32)
            {
                a1 = (a1 * 1025 + (1 << 21)) >> 22;
                a1 &= 15;
            }
            else if (gamma2 == (DilithiumEngine.Q - 1) / 88)
            {
                a1 = (a1 * 11275 + (1 << 23)) >> 24;
                a1 ^= ((43 - a1) >> 31) & a1;
            }
            else
            {
                throw new ArgumentException("Wrong Gamma2!");
            }

            a0 = a - a1 * 2 * gamma2;
            a0 -= (((DilithiumEngine.Q - 1) / 2 - a0) >> 31) & DilithiumEngine.Q;
            return new int[] { a0, a1 };
        }

        public static int MakeHint(int a0, int a1, DilithiumEngine engine)
        {
            int g2 = engine.Gamma2, q = DilithiumEngine.Q;
            if (a0 <= g2 || a0 > q - g2 || (a0 == q - g2 && a1 == 0))
            {
                return 0;
            }
            return 1;
        }

        public static int UseHint(int a, int hint, int gamma2)
        {
            int a0, a1;

            int[] intArray = Decompose(a, gamma2);
            a0 = intArray[0];
            a1 = intArray[1];

            if (hint == 0)
            {
                return a1;
            }

            if (gamma2 == (DilithiumEngine.Q - 1) / 32)
            {
                if (a0 > 0)
                {
                    return (a1 + 1) & 15;
                }
                else
                {
                    return (a1 - 1) & 15;
                }
            }
            else if (gamma2 == (DilithiumEngine.Q - 1) / 88)
            {
                if (a0 > 0)
                {
                    return (a1 == 43) ? 0 : a1 + 1;
                }
                else
                {
                    return (a1 == 0) ? 43 : a1 - 1;
                }
            }
            else
            {
                throw new ArgumentException("Wrong Gamma2!");
            }
        }
    }
}
