using System;
using System.IO;
using System.Text;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Modes
{
    public class KCcmBlockCipher
        : IAeadBlockCipher
    {
        private static readonly int BYTES_IN_INT = 4;
        private static readonly int BITS_IN_BYTE = 8;

        private static readonly int MAX_MAC_BIT_LENGTH = 512;
        private static readonly int MIN_MAC_BIT_LENGTH = 64;

        private IBlockCipher engine;

        private int macSize;
        private bool forEncryption;

        private byte[] initialAssociatedText;
        private byte[] mac;
        private byte[] macBlock;

        private byte[] nonce;

        private byte[] G1;
        private byte[] buffer;

        private byte[] s;
        private byte[] counter;

        private readonly MemoryStream associatedText = new MemoryStream();
        private readonly MemoryStream data = new MemoryStream();

        /*
        *  
        *
        */
        private int Nb_ = 4;

        private void setNb(int Nb)
        {
            if (Nb == 4 || Nb == 6 || Nb == 8)
            {
                Nb_ = Nb;
            }
            else
            {
                throw new ArgumentException("Nb = 4 is recommended by DSTU7624 but can be changed to only 6 or 8 in this implementation");
            }
        }

        /// <summary>
        /// Base constructor. Nb value is set to 4.
        /// </summary>
        /// <param name="engine">base cipher to use under CCM.</param>
        public KCcmBlockCipher(IBlockCipher engine): this(engine, 4)
        {
        }

        /// <summary>
        /// Constructor allowing Nb configuration.
        /// 
        /// Nb is a parameter specified in CCM mode of DSTU7624 standard.
        /// This parameter specifies maximum possible length of input.It should
        /// be calculated as follows: Nb = 1 / 8 * (-3 + log[2]Nmax) + 1,
        /// where Nmax - length of input message in bits.For practical reasons
        /// Nmax usually less than 4Gb, e.g. for Nmax = 2^32 - 1, Nb = 4.
        /// </summary>
        /// <param name="engine">base cipher to use under CCM.</param>
        /// <param name="Nb">Nb value to use.</param>
        public KCcmBlockCipher(IBlockCipher engine, int Nb)
        {
            this.engine = engine;
            this.macSize = engine.GetBlockSize();
            this.nonce = new byte[engine.GetBlockSize()];
            this.initialAssociatedText = new byte[engine.GetBlockSize()];
            this.mac = new byte[engine.GetBlockSize()];
            this.macBlock = new byte[engine.GetBlockSize()];
            this.G1 = new byte[engine.GetBlockSize()];
            this.buffer = new byte[engine.GetBlockSize()];
            this.s = new byte[engine.GetBlockSize()];
            this.counter = new byte[engine.GetBlockSize()];
            setNb(Nb);
        }

        public virtual void Init(bool forEncryption, ICipherParameters parameters)
        {

                ICipherParameters cipherParameters;
            if (parameters is AeadParameters)
            {

                    AeadParameters param = (AeadParameters)parameters;

                    if (param.MacSize > MAX_MAC_BIT_LENGTH || param.MacSize < MIN_MAC_BIT_LENGTH || param.MacSize % 8 != 0)
                    {
                        throw new ArgumentException("Invalid mac size specified");
                    }

                    nonce = param.GetNonce();
                    macSize = param.MacSize / BITS_IN_BYTE;
                    initialAssociatedText = param.GetAssociatedText();
                    cipherParameters = param.Key;
            }
            else if (parameters is ParametersWithIV)
            {
                    nonce = ((ParametersWithIV)parameters).GetIV();
                    macSize = engine.GetBlockSize(); // use default blockSize for MAC if it is not specified
                    initialAssociatedText = null;
                    cipherParameters = ((ParametersWithIV)parameters).Parameters;
            }
            else
            {
                    throw new ArgumentException("Invalid parameters specified");
            }

            this.mac = new byte[macSize];
            this.forEncryption = forEncryption;
            engine.Init(true, cipherParameters);

            counter[0] = 0x01; // defined in standard

            if (initialAssociatedText != null)
            {
                ProcessAadBytes(initialAssociatedText, 0, initialAssociatedText.Length);
            }
        }

        public virtual string AlgorithmName => engine.AlgorithmName + "/KCCM";

        public virtual int GetBlockSize()
        {
            return engine.GetBlockSize();
        }

        public virtual IBlockCipher UnderlyingCipher => engine;

        public virtual void ProcessAadByte(byte input)
        {
            associatedText.WriteByte(input);
        }

        public virtual void ProcessAadBytes(byte[] input, int inOff, int len)
        {
            associatedText.Write(input, inOff, len);
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual void ProcessAadBytes(ReadOnlySpan<byte> input)
        {
            associatedText.Write(input);
        }
#endif

        private void ProcessAAD(byte[] assocText, int assocOff, int assocLen, int dataLen)
        {
            if (assocLen - assocOff < engine.GetBlockSize())
            {
                throw new ArgumentException("authText buffer too short");
            }
            if (assocLen % engine.GetBlockSize() != 0)
            {
                throw new ArgumentException("padding not supported");
            }

            Array.Copy(nonce, 0, G1, 0, nonce.Length - Nb_ - 1);

            intToBytes(dataLen, buffer, 0); // for G1

            Array.Copy(buffer, 0, G1, nonce.Length - Nb_ - 1, BYTES_IN_INT);

            G1[G1.Length - 1] = getFlag(true, macSize);

            engine.ProcessBlock(G1, 0, macBlock, 0);

            intToBytes(assocLen, buffer, 0); // for G2

            if (assocLen <= engine.GetBlockSize() - Nb_)
            {
                for (int byteIndex = 0; byteIndex < assocLen; byteIndex++)
                {
                    buffer[byteIndex + Nb_] ^= assocText[assocOff + byteIndex];
                }

                for (int byteIndex = 0; byteIndex < engine.GetBlockSize(); byteIndex++)
                {
                    macBlock[byteIndex] ^= buffer[byteIndex];
                }

                engine.ProcessBlock(macBlock, 0, macBlock, 0);

                return;
            }

            for (int byteIndex = 0; byteIndex < engine.GetBlockSize(); byteIndex++)
            {
                macBlock[byteIndex] ^= buffer[byteIndex];
            }

            engine.ProcessBlock(macBlock, 0, macBlock, 0);

            int authLen = assocLen;
            while (authLen != 0)
            {
                for (int byteIndex = 0; byteIndex < engine.GetBlockSize(); byteIndex++)
                {
                    macBlock[byteIndex] ^= assocText[byteIndex + assocOff];
                }

                engine.ProcessBlock(macBlock, 0, macBlock, 0);

                assocOff += engine.GetBlockSize();
                authLen -= engine.GetBlockSize();
            }
        }

        public virtual int ProcessByte(byte input, byte[] output, int outOff)
        {
            data.WriteByte(input);

            return 0;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual int ProcessByte(byte input, Span<byte> output)
        {
            data.WriteByte(input);

            return 0;
        }
#endif

        public virtual int ProcessBytes(byte[] input, int inOff, int inLen, byte[] output, int outOff)
        {
            Check.DataLength(input, inOff, inLen, "input buffer too short");

            data.Write(input, inOff, inLen);

            return 0;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual int ProcessBytes(ReadOnlySpan<byte> input, Span<byte> output)
        {
            data.Write(input);

            return 0;
        }
#endif

        public int ProcessPacket(byte[] input, int inOff, int len, byte[] output, int outOff)
        {
            Check.DataLength(input, inOff, len, "input buffer too short");
            Check.OutputLength(output, outOff, len, "output buffer too short");

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
            return ProcessPacket(input.AsSpan(inOff, len), output.AsSpan(outOff));
#else
            if (associatedText.Length > 0)
            {
                byte[] aad = associatedText.GetBuffer();
                int aadLen = Convert.ToInt32(associatedText.Length);

                int dataLen = Convert.ToInt32(data.Length) - (forEncryption ? 0 : macSize);

                ProcessAAD(aad, 0, aadLen, dataLen);
            }

            if (forEncryption)
            {
                Check.DataLength(len % engine.GetBlockSize() != 0, "partial blocks not supported");

                CalculateMac(input, inOff, len);
                engine.ProcessBlock(nonce, 0, s, 0);

                int totalLength = len;
                while (totalLength > 0)
                {
                    ProcessBlock(input, inOff, output, outOff);
                    totalLength -= engine.GetBlockSize();
                    inOff += engine.GetBlockSize();
                    outOff += engine.GetBlockSize();
                }

                for (int byteIndex = 0; byteIndex<counter.Length; byteIndex++)
                {
                    s[byteIndex] += counter[byteIndex];
                }

                engine.ProcessBlock(s, 0, buffer, 0);

                for (int byteIndex = 0; byteIndex<macSize; byteIndex++)
                {
                    output[outOff + byteIndex] = (byte)(buffer[byteIndex] ^ macBlock[byteIndex]);
                }

                Array.Copy(macBlock, 0, mac, 0, macSize);

                Reset();

                return len + macSize;
            }
            else
            {
                Check.DataLength((len - macSize) % engine.GetBlockSize() != 0, "partial blocks not supported");

                engine.ProcessBlock(nonce, 0, s, 0);

                int blocks = len / engine.GetBlockSize();

                for (int blockNum = 0; blockNum<blocks; blockNum++)
                {
                    ProcessBlock(input, inOff, output, outOff);

                    inOff += engine.GetBlockSize();
                    outOff += engine.GetBlockSize();
                }

                if (len > inOff)
                {
                    for (int byteIndex = 0; byteIndex<counter.Length; byteIndex++)
                    {
                        s[byteIndex] += counter[byteIndex];
                    }

                    engine.ProcessBlock(s, 0, buffer, 0);

                    for (int byteIndex = 0; byteIndex<macSize; byteIndex++)
                    {
                        output[outOff + byteIndex] = (byte)(buffer[byteIndex] ^ input[inOff + byteIndex]);
                    }
                    outOff += macSize;
                }

                for (int byteIndex = 0; byteIndex<counter.Length; byteIndex++)
                {
                    s[byteIndex] += counter[byteIndex];
                }

                engine.ProcessBlock(s, 0, buffer, 0);

                Array.Copy(output, outOff - macSize, buffer, 0, macSize);

                CalculateMac(output, 0, outOff - macSize);

                Array.Copy(macBlock, 0, mac, 0, macSize);

                byte[] calculatedMac = new byte[macSize];

                Array.Copy(buffer, 0, calculatedMac, 0, macSize);

                if (!Arrays.ConstantTimeAreEqual(mac, calculatedMac))
                {
                    throw new InvalidCipherTextException("mac check failed");
                }

                Reset();

                return len - macSize;
            }
#endif
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public int ProcessPacket(ReadOnlySpan<byte> input, Span<byte> output)
        {
            int len = input.Length;
            Check.OutputLength(output, len, "output buffer too short");

            if (associatedText.Length > 0)
            {
                byte[] aad = associatedText.GetBuffer();
                int aadLen = Convert.ToInt32(associatedText.Length);

                int dataLen = Convert.ToInt32(data.Length) - (forEncryption ? 0 : macSize);

                ProcessAAD(aad, 0, aadLen, dataLen);
            }

            int blockSize = engine.GetBlockSize(), index = 0;
            if (forEncryption)
            {
                Check.DataLength(len % blockSize != 0, "partial blocks not supported");

                CalculateMac(input);
                engine.ProcessBlock(nonce, s);

                int totalLength = len;
                while (totalLength > 0)
                {
                    ProcessBlock(input[index..], output[index..]);
                    totalLength -= blockSize;
                    index += blockSize;
                }

                for (int byteIndex = 0; byteIndex < counter.Length; byteIndex++)
                {
                    s[byteIndex] += counter[byteIndex];
                }

                engine.ProcessBlock(s, buffer);

                for (int byteIndex = 0; byteIndex < macSize; byteIndex++)
                {
                    output[index + byteIndex] = (byte)(buffer[byteIndex] ^ macBlock[byteIndex]);
                }

                Array.Copy(macBlock, 0, mac, 0, macSize);

                Reset();

                return len + macSize;
            }
            else
            {
                Check.DataLength((len - macSize) % blockSize != 0, "partial blocks not supported");

                engine.ProcessBlock(nonce, 0, s, 0);

                int blocks = len / engine.GetBlockSize();

                for (int blockNum = 0; blockNum < blocks; blockNum++)
                {
                    ProcessBlock(input[index..], output[index..]);
                    index += blockSize;
                }

                if (len > index)
                {
                    for (int byteIndex = 0; byteIndex < counter.Length; byteIndex++)
                    {
                        s[byteIndex] += counter[byteIndex];
                    }

                    engine.ProcessBlock(s, buffer);

                    for (int byteIndex = 0; byteIndex < macSize; byteIndex++)
                    {
                        output[index + byteIndex] = (byte)(buffer[byteIndex] ^ input[index + byteIndex]);
                    }
                    index += macSize;
                }

                for (int byteIndex = 0; byteIndex < counter.Length; byteIndex++)
                {
                    s[byteIndex] += counter[byteIndex];
                }

                engine.ProcessBlock(s, buffer);

                output[(index - macSize)..index].CopyTo(buffer);

                CalculateMac(output[..(index - macSize)]);

                Array.Copy(macBlock, 0, mac, 0, macSize);

                Span<byte> calculatedMac = stackalloc byte[macSize];

                buffer.AsSpan(0, macSize).CopyTo(calculatedMac);

                if (!Arrays.ConstantTimeAreEqual(mac.AsSpan(0, macSize), calculatedMac))
                    throw new InvalidCipherTextException("mac check failed");

                Reset();

                return len - macSize;
            }
        }
#endif

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        private void CalculateMac(ReadOnlySpan<byte> authText)
        {
            int blockSize = engine.GetBlockSize();

            while (!authText.IsEmpty)
            {
                for (int byteIndex = 0; byteIndex < blockSize; byteIndex++)
                {
                    macBlock[byteIndex] ^= authText[byteIndex];
                }

                engine.ProcessBlock(macBlock, macBlock);

                authText = authText[blockSize..];
            }
        }

        private void ProcessBlock(ReadOnlySpan<byte> input, Span<byte> output)
        {
            for (int byteIndex = 0; byteIndex < counter.Length; byteIndex++)
            {
                s[byteIndex] += counter[byteIndex];
            }

            engine.ProcessBlock(s, buffer);

            int blockSize = engine.GetBlockSize();
            for (int byteIndex = 0; byteIndex < blockSize; byteIndex++)
            {
                output[byteIndex] = (byte)(buffer[byteIndex] ^ input[byteIndex]);
            }
        }
#else
        private void CalculateMac(byte[] authText, int authOff, int len)
        {
            int blockSize = engine.GetBlockSize();
            int totalLen = len;
            while (totalLen > 0)
            {
                for (int byteIndex = 0; byteIndex < blockSize; byteIndex++)
                {
                    macBlock[byteIndex] ^= authText[authOff + byteIndex];
                }

                engine.ProcessBlock(macBlock, 0, macBlock, 0);

                totalLen -= blockSize;
                authOff += blockSize;
            }
        }

        private void ProcessBlock(byte[] input, int inOff, byte[] output, int outOff)
        {

            for (int byteIndex = 0; byteIndex < counter.Length; byteIndex++)
            {
                s[byteIndex] += counter[byteIndex];
            }

            engine.ProcessBlock(s, 0, buffer, 0);

            for (int byteIndex = 0; byteIndex < engine.GetBlockSize(); byteIndex++)
            {
                output[outOff + byteIndex] = (byte)(buffer[byteIndex] ^ input[inOff + byteIndex]);
            }
        }
#endif

        public virtual int DoFinal(byte[] output, int outOff)
        {
#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
            return DoFinal(output.AsSpan(outOff));
#else
            byte[] buf = data.GetBuffer();
            int bufLen = Convert.ToInt32(data.Length);

            int len = ProcessPacket(buf, 0, bufLen, output, outOff);

            Reset();

            return len;
#endif
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual int DoFinal(Span<byte> output)
        {
            byte[] buf = data.GetBuffer();
            int bufLen = Convert.ToInt32(data.Length);

            int len = ProcessPacket(buf.AsSpan(0, bufLen), output);

            Reset();

            return len;
        }
#endif

        public virtual byte[] GetMac()
        {
            return Arrays.Clone(mac);
        }

        public virtual int GetUpdateOutputSize(int len)
        {
            return len;
        }

        public virtual int GetOutputSize(int len)
        {
            return len + macSize;
        }

        public virtual void Reset()
        {
            Arrays.Fill(G1, (byte)0);
            Arrays.Fill(buffer, (byte)0);
            Arrays.Fill(counter, (byte)0);
            Arrays.Fill(macBlock, (byte)0);

            counter[0] = 0x01;
            data.SetLength(0);
            associatedText.SetLength(0);

            if (initialAssociatedText != null)
            {
                ProcessAadBytes(initialAssociatedText, 0, initialAssociatedText.Length);
            }
        }

        private void intToBytes(
            int num,
            byte[] outBytes,
            int outOff)
        {
            outBytes[outOff + 3] = (byte)(num >> 24);
            outBytes[outOff + 2] = (byte)(num >> 16);
            outBytes[outOff + 1] = (byte)(num >> 8);
            outBytes[outOff] = (byte)num;
        }

        private byte getFlag(bool authTextPresents, int macSize)
        {
            StringBuilder flagByte = new StringBuilder();

            if (authTextPresents)
            {
                flagByte.Append("1");
            }
            else
            {
                flagByte.Append("0");
            }


            switch (macSize)
            {
                case 8:
                    flagByte.Append("010"); // binary 2
                    break;
                case 16:
                    flagByte.Append("011"); // binary 3
                    break;
                case 32:
                    flagByte.Append("100"); // binary 4
                    break;
                case 48:
                    flagByte.Append("101"); // binary 5
                    break;
                case 64:
                    flagByte.Append("110"); // binary 6
                    break;
            }

            string binaryNb = Convert.ToString(Nb_ - 1, 2);
            while (binaryNb.Length < 4)
            {
                binaryNb = new StringBuilder(binaryNb).Insert(0, "0").ToString();
            }

            flagByte.Append(binaryNb);

            return (byte)Convert.ToInt32(flagByte.ToString(), 2);
        }
    }
}
