using System;

namespace Cryptography.ECDSA
{
    public static class Ripemd160Manager
    {
        private const uint H0 = 0x67452301;
        private const uint H1 = 0xEFCDAB89;
        private const uint H2 = 0x98BADCFE;
        private const uint H3 = 0x10325476;
        private const uint H4 = 0xC3D2E1F0;

        private static readonly uint[] K =
        {
            0x00000000,
            0x5A827999,
            0x6ED9EBA1,
            0x8F1BBCDC,
            0xA953FD4E,
        };

        private static readonly uint[] K1 =
        {
            0x50A28BE6,
            0x5C4DD124,
            0x6D703EF3,
            0x7A6D76E9,
            0x00000000
        };

        private static readonly byte[] R =
        {
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
            7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
            3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
            1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2,
            4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13
        };

        private static readonly byte[] R1 =
        {
            5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
            6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
            15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
            8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14,
            12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11
        };

        private static readonly byte[] S =
        {
            11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
            7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
            11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
            11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
            9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6
        };

        private static readonly byte[] S1 =
        {
            8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
            9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
            9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
            15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
            8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11
        };

        public static byte[] GetHash(byte[] data)
        {
            var addLen = 72;
            var curLen = data.Length % 64;

            if (curLen > 56)
                addLen = 128 - curLen;
            else if (curLen < 56)
                addLen = 64 - curLen;

            var buf = new UInt32[(data.Length + addLen) / 4];

            Buffer.BlockCopy(data, 0, buf, 0, data.Length);
            buf[data.Length / 4] |= (uint)1 << 8 * (data.Length % 4) + 7;

            buf[buf.Length - 2] = (uint)data.Length << 3;
            buf[buf.Length - 1] = (uint)data.Length >> 29;

            return DoHash(buf);
        }

        private static byte[] DoHash(uint[] x)
        {
            var h0 = H0;
            var h1 = H1;
            var h2 = H2;
            var h3 = H3;
            var h4 = H4;

            for (var i = 0; i < x.Length / 16; i++)
            {
                var a = h0; var a1 = h0;
                var b = h1; var b1 = h1;
                var c = h2; var c1 = h2;
                var d = h3; var d1 = h3;
                var e = h4; var e1 = h4;

                uint t;
                for (var j = 0; j < 80; j++)
                {
                    var index = j / 16;
                    var rj = R[j];
                    var kj = K[index];
                    var xi = x[i * 16 + rj];
                    var s = S[j];

                    t = Rol(a + F(index, b, c, d) + xi + kj, s) + e;
                    a = e;
                    e = d;
                    d = Rol(c, 10);
                    c = b;
                    b = t;

                    var index1 = 4 - index;
                    var rj1 = R1[j];
                    var kj1 = K1[index];
                    var xi1 = x[i * 16 + rj1];
                    var s1 = S1[j];

                    t = Rol(a1 + F(index1, b1, c1, d1) + xi1 + kj1, s1) + e1;
                    a1 = e1;
                    e1 = d1;
                    d1 = Rol(c1, 10);
                    c1 = b1;
                    b1 = t;
                }
                t = h1 + c + d1;
                h1 = h2 + d + e1;
                h2 = h3 + e + a1;
                h3 = h4 + a + b1;
                h4 = h0 + b + c1;
                h0 = t;
            }

            var rez = new byte[20];
            var buf = BitConverter.GetBytes(h0);
            Buffer.BlockCopy(buf, 0, rez, 0, 4);
            buf = BitConverter.GetBytes(h1);
            Buffer.BlockCopy(buf, 0, rez, 4, 4);
            buf = BitConverter.GetBytes(h2);
            Buffer.BlockCopy(buf, 0, rez, 8, 4);
            buf = BitConverter.GetBytes(h3);
            Buffer.BlockCopy(buf, 0, rez, 12, 4);
            buf = BitConverter.GetBytes(h4);
            Buffer.BlockCopy(buf, 0, rez, 16, 4);

            return rez;
        }

        private static uint F(int j, uint x, uint y, uint z)
        {
            switch (j)
            {
                case 0:
                    return x ^ y ^ z;
                case 1:
                    return (x & y) | (~x & z);
                case 2:
                    return (x | ~y) ^ z;
                case 3:
                    return (x & z) | (y & ~z);
                case 4:
                    return x ^ (y | ~z);
                default:
                    throw new ArgumentException(nameof(j));

            }
        }

        private static uint Rol(uint value, byte shift)
        {
            return value << shift | value >> (32 - shift);
        }
    }
}
