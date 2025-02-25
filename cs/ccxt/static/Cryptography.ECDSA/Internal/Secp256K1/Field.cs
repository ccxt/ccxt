#define USE_FIELD_INV_BUILTIN
namespace Cryptography.ECDSA.Internal.Secp256K1
{
    internal partial class Field
    {
        /** Normalize a field element. */
        //static void Normalize(secp256k1_fe* r);

        /** Weakly normalize a field element: reduce it magnitude to 1, but don't fully normalize. */
        //static void NormalizeWeak(secp256k1_fe* r);

        /** Normalize a field element, without constant-time guarantee. */
        //static void NormalizeVar(secp256k1_fe* r);

        /** Verify whether a field element represents zero i.e. would normalize to a zero value. The field
         *  implementation may optionally normalize the input, but this should not be relied upon. */
        //static int NormalizesToZero(secp256k1_fe* r);

        /** Verify whether a field element represents zero i.e. would normalize to a zero value. The field
         *  implementation may optionally normalize the input, but this should not be relied upon. */
        //static int NormalizesToZeroVar(secp256k1_fe* r);

        /** Set a field element equal to a small integer. Resulting field element is normalized. */
        //static void SetInt(secp256k1_fe* r, int a);

        /** Sets a field element equal to zero, initializing all fields. */
        //static void Clear(secp256k1_fe* a);

        /** Verify whether a field element is zero. Requires the input to be normalized. */
        //static int IsZero(const secp256k1_fe* a);

        /** Check the "oddness" of a field element. Requires the input to be normalized. */
        //static int IsOdd(const secp256k1_fe* a);

        /// <summary>
        /// Compare two field elements. Requires magnitude-1 inputs.
        /// </summary>
        /// <param name="a"></param>
        /// <param name="b"></param>
        /// <returns></returns>
        public static bool Equal(Fe a, Fe b)
        {
            Fe na = new Fe();
            Negate(na, a, 1);
            Add(na, b);
            return NormalizesToZero(na);
        }

        /// <summary>
        /// Same as Equal, but may be variable time.
        /// </summary>
        /// <param name="a"></param>
        /// <param name="b"></param>
        /// <returns></returns>
        public static bool EqualVar(Fe a, Fe b)
        {
            Fe na = new Fe();
            Negate(na, a, 1);
            Add(na, b);
            return NormalizesToZeroVar(na);
        }

        /** Compare two field elements. Requires both inputs to be normalized */
        //static int secp256k1_fe_cmp_var(const secp256k1_fe* a, const secp256k1_fe* b);

        /** Set a field element equal to 32-byte big endian value. If successful, the resulting field element is normalized. */
        //static int SetB32(secp256k1_fe* r, const unsigned char* a);

        /** Convert a field element to a 32-byte big endian value. Requires the input to be normalized */
        //static void GetB32(unsigned char* r, const secp256k1_fe* a);

        /** Set a field element equal to the additive inverse of another. Takes a maximum magnitude of the input
         *  as an argument. The magnitude of the output is one higher. */
        //static void Negate(secp256k1_fe* r, const secp256k1_fe* a, int m);

        /** Multiplies the passed field element with a small integer constant. Multiplies the magnitude by that
         *  small integer. */
        //static void MulInt(secp256k1_fe* r, int a);

        /** Adds a field element to another. The result has the sum of the inputs' magnitudes as magnitude. */
        //static void Add(secp256k1_fe* r, const secp256k1_fe* a);

        /** Sets a field element to be the product of two others. Requires the inputs' magnitudes to be at most 8.
         *  The output magnitude is 1 (but not guaranteed to be normalized). */
        //static void Mul(secp256k1_fe* r, const secp256k1_fe* a, const secp256k1_fe* SECP256K1_RESTRICT b);

        /** Sets a field element to be the square of another. Requires the input's magnitude to be at most 8.
         *  The output magnitude is 1 (but not guaranteed to be normalized). */
        //static void Sqr(secp256k1_fe* r, const secp256k1_fe* a);

