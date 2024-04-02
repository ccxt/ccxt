using System;

namespace Org.BouncyCastle.Pqc.Crypto.Falcon
{
    class FalconFFT
    {
        FPREngine fpre;
        internal FalconFFT() {
            fpre = new FPREngine();
        }
        internal FalconFFT(FPREngine fprengine) {
            this.fpre = fprengine;
        }

        /* 
        * License from the reference C code (the code was copied then modified
        * to function in C#):
        * ==========================(LICENSE BEGIN)============================
        *
        * Copyright (c) 2017-2019  Falcon Project
        *
        * Permission is hereby granted, free of charge, to any person obtaining
        * a copy of this software and associated documentation files (the
        * "Software"), to deal in the Software without restriction, including
        * without limitation the rights to use, copy, modify, merge, publish,
        * distribute, sublicense, and/or sell copies of the Software, and to
        * permit persons to whom the Software is furnished to do so, subject to
        * the following conditions:
        *
        * The above copyright notice and this permission notice shall be
        * included in all copies or substantial portions of the Software.
        *
        * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
        * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
        * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
        * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
        * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
        * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
        * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
        *
        * ===========================(LICENSE END)=============================
        */
        /*
        * Addition of two complex numbers (d = a + b).
        */
        internal FalconFPR[] FPC_ADD(FalconFPR a_re, FalconFPR a_im,
                        FalconFPR b_re, FalconFPR b_im) {
            FalconFPR fpct_re, fpct_im;
            fpct_re = this.fpre.fpr_add(a_re, b_re);
            fpct_im = this.fpre.fpr_add(a_im, b_im);
            //d_re.Set(fpct_re);
            //d_im.Set(fpct_im);
            return new FalconFPR[] { fpct_re, fpct_im };
        }

        /*
        * Subtraction of two complex numbers (d = a - b).
        */
        internal FalconFPR[] FPC_SUB(FalconFPR a_re, FalconFPR a_im,
                        FalconFPR b_re, FalconFPR b_im) {
            FalconFPR fpct_re, fpct_im;
            fpct_re = this.fpre.fpr_sub(a_re, b_re);
            fpct_im = this.fpre.fpr_sub(a_im, b_im);
            return new FalconFPR[] { fpct_re, fpct_im }; 
        }

        /*
        * Multplication of two complex numbers (d = a * b).
        */
        internal FalconFPR[] FPC_MUL(FalconFPR a_re, FalconFPR a_im,
                        FalconFPR b_re, FalconFPR b_im) {
            FalconFPR fpct_a_re, fpct_a_im;
            FalconFPR fpct_b_re, fpct_b_im;
            FalconFPR fpct_d_re, fpct_d_im;
            fpct_a_re = a_re; 
            fpct_a_im = a_im; 
            fpct_b_re = b_re; 
            fpct_b_im = b_im; 
            fpct_d_re = this.fpre.fpr_sub( 
                this.fpre.fpr_mul(fpct_a_re, fpct_b_re), 
                this.fpre.fpr_mul(fpct_a_im, fpct_b_im)); 
            fpct_d_im = this.fpre.fpr_add( 
                this.fpre.fpr_mul(fpct_a_re, fpct_b_im), 
                this.fpre.fpr_mul(fpct_a_im, fpct_b_re)); 
            return new FalconFPR[] {fpct_d_re, fpct_d_im};
        }

        /*
        * Squaring of a complex number (d = a * a).
        */
        internal FalconFPR[] FPC_SQR(FalconFPR d_re, FalconFPR d_im, 
                        FalconFPR a_re, FalconFPR a_im) {
            FalconFPR fpct_a_re, fpct_a_im; 
            FalconFPR fpct_d_re, fpct_d_im; 
            fpct_a_re = a_re; 
            fpct_a_im = a_im; 
            fpct_d_re = this.fpre.fpr_sub(this.fpre.fpr_sqr(fpct_a_re), this.fpre.fpr_sqr(fpct_a_im)); 
            fpct_d_im = this.fpre.fpr_double(this.fpre.fpr_mul(fpct_a_re, fpct_a_im)); 
            return new FalconFPR[] {fpct_d_re, fpct_d_im};
        }

