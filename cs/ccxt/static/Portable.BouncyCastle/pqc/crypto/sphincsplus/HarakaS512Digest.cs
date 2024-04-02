using System;

namespace Org.BouncyCastle.Pqc.Crypto.SphincsPlus
{
    /**
    * Haraka-512 v2, https://eprint.iacr.org/2016/098.pdf
    * <p>
    * Haraka512-256 with reference to Python Reference Impl from: https://github.com/sphincs/sphincsplus
    * </p>
    */
    internal class HarakaS512Digest
        : HarakaSBase
    {
        public HarakaS512Digest(HarakaSBase harakaSBase)
        {
            haraka512_rc = harakaSBase.haraka512_rc;
        }

        public String GetAlgorithmName()
        {
            return "HarakaS-512";
        }

        public int GetDigestSize()
        {
            return 64;
        }

        public void BlockUpdate(byte input)
        {
            if (off + 1 > 64)
            {
                throw new ArgumentException("total input cannot be more than 64 bytes");
            }
            buffer[off++] = input;
        }

        public void BlockUpdate(byte[] input, int inOff, int len)
        {
            if (off + len > 64)
            {
                throw new ArgumentException("total input cannot be more than 64 bytes");
            }
            Array.Copy(input, inOff, buffer, off, len);
            off += len;
        }

        public int DoFinal(byte[] output, int outOff)
        {
            byte[] s = new byte[64];
            Haraka512Perm(s);
            for (int i = 0; i < 64; ++i)
            {
                s[i] ^= buffer[i];
            }
            Array.Copy(s, 8, output, outOff, 8);
            Array.Copy(s, 24, output, outOff + 8, 8);
            Array.Copy(s, 32, output, outOff + 16, 8);
            Array.Copy(s, 48, output, outOff + 24, 8);

            Reset();

            return s.Length;
        }
    }
}