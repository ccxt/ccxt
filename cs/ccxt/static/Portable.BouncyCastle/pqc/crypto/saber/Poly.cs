
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Digests;

namespace Org.BouncyCastle.Pqc.Crypto.Saber
{

    class Poly
    {
        private static int KARATSUBA_N = 64;

        private static int SCHB_N = 16;

        private int N_RES;
        private int N_SB;
        private int N_SB_RES;
        private int SABER_N;
        private int SABER_L;

        private SABEREngine engine;
        private Utils utils;


        public Poly(SABEREngine engine)
        {
            this.engine = engine;
            this.SABER_L = engine.getSABER_L();
            this.SABER_N = engine.getSABER_N();
            this.N_RES = (SABER_N << 1);
            this.N_SB = (SABER_N >> 2);
            this.N_SB_RES = (2 * N_SB - 1);
            this.utils = engine.GetUtils();
        }

        public void GenMatrix(short[][][] A, byte[] seed)
        {
            byte[] buf = new byte[SABER_L * engine.getSABER_POLYVECBYTES()];
            int i;

            IXof digest = new ShakeDigest(128);
            digest.BlockUpdate(seed, 0, engine.getSABER_SEEDBYTES());
            digest.DoFinal(buf, 0, buf.Length);

            for (i = 0; i < SABER_L; i++)
            {
                utils.BS2POLVECq(buf, i * engine.getSABER_POLYVECBYTES(), A[i]);
            }
        }

        public void GenSecret(short[][] s, byte[] seed)
        {
            byte[] buf = new byte[SABER_L * engine.getSABER_POLYCOINBYTES()];
            int i;
            IXof digest = new ShakeDigest(128);
            digest.BlockUpdate(seed, 0, engine.getSABER_NOISE_SEEDBYTES());
            digest.DoFinal(buf, 0, buf.Length);

            for (i = 0; i < SABER_L; i++)
            {
                Cbd(s[i], buf, i * engine.getSABER_POLYCOINBYTES());
            }

        }

        private long LoadLittleEndian(byte[] x, int offset, int bytes)
        {
            int i;
            long r = (x[offset + 0] & 0xff);
            for (i = 1; i < bytes; i++)
            {
                r |= ((long) (x[offset + i] & 0xff)) << (8 * i);
            }

            return r;
        }

        private void Cbd(short[] s, byte[] buf, int offset)
        {
            int[] a = new int[4], b = new int[4];
            int i, j;
            if (engine.getSABER_MU() == 6)
            {
                int t, d;
                for (i = 0; i < SABER_N / 4; i++)
                {
                    t = (int) LoadLittleEndian(buf, offset + 3 * i, 3);
                    d = 0;
                    for (j = 0; j < 3; j++)
                        d += (t >> j) & 0x249249;

                    a[0] = d & 0x7;
                    b[0] = (d >> 3) & 0x7;
                    a[1] = (d >> 6) & 0x7;
                    b[1] = (d >> 9) & 0x7;
                    a[2] = (d >> 12) & 0x7;
                    b[2] = (d >> 15) & 0x7;
                    a[3] = (d >> 18) & 0x7;
                    b[3] = (d >> 21);

                    s[4 * i + 0] = (short) (a[0] - b[0]);
                    s[4 * i + 1] = (short) (a[1] - b[1]);
                    s[4 * i + 2] = (short) (a[2] - b[2]);
                    s[4 * i + 3] = (short) (a[3] - b[3]);
                }
            }
            else if (engine.getSABER_MU() == 8)
            {
                int t, d;
                for (i = 0; i < SABER_N / 4; i++)
                {

                    t = (int) LoadLittleEndian(buf, offset + 4 * i, 4);
                    d = 0;
                    for (j = 0; j < 4; j++)
                        d += (t >> j) & 0x11111111;

                    a[0] = d & 0xf;
                    b[0] = (d >> 4) & 0xf;
                    a[1] = (d >> 8) & 0xf;
                    b[1] = (d >> 12) & 0xf;
                    a[2] = (d >> 16) & 0xf;
                    b[2] = (d >> 20) & 0xf;
                    a[3] = (d >> 24) & 0xf;
                    b[3] = (d >> 28);

                    s[4 * i + 0] = (short) (a[0] - b[0]);
                    s[4 * i + 1] = (short) (a[1] - b[1]);
                    s[4 * i + 2] = (short) (a[2] - b[2]);
                    s[4 * i + 3] = (short) (a[3] - b[3]);
                }
            }
            else if (engine.getSABER_MU() == 10)
            {
                long t, d;
                for (i = 0; i < SABER_N / 4; i++)
                {
                    t = LoadLittleEndian(buf, offset + 5 * i, 5);
                    d = 0;
                    for (j = 0; j < 5; j++)
                        d += (t >> j) & 0x0842108421L;

                    a[0] = (int) (d & 0x1f);
                    b[0] = (int) ((d >> 5) & 0x1f);
                    a[1] = (int) ((d >> 10) & 0x1f);
                    b[1] = (int) ((d >> 15) & 0x1f);
                    a[2] = (int) ((d >> 20) & 0x1f);
                    b[2] = (int) ((d >> 25) & 0x1f);
                    a[3] = (int) ((d >> 30) & 0x1f);
                    b[3] = (int) (d >> 35);

                    s[4 * i + 0] = (short) (a[0] - b[0]);
                    s[4 * i + 1] = (short) (a[1] - b[1]);
                    s[4 * i + 2] = (short) (a[2] - b[2]);
                    s[4 * i + 3] = (short) (a[3] - b[3]);
                }
            }
        }

