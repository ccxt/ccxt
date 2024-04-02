using System;

using Org.BouncyCastle.Crypto.Parameters;

namespace Org.BouncyCastle.Crypto
{
	public class BufferedStreamCipher
		: BufferedCipherBase
	{
		private readonly IStreamCipher m_cipher;

		public BufferedStreamCipher(IStreamCipher cipher)
		{
			if (cipher == null)
				throw new ArgumentNullException("cipher");

			this.m_cipher = cipher;
		}

		public override string AlgorithmName
		{
			get { return m_cipher.AlgorithmName; }
		}

        public override void Init(bool forEncryption, ICipherParameters parameters)
        {
            if (parameters is ParametersWithRandom withRandom)
			{
				parameters = withRandom.Parameters;
			}

			m_cipher.Init(forEncryption, parameters);
		}

		public override int GetBlockSize()
		{
			return 0;
		}

		public override int GetOutputSize(int inputLen)
		{
			return inputLen;
		}

		public override int GetUpdateOutputSize(int inputLen)
		{
			return inputLen;
		}

		public override byte[] ProcessByte(byte input)
		{
			return new byte[]{ m_cipher.ReturnByte(input) };
		}

        public override int ProcessByte(byte input, byte[] output, int outOff)
        {
            if (outOff >= output.Length)
				throw new DataLengthException("output buffer too short");

			output[outOff] = m_cipher.ReturnByte(input);
			return 1;
		}

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public override int ProcessByte(byte input, Span<byte> output)
        {
            output[0] = m_cipher.ReturnByte(input);
            return 1;
        }
#endif

        public override byte[] ProcessBytes(byte[] input, int inOff, int length)
        {
            if (length < 1)
				return null;

			byte[] output = new byte[length];
			m_cipher.ProcessBytes(input, inOff, length, output, 0);
			return output;
		}

        public override int ProcessBytes(byte[] input, int inOff, int length, byte[] output, int outOff)
        {
            if (length < 1)
				return 0;

			m_cipher.ProcessBytes(input, inOff, length, output, outOff);
			return length;
		}

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
		public override int ProcessBytes(ReadOnlySpan<byte> input, Span<byte> output)
		{
			m_cipher.ProcessBytes(input, output);
			return input.Length;
		}
#endif

		public override byte[] DoFinal()
		{
			m_cipher.Reset();

			return EmptyBuffer;
		}

		public override byte[] DoFinal(byte[] input, int inOff, int length)
		{
			if (length < 1)
				return EmptyBuffer;

            byte[] output = new byte[length];
            m_cipher.ProcessBytes(input, inOff, length, output, 0);
            m_cipher.Reset();
            return output;
		}

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public override int DoFinal(Span<byte> output)
		{
			m_cipher.Reset();
			return 0;
		}

        public override int DoFinal(ReadOnlySpan<byte> input, Span<byte> output)
        {
            m_cipher.ProcessBytes(input, output);
            m_cipher.Reset();
            return input.Length;
        }
#endif

        public override void Reset()
		{
			m_cipher.Reset();
		}
	}
}
