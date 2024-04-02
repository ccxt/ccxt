
using System;

namespace Org.BouncyCastle.Pqc.Crypto.Crystals.Kyber
{
    internal static class CBD
    {
        public static void Eta(Poly r, byte[] bytes, int eta)
        {
            int i, j;
            uint t, d;
            short a, b;

            switch (eta)
            {
                case 2:
                    for (i = 0; i < KyberEngine.N / 8; i++)
                    {
                        t = LittleEndianToUInt32(bytes, 4 * i);
                        d = t & 0x55555555;
                        d += (t >> 1) & 0x55555555;
                        for (j = 0; j < 8; j++)
                        {
                            a = (short)((d >> (4 * j + 0)) & 0x3);
                            b = (short)((d >> (4 * j + eta)) & 0x3);
                            r.Coeffs[8 * i + j] = (short) (a - b);
                        }
                    }
                    break;
                case 3:
                    for (i = 0; i < KyberEngine.N / 4; i++)
                    {
                        t = LittleEndianToUInt24(bytes, 3 * i);
                        d = t & 0x00249249;
                        d += (t >> 1) & 0x00249249;
                        d += (t >> 2) & 0x00249249;

                        for (j = 0; j < 4; j++)
                        {
                            a = (short)((d >> (6 * j + 0)) & 0x7);
                            b = (short)((d >> (6 * j + 3)) & 0x7);
                            r.Coeffs[4 * i + j] = (short)(a - b);
                        }
                    }
                    break;
                default:
                    throw new ArgumentException("Wrong Eta");
            }
        }

        private static uint LittleEndianToUInt24(byte[] x, int offset)
        {
            // Refer to convertByteTo32-BitUnsignedInt for explanation
            uint r = (uint) (x[offset] & 0xFF);
            r = r | ((uint)(x[offset + 1] & 0xFF) << 8);
            r = r | ((uint)(x[offset + 2] & 0xFF) << 16);
            return r;
        }

        private static uint LittleEndianToUInt32(byte[] x, int offset)
        {
            // Convert first byte to an unsigned integer 
            // byte x & 0xFF allows us to grab the last 8 bits
            uint r = (uint)(x[offset] & 0xFF);

            // Perform the same operation then left bit shift to store the next 8 bits without
            // altering the previous bits
            r = r | ((uint)(x[offset + 1] & 0xFF) << 8);
            r = r | ((uint)(x[offset + 2] & 0xFF) << 16);
            r = r | ((uint)(x[offset + 3] & 0xFF) << 24);
            return r;
        }


    }
}
