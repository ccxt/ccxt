using System;
using Org.BouncyCastle.Crypto;

namespace Org.BouncyCastle.Pqc.Crypto.Lms
{
    public class SeedDerive
    {
        private byte[] I;
        private byte[] masterSeed;
        private IDigest digest;
        private int q;
        private int j;


        public SeedDerive(byte[] I, byte[] masterSeed, IDigest digest)
        {
            this.I = I;
            this.masterSeed = masterSeed;
            this.digest = digest;
        }

        public int GetQ()
        {
            return q;
        }

        public void SetQ(int q)
        {
            this.q = q;
        }

        public int GetJ()
        {
            return j;
        }

        public void SetJ(int j)
        {
            this.j = j;
        }

        public byte[] GetI()
        {
            return I;
        }

        public byte[] GetMasterSeed()
        {
            return masterSeed;
        }


        public byte[] DeriveSeed(byte[] target, int offset)
        {
            if (target.Length < digest.GetDigestSize())
            {
                throw new ArgumentException("target length is less than digest size.");
            }

            digest.BlockUpdate(I, 0, I.Length);
            digest.Update((byte)(q >> 24));
            digest.Update((byte)(q >> 16));
            digest.Update((byte)(q >> 8));
            digest.Update((byte)(q));

            digest.Update((byte)(j >> 8));
            digest.Update((byte)(j));
            digest.Update((byte)0xFF);
            digest.BlockUpdate(masterSeed, 0, masterSeed.Length);

            digest.DoFinal(target, offset); // Digest resets here.

            return target;
        }

        public void deriveSeed(byte[] target, bool incJ)
        {
            deriveSeed(target, incJ, 0);
        }


        public void deriveSeed(byte[] target, bool incJ, int offset)
        {

            DeriveSeed(target, offset);

            if (incJ)
            {
                j++;
            }

        }
    }
}