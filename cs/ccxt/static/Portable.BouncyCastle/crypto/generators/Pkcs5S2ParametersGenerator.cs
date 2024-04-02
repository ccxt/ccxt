using System;

using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Digests;
using Org.BouncyCastle.Crypto.Macs;
using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Crypto.Generators
{
    /**
    * Generator for Pbe derived keys and ivs as defined by Pkcs 5 V2.0 Scheme 2.
    * This generator uses a SHA-1 HMac as the calculation function.
    * <p>
    * The document this implementation is based on can be found at
    * <a href="http://www.rsasecurity.com/rsalabs/pkcs/pkcs-5/index.html">
    * RSA's Pkcs5 Page</a></p>
    */
    public class Pkcs5S2ParametersGenerator
        : PbeParametersGenerator
    {
        private readonly IMac hMac;
        private readonly byte[] state;

        /**
        * construct a Pkcs5 Scheme 2 Parameters generator.
        */
        public Pkcs5S2ParametersGenerator()
            : this(new Sha1Digest())
        {
        }

        public Pkcs5S2ParametersGenerator(IDigest digest)
        {
            this.hMac = new HMac(digest);
            this.state = new byte[hMac.GetMacSize()];
        }

        private void F(
            byte[]  S,
            int     c,
            byte[]  iBuf,
            byte[]  outBytes,
            int     outOff)
        {
            if (c == 0)
                throw new ArgumentException("iteration count must be at least 1.");

            if (S != null)
            {
                hMac.BlockUpdate(S, 0, S.Length);
            }

            hMac.BlockUpdate(iBuf, 0, iBuf.Length);
            hMac.DoFinal(state, 0);

            Array.Copy(state, 0, outBytes, outOff, state.Length);

            for (int count = 1; count < c; ++count)
            {
                hMac.BlockUpdate(state, 0, state.Length);
                hMac.DoFinal(state, 0);

                for (int j = 0; j < state.Length; ++j)
                {
                    outBytes[outOff + j] ^= state[j];
                }
            }
        }

        private byte[] GenerateDerivedKey(
            int dkLen)
        {
            int     hLen = hMac.GetMacSize();
            int     l = (dkLen + hLen - 1) / hLen;
            byte[]  iBuf = new byte[4];
            byte[]  outBytes = new byte[l * hLen];
            int     outPos = 0;

            ICipherParameters param = new KeyParameter(mPassword);

            hMac.Init(param);

            for (int i = 1; i <= l; i++)
            {
                // Increment the value in 'iBuf'
                int pos = 3;
                while (++iBuf[pos] == 0)
                {
                    --pos;
                }

                F(mSalt, mIterationCount, iBuf, outBytes, outPos);
                outPos += hLen;
            }

            return outBytes;
        }

        public override ICipherParameters GenerateDerivedParameters(
            string	algorithm,
            int		keySize)
        {
            keySize /= 8;

            byte[] dKey = GenerateDerivedKey(keySize);

            return ParameterUtilities.CreateKeyParameter(algorithm, dKey, 0, keySize);
        }

        public override ICipherParameters GenerateDerivedParameters(
            string	algorithm,
            int		keySize,
            int		ivSize)
        {
            keySize /= 8;
            ivSize /= 8;

            byte[] dKey = GenerateDerivedKey(keySize + ivSize);
            KeyParameter key = ParameterUtilities.CreateKeyParameter(algorithm, dKey, 0, keySize);

            return new ParametersWithIV(key, dKey, keySize, ivSize);
        }

        /**
        * Generate a key parameter for use with a MAC derived from the password,
        * salt, and iteration count we are currently initialised with.
        *
        * @param keySize the size of the key we want (in bits)
        * @return a KeyParameter object.
        */
        public override ICipherParameters GenerateDerivedMacParameters(
            int keySize)
        {
            keySize /= 8;

            byte[] dKey = GenerateDerivedKey(keySize);

            return new KeyParameter(dKey, 0, keySize);
        }
    }
}
