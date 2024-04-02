using System;

namespace Org.BouncyCastle.Pqc.Crypto.Falcon
{
    class SamplerZ
    {
        FalconRNG p;
        FalconFPR sigma_min;
        FPREngine fpre;

        internal SamplerZ(FalconRNG p, FalconFPR sigma_min, FPREngine fpre) {
            this.p = p;
            this.sigma_min = sigma_min;
            this.fpre = fpre;
        }

        internal int Sample(FalconFPR mu, FalconFPR isigma) {
            return this.sampler(mu, isigma);
        }

        /*
        * Sample an integer value along a half-gaussian distribution centered
        * on zero and standard deviation 1.8205, with a precision of 72 bits.
        */
        int gaussian0_sampler(FalconRNG p)
        {

            uint[] dist = {
                10745844u,  3068844u,  3741698u,
                5559083u,  1580863u,  8248194u,
                2260429u, 13669192u,  2736639u,
                708981u,  4421575u, 10046180u,
                169348u,  7122675u,  4136815u,
                30538u, 13063405u,  7650655u,
                    4132u, 14505003u,  7826148u,
                    417u, 16768101u, 11363290u,
                    31u,  8444042u,  8086568u,
                    1u, 12844466u,   265321u,
                    0u,  1232676u, 13644283u,
                    0u,    38047u,  9111839u,
                    0u,      870u,  6138264u,
                    0u,       14u, 12545723u,
                    0u,        0u,  3104126u,
                    0u,        0u,    28824u,
                    0u,        0u,      198u,
                    0u,        0u,        1u
            };

            uint v0, v1, v2, hi;
            ulong lo;
            int u;
            int z;

            /*
            * Get a random 72-bit value, into three 24-bit limbs v0..v2.
            */
            lo = p.prng_get_u64();
            hi = p.prng_get_u8();
            v0 = (uint)lo & 0xFFFFFF;
            v1 = (uint)(lo >> 24) & 0xFFFFFF;
            v2 = (uint)(lo >> 48) | (hi << 16);

            /*
            * Sampled value is z, such that v0..v2 is lower than the first
            * z elements of the table.
            */
            z = 0;
            for (u = 0; u < dist.Length; u += 3) {
                uint w0, w1, w2, cc;

                w0 = dist[u + 2];
                w1 = dist[u + 1];
                w2 = dist[u + 0];
                cc = (v0 - w0) >> 31;
                cc = (v1 - w1 - cc) >> 31;
                cc = (v2 - w2 - cc) >> 31;
                z += (int)cc;
            }
            return z;

        }

        /*
        * Sample a bit with probability exp(-x) for some x >= 0.
        */
        int BerExp(FalconRNG p, FalconFPR x, FalconFPR ccs)
        {
            int s, i;
            FalconFPR r;
            uint sw, w;
            ulong z;

            /*
            * Reduce x modulo log(2): x = s*log(2) + r, with s an integer,
            * and 0 <= r < log(2). Since x >= 0, we can use this.fpre.fpr_trunc().
            */
            s = (int)this.fpre.fpr_trunc(this.fpre.fpr_mul(x, this.fpre.fpr_inv_log2));
            r = this.fpre.fpr_sub(x, this.fpre.fpr_mul(this.fpre.fpr_of(s), this.fpre.fpr_log2));

            /*
            * It may happen (quite rarely) that s >= 64; if sigma = 1.2
            * (the minimum value for sigma), r = 0 and b = 1, then we get
            * s >= 64 if the half-Gaussian produced a z >= 13, which happens
            * with probability about 0.000000000230383991, which is
            * approximatively equal to 2^(-32). In any case, if s >= 64,
            * then BerExp will be non-zero with probability less than
            * 2^(-64), so we can simply saturate s at 63.
            */
            sw = (uint)s;
            sw ^= (uint)((sw ^ 63) & -((63 - sw) >> 31));
            s = (int)sw;

            /*
            * Compute exp(-r); we know that 0 <= r < log(2) at this point, so
            * we can use this.fpre.fpr_expm_p63(), which yields a result scaled to 2^63.
            * We scale it up to 2^64, then right-shift it by s bits because
            * we really want exp(-x) = 2^(-s)*exp(-r).
            *
            * The "-1" operation makes sure that the value fits on 64 bits
            * (i.e. if r = 0, we may get 2^64, and we prefer 2^64-1 in that
            * case). The bias is negligible since this.fpre.fpr_expm_p63() only computes
            * with 51 bits of precision or so.
            */
            z = ((this.fpre.fpr_expm_p63(r, ccs) << 1) - 1) >> s;

            /*
            * Sample a bit with probability exp(-x). Since x = s*log(2) + r,
            * exp(-x) = 2^-s * exp(-r), we compare lazily exp(-x) with the
            * PRNG output to limit its consumption, the sign of the difference
            * yields the expected result.
            */
            i = 64;
            do {
                i -= 8;
                w = p.prng_get_u8() - ((uint)(z >> i) & 0xFF);
            } while (w == 0 && i > 0);
            return (int)(w >> 31);
        }

