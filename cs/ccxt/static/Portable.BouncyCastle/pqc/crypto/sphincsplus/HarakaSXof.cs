using System;

namespace Org.BouncyCastle.Pqc.Crypto.SphincsPlus
{
    internal class HarakaSXof
        : HarakaSBase
    {
        public String GetAlgorithmName()
        {
            return "Haraka-S";
        }

        public HarakaSXof(byte[] pkSeed)
        {
            byte[] buf = new byte[640];
            BlockUpdate(pkSeed, 0, pkSeed.Length);
            DoFinal(buf, 0, buf.Length);
            haraka512_rc = new ulong[10][];
            haraka256_rc = new uint[10][];
            for (int i = 0; i < 10; ++i)
            {
                haraka512_rc[i] = new ulong[8];
                haraka256_rc[i] = new uint[8];
                InterleaveConstant32(haraka256_rc[i], buf, i << 5);
                InterleaveConstant(haraka512_rc[i], buf, i << 6);
            }
        }

        public void BlockUpdate(byte[] input, int inOff, int len)
        {
            int i = inOff, j, loop = (len + off) >> 5;
            for (j = 0; j < loop; ++j)
            {
                while (off < 32)
                {
                    buffer[off++] ^= input[i++];
                }
                Haraka512Perm(buffer);
                off = 0;
            }
            while (i < inOff + len)
            {
                buffer[off++] ^= input[i++];
            }
        }

        public void BlockUpdate(byte input)
        {
            buffer[off++] ^= input;
            if (off == 32)
            {
                Haraka512Perm(buffer);
                off = 0;
            }
        }

        public int DoFinal(byte[] output, int outOff, int len)
        {
            int outLen = len;
            //Finalize
            buffer[off] ^= 0x1F;
            buffer[31] ^= 128;
            off = 0;
            //Squeeze
            while (len > 0)
            {
                Haraka512Perm(buffer);
                int i = 0;
                while (i < 32 && i + outOff < output.Length)
                {
                    output[i + outOff] = buffer[i];
                    i++;
                }
                outOff += i;
                len -= i;
            }
            if (len != 0)
            {
                byte[] d = new byte[64];
                Haraka512Perm(d);
                Array.Copy(d, 0, output, outOff, -len);
            }
            Reset();
            return outLen;
        }
    }
}
