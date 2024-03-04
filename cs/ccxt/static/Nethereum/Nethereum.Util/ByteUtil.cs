// using Nethereum.RLP;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;
using System.Text;

namespace Nethereum.Util
{
    public static class ByteUtil
    {
        public static readonly byte[] EMPTY_BYTE_ARRAY = new byte[0];
        public static readonly byte[] ZERO_BYTE_ARRAY = { 0 };

        /// <summary>
        ///     Creates a copy of bytes and appends b to the end of it
        /// </summary>
        public static byte[] AppendByte(byte[] bytes, byte b)
        {
            var result = new byte[bytes.Length + 1];
            Array.Copy(bytes, result, bytes.Length);
            result[result.Length - 1] = b;
            return result;
        }

        public static byte[] Slice(this byte[] org,
            int start, int end = int.MaxValue)
        {
            if (end < 0)
                end = org.Length + end;
            start = Math.Max(0, start);
            end = Math.Max(start, end);

            return org.Skip(start).Take(end - start).ToArray();
        }

        public static byte[] InitialiseEmptyByteArray(int length)
        {
            var returnArray = new byte[length];
            for (var i = 0; i < length; i++)
                returnArray[i] = 0x00;
            return returnArray;
        }

        public static IEnumerable<byte> MergeToEnum(params byte[][] arrays)
        {
            foreach (var a in arrays)
                foreach (var b in a)
                    yield return b;
        }

        /// <param name="arrays"> - arrays to merge </param>
        /// <returns> - merged array </returns>
        public static byte[] Merge(params byte[][] arrays)
        {
            return MergeToEnum(arrays).ToArray();
        }

        public static byte[] XOR(this byte[] a, byte[] b)
        {
            var length = Math.Min(a.Length, b.Length);
            var result = new byte[length];
            for (var i = 0; i < length; i++)
                result[i] = (byte)(a[i] ^ b[i]);
            return result;
        }
        public static byte[] PadTo32Bytes(this byte[] bytesToPad)
        {
            if (bytesToPad.Length >= 32) return bytesToPad;
            return PadBytes(bytesToPad, 32);
        }

        public static byte[] PadTo128Bytes(this byte[] bytesToPad)
        {
            if (bytesToPad.Length >= 128) return bytesToPad;
            return PadBytes(bytesToPad, 128);
        }

        public static byte[] PadBytes(this byte[] bytesToPad, int numberOfBytes)
        {
            var ret = new byte[numberOfBytes];

            for (var i = 0; i < ret.Length; i++)
                ret[i] = 0;
            Array.Copy(bytesToPad, 0, ret, numberOfBytes - bytesToPad.Length, bytesToPad.Length);

            return ret;
        }

        public static byte[] ShiftLeft(this byte[] value, int shift)
        {
            //#if NETCOREAPP2_0_OR_GREATER

            //                        var bitArray = new BitArray(value);
            //                        var returnByteArray = new byte[value.Length];
            //                        bitArray.LeftShift(shift);
            //                        bitArray.CopyTo(returnByteArray, 0);
            //                        return returnByteArray;
            //#else
            byte[] newValue = new byte[value.Length];
            byte overflow = 0x00;

            for (int i = value.Length - 1; i >= 0; i--)
            {
                int byteEndPosition = (i * 8) - shift + 7;
                int resultBytePosition = byteEndPosition / 8;

                if (byteEndPosition >= 0)
                {
                    newValue[resultBytePosition] = (byte)(value[i] << (shift % 8));
                    newValue[resultBytePosition] |= overflow;
                    overflow = (byte)(((value[i] << (shift % 8)) & 0xFF00) >> 8);
                }
            }

            return newValue;
            //#endif
        }


        public static byte[] ShiftRight(this byte[] value, int shift)
        {
            //#if NETCOREAPP2_0_OR_GREATER

            //                        var bitArray = new BitArray(value);
            //                        var returnByteArray = new byte[value.Length];
            //                        bitArray.RightShift(shift);
            //                        bitArray.CopyTo(returnByteArray, 0);
            //                        return returnByteArray;
            //#else
            byte[] newValue = new byte[value.Length];
            byte overflow = 0x00;

            for (int i = 0; i < value.Length; i++)
            {
                int byteStartPosition = (i * 8) + shift;
                int resultBytePosition = byteStartPosition / 8;

                if (resultBytePosition < value.Length)
                {
                    newValue[resultBytePosition] = (byte)(value[i] >> (shift % 8));
                    newValue[resultBytePosition] |= overflow;
                    overflow = (byte)((value[i] << (8 - (shift % 8))) & 0xFF);
                }
            }

            return newValue;
            //#endif
        }
    }


    public class ByteArrayComparer : IComparer<byte[]>, IEqualityComparer<byte[]>
    {
        public readonly static ByteArrayComparer Current = new ByteArrayComparer();

        public int Compare(byte[] x, byte[] y)
        {
            if (x == null && y == null) return 0;
            if (x == null) return -1;
            if (y == null) return 1;

            int result;
            int min = Math.Min(x.Length, y.Length);
            for (int index = 0; index < min; index++)
            {
                result = x[index].CompareTo(y[index]);
                if (result != 0) return result;
            }
            return x.Count().CompareTo(y.Count());
        }

        public bool Equals(byte[] x, byte[] y)
        {
            return Compare(x, y) == 0;
        }

        public int GetHashCode(byte[] obj)
        {
            return new BigInteger(obj).GetHashCode();
        }
    }

    public class ByteListComparer : IComparer<IList<byte>>
    {
        public readonly static ByteListComparer Current = new ByteListComparer();

        public int Compare(IList<byte> x, IList<byte> y)
        {
            if (x == null && y == null) return 0;
            if (x == null) return -1;
            if (y == null) return 1;

            int result;
            int min = Math.Min(x.Count, y.Count);
            for (int index = 0; index < min; index++)
            {
                result = x[index].CompareTo(y[index]);
                if (result != 0) return result;
            }
            return x.Count().CompareTo(y.Count());
        }
    }
}