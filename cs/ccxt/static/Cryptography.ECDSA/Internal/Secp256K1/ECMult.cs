//#define USE_ENDOMORPHISM

using System;
using System.Diagnostics;

namespace Cryptography.ECDSA.Internal.Secp256K1
{
    internal class EcMult
    {
        //        //    /** Double multiply: R = na*A + ng*G */
        //        //    static void secp256k1_ecmult(const secp256k1_ecmult_context* ctx, secp256k1_gej* r, const secp256k1_gej* a, const secp256k1_scalar* na, const secp256k1_scalar* ng);

        //#if defined(EXHAUSTIVE_TEST_ORDER)
        ///* We need to lower these values for exhaustive tests because
        // * the tables cannot have infinities in them (this breaks the
        // * affine-isomorphism stuff which tracks z-ratios) */
        //#if EXHAUSTIVE_TEST_ORDER > 128
        //#define WINDOW_A 5
        //#define WINDOW_G 8
        //#elif EXHAUSTIVE_TEST_ORDER > 8
        //#define WINDOW_A 4
        //#define WINDOW_G 4
        //#else
        //#define WINDOW_A 2
        //#define WINDOW_G 2
        //#endif
        //#else
        //        /* optimal for 128-bit and 256-bit exponents. */
        //#define WINDOW_A 5
        //        /** larger numbers may result in slightly better performance, at the cost of
        //            exponentially larger precomputed tables. */
        //# ifdef USE_ENDOMORPHISM
        //        /** Two tables for window size 15: 1.375 MiB. */
        //#define WINDOW_G 15
        //#else
        //        /** One table for window size 16: 1.375 MiB. */
        //#define WINDOW_G 16
        //#endif
        //#endif

        /** The number of entries a table with precomputed multiples needs to have. */
        //#define ECMULT_TABLE_SIZE(w) (1 << ((w)-2))



        /// <summary> 
        /// Fill a table 'prej' with precomputed odd multiples of a. Prej will contain
        /// the values [1*a,3*a,...,(2*n-1)*a], so it space for n values. zr[0] will
        /// contain prej[0].z / a.z. The other zr[i] values = prej[i].z / prej[i-1].z.
        /// Prej's Z values are undefined, except for the last value.
        /// </summary>
        /// <param name="n"></param>
        /// <param name="prej"></param>
        /// <param name="zr"></param>
        /// <param name="a"></param>
        static void secp256k1_ecmult_odd_multiples_table(int n, GeJ[] prej, Fe[] zr, GeJ a)
        {
            Debug.Assert(!a.Infinity);

            GeJ d = new GeJ();
            Group.secp256k1_gej_double_var(d, a, null);

            /*
             * Perform the additions on an isomorphism where 'd' is affine: drop the z coordinate
             * of 'd', and scale the 1P starting value's x/y coordinates without changing its z.
             */
            Ge dGe = new Ge();
            dGe.X = d.X.Clone();
            dGe.Y = d.Y.Clone();
            dGe.Infinity = false;


            Ge aGe = new Ge();
            Group.secp256k1_ge_set_gej_zinv(aGe, a, d.Z);
            prej[0].X = aGe.X.Clone();
            prej[0].Y = aGe.Y.Clone();
            prej[0].Z = a.Z.Clone();
            prej[0].Infinity = false;

            zr[0] = d.Z.Clone();
            for (var i = 1; i < n; i++)
            {
                Group.secp256k1_gej_add_ge_var(prej[i], prej[i - 1], dGe, zr[i]);
            }

            /*
             * Each point in 'prej' has a z coordinate too small by a factor of 'd.z'. Only
             * the final point's z coordinate is actually used though, so just update that.
             */
            Field.Mul(prej[n - 1].Z, prej[n - 1].Z, d.Z);
        }