        /// <summary>
        /// If a has a square root, it is computed in r and 1 is returned. If a does not have a square root, the root of its negation is computed and 0 is returned. The input's magnitude can be at most 8. The output magnitude is 1 (but not guaranteed to be normalized). The result in r will always be a square itself.
        /// </summary>
        /// <param name="r"></param>
        /// <param name="a"></param>
        /// <returns></returns>
        public static bool Sqrt(Fe r, Fe a)
        {
            /** Given that p is congruent to 3 mod 4, we can compute the square root of
             *  a mod p as the (p+1)/4'th power of a.
             *
             *  As (p+1)/4 is an even number, it will have the same result for a and for
             *  (-a). Only one of these two numbers actually has a square root however,
             *  so we test at the end by squaring and comparing to the input.
             *  Also because (p+1)/4 is an even number, the computed square root is
             *  itself always a square (a ** ((p+1)/4) is the square of a ** ((p+1)/8)).
             */
            Fe x2, x3, x6, x9, x11, x22, x44, x88, x176, x220, x223, t1;
            int j;

            /** The binary representation of (p + 1)/4 has 3 blocks of 1s, with lengths in
             *  { 2, 22, 223 }. Use an addition chain to calculate 2^n - 1 for each block:
             *  1, [2], 3, 6, 9, 11, [22], 44, 88, 176, 220, [223]
             */
            x2 = new Fe();
            Sqr(x2, a);
            Mul(x2, x2, a);

            x3 = new Fe();
            Sqr(x3, x2);
            Mul(x3, x3, a);

            x6 = x3.Clone();
            for (j = 0; j < 3; j++)
            {
                Sqr(x6, x6);
            }
            Mul(x6, x6, x3);

            x9 = x6.Clone();
            for (j = 0; j < 3; j++)
            {
                Sqr(x9, x9);
            }
            Mul(x9, x9, x3);

            x11 = x9.Clone();
            for (j = 0; j < 2; j++)
            {
                Sqr(x11, x11);
            }
            Mul(x11, x11, x2);

            x22 = x11.Clone();
            for (j = 0; j < 11; j++)
            {
                Sqr(x22, x22);
            }
            Mul(x22, x22, x11);

            x44 = x22.Clone();
            for (j = 0; j < 22; j++)
            {
                Sqr(x44, x44);
            }
            Mul(x44, x44, x22);

            x88 = x44.Clone();
            for (j = 0; j < 44; j++)
            {
                Sqr(x88, x88);
            }
            Mul(x88, x88, x44);

            x176 = x88.Clone();
            for (j = 0; j < 88; j++)
            {
                Sqr(x176, x176);
            }
            Mul(x176, x176, x88);

            x220 = x176.Clone();
            for (j = 0; j < 44; j++)
            {
                Sqr(x220, x220);
            }
            Mul(x220, x220, x44);

            x223 = x220.Clone();
            for (j = 0; j < 3; j++)
            {
                Sqr(x223, x223);
            }
            Mul(x223, x223, x3);

            /* The final result is then assembled using a sliding window over the blocks. */

            t1 = x223.Clone();
            for (j = 0; j < 23; j++)
            {
                Sqr(t1, t1);
            }
            Mul(t1, t1, x22);
            for (j = 0; j < 6; j++)
            {
                Sqr(t1, t1);
            }
            Mul(t1, t1, x2);
            Sqr(t1, t1);
            Sqr(r, t1);

            /* Check that a square root was actually calculated */

            Sqr(t1, r);
            return Equal(t1, a);
        }


        /** Checks whether a field element is a quadratic residue. */
        //        static int secp256k1_fe_is_quad_var(const secp256k1_fe* a)
        //        {
        //# ifndef USE_NUM_NONE
        //            unsigned char b[32];
        //            secp256k1_num n;
        //            secp256k1_num m;
        //        /* secp256k1 field prime, value p defined in "Standards for Efficient Cryptography" (SEC2) 2.7.1. */
        //        static const unsigned char prime[32] = {
        //            0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
        //            0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
        //            0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
        //            0xFF,0xFF,0xFF,0xFE,0xFF,0xFF,0xFC,0x2F
        //        };

        //    secp256k1_fe c = *a;
        //    NormalizeVar(c);
        //    GetB32(b, c);
        //    secp256k1_num_set_bin(n, b, 32);
        //    secp256k1_num_set_bin(m, prime, 32);
        //    return secp256k1_num_jacobi(n, m) >= 0;
        //#else
        //    secp256k1_fe r;
        //    return Sqrt(r, a);
        //#endif
        //}

