using System;

using Org.BouncyCastle.Crypto.Modes;
using Org.BouncyCastle.Crypto.Paddings;
using Org.BouncyCastle.Crypto.Parameters;

namespace Org.BouncyCastle.Crypto.Macs
{
    /**
    * CMAC - as specified at www.nuee.nagoya-u.ac.jp/labs/tiwata/omac/omac.html
    * <p>
    * CMAC is analogous to OMAC1 - see also en.wikipedia.org/wiki/CMAC
    * </p><p>
    * CMAC is a NIST recomendation - see 
    * csrc.nist.gov/CryptoToolkit/modes/800-38_Series_Publications/SP800-38B.pdf
    * </p><p>
    * CMAC/OMAC1 is a blockcipher-based message authentication code designed and
    * analyzed by Tetsu Iwata and Kaoru Kurosawa.
    * </p><p>
    * CMAC/OMAC1 is a simple variant of the CBC MAC (Cipher Block Chaining Message 
    * Authentication Code). OMAC stands for One-Key CBC MAC.
    * </p><p>
    * It supports 128- or 64-bits block ciphers, with any key size, and returns
    * a MAC with dimension less or equal to the block size of the underlying 
    * cipher.
    * </p>
    */
    public class CMac
        : IMac
    {
        private const byte CONSTANT_128 = (byte)0x87;
        private const byte CONSTANT_64 = (byte)0x1b;

        private byte[] ZEROES;

        private byte[] mac;

        private byte[] buf;
        private int bufOff;
        private IBlockCipherMode m_cipherMode;

        private int macSize;

        private byte[] L, Lu, Lu2;

        /**
        * create a standard MAC based on a CBC block cipher (64 or 128 bit block).
        * This will produce an authentication code the length of the block size
        * of the cipher.
        *
        * @param cipher the cipher to be used as the basis of the MAC generation.
        */
        public CMac(
            IBlockCipher cipher)
            : this(cipher, cipher.GetBlockSize() * 8)
        {
        }

        /**
        * create a standard MAC based on a block cipher with the size of the
        * MAC been given in bits.
        * <p/>
        * Note: the size of the MAC must be at least 24 bits (FIPS Publication 81),
        * or 16 bits if being used as a data authenticator (FIPS Publication 113),
        * and in general should be less than the size of the block cipher as it reduces
        * the chance of an exhaustive attack (see Handbook of Applied Cryptography).
        *
        * @param cipher        the cipher to be used as the basis of the MAC generation.
        * @param macSizeInBits the size of the MAC in bits, must be a multiple of 8 and @lt;= 128.
        */
        public CMac(
            IBlockCipher	cipher,
            int				macSizeInBits)
        {
            if ((macSizeInBits % 8) != 0)
                throw new ArgumentException("MAC size must be multiple of 8");

            if (macSizeInBits > (cipher.GetBlockSize() * 8))
            {
                throw new ArgumentException(
                    "MAC size must be less or equal to "
                        + (cipher.GetBlockSize() * 8));
            }

            if (cipher.GetBlockSize() != 8 && cipher.GetBlockSize() != 16)
            {
                throw new ArgumentException(
                    "Block size must be either 64 or 128 bits");
            }

            m_cipherMode = new CbcBlockCipher(cipher);
            this.macSize = macSizeInBits / 8;

            mac = new byte[cipher.GetBlockSize()];

            buf = new byte[cipher.GetBlockSize()];

            ZEROES = new byte[cipher.GetBlockSize()];

            bufOff = 0;
        }

        public string AlgorithmName
        {
            get { return m_cipherMode.AlgorithmName; }
        }

        private static int ShiftLeft(byte[] block, byte[] output)
        {
            int i = block.Length;
            uint bit = 0;
            while (--i >= 0)
            {
                uint b = block[i];
                output[i] = (byte)((b << 1) | bit);
                bit = (b >> 7) & 1;
            }
            return (int)bit;
        }

        private static byte[] DoubleLu(byte[] input)
        {
            byte[] ret = new byte[input.Length];
            int carry = ShiftLeft(input, ret);
            int xor = input.Length == 16 ? CONSTANT_128 : CONSTANT_64;

            /*
             * NOTE: This construction is an attempt at a constant-time implementation.
             */
            ret[input.Length - 1] ^= (byte)(xor >> ((1 - carry) << 3));

            return ret;
        }

        public void Init(ICipherParameters parameters)
        {
            if (parameters is KeyParameter)
            {
                m_cipherMode.Init(true, parameters);

                //initializes the L, Lu, Lu2 numbers
                L = new byte[ZEROES.Length];
                m_cipherMode.ProcessBlock(ZEROES, 0, L, 0);
                Lu = DoubleLu(L);
                Lu2 = DoubleLu(Lu);
            }
            else if (parameters != null)
            {
                // CMAC mode does not permit IV to underlying CBC mode
                throw new ArgumentException("CMac mode only permits key to be set.", "parameters");
            }

            Reset();
        }

        public int GetMacSize()
        {
            return macSize;
        }

        public void Update(byte input)
        {
            if (bufOff == buf.Length)
            {
                m_cipherMode.ProcessBlock(buf, 0, mac, 0);
                bufOff = 0;
            }

            buf[bufOff++] = input;
        }

        public void BlockUpdate(byte[] inBytes, int inOff, int len)
        {
            if (len < 0)
                throw new ArgumentException("Can't have a negative input length!");

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
            BlockUpdate(inBytes.AsSpan(inOff, len));
#else
            int blockSize = m_cipherMode.GetBlockSize();
            int gapLen = blockSize - bufOff;

            if (len > gapLen)
            {
                Array.Copy(inBytes, inOff, buf, bufOff, gapLen);

                m_cipherMode.ProcessBlock(buf, 0, mac, 0);

                bufOff = 0;
                len -= gapLen;
                inOff += gapLen;

                while (len > blockSize)
                {
                    m_cipherMode.ProcessBlock(inBytes, inOff, mac, 0);

                    len -= blockSize;
                    inOff += blockSize;
                }
            }

            Array.Copy(inBytes, inOff, buf, bufOff, len);

            bufOff += len;
#endif
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public void BlockUpdate(ReadOnlySpan<byte> input)
        {
            int blockSize = m_cipherMode.GetBlockSize();
            int gapLen = blockSize - bufOff;

            if (input.Length > gapLen)
            {
                input[..gapLen].CopyTo(buf.AsSpan(bufOff));

                m_cipherMode.ProcessBlock(buf, mac);

                bufOff = 0;
                input = input[gapLen..];

                while (input.Length > blockSize)
                {
                    m_cipherMode.ProcessBlock(input, mac);
                    input = input[blockSize..];
                }
            }

            input.CopyTo(buf.AsSpan(bufOff));

            bufOff += input.Length;
        }
#endif

        public int DoFinal(byte[] outBytes, int outOff)
        {
#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
            return DoFinal(outBytes.AsSpan(outOff));
#else
            int blockSize = m_cipherMode.GetBlockSize();

            byte[] lu;
            if (bufOff == blockSize)
            {
                lu = Lu;
            }
            else
            {
                new ISO7816d4Padding().AddPadding(buf, bufOff);
                lu = Lu2;
            }

            for (int i = 0; i < mac.Length; i++)
            {
                buf[i] ^= lu[i];
            }

            m_cipherMode.ProcessBlock(buf, 0, mac, 0);

            Array.Copy(mac, 0, outBytes, outOff, macSize);

            Reset();

            return macSize;
#endif
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public int DoFinal(Span<byte> output)
        {
            int blockSize = m_cipherMode.GetBlockSize();

            byte[] lu;
            if (bufOff == blockSize)
            {
                lu = Lu;
            }
            else
            {
                new ISO7816d4Padding().AddPadding(buf, bufOff);
                lu = Lu2;
            }

            for (int i = 0; i < mac.Length; i++)
            {
                buf[i] ^= lu[i];
            }

            m_cipherMode.ProcessBlock(buf, mac);

            mac.AsSpan(0, macSize).CopyTo(output);

            Reset();

            return macSize;
        }
#endif

        /**
        * Reset the mac generator.
        */
        public void Reset()
        {
            /*
            * clean the buffer.
            */
            Array.Clear(buf, 0, buf.Length);
            bufOff = 0;

            /*
            * Reset the underlying cipher.
            */
            m_cipherMode.Reset();
        }
    }
}