        /*
        * Inversion of a complex number (d = 1 / a).
        */
        internal FalconFPR[] FPC_INV(FalconFPR a_re, FalconFPR a_im) {
            FalconFPR fpct_a_re, fpct_a_im; 
            FalconFPR fpct_d_re, fpct_d_im; 
            FalconFPR fpct_m; 
            fpct_a_re = a_re; 
            fpct_a_im = a_im; 
            fpct_m = this.fpre.fpr_add(this.fpre.fpr_sqr(fpct_a_re), this.fpre.fpr_sqr(fpct_a_im)); 
            fpct_m = this.fpre.fpr_inv(fpct_m); 
            fpct_d_re = this.fpre.fpr_mul(fpct_a_re, fpct_m); 
            fpct_d_im = this.fpre.fpr_mul(this.fpre.fpr_neg(fpct_a_im), fpct_m);
            return new FalconFPR[] { fpct_d_re, fpct_d_im };
        }
        /*
        * Division of complex numbers (d = a / b).
        */
        internal FalconFPR[] FPC_DIV(FalconFPR a_re, FalconFPR a_im,
                        FalconFPR b_re, FalconFPR b_im) {
            FalconFPR fpct_a_re, fpct_a_im; 
            FalconFPR fpct_b_re, fpct_b_im; 
            FalconFPR fpct_d_re, fpct_d_im; 
            FalconFPR fpct_m; 
            fpct_a_re = (a_re); 
            fpct_a_im = (a_im); 
            fpct_b_re = (b_re); 
            fpct_b_im = (b_im); 
            fpct_m = this.fpre.fpr_add(this.fpre.fpr_sqr(fpct_b_re), this.fpre.fpr_sqr(fpct_b_im)); 
            fpct_m = this.fpre.fpr_inv(fpct_m); 
            fpct_b_re = this.fpre.fpr_mul(fpct_b_re, fpct_m); 
            fpct_b_im = this.fpre.fpr_mul(this.fpre.fpr_neg(fpct_b_im), fpct_m); 
            fpct_d_re = this.fpre.fpr_sub( 
                this.fpre.fpr_mul(fpct_a_re, fpct_b_re), 
                this.fpre.fpr_mul(fpct_a_im, fpct_b_im)); 
            fpct_d_im = this.fpre.fpr_add( 
                this.fpre.fpr_mul(fpct_a_re, fpct_b_im), 
                this.fpre.fpr_mul(fpct_a_im, fpct_b_re));
            return new FalconFPR[] { fpct_d_re, fpct_d_im };
        }

        /*
        * Let w = exp(i*pi/N); w is a primitive 2N-th root of 1. We define the
        * values w_j = w^(2j+1) for all j from 0 to N-1: these are the roots
        * of X^N+1 in the field of complex numbers. A crucial property is that
        * w_{N-1-j} = conj(w_j) = 1/w_j for all j.
        *
        * FFT representation of a polynomial f (taken modulo X^N+1) is the
        * set of values f(w_j). Since f is real, conj(f(w_j)) = f(conj(w_j)),
        * thus f(w_{N-1-j}) = conj(f(w_j)). We thus store only half the values,
        * for j = 0 to N/2-1; the other half can be recomputed easily when (if)
        * needed. A consequence is that FFT representation has the same size
        * as normal representation: N/2 complex numbers use N real numbers (each
        * complex number is the combination of a real and an imaginary part).
        *
        * We use a specific ordering which makes computations easier. Let rev()
        * be the bit-reversal function over log(N) bits. For j in 0..N/2-1, we
        * store the real and imaginary parts of f(w_j) in slots:
        *
        *    Re(f(w_j)) -> slot rev(j)/2
        *    Im(f(w_j)) -> slot rev(j)/2+N/2
        *
        * (Note that rev(j) is even for j < N/2.)
        */

