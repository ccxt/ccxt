using System;
using System.Text;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Math.EC
{
    internal sealed class LongArray
    {
        // TODO make m fixed for the LongArray, and hence compute T once and for all

        private ulong[] m_data;

        public LongArray(int intLen)
        {
            m_data = new ulong[intLen];
        }

        public LongArray(ulong[] data)
        {
            m_data = data;
        }

        public LongArray(ulong[] data, int off, int len)
        {
            if (off == 0 && len == data.Length)
            {
                m_data = data;
            }
            else
            {
                m_data = new ulong[len];
                Array.Copy(data, off, m_data, 0, len);
            }
        }

        public LongArray(BigInteger bigInt)
        {
            if (bigInt == null || bigInt.SignValue < 0)
            {
                throw new ArgumentException("invalid F2m field value", "bigInt");
            }

            if (bigInt.SignValue == 0)
            {
                m_data = new ulong[]{ 0UL };
                return;
            }

            byte[] barr = bigInt.ToByteArray();
            int barrLen = barr.Length;
            int barrStart = 0;
            if (barr[0] == 0)
            {
                // First byte is 0 to enforce highest (=sign) bit is zero.
                // In this case ignore barr[0].
                barrLen--;
                barrStart = 1;
            }
            int intLen = (barrLen + 7) / 8;
            m_data = new ulong[intLen];

            int iarrJ = intLen - 1;
            int rem = barrLen % 8 + barrStart;
            ulong temp = 0;
            int barrI = barrStart;
            if (barrStart < rem)
            {
                for (; barrI < rem; barrI++)
                {
                    temp <<= 8;
                    uint barrBarrI = barr[barrI];
                    temp |= barrBarrI;
                }
                m_data[iarrJ--] = temp;
            }

            for (; iarrJ >= 0; iarrJ--)
            {
                temp = 0;
                for (int i = 0; i < 8; i++)
                {
                    temp <<= 8;
                    uint barrBarrI = barr[barrI++];
                    temp |= barrBarrI;
                }
                m_data[iarrJ] = temp;
            }
        }

        internal void CopyTo(ulong[] z, int zOff)
        {
            Array.Copy(m_data, 0, z, zOff, m_data.Length);
        }

        public bool IsOne()
        {
            ulong[] a = m_data;
            int aLen = a.Length;
            if (aLen < 1 || a[0] != 1UL)
            {
                return false;
            }
            for (int i = 1; i < aLen; ++i)
            {
                if (a[i] != 0UL)
                {
                    return false;
                }
            }
            return true;
        }

        public bool IsZero()
        {
            ulong[] a = m_data;
            for (int i = 0; i < a.Length; ++i)
            {
                if (a[i] != 0UL)
                {
                    return false;
                }
            }
            return true;
        }

        public int GetUsedLength()
        {
            return GetUsedLengthFrom(m_data.Length);
        }

        public int GetUsedLengthFrom(int from)
        {
            ulong[] a = m_data;
            from = System.Math.Min(from, a.Length);

            if (from < 1)
            {
                return 0;
            }

            // Check if first element will act as sentinel
            if (a[0] != 0UL)
            {
                while (a[--from] == 0UL)
                {
                }
                return from + 1;
            }

            do
            {
                if (a[--from] != 0UL)
                {
                    return from + 1;
                }
            }
            while (from > 0);

            return 0;
        }

        public int Degree()
        {
            int i = m_data.Length;
            ulong w;
            do
            {
                if (i == 0)
                {
                    return 0;
                }
                w = m_data[--i];
            }
            while (w == 0UL);

            return (i << 6) + BitLength(w);
        }

        private int DegreeFrom(int limit)
        {
            int i = (int)(((uint)limit + 62) >> 6);
            ulong w;
            do
            {
                if (i == 0)
                {
                    return 0;
                }
                w = m_data[--i];
            }
            while (w == 0);

            return (i << 6) + BitLength(w);
        }

        private static int BitLength(ulong w)
        {
            return 64 - Longs.NumberOfLeadingZeros((long)w);
        }

        private ulong[] ResizedData(int newLen)
        {
            ulong[] newInts = new ulong[newLen];
            Array.Copy(m_data, 0, newInts, 0, System.Math.Min(m_data.Length, newLen));
            return newInts;
        }

        public BigInteger ToBigInteger()
        {
            int usedLen = GetUsedLength();
            if (usedLen == 0)
            {
                return BigInteger.Zero;
            }

            ulong highestInt = m_data[usedLen - 1];
            byte[] temp = new byte[8];
            int barrI = 0;
            bool trailingZeroBytesDone = false;
            for (int j = 7; j >= 0; j--)
            {
                byte thisByte = (byte)(highestInt >> (8 * j));
                if (trailingZeroBytesDone || (thisByte != 0))
                {
                    trailingZeroBytesDone = true;
                    temp[barrI++] = thisByte;
                }
            }

            int barrLen = 8 * (usedLen - 1) + barrI;
            byte[] barr = new byte[barrLen];
            for (int j = 0; j < barrI; j++)
            {
                barr[j] = temp[j];
            }
            // Highest value int is done now

            for (int iarrJ = usedLen - 2; iarrJ >= 0; iarrJ--)
            {
                ulong mi = m_data[iarrJ];
                for (int j = 7; j >= 0; j--)
                {
                    barr[barrI++] = (byte)(mi >> (8 * j));
                }
            }
            return new BigInteger(1, barr);
        }

        private static ulong ShiftUp(ulong[] x, int xOff, int count, int shift)
        {
            int shiftInv = 64 - shift;
            ulong prev = 0UL;
            for (int i = 0; i < count; ++i)
            {
                ulong next = x[xOff + i];
                x[xOff + i] = (next << shift) | prev;
                prev = next >> shiftInv;
            }
            return prev;
        }

        private static ulong ShiftUp(ulong[] x, int xOff, ulong[] z, int zOff, int count, int shift)
        {
            int shiftInv = 64 - shift;
            ulong prev = 0UL;
            for (int i = 0; i < count; ++i)
            {
                ulong next = x[xOff + i];
                z[zOff + i] = (next << shift) | prev;
                prev = next >> shiftInv;
            }
            return prev;
        }

        public LongArray AddOne()
        {
            if (m_data.Length == 0)
            {
                return new LongArray(new ulong[]{ 1UL });
            }

            int resultLen = System.Math.Max(1, GetUsedLength());
            ulong[] data = ResizedData(resultLen);
            data[0] ^= 1UL;
            return new LongArray(data);
        }

        private void AddShiftedByBitsSafe(LongArray other, int otherDegree, int bits)
        {
            int otherLen = (int)((uint)(otherDegree + 63) >> 6);

            int words = (int)((uint)bits >> 6);
            int shift = bits & 0x3F;

            if (shift == 0)
            {
                Add(m_data, words, other.m_data, 0, otherLen);
                return;
            }

            ulong carry = AddShiftedUp(m_data, words, other.m_data, 0, otherLen, shift);
            if (carry != 0UL)
            {
                m_data[otherLen + words] ^= carry;
            }
        }

        private static ulong AddShiftedUp(ulong[] x, int xOff, ulong[] y, int yOff, int count, int shift)
        {
            int shiftInv = 64 - shift;
            ulong prev = 0;
            for (int i = 0; i < count; ++i)
            {
                ulong next = y[yOff + i];
                x[xOff + i] ^= (next << shift) | prev;
                prev = next >> shiftInv;
            }
            return prev;
        }

        private static ulong AddShiftedDown(ulong[] x, int xOff, ulong[] y, int yOff, int count, int shift)
        {
            int shiftInv = 64 - shift;
            ulong prev = 0;
            int i = count;
            while (--i >= 0)
            {
                ulong next = y[yOff + i];
                x[xOff + i] ^= (next >> shift) | prev;
                prev = next << shiftInv;
            }
            return prev;
        }

        public void AddShiftedByWords(LongArray other, int words)
        {
            int otherUsedLen = other.GetUsedLength();
            if (otherUsedLen == 0)
            {
                return;
            }

            int minLen = otherUsedLen + words;
            if (minLen > m_data.Length)
            {
                m_data = ResizedData(minLen);
            }

            Add(m_data, words, other.m_data, 0, otherUsedLen);
        }

        private static void Add(ulong[] x, int xOff, ulong[] y, int yOff, int count)
        {
            for (int i = 0; i < count; ++i)
            {
                x[xOff + i] ^= y[yOff + i];
            }
        }

        private static void Add(ulong[] x, int xOff, ulong[] y, int yOff, ulong[] z, int zOff, int count)
        {
            for (int i = 0; i < count; ++i)
            {
                z[zOff + i] = x[xOff + i] ^ y[yOff + i];
            }
        }

        private static void AddBoth(ulong[] x, int xOff, ulong[] y1, int y1Off, ulong[] y2, int y2Off, int count)
        {
            for (int i = 0; i < count; ++i)
            {
                x[xOff + i] ^= y1[y1Off + i] ^ y2[y2Off + i];
            }
        }

        private static void FlipWord(ulong[] buf, int off, int bit, ulong word)
        {
            int n = off + (int)((uint)bit >> 6);
            int shift = bit & 0x3F;
            if (shift == 0)
            {
                buf[n] ^= word;
            }
            else
            {
                buf[n] ^= word << shift;
                word = word >> (64 - shift);
                if (word != 0)
                {
                    buf[++n] ^= word;
                }
            }
        }

        public bool TestBitZero()
        {
            return m_data.Length > 0 && (m_data[0] & 1UL) != 0;
        }

        private static bool TestBit(ulong[] buf, int off, int n)
        {
            // theInt = n / 64
            int theInt = (int)((uint)n >> 6);
            // theBit = n % 64
            int theBit = n & 0x3F;
            ulong tester = 1UL << theBit;
            return (buf[off + theInt] & tester) != 0UL;
        }

        private static void FlipBit(ulong[] buf, int off, int n)
        {
            // theInt = n / 64
            int theInt = (int)((uint)n >> 6);
            // theBit = n % 64
            int theBit = n & 0x3F;
            ulong flipper = 1UL << theBit;
            buf[off + theInt] ^= flipper;
        }

        private static void MultiplyWord(ulong a, ulong[] b, int bLen, ulong[] c, int cOff)
        {
            if ((a & 1UL) != 0UL)
            {
                Add(c, cOff, b, 0, bLen);
            }
            int k = 1;
            while ((a >>= 1) != 0UL)
            {
                if ((a & 1UL) != 0UL)
                {
                    ulong carry = AddShiftedUp(c, cOff, b, 0, bLen, k);
                    if (carry != 0UL)
                    {
                        c[cOff + bLen] ^= carry;
                    }
                }
                ++k;
            }
        }

        public LongArray ModMultiplyLD(LongArray other, int m, int[] ks)
        {
            /*
             * Find out the degree of each argument and handle the zero cases
             */
            int aDeg = Degree();
            if (aDeg == 0)
            {
                return this;
            }
            int bDeg = other.Degree();
            if (bDeg == 0)
            {
                return other;
            }

            /*
             * Swap if necessary so that A is the smaller argument
             */
            LongArray A = this, B = other;
            if (aDeg > bDeg)
            {
                A = other; B = this;
                int tmp = aDeg; aDeg = bDeg; bDeg = tmp;
            }

            /*
             * Establish the word lengths of the arguments and result
             */
            int aLen = (int)((uint)(aDeg + 63) >> 6);
            int bLen = (int)((uint)(bDeg + 63) >> 6);
            int cLen = (int)((uint)(aDeg + bDeg + 62) >> 6);

            if (aLen == 1)
            {
                ulong a0 = A.m_data[0];
                if (a0 == 1UL)
                {
                    return B;
                }

                /*
                 * Fast path for small A, with performance dependent only on the number of set bits
                 */
                ulong[] c0 = new ulong[cLen];
                MultiplyWord(a0, B.m_data, bLen, c0, 0);

                /*
                 * Reduce the raw answer against the reduction coefficients
                 */
                return ReduceResult(c0, 0, cLen, m, ks);
            }

            /*
             * Determine if B will get bigger during shifting
             */
            int bMax = (int)((uint)(bDeg + 7 + 63) >> 6);

            /*
             * Lookup table for the offset of each B in the tables
             */
            int[] ti = new int[16];

            /*
             * Precompute table of all 4-bit products of B
             */
            ulong[] T0 = new ulong[bMax << 4];
            int tOff = bMax;
            ti[1] = tOff;
            Array.Copy(B.m_data, 0, T0, tOff, bLen);
            for (int i = 2; i < 16; ++i)
            {
                ti[i] = (tOff += bMax);
                if ((i & 1) == 0)
                {
                    ShiftUp(T0, (int)((uint)tOff >> 1), T0, tOff, bMax, 1);
                }
                else
                {
                    Add(T0, bMax, T0, tOff - bMax, T0, tOff, bMax);
                }
            }

            /*
             * Second table with all 4-bit products of B shifted 4 bits
             */
            ulong[] T1 = new ulong[T0.Length];
            ShiftUp(T0, 0, T1, 0, T0.Length, 4);
    //        shiftUp(T0, bMax, T1, bMax, tOff, 4);

            ulong[] a = A.m_data;
            ulong[] c = new ulong[cLen];

            uint MASK = 0xF;

            /*
             * Lopez-Dahab algorithm
             */

            for (int k = 56; k >= 0; k -= 8)
            {
                for (int j = 1; j < aLen; j += 2)
                {
                    uint aVal = (uint)(a[j] >> k);
                    uint u = aVal & MASK;
                    uint v = (aVal >> 4) & MASK;
                    AddBoth(c, j - 1, T0, ti[u], T1, ti[v], bMax);
                }
                ShiftUp(c, 0, cLen, 8);
            }

            for (int k = 56; k >= 0; k -= 8)
            {
                for (int j = 0; j < aLen; j += 2)
                {
                    uint aVal = (uint)(a[j] >> k);
                    uint u = aVal & MASK;
                    uint v = (aVal >> 4) & MASK;
                    AddBoth(c, j, T0, ti[u], T1, ti[v], bMax);
                }
                if (k > 0)
                {
                    ShiftUp(c, 0, cLen, 8);
                }
            }

            /*
             * Finally the raw answer is collected, reduce it against the reduction coefficients
             */
            return ReduceResult(c, 0, cLen, m, ks);
        }

        public LongArray ModMultiply(LongArray other, int m, int[] ks)
        {
            /*
             * Find out the degree of each argument and handle the zero cases
             */
            int aDeg = Degree();
            if (aDeg == 0)
            {
                return this;
            }
            int bDeg = other.Degree();
            if (bDeg == 0)
            {
                return other;
            }

            /*
             * Swap if necessary so that A is the smaller argument
             */
            LongArray A = this, B = other;
            if (aDeg > bDeg)
            {
                A = other; B = this;
                int tmp = aDeg; aDeg = bDeg; bDeg = tmp;
            }

            /*
             * Establish the word lengths of the arguments and result
             */
            int aLen = (int)((uint)(aDeg + 63) >> 6);
            int bLen = (int)((uint)(bDeg + 63) >> 6);
            int cLen = (int)((uint)(aDeg + bDeg + 62) >> 6);

            if (aLen == 1)
            {
                ulong a0 = A.m_data[0];
                if (a0 == 1UL)
                {
                    return B;
                }

                /*
                 * Fast path for small A, with performance dependent only on the number of set bits
                 */
                ulong[] c0 = new ulong[cLen];
                MultiplyWord(a0, B.m_data, bLen, c0, 0);

                /*
                 * Reduce the raw answer against the reduction coefficients
                 */
                return ReduceResult(c0, 0, cLen, m, ks);
            }

            /*
             * Determine if B will get bigger during shifting
             */
            int bMax = (int)((uint)(bDeg + 7 + 63) >> 6);

            /*
             * Lookup table for the offset of each B in the tables
             */
            int[] ti = new int[16];

            /*
             * Precompute table of all 4-bit products of B
             */
            ulong[] T0 = new ulong[bMax << 4];
            int tOff = bMax;
            ti[1] = tOff;
            Array.Copy(B.m_data, 0, T0, tOff, bLen);
            for (int i = 2; i < 16; ++i)
            {
                tOff += bMax;
                ti[i] = tOff;
                if ((i & 1) == 0)
                {
                    ShiftUp(T0, (int)((uint)tOff >> 1), T0, tOff, bMax, 1);
                }
                else
                {
                    Add(T0, bMax, T0, tOff - bMax, T0, tOff, bMax);
                }
            }

            /*
             * Second table with all 4-bit products of B shifted 4 bits
             */
            ulong[] T1 = new ulong[T0.Length];
            ShiftUp(T0, 0, T1, 0, T0.Length, 4);
    //        ShiftUp(T0, bMax, T1, bMax, tOff, 4);

            ulong[] a = A.m_data;
            ulong[] c = new ulong[cLen << 3];

            uint MASK = 0xF;

            /*
             * Lopez-Dahab (Modified) algorithm
             */

            for (int aPos = 0; aPos < aLen; ++aPos)
            {
                ulong aVal = a[aPos];
                int cOff = aPos;
                for (;;)
                {
                    uint u = (uint)aVal & MASK; aVal >>= 4;
                    uint v = (uint)aVal & MASK; aVal >>= 4;
                    AddBoth(c, cOff, T0, ti[u], T1, ti[v], bMax);
                    if (aVal == 0UL)
                    {
                        break;
                    }
                    cOff += cLen;
                }
            }

            {
                int cOff = c.Length;
                while ((cOff -= cLen) != 0)
                {
                    AddShiftedUp(c, cOff - cLen, c, cOff, cLen, 8);
                }
            }

            /*
             * Finally the raw answer is collected, reduce it against the reduction coefficients
             */
            return ReduceResult(c, 0, cLen, m, ks);
        }

        //public LongArray ModReduce(int m, int[] ks)
        //{
        //    ulong[] buf = Arrays.Clone(m_data);
        //    int rLen = ReduceInPlace(buf, 0, buf.Length, m, ks);
        //    return new LongArray(buf, 0, rLen);
        //}

        public LongArray Multiply(LongArray other, int m, int[] ks)
        {
            /*
             * Find out the degree of each argument and handle the zero cases
             */
            int aDeg = Degree();
            if (aDeg == 0)
            {
                return this;
            }
            int bDeg = other.Degree();
            if (bDeg == 0)
            {
                return other;
            }

            /*
             * Swap if necessary so that A is the smaller argument
             */
            LongArray A = this, B = other;
            if (aDeg > bDeg)
            {
                A = other; B = this;
                int tmp = aDeg; aDeg = bDeg; bDeg = tmp;
            }

            /*
             * Establish the word lengths of the arguments and result
             */
            int aLen = (int)((uint)(aDeg + 63) >> 6);
            int bLen = (int)((uint)(bDeg + 63) >> 6);
            int cLen = (int)((uint)(aDeg + bDeg + 62) >> 6);

            if (aLen == 1)
            {
                ulong a0 = A.m_data[0];
                if (a0 == 1UL)
                {
                    return B;
                }

                /*
                 * Fast path for small A, with performance dependent only on the number of set bits
                 */
                ulong[] c0 = new ulong[cLen];
                MultiplyWord(a0, B.m_data, bLen, c0, 0);

                /*
                 * Reduce the raw answer against the reduction coefficients
                 */
                //return ReduceResult(c0, 0, cLen, m, ks);
                return new LongArray(c0, 0, cLen);
            }

            /*
             * Determine if B will get bigger during shifting
             */
            int bMax = (int)((uint)(bDeg + 7 + 63) >> 6);

            /*
             * Lookup table for the offset of each B in the tables
             */
            int[] ti = new int[16];

            /*
             * Precompute table of all 4-bit products of B
             */
            ulong[] T0 = new ulong[bMax << 4];
            int tOff = bMax;
            ti[1] = tOff;
            Array.Copy(B.m_data, 0, T0, tOff, bLen);
            for (int i = 2; i < 16; ++i)
            {
                tOff += bMax;
                ti[i] = tOff;
                if ((i & 1) == 0)
                {
                    ShiftUp(T0, (int)((uint)tOff >> 1), T0, tOff, bMax, 1);
                }
                else
                {
                    Add(T0, bMax, T0, tOff - bMax, T0, tOff, bMax);
                }
            }

            /*
             * Second table with all 4-bit products of B shifted 4 bits
             */
            ulong[] T1 = new ulong[T0.Length];
            ShiftUp(T0, 0, T1, 0, T0.Length, 4);
            //ShiftUp(T0, bMax, T1, bMax, tOff, 4);

            ulong[] a = A.m_data;
            ulong[] c = new ulong[cLen << 3];

            uint MASK = 0xF;

            /*
             * Lopez-Dahab (Modified) algorithm
             */

            for (int aPos = 0; aPos < aLen; ++aPos)
            {
                ulong aVal = a[aPos];
                int cOff = aPos;
                for (; ; )
                {
                    uint u = (uint)aVal & MASK; aVal >>= 4;
                    uint v = (uint)aVal & MASK; aVal >>= 4;
                    AddBoth(c, cOff, T0, ti[u], T1, ti[v], bMax);
                    if (aVal == 0UL)
                    {
                        break;
                    }
                    cOff += cLen;
                }
            }

            {
                int cOff = c.Length;
                while ((cOff -= cLen) != 0)
                {
                    AddShiftedUp(c, cOff - cLen, c, cOff, cLen, 8);
                }
            }

            /*
             * Finally the raw answer is collected, reduce it against the reduction coefficients
             */
            //return ReduceResult(c, 0, cLen, m, ks);
            return new LongArray(c, 0, cLen);
        }

        public void Reduce(int m, int[] ks)
        {
            ulong[] buf = m_data;
            int rLen = ReduceInPlace(buf, 0, buf.Length, m, ks);
            if (rLen < buf.Length)
            {
                m_data = new ulong[rLen];
                Array.Copy(buf, 0, m_data, 0, rLen);
            }
        }

        private static LongArray ReduceResult(ulong[] buf, int off, int len, int m, int[] ks)
        {
            int rLen = ReduceInPlace(buf, off, len, m, ks);
            return new LongArray(buf, off, rLen);
        }

        private static int ReduceInPlace(ulong[] buf, int off, int len, int m, int[] ks)
        {
            int mLen = (m + 63) >> 6;
            if (len < mLen)
            {
                return len;
            }

            int numBits = System.Math.Min(len << 6, (m << 1) - 1); // TODO use actual degree?
            int excessBits = (len << 6) - numBits;
            while (excessBits >= 64)
            {
                --len;
                excessBits -= 64;
            }

            int kLen = ks.Length, kMax = ks[kLen - 1], kNext = kLen > 1 ? ks[kLen - 2] : 0;
            int wordWiseLimit = System.Math.Max(m, kMax + 64);
            int vectorableWords = (excessBits + System.Math.Min(numBits - wordWiseLimit, m - kNext)) >> 6;
            if (vectorableWords > 1)
            {
                int vectorWiseWords = len - vectorableWords;
                ReduceVectorWise(buf, off, len, vectorWiseWords, m, ks);
                while (len > vectorWiseWords)
                {
                    buf[off + --len] = 0L;
                }
                numBits = vectorWiseWords << 6;
            }

            if (numBits > wordWiseLimit)
            {
                ReduceWordWise(buf, off, len, wordWiseLimit, m, ks);
                numBits = wordWiseLimit;
            }

            if (numBits > m)
            {
                ReduceBitWise(buf, off, numBits, m, ks);
            }

            return mLen;
        }

        private static void ReduceBitWise(ulong[] buf, int off, int BitLength, int m, int[] ks)
        {
            while (--BitLength >= m)
            {
                if (TestBit(buf, off, BitLength))
                {
                    ReduceBit(buf, off, BitLength, m, ks);
                }
            }
        }

        private static void ReduceBit(ulong[] buf, int off, int bit, int m, int[] ks)
        {
            FlipBit(buf, off, bit);
            int n = bit - m;
            int j = ks.Length;
            while (--j >= 0)
            {
                FlipBit(buf, off, ks[j] + n);
            }
            FlipBit(buf, off, n);
        }

        private static void ReduceWordWise(ulong[] buf, int off, int len, int toBit, int m, int[] ks)
        {
            int toPos = (int)((uint)toBit >> 6);

            while (--len > toPos)
            {
                ulong word = buf[off + len];
                if (word != 0)
                {
                    buf[off + len] = 0UL;
                    ReduceWord(buf, off, (len << 6), word, m, ks);
                }
            }

            {
                int partial = toBit & 0x3F;
                ulong word = buf[off + toPos] >> partial;
                if (word != 0)
                {
                    buf[off + toPos] ^= word << partial;
                    ReduceWord(buf, off, toBit, word, m, ks);
                }
            }
        }

        private static void ReduceWord(ulong[] buf, int off, int bit, ulong word, int m, int[] ks)
        {
            int offset = bit - m;
            int j = ks.Length;
            while (--j >= 0)
            {
                FlipWord(buf, off, offset + ks[j], word);
            }
            FlipWord(buf, off, offset, word);
        }

        private static void ReduceVectorWise(ulong[] buf, int off, int len, int words, int m, int[] ks)
        {
            /*
             * NOTE: It's important we go from highest coefficient to lowest, because for the highest
             * one (only) we allow the ranges to partially overlap, and therefore any changes must take
             * effect for the subsequent lower coefficients.
             */
            int baseBit = (words << 6) - m;
            int j = ks.Length;
            while (--j >= 0)
            {
                FlipVector(buf, off, buf, off + words, len - words, baseBit + ks[j]);
            }
            FlipVector(buf, off, buf, off + words, len - words, baseBit);
        }

        private static void FlipVector(ulong[] x, int xOff, ulong[] y, int yOff, int yLen, int bits)
        {
            xOff += (int)((uint)bits >> 6);
            bits &= 0x3F;

            if (bits == 0)
            {
                Add(x, xOff, y, yOff, yLen);
            }
            else
            {
                ulong carry = AddShiftedDown(x, xOff + 1, y, yOff, yLen, 64 - bits);
                x[xOff] ^= carry;
            }
        }

        public LongArray ModSquare(int m, int[] ks)
        {
            int len = GetUsedLength();
            if (len == 0)
                return this;

            ulong[] r = new ulong[len << 1];
            Raw.Interleave.Expand64To128(m_data, 0, len, r, 0);

            return new LongArray(r, 0, ReduceInPlace(r, 0, r.Length, m, ks));
        }

        public LongArray ModSquareN(int n, int m, int[] ks)
        {
            int len = GetUsedLength();
            if (len == 0)
                return this;

            int mLen = (m + 63) >> 6;
            ulong[] r = new ulong[mLen << 1];
            Array.Copy(m_data, 0, r, 0, len);

            while (--n >= 0)
            {
                Raw.Interleave.Expand64To128(r, 0, len);
                len = ReduceInPlace(r, 0, r.Length, m, ks);
            }
    
            return new LongArray(r, 0, len);
        }

        public LongArray Square(int m, int[] ks)
        {
            int len = GetUsedLength();
            if (len == 0)
                return this;

            ulong[] r = new ulong[len << 1];
            Raw.Interleave.Expand64To128(m_data, 0, len, r, 0);

            return new LongArray(r, 0, r.Length);
        }

    //    private static LongArray ExpItohTsujii2(LongArray B, int n, int m, int[] ks)
    //    {
    //        LongArray t1 = B, t3 = new LongArray(new long[]{ 1L });
    //        int scale = 1;
    //
    //        int numTerms = n;
    //        while (numTerms > 1)
    //        {
    //            if ((numTerms & 1) != 0)
    //            {
    //                t3 = t3.ModMultiply(t1, m, ks);
    //                t1 = t1.modSquareN(scale, m, ks);
    //            }
    //
    //            LongArray t2 = t1.modSquareN(scale, m, ks);
    //            t1 = t1.ModMultiply(t2, m, ks);
    //            numTerms >>>= 1; scale <<= 1;
    //        }
    //
    //        return t3.ModMultiply(t1, m, ks);
    //    }
    //
    //    private static LongArray ExpItohTsujii23(LongArray B, int n, int m, int[] ks)
    //    {
    //        LongArray t1 = B, t3 = new LongArray(new long[]{ 1L });
    //        int scale = 1;
    //
    //        int numTerms = n;
    //        while (numTerms > 1)
    //        {
    //            bool m03 = numTerms % 3 == 0;
    //            bool m14 = !m03 && (numTerms & 1) != 0;
    //
    //            if (m14)
    //            {
    //                t3 = t3.ModMultiply(t1, m, ks);
    //                t1 = t1.modSquareN(scale, m, ks);
    //            }
    //
    //            LongArray t2 = t1.modSquareN(scale, m, ks);
    //            t1 = t1.ModMultiply(t2, m, ks);
    //
    //            if (m03)
    //            {
    //                t2 = t2.modSquareN(scale, m, ks);
    //                t1 = t1.ModMultiply(t2, m, ks);
    //                numTerms /= 3; scale *= 3;
    //            }
    //            else
    //            {
    //                numTerms >>>= 1; scale <<= 1;
    //            }
    //        }
    //
    //        return t3.ModMultiply(t1, m, ks);
    //    }
    //
    //    private static LongArray ExpItohTsujii235(LongArray B, int n, int m, int[] ks)
    //    {
    //        LongArray t1 = B, t4 = new LongArray(new long[]{ 1L });
    //        int scale = 1;
    //
    //        int numTerms = n;
    //        while (numTerms > 1)
    //        {
    //            if (numTerms % 5 == 0)
    //            {
    ////                t1 = ExpItohTsujii23(t1, 5, m, ks);
    //
    //                LongArray t3 = t1;
    //                t1 = t1.modSquareN(scale, m, ks);
    //
    //                LongArray t2 = t1.modSquareN(scale, m, ks);
    //                t1 = t1.ModMultiply(t2, m, ks);
    //                t2 = t1.modSquareN(scale << 1, m, ks);
    //                t1 = t1.ModMultiply(t2, m, ks);
    //
    //                t1 = t1.ModMultiply(t3, m, ks);
    //
    //                numTerms /= 5; scale *= 5;
    //                continue;
    //            }
    //
    //            bool m03 = numTerms % 3 == 0;
    //            bool m14 = !m03 && (numTerms & 1) != 0;
    //
    //            if (m14)
    //            {
    //                t4 = t4.ModMultiply(t1, m, ks);
    //                t1 = t1.modSquareN(scale, m, ks);
    //            }
    //
    //            LongArray t2 = t1.modSquareN(scale, m, ks);
    //            t1 = t1.ModMultiply(t2, m, ks);
    //
    //            if (m03)
    //            {
    //                t2 = t2.modSquareN(scale, m, ks);
    //                t1 = t1.ModMultiply(t2, m, ks);
    //                numTerms /= 3; scale *= 3;
    //            }
    //            else
    //            {
    //                numTerms >>>= 1; scale <<= 1;
    //            }
    //        }
    //
    //        return t4.ModMultiply(t1, m, ks);
    //    }

        public LongArray ModInverse(int m, int[] ks)
        {
            /*
             * Fermat's Little Theorem
             */
    //        LongArray A = this;
    //        LongArray B = A.modSquare(m, ks);
    //        LongArray R0 = B, R1 = B;
    //        for (int i = 2; i < m; ++i)
    //        {
    //            R1 = R1.modSquare(m, ks);
    //            R0 = R0.ModMultiply(R1, m, ks);
    //        }
    //
    //        return R0;

            /*
             * Itoh-Tsujii
             */
    //        LongArray B = modSquare(m, ks);
    //        switch (m)
    //        {
    //        case 409:
    //            return ExpItohTsujii23(B, m - 1, m, ks);
    //        case 571:
    //            return ExpItohTsujii235(B, m - 1, m, ks);
    //        case 163:
    //        case 233:
    //        case 283:
    //        default:
    //            return ExpItohTsujii2(B, m - 1, m, ks);
    //        }

            /*
             * Inversion in F2m using the extended Euclidean algorithm
             * 
             * Input: A nonzero polynomial a(z) of degree at most m-1
             * Output: a(z)^(-1) mod f(z)
             */
            int uzDegree = Degree();
            if (uzDegree == 0)
            {
                throw new InvalidOperationException();
            }
            if (uzDegree == 1)
            {
                return this;
            }

            // u(z) := a(z)
            LongArray uz = (LongArray)Copy();

            int t = (m + 63) >> 6;

            // v(z) := f(z)
            LongArray vz = new LongArray(t);
            ReduceBit(vz.m_data, 0, m, m, ks);

            // g1(z) := 1, g2(z) := 0
            LongArray g1z = new LongArray(t);
            g1z.m_data[0] = 1UL;
            LongArray g2z = new LongArray(t);

            int[] uvDeg = new int[]{ uzDegree, m + 1 };
            LongArray[] uv = new LongArray[]{ uz, vz };

            int[] ggDeg = new int[]{ 1, 0 };
            LongArray[] gg = new LongArray[]{ g1z, g2z };

            int b = 1;
            int duv1 = uvDeg[b];
            int dgg1 = ggDeg[b];
            int j = duv1 - uvDeg[1 - b];

            for (;;)
            {
                if (j < 0)
                {
                    j = -j;
                    uvDeg[b] = duv1;
                    ggDeg[b] = dgg1;
                    b = 1 - b;
                    duv1 = uvDeg[b];
                    dgg1 = ggDeg[b];
                }

                uv[b].AddShiftedByBitsSafe(uv[1 - b], uvDeg[1 - b], j);

                int duv2 = uv[b].DegreeFrom(duv1);
                if (duv2 == 0)
                {
                    return gg[1 - b];
                }

                {
                    int dgg2 = ggDeg[1 - b];
                    gg[b].AddShiftedByBitsSafe(gg[1 - b], dgg2, j);
                    dgg2 += j;

                    if (dgg2 > dgg1)
                    {
                        dgg1 = dgg2;
                    }
                    else if (dgg2 == dgg1)
                    {
                        dgg1 = gg[b].DegreeFrom(dgg1);
                    }
                }

                j += (duv2 - duv1);
                duv1 = duv2;
            }
        }

        public override bool Equals(object obj)
        {
            return Equals(obj as LongArray);
        }

        public bool Equals(LongArray other)
        {
            if (this == other)
                return true;
            if (null == other)
                return false;
            int usedLen = GetUsedLength();
            if (other.GetUsedLength() != usedLen)
            {
                return false;
            }
            for (int i = 0; i < usedLen; i++)
            {
                if (m_data[i] != other.m_data[i])
                {
                    return false;
                }
            }
            return true;
        }

        public override int GetHashCode()
        {
            int usedLen = GetUsedLength();
            int hash = 1;
            for (int i = 0; i < usedLen; i++)
            {
                ulong mi = m_data[i];
                hash *= 31;
                hash ^= (int)mi;
                hash *= 31;
                hash ^= (int)(mi >> 32);
            }
            return hash;
        }

        public LongArray Copy()
        {
            return new LongArray(Arrays.Clone(m_data));
        }

        public override string ToString()
        {
            int i = GetUsedLength();
            if (i == 0)
            {
                return "0";
            }

            StringBuilder sb = new StringBuilder(i * 64);
            sb.Append(Convert.ToString((long)m_data[--i], 2));
            while (--i >= 0)
            {
                string s = Convert.ToString((long)m_data[i], 2);

                // Add leading zeroes, except for highest significant word
                int len = s.Length;
                if (len < 64)
                {
                    sb.Append('0', 64 - len);
                }

                sb.Append(s);
            }
            return sb.ToString();
        }
    }
}