        private short OVERFLOWING_MUL(int x, int y)
        {
            return (short) (x * y);
        }

        private void karatsuba_simple(int[] a_1, int[] b_1, int[] result_final)
        {
            int[] d01 = new int[KARATSUBA_N / 2 - 1];
            int[] d0123 = new int[KARATSUBA_N / 2 - 1];
            int[] d23 = new int[KARATSUBA_N / 2 - 1];
            int[] result_d01 = new int[KARATSUBA_N - 1];

            int i, j;
            int acc1, acc2, acc3, acc4, acc5, acc6, acc7, acc8, acc9, acc10;

            for (i = 0; i < KARATSUBA_N / 4; i++)
            {
                acc1 = a_1[i]; //a0
                acc2 = a_1[i + KARATSUBA_N / 4]; //a1
                acc3 = a_1[i + 2 * KARATSUBA_N / 4]; //a2
                acc4 = a_1[i + 3 * KARATSUBA_N / 4]; //a3
                for (j = 0; j < KARATSUBA_N / 4; j++)
                {

                    acc5 = b_1[j]; //b0
                    acc6 = b_1[j + KARATSUBA_N / 4]; //b1

                    result_final[i + j + 0 * KARATSUBA_N / 4] =
                        (result_final[i + j + 0 * KARATSUBA_N / 4] + OVERFLOWING_MUL(acc1, acc5));
                    result_final[i + j + 2 * KARATSUBA_N / 4] =
                        (result_final[i + j + 2 * KARATSUBA_N / 4] + OVERFLOWING_MUL(acc2, acc6));

                    acc7 = (acc5 + acc6); //b01
                    acc8 = (acc1 + acc2); //a01
                    d01[i + j] = (int) (d01[i + j] + (acc7 * (long) acc8));
                    //--------------------------------------------------------

                    acc7 = b_1[j + 2 * KARATSUBA_N / 4]; //b2
                    acc8 = b_1[j + 3 * KARATSUBA_N / 4]; //b3
                    result_final[i + j + 4 * KARATSUBA_N / 4] =
                        (result_final[i + j + 4 * KARATSUBA_N / 4] +
                         OVERFLOWING_MUL(acc7, acc3));

                    result_final[i + j + 6 * KARATSUBA_N / 4] =
                        (result_final[i + j + 6 * KARATSUBA_N / 4] +
                         OVERFLOWING_MUL(acc8, acc4));

                    acc9 = (acc3 + acc4);
                    acc10 = (acc7 + acc8);
                    d23[i + j] = (d23[i + j] + OVERFLOWING_MUL(acc9, acc10));
                    //--------------------------------------------------------

                    acc5 = (acc5 + acc7); //b02
                    acc7 = (acc1 + acc3); //a02
                    result_d01[i + j + 0 * KARATSUBA_N / 4] =
                        (result_d01[i + j + 0 * KARATSUBA_N / 4] +
                         OVERFLOWING_MUL(acc5, acc7));

                    acc6 = (acc6 + acc8); //b13
                    acc8 = (acc2 + acc4);
                    result_d01[i + j + 2 * KARATSUBA_N / 4] =
                        (result_d01[i + j + 2 * KARATSUBA_N / 4] +
                         OVERFLOWING_MUL(acc6, acc8));

                    acc5 = (acc5 + acc6);
                    acc7 = (acc7 + acc8);
                    d0123[i + j] = (d0123[i + j] + OVERFLOWING_MUL(acc5, acc7));
                }
            }

            // 2nd last stage

            for (i = 0; i < KARATSUBA_N / 2 - 1; i++)
            {
                d0123[i] = (d0123[i] - result_d01[i + 0 * KARATSUBA_N / 4] - result_d01[i + 2 * KARATSUBA_N / 4]);
                d01[i] = (d01[i] - result_final[i + 0 * KARATSUBA_N / 4] - result_final[i + 2 * KARATSUBA_N / 4]);
                d23[i] = (d23[i] - result_final[i + 4 * KARATSUBA_N / 4] - result_final[i + 6 * KARATSUBA_N / 4]);
            }

            for (i = 0; i < KARATSUBA_N / 2 - 1; i++)
            {
                result_d01[i + 1 * KARATSUBA_N / 4] = (result_d01[i + 1 * KARATSUBA_N / 4] + d0123[i]);
                result_final[i + 1 * KARATSUBA_N / 4] = (result_final[i + 1 * KARATSUBA_N / 4] + d01[i]);
                result_final[i + 5 * KARATSUBA_N / 4] = (result_final[i + 5 * KARATSUBA_N / 4] + d23[i]);
            }

            // Last stage
            for (i = 0; i < KARATSUBA_N - 1; i++)
            {
                result_d01[i] = (result_d01[i] - result_final[i] - result_final[i + KARATSUBA_N]);
            }

            for (i = 0; i < KARATSUBA_N - 1; i++)
            {
                result_final[i + 1 * KARATSUBA_N / 2] = (result_final[i + 1 * KARATSUBA_N / 2] + result_d01[i]);
            }

        }