        /*
        * The sampler produces a random integer that follows a discrete Gaussian
        * distribution, centered on mu, and with standard deviation sigma. The
        * provided parameter isigma is equal to 1/sigma.
        *
        * The value of sigma MUST lie between 1 and 2 (i.e. isigma lies between
        * 0.5 and 1); in Falcon, sigma should always be between 1.2 and 1.9.
        */
        int sampler(FalconFPR mu, FalconFPR isigma)
        {
            int s;
            FalconFPR r, dss, ccs;

            /*
            * Center is mu. We compute mu = s + r where s is an integer
            * and 0 <= r < 1.
            */
            s = (int)this.fpre.fpr_floor(mu);
            r = this.fpre.fpr_sub(mu, this.fpre.fpr_of(s));

            /*
            * dss = 1/(2*sigma^2) = 0.5*(isigma^2).
            */
            dss = this.fpre.fpr_half(this.fpre.fpr_sqr(isigma));

            /*
            * ccs = sigma_min / sigma = sigma_min * isigma.
            */
            ccs = this.fpre.fpr_mul(isigma, this.sigma_min);

            /*
            * We now need to sample on center r.
            */
            for (;;) {
                int z0, z, b;
                FalconFPR x;

                /*
                * Sample z for a Gaussian distribution. Then get a
                * random bit b to turn the sampling into a bimodal
                * distribution: if b = 1, we use z+1, otherwise we
                * use -z. We thus have two situations:
                *
                *  - b = 1: z >= 1 and sampled against a Gaussian
                *    centered on 1.
                *  - b = 0: z <= 0 and sampled against a Gaussian
                *    centered on 0.
                */
                z0 = gaussian0_sampler(this.p);
                b = (int)this.p.prng_get_u8() & 1;
                z = b + ((b << 1) - 1) * z0;

                /*
                * Rejection sampling. We want a Gaussian centered on r;
                * but we sampled against a Gaussian centered on b (0 or
                * 1). But we know that z is always in the range where
                * our sampling distribution is greater than the Gaussian
                * distribution, so rejection works.
                *
                * We got z with distribution:
                *    G(z) = exp(-((z-b)^2)/(2*sigma0^2))
                * We target distribution:
                *    S(z) = exp(-((z-r)^2)/(2*sigma^2))
                * Rejection sampling works by keeping the value z with
                * probability S(z)/G(z), and starting again otherwise.
                * This requires S(z) <= G(z), which is the case here.
                * Thus, we simply need to keep our z with probability:
                *    P = exp(-x)
                * where:
                *    x = ((z-r)^2)/(2*sigma^2) - ((z-b)^2)/(2*sigma0^2)
                *
                * Here, we scale up the Bernouilli distribution, which
                * makes rejection more probable, but makes rejection
                * rate sufficiently decorrelated from the Gaussian
                * center and standard deviation that the whole sampler
                * can be said to be constant-time.
                */
                x = this.fpre.fpr_mul(this.fpre.fpr_sqr(this.fpre.fpr_sub(this.fpre.fpr_of(z), r)), dss);
                x = this.fpre.fpr_sub(x, this.fpre.fpr_mul(this.fpre.fpr_of(z0 * z0), this.fpre.fpr_inv_2sqrsigma0));
                if (BerExp(this.p, x, ccs) != 0) {
                    /*
                    * Rejection sampling was centered on r, but the
                    * actual center is mu = s + r.
                    */
                    return s + z;
                }
            }
        }
    }
}
