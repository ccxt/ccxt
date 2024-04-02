using System;
using Org.BouncyCastle.Pqc.Crypto.Ntru.ParameterSets;
using Org.BouncyCastle.Pqc.Crypto.Ntru.Polynomials;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.Ntru
{
    /// <summary>
    /// NTRU sampling.
    ///
    /// <seealso href="https://ntru.org/f/ntru-20190330.pdf">NTRU specification section 1.10</seealso>
    /// </summary>
    internal class NtruSampling
    {
        private readonly NtruParameterSet _parameterSet;

        internal NtruSampling(NtruParameterSet parameterSet)
        {
            _parameterSet = parameterSet;
        }

        /// <summary>
        /// Sample_fg
        /// </summary>
        /// <param name="uniformBytes">random byte array</param>
        /// <returns>a pair of polynomial <c>f</c> and <c>g</c></returns>
        /// <exception cref="ArgumentException"></exception>
        // TODO: using tuple as return value might be better but I'm not sure if it's available with the target
        // language version
        internal PolynomialPair SampleFg(byte[] uniformBytes)
        {
            switch (_parameterSet)
            {
                case NtruHrssParameterSet _:
                {
                    var f = SampleIidPlus(Arrays.CopyOfRange(uniformBytes, 0, _parameterSet.SampleIidBytes()));
                    var g = SampleIidPlus(Arrays.CopyOfRange(uniformBytes, _parameterSet.SampleIidBytes(),
                        uniformBytes.Length));
                    return new PolynomialPair(f, g);
                }
                case NtruHpsParameterSet _:
                {
                    var f = (HpsPolynomial)SampleIid(
                        Arrays.CopyOfRange(uniformBytes, 0, _parameterSet.SampleIidBytes()));
                    var g = SampleFixedType(Arrays.CopyOfRange(uniformBytes, _parameterSet.SampleIidBytes(),
                        uniformBytes.Length));
                    return new PolynomialPair(f, g);
                }
                default:
                    throw new ArgumentException("Invalid polynomial type");
            }
        }

        /// <summary>
        /// Sample_rm
        /// </summary>
        /// <param name="uniformBytes">random byte array</param>
        /// <returns>a pair of polynomial <c>r</c> and <c>m</c></returns>
        /// <exception cref="ArgumentException"></exception>
        internal PolynomialPair SampleRm(byte[] uniformBytes)
        {
            switch (_parameterSet)
            {
                case NtruHrssParameterSet _:
                {
                    var r = (HrssPolynomial)SampleIid(Arrays.CopyOfRange(uniformBytes, 0,
                        _parameterSet.SampleIidBytes()));
                    var m = (HrssPolynomial)SampleIid(Arrays.CopyOfRange(uniformBytes, _parameterSet.SampleIidBytes(),
                        uniformBytes.Length));
                    return new PolynomialPair(r, m);
                }
                case NtruHpsParameterSet _:
                {
                    var r = (HpsPolynomial)SampleIid(
                        Arrays.CopyOfRange(uniformBytes, 0, _parameterSet.SampleIidBytes()));
                    var m = SampleFixedType(Arrays.CopyOfRange(uniformBytes, _parameterSet.SampleIidBytes(),
                        uniformBytes.Length));
                    return new PolynomialPair(r, m);
                }
                default:
                    throw new ArgumentException("Invalid polynomial type");
            }
        }

        /// <summary>
        /// Ternary
        /// </summary>
        /// <param name="uniformBytes">random byte array</param>
        /// <returns>A ternary polynomial</returns>
        internal Polynomial SampleIid(byte[] uniformBytes)
        {
            var r = _parameterSet.CreatePolynomial();
            for (var i = 0; i < _parameterSet.N - 1; i++)
            {
                r.coeffs[i] = (ushort)Mod3(uniformBytes[i]);
            }

            r.coeffs[_parameterSet.N - 1] = 0;
            return r;
        }

        /// <summary>
        /// Fixed_Type
        /// </summary>
        /// <param name="uniformBytes">random byte array</param>
        /// <returns>a ternary polynomial with exactly q/16 − 1 coefficients equal to 1 and q/16 − 1 coefficient equal to −1</returns>
        internal HpsPolynomial SampleFixedType(byte[] uniformBytes)
        {
            var n = _parameterSet.N;
            var weight = ((NtruHpsParameterSet)_parameterSet).Weight();
            var r = (HpsPolynomial)_parameterSet.CreatePolynomial();
            var s = new int[n - 1];
            int i;

            for (i = 0; i < (n - 1) / 4; i++)
            {
                s[4 * i + 0] = (uniformBytes[15 * i + 0] << 2) + (uniformBytes[15 * i + 1] << 10) +
                               (uniformBytes[15 * i + 2] << 18) + (uniformBytes[15 * i + 3] << 26);
                s[4 * i + 1] = ((uniformBytes[15 * i + 3] & 0xc0) >> 4) + (uniformBytes[15 * i + 4] << 4) +
                               (uniformBytes[15 * i + 5] << 12) + (uniformBytes[15 * i + 6] << 20) +
                               (uniformBytes[15 * i + 7] << 28);
                s[4 * i + 2] = ((uniformBytes[15 * i + 7] & 0xf0) >> 2) + (uniformBytes[15 * i + 8] << 6) +
                               (uniformBytes[15 * i + 9] << 14) + (uniformBytes[15 * i + 10] << 22) +
                               (uniformBytes[15 * i + 11] << 30);
                s[4 * i + 3] = (uniformBytes[15 * i + 11] & 0xfc) + (uniformBytes[15 * i + 12] << 8) +
                               (uniformBytes[15 * i + 13] << 16) + (uniformBytes[15 * i + 14] << 24);
            }

            // (N-1) = 2 mod 4
            if (n - 1 > (n - 1) / 4 * 4)
            {
                i = (n - 1) / 4;
                s[4 * i + 0] = (uniformBytes[15 * i + 0] << 2) + (uniformBytes[15 * i + 1] << 10) +
                               (uniformBytes[15 * i + 2] << 18) + (uniformBytes[15 * i + 3] << 26);
                s[4 * i + 1] = ((uniformBytes[15 * i + 3] & 0xc0) >> 4) + (uniformBytes[15 * i + 4] << 4) +
                               (uniformBytes[15 * i + 5] << 12) + (uniformBytes[15 * i + 6] << 20) +
                               (uniformBytes[15 * i + 7] << 28);
            }

            for (i = 0; i < weight / 2; i++)
            {
                s[i] |= 1;
            }

            for (i = weight / 2; i < weight; i++)
            {
                s[i] |= 2;
            }

            Array.Sort(s);

            for (i = 0; i < n - 1; i++)
            {
                r.coeffs[i] = (ushort)(s[i] & 3);
            }

            r.coeffs[n - 1] = 0;
            return r;
        }

        /// <summary>
        /// Ternary_Plus
        /// </summary>
        /// <param name="uniformBytes">random byte array</param>
        /// <returns>a ternary polynomial that satisfies the non-negative correlation property</returns>
        internal HrssPolynomial SampleIidPlus(byte[] uniformBytes)
        {
            var n = _parameterSet.N;
            int i;
            ushort s = 0;
            var r = (HrssPolynomial)SampleIid(uniformBytes);

            /* Map {0,1,2} -> {0, 1, 2^16 - 1} */
            for (i = 0; i < n - 1; i++)
            {
                r.coeffs[i] = (ushort)(r.coeffs[i] | -(r.coeffs[i] >> 1));
            }

            /* s = <x*r, r>.  (r[n-1] = 0) */
            for (i = 0; i < n - 1; i++)
            {
                s += (ushort)((uint)r.coeffs[i + 1] * r.coeffs[i]);
            }

            /* Extract sign of s (sign(0) = 1) */
            s = (ushort)(1 | -(s >> 15));

            for (i = 0; i < n - 1; i += 2)
            {
                r.coeffs[i] = (ushort)((uint)s * r.coeffs[i]);
            }

            /* Map {0,1,2^16-1} -> {0, 1, 2} */
            for (i = 0; i < n - 1; i++)
            {
                r.coeffs[i] = (ushort)(3 & (r.coeffs[i] ^ (r.coeffs[i] >> 15)));
            }

            return r;
        }

        private static int Mod3(int a)
        {
            return a % 3;
        }
    }
}