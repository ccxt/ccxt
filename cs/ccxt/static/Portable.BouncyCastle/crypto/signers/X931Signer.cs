using System;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Signers
{
    /**
     * X9.31-1998 - signing using a hash.
     * <p>
     * The message digest hash, H, is encapsulated to form a byte string as follows
     * </p>
     * <pre>
     * EB = 06 || PS || 0xBA || H || TRAILER
     * </pre>
     * where PS is a string of bytes all of value 0xBB of length such that |EB|=|n|, and TRAILER is the ISO/IEC 10118 part numberâ€  for the digest. The byte string, EB, is converted to an integer value, the message representative, f.
     */
    public class X931Signer
        :   ISigner
    {
        private IDigest                     digest;
        private IAsymmetricBlockCipher      cipher;
        private RsaKeyParameters            kParam;

        private int         trailer;
        private int         keyBits;
        private byte[]      block;

        /**
         * Generate a signer with either implicit or explicit trailers for X9.31.
         *
         * @param cipher base cipher to use for signature creation/verification
         * @param digest digest to use.
         * @param implicit whether or not the trailer is implicit or gives the hash.
         */
        public X931Signer(IAsymmetricBlockCipher cipher, IDigest digest, bool isImplicit)
        {
            this.cipher = cipher;
            this.digest = digest;

            if (isImplicit)
            {
                trailer = IsoTrailers.TRAILER_IMPLICIT;
            }
            else if (IsoTrailers.NoTrailerAvailable(digest))
            {
                throw new ArgumentException("no valid trailer", "digest");
            }
            else
            {
                trailer = IsoTrailers.GetTrailer(digest);
            }
        }

        public virtual string AlgorithmName
        {
            get { return digest.AlgorithmName + "with" + cipher.AlgorithmName + "/X9.31"; }
        }

        /**
         * Constructor for a signer with an explicit digest trailer.
         *
         * @param cipher cipher to use.
         * @param digest digest to sign with.
         */
        public X931Signer(IAsymmetricBlockCipher cipher, IDigest digest)
            :   this(cipher, digest, false)
        {
        }

        public virtual void Init(bool forSigning, ICipherParameters parameters)
        {
            kParam = (RsaKeyParameters)parameters;

            cipher.Init(forSigning, kParam);

            keyBits = kParam.Modulus.BitLength;

            block = new byte[(keyBits + 7) / 8];

            Reset();
        }

        /// <summary> clear possible sensitive data</summary>
        private void ClearBlock(byte[] block)
        {
            Array.Clear(block, 0, block.Length);
        }

        public virtual void Update(byte b)
        {
            digest.Update(b);
        }

        public virtual void BlockUpdate(byte[] input, int inOff, int inLen)
        {
            digest.BlockUpdate(input, inOff, inLen);
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual void BlockUpdate(ReadOnlySpan<byte> input)
        {
            digest.BlockUpdate(input);
        }
#endif

        public virtual void Reset()
        {
            digest.Reset();
        }

        public virtual byte[] GenerateSignature()
        {
            CreateSignatureBlock();

            BigInteger t = new BigInteger(1, cipher.ProcessBlock(block, 0, block.Length));
            ClearBlock(block);

            t = t.Min(kParam.Modulus.Subtract(t));

            int size = BigIntegers.GetUnsignedByteLength(kParam.Modulus);
            return BigIntegers.AsUnsignedByteArray(size, t);
        }

        private void CreateSignatureBlock()
        {
            int digSize = digest.GetDigestSize();

            int delta;
            if (trailer == IsoTrailers.TRAILER_IMPLICIT)
            {
                delta = block.Length - digSize - 1;
                digest.DoFinal(block, delta);
                block[block.Length - 1] = (byte)IsoTrailers.TRAILER_IMPLICIT;
            }
            else
            {
                delta = block.Length - digSize - 2;
                digest.DoFinal(block, delta);
                block[block.Length - 2] = (byte)(trailer >> 8);
                block[block.Length - 1] = (byte)trailer;
            }

            block[0] = 0x6b;
            for (int i = delta - 2; i != 0; i--)
            {
                block[i] = (byte)0xbb;
            }
            block[delta - 1] = (byte)0xba;
        }

        public virtual bool VerifySignature(byte[] signature)
        {
            try
            {
                block = cipher.ProcessBlock(signature, 0, signature.Length);
            }
            catch (Exception)
            {
                return false;
            }

            BigInteger t = new BigInteger(1, block);
            BigInteger f;

            if ((t.IntValue & 15) == 12)
            {
                 f = t;
            }
            else
            {
                t = kParam.Modulus.Subtract(t);
                if ((t.IntValue & 15) == 12)
                {
                     f = t;
                }
                else
                {
                    return false;
                }
            }

            CreateSignatureBlock();

            byte[] fBlock = BigIntegers.AsUnsignedByteArray(block.Length, f);

            bool rv = Arrays.ConstantTimeAreEqual(block, fBlock);

            ClearBlock(block);
            ClearBlock(fBlock);

            return rv;
        }
    }
}
