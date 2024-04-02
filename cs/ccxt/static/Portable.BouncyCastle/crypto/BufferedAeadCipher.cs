using System;

using Org.BouncyCastle.Crypto.Modes;
using Org.BouncyCastle.Crypto.Parameters;

namespace Org.BouncyCastle.Crypto
{
    /**
    * The AEAD ciphers already handle buffering internally, so this class
    * just takes care of implementing IBufferedCipher methods.
    */
    public class BufferedAeadCipher
        : BufferedCipherBase
    {
        private readonly IAeadCipher cipher;

        public BufferedAeadCipher(IAeadCipher cipher)
        {
            if (cipher == null)
                throw new ArgumentNullException("cipher");

            this.cipher = cipher;
        }

        public override string AlgorithmName
        {
            get { return cipher.AlgorithmName; }
        }

        /**
        * initialise the cipher.
        *
        * @param forEncryption if true the cipher is initialised for
        *  encryption, if false for decryption.
        * @param param the key and other data required by the cipher.
        * @exception ArgumentException if the parameters argument is
        * inappropriate.
        */
        public override void Init(
            bool forEncryption,
            ICipherParameters parameters)
        {
            if (parameters is ParametersWithRandom)
            {
                parameters = ((ParametersWithRandom)parameters).Parameters;
            }

            cipher.Init(forEncryption, parameters);
        }

        /**
        * return the blocksize for the underlying cipher.
        *
        * @return the blocksize for the underlying cipher.
        */
        public override int GetBlockSize()
        {
            return 0;
        }

        /**
        * return the size of the output buffer required for an update
        * an input of len bytes.
        *
        * @param len the length of the input.
        * @return the space required to accommodate a call to update
        * with len bytes of input.
        */
        public override int GetUpdateOutputSize(
            int length)
        {
            return cipher.GetUpdateOutputSize(length);
        }

        /**
        * return the size of the output buffer required for an update plus a
        * doFinal with an input of len bytes.
        *
        * @param len the length of the input.
        * @return the space required to accommodate a call to update and doFinal
        * with len bytes of input.
        */
        public override int GetOutputSize(
            int length)
        {
            return cipher.GetOutputSize(length);
        }

        /**
        * process a single byte, producing an output block if necessary.
        *
        * @param in the input byte.
        * @param out the space for any output that might be produced.
        * @param outOff the offset from which the output will be copied.
        * @return the number of output bytes copied to out.
        * @exception DataLengthException if there isn't enough space in out.
        * @exception InvalidOperationException if the cipher isn't initialised.
        */
        public override int ProcessByte(byte input, byte[] output, int outOff)
        {
            return cipher.ProcessByte(input, output, outOff);
        }

        public override byte[] ProcessByte(
            byte input)
        {
            int outLength = GetUpdateOutputSize(1);

            byte[] outBytes = outLength > 0 ? new byte[outLength] : null;

            int pos = ProcessByte(input, outBytes, 0);

            if (outLength > 0 && pos < outLength)
            {
                byte[] tmp = new byte[pos];
                Array.Copy(outBytes, 0, tmp, 0, pos);
                outBytes = tmp;
            }

            return outBytes;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public override int ProcessByte(byte input, Span<byte> output)
        {
            return cipher.ProcessByte(input, output);
        }
#endif

        public override byte[] ProcessBytes(
            byte[] input,
            int inOff,
            int length)
        {
            if (input == null)
                throw new ArgumentNullException("input");
            if (length < 1)
                return null;

            int outLength = GetUpdateOutputSize(length);

            byte[] outBytes = outLength > 0 ? new byte[outLength] : null;

            int pos = ProcessBytes(input, inOff, length, outBytes, 0);

            if (outLength > 0 && pos < outLength)
            {
                byte[] tmp = new byte[pos];
                Array.Copy(outBytes, 0, tmp, 0, pos);
                outBytes = tmp;
            }

            return outBytes;
        }

        /**
        * process an array of bytes, producing output if necessary.
        *
        * @param in the input byte array.
        * @param inOff the offset at which the input data starts.
        * @param len the number of bytes to be copied out of the input array.
        * @param out the space for any output that might be produced.
        * @param outOff the offset from which the output will be copied.
        * @return the number of output bytes copied to out.
        * @exception DataLengthException if there isn't enough space in out.
        * @exception InvalidOperationException if the cipher isn't initialised.
        */
        public override int ProcessBytes(
            byte[] input,
            int inOff,
            int length,
            byte[] output,
            int outOff)
        {
            return cipher.ProcessBytes(input, inOff, length, output, outOff);
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public override int ProcessBytes(ReadOnlySpan<byte> input, Span<byte> output)
        {
            return cipher.ProcessBytes(input, output);
        }
#endif

        public override byte[] DoFinal()
        {
            byte[] outBytes = new byte[GetOutputSize(0)];

            int pos = DoFinal(outBytes, 0);

            if (pos < outBytes.Length)
            {
                byte[] tmp = new byte[pos];
                Array.Copy(outBytes, 0, tmp, 0, pos);
                outBytes = tmp;
            }

            return outBytes;
        }

        public override byte[] DoFinal(
            byte[] input,
            int inOff,
            int inLen)
        {
            if (input == null)
                throw new ArgumentNullException("input");

            byte[] outBytes = new byte[GetOutputSize(inLen)];

            int pos = (inLen > 0)
                ? ProcessBytes(input, inOff, inLen, outBytes, 0)
                : 0;

            pos += DoFinal(outBytes, pos);

            if (pos < outBytes.Length)
            {
                byte[] tmp = new byte[pos];
                Array.Copy(outBytes, 0, tmp, 0, pos);
                outBytes = tmp;
            }

            return outBytes;
        }

        /**
        * Process the last block in the buffer.
        *
        * @param out the array the block currently being held is copied into.
        * @param outOff the offset at which the copying starts.
        * @return the number of output bytes copied to out.
        * @exception DataLengthException if there is insufficient space in out for
        * the output, or the input is not block size aligned and should be.
        * @exception InvalidOperationException if the underlying cipher is not
        * initialised.
        * @exception InvalidCipherTextException if padding is expected and not found.
        * @exception DataLengthException if the input is not block size
        * aligned.
        */
        public override int DoFinal(
            byte[] output,
            int outOff)
        {
            return cipher.DoFinal(output, outOff);
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public override int DoFinal(Span<byte> output)
        {
            return cipher.DoFinal(output);
        }

        public override int DoFinal(ReadOnlySpan<byte> input, Span<byte> output)
        {
            int len = cipher.ProcessBytes(input, output);
            len += cipher.DoFinal(output[len..]);
            return len;
        }
#endif

        /**
        * Reset the buffer and cipher. After resetting the object is in the same
        * state as it was after the last init (if there was one).
        */
        public override void Reset()
        {
            cipher.Reset();
        }
    }
}
