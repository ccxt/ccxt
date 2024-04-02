using System;

using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Digests
{
	/// <remarks>
	/// <p>Implementation of RipeMD 320.</p>
	/// <p><b>Note:</b> this algorithm offers the same level of security as RipeMD160.</p>
	/// </remarks>
    public class RipeMD320Digest
		: GeneralDigest
    {
        public override string AlgorithmName
		{
			get { return "RIPEMD320"; }
		}

		public override int GetDigestSize()
		{
			return DigestLength;
		}

		private const int DigestLength = 40;

		private int H0, H1, H2, H3, H4, H5, H6, H7, H8, H9; // IV's

        private int[] X = new int[16];
        private int xOff;

        /// <summary> Standard constructor</summary>
        public RipeMD320Digest()
        {
            Reset();
        }

        /// <summary> Copy constructor.  This will copy the state of the provided
        /// message digest.
        /// </summary>
        public RipeMD320Digest(RipeMD320Digest t)
			: base(t)
        {
			CopyIn(t);
		}

		private void CopyIn(RipeMD320Digest t)
		{
			base.CopyIn(t);

            H0 = t.H0;
            H1 = t.H1;
            H2 = t.H2;
            H3 = t.H3;
            H4 = t.H4;
            H5 = t.H5;
            H6 = t.H6;
            H7 = t.H7;
            H8 = t.H8;
            H9 = t.H9;

            Array.Copy(t.X, 0, X, 0, t.X.Length);
            xOff = t.xOff;
        }

        internal override void ProcessWord(byte[] input, int inOff)
        {
            X[xOff++] = (int)Pack.LE_To_UInt32(input, inOff);

            if (xOff == 16)
            {
                ProcessBlock();
            }
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        internal override void ProcessWord(ReadOnlySpan<byte> word)
        {
            X[xOff++] = (int)Pack.LE_To_UInt32(word);

            if (xOff == 16)
            {
                ProcessBlock();
            }
        }
#endif

        internal override void ProcessLength(
            long bitLength)
        {
            if (xOff > 14)
            {
                ProcessBlock();
            }

            X[14] = (int)(bitLength & 0xffffffff);
            X[15] = (int)((ulong)bitLength >> 32);
        }

        public override int DoFinal(byte[] output, int outOff)
        {
            Finish();

            Pack.UInt32_To_LE((uint)H0, output, outOff);
            Pack.UInt32_To_LE((uint)H1, output, outOff + 4);
            Pack.UInt32_To_LE((uint)H2, output, outOff + 8);
            Pack.UInt32_To_LE((uint)H3, output, outOff + 12);
            Pack.UInt32_To_LE((uint)H4, output, outOff + 16);
            Pack.UInt32_To_LE((uint)H5, output, outOff + 20);
            Pack.UInt32_To_LE((uint)H6, output, outOff + 24);
            Pack.UInt32_To_LE((uint)H7, output, outOff + 28);
            Pack.UInt32_To_LE((uint)H8, output, outOff + 32);
            Pack.UInt32_To_LE((uint)H9, output, outOff + 36);

            Reset();

            return DigestLength;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public override int DoFinal(Span<byte> output)
        {
            Finish();

            Pack.UInt32_To_LE((uint)H0, output);
            Pack.UInt32_To_LE((uint)H1, output[4..]);
            Pack.UInt32_To_LE((uint)H2, output[8..]);
            Pack.UInt32_To_LE((uint)H3, output[12..]);
            Pack.UInt32_To_LE((uint)H4, output[16..]);
            Pack.UInt32_To_LE((uint)H5, output[20..]);
            Pack.UInt32_To_LE((uint)H6, output[24..]);
            Pack.UInt32_To_LE((uint)H7, output[28..]);
            Pack.UInt32_To_LE((uint)H8, output[32..]);
            Pack.UInt32_To_LE((uint)H9, output[36..]);

            Reset();

            return DigestLength;
        }
#endif

        /// <summary> reset the chaining variables to the IV values.</summary>
        public override void  Reset()
        {
            base.Reset();

            H0 = unchecked((int) 0x67452301);
            H1 = unchecked((int) 0xefcdab89);
            H2 = unchecked((int) 0x98badcfe);
            H3 = unchecked((int) 0x10325476);
            H4 = unchecked((int) 0xc3d2e1f0);
            H5 = unchecked((int) 0x76543210);
            H6 = unchecked((int) 0xFEDCBA98);
            H7 = unchecked((int) 0x89ABCDEF);
            H8 = unchecked((int) 0x01234567);
            H9 = unchecked((int) 0x3C2D1E0F);

            xOff = 0;

            for (int i = 0; i != X.Length; i++)
            {
                X[i] = 0;
            }
        }

        /*
        * rotate int x left n bits.
        */
        private int RL(
            int x,
            int n)
        {
            return (x << n) | (int)(((uint)x) >> (32 - n));
        }

        /*
        * f1,f2,f3,f4,f5 are the basic RipeMD160 functions.
        */

        /*
        * rounds 0-15
        */
        private int F1(int x, int y, int z)
        {
            return x ^ y ^ z;
        }

        /*
        * rounds 16-31
        */
        private int F2(int x, int y, int z)
        {
            return (x & y) | (~ x & z);
        }

        /*
        * rounds 32-47
        */
        private int F3(int x, int y, int z)
        {
            return (x | ~ y) ^ z;
        }

        /*
        * rounds 48-63
        */
        private int F4(int x, int y, int z)
        {
            return (x & z) | (y & ~ z);
        }

        /*
        * rounds 64-79
        */
        private int F5(int x, int y, int z)
        {
            return x ^ (y | ~z);
        }

        internal override void ProcessBlock()
        {
            int a, aa;
            int b, bb;
            int c, cc;
            int d, dd;
            int e, ee;
            int t;

            a = H0;
            b = H1;
            c = H2;
            d = H3;
            e = H4;
            aa = H5;
            bb = H6;
            cc = H7;
            dd = H8;
            ee = H9;

            //
            // Rounds 1 - 16
            //
            // left
            a = RL(a + F1(b, c, d) + X[0], 11) + e; c = RL(c, 10);
            e = RL(e + F1(a, b, c) + X[1], 14) + d; b = RL(b, 10);
            d = RL(d + F1(e, a, b) + X[2], 15) + c; a = RL(a, 10);
            c = RL(c + F1(d, e, a) + X[3], 12) + b; e = RL(e, 10);
            b = RL(b + F1(c, d, e) + X[4], 5) + a; d = RL(d, 10);
            a = RL(a + F1(b, c, d) + X[5], 8) + e; c = RL(c, 10);
            e = RL(e + F1(a, b, c) + X[6], 7) + d; b = RL(b, 10);
            d = RL(d + F1(e, a, b) + X[7], 9) + c; a = RL(a, 10);
            c = RL(c + F1(d, e, a) + X[8], 11) + b; e = RL(e, 10);
            b = RL(b + F1(c, d, e) + X[9], 13) + a; d = RL(d, 10);
            a = RL(a + F1(b, c, d) + X[10], 14) + e; c = RL(c, 10);
            e = RL(e + F1(a, b, c) + X[11], 15) + d; b = RL(b, 10);
            d = RL(d + F1(e, a, b) + X[12], 6) + c; a = RL(a, 10);
            c = RL(c + F1(d, e, a) + X[13], 7) + b; e = RL(e, 10);
            b = RL(b + F1(c, d, e) + X[14], 9) + a; d = RL(d, 10);
            a = RL(a + F1(b, c, d) + X[15], 8) + e; c = RL(c, 10);

            // right
            aa = RL(aa + F5(bb, cc, dd) + X[5] + unchecked((int)0x50a28be6), 8) + ee; cc = RL(cc, 10);
            ee = RL(ee + F5(aa, bb, cc) + X[14] + unchecked((int)0x50a28be6), 9) + dd; bb = RL(bb, 10);
            dd = RL(dd + F5(ee, aa, bb) + X[7] + unchecked((int)0x50a28be6), 9) + cc; aa = RL(aa, 10);
            cc = RL(cc + F5(dd, ee, aa) + X[0] + unchecked((int)0x50a28be6), 11) + bb; ee = RL(ee, 10);
            bb = RL(bb + F5(cc, dd, ee) + X[9] + unchecked((int)0x50a28be6), 13) + aa; dd = RL(dd, 10);
            aa = RL(aa + F5(bb, cc, dd) + X[2] + unchecked((int)0x50a28be6), 15) + ee; cc = RL(cc, 10);
            ee = RL(ee + F5(aa, bb, cc) + X[11] + unchecked((int)0x50a28be6), 15) + dd; bb = RL(bb, 10);
            dd = RL(dd + F5(ee, aa, bb) + X[4] + unchecked((int)0x50a28be6), 5) + cc; aa = RL(aa, 10);
            cc = RL(cc + F5(dd, ee, aa) + X[13] + unchecked((int)0x50a28be6), 7) + bb; ee = RL(ee, 10);
            bb = RL(bb + F5(cc, dd, ee) + X[6] + unchecked((int)0x50a28be6), 7) + aa; dd = RL(dd, 10);
            aa = RL(aa + F5(bb, cc, dd) + X[15] + unchecked((int)0x50a28be6), 8) + ee; cc = RL(cc, 10);
            ee = RL(ee + F5(aa, bb, cc) + X[8] + unchecked((int)0x50a28be6), 11) + dd; bb = RL(bb, 10);
            dd = RL(dd + F5(ee, aa, bb) + X[1] + unchecked((int)0x50a28be6), 14) + cc; aa = RL(aa, 10);
            cc = RL(cc + F5(dd, ee, aa) + X[10] + unchecked((int)0x50a28be6), 14) + bb; ee = RL(ee, 10);
            bb = RL(bb + F5(cc, dd, ee) + X[3] + unchecked((int)0x50a28be6), 12) + aa; dd = RL(dd, 10);
            aa = RL(aa + F5(bb, cc, dd) + X[12] + unchecked((int)0x50a28be6), 6) + ee; cc = RL(cc, 10);

            t = a; a = aa; aa = t;
            //
            // Rounds 16-31
            //
            // left
            e = RL(e + F2(a, b, c) + X[7] + unchecked((int)0x5a827999), 7) + d; b = RL(b, 10);
            d = RL(d + F2(e, a, b) + X[4] + unchecked((int)0x5a827999), 6) + c; a = RL(a, 10);
            c = RL(c + F2(d, e, a) + X[13] + unchecked((int)0x5a827999), 8) + b; e = RL(e, 10);
            b = RL(b + F2(c, d, e) + X[1] + unchecked((int)0x5a827999), 13) + a; d = RL(d, 10);
            a = RL(a + F2(b, c, d) + X[10] + unchecked((int)0x5a827999), 11) + e; c = RL(c, 10);
            e = RL(e + F2(a, b, c) + X[6] + unchecked((int)0x5a827999), 9) + d; b = RL(b, 10);
            d = RL(d + F2(e, a, b) + X[15] + unchecked((int)0x5a827999), 7) + c; a = RL(a, 10);
            c = RL(c + F2(d, e, a) + X[3] + unchecked((int)0x5a827999), 15) + b; e = RL(e, 10);
            b = RL(b + F2(c, d, e) + X[12] + unchecked((int)0x5a827999), 7) + a; d = RL(d, 10);
            a = RL(a + F2(b, c, d) + X[0] + unchecked((int)0x5a827999), 12) + e; c = RL(c, 10);
            e = RL(e + F2(a, b, c) + X[9] + unchecked((int)0x5a827999), 15) + d; b = RL(b, 10);
            d = RL(d + F2(e, a, b) + X[5] + unchecked((int)0x5a827999), 9) + c; a = RL(a, 10);
            c = RL(c + F2(d, e, a) + X[2] + unchecked((int)0x5a827999), 11) + b; e = RL(e, 10);
            b = RL(b + F2(c, d, e) + X[14] + unchecked((int)0x5a827999), 7) + a; d = RL(d, 10);
            a = RL(a + F2(b, c, d) + X[11] + unchecked((int)0x5a827999), 13) + e; c = RL(c, 10);
            e = RL(e + F2(a, b, c) + X[8] + unchecked((int)0x5a827999), 12) + d; b = RL(b, 10);

            // right
            ee = RL(ee + F4(aa, bb, cc) + X[6] + unchecked((int)0x5c4dd124), 9) + dd; bb = RL(bb, 10);
            dd = RL(dd + F4(ee, aa, bb) + X[11] + unchecked((int)0x5c4dd124), 13) + cc; aa = RL(aa, 10);
            cc = RL(cc + F4(dd, ee, aa) + X[3] + unchecked((int)0x5c4dd124), 15) + bb; ee = RL(ee, 10);
            bb = RL(bb + F4(cc, dd, ee) + X[7] + unchecked((int)0x5c4dd124), 7) + aa; dd = RL(dd, 10);
            aa = RL(aa + F4(bb, cc, dd) + X[0] + unchecked((int)0x5c4dd124), 12) + ee; cc = RL(cc, 10);
            ee = RL(ee + F4(aa, bb, cc) + X[13] + unchecked((int)0x5c4dd124), 8) + dd; bb = RL(bb, 10);
            dd = RL(dd + F4(ee, aa, bb) + X[5] + unchecked((int)0x5c4dd124), 9) + cc; aa = RL(aa, 10);
            cc = RL(cc + F4(dd, ee, aa) + X[10] + unchecked((int)0x5c4dd124), 11) + bb; ee = RL(ee, 10);
            bb = RL(bb + F4(cc, dd, ee) + X[14] + unchecked((int)0x5c4dd124), 7) + aa; dd = RL(dd, 10);
            aa = RL(aa + F4(bb, cc, dd) + X[15] + unchecked((int)0x5c4dd124), 7) + ee; cc = RL(cc, 10);
            ee = RL(ee + F4(aa, bb, cc) + X[8] + unchecked((int)0x5c4dd124), 12) + dd; bb = RL(bb, 10);
            dd = RL(dd + F4(ee, aa, bb) + X[12] + unchecked((int)0x5c4dd124), 7) + cc; aa = RL(aa, 10);
            cc = RL(cc + F4(dd, ee, aa) + X[4] + unchecked((int)0x5c4dd124), 6) + bb; ee = RL(ee, 10);
            bb = RL(bb + F4(cc, dd, ee) + X[9] + unchecked((int)0x5c4dd124), 15) + aa; dd = RL(dd, 10);
            aa = RL(aa + F4(bb, cc, dd) + X[1] + unchecked((int)0x5c4dd124), 13) + ee; cc = RL(cc, 10);
            ee = RL(ee + F4(aa, bb, cc) + X[2] + unchecked((int)0x5c4dd124), 11) + dd; bb = RL(bb, 10);

            t = b; b = bb; bb = t;

            //
            // Rounds 32-47
            //
            // left
            d = RL(d + F3(e, a, b) + X[3] + unchecked((int)0x6ed9eba1), 11) + c; a = RL(a, 10);
            c = RL(c + F3(d, e, a) + X[10] + unchecked((int)0x6ed9eba1), 13) + b; e = RL(e, 10);
            b = RL(b + F3(c, d, e) + X[14] + unchecked((int)0x6ed9eba1), 6) + a; d = RL(d, 10);
            a = RL(a + F3(b, c, d) + X[4] + unchecked((int)0x6ed9eba1), 7) + e; c = RL(c, 10);
            e = RL(e + F3(a, b, c) + X[9] + unchecked((int)0x6ed9eba1), 14) + d; b = RL(b, 10);
            d = RL(d + F3(e, a, b) + X[15] + unchecked((int)0x6ed9eba1), 9) + c; a = RL(a, 10);
            c = RL(c + F3(d, e, a) + X[8] + unchecked((int)0x6ed9eba1), 13) + b; e = RL(e, 10);
            b = RL(b + F3(c, d, e) + X[1] + unchecked((int)0x6ed9eba1), 15) + a; d = RL(d, 10);
            a = RL(a + F3(b, c, d) + X[2] + unchecked((int)0x6ed9eba1), 14) + e; c = RL(c, 10);
            e = RL(e + F3(a, b, c) + X[7] + unchecked((int)0x6ed9eba1), 8) + d; b = RL(b, 10);
            d = RL(d + F3(e, a, b) + X[0] + unchecked((int)0x6ed9eba1), 13) + c; a = RL(a, 10);
            c = RL(c + F3(d, e, a) + X[6] + unchecked((int)0x6ed9eba1), 6) + b; e = RL(e, 10);
            b = RL(b + F3(c, d, e) + X[13] + unchecked((int)0x6ed9eba1), 5) + a; d = RL(d, 10);
            a = RL(a + F3(b, c, d) + X[11] + unchecked((int)0x6ed9eba1), 12) + e; c = RL(c, 10);
            e = RL(e + F3(a, b, c) + X[5] + unchecked((int)0x6ed9eba1), 7) + d; b = RL(b, 10);
            d = RL(d + F3(e, a, b) + X[12] + unchecked((int)0x6ed9eba1), 5) + c; a = RL(a, 10);

            // right
            dd = RL(dd + F3(ee, aa, bb) + X[15] + unchecked((int)0x6d703ef3), 9) + cc; aa = RL(aa, 10);
            cc = RL(cc + F3(dd, ee, aa) + X[5] + unchecked((int)0x6d703ef3), 7) + bb; ee = RL(ee, 10);
            bb = RL(bb + F3(cc, dd, ee) + X[1] + unchecked((int)0x6d703ef3), 15) + aa; dd = RL(dd, 10);
            aa = RL(aa + F3(bb, cc, dd) + X[3] + unchecked((int)0x6d703ef3), 11) + ee; cc = RL(cc, 10);
            ee = RL(ee + F3(aa, bb, cc) + X[7] + unchecked((int)0x6d703ef3), 8) + dd; bb = RL(bb, 10);
            dd = RL(dd + F3(ee, aa, bb) + X[14] + unchecked((int)0x6d703ef3), 6) + cc; aa = RL(aa, 10);
            cc = RL(cc + F3(dd, ee, aa) + X[6] + unchecked((int)0x6d703ef3), 6) + bb; ee = RL(ee, 10);
            bb = RL(bb + F3(cc, dd, ee) + X[9] + unchecked((int)0x6d703ef3), 14) + aa; dd = RL(dd, 10);
            aa = RL(aa + F3(bb, cc, dd) + X[11] + unchecked((int)0x6d703ef3), 12) + ee; cc = RL(cc, 10);
            ee = RL(ee + F3(aa, bb, cc) + X[8] + unchecked((int)0x6d703ef3), 13) + dd; bb = RL(bb, 10);
            dd = RL(dd + F3(ee, aa, bb) + X[12] + unchecked((int)0x6d703ef3), 5) + cc; aa = RL(aa, 10);
            cc = RL(cc + F3(dd, ee, aa) + X[2] + unchecked((int)0x6d703ef3), 14) + bb; ee = RL(ee, 10);
            bb = RL(bb + F3(cc, dd, ee) + X[10] + unchecked((int)0x6d703ef3), 13) + aa; dd = RL(dd, 10);
            aa = RL(aa + F3(bb, cc, dd) + X[0] + unchecked((int)0x6d703ef3), 13) + ee; cc = RL(cc, 10);
            ee = RL(ee + F3(aa, bb, cc) + X[4] + unchecked((int)0x6d703ef3), 7) + dd; bb = RL(bb, 10);
            dd = RL(dd + F3(ee, aa, bb) + X[13] + unchecked((int)0x6d703ef3), 5) + cc; aa = RL(aa, 10);

            t = c; c = cc; cc = t;

            //
            // Rounds 48-63
            //
            // left
            c = RL(c + F4(d, e, a) + X[1] + unchecked((int)0x8f1bbcdc), 11) + b; e = RL(e, 10);
            b = RL(b + F4(c, d, e) + X[9] + unchecked((int)0x8f1bbcdc), 12) + a; d = RL(d, 10);
            a = RL(a + F4(b, c, d) + X[11] + unchecked((int)0x8f1bbcdc), 14) + e; c = RL(c, 10);
            e = RL(e + F4(a, b, c) + X[10] + unchecked((int)0x8f1bbcdc), 15) + d; b = RL(b, 10);
            d = RL(d + F4(e, a, b) + X[0] + unchecked((int)0x8f1bbcdc), 14) + c; a = RL(a, 10);
            c = RL(c + F4(d, e, a) + X[8] + unchecked((int)0x8f1bbcdc), 15) + b; e = RL(e, 10);
            b = RL(b + F4(c, d, e) + X[12] + unchecked((int)0x8f1bbcdc), 9) + a; d = RL(d, 10);
            a = RL(a + F4(b, c, d) + X[4] + unchecked((int)0x8f1bbcdc), 8) + e; c = RL(c, 10);
            e = RL(e + F4(a, b, c) + X[13] + unchecked((int)0x8f1bbcdc), 9) + d; b = RL(b, 10);
            d = RL(d + F4(e, a, b) + X[3] + unchecked((int)0x8f1bbcdc), 14) + c; a = RL(a, 10);
            c = RL(c + F4(d, e, a) + X[7] + unchecked((int)0x8f1bbcdc), 5) + b; e = RL(e, 10);
            b = RL(b + F4(c, d, e) + X[15] + unchecked((int)0x8f1bbcdc), 6) + a; d = RL(d, 10);
            a = RL(a + F4(b, c, d) + X[14] + unchecked((int)0x8f1bbcdc), 8) + e; c = RL(c, 10);
            e = RL(e + F4(a, b, c) + X[5] + unchecked((int)0x8f1bbcdc), 6) + d; b = RL(b, 10);
            d = RL(d + F4(e, a, b) + X[6] + unchecked((int)0x8f1bbcdc), 5) + c; a = RL(a, 10);
            c = RL(c + F4(d, e, a) + X[2] + unchecked((int)0x8f1bbcdc), 12) + b; e = RL(e, 10);

            // right
            cc = RL(cc + F2(dd, ee, aa) + X[8] + unchecked((int)0x7a6d76e9), 15) + bb; ee = RL(ee, 10);
            bb = RL(bb + F2(cc, dd, ee) + X[6] + unchecked((int)0x7a6d76e9), 5) + aa; dd = RL(dd, 10);
            aa = RL(aa + F2(bb, cc, dd) + X[4] + unchecked((int)0x7a6d76e9), 8) + ee; cc = RL(cc, 10);
            ee = RL(ee + F2(aa, bb, cc) + X[1] + unchecked((int)0x7a6d76e9), 11) + dd; bb = RL(bb, 10);
            dd = RL(dd + F2(ee, aa, bb) + X[3] + unchecked((int)0x7a6d76e9), 14) + cc; aa = RL(aa, 10);
            cc = RL(cc + F2(dd, ee, aa) + X[11] + unchecked((int)0x7a6d76e9), 14) + bb; ee = RL(ee, 10);
            bb = RL(bb + F2(cc, dd, ee) + X[15] + unchecked((int)0x7a6d76e9), 6) + aa; dd = RL(dd, 10);
            aa = RL(aa + F2(bb, cc, dd) + X[0] + unchecked((int)0x7a6d76e9), 14) + ee; cc = RL(cc, 10);
            ee = RL(ee + F2(aa, bb, cc) + X[5] + unchecked((int)0x7a6d76e9), 6) + dd; bb = RL(bb, 10);
            dd = RL(dd + F2(ee, aa, bb) + X[12] + unchecked((int)0x7a6d76e9), 9) + cc; aa = RL(aa, 10);
            cc = RL(cc + F2(dd, ee, aa) + X[2] + unchecked((int)0x7a6d76e9), 12) + bb; ee = RL(ee, 10);
            bb = RL(bb + F2(cc, dd, ee) + X[13] + unchecked((int)0x7a6d76e9), 9) + aa; dd = RL(dd, 10);
            aa = RL(aa + F2(bb, cc, dd) + X[9] + unchecked((int)0x7a6d76e9), 12) + ee; cc = RL(cc, 10);
            ee = RL(ee + F2(aa, bb, cc) + X[7] + unchecked((int)0x7a6d76e9), 5) + dd; bb = RL(bb, 10);
            dd = RL(dd + F2(ee, aa, bb) + X[10] + unchecked((int)0x7a6d76e9), 15) + cc; aa = RL(aa, 10);
            cc = RL(cc + F2(dd, ee, aa) + X[14] + unchecked((int)0x7a6d76e9), 8) + bb; ee = RL(ee, 10);

            t = d; d = dd; dd = t;

            //
            // Rounds 64-79
            //
            // left
            b = RL(b + F5(c, d, e) + X[4] + unchecked((int)0xa953fd4e), 9) + a; d = RL(d, 10);
            a = RL(a + F5(b, c, d) + X[0] + unchecked((int)0xa953fd4e), 15) + e; c = RL(c, 10);
            e = RL(e + F5(a, b, c) + X[5] + unchecked((int)0xa953fd4e), 5) + d; b = RL(b, 10);
            d = RL(d + F5(e, a, b) + X[9] + unchecked((int)0xa953fd4e), 11) + c; a = RL(a, 10);
            c = RL(c + F5(d, e, a) + X[7] + unchecked((int)0xa953fd4e), 6) + b; e = RL(e, 10);
            b = RL(b + F5(c, d, e) + X[12] + unchecked((int)0xa953fd4e), 8) + a; d = RL(d, 10);
            a = RL(a + F5(b, c, d) + X[2] + unchecked((int)0xa953fd4e), 13) + e; c = RL(c, 10);
            e = RL(e + F5(a, b, c) + X[10] + unchecked((int)0xa953fd4e), 12) + d; b = RL(b, 10);
            d = RL(d + F5(e, a, b) + X[14] + unchecked((int)0xa953fd4e), 5) + c; a = RL(a, 10);
            c = RL(c + F5(d, e, a) + X[1] + unchecked((int)0xa953fd4e), 12) + b; e = RL(e, 10);
            b = RL(b + F5(c, d, e) + X[3] + unchecked((int)0xa953fd4e), 13) + a; d = RL(d, 10);
            a = RL(a + F5(b, c, d) + X[8] + unchecked((int)0xa953fd4e), 14) + e; c = RL(c, 10);
            e = RL(e + F5(a, b, c) + X[11] + unchecked((int)0xa953fd4e), 11) + d; b = RL(b, 10);
            d = RL(d + F5(e, a, b) + X[6] + unchecked((int)0xa953fd4e), 8) + c; a = RL(a, 10);
            c = RL(c + F5(d, e, a) + X[15] + unchecked((int)0xa953fd4e), 5) + b; e = RL(e, 10);
            b = RL(b + F5(c, d, e) + X[13] + unchecked((int)0xa953fd4e), 6) + a; d = RL(d, 10);

            // right
            bb = RL(bb + F1(cc, dd, ee) + X[12], 8) + aa; dd = RL(dd, 10);
            aa = RL(aa + F1(bb, cc, dd) + X[15], 5) + ee; cc = RL(cc, 10);
            ee = RL(ee + F1(aa, bb, cc) + X[10], 12) + dd; bb = RL(bb, 10);
            dd = RL(dd + F1(ee, aa, bb) + X[4], 9) + cc; aa = RL(aa, 10);
            cc = RL(cc + F1(dd, ee, aa) + X[1], 12) + bb; ee = RL(ee, 10);
            bb = RL(bb + F1(cc, dd, ee) + X[5], 5) + aa; dd = RL(dd, 10);
            aa = RL(aa + F1(bb, cc, dd) + X[8], 14) + ee; cc = RL(cc, 10);
            ee = RL(ee + F1(aa, bb, cc) + X[7], 6) + dd; bb = RL(bb, 10);
            dd = RL(dd + F1(ee, aa, bb) + X[6], 8) + cc; aa = RL(aa, 10);
            cc = RL(cc + F1(dd, ee, aa) + X[2], 13) + bb; ee = RL(ee, 10);
            bb = RL(bb + F1(cc, dd, ee) + X[13], 6) + aa; dd = RL(dd, 10);
            aa = RL(aa + F1(bb, cc, dd) + X[14], 5) + ee; cc = RL(cc, 10);
            ee = RL(ee + F1(aa, bb, cc) + X[0], 15) + dd; bb = RL(bb, 10);
            dd = RL(dd + F1(ee, aa, bb) + X[3], 13) + cc; aa = RL(aa, 10);
            cc = RL(cc + F1(dd, ee, aa) + X[9], 11) + bb; ee = RL(ee, 10);
            bb = RL(bb + F1(cc, dd, ee) + X[11], 11) + aa; dd = RL(dd, 10);

            //
            // do (e, ee) swap as part of assignment.
            //

            H0 += a;
            H1 += b;
            H2 += c;
            H3 += d;
            H4 += ee;
            H5 += aa;
            H6 += bb;
            H7 += cc;
            H8 += dd;
            H9 += e;

            //
            // reset the offset and clean out the word buffer.
            //
            xOff = 0;
            for (int i = 0; i != X.Length; i++)
            {
                X[i] = 0;
            }
        }
		
		public override IMemoable Copy()
		{
			return new RipeMD320Digest(this);
		}

		public override void Reset(IMemoable other)
		{
			RipeMD320Digest d = (RipeMD320Digest)other;

			CopyIn(d);
		}
    }
}
