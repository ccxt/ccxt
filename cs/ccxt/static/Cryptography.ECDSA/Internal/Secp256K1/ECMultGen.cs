using System;
using System.Diagnostics;
using System.Text;
using Cryptography.ECDSA.Internal.Sha256;

namespace Cryptography.ECDSA.Internal.Secp256K1
{
    internal class EcMultGen
    {
        public static void ContextInit(EcmultGenContext ctx)
        {
            ctx.Prec = null;
        }

        public static void ContextBuild(EcmultGenContext ctx, EventHandler<Callback> cb)
        {
#if !USE_ECMULT_STATIC_PRECOMPUTATION
            Ge[] prec = new Ge[1024];
            GeJ gj = new GeJ();
            GeJ numsGej = new GeJ();
            int i, j;
#endif

            if (ctx.Prec != null)
            {
                return;
            }
#if !USE_ECMULT_STATIC_PRECOMPUTATION
            ctx.PrecInit();

            /* get the generator */
            Group.secp256k1_gej_set_ge(gj, Group.Secp256K1GeConstG);

            /* Construct a group element with no known corresponding scalar (nothing up my sleeve). */
            {
                var numsB32 = Encoding.UTF8.GetBytes("The scalar for this x is unknown");
                Fe numsX = new Fe();
                Ge numsGe = new Ge();
                var r = Field.SetB32(numsX, numsB32);
                //(void)r;
                Debug.Assert(r);
                r = Group.secp256k1_ge_set_xo_var(numsGe, numsX, false);
                //(void)r;
                Debug.Assert(r);
                Group.secp256k1_gej_set_ge(numsGej, numsGe);
                /* Add G to make the bits in x uniformly distributed. */
                Group.secp256k1_gej_add_ge_var(numsGej, numsGej, Group.Secp256K1GeConstG, null);
            }

            /* compute prec. */
            {
                GeJ[] precj = new GeJ[1024]; /* Jacobian versions of prec. */
                for (int k = 0; k < precj.Length; k++)
                    precj[k] = new GeJ();
                GeJ gbase;
                GeJ numsbase;
                gbase = gj.Clone(); /* 16^j * G */
                numsbase = numsGej.Clone(); /* 2^j * nums. */
                for (j = 0; j < 64; j++)
                {
                    /* Set precj[j*16 .. j*16+15] to (numsbase, numsbase + gbase, ..., numsbase + 15*gbase). */
                    precj[j * 16] = numsbase.Clone();
                    for (i = 1; i < 16; i++)
                    {
                        Group.secp256k1_gej_add_var(precj[j * 16 + i], precj[j * 16 + i - 1], gbase, null);
                    }
                    /* Multiply gbase by 16. */
                    for (i = 0; i < 4; i++)
                    {
                        Group.secp256k1_gej_double_var(gbase, gbase, null);
                    }
                    /* Multiply numbase by 2. */
                    Group.secp256k1_gej_double_var(numsbase, numsbase, null);
                    if (j == 62)
                    {
                        /* In the last iteration, numsbase is (1 - 2^j) * nums instead. */
                        Group.secp256k1_gej_neg(numsbase, numsbase);
                        Group.secp256k1_gej_add_var(numsbase, numsbase, numsGej, null);
                    }
                }
                for (int k = 0; k < prec.Length; k++)
                    prec[k] = new Ge();
                Group.secp256k1_ge_set_all_gej_var(prec, precj, 1024, cb);
            }
            for (j = 0; j < 64; j++)
            {
                for (i = 0; i < 16; i++)
                {
                    Group.ToStorage(ctx.Prec[j][i], prec[j * 16 + i]);
                }
            }
#else
            (void)cb;
            ctx.prec = (secp256k1_ge_storage(*)[64][16])secp256k1_ecmult_static_context;
#endif
            Blind(ctx, null);
        }

        public static bool ContextIsBuilt(EcmultGenContext ctx)
        {
            return ctx.Prec != null;
        }

        //static void secp256k1_ecmult_gen_context_clone(secp256k1_ecmult_gen_context* dst,
        //                                               const secp256k1_ecmult_gen_context* src, secp256k1_callback* cb)
        //{
        //    if (src.prec == null)
        //    {
        //        dst.prec = null;
        //    }
        //    else
        //    {
        //#ifndef USE_ECMULT_STATIC_PRECOMPUTATION
        //        dst.prec = (secp256k1_ge_storage(*)[64][16])checked_malloc(cb, sizeof(*dst.prec));
        //        memcpy(dst.prec, src.prec, sizeof(*dst.prec));
        //#else
        //        (void)cb;
        //        dst.prec = src.prec;
        //#endif
        //        dst.initial = src.initial;
        //        dst.blind = src.blind;
        //    }
        //}

        //static void secp256k1_ecmult_gen_context_clear(secp256k1_ecmult_gen_context* ctx)
        //{
        //#ifndef USE_ECMULT_STATIC_PRECOMPUTATION
        //    free(ctx.prec);
        //#endif
        //    Clear(ctx.blind);
        //    secp256k1_gej_clear(ctx.initial);
        //    ctx.prec = null;
        //}


