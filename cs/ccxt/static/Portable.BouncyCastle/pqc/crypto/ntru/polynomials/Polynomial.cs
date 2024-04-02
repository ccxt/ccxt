using Org.BouncyCastle.Pqc.Crypto.Ntru.ParameterSets;

namespace Org.BouncyCastle.Pqc.Crypto.Ntru.Polynomials
{
    internal abstract class Polynomial
    {
        internal ushort[] coeffs;
        private protected readonly NtruParameterSet ParameterSet;

        internal Polynomial(NtruParameterSet parameterSet)
        {
            coeffs = new ushort[parameterSet.N];
            ParameterSet = parameterSet;
        }

        internal static short BothNegativeMask(short x, short y)
        {
            return (short)((x & y) >> 15);
        }

        internal static ushort Mod3(ushort a)
        {
            // return (ushort)(a % 3);
            return Mod(a, 3);
        }

        internal static byte Mod3(byte a)
        {
            // return (byte)(a % 3);
            return (byte)Mod(a, 3);
        }

        // Returns a uint since the reference implementation is a define instead of a normal function
        internal static uint ModQ(uint x, uint q)
        {
            // return x % q;
            return Mod(x, q);
        }

        // Defined in: poly_mod.c
        internal void Mod3PhiN()
        {
            int n = ParameterSet.N;
            for (int i = 0; i < n; i++)
            {
                coeffs[i] = Mod3((ushort)(coeffs[i] + 2 * coeffs[n - 1]));
            }
        }

        internal void ModQPhiN()
        {
            int n = ParameterSet.N;
            for (int i = 0; i < n; i++)
            {
                coeffs[i] = (ushort)(coeffs[i] - coeffs[n - 1]);
            }
        }

        internal static ushort Mod(double a, double b)
        {
            return (ushort)(a - b * System.Math.Floor(a / b));
        }

        // Pack Sq polynomial as a byte array
        public abstract byte[] SqToBytes(int len);

        // Unpack a Sq polynomial
        public abstract void SqFromBytes(byte[] a);

        // Pack a Rq0 polynomial as a byte array
        public byte[] RqSumZeroToBytes(int len)
        {
            return SqToBytes(len);
        }

        // Unpack a Rq0 polynomial 
        public void RqSumZeroFromBytes(byte[] a)
        {
            int n = coeffs.Length;

            SqFromBytes(a);
            coeffs[n - 1] = 0;
            for (int i = 0; i < ParameterSet.PackDegree(); i++)
            {
                coeffs[n - 1] -= coeffs[i];
            }
        }

        // Pack an S3 polynomial as a byte array
        public byte[] S3ToBytes(int messageSize)
        {
            byte[] msg = new byte[messageSize];
            byte c;

            for (int i = 0; i < ParameterSet.PackDegree() / 5; i++)
            {
                c = (byte)(coeffs[5 * i + 4] & 255);
                c = (byte)(3 * c + coeffs[5 * i + 3] & 255);
                c = (byte)(3 * c + coeffs[5 * i + 2] & 255);
                c = (byte)(3 * c + coeffs[5 * i + 1] & 255);
                c = (byte)(3 * c + coeffs[5 * i + 0] & 255);
                msg[i] = c;
            }

            if (ParameterSet.PackDegree() > (ParameterSet.PackDegree() / 5) * 5)
            {
                int i = ParameterSet.PackDegree() / 5;
                c = 0;

                for (int j = ParameterSet.PackDegree() - (5 * i) - 1; j >= 0; j--)
                {
                    c = (byte)(3 * c + coeffs[5 * i + j] & 255);
                }

                msg[i] = c;
            }

            return msg;
        }

        // Unpack an S3 polynomial
        public void S3FromBytes(byte[] msg)
        {
            int n = coeffs.Length;
            byte c;

            for (int i = 0; i < ParameterSet.PackDegree() / 5; i++)
            {
                c = msg[i];
                coeffs[5 * i + 0] = c;
                coeffs[5 * i + 1] = (ushort)(c * 171 >> 9);
                coeffs[5 * i + 2] = (ushort)(c * 57 >> 9);
                coeffs[5 * i + 3] = (ushort)(c * 19 >> 9);
                coeffs[5 * i + 4] = (ushort)(c * 203 >> 14);
            }

            if (ParameterSet.PackDegree() > (ParameterSet.PackDegree() / 5) * 5)
            {
                int i = ParameterSet.PackDegree() / 5;
                c = msg[i];
                for (int j = 0; (5 * i + j) < ParameterSet.PackDegree(); j++)
                {
                    coeffs[5 * i + j] = c;
                    c = (byte)(c * 171 >> 9);
                }
            }

            coeffs[n - 1] = 0;
            Mod3PhiN();
        }

