using System;
using System.Diagnostics;

using Org.BouncyCastle.Crypto.Utilities;

namespace Org.BouncyCastle.Math.Raw
{
    internal abstract class Nat320
    {
        public static void Copy64(ulong[] x, ulong[] z)
        {
            z[0] = x[0];
            z[1] = x[1];
            z[2] = x[2];
            z[3] = x[3];
            z[4] = x[4];
        }

        public static void Copy64(ulong[] x, int xOff, ulong[] z, int zOff)
        {
            z[zOff + 0] = x[xOff + 0];
            z[zOff + 1] = x[xOff + 1];
            z[zOff + 2] = x[xOff + 2];
            z[zOff + 3] = x[xOff + 3];
            z[zOff + 4] = x[xOff + 4];
        }

        public static ulong[] Create64()
        {
            return new ulong[5];
        }

        public static ulong[] CreateExt64()
        {
            return new ulong[10];
        }

        public static bool Eq64(ulong[] x, ulong[] y)
        {
            for (int i = 4; i >= 0; --i)
            {
                if (x[i] != y[i])
                {
                    return false;
                }
            }
            return true;
        }

        public static bool IsOne64(ulong[] x)
        {
            if (x[0] != 1UL)
            {
                return false;
            }
            for (int i = 1; i < 5; ++i)
            {
                if (x[i] != 0UL)
                {
                    return false;
                }
            }
            return true;
        }

        public static bool IsZero64(ulong[] x)
        {
            for (int i = 0; i < 5; ++i)
            {
                if (x[i] != 0UL)
                {
                    return false;
                }
            }
            return true;
        }

        public static BigInteger ToBigInteger64(ulong[] x)
        {
            byte[] bs = new byte[40];
            for (int i = 0; i < 5; ++i)
            {
                ulong x_i = x[i];
                if (x_i != 0L)
                {
                    Pack.UInt64_To_BE(x_i, bs, (4 - i) << 3);
                }
            }
            return new BigInteger(1, bs);
        }
    }
}