        ///** Fill a table 'pre' with precomputed odd multiples of a.
        // *
        // *  There are two versions of this function:
        // *  - secp256k1_ecmult_odd_multiples_table_globalz_windowa which brings its
        // *    resulting point set to a single constant Z denominator, stores the X and Y
        // *    coordinates as ge_storage points in pre, and stores the global Z in rz.
        // *    It only operates on tables sized for WINDOW_A wnaf multiples.
        // *  - secp256k1_ecmult_odd_multiples_table_storage_var, which converts its
        // *    resulting point set to actually affine points, and stores those in pre.
        // *    It operates on tables of any size, but uses heap-allocated temporaries.
        // *
        // *  To compute a*P + b*G, we compute a table for P using the first function,
        // *  and for G using the second (which requires an inverse, but it only needs to
        // *  happen once).
        // */
        //static void secp256k1_ecmult_odd_multiples_table_globalz_windowa(secp256k1_ge* pre, secp256k1_fe* globalz, const secp256k1_gej* a)
        //{
        //    secp256k1_gej prej[ECMULT_TABLE_SIZE(WINDOW_A)];
        //    secp256k1_fe zr[ECMULT_TABLE_SIZE(WINDOW_A)];

        //    /* Compute the odd multiples in Jacobian form. */
        //    secp256k1_ecmult_odd_multiples_table(ECMULT_TABLE_SIZE(WINDOW_A), prej, zr, a);
        //    /* Bring them to the same Z denominator. */
        //    secp256k1_ge_globalz_set_table_gej(ECMULT_TABLE_SIZE(WINDOW_A), pre, globalz, prej, zr);
        //}

        public static void secp256k1_ecmult_odd_multiples_table_storage_var(int n, GeStorage[] pre, GeJ a, EventHandler<Callback> cb)
        {
            GeJ[] prej = new GeJ[n];
            Ge[] prea = new Ge[n];
            Fe[] zr = new Fe[n];
            for (int i = 0; i < n; i++)
            {
                prej[i] = new GeJ();
                prea[i] = new Ge();
                zr[i] = new Fe();
            }

            /* Compute the odd multiples in Jacobian form. */
            secp256k1_ecmult_odd_multiples_table(n, prej, zr, a);
            /* Convert them in batch to affine coordinates. */
            Group.secp256k1_ge_set_table_gej_var(prea, prej, zr, n);
            /* Convert them to compact storage form. */
            for (var i = 0; i < n; i++)
            {
                Group.ToStorage(pre[i], prea[i]);
            }
        }

        ///** The following two macro retrieves a particular odd multiple from a table
        // *  of precomputed multiples. */
        //#define ECMULT_TABLE_GET_GE(r,pre,n,w) do { \
        //    Debug.Assert(((n) & 1) == 1); \
        //    Debug.Assert((n) >= -((1 << ((w)-1)) - 1)); \
        //    Debug.Assert((n) <=  ((1 << ((w)-1)) - 1)); \
        //    if ((n) > 0) { \
        //        * (r) = (pre)[((n) - 1) / 2]; \
        //    } else { \
        //        secp256k1_ge_neg((r), (pre)[(-(n) - 1) / 2]); \
        //    } \
        //} while(0)

        //#define ECMULT_TABLE_GET_GE_STORAGE(r,pre,n,w) do { \
        //    Debug.Assert(((n) & 1) == 1); \
        //    Debug.Assert((n) >= -((1 << ((w)-1)) - 1)); \
        //    Debug.Assert((n) <=  ((1 << ((w)-1)) - 1)); \
        //    if ((n) > 0) { \
        //        FromStorage((r), (pre)[((n) - 1) / 2]); \
        //    } else { \
        //        FromStorage((r), (pre)[(-(n) - 1) / 2]); \
        //        secp256k1_ge_neg((r), (r)); \
        //    } \
        //} while(0)

        public static void secp256k1_ecmult_context_init(EcMultContext ctx)
        {
            ctx.PreG = null;
#if USE_ENDOMORPHISM
            ctx.pre_g_128 = null;
#endif
        }

