using System;
using System.Diagnostics;
#if NETCOREAPP3_0_OR_GREATER
using System.Runtime.CompilerServices;
using System.Runtime.Intrinsics;
using System.Runtime.Intrinsics.X86;
#endif

using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Engines
{
	/// <summary>
	/// Implementation of Daniel J. Bernstein's ChaCha stream cipher.
	/// </summary>
	public class ChaChaEngine
		: Salsa20Engine
	{
		/// <summary>
		/// Creates a 20 rounds ChaCha engine.
		/// </summary>
		public ChaChaEngine()
		{
		}

		/// <summary>
		/// Creates a ChaCha engine with a specific number of rounds.
		/// </summary>
		/// <param name="rounds">the number of rounds (must be an even number).</param>
		public ChaChaEngine(int rounds)
			: base(rounds)
		{
		}

		public override string AlgorithmName
		{
			get { return "ChaCha" + rounds; }
		}

		protected override void AdvanceCounter()
		{
			if (++engineState[12] == 0)
			{
				++engineState[13];
			}
		}

		protected override void ResetCounter()
		{
			engineState[12] = engineState[13] = 0;
		}

		protected override void SetKey(byte[] keyBytes, byte[] ivBytes)
		{
            if (keyBytes != null)
            {
                if ((keyBytes.Length != 16) && (keyBytes.Length != 32))
                    throw new ArgumentException(AlgorithmName + " requires 128 bit or 256 bit key");

                PackTauOrSigma(keyBytes.Length, engineState, 0);

                // Key
                Pack.LE_To_UInt32(keyBytes, 0, engineState, 4, 4);
                Pack.LE_To_UInt32(keyBytes, keyBytes.Length - 16, engineState, 8, 4);
            }

            // IV
            Pack.LE_To_UInt32(ivBytes, 0, engineState, 14, 2);
		}

		protected override void GenerateKeyStream(byte[] output)
		{
			ChachaCore(rounds, engineState, output);
		}

		internal static void ChachaCore(int rounds, uint[] input, byte[] output)
		{
			Debug.Assert(rounds % 2 == 0);
			Debug.Assert(input.Length >= 16);
			Debug.Assert(output.Length >= 64);

#if NETCOREAPP3_0_OR_GREATER
			if (Sse2.IsSupported)
			{
				var x0 = Load128_UInt32(input.AsSpan());
				var x1 = Load128_UInt32(input.AsSpan(4));
				var x2 = Load128_UInt32(input.AsSpan(8));
				var x3 = Load128_UInt32(input.AsSpan(12));

				var v0 = x0;
				var v1 = x1;
				var v2 = x2;
				var v3 = x3;

				for (int i = rounds; i > 0; i -= 2)
				{
					v0 = Sse2.Add(v0, v1);
					v3 = Sse2.Xor(v3, v0);
					v3 = Sse2.Xor(Sse2.ShiftLeftLogical(v3, 16), Sse2.ShiftRightLogical(v3, 16));
					v2 = Sse2.Add(v2, v3);
					v1 = Sse2.Xor(v1, v2);
					v1 = Sse2.Xor(Sse2.ShiftLeftLogical(v1, 12), Sse2.ShiftRightLogical(v1, 20));
					v0 = Sse2.Add(v0, v1);
					v3 = Sse2.Xor(v3, v0);
					v3 = Sse2.Xor(Sse2.ShiftLeftLogical(v3, 8), Sse2.ShiftRightLogical(v3, 24));
					v2 = Sse2.Add(v2, v3);
					v1 = Sse2.Xor(v1, v2);
					v1 = Sse2.Xor(Sse2.ShiftLeftLogical(v1, 7), Sse2.ShiftRightLogical(v1, 25));

					v1 = Sse2.Shuffle(v1, 0x39);
					v2 = Sse2.Shuffle(v2, 0x4E);
					v3 = Sse2.Shuffle(v3, 0x93);

					v0 = Sse2.Add(v0, v1);
					v3 = Sse2.Xor(v3, v0);
					v3 = Sse2.Xor(Sse2.ShiftLeftLogical(v3, 16), Sse2.ShiftRightLogical(v3, 16));
					v2 = Sse2.Add(v2, v3);
					v1 = Sse2.Xor(v1, v2);
					v1 = Sse2.Xor(Sse2.ShiftLeftLogical(v1, 12), Sse2.ShiftRightLogical(v1, 20));
					v0 = Sse2.Add(v0, v1);
					v3 = Sse2.Xor(v3, v0);
					v3 = Sse2.Xor(Sse2.ShiftLeftLogical(v3, 8), Sse2.ShiftRightLogical(v3, 24));
					v2 = Sse2.Add(v2, v3);
					v1 = Sse2.Xor(v1, v2);
					v1 = Sse2.Xor(Sse2.ShiftLeftLogical(v1, 7), Sse2.ShiftRightLogical(v1, 25));

					v1 = Sse2.Shuffle(v1, 0x93);
					v2 = Sse2.Shuffle(v2, 0x4E);
					v3 = Sse2.Shuffle(v3, 0x39);
				}

				v0 = Sse2.Add(v0, x0);
				v1 = Sse2.Add(v1, x1);
				v2 = Sse2.Add(v2, x2);
				v3 = Sse2.Add(v3, x3);

				Store128_UInt32(ref v0, output.AsSpan());
				Store128_UInt32(ref v1, output.AsSpan(0x10));
				Store128_UInt32(ref v2, output.AsSpan(0x20));
				Store128_UInt32(ref v3, output.AsSpan(0x30));
				return;
			}
#endif

            {
				uint x00 = input[ 0], x01 = input[ 1], x02 = input[ 2], x03 = input[ 3];
				uint x04 = input[ 4], x05 = input[ 5], x06 = input[ 6], x07 = input[ 7];
				uint x08 = input[ 8], x09 = input[ 9], x10 = input[10], x11 = input[11];
				uint x12 = input[12], x13 = input[13], x14 = input[14], x15 = input[15];

				for (int i = rounds; i > 0; i -= 2)
				{
					x00 += x04; x12 = Integers.RotateLeft(x12 ^ x00, 16);
					x01 += x05; x13 = Integers.RotateLeft(x13 ^ x01, 16);
					x02 += x06; x14 = Integers.RotateLeft(x14 ^ x02, 16);
					x03 += x07; x15 = Integers.RotateLeft(x15 ^ x03, 16);

					x08 += x12; x04 = Integers.RotateLeft(x04 ^ x08, 12);
					x09 += x13; x05 = Integers.RotateLeft(x05 ^ x09, 12);
					x10 += x14; x06 = Integers.RotateLeft(x06 ^ x10, 12);
					x11 += x15; x07 = Integers.RotateLeft(x07 ^ x11, 12);

					x00 += x04; x12 = Integers.RotateLeft(x12 ^ x00, 8);
					x01 += x05; x13 = Integers.RotateLeft(x13 ^ x01, 8);
					x02 += x06; x14 = Integers.RotateLeft(x14 ^ x02, 8);
					x03 += x07; x15 = Integers.RotateLeft(x15 ^ x03, 8);

					x08 += x12; x04 = Integers.RotateLeft(x04 ^ x08, 7);
					x09 += x13; x05 = Integers.RotateLeft(x05 ^ x09, 7);
					x10 += x14; x06 = Integers.RotateLeft(x06 ^ x10, 7);
					x11 += x15; x07 = Integers.RotateLeft(x07 ^ x11, 7);

					x00 += x05; x15 = Integers.RotateLeft(x15 ^ x00, 16);
					x01 += x06; x12 = Integers.RotateLeft(x12 ^ x01, 16);
					x02 += x07; x13 = Integers.RotateLeft(x13 ^ x02, 16);
					x03 += x04; x14 = Integers.RotateLeft(x14 ^ x03, 16);

					x10 += x15; x05 = Integers.RotateLeft(x05 ^ x10, 12);
					x11 += x12; x06 = Integers.RotateLeft(x06 ^ x11, 12);
					x08 += x13; x07 = Integers.RotateLeft(x07 ^ x08, 12);
					x09 += x14; x04 = Integers.RotateLeft(x04 ^ x09, 12);

					x00 += x05; x15 = Integers.RotateLeft(x15 ^ x00, 8);
					x01 += x06; x12 = Integers.RotateLeft(x12 ^ x01, 8);
					x02 += x07; x13 = Integers.RotateLeft(x13 ^ x02, 8);
					x03 += x04; x14 = Integers.RotateLeft(x14 ^ x03, 8);

					x10 += x15; x05 = Integers.RotateLeft(x05 ^ x10, 7);
					x11 += x12; x06 = Integers.RotateLeft(x06 ^ x11, 7);
					x08 += x13; x07 = Integers.RotateLeft(x07 ^ x08, 7);
					x09 += x14; x04 = Integers.RotateLeft(x04 ^ x09, 7);
				}

				Pack.UInt32_To_LE(x00 + input[ 0], output,  0);
				Pack.UInt32_To_LE(x01 + input[ 1], output,  4);
				Pack.UInt32_To_LE(x02 + input[ 2], output,  8);
				Pack.UInt32_To_LE(x03 + input[ 3], output, 12);
				Pack.UInt32_To_LE(x04 + input[ 4], output, 16);
				Pack.UInt32_To_LE(x05 + input[ 5], output, 20);
				Pack.UInt32_To_LE(x06 + input[ 6], output, 24);
				Pack.UInt32_To_LE(x07 + input[ 7], output, 28);
				Pack.UInt32_To_LE(x08 + input[ 8], output, 32);
				Pack.UInt32_To_LE(x09 + input[ 9], output, 36);
				Pack.UInt32_To_LE(x10 + input[10], output, 40);
				Pack.UInt32_To_LE(x11 + input[11], output, 44);
				Pack.UInt32_To_LE(x12 + input[12], output, 48);
				Pack.UInt32_To_LE(x13 + input[13], output, 52);
				Pack.UInt32_To_LE(x14 + input[14], output, 56);
				Pack.UInt32_To_LE(x15 + input[15], output, 60);
			}
		}

#if NETCOREAPP3_0_OR_GREATER
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		private static Vector128<uint> Load128_UInt32(ReadOnlySpan<uint> t)
		{
			if (BitConverter.IsLittleEndian && Unsafe.SizeOf<Vector128<uint>>() == 16)
				return Unsafe.ReadUnaligned<Vector128<uint>>(ref Unsafe.As<uint, byte>(ref Unsafe.AsRef(t[0])));

			return Vector128.Create(t[0], t[1], t[2], t[3]);
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		private static void Store128_UInt32(ref Vector128<uint> s, Span<byte> t)
		{
			if (BitConverter.IsLittleEndian && Unsafe.SizeOf<Vector128<uint>>() == 16)
			{
				Unsafe.WriteUnaligned(ref t[0], s);
				return;
			}

			var u = s.AsUInt64();
			Pack.UInt64_To_LE(u.GetElement(0), t);
			Pack.UInt64_To_LE(u.GetElement(1), t[8..]);
		}
#endif
	}
}