        internal void FFT(FalconFPR[] fsrc, int f, uint logn)
        {
            /*
            * FFT algorithm in bit-reversal order uses the following
            * iterative algorithm:
            *
            *   t = N
            *   for m = 1; m < N; m *= 2:
            *       ht = t/2
            *       for i1 = 0; i1 < m; i1 ++:
            *           j1 = i1 * t
            *           s = GM[m + i1]
            *           for j = j1; j < (j1 + ht); j ++:
            *               x = fsrc[f + j]
            *               y = s * fsrc[f + j + ht]
            *               fsrc[f + j] = x + y
            *               fsrc[f + j + ht] = x - y
            *       t = ht
            *
            * GM[k] contains w^rev(k) for primitive root w = exp(i*pi/N).
            *
            * In the description above, fsrc[f + ] is supposed to contain complex
            * numbers. In our in-memory representation, the real and
            * imaginary parts of fsrc[f + k] are in array slots k and k+N/2.
            *
            * We only keep the first half of the complex numbers. We can
            * see that after the first iteration, the first and second halves
            * of the array of complex numbers have separate lives, so we
            * simply ignore the second part.
            */

            uint u;
            int t, n, hn, m;

            /*
            * First iteration: compute fsrc[f + j] + i * fsrc[f + j+N/2] for all j < N/2
            * (because GM[1] = w^rev(1) = w^(N/2) = i).
            * In our chosen representation, this is a no-op: everything is
            * already where it should be.
            */

            /*
            * Subsequent iterations are truncated to use only the first
            * half of values.
            */
            n = (int)1 << (int)logn;
            hn = n >> 1;
            t = hn;
            for (u = 1, m = 2; u < logn; u ++, m <<= 1) {
                int ht, hm, i1, j1;

                ht = t >> 1;
                hm = m >> 1;
                for (i1 = 0, j1 = 0; i1 < hm; i1 ++, j1 += t) {
                    int j, j2;

                    j2 = j1 + ht;
                    FalconFPR s_re, s_im;

                    s_re = this.fpre.fpr_gm_tab[((m + i1) << 1) + 0];
                    s_im = this.fpre.fpr_gm_tab[((m + i1) << 1) + 1];
                    for (j = j1; j < j2; j ++) {
                        FalconFPR x_re, x_im, y_re, y_im;
                        FalconFPR[] res;

                        x_re = fsrc[f + j];
                        x_im = fsrc[f + j + hn];
                        y_re = fsrc[f + j + ht];
                        y_im = fsrc[f + j + ht + hn];
                        res = FPC_MUL(y_re, y_im, s_re, s_im);
                        y_re = res[0]; y_im = res[1];
                        res = FPC_ADD(x_re, x_im, y_re, y_im);
                        fsrc[f + j] = res[0]; fsrc[f + j + hn] = res[1];
                        res = FPC_SUB(x_re, x_im, y_re, y_im);
                        fsrc[f + j + ht] = res[0]; fsrc[f + j + ht + hn] = res[1];
                    }
                }
                t = ht;
            }
        }