        public static void secp256k1_ecmult_context_build(EcMultContext ctx, EventHandler<Callback> cb)
        {
            if (ctx.PreG != null)
                return;


            GeJ gj = new GeJ();
            /* get the generator */
            Group.secp256k1_gej_set_ge(gj, Group.Secp256K1GeConstG);

#if USE_ENDOMORPHISM
                var WINDOW_G = 15;
#else
            var WINDOW_G = 16;
#endif
            var tblsize = (1 << ((WINDOW_G) - 2));
            ctx.PreG = new GeStorage[tblsize];
            for (int i = 0; i < tblsize; i++)
            {
                ctx.PreG[i] = new GeStorage();
            }
            /* precompute the tables with odd multiples */
            secp256k1_ecmult_odd_multiples_table_storage_var(tblsize, ctx.PreG, gj, cb);

#if USE_ENDOMORPHISM
            {
                secp256k1_gej g_128j;
                int i;

                ctx.pre_g_128 = (secp256k1_ge_storage(*)[])checked_malloc(cb, sizeof((* ctx.pre_g_128)[0]) *ECMULT_TABLE_SIZE(WINDOW_G));

                /* calculate 2^128*generator */
                g_128j = gj.Clone();
                for (i = 0; i < 128; i++)
                {
                    secp256k1_gej_double_var(g_128j, g_128j, null);
                }
                secp256k1_ecmult_odd_multiples_table_storage_var(ECMULT_TABLE_SIZE(WINDOW_G), *ctx.pre_g_128, g_128j, cb);
            }
#endif
        }

        //static void secp256k1_ecmult_context_clone(secp256k1_ecmult_context* dst,
        //                                           const secp256k1_ecmult_context* src, const secp256k1_callback* cb)
        //{
        //    if (src.pre_g == null)
        //    {
        //        dst.pre_g = null;
        //    }
        //    else
        //    {
        //        size_t size = sizeof((* dst.pre_g)[0]) * ECMULT_TABLE_SIZE(WINDOW_G);
        //dst.pre_g = (secp256k1_ge_storage (*)[])checked_malloc(cb, size);
        //        memcpy(dst.pre_g, src.pre_g, size);
        //    }
        //#ifdef USE_ENDOMORPHISM
        //    if (src.pre_g_128 == null) {
        //        dst.pre_g_128 = null;
        //    } else {
        //        size_t size = sizeof((* dst.pre_g_128)[0]) * ECMULT_TABLE_SIZE(WINDOW_G);
        //dst.pre_g_128 = (secp256k1_ge_storage (*)[])checked_malloc(cb, size);
        //        memcpy(dst.pre_g_128, src.pre_g_128, size);
        //    }
        //#endif
        //}

        //static int secp256k1_ecmult_context_is_built(const secp256k1_ecmult_context* ctx)
        //{
        //    return ctx.pre_g != null;
        //}

        //static void secp256k1_ecmult_context_clear(secp256k1_ecmult_context* ctx)
        //{
        //    free(ctx.pre_g);
        //#ifdef USE_ENDOMORPHISM
        //    free(ctx.pre_g_128);
        //#endif
        //    secp256k1_ecmult_context_init(ctx);
        //}

        ///** Convert a number to WNAF notation. The number becomes represented by sum(2^i * wnaf[i], i=0..bits),
        // *  with the following guarantees:
        // *  - each wnaf[i] is either 0, or an odd integer between -(1<<(w-1) - 1) and (1<<(w-1) - 1)
        // *  - two non-zero entries in wnaf are separated by at least w-1 zeroes.
        // *  - the number of set values in wnaf is returned. This number is at most 256, and at most one more
        // *    than the number of bits in the (absolute value) of the input.
        // */
        //static int secp256k1_ecmult_wnaf(int* wnaf, int len, const secp256k1_scalar* a, int w)
        //{
        //    secp256k1_scalar s = *a;
        //    int last_set_bit = -1;
        //    int bit = 0;
        //    int sign = 1;
        //    int carry = 0;

