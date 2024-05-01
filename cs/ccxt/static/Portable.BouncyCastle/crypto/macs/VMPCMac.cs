using System;

using Org.BouncyCastle.Crypto.Parameters;

namespace Org.BouncyCastle.Crypto.Macs
{
	public class VmpcMac
		: IMac
	{
		private byte g;

		private byte n = 0;
		private byte[] P = null;
		private byte s = 0;

		private byte[] T;
		private byte[] workingIV;

		private byte[] workingKey;

		private byte x1, x2, x3, x4;

		public virtual int DoFinal(byte[] output, int outOff)
		{
#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
			return DoFinal(output.AsSpan(outOff));
#else
			// Execute the Post-Processing Phase
			for (int r = 1; r < 25; r++)
			{
				s = P[(s + P[n & 0xff]) & 0xff];

				x4 = P[(x4 + x3 + r) & 0xff];
				x3 = P[(x3 + x2 + r) & 0xff];
				x2 = P[(x2 + x1 + r) & 0xff];
				x1 = P[(x1 + s + r) & 0xff];
				T[g & 0x1f] = (byte) (T[g & 0x1f] ^ x1);
				T[(g + 1) & 0x1f] = (byte) (T[(g + 1) & 0x1f] ^ x2);
				T[(g + 2) & 0x1f] = (byte) (T[(g + 2) & 0x1f] ^ x3);
				T[(g + 3) & 0x1f] = (byte) (T[(g + 3) & 0x1f] ^ x4);
				g = (byte) ((g + 4) & 0x1f);

				byte temp = P[n & 0xff];
				P[n & 0xff] = P[s & 0xff];
				P[s & 0xff] = temp;
				n = (byte) ((n + 1) & 0xff);
			}

			// Input T to the IV-phase of the VMPC KSA
			for (int m = 0; m < 768; m++)
			{
				s = P[(s + P[m & 0xff] + T[m & 0x1f]) & 0xff];
				byte temp = P[m & 0xff];
				P[m & 0xff] = P[s & 0xff];
				P[s & 0xff] = temp;
			}

			// Store 20 new outputs of the VMPC Stream Cipher input table M
			byte[] M = new byte[20];
			for (int i = 0; i < 20; i++)
			{
				s = P[(s + P[i & 0xff]) & 0xff];
				M[i] = P[(P[(P[s & 0xff]) & 0xff] + 1) & 0xff];

				byte temp = P[i & 0xff];
				P[i & 0xff] = P[s & 0xff];
				P[s & 0xff] = temp;
			}

			Array.Copy(M, 0, output, outOff, M.Length);
			Reset();

			return M.Length;
#endif
		}

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
		public virtual int DoFinal(Span<byte> output)
        {
			// Execute the Post-Processing Phase
			for (int r = 1; r < 25; r++)
			{
				s = P[(s + P[n & 0xff]) & 0xff];

				x4 = P[(x4 + x3 + r) & 0xff];
				x3 = P[(x3 + x2 + r) & 0xff];
				x2 = P[(x2 + x1 + r) & 0xff];
				x1 = P[(x1 + s + r) & 0xff];
				T[g & 0x1f] = (byte)(T[g & 0x1f] ^ x1);
				T[(g + 1) & 0x1f] = (byte)(T[(g + 1) & 0x1f] ^ x2);
				T[(g + 2) & 0x1f] = (byte)(T[(g + 2) & 0x1f] ^ x3);
				T[(g + 3) & 0x1f] = (byte)(T[(g + 3) & 0x1f] ^ x4);
				g = (byte)((g + 4) & 0x1f);

				byte temp = P[n & 0xff];
				P[n & 0xff] = P[s & 0xff];
				P[s & 0xff] = temp;
				n = (byte)((n + 1) & 0xff);
			}

			// Input T to the IV-phase of the VMPC KSA
			for (int m = 0; m < 768; m++)
			{
				s = P[(s + P[m & 0xff] + T[m & 0x1f]) & 0xff];
				byte temp = P[m & 0xff];
				P[m & 0xff] = P[s & 0xff];
				P[s & 0xff] = temp;
			}

			// Store 20 new outputs of the VMPC Stream Cipher input table M
			byte[] M = new byte[20];
			for (int i = 0; i < 20; i++)
			{
				s = P[(s + P[i & 0xff]) & 0xff];
				M[i] = P[(P[(P[s & 0xff]) & 0xff] + 1) & 0xff];

				byte temp = P[i & 0xff];
				P[i & 0xff] = P[s & 0xff];
				P[s & 0xff] = temp;
			}

			M.CopyTo(output);
			Reset();

			return M.Length;
		}
#endif

		public virtual string AlgorithmName
		{
			get { return "VMPC-MAC"; }
		}

		public virtual int GetMacSize()
		{
			return 20;
		}

		public virtual void Init(ICipherParameters parameters)
		{
			if (!(parameters is ParametersWithIV))
				throw new ArgumentException("VMPC-MAC Init parameters must include an IV", "parameters");

			ParametersWithIV ivParams = (ParametersWithIV) parameters;
			KeyParameter key = (KeyParameter) ivParams.Parameters;

			if (!(ivParams.Parameters is KeyParameter))
				throw new ArgumentException("VMPC-MAC Init parameters must include a key", "parameters");

			this.workingIV = ivParams.GetIV();

			if (workingIV == null || workingIV.Length < 1 || workingIV.Length > 768)
				throw new ArgumentException("VMPC-MAC requires 1 to 768 bytes of IV", "parameters");

			this.workingKey = key.GetKey();

			Reset();

		}

		private void initKey(byte[] keyBytes, byte[] ivBytes)
		{
			s = 0;
			P = new byte[256];
			for (int i = 0; i < 256; i++)
			{
				P[i] = (byte) i;
			}
			for (int m = 0; m < 768; m++)
			{
				s = P[(s + P[m & 0xff] + keyBytes[m % keyBytes.Length]) & 0xff];
				byte temp = P[m & 0xff];
				P[m & 0xff] = P[s & 0xff];
				P[s & 0xff] = temp;
			}
			for (int m = 0; m < 768; m++)
			{
				s = P[(s + P[m & 0xff] + ivBytes[m % ivBytes.Length]) & 0xff];
				byte temp = P[m & 0xff];
				P[m & 0xff] = P[s & 0xff];
				P[s & 0xff] = temp;
			}
			n = 0;
		}

		public virtual void Reset()
		{
			initKey(this.workingKey, this.workingIV);
			g = x1 = x2 = x3 = x4 = n = 0;
			T = new byte[32];
			for (int i = 0; i < 32; i++)
			{
				T[i] = 0;
			}
		}

		public virtual void Update(byte input)
		{
			s = P[(s + P[n & 0xff]) & 0xff];
			byte c = (byte) (input ^ P[(P[(P[s & 0xff]) & 0xff] + 1) & 0xff]);

			x4 = P[(x4 + x3) & 0xff];
			x3 = P[(x3 + x2) & 0xff];
			x2 = P[(x2 + x1) & 0xff];
			x1 = P[(x1 + s + c) & 0xff];
			T[g & 0x1f] = (byte) (T[g & 0x1f] ^ x1);
			T[(g + 1) & 0x1f] = (byte) (T[(g + 1) & 0x1f] ^ x2);
			T[(g + 2) & 0x1f] = (byte) (T[(g + 2) & 0x1f] ^ x3);
			T[(g + 3) & 0x1f] = (byte) (T[(g + 3) & 0x1f] ^ x4);
			g = (byte) ((g + 4) & 0x1f);

			byte temp = P[n & 0xff];
			P[n & 0xff] = P[s & 0xff];
			P[s & 0xff] = temp;
			n = (byte) ((n + 1) & 0xff);
		}

		public virtual void BlockUpdate(byte[] input, int inOff, int inLen)
		{
			Check.DataLength(input, inOff, inLen, "input buffer too short");

			for (int i = 0; i < inLen; i++)
			{
				Update(input[inOff + i]);
			}
		}

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
		public virtual void BlockUpdate(ReadOnlySpan<byte> input)
        {
			for (int i = 0; i < input.Length; i++)
			{
				Update(input[i]);
			}
		}
#endif
	}
}
