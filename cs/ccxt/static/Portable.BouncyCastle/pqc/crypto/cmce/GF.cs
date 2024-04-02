using System;

namespace Org.BouncyCastle.Pqc.Crypto.Cmce
{
    abstract class GF
    {
        protected int GFBITS;
        protected int GFMASK; //  = ((1 << GFBITS) - 1);

        public GF(int gfbits)
        {
            GFBITS = gfbits;
            GFMASK = ((1 << GFBITS) - 1);

        }

        internal ushort GFIsZero(ushort a)
        {
            int t = a;

            t -= 1;
            t >>= 19;

            return (ushort) t;
        }

        internal ushort GFAdd(ushort left, ushort right)
        {
            return (ushort) (left ^ right);
        }

        public abstract ushort GFMul(ushort left, ushort right);
        internal abstract protected ushort GFFrac(ushort den, ushort num);
        internal abstract protected ushort GFInv(ushort input);

    }

    class GF12
        : GF
    {
        
        public GF12(int gfbits)
            :base(gfbits)
        {
        }

        public override ushort GFMul(ushort left, ushort right)
        {
            int temp, temp_left, temp_right, t;
            temp_left = left;
            temp_right = right;
            temp = temp_left * (temp_right & 1);

            for (int i = 1; i < GFBITS; i++)
            {
                temp ^= (temp_left * (temp_right & (1<<i)));
            }

            t = (temp & 0x7FC000);
            temp ^= t >> 9;
            temp ^= t >> 12;

            t = (temp & 0x3000);
            temp ^= t >> 9;
            temp ^= t >> 12;

            ushort res = (ushort) ( temp & ((1 << GFBITS)-1));
            return res;

        }

        protected ushort GFSq(ushort input)
        {
            int[] B = {0x55555555, 0x33333333, 0x0F0F0F0F, 0x00FF00FF};
            int x = input;
            int t;

            x = (x | (x << 8)) & B[3];
            x = (x | (x << 4)) & B[2];
            x = (x | (x << 2)) & B[1];
            x = (x | (x << 1)) & B[0];

            t = x & 0x7FC000;

            x ^= t >> 9;
            x ^= t >> 12;

            t = x & 0x3000;

            x ^= t >> 9;
            x ^= t >> 12;

            return (ushort) (x & ((1 << GFBITS)-1));
        }

        protected internal override ushort GFInv(ushort input)
        {
            ushort tmp_11;
            ushort tmp_1111;

            ushort output = input;

            output = GFSq(output);
            tmp_11 = GFMul(output, input); // 11

            output = GFSq(tmp_11);
            output = GFSq(output);
            tmp_1111 = GFMul(output, tmp_11); // 1111

            output = GFSq(tmp_1111);
            output = GFSq(output);
            output = GFSq(output);
            output = GFSq(output);
            output = GFMul(output, tmp_1111); // 11111111

            output = GFSq(output);
            output = GFSq(output);
            output = GFMul(output, tmp_11); // 1111111111

            output = GFSq(output);
            output = GFMul(output, input); // 11111111111

            return GFSq(output); // 111111111110
        }

        protected internal override ushort GFFrac(ushort den, ushort num)
        {
            return GFMul(GFInv(den), num);
        }

    }