        //    Debug.Assert(wnaf != null);
        //    Debug.Assert(0 <= len && len <= 256);
        //    Debug.Assert(a != null);
        //    Debug.Assert(2 <= w && w <= 31);

        //    memset(wnaf, 0, len * sizeof(wnaf[0]));

        //    if (GetBits(s, 255, 1))
        //    {
        //        Negate(s, s);
        //        sign = -1;
        //    }

        //    while (bit < len)
        //    {
        //        int now;
        //        int word;
        //        if (GetBits(s, bit, 1) == (unsigned int)carry) {
        //            bit++;
        //            continue;
        //        }

        //        now = w;
        //        if (now > len - bit)
        //        {
        //            now = len - bit;
        //        }

        //        word = GetBitsVar(s, bit, now) + carry;

        //        carry = (word >> (w - 1)) & 1;
        //        word -= carry << w;

        //        wnaf[bit] = sign * word;
        //        last_set_bit = bit;

        //        bit += now;
        //    }
        //#ifdef VERIFY
        //    CHECK(carry == 0);
        //    while (bit < 256)
        //    {
        //        CHECK(GetBits(s, bit++, 1) == 0);
        //    }
        //#endif
        //    return last_set_bit + 1;
        //}

        //static void secp256k1_ecmult(const secp256k1_ecmult_context* ctx, secp256k1_gej* r, const secp256k1_gej* a, const secp256k1_scalar* na, const secp256k1_scalar* ng)
        //{
        //    secp256k1_ge pre_a[ECMULT_TABLE_SIZE(WINDOW_A)];
        //    secp256k1_ge tmpa;
        //    secp256k1_fe Z;
        //#ifdef USE_ENDOMORPHISM
        //    secp256k1_ge pre_a_lam[ECMULT_TABLE_SIZE(WINDOW_A)];
        //    secp256k1_scalar na_1, na_lam;
        //    /* Splitted G factors. */
        //    secp256k1_scalar ng_1, ng_128;
        //    int wnaf_na_1[130];
        //    int wnaf_na_lam[130];
        //    int bits_na_1;
        //    int bits_na_lam;
        //    int wnaf_ng_1[129];
        //    int bits_ng_1;
        //    int wnaf_ng_128[129];
        //    int bits_ng_128;
        //#else
        //    int wnaf_na[256];
        //    int bits_na;
        //    int wnaf_ng[256];
        //    int bits_ng;
        //#endif
        //    int i;
        //    int bits;

        //#ifdef USE_ENDOMORPHISM
        //    /* split na into na_1 and na_lam (where na = na_1 + na_lam*lambda, and na_1 and na_lam are ~128 bit) */
        //    secp256k1_scalar_split_lambda(na_1, na_lam, na);

        //    /* build wnaf representation for na_1 and na_lam. */
        //    bits_na_1 = secp256k1_ecmult_wnaf(wnaf_na_1, 130, na_1, WINDOW_A);
        //    bits_na_lam = secp256k1_ecmult_wnaf(wnaf_na_lam, 130, na_lam, WINDOW_A);
        //    Debug.Assert(bits_na_1 <= 130);
        //    Debug.Assert(bits_na_lam <= 130);
        //    bits = bits_na_1;
        //    if (bits_na_lam > bits)
        //    {
        //        bits = bits_na_lam;
        //    }
        //#else
        //    /* build wnaf representation for na. */
        //    bits_na = secp256k1_ecmult_wnaf(wnaf_na, 256, na, WINDOW_A);
        //    bits = bits_na;
        //#endif

