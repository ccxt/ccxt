using System;

using Org.BouncyCastle.Crypto.Digests;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Encodings
{
    /**
    * Optimal Asymmetric Encryption Padding (OAEP) - see PKCS 1 V 2.
    */
    public class OaepEncoding
        : IAsymmetricBlockCipher
    {
        private byte[] defHash;
        private IDigest mgf1Hash;

        private IAsymmetricBlockCipher engine;
        private SecureRandom random;
        private bool forEncryption;

        public OaepEncoding(
            IAsymmetricBlockCipher cipher)
            : this(cipher, new Sha1Digest(), null)
        {
        }

        public OaepEncoding(
            IAsymmetricBlockCipher	cipher,
            IDigest					hash)
            : this(cipher, hash, null)
        {
        }

        public OaepEncoding(
            IAsymmetricBlockCipher	cipher,
            IDigest					hash,
            byte[]					encodingParams)
            : this(cipher, hash, hash, encodingParams)
        {
        }

        public OaepEncoding(
            IAsymmetricBlockCipher	cipher,
            IDigest					hash,
            IDigest					mgf1Hash,
            byte[]					encodingParams)
        {
            this.engine = cipher;
            this.mgf1Hash = mgf1Hash;
            this.defHash = new byte[hash.GetDigestSize()];

            hash.Reset();

            if (encodingParams != null)
            {
                hash.BlockUpdate(encodingParams, 0, encodingParams.Length);
            }

            hash.DoFinal(defHash, 0);
        }

        public string AlgorithmName => engine.AlgorithmName + "/OAEPPadding";

        public IAsymmetricBlockCipher UnderlyingCipher => engine;

        public void Init(bool forEncryption, ICipherParameters parameters)
        {
            if (parameters is ParametersWithRandom withRandom)
            {
                this.random = withRandom.Random;
            }
            else
            {
                this.random = new SecureRandom();
            }

            engine.Init(forEncryption, parameters);

            this.forEncryption = forEncryption;
        }

        public int GetInputBlockSize()
        {
            int baseBlockSize = engine.GetInputBlockSize();

            if (forEncryption)
            {
                return baseBlockSize - 1 - 2 * defHash.Length;
            }
            else
            {
                return baseBlockSize;
            }
        }

        public int GetOutputBlockSize()
        {
            int baseBlockSize = engine.GetOutputBlockSize();

            if (forEncryption)
            {
                return baseBlockSize;
            }
            else
            {
                return baseBlockSize - 1 - 2 * defHash.Length;
            }
        }

        public byte[] ProcessBlock(
            byte[]	inBytes,
            int		inOff,
            int		inLen)
        {
            if (forEncryption)
            {
                return EncodeBlock(inBytes, inOff, inLen);
            }
            else
            {
                return DecodeBlock(inBytes, inOff, inLen);
            }
        }

        private byte[] EncodeBlock(
            byte[]	inBytes,
            int		inOff,
            int		inLen)
        {
            Check.DataLength(inLen > GetInputBlockSize(), "input data too long");

            byte[] block = new byte[GetInputBlockSize() + 1 + 2 * defHash.Length];

            //
            // copy in the message
            //
            Array.Copy(inBytes, inOff, block, block.Length - inLen, inLen);

            //
            // add sentinel
            //
            block[block.Length - inLen - 1] = 0x01;

            //
            // as the block is already zeroed - there's no need to add PS (the >= 0 pad of 0)
            //

            //
            // add the hash of the encoding params.
            //
            Array.Copy(defHash, 0, block, defHash.Length, defHash.Length);

            //
            // generate the seed.
            //
            byte[] seed = SecureRandom.GetNextBytes(random, defHash.Length);

            //
            // mask the message block.
            //
            byte[] mask = MaskGeneratorFunction(seed, 0, seed.Length, block.Length - defHash.Length);

            for (int i = defHash.Length; i != block.Length; i++)
            {
                block[i] ^= mask[i - defHash.Length];
            }

            //
            // add in the seed
            //
            Array.Copy(seed, 0, block, 0, defHash.Length);

            //
            // mask the seed.
            //
            mask = MaskGeneratorFunction(
                block, defHash.Length, block.Length - defHash.Length, defHash.Length);

            for (int i = 0; i != defHash.Length; i++)
            {
                block[i] ^= mask[i];
            }

            return engine.ProcessBlock(block, 0, block.Length);
        }

        /**
        * @exception InvalidCipherTextException if the decrypted block turns out to
        * be badly formatted.
        */
        private byte[] DecodeBlock(
            byte[]	inBytes,
            int		inOff,
            int		inLen)
        {
            byte[] data = engine.ProcessBlock(inBytes, inOff, inLen);
            byte[] block = new byte[engine.GetOutputBlockSize()];

            //
            // as we may have zeros in our leading bytes for the block we produced
            // on encryption, we need to make sure our decrypted block comes back
            // the same size.
            //
            // i.e. wrong when block.length < (2 * defHash.length) + 1
            int wrongMask = (block.Length - ((2 * defHash.Length) + 1)) >> 31;

            if (data.Length <= block.Length)
            {
                Array.Copy(data, 0, block, block.Length - data.Length, data.Length);
            }
            else
            {
                Array.Copy(data, 0, block, 0, block.Length);
                wrongMask |= 1;
            }

            //
            // unmask the seed.
            //
            byte[] mask = MaskGeneratorFunction(
                block, defHash.Length, block.Length - defHash.Length, defHash.Length);

            for (int i = 0; i != defHash.Length; i++)
            {
                block[i] ^= mask[i];
            }

            //
            // unmask the message block.
            //
            mask = MaskGeneratorFunction(block, 0, defHash.Length, block.Length - defHash.Length);

            for (int i = defHash.Length; i != block.Length; i++)
            {
                block[i] ^= mask[i - defHash.Length];
            }

            //
            // check the hash of the encoding params.
            // long check to try to avoid this been a source of a timing attack.
            //
            for (int i = 0; i != defHash.Length; i++)
            {
                wrongMask |= defHash[i] ^ block[defHash.Length + i];
            }

            //
            // find the data block
            //
            int start = -1;

            for (int index = 2 * defHash.Length; index != block.Length; index++)
            {
                int octet = block[index];

                // i.e. mask will be 0xFFFFFFFF if octet is non-zero and start is (still) negative, else 0.
                int shouldSetMask = (-octet & start) >> 31;

                start += index & shouldSetMask;
            }

            wrongMask |= start >> 31;
            ++start;
            wrongMask |= block[start] ^ 1;

            if (wrongMask != 0)
            {
                Arrays.Fill(block, 0);
                throw new InvalidCipherTextException("data wrong");
            }

            ++start;

            //
            // extract the data block
            //
            byte[] output = new byte[block.Length - start];

            Array.Copy(block, start, output, 0, output.Length);
            Array.Clear(block, 0, block.Length);

            return output;
        }

        private byte[] MaskGeneratorFunction(
            byte[] Z,
            int zOff,
            int zLen,
            int length)
        {
            if (mgf1Hash is IXof)
            {
                byte[] mask = new byte[length];
                mgf1Hash.BlockUpdate(Z, zOff, zLen);
                ((IXof)mgf1Hash).DoFinal(mask, 0, mask.Length);

                return mask;
            }
            else
            {
                return MaskGeneratorFunction1(Z, zOff, zLen, length);
            }
        }

        /**
        * mask generator function, as described in PKCS1v2.
        */
        private byte[] MaskGeneratorFunction1(
            byte[]	Z,
            int		zOff,
            int		zLen,
            int		length)
        {
            byte[] mask = new byte[length];
            byte[] hashBuf = new byte[mgf1Hash.GetDigestSize()];
            byte[] C = new byte[4];
            int counter = 0;

            mgf1Hash.Reset();

            while (counter < (length / hashBuf.Length))
            {
                Pack.UInt32_To_BE((uint)counter, C);

                mgf1Hash.BlockUpdate(Z, zOff, zLen);
                mgf1Hash.BlockUpdate(C, 0, C.Length);
                mgf1Hash.DoFinal(hashBuf, 0);

                Array.Copy(hashBuf, 0, mask, counter * hashBuf.Length, hashBuf.Length);

                counter++;
            }

            if ((counter * hashBuf.Length) < length)
            {
                Pack.UInt32_To_BE((uint)counter, C);

                mgf1Hash.BlockUpdate(Z, zOff, zLen);
                mgf1Hash.BlockUpdate(C, 0, C.Length);
                mgf1Hash.DoFinal(hashBuf, 0);

                Array.Copy(hashBuf, 0, mask, counter * hashBuf.Length, mask.Length - (counter * hashBuf.Length));
            }

            return mask;
        }
    }
}