        internal void iFFT(FalconFPR[] fsrc, int f, uint logn)
        {
            /*
            * Inverse FFT algorithm in bit-reversal order uses the following
            * iterative algorithm:
            *
            *   t = 1
            *   for m = N; m > 1; m /= 2:
            *       hm = m/2
            *       dt = t*2
            *       for i1 = 0; i1 < hm; i1 ++:
            *           j1 = i1 * dt
            *           s = iGM[hm + i1]
            *           for j = j1; j < (j1 + t); j ++:
            *               x = fsrc[f + j]
            *               y = fsrc[f + j + t]
            *               fsrc[f + j] = x + y
            *               fsrc[f + j + t] = s * (x - y)
            *       t = dt
            *   for i1 = 0; i1 < N; i1 ++:
            *       fsrc[f + i1] = fsrc[f + i1] / N
            *
            * iGM[k] contains (1/w)^rev(k) for primitive root w = exp(i*pi/N)
            * (actually, iGM[k] = 1/GM[k] = conj(GM[k])).
            *
            * In the main loop (not counting the final division loop), in
            * all iterations except the last, the first and second half of fsrc[f + ]
            * (as an array of complex numbers) are separate. In our chosen
            * representation, we do not keep the second half.
            *
            * The last iteration recombines the recomputed half with the
            * implicit half, and should yield only real numbers since the
            * target polynomial is real; moreover, s = i at that step.
            * Thus, when considering x and y:
            *    y = conj(x) since the final fsrc[f + j] must be real
            *    Therefore, fsrc[f + j] is filled with 2*Re(x), and fsrc[f + j + t] is
            *    filled with 2*Im(x).
            * But we already have Re(x) and Im(x) in array slots j and j+t
            * in our chosen representation. That last iteration is thus a
            * simple doubling of the values in all the array.
            *
            * We make the last iteration a no-op by tweaking the final
            * division into a division by N/2, not N.
            */
            int u, n, hn, t, m;

            n = (int)1 << (int)logn;
            t = 1;
            m = n;
            hn = n >> 1;
            for (u = (int)logn; u > 1; u --) {
                int hm, dt, i1, j1;

                hm = m >> 1;
                dt = t << 1;
                for (i1 = 0, j1 = 0; j1 < hn; i1 ++, j1 += dt) {
                    int j, j2;

                    j2 = j1 + t;
                    FalconFPR s_re, s_im;

                    s_re = this.fpre.fpr_gm_tab[((hm + i1) << 1) + 0];
                    s_im = this.fpre.fpr_neg(this.fpre.fpr_gm_tab[((hm + i1) << 1) + 1]);
                    for (j = j1; j < j2; j ++) {
                        FalconFPR x_re, x_im, y_re, y_im;
                        FalconFPR[] res;

                        x_re = fsrc[f + j];
                        x_im = fsrc[f + j + hn];
                        y_re = fsrc[f + j + t];
                        y_im = fsrc[f + j + t + hn];
                        res = FPC_ADD(x_re, x_im, y_re, y_im);
                        fsrc[f + j] = res[0]; fsrc[f + j + hn] = res[1];
                            
                        res = FPC_SUB(x_re, x_im, y_re, y_im);
                        x_re = res[0]; x_im = res[1];
                        res = FPC_MUL(x_re, x_im, s_re, s_im);
                        fsrc[f + j + t] = res[0]; fsrc[f + j + t + hn] = res[1];
                    }
                }
                t = dt;
                m = hm;
            }

            /*
            * Last iteration is a no-op, provided that we divide by N/2
            * instead of N. We need to make a special case for logn = 0.
            */
            if (logn > 0) {
                FalconFPR ni;

                ni = this.fpre.fpr_p2_tab[logn];
                for (u = 0; u < n; u ++) {
                    fsrc[f+u] = this.fpre.fpr_mul(fsrc[f+u], ni);
                }
            }
        }

        internal void poly_add(
            FalconFPR[] asrc, int a, FalconFPR[] bsrc, int b, uint logn)
        {
            int n, u;

            n = (int)1 << (int)logn;
            for (u = 0; u < n; u ++) {
                asrc[a + u] = this.fpre.fpr_add(asrc[a + u], bsrc[b + u]);
            }
        }

        internal void poly_sub(
            FalconFPR[] asrc, int a, FalconFPR[] bsrc, int b, uint logn)
        {
            int n, u;

            n = (int)1 << (int)logn;
            for (u = 0; u < n; u ++) {
                asrc[a + u] = this.fpre.fpr_sub(asrc[a + u], bsrc[b + u]);
            }
        }

        internal void poly_neg(FalconFPR[] asrc, int a, uint logn)
        {
            int n, u;

            n = (int)1 << (int)logn;
            for (u = 0; u < n; u ++) {
                asrc[a + u] = this.fpre.fpr_neg(asrc[a + u]);
            }
        }

        internal void poly_adj_fft(FalconFPR[] asrc, int a, uint logn)
        {
            int n, u;

            n = (int)1 << (int)logn;
            for (u = (n >> 1); u < n; u ++) {
                asrc[a + u] = this.fpre.fpr_neg(asrc[a + u]);
            }
        }

        internal void poly_mul_fft(
            FalconFPR[] asrc, int a, FalconFPR[] bsrc, int b, uint logn)
        {
            int n, hn, u;

            n = (int)1 << (int)logn;
            hn = n >> 1;
            for (u = 0; u < hn; u ++) {
                FalconFPR a_re, a_im, b_re, b_im;
                FalconFPR[] res;

                a_re = asrc[a + u];
                a_im = asrc[a + u + hn];
                b_re = bsrc[b + u];
                b_im = bsrc[b + u + hn];
                res = FPC_MUL(a_re, a_im, b_re, b_im);
                asrc[a + u] = res[0]; asrc[a + u + hn] = res[1];
            }
        }

