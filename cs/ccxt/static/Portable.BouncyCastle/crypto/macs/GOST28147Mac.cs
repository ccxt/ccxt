using System;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Macs
{
	/**
	* implementation of GOST 28147-89 MAC
	*/
	public class Gost28147Mac
		: IMac
	{
		private const int			BlockSize = 8;
		private const int			MacSize = 4;
		private int					bufOff;
		private byte[]				buf;
		private byte[]				mac;
		private bool				firstStep = true;
		private int[]				workingKey;
        private byte[]              macIV = null;

		//
		// This is default S-box - E_A.
		private byte[] S =
		{
			0x9,0x6,0x3,0x2,0x8,0xB,0x1,0x7,0xA,0x4,0xE,0xF,0xC,0x0,0xD,0x5,
			0x3,0x7,0xE,0x9,0x8,0xA,0xF,0x0,0x5,0x2,0x6,0xC,0xB,0x4,0xD,0x1,
			0xE,0x4,0x6,0x2,0xB,0x3,0xD,0x8,0xC,0xF,0x5,0xA,0x0,0x7,0x1,0x9,
			0xE,0x7,0xA,0xC,0xD,0x1,0x3,0x9,0x0,0x2,0xB,0x4,0xF,0x8,0x5,0x6,
			0xB,0x5,0x1,0x9,0x8,0xD,0xF,0x0,0xE,0x4,0x2,0x3,0xC,0x7,0xA,0x6,
			0x3,0xA,0xD,0xC,0x1,0x2,0x0,0xB,0x7,0x5,0x9,0x4,0x8,0xF,0xE,0x6,
			0x1,0xD,0x2,0x9,0x7,0xA,0x6,0x0,0x8,0xC,0x4,0x5,0xF,0x3,0xB,0xE,
			0xB,0xA,0xF,0x5,0x0,0xC,0xE,0x8,0x6,0x2,0x3,0x9,0x1,0x7,0xD,0x4
		};

		public Gost28147Mac()
		{
			mac = new byte[BlockSize];
			buf = new byte[BlockSize];
			bufOff = 0;
		}

		private static int[] GenerateWorkingKey(
			byte[] userKey)
		{
			if (userKey.Length != 32)
				throw new ArgumentException("Key length invalid. Key needs to be 32 byte - 256 bit!!!");

			int[] key = new int[8];
			for(int i=0; i!=8; i++)
			{
				key[i] = (int)Pack.LE_To_UInt32(userKey, i * 4);
			}

			return key;
		}

		public void Init(ICipherParameters parameters)
		{
			Reset();
			buf = new byte[BlockSize];
            macIV = null;
            if (parameters is ParametersWithSBox param)
			{
				//
				// Set the S-Box
				//
				param.GetSBox().CopyTo(this.S, 0);

				//
				// set key if there is one
				//
				if (param.Parameters != null)
				{
					workingKey = GenerateWorkingKey(((KeyParameter)param.Parameters).GetKey());
				}
			}
			else if (parameters is KeyParameter keyParameter)
			{
				workingKey = GenerateWorkingKey(keyParameter.GetKey());
			}
            else if (parameters is ParametersWithIV ivParam)
            {
                workingKey = GenerateWorkingKey(((KeyParameter)ivParam.Parameters).GetKey());
				macIV = ivParam.GetIV(); // don't skip the initial CM5Func
				Array.Copy(macIV, 0, mac, 0, mac.Length);
            }
			else
			{
				throw new ArgumentException("invalid parameter passed to Gost28147 init - "
                    + Platform.GetTypeName(parameters));
			}
		}

		public string AlgorithmName
		{
			get { return "Gost28147Mac"; }
		}

		public int GetMacSize()
		{
			return MacSize;
		}

		private int Gost28147_mainStep(int n1, int key)
		{
			int cm = (key + n1); // CM1

			// S-box replacing

			int om = S[  0 + ((cm >> (0 * 4)) & 0xF)] << (0 * 4);
			om += S[ 16 + ((cm >> (1 * 4)) & 0xF)] << (1 * 4);
			om += S[ 32 + ((cm >> (2 * 4)) & 0xF)] << (2 * 4);
			om += S[ 48 + ((cm >> (3 * 4)) & 0xF)] << (3 * 4);
			om += S[ 64 + ((cm >> (4 * 4)) & 0xF)] << (4 * 4);
			om += S[ 80 + ((cm >> (5 * 4)) & 0xF)] << (5 * 4);
			om += S[ 96 + ((cm >> (6 * 4)) & 0xF)] << (6 * 4);
			om += S[112 + ((cm >> (7 * 4)) & 0xF)] << (7 * 4);

//			return om << 11 | om >>> (32-11); // 11-leftshift
			int omLeft = om << 11;
			int omRight = (int)(((uint) om) >> (32 - 11)); // Note: Casts required to get unsigned bit rotation

			return omLeft | omRight;
		}

		private void Gost28147MacFunc(
			int[]	workingKey,
			byte[]	input,
			int		inOff,
			byte[]	output,
			int		outOff)
		{
			int N1 = (int)Pack.LE_To_UInt32(input, inOff);
			int N2 = (int)Pack.LE_To_UInt32(input, inOff + 4);
			int tmp;  //tmp -> for saving N1

			for (int k = 0; k < 2; k++)  // 1-16 steps
			{
				for (int j = 0; j < 8; j++)
				{
					tmp = N1;
					N1 = N2 ^ Gost28147_mainStep(N1, workingKey[j]); // CM2
					N2 = tmp;
				}
			}

			Pack.UInt32_To_LE((uint)N1, output, outOff);
			Pack.UInt32_To_LE((uint)N2, output, outOff + 4);
		}

		public void Update(byte input)
		{
			if (bufOff == buf.Length)
			{
				byte[] sum = new byte[buf.Length];
				if (firstStep)
				{
					firstStep = false;
                    if (macIV != null)
                    {
                        Cm5Func(buf, 0, macIV, sum);
                    }
					else
                    {
						Array.Copy(buf, 0, sum, 0, mac.Length);
					}
				}
				else
				{
					Cm5Func(buf, 0, mac, sum);
				}

				Gost28147MacFunc(workingKey, sum, 0, mac, 0);
				bufOff = 0;
			}

			buf[bufOff++] = input;
		}

		public void BlockUpdate(byte[] input, int inOff, int len)
		{
			if (len < 0)
				throw new ArgumentException("Can't have a negative input length!");

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
			BlockUpdate(input.AsSpan(inOff, len));
#else
			int gapLen = BlockSize - bufOff;

			if (len > gapLen)
			{
				Array.Copy(input, inOff, buf, bufOff, gapLen);

				byte[] sum = new byte[buf.Length];
				if (firstStep)
				{
					firstStep = false;
                    if (macIV != null)
                    {
                        Cm5Func(buf, 0, macIV, sum);
                    }
					else
                    {
						Array.Copy(buf, 0, sum, 0, mac.Length);
					}
				}
				else
				{
					Cm5Func(buf, 0, mac, sum);
				}

				Gost28147MacFunc(workingKey, sum, 0, mac, 0);

				bufOff = 0;
				len -= gapLen;
				inOff += gapLen;

				while (len > BlockSize)
				{
					Cm5Func(input, inOff, mac, sum);
					Gost28147MacFunc(workingKey, sum, 0, mac, 0);

					len -= BlockSize;
					inOff += BlockSize;
				}
			}

			Array.Copy(input, inOff, buf, bufOff, len);

			bufOff += len;
#endif
		}

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
		public void BlockUpdate(ReadOnlySpan<byte> input)
		{
			int gapLen = BlockSize - bufOff;

			if (input.Length > gapLen)
			{
				input[..gapLen].CopyTo(buf.AsSpan(bufOff));

				byte[] sum = new byte[buf.Length];
				if (firstStep)
				{
					firstStep = false;
                    if (macIV != null)
                    {
                        Cm5Func(buf, macIV, sum);
                    }
                    else
                    {
						Array.Copy(buf, 0, sum, 0, mac.Length);
					}
				}
				else
				{
					Cm5Func(buf, mac, sum);
				}

				Gost28147MacFunc(workingKey, sum, 0, mac, 0);

				bufOff = 0;
				input = input[gapLen..];

				while (input.Length > BlockSize)
				{
					Cm5Func(input, mac, sum);
					Gost28147MacFunc(workingKey, sum, 0, mac, 0);

					input = input[BlockSize..];
				}
			}

			input.CopyTo(buf.AsSpan(bufOff));

			bufOff += input.Length;
		}
#endif

		public int DoFinal(byte[] output, int outOff)
		{
#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
			return DoFinal(output.AsSpan(outOff));
#else
			//padding with zero
			while (bufOff < BlockSize)
			{
				buf[bufOff++] = 0;
			}

			byte[] sum = new byte[buf.Length];
			if (firstStep)
			{
				firstStep = false;
				Array.Copy(buf, 0, sum, 0, mac.Length);
			}
			else
			{
				Cm5Func(buf, 0, mac, sum);
			}

			Gost28147MacFunc(workingKey, sum, 0, mac, 0);

			Array.Copy(mac, (mac.Length/2)-MacSize, output, outOff, MacSize);

			Reset();

			return MacSize;
#endif
		}

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
		public int DoFinal(Span<byte> output)
		{
			//padding with zero
			while (bufOff < BlockSize)
			{
				buf[bufOff++] = 0;
			}

			byte[] sum = new byte[buf.Length];
			if (firstStep)
			{
				firstStep = false;
				Array.Copy(buf, 0, sum, 0, mac.Length);
			}
			else
			{
				Cm5Func(buf, 0, mac, sum);
			}

			Gost28147MacFunc(workingKey, sum, 0, mac, 0);

			mac.AsSpan((mac.Length / 2) - MacSize, MacSize).CopyTo(output);

			Reset();

			return MacSize;
		}
#endif

		public void Reset()
		{
			// Clear the buffer.
			Array.Clear(buf, 0, buf.Length);
			bufOff = 0;

			firstStep = true;
		}

		private static void Cm5Func(byte[] buf, int bufOff, byte[] mac, byte[] sum)
		{
			for (int i = 0; i < BlockSize; ++i)
			{
				sum[i] = (byte)(buf[bufOff + i] ^ mac[i]);
			}
		}

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
		private static void Cm5Func(ReadOnlySpan<byte> buffer, ReadOnlySpan<byte> mac, Span<byte> sum)
		{
			for (int i = 0; i < BlockSize; ++i)
			{
				sum[i] = (byte)(buffer[i] ^ mac[i]);
			}
		}
#endif
	}
}
