using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.SphincsPlus
{
    /**
     * Haraka-512 v2, https://eprint.iacr.org/2016/098.pdf
     * <p>
     * Haraka512-256 with reference to Python Reference Impl from: https://github.com/sphincs/sphincsplus
     * </p>
     */
    internal class HarakaSBase
    {
        internal ulong[][] haraka512_rc = new ulong[][]{
            new ulong[]{0x24cf0ab9086f628bL, 0xbdd6eeecc83b8382L, 0xd96fb0306cdad0a7L, 0xaace082ac8f95f89L, 0x449d8e8870d7041fL, 0x49bb2f80b2b3e2f8L, 0x0569ae98d93bb258L, 0x23dc9691e7d6a4b1L},
            new ulong[]{0xd8ba10ede0fe5b6eL, 0x7ecf7dbe424c7b8eL, 0x6ea9949c6df62a31L, 0xbf3f3c97ec9c313eL, 0x241d03a196a1861eL, 0xead3a51116e5a2eaL, 0x77d479fcad9574e3L, 0x18657a1af894b7a0L},
            new ulong[]{0x10671e1a7f595522L, 0xd9a00ff675d28c7bL, 0x2f1edf0d2b9ba661L, 0xb8ff58b8e3de45f9L, 0xee29261da9865c02L, 0xd1532aa4b50bdf43L, 0x8bf858159b231bb1L, 0xdf17439d22d4f599L},
            new ulong[]{0xdd4b2f0870b918c0L, 0x757a81f3b39b1bb6L, 0x7a5c556898952e3fL, 0x7dd70a16d915d87aL, 0x3ae61971982b8301L, 0xc3ab319e030412beL, 0x17c0033ac094a8cbL, 0x5a0630fc1a8dc4efL},
            new ulong[]{0x17708988c1632f73L, 0xf92ddae090b44f4fL, 0x11ac0285c43aa314L, 0x509059941936b8baL, 0xd03e152fa2ce9b69L, 0x3fbcbcb63a32998bL, 0x6204696d692254f7L, 0x915542ed93ec59b4L},
            new ulong[]{0xf4ed94aa8879236eL, 0xff6cb41cd38e03c0L, 0x069b38602368aeabL, 0x669495b820f0ddbaL, 0xf42013b1b8bf9e3dL, 0xcf935efe6439734dL, 0xbc1dcf42ca29e3f8L, 0x7e6d3ed29f78ad67L},
            new ulong[]{0xf3b0f6837ffcddaaL, 0x3a76faef934ddf41L, 0xcec7ae583a9c8e35L, 0xe4dd18c68f0260afL, 0x2c0e5df1ad398eaaL, 0x478df5236ae22e8cL, 0xfb944c46fe865f39L, 0xaa48f82f028132baL},
            new ulong[]{0x231b9ae2b76aca77L, 0x292a76a712db0b40L, 0x5850625dc8134491L, 0x73137dd469810fb5L, 0x8a12a6a202a474fdL, 0xd36fd9daa78bdb80L, 0xb34c5e733505706fL, 0xbaf1cdca818d9d96L},
            new ulong[]{0x2e99781335e8c641L, 0xbddfe5cce47d560eL, 0xf74e9bf32e5e040cL, 0x1d7a709d65996be9L, 0x670df36a9cf66cddL, 0xd05ef84a176a2875L, 0x0f888e828cb1c44eL, 0x1a79e9c9727b052cL},
            new ulong[]{0x83497348628d84deL, 0x2e9387d51f22a754L, 0xb000068da2f852d6L, 0x378c9e1190fd6fe5L, 0x870027c316de7293L, 0xe51a9d4462e047bbL, 0x90ecf7f8c6251195L, 0x655953bfbed90a9cL},
        };

        internal uint[][] haraka256_rc = new uint[10][];

        protected readonly byte[] buffer;
        protected int off;

        protected HarakaSBase()
        {
            this.buffer = new byte[64];
            off = 0;
        }

        protected void Reset()
        {
            off = 0;
            Arrays.Clear(buffer);
        }

        private void BrRangeDec32Le(byte[] input, uint[] output, int inputPos)
        {
            int tmp;
            for (int i = 0; i < output.Length; ++i)
            {
                tmp = inputPos + (i << 2);
                output[i] = (uint)(input[tmp] & 0xFF) | (uint)((input[tmp + 1] << 8) & 0xFF00) | (uint)((input[tmp + 2] << 16) & 0xFF0000) | (uint)(input[tmp + 3] << 24);
            }
        }

        protected void InterleaveConstant(ulong[] output, byte[] input, int startPos)
        {
            uint[] tmp_32_constant = new uint[16];
            BrRangeDec32Le(input, tmp_32_constant, startPos);
            for (int i = 0; i < 4; ++i)
            {
                BrAesCt64InterleaveIn(output, i, tmp_32_constant, i << 2);
            }
            BrAesCt64Ortho(output);
        }

        protected void InterleaveConstant32(uint[] output, byte[] input, int startPos)
        {
            for (int i = 0; i < 4; ++i)
            {
                output[i << 1] = BrDec32Le(input, startPos + (i << 2));
                output[(i << 1) + 1] = BrDec32Le(input, startPos + (i << 2) + 16);
            }
            BrAesCtOrtho(output);
        }

        private uint BrDec32Le(byte[] input, int startPos)
        {
            return (uint)(input[startPos] & 0xFF) | (uint)((input[startPos + 1] << 8) & 0xFF00)
                | (((uint)input[startPos + 2] << 16) & 0xFF0000) | ((uint)input[startPos + 3] << 24);
        }

        protected void Haraka512Perm(byte[] output)
        {
            uint[] w = new uint[16];
            ulong[] q = new ulong[8];
            ulong tmp_q;
            int i, j;
            BrRangeDec32Le(buffer, w, 0);
            for (i = 0; i < 4; ++i)
            {
                BrAesCt64InterleaveIn(q, i, w, i << 2);
            }
            BrAesCt64Ortho(q);
            for (i = 0; i < 5; ++i)
            {
                for (j = 0; j < 2; ++j)
                {
                    BrAesCt64BitsliceSbox(q);
                    ShiftRows(q);
                    MixColumns(q);
                    AddRoundKey(q, haraka512_rc[(i << 1) + j]);
                }
                for (j = 0; j < 8; j++)
                {
                    tmp_q = q[j];
                    q[j] = (tmp_q & 0x0001000100010001L) << 5 |
                        (tmp_q & 0x0002000200020002L) << 12 |
                        (tmp_q & 0x0004000400040004L) >> 1 |
                        (tmp_q & 0x0008000800080008L) << 6 |
                        (tmp_q & 0x0020002000200020L) << 9 |
                        (tmp_q & 0x0040004000400040L) >> 4 |
                        (tmp_q & 0x0080008000800080L) << 3 |
                        (tmp_q & 0x2100210021002100L) >> 5 |
                        (tmp_q & 0x0210021002100210L) << 2 |
                        (tmp_q & 0x0800080008000800L) << 4 |
                        (tmp_q & 0x1000100010001000L) >> 12 |
                        (tmp_q & 0x4000400040004000L) >> 10 |
                        (tmp_q & 0x8400840084008400L) >> 3;
                }
            }
            BrAesCt64Ortho(q);
            for (i = 0; i < 4; i++)
            {
                BrAesCt64InterleaveOut(w, q, i);
            }
            for (i = 0; i < 16; ++i)
            {
                for (j = 0; j < 4; ++j)
                {
                    output[(i << 2) + j] = (byte)((w[i] >> (j << 3)) & 0xFF);
                }
            }
        }

        protected void Haraka256Perm(byte[] output)
        {
            uint[] q = new uint[8];
            int i, j;
            uint tmp_q;
            InterleaveConstant32(q, buffer, 0);
            for (i = 0; i < 5; ++i)
            {
                for (j = 0; j < 2; ++j)
                {
                    BrAesCtBitsliceSbox(q);
                    ShiftRows32(q);
                    MixColumns32(q);
                    AddRoundKey32(q, haraka256_rc[(i << 1) + j]);
                }
                for (j = 0; j < 8; j++)
                {
                    tmp_q = q[j];
                    q[j] = (tmp_q & 0x81818181) |
                        (tmp_q & 0x02020202) << 1 |
                        (tmp_q & 0x04040404) << 2 |
                        (tmp_q & 0x08080808) << 3 |
                        (tmp_q & 0x10101010) >> 3 |
                        (tmp_q & 0x20202020) >> 2 |
                        (tmp_q & 0x40404040) >> 1;
                }
            }
            BrAesCtOrtho(q);
            for (i = 0; i < 4; i++)
            {
                BrEnc32Le(output, q[i << 1], i << 2);
                BrEnc32Le(output, q[(i << 1) + 1], (i << 2) + 16);
            }

            for (i = 0; i < 32; i++)
            {
                output[i] ^= buffer[i];
            }
        }

        private void BrEnc32Le(byte[] dst, uint x, int startPos)
        {
            for (int i = 0; i < 4; ++i)
            {
                dst[startPos + i] = (byte)(x >> (i << 3));
            }
        }

        private void BrAesCt64InterleaveIn(ulong[] q, int qPos, uint[] w, int startPos)
        {
            ulong x0, x1, x2, x3;
            x0 = (ulong)w[startPos] & 0x00000000FFFFFFFFL;
            x1 = (ulong)w[startPos + 1] & 0x00000000FFFFFFFFL;
            x2 = (ulong)w[startPos + 2] & 0x00000000FFFFFFFFL;
            x3 = (ulong)w[startPos + 3] & 0x00000000FFFFFFFFL;
            x0 |= x0 << 16;
            x1 |= x1 << 16;
            x2 |= x2 << 16;
            x3 |= x3 << 16;
            x0 &= 0x0000FFFF0000FFFFL;
            x1 &= 0x0000FFFF0000FFFFL;
            x2 &= 0x0000FFFF0000FFFFL;
            x3 &= 0x0000FFFF0000FFFFL;
            x0 |= x0 << 8;
            x1 |= x1 << 8;
            x2 |= x2 << 8;
            x3 |= x3 << 8;
            x0 &= 0x00FF00FF00FF00FFL;
            x1 &= 0x00FF00FF00FF00FFL;
            x2 &= 0x00FF00FF00FF00FFL;
            x3 &= 0x00FF00FF00FF00FFL;
            q[qPos] = x0 | (x2 << 8);
            q[qPos + 4] = x1 | (x3 << 8);
        }

        private static void BrAesCtBitsliceSbox(uint[] q)
        {
            /*
             * This S-box implementation is a straightforward translation of
             * the circuit described by Boyar and Peralta in "A new
             * combinational logic minimization technique with applications
             * to cryptology" (https://eprint.iacr.org/2009/191.pdf).
             *
             * Note that variables x* (input) and s* (output) are numbered
             * in "reverse" order (x0 is the high bit, x7 is the low bit).
             */

            uint x0, x1, x2, x3, x4, x5, x6, x7;
            uint y1, y2, y3, y4, y5, y6, y7, y8, y9;
            uint y10, y11, y12, y13, y14, y15, y16, y17, y18, y19;
            uint y20, y21;
            uint z0, z1, z2, z3, z4, z5, z6, z7, z8, z9;
            uint z10, z11, z12, z13, z14, z15, z16, z17;
            uint t0, t1, t2, t3, t4, t5, t6, t7, t8, t9;
            uint t10, t11, t12, t13, t14, t15, t16, t17, t18, t19;
            uint t20, t21, t22, t23, t24, t25, t26, t27, t28, t29;
            uint t30, t31, t32, t33, t34, t35, t36, t37, t38, t39;
            uint t40, t41, t42, t43, t44, t45, t46, t47, t48, t49;
            uint t50, t51, t52, t53, t54, t55, t56, t57, t58, t59;
            uint t60, t61, t62, t63, t64, t65, t66, t67;
            uint s0, s1, s2, s3, s4, s5, s6, s7;

            x0 = q[7];
            x1 = q[6];
            x2 = q[5];
            x3 = q[4];
            x4 = q[3];
            x5 = q[2];
            x6 = q[1];
            x7 = q[0];

            /*
             * Top linear transformation.
             */
            y14 = x3 ^ x5;
            y13 = x0 ^ x6;
            y9 = x0 ^ x3;
            y8 = x0 ^ x5;
            t0 = x1 ^ x2;
            y1 = t0 ^ x7;
            y4 = y1 ^ x3;
            y12 = y13 ^ y14;
            y2 = y1 ^ x0;
            y5 = y1 ^ x6;
            y3 = y5 ^ y8;
            t1 = x4 ^ y12;
            y15 = t1 ^ x5;
            y20 = t1 ^ x1;
            y6 = y15 ^ x7;
            y10 = y15 ^ t0;
            y11 = y20 ^ y9;
            y7 = x7 ^ y11;
            y17 = y10 ^ y11;
            y19 = y10 ^ y8;
            y16 = t0 ^ y11;
            y21 = y13 ^ y16;
            y18 = x0 ^ y16;

            /*
             * Non-linear section.
             */
            t2 = y12 & y15;
            t3 = y3 & y6;
            t4 = t3 ^ t2;
            t5 = y4 & x7;
            t6 = t5 ^ t2;
            t7 = y13 & y16;
            t8 = y5 & y1;
            t9 = t8 ^ t7;
            t10 = y2 & y7;
            t11 = t10 ^ t7;
            t12 = y9 & y11;
            t13 = y14 & y17;
            t14 = t13 ^ t12;
            t15 = y8 & y10;
            t16 = t15 ^ t12;
            t17 = t4 ^ t14;
            t18 = t6 ^ t16;
            t19 = t9 ^ t14;
            t20 = t11 ^ t16;
            t21 = t17 ^ y20;
            t22 = t18 ^ y19;
            t23 = t19 ^ y21;
            t24 = t20 ^ y18;

            t25 = t21 ^ t22;
            t26 = t21 & t23;
            t27 = t24 ^ t26;
            t28 = t25 & t27;
            t29 = t28 ^ t22;
            t30 = t23 ^ t24;
            t31 = t22 ^ t26;
            t32 = t31 & t30;
            t33 = t32 ^ t24;
            t34 = t23 ^ t33;
            t35 = t27 ^ t33;
            t36 = t24 & t35;
            t37 = t36 ^ t34;
            t38 = t27 ^ t36;
            t39 = t29 & t38;
            t40 = t25 ^ t39;

            t41 = t40 ^ t37;
            t42 = t29 ^ t33;
            t43 = t29 ^ t40;
            t44 = t33 ^ t37;
            t45 = t42 ^ t41;
            z0 = t44 & y15;
            z1 = t37 & y6;
            z2 = t33 & x7;
            z3 = t43 & y16;
            z4 = t40 & y1;
            z5 = t29 & y7;
            z6 = t42 & y11;
            z7 = t45 & y17;
            z8 = t41 & y10;
            z9 = t44 & y12;
            z10 = t37 & y3;
            z11 = t33 & y4;
            z12 = t43 & y13;
            z13 = t40 & y5;
            z14 = t29 & y2;
            z15 = t42 & y9;
            z16 = t45 & y14;
            z17 = t41 & y8;

            /*
             * Bottom linear transformation.
             */
            t46 = z15 ^ z16;
            t47 = z10 ^ z11;
            t48 = z5 ^ z13;
            t49 = z9 ^ z10;
            t50 = z2 ^ z12;
            t51 = z2 ^ z5;
            t52 = z7 ^ z8;
            t53 = z0 ^ z3;
            t54 = z6 ^ z7;
            t55 = z16 ^ z17;
            t56 = z12 ^ t48;
            t57 = t50 ^ t53;
            t58 = z4 ^ t46;
            t59 = z3 ^ t54;
            t60 = t46 ^ t57;
            t61 = z14 ^ t57;
            t62 = t52 ^ t58;
            t63 = t49 ^ t58;
            t64 = z4 ^ t59;
            t65 = t61 ^ t62;
            t66 = z1 ^ t63;
            s0 = t59 ^ t63;
            s6 = t56 ^ ~t62;
            s7 = t48 ^ ~t60;
            t67 = t64 ^ t65;
            s3 = t53 ^ t66;
            s4 = t51 ^ t66;
            s5 = t47 ^ t65;
            s1 = t64 ^ ~s3;
            s2 = t55 ^ ~t67;

            q[7] = s0;
            q[6] = s1;
            q[5] = s2;
            q[4] = s3;
            q[3] = s4;
            q[2] = s5;
            q[1] = s6;
            q[0] = s7;
        }

        private void ShiftRows32(uint[] q)
        {
            uint x;
            for (int i = 0; i < 8; i++)
            {
                x = q[i];
                q[i] = (x & 0x000000FF)
                    | ((x & 0x0000FC00) >> 2) | ((x & 0x00000300) << 6)
                    | ((x & 0x00F00000) >> 4) | ((x & 0x000F0000) << 4)
                    | ((x & 0xC0000000) >> 6) | ((x & 0x3F000000) << 2);
            }
        }

        private void MixColumns32(uint[] q)
        {
            uint q0, q1, q2, q3, q4, q5, q6, q7;
            uint r0, r1, r2, r3, r4, r5, r6, r7;

            q0 = q[0];
            q1 = q[1];
            q2 = q[2];
            q3 = q[3];
            q4 = q[4];
            q5 = q[5];
            q6 = q[6];
            q7 = q[7];
            r0 = (q0 >> 8) | (q0 << 24);
            r1 = (q1 >> 8) | (q1 << 24);
            r2 = (q2 >> 8) | (q2 << 24);
            r3 = (q3 >> 8) | (q3 << 24);
            r4 = (q4 >> 8) | (q4 << 24);
            r5 = (q5 >> 8) | (q5 << 24);
            r6 = (q6 >> 8) | (q6 << 24);
            r7 = (q7 >> 8) | (q7 << 24);

            q[0] = q7 ^ r7 ^ r0 ^ Rotr16(q0 ^ r0);
            q[1] = q0 ^ r0 ^ q7 ^ r7 ^ r1 ^ Rotr16(q1 ^ r1);
            q[2] = q1 ^ r1 ^ r2 ^ Rotr16(q2 ^ r2);
            q[3] = q2 ^ r2 ^ q7 ^ r7 ^ r3 ^ Rotr16(q3 ^ r3);
            q[4] = q3 ^ r3 ^ q7 ^ r7 ^ r4 ^ Rotr16(q4 ^ r4);
            q[5] = q4 ^ r4 ^ r5 ^ Rotr16(q5 ^ r5);
            q[6] = q5 ^ r5 ^ r6 ^ Rotr16(q6 ^ r6);
            q[7] = q6 ^ r6 ^ r7 ^ Rotr16(q7 ^ r7);
        }

        private void AddRoundKey32(uint[] q, uint[] sk)
        {
            q[0] ^= sk[0];
            q[1] ^= sk[1];
            q[2] ^= sk[2];
            q[3] ^= sk[3];
            q[4] ^= sk[4];
            q[5] ^= sk[5];
            q[6] ^= sk[6];
            q[7] ^= sk[7];
        }

        private uint Rotr16(uint x)
        {
            return (x << 16) | (x >> 16);
        }

        private void BrAesCt64Ortho(ulong[] q)
        {
            Swapn(q, 1, 0, 1);
            Swapn(q, 1, 2, 3);
            Swapn(q, 1, 4, 5);
            Swapn(q, 1, 6, 7);

            Swapn(q, 2, 0, 2);
            Swapn(q, 2, 1, 3);
            Swapn(q, 2, 4, 6);
            Swapn(q, 2, 5, 7);

            Swapn(q, 4, 0, 4);
            Swapn(q, 4, 1, 5);
            Swapn(q, 4, 2, 6);
            Swapn(q, 4, 3, 7);
        }

        private void BrAesCtOrtho(uint[] q)
        {
            Swapn32(q, 1, 0, 1);
            Swapn32(q, 1, 2, 3);
            Swapn32(q, 1, 4, 5);
            Swapn32(q, 1, 6, 7);

            Swapn32(q, 2, 0, 2);
            Swapn32(q, 2, 1, 3);
            Swapn32(q, 2, 4, 6);
            Swapn32(q, 2, 5, 7);

            Swapn32(q, 4, 0, 4);
            Swapn32(q, 4, 1, 5);
            Swapn32(q, 4, 2, 6);
            Swapn32(q, 4, 3, 7);
        }

        private void Swapn32(uint[] q, int s, int pos1, int pos2)
        {
            uint cl = 0, ch = 0;
            switch (s)
            {
                case 1:
                    cl = 0x55555555;
                    ch = 0xAAAAAAAA;
                    break;
                case 2:
                    cl = 0x33333333;
                    ch = 0xCCCCCCCC;
                    break;
                case 4:
                    cl = 0x0F0F0F0F;
                    ch = 0xF0F0F0F0;
                    break;
            }
            uint a = q[pos1], b = q[pos2];
            q[pos1] = (a & cl) | ((b & cl) << s);
            q[pos2] = ((a & ch) >> s) | (b & ch);
        }

        private void Swapn(ulong[] q, int s, int pos1, int pos2)
        {
            ulong cl = 0, ch = 0;
            switch (s)
            {
                case 1:
                    cl = 0x5555555555555555L;
                    ch = 0xAAAAAAAAAAAAAAAAL;
                    break;
                case 2:
                    cl = 0x3333333333333333L;
                    ch = 0xCCCCCCCCCCCCCCCCL;
                    break;
                case 4:
                    cl = 0x0F0F0F0F0F0F0F0FL;
                    ch = 0xF0F0F0F0F0F0F0F0L;
                    break;
                default:
                    return;
            }
            ulong a = q[pos1], b = q[pos2];
            q[pos1] = (a & cl) | ((b & cl) << s);
            q[pos2] = ((a & ch) >> s) | (b & ch);
        }

        private void BrAesCt64BitsliceSbox(ulong[] q)
        {
            /*
             * This S-box implementation is a straightforward translation of
             * the circuit described by Boyar and Peralta in "A new
             * combinational logic minimization technique with applications
             * to cryptology" (https://eprint.iacr.org/2009/191.pdf).
             *
             * Note that variables x* (input) and s* (output) are numbered
             * in "reverse" order (x0 is the high bit, x7 is the low bit).
             */

            ulong x0, x1, x2, x3, x4, x5, x6, x7;
            ulong y1, y2, y3, y4, y5, y6, y7, y8, y9;
            ulong y10, y11, y12, y13, y14, y15, y16, y17, y18, y19;
            ulong y20, y21;
            ulong z0, z1, z2, z3, z4, z5, z6, z7, z8, z9;
            ulong z10, z11, z12, z13, z14, z15, z16, z17;
            ulong t0, t1, t2, t3, t4, t5, t6, t7, t8, t9;
            ulong t10, t11, t12, t13, t14, t15, t16, t17, t18, t19;
            ulong t20, t21, t22, t23, t24, t25, t26, t27, t28, t29;
            ulong t30, t31, t32, t33, t34, t35, t36, t37, t38, t39;
            ulong t40, t41, t42, t43, t44, t45, t46, t47, t48, t49;
            ulong t50, t51, t52, t53, t54, t55, t56, t57, t58, t59;
            ulong t60, t61, t62, t63, t64, t65, t66, t67;
            ulong s0, s1, s2, s3, s4, s5, s6, s7;

            x0 = q[7];
            x1 = q[6];
            x2 = q[5];
            x3 = q[4];
            x4 = q[3];
            x5 = q[2];
            x6 = q[1];
            x7 = q[0];

            /*
             * Top linear transformation.
             */
            y14 = x3 ^ x5;
            y13 = x0 ^ x6;
            y9 = x0 ^ x3;
            y8 = x0 ^ x5;
            t0 = x1 ^ x2;
            y1 = t0 ^ x7;
            y4 = y1 ^ x3;
            y12 = y13 ^ y14;
            y2 = y1 ^ x0;
            y5 = y1 ^ x6;
            y3 = y5 ^ y8;
            t1 = x4 ^ y12;
            y15 = t1 ^ x5;
            y20 = t1 ^ x1;
            y6 = y15 ^ x7;
            y10 = y15 ^ t0;
            y11 = y20 ^ y9;
            y7 = x7 ^ y11;
            y17 = y10 ^ y11;
            y19 = y10 ^ y8;
            y16 = t0 ^ y11;
            y21 = y13 ^ y16;
            y18 = x0 ^ y16;

            /*
             * Non-linear section.
             */
            t2 = y12 & y15;
            t3 = y3 & y6;
            t4 = t3 ^ t2;
            t5 = y4 & x7;
            t6 = t5 ^ t2;
            t7 = y13 & y16;
            t8 = y5 & y1;
            t9 = t8 ^ t7;
            t10 = y2 & y7;
            t11 = t10 ^ t7;
            t12 = y9 & y11;
            t13 = y14 & y17;
            t14 = t13 ^ t12;
            t15 = y8 & y10;
            t16 = t15 ^ t12;
            t17 = t4 ^ t14;
            t18 = t6 ^ t16;
            t19 = t9 ^ t14;
            t20 = t11 ^ t16;
            t21 = t17 ^ y20;
            t22 = t18 ^ y19;
            t23 = t19 ^ y21;
            t24 = t20 ^ y18;

            t25 = t21 ^ t22;
            t26 = t21 & t23;
            t27 = t24 ^ t26;
            t28 = t25 & t27;
            t29 = t28 ^ t22;
            t30 = t23 ^ t24;
            t31 = t22 ^ t26;
            t32 = t31 & t30;
            t33 = t32 ^ t24;
            t34 = t23 ^ t33;
            t35 = t27 ^ t33;
            t36 = t24 & t35;
            t37 = t36 ^ t34;
            t38 = t27 ^ t36;
            t39 = t29 & t38;
            t40 = t25 ^ t39;

            t41 = t40 ^ t37;
            t42 = t29 ^ t33;
            t43 = t29 ^ t40;
            t44 = t33 ^ t37;
            t45 = t42 ^ t41;
            z0 = t44 & y15;
            z1 = t37 & y6;
            z2 = t33 & x7;
            z3 = t43 & y16;
            z4 = t40 & y1;
            z5 = t29 & y7;
            z6 = t42 & y11;
            z7 = t45 & y17;
            z8 = t41 & y10;
            z9 = t44 & y12;
            z10 = t37 & y3;
            z11 = t33 & y4;
            z12 = t43 & y13;
            z13 = t40 & y5;
            z14 = t29 & y2;
            z15 = t42 & y9;
            z16 = t45 & y14;
            z17 = t41 & y8;

            /*
             * Bottom linear transformation.
             */
            t46 = z15 ^ z16;
            t47 = z10 ^ z11;
            t48 = z5 ^ z13;
            t49 = z9 ^ z10;
            t50 = z2 ^ z12;
            t51 = z2 ^ z5;
            t52 = z7 ^ z8;
            t53 = z0 ^ z3;
            t54 = z6 ^ z7;
            t55 = z16 ^ z17;
            t56 = z12 ^ t48;
            t57 = t50 ^ t53;
            t58 = z4 ^ t46;
            t59 = z3 ^ t54;
            t60 = t46 ^ t57;
            t61 = z14 ^ t57;
            t62 = t52 ^ t58;
            t63 = t49 ^ t58;
            t64 = z4 ^ t59;
            t65 = t61 ^ t62;
            t66 = z1 ^ t63;
            s0 = t59 ^ t63;
            s6 = t56 ^ ~t62;
            s7 = t48 ^ ~t60;
            t67 = t64 ^ t65;
            s3 = t53 ^ t66;
            s4 = t51 ^ t66;
            s5 = t47 ^ t65;
            s1 = t64 ^ ~s3;
            s2 = t55 ^ ~t67;

            q[7] = s0;
            q[6] = s1;
            q[5] = s2;
            q[4] = s3;
            q[3] = s4;
            q[2] = s5;
            q[1] = s6;
            q[0] = s7;
        }

        private void ShiftRows(ulong[] q)
        {
            ulong x;
            for (int i = 0; i < q.Length; i++)
            {
                x = q[i];
                q[i] = (x & 0x000000000000FFFFL)
                    | ((x & 0x00000000FFF00000L) >> 4)
                    | ((x & 0x00000000000F0000L) << 12)
                    | ((x & 0x0000FF0000000000L) >> 8)
                    | ((x & 0x000000FF00000000L) << 8)
                    | ((x & 0xF000000000000000L) >> 12)
                    | ((x & 0x0FFF000000000000L) << 4);
            }
        }

        private void MixColumns(ulong[] q)
        {
            ulong q0, q1, q2, q3, q4, q5, q6, q7;
            ulong r0, r1, r2, r3, r4, r5, r6, r7;

            q0 = q[0];
            q1 = q[1];
            q2 = q[2];
            q3 = q[3];
            q4 = q[4];
            q5 = q[5];
            q6 = q[6];
            q7 = q[7];
            r0 = (q0 >> 16) | (q0 << 48);
            r1 = (q1 >> 16) | (q1 << 48);
            r2 = (q2 >> 16) | (q2 << 48);
            r3 = (q3 >> 16) | (q3 << 48);
            r4 = (q4 >> 16) | (q4 << 48);
            r5 = (q5 >> 16) | (q5 << 48);
            r6 = (q6 >> 16) | (q6 << 48);
            r7 = (q7 >> 16) | (q7 << 48);

            q[0] = q7 ^ r7 ^ r0 ^ Rotr32(q0 ^ r0);
            q[1] = q0 ^ r0 ^ q7 ^ r7 ^ r1 ^ Rotr32(q1 ^ r1);
            q[2] = q1 ^ r1 ^ r2 ^ Rotr32(q2 ^ r2);
            q[3] = q2 ^ r2 ^ q7 ^ r7 ^ r3 ^ Rotr32(q3 ^ r3);
            q[4] = q3 ^ r3 ^ q7 ^ r7 ^ r4 ^ Rotr32(q4 ^ r4);
            q[5] = q4 ^ r4 ^ r5 ^ Rotr32(q5 ^ r5);
            q[6] = q5 ^ r5 ^ r6 ^ Rotr32(q6 ^ r6);
            q[7] = q6 ^ r6 ^ r7 ^ Rotr32(q7 ^ r7);
        }

        private ulong Rotr32(ulong x)
        {
            return (x << 32) | (x >> 32);
        }

        private void AddRoundKey(ulong[] q, ulong[] sk)
        {
            q[0] ^= sk[0];
            q[1] ^= sk[1];
            q[2] ^= sk[2];
            q[3] ^= sk[3];
            q[4] ^= sk[4];
            q[5] ^= sk[5];
            q[6] ^= sk[6];
            q[7] ^= sk[7];
        }

        private void BrAesCt64InterleaveOut(uint[] w, ulong[] q, int pos)
        {
            ulong x0, x1, x2, x3;

            x0 = q[pos] & 0x00FF00FF00FF00FFL;
            x1 = q[pos + 4] & 0x00FF00FF00FF00FFL;
            x2 = (q[pos] >> 8) & 0x00FF00FF00FF00FFL;
            x3 = (q[pos + 4] >> 8) & 0x00FF00FF00FF00FFL;
            x0 |= (x0 >> 8);
            x1 |= (x1 >> 8);
            x2 |= (x2 >> 8);
            x3 |= (x3 >> 8);
            x0 &= 0x0000FFFF0000FFFFL;
            x1 &= 0x0000FFFF0000FFFFL;
            x2 &= 0x0000FFFF0000FFFFL;
            x3 &= 0x0000FFFF0000FFFFL;
            pos <<= 2;
            w[pos] = (uint)(x0 | (x0 >> 16));
            w[pos + 1] = (uint)(x1 | (x1 >> 16));
            w[pos + 2] = (uint)(x2 | (x2 >> 16));
            w[pos + 3] = (uint)(x3 | (x3 >> 16));
        }
    }
}