        internal void poly_muladj_fft(
            FalconFPR[] asrc, int a, FalconFPR[] bsrc, int b, uint logn)
        {
            int n, hn, u;

            n = (int)1 << (int)logn;
            hn = n >> 1;
            for (u = 0; u < hn; u ++) {
                FalconFPR a_re, a_im, b_re, b_im;
                FalconFPR[] res;

                a_re = asrc[a + u];
                a_im = asrc[a + u + hn];
                b_re = bsrc[b + u];
                b_im = this.fpre.fpr_neg(bsrc[b + u + hn]);
                res = FPC_MUL(a_re, a_im, b_re, b_im);
                asrc[a + u] = res[0]; asrc[a + u + hn] = res[1];
            }
        }

        internal void poly_mulselfadj_fft(FalconFPR[] asrc, int a, uint logn)
        {
            /*
            * Since each coefficient is multiplied with its own conjugate,
            * the result contains only real values.
            */
            int n, hn, u;

            n = (int)1 << (int)logn;
            hn = n >> 1;
            for (u = 0; u < hn; u ++) {
                FalconFPR a_re, a_im;

                a_re = asrc[a + u];
                a_im = asrc[a + u + hn];
                asrc[a + u] = this.fpre.fpr_add(this.fpre.fpr_sqr(a_re), this.fpre.fpr_sqr(a_im));
                asrc[a + u + hn] = this.fpre.fpr_zero;
            }
        }

        internal void poly_mulconst(FalconFPR[] asrc, int a, FalconFPR x, uint logn)
        {
            int n, u;

            n = (int)1 << (int)logn;
            for (u = 0; u < n; u ++) {
                asrc[a + u] = this.fpre.fpr_mul(asrc[a + u], x);
            }
        }

        internal void poly_div_fft(
            FalconFPR[] asrc, int a, FalconFPR[] bsrc, int b, uint logn)
        {
            int n, hn, u;

            n = (int)1 << (int)logn;
            hn = n >> 1;
            for (u = 0; u < hn; u ++) {
                FalconFPR a_re, a_im, b_re, b_im;
                FalconFPR[] res;

                a_re = asrc[a + u];
                a_im = asrc[a + u + hn];
                b_re = bsrc[b + u];
                b_im = bsrc[b + u + hn];
                res = FPC_DIV(a_re, a_im, b_re, b_im);
                asrc[a + u] = res[0]; asrc[a + u + hn] = res[1];
            }
        }

        internal void poly_invnorm2_fft(FalconFPR[] dsrc, int d,
            FalconFPR[] asrc, int a, FalconFPR[] bsrc, int b, uint logn)
        {
            int n, hn, u;

            n = (int)1 << (int)logn;
            hn = n >> 1;
            for (u = 0; u < hn; u ++) {
                FalconFPR a_re, a_im;
                FalconFPR b_re, b_im;

                a_re = asrc[a + u];
                a_im = asrc[a + u + hn];
                b_re = bsrc[b + u];
                b_im = bsrc[b + u + hn];
                dsrc[d + u] = this.fpre.fpr_inv(this.fpre.fpr_add(
                    this.fpre.fpr_add(this.fpre.fpr_sqr(a_re), this.fpre.fpr_sqr(a_im)),
                    this.fpre.fpr_add(this.fpre.fpr_sqr(b_re), this.fpre.fpr_sqr(b_im))));
            }
        }

        internal void poly_add_muladj_fft(FalconFPR[] dsrc, int d,
            FalconFPR[] Fsrc, int F, FalconFPR[] Gsrc, int G,
            FalconFPR[] fsrc, int f, FalconFPR[] gsrc, int g, uint logn)
        {
            int n, hn, u;

            n = (int)1 << (int)logn;
            hn = n >> 1;
            for (u = 0; u < hn; u ++) {
                FalconFPR F_re, F_im, G_re, G_im;
                FalconFPR f_re, f_im, g_re, g_im;
                FalconFPR a_re, a_im, b_re, b_im;
                FalconFPR[] res;


                F_re = Fsrc[F + u];
                F_im = Fsrc[F + u + hn];
                G_re = Gsrc[G + u];
                G_im = Gsrc[G + u + hn];
                f_re = fsrc[f + u];
                f_im = fsrc[f + u + hn];
                g_re = gsrc[g + u];
                g_im = gsrc[g + u + hn];

                res = FPC_MUL(F_re, F_im, f_re, this.fpre.fpr_neg(f_im));
                a_re = res[0]; a_im = res[1];
                res = FPC_MUL(G_re, G_im, g_re, this.fpre.fpr_neg(g_im));
                b_re = res[0]; b_im = res[1];
                dsrc[d + u] = this.fpre.fpr_add(a_re, b_re);
                dsrc[d + u + hn] = this.fpre.fpr_add(a_im, b_im);
            }
        }