        /// <summary>
        /// Multiply with the generator: R = a*G
        /// </summary>
        public static void secp256k1_ecmult_gen(EcmultGenContext ctx, out GeJ r, Scalar gn)
        {
            Ge add = new Ge();
            GeStorage adds = new GeStorage();
            uint bits;
            //Util.MemSet(adds,0,); //memset(adds, 0, sizeof(adds));
            r = ctx.Initial.Clone();
            /* Blind scalar/point multiplication by computing (n-b)G + bG instead of nG. */
            Scalar gnb = new Scalar();
            Scalar.Add(gnb, gn, ctx.Blind);
            add.Infinity = false;
            for (var j = 0; j < 64; j++)
            {
                bits = gnb.GetBits(j * 4, 4);
                for (var i = 0; i < 16; i++)
                {
                    /** This uses a conditional move to avoid any secret data in array indexes.
                     *   _Any_ use of secret indexes has been demonstrated to result in timing
                     *   sidechannels, even when the cache-line access patterns are uniform.
                     *  See also:
                     *   "A word of warning", CHES 2013 Rump Session, by Daniel J. Bernstein and Peter Schwabe
                     *    (https://cryptojedi.org/peter/data/chesrump-20130822.pdf) and
                     *   "Cache Attacks and Countermeasures: the Case of AES", RSA 2006,
                     *    by Dag Arne Osvik, Adi Shamir, and Eran Tromer
                     *    (http://www.tau.ac.il/~tromer/papers/cache.pdf)
                     */
                    Group.StorageCmov(adds, ctx.Prec[j][i], i == bits);
                }
                Group.FromStorage(add, adds);
                Group.GeJAddGe(r, r, add);
            }
            bits = 0;
            Group.secp256k1_ge_clear(add);
            Scalar.Clear(gnb);
        }

        /* Setup blinding values for secp256k1_ecmult_gen. */
        public static void Blind(EcmultGenContext ctx, byte[] seed32)
        {
            Scalar b = new Scalar();
            GeJ gb;
            Fe s = new Fe();

            Rfc6979HmacSha256T rng = new Rfc6979HmacSha256T();
            bool retry;
            var keydata = new byte[64];
            if (seed32 == null)
            {
                /* When seed is null, reset the initial point and blinding value. */
                Group.secp256k1_gej_set_ge(ctx.Initial, Group.Secp256K1GeConstG);
                Group.secp256k1_gej_neg(ctx.Initial, ctx.Initial);
                ctx.Blind.SetInt(1);
            }
            /* The prior blinding value (if not reset) is chained forward by including it in the hash. */
            var nonce32 = Scalar.GetB32(ctx.Blind);
            /** Using a CSPRNG allows a failure free interface, avoids needing large amounts of random data,
             *   and guards against weak or adversarial seeds.  This is a simpler and safer interface than
             *   asking the caller for blinding values directly and expecting them to retry on failure.
             */
            Util.Memcpy(nonce32, 0, keydata, 0, 32); //memcpy(keydata, nonce32, 32);
            if (seed32 != null)
            {
                Util.Memcpy(seed32, 0, keydata, 32, 32); //memcpy(keydata + 32, seed32, 32);
            }
            Hash.Rfc6979HmacSha256Initialize(rng, keydata, (UInt32)(seed32 != null ? 64 : 32));
            Util.MemSet(keydata, 0, keydata.Length); //memset(keydata, 0, sizeof(keydata));
            /* Retry for out of range results to achieve uniformity. */
            do
            {
                Hash.Rfc6979HmacSha256Generate(rng, nonce32, 32);
                retry = !Field.SetB32(s, nonce32);
                retry |= Field.IsZero(s);
            } while (retry); /* This branch true is cryptographically unreachable. Requires sha256_hmac output > Fp. */
            /* Randomize the projection to defend against multiplier sidechannels. */
            Group.secp256k1_gej_rescale(ctx.Initial, s);
            Field.Clear(s);
            do
            {
                Hash.Rfc6979HmacSha256Generate(rng, nonce32, 32);
                Scalar.SetB32(b, nonce32, ref retry);
                /* A blinding value of 0 works, but would undermine the projection hardening. */
                retry |= Scalar.IsZero(b);
            } while (retry); /* This branch true is cryptographically unreachable. Requires sha256_hmac output > order. */
            Hash.Rfc6979HmacSha256Finalize(rng);
            Util.MemSet(nonce32, 0, 32);//memset(nonce32, 0, 32);
            secp256k1_ecmult_gen(ctx, out gb, b);
            Scalar.Negate(b, b);
            ctx.Blind = b.Clone();
            ctx.Initial = gb.Clone();
            Scalar.Clear(b);
            Group.secp256k1_gej_clear(gb);
        }
    }
}