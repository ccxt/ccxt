using System;
using System.Diagnostics;
#if NETSTANDARD1_0_OR_GREATER || NETCOREAPP1_0_OR_GREATER
using System.Runtime.CompilerServices;
#endif

using Org.BouncyCastle.Crypto.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.Sike
{
    internal class Fpx
    {
        private SIKEEngine engine;

        internal Fpx(SIKEEngine engine)
        {
            this.engine = engine;
        }

        // Multiprecision left shift by one.
        private void mp_shiftl1(ulong[] x, uint nwords)
        {
            int i;
            for (i = (int)nwords-1; i > 0; i--)
            {
                //SHIFTL
                x[i] = (x[i] << 1) ^ (x[i-1] >> (int)(Internal.RADIX - 1));
            }
            x[0] <<= 1;
        }

        // Cyclotomic squaring on elements of norm 1, using a^(p+1) = 1.
        protected internal void sqr_Fp2_cycl(ulong[][] a, ulong[] one)
        {
            ulong[] t0 = new ulong[engine.param.NWORDS_FIELD];

            fpaddPRIME(a[0], a[1], t0);    // t0 = a0 + a1
            fpsqr_mont(t0, t0);            // t0 = t0^2
            fpsubPRIME(t0, one, a[1]);     // a1 = t0 - 1
            fpsqr_mont(a[0], t0);          // t0 = a0^2
            fpaddPRIME(t0, t0, t0);        // t0 = t0 + t0
            fpsubPRIME(t0, one, a[0]);     // a0 = t0 - 1
        }

        // n-way simultaneous inversion using Montgomery's trick.
        // SECURITY NOTE: This function does not run in constant time.
        // Also, vec and out CANNOT be the same variable!
        protected internal void mont_n_way_inv(ulong[][][] vec, uint n, ulong[][][] output)
        {
            ulong[][] t1 = Utils.InitArray(2, engine.param.NWORDS_FIELD);
            int i;

            fp2copy(vec[0], output[0]);                      // output[0] = vec[0]
            for (i = 1; i < n; i++)
            {
                fp2mul_mont(output[i-1], vec[i], output[i]);    // output[i] = output[i-1]*vec[i]
            }

            fp2copy(output[n-1], t1);                        // t1 = 1/output[n-1]
            fp2inv_mont_bingcd(t1);

            for (i = (int)n-1; i >= 1; i--)
            {
                fp2mul_mont(output[i-1], t1, output[i]);        // output[i] = t1*output[i-1]
                fp2mul_mont(t1, vec[i], t1);              // t1 = t1*vec[i]
            }
            fp2copy(t1, output[0]);                          // output[0] = t1
        }


        // Copy a field element, c = a.
        protected internal void fpcopy(ulong[] a, long aOffset, ulong[] c)
        {
            for (uint i = 0; i < engine.param.NWORDS_FIELD; i++)
            {
                c[i] = a[i + aOffset];
            }
        }

        // GF(p^2) addition without correction, c = a+b in GF(p^2).
        protected internal void mp2_add(ulong[][] a, ulong[][] b, ulong[][] c)
        {
            mp_add(a[0], b[0], c[0], engine.param.NWORDS_FIELD);
            mp_add(a[1], b[1], c[1], engine.param.NWORDS_FIELD);
        }

        // Modular correction, a = a in GF(p^2).
        protected internal void fp2correction(ulong[][] a)
        {
            fpcorrectionPRIME(a[0]);
            fpcorrectionPRIME(a[1]);
        }

        // Multiprecision addition, c = a+b, where lng(a) = lng(b) = nwords. Returns the carry bit.
        protected internal ulong mp_add(ulong[] a, ulong[] b, ulong[] c, uint nwords)
        {
            ulong carry = 0;

            for (uint i = 0; i < nwords; i++)
            {
                //ADDC
                ulong tempReg = a[i] + carry;
                c[i] = b[i] + tempReg;
                carry = (is_digit_lessthan_ct(tempReg, carry) | is_digit_lessthan_ct(c[i], tempReg));
            }
            return carry;
        }

        // Multiprecision addition, c = a+b, where lng(a) = lng(b) = nwords. Returns the carry bit.
        private ulong mp_add(ulong[] a, uint aOffset, ulong[] b, ulong[] c, uint cOffset, uint nwords)
        {
            ulong i, carry = 0;

            for (i = 0; i < nwords; i++)
            {
                //ADDC
                ulong tempReg = a[i + aOffset] + carry;
                c[i + cOffset] = b[i] + tempReg;
                carry = (is_digit_lessthan_ct(tempReg, carry) | is_digit_lessthan_ct(c[i + cOffset], tempReg));
            }
            return carry;
        }

        // Multiprecision addition, c = a+b, where lng(a) = lng(b) = nwords. Returns the carry bit.
        private ulong mp_add(ulong[] a, uint aOffset, ulong[] b, uint bOffset, ulong[] c, uint cOffset, uint nwords)
        {
            ulong i, carry = 0;

            for (i = 0; i < nwords; i++)
            {
                //ADDC
                ulong tempReg = a[i + aOffset] + carry;
                c[i + cOffset] = b[i + bOffset] + tempReg;
                carry = (is_digit_lessthan_ct(tempReg, carry) | is_digit_lessthan_ct(c[i + cOffset], tempReg));
            }
            return carry;
        }

        // Is x < y?
#if NETSTANDARD1_0_OR_GREATER || NETCOREAPP1_0_OR_GREATER
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
#endif
        private ulong is_digit_lessthan_ct(ulong x, ulong y)
        {
            return ((x ^ ((x ^ y) | ((x - y) ^ y))) >> (int)(Internal.RADIX -1));
        }

        // Is x != 0?
#if NETSTANDARD1_0_OR_GREATER || NETCOREAPP1_0_OR_GREATER
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
#endif
        private ulong is_digit_nonzero_ct(ulong x)
        {
            return ((x | (0-x)) >> (int)(Internal.RADIX -1));
        }
        // Is x = 0?
#if NETSTANDARD1_0_OR_GREATER || NETCOREAPP1_0_OR_GREATER
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
#endif
        private ulong is_digit_zero_ct(ulong x)
        {
            return (1 ^ is_digit_nonzero_ct(x));
        }

        internal void fp2neg(ulong[][] a)
        { // GF(p^2) negation, a = -a in GF(p^2).
            fpnegPRIME(a[0]);
            fpnegPRIME(a[1]);
        }

        // Is x = 0? return 1 (TRUE) if condition is true, 0 (FALSE) otherwise.
        // SECURITY NOTE: This function does not run in constant-time.
        protected internal bool is_felm_zero(ulong[] x)
        {
            for (uint i = 0; i < engine.param.NWORDS_FIELD; i++)
            {
                if (x[i] != 0)
                    return false;
            }
            return true;
        }

        // Is x < y? return 1 (TRUE) if condition is true, 0 (FALSE) otherwise.
        // SECURITY NOTE: This function does not run in constant-time.
        private bool is_felm_lt(ulong[] x, ulong[] y)
        {
            for (int i = (int)engine.param.NWORDS_FIELD-1; i >= 0; i--)
            {
                if (x[i] < y[i] )
                {
                    return true;
                }
                else if (x[i] > y[i] )
                {
                    return false;
                }
            }
            return false;
        }

        // Is x even? return 1 (TRUE) if condition is true, 0 (FALSE) otherwise.
        private static bool is_felm_even(ulong[] x)
        {
            return (x[0] & 1UL) == 0UL;
        }

        // Test if a is a square in GF(p^2) and return 1 if true, 0 otherwise
        // If a is a quadratic residue, s will be assigned with a partially computed square root of a
        protected internal bool is_sqr_fp2(ulong[][] a, ulong[] s)
        {
            uint i;
            ulong[] a0 = new ulong[engine.param.NWORDS_FIELD],
                    a1 = new ulong[engine.param.NWORDS_FIELD],
                    z = new ulong[engine.param.NWORDS_FIELD],
                    temp = new ulong[engine.param.NWORDS_FIELD];

            fpsqr_mont(a[0],a0);
            fpsqr_mont(a[1],a1);
            fpaddPRIME(a0,a1,z);

            fpcopy(z, 0,s);
            for (i = 0; i < engine.param.OALICE_BITS - 2; i++)
            {
                fpsqr_mont(s, s);
            }
            for (i = 0; i < engine.param.OBOB_EXPON; i++)
            {
                fpsqr_mont(s, temp);
                fpmul_mont(s, temp, s);
            }
            fpsqr_mont(s,temp);          // s = z^((p+1)/4)
            fpcorrectionPRIME(temp);
            fpcorrectionPRIME(z);
            if (!subarrayEquals(temp, z, engine.param.NWORDS_FIELD))  // s^2 !=? z
            {
                return false;
            }

            return true;
        }

        // Partial Montgomery inversion via the binary GCD algorithm.
        private uint fpinv_mont_bingcd_partial(ulong[] a, ulong[] x1)
        {
            // TODO Use faster (and optionally constant-time) inversion in Org.BouncyCastle.Math.Raw.Mod

            ulong[] u = new ulong[engine.param.NWORDS_FIELD],
                   v = new ulong[engine.param.NWORDS_FIELD],
                   x2 = new ulong[engine.param.NWORDS_FIELD];

            fpcopy(a, 0, u);
            fpcopy(engine.param.PRIME, 0, v);
            fpzero(x1); x1[0] = 1;
            fpzero(x2);
            uint k = 0;

            while (!is_felm_zero(v))
            {
                // Number of words necessary for x1, x2
                uint cwords = (++k / Internal.RADIX) + 1;
                if (cwords < engine.param.NWORDS_FIELD)
                {
                    if (is_felm_even(v))
                    {
                        mp_shiftr1(v);
                        mp_shiftl1(x1, cwords);
                    }
                    else if (is_felm_even(u))
                    {
                        mp_shiftr1(u);
                        mp_shiftl1(x2, cwords);
                    }
                    else if (!is_felm_lt(v, u))
                    {
                        mp_sub(v, u, v, engine.param.NWORDS_FIELD);
                        mp_shiftr1(v);
                        mp_add(x1, x2, x2, cwords);
                        mp_shiftl1(x1, cwords);
                    }
                    else
                    {
                        mp_sub(u, v, u, engine.param.NWORDS_FIELD);
                        mp_shiftr1(u);
                        mp_add(x1, x2, x1, cwords);
                        mp_shiftl1(x2, cwords);
                    }
                }
                else
                {
                    if (is_felm_even(v))
                    {
                        mp_shiftr1(v);
                        mp_shiftl1(x1, engine.param.NWORDS_FIELD);
                    }
                    else if (is_felm_even(u))
                    {
                        mp_shiftr1(u);
                        mp_shiftl1(x2, engine.param.NWORDS_FIELD);
                    }
                    else if (!is_felm_lt(v, u))
                    {
                        mp_sub(v, u, v, engine.param.NWORDS_FIELD);
                        mp_shiftr1(v);
                        mp_add(x1, x2, x2, engine.param.NWORDS_FIELD);
                        mp_shiftl1(x1, engine.param.NWORDS_FIELD);
                    }
                    else
                    {
                        mp_sub(u, v, u, engine.param.NWORDS_FIELD);
                        mp_shiftr1(u);
                        mp_add(x1, x2, x1, engine.param.NWORDS_FIELD);
                        mp_shiftl1(x2, engine.param.NWORDS_FIELD);
                    }
                }
            }

            if (is_felm_lt(engine.param.PRIME, x1))
            {
                mp_sub(x1, engine.param.PRIME, x1, engine.param.NWORDS_FIELD);
            }

            return k;
        }

        // Set up the value 2^mark.
        private void power2_setup(ulong[] x, int mark, uint nwords)
        {
            uint i;

            for (i = 0; i < nwords; i++) x[i] = 0;

            i = 0;
            while (mark >= 0)
            {
                if (mark < Internal.RADIX)
                {
                    x[i] = (ulong)1L << mark;
                }
                mark -= (int)Internal.RADIX;
                i += 1;
            }
        }


        // Field inversion via the binary GCD using Montgomery arithmetic, a = a^-1*r' mod p.
        // SECURITY NOTE: This function does not run in constant-time and is therefore only suitable for
        //                operations not involving any secret data.
        private void fpinv_mont_bingcd(ulong[] a)
        {
            if (is_felm_zero(a))
                return;

            ulong[] x = new ulong[engine.param.NWORDS_FIELD],
                   t = new ulong[engine.param.NWORDS_FIELD];

            uint k = fpinv_mont_bingcd_partial(a, x);
            if (k <= engine.param.MAXBITS_FIELD)
            {
                fpmul_mont(x, engine.param.Montgomery_R2, x);
                k += engine.param.MAXBITS_FIELD;
            }
            fpmul_mont(x, engine.param.Montgomery_R2, x);
            power2_setup(t, 2*(int)engine.param.MAXBITS_FIELD - (int)k, engine.param.NWORDS_FIELD);
            fpmul_mont(x, t, a);
        }

        // GF(p^2) inversion using Montgomery arithmetic, a = (a0-i*a1)/(a0^2+a1^2)
        // This uses the binary GCD for inversion in fp and is NOT constant time!!!
        protected internal void fp2inv_mont_bingcd(ulong[][] a)
        {
            ulong[][] t1 = Utils.InitArray(2, engine.param.NWORDS_FIELD);

            fpsqr_mont(a[0], t1[0]);             // t10 = a0^2
            fpsqr_mont(a[1], t1[1]);             // t11 = a1^2
            fpaddPRIME(t1[0], t1[1], t1[0]);     // t10 = a0^2+a1^2


            fpinv_mont_bingcd(t1[0]);            // t10 = (a0^2+a1^2)^-1
            fpnegPRIME(a[1]);                         // a = a0-i*a1
            fpmul_mont(a[0], t1[0], a[0]);
            fpmul_mont(a[1], t1[0], a[1]);       // a = (a0-i*a1)*(a0^2+a1^2)^-1
        }

        // GF(p^2) division by two, c = a/2  in GF(p^2).
        protected internal void fp2div2(ulong[][] a, ulong[][] c)
        {
            //todo/org : make fp class and change this to generic fpdiv2
            fpdiv2_PRIME(a[0], c[0]);
            fpdiv2_PRIME(a[1], c[1]);
        }

        // todo/org : move to fp_generic
        // Modular division by two, c = a/2 mod PRIME.
        // Input : a in [0, 2*PRIME-1]
        // Output: c in [0, 2*PRIME-1]
        private void fpdiv2_PRIME(ulong[] a, ulong[] c)
        {
            ulong i, carry = 0;
            ulong mask;

            mask = 0 - (a[0] & 1); // If a is odd compute a+PRIME
            for (i = 0; i < engine.param.NWORDS_FIELD; i++)
            {
                //ADDC
                ulong tempReg = a[i] + carry;
                c[i] = (engine.param.PRIME[i] & mask) + tempReg;
                carry = (is_digit_lessthan_ct(tempReg, carry) | is_digit_lessthan_ct(c[i], tempReg));
            }

            mp_shiftr1(c);
        }

        // todo/org : move to fp_generic
        // Multiprecision subtraction with correction with 2*p, c = a-b+2p.
        private void mp_subPRIME_p2(ulong [] a, ulong[] b, ulong[] c)
        {
            ulong i, borrow = 0;

            for (i = 0; i < engine.param.NWORDS_FIELD; i++)
            {
                //SUBC
                ulong tempReg = a[i] - b[i];
                ulong borrowReg = (is_digit_lessthan_ct(a[i], b[i]) | (borrow & is_digit_zero_ct(tempReg)));
                c[i] = tempReg - (ulong)(borrow);
                borrow = borrowReg;
            }

            borrow = 0;
            for (i = 0; i < engine.param.NWORDS_FIELD; i++)
            {
                //ADDC
                ulong tempReg = c[i] + borrow;
                c[i] = engine.param.PRIMEx2[i] + tempReg;
                borrow = (is_digit_lessthan_ct(tempReg, borrow) | is_digit_lessthan_ct(c[i], tempReg));
            }
        }

        // todo/org : move to fp_generic
        // Multiprecision subtraction with correction with 4*p, c = a-b+4p.
        private void mp_subPRIME_p4(ulong[] a, ulong[] b, ulong[] c)
        {
            ulong i, borrow = 0;

            for (i = 0; i < engine.param.NWORDS_FIELD; i++)
            {
                //SUBC
                ulong tempReg = a[i] - b[i];
                ulong borrowReg = (is_digit_lessthan_ct(a[i], b[i]) | (borrow & is_digit_zero_ct(tempReg)));
                c[i] = tempReg - (ulong)(borrow);
                borrow = borrowReg;

            }

            borrow = 0;
            for (i = 0; i < engine.param.NWORDS_FIELD; i++)
            {
                //ADDC
                ulong tempReg = c[i] + borrow;
                c[i] = engine.param.PRIMEx4[i] + tempReg;
                borrow = (is_digit_lessthan_ct(tempReg, borrow) | is_digit_lessthan_ct(c[i], tempReg));

            }
        }

        // todo/org : move to fp_generic
        // Digit multiplication, digit * digit -> 2-digit result
#if NET5_0_OR_GREATER
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private ulong digit_x_digit(ulong a, ulong b, out ulong low)
        {
            return System.Math.BigMul(a, b, out low);
        }
#else
        private ulong digit_x_digit(ulong a, ulong b, out ulong low)
        {
            ulong al, ah, bl, bh, temp;
            ulong albl, albh, ahbl, ahbh, res1, res2, res3, carry;
            ulong mask_low = (unchecked((ulong)(-1L))) >> (8*4), mask_high = (unchecked((ulong)(-1L))) << (8*4); //todo check

            al = a & mask_low;  // Low part
            ah = a >> (8 * 4); // High part
            bl = b & mask_low;
            bh = b >> (8 * 4);

            albl = al*bl;
            albh = al*bh;
            ahbl = ah*bl;
            ahbh = ah*bh;
            low = albl & mask_low;             // C00

            res1 = albl >> (8 * 4);
            res2 = ahbl & mask_low;
            res3 = albh & mask_low;
            temp = res1 + res2 + res3;
            carry = temp >> (8 * 4);
            low ^= temp << (8 * 4);            // C01

            res1 = ahbl >> (8 * 4);
            res2 = albh >> (8 * 4);
            res3 = ahbh & mask_low;
            temp = res1 + res2 + res3 + carry;
            ulong high = temp & mask_low;             // C10
            carry = temp & mask_high;
            high ^= (ahbh & mask_high) + carry; // C11
            return high;
        }
#endif

        // todo/org : move to fp_generic
        // Efficient Montgomery reduction using comba and exploiting the special form of the prime PRIME.
        // mc = ma*R^-1 mod PRIMEx2, where R = 2^448.
        // If ma < 2^448*PRIME, the output mc is in the range [0, 2*PRIME-1].
        // ma is assumed to be in Montgomery representation.
        private void rdc_mont(ulong[] ma, ulong[] mc)
        {
            ulong i, j, carry, count = engine.param.PRIME_ZERO_WORDS;
            ulong t = 0, u = 0, v = 0;
            ulong U, V;

            for (i = 0; i < engine.param.NWORDS_FIELD; i++)
            {
                mc[i] = 0;
            }

            for (i = 0; i < engine.param.NWORDS_FIELD; i++)
            {
                for (j = 0; j < i; j++)
                {
                    if (j < (i-engine.param.PRIME_ZERO_WORDS+1))
                    {
                        //MUL
                        U = digit_x_digit(mc[j], engine.param.PRIMEp1[i - j], out V);

                        //ADDC
                        v += V;
                        U += is_digit_lessthan_ct(v, V); // No overflow possible; high part of product < ulong.MaxValue

                        //ADDC
                        u += U;
                        t += is_digit_lessthan_ct(u, U);
                    }
                }

                //ADDC
                carry = ma[i];
                v += carry;
                carry = is_digit_lessthan_ct(v, carry);

                //ADDC
                u += carry;
                carry &= is_digit_zero_ct(u);

                t += carry;
                mc[i] = v;
                v = u;
                u = t;
                t = 0;
            }

            for (i = engine.param.NWORDS_FIELD; i < 2*engine.param.NWORDS_FIELD-1; i++)
            {
                if (count > 0)
                {
                    count -= 1;
                }
                for (j = i-engine.param.NWORDS_FIELD+1; j < engine.param.NWORDS_FIELD; j++)
                {
                    if (j < (engine.param.NWORDS_FIELD-count))
                    {
                        //MUL
                        U = digit_x_digit(mc[j], engine.param.PRIMEp1[i - j], out V);

                        //ADDC
                        v += V;
                        U += is_digit_lessthan_ct(v, V); // No overflow possible; high part of product < ulong.MaxValue

                        //ADDC
                        u += U;
                        t += is_digit_lessthan_ct(u, U);
                    }
                }

                //ADDC
                carry = ma[i];
                v += carry;
                carry = is_digit_lessthan_ct(v, carry);

                //ADDC
                u += carry;
                carry &= is_digit_zero_ct(u);

                t += carry;
                mc[i - engine.param.NWORDS_FIELD] = v;
                v = u;
                u = t;
                t = 0;
            }

            //ADDC
            carry = ma[2 * engine.param.NWORDS_FIELD - 1];
            v += carry;
            carry = is_digit_lessthan_ct(v, carry);
            Debug.Assert(carry == 0);

            mc[engine.param.NWORDS_FIELD - 1] = v;
            Debug.Assert(u == 0);
            Debug.Assert(t == 0);
        }

        protected internal static bool subarrayEquals(ulong[] a, ulong[] b, uint length)
        {
    //        if(a.Length < length || b.Length < length)
    //            return false;

            for (uint i = 0; i < length; i++)
            {
                if(a[i] != b[i])
                    return false;
            }
            return true;
        }

        protected internal static bool subarrayEquals(ulong[][] a, ulong[][] b, uint length)
        {
            int nwords_feild = b[0].Length;
    //        if(a[0].Length < length || b[0].Length < length)
    //            return false;

            for (uint i = 0; i < length; i++)
            {
                if(a[i/nwords_feild][i%nwords_feild] != b[i/nwords_feild][i%nwords_feild])
                    return false;
            }
            return true;
        }

        protected internal static bool subarrayEquals(ulong[][] a, ulong[][] b, uint bOffset, uint length)
        {
            int nwords_feild = b[0].Length;
    //        if(a[0].Length*2 < length || b[0].Length*2 < length)
    //            return false;

            for (uint i = 0; i < length; i++)
            {
                if(a[i/nwords_feild][i%nwords_feild] != b[(i + bOffset)/nwords_feild][(i+bOffset)%nwords_feild])
                    return false;
            }
            return true;
        }

        protected internal static bool subarrayEquals(ulong[][] a, ulong[] b, uint bOffset, uint length)
        {
            int nwords_field = a[0].Length;
    //        if(a[0].Length < length || b.Length < length)
    //            return false;

            for (uint i = 0; i < length; i++)
            {
                if(a[i/nwords_field][i%nwords_field] != b[(i + bOffset)])
                    return false; //8316 -> 425529A64ABCAC1F
            }
            return true;
        }

        // Computes square roots of elements in (Fp2)^2 using Hamburg's trick.
        protected internal void sqrt_Fp2(ulong[][] u, ulong[][] y)
        {

            ulong[] t0 = new ulong[engine.param.NWORDS_FIELD],
                   t1 = new ulong[engine.param.NWORDS_FIELD],
                   t2 = new ulong[engine.param.NWORDS_FIELD],
                   t3 = new ulong[engine.param.NWORDS_FIELD];

    //        digit_t *a  = (ulong[])u[0], *b  = (ulong[])u[1];
            uint i;

            fpsqr_mont(u[0], t0);                   // t0 = a^2
            fpsqr_mont(u[1], t1);                   // t1 = b^2
            fpaddPRIME(t0, t1, t0);              // t0 = t0+t1
            fpcopy(t0, 0, t1);
            for (i = 0; i < engine.param.OALICE_BITS - 2; i++)
            {   // t = t3^((p+1)/4)
                fpsqr_mont(t1, t1);
            }
            for (i = 0; i < engine.param.OBOB_EXPON; i++)
            {
                fpsqr_mont(t1, t0);
                fpmul_mont(t1, t0, t1);
            }
            fpaddPRIME(u[0], t1, t0);         // t0 = a+t1
            fpdiv2_PRIME(t0, t0);             // t0 = t0/2
            fpcopy(t0, 0, t2);
            fpinv_chain_mont(t2);             // t2 = t0^((p-3)/4)
            fpmul_mont(t0, t2, t1);           // t1 = t2*t0
            fpmul_mont(t2, u[1], t2);         // t2 = t2*b
            fpdiv2_PRIME(t2, t2);             // t2 = t2/2
            fpsqr_mont(t1, t3);               // t3 = t1^2
            fpcorrectionPRIME(t0);
            fpcorrectionPRIME(t3);

            if (subarrayEquals(t0, t3, engine.param.NWORDS_FIELD))
            {
                fpcopy(t1, 0, y[0]);
                fpcopy(t2, 0, y[1]);
            }
            else
            {
                fpnegPRIME(t1);
                fpcopy(t2, 0, y[0]);
                fpcopy(t1, 0, y[1]);
            }
        }

        // todo/org : move to fp_generic
        // GF(p^2) squaring using Montgomery arithmetic, c = a^2 in GF(p^2).
        // Inputs: a = a0+a1*i, where a0, a1 are in [0, 2*p-1]
        // Output: c = c0+c1*i, where c0, c1 are in [0, 2*p-1]
        protected internal void fp2sqr_mont(ulong[][] a, ulong[][] c)
        {
            ulong[] t1 = new ulong[engine.param.NWORDS_FIELD],
                    t2 = new ulong[engine.param.NWORDS_FIELD],
                    t3 = new ulong[engine.param.NWORDS_FIELD];

            mp_add(a[0], a[1], t1, engine.param.NWORDS_FIELD);   // t1 = a0+a1
            mp_subPRIME_p4(a[0], a[1], t2);           // t2 = a0-a1
            mp_add(a[0], a[0], t3, engine.param.NWORDS_FIELD);   // t3 = 2a0
            fpmul_mont(t1, t2, c[0]);               // c0 = (a0+a1)(a0-a1)
            fpmul_mont(t3, a[1], c[1]);             // c1 = 2a0*a1
        }

        // todo/org : move to fp_generic
        // Modular addition, c = a+b mod PRIME.
        // Inputs: a, b in [0, 2*PRIME-1]
        // Output: c in [0, 2*PRIME-1]
        protected internal void fpaddPRIME(ulong[] a, ulong[] b, ulong[] c)
        {
            ulong i, carry = 0;
            ulong mask;

            for (i = 0; i < engine.param.NWORDS_FIELD; i++)
            {
                //ADDC
                ulong tempReg = a[i] + carry;
                c[i] = b[i] + tempReg;
                carry = (is_digit_lessthan_ct(tempReg, carry) | is_digit_lessthan_ct(c[i], tempReg));

            }

            carry = 0;
            for (i = 0; i < engine.param.NWORDS_FIELD; i++)
            {
                //SUBC
                ulong tempReg = c[i] - engine.param.PRIMEx2[i];
                ulong borrowReg = (is_digit_lessthan_ct(c[i], engine.param.PRIMEx2[i]) | (carry & is_digit_zero_ct(tempReg)));
                c[i] = tempReg - (ulong)(carry);
                carry = borrowReg;

            }
            mask = 0 - carry;

            carry = 0;
            for (i = 0; i < engine.param.NWORDS_FIELD; i++)
            {
                //ADDC
                ulong tempReg = c[i] + carry;
                c[i] = (engine.param.PRIMEx2[i] & mask) + tempReg;
                carry = (is_digit_lessthan_ct(tempReg, carry) | is_digit_lessthan_ct(c[i], tempReg));

            }
        }

        // Cyclotomic cubing on elements of norm 1, using a^(p+1) = 1.
        protected internal void cube_Fp2_cycl(ulong[][] a, ulong[] one)
        {
            ulong[] t0 = new ulong[engine.param.NWORDS_FIELD];

            fpaddPRIME(a[0], a[0], t0);    // t0 = a0 + a0
            fpsqr_mont(t0, t0);            // t0 = t0^2
            fpsubPRIME(t0, one, t0);       // t0 = t0 - 1
            fpmul_mont(a[1], t0, a[1]);    // a1 = t0*a1
            fpsubPRIME(t0, one, t0);
            fpsubPRIME(t0, one, t0);       // t0 = t0 - 2
            fpmul_mont(a[0], t0, a[0]);    // a0 = t0*a0
        }

        // todo/org : move to fp_generic
        // Modular subtraction, c = a-b mod PRIME.
        // Inputs: a, b in [0, 2*PRIME-1]
        // Output: c in [0, 2*PRIME-1]
        protected internal void fpsubPRIME(ulong[] a, ulong[] b, uint bOffset, ulong[] c)
        {
            ulong i, borrow = 0;
            ulong mask;

            for (i = 0; i < engine.param.NWORDS_FIELD; i++)
            {
                //SUBC
                ulong tempReg = a[i] - b[i + bOffset];
                ulong borrowReg = (is_digit_lessthan_ct(a[i], b[i + bOffset]) | (borrow & is_digit_zero_ct(tempReg)));
                c[i] = tempReg - (ulong)(borrow);
                borrow = borrowReg;
            }
            mask = 0 - borrow;

            borrow = 0;
            for (i = 0; i < engine.param.NWORDS_FIELD; i++)
            {
                //ADDC
                ulong tempReg = c[i] + borrow;
                c[i] = (engine.param.PRIMEx2[i] & mask) + tempReg;
                borrow = (is_digit_lessthan_ct(tempReg, borrow) | is_digit_lessthan_ct(c[i], tempReg));
            }
        }

        protected internal void fpsubPRIME(ulong[] a, uint aOffset, ulong[] b, ulong[] c)
        {
            ulong i, borrow = 0;
            ulong mask;

            for (i = 0; i < engine.param.NWORDS_FIELD; i++)
            {
                //SUBC
                ulong tempReg = a[i + aOffset] - b[i];
                ulong borrowReg = (is_digit_lessthan_ct(a[i + aOffset], b[i]) | (borrow & is_digit_zero_ct(tempReg)));
                c[i] = tempReg - (ulong)(borrow);
                borrow = borrowReg;
            }
            mask = 0 - borrow;

            borrow = 0;
            for (i = 0; i < engine.param.NWORDS_FIELD; i++)
            {
                //ADDC
                ulong tempReg = c[i] + borrow;
                c[i] = (engine.param.PRIMEx2[i] & mask) + tempReg;
                borrow = (is_digit_lessthan_ct(tempReg, borrow) | is_digit_lessthan_ct(c[i], tempReg));
            }
        }

        protected internal void fpsubPRIME(ulong[] a, ulong[] b, ulong[] c)
        {
            ulong i, borrow = 0;
            ulong mask;

            for (i = 0; i < engine.param.NWORDS_FIELD; i++)
            {
                //SUBC
                ulong tempReg = a[i] - b[i];
                ulong borrowReg = (is_digit_lessthan_ct(a[i], b[i]) | (borrow & is_digit_zero_ct(tempReg)));
                c[i] = tempReg - (ulong)borrow;
                borrow = borrowReg;
            }
            mask =  (0 - (ulong)borrow);

            borrow = 0;
            for (i = 0; i < engine.param.NWORDS_FIELD; i++)
            {
                //ADDC
                ulong tempReg = c[i] + borrow;
                c[i] = (engine.param.PRIMEx2[i] & mask) + tempReg;
                borrow = (is_digit_lessthan_ct(tempReg, borrow) | is_digit_lessthan_ct(c[i], tempReg));
            }
        }

        // todo/org : move to fp_generic
        // Modular negation, a = -a mod PRIME.
        // Input/output: a in [0, 2*PRIME-1]
        protected internal void fpnegPRIME(ulong[] a)
        {
            ulong i, borrow = 0;

            for (i = 0; i < engine.param.NWORDS_FIELD; i++)
            {
                //SUBC
                ulong tempReg = engine.param.PRIMEx2[i] - a[i];
                ulong borrowReg = (is_digit_lessthan_ct(engine.param.PRIMEx2[i], a[i]) | (borrow & is_digit_zero_ct(tempReg)));
                a[i] = tempReg - (ulong)(borrow);
                borrow = borrowReg;
            }
        }

        // todo/org : move to fp_generic
        // Conversion of a GF(p^2) element from Montgomery representation to standard representation,
        // c_i = ma_i*R^(-1) = a_i in GF(p^2).
        protected internal void from_fp2mont(ulong[][] ma, ulong[][] c)
        {
            from_mont(ma[0], c[0]);
            from_mont(ma[1], c[1]);
        }

        // todo/org : move to fp_generic
        // Conversion of GF(p^2) element from Montgomery to standard representation, and encoding by removing leading 0 bytes
        protected internal void fp2_encode(ulong[][] x, byte[] enc, uint encOffset)
        {
            ulong[][] t = Utils.InitArray(2, engine.param.NWORDS_FIELD);

            from_fp2mont(x, t);
            encode_to_bytes(t[0], enc, encOffset,engine.param.FP2_ENCODED_BYTES / 2);
            encode_to_bytes(t[1], enc, encOffset + engine.param.FP2_ENCODED_BYTES / 2, engine.param.FP2_ENCODED_BYTES / 2);
        }

        // Parse byte sequence back uinto GF(p^2) element, and conversion to Montgomery representation
        protected internal void fp2_decode(byte[] x, ulong[][] dec, uint xOffset)
        {
            decode_to_digits(x, xOffset, dec[0], engine.param.FP2_ENCODED_BYTES / 2, engine.param.NWORDS_FIELD);
            decode_to_digits(x,xOffset + (engine.param.FP2_ENCODED_BYTES/2), dec[1], engine.param.FP2_ENCODED_BYTES / 2, engine.param.NWORDS_FIELD);
            to_fp2mont(dec, dec);
        }

        // Conversion of elements in Z_r to Montgomery representation, where the order r is up to NBITS_ORDER bits.
        protected internal void to_Montgomery_mod_order(ulong[] a, ulong[] mc, ulong[] order, ulong[] Montgomery_rprime, ulong[] Montgomery_Rprime)
        {
            Montgomery_multiply_mod_order(a, Montgomery_Rprime, mc, order, Montgomery_rprime);
        }

        // Montgomery multiplication modulo the group order, mc = ma*mb*r' mod order, where ma,mb,mc in [0, order-1].
        // ma, mb and mc are assumed to be in Montgomery representation.
        // The Montgomery constant r' = -r^(-1) mod 2^(log_2(r)) is the value "Montgomery_rprime", where r is the order.
        // Assume log_2(r) is a multiple of RADIX bits
        protected internal void Montgomery_multiply_mod_order(ulong[] ma, ulong[] mb, ulong[] mc, ulong[] order, ulong[] Montgomery_rprime)
        {
            ulong i, cout = 0, bout = 0;
            ulong mask;
            ulong[] P = new ulong[2*engine.param.NWORDS_ORDER],
                   Q = new ulong[2*engine.param.NWORDS_ORDER],
                   temp = new ulong[2*engine.param.NWORDS_ORDER];

            multiply(ma, mb, P, engine.param.NWORDS_ORDER);                 // P = ma * mb
            multiply(P, Montgomery_rprime, Q, engine.param.NWORDS_ORDER);   // Q = P * r' mod 2^(log_2(r))
            multiply(Q, order, temp, engine.param.NWORDS_ORDER);            // temp = Q * r
            cout = mp_add(P, temp, temp, 2*engine.param.NWORDS_ORDER);      // (cout, temp) = P + Q * r

            for (i = 0; i < engine.param.NWORDS_ORDER; i++)  // (cout, mc) = (P + Q * r)/2^(log_2(r))
            {
                mc[i] = temp[engine.param.NWORDS_ORDER+i];
            }

            // Final, constant-time subtraction
            bout = mp_sub(mc, order, mc, engine.param.NWORDS_ORDER);        // (cout, mc) = (cout, mc) - r
            mask = cout - bout;              // if (cout, mc) >= 0 then mask = 0x00..0, else if (cout, mc) < 0 then mask = 0xFF..F

            for (i = 0; i < engine.param.NWORDS_ORDER; i++)
            {               // temp = mask & r
                temp[i] = (order[i] & mask);
            }

            mp_add(mc, temp, mc, engine.param.NWORDS_ORDER);                //  mc = mc + (mask & r)
        }

        // Inversion of an odd uinteger modulo an even uinteger of the form 2^m.
        // Algorithm 3: Explicit Quadratic Modular inverse modulo 2^m from Dumas'12: http://arxiv.org/pdf/1209.6626.pdf
        // If the input is invalid (even), the function outputs c = a.
        protected internal void inv_mod_orderA(ulong[] a, ulong[] c)
        { 
            uint i, f, s = 0;
            ulong[] am1 = new ulong[engine.param.NWORDS_ORDER],
                    tmp1 = new ulong[engine.param.NWORDS_ORDER],
                    tmp2 = new ulong[2*engine.param.NWORDS_ORDER],
                    one = new ulong[engine.param.NWORDS_ORDER],
                    order = new ulong[engine.param.NWORDS_ORDER];
            ulong mask = (unchecked((ulong)(-1L)) >> (int)(engine.param.NBITS_ORDER - engine.param.OALICE_BITS)); //todo check

            // todo check
            order[engine.param.NWORDS_ORDER-1] = ((ulong)1L << (int)(64 - (engine.param.NBITS_ORDER - engine.param.OALICE_BITS)));  // Load most significant digit of Alice's order
            one[0] = 1;

            mp_sub(a, one, am1, engine.param.NWORDS_ORDER);                   // am1 = a-1

            if (((a[0] & 1) == 0) || (is_zero(am1, engine.param.NWORDS_ORDER)))
            {  // Check if the input is even or one
                copy_words(a, c, engine.param.NWORDS_ORDER);
                c[engine.param.NWORDS_ORDER-1] &= mask;                       // mod 2^m
            }
            else
            {
                mp_sub(order, am1, c, engine.param.NWORDS_ORDER);
                mp_add(c, one, c, engine.param.NWORDS_ORDER);                 // c = 2^m - a + 2

                copy_words(am1, tmp1, engine.param.NWORDS_ORDER);
                while ((tmp1[0] & 1L) == 0)
                {
                    s += 1;
                    mp_shiftr1(tmp1, engine.param.NWORDS_ORDER);
                }

                f = engine.param.OALICE_BITS / s;
                for (i = 1; i < f; i <<= 1)
                {
                    multiply(am1, am1, tmp2, engine.param.NWORDS_ORDER);            // tmp2 = am1^2
                    copy_words(tmp2, am1, engine.param.NWORDS_ORDER);
                    am1[engine.param.NWORDS_ORDER-1] &= mask;                       // am1 = tmp2 mod 2^m
                    mp_add(am1, one, tmp1, engine.param.NWORDS_ORDER);              // tmp1 = am1 + 1
                    tmp1[engine.param.NWORDS_ORDER-1] &= mask;                      // mod 2^m
                    multiply(c, tmp1, tmp2, engine.param.NWORDS_ORDER);             // c = c*tmp1
                    copy_words(tmp2, c, engine.param.NWORDS_ORDER);
                    c[engine.param.NWORDS_ORDER-1] &= mask;                         // mod 2^m
                }
            }
        }

        // Multiprecision comba multiply, c = a*b, where lng(a) = lng(b) = nwords.
        // NOTE: a and c CANNOT be the same variable!
        protected internal void multiply(ulong[] a, ulong[] b, ulong[] c, uint nwords)
        {
            ulong i, j;
            ulong t = 0, u = 0, v = 0;
            ulong U, V;

            for (i = 0; i < nwords; i++)
            {
                for (j = 0; j <= i; j++)
                {
                    //MUL
                    U = digit_x_digit(a[j], b[i - j], out V);

                    //ADDC
                    v += V;
                    U += is_digit_lessthan_ct(v, V); // No overflow possible; high part of product < ulong.MaxValue

                    //ADDC
                    u += U;
                    t += is_digit_lessthan_ct(u, U);
                }
                c[i] = v;
                v = u;
                u = t;
                t = 0;
            }
            for (i = nwords; i < 2*nwords-1; i++)
            {
                for (j = i-nwords+1; j < nwords; j++)
                {
                    //MUL
                    U = digit_x_digit(a[j], b[i - j], out V);

                    //ADDC
                    v += V;
                    U += is_digit_lessthan_ct(v, V); // No overflow possible; high part of product < ulong.MaxValue

                    //ADDC
                    u += U;
                    t += is_digit_lessthan_ct(u, U);
                }
                c[i] = v;
                v = u;
                u = t;
                t = 0;
            }
            c[2 * nwords - 1] = v;
            Debug.Assert(u == 0);
            Debug.Assert(t == 0);
        }

        // Is x = 0? return 1 (TRUE) if condition is true, 0 (FALSE) otherwise
        // SECURITY NOTE: This function does not run in constant time.
        private bool is_zero_mod_order(ulong[] x)
        {
            uint i;
            for (i = 0; i < engine.param.NWORDS_ORDER; i++)
            {
                if (x[i] != 0)
                {
                    return false;
                }
            }
            return true;
        }

        // Is x even? return 1 (TRUE) if condition is true, 0 (FALSE) otherwise.
        private bool is_even_mod_order(ulong[] x)
        {
            return (x[0] & 1UL) == 0UL;
        }

        // Is x < y? return 1 (TRUE) if condition is true, 0 (FALSE) otherwise.
        // SECURITY NOTE: This function does not run in constant time.
        private bool is_lt_mod_order(ulong[] x, ulong[] y)
        {
            int i;

            for (i = (int)engine.param.NWORDS_ORDER-1; i >= 0; i--)
            {
                if (x[i]   < y[i]  )
                {
                    return true;
                }
                else if (x[i]  > y[i] )
                {
                    return false;
                }
            }
            return false;
        }

        // Check if multiprecision element is zero.
        // SECURITY NOTE: This function does not run in constant time.
        private bool is_zero(ulong[] a, uint nwords)
        {
            for (uint i = 0; i < nwords; i++)
            {
                if (a[i] != 0)
                {
                    return false;
                }
            }
            return true;
        }


        // Partial Montgomery inversion modulo order.
        private uint Montgomery_inversion_mod_order_bingcd_partial(ulong[] a, ulong[] x1, ulong[] order)
        {
            ulong[] u = new ulong[engine.param.NWORDS_ORDER],
                   v = new ulong[engine.param.NWORDS_ORDER],
                   x2 = new ulong[engine.param.NWORDS_ORDER];
            uint cwords;  // number of words necessary for x1, x2
        
            copy_words(a, u, engine.param.NWORDS_ORDER);
            copy_words(order, v, engine.param.NWORDS_ORDER);
            copy_words(x2, x1, engine.param.NWORDS_ORDER);
            x1[0] = 1;
            uint k = 0;

            while (!is_zero_mod_order(v))
            {
                cwords = (++k / Internal.RADIX) + 1;
                if ((cwords < engine.param.NWORDS_ORDER))
                {
                    if (is_even_mod_order(v))
                    {
                        mp_shiftr1(v, engine.param.NWORDS_ORDER);
                        mp_shiftl1(x1, cwords);
                    }
                    else if (is_even_mod_order(u))
                    {
                        mp_shiftr1(u, engine.param.NWORDS_ORDER);
                        mp_shiftl1(x2, cwords);
                    }
                    else if (!is_lt_mod_order(v, u))
                    {
                        mp_sub(v, u, v, engine.param.NWORDS_ORDER);
                        mp_shiftr1(v, engine.param.NWORDS_ORDER);
                        mp_add(x1, x2, x2, cwords);
                        mp_shiftl1(x1, cwords);
                    }
                    else
                    {
                        mp_sub(u, v, u, engine.param.NWORDS_ORDER);
                        mp_shiftr1(u, engine.param.NWORDS_ORDER);
                        mp_add(x1, x2, x1, cwords);
                        mp_shiftl1(x2, cwords);
                    }
                }
                else
                {
                    if (is_even_mod_order(v)) {
                        mp_shiftr1(v, engine.param.NWORDS_ORDER);
                        mp_shiftl1(x1, engine.param.NWORDS_ORDER);
                    }
                    else if (is_even_mod_order(u))
                    {
                        mp_shiftr1(u, engine.param.NWORDS_ORDER);
                        mp_shiftl1(x2, engine.param.NWORDS_ORDER);
                    }
                    else if (!is_lt_mod_order(v, u))
                    {
                        mp_sub(v, u, v, engine.param.NWORDS_ORDER);
                        mp_shiftr1(v, engine.param.NWORDS_ORDER);
                        mp_add(x1, x2, x2, engine.param.NWORDS_ORDER);
                        mp_shiftl1(x1, engine.param.NWORDS_ORDER);
                    }
                    else
                    {
                        mp_sub(u, v, u, engine.param.NWORDS_ORDER);
                        mp_shiftr1(u, engine.param.NWORDS_ORDER);
                        mp_add(x1, x2, x1, engine.param.NWORDS_ORDER);
                        mp_shiftl1(x2, engine.param.NWORDS_ORDER);
                    }
                }
            }

            if (is_lt_mod_order(order, x1))
            {
                mp_sub(x1, order, x1, engine.param.NWORDS_ORDER);
            }

            return k;
        }

        // Montgomery inversion modulo order, c = a^(-1)*R mod order.
        protected internal void Montgomery_inversion_mod_order_bingcd(ulong[] a, ulong[] c, ulong[] order, ulong[] Montgomery_rprime, ulong[] Montgomery_Rprime)
        {
            ulong[] x = new ulong[engine.param.NWORDS_ORDER],
                   t = new ulong[engine.param.NWORDS_ORDER];

            if (is_zero(a, engine.param.NWORDS_ORDER))
            {
                copy_words(t, c, engine.param.NWORDS_ORDER);
                return;
            }

            uint k = Montgomery_inversion_mod_order_bingcd_partial(a, x, order);
            if (k <= engine.param.NBITS_ORDER)
            {
                Montgomery_multiply_mod_order(x, Montgomery_Rprime, x, order, Montgomery_rprime);
                k += engine.param.NBITS_ORDER;
            }

            Montgomery_multiply_mod_order(x, Montgomery_Rprime, x, order, Montgomery_rprime);
            power2_setup(t, 2*(int)engine.param.NBITS_ORDER - (int)k, engine.param.NWORDS_ORDER);
            Montgomery_multiply_mod_order(x, t, c, order, Montgomery_rprime);
        }

        // Conversion of elements in Z_r from Montgomery to standard representation, where the order is up to NBITS_ORDER bits.
        protected internal void from_Montgomery_mod_order(ulong[] ma, ulong[] c, ulong[] order, ulong[] Montgomery_rprime)
        {
            ulong[] one = new ulong[engine.param.NWORDS_ORDER];
            one[0] = 1;

            Montgomery_multiply_mod_order(ma, one, c, order, Montgomery_rprime);
        }

        // Computes the input modulo 3
        // The input is assumed to be NWORDS_ORDER ulong
        protected internal uint mod3(ulong[] a)
        {
            ulong result = 0;
            for (int i = 0; i < engine.param.NWORDS_ORDER; ++i)
            {
                result += a[i] >> 32;
                result += a[i] & 0xFFFFFFFFUL;
            }
            return (uint)(result % 3);
        }

        // Conversion of a GF(p^2) element to Montgomery representation,
        // mc_i = a_i*R^2*R^(-1) = a_i*R in GF(p^2).
        protected internal void to_fp2mont(ulong[][] a, ulong[][] mc)
        {
            to_mont(a[0], mc[0]);
            to_mont(a[1], mc[1]);
        }

        // Conversion to Montgomery representation,
        // mc = a*R^2*R^(-1) mod p = a*R mod p, where a in [0, p-1].
        // The Montgomery constant R^2 mod p is the global value "Montgomery_R2".
        private void to_mont(ulong[] a, ulong[] mc)
        {
            fpmul_mont(a, engine.param.Montgomery_R2, mc);
        }


        // todo/org : move to fp_generic
        // Modular correction to reduce field element a in [0, 2*PRIME-1] to [0, PRIME-1].
        protected internal void fpcorrectionPRIME(ulong[] a)
        {
            ulong i, borrow = 0;
            ulong mask;

            for (i = 0; i < engine.param.NWORDS_FIELD; i++)
            {
                //SUBC
                ulong tempReg = a[i] - engine.param.PRIME[i];
                ulong borrowReg = (is_digit_lessthan_ct(a[i], engine.param.PRIME[i]) | (borrow & is_digit_zero_ct(tempReg)));
                a[i] = tempReg - (ulong)(borrow);
                borrow = borrowReg;
            }
            mask = 0 - borrow;

            borrow = 0;
            for (i = 0; i < engine.param.NWORDS_FIELD; i++)
            {
                //ADDC
                ulong tempReg = a[i] + borrow;
                a[i] = (engine.param.PRIME[i] & mask) + tempReg;
                borrow = (is_digit_lessthan_ct(tempReg, borrow) | is_digit_lessthan_ct(a[i], tempReg));
            }
        }

        protected internal byte cmp_f2elm(ulong[][] x, ulong[][] y)
        { // Comparison of two GF(p^2) elements in constant time. 
            // Is x != y? return -1 if condition is true, 0 otherwise.
            ulong[][] a = Utils.InitArray(2, engine.param.NWORDS_FIELD),
                b = Utils.InitArray(2, engine.param.NWORDS_FIELD);
            byte r = 0;

            fp2copy(x, a);
            fp2copy(y, b);
            fp2correction(a);
            fp2correction(b);

            for (int i = (int)engine.param.NWORDS_FIELD-1; i >= 0; i--)
            {
                r |= (byte)((a[0][i] ^ b[0][i]) | (a[1][i] ^ b[1][i]));//todo check
            }

            return (byte) ((-(byte)r) >> (8-1));
        }


        // Encoding digits to bytes according to endianness
        protected internal void encode_to_bytes(ulong[] x, byte[] enc, uint encOffset, uint nbytes)
        {
            byte[] test = new byte[((nbytes*4+7)&~7)];
            Pack.UInt64_To_LE(x, test, 0);
            System.Array.Copy(test, 0, enc, encOffset, nbytes);
        }

        // Decoding bytes to digits according to endianness
        protected internal void decode_to_digits(byte[] x, uint xOffset, ulong[] dec, uint nbytes, uint ndigits)
        {
            // x -> dec
            dec[ndigits - 1] = 0;
            byte[] temp = new byte[(nbytes+7)&~7];
            System.Array.Copy(x, xOffset, temp, 0, nbytes);
            Pack.LE_To_UInt64(temp, 0, dec);

        }

        // r = a - b*i where v = a + b*i
        protected internal void fp2_conj(ulong[][] v, ulong[][] r)
        {
            fpcopy(v[0], 0, r[0]);
            fpcopy(v[1], 0, r[1]);

            if(!is_felm_zero(r[1]))
            {
                fpnegPRIME(r[1]);
            }
        }




        // Conversion from Montgomery representation to standard representation,
        // c = ma*R^(-1) mod p = a mod p, where ma in [0, p-1].
        private void from_mont(ulong[] ma, ulong[] c)
        {
            ulong[] one = new ulong[engine.param.NWORDS_FIELD];

            one[0] = 1;
            fpmul_mont(ma, one, c);
            fpcorrectionPRIME(c);
        }

        // Multiprecision right shift by one.
        private void mp_shiftr1(ulong[] x)
        {
            uint i;

            for (i = 0; i < engine.param.NWORDS_FIELD-1; i++)
            {
                //SHIFTR
                x[i] = (x[i] >> 1) ^ (x[i+1] << (int)(Internal.RADIX - 1));
            }
            x[engine.param.NWORDS_FIELD-1] >>= 1;
        }

        private void mp_shiftr1(ulong[] x, uint nwords)
        {
            uint i;

            for (i = 0; i < nwords-1; i++)
            {
                //SHIFTR
                x[i] = (x[i] >> 1) ^ (x[i+1] << (int)(Internal.RADIX - 1));
            }
            x[nwords-1] >>= 1;
        }

        // Copy a GF(p^2) element, c = a.
        protected internal void fp2copy(ulong[][] a, ulong[][] c)
        {
            fpcopy(a[0], 0, c[0]);
            fpcopy(a[1], 0, c[1]);
        }

        // Copy a GF(p^2) element, c = a.
        protected internal void fp2copy(ulong[][] a, uint aOffset, ulong[][] c)
        {
            fpcopy(a[0 + aOffset], 0, c[0]);
            fpcopy(a[1 + aOffset], 0, c[1]);
        }

        // Copy a GF(p^2) element, c = a.
        protected internal void fp2copy(ulong[] a, uint aOffset, ulong[][] c)
        {
            fpcopy(a, aOffset, c[0]);
            fpcopy(a, aOffset + engine.param.NWORDS_FIELD, c[1]);
        }

        // Zero a field element, a = 0.
        protected internal void fpzero(ulong[] a)
        {
            uint i;

            for (i = 0; i < engine.param.NWORDS_FIELD; i++)
            {
                a[i] = 0;
            }
        }

        // GF(p^2) subtraction with correction with 2*p, c = a-b+2p in GF(p^2).
        protected internal void mp2_sub_p2(ulong[][] a, ulong[][] b, ulong[][] c)
        {
            //todo/org : make fp class and change this to generic mp_sub_p2
            mp_subPRIME_p2(a[0], b[0], c[0]);
            mp_subPRIME_p2(a[1], b[1], c[1]);
        }

        // Multiprecision comba multiply, c = a*b, where lng(a) = lng(b) = nwords.
        protected internal void mp_mul(ulong[] a, ulong[] b, ulong[] c, uint nwords)
        {
            ulong i, j;
            ulong t = 0, u = 0, v = 0;
            ulong U, V;

            for (i = 0; i < nwords; i++)
            {
                for (j = 0; j <= i; j++)
                {
                    //MUL
                    U = digit_x_digit(a[j], b[i - j], out V);

                    //ADDC
                    v += V;
                    U += is_digit_lessthan_ct(v, V); // No overflow possible; high part of product < ulong.MaxValue

                    //ADDC
                    u += U;
                    t += is_digit_lessthan_ct(u, U);
                }
                c[i] = v;
                v = u;
                u = t;
                t = 0;
            }

            for (i = nwords; i < 2*nwords-1; i++)
            {
                for (j = i-nwords+1; j < nwords; j++)
                {
                    //MUL
                    U = digit_x_digit(a[j], b[i - j], out V);

                    //ADDC
                    v += V;
                    U += is_digit_lessthan_ct(v, V); // No overflow possible; high part of product < ulong.MaxValue

                    //ADDC
                    u += U;
                    t += is_digit_lessthan_ct(u, U);
                }
                c[i] = v;
                v = u;
                u = t;
                t = 0;
            }
            c[2 * nwords - 1] = v;
            Debug.Assert(u == 0);
            Debug.Assert(t == 0);
        }

        // Multiprecision comba multiply, c = a*b, where lng(a) = lng(b) = nwords.
        protected internal void mp_mul(ulong[] a, uint aOffset, ulong[] b, ulong[] c, uint nwords)
        {
            ulong i, j;
            ulong t = 0, u = 0, v = 0;
            ulong U, V;

            for (i = 0; i < nwords; i++)
            {
                for (j = 0; j <= i; j++)
                {
                    //MUL
                    U = digit_x_digit(a[j + aOffset], b[i-j], out V);

                    //ADDC
                    v += V;
                    U += is_digit_lessthan_ct(v, V); // No overflow possible; high part of product < ulong.MaxValue

                    //ADDC
                    u += U;
                    t += is_digit_lessthan_ct(u, U);
                }
                c[i] = v;
                v = u;
                u = t;
                t = 0;
            }

            for (i = nwords; i < 2*nwords-1; i++)
            {
                for (j = i-nwords+1; j < nwords; j++)
                {
                    //MUL
                    U = digit_x_digit(a[j + aOffset], b[i-j], out V);

                    //ADDC
                    v += V;
                    U += is_digit_lessthan_ct(v, V); // No overflow possible; high part of product < ulong.MaxValue

                    //ADDC
                    u += U;
                    t += is_digit_lessthan_ct(u, U);
                }
                c[i] = v;
                v = u;
                u = t;
                t = 0;
            }
            c[2 * nwords - 1] = v;
            Debug.Assert(u == 0);
            Debug.Assert(t == 0);
        }

        // GF(p^2) multiplication using Montgomery arithmetic, c = a*b in GF(p^2).
        // Inputs: a = a0+a1*i and b = b0+b1*i, where a0, a1, b0, b1 are in [0, 2*p-1]
        // Output: c = c0+c1*i, where c0, c1 are in [0, 2*p-1]
        protected internal void fp2mul_mont(ulong[][] a, ulong[][] b, ulong[][] c)
        {
            ulong[] t1 = new ulong[engine.param.NWORDS_FIELD],
                   t2 = new ulong[engine.param.NWORDS_FIELD];
            ulong[] tt1 = new ulong[2*engine.param.NWORDS_FIELD],
                   tt2 = new ulong[2*engine.param.NWORDS_FIELD],
                   tt3 = new ulong[2*engine.param.NWORDS_FIELD];

            mp_add(a[0], a[1], t1, engine.param.NWORDS_FIELD);            // t1 = a0+a1
            mp_add(b[0], b[1], t2, engine.param.NWORDS_FIELD);            // t2 = b0+b1
            mp_mul(a[0], b[0], tt1, engine.param.NWORDS_FIELD);           // tt1 = a0*b0
            mp_mul(a[1], b[1], tt2, engine.param.NWORDS_FIELD);           // tt2 = a1*b1
            mp_mul(t1, t2, tt3, engine.param.NWORDS_FIELD);               // tt3 = (a0+a1)*(b0+b1)
            mp_dblsubfast(tt1, tt2, tt3);                    // tt3 = (a0+a1)*(b0+b1) - a0*b0 - a1*b1
            mp_subaddfast(tt1, tt2, tt1);                    // tt1 = a0*b0 - a1*b1 + p*2^MAXBITS_FIELD if a0*b0 - a1*b1 < 0, else tt1 = a0*b0 - a1*b1
            rdc_mont(tt3, c[1]);                             // c[1] = (a0+a1)*(b0+b1) - a0*b0 - a1*b1
            rdc_mont(tt1, c[0]);                             // c[0] = a0*b0 - a1*b1
        }

        protected internal void fp2mul_mont(ulong[][] a, ulong[][] b, uint bOffset, ulong[][] c)
        {

    //        System.out.pruint("b: ");
    //        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
    //        {System.out.pruintf("%016x ", b[di + bOffset][dj] );}System.out.Pruintln();}

            ulong[] t1 = new ulong[engine.param.NWORDS_FIELD],
                    t2 = new ulong[engine.param.NWORDS_FIELD];
            ulong[] tt1 = new ulong[2*engine.param.NWORDS_FIELD],
                    tt2 = new ulong[2*engine.param.NWORDS_FIELD],
                    tt3 = new ulong[2*engine.param.NWORDS_FIELD];

            mp_add(a[0], a[1], t1, engine.param.NWORDS_FIELD);            // t1 = a0+a1
            mp_add(b[0 + bOffset], b[bOffset + 1], t2, engine.param.NWORDS_FIELD);            // t2 = b0+b1
            mp_mul(a[0], b[bOffset + 0], tt1, engine.param.NWORDS_FIELD);           // tt1 = a0*b0
            mp_mul(a[1], b[bOffset + 1], tt2, engine.param.NWORDS_FIELD);           // tt2 = a1*b1
            mp_mul(t1, t2, tt3, engine.param.NWORDS_FIELD);               // tt3 = (a0+a1)*(b0+b1)
            mp_dblsubfast(tt1, tt2, tt3);                    // tt3 = (a0+a1)*(b0+b1) - a0*b0 - a1*b1
            mp_subaddfast(tt1, tt2, tt1);                    // tt1 = a0*b0 - a1*b1 + p*2^MAXBITS_FIELD if a0*b0 - a1*b1 < 0, else tt1 = a0*b0 - a1*b1
            rdc_mont(tt3, c[1]);                             // c[1] = (a0+a1)*(b0+b1) - a0*b0 - a1*b1
            rdc_mont(tt1, c[0]);                             // c[0] = a0*b0 - a1*b1
        }

        protected internal void fp2mul_mont(ulong[][] a, ulong[] b, uint bOffset, ulong[][] c)
        {
            ulong[] t1 = new ulong[engine.param.NWORDS_FIELD],
                    t2 = new ulong[engine.param.NWORDS_FIELD];
            ulong[] tt1 = new ulong[2*engine.param.NWORDS_FIELD],
                    tt2 = new ulong[2*engine.param.NWORDS_FIELD],
                    tt3 = new ulong[2*engine.param.NWORDS_FIELD];

            mp_add(a[0], a[1], t1, engine.param.NWORDS_FIELD);            // t1 = a0+a1
            mp_add(b, bOffset, b, bOffset + engine.param.NWORDS_FIELD, t2,  0,engine.param.NWORDS_FIELD);            // t2 = b0+b1
            // todo swapped a  and b
            mp_mul(b, bOffset, a[0], tt1, engine.param.NWORDS_FIELD);           // tt1 = a0*b0
            mp_mul(b,bOffset + engine.param.NWORDS_FIELD, a[1], tt2, engine.param.NWORDS_FIELD);           // tt2 = a1*b1
            mp_mul(t1, t2, tt3, engine.param.NWORDS_FIELD);               // tt3 = (a0+a1)*(b0+b1)
            mp_dblsubfast(tt1, tt2, tt3);                    // tt3 = (a0+a1)*(b0+b1) - a0*b0 - a1*b1
            mp_subaddfast(tt1, tt2, tt1);                    // tt1 = a0*b0 - a1*b1 + p*2^MAXBITS_FIELD if a0*b0 - a1*b1 < 0, else tt1 = a0*b0 - a1*b1
            rdc_mont(tt3, c[1]);                             // c[1] = (a0+a1)*(b0+b1) - a0*b0 - a1*b1
            rdc_mont(tt1, c[0]);                             // c[0] = a0*b0 - a1*b1
        }

        // Multiprecision subtraction, c = c-a-b, where lng(a) = lng(b) = 2*engine.param.NWORDS_FIELD.
        private void mp_dblsubfast(ulong[] a, ulong[] b, ulong[] c)
        {
            mp_sub(c, a, c, 2*engine.param.NWORDS_FIELD);
            mp_sub(c, b, c, 2*engine.param.NWORDS_FIELD);
        }

        // Multiprecision subtraction, c = a-b, where lng(a) = lng(b) = nwords. Returns the borrow bit.
        protected internal ulong mp_sub(ulong[] a, ulong[] b, ulong[] c, uint nwords)
        {
            ulong i, borrow = 0;
        
            for (i = 0; i < nwords; i++)
            {
                //SUBC
                ulong tempReg = a[i] - b[i];
    //            System.out.pruintf("%016x ", tempReg);
                ulong borrowReg = (is_digit_lessthan_ct(a[i], b[i]) | (borrow & is_digit_zero_ct(tempReg)));
                c[i] = tempReg - (ulong)(borrow);
                borrow = borrowReg;
            }
    //        System.out.Pruintln();
            return borrow;
        }

        // Is x < y? return 1 (TRUE) if condition is true, 0 (FALSE) otherwise.
        // SECURITY NOTE: This function does not run in constant-time.
        protected internal bool is_orderelm_lt(ulong[] x, ulong[] y)
        {
            for (int i = (int)engine.param.NWORDS_ORDER-1; i >= 0; i--)
            {
                if (x[i] < y[i] )
                {
                    return true;
                }
                else if (x[i] > y[i] )
                {
                    return false;
                }
            }
            return false;
        }


        // Multiprecision subtraction followed by addition with p*2^MAXBITS_FIELD, c = a-b+(p*2^MAXBITS_FIELD) if a-b < 0, otherwise c=a-b. 
        private void mp_subaddfast(ulong[] a, ulong[] b, ulong[] c)
        {
            ulong[] t1 = new ulong[engine.param.NWORDS_FIELD];
        
            ulong mask = 0 - (ulong) mp_sub(a, b, c, 2*engine.param.NWORDS_FIELD);
            for (uint i = 0; i < engine.param.NWORDS_FIELD; i++)
            {
                t1[i] = engine.param.PRIME[i] & mask;
            }
            mp_add(c, engine.param.NWORDS_FIELD, t1, c, engine.param.NWORDS_FIELD, engine.param.NWORDS_FIELD);
        }

        // Multiprecision squaring, c = a^2 mod p.
        protected internal void fpsqr_mont(ulong[] ma, ulong[] mc)
        {
            ulong[] temp = new ulong[2*engine.param.NWORDS_FIELD];

            mp_mul(ma, ma, temp, engine.param.NWORDS_FIELD);
            rdc_mont(temp, mc);
        }

        // Field inversion using Montgomery arithmetic, a = a^(-1)*R mod p.
        private void fpinv_mont(ulong[] a)
        {
            ulong[] tt = new ulong[engine.param.NWORDS_FIELD];

            fpcopy(a, 0, tt);
            fpinv_chain_mont(tt);
            fpsqr_mont(tt, tt);
            fpsqr_mont(tt, tt);
            fpmul_mont(a, tt, a);
        }

        // GF(p^2) inversion using Montgomery arithmetic, a = (a0-i*a1)/(a0^2+a1^2).
        protected internal void fp2inv_mont(ulong[][] a)
        {
            ulong[][] t1 = Utils.InitArray(2, engine.param.NWORDS_FIELD);

            fpsqr_mont(a[0], t1[0]);                 // t10 = a0^2
            fpsqr_mont(a[1], t1[1]);                 // t11 = a1^2
            fpaddPRIME(t1[0], t1[1], t1[0]);           // t10 = a0^2+a1^2
            fpinv_mont(t1[0]);                       // t10 = (a0^2+a1^2)^-1
            fpnegPRIME(a[1]);                          // a = a0-i*a1
            fpmul_mont(a[0], t1[0], a[0]);
            fpmul_mont(a[1], t1[0], a[1]);           // a = (a0-i*a1)*(a0^2+a1^2)^-1
        }

        // Computes a = 3*a
        // The input is assumed to be OBOB_BITS-2 bits ulong and stored in SECRETKEY_B_BYTES
        protected internal void mul3(byte[] a)
        {
            ulong[] temp1 = new ulong[engine.param.NWORDS_ORDER],
                   temp2 = new ulong[engine.param.NWORDS_ORDER];

            decode_to_digits(a, 0, temp1, engine.param.SECRETKEY_B_BYTES, engine.param.NWORDS_ORDER);
            mp_add(temp1, temp1, temp2, engine.param.NWORDS_ORDER);               // temp2 = 2*a
            mp_add(temp1, temp2, temp1, engine.param.NWORDS_ORDER);               // temp1 = 3*a
            encode_to_bytes(temp1,  a, 0, engine.param.SECRETKEY_B_BYTES);
        }

        // Compare two byte arrays in constant time.
        // Returns 0 if the byte arrays are equal, -1 otherwise.
        protected internal byte ct_compare(byte[] a, byte[] b, uint len)
        {
            byte r = 0;

            for (uint i = 0; i < len; i++)
            {
                r |= (byte) (a[i] ^ b[i]); // todo check
            }
            return (byte)((-(byte)r) >> 7);
        }

        // Conditional move in constant time.
        // If selector = -1 then load r with a, else if selector = 0 then keep r.
        protected internal void ct_cmov(byte[] r, byte[] a, uint len, byte selector)
        {
            for (uint i = 0; i < len; i++)
            {
                r[i] ^= (byte) (selector & (a[i] ^ r[i])); //todo check
            }
        }

        // Copy wordsize digits, c = a, where lng(a) = nwords.
        protected internal void copy_words(ulong[] a, ulong[] c, uint nwords)
        {
            uint i;
            for (i = 0; i < nwords; i++)
            {
                c[i] = a[i];
            }
        }

        // c = (2^k)*a
        protected internal void fp2shl(ulong[][] a, uint k, ulong[][] c)
        {
            fp2copy(a, c);
            for (uint j = 0; j < k; j++)
            {
                fp2add(c, c, c);
            }
        }

        // Copy wordsize digits, c = a, where lng(a) = nwords.
        protected internal void copy_words(PointProj a, PointProj c)
        {
            uint i;
            for (i = 0; i < engine.param.NWORDS_FIELD; i++)
            {
                c.X[0][i] = a.X[0][i];
                c.X[1][i] = a.X[1][i];
                c.Z[0][i] = a.Z[0][i];
                c.Z[1][i] = a.Z[1][i];
            }
        }

        // Modular negation, a = -a mod p.
        // Input/output: a in [0, 2*p-1]
        internal void Montgomery_neg(ulong[] a, ulong[] order)
        {
            ulong i, borrow = 0;

            for (i = 0; i < engine.param.NWORDS_ORDER; i++)
            {
                //SUBC
                ulong tempReg = order[i] - a[i];
                ulong borrowReg = (is_digit_lessthan_ct(order[i], a[i]) | (borrow & is_digit_zero_ct(tempReg)));
                a[i] = tempReg - (ulong)(borrow);
                borrow = borrowReg;

            }
        }


        // GF(p^2) addition, c = a+b in GF(p^2).
        protected internal void fp2add(ulong[][] a, ulong[][] b, ulong[][] c)
        {
            //todo/org : make fp class and change this to generic function
            fpaddPRIME(a[0], b[0], c[0]);
            fpaddPRIME(a[1], b[1], c[1]);
        }

        // GF(p^2) subtraction, c = a-b in GF(p^2).
        protected internal void fp2sub(ulong[][] a, ulong[][] b, ulong[][] c)
        {
            //todo/org : make fp class and change this to generic function
            fpsubPRIME(a[0], b[0], c[0]);
            fpsubPRIME(a[1], b[1], c[1]);
        }

        // GF(p^2) subtraction with correction with 4*p, c = a-b+4p in GF(p^2).
        private void mp2_sub_p4(ulong[][] a, ulong[][] b, ulong[][] c)
        {
            //todo/org : make fp class and change this to generic function
            mp_subPRIME_p4(a[0], b[0], c[0]);
            mp_subPRIME_p4(a[1], b[1], c[1]);
        }

        // Multiprecision multiplication, c = a*b mod p.
        protected internal void fpmul_mont(ulong[] ma, ulong[] mb, ulong[] mc)
        {
            ulong[] temp = new ulong[2*engine.param.NWORDS_FIELD];

            mp_mul(ma, mb, temp, engine.param.NWORDS_FIELD);
            rdc_mont(temp, mc);
        }

        // Multiprecision multiplication, c = a*b mod p.
        protected internal void fpmul_mont(ulong[] ma, uint maOffset, ulong[] mb, ulong[] mc)
        {
            ulong[] temp = new ulong[2*engine.param.NWORDS_FIELD];

            mp_mul(ma, maOffset, mb, temp, engine.param.NWORDS_FIELD);
            rdc_mont(temp, mc);
        }

        // Chain to compute a^(p-3)/4 using Montgomery arithmetic.
        private void fpinv_chain_mont(ulong[] a)
        {
            uint i, j;
            if (engine.param.NBITS_FIELD == 434)
            {
                ulong[] tt = new ulong[engine.param.NWORDS_FIELD];
                ulong[][] t =  Utils.InitArray(31, engine.param.NWORDS_FIELD);

                // Precomputed table
                fpsqr_mont(a, tt);
                fpmul_mont(a, tt, t[0]);
                for (i = 0; i <= 29; i++) fpmul_mont(t[i], tt, t[i + 1]);

                fpcopy(a, 0, tt);
                for (i = 0; i < 7; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[5], tt, tt);
                for (i = 0; i < 10; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[14], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[3], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[23], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[13], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[24], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[7], tt, tt);
                for (i = 0; i < 8; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[12], tt, tt);
                for (i = 0; i < 8; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[30], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[1], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[30], tt, tt);
                for (i = 0; i < 7; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[21], tt, tt);
                for (i = 0; i < 9; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[2], tt, tt);
                for (i = 0; i < 9; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[19], tt, tt);
                for (i = 0; i < 9; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[1], tt, tt);
                for (i = 0; i < 7; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[24], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[26], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[16], tt, tt);
                for (i = 0; i < 7; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[10], tt, tt);
                for (i = 0; i < 7; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[6], tt, tt);
                for (i = 0; i < 7; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[0], tt, tt);
                for (i = 0; i < 9; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[20], tt, tt);
                for (i = 0; i < 8; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[9], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[25], tt, tt);
                for (i = 0; i < 9; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[30], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[26], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(a, tt, tt);
                for (i = 0; i < 7; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[28], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[6], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[10], tt, tt);
                for (i = 0; i < 9; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[22], tt, tt);
                for (j = 0; j < 35; j++)
                {
                    for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                    fpmul_mont(t[30], tt, tt);
                }
                fpcopy(tt, 0, a);
            }

            if (engine.param.NBITS_FIELD == 503)
            {
                ulong[][] t = Utils.InitArray(15, engine.param.NWORDS_FIELD);
                ulong[] tt = new ulong[engine.param.NWORDS_FIELD];

                // Precomputed table
                fpsqr_mont(a, tt);
                fpmul_mont(a, tt, t[0]);
                for (i = 0; i <= 13; i++) fpmul_mont(t[i], tt, t[i + 1]);

                fpcopy(a,0, tt);
                for (i = 0; i < 8; i++) fpsqr_mont(tt, tt);
                fpmul_mont(a, tt, tt);
                for (i = 0; i < 5; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[8], tt, tt);
                for (i = 0; i < 5; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[6], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[9], tt, tt);
                for (i = 0; i < 7; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[0], tt, tt);
                for (i = 0; i < 7; i++) fpsqr_mont(tt, tt);
                fpmul_mont(a, tt, tt);
                for (i = 0; i < 7; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[6], tt, tt);
                for (i = 0; i < 7; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[2], tt, tt);
                for (i = 0; i < 5; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[8], tt, tt);
                for (i = 0; i < 7; i++) fpsqr_mont(tt, tt);
                fpmul_mont(a, tt, tt);
                for (i = 0; i < 8; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[10], tt, tt);
                for (i = 0; i < 5; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[0], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[10], tt, tt);
                for (i = 0; i < 5; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[10], tt, tt);
                for (i = 0; i < 5; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[5], tt, tt);
                for (i = 0; i < 5; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[2], tt, tt);
                for (i = 0; i < 5; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[6], tt, tt);
                for (i = 0; i < 5; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[3], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[5], tt, tt);
                for (i = 0; i < 12; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[12], tt, tt);
                for (i = 0; i < 5; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[8], tt, tt);
                for (i = 0; i < 5; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[6], tt, tt);
                for (i = 0; i < 5; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[12], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[11], tt, tt);
                for (i = 0; i < 8; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[6], tt, tt);
                for (i = 0; i < 5; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[5], tt, tt);
                for (i = 0; i < 5; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[14], tt, tt);
                for (i = 0; i < 7; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[14], tt, tt);
                for (i = 0; i < 5; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[5], tt, tt);
                for (i = 0; i < 5; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[6], tt, tt);
                for (i = 0; i < 8; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[8], tt, tt);
                for (i = 0; i < 5; i++) fpsqr_mont(tt, tt);
                fpmul_mont(a, tt, tt);
                for (i = 0; i < 8; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[4], tt, tt);
                for (i = 0; i < 5; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[6], tt, tt);
                for (i = 0; i < 5; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[5], tt, tt);
                for (i = 0; i < 8; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[7], tt, tt);
                for (i = 0; i < 5; i++) fpsqr_mont(tt, tt);
                fpmul_mont(a, tt, tt);
                for (i = 0; i < 5; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[0], tt, tt);
                for (i = 0; i < 5; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[11], tt, tt);
                for (i = 0; i < 5; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[13], tt, tt);
                for (i = 0; i < 8; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[1], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[10], tt, tt);
                for (j = 0; j < 49; j++)
                {
                    for (i = 0; i < 5; i++) fpsqr_mont(tt, tt);
                    fpmul_mont(t[14], tt, tt);
                }
                fpcopy(tt, 0, a);
            }

            if (engine.param.NBITS_FIELD == 610)
            {   
                ulong[][] t = Utils.InitArray(31, engine.param.NWORDS_FIELD); 
                ulong[] tt = new ulong[engine.param.NWORDS_FIELD];

                // Precomputed table
                fpsqr_mont(a, tt);
                fpmul_mont(a, tt, t[0]);
                for (i = 0; i <= 29; i++) fpmul_mont(t[i], tt, t[i + 1]);

                fpcopy(a, 0, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[6], tt, tt);
                for (i = 0; i < 7; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[30], tt, tt);
                for (i = 0; i < 7; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[25], tt, tt);
                for (i = 0; i < 8; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[28], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[7], tt, tt);
                for (i = 0; i < 11; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[11], tt, tt);
                for (i = 0; i < 8; i++) fpsqr_mont(tt, tt);
                fpmul_mont(a, tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[0], tt, tt);
                for (i = 0; i < 8; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[3], tt, tt);
                for (i = 0; i < 7; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[16], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[24], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[28], tt, tt);
                for (i = 0; i < 9; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[16], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[4], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[3], tt, tt);
                for (i = 0; i < 7; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[20], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[11], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[14], tt, tt);
                for (i = 0; i < 7; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[15], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[0], tt, tt);
                for (i = 0; i < 9; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[15], tt, tt);
                for (i = 0; i < 8; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[19], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[9], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[5], tt, tt);
                for (i = 0; i < 7; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[27], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[28], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[29], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[1], tt, tt);
                for (i = 0; i < 9; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[3], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[2], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[30], tt, tt);
                for (i = 0; i < 8; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[25], tt, tt);
                for (i = 0; i < 7; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[28], tt, tt);
                for (i = 0; i < 9; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[22], tt, tt);
                for (i = 0; i < 8; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[3], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[22], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[7], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[9], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[4], tt, tt);
                for (i = 0; i < 7; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[20], tt, tt);
                for (i = 0; i < 11; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[10], tt, tt);
                for (i = 0; i < 8; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[26], tt, tt);
                for (i = 0; i < 11; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[2], tt, tt);
                for (j = 0; j < 50; j++)
                {
                    for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                    fpmul_mont(t[30], tt, tt);
                }
                fpcopy(tt, 0, a);
            }

            if (engine.param.NBITS_FIELD == 751)
            {
                ulong[][] t = Utils.InitArray(27, engine.param.NWORDS_FIELD);
                ulong[] tt = new ulong[engine.param.NWORDS_FIELD];

                // Precomputed table
                fpsqr_mont(a, tt);
                fpmul_mont(a, tt, t[0]);
                fpmul_mont(t[0], tt, t[1]);
                fpmul_mont(t[1], tt, t[2]);
                fpmul_mont(t[2], tt, t[3]);
                fpmul_mont(t[3], tt, t[3]);
                for (i = 3; i <= 8; i++) fpmul_mont(t[i], tt, t[i + 1]);
                fpmul_mont(t[9], tt, t[9]);
                for (i = 9; i <= 20; i++) fpmul_mont(t[i], tt, t[i + 1]);
                fpmul_mont(t[21], tt, t[21]);
                for (i = 21; i <= 24; i++) fpmul_mont(t[i], tt, t[i + 1]);
                fpmul_mont(t[25], tt, t[25]);
                fpmul_mont(t[25], tt, t[26]);

                fpcopy(a, 0, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[20], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[24], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[11], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[8], tt, tt);
                for (i = 0; i < 8; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[2], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[23], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[2], tt, tt);
                for (i = 0; i < 9; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[2], tt, tt);
                for (i = 0; i < 10; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[15], tt, tt);
                for (i = 0; i < 8; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[13], tt, tt);
                for (i = 0; i < 8; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[26], tt, tt);
                for (i = 0; i < 8; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[20], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[11], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[10], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[14], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[4], tt, tt);
                for (i = 0; i < 10; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[18], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[1], tt, tt);
                for (i = 0; i < 7; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[22], tt, tt);
                for (i = 0; i < 10; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[6], tt, tt);
                for (i = 0; i < 7; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[24], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[9], tt, tt);
                for (i = 0; i < 8; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[18], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[17], tt, tt);
                for (i = 0; i < 8; i++) fpsqr_mont(tt, tt);
                fpmul_mont(a, tt, tt);
                for (i = 0; i < 10; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[16], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[7], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[0], tt, tt);
                for (i = 0; i < 7; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[12], tt, tt);
                for (i = 0; i < 7; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[19], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[22], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[25], tt, tt);
                for (i = 0; i < 7; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[2], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[10], tt, tt);
                for (i = 0; i < 7; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[22], tt, tt);
                for (i = 0; i < 8; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[18], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[4], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[14], tt, tt);
                for (i = 0; i < 7; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[13], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[5], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[23], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[21], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[2], tt, tt);
                for (i = 0; i < 7; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[23], tt, tt);
                for (i = 0; i < 8; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[12], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[9], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[3], tt, tt);
                for (i = 0; i < 7; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[13], tt, tt);
                for (i = 0; i < 7; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[17], tt, tt);
                for (i = 0; i < 8; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[26], tt, tt);
                for (i = 0; i < 8; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[5], tt, tt);
                for (i = 0; i < 8; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[8], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[2], tt, tt);
                for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[11], tt, tt);
                for (i = 0; i < 7; i++) fpsqr_mont(tt, tt);
                fpmul_mont(t[20], tt, tt);
                for (j = 0; j < 61; j++)
                {
                    for (i = 0; i < 6; i++) fpsqr_mont(tt, tt);
                    fpmul_mont(t[26], tt, tt);
                }
                fpcopy(tt,0, a);
            }
        }
    }

    }