        internal void poly_mul_autoadj_fft(
            FalconFPR[] asrc, int a, FalconFPR[] bsrc, int b, uint logn)
        {
            int n, hn, u;

            n = (int)1 << (int)logn;
            hn = n >> 1;
            for (u = 0; u < hn; u ++) {
                asrc[a + u] = this.fpre.fpr_mul(asrc[a + u], bsrc[b + u]);
                asrc[a + u + hn] = this.fpre.fpr_mul(asrc[a + u + hn], bsrc[b + u]);
            }
        }

        internal void poly_div_autoadj_fft(
            FalconFPR[] asrc, int a, FalconFPR[] bsrc, int b, uint logn)
        {
            int n, hn, u;

            n = (int)1 << (int)logn;
            hn = n >> 1;
            for (u = 0; u < hn; u ++) {
                FalconFPR ib;

                ib = this.fpre.fpr_inv(bsrc[b + u]);
                asrc[a + u] = this.fpre.fpr_mul(asrc[a + u], ib);
                asrc[a + u + hn] = this.fpre.fpr_mul(asrc[a + u + hn], ib);
            }
        }

        internal void poly_LDL_fft(
            FalconFPR[] g00src, int g00,
            FalconFPR[] g01src, int g01, FalconFPR[] g11src, int g11, uint logn)
        {
            int n, hn, u;

            n = (int)1 << (int)logn;
            hn = n >> 1;
            for (u = 0; u < hn; u ++) {
                FalconFPR g00_re, g00_im, g01_re, g01_im, g11_re, g11_im;
                FalconFPR[] res;
                FalconFPR mu_re, mu_im;

                g00_re = g00src[g00 + u];
                g00_im = g00src[g00 + u + hn];
                g01_re = g01src[g01 + u];
                g01_im = g01src[g01 + u + hn];
                g11_re = g11src[g11 + u];
                g11_im = g11src[g11 + u + hn];
                res = FPC_DIV(g01_re, g01_im, g00_re, g00_im);
                mu_re = res[0]; mu_im = res[1];
                res = FPC_MUL(mu_re, mu_im, g01_re, this.fpre.fpr_neg(g01_im));
                g01_re = res[0]; g01_im = res[1];
                res = FPC_SUB(g11_re, g11_im, g01_re, g01_im);
                g11src[g11 + u] = res[0]; g11src[g11 + u + hn] = res[1];
                g01src[g01 + u] = mu_re;
                g01src[g01 + u + hn] = this.fpre.fpr_neg(mu_im);
            }
        }

        internal void poly_LDLmv_fft(
            FalconFPR[] d11src, int d11, FalconFPR[] l10src, int l10,
            FalconFPR[] g00src, int g00, FalconFPR[] g01src, int g01,
            FalconFPR[] g11src, int g11, uint logn)
        {
            int n, hn, u;

            n = (int)1 << (int)logn;
            hn = n >> 1;
            for (u = 0; u < hn; u ++) {
                FalconFPR g00_re, g00_im, g01_re, g01_im, g11_re, g11_im;
                FalconFPR[] res;
                FalconFPR mu_re, mu_im;

                g00_re = g00src[g00 + u];
                g00_im = g00src[g00 + u + hn];
                g01_re = g01src[g01 + u];
                g01_im = g01src[g01 + u + hn];
                g11_re = g11src[g11 + u];
                g11_im = g11src[g11 + u + hn];
                res = FPC_DIV(g01_re, g01_im, g00_re, g00_im);
                mu_re = res[0]; mu_im = res[1];
                res = FPC_MUL(mu_re, mu_im, g01_re, this.fpre.fpr_neg(g01_im));
                g01_re = res[0]; g01_im = res[1];
                res = FPC_SUB(g11_re, g11_im, g01_re, g01_im);
                d11src[d11 + u] = res[0]; d11src[d11 + u + hn] = res[1];
                l10src[l10 + u] = mu_re;
                l10src[l10 + u + hn] = this.fpre.fpr_neg(mu_im);
            }
        }

