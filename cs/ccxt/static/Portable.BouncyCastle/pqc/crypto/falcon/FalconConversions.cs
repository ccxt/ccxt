using System;

namespace Org.BouncyCastle.Pqc.Crypto.Falcon
{
    class FalconConversions
    {
        internal FalconConversions(){}

        internal byte[] int_to_bytes(int x)
        {
            byte[] res = new byte[4];
            res[0] = (byte)(x >> 0);
            res[1] = (byte)(x >> 8);
            res[2] = (byte)(x >> 16);
            res[3] = (byte)(x >> 24);
            return res;
        }
        internal uint bytes_to_uint(byte[] src, int pos)
        {
            uint acc = 0;
            acc =   ((uint)src[pos + 0]) << 0 |
                    ((uint)src[pos + 1]) << 8 |
                    ((uint)src[pos + 2]) << 16 |
                    ((uint)src[pos + 3]) << 24;
            return acc;
        }

        internal byte[] ulong_to_bytes(ulong x)
        {
            byte[] res = new byte[8];
            res[0] = (byte)(x >> 0);
            res[1] = (byte)(x >> 8);
            res[2] = (byte)(x >> 16);
            res[3] = (byte)(x >> 24);
            res[4] = (byte)(x >> 32);
            res[5] = (byte)(x >> 40);
            res[6] = (byte)(x >> 48);
            res[7] = (byte)(x >> 56);
            return res;
        }

        internal ulong bytes_to_ulong(byte[] src, int pos)
        {
            ulong acc = 0;
            acc = ((ulong)src[pos + 0]) << 0 |
                ((ulong)src[pos + 1]) << 8 |
                ((ulong)src[pos + 2]) << 16 |
                ((ulong)src[pos + 3]) << 24 |
                ((ulong)src[pos + 4]) << 32 |
                ((ulong)src[pos + 5]) << 40 |
                ((ulong)src[pos + 6]) << 48 |
                ((ulong)src[pos + 7]) << 56;
            return acc;
        }

        internal uint[] bytes_to_uint_array(byte[] src, int pos, int num)
        {
            uint[] res = new uint[num];
            for (int i = 0; i < num; i++)
            {
                res[i] = bytes_to_uint(src, pos + (4 * i));
            }
            return res;
        }
    }
}