        //    /* Calculate odd multiples of a.
        //     * All multiples are brought to the same Z 'denominator', which is stored
        //     * in Z. Due to secp256k1' isomorphism we can do all operations pretending
        //     * that the Z coordinate was 1, use affine addition formulae, and correct
        //     * the Z coordinate of the result once at the end.
        //     * The exception is the precomputed G table points, which are actually
        //     * affine. Compared to the base used for other points, they have a Z ratio
        //     * of 1/Z, so we can use secp256k1_gej_add_zinv_var, which uses the same
        //     * isomorphism to efficiently add with a known Z inverse.
        //     */
        //    secp256k1_ecmult_odd_multiples_table_globalz_windowa(pre_a, Z, a);

        //#ifdef USE_ENDOMORPHISM
        //    for (i = 0; i < ECMULT_TABLE_SIZE(WINDOW_A); i++)
        //    {
        //        secp256k1_ge_mul_lambda(pre_a_lam[i], pre_a[i]);
        //    }

        //    /* split ng into ng_1 and ng_128 (where gn = gn_1 + gn_128*2^128, and gn_1 and gn_128 are ~128 bit) */
        //    secp256k1_scalar_split_128(ng_1, ng_128, ng);

        //    /* Build wnaf representation for ng_1 and ng_128 */
        //    bits_ng_1 = secp256k1_ecmult_wnaf(wnaf_ng_1, 129, ng_1, WINDOW_G);
        //    bits_ng_128 = secp256k1_ecmult_wnaf(wnaf_ng_128, 129, ng_128, WINDOW_G);
        //    if (bits_ng_1 > bits)
        //    {
        //        bits = bits_ng_1;
        //    }
        //    if (bits_ng_128 > bits)
        //    {
        //        bits = bits_ng_128;
        //    }
        //#else
        //    bits_ng = secp256k1_ecmult_wnaf(wnaf_ng, 256, ng, WINDOW_G);
        //    if (bits_ng > bits)
        //    {
        //        bits = bits_ng;
        //    }
        //#endif

        //    secp256k1_gej_set_infinity(r);

        //    for (i = bits - 1; i >= 0; i--)
        //    {
        //        int n;
        //        secp256k1_gej_double_var(r, r, null);
        //#ifdef USE_ENDOMORPHISM
        //        if (i < bits_na_1 && (n = wnaf_na_1[i]))
        //        {
        //            ECMULT_TABLE_GET_GE(tmpa, pre_a, n, WINDOW_A);
        //            secp256k1_gej_add_ge_var(r, r, tmpa, null);
        //        }
        //        if (i < bits_na_lam && (n = wnaf_na_lam[i]))
        //        {
        //            ECMULT_TABLE_GET_GE(tmpa, pre_a_lam, n, WINDOW_A);
        //            secp256k1_gej_add_ge_var(r, r, tmpa, null);
        //        }
        //        if (i < bits_ng_1 && (n = wnaf_ng_1[i]))
        //        {
        //            ECMULT_TABLE_GET_GE_STORAGE(tmpa, *ctx.pre_g, n, WINDOW_G);
        //            secp256k1_gej_add_zinv_var(r, r, tmpa, Z);
        //        }
        //        if (i < bits_ng_128 && (n = wnaf_ng_128[i]))
        //        {
        //            ECMULT_TABLE_GET_GE_STORAGE(tmpa, *ctx.pre_g_128, n, WINDOW_G);
        //            secp256k1_gej_add_zinv_var(r, r, tmpa, Z);
        //        }
        //#else
        //        if (i < bits_na && (n = wnaf_na[i]))
        //        {
        //            ECMULT_TABLE_GET_GE(tmpa, pre_a, n, WINDOW_A);
        //            secp256k1_gej_add_ge_var(r, r, tmpa, null);
        //        }
        //        if (i < bits_ng && (n = wnaf_ng[i]))
        //        {
        //            ECMULT_TABLE_GET_GE_STORAGE(tmpa, *ctx.pre_g, n, WINDOW_G);
        //            secp256k1_gej_add_zinv_var(r, r, tmpa, Z);
        //        }
        //#endif
        //    }

        //    if (!r.infinity)
        //    {
        //        Mul(r.z, r.z, Z);
        //    }
        //}

        //#endif


    }
}
