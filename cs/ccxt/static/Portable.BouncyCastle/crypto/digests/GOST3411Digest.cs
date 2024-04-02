using System;

using Org.BouncyCastle.Crypto.Engines;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Digests
{
	/**
	* implementation of GOST R 34.11-94
	*/
	public class Gost3411Digest
		: IDigest, IMemoable
	{
		private const int DIGEST_LENGTH = 32;

		private byte[]	H = new byte[32], L = new byte[32],
						M = new byte[32], Sum = new byte[32];
		private byte[][] C = MakeC();

		private byte[]	xBuf = new byte[32];
		private int		xBufOff;
		private ulong	byteCount;

		private readonly IBlockCipher cipher = new Gost28147Engine();
		private byte[] sBox;

		private static byte[][] MakeC()
		{
			byte[][] c = new byte[4][];
			for (int i = 0; i < 4; ++i)
			{
				c[i] = new byte[32];
			}
			return c;
		}

		/**
		 * Standard constructor
		 */
		public Gost3411Digest()
		{
			sBox = Gost28147Engine.GetSBox("D-A");
			cipher.Init(true, new ParametersWithSBox(null, sBox));

			Reset();
		}

		/**
		 * Constructor to allow use of a particular sbox with GOST28147
		 * @see GOST28147Engine#getSBox(String)
		 */
		public Gost3411Digest(byte[] sBoxParam)
		{
			sBox = Arrays.Clone(sBoxParam);
			cipher.Init(true, new ParametersWithSBox(null, sBox));

			Reset();
		}

		/**
		 * Copy constructor.  This will copy the state of the provided
		 * message digest.
		 */
		public Gost3411Digest(Gost3411Digest t)
		{
			Reset(t);
		}

		public string AlgorithmName
		{
			get { return "Gost3411"; }
		}

		public int GetDigestSize()
		{
			return DIGEST_LENGTH;
		}

		public void Update(
			byte input)
		{
			xBuf[xBufOff++] = input;
			if (xBufOff == xBuf.Length)
			{
				sumByteArray(xBuf); // calc sum M
				processBlock(xBuf, 0);
				xBufOff = 0;
			}
			byteCount++;
		}

		public void BlockUpdate(byte[] input, int inOff, int length)
		{
			while ((xBufOff != 0) && (length > 0))
			{
				Update(input[inOff]);
				inOff++;
				length--;
			}

			while (length >= xBuf.Length)
			{
				Array.Copy(input, inOff, xBuf, 0, xBuf.Length);

				sumByteArray(xBuf); // calc sum M
				processBlock(xBuf, 0);
				inOff += xBuf.Length;
				length -= xBuf.Length;
				byteCount += (uint)xBuf.Length;
			}

			// load in the remainder.
			while (length > 0)
			{
				Update(input[inOff]);
				inOff++;
				length--;
			}
		}

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
		public void BlockUpdate(ReadOnlySpan<byte> input)
		{
			while ((xBufOff != 0) && (input.Length > 0))
			{
				Update(input[0]);
				input = input[1..];
			}

			while (input.Length >= xBuf.Length)
			{
				input[..xBuf.Length].CopyTo(xBuf.AsSpan());

				sumByteArray(xBuf); // calc sum M
				processBlock(xBuf, 0);
				input = input[xBuf.Length..];
				byteCount += (uint)xBuf.Length;
			}

			// load in the remainder.
			while (input.Length > 0)
			{
				Update(input[0]);
				input = input[1..];
			}
		}
#endif

		// (i + 1 + 4(k - 1)) = 8i + k      i = 0-3, k = 1-8
		private byte[] K = new byte[32];

		private byte[] P(byte[] input)
		{
			int fourK = 0;
			for(int k = 0; k < 8; k++)
			{
				K[fourK++] = input[k];
				K[fourK++] = input[8 + k];
				K[fourK++] = input[16 + k];
				K[fourK++] = input[24 + k];
			}

			return K;
		}

		//A (x) = (x0 ^ x1) || x3 || x2 || x1
		byte[] a = new byte[8];
		private byte[] A(byte[] input)
		{
			for(int j=0; j<8; j++)
			{
				a[j]=(byte)(input[j] ^ input[j+8]);
			}

			Array.Copy(input, 8, input, 0, 24);
			Array.Copy(a, 0, input, 24, 8);

			return input;
		}

		//Encrypt function, ECB mode
		private void E(byte[] key, byte[] s, int sOff, byte[] input, int inOff)
		{
			cipher.Init(true, new KeyParameter(key));

			cipher.ProcessBlock(input, inOff, s, sOff);
		}

		// (in:) n16||..||n1 ==> (out:) n1^n2^n3^n4^n13^n16||n16||..||n2
		internal short[] wS = new short[16], w_S = new short[16];

		private void fw(byte[] input)
		{
			cpyBytesToShort(input, wS);
			w_S[15] = (short)(wS[0] ^ wS[1] ^ wS[2] ^ wS[3] ^ wS[12] ^ wS[15]);
			Array.Copy(wS, 1, w_S, 0, 15);
			cpyShortToBytes(w_S, input);
		}

		// block processing
		internal byte[] S = new byte[32], U = new byte[32], V = new byte[32], W = new byte[32];

		private void processBlock(byte[] input, int inOff)
		{
			Array.Copy(input, inOff, M, 0, 32);

			//key step 1

			// H = h3 || h2 || h1 || h0
			// S = s3 || s2 || s1 || s0
			H.CopyTo(U, 0);
			M.CopyTo(V, 0);
			for (int j=0; j<32; j++)
			{
				W[j] = (byte)(U[j]^V[j]);
			}
			// Encrypt gost28147-ECB
			E(P(W), S, 0, H, 0); // s0 = EK0 [h0]

			//keys step 2,3,4
			for (int i=1; i<4; i++)
			{
				byte[] tmpA = A(U);
				for (int j=0; j<32; j++)
				{
					U[j] = (byte)(tmpA[j] ^ C[i][j]);
				}
				V = A(A(V));
				for (int j=0; j<32; j++)
				{
					W[j] = (byte)(U[j]^V[j]);
				}
				// Encrypt gost28147-ECB
				E(P(W), S, i * 8, H, i * 8); // si = EKi [hi]
			}

			// x(M, H) = y61(H^y(M^y12(S)))
			for(int n = 0; n < 12; n++)
			{
				fw(S);
			}
			for(int n = 0; n < 32; n++)
			{
				S[n] = (byte)(S[n] ^ M[n]);
			}

			fw(S);

			for(int n = 0; n < 32; n++)
			{
				S[n] = (byte)(H[n] ^ S[n]);
			}
			for(int n = 0; n < 61; n++)
			{
				fw(S);
			}
			Array.Copy(S, 0, H, 0, H.Length);
		}

		private void Finish()
		{
			ulong bitCount = byteCount * 8;
			Pack.UInt64_To_LE(bitCount, L);

			while (xBufOff != 0)
			{
				Update((byte)0);
			}

			processBlock(L, 0);
			processBlock(Sum, 0);
		}

		public int DoFinal(byte[] output, int outOff)
		{
			Finish();

			H.CopyTo(output, outOff);

			Reset();

			return DIGEST_LENGTH;
		}

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
		public int DoFinal(Span<byte> output)
		{
			Finish();

			H.CopyTo(output);

			Reset();

			return DIGEST_LENGTH;
		}
#endif

		/**
		* reset the chaining variables to the IV values.
		*/
		private static readonly byte[] C2 = {
			0x00,(byte)0xFF,0x00,(byte)0xFF,0x00,(byte)0xFF,0x00,(byte)0xFF,
			(byte)0xFF,0x00,(byte)0xFF,0x00,(byte)0xFF,0x00,(byte)0xFF,0x00,
			0x00,(byte)0xFF,(byte)0xFF,0x00,(byte)0xFF,0x00,0x00,(byte)0xFF,
			(byte)0xFF,0x00,0x00,0x00,(byte)0xFF,(byte)0xFF,0x00,(byte)0xFF
		};

		public void Reset()
		{
			byteCount = 0;
			xBufOff = 0;

			Array.Clear(H, 0, H.Length);
			Array.Clear(L, 0, L.Length);
			Array.Clear(M, 0, M.Length);
			Array.Clear(C[1], 0, C[1].Length); // real index C = +1 because index array with 0.
			Array.Clear(C[3], 0, C[3].Length);
			Array.Clear(Sum, 0, Sum.Length);
			Array.Clear(xBuf, 0, xBuf.Length);

			C2.CopyTo(C[2], 0);
		}

		//  256 bitsblock modul -> (Sum + a mod (2^256))
		private void sumByteArray(
			byte[] input)
		{
			int carry = 0;

			for (int i = 0; i != Sum.Length; i++)
			{
				int sum = (Sum[i] & 0xff) + (input[i] & 0xff) + carry;

				Sum[i] = (byte)sum;

				carry = sum >> 8;
			}
		}

		private static void cpyBytesToShort(byte[] S, short[] wS)
		{
			for(int i = 0; i < S.Length / 2; i++)
			{
				wS[i] = (short)(((S[i*2+1]<<8)&0xFF00)|(S[i*2]&0xFF));
			}
		}

		private static void cpyShortToBytes(short[] wS, byte[] S)
		{
			for(int i=0; i<S.Length/2; i++)
			{
				S[i*2 + 1] = (byte)(wS[i] >> 8);
				S[i*2] = (byte)wS[i];
			}
		}

		public int GetByteLength()
		{
			return 32;
		}

		public IMemoable Copy()
		{
			return new Gost3411Digest(this);
		}

		public void Reset(IMemoable other)
		{
			Gost3411Digest t = (Gost3411Digest)other;

			this.sBox = t.sBox;
			cipher.Init(true, new ParametersWithSBox(null, sBox));

			Reset();

			Array.Copy(t.H, 0, this.H, 0, t.H.Length);
			Array.Copy(t.L, 0, this.L, 0, t.L.Length);
			Array.Copy(t.M, 0, this.M, 0, t.M.Length);
			Array.Copy(t.Sum, 0, this.Sum, 0, t.Sum.Length);
			Array.Copy(t.C[1], 0, this.C[1], 0, t.C[1].Length);
			Array.Copy(t.C[2], 0, this.C[2], 0, t.C[2].Length);
			Array.Copy(t.C[3], 0, this.C[3], 0, t.C[3].Length);
			Array.Copy(t.xBuf, 0, this.xBuf, 0, t.xBuf.Length);

			this.xBufOff = t.xBufOff;
			this.byteCount = t.byteCount;
		}
	}

}
