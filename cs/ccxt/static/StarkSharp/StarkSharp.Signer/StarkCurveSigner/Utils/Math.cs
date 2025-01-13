using System;
using System.Numerics;
using System.Collections.Generic;
using BouncyBigInt = Org.BouncyCastle.Math.BigInteger;

namespace StarkSharp.StarkCurve.Utils
{
    // (ref: https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/crypto/signature/math_utils.py)
    public static class MathUtils
    {
        // A type that represents a point (x,y) on an elliptic curve.
        public struct ECPoint
        {
            public BigInteger X { get; }
            public BigInteger Y { get; }

            public ECPoint(BigInteger x, BigInteger y)
            {
                this.X = x;
                this.Y = y;
            }
        }

        public static string PiAsString(int digits)
        {
            throw new NotImplementedException();
        }

        // (ref: https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/crypto/signature/math_utils.py#L36)
        public static bool IsQuadResidue(BigInteger n, BigInteger p)
        {
            // This uses Euler's criterion, which states that 'n' is a quadratic residue mod 'p' if and only if n^((p-1)/2) (mod p) == 1.
            if (p == 2)
            {
                return true; // Every integer is a quadratic residue modulo 2
            }
            else
            {
                BigInteger exponent = (p - 1) / 2;
                BigInteger result = BigInteger.ModPow(n, exponent, p);
                return result == 1;
            }
        }

        // Modular square root using Tonelli-Shanks algorithm
        // (ref: https://en.wikipedia.org/wiki/Tonelli%E2%80%93Shanks_algorithm)
        // TODO: Audit this code
        public static BigInteger SqrtMod(BigInteger n, BigInteger p)
        {
            // Check if n is a quadratic residue. If n is not a quadratic residue, then there is no solution.
            if (!IsQuadResidue(n, p))
            {
                throw new ArithmeticException("the square root does not exist");
            }

            // Expressing p - 1 as s * 2^e, where s is odd
            BigInteger s = p - 1;
            int e = 0;
            while (s % 2 == 0)
            {
                s /= 2;
                e++;
            }

            // Finding the smallest q such that q^((p - 1) / 2) = p - 1 (mod p)
            BigInteger q = 2;
            while (BigInteger.ModPow(q, (p - 1) / 2, p) != p - 1)
            {
                q++;
            }

            BigInteger x = BigInteger.ModPow(n, (s + 1) / 2, p);
            BigInteger b = BigInteger.ModPow(n, s, p);
            BigInteger g = BigInteger.ModPow(q, s, p);
            int r = e;

            while (true)
            {
                BigInteger t = b;
                int m = 0;
                for (; m < r; m++)
                {
                    if (t == 1) break;
                    t = BigInteger.ModPow(t, 2, p);
                }

                if (m == 0) return x;

                BigInteger gs = BigInteger.ModPow(g, BigInteger.Pow(2, r - m - 1), p);
                g = BigInteger.ModPow(gs, 2, p);
                x = (x * gs) % p;
                b = (b * g) % p;

                r = m;
            }
        }

        // Finds a nonnegative integer 0 <= x < p such that (m * x) % p == n
        public static BigInteger DivMod(BigInteger n, BigInteger m, BigInteger p)
        {
            BigInteger mInverse = BigInteger.ModPow(m, p - 2, p);
            BigInteger r = (n * mInverse) % p;
            return r;
        }

        public static ECPoint ECAdd(ECPoint point1, ECPoint point2, BigInteger p)
        {
            if ((point1.X - point2.X) % p == 0)
                throw new InvalidOperationException("Points must have different x coordinates.");

            var m = DivMod(point1.Y - point2.Y, point1.X - point2.X, p);
            var x = (m * m - point1.X - point2.X) % p;
            var y = (m * (point1.X - x) - point1.Y) % p;

            // Adjust the x-coordinate if it's negative.
            if (x < 0)
            {
                x += p;
            }

            // Adjust the y-coordinate if it's negative.
            if (y < 0)
            {
                y += p;
            }

            return new ECPoint(x, y);
        }

        public static ECPoint ECNeg(ECPoint point, BigInteger p)
        {
            return new ECPoint(point.X, (-point.Y) % p);
        }

        public static ECPoint ECDouble(ECPoint point, BigInteger alpha, BigInteger p)
        {
            if (point.Y % p == 0)
                throw new InvalidOperationException("Point y coordinate cannot be zero.");

            var m = DivMod(3 * point.X * point.X + alpha, 2 * point.Y, p);
            var x = (m * m - 2 * point.X) % p;
            var y = (m * (point.X - x) - point.Y) % p;

            return new ECPoint(x, y);
        }

        public static ECPoint ECMult(BigInteger m, ECPoint point, BigInteger alpha, BigInteger p)
        {
            if (m == 1)
                return point;

            if (m % 2 == 0)
            {
                return ECMult(m / 2, ECDouble(point, alpha, p), alpha, p);
            }

            return ECAdd(ECMult(m - 1, point, alpha, p), point, p);
        }
    }
}