        /// <summary>
        /// Sets a field element to be the (modular) inverse of another. Requires the input's magnitude to be at most 8. The output magnitude is 1 (but not guaranteed to be normalized).
        /// </summary>
        /// <param name="r"></param>
        /// <param name="a"></param>
        /// <returns></returns>
        public static void Inv(Fe r, Fe a)
        {
            Fe x2, x3, x6, x9, x11, x22, x44, x88, x176, x220, x223, t1;
            int j;

            /** The binary representation of (p - 2) has 5 blocks of 1s, with lengths in
             *  { 1, 2, 22, 223 }. Use an addition chain to calculate 2^n - 1 for each block:
             *  [1], [2], 3, 6, 9, 11, [22], 44, 88, 176, 220, [223]
             */
            x2 = new Fe();
            Sqr(x2, a);
            Mul(x2, x2, a);

            x3 = new Fe();
            Sqr(x3, x2);
            Mul(x3, x3, a);

            x6 = x3.Clone();
            for (j = 0; j < 3; j++)
            {
                Sqr(x6, x6);
            }
            Mul(x6, x6, x3);

            x9 = x6.Clone();
            for (j = 0; j < 3; j++)
            {
                Sqr(x9, x9);
            }
            Mul(x9, x9, x3);

            x11 = x9.Clone();
            for (j = 0; j < 2; j++)
            {
                Sqr(x11, x11);
            }
            Mul(x11, x11, x2);

            x22 = x11.Clone();
            for (j = 0; j < 11; j++)
            {
                Sqr(x22, x22);
            }
            Mul(x22, x22, x11);

            x44 = x22.Clone();
            for (j = 0; j < 22; j++)
            {
                Sqr(x44, x44);
            }
            Mul(x44, x44, x22);

            x88 = x44.Clone();
            for (j = 0; j < 44; j++)
            {
                Sqr(x88, x88);
            }
            Mul(x88, x88, x44);

            x176 = x88.Clone();
            for (j = 0; j < 88; j++)
            {
                Sqr(x176, x176);
            }
            Mul(x176, x176, x88);

            x220 = x176.Clone();
            for (j = 0; j < 44; j++)
            {
                Sqr(x220, x220);
            }
            Mul(x220, x220, x44);

            x223 = x220.Clone();
            for (j = 0; j < 3; j++)
            {
                Sqr(x223, x223);
            }
            Mul(x223, x223, x3);

            /* The final result is then assembled using a sliding window over the blocks. */

            t1 = x223.Clone();
            for (j = 0; j < 23; j++)
            {
                Sqr(t1, t1);
            }
            Mul(t1, t1, x22);
            for (j = 0; j < 5; j++)
            {
                Sqr(t1, t1);
            }
            Mul(t1, t1, a);
            for (j = 0; j < 3; j++)
            {
                Sqr(t1, t1);
            }
            Mul(t1, t1, x2);
            for (j = 0; j < 2; j++)
            {
                Sqr(t1, t1);
            }
            Mul(r, a, t1);
        }


        /// <summary>
        /// Potentially faster version of Inv, without constant-time guarantee.
        /// </summary>
        /// <param name="r"></param>
        /// <param name="a"></param>
        /// <returns></returns>
        public static void InvVar(Fe r, Fe a)
        {
#if USE_FIELD_INV_BUILTIN
            Inv(r, a);
#elif USE_FIELD_INV_NUM
            secp256k1_num n, m;
            static const secp256k1_fe negone = SECP256K1_FE_CONST(
                0xFFFFFFFFUL, 0xFFFFFFFFUL, 0xFFFFFFFFUL, 0xFFFFFFFFUL,
                0xFFFFFFFFUL, 0xFFFFFFFFUL, 0xFFFFFFFEUL, 0xFFFFFC2EUL
            );
            /* secp256k1 field prime, value p defined in "Standards for Efficient Cryptography" (SEC2) 2.7.1. */
            byte[] prime = new byte[32]{
                0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
                0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
                0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
                0xFF,0xFF,0xFF,0xFE,0xFF,0xFF,0xFC,0x2F
            };
            byte[] b = new byte[32];
            int res;
            secp256k1_fe c = a.Clone();
            NormalizeVar(c);
            GetB32(b, c);
            secp256k1_num_set_bin(n, b, 32);
            secp256k1_num_set_bin(m, prime, 32);
            secp256k1_num_mod_inverse(n, n, m);
            secp256k1_num_get_bin(b, 32, n);
            res = SetB32(r, b);
            (void)res;
            VERIFY_CHECK(res);
            /* Verify the result is the (unique) valid inverse using non-GMP code. */
            Mul(c, c, r);
            Add(c, negone);
            CHECK(NormalizesToZeroVar(c));
#else
#error "Please select field inverse implementation"
#endif
        }

        /// <summary>
        /// Calculate the (modular) inverses of a batch of field elements. Requires the inputs' magnitudes to be 
        /// at most 8. The output magnitudes are 1 (but not guaranteed to be normalized). The inputs and 
        /// outputs must not overlap in memory.
        /// </summary>
        /// <param name="r"></param>
        /// <param name="a"></param>
        /// <param name="len"></param>
        public static void InvAllVar(Fe[] r, Fe[] a, int len)
        {
            if (len < 1)
                return;

            //  Debug.Assert((r.Length + len <= a.Length) || (a.Length + len <= r.Length));

            for (int j = 0; j < len; j++)
            {
                r[j] = a[j].Clone();
            }

            var i = 0;
            while (++i < len)
            {
                Mul(r[i], r[i - 1], a[i]);
            }

            Fe u = new Fe();
            InvVar(u, r[--i]);

            while (i > 0)
            {
                var j = i--;
                Mul(r[j], r[i], u);
                Mul(u, u, a[j]);
            }

            r[0] = u.Clone();
        }


        /** Convert a field element to the storage type. */
        //static void ToStorage(secp256k1_fe_storage* r, const secp256k1_fe* a);

        /** Convert a field element back from the storage type. */
        //static void FromStorage(secp256k1_fe* r, const secp256k1_fe_storage* a);

        /** If flag is true, set *r equal to *a; otherwise leave it. Constant-time. */
        //static void StorageCmov(secp256k1_fe_storage* r, const secp256k1_fe_storage* a, int flag);

        /** If flag is true, set *r equal to *a; otherwise leave it. Constant-time. */
        //static void Cmov(secp256k1_fe* r, const secp256k1_fe* a, int flag);
    }
}