        internal void poly_split_fft(
            FalconFPR[] f0src, int f0, FalconFPR[] f1src, int f1,
            FalconFPR[] fsrc, int f, uint logn)
        {
            /*
            * The FFT representation we use is in bit-reversed order
            * (element i contains f(w^(rev(i))), where rev() is the
            * bit-reversal function over the ring degree. This changes
            * indexes with regards to the Falcon specification.
            */
            int n, hn, qn, u;

            n = (int)1 << (int)logn;
            hn = n >> 1;
            qn = hn >> 1;

            /*
            * We process complex values by pairs. For logn = 1, there is only
            * one complex value (the other one is the implicit conjugate),
            * so we add the two lines below because the loop will be
            * skipped.
            */
            f0src[f0 + 0] = fsrc[f + 0];
            f1src[f1 + 0] = fsrc[f + hn];

            for (u = 0; u < qn; u ++) {
                FalconFPR a_re, a_im, b_re, b_im, t_re, t_im;
                FalconFPR[] res;

                a_re = fsrc[f + (u << 1) + 0];
                a_im = fsrc[f + (u << 1) + 0 + hn];
                b_re = fsrc[f + (u << 1) + 1];
                b_im = fsrc[f + (u << 1) + 1 + hn];

                res = FPC_ADD(a_re, a_im, b_re, b_im);
                t_re = res[0]; t_im = res[1];
                f0src[f0 + u] = this.fpre.fpr_half(t_re);
                f0src[f0 + u + qn] = this.fpre.fpr_half(t_im);

                res = FPC_SUB(a_re, a_im, b_re, b_im);
                t_re = res[0]; t_im = res[1];
                res = FPC_MUL(t_re, t_im,
                    this.fpre.fpr_gm_tab[((u + hn) << 1) + 0],
                    this.fpre.fpr_neg(this.fpre.fpr_gm_tab[((u + hn) << 1) + 1]));
                t_re = res[0]; t_im = res[1];
                f1src[f1 + u] = this.fpre.fpr_half(t_re);
                f1src[f1 + u + qn] = this.fpre.fpr_half(t_im);
            }
        }

        internal void poly_merge_fft(
            FalconFPR[] fsrc, int f,
            FalconFPR[] f0src, int f0, FalconFPR[] f1src, int f1, uint logn)
        {
            int n, hn, qn, u;

            n = (int)1 << (int)logn;
            hn = n >> 1;
            qn = hn >> 1;

            /*
            * An extra copy to handle the special case logn = 1.
            */
            fsrc[f + 0] = f0src[f0 + 0];
            fsrc[f + hn] = f1src[f1 + 0];

            for (u = 0; u < qn; u ++) {
                FalconFPR a_re, a_im, 
                          b_re, b_im;
                FalconFPR t_re, t_im;
                FalconFPR[] res;

                a_re = f0src[f0 + u];
                a_im = f0src[f0 + u + qn];
                res = FPC_MUL(f1src[f1 + u], f1src[f1 + u + qn],
                    this.fpre.fpr_gm_tab[((u + hn) << 1) + 0],
                    this.fpre.fpr_gm_tab[((u + hn) << 1) + 1]);
                b_re = res[0]; b_im = res[1];
                res = FPC_ADD(a_re, a_im, b_re, b_im);
                t_re = res[0]; t_im = res[1];
                fsrc[f + (u << 1) + 0] = t_re;
                fsrc[f + (u << 1) + 0 + hn] = t_im;
                res = FPC_SUB(a_re, a_im, b_re, b_im);
                t_re = res[0]; t_im = res[1];
                fsrc[f + (u << 1) + 1] = t_re;
                fsrc[f + (u << 1) + 1 + hn] = t_im;
            }
        }
    }
}