    class GF13
        : GF
    {
        public GF13(int gfbits)
    	    :base(gfbits)
        {
        }

        public override ushort GFMul(ushort in0, ushort in1)
        {
            int i;

            long tmp;
            long t0;
            long t1;
            long t;

            t0 = in0;
            t1 = in1;

            tmp = t0 * (t1 & 1);

            for (i = 1; i < GFBITS; i++)
                tmp ^= (t0 * (t1 & (1 << i)));

            //

            t = tmp & 0x1FF0000L;
            tmp ^= (t >> 9) ^ (t >> 10) ^ (t >> 12) ^ (t >> 13);

            t = tmp & 0x000E000L;
            tmp ^= (t >> 9) ^ (t >> 10) ^ (t >> 12) ^ (t >> 13);

            return (ushort) (tmp & GFMASK);
        }

        /* input: field element in */
        /* return: (in^2)^2 */
        protected ushort GFSq2(ushort input)
        {
            int i;

            long[] B = {0x1111111111111111L,
                        0x0303030303030303L,
                        0x000F000F000F000FL,
                        0x000000FF000000FFL};

            long[] M = {0x0001FF0000000000L,
                        0x000000FF80000000L,
                        0x000000007FC00000L,
                        0x00000000003FE000L};

            long x = input;
            long t;

            x = (x | (x << 24)) & B[3];
            x = (x | (x << 12)) & B[2];
            x = (x | (x << 6)) & B[1];
            x = (x | (x << 3)) & B[0];

            for (i = 0; i < 4; i++)
            {
                t = x & M[i];
                x ^= (t >> 9) ^ (t >> 10) ^ (t >> 12) ^ (t >> 13);
            }

            return (ushort) (x & GFMASK);
        }

        /* input: field element in, m */
        /* return: (in^2)*m */
        private ushort GFSqMul(ushort input, ushort m)
        {
            int i;

            long x;
            long t0;
            long t1;
            long t;

            long[] M = {0x0000001FF0000000L,
                        0x000000000FF80000L,
                        0x000000000007E000L};

            t0 = input;
            t1 = m;

            x = (t1 << 6) * (t0 & (1 << 6));

            t0 ^= (t0 << 7);

            x ^= (t1 * (t0 & (0x04001)));
            x ^= (t1 * (t0 & (0x08002))) << 1;
            x ^= (t1 * (t0 & (0x10004))) << 2;
            x ^= (t1 * (t0 & (0x20008))) << 3;
            x ^= (t1 * (t0 & (0x40010))) << 4;
            x ^= (t1 * (t0 & (0x80020))) << 5;

            for (i = 0; i < 3; i++)
            {
                t = x & M[i];
                x ^= (t >> 9) ^ (t >> 10) ^ (t >> 12) ^ (t >> 13);
            }

            return (ushort) (x & GFMASK);
        }

        /* input: field element in, m */
        /* return: ((in^2)^2)*m */
        private ushort GFSq2Mul(ushort input, ushort m)
        {
            int i;

            long x;
            long t0;
            long t1;
            long t;

            long[] M = {0x1FF0000000000000L,
                        0x000FF80000000000L,
                        0x000007FC00000000L,
                        0x00000003FE000000L,
                        0x0000000001FE0000L,
                        0x000000000001E000L};

            t0 = input;
            t1 = m;

            x = (t1 << 18) * (t0 & (1 << 6));

            t0 ^= (t0 << 21);

            x ^= (t1 * (t0 & (0x010000001L)));
            x ^= (t1 * (t0 & (0x020000002L))) << 3;
            x ^= (t1 * (t0 & (0x040000004L))) << 6;
            x ^= (t1 * (t0 & (0x080000008L))) << 9;
            x ^= (t1 * (t0 & (0x100000010L))) << 12;
            x ^= (t1 * (t0 & (0x200000020L))) << 15;

            for (i = 0; i < 6; i++)
            {
                t = x & M[i];
                x ^= (t >> 9) ^ (t >> 10) ^ (t >> 12) ^ (t >> 13);
            }

            return (ushort) (x & GFMASK);
        }

        /* input: field element den, num */
        /* return: (num/den) */
        protected internal override ushort GFFrac(ushort den, ushort num)
        {
            ushort tmp_11, tmp_1111, output;

            tmp_11 = GFSqMul(den, den); // ^11
            tmp_1111 = GFSq2Mul(tmp_11, tmp_11); // ^1111
            output = GFSq2(tmp_1111);
            output = GFSq2Mul(output, tmp_1111); // ^11111111
            output = GFSq2(output);
            output = GFSq2Mul(output, tmp_1111); // ^111111111111

            return GFSqMul(output, num); // ^1111111111110 = ^-1
        }

        protected internal override ushort GFInv(ushort den)
        {
            return GFFrac(den, ((ushort) 1));
        }
    }
}
