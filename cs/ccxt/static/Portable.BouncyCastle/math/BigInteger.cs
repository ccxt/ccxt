using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
#if NETCOREAPP3_0_OR_GREATER
using System.Runtime.Intrinsics.X86;
#endif
using System.Runtime.Serialization;
using System.Text;

using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Math
{
    [Serializable]
    public class BigInteger
    {
        // The first few odd primes
        /*
                3   5   7   11  13  17  19  23  29
            31  37  41  43  47  53  59  61  67  71
            73  79  83  89  97  101 103 107 109 113
            127 131 137 139 149 151 157 163 167 173
            179 181 191 193 197 199 211 223 227 229
            233 239 241 251 257 263 269 271 277 281
            283 293 307 311 313 317 331 337 347 349
            353 359 367 373 379 383 389 397 401 409
            419 421 431 433 439 443 449 457 461 463
            467 479 487 491 499 503 509 521 523 541
            547 557 563 569 571 577 587 593 599 601
            607 613 617 619 631 641 643 647 653 659
            661 673 677 683 691 701 709 719 727 733
            739 743 751 757 761 769 773 787 797 809
            811 821 823 827 829 839 853 857 859 863
            877 881 883 887 907 911 919 929 937 941
            947 953 967 971 977 983 991 997 1009
            1013 1019 1021 1031 1033 1039 1049 1051
            1061 1063 1069 1087 1091 1093 1097 1103
            1109 1117 1123 1129 1151 1153 1163 1171
            1181 1187 1193 1201 1213 1217 1223 1229
            1231 1237 1249 1259 1277 1279 1283 1289
        */

        // Each list has a product < 2^31
        internal static readonly int[][] primeLists = new int[][]
        {
            new int[]{ 3, 5, 7, 11, 13, 17, 19, 23 },
            new int[]{ 29, 31, 37, 41, 43 },
            new int[]{ 47, 53, 59, 61, 67 },
            new int[]{ 71, 73, 79, 83 },
            new int[]{ 89, 97, 101, 103 },

            new int[]{ 107, 109, 113, 127 },
            new int[]{ 131, 137, 139, 149 },
            new int[]{ 151, 157, 163, 167 },
            new int[]{ 173, 179, 181, 191 },
            new int[]{ 193, 197, 199, 211 },

            new int[]{ 223, 227, 229 },
            new int[]{ 233, 239, 241 },
            new int[]{ 251, 257, 263 },
            new int[]{ 269, 271, 277 },
            new int[]{ 281, 283, 293 },

            new int[]{ 307, 311, 313 },
            new int[]{ 317, 331, 337 },
            new int[]{ 347, 349, 353 },
            new int[]{ 359, 367, 373 },
            new int[]{ 379, 383, 389 },

            new int[]{ 397, 401, 409 },
            new int[]{ 419, 421, 431 },
            new int[]{ 433, 439, 443 },
            new int[]{ 449, 457, 461 },
            new int[]{ 463, 467, 479 },

            new int[]{ 487, 491, 499 },
            new int[]{ 503, 509, 521 },
            new int[]{ 523, 541, 547 },
            new int[]{ 557, 563, 569 },
            new int[]{ 571, 577, 587 },

            new int[]{ 593, 599, 601 },
            new int[]{ 607, 613, 617 },
            new int[]{ 619, 631, 641 },
            new int[]{ 643, 647, 653 },
            new int[]{ 659, 661, 673 },

            new int[]{ 677, 683, 691 },
            new int[]{ 701, 709, 719 },
            new int[]{ 727, 733, 739 },
            new int[]{ 743, 751, 757 },
            new int[]{ 761, 769, 773 },

            new int[]{ 787, 797, 809 },
            new int[]{ 811, 821, 823 },
            new int[]{ 827, 829, 839 },
            new int[]{ 853, 857, 859 },
            new int[]{ 863, 877, 881 },

            new int[]{ 883, 887, 907 },
            new int[]{ 911, 919, 929 },
            new int[]{ 937, 941, 947 },
            new int[]{ 953, 967, 971 },
            new int[]{ 977, 983, 991 },

            new int[]{ 997, 1009, 1013 },
            new int[]{ 1019, 1021, 1031 },
            new int[]{ 1033, 1039, 1049 },
            new int[]{ 1051, 1061, 1063 },
            new int[]{ 1069, 1087, 1091 },

            new int[]{ 1093, 1097, 1103 },
            new int[]{ 1109, 1117, 1123 },
            new int[]{ 1129, 1151, 1153 },
            new int[]{ 1163, 1171, 1181 },
            new int[]{ 1187, 1193, 1201 },

            new int[]{ 1213, 1217, 1223 },
            new int[]{ 1229, 1231, 1237 },
            new int[]{ 1249, 1259, 1277 },
            new int[]{ 1279, 1283, 1289 },
        };

        internal static readonly int[] primeProducts;

        private const long IMASK = 0xFFFFFFFFL;
        private const ulong UIMASK = 0xFFFFFFFFUL;

        private static readonly int[] ZeroMagnitude = new int[0];
        private static readonly byte[] ZeroEncoding = new byte[0];

        private static readonly BigInteger[] SMALL_CONSTANTS = new BigInteger[17];
        public static readonly BigInteger Zero;
        public static readonly BigInteger One;
        public static readonly BigInteger Two;
        public static readonly BigInteger Three;
        public static readonly BigInteger Four;
        public static readonly BigInteger Ten;

        private readonly static byte[] BitLengthTable =
        {
            0, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
            6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
            7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
            7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
            7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
            7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
            8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
            8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
            8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
            8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
            8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
            8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
            8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
            8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8
        };

        // TODO Parse radix-2 64 bits at a time and radix-8 63 bits at a time
        private const int chunk2 = 1, chunk8 = 1, chunk10 = 19, chunk16 = 16;
        private static readonly BigInteger radix2, radix2E, radix8, radix8E, radix10, radix10E, radix16, radix16E;

        private static readonly SecureRandom RandomSource = new SecureRandom();

        /*
         * These are the threshold bit-lengths (of an exponent) where we increase the window size.
         * They are calculated according to the expected savings in multiplications.
         * Some squares will also be saved on average, but we offset these against the extra storage costs.
         */
        private static readonly int[] ExpWindowThresholds = { 7, 25, 81, 241, 673, 1793, 4609, int.MaxValue };

        private const int BitsPerByte = 8;
        private const int BitsPerInt = 32;
        private const int BytesPerInt = 4;

        static BigInteger()
        {
            Zero = new BigInteger(0, ZeroMagnitude, false);
            Zero.nBits = 0; Zero.nBitLength = 0;

            SMALL_CONSTANTS[0] = Zero;
            for (uint i = 1; i < SMALL_CONSTANTS.Length; ++i)
            {
                SMALL_CONSTANTS[i] = CreateUValueOf(i);
            }

            One = SMALL_CONSTANTS[1];
            Two = SMALL_CONSTANTS[2];
            Three = SMALL_CONSTANTS[3];
            Four = SMALL_CONSTANTS[4];
            Ten = SMALL_CONSTANTS[10];

            radix2 = ValueOf(2);
            radix2E = radix2.Pow(chunk2);

            radix8 = ValueOf(8);
            radix8E = radix8.Pow(chunk8);

            radix10 = ValueOf(10);
            radix10E = radix10.Pow(chunk10);

            radix16 = ValueOf(16);
            radix16E = radix16.Pow(chunk16);

            primeProducts = new int[primeLists.Length];

            for (int i = 0; i < primeLists.Length; ++i)
            {
                int[] primeList = primeLists[i];
                int product = primeList[0];
                for (int j = 1; j < primeList.Length; ++j)
                {
                    product *= primeList[j];
                }
                primeProducts[i] = product;
            }
        }

        private int[] magnitude; // array of ints with [0] being the most significant
        private int sign; // -1 means -ve; +1 means +ve; 0 means 0;

        [NonSerialized]
        private int nBits = -1; // cache BitCount() value
        [NonSerialized]
        private int nBitLength = -1; // cache BitLength() value
        [NonSerialized]
        private int mQuote = 0; // -m^(-1) mod b, b = 2^32 (see Montgomery mult.), 0 when uninitialised

        [OnDeserialized]
        private void OnDeserialized(StreamingContext context)
        {
            this.nBits = -1;
            this.nBitLength = -1;
            this.mQuote = 0;
        }

        private static int GetByteLength(
            int nBits)
        {
            return (nBits + BitsPerByte - 1) / BitsPerByte;
        }

        public static BigInteger Arbitrary(int sizeInBits)
        {
            return new BigInteger(sizeInBits, RandomSource);
        }

        private BigInteger(
            int		signum,
            int[]	mag,
            bool	checkMag)
        {
            if (checkMag)
            {
                int i = 0;
                while (i < mag.Length && mag[i] == 0)
                {
                    ++i;
                }

                if (i == mag.Length)
                {
                    this.sign = 0;
                    this.magnitude = ZeroMagnitude;
                }
                else
                {
                    this.sign = signum;

                    if (i == 0)
                    {
                        this.magnitude = mag;
                    }
                    else
                    {
                        // strip leading 0 words
                        this.magnitude = new int[mag.Length - i];
                        Array.Copy(mag, i, this.magnitude, 0, this.magnitude.Length);
                    }
                }
            }
            else
            {
                this.sign = signum;
                this.magnitude = mag;
            }
        }

        public BigInteger(
            string value)
            : this(value, 10)
        {
        }

        public BigInteger(
            string	str,
            int		radix)
        {
            if (str.Length == 0)
                throw new FormatException("Zero length BigInteger");

            NumberStyles style;
            int chunk;
            BigInteger r;
            BigInteger rE;

            switch (radix)
            {
                case 2:
                    // Is there anyway to restrict to binary digits?
                    style = NumberStyles.Integer;
                    chunk = chunk2;
                    r = radix2;
                    rE = radix2E;
                    break;
                case 8:
                    // Is there anyway to restrict to octal digits?
                    style = NumberStyles.Integer;
                    chunk = chunk8;
                    r = radix8;
                    rE = radix8E;
                    break;
                case 10:
                    // This style seems to handle spaces and minus sign already (our processing redundant?)
                    style = NumberStyles.Integer;
                    chunk = chunk10;
                    r = radix10;
                    rE = radix10E;
                    break;
                case 16:
                    // TODO Should this be HexNumber?
                    style = NumberStyles.AllowHexSpecifier;
                    chunk = chunk16;
                    r = radix16;
                    rE = radix16E;
                    break;
                default:
                    throw new FormatException("Only bases 2, 8, 10, or 16 allowed");
            }


            int index = 0;
            sign = 1;

            if (str[0] == '-')
            {
                if (str.Length == 1)
                    throw new FormatException("Zero length BigInteger");

                sign = -1;
                index = 1;
            }

            // strip leading zeros from the string str
            while (index < str.Length && int.Parse(str[index].ToString(), style) == 0)
            {
                index++;
            }

            if (index >= str.Length)
            {
                // zero value - we're done
                sign = 0;
                magnitude = ZeroMagnitude;
                return;
            }

            //////
            // could we work out the max number of ints required to store
            // str.Length digits in the given base, then allocate that
            // storage in one hit?, then Generate the magnitude in one hit too?
            //////

            BigInteger b = Zero;


            int next = index + chunk;

            if (next <= str.Length)
            {
                do
                {
                    string s = str.Substring(index, chunk);
                    ulong i = ulong.Parse(s, style);
                    BigInteger bi = CreateUValueOf(i);

                    switch (radix)
                    {
                        case 2:
                            // TODO Need this because we are parsing in radix 10 above
                            if (i >= 2)
                                throw new FormatException("Bad character in radix 2 string: " + s);

                            // TODO Parse 64 bits at a time
                            b = b.ShiftLeft(1);
                            break;
                        case 8:
                            // TODO Need this because we are parsing in radix 10 above
                            if (i >= 8)
                                throw new FormatException("Bad character in radix 8 string: " + s);

                            // TODO Parse 63 bits at a time
                            b = b.ShiftLeft(3);
                            break;
                        case 16:
                            b = b.ShiftLeft(64);
                            break;
                        default:
                            b = b.Multiply(rE);
                            break;
                    }

                    b = b.Add(bi);

                    index = next;
                    next += chunk;
                }
                while (next <= str.Length);
            }

            if (index < str.Length)
            {
                string s = str.Substring(index);
                ulong i = ulong.Parse(s, style);
                BigInteger bi = CreateUValueOf(i);

                if (b.sign > 0)
                {
                    if (radix == 2)
                    {
                        // NB: Can't reach here since we are parsing one char at a time
                        Debug.Assert(false);

                        // TODO Parse all bits at once
//						b = b.ShiftLeft(s.Length);
                    }
                    else if (radix == 8)
                    {
                        // NB: Can't reach here since we are parsing one char at a time
                        Debug.Assert(false);

                        // TODO Parse all bits at once
//						b = b.ShiftLeft(s.Length * 3);
                    }
                    else if (radix == 16)
                    {
                        b = b.ShiftLeft(s.Length << 2);
                    }
                    else
                    {
                        b = b.Multiply(r.Pow(s.Length));
                    }

                    b = b.Add(bi);
                }
                else
                {
                    b = bi;
                }
            }

            // Note: This is the previous (slower) algorithm
//			while (index < value.Length)
//            {
//				char c = value[index];
//				string s = c.ToString();
//				int i = int.Parse(s, style);
//
//                b = b.Multiply(r).Add(ValueOf(i));
//                index++;
//            }

            magnitude = b.magnitude;
        }

        public BigInteger(
            byte[] bytes)
            : this(bytes, 0, bytes.Length)
        {
        }

        public BigInteger(
            byte[]	bytes,
            int		offset,
            int		length)
        {
            if (length == 0)
                throw new FormatException("Zero length BigInteger");

            // TODO Move this processing into MakeMagnitude (provide sign argument)
            if ((sbyte)bytes[offset] < 0)
            {
                this.sign = -1;

                int end = offset + length;

                int iBval;
                // strip leading sign bytes
                for (iBval = offset; iBval < end && ((sbyte)bytes[iBval] == -1); iBval++)
                {
                }

                if (iBval >= end)
                {
                    this.magnitude = One.magnitude;
                }
                else
                {
                    int numBytes = end - iBval;
                    byte[] inverse = new byte[numBytes];

                    int index = 0;
                    while (index < numBytes)
                    {
                        inverse[index++] = (byte)~bytes[iBval++];
                    }

                    Debug.Assert(iBval == end);

                    while (inverse[--index] == byte.MaxValue)
                    {
                        inverse[index] = byte.MinValue;
                    }

                    inverse[index]++;

                    this.magnitude = MakeMagnitude(inverse, 0, inverse.Length);
                }
            }
            else
            {
                // strip leading zero bytes and return magnitude bytes
                this.magnitude = MakeMagnitude(bytes, offset, length);
                this.sign = this.magnitude.Length > 0 ? 1 : 0;
            }
        }

        private static int[] MakeMagnitude(
            byte[]	bytes,
            int		offset,
            int		length)
        {
            int end = offset + length;

            // strip leading zeros
            int firstSignificant;
            for (firstSignificant = offset; firstSignificant < end
                && bytes[firstSignificant] == 0; firstSignificant++)
            {
            }

            if (firstSignificant >= end)
            {
                return ZeroMagnitude;
            }

            int nInts = (end - firstSignificant + 3) / BytesPerInt;
            int bCount = (end - firstSignificant) % BytesPerInt;
            if (bCount == 0)
            {
                bCount = BytesPerInt;
            }

            if (nInts < 1)
            {
                return ZeroMagnitude;
            }

            int[] mag = new int[nInts];

            int v = 0;
            int magnitudeIndex = 0;
            for (int i = firstSignificant; i < end; ++i)
            {
                v <<= 8;
                v |= bytes[i] & 0xff;
                bCount--;
                if (bCount <= 0)
                {
                    mag[magnitudeIndex] = v;
                    magnitudeIndex++;
                    bCount = BytesPerInt;
                    v = 0;
                }
            }

            if (magnitudeIndex < mag.Length)
            {
                mag[magnitudeIndex] = v;
            }

            return mag;
        }

        public BigInteger(
            int		sign,
            byte[]	bytes)
            : this(sign, bytes, 0, bytes.Length)
        {
        }

        public BigInteger(
            int		sign,
            byte[]	bytes,
            int		offset,
            int		length)
        {
            if (sign < -1 || sign > 1)
                throw new FormatException("Invalid sign value");

            if (sign == 0)
            {
                this.sign = 0;
                this.magnitude = ZeroMagnitude;
            }
            else
            {
                // copy bytes
                this.magnitude = MakeMagnitude(bytes, offset, length);
                this.sign = this.magnitude.Length < 1 ? 0 : sign;
            }
        }

        public BigInteger(
            int		sizeInBits,
            Random	random)
        {
            if (sizeInBits < 0)
                throw new ArgumentException("sizeInBits must be non-negative");

            this.nBits = -1;
            this.nBitLength = -1;

            if (sizeInBits == 0)
            {
                this.sign = 0;
                this.magnitude = ZeroMagnitude;
                return;
            }

            int nBytes = GetByteLength(sizeInBits);
            byte[] b = new byte[nBytes];
            random.NextBytes(b);

            // strip off any excess bits in the MSB
            int xBits = BitsPerByte * nBytes - sizeInBits;
            b[0] &= (byte)(255U >> xBits);

            this.magnitude = MakeMagnitude(b, 0, b.Length);
            this.sign = this.magnitude.Length < 1 ? 0 : 1;
        }

        public BigInteger(
            int		bitLength,
            int		certainty,
            Random	random)
        {
            if (bitLength < 2)
                throw new ArithmeticException("bitLength < 2");

            this.sign = 1;
            this.nBitLength = bitLength;

            if (bitLength == 2)
            {
                this.magnitude = random.Next(2) == 0
                    ?	Two.magnitude
                    :	Three.magnitude;
                return;
            }
             
            int nBytes = GetByteLength(bitLength);
            byte[] b = new byte[nBytes];

            int xBits = BitsPerByte * nBytes - bitLength;
            byte mask = (byte)(255U >> xBits);
            byte lead = (byte)(1 << (7 - xBits));

            for (;;)
            {
                random.NextBytes(b);

                // strip off any excess bits in the MSB
                b[0] &= mask;

                // ensure the leading bit is 1 (to meet the strength requirement)
                b[0] |= lead;

                // ensure the trailing bit is 1 (i.e. must be odd)
                b[nBytes - 1] |= 1;

                this.magnitude = MakeMagnitude(b, 0, b.Length);
                this.nBits = -1;
                this.mQuote = 0;

                if (certainty < 1)
                    break;

                if (CheckProbablePrime(certainty, random, true))
                    break;

                for (int j = 1; j < (magnitude.Length - 1); ++j)
                {
                    this.magnitude[j] ^= random.Next();

                    if (CheckProbablePrime(certainty, random, true))
                        return;
                }
            }
        }

        public BigInteger Abs()
        {
            return sign >= 0 ? this : Negate();
        }

        /**
         * return a = a + b - b preserved.
         */
        private static int[] AddMagnitudes(
            int[] a,
            int[] b)
        {
            int tI = a.Length - 1;
            int vI = b.Length - 1;
            long m = 0;

            while (vI >= 0)
            {
                m += ((long)(uint)a[tI] + (long)(uint)b[vI--]);
                a[tI--] = (int)m;
                m = (long)((ulong)m >> 32);
            }

            if (m != 0)
            {
                while (tI >= 0 && ++a[tI--] == 0)
                {
                }
            }

            return a;
        }

        public BigInteger Add(
            BigInteger value)
        {
            if (this.sign == 0)
                return value;

            if (this.sign != value.sign)
            {
                if (value.sign == 0)
                    return this;

                if (value.sign < 0)
                    return Subtract(value.Negate());

                return value.Subtract(Negate());
            }

            return AddToMagnitude(value.magnitude);
        }

        private BigInteger AddToMagnitude(
            int[] magToAdd)
        {
            int[] big, small;
            if (this.magnitude.Length < magToAdd.Length)
            {
                big = magToAdd;
                small = this.magnitude;
            }
            else
            {
                big = this.magnitude;
                small = magToAdd;
            }

            // Conservatively avoid over-allocation when no overflow possible
            uint limit = uint.MaxValue;
            if (big.Length == small.Length)
                limit -= (uint) small[0];

            bool possibleOverflow = (uint) big[0] >= limit;

            int[] bigCopy;
            if (possibleOverflow)
            {
                bigCopy = new int[big.Length + 1];
                big.CopyTo(bigCopy, 1);
            }
            else
            {
                bigCopy = (int[]) big.Clone();
            }

            bigCopy = AddMagnitudes(bigCopy, small);

            return new BigInteger(this.sign, bigCopy, possibleOverflow);
        }

        public BigInteger And(
            BigInteger value)
        {
            if (this.sign == 0 || value.sign == 0)
            {
                return Zero;
            }

            int[] aMag = this.sign > 0
                ? this.magnitude
                : Add(One).magnitude;

            int[] bMag = value.sign > 0
                ? value.magnitude
                : value.Add(One).magnitude;

            bool resultNeg = sign < 0 && value.sign < 0;
            int resultLength = System.Math.Max(aMag.Length, bMag.Length);
            int[] resultMag = new int[resultLength];

            int aStart = resultMag.Length - aMag.Length;
            int bStart = resultMag.Length - bMag.Length;

            for (int i = 0; i < resultMag.Length; ++i)
            {
                int aWord = i >= aStart ? aMag[i - aStart] : 0;
                int bWord = i >= bStart ? bMag[i - bStart] : 0;

                if (this.sign < 0)
                {
                    aWord = ~aWord;
                }

                if (value.sign < 0)
                {
                    bWord = ~bWord;
                }

                resultMag[i] = aWord & bWord;

                if (resultNeg)
                {
                    resultMag[i] = ~resultMag[i];
                }
            }

            BigInteger result = new BigInteger(1, resultMag, true);

            // TODO Optimise this case
            if (resultNeg)
            {
                result = result.Not();
            }

            return result;
        }

        public BigInteger AndNot(
            BigInteger val)
        {
            return And(val.Not());
        }

        public int BitCount
        {
            get
            {
                if (nBits == -1)
                {
                    if (sign < 0)
                    {
                        // TODO Optimise this case
                        nBits = Not().BitCount;
                    }
                    else
                    {
                        int sum = 0;
                        for (int i = 0; i < magnitude.Length; ++i)
                        {
                            sum += BitCnt(magnitude[i]);
                        }
                        nBits = sum;
                    }
                }

                return nBits;
            }
        }

        public static int BitCnt(int i)
        {
#if NETCOREAPP3_0_OR_GREATER
            if (Popcnt.IsSupported)
            {
                return (int)Popcnt.PopCount((uint)i);
            }
#endif

            uint u = (uint)i;
            u = u - ((u >> 1) & 0x55555555);
            u = (u & 0x33333333) + ((u >> 2) & 0x33333333);
            u = (u + (u >> 4)) & 0x0f0f0f0f;
            u += (u >> 8);
            u += (u >> 16);
            u &= 0x3f;
            return (int)u;
        }

        private static int CalcBitLength(int sign, int indx, int[]	mag)
        {
            for (;;)
            {
                if (indx >= mag.Length)
                    return 0;

                if (mag[indx] != 0)
                    break;

                ++indx;
            }

            // bit length for everything after the first int
            int bitLength = 32 * ((mag.Length - indx) - 1);

            // and determine bitlength of first int
            int firstMag = mag[indx];
            bitLength += BitLen(firstMag);

            // Check for negative powers of two
            if (sign < 0 && ((firstMag & -firstMag) == firstMag))
            {
                do
                {
                    if (++indx >= mag.Length)
                    {
                        --bitLength;
                        break;
                    }
                }
                while (mag[indx] == 0);
            }

            return bitLength;
        }

        public int BitLength
        {
            get
            {
                if (nBitLength == -1)
                {
                    nBitLength = sign == 0
                        ? 0
                        : CalcBitLength(sign, 0, magnitude);
                }

                return nBitLength;
            }
        }

        //
        // BitLen(value) is the number of bits in value.
        //
        private static int BitLen(int w)
        {
#if NETCOREAPP3_0_OR_GREATER
            if (Lzcnt.IsSupported)
            {
                return 32 - (int)Lzcnt.LeadingZeroCount((uint)w);
            }
#endif

            uint v = (uint)w;
            uint t = v >> 24;
            if (t != 0)
                return 24 + BitLengthTable[t];
            t = v >> 16;
            if (t != 0)
                return 16 + BitLengthTable[t];
            t = v >> 8;
            if (t != 0)
                return 8 + BitLengthTable[t];
            return BitLengthTable[v];
        }

        private bool QuickPow2Check()
        {
            return sign > 0 && nBits == 1;
        }

        public int CompareTo(
            object obj)
        {
            return CompareTo((BigInteger)obj);
        }

        /**
         * unsigned comparison on two arrays - note the arrays may
         * start with leading zeros.
         */
        private static int CompareTo(
            int		xIndx,
            int[]	x,
            int		yIndx,
            int[]	y)
        {
            while (xIndx != x.Length && x[xIndx] == 0)
            {
                xIndx++;
            }

            while (yIndx != y.Length && y[yIndx] == 0)
            {
                yIndx++;
            }

            return CompareNoLeadingZeroes(xIndx, x, yIndx, y);
        }

        private static int CompareNoLeadingZeroes(
            int		xIndx,
            int[]	x,
            int		yIndx,
            int[]	y)
        {
            int diff = (x.Length - y.Length) - (xIndx - yIndx);

            if (diff != 0)
            {
                return diff < 0 ? -1 : 1;
            }

            // lengths of magnitudes the same, test the magnitude values

            while (xIndx < x.Length)
            {
                uint v1 = (uint)x[xIndx++];
                uint v2 = (uint)y[yIndx++];

                if (v1 != v2)
                    return v1 < v2 ? -1 : 1;
            }

            return 0;
        }

        public int CompareTo(
            BigInteger value)
        {
            return sign < value.sign ? -1
                : sign > value.sign ? 1
                : sign == 0 ? 0
                : sign * CompareNoLeadingZeroes(0, magnitude, 0, value.magnitude);
        }

        /**
         * return z = x / y - done in place (z value preserved, x contains the
         * remainder)
         */
        private int[] Divide(
            int[]	x,
            int[]	y)
        {
            int xStart = 0;
            while (xStart < x.Length && x[xStart] == 0)
            {
                ++xStart;
            }

            int yStart = 0;
            while (yStart < y.Length && y[yStart] == 0)
            {
                ++yStart;
            }

            Debug.Assert(yStart < y.Length);

            int xyCmp = CompareNoLeadingZeroes(xStart, x, yStart, y);
            int[] count;

            if (xyCmp > 0)
            {
                int yBitLength = CalcBitLength(1, yStart, y);
                int xBitLength = CalcBitLength(1, xStart, x);
                int shift = xBitLength - yBitLength;

                int[] iCount;
                int iCountStart = 0;

                int[] c;
                int cStart = 0;
                int cBitLength = yBitLength;
                if (shift > 0)
                {
//					iCount = ShiftLeft(One.magnitude, shift);
                    iCount = new int[(shift >> 5) + 1];
                    iCount[0] = 1 << (shift % 32);

                    c = ShiftLeft(y, shift);
                    cBitLength += shift;
                }
                else
                {
                    iCount = new int[] { 1 };

                    int len = y.Length - yStart;
                    c = new int[len];
                    Array.Copy(y, yStart, c, 0, len);
                }

                count = new int[iCount.Length];

                for (;;)
                {
                    if (cBitLength < xBitLength
                        || CompareNoLeadingZeroes(xStart, x, cStart, c) >= 0)
                    {
                        Subtract(xStart, x, cStart, c);
                        AddMagnitudes(count, iCount);

                        while (x[xStart] == 0)
                        {
                            if (++xStart == x.Length)
                                return count;
                        }

                        //xBitLength = CalcBitLength(xStart, x);
                        xBitLength = 32 * (x.Length - xStart - 1) + BitLen(x[xStart]);

                        if (xBitLength <= yBitLength)
                        {
                            if (xBitLength < yBitLength)
                                return count;

                            xyCmp = CompareNoLeadingZeroes(xStart, x, yStart, y);

                            if (xyCmp <= 0)
                                break;
                        }
                    }

                    shift = cBitLength - xBitLength;

                    // NB: The case where c[cStart] is 1-bit is harmless
                    if (shift == 1)
                    {
                        uint firstC = (uint) c[cStart] >> 1;
                        uint firstX = (uint) x[xStart];
                        if (firstC > firstX)
                            ++shift;
                    }

                    if (shift < 2)
                    {
                        ShiftRightOneInPlace(cStart, c);
                        --cBitLength;
                        ShiftRightOneInPlace(iCountStart, iCount);
                    }
                    else
                    {
                        ShiftRightInPlace(cStart, c, shift);
                        cBitLength -= shift;
                        ShiftRightInPlace(iCountStart, iCount, shift);
                    }

                    //cStart = c.Length - ((cBitLength + 31) / 32);
                    while (c[cStart] == 0)
                    {
                        ++cStart;
                    }

                    while (iCount[iCountStart] == 0)
                    {
                        ++iCountStart;
                    }
                }
            }
            else
            {
                count = new int[1];
            }

            if (xyCmp == 0)
            {
                AddMagnitudes(count, One.magnitude);
                Array.Clear(x, xStart, x.Length - xStart);
            }

            return count;
        }

        public BigInteger Divide(
            BigInteger val)
        {
            if (val.sign == 0)
                throw new ArithmeticException("Division by zero error");

            if (sign == 0)
                return Zero;

            if (val.QuickPow2Check()) // val is power of two
            {
                BigInteger result = this.Abs().ShiftRight(val.Abs().BitLength - 1);
                return val.sign == this.sign ? result : result.Negate();
            }

            int[] mag = (int[]) this.magnitude.Clone();

            return new BigInteger(this.sign * val.sign, Divide(mag, val.magnitude), true);
        }

        public BigInteger[] DivideAndRemainder(
            BigInteger val)
        {
            if (val.sign == 0)
                throw new ArithmeticException("Division by zero error");

            BigInteger[] biggies = new BigInteger[2];

            if (sign == 0)
            {
                biggies[0] = Zero;
                biggies[1] = Zero;
            }
            else if (val.QuickPow2Check()) // val is power of two
            {
                int e = val.Abs().BitLength - 1;
                BigInteger quotient = this.Abs().ShiftRight(e);
                int[] remainder = this.LastNBits(e);

                biggies[0] = val.sign == this.sign ? quotient : quotient.Negate();
                biggies[1] = new BigInteger(this.sign, remainder, true);
            }
            else
            {
                int[] remainder = (int[]) this.magnitude.Clone();
                int[] quotient = Divide(remainder, val.magnitude);

                biggies[0] = new BigInteger(this.sign * val.sign, quotient, true);
                biggies[1] = new BigInteger(this.sign, remainder, true);
            }

            return biggies;
        }

        public override bool Equals(
            object obj)
        {
            if (obj == this)
                return true;

            BigInteger biggie = obj as BigInteger;
            if (biggie == null)
                return false;

            return sign == biggie.sign && IsEqualMagnitude(biggie);
        }

        private bool IsEqualMagnitude(BigInteger x)
        {
            int[] xMag = x.magnitude;
            if (magnitude.Length != x.magnitude.Length)
                return false;
            for (int i = 0; i < magnitude.Length; i++)
            {
                if (magnitude[i] != x.magnitude[i])
                    return false;
            }
            return true;
        }

        public BigInteger Gcd(
            BigInteger value)
        {
            if (value.sign == 0)
                return Abs();

            if (sign == 0)
                return value.Abs();

            BigInteger r;
            BigInteger u = this;
            BigInteger v = value;

            while (v.sign != 0)
            {
                r = u.Mod(v);
                u = v;
                v = r;
            }

            return u;
        }

        public override int GetHashCode()
        {
            int hc = magnitude.Length;
            if (magnitude.Length > 0)
            {
                hc ^= magnitude[0];

                if (magnitude.Length > 1)
                {
                    hc ^= magnitude[magnitude.Length - 1];
                }
            }

            return sign < 0 ? ~hc : hc;
        }

        // TODO Make public?
        private BigInteger Inc()
        {
            if (this.sign == 0)
                return One;

            if (this.sign < 0)
                return new BigInteger(-1, doSubBigLil(this.magnitude, One.magnitude), true);

            return AddToMagnitude(One.magnitude);
        }

        public int IntValue
        {
            get
            {
                if (sign == 0)
                    return 0;

                int n = magnitude.Length;

                int v = magnitude[n - 1];

                return sign < 0 ? -v : v;
            }
        }

        public int IntValueExact
        {
            get
            {
                if (BitLength > 31)
                    throw new ArithmeticException("BigInteger out of int range");

                return IntValue;
            }
        }

        /**
         * return whether or not a BigInteger is probably prime with a
         * probability of 1 - (1/2)**certainty.
         * <p>From Knuth Vol 2, pg 395.</p>
         */
        public bool IsProbablePrime(int certainty)
        {
            return IsProbablePrime(certainty, false);
        }

        internal bool IsProbablePrime(int certainty, bool randomlySelected)
        {
            if (certainty <= 0)
                return true;

            BigInteger n = Abs();

            if (!n.TestBit(0))
                return n.Equals(Two);

            if (n.Equals(One))
                return false;

            return n.CheckProbablePrime(certainty, RandomSource, randomlySelected);
        }

        private bool CheckProbablePrime(int certainty, Random random, bool randomlySelected)
        {
            Debug.Assert(certainty > 0);
            Debug.Assert(CompareTo(Two) > 0);
            Debug.Assert(TestBit(0));


            // Try to reduce the penalty for really small numbers
            int numLists = System.Math.Min(BitLength - 1, primeLists.Length);

            for (int i = 0; i < numLists; ++i)
            {
                int test = Remainder(primeProducts[i]);

                int[] primeList = primeLists[i];
                for (int j = 0; j < primeList.Length; ++j)
                {
                    int prime = primeList[j];
                    int qRem = test % prime;
                    if (qRem == 0)
                    {
                        // We may find small numbers in the list
                        return BitLength < 16 && IntValue == prime;
                    }
                }
            }


            // TODO Special case for < 10^16 (RabinMiller fixed list)
//			if (BitLength < 30)
//			{
//				RabinMiller against 2, 3, 5, 7, 11, 13, 23 is sufficient
//			}


            // TODO Is it worth trying to create a hybrid of these two?
            return RabinMillerTest(certainty, random, randomlySelected);
//			return SolovayStrassenTest(certainty, random);

//			bool rbTest = RabinMillerTest(certainty, random);
//			bool ssTest = SolovayStrassenTest(certainty, random);
//
//			Debug.Assert(rbTest == ssTest);
//
//			return rbTest;
        }

        public bool RabinMillerTest(int certainty, Random random)
        {
            return RabinMillerTest(certainty, random, false);
        }

        internal bool RabinMillerTest(int certainty, Random random, bool randomlySelected)
        {
            int bits = BitLength;

            Debug.Assert(certainty > 0);
            Debug.Assert(bits > 2);
            Debug.Assert(TestBit(0));

            int iterations = ((certainty - 1) / 2) + 1;
            if (randomlySelected)
            {
                int itersFor100Cert = bits >= 1024 ?  4
                                    : bits >= 512  ?  8
                                    : bits >= 256  ? 16
                                    : 50;

                if (certainty < 100)
                {
                    iterations = System.Math.Min(itersFor100Cert, iterations);
                }
                else
                {
                    iterations -= 50;
                    iterations += itersFor100Cert;
                }
            }

            // let n = 1 + d . 2^s
            BigInteger n = this;
            int s = n.GetLowestSetBitMaskFirst(-1 << 1);
            Debug.Assert(s >= 1);
            BigInteger r = n.ShiftRight(s);

            // NOTE: Avoid conversion to/from Montgomery form and check for R/-R as result instead

            BigInteger montRadix = One.ShiftLeft(32 * n.magnitude.Length).Remainder(n);
            BigInteger minusMontRadix = n.Subtract(montRadix);

            do
            {
                BigInteger a;
                do
                {
                    a = new BigInteger(n.BitLength, random);
                }
                while (a.sign == 0 || a.CompareTo(n) >= 0
                    || a.IsEqualMagnitude(montRadix) || a.IsEqualMagnitude(minusMontRadix));

                BigInteger y = ModPowMonty(a, r, n, false);

                if (!y.Equals(montRadix))
                {
                    int j = 0;
                    while (!y.Equals(minusMontRadix))
                    {
                        if (++j == s)
                            return false;

                        y = ModPowMonty(y, Two, n, false);

                        if (y.Equals(montRadix))
                            return false;
                    }
                }
            }
            while (--iterations > 0);

            return true;
        }

//		private bool SolovayStrassenTest(
//			int		certainty,
//			Random	random)
//		{
//			Debug.Assert(certainty > 0);
//			Debug.Assert(CompareTo(Two) > 0);
//			Debug.Assert(TestBit(0));
//
//			BigInteger n = this;
//			BigInteger nMinusOne = n.Subtract(One);
//			BigInteger e = nMinusOne.ShiftRight(1);
//
//			do
//			{
//				BigInteger a;
//				do
//				{
//					a = new BigInteger(nBitLength, random);
//				}
//				// NB: Spec says 0 < x < n, but 1 is trivial
//				while (a.CompareTo(One) <= 0 || a.CompareTo(n) >= 0);
//
//
//				// TODO Check this is redundant given the way Jacobi() works?
////				if (!a.Gcd(n).Equals(One))
////					return false;
//
//				int x = Jacobi(a, n);
//
//				if (x == 0)
//					return false;
//
//				BigInteger check = a.ModPow(e, n);
//
//				if (x == 1 && !check.Equals(One))
//					return false;
//
//				if (x == -1 && !check.Equals(nMinusOne))
//					return false;
//
//				--certainty;
//			}
//			while (certainty > 0);
//
//			return true;
//		}
//
//		private static int Jacobi(
//			BigInteger	a,
//			BigInteger	b)
//		{
//			Debug.Assert(a.sign >= 0);
//			Debug.Assert(b.sign > 0);
//			Debug.Assert(b.TestBit(0));
//			Debug.Assert(a.CompareTo(b) < 0);
//
//			int totalS = 1;
//			for (;;)
//			{
//				if (a.sign == 0)
//					return 0;
//
//				if (a.Equals(One))
//					break;
//
//				int e = a.GetLowestSetBit();
//
//				int bLsw = b.magnitude[b.magnitude.Length - 1];
//				if ((e & 1) != 0 && ((bLsw & 7) == 3 || (bLsw & 7) == 5))
//					totalS = -totalS;
//
//				// TODO Confirm this is faster than later a1.Equals(One) test
//				if (a.BitLength == e + 1)
//					break;
//				BigInteger a1 = a.ShiftRight(e);
////				if (a1.Equals(One))
////					break;
//
//				int a1Lsw = a1.magnitude[a1.magnitude.Length - 1];
//				if ((bLsw & 3) == 3 && (a1Lsw & 3) == 3)
//					totalS = -totalS;
//
////				a = b.Mod(a1);
//				a = b.Remainder(a1);
//				b = a1;
//			}
//			return totalS;
//		}

        public long LongValue
        {
            get
            {
                if (sign == 0)
                    return 0;

                int n = magnitude.Length;

                long v = magnitude[n - 1] & IMASK;
                if (n > 1)
                {
                    v |= (magnitude[n - 2] & IMASK) << 32;
                }

                return sign < 0 ? -v : v;
            }
        }

        public long LongValueExact
        {
            get
            {
                if (BitLength > 63)
                    throw new ArithmeticException("BigInteger out of long range");

                return LongValue;
            }
        }

        public BigInteger Max(
            BigInteger value)
        {
            return CompareTo(value) > 0 ? this : value;
        }

        public BigInteger Min(
            BigInteger value)
        {
            return CompareTo(value) < 0 ? this : value;
        }

        public BigInteger Mod(
            BigInteger m)
        {
            if (m.sign < 1)
                throw new ArithmeticException("Modulus must be positive");

            BigInteger biggie = Remainder(m);

            return (biggie.sign >= 0 ? biggie : biggie.Add(m));
        }

        public BigInteger ModInverse(
            BigInteger m)
        {
            if (m.sign < 1)
                throw new ArithmeticException("Modulus must be positive");

            // TODO Too slow at the moment
//			// "Fast Key Exchange with Elliptic Curve Systems" R.Schoeppel
//			if (m.TestBit(0))
//			{
//				//The Almost Inverse Algorithm
//				int k = 0;
//				BigInteger B = One, C = Zero, F = this, G = m, tmp;
//
//				for (;;)
//				{
//					// While F is even, do F=F/u, C=C*u, k=k+1.
//					int zeroes = F.GetLowestSetBit();
//					if (zeroes > 0)
//					{
//						F = F.ShiftRight(zeroes);
//						C = C.ShiftLeft(zeroes);
//						k += zeroes;
//					}
//
//					// If F = 1, then return B,k.
//					if (F.Equals(One))
//					{
//						BigInteger half = m.Add(One).ShiftRight(1);
//						BigInteger halfK = half.ModPow(BigInteger.ValueOf(k), m);
//						return B.Multiply(halfK).Mod(m);
//					}
//
//					if (F.CompareTo(G) < 0)
//					{
//						tmp = G; G = F; F = tmp;
//						tmp = B; B = C; C = tmp;
//					}
//
//					F = F.Add(G);
//					B = B.Add(C);
//				}
//			}

            if (m.QuickPow2Check())
            {
                return ModInversePow2(m);
            }

            BigInteger d = this.Remainder(m);
            BigInteger x;
            BigInteger gcd = ExtEuclid(d, m, out x);

            if (!gcd.Equals(One))
                throw new ArithmeticException("Numbers not relatively prime.");

            if (x.sign < 0)
            {
                x = x.Add(m);
            }

            return x;
        }

        private BigInteger ModInversePow2(BigInteger m)
        {
            Debug.Assert(m.SignValue > 0);
            Debug.Assert(m.BitCount == 1);

            if (!TestBit(0))
            {
                throw new ArithmeticException("Numbers not relatively prime.");
            }

            int pow = m.BitLength - 1;

            long inv64 = ModInverse64(LongValue);
            if (pow < 64)
            {
                inv64 &= ((1L << pow) - 1);
            }

            BigInteger x = BigInteger.ValueOf(inv64);

            if (pow > 64)
            {
                BigInteger d = this.Remainder(m);
                int bitsCorrect = 64;

                do
                {
                    BigInteger t = x.Multiply(d).Remainder(m);
                    x = x.Multiply(Two.Subtract(t)).Remainder(m);
                    bitsCorrect <<= 1;
                }
                while (bitsCorrect < pow);
            }

            if (x.sign < 0)
            {
                x = x.Add(m);
            }

            return x;
        }

        private static int ModInverse32(int d)
        {
            // Newton's method with initial estimate "correct to 4 bits"
            Debug.Assert((d & 1) != 0);
            int x = d + (((d + 1) & 4) << 1);   // d.x == 1 mod 2**4
            Debug.Assert(((d * x) & 15) == 1);
            x *= 2 - d * x;                     // d.x == 1 mod 2**8
            x *= 2 - d * x;                     // d.x == 1 mod 2**16
            x *= 2 - d * x;                     // d.x == 1 mod 2**32
            Debug.Assert(d * x == 1);
            return x;
        }

        private static long ModInverse64(long d)
        {
            // Newton's method with initial estimate "correct to 4 bits"
            Debug.Assert((d & 1L) != 0);
            long x = d + (((d + 1L) & 4L) << 1);    // d.x == 1 mod 2**4
            Debug.Assert(((d * x) & 15L) == 1L);
            x *= 2 - d * x;                         // d.x == 1 mod 2**8
            x *= 2 - d * x;                         // d.x == 1 mod 2**16
            x *= 2 - d * x;                         // d.x == 1 mod 2**32
            x *= 2 - d * x;                         // d.x == 1 mod 2**64
            Debug.Assert(d * x == 1L);
            return x;
        }

        /**
         * Calculate the numbers u1, u2, and u3 such that:
         *
         * u1 * a + u2 * b = u3
         *
         * where u3 is the greatest common divider of a and b.
         * a and b using the extended Euclid algorithm (refer p. 323
         * of The Art of Computer Programming vol 2, 2nd ed).
         * This also seems to have the side effect of calculating
         * some form of multiplicative inverse.
         *
         * @param a    First number to calculate gcd for
         * @param b    Second number to calculate gcd for
         * @param u1Out      the return object for the u1 value
         * @return     The greatest common divisor of a and b
         */
        private static BigInteger ExtEuclid(BigInteger a, BigInteger b, out BigInteger u1Out)
        {
            BigInteger u1 = One, v1 = Zero;
            BigInteger u3 = a, v3 = b;

            if (v3.sign > 0)
            {
                for (;;)
                {
                    BigInteger[] q = u3.DivideAndRemainder(v3);
                    u3 = v3;
                    v3 = q[1];

                    BigInteger oldU1 = u1;
                    u1 = v1;

                    if (v3.sign <= 0)
                        break;

                    v1 = oldU1.Subtract(v1.Multiply(q[0]));
                }
            }

            u1Out = u1;

            return u3;
        }

        private static void ZeroOut(
            int[] x)
        {
            Array.Clear(x, 0, x.Length);
        }

        public BigInteger ModPow(BigInteger e, BigInteger m)
        {
            if (m.sign < 1)
                throw new ArithmeticException("Modulus must be positive");

            if (m.Equals(One))
                return Zero;

            if (e.sign == 0)
                return One;

            if (sign == 0)
                return Zero;

            bool negExp = e.sign < 0;
            if (negExp)
                e = e.Negate();

            BigInteger result = this.Mod(m);
            if (!e.Equals(One))
            {
                if ((m.magnitude[m.magnitude.Length - 1] & 1) == 0)
                {
                    result = ModPowBarrett(result, e, m);
                }
                else
                {
                    result = ModPowMonty(result, e, m, true);
                }
            }

            if (negExp)
                result = result.ModInverse(m);

            return result;
        }

        private static BigInteger ModPowBarrett(BigInteger b, BigInteger e, BigInteger m)
        {
            int k = m.magnitude.Length;
            BigInteger mr = One.ShiftLeft((k + 1) << 5);
            BigInteger yu = One.ShiftLeft(k << 6).Divide(m);

            // Sliding window from MSW to LSW
            int extraBits = 0, expLength = e.BitLength;
            while (expLength > ExpWindowThresholds[extraBits])
            {
                ++extraBits;
            }

            int numPowers = 1 << extraBits;
            BigInteger[] oddPowers = new BigInteger[numPowers];
            oddPowers[0] = b;

            BigInteger b2 = ReduceBarrett(b.Square(), m, mr, yu);

            for (int i = 1; i < numPowers; ++i)
            {
                oddPowers[i] = ReduceBarrett(oddPowers[i - 1].Multiply(b2), m, mr, yu);
            }

            int[] windowList = GetWindowList(e.magnitude, extraBits);
            Debug.Assert(windowList.Length > 0);

            int window = windowList[0];
            int mult = window & 0xFF, lastZeroes = window >> 8;

            BigInteger y;
            if (mult == 1)
            {
                y = b2;
                --lastZeroes;
            }
            else
            {
                y = oddPowers[mult >> 1];
            }

            int windowPos = 1;
            while ((window = windowList[windowPos++]) != -1)
            {
                mult = window & 0xFF;

                int bits = lastZeroes + BitLengthTable[mult];
                for (int j = 0; j < bits; ++j)
                {
                    y = ReduceBarrett(y.Square(), m, mr, yu);
                }

                y = ReduceBarrett(y.Multiply(oddPowers[mult >> 1]), m, mr, yu);

                lastZeroes = window >> 8;
            }

            for (int i = 0; i < lastZeroes; ++i)
            {
                y = ReduceBarrett(y.Square(), m, mr, yu);
            }

            return y;
        }

        private static BigInteger ReduceBarrett(BigInteger x, BigInteger m, BigInteger mr, BigInteger yu)
        {
            int xLen = x.BitLength, mLen = m.BitLength;
            if (xLen < mLen)
                return x;

            if (xLen - mLen > 1)
            {
                int k = m.magnitude.Length;

                BigInteger q1 = x.DivideWords(k - 1);
                BigInteger q2 = q1.Multiply(yu); // TODO Only need partial multiplication here
                BigInteger q3 = q2.DivideWords(k + 1);

                BigInteger r1 = x.RemainderWords(k + 1);
                BigInteger r2 = q3.Multiply(m); // TODO Only need partial multiplication here
                BigInteger r3 = r2.RemainderWords(k + 1);

                x = r1.Subtract(r3);
                if (x.sign < 0)
                {
                    x = x.Add(mr);
                }
            }

            while (x.CompareTo(m) >= 0)
            {
                x = x.Subtract(m);
            }

            return x;
        }

        private static BigInteger ModPowMonty(BigInteger b, BigInteger e, BigInteger m, bool convert)
        {
            int n = m.magnitude.Length;
            int powR = 32 * n;
            bool smallMontyModulus = m.BitLength + 2 <= powR;
            uint mDash = (uint)m.GetMQuote();

            // tmp = this * R mod m
            if (convert)
            {
                b = b.ShiftLeft(powR).Remainder(m);
            }

            int[] yAccum = new int[n + 1];

            int[] zVal = b.magnitude;
            Debug.Assert(zVal.Length <= n);
            if (zVal.Length < n)
            {
                int[] tmp = new int[n];
                zVal.CopyTo(tmp, n - zVal.Length);
                zVal = tmp;
            }

            // Sliding window from MSW to LSW

            int extraBits = 0;

            // Filter the common case of small RSA exponents with few bits set
            if (e.magnitude.Length > 1 || e.BitCount > 2)
            {
                int expLength = e.BitLength;
                while (expLength > ExpWindowThresholds[extraBits])
                {
                    ++extraBits;
                }
            }

            int numPowers = 1 << extraBits;
            int[][] oddPowers = new int[numPowers][];
            oddPowers[0] = zVal;

            int[] zSquared = Arrays.Clone(zVal);
            SquareMonty(yAccum, zSquared, m.magnitude, mDash, smallMontyModulus);

            for (int i = 1; i < numPowers; ++i)
            {
                oddPowers[i] = Arrays.Clone(oddPowers[i - 1]);
                MultiplyMonty(yAccum, oddPowers[i], zSquared, m.magnitude, mDash, smallMontyModulus);
            }

            int[] windowList = GetWindowList(e.magnitude, extraBits);
            Debug.Assert(windowList.Length > 1);

            int window = windowList[0];
            int mult = window & 0xFF, lastZeroes = window >> 8;

            int[] yVal;
            if (mult == 1)
            {
                yVal = zSquared;
                --lastZeroes;
            }
            else
            {
                yVal = Arrays.Clone(oddPowers[mult >> 1]);
            }

            int windowPos = 1;
            while ((window = windowList[windowPos++]) != -1)
            {
                mult = window & 0xFF;

                int bits = lastZeroes + BitLengthTable[mult];
                for (int j = 0; j < bits; ++j)
                {
                    SquareMonty(yAccum, yVal, m.magnitude, mDash, smallMontyModulus);
                }

                MultiplyMonty(yAccum, yVal, oddPowers[mult >> 1], m.magnitude, mDash, smallMontyModulus);

                lastZeroes = window >> 8;
            }

            for (int i = 0; i < lastZeroes; ++i)
            {
                SquareMonty(yAccum, yVal, m.magnitude, mDash, smallMontyModulus);
            }

            if (convert)
            {
                // Return y * R^(-1) mod m
                MontgomeryReduce(yVal, m.magnitude, mDash);
            }
            else if (smallMontyModulus && CompareTo(0, yVal, 0, m.magnitude) >= 0)
            {
                Subtract(0, yVal, 0, m.magnitude);
            }

            return new BigInteger(1, yVal, true);
        }

        private static int[] GetWindowList(int[] mag, int extraBits)
        {
            int v = mag[0];
            Debug.Assert(v != 0);

            int leadingBits = BitLen(v);

            int resultSize = (((mag.Length - 1) << 5) + leadingBits) / (1 + extraBits) + 2;
            int[] result = new int[resultSize];
            int resultPos = 0;

            int bitPos = 33 - leadingBits;
            v <<= bitPos;

            int mult = 1, multLimit = 1 << extraBits;
            int zeroes = 0;

            int i = 0;
            for (; ; )
            {
                for (; bitPos < 32; ++bitPos)
                {
                    if (mult < multLimit)
                    {
                        mult = (mult << 1) | (int)((uint)v >> 31);
                    }
                    else if (v < 0)
                    {
                        result[resultPos++] = CreateWindowEntry(mult, zeroes);
                        mult = 1;
                        zeroes = 0;
                    }
                    else
                    {
                        ++zeroes;
                    }

                    v <<= 1;
                }

                if (++i == mag.Length)
                {
                    result[resultPos++] = CreateWindowEntry(mult, zeroes);
                    break;
                }

                v = mag[i];
                bitPos = 0;
            }

            result[resultPos] = -1;
            return result;
        }

        private static int CreateWindowEntry(int mult, int zeroes)
        {
            while ((mult & 1) == 0)
            {
                mult >>= 1;
                ++zeroes;
            }

            return mult | (zeroes << 8);
        }

        /**
         * return w with w = x * x - w is assumed to have enough space.
         */
        private static int[] Square(
            int[]	w,
            int[]	x)
        {
            // Note: this method allows w to be only (2 * x.Length - 1) words if result will fit
//			if (w.Length != 2 * x.Length)
//				throw new ArgumentException("no I don't think so...");

            ulong c;

            int wBase = w.Length - 1;

            for (int i = x.Length - 1; i > 0; --i)
            {
                ulong v = (uint)x[i];

                c = v * v + (uint)w[wBase];
                w[wBase] = (int)c;
                c >>= 32;

                for (int j = i - 1; j >= 0; --j)
                {
                    ulong prod = v * (uint)x[j];

                    c += ((uint)w[--wBase] & UIMASK) + ((uint)prod << 1);
                    w[wBase] = (int)c;
                    c = (c >> 32) + (prod >> 31);
                }

                c += (uint)w[--wBase];
                w[wBase] = (int)c;

                if (--wBase >= 0)
                {
                    w[wBase] = (int)(c >> 32);
                }
                else
                {
                    Debug.Assert((c >> 32) == 0);
                }

                wBase += i;
            }

            c = (uint)x[0];

            c = c * c + (uint)w[wBase];
            w[wBase] = (int)c;

            if (--wBase >= 0)
            {
                w[wBase] += (int)(c >> 32);
            }
            else
            {
                Debug.Assert((c >> 32) == 0);
            }

            return w;
        }

        /**
         * return x with x = y * z - x is assumed to have enough space.
         */
        private static int[] Multiply(int[]	x, int[] y, int[] z)
        {
            int i = z.Length;

            if (i < 1)
                return x;

            int xBase = x.Length - y.Length;

            do
            {
                long a = z[--i] & IMASK;
                long val = 0;

                if (a != 0)
                {
                    for (int j = y.Length - 1; j >= 0; j--)
                    {
                        val += a * (y[j] & IMASK) + (x[xBase + j] & IMASK);
    
                        x[xBase + j] = (int)val;
    
                        val = (long)((ulong)val >> 32);
                    }
                }

                --xBase;

                if (xBase >= 0)
                {
                    x[xBase] = (int)val;
                }
                else
                {
                    Debug.Assert(val == 0);
                }
            }
            while (i > 0);

            return x;
        }

        /**
         * Calculate mQuote = -m^(-1) mod b with b = 2^32 (32 = word size)
         */
        private int GetMQuote()
        {
            if (mQuote != 0)
            {
                return mQuote; // already calculated
            }

            Debug.Assert(this.sign > 0);

            int d = -magnitude[magnitude.Length - 1];

            Debug.Assert((d & 1) != 0);

            return mQuote = ModInverse32(d);
        }

        private static void MontgomeryReduce(int[] x, int[] m, uint mDash) // mDash = -m^(-1) mod b
        {
            // NOTE: Not a general purpose reduction (which would allow x up to twice the bitlength of m)
            Debug.Assert(x.Length == m.Length);

            int n = m.Length;

            for (int i = n - 1; i >= 0; --i)
            {
                uint x0 = (uint)x[n - 1];
                ulong t = x0 * mDash;

                ulong carry = t * (uint)m[n - 1] + x0;
                Debug.Assert((uint)carry == 0);
                carry >>= 32;

                for (int j = n - 2; j >= 0; --j)
                {
                    carry += t * (uint)m[j] + (uint)x[j];
                    x[j + 1] = (int)carry;
                    carry >>= 32;
                }

                x[0] = (int)carry;
                Debug.Assert(carry >> 32 == 0);
            }

            if (CompareTo(0, x, 0, m) >= 0)
            {
                Subtract(0, x, 0, m);
            }
        }

        /**
         * Montgomery multiplication: a = x * y * R^(-1) mod m
         * <br/>
         * Based algorithm 14.36 of Handbook of Applied Cryptography.
         * <br/>
         * <li> m, x, y should have length n </li>
         * <li> a should have length (n + 1) </li>
         * <li> b = 2^32, R = b^n </li>
         * <br/>
         * The result is put in x
         * <br/>
         * NOTE: the indices of x, y, m, a different in HAC and in Java
         */
        private static void MultiplyMonty(int[]	a, int[] x, int[] y, int[] m, uint mDash, bool smallMontyModulus)
            // mDash = -m^(-1) mod b
        {
            int n = m.Length;

            if (n == 1)
            {
                x[0] = (int)MultiplyMontyNIsOne((uint)x[0], (uint)y[0], (uint)m[0], mDash);
                return;
            }

            uint y0 = (uint)y[n - 1];
            int aMax;

            {
                ulong xi = (uint)x[n - 1];

                ulong carry = xi * y0;
                ulong t = (uint)carry * mDash;

                ulong prod2 = t * (uint)m[n - 1];
                carry += (uint)prod2;
                Debug.Assert((uint)carry == 0);
                carry = (carry >> 32) + (prod2 >> 32);

                for (int j = n - 2; j >= 0; --j)
                {
                    ulong prod1 = xi * (uint)y[j];
                    prod2 = t * (uint)m[j];

                    carry += (prod1 & UIMASK) + (uint)prod2;
                    a[j + 2] = (int)carry;
                    carry = (carry >> 32) + (prod1 >> 32) + (prod2 >> 32);
                }

                a[1] = (int)carry;
                aMax = (int)(carry >> 32);
            }

            for (int i = n - 2; i >= 0; --i)
            {
                uint a0 = (uint)a[n];
                ulong xi = (uint)x[i];

                ulong prod1 = xi * y0;
                ulong carry = (prod1 & UIMASK) + a0;
                ulong t = (uint)carry * mDash;

                ulong prod2 = t * (uint)m[n - 1];
                carry += (uint)prod2;
                Debug.Assert((uint)carry == 0);
                carry = (carry >> 32) + (prod1 >> 32) + (prod2 >> 32);

                for (int j = n - 2; j >= 0; --j)
                {
                    prod1 = xi * (uint)y[j];
                    prod2 = t * (uint)m[j];

                    carry += (prod1 & UIMASK) + (uint)prod2 + (uint)a[j + 1];
                    a[j + 2] = (int)carry;
                    carry = (carry >> 32) + (prod1 >> 32) + (prod2 >> 32);
                }

                carry += (uint)aMax;
                a[1] = (int)carry;
                aMax = (int)(carry >> 32);
            }

            a[0] = aMax;

            if (!smallMontyModulus && CompareTo(0, a, 0, m) >= 0)
            {
                Subtract(0, a, 0, m);
            }

            Array.Copy(a, 1, x, 0, n);
        }

        private static void SquareMonty(int[] a, int[] x, int[] m, uint mDash, bool smallMontyModulus)
            // mDash = -m^(-1) mod b
        {
            int n = m.Length;

            if (n == 1)
            {
                uint xVal = (uint)x[0];
                x[0] = (int)MultiplyMontyNIsOne(xVal, xVal, (uint)m[0], mDash);
                return;
            }

            ulong x0 = (uint)x[n - 1];
            int aMax;

            {
                ulong carry = x0 * x0;
                ulong t = (uint)carry * mDash;

                ulong prod2 = t * (uint)m[n - 1];
                carry += (uint)prod2;
                Debug.Assert((uint)carry == 0);
                carry = (carry >> 32) + (prod2 >> 32);

                for (int j = n - 2; j >= 0; --j)
                {
                    ulong prod1 = x0 * (uint)x[j];
                    prod2 = t * (uint)m[j];

                    carry += (prod2 & UIMASK) + ((uint)prod1 << 1);
                    a[j + 2] = (int)carry;
                    carry = (carry >> 32) + (prod1 >> 31) + (prod2 >> 32);
                }

                a[1] = (int)carry;
                aMax = (int)(carry >> 32);
            }

            for (int i = n - 2; i >= 0; --i)
            {
                uint a0 = (uint)a[n];
                ulong t = a0 * mDash;

                ulong carry = t * (uint)m[n - 1] + a0;
                Debug.Assert((uint)carry == 0);
                carry >>= 32;

                for (int j = n - 2; j > i; --j)
                {
                    carry += t * (uint)m[j] + (uint)a[j + 1];
                    a[j + 2] = (int)carry;
                    carry >>= 32;
                }

                ulong xi = (uint)x[i];

                {
                    ulong prod1 = xi * xi;
                    ulong prod2 = t * (uint)m[i];

                    carry += (prod1 & UIMASK) + (uint)prod2 + (uint)a[i + 1];
                    a[i + 2] = (int)carry;
                    carry = (carry >> 32) + (prod1 >> 32) + (prod2 >> 32);
                }

                for (int j = i - 1; j >= 0; --j)
                {
                    ulong prod1 = xi * (uint)x[j];
                    ulong prod2 = t * (uint)m[j];

                    carry += (prod2 & UIMASK) + ((uint)prod1 << 1) + (uint)a[j + 1];
                    a[j + 2] = (int)carry;
                    carry = (carry >> 32) + (prod1 >> 31) + (prod2 >> 32);
                }

                carry += (uint)aMax;
                a[1] = (int)carry;
                aMax = (int)(carry >> 32);
            }

            a[0] = aMax;

            if (!smallMontyModulus && CompareTo(0, a, 0, m) >= 0)
            {
                Subtract(0, a, 0, m);
            }

            Array.Copy(a, 1, x, 0, n);
        }

        private static uint MultiplyMontyNIsOne(uint x, uint y, uint m, uint mDash)
        {
            ulong carry = (ulong)x * y;
            uint t = (uint)carry * mDash;
            ulong um = m;
            ulong prod2 = um * t;
            carry += (uint)prod2;
            Debug.Assert((uint)carry == 0);
            carry = (carry >> 32) + (prod2 >> 32);
            if (carry > um)
            {
                carry -= um;
            }
            Debug.Assert(carry < um);
            return (uint)carry;
        }

        public BigInteger Multiply(
            BigInteger val)
        {
            if (val == this)
                return Square();

            if ((sign & val.sign) == 0)
                return Zero;

            if (val.QuickPow2Check()) // val is power of two
            {
                BigInteger result = this.ShiftLeft(val.Abs().BitLength - 1);
                return val.sign > 0 ? result : result.Negate();
            }

            if (this.QuickPow2Check()) // this is power of two
            {
                BigInteger result = val.ShiftLeft(this.Abs().BitLength - 1);
                return this.sign > 0 ? result : result.Negate();
            }

            int resLength = magnitude.Length + val.magnitude.Length;
            int[] res = new int[resLength];

            Multiply(res, this.magnitude, val.magnitude);

            int resSign = sign ^ val.sign ^ 1;
            return new BigInteger(resSign, res, true);
        }

        public BigInteger Square()
        {
            if (sign == 0)
                return Zero;
            if (this.QuickPow2Check())
                return ShiftLeft(Abs().BitLength - 1);
            int resLength = magnitude.Length << 1;
            if ((uint)magnitude[0] >> 16 == 0)
                --resLength;
            int[] res = new int[resLength];
            Square(res, magnitude);
            return new BigInteger(1, res, false);
        }

        public BigInteger Negate()
        {
            if (sign == 0)
                return this;

            return new BigInteger(-sign, magnitude, false);
        }

        public BigInteger NextProbablePrime()
        {
            if (sign < 0)
                throw new ArithmeticException("Cannot be called on value < 0");

            if (CompareTo(Two) < 0)
                return Two;

            BigInteger n = Inc().SetBit(0);

            while (!n.CheckProbablePrime(100, RandomSource, false))
            {
                n = n.Add(Two);
            }

            return n;
        }

        public BigInteger Not()
        {
            return Inc().Negate();
        }

        public BigInteger Pow(int exp)
        {
            if (exp <= 0)
            {
                if (exp < 0)
                    throw new ArithmeticException("Negative exponent");

                return One;
            }

            if (sign == 0)
            {
                return this;
            }

            if (QuickPow2Check())
            {
                long powOf2 = (long)exp * (BitLength - 1);
                if (powOf2 > int.MaxValue)
                {
                    throw new ArithmeticException("Result too large");
                }
                return One.ShiftLeft((int)powOf2); 
            }

            BigInteger y = One;
            BigInteger z = this;

            for (;;)
            {
                if ((exp & 0x1) == 1)
                {
                    y = y.Multiply(z);
                }
                exp >>= 1;
                if (exp == 0) break;
                z = z.Multiply(z);
            }

            return y;
        }

        public static BigInteger ProbablePrime(
            int bitLength,
            Random random)
        {
            return new BigInteger(bitLength, 100, random);
        }

        private int Remainder(
            int m)
        {
            Debug.Assert(m > 0);

            long acc = 0;
            for (int pos = 0; pos < magnitude.Length; ++pos)
            {
                long posVal = (uint) magnitude[pos];
                acc = (acc << 32 | posVal) % m;
            }

            return (int) acc;
        }

        /**
         * return x = x % y - done in place (y value preserved)
         */
        private static int[] Remainder(
            int[] x,
            int[] y)
        {
            int xStart = 0;
            while (xStart < x.Length && x[xStart] == 0)
            {
                ++xStart;
            }

            int yStart = 0;
            while (yStart < y.Length && y[yStart] == 0)
            {
                ++yStart;
            }

            Debug.Assert(yStart < y.Length);

            int xyCmp = CompareNoLeadingZeroes(xStart, x, yStart, y);

            if (xyCmp > 0)
            {
                int yBitLength = CalcBitLength(1, yStart, y);
                int xBitLength = CalcBitLength(1, xStart, x);
                int shift = xBitLength - yBitLength;

                int[] c;
                int cStart = 0;
                int cBitLength = yBitLength;
                if (shift > 0)
                {
                    c = ShiftLeft(y, shift);
                    cBitLength += shift;
                    Debug.Assert(c[0] != 0);
                }
                else
                {
                    int len = y.Length - yStart;
                    c = new int[len];
                    Array.Copy(y, yStart, c, 0, len);
                }

                for (;;)
                {
                    if (cBitLength < xBitLength
                        || CompareNoLeadingZeroes(xStart, x, cStart, c) >= 0)
                    {
                        Subtract(xStart, x, cStart, c);

                        while (x[xStart] == 0)
                        {
                            if (++xStart == x.Length)
                                return x;
                        }

                        //xBitLength = CalcBitLength(xStart, x);
                        xBitLength = 32 * (x.Length - xStart - 1) + BitLen(x[xStart]);

                        if (xBitLength <= yBitLength)
                        {
                            if (xBitLength < yBitLength)
                                return x;

                            xyCmp = CompareNoLeadingZeroes(xStart, x, yStart, y);

                            if (xyCmp <= 0)
                                break;
                        }
                    }

                    shift = cBitLength - xBitLength;

                    // NB: The case where c[cStart] is 1-bit is harmless
                    if (shift == 1)
                    {
                        uint firstC = (uint) c[cStart] >> 1;
                        uint firstX = (uint) x[xStart];
                        if (firstC > firstX)
                            ++shift;
                    }

                    if (shift < 2)
                    {
                        ShiftRightOneInPlace(cStart, c);
                        --cBitLength;
                    }
                    else
                    {
                        ShiftRightInPlace(cStart, c, shift);
                        cBitLength -= shift;
                    }

                    //cStart = c.Length - ((cBitLength + 31) / 32);
                    while (c[cStart] == 0)
                    {
                        ++cStart;
                    }
                }
            }

            if (xyCmp == 0)
            {
                Array.Clear(x, xStart, x.Length - xStart);
            }

            return x;
        }

        public BigInteger Remainder(
            BigInteger n)
        {
            if (n.sign == 0)
                throw new ArithmeticException("Division by zero error");

            if (this.sign == 0)
                return Zero;

            // For small values, use fast remainder method
            if (n.magnitude.Length == 1)
            {
                int val = n.magnitude[0];

                if (val > 0)
                {
                    if (val == 1)
                        return Zero;

                    // TODO Make this func work on uint, and handle val == 1?
                    int rem = Remainder(val);

                    return rem == 0
                        ?	Zero
                        :	new BigInteger(sign, new int[]{ rem }, false);
                }
            }

            if (CompareNoLeadingZeroes(0, magnitude, 0, n.magnitude) < 0)
                return this;

            int[] result;
            if (n.QuickPow2Check())  // n is power of two
            {
                // TODO Move before small values branch above?
                result = LastNBits(n.Abs().BitLength - 1);
            }
            else
            {
                result = (int[]) this.magnitude.Clone();
                result = Remainder(result, n.magnitude);
            }

            return new BigInteger(sign, result, true);
        }

        private int[] LastNBits(
            int n)
        {
            if (n < 1)
                return ZeroMagnitude;

            int numWords = (n + BitsPerInt - 1) / BitsPerInt;
            numWords = System.Math.Min(numWords, this.magnitude.Length);
            int[] result = new int[numWords];

            Array.Copy(this.magnitude, this.magnitude.Length - numWords, result, 0, numWords);

            int excessBits = (numWords << 5) - n;
            if (excessBits > 0)
            {
                result[0] &= (int)(uint.MaxValue >> excessBits);
            }

            return result;
        }

        private BigInteger DivideWords(int w)
        {
            Debug.Assert(w >= 0);
            int n = magnitude.Length;
            if (w >= n)
                return Zero;
            int[] mag = new int[n - w];
            Array.Copy(magnitude, 0, mag, 0, n - w);
            return new BigInteger(sign, mag, false);
        }

        private BigInteger RemainderWords(int w)
        {
            Debug.Assert(w >= 0);
            int n = magnitude.Length;
            if (w >= n)
                return this;
            int[] mag = new int[w];
            Array.Copy(magnitude, n - w, mag, 0, w);
            return new BigInteger(sign, mag, false);
        }

        /**
         * do a left shift - this returns a new array.
         */
        private static int[] ShiftLeft(
            int[]	mag,
            int		n)
        {
            int nInts = (int)((uint)n >> 5);
            int nBits = n & 0x1f;
            int magLen = mag.Length;
            int[] newMag;

            if (nBits == 0)
            {
                newMag = new int[magLen + nInts];
                mag.CopyTo(newMag, 0);
            }
            else
            {
                int i = 0;
                int nBits2 = 32 - nBits;
                int highBits = (int)((uint)mag[0] >> nBits2);

                if (highBits != 0)
                {
                    newMag = new int[magLen + nInts + 1];
                    newMag[i++] = highBits;
                }
                else
                {
                    newMag = new int[magLen + nInts];
                }

                int m = mag[0];
                for (int j = 0; j < magLen - 1; j++)
                {
                    int next = mag[j + 1];

                    newMag[i++] = (m << nBits) | (int)((uint)next >> nBits2);
                    m = next;
                }

                newMag[i] = mag[magLen - 1] << nBits;
            }

            return newMag;
        }

        private static int ShiftLeftOneInPlace(int[] x, int carry)
        {
            Debug.Assert(carry == 0 || carry == 1);
            int pos = x.Length;
            while (--pos >= 0)
            {
                uint val = (uint)x[pos];
                x[pos] = (int)(val << 1) | carry;
                carry = (int)(val >> 31);
            }
            return carry;
        }

        public BigInteger ShiftLeft(
            int n)
        {
            if (sign == 0 || magnitude.Length == 0)
                return Zero;

            if (n == 0)
                return this;

            if (n < 0)
                return ShiftRight(-n);

            BigInteger result = new BigInteger(sign, ShiftLeft(magnitude, n), true);

            if (this.nBits != -1)
            {
                result.nBits = sign > 0
                    ?	this.nBits
                    :	this.nBits + n;
            }

            if (this.nBitLength != -1)
            {
                result.nBitLength = this.nBitLength + n;
            }

            return result;
        }

        /**
         * do a right shift - this does it in place.
         */
        private static void ShiftRightInPlace(
            int		start,
            int[]	mag,
            int		n)
        {
            int nInts = (int)((uint)n >> 5) + start;
            int nBits = n & 0x1f;
            int magEnd = mag.Length - 1;

            if (nInts != start)
            {
                int delta = (nInts - start);

                for (int i = magEnd; i >= nInts; i--)
                {
                    mag[i] = mag[i - delta];
                }
                for (int i = nInts - 1; i >= start; i--)
                {
                    mag[i] = 0;
                }
            }

            if (nBits != 0)
            {
                int nBits2 = 32 - nBits;
                int m = mag[magEnd];

                for (int i = magEnd; i > nInts; --i)
                {
                    int next = mag[i - 1];

                    mag[i] = (int)((uint)m >> nBits) | (next << nBits2);
                    m = next;
                }

                mag[nInts] = (int)((uint)mag[nInts] >> nBits);
            }
        }

        /**
         * do a right shift by one - this does it in place.
         */
        private static void ShiftRightOneInPlace(
            int		start,
            int[]	mag)
        {
            int i = mag.Length;
            int m = mag[i - 1];

            while (--i > start)
            {
                int next = mag[i - 1];
                mag[i] = ((int)((uint)m >> 1)) | (next << 31);
                m = next;
            }

            mag[start] = (int)((uint)mag[start] >> 1);
        }

        public BigInteger ShiftRight(
            int n)
        {
            if (n == 0)
                return this;

            if (n < 0)
                return ShiftLeft(-n);

            if (n >= BitLength)
                return (this.sign < 0 ? One.Negate() : Zero);

//			int[] res = (int[]) this.magnitude.Clone();
//
//			ShiftRightInPlace(0, res, n);
//
//			return new BigInteger(this.sign, res, true);

            int resultLength = (BitLength - n + 31) >> 5;
            int[] res = new int[resultLength];

            int numInts = n >> 5;
            int numBits = n & 31;

            if (numBits == 0)
            {
                Array.Copy(this.magnitude, 0, res, 0, res.Length);
            }
            else
            {
                int numBits2 = 32 - numBits;

                int magPos = this.magnitude.Length - 1 - numInts;
                for (int i = resultLength - 1; i >= 0; --i)
                {
                    res[i] = (int)((uint) this.magnitude[magPos--] >> numBits);

                    if (magPos >= 0)
                    {
                        res[i] |= this.magnitude[magPos] << numBits2;
                    }
                }
            }

            Debug.Assert(res[0] != 0);

            return new BigInteger(this.sign, res, false);
        }

        public int SignValue
        {
            get { return sign; }
        }

        /**
         * returns x = x - y - we assume x is >= y
         */
        private static int[] Subtract(
            int		xStart,
            int[]	x,
            int		yStart,
            int[]	y)
        {
            Debug.Assert(yStart < y.Length);
            Debug.Assert(x.Length - xStart >= y.Length - yStart);

            int iT = x.Length;
            int iV = y.Length;
            long m;
            int borrow = 0;

            do
            {
                m = (x[--iT] & IMASK) - (y[--iV] & IMASK) + borrow;
                x[iT] = (int) m;

//				borrow = (m < 0) ? -1 : 0;
                borrow = (int)(m >> 63);
            }
            while (iV > yStart);

            if (borrow != 0)
            {
                while (--x[--iT] == -1)
                {
                }
            }

            return x;
        }

        public BigInteger Subtract(
            BigInteger n)
        {
            if (n.sign == 0)
                return this;

            if (this.sign == 0)
                return n.Negate();

            if (this.sign != n.sign)
                return Add(n.Negate());

            int compare = CompareNoLeadingZeroes(0, magnitude, 0, n.magnitude);
            if (compare == 0)
                return Zero;

            BigInteger bigun, lilun;
            if (compare < 0)
            {
                bigun = n;
                lilun = this;
            }
            else
            {
                bigun = this;
                lilun = n;
            }

            return new BigInteger(this.sign * compare, doSubBigLil(bigun.magnitude, lilun.magnitude), true);
        }

        private static int[] doSubBigLil(
            int[]	bigMag,
            int[]	lilMag)
        {
            int[] res = (int[]) bigMag.Clone();

            return Subtract(0, res, 0, lilMag);
        }

        public byte[] ToByteArray()
        {
            return ToByteArray(false);
        }

        public byte[] ToByteArrayUnsigned()
        {
            return ToByteArray(true);
        }

        private byte[] ToByteArray(
            bool unsigned)
        {
            if (sign == 0)
                return unsigned ? ZeroEncoding : new byte[1];

            int nBits = (unsigned && sign > 0)
                ?	BitLength
                :	BitLength + 1;

            int nBytes = GetByteLength(nBits);
            byte[] bytes = new byte[nBytes];

            int magIndex = magnitude.Length;
            int bytesIndex = bytes.Length;

            if (sign > 0)
            {
                while (magIndex > 1)
                {
                    uint mag = (uint) magnitude[--magIndex];
                    bytes[--bytesIndex] = (byte) mag;
                    bytes[--bytesIndex] = (byte)(mag >> 8);
                    bytes[--bytesIndex] = (byte)(mag >> 16);
                    bytes[--bytesIndex] = (byte)(mag >> 24);
                }

                uint lastMag = (uint) magnitude[0];
                while (lastMag > byte.MaxValue)
                {
                    bytes[--bytesIndex] = (byte) lastMag;
                    lastMag >>= 8;
                }

                bytes[--bytesIndex] = (byte) lastMag;
            }
            else // sign < 0
            {
                bool carry = true;

                while (magIndex > 1)
                {
                    uint mag = ~((uint) magnitude[--magIndex]);

                    if (carry)
                    {
                        carry = (++mag == uint.MinValue);
                    }

                    bytes[--bytesIndex] = (byte) mag;
                    bytes[--bytesIndex] = (byte)(mag >> 8);
                    bytes[--bytesIndex] = (byte)(mag >> 16);
                    bytes[--bytesIndex] = (byte)(mag >> 24);
                }

                uint lastMag = (uint) magnitude[0];

                if (carry)
                {
                    // Never wraps because magnitude[0] != 0
                    --lastMag;
                }

                while (lastMag > byte.MaxValue)
                {
                    bytes[--bytesIndex] = (byte) ~lastMag;
                    lastMag >>= 8;
                }

                bytes[--bytesIndex] = (byte) ~lastMag;

                if (bytesIndex > 0)
                {
                    bytes[--bytesIndex] = byte.MaxValue;
                }
            }

            return bytes;
        }

        public override string ToString()
        {
            return ToString(10);
        }

        public string ToString(int radix)
        {
            // TODO Make this method work for other radices (ideally 2 <= radix <= 36 as in Java)

            switch (radix)
            {
                case 2:
                case 8:
                case 10:
                case 16:
                    break;
                default:
                    throw new FormatException("Only bases 2, 8, 10, 16 are allowed");
            }

            // NB: Can only happen to internally managed instances
            if (magnitude == null)
                return "null";

            if (sign == 0)
                return "0";


            // NOTE: This *should* be unnecessary, since the magnitude *should* never have leading zero digits
            int firstNonZero = 0;
            while (firstNonZero < magnitude.Length)
            {
                if (magnitude[firstNonZero] != 0)
                {
                    break;
                }
                ++firstNonZero;
            }

            if (firstNonZero == magnitude.Length)
            {
                return "0";
            }


            StringBuilder sb = new StringBuilder();
            if (sign == -1)
            {
                sb.Append('-');
            }

            switch (radix)
            {
            case 2:
            {
                int pos = firstNonZero;
                sb.Append(Convert.ToString(magnitude[pos], 2));
                while (++pos < magnitude.Length)
                {
                    AppendZeroExtendedString(sb, Convert.ToString(magnitude[pos], 2), 32);
                }
                break;
            }
            case 8:
            {
                int mask = (1 << 30) - 1;
                BigInteger u = this.Abs();
                int bits = u.BitLength;
                var S = new List<string>();
                while (bits > 30)
                {
                    S.Add(Convert.ToString(u.IntValue & mask, 8));
                    u = u.ShiftRight(30);
                    bits -= 30;
                }
                sb.Append(Convert.ToString(u.IntValue, 8));
                for (int i = S.Count - 1; i >= 0; --i)
                {
                    AppendZeroExtendedString(sb, S[i], 10);
                }
                break;
            }
            case 16:
            {
                int pos = firstNonZero;
                sb.Append(Convert.ToString(magnitude[pos], 16));
                while (++pos < magnitude.Length)
                {
                    AppendZeroExtendedString(sb, Convert.ToString(magnitude[pos], 16), 8);
                }
                break;
            }
            // TODO This could work for other radices if there is an alternative to Convert.ToString method
            //default:
            case 10:
            {
                BigInteger q = this.Abs();
                if (q.BitLength < 64)
                {
                    sb.Append(Convert.ToString(q.LongValue, radix));
                    break;
                }

                // TODO Could cache the moduli for each radix (soft reference?)
                var moduli = new List<BigInteger>();
                BigInteger R = ValueOf(radix);
                while (R.CompareTo(q) <= 0)
                {
                    moduli.Add(R);
                    R = R.Square();
                }

                int scale = moduli.Count;
                sb.EnsureCapacity(sb.Length + (1 << scale));

                ToString(sb, radix, moduli, scale, q);

                break;
            }
            }

            return sb.ToString();
        }

        private static void ToString(StringBuilder sb, int radix, IList<BigInteger> moduli, int scale, BigInteger pos)
        {
            if (pos.BitLength < 64)
            {
                string s = Convert.ToString(pos.LongValue, radix);
                if (sb.Length > 1 || (sb.Length == 1 && sb[0] != '-'))
                {
                    AppendZeroExtendedString(sb, s, 1 << scale);
                }
                else if (pos.SignValue != 0)
                {
                    sb.Append(s);
                }
                return;
            }

            BigInteger[] qr = pos.DivideAndRemainder(moduli[--scale]);

            ToString(sb, radix, moduli, scale, qr[0]);
            ToString(sb, radix, moduli, scale, qr[1]);
        }

        private static void AppendZeroExtendedString(StringBuilder sb, string s, int minLength)
        {
            for (int len = s.Length; len < minLength; ++len)
            {
                sb.Append('0');
            }
            sb.Append(s);
        }

        private static BigInteger CreateUValueOf(
            ulong value)
        {
            int msw = (int)(value >> 32);
            int lsw = (int)value;

            if (msw != 0)
                return new BigInteger(1, new int[] { msw, lsw }, false);

            if (lsw != 0)
            {
                BigInteger n = new BigInteger(1, new int[] { lsw }, false);
                // Check for a power of two
                if ((lsw & -lsw) == lsw)
                {
                    n.nBits = 1;
                }
                return n;
            }

            return Zero;
        }

        private static BigInteger CreateValueOf(
            long value)
        {
            if (value < 0)
            {
                if (value == long.MinValue)
                    return CreateValueOf(~value).Not();

                return CreateValueOf(-value).Negate();
            }

            return CreateUValueOf((ulong)value);
        }

        public static BigInteger ValueOf(
            long value)
        {
            if (value >= 0 && value < SMALL_CONSTANTS.Length)
            {
                return SMALL_CONSTANTS[value];
            }

            return CreateValueOf(value);
        }

        public int GetLowestSetBit()
        {
            if (this.sign == 0)
                return -1;

            return GetLowestSetBitMaskFirst(-1);
        }

        private int GetLowestSetBitMaskFirst(int firstWordMask)
        {
            int w = magnitude.Length, offset = 0;

            uint word = (uint)(magnitude[--w] & firstWordMask);
            Debug.Assert(magnitude[0] != 0);

            while (word == 0)
            {
                word = (uint)magnitude[--w];
                offset += 32;
            }

            while ((word & 0xFF) == 0)
            {
                word >>= 8;
                offset += 8;
            }

            while ((word & 1) == 0)
            {
                word >>= 1;
                ++offset;
            }

            return offset;
        }

        public bool TestBit(
            int n)
        {
            if (n < 0)
                throw new ArithmeticException("Bit position must not be negative");

            if (sign < 0)
                return !Not().TestBit(n);

            int wordNum = n / 32;
            if (wordNum >= magnitude.Length)
                return false;

            int word = magnitude[magnitude.Length - 1 - wordNum];
            return ((word >> (n % 32)) & 1) > 0;
        }

        public BigInteger Or(
            BigInteger value)
        {
            if (this.sign == 0)
                return value;

            if (value.sign == 0)
                return this;

            int[] aMag = this.sign > 0
                ? this.magnitude
                : Add(One).magnitude;

            int[] bMag = value.sign > 0
                ? value.magnitude
                : value.Add(One).magnitude;

            bool resultNeg = sign < 0 || value.sign < 0;
            int resultLength = System.Math.Max(aMag.Length, bMag.Length);
            int[] resultMag = new int[resultLength];

            int aStart = resultMag.Length - aMag.Length;
            int bStart = resultMag.Length - bMag.Length;

            for (int i = 0; i < resultMag.Length; ++i)
            {
                int aWord = i >= aStart ? aMag[i - aStart] : 0;
                int bWord = i >= bStart ? bMag[i - bStart] : 0;

                if (this.sign < 0)
                {
                    aWord = ~aWord;
                }

                if (value.sign < 0)
                {
                    bWord = ~bWord;
                }

                resultMag[i] = aWord | bWord;

                if (resultNeg)
                {
                    resultMag[i] = ~resultMag[i];
                }
            }

            BigInteger result = new BigInteger(1, resultMag, true);

            // TODO Optimise this case
            if (resultNeg)
            {
                result = result.Not();
            }

            return result;
        }

        public BigInteger Xor(
            BigInteger value)
        {
            if (this.sign == 0)
                return value;

            if (value.sign == 0)
                return this;

            int[] aMag = this.sign > 0
                ? this.magnitude
                : Add(One).magnitude;

            int[] bMag = value.sign > 0
                ? value.magnitude
                : value.Add(One).magnitude;

            // TODO Can just replace with sign != value.sign?
            bool resultNeg = (sign < 0 && value.sign >= 0) || (sign >= 0 && value.sign < 0);
            int resultLength = System.Math.Max(aMag.Length, bMag.Length);
            int[] resultMag = new int[resultLength];

            int aStart = resultMag.Length - aMag.Length;
            int bStart = resultMag.Length - bMag.Length;

            for (int i = 0; i < resultMag.Length; ++i)
            {
                int aWord = i >= aStart ? aMag[i - aStart] : 0;
                int bWord = i >= bStart ? bMag[i - bStart] : 0;

                if (this.sign < 0)
                {
                    aWord = ~aWord;
                }

                if (value.sign < 0)
                {
                    bWord = ~bWord;
                }

                resultMag[i] = aWord ^ bWord;

                if (resultNeg)
                {
                    resultMag[i] = ~resultMag[i];
                }
            }

            BigInteger result = new BigInteger(1, resultMag, true);

            // TODO Optimise this case
            if (resultNeg)
            {
                result = result.Not();
            }

            return result;
        }

        public BigInteger SetBit(
            int n)
        {
            if (n < 0)
                throw new ArithmeticException("Bit address less than zero");

            if (TestBit(n))
                return this;

            // TODO Handle negative values and zero
            if (sign > 0 && n < (BitLength - 1))
                return FlipExistingBit(n);

            return Or(One.ShiftLeft(n));
        }

        public BigInteger ClearBit(
            int n)
        {
            if (n < 0)
                throw new ArithmeticException("Bit address less than zero");

            if (!TestBit(n))
                return this;

            // TODO Handle negative values
            if (sign > 0 && n < (BitLength - 1))
                return FlipExistingBit(n);

            return AndNot(One.ShiftLeft(n));
        }

        public BigInteger FlipBit(
            int n)
        {
            if (n < 0)
                throw new ArithmeticException("Bit address less than zero");

            // TODO Handle negative values and zero
            if (sign > 0 && n < (BitLength - 1))
                return FlipExistingBit(n);

            return Xor(One.ShiftLeft(n));
        }

        private BigInteger FlipExistingBit(
            int n)
        {
            Debug.Assert(sign > 0);
            Debug.Assert(n >= 0);
            Debug.Assert(n < BitLength - 1);

            int[] mag = (int[]) this.magnitude.Clone();
            mag[mag.Length - 1 - (n >> 5)] ^= (1 << (n & 31)); // Flip bit
            //mag[mag.Length - 1 - (n / 32)] ^= (1 << (n % 32));
            return new BigInteger(this.sign, mag, false);
        }
    }
}