        // Defined in: poly_rq_mul.c
        public void RqMul(Polynomial a, Polynomial b)
        {
            int n = coeffs.Length;
            int k, i;

            for (k = 0; k < n; k++)
            {
                coeffs[k] = 0;
                for (i = 1; i < n - k; i++)
                {
                    coeffs[k] += (ushort)(a.coeffs[k + i] * b.coeffs[n - i]);
                }

                for (i = 0; i < k + 1; i++)
                {
                    coeffs[k] += (ushort)(a.coeffs[k - i] * b.coeffs[i]);
                }
            }
        }


        // Defined in: poly.c
        public void SqMul(Polynomial a, Polynomial b)
        {
            RqMul(a, b);
            ModQPhiN();
        }


        // Defined in: 
        public void S3Mul(Polynomial a, Polynomial b)
        {
            RqMul(a, b);
            Mod3PhiN();
        }

        public abstract void Lift(Polynomial a);

        public void RqToS3(Polynomial a)
        {
            int n = coeffs.Length;
            ushort flag;

            for (int i = 0; i < n; i++)
            {
                coeffs[i] = (ushort)ModQ(a.coeffs[i], (uint)ParameterSet.Q());
                //Console.Write(a.coeffs[i].ToString("X2"));
                flag = (ushort)(coeffs[i] >> ParameterSet.LogQ - 1);
                coeffs[i] += (ushort)(flag << (1 - (ParameterSet.LogQ & 1)));
            }
            //Console.WriteLine();

            Mod3PhiN();
        }

        public abstract void R2Inv(Polynomial a);

        internal void R2Inv(Polynomial a, Polynomial f, Polynomial g, Polynomial v, Polynomial w)
        {
            int n = coeffs.Length;
            int i, loop;
            short delta, sign, swap, t;

            w.coeffs[0] = 1;

            for (i = 0; i < n; ++i)
            {
                f.coeffs[i] = 1;
            }

            for (i = 0; i < n - 1; ++i)
            {
                g.coeffs[n - 2 - i] = (ushort)((a.coeffs[i] ^ a.coeffs[n - 1]) & 1);
            }

            g.coeffs[n - 1] = 0;

            delta = 1;

            for (loop = 0; loop < 2 * (n - 1) - 1; ++loop)
            {
                for (i = n - 1; i > 0; --i)
                {
                    v.coeffs[i] = v.coeffs[i - 1];
                }

                v.coeffs[0] = 0;

                sign = (short)(g.coeffs[0] & f.coeffs[0]);
                swap = BothNegativeMask((short)-delta, (short)-g.coeffs[0]);
                delta ^= (short)(swap & (delta ^ -delta));
                delta++;

                for (i = 0; i < n; ++i)
                {
                    t = (short)(swap & (f.coeffs[i] ^ g.coeffs[i]));
                    f.coeffs[i] ^= (ushort)t;
                    g.coeffs[i] ^= (ushort)t;
                    t = (short)(swap & (v.coeffs[i] ^ w.coeffs[i]));
                    v.coeffs[i] ^= (ushort)t;
                    w.coeffs[i] ^= (ushort)t;
                }

                for (i = 0; i < n; ++i)
                {
                    g.coeffs[i] = (ushort)(g.coeffs[i] ^ (sign & f.coeffs[i]));
                }

                for (i = 0; i < n; ++i)
                {
                    w.coeffs[i] = (ushort)(w.coeffs[i] ^ (sign & v.coeffs[i]));
                }

                for (i = 0; i < n - 1; ++i)
                {
                    g.coeffs[i] = g.coeffs[i + 1];
                }

                g.coeffs[n - 1] = 0;
            }

            for (i = 0; i < n - 1; ++i)
            {
                coeffs[i] = v.coeffs[n - 2 - i];
            }

            coeffs[n - 1] = 0;
        }

