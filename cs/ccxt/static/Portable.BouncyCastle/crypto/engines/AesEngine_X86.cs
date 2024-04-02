#if NET6_0_OR_GREATER
using System;
using System.Runtime.CompilerServices;
using System.Runtime.Intrinsics;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Engines
{
    using Aes = System.Runtime.Intrinsics.X86.Aes;
    using Sse2 = System.Runtime.Intrinsics.X86.Sse2;

    public struct AesEngine_X86
        : IBlockCipher
    {
        public static bool IsSupported => Aes.IsSupported;

        [MethodImpl(MethodImplOptions.AggressiveOptimization)]
        private static Vector128<byte>[] CreateRoundKeys(byte[] key, bool forEncryption)
        {
            Vector128<byte>[] K;

            switch (key.Length)
            {
                case 16:
                    {
                        ReadOnlySpan<byte> rcon = stackalloc byte[] { 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36 };

                        K = new Vector128<byte>[11];

                        var s = Load128(key.AsSpan(0, 16));
                        K[0] = s;

                        for (int round = 0; round < 10;)
                        {
                            var t = Aes.KeygenAssist(s, rcon[round++]);
                            t = Sse2.Shuffle(t.AsInt32(), 0xFF).AsByte();
                            s = Sse2.Xor(s, Sse2.ShiftLeftLogical128BitLane(s, 8));
                            s = Sse2.Xor(s, Sse2.ShiftLeftLogical128BitLane(s, 4));
                            s = Sse2.Xor(s, t);
                            K[round] = s;
                        }

                        break;
                    }
                case 24:
                    {
                        K = new Vector128<byte>[13];

                        var s1 = Load128(key.AsSpan(0, 16));
                        var s2 = Load64(key.AsSpan(16, 8)).ToVector128();
                        K[0] = s1;

                        byte rcon = 0x01;
                        for (int round = 0; ;)
                        {
                            var t1 = Aes.KeygenAssist(s2, rcon); rcon <<= 1;
                            t1 = Sse2.Shuffle(t1.AsInt32(), 0x55).AsByte();

                            s1 = Sse2.Xor(s1, Sse2.ShiftLeftLogical128BitLane(s1, 8));
                            s1 = Sse2.Xor(s1, Sse2.ShiftLeftLogical128BitLane(s1, 4));
                            s1 = Sse2.Xor(s1, t1);

                            K[++round] = Sse2.Xor(s2, Sse2.ShiftLeftLogical128BitLane(s1, 8));

                            var s3 = Sse2.Xor(s2, Sse2.ShiftRightLogical128BitLane(s1, 12));
                            s3 = Sse2.Xor(s3, Sse2.ShiftLeftLogical128BitLane(s3, 4));

                            K[++round] = Sse2.Xor(
                                Sse2.ShiftRightLogical128BitLane(s1, 8),
                                Sse2.ShiftLeftLogical128BitLane(s3, 8));

                            var t2 = Aes.KeygenAssist(s3, rcon); rcon <<= 1;
                            t2 = Sse2.Shuffle(t2.AsInt32(), 0x55).AsByte();

                            s1 = Sse2.Xor(s1, Sse2.ShiftLeftLogical128BitLane(s1, 8));
                            s1 = Sse2.Xor(s1, Sse2.ShiftLeftLogical128BitLane(s1, 4));
                            s1 = Sse2.Xor(s1, t2);

                            K[++round] = s1;

                            if (round == 12)
                                break;

                            s2 = Sse2.Xor(s3, Sse2.ShiftRightLogical128BitLane(s1, 12));
                            s2 = Sse2.Xor(s2, Sse2.ShiftLeftLogical128BitLane(s2, 4));
                            s2 = s2.WithUpper(Vector64<byte>.Zero);
                        }

                        break;
                    }
                case 32:
                    {
                        K = new Vector128<byte>[15];

                        var s1 = Load128(key.AsSpan(0, 16));
                        var s2 = Load128(key.AsSpan(16, 16));
                        K[0] = s1;
                        K[1] = s2;

                        byte rcon = 0x01;
                        for (int round = 1; ;)
                        {
                            var t1 = Aes.KeygenAssist(s2, rcon); rcon <<= 1;
                            t1 = Sse2.Shuffle(t1.AsInt32(), 0xFF).AsByte();
                            s1 = Sse2.Xor(s1, Sse2.ShiftLeftLogical128BitLane(s1, 8));
                            s1 = Sse2.Xor(s1, Sse2.ShiftLeftLogical128BitLane(s1, 4));
                            s1 = Sse2.Xor(s1, t1);
                            K[++round] = s1;

                            if (round == 14)
                                break;

                            var t2 = Aes.KeygenAssist(s1, 0x00);
                            t2 = Sse2.Shuffle(t2.AsInt32(), 0xAA).AsByte();
                            s2 = Sse2.Xor(s2, Sse2.ShiftLeftLogical128BitLane(s2, 8));
                            s2 = Sse2.Xor(s2, Sse2.ShiftLeftLogical128BitLane(s2, 4));
                            s2 = Sse2.Xor(s2, t2);
                            K[++round] = s2;
                        }

                        break;
                    }
                default:
                    throw new ArgumentException("Key length not 128/192/256 bits.");
            }

            if (!forEncryption)
            {
                for (int i = 1, last = K.Length - 1; i < last; ++i)
                {
                    K[i] = Aes.InverseMixColumns(K[i]);
                }

                Array.Reverse(K);
            }

            return K;
        }

        private enum Mode { DEC_128, DEC_192, DEC_256, ENC_128, ENC_192, ENC_256, UNINITIALIZED };

        private Vector128<byte>[] m_roundKeys = null;
        private Mode m_mode = Mode.UNINITIALIZED;

        public AesEngine_X86()
        {
            if (!IsSupported)
                throw new PlatformNotSupportedException(nameof(AesEngine_X86));
        }

        public string AlgorithmName => "AES";

        public int GetBlockSize() => 16;

        public void Init(bool forEncryption, ICipherParameters parameters)
        {
            if (!(parameters is KeyParameter keyParameter))
            {
                ArgumentNullException.ThrowIfNull(parameters, nameof(parameters));
                throw new ArgumentException("invalid type: " + Platform.GetTypeName(parameters), nameof(parameters));
            }

            m_roundKeys = CreateRoundKeys(keyParameter.GetKey(), forEncryption);

            if (m_roundKeys.Length == 11)
            {
                m_mode = forEncryption ? Mode.ENC_128 : Mode.DEC_128;
            }
            else if (m_roundKeys.Length == 13)
            {
                m_mode = forEncryption ? Mode.ENC_192 : Mode.DEC_192;
            }
            else
            {
                m_mode = forEncryption ? Mode.ENC_256 : Mode.DEC_256;
            }
        }

        public int ProcessBlock(byte[] inBuf, int inOff, byte[] outBuf, int outOff)
        {
            Check.DataLength(inBuf, inOff, 16, "input buffer too short");
            Check.OutputLength(outBuf, outOff, 16, "output buffer too short");

            var state = Load128(inBuf.AsSpan(inOff, 16));
            ImplRounds(ref state);
            Store128(ref state, outBuf.AsSpan(outOff, 16));
            return 16;
        }

        public int ProcessBlock(ReadOnlySpan<byte> input, Span<byte> output)
        {
            Check.DataLength(input, 16, "input buffer too short");
            Check.OutputLength(output, 16, "output buffer too short");

            var state = Load128(input[..16]);
            ImplRounds(ref state);
            Store128(ref state, output[..16]);
            return 16;
        }

        public int ProcessFourBlocks(ReadOnlySpan<byte> input, Span<byte> output)
        {
            Check.DataLength(input, 64, "input buffer too short");
            Check.OutputLength(output, 64, "output buffer too short");

            var s1 = Load128(input[..16]);
            var s2 = Load128(input[16..32]);
            var s3 = Load128(input[32..48]);
            var s4 = Load128(input[48..64]);
            ImplRounds(ref s1, ref s2, ref s3, ref s4);
            Store128(ref s1, output[..16]);
            Store128(ref s2, output[16..32]);
            Store128(ref s3, output[32..48]);
            Store128(ref s4, output[48..64]);
            return 64;
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining | MethodImplOptions.AggressiveOptimization)]
        private void ImplRounds(ref Vector128<byte> state)
        {
            switch (m_mode)
            {
                case Mode.DEC_128: Decrypt128(m_roundKeys, ref state); break;
                case Mode.DEC_192: Decrypt192(m_roundKeys, ref state); break;
                case Mode.DEC_256: Decrypt256(m_roundKeys, ref state); break;
                case Mode.ENC_128: Encrypt128(m_roundKeys, ref state); break;
                case Mode.ENC_192: Encrypt192(m_roundKeys, ref state); break;
                case Mode.ENC_256: Encrypt256(m_roundKeys, ref state); break;
                default: throw new InvalidOperationException(nameof(AesEngine_X86) + " not initialised");
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining | MethodImplOptions.AggressiveOptimization)]
        private void ImplRounds(
            ref Vector128<byte> s1, ref Vector128<byte> s2, ref Vector128<byte> s3, ref Vector128<byte> s4)
        {
            switch (m_mode)
            {
                case Mode.DEC_128: DecryptFour128(m_roundKeys, ref s1, ref s2, ref s3, ref s4); break;
                case Mode.DEC_192: DecryptFour192(m_roundKeys, ref s1, ref s2, ref s3, ref s4); break;
                case Mode.DEC_256: DecryptFour256(m_roundKeys, ref s1, ref s2, ref s3, ref s4); break;
                case Mode.ENC_128: EncryptFour128(m_roundKeys, ref s1, ref s2, ref s3, ref s4); break;
                case Mode.ENC_192: EncryptFour192(m_roundKeys, ref s1, ref s2, ref s3, ref s4); break;
                case Mode.ENC_256: EncryptFour256(m_roundKeys, ref s1, ref s2, ref s3, ref s4); break;
                default: throw new InvalidOperationException(nameof(AesEngine_X86) + " not initialised");
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining | MethodImplOptions.AggressiveOptimization)]
        private static void Decrypt128(Vector128<byte>[] roundKeys, ref Vector128<byte> state)
        {
            state = Sse2.Xor(state, roundKeys[0]);
            state = Aes.Decrypt(state, roundKeys[1]);
            state = Aes.Decrypt(state, roundKeys[2]);
            state = Aes.Decrypt(state, roundKeys[3]);
            state = Aes.Decrypt(state, roundKeys[4]);
            state = Aes.Decrypt(state, roundKeys[5]);
            state = Aes.Decrypt(state, roundKeys[6]);
            state = Aes.Decrypt(state, roundKeys[7]);
            state = Aes.Decrypt(state, roundKeys[8]);
            state = Aes.Decrypt(state, roundKeys[9]);
            state = Aes.DecryptLast(state, roundKeys[10]);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining | MethodImplOptions.AggressiveOptimization)]
        private static void Decrypt192(Vector128<byte>[] roundKeys, ref Vector128<byte> state)
        {
            state = Sse2.Xor(state, roundKeys[0]);
            state = Aes.Decrypt(state, roundKeys[1]);
            state = Aes.Decrypt(state, roundKeys[2]);
            state = Aes.Decrypt(state, roundKeys[3]);
            state = Aes.Decrypt(state, roundKeys[4]);
            state = Aes.Decrypt(state, roundKeys[5]);
            state = Aes.Decrypt(state, roundKeys[6]);
            state = Aes.Decrypt(state, roundKeys[7]);
            state = Aes.Decrypt(state, roundKeys[8]);
            state = Aes.Decrypt(state, roundKeys[9]);
            state = Aes.Decrypt(state, roundKeys[10]);
            state = Aes.Decrypt(state, roundKeys[11]);
            state = Aes.DecryptLast(state, roundKeys[12]);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining | MethodImplOptions.AggressiveOptimization)]
        private static void Decrypt256(Vector128<byte>[] roundKeys, ref Vector128<byte> state)
        {
            state = Sse2.Xor(state, roundKeys[0]);
            state = Aes.Decrypt(state, roundKeys[1]);
            state = Aes.Decrypt(state, roundKeys[2]);
            state = Aes.Decrypt(state, roundKeys[3]);
            state = Aes.Decrypt(state, roundKeys[4]);
            state = Aes.Decrypt(state, roundKeys[5]);
            state = Aes.Decrypt(state, roundKeys[6]);
            state = Aes.Decrypt(state, roundKeys[7]);
            state = Aes.Decrypt(state, roundKeys[8]);
            state = Aes.Decrypt(state, roundKeys[9]);
            state = Aes.Decrypt(state, roundKeys[10]);
            state = Aes.Decrypt(state, roundKeys[11]);
            state = Aes.Decrypt(state, roundKeys[12]);
            state = Aes.Decrypt(state, roundKeys[13]);
            state = Aes.DecryptLast(state, roundKeys[14]);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining | MethodImplOptions.AggressiveOptimization)]
        private static void DecryptFour128(Vector128<byte>[] rk,
            ref Vector128<byte> s1, ref Vector128<byte> s2, ref Vector128<byte> s3, ref Vector128<byte> s4)
        {
            s1 = Sse2.Xor(s1, rk[0]);
            s2 = Sse2.Xor(s2, rk[0]);
            s3 = Sse2.Xor(s3, rk[0]);
            s4 = Sse2.Xor(s4, rk[0]);

            s1 = Aes.Decrypt(s1, rk[1]);
            s2 = Aes.Decrypt(s2, rk[1]);
            s3 = Aes.Decrypt(s3, rk[1]);
            s4 = Aes.Decrypt(s4, rk[1]);

            s1 = Aes.Decrypt(s1, rk[2]);
            s2 = Aes.Decrypt(s2, rk[2]);
            s3 = Aes.Decrypt(s3, rk[2]);
            s4 = Aes.Decrypt(s4, rk[2]);

            s1 = Aes.Decrypt(s1, rk[3]);
            s2 = Aes.Decrypt(s2, rk[3]);
            s3 = Aes.Decrypt(s3, rk[3]);
            s4 = Aes.Decrypt(s4, rk[3]);

            s1 = Aes.Decrypt(s1, rk[4]);
            s2 = Aes.Decrypt(s2, rk[4]);
            s3 = Aes.Decrypt(s3, rk[4]);
            s4 = Aes.Decrypt(s4, rk[4]);

            s1 = Aes.Decrypt(s1, rk[5]);
            s2 = Aes.Decrypt(s2, rk[5]);
            s3 = Aes.Decrypt(s3, rk[5]);
            s4 = Aes.Decrypt(s4, rk[5]);

            s1 = Aes.Decrypt(s1, rk[6]);
            s2 = Aes.Decrypt(s2, rk[6]);
            s3 = Aes.Decrypt(s3, rk[6]);
            s4 = Aes.Decrypt(s4, rk[6]);

            s1 = Aes.Decrypt(s1, rk[7]);
            s2 = Aes.Decrypt(s2, rk[7]);
            s3 = Aes.Decrypt(s3, rk[7]);
            s4 = Aes.Decrypt(s4, rk[7]);

            s1 = Aes.Decrypt(s1, rk[8]);
            s2 = Aes.Decrypt(s2, rk[8]);
            s3 = Aes.Decrypt(s3, rk[8]);
            s4 = Aes.Decrypt(s4, rk[8]);

            s1 = Aes.Decrypt(s1, rk[9]);
            s2 = Aes.Decrypt(s2, rk[9]);
            s3 = Aes.Decrypt(s3, rk[9]);
            s4 = Aes.Decrypt(s4, rk[9]);

            s1 = Aes.DecryptLast(s1, rk[10]);
            s2 = Aes.DecryptLast(s2, rk[10]);
            s3 = Aes.DecryptLast(s3, rk[10]);
            s4 = Aes.DecryptLast(s4, rk[10]);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining | MethodImplOptions.AggressiveOptimization)]
        private static void DecryptFour192(Vector128<byte>[] rk,
            ref Vector128<byte> s1, ref Vector128<byte> s2, ref Vector128<byte> s3, ref Vector128<byte> s4)
        {
            s1 = Sse2.Xor(s1, rk[0]);
            s2 = Sse2.Xor(s2, rk[0]);
            s3 = Sse2.Xor(s3, rk[0]);
            s4 = Sse2.Xor(s4, rk[0]);

            s1 = Aes.Decrypt(s1, rk[1]);
            s2 = Aes.Decrypt(s2, rk[1]);
            s3 = Aes.Decrypt(s3, rk[1]);
            s4 = Aes.Decrypt(s4, rk[1]);

            s1 = Aes.Decrypt(s1, rk[2]);
            s2 = Aes.Decrypt(s2, rk[2]);
            s3 = Aes.Decrypt(s3, rk[2]);
            s4 = Aes.Decrypt(s4, rk[2]);

            s1 = Aes.Decrypt(s1, rk[3]);
            s2 = Aes.Decrypt(s2, rk[3]);
            s3 = Aes.Decrypt(s3, rk[3]);
            s4 = Aes.Decrypt(s4, rk[3]);

            s1 = Aes.Decrypt(s1, rk[4]);
            s2 = Aes.Decrypt(s2, rk[4]);
            s3 = Aes.Decrypt(s3, rk[4]);
            s4 = Aes.Decrypt(s4, rk[4]);

            s1 = Aes.Decrypt(s1, rk[5]);
            s2 = Aes.Decrypt(s2, rk[5]);
            s3 = Aes.Decrypt(s3, rk[5]);
            s4 = Aes.Decrypt(s4, rk[5]);

            s1 = Aes.Decrypt(s1, rk[6]);
            s2 = Aes.Decrypt(s2, rk[6]);
            s3 = Aes.Decrypt(s3, rk[6]);
            s4 = Aes.Decrypt(s4, rk[6]);

            s1 = Aes.Decrypt(s1, rk[7]);
            s2 = Aes.Decrypt(s2, rk[7]);
            s3 = Aes.Decrypt(s3, rk[7]);
            s4 = Aes.Decrypt(s4, rk[7]);

            s1 = Aes.Decrypt(s1, rk[8]);
            s2 = Aes.Decrypt(s2, rk[8]);
            s3 = Aes.Decrypt(s3, rk[8]);
            s4 = Aes.Decrypt(s4, rk[8]);

            s1 = Aes.Decrypt(s1, rk[9]);
            s2 = Aes.Decrypt(s2, rk[9]);
            s3 = Aes.Decrypt(s3, rk[9]);
            s4 = Aes.Decrypt(s4, rk[9]);

            s1 = Aes.Decrypt(s1, rk[10]);
            s2 = Aes.Decrypt(s2, rk[10]);
            s3 = Aes.Decrypt(s3, rk[10]);
            s4 = Aes.Decrypt(s4, rk[10]);

            s1 = Aes.Decrypt(s1, rk[11]);
            s2 = Aes.Decrypt(s2, rk[11]);
            s3 = Aes.Decrypt(s3, rk[11]);
            s4 = Aes.Decrypt(s4, rk[11]);

            s1 = Aes.DecryptLast(s1, rk[12]);
            s2 = Aes.DecryptLast(s2, rk[12]);
            s3 = Aes.DecryptLast(s3, rk[12]);
            s4 = Aes.DecryptLast(s4, rk[12]);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining | MethodImplOptions.AggressiveOptimization)]
        private static void DecryptFour256(Vector128<byte>[] rk,
            ref Vector128<byte> s1, ref Vector128<byte> s2, ref Vector128<byte> s3, ref Vector128<byte> s4)
        {
            s1 = Sse2.Xor(s1, rk[0]);
            s2 = Sse2.Xor(s2, rk[0]);
            s3 = Sse2.Xor(s3, rk[0]);
            s4 = Sse2.Xor(s4, rk[0]);

            s1 = Aes.Decrypt(s1, rk[1]);
            s2 = Aes.Decrypt(s2, rk[1]);
            s3 = Aes.Decrypt(s3, rk[1]);
            s4 = Aes.Decrypt(s4, rk[1]);

            s1 = Aes.Decrypt(s1, rk[2]);
            s2 = Aes.Decrypt(s2, rk[2]);
            s3 = Aes.Decrypt(s3, rk[2]);
            s4 = Aes.Decrypt(s4, rk[2]);

            s1 = Aes.Decrypt(s1, rk[3]);
            s2 = Aes.Decrypt(s2, rk[3]);
            s3 = Aes.Decrypt(s3, rk[3]);
            s4 = Aes.Decrypt(s4, rk[3]);

            s1 = Aes.Decrypt(s1, rk[4]);
            s2 = Aes.Decrypt(s2, rk[4]);
            s3 = Aes.Decrypt(s3, rk[4]);
            s4 = Aes.Decrypt(s4, rk[4]);

            s1 = Aes.Decrypt(s1, rk[5]);
            s2 = Aes.Decrypt(s2, rk[5]);
            s3 = Aes.Decrypt(s3, rk[5]);
            s4 = Aes.Decrypt(s4, rk[5]);

            s1 = Aes.Decrypt(s1, rk[6]);
            s2 = Aes.Decrypt(s2, rk[6]);
            s3 = Aes.Decrypt(s3, rk[6]);
            s4 = Aes.Decrypt(s4, rk[6]);

            s1 = Aes.Decrypt(s1, rk[7]);
            s2 = Aes.Decrypt(s2, rk[7]);
            s3 = Aes.Decrypt(s3, rk[7]);
            s4 = Aes.Decrypt(s4, rk[7]);

            s1 = Aes.Decrypt(s1, rk[8]);
            s2 = Aes.Decrypt(s2, rk[8]);
            s3 = Aes.Decrypt(s3, rk[8]);
            s4 = Aes.Decrypt(s4, rk[8]);

            s1 = Aes.Decrypt(s1, rk[9]);
            s2 = Aes.Decrypt(s2, rk[9]);
            s3 = Aes.Decrypt(s3, rk[9]);
            s4 = Aes.Decrypt(s4, rk[9]);

            s1 = Aes.Decrypt(s1, rk[10]);
            s2 = Aes.Decrypt(s2, rk[10]);
            s3 = Aes.Decrypt(s3, rk[10]);
            s4 = Aes.Decrypt(s4, rk[10]);

            s1 = Aes.Decrypt(s1, rk[11]);
            s2 = Aes.Decrypt(s2, rk[11]);
            s3 = Aes.Decrypt(s3, rk[11]);
            s4 = Aes.Decrypt(s4, rk[11]);

            s1 = Aes.Decrypt(s1, rk[12]);
            s2 = Aes.Decrypt(s2, rk[12]);
            s3 = Aes.Decrypt(s3, rk[12]);
            s4 = Aes.Decrypt(s4, rk[12]);

            s1 = Aes.Decrypt(s1, rk[13]);
            s2 = Aes.Decrypt(s2, rk[13]);
            s3 = Aes.Decrypt(s3, rk[13]);
            s4 = Aes.Decrypt(s4, rk[13]);

            s1 = Aes.DecryptLast(s1, rk[14]);
            s2 = Aes.DecryptLast(s2, rk[14]);
            s3 = Aes.DecryptLast(s3, rk[14]);
            s4 = Aes.DecryptLast(s4, rk[14]);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining | MethodImplOptions.AggressiveOptimization)]
        private static void Encrypt128(Vector128<byte>[] roundKeys, ref Vector128<byte> state)
        {
            state = Sse2.Xor(state, roundKeys[0]);
            state = Aes.Encrypt(state, roundKeys[1]);
            state = Aes.Encrypt(state, roundKeys[2]);
            state = Aes.Encrypt(state, roundKeys[3]);
            state = Aes.Encrypt(state, roundKeys[4]);
            state = Aes.Encrypt(state, roundKeys[5]);
            state = Aes.Encrypt(state, roundKeys[6]);
            state = Aes.Encrypt(state, roundKeys[7]);
            state = Aes.Encrypt(state, roundKeys[8]);
            state = Aes.Encrypt(state, roundKeys[9]);
            state = Aes.EncryptLast(state, roundKeys[10]);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining | MethodImplOptions.AggressiveOptimization)]
        private static void Encrypt192(Vector128<byte>[] roundKeys, ref Vector128<byte> state)
        {
            state = Sse2.Xor(state, roundKeys[0]);
            state = Aes.Encrypt(state, roundKeys[1]);
            state = Aes.Encrypt(state, roundKeys[2]);
            state = Aes.Encrypt(state, roundKeys[3]);
            state = Aes.Encrypt(state, roundKeys[4]);
            state = Aes.Encrypt(state, roundKeys[5]);
            state = Aes.Encrypt(state, roundKeys[6]);
            state = Aes.Encrypt(state, roundKeys[7]);
            state = Aes.Encrypt(state, roundKeys[8]);
            state = Aes.Encrypt(state, roundKeys[9]);
            state = Aes.Encrypt(state, roundKeys[10]);
            state = Aes.Encrypt(state, roundKeys[11]);
            state = Aes.EncryptLast(state, roundKeys[12]);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining | MethodImplOptions.AggressiveOptimization)]
        private static void Encrypt256(Vector128<byte>[] roundKeys, ref Vector128<byte> state)
        {
            state = Sse2.Xor(state, roundKeys[0]);
            state = Aes.Encrypt(state, roundKeys[1]);
            state = Aes.Encrypt(state, roundKeys[2]);
            state = Aes.Encrypt(state, roundKeys[3]);
            state = Aes.Encrypt(state, roundKeys[4]);
            state = Aes.Encrypt(state, roundKeys[5]);
            state = Aes.Encrypt(state, roundKeys[6]);
            state = Aes.Encrypt(state, roundKeys[7]);
            state = Aes.Encrypt(state, roundKeys[8]);
            state = Aes.Encrypt(state, roundKeys[9]);
            state = Aes.Encrypt(state, roundKeys[10]);
            state = Aes.Encrypt(state, roundKeys[11]);
            state = Aes.Encrypt(state, roundKeys[12]);
            state = Aes.Encrypt(state, roundKeys[13]);
            state = Aes.EncryptLast(state, roundKeys[14]);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining | MethodImplOptions.AggressiveOptimization)]
        private static void EncryptFour128(Vector128<byte>[] rk,
            ref Vector128<byte> s1, ref Vector128<byte> s2, ref Vector128<byte> s3, ref Vector128<byte> s4)
        {
            s1 = Sse2.Xor(s1, rk[0]);
            s2 = Sse2.Xor(s2, rk[0]);
            s3 = Sse2.Xor(s3, rk[0]);
            s4 = Sse2.Xor(s4, rk[0]);

            s1 = Aes.Encrypt(s1, rk[1]);
            s2 = Aes.Encrypt(s2, rk[1]);
            s3 = Aes.Encrypt(s3, rk[1]);
            s4 = Aes.Encrypt(s4, rk[1]);

            s1 = Aes.Encrypt(s1, rk[2]);
            s2 = Aes.Encrypt(s2, rk[2]);
            s3 = Aes.Encrypt(s3, rk[2]);
            s4 = Aes.Encrypt(s4, rk[2]);

            s1 = Aes.Encrypt(s1, rk[3]);
            s2 = Aes.Encrypt(s2, rk[3]);
            s3 = Aes.Encrypt(s3, rk[3]);
            s4 = Aes.Encrypt(s4, rk[3]);

            s1 = Aes.Encrypt(s1, rk[4]);
            s2 = Aes.Encrypt(s2, rk[4]);
            s3 = Aes.Encrypt(s3, rk[4]);
            s4 = Aes.Encrypt(s4, rk[4]);

            s1 = Aes.Encrypt(s1, rk[5]);
            s2 = Aes.Encrypt(s2, rk[5]);
            s3 = Aes.Encrypt(s3, rk[5]);
            s4 = Aes.Encrypt(s4, rk[5]);

            s1 = Aes.Encrypt(s1, rk[6]);
            s2 = Aes.Encrypt(s2, rk[6]);
            s3 = Aes.Encrypt(s3, rk[6]);
            s4 = Aes.Encrypt(s4, rk[6]);

            s1 = Aes.Encrypt(s1, rk[7]);
            s2 = Aes.Encrypt(s2, rk[7]);
            s3 = Aes.Encrypt(s3, rk[7]);
            s4 = Aes.Encrypt(s4, rk[7]);

            s1 = Aes.Encrypt(s1, rk[8]);
            s2 = Aes.Encrypt(s2, rk[8]);
            s3 = Aes.Encrypt(s3, rk[8]);
            s4 = Aes.Encrypt(s4, rk[8]);

            s1 = Aes.Encrypt(s1, rk[9]);
            s2 = Aes.Encrypt(s2, rk[9]);
            s3 = Aes.Encrypt(s3, rk[9]);
            s4 = Aes.Encrypt(s4, rk[9]);

            s1 = Aes.EncryptLast(s1, rk[10]);
            s2 = Aes.EncryptLast(s2, rk[10]);
            s3 = Aes.EncryptLast(s3, rk[10]);
            s4 = Aes.EncryptLast(s4, rk[10]);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining | MethodImplOptions.AggressiveOptimization)]
        private static void EncryptFour192(Vector128<byte>[] rk,
            ref Vector128<byte> s1, ref Vector128<byte> s2, ref Vector128<byte> s3, ref Vector128<byte> s4)
        {
            s1 = Sse2.Xor(s1, rk[0]);
            s2 = Sse2.Xor(s2, rk[0]);
            s3 = Sse2.Xor(s3, rk[0]);
            s4 = Sse2.Xor(s4, rk[0]);

            s1 = Aes.Encrypt(s1, rk[1]);
            s2 = Aes.Encrypt(s2, rk[1]);
            s3 = Aes.Encrypt(s3, rk[1]);
            s4 = Aes.Encrypt(s4, rk[1]);

            s1 = Aes.Encrypt(s1, rk[2]);
            s2 = Aes.Encrypt(s2, rk[2]);
            s3 = Aes.Encrypt(s3, rk[2]);
            s4 = Aes.Encrypt(s4, rk[2]);

            s1 = Aes.Encrypt(s1, rk[3]);
            s2 = Aes.Encrypt(s2, rk[3]);
            s3 = Aes.Encrypt(s3, rk[3]);
            s4 = Aes.Encrypt(s4, rk[3]);

            s1 = Aes.Encrypt(s1, rk[4]);
            s2 = Aes.Encrypt(s2, rk[4]);
            s3 = Aes.Encrypt(s3, rk[4]);
            s4 = Aes.Encrypt(s4, rk[4]);

            s1 = Aes.Encrypt(s1, rk[5]);
            s2 = Aes.Encrypt(s2, rk[5]);
            s3 = Aes.Encrypt(s3, rk[5]);
            s4 = Aes.Encrypt(s4, rk[5]);

            s1 = Aes.Encrypt(s1, rk[6]);
            s2 = Aes.Encrypt(s2, rk[6]);
            s3 = Aes.Encrypt(s3, rk[6]);
            s4 = Aes.Encrypt(s4, rk[6]);

            s1 = Aes.Encrypt(s1, rk[7]);
            s2 = Aes.Encrypt(s2, rk[7]);
            s3 = Aes.Encrypt(s3, rk[7]);
            s4 = Aes.Encrypt(s4, rk[7]);

            s1 = Aes.Encrypt(s1, rk[8]);
            s2 = Aes.Encrypt(s2, rk[8]);
            s3 = Aes.Encrypt(s3, rk[8]);
            s4 = Aes.Encrypt(s4, rk[8]);

            s1 = Aes.Encrypt(s1, rk[9]);
            s2 = Aes.Encrypt(s2, rk[9]);
            s3 = Aes.Encrypt(s3, rk[9]);
            s4 = Aes.Encrypt(s4, rk[9]);

            s1 = Aes.Encrypt(s1, rk[10]);
            s2 = Aes.Encrypt(s2, rk[10]);
            s3 = Aes.Encrypt(s3, rk[10]);
            s4 = Aes.Encrypt(s4, rk[10]);

            s1 = Aes.Encrypt(s1, rk[11]);
            s2 = Aes.Encrypt(s2, rk[11]);
            s3 = Aes.Encrypt(s3, rk[11]);
            s4 = Aes.Encrypt(s4, rk[11]);

            s1 = Aes.EncryptLast(s1, rk[12]);
            s2 = Aes.EncryptLast(s2, rk[12]);
            s3 = Aes.EncryptLast(s3, rk[12]);
            s4 = Aes.EncryptLast(s4, rk[12]);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining | MethodImplOptions.AggressiveOptimization)]
        private static void EncryptFour256(Vector128<byte>[] rk,
            ref Vector128<byte> s1, ref Vector128<byte> s2, ref Vector128<byte> s3, ref Vector128<byte> s4)
        {
            s1 = Sse2.Xor(s1, rk[0]);
            s2 = Sse2.Xor(s2, rk[0]);
            s3 = Sse2.Xor(s3, rk[0]);
            s4 = Sse2.Xor(s4, rk[0]);

            s1 = Aes.Encrypt(s1, rk[1]);
            s2 = Aes.Encrypt(s2, rk[1]);
            s3 = Aes.Encrypt(s3, rk[1]);
            s4 = Aes.Encrypt(s4, rk[1]);

            s1 = Aes.Encrypt(s1, rk[2]);
            s2 = Aes.Encrypt(s2, rk[2]);
            s3 = Aes.Encrypt(s3, rk[2]);
            s4 = Aes.Encrypt(s4, rk[2]);

            s1 = Aes.Encrypt(s1, rk[3]);
            s2 = Aes.Encrypt(s2, rk[3]);
            s3 = Aes.Encrypt(s3, rk[3]);
            s4 = Aes.Encrypt(s4, rk[3]);

            s1 = Aes.Encrypt(s1, rk[4]);
            s2 = Aes.Encrypt(s2, rk[4]);
            s3 = Aes.Encrypt(s3, rk[4]);
            s4 = Aes.Encrypt(s4, rk[4]);

            s1 = Aes.Encrypt(s1, rk[5]);
            s2 = Aes.Encrypt(s2, rk[5]);
            s3 = Aes.Encrypt(s3, rk[5]);
            s4 = Aes.Encrypt(s4, rk[5]);

            s1 = Aes.Encrypt(s1, rk[6]);
            s2 = Aes.Encrypt(s2, rk[6]);
            s3 = Aes.Encrypt(s3, rk[6]);
            s4 = Aes.Encrypt(s4, rk[6]);

            s1 = Aes.Encrypt(s1, rk[7]);
            s2 = Aes.Encrypt(s2, rk[7]);
            s3 = Aes.Encrypt(s3, rk[7]);
            s4 = Aes.Encrypt(s4, rk[7]);

            s1 = Aes.Encrypt(s1, rk[8]);
            s2 = Aes.Encrypt(s2, rk[8]);
            s3 = Aes.Encrypt(s3, rk[8]);
            s4 = Aes.Encrypt(s4, rk[8]);

            s1 = Aes.Encrypt(s1, rk[9]);
            s2 = Aes.Encrypt(s2, rk[9]);
            s3 = Aes.Encrypt(s3, rk[9]);
            s4 = Aes.Encrypt(s4, rk[9]);

            s1 = Aes.Encrypt(s1, rk[10]);
            s2 = Aes.Encrypt(s2, rk[10]);
            s3 = Aes.Encrypt(s3, rk[10]);
            s4 = Aes.Encrypt(s4, rk[10]);

            s1 = Aes.Encrypt(s1, rk[11]);
            s2 = Aes.Encrypt(s2, rk[11]);
            s3 = Aes.Encrypt(s3, rk[11]);
            s4 = Aes.Encrypt(s4, rk[11]);

            s1 = Aes.Encrypt(s1, rk[12]);
            s2 = Aes.Encrypt(s2, rk[12]);
            s3 = Aes.Encrypt(s3, rk[12]);
            s4 = Aes.Encrypt(s4, rk[12]);

            s1 = Aes.Encrypt(s1, rk[13]);
            s2 = Aes.Encrypt(s2, rk[13]);
            s3 = Aes.Encrypt(s3, rk[13]);
            s4 = Aes.Encrypt(s4, rk[13]);

            s1 = Aes.EncryptLast(s1, rk[14]);
            s2 = Aes.EncryptLast(s2, rk[14]);
            s3 = Aes.EncryptLast(s3, rk[14]);
            s4 = Aes.EncryptLast(s4, rk[14]);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining | MethodImplOptions.AggressiveOptimization)]
        private static Vector128<byte> Load128(ReadOnlySpan<byte> t)
        {
#if NET7_0_OR_GREATER
            return Vector128.Create<byte>(t);
#else
            if (BitConverter.IsLittleEndian && Unsafe.SizeOf<Vector128<byte>>() == 16)
                return Unsafe.ReadUnaligned<Vector128<byte>>(ref Unsafe.AsRef(t[0]));

            return Vector128.Create(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9], t[10], t[11], t[12],
                t[13], t[14], t[15]);
#endif
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining | MethodImplOptions.AggressiveOptimization)]
        private static Vector64<byte> Load64(ReadOnlySpan<byte> t)
        {
#if NET7_0_OR_GREATER
            return Vector64.Create<byte>(t);
#else
            if (BitConverter.IsLittleEndian && Unsafe.SizeOf<Vector64<byte>>() == 8)
                return Unsafe.ReadUnaligned<Vector64<byte>>(ref Unsafe.AsRef(t[0]));

            return Vector64.Create(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7]);
#endif
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining | MethodImplOptions.AggressiveOptimization)]
        private static void Store128(ref Vector128<byte> s, Span<byte> t)
        {
#if NET7_0_OR_GREATER
            Vector128.CopyTo(s, t);
#else
            if (BitConverter.IsLittleEndian && Unsafe.SizeOf<Vector128<byte>>() == 16)
            {
                Unsafe.WriteUnaligned(ref t[0], s);
                return;
            }

            var u = s.AsUInt64();
            Utilities.Pack.UInt64_To_LE(u.GetElement(0), t);
            Utilities.Pack.UInt64_To_LE(u.GetElement(1), t[8..]);
#endif
        }
    }
}
#endif
