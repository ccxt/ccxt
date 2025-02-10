using System;
using System.Diagnostics;

using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Math.Raw
{
    /*
     * Modular inversion as implemented in this class is based on the paper "Fast constant-time gcd
     * computation and modular inversion" by Daniel J. Bernstein and Bo-Yin Yang.
     */

    internal abstract class Mod
    {
        private static readonly SecureRandom RandomSource = new SecureRandom();

        private const int M30 = 0x3FFFFFFF;
        private const ulong M32UL = 0xFFFFFFFFUL;

        public static void CheckedModOddInverse(uint[] m, uint[] x, uint[] z)
        {
            if (0 == ModOddInverse(m, x, z))
                throw new ArithmeticException("Inverse does not exist.");
        }

        public static void CheckedModOddInverseVar(uint[] m, uint[] x, uint[] z)
        {
            if (!ModOddInverseVar(m, x, z))
                throw new ArithmeticException("Inverse does not exist.");
        }

        public static uint Inverse32(uint d)
        {
            Debug.Assert((d & 1) == 1);

            //int x = d + (((d + 1) & 4) << 1);   // d.x == 1 mod 2**4
            uint x = d;                         // d.x == 1 mod 2**3
            x *= 2 - d * x;                     // d.x == 1 mod 2**6
            x *= 2 - d * x;                     // d.x == 1 mod 2**12
            x *= 2 - d * x;                     // d.x == 1 mod 2**24
            x *= 2 - d * x;                     // d.x == 1 mod 2**48
            Debug.Assert(d * x == 1);
            return x;
        }

        public static uint ModOddInverse(uint[] m, uint[] x, uint[] z)
        {
            int len32 = m.Length;
            Debug.Assert(len32 > 0);
            Debug.Assert((m[0] & 1) != 0);
            Debug.Assert(m[len32 - 1] != 0);

            int bits = (len32 << 5) - Integers.NumberOfLeadingZeros((int)m[len32 - 1]);
            int len30 = (bits + 29) / 30;

            int[] t = new int[4];
            int[] D = new int[len30];
            int[] E = new int[len30];
            int[] F = new int[len30];
            int[] G = new int[len30];
            int[] M = new int[len30];

            E[0] = 1;
            Encode30(bits, x, 0, G, 0);
            Encode30(bits, m, 0, M, 0);
            Array.Copy(M, 0, F, 0, len30);

            int delta = 0;
            int m0Inv32 = (int)Inverse32((uint)M[0]);
            int maxDivsteps = GetMaximumDivsteps(bits);

            for (int divSteps = 0; divSteps < maxDivsteps; divSteps += 30)
            {
                delta = Divsteps30(delta, F[0], G[0], t);
                UpdateDE30(len30, D, E, t, m0Inv32, M);
                UpdateFG30(len30, F, G, t);
            }

            int signF = F[len30 - 1] >> 31;
            CNegate30(len30, signF, F);

            /*
             * D is in the range (-2.M, M). First, conditionally add M if D is negative, to bring it
             * into the range (-M, M). Then normalize by conditionally negating (according to signF)
             * and/or then adding M, to bring it into the range [0, M).
             */
            CNormalize30(len30, signF, D, M);

            Decode30(bits, D, 0, z, 0);
            Debug.Assert(0 != Nat.LessThan(len32, z, m));

            return (uint)(EqualTo(len30, F, 1) & EqualToZero(len30, G));
        }

        public static bool ModOddInverseVar(uint[] m, uint[] x, uint[] z)
        {
            int len32 = m.Length;
            Debug.Assert(len32 > 0);
            Debug.Assert((m[0] & 1) != 0);
            Debug.Assert(m[len32 - 1] != 0);

            int bits = (len32 << 5) - Integers.NumberOfLeadingZeros((int)m[len32 - 1]);
            int len30 = (bits + 29) / 30;

            int[] t = new int[4];
            int[] D = new int[len30];
            int[] E = new int[len30];
            int[] F = new int[len30];
            int[] G = new int[len30];
            int[] M = new int[len30];

            E[0] = 1;
            Encode30(bits, x, 0, G, 0);
            Encode30(bits, m, 0, M, 0);
            Array.Copy(M, 0, F, 0, len30);

            int clzG = Integers.NumberOfLeadingZeros(G[len30 - 1] | 1) - (len30 * 30 + 2 - bits);
            int eta = -1 - clzG;
            int lenDE = len30, lenFG = len30;
            int m0Inv32 = (int)Inverse32((uint)M[0]);
            int maxDivsteps = GetMaximumDivsteps(bits);

            int divsteps = 0;
            while (!IsZero(lenFG, G))
            {
                if (divsteps >= maxDivsteps)
                    return false;

                divsteps += 30;

                eta = Divsteps30Var(eta, F[0], G[0], t);
                UpdateDE30(lenDE, D, E, t, m0Inv32, M);
                UpdateFG30(lenFG, F, G, t);

                int fn = F[lenFG - 1];
                int gn = G[lenFG - 1];

                int cond = (lenFG - 2) >> 31;
                cond |= fn ^ (fn >> 31);
                cond |= gn ^ (gn >> 31);

                if (cond == 0)
                {
                    F[lenFG - 2] |= fn << 30;
                    G[lenFG - 2] |= gn << 30;
                    --lenFG;
                }
            }

            int signF = F[lenFG - 1] >> 31;

            /*
             * D is in the range (-2.M, M). First, conditionally add M if D is negative, to bring it
             * into the range (-M, M). Then normalize by conditionally negating (according to signF)
             * and/or then adding M, to bring it into the range [0, M).
             */
            int signD = D[lenDE - 1] >> 31;
            if (signD < 0)
            {
                signD = Add30(lenDE, D, M);
            }
            if (signF < 0)
            {
                signD = Negate30(lenDE, D);
                signF = Negate30(lenFG, F);
            }
            Debug.Assert(0 == signF);

            if (!IsOne(lenFG, F))
                return false;

            if (signD < 0)
            {
                signD = Add30(lenDE, D, M);
            }
            Debug.Assert(0 == signD);

            Decode30(bits, D, 0, z, 0);
            Debug.Assert(!Nat.Gte(len32, z, m));

            return true;
        }

        public static uint[] Random(uint[] p)
        {
            int len = p.Length;
            uint[] s = Nat.Create(len);

            uint m = p[len - 1];
            m |= m >> 1;
            m |= m >> 2;
            m |= m >> 4;
            m |= m >> 8;
            m |= m >> 16;

            do
            {
                byte[] bytes = new byte[len << 2];
                RandomSource.NextBytes(bytes);
                Pack.BE_To_UInt32(bytes, 0, s);
                s[len - 1] &= m;
            }
            while (Nat.Gte(len, s, p));

            return s;
        }

        private static int Add30(int len30, int[] D, int[] M)
        {
            Debug.Assert(len30 > 0);
            Debug.Assert(D.Length >= len30);
            Debug.Assert(M.Length >= len30);

            int c = 0, last = len30 - 1;
            for (int i = 0; i < last; ++i)
            {
                c += D[i] + M[i];
                D[i] = c & M30; c >>= 30;
            }
            c += D[last] + M[last];
            D[last] = c; c >>= 30;
            return c;
        }

        private static void CNegate30(int len30, int cond, int[] D)
        {
            Debug.Assert(len30 > 0);
            Debug.Assert(D.Length >= len30);

            int c = 0, last = len30 - 1;
            for (int i = 0; i < last; ++i)
            {
                c += (D[i] ^ cond) - cond;
                D[i] = c & M30; c >>= 30;
            }
            c += (D[last] ^ cond) - cond;
            D[last] = c;
        }

        private static void CNormalize30(int len30, int condNegate, int[] D, int[] M)
        {
            Debug.Assert(len30 > 0);
            Debug.Assert(D.Length >= len30);
            Debug.Assert(M.Length >= len30);

            int last = len30 - 1;

            {
                int c = 0, condAdd = D[last] >> 31;
                for (int i = 0; i < last; ++i)
                {
                    int di = D[i] + (M[i] & condAdd);
                    di = (di ^ condNegate) - condNegate;
                    c += di; D[i] = c & M30; c >>= 30;
                }
                {
                    int di = D[last] + (M[last] & condAdd);
                    di = (di ^ condNegate) - condNegate;
                    c += di; D[last] = c;
                }
            }

            {
                int c = 0, condAdd = D[last] >> 31;
                for (int i = 0; i < last; ++i)
                {
                    int di = D[i] + (M[i] & condAdd);
                    c += di; D[i] = c & M30; c >>= 30;
                }
                {
                    int di = D[last] + (M[last] & condAdd);
                    c += di; D[last] = c;
                }
                Debug.Assert(c >> 30 == 0);
            }
        }

        private static void Decode30(int bits, int[] x, int xOff, uint[] z, int zOff)
        {
            Debug.Assert(bits > 0);

            int avail = 0;
            ulong data = 0L;

            while (bits > 0)
            {
                while (avail < System.Math.Min(32, bits))
                {
                    data |= (ulong)x[xOff++] << avail;
                    avail += 30;
                }

                z[zOff++] = (uint)data; data >>= 32;
                avail -= 32;
                bits -= 32;
            }
        }

        private static int Divsteps30(int delta, int f0, int g0, int[] t)
        {
            int u = 1 << 30, v = 0, q = 0, r = 1 << 30;
            int f = f0, g = g0;

            for (int i = 0; i < 30; ++i)
            {
                Debug.Assert((f & 1) == 1);
                Debug.Assert(((u >> (30 - i)) * f0 + (v >> (30 - i)) * g0) == f << i);
                Debug.Assert(((q >> (30 - i)) * f0 + (r >> (30 - i)) * g0) == g << i);

                int c1 = delta >> 31;
                int c2 = -(g & 1);

                int x = f ^ c1;
                int y = u ^ c1;
                int z = v ^ c1;

                g -= x & c2;
                q -= y & c2;
                r -= z & c2;

                c2 &= ~c1;
                delta = (delta ^ c2) - (c2 - 1);

                f += g & c2;
                u += q & c2;
                v += r & c2;

                g >>= 1;
                q >>= 1;
                r >>= 1;
            }

            t[0] = u;
            t[1] = v;
            t[2] = q;
            t[3] = r;

            return delta;
        }

        private static int Divsteps30Var(int eta, int f0, int g0, int[] t)
        {
            int u = 1, v = 0, q = 0, r = 1;
            int f = f0, g = g0, m, w, x, y, z;
            int i = 30, limit, zeros;

            for (; ; )
            {
                // Use a sentinel bit to count zeros only up to i.
                zeros = Integers.NumberOfTrailingZeros(g | (-1 << i));

                g >>= zeros;
                u <<= zeros;
                v <<= zeros;
                eta -= zeros;
                i -= zeros;

                if (i <= 0)
                    break;

                Debug.Assert((f & 1) == 1);
                Debug.Assert((g & 1) == 1);
                Debug.Assert((u * f0 + v * g0) == f << (30 - i));
                Debug.Assert((q * f0 + r * g0) == g << (30 - i));

                if (eta < 0)
                {
                    eta = -eta;
                    x = f; f = g; g = -x;
                    y = u; u = q; q = -y;
                    z = v; v = r; r = -z;

                    // Handle up to 6 divsteps at once, subject to eta and i.
                    limit = (eta + 1) > i ? i : (eta + 1);
                    m = (int)((uint.MaxValue >> (32 - limit)) & 63U);

                    w = (f * g * (f * f - 2)) & m;
                }
                else
                {
                    // Handle up to 4 divsteps at once, subject to eta and i.
                    limit = (eta + 1) > i ? i : (eta + 1);
                    m = (int)((uint.MaxValue >> (32 - limit)) & 15U);

                    w = f + (((f + 1) & 4) << 1);
                    w = (-w * g) & m;
                }

                g += f * w;
                q += u * w;
                r += v * w;

                Debug.Assert((g & m) == 0);
            }

            t[0] = u;
            t[1] = v;
            t[2] = q;
            t[3] = r;

            return eta;
        }

        private static void Encode30(int bits, uint[] x, int xOff, int[] z, int zOff)
        {
            Debug.Assert(bits > 0);

            int avail = 0;
            ulong data = 0UL;

            while (bits > 0)
            {
                if (avail < System.Math.Min(30, bits))
                {
                    data |= (x[xOff++] & M32UL) << avail;
                    avail += 32;
                }

                z[zOff++] = (int)data & M30; data >>= 30;
                avail -= 30;
                bits -= 30;
            }
        }

        private static int EqualTo(int len, int[] x, int y)
        {
            int d = x[0] ^ y;
            for (int i = 1; i < len; ++i)
            {
                d |= x[i];
            }
            d = (int)((uint)d >> 1) | (d & 1);
            return (d - 1) >> 31;
        }

        private static int EqualToZero(int len, int[] x)
        {
            int d = 0;
            for (int i = 0; i < len; ++i)
            {
                d |= x[i];
            }
            d = (int)((uint)d >> 1) | (d & 1);
            return (d - 1) >> 31;
        }

        private static int GetMaximumDivsteps(int bits)
        {
            return (49 * bits + (bits < 46 ? 80 : 47)) / 17;
        }

        private static bool IsOne(int len, int[] x)
        {
            if (x[0] != 1)
            {
                return false;
            }
            for (int i = 1; i < len; ++i)
            {
                if (x[i] != 0)
                {
                    return false;
                }
            }
            return true;
        }

        private static bool IsZero(int len, int[] x)
        {
            if (x[0] != 0)
            {
                return false;
            }
            for (int i = 1; i < len; ++i)
            {
                if (x[i] != 0)
                {
                    return false;
                }
            }
            return true;
        }

        private static int Negate30(int len30, int[] D)
        {
            Debug.Assert(len30 > 0);
            Debug.Assert(D.Length >= len30);

            int c = 0, last = len30 - 1;
            for (int i = 0; i < last; ++i)
            {
                c -= D[i];
                D[i] = c & M30; c >>= 30;
            }
            c -= D[last];
            D[last] = c; c >>= 30;
            return c;
        }

        private static void UpdateDE30(int len30, int[] D, int[] E, int[] t, int m0Inv32, int[] M)
        {
            Debug.Assert(len30 > 0);
            Debug.Assert(D.Length >= len30);
            Debug.Assert(E.Length >= len30);
            Debug.Assert(M.Length >= len30);
            Debug.Assert(m0Inv32 * M[0] == 1);

            int u = t[0], v = t[1], q = t[2], r = t[3];
            int di, ei, i, md, me, mi, sd, se;
            long cd, ce;

            /*
             * We accept D (E) in the range (-2.M, M) and conceptually add the modulus to the input
             * value if it is initially negative. Instead of adding it explicitly, we add u and/or v (q
             * and/or r) to md (me).
             */
            sd = D[len30 - 1] >> 31;
            se = E[len30 - 1] >> 31;

            md = (u & sd) + (v & se);
            me = (q & sd) + (r & se);

            mi = M[0];
            di = D[0];
            ei = E[0];

            cd = (long)u * di + (long)v * ei;
            ce = (long)q * di + (long)r * ei;

            /*
             * Subtract from md/me an extra term in the range [0, 2^30) such that the low 30 bits of the
             * intermediate D/E values will be 0, allowing clean division by 2^30. The final D/E are
             * thus in the range (-2.M, M), consistent with the input constraint.
             */
            md -= (m0Inv32 * (int)cd + md) & M30;
            me -= (m0Inv32 * (int)ce + me) & M30;

            cd += (long)mi * md;
            ce += (long)mi * me;

            Debug.Assert(((int)cd & M30) == 0);
            Debug.Assert(((int)ce & M30) == 0);

            cd >>= 30;
            ce >>= 30;

            for (i = 1; i < len30; ++i)
            {
                mi = M[i];
                di = D[i];
                ei = E[i];

                cd += (long)u * di + (long)v * ei + (long)mi * md;
                ce += (long)q * di + (long)r * ei + (long)mi * me;

                D[i - 1] = (int)cd & M30; cd >>= 30;
                E[i - 1] = (int)ce & M30; ce >>= 30;
            }

            D[len30 - 1] = (int)cd;
            E[len30 - 1] = (int)ce;
        }

        private static void UpdateFG30(int len30, int[] F, int[] G, int[] t)
        {
            Debug.Assert(len30 > 0);
            Debug.Assert(F.Length >= len30);
            Debug.Assert(G.Length >= len30);

            int u = t[0], v = t[1], q = t[2], r = t[3];
            int fi, gi, i;
            long cf, cg;

            fi = F[0];
            gi = G[0];

            cf = (long)u * fi + (long)v * gi;
            cg = (long)q * fi + (long)r * gi;

            Debug.Assert(((int)cf & M30) == 0);
            Debug.Assert(((int)cg & M30) == 0);

            cf >>= 30;
            cg >>= 30;

            for (i = 1; i < len30; ++i)
            {
                fi = F[i];
                gi = G[i];

                cf += (long)u * fi + (long)v * gi;
                cg += (long)q * fi + (long)r * gi;

                F[i - 1] = (int)cf & M30; cf >>= 30;
                G[i - 1] = (int)cg & M30; cg >>= 30;
            }

            F[len30 - 1] = (int)cf;
            G[len30 - 1] = (int)cg;
        }
    }
}