        private void toom_cook_4way(short[] a1, short[] b1, short[] result)
        {
            int inv3 = 43691, inv9 = 36409, inv15 = 61167;

            int[] aw1 = new int[N_SB],
                aw2 = new int[N_SB],
                aw3 = new int[N_SB],
                aw4 = new int[N_SB],
                aw5 = new int[N_SB],
                aw6 = new int[N_SB],
                aw7 = new int[N_SB];

            int[] bw1 = new int[N_SB],
                bw2 = new int[N_SB],
                bw3 = new int[N_SB],
                bw4 = new int[N_SB],
                bw5 = new int[N_SB],
                bw6 = new int[N_SB],
                bw7 = new int[N_SB];

            int[] w1 = new int[N_SB_RES],
                w2 = new int[N_SB_RES],
                w3 = new int[N_SB_RES],
                w4 = new int[N_SB_RES],
                w5 = new int[N_SB_RES],
                w6 = new int[N_SB_RES],
                w7 = new int[N_SB_RES];

            int r0, r1, r2, r3, r4, r5, r6, r7;
            short[] C;
            C = result;

            int i, j;

            // EVALUATION
            for (j = 0; j < N_SB; ++j)
            {
                r0 = a1[j];
                r1 = a1[j + N_SB];
                r2 = a1[j + N_SB * 2];
                r3 = a1[j + N_SB * 3];
                r4 = (short) (r0 + r2);
                r5 = (short) (r1 + r3);
                r6 = (short) (r4 + r5);
                r7 = (short) (r4 - r5);
                aw3[j] = r6;
                aw4[j] = r7;
                r4 = (short) (((r0 << 2) + r2) << 1);
                r5 = (short) ((r1 << 2) + r3);
                r6 = (short) (r4 + r5);
                r7 = (short) (r4 - r5);
                aw5[j] = r6;
                aw6[j] = r7;
                r4 = (short) ((r3 << 3) + (r2 << 2) + (r1 << 1) + r0);
                aw2[j] = r4;
                aw7[j] = r0;
                aw1[j] = r3;
            }

            for (j = 0; j < N_SB; ++j)
            {
                r0 = b1[j];
                r1 = b1[j + N_SB];
                r2 = b1[j + N_SB * 2];
                r3 = b1[j + N_SB * 3];
                r4 = r0 + r2;
                r5 = r1 + r3;
                r6 = r4 + r5;
                r7 = r4 - r5;
                bw3[j] = r6;
                bw4[j] = r7;
                r4 = ((r0 << 2) + r2) << 1;
                r5 = (r1 << 2) + r3;
                r6 = r4 + r5;
                r7 = r4 - r5;
                bw5[j] = r6;
                bw6[j] = r7;
                r4 = ((r3 << 3) + (r2 << 2) + (r1 << 1) + r0);
                bw2[j] = r4;
                bw7[j] = r0;
                bw1[j] = r3;
            }

            // MULTIPLICATION

            karatsuba_simple(aw1, bw1, w1);
            karatsuba_simple(aw2, bw2, w2);
            karatsuba_simple(aw3, bw3, w3);
            karatsuba_simple(aw4, bw4, w4);
            karatsuba_simple(aw5, bw5, w5);
            karatsuba_simple(aw6, bw6, w6);
            karatsuba_simple(aw7, bw7, w7);

            // INTERPOLATION
            for (i = 0; i < N_SB_RES; ++i)
            {
                r0 = w1[i];
                r1 = w2[i];
                r2 = w3[i];
                r3 = w4[i];
                r4 = w5[i];
                r5 = w6[i];
                r6 = w7[i];


                r1 = r1 + r4;
                r5 = (r5 - r4);
                r3 = ((r3 & 0xffff) - (r2 & 0xffff)) >> 1;
                r4 = (r4 - r0);
                r4 = (r4 - (r6 << 6));
                r4 = ((r4 << 1) + r5);
                r2 = (r2 + r3);
                r1 = (r1 - (r2 << 6) - r2);
                r2 = (r2 - r6);
                r2 = (r2 - r0);
                r1 = (r1 + 45 * r2);
                r4 = (((((r4 & 0xffff) - (r2 << 3)) * inv3)) >> 3);
                r5 = (r5 + r1);
                r1 = ((r1 & 0xffff) + ((r3 & 0xffff) << 4)) * inv9 >> 1;
                r3 = -(r3 + r1);
                r5 = ((30 * (r1 & 0xffff) - (r5 & 0xffff)) * inv15) >> 2;
                r2 = (r2 - r4);
                r1 = (r1 - r5);

                C[i] += (short) (r6 & 0xffff);
                C[i + 64] += (short) (r5 & 0xffff);
                C[i + 128] += (short) (r4 & 0xffff);
                C[i + 192] += (short) (r3 & 0xffff);
                C[i + 256] += (short) (r2 & 0xffff);
                C[i + 320] += (short) (r1 & 0xffff);
                C[i + 384] += (short) (r0 & 0xffff);
            }
        }

        private void poly_mul_acc(short[] a, short[] b, short[] res)
        {
            int i;

            short[] c = new short[2 * SABER_N];

            toom_cook_4way(a, b, c);

            /* reduction */
            for (i = SABER_N; i < 2 * SABER_N; i++)
            {
                res[i - SABER_N] += (short) (c[i - SABER_N] - c[i]);
            }
        }

        public void MatrixVectorMul(short[][][] A, short[][] s, short[][] res, int transpose)
        {
            int i, j;
            for (i = 0; i < SABER_L; i++)
            {
                for (j = 0; j < SABER_L; j++)
                {
                    if (transpose == 1)
                    {
                        poly_mul_acc(A[j][i], s[j], res[i]);
                    }
                    else
                    {
                        poly_mul_acc(A[i][j], s[j], res[i]);
                    }
                }
            }
        }

        public void InnerProd(short[][] b, short[][] s, short[] res)
        {
            int j;
            for (j = 0; j < SABER_L; j++)
            {
                poly_mul_acc(b[j], s[j], res);
            }
        }


    }
}