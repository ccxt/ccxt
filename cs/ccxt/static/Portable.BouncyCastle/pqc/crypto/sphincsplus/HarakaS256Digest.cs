using System;

namespace Org.BouncyCastle.Pqc.Crypto.SphincsPlus
{
    internal class HarakaS256Digest
        : HarakaSBase
    {
        public HarakaS256Digest(HarakaSXof harakaSXof)
        {
            haraka256_rc = harakaSXof.haraka256_rc;
        }

        public String GetAlgorithmName()
        {
            return "HarakaS-256";
        }

        public int GetDigestSize()
        {
            return 32;
        }

        public void BlockUpdate(byte input)
        {
            if (off + 1 > 32)
            {
                throw new ArgumentException("total input cannot be more than 32 bytes");
            }

            buffer[off++] = input;
        }

        public void BlockUpdate(byte[] input, int inOff, int len)
        {
            if (off + len > 32)
            {
                throw new ArgumentException("total input cannot be more than 32 bytes");
            }

            Array.Copy(input, inOff, buffer, off, len);
            off += len;
        }

        public int DoFinal(byte[] output, int outOff)
        {
            byte[] s = new byte[64];
            Haraka256Perm(s);
            Array.Copy(s, 0, output, outOff, output.Length - outOff);

            Reset();

            return output.Length;
        }

    }

}