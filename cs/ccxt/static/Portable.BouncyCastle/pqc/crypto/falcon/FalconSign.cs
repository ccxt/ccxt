using System;

namespace Org.BouncyCastle.Pqc.Crypto.Falcon
{
    class FalconSign
    {

        FalconFFT ffte;
        FPREngine fpre;
        FalconCommon common;

        internal FalconSign(FalconCommon common) {
            this.ffte = new FalconFFT();
            this.fpre = new FPREngine();
            this.common = common;
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
        * Binary case:
        *   N = 2^logn
        *   phi = X^N+1
        */

        /*
        * Get the size of the LDL tree for an input with polynomials of size
        * 2^logn. The size is expressed in the number of elements.
        */
        internal uint ffLDL_treesize(uint logn)
        {
            /*
            * For logn = 0 (polynomials are constant), the "tree" is a
            * single element. Otherwise, the tree node has size 2^logn, and
            * has two child trees for size logn-1 each. Thus, treesize s()
            * must fulfill these two relations:
            *
            *   s(0) = 1
            *   s(logn) = (2^logn) + 2*s(logn-1)
            */
            return (logn + 1) << (int)logn;
        }

        /*
        * Inner function for ffLDL_fft(). It expects the matrix to be both
        * auto-adjoint and quasicyclic; also, it uses the source operands
        * as modifiable temporaries.
        *
        * tmp[] must have room for at least one polynomial.
        */
        internal void ffLDL_fft_inner(FalconFPR[] treesrc, int tree,
            FalconFPR[] g0src, int g0, FalconFPR[] g1src, int g1, uint logn, FalconFPR[] tmpsrc, int tmp)
        {
            int n, hn;

            n = (int)1 << (int)logn;
            if (n == 1) {
                treesrc[tree+0] = g0src[g0 + 0];
                return;
            }
            hn = n >> 1;

            /*
            * The LDL decomposition yields L (which is written in the tree)
            * and the diagonal of D. Since d00 = g0, we just write d11
            * into tmp.
            */
            this.ffte.poly_LDLmv_fft(tmpsrc, tmp, treesrc, tree, g0src, g0, g1src, g1, g0src, g0, logn);

            /*
            * Split d00 (currently in g0) and d11 (currently in tmp). We
            * reuse g0 and g1 as temporary storage spaces:
            *   d00 splits into g1, g1+hn
            *   d11 splits into g0, g0+hn
            */
            this.ffte.poly_split_fft(g1src, g1, g1src, g1 + hn, g0src, g0, logn);
            this.ffte.poly_split_fft(g0src, g0, g0src, g0 + hn, tmpsrc, tmp, logn);

            /*
            * Each split result is the first row of a new auto-adjoint
            * quasicyclic matrix for the next recursive step.
            */
            ffLDL_fft_inner(treesrc, tree + n,
                g1src, g1, g1src, g1 + hn, logn - 1, tmpsrc, tmp);
            ffLDL_fft_inner(treesrc, tree + n + (int)ffLDL_treesize(logn - 1),
                g0src, g0, g0src, g0 + hn, logn - 1, tmpsrc, tmp);
        }

        /*
        * Compute the ffLDL tree of an auto-adjoint matrix G. The matrix
        * is provided as three polynomials (FFT representation).
        *
        * The "tree" array is filled with the computed tree, of size
        * (logn+1)*(2^logn) elements (see ffLDL_treesize()).
        *
        * Input arrays MUST NOT overlap, except possibly the three unmodified
        * arrays g00, g01 and g11. tmp[] should have room for at least three
        * polynomials of 2^logn elements each.
        */
        internal void ffLDL_fft(FalconFPR[] treesrc, int tree, FalconFPR[] g00src, int g00,
            FalconFPR[] g01src, int g01, FalconFPR[] g11src, int g11,
            uint logn, FalconFPR[] tmpsrc, int tmp)
        {
            int n, hn;
            int d00, d11;

            n = (int)1 << (int)logn;
            if (n == 1) {
                treesrc[tree+0] = g00src[g00+0];
                return;
            }
            hn = n >> 1;
            d00 = tmp;
            d11 = tmp + n;
            tmp += n << 1;

            // memcpy(d00, g00, n * sizeof *g00);
            Array.Copy(g00src, g00, tmpsrc, d00, n);
            this.ffte.poly_LDLmv_fft(tmpsrc, d11, treesrc, tree, g00src, g00, g01src, g01, g11src, g11, logn);

            this.ffte.poly_split_fft(tmpsrc, tmp, tmpsrc, tmp + hn, tmpsrc, d00, logn);
            this.ffte.poly_split_fft(tmpsrc, d00, tmpsrc, d00 + hn, tmpsrc, d11, logn);
            // memcpy(d11, tmp, n * sizeof *tmp);
            Array.Copy(tmpsrc, tmp, tmpsrc, d11, n);
            ffLDL_fft_inner(treesrc, tree + n,
                tmpsrc, d11, tmpsrc, d11 + hn, logn - 1, tmpsrc, tmp);
            ffLDL_fft_inner(treesrc, tree + n + (int)ffLDL_treesize(logn - 1),
                tmpsrc, d00, tmpsrc, d00 + hn, logn - 1, tmpsrc, tmp);
        }

        /*
        * Normalize an ffLDL tree: each leaf of value x is replaced with
        * sigma / sqrt(x).
        */
        internal void ffLDL_binary_normalize(FalconFPR[] treesrc, int tree, uint orig_logn, uint logn)
        {
            /*
            * TODO: make an iterative version.
            */
            int n;

            n = (int)1 << (int)logn;
            if (n == 1) {
                /*
                * We actually store in the tree leaf the inverse of
                * the value mandated by the specification: this
                * saves a division both here and in the sampler.
                */
                treesrc[tree+0] = this.fpre.fpr_mul(this.fpre.fpr_sqrt(treesrc[tree+0]), this.fpre.fpr_inv_sigma[orig_logn]);
            } else {
                ffLDL_binary_normalize(treesrc, tree + n, orig_logn, logn - 1);
                ffLDL_binary_normalize(treesrc, tree + n + (int)ffLDL_treesize(logn - 1),
                    orig_logn, logn - 1);
            }
        }

        /* =================================================================== */

        /*
        * Convert an integer polynomial (with small values) into the
        * representation with complex numbers.
        */
        internal void smallints_to_fpr(FalconFPR[] rsrc, int r, sbyte[] tsrc, int t, uint logn)
        {
            int n, u;

            n = (int)1 << (int)logn;
            for (u = 0; u < n; u ++) {
                rsrc[r+u] = this.fpre.fpr_of(tsrc[t+u]);
            }
        }

        /*
        * The expanded private key contains:
        *  - The B0 matrix (four elements)
        *  - The ffLDL tree
        */

        int skoff_b00(uint logn)
        {
            return 0;
        }

        int skoff_b01(uint logn)
        {
            return (int)1 << (int)logn;
        }

        int skoff_b10(uint logn)
        {
            return 2 * (int)1 << (int)logn;
        }

        int skoff_b11(uint logn)
        {
            return 3 * (int)1 << (int)logn;
        }

        int skoff_tree(uint logn)
        {
            return 4 * (int)1 << (int)logn;
        }

        /*
        * Perform Fast Fourier Sampling for target vector t. The Gram matrix
        * is provided (G = [[g00, g01], [adj(g01), g11]]). The sampled vector
        * is written over (t0,t1). The Gram matrix is modified as well. The
        * tmp[] buffer must have room for four polynomials.
        */
        internal void ffSampling_fft_dyntree(SamplerZ samp,
            FalconFPR[] t0src, int t0, FalconFPR[] t1src, int t1,
            FalconFPR[] g00src, int g00, FalconFPR[] g01src, int g01, FalconFPR[] g11src, int g11,
            uint orig_logn, uint logn, FalconFPR[] tmpsrc, int tmp)
        {
            int n, hn;
            int z0, z1;

            /*
            * Deepest level: the LDL tree leaf value is just g00 (the
            * array has length only 1 at this point); we normalize it
            * with regards to sigma, then use it for sampling.
            */
            if (logn == 0) {
                FalconFPR leaf;

                leaf = g00src[g00+0];
                leaf = this.fpre.fpr_mul(this.fpre.fpr_sqrt(leaf), this.fpre.fpr_inv_sigma[orig_logn]);
                t0src[t0+0] = this.fpre.fpr_of(samp.Sample(t0src[t0+0], leaf));
                t1src[t1+0] = this.fpre.fpr_of(samp.Sample(t1src[t1+0], leaf));
                return;
            }

            n = (int)1 << (int)logn;
            hn = n >> 1;

            /*
            * Decompose G into LDL. We only need d00 (identical to g00),
            * d11, and l10; we do that in place.
            */
            this.ffte.poly_LDL_fft(g00src, g00, g01src, g01, g11src, g11, logn);

            /*
            * Split d00 and d11 and expand them into half-size quasi-cyclic
            * Gram matrices. We also save l10 in tmp[].
            */
            this.ffte.poly_split_fft(tmpsrc, tmp, tmpsrc, tmp + hn, g00src, g00, logn);
            // memcpy(g00, tmp, n * sizeof *tmp);
            Array.Copy(tmpsrc, tmp, g00src, g00, n);
            this.ffte.poly_split_fft(tmpsrc, tmp, tmpsrc, tmp + hn, g11src, g11, logn);
            // memcpy(g11, tmp, n * sizeof *tmp);
            // memcpy(tmp, g01, n * sizeof *g01);
            // memcpy(g01, g00, hn * sizeof *g00);
            // memcpy(g01 + hn, g11, hn * sizeof *g00);
            Array.Copy(tmpsrc, tmp, g11src, g11, n);
            Array.Copy(g01src, g01, tmpsrc, tmp, n);
            Array.Copy(g00src, g00,g01src, g01, hn);
            Array.Copy(g11src, g11, g01src, g01 + hn, hn);
            /*
            * The half-size Gram matrices for the recursive LDL tree
            * building are now:
            *   - left sub-tree: g00, g00+hn, g01
            *   - right sub-tree: g11, g11+hn, g01+hn
            * l10 is in tmp[].
            */

            /*
            * We split t1 and use the first recursive call on the two
            * halves, using the right sub-tree. The result is merged
            * back into tmp + 2*n.
            */
            z1 = tmp + n;
            this.ffte.poly_split_fft(tmpsrc, z1, tmpsrc, z1 + hn, tmpsrc, t1, logn);
            ffSampling_fft_dyntree(samp, tmpsrc, z1, tmpsrc, z1 + hn,
                g11src, g11, g11src, g11 + hn, g01src, g01 + hn, orig_logn, logn - 1, tmpsrc, z1 + n);
            this.ffte.poly_merge_fft(tmpsrc, tmp + (n << 1), tmpsrc, z1, tmpsrc, z1 + hn, logn);

            /*
            * Compute tb0 = t0 + (t1 - z1) * l10.
            * At that point, l10 is in tmp, t1 is unmodified, and z1 is
            * in tmp + (n << 1). The buffer in z1 is free.
            *
            * In the end, z1 is written over t1, and tb0 is in t0.
            */
            // memcpy(z1, t1, n * sizeof *t1);
            Array.Copy(tmpsrc, t1, tmpsrc, z1, n);
            this.ffte.poly_sub(tmpsrc, z1, tmpsrc, tmp + (n << 1), logn);
            // memcpy(t1, tmp + (n << 1), n * sizeof *tmp);
            Array.Copy(tmpsrc, tmp + (n << 1), tmpsrc, t1, n);
            this.ffte.poly_mul_fft(tmpsrc, tmp, tmpsrc, z1, logn);
            this.ffte.poly_add(tmpsrc, t0, tmpsrc, tmp, logn);

            /*
            * Second recursive invocation, on the split tb0 (currently in t0)
            * and the left sub-tree.
            */
            z0 = tmp;
            this.ffte.poly_split_fft(tmpsrc, z0, tmpsrc, z0 + hn, tmpsrc, t0, logn);
            ffSampling_fft_dyntree(samp, tmpsrc, z0, tmpsrc, z0 + hn,
                g00src, g00, g00src, g00 + hn, g01src, g01, orig_logn, logn - 1, tmpsrc, z0 + n);
            this.ffte.poly_merge_fft(tmpsrc, t0, tmpsrc, z0, tmpsrc, z0 + hn, logn);
        }

        /*
        * Perform Fast Fourier Sampling for target vector t and LDL tree T.
        * tmp[] must have size for at least two polynomials of size 2^logn.
        */
        internal void ffSampling_fft(SamplerZ samp,
            FalconFPR[] z0src, int z0, FalconFPR[] z1src, int z1,
            FalconFPR[] treesrc, int tree,
            FalconFPR[] t0src, int t0, FalconFPR[] t1src, int t1, uint logn,
            FalconFPR[] tmpsrc, int tmp)
        {
            int n, hn;
            int tree0, tree1;

            /*
            * When logn == 2, we inline the last two recursion levels.
            */
            if (logn == 2) {
                FalconFPR x0, x1, y0, y1, w0, w1, w2, w3, sigma;
                FalconFPR a_re, a_im, b_re, b_im, c_re, c_im;

                tree0 = tree + 4;
                tree1 = tree + 8;

                /*
                * We split t1 into w*, then do the recursive invocation,
                * with output in w*. We finally merge back into z1.
                */
                a_re = t1src[t1+0];
                a_im = t1src[t1 + 2];
                b_re = t1src[t1 + 1];
                b_im = t1src[t1 + 3];
                c_re = this.fpre.fpr_add(a_re, b_re);
                c_im = this.fpre.fpr_add(a_im, b_im);
                w0 = this.fpre.fpr_half(c_re);
                w1 = this.fpre.fpr_half(c_im);
                c_re = this.fpre.fpr_sub(a_re, b_re);
                c_im = this.fpre.fpr_sub(a_im, b_im);
                w2 = this.fpre.fpr_mul(this.fpre.fpr_add(c_re, c_im), this.fpre.fpr_invsqrt8);
                w3 = this.fpre.fpr_mul(this.fpre.fpr_sub(c_im, c_re), this.fpre.fpr_invsqrt8);

                x0 = w2;
                x1 = w3;
                sigma = treesrc[tree1 + 3];
                w2 = this.fpre.fpr_of(samp.Sample(x0, sigma));
                w3 = this.fpre.fpr_of(samp.Sample(x1, sigma));
                a_re = this.fpre.fpr_sub(x0, w2);
                a_im = this.fpre.fpr_sub(x1, w3);
                b_re = treesrc[tree1 + 0];
                b_im = treesrc[tree1 + 1];
                c_re = this.fpre.fpr_sub(this.fpre.fpr_mul(a_re, b_re), this.fpre.fpr_mul(a_im, b_im));
                c_im = this.fpre.fpr_add(this.fpre.fpr_mul(a_re, b_im), this.fpre.fpr_mul(a_im, b_re));
                x0 = this.fpre.fpr_add(c_re, w0);
                x1 = this.fpre.fpr_add(c_im, w1);
                sigma = treesrc[tree1 + 2];
                w0 = this.fpre.fpr_of(samp.Sample(x0, sigma));
                w1 = this.fpre.fpr_of(samp.Sample(x1, sigma));

                a_re = w0;
                a_im = w1;
                b_re = w2;
                b_im = w3;
                c_re = this.fpre.fpr_mul(this.fpre.fpr_sub(b_re, b_im), this.fpre.fpr_invsqrt2);
                c_im = this.fpre.fpr_mul(this.fpre.fpr_add(b_re, b_im), this.fpre.fpr_invsqrt2);
                z1src[z1 + 0] = w0 = this.fpre.fpr_add(a_re, c_re);
                z1src[z1 + 2] = w2 = this.fpre.fpr_add(a_im, c_im);
                z1src[z1 + 1] = w1 = this.fpre.fpr_sub(a_re, c_re);
                z1src[z1 + 3] = w3 = this.fpre.fpr_sub(a_im, c_im);

                /*
                * Compute tb0 = t0 + (t1 - z1) * L. Value tb0 ends up in w*.
                */
                w0 = this.fpre.fpr_sub(t1src[t1+0], w0);
                w1 = this.fpre.fpr_sub(t1src[t1 + 1], w1);
                w2 = this.fpre.fpr_sub(t1src[t1 + 2], w2);
                w3 = this.fpre.fpr_sub(t1src[t1 + 3], w3);

                a_re = w0;
                a_im = w2;
                b_re = treesrc[tree+0];
                b_im = treesrc[tree + 2];
                w0 = this.fpre.fpr_sub(this.fpre.fpr_mul(a_re, b_re), this.fpre.fpr_mul(a_im, b_im));
                w2 = this.fpre.fpr_add(this.fpre.fpr_mul(a_re, b_im), this.fpre.fpr_mul(a_im, b_re));
                a_re = w1;
                a_im = w3;
                b_re = treesrc[tree + 1];
                b_im = treesrc[tree + 3];
                w1 = this.fpre.fpr_sub(this.fpre.fpr_mul(a_re, b_re), this.fpre.fpr_mul(a_im, b_im));
                w3 = this.fpre.fpr_add(this.fpre.fpr_mul(a_re, b_im), this.fpre.fpr_mul(a_im, b_re));

                w0 = this.fpre.fpr_add(w0, t0src[t0+0]);
                w1 = this.fpre.fpr_add(w1, t0src[t0 + 1]);
                w2 = this.fpre.fpr_add(w2, t0src[t0 + 2]);
                w3 = this.fpre.fpr_add(w3, t0src[t0 + 3]);

                /*
                * Second recursive invocation.
                */
                a_re = w0;
                a_im = w2;
                b_re = w1;
                b_im = w3;
                c_re = this.fpre.fpr_add(a_re, b_re);
                c_im = this.fpre.fpr_add(a_im, b_im);
                w0 = this.fpre.fpr_half(c_re);
                w1 = this.fpre.fpr_half(c_im);
                c_re = this.fpre.fpr_sub(a_re, b_re);
                c_im = this.fpre.fpr_sub(a_im, b_im);
                w2 = this.fpre.fpr_mul(this.fpre.fpr_add(c_re, c_im), this.fpre.fpr_invsqrt8);
                w3 = this.fpre.fpr_mul(this.fpre.fpr_sub(c_im, c_re), this.fpre.fpr_invsqrt8);

                x0 = w2;
                x1 = w3;
                sigma = treesrc[tree0 + 3];
                w2 = y0 = this.fpre.fpr_of(samp.Sample(x0, sigma));
                w3 = y1 = this.fpre.fpr_of(samp.Sample(x1, sigma));
                a_re = this.fpre.fpr_sub(x0, y0);
                a_im = this.fpre.fpr_sub(x1, y1);
                b_re = treesrc[tree0 + 0];
                b_im = treesrc[tree0 + 1];
                c_re = this.fpre.fpr_sub(this.fpre.fpr_mul(a_re, b_re), this.fpre.fpr_mul(a_im, b_im));
                c_im = this.fpre.fpr_add(this.fpre.fpr_mul(a_re, b_im), this.fpre.fpr_mul(a_im, b_re));
                x0 = this.fpre.fpr_add(c_re, w0);
                x1 = this.fpre.fpr_add(c_im, w1);
                sigma = treesrc[tree0 + 2];
                w0 = this.fpre.fpr_of(samp.Sample(x0, sigma));
                w1 = this.fpre.fpr_of(samp.Sample(x1, sigma));

                a_re = w0;
                a_im = w1;
                b_re = w2;
                b_im = w3;
                c_re = this.fpre.fpr_mul(this.fpre.fpr_sub(b_re, b_im), this.fpre.fpr_invsqrt2);
                c_im = this.fpre.fpr_mul(this.fpre.fpr_add(b_re, b_im), this.fpre.fpr_invsqrt2);
                z0src[z0 + 0] = this.fpre.fpr_add(a_re, c_re);
                z0src[z0 + 2] = this.fpre.fpr_add(a_im, c_im);
                z0src[z0 + 1] = this.fpre.fpr_sub(a_re, c_re);
                z0src[z0 + 3] = this.fpre.fpr_sub(a_im, c_im);

                return;
            }

            /*
            * Case logn == 1 is reachable only when using Falcon-2 (the
            * smallest size for which Falcon is mathematically defined, but
            * of course way too insecure to be of any use).
            */
            if (logn == 1) {
                FalconFPR x0, x1, y0, y1, sigma;
                FalconFPR a_re, a_im, b_re, b_im, c_re, c_im;

                x0 = t1src[t1+0];
                x1 = t1src[t1 + 1];
                sigma = treesrc[tree + 3];
                z1src[z1 + 0] = y0 = this.fpre.fpr_of(samp.Sample(x0, sigma));
                z1src[z1 + 1] = y1 = this.fpre.fpr_of(samp.Sample(x1, sigma));
                a_re = this.fpre.fpr_sub(x0, y0);
                a_im = this.fpre.fpr_sub(x1, y1);
                b_re = treesrc[tree+0];
                b_im = treesrc[tree + 1];
                c_re = this.fpre.fpr_sub(this.fpre.fpr_mul(a_re, b_re), this.fpre.fpr_mul(a_im, b_im));
                c_im = this.fpre.fpr_add(this.fpre.fpr_mul(a_re, b_im), this.fpre.fpr_mul(a_im, b_re));
                x0 = this.fpre.fpr_add(c_re, t0src[t0+0]);
                x1 = this.fpre.fpr_add(c_im, t0src[t0 + 1]);
                sigma = treesrc[tree + 2];
                z0src[z0 + 0] = this.fpre.fpr_of(samp.Sample(x0, sigma));
                z0src[z0 + 1] = this.fpre.fpr_of(samp.Sample(x1, sigma));

                return;
            }

            /*
            * Normal end of recursion is for logn == 0. Since the last
            * steps of the recursions were inlined in the blocks above
            * (when logn == 1 or 2), this case is not reachable, and is
            * retained here only for documentation purposes.

            if (logn == 0) {
                fpr x0, x1, sigma;

                x0 = t0src[t0+0];
                x1 = t1src[t1+0];
                sigma = treesrc[tree+0];
                z0[0] = this.fpre.fpr_of(samp.sample(x0, sigma));
                z1src[z1 + 0] = this.fpre.fpr_of(samp.sample(x1, sigma));
                return;
            }

            */

            /*
            * General recursive case (logn >= 3).
            */

            n = (int)1 << (int)logn;
            hn = n >> 1;
            tree0 = tree + n;
            tree1 = tree + n + (int)ffLDL_treesize(logn - 1);

            /*
            * We split t1 into z1 (reused as temporary storage), then do
            * the recursive invocation, with output in tmp. We finally
            * merge back into z1.
            */
            this.ffte.poly_split_fft(z1src, z1, z1src, z1 + hn, t1src, t1, logn);
            ffSampling_fft(samp, tmpsrc, tmp, tmpsrc, tmp + hn,
                treesrc, tree1, z1src, z1, z1src, z1 + hn, logn - 1, tmpsrc, tmp + n);
            this.ffte.poly_merge_fft(z1src, z1, tmpsrc, tmp, tmpsrc, tmp + hn, logn);

            /*
            * Compute tb0 = t0 + (t1 - z1) * L. Value tb0 ends up in tmp[].
            */
            // memcpy(tmp, t1, n * sizeof *t1);
            Array.Copy(t1src, t1, tmpsrc, tmp, n);
            this.ffte.poly_sub(tmpsrc, tmp, z1src, z1, logn);
            this.ffte.poly_mul_fft(tmpsrc, tmp, treesrc, tree, logn);
            this.ffte.poly_add(tmpsrc, tmp, t0src, t0, logn);

            /*
            * Second recursive invocation.
            */
            this.ffte.poly_split_fft(z0src, z0, z0src, z0 + hn, tmpsrc, tmp, logn);
            ffSampling_fft(samp, tmpsrc, tmp, tmpsrc, tmp + hn,
                treesrc, tree0, z0src, z0, z0src, z0 + hn, logn - 1, tmpsrc, tmp + n);
            this.ffte.poly_merge_fft(z0src, z0, tmpsrc, tmp, tmpsrc, tmp + hn, logn);
        }

        /*
        * Compute a signature: the signature contains two vectors, s1 and s2.
        * The s1 vector is not returned. The squared norm of (s1,s2) is
        * computed, and if it is short enough, then s2 is returned into the
        * s2[] buffer, and 1 is returned; otherwise, s2[] is untouched and 0 is
        * returned; the caller should then try again. This function uses an
        * expanded key.
        *
        * tmp[] must have room for at least six polynomials.
        */
        internal int do_sign_tree(SamplerZ samp, short[] s2src, int s2,
            FalconFPR[] ex_keysrc, int expanded_key,
            ushort[] hmsrc, int hm,
            uint logn, FalconFPR[] tmpsrc, int tmp)
        {
            int n, u;
            int t0, t1, tx, ty;
            int b00, b01, b10, b11, tree;
            FalconFPR ni;
            uint sqn, ng;
            short[] s1tmp, s2tmp;

            n = (int)1 << (int)logn;
            t0 = tmp;
            t1 = t0 + n;
            b00 = expanded_key + skoff_b00(logn);
            b01 = expanded_key + skoff_b01(logn);
            b10 = expanded_key + skoff_b10(logn);
            b11 = expanded_key + skoff_b11(logn);
            tree = expanded_key + skoff_tree(logn);

            /*
            * Set the target vector to [hm, 0] (hm is the hashed message).
            */
            for (u = 0; u < n; u ++) {
                tmpsrc[t0+u] = this.fpre.fpr_of(hmsrc[hm + u]);
                /* This is implicit.
                t1src[t1 + u] = fpr_zero;
                */
            }

            /*
            * Apply the lattice basis to obtain the real target
            * vector (after normalization with regards to modulus).
            */
            this.ffte.FFT(tmpsrc, t0, logn);
            ni = this.fpre.fpr_inverse_of_q;
            // memcpy(t1, t0, n * sizeof *t0);
            Array.Copy(tmpsrc, t0, tmpsrc, t1, n);
            this.ffte.poly_mul_fft(tmpsrc, t1, ex_keysrc, b01, logn);
            this.ffte.poly_mulconst(tmpsrc, t1, this.fpre.fpr_neg(ni), logn);
            this.ffte.poly_mul_fft(tmpsrc, t0, ex_keysrc, b11, logn);
            this.ffte.poly_mulconst(tmpsrc, t0, ni, logn);

            tx = t1 + n;
            ty = tx + n;

            /*
            * Apply sampling. Output is written back in [tx, ty].
            */
            ffSampling_fft(samp, tmpsrc, tx, tmpsrc, ty, ex_keysrc, tree, tmpsrc, t0, tmpsrc, t1, logn, tmpsrc, ty + n);

            /*
            * Get the lattice point corresponding to that tiny vector.
            */
            // memcpy(t0, tx, n * sizeof *tx);
            Array.Copy(tmpsrc, tx, tmpsrc, t0, n);
            // memcpy(t1, ty, n * sizeof *ty);
            Array.Copy(tmpsrc, ty, tmpsrc, t1, n);
            this.ffte.poly_mul_fft(tmpsrc, tx, ex_keysrc, b00, logn);
            this.ffte.poly_mul_fft(tmpsrc, ty, ex_keysrc, b10, logn);
            this.ffte.poly_add(tmpsrc, tx, tmpsrc, ty, logn);
            // memcpy(ty, t0, n * sizeof *t0);
            Array.Copy(tmpsrc, t0, tmpsrc, ty, n);
            this.ffte.poly_mul_fft(tmpsrc, ty, ex_keysrc, b01, logn);

            // memcpy(t0, tx, n * sizeof *tx);
            Array.Copy(tmpsrc, tx, tmpsrc, t0, n);
            this.ffte.poly_mul_fft(tmpsrc, t1, ex_keysrc, b11, logn);
            this.ffte.poly_add(tmpsrc, t1, tmpsrc, ty, logn);

            this.ffte.iFFT(tmpsrc, t0, logn);
            this.ffte.iFFT(tmpsrc, t1, logn);

            /*
            * Compute the signature.
            */
            s1tmp = new short[n];
            s2tmp = new short[n];
            sqn = 0;
            ng = 0;
            for (u = 0; u < n; u ++) {
                int z;

                z = (int)hmsrc[hm + u] - (int)this.fpre.fpr_rint(tmpsrc[t0+u]);
                sqn += (uint)(z * z);
                ng |= sqn;
                s1tmp[u] = (short)z;
            }
            sqn |= (uint)(-(ng >> 31));

            /*
            * With "normal" degrees (e.g. 512 or 1024), it is very
            * improbable that the computed vector is not short enough;
            * however, it may happen in practice for the very reduced
            * versions (e.g. degree 16 or below). In that case, the caller
            * will loop, and we must not write anything into s2[] because
            * s2[] may overlap with the hashed message hm[] and we need
            * hm[] for the next iteration.
            */
            for (u = 0; u < n; u ++) {
                s2tmp[u] = (short)-this.fpre.fpr_rint(tmpsrc[t1 + u]);
            }
            if (this.common.is_short_half(sqn, s2tmp, 0, logn)) {
                // memcpy(s2, s2tmp, n * sizeof *s2);
                Array.Copy(s2tmp, 0, s2src, s2, n);
                // memcpy(tmp, s1tmp, n * sizeof *s1tmp);
                Array.Copy(s1tmp, 0, tmpsrc, tmp, n);
                return 1;
            }
            return 0;
        }

        /*
        * Compute a signature: the signature contains two vectors, s1 and s2.
        * The s1 vector is not returned. The squared norm of (s1,s2) is
        * computed, and if it is short enough, then s2 is returned into the
        * s2[] buffer, and 1 is returned; otherwise, s2[] is untouched and 0 is
        * returned; the caller should then try again.
        *
        * tmp[] must have room for at least nine polynomials.
        */
        internal int do_sign_dyn(SamplerZ samp, short[] s2src, int s2,
            sbyte[] fsrc, int f, sbyte[] gsrc, int g,
            sbyte[] Fsrc, int F, sbyte[] Gsrc, int G,
            ushort[] hmsrc, int hm, uint logn, FalconFPR[] tmpsrc, int tmp)
        {
            int n, u;
            int t0, t1, tx, ty;
            int b00, b01, b10, b11;
            int g00, g01, g11;
            FalconFPR ni;
            uint sqn, ng;
            short[] s1tmp, s2tmp;

            n = (int)1 << (int)logn;

            /*
            * Lattice basis is B = [[g, -f], [G, -F]]. We convert it to FFT.
            */
            b00 = tmp;
            b01 = b00 + n;
            b10 = b01 + n;
            b11 = b10 + n;
            smallints_to_fpr(tmpsrc, b01, fsrc, f, logn);
            smallints_to_fpr(tmpsrc, b00, gsrc, g, logn);
            smallints_to_fpr(tmpsrc, b11, Fsrc, F, logn);
            smallints_to_fpr(tmpsrc, b10, Gsrc, G, logn);
            this.ffte.FFT(tmpsrc, b01, logn);
            this.ffte.FFT(tmpsrc, b00, logn);
            this.ffte.FFT(tmpsrc, b11, logn);
            this.ffte.FFT(tmpsrc, b10, logn);
            this.ffte.poly_neg(tmpsrc, b01, logn);
            this.ffte.poly_neg(tmpsrc, b11, logn);

            /*
            * Compute the Gram matrix G = B·B*. Formulas are:
            *   g00 = b00*adj(b00) + b01*adj(b01)
            *   g01 = b00*adj(b10) + b01*adj(b11)
            *   g10 = b10*adj(b00) + b11*adj(b01)
            *   g11 = b10*adj(b10) + b11*adj(b11)
            *
            * For historical reasons, this implementation uses
            * g00, g01 and g11 (upper triangle). g10 is not kept
            * since it is equal to adj(g01).
            *
            * We _replace_ the matrix B with the Gram matrix, but we
            * must keep b01 and b11 for computing the target vector.
            */
            t0 = b11 + n;
            t1 = t0 + n;

            // memcpy(t0, b01, n * sizeof *b01);
            Array.Copy(tmpsrc, b01, tmpsrc, t0, n);
            this.ffte.poly_mulselfadj_fft(tmpsrc, t0, logn);    // t0 <- b01*adj(b01)

            // memcpy(t1, b00, n * sizeof *b00);
            Array.Copy(tmpsrc, b00, tmpsrc, t1, n);
            this.ffte.poly_muladj_fft(tmpsrc, t1, tmpsrc, b10, logn);   // t1 <- b00*adj(b10)
            this.ffte.poly_mulselfadj_fft(tmpsrc, b00, logn);   // b00 <- b00*adj(b00)
            this.ffte.poly_add(tmpsrc, b00, tmpsrc, t0, logn);      // b00 <- g00
            // memcpy(t0, b01, n * sizeof *b01);
            Array.Copy(tmpsrc, b01, tmpsrc, t0, n);
            this.ffte.poly_muladj_fft(tmpsrc, b01, tmpsrc, b11, logn);  // b01 <- b01*adj(b11)
            this.ffte.poly_add(tmpsrc, b01, tmpsrc, t1, logn);      // b01 <- g01

            this.ffte.poly_mulselfadj_fft(tmpsrc, b10, logn);   // b10 <- b10*adj(b10)
            // memcpy(t1, b11, n * sizeof *b11);
            Array.Copy(tmpsrc, b11, tmpsrc, t1, n);
            this.ffte.poly_mulselfadj_fft(tmpsrc, t1, logn);    // t1 <- b11*adj(b11)
            this.ffte.poly_add(tmpsrc, b10, tmpsrc, t1, logn);      // b10 <- g11

            /*
            * We rename variables to make things clearer. The three elements
            * of the Gram matrix uses the first 3*n slots of tmp[], followed
            * by b11 and b01 (in that order).
            */
            g00 = b00;
            g01 = b01;
            g11 = b10;
            b01 = t0;
            t0 = b01 + n;
            t1 = t0 + n;

            /*
            * Memory layout at that point:
            *   g00 g01 g11 b11 b01 t0 t1
            */

            /*
            * Set the target vector to [hm, 0] (hm is the hashed message).
            */
            for (u = 0; u < n; u ++) {
                tmpsrc[t0+u] = this.fpre.fpr_of((short)hmsrc[hm + u]);
                /* This is implicit.
                t1src[t1 + u] = fpr_zero;
                */
            }

            /*
            * Apply the lattice basis to obtain the real target
            * vector (after normalization with regards to modulus).
            */
            this.ffte.FFT(tmpsrc, t0, logn);
            ni = this.fpre.fpr_inverse_of_q;
            // memcpy(t1, t0, n * sizeof *t0);
            Array.Copy(tmpsrc, t0, tmpsrc, t1, n);
            this.ffte.poly_mul_fft(tmpsrc, t1, tmpsrc, b01, logn);
            this.ffte.poly_mulconst(tmpsrc, t1, this.fpre.fpr_neg(ni), logn);
            this.ffte.poly_mul_fft(tmpsrc, t0, tmpsrc, b11, logn);
            this.ffte.poly_mulconst(tmpsrc, t0, ni, logn);

            /*
            * b01 and b11 can be discarded, so we move back (t0,t1).
            * Memory layout is now:
            *      g00 g01 g11 t0 t1
            */
            // memcpy(b11, t0, n * 2 * sizeof *t0);
            Array.Copy(tmpsrc, t0, tmpsrc, b11, n * 2);
            t0 = g11 + n;
            t1 = t0 + n;

            /*
            * Apply sampling; result is written over (t0,t1).
            */
            ffSampling_fft_dyntree(samp,
                tmpsrc, t0, tmpsrc, t1, tmpsrc, g00, tmpsrc, g01, tmpsrc, g11, logn, logn, tmpsrc, t1 + n);

            /*
            * We arrange the layout back to:
            *     b00 b01 b10 b11 t0 t1
            *
            * We did not conserve the matrix basis, so we must recompute
            * it now.
            */
            b00 = tmp;
            b01 = b00 + n;
            b10 = b01 + n;
            b11 = b10 + n;
            // memmove(b11 + n, t0, n * 2 * sizeof *t0);
            Array.Copy(tmpsrc, t0, tmpsrc, b11 + n, n * 2);
            t0 = b11 + n;
            t1 = t0 + n;
            smallints_to_fpr(tmpsrc, b01, fsrc, f, logn);
            smallints_to_fpr(tmpsrc, b00, gsrc, g, logn);
            smallints_to_fpr(tmpsrc, b11, Fsrc, F, logn);
            smallints_to_fpr(tmpsrc, b10, Gsrc, G, logn);
            this.ffte.FFT(tmpsrc, b01, logn);
            this.ffte.FFT(tmpsrc, b00, logn);
            this.ffte.FFT(tmpsrc, b11, logn);
            this.ffte.FFT(tmpsrc, b10, logn);
            this.ffte.poly_neg(tmpsrc, b01, logn);
            this.ffte.poly_neg(tmpsrc, b11, logn);
            tx = t1 + n;
            ty = tx + n;

            /*
            * Get the lattice point corresponding to that tiny vector.
            */
            // memcpy(tx, t0, n * sizeof *t0);
            Array.Copy(tmpsrc, t0, tmpsrc, tx, n);
            // memcpy(ty, t1, n * sizeof *t1);
            Array.Copy(tmpsrc, t1, tmpsrc, ty, n);
            this.ffte.poly_mul_fft(tmpsrc, tx, tmpsrc, b00, logn);
            this.ffte.poly_mul_fft(tmpsrc, ty, tmpsrc, b10, logn);
            this.ffte.poly_add(tmpsrc, tx, tmpsrc, ty, logn);
            // memcpy(ty, t0, n * sizeof *t0);
            Array.Copy(tmpsrc, t0, tmpsrc, ty, n);
            this.ffte.poly_mul_fft(tmpsrc, ty, tmpsrc, b01, logn);

            // memcpy(t0, tx, n * sizeof *tx);
            Array.Copy(tmpsrc, tx, tmpsrc, t0, n);
            this.ffte.poly_mul_fft(tmpsrc, t1, tmpsrc, b11, logn);
            this.ffte.poly_add(tmpsrc, t1, tmpsrc, ty, logn);
            this.ffte.iFFT(tmpsrc, t0, logn);
            this.ffte.iFFT(tmpsrc, t1, logn);

            s1tmp = new short[n];
            sqn = 0;
            ng = 0;
            for (u = 0; u < n; u ++) {
                int z;

                z = (int)hmsrc[hm + u] - (int)this.fpre.fpr_rint(tmpsrc[t0+u]);
                sqn += (uint)(z * z);
                ng |= sqn;
                s1tmp[u] = (short)z;
            }
            sqn |= (uint)(-(ng >> 31));

            /*
            * With "normal" degrees (e.g. 512 or 1024), it is very
            * improbable that the computed vector is not short enough;
            * however, it may happen in practice for the very reduced
            * versions (e.g. degree 16 or below). In that case, the caller
            * will loop, and we must not write anything into s2[] because
            * s2[] may overlap with the hashed message hm[] and we need
            * hm[] for the next iteration.
            */
            s2tmp = new short[n];
            for (u = 0; u < n; u ++) {
                s2tmp[u] = (short)-this.fpre.fpr_rint(tmpsrc[t1 + u]);
            }
            if (this.common.is_short_half(sqn, s2tmp, 0, logn)) {
                // memcpy(s2, s2tmp, n * sizeof *s2);
                Array.Copy(s2tmp, 0, s2src, s2, n);
                // memcpy(tmp, s1tmp, n * sizeof *s1tmp);
                //Array.Copy(s1tmp, 0, tmpsrc, tmp, n);
                return 1;
            }
            return 0;
        }

        internal void sign_tree(short[] sigsrc, int sig, SHAKE256 rng,
            FalconFPR[] ex_keysrc, int expanded_key,
            ushort[] hmsrc, int hm, uint logn, FalconFPR[] tmpsrc, int tmp)
        {

            int ftmp = tmp;
            for (;;) {
                /*
                * Signature produces short vectors s1 and s2. The
                * signature is acceptable only if the aggregate vector
                * s1,s2 is short; we must use the same bound as the
                * verifier.
                *
                * If the signature is acceptable, then we return only s2
                * (the verifier recomputes s1 from s2, the hashed message,
                * and the public key).
                */
                
                /*
                * Normal sampling. We use a fast PRNG seeded from our
                * SHAKE context ('rng').
                */
                FalconRNG prng = new FalconRNG();
                prng.prng_init(rng);
                SamplerZ samp = new SamplerZ(prng, this.fpre.fpr_sigma_min[logn], this.fpre);


                /*
                * Do the actual signature.
                */
                if (do_sign_tree(samp, sigsrc, sig,
                    ex_keysrc, expanded_key, hmsrc, hm, logn, tmpsrc, ftmp) != 0)
                {
                    break;
                }
            }
        }

        internal void sign_dyn(short[] sigsrc, int sig, SHAKE256 rng,
            sbyte[] fsrc, int f, sbyte[] gsrc, int g,
            sbyte[] Fsrc, int F, sbyte[] Gsrc, int G,
            ushort[] hmsrc, int hm, uint logn, FalconFPR[] tmpsrc, int tmp)
        {
            for (;;) {
                /*
                * Signature produces short vectors s1 and s2. The
                * signature is acceptable only if the aggregate vector
                * s1,s2 is short; we must use the same bound as the
                * verifier.
                *
                * If the signature is acceptable, then we return only s2
                * (the verifier recomputes s1 from s2, the hashed message,
                * and the public key).
                */

                /*
                * Normal sampling. We use a fast PRNG seeded from our
                * SHAKE context ('rng').
                */

                FalconRNG prng = new FalconRNG();
                prng.prng_init(rng);
                SamplerZ samp = new SamplerZ(prng, this.fpre.fpr_sigma_min[logn], this.fpre);

                /*
                * Do the actual signature.
                */
                if (do_sign_dyn(samp, sigsrc, sig,
                    fsrc, f, gsrc,  g, Fsrc,  F, Gsrc,  G, hmsrc, hm, logn, tmpsrc, tmp) != 0)
                {
                    break;
                }
            }
        }
    }
}