        public abstract void RqInv(Polynomial a);

        internal void RqInv(Polynomial a, Polynomial ai2, Polynomial b, Polynomial c, Polynomial s)
        {
            ai2.R2Inv(a);
            R2InvToRqInv(ai2, a, b, c, s);
        }

        private void R2InvToRqInv(Polynomial ai, Polynomial a, Polynomial b, Polynomial c, Polynomial s)
        {
            int n = coeffs.Length;
            int i;

            for (i = 0; i < n; i++)
            {
                b.coeffs[i] = (ushort)-a.coeffs[i];
            }

            for (i = 0; i < n; i++)
            {
                coeffs[i] = ai.coeffs[i];
            }

            c.RqMul(this, b);
            c.coeffs[0] += 2;
            s.RqMul(c, this);

            c.RqMul(s, b);
            c.coeffs[0] += 2;
            RqMul(c, s);

            c.RqMul(this, b);
            c.coeffs[0] += 2;
            s.RqMul(c, this);

            c.RqMul(s, b);
            c.coeffs[0] += 2;
            RqMul(c, s);
        }


        public abstract void S3Inv(Polynomial a);

        internal void S3Inv(Polynomial a, Polynomial f, Polynomial g, Polynomial v, Polynomial w)
        {
            int n = coeffs.Length;
            int i, loop;
            short delta, sign, swap, t;

            w.coeffs[0] = 1;

            for (i = 0; i < n; ++i)
            {
                f.coeffs[i] = 1;
            }

            for (i = 0; i < n - 1; ++i)
            {
                g.coeffs[n - 2 - i] = Mod3((ushort)((a.coeffs[i] & 3) + 2 * (a.coeffs[n - 1] & 3)));
            }

            g.coeffs[n - 1] = 0;

            delta = 1;

            for (loop = 0; loop < 2 * (n - 1) - 1; ++loop)
            {
                for (i = n - 1; i > 0; --i)
                {
                    v.coeffs[i] = v.coeffs[i - 1];
                }

                v.coeffs[0] = 0;

                sign = Mod3((byte)(2 * g.coeffs[0] * f.coeffs[0]));
                swap = BothNegativeMask((short)-delta, (short)-g.coeffs[0]);
                delta ^= (short)(swap & (delta ^ -delta));
                delta++;

                for (i = 0; i < n; ++i)
                {
                    t = (short)(swap & (f.coeffs[i] ^ g.coeffs[i]));
                    f.coeffs[i] ^= (ushort)t;
                    g.coeffs[i] ^= (ushort)t;
                    t = (short)(swap & (v.coeffs[i] ^ w.coeffs[i]));
                    v.coeffs[i] ^= (ushort)t;
                    w.coeffs[i] ^= (ushort)t;
                }

                for (i = 0; i < n; ++i)
                {
                    g.coeffs[i] = Mod3((byte)(g.coeffs[i] + sign * f.coeffs[i]));
                }

                for (i = 0; i < n; ++i)
                {
                    w.coeffs[i] = Mod3((byte)(w.coeffs[i] + sign * v.coeffs[i]));
                }

                for (i = 0; i < n - 1; ++i)
                {
                    g.coeffs[i] = g.coeffs[i + 1];
                }

                g.coeffs[n - 1] = 0;
            }

            sign = (short)f.coeffs[0];
            for (i = 0; i < n - 1; ++i)
            {
                coeffs[i] = Mod3((byte)(sign * v.coeffs[n - 2 - i]));
            }

            coeffs[n - 1] = 0;
        }

        public void Z3ToZq()
        {
            int n = coeffs.Length;
            for (int i = 0; i < n; i++)
            {
                coeffs[i] = (ushort)(coeffs[i] | (-(coeffs[i] >> 1) & (ParameterSet.Q() - 1)));
            }
        }

        public void TrinaryZqToZ3()
        {
            int n = coeffs.Length;
            for (int i = 0; i < n; i++)
            {
                coeffs[i] = (ushort)ModQ((uint)(coeffs[i] & 0xffff), (uint)ParameterSet.Q());
                coeffs[i] = (ushort)(3 & (coeffs[i] ^ (coeffs[i] >> (ParameterSet.LogQ - 1))));
            }
        }
    }
}