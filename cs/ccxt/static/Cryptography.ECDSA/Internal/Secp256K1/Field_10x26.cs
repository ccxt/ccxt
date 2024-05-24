//#define VERIFY
#define USE_FIELD_10X26

using System;
using System.Diagnostics;

namespace Cryptography.ECDSA.Internal.Secp256K1
{

#if USE_FIELD_10X26

    // Unpacks a constant into a overlapping multi-limbed FE element. 
    //#define SECP256K1_FE_CONST_INNER(d7, d6, d5, d4, d3, d2, d1, d0) { \
    //        (d0) & 0x3FFFFFF, \
    //        (((UInt32) d0) >> 26) | (((UInt32)(d1) & 0xFFFFF) << 6), \
    //        (((UInt32) d1) >> 20) | (((UInt32)(d2) & 0x3FFF) << 12), \
    //        (((UInt32) d2) >> 14) | (((UInt32)(d3) & 0xFF) << 18), \
    //        (((UInt32) d3) >> 8) | (((UInt32)(d4) & 0x3) << 24), \
    //        (((UInt32) d4) >> 2) & 0x3FFFFFF, \
    //        (((UInt32) d4) >> 28) | (((UInt32)(d5) & 0x3FFFFF) << 4), \
    //        (((UInt32) d5) >> 22) | (((UInt32)(d6) & 0xFFFF) << 10), \
    //        (((UInt32) d6) >> 16) | (((UInt32)(d7) & 0x3FF) << 16), \
    //        (((UInt32) d7) >> 10) \
    //    }

    //#if VERIFY
    //#define SECP256K1_FE_CONST(d7, d6, d5, d4, d3, d2, d1, d0) {SECP256K1_FE_CONST_INNER((d7), (d6), (d5), (d4), (d3), (d2), (d1), (d0)), 1, 1}
    //#else
    //#define SECP256K1_FE_CONST(d7, d6, d5, d4, d3, d2, d1, d0) {SECP256K1_FE_CONST_INNER((d7), (d6), (d5), (d4), (d3), (d2), (d1), (d0))}
    //#endif

    //#define SECP256K1_FE_STORAGE_CONST(d7, d6s, d5, d4, d3, d2, d1, d0) {{ (d0), (d1), (d2), (d3), (d4), (d5), (d6), (d7) }}
    //#define SECP256K1_FE_STORAGE_CONST_GET(d) d.n[7], d.n[6], d.n[5], d.n[4],d.n[3], d.n[2], d.n[1], d.n[0]

    internal partial class Field
    {
        //#if VERIFY
        //        static void secp256k1_fe_verify(const secp256k1_fe* a) {
        //            const UInt32* d = a.n;
        //            int m = a.normalized ? 1 : 2 * a.magnitude, r = 1;
        //            r &= (d[0] <= 0x3FFFFFF * m);
        //            r &= (d[1] <= 0x3FFFFFF * m);
        //            r &= (d[2] <= 0x3FFFFFF * m);
        //            r &= (d[3] <= 0x3FFFFFF * m);
        //            r &= (d[4] <= 0x3FFFFFF * m);
        //            r &= (d[5] <= 0x3FFFFFF * m);
        //            r &= (d[6] <= 0x3FFFFFF * m);
        //            r &= (d[7] <= 0x3FFFFFF * m);
        //            r &= (d[8] <= 0x3FFFFFF * m);
        //            r &= (d[9] <= 0x03FFFFF * m);
        //            r &= (a.magnitude >= 0);
        //            r &= (a.magnitude <= 32);
        //            if (a.normalized) {
        //                r &= (a.magnitude <= 1);
        //                if (r && (d[9] == 0x03FFFFF)) {
        //                    UInt32 mid = d[8] & d[7] & d[6] & d[5] & d[4] & d[3] & d[2];
        //                    if (mid == 0x3FFFFFF) {
        //                        r &= ((d[1] + 0x40 + ((d[0] + 0x3D1) >> 26)) <= 0x3FFFFFF);
        //                    }
        //                }
        //            }
        //            Debug.Assert(r == 1);
        //        }
        //#endif

        public static void Normalize(Fe r)
        {
            UInt32 t0 = r.N[0], t1 = r.N[1], t2 = r.N[2], t3 = r.N[3], t4 = r.N[4],
                t5 = r.N[5], t6 = r.N[6], t7 = r.N[7], t8 = r.N[8], t9 = r.N[9];

            // Reduce t9 at the start so there will be at most a single carry from the first pass 
            UInt32 m;
            UInt32 x = t9 >> 22; t9 &= 0x03FFFFF;

            // The first pass ensures the magnitude is 1, ... 
            t0 += x * 0x3D1; t1 += (x << 6);
            t1 += (t0 >> 26); t0 &= 0x3FFFFFF;
            t2 += (t1 >> 26); t1 &= 0x3FFFFFF;
            t3 += (t2 >> 26); t2 &= 0x3FFFFFF; m = t2;
            t4 += (t3 >> 26); t3 &= 0x3FFFFFF; m &= t3;
            t5 += (t4 >> 26); t4 &= 0x3FFFFFF; m &= t4;
            t6 += (t5 >> 26); t5 &= 0x3FFFFFF; m &= t5;
            t7 += (t6 >> 26); t6 &= 0x3FFFFFF; m &= t6;
            t8 += (t7 >> 26); t7 &= 0x3FFFFFF; m &= t7;
            t9 += (t8 >> 26); t8 &= 0x3FFFFFF; m &= t8;

            // ... except for a possible carry at bit 22 of t9 (i.e. bit 256 of the field element) 
            Debug.Assert(t9 >> 23 == 0);

            // At most a single final reduction is needed; check if the value is >= the field characteristic 
            if (((t9 == 0x03FFFFF) & (m == 0x3FFFFFF) && ((t1 + 0x40 + ((t0 + 0x3D1) >> 26)) > 0x3FFFFFF)))
                x = (t9 >> 22) | 1;
            else
                x = (t9 >> 22) | 0;


            // Apply the final reduction (for constant-time behaviour, we do it always) 
            t0 += x * 0x3D1; t1 += (x << 6);
            t1 += (t0 >> 26); t0 &= 0x3FFFFFF;
            t2 += (t1 >> 26); t1 &= 0x3FFFFFF;
            t3 += (t2 >> 26); t2 &= 0x3FFFFFF;
            t4 += (t3 >> 26); t3 &= 0x3FFFFFF;
            t5 += (t4 >> 26); t4 &= 0x3FFFFFF;
            t6 += (t5 >> 26); t5 &= 0x3FFFFFF;
            t7 += (t6 >> 26); t6 &= 0x3FFFFFF;
            t8 += (t7 >> 26); t7 &= 0x3FFFFFF;
            t9 += (t8 >> 26); t8 &= 0x3FFFFFF;

            // If t9 didn't carry to bit 22 already, then it should have after any final reduction 
            Debug.Assert(t9 >> 22 == x);

            // Mask off the possible multiple of 2^256 from the final reduction 
            t9 &= 0x03FFFFF;

            r.N[0] = t0; r.N[1] = t1; r.N[2] = t2; r.N[3] = t3; r.N[4] = t4;
            r.N[5] = t5; r.N[6] = t6; r.N[7] = t7; r.N[8] = t8; r.N[9] = t9;

#if VERIFY
                    r.magnitude = 1;
                    r.normalized = 1;
                    secp256k1_fe_verify(r);
#endif
        }

        public static void NormalizeWeak(Fe r)
        {
            UInt32 t0 = r.N[0], t1 = r.N[1], t2 = r.N[2], t3 = r.N[3], t4 = r.N[4],
                t5 = r.N[5], t6 = r.N[6], t7 = r.N[7], t8 = r.N[8], t9 = r.N[9];

            // Reduce t9 at the start so there will be at most a single carry from the first pass 
            UInt32 x = t9 >> 22; t9 &= 0x03FFFFF;

            // The first pass ensures the magnitude is 1, ... 
            t0 += x * 0x3D1; t1 += (x << 6);
            t1 += (t0 >> 26); t0 &= 0x3FFFFFF;
            t2 += (t1 >> 26); t1 &= 0x3FFFFFF;
            t3 += (t2 >> 26); t2 &= 0x3FFFFFF;
            t4 += (t3 >> 26); t3 &= 0x3FFFFFF;
            t5 += (t4 >> 26); t4 &= 0x3FFFFFF;
            t6 += (t5 >> 26); t5 &= 0x3FFFFFF;
            t7 += (t6 >> 26); t6 &= 0x3FFFFFF;
            t8 += (t7 >> 26); t7 &= 0x3FFFFFF;
            t9 += (t8 >> 26); t8 &= 0x3FFFFFF;

            // ... except for a possible carry at bit 22 of t9 (i.e. bit 256 of the field element) 
            Debug.Assert(t9 >> 23 == 0);

            r.N[0] = t0; r.N[1] = t1; r.N[2] = t2; r.N[3] = t3; r.N[4] = t4;
            r.N[5] = t5; r.N[6] = t6; r.N[7] = t7; r.N[8] = t8; r.N[9] = t9;

#if VERIFY
            r.magnitude = 1;
            secp256k1_fe_verify(r);
#endif
        }

        public static void NormalizeVar(Fe r)
        {
            UInt32 t0 = r.N[0], t1 = r.N[1], t2 = r.N[2], t3 = r.N[3], t4 = r.N[4],
                t5 = r.N[5], t6 = r.N[6], t7 = r.N[7], t8 = r.N[8], t9 = r.N[9];

            // Reduce t9 at the start so there will be at most a single carry from the first pass 
            UInt32 m;
            UInt32 x = t9 >> 22; t9 &= 0x03FFFFF;

            // The first pass ensures the magnitude is 1, ... 
            t0 += x * 0x3D1; t1 += (x << 6);
            t1 += (t0 >> 26); t0 &= 0x3FFFFFF;
            t2 += (t1 >> 26); t1 &= 0x3FFFFFF;
            t3 += (t2 >> 26); t2 &= 0x3FFFFFF; m = t2;
            t4 += (t3 >> 26); t3 &= 0x3FFFFFF; m &= t3;
            t5 += (t4 >> 26); t4 &= 0x3FFFFFF; m &= t4;
            t6 += (t5 >> 26); t5 &= 0x3FFFFFF; m &= t5;
            t7 += (t6 >> 26); t6 &= 0x3FFFFFF; m &= t6;
            t8 += (t7 >> 26); t7 &= 0x3FFFFFF; m &= t7;
            t9 += (t8 >> 26); t8 &= 0x3FFFFFF; m &= t8;

            // ... except for a possible carry at bit 22 of t9 (i.e. bit 256 of the field element) 
            Debug.Assert(t9 >> 23 == 0);

            // At most a single final reduction is needed; check if the value is >= the field characteristic 
            if ((t9 == 0x03FFFFF) && (m == 0x3FFFFFF) && ((t1 + 0x40 + ((t0 + 0x3D1) >> 26)) > 0x3FFFFFF))
                x = (t9 >> 22) | 1;
            else
                x = (t9 >> 22) | 0;

            if (x > 0)
            {
                t0 += 0x3D1; t1 += (x << 6);
                t1 += (t0 >> 26); t0 &= 0x3FFFFFF;
                t2 += (t1 >> 26); t1 &= 0x3FFFFFF;
                t3 += (t2 >> 26); t2 &= 0x3FFFFFF;
                t4 += (t3 >> 26); t3 &= 0x3FFFFFF;
                t5 += (t4 >> 26); t4 &= 0x3FFFFFF;
                t6 += (t5 >> 26); t5 &= 0x3FFFFFF;
                t7 += (t6 >> 26); t6 &= 0x3FFFFFF;
                t8 += (t7 >> 26); t7 &= 0x3FFFFFF;
                t9 += (t8 >> 26); t8 &= 0x3FFFFFF;

                // If t9 didn't carry to bit 22 already, then it should have after any final reduction 
                Debug.Assert(t9 >> 22 == x);

                // Mask off the possible multiple of 2^256 from the final reduction 
                t9 &= 0x03FFFFF;
            }

            r.N[0] = t0; r.N[1] = t1; r.N[2] = t2; r.N[3] = t3; r.N[4] = t4;
            r.N[5] = t5; r.N[6] = t6; r.N[7] = t7; r.N[8] = t8; r.N[9] = t9;

#if VERIFY
            r.magnitude = 1;
            r.normalized = 1;
            secp256k1_fe_verify(r);
#endif
        }

        public static bool NormalizesToZero(Fe r)
        {
            UInt32 t0 = r.N[0], t1 = r.N[1], t2 = r.N[2], t3 = r.N[3], t4 = r.N[4],
                t5 = r.N[5], t6 = r.N[6], t7 = r.N[7], t8 = r.N[8], t9 = r.N[9];

            // z0 tracks a possible raw value of 0, z1 tracks a possible raw value of P 
            UInt32 z0, z1;

            // Reduce t9 at the start so there will be at most a single carry from the first pass 
            UInt32 x = t9 >> 22; t9 &= 0x03FFFFF;

            // The first pass ensures the magnitude is 1, ... 
            t0 += x * 0x3D1; t1 += (x << 6);
            t1 += (t0 >> 26); t0 &= 0x3FFFFFF; z0 = t0; z1 = t0 ^ 0x3D0;
            t2 += (t1 >> 26); t1 &= 0x3FFFFFF; z0 |= t1; z1 &= t1 ^ 0x40;
            t3 += (t2 >> 26); t2 &= 0x3FFFFFF; z0 |= t2; z1 &= t2;
            t4 += (t3 >> 26); t3 &= 0x3FFFFFF; z0 |= t3; z1 &= t3;
            t5 += (t4 >> 26); t4 &= 0x3FFFFFF; z0 |= t4; z1 &= t4;
            t6 += (t5 >> 26); t5 &= 0x3FFFFFF; z0 |= t5; z1 &= t5;
            t7 += (t6 >> 26); t6 &= 0x3FFFFFF; z0 |= t6; z1 &= t6;
            t8 += (t7 >> 26); t7 &= 0x3FFFFFF; z0 |= t7; z1 &= t7;
            t9 += (t8 >> 26); t8 &= 0x3FFFFFF; z0 |= t8; z1 &= t8;
            z0 |= t9; z1 &= t9 ^ 0x3C00000;

            // ... except for a possible carry at bit 22 of t9 (i.e. bit 256 of the field element) 
            Debug.Assert(t9 >> 23 == 0);

            return (z0 == 0) || (z1 == 0x3FFFFFF);
        }

        public static bool NormalizesToZeroVar(Fe r)
        {
            UInt32 t0, t1, t2, t3, t4, t5, t6, t7, t8, t9;
            UInt32 z0, z1;
            UInt32 x;

            t0 = r.N[0];
            t9 = r.N[9];

            // Reduce t9 at the start so there will be at most a single carry from the first pass 
            x = t9 >> 22;

            // The first pass ensures the magnitude is 1, ... 
            t0 += x * 0x3D1;

            // z0 tracks a possible raw value of 0, z1 tracks a possible raw value of P 
            z0 = t0 & 0x3FFFFFF;
            z1 = z0 ^ 0x3D0;

            // Fast return path should catch the majority of cases 
            if ((z0 != 0) & (z1 != 0x3FFFFFF))
            {
                return false;
            }

            t1 = r.N[1];
            t2 = r.N[2];
            t3 = r.N[3];
            t4 = r.N[4];
            t5 = r.N[5];
            t6 = r.N[6];
            t7 = r.N[7];
            t8 = r.N[8];

            t9 &= 0x03FFFFF;
            t1 += (x << 6);

            t1 += (t0 >> 26);
            t2 += (t1 >> 26); t1 &= 0x3FFFFFF; z0 |= t1; z1 &= t1 ^ 0x40;
            t3 += (t2 >> 26); t2 &= 0x3FFFFFF; z0 |= t2; z1 &= t2;
            t4 += (t3 >> 26); t3 &= 0x3FFFFFF; z0 |= t3; z1 &= t3;
            t5 += (t4 >> 26); t4 &= 0x3FFFFFF; z0 |= t4; z1 &= t4;
            t6 += (t5 >> 26); t5 &= 0x3FFFFFF; z0 |= t5; z1 &= t5;
            t7 += (t6 >> 26); t6 &= 0x3FFFFFF; z0 |= t6; z1 &= t6;
            t8 += (t7 >> 26); t7 &= 0x3FFFFFF; z0 |= t7; z1 &= t7;
            t9 += (t8 >> 26); t8 &= 0x3FFFFFF; z0 |= t8; z1 &= t8;
            z0 |= t9; z1 &= t9 ^ 0x3C00000;

            // ... except for a possible carry at bit 22 of t9 (i.e. bit 256 of the field element) 
            Debug.Assert(t9 >> 23 == 0);

            return (z0 == 0) | (z1 == 0x3FFFFFF);
        }

        public static void SetInt(Fe r, UInt32 a)
        {
            r.N[0] = a;
            r.N[1] = r.N[2] = r.N[3] = r.N[4] = r.N[5] = r.N[6] = r.N[7] = r.N[8] = r.N[9] = 0;
#if VERIFY
                    r.magnitude = 1;
                    r.normalized = 1;
                    secp256k1_fe_verify(r);
#endif
        }

        public static bool IsZero(Fe a)
        {
            var t = a.N;
#if VERIFY
                    Debug.Assert(a.normalized);
                    secp256k1_fe_verify(a);
#endif
            return (t[0] | t[1] | t[2] | t[3] | t[4] | t[5] | t[6] | t[7] | t[8] | t[9]) == 0;
        }

        public static bool IsOdd(Fe a)
        {
            return (a.N[0] & 1) > 0;
        }

        public static void Clear(Fe a)
        {
            int i;
#if VERIFY
                    a.magnitude = 0;
                    a.normalized = 1;
#endif
            for (i = 0; i < 10; i++)
            {
                a.N[i] = 0;
            }
        }

        //        static int secp256k1_fe_cmp_var(const secp256k1_fe* a, secp256k1_fe* b)
        //        {
        //            int i;
        //#if VERIFY
        //            Debug.Assert(a.normalized);
        //            Debug.Assert(b.normalized);
        //            secp256k1_fe_verify(a);
        //            secp256k1_fe_verify(b);
        //#endif
        //            for (i = 9; i >= 0; i--)
        //            {
        //                if (a.n[i] > b.n[i])
        //                {
        //                    return 1;
        //                }
        //                if (a.n[i] < b.n[i])
        //                {
        //                    return -1;
        //                }
        //            }
        //            return 0;
        //        }

        public static bool SetB32(Fe r, byte[] a)
        {
            r.N[0] = (UInt32)a[31] | ((UInt32)a[30] << 8) | ((UInt32)a[29] << 16) | ((UInt32)(a[28] & 0x3) << 24);
            r.N[1] = (UInt32)((a[28] >> 2) & 0x3f) | ((UInt32)a[27] << 6) | ((UInt32)a[26] << 14) | ((UInt32)(a[25] & 0xf) << 22);
            r.N[2] = (UInt32)((a[25] >> 4) & 0xf) | ((UInt32)a[24] << 4) | ((UInt32)a[23] << 12) | ((UInt32)(a[22] & 0x3f) << 20);
            r.N[3] = (UInt32)((a[22] >> 6) & 0x3) | ((UInt32)a[21] << 2) | ((UInt32)a[20] << 10) | ((UInt32)a[19] << 18);
            r.N[4] = (UInt32)a[18] | ((UInt32)a[17] << 8) | ((UInt32)a[16] << 16) | ((UInt32)(a[15] & 0x3) << 24);
            r.N[5] = (UInt32)((a[15] >> 2) & 0x3f) | ((UInt32)a[14] << 6) | ((UInt32)a[13] << 14) | ((UInt32)(a[12] & 0xf) << 22);
            r.N[6] = (UInt32)((a[12] >> 4) & 0xf) | ((UInt32)a[11] << 4) | ((UInt32)a[10] << 12) | ((UInt32)(a[9] & 0x3f) << 20);
            r.N[7] = (UInt32)((a[9] >> 6) & 0x3) | ((UInt32)a[8] << 2) | ((UInt32)a[7] << 10) | ((UInt32)a[6] << 18);
            r.N[8] = (UInt32)a[5] | ((UInt32)a[4] << 8) | ((UInt32)a[3] << 16) | ((UInt32)(a[2] & 0x3) << 24);
            r.N[9] = (UInt32)((a[2] >> 2) & 0x3f) | ((UInt32)a[1] << 6) | ((UInt32)a[0] << 14);

            if (r.N[9] == 0x3FFFFF && (r.N[8] & r.N[7] & r.N[6] & r.N[5] & r.N[4] & r.N[3] & r.N[2]) == 0x3FFFFFF && (r.N[1] + 0x40 + ((r.N[0] + 0x3D1) >> 26)) > 0x3FFFFFF)
            {
                return false;
            }
            return true;
        }

        public static bool SetB32(Fe r, byte[] a, int index)
        {
            r.N[0] = (UInt32)a[index + 31] | ((UInt32)a[index + 30] << 8) | ((UInt32)a[index + 29] << 16) | ((UInt32)(a[index + 28] & 0x3) << 24);
            r.N[1] = (UInt32)((a[index + 28] >> 2) & 0x3f) | ((UInt32)a[index + 27] << 6) | ((UInt32)a[index + 26] << 14) | ((UInt32)(a[index + 25] & 0xf) << 22);
            r.N[2] = (UInt32)((a[index + 25] >> 4) & 0xf) | ((UInt32)a[index + 24] << 4) | ((UInt32)a[index + 23] << 12) | ((UInt32)(a[index + 22] & 0x3f) << 20);
            r.N[3] = (UInt32)((a[index + 22] >> 6) & 0x3) | ((UInt32)a[index + 21] << 2) | ((UInt32)a[index + 20] << 10) | ((UInt32)a[index + 19] << 18);
            r.N[4] = (UInt32)a[index + 18] | ((UInt32)a[index + 17] << 8) | ((UInt32)a[index + 16] << 16) | ((UInt32)(a[index + 15] & 0x3) << 24);
            r.N[5] = (UInt32)((a[index + 15] >> 2) & 0x3f) | ((UInt32)a[index + 14] << 6) | ((UInt32)a[index + 13] << 14) | ((UInt32)(a[index + 12] & 0xf) << 22);
            r.N[6] = (UInt32)((a[index + 12] >> 4) & 0xf) | ((UInt32)a[index + 11] << 4) | ((UInt32)a[index + 10] << 12) | ((UInt32)(a[index + 9] & 0x3f) << 20);
            r.N[7] = (UInt32)((a[index + 9] >> 6) & 0x3) | ((UInt32)a[index + 8] << 2) | ((UInt32)a[index + 7] << 10) | ((UInt32)a[index + 6] << 18);
            r.N[8] = (UInt32)a[index + 5] | ((UInt32)a[index + 4] << 8) | ((UInt32)a[index + 3] << 16) | ((UInt32)(a[index + 2] & 0x3) << 24);
            r.N[9] = (UInt32)((a[index + 2] >> 2) & 0x3f) | ((UInt32)a[index + 1] << 6) | ((UInt32)a[index + 0] << 14);

            if (r.N[9] == 0x3FFFFF && (r.N[8] & r.N[7] & r.N[6] & r.N[5] & r.N[4] & r.N[3] & r.N[2]) == 0x3FFFFFF && (r.N[1] + 0x40 + ((r.N[0] + 0x3D1) >> 26)) > 0x3FFFFFF)
            {
                return false;
            }
            return true;
        }

        /// <summary>
        /// Convert a field element to a 32-byte big endian value. Requires the input to be normalized 
        /// </summary>
        public static void GetB32(byte[] r, Fe a)
        {
            r[0] = (byte)((a.N[9] >> 14) & 0xff);
            r[1] = (byte)((a.N[9] >> 6) & 0xff);
            r[2] = (byte)(((a.N[9] & 0x3F) << 2) | ((a.N[8] >> 24) & 0x3));
            r[3] = (byte)((a.N[8] >> 16) & 0xff);
            r[4] = (byte)((a.N[8] >> 8) & 0xff);
            r[5] = (byte)(a.N[8] & 0xff);
            r[6] = (byte)((a.N[7] >> 18) & 0xff);
            r[7] = (byte)((a.N[7] >> 10) & 0xff);
            r[8] = (byte)((a.N[7] >> 2) & 0xff);
            r[9] = (byte)(((a.N[7] & 0x3) << 6) | ((a.N[6] >> 20) & 0x3f));
            r[10] = (byte)((a.N[6] >> 12) & 0xff);
            r[11] = (byte)((a.N[6] >> 4) & 0xff);
            r[12] = (byte)(((a.N[6] & 0xf) << 4) | ((a.N[5] >> 22) & 0xf));
            r[13] = (byte)((a.N[5] >> 14) & 0xff);
            r[14] = (byte)((a.N[5] >> 6) & 0xff);
            r[15] = (byte)(((a.N[5] & 0x3f) << 2) | ((a.N[4] >> 24) & 0x3));
            r[16] = (byte)((a.N[4] >> 16) & 0xff);
            r[17] = (byte)((a.N[4] >> 8) & 0xff);
            r[18] = (byte)(a.N[4] & 0xff);
            r[19] = (byte)((a.N[3] >> 18) & 0xff);
            r[20] = (byte)((a.N[3] >> 10) & 0xff);
            r[21] = (byte)((a.N[3] >> 2) & 0xff);
            r[22] = (byte)(((a.N[3] & 0x3) << 6) | ((a.N[2] >> 20) & 0x3f));
            r[23] = (byte)((a.N[2] >> 12) & 0xff);
            r[24] = (byte)((a.N[2] >> 4) & 0xff);
            r[25] = (byte)(((a.N[2] & 0xf) << 4) | ((a.N[1] >> 22) & 0xf));
            r[26] = (byte)((a.N[1] >> 14) & 0xff);
            r[27] = (byte)((a.N[1] >> 6) & 0xff);
            r[28] = (byte)(((a.N[1] & 0x3f) << 2) | ((a.N[0] >> 24) & 0x3));
            r[29] = (byte)((a.N[0] >> 16) & 0xff);
            r[30] = (byte)((a.N[0] >> 8) & 0xff);
            r[31] = (byte)(a.N[0] & 0xff);
        }

        /// <summary>
        /// Convert a field element to a 32-byte big endian value. Requires the input to be normalized 
        /// </summary>
        public static void GetB32(byte[] r, int index, Fe a)
        {
            r[index + 0] = (byte)((a.N[9] >> 14) & 0xff);
            r[index + 1] = (byte)((a.N[9] >> 6) & 0xff);
            r[index + 2] = (byte)(((a.N[9] & 0x3F) << 2) | ((a.N[8] >> 24) & 0x3));
            r[index + 3] = (byte)((a.N[8] >> 16) & 0xff);
            r[index + 4] = (byte)((a.N[8] >> 8) & 0xff);
            r[index + 5] = (byte)(a.N[8] & 0xff);
            r[index + 6] = (byte)((a.N[7] >> 18) & 0xff);
            r[index + 7] = (byte)((a.N[7] >> 10) & 0xff);
            r[index + 8] = (byte)((a.N[7] >> 2) & 0xff);
            r[index + 9] = (byte)(((a.N[7] & 0x3) << 6) | ((a.N[6] >> 20) & 0x3f));
            r[index + 10] = (byte)((a.N[6] >> 12) & 0xff);
            r[index + 11] = (byte)((a.N[6] >> 4) & 0xff);
            r[index + 12] = (byte)(((a.N[6] & 0xf) << 4) | ((a.N[5] >> 22) & 0xf));
            r[index + 13] = (byte)((a.N[5] >> 14) & 0xff);
            r[index + 14] = (byte)((a.N[5] >> 6) & 0xff);
            r[index + 15] = (byte)(((a.N[5] & 0x3f) << 2) | ((a.N[4] >> 24) & 0x3));
            r[index + 16] = (byte)((a.N[4] >> 16) & 0xff);
            r[index + 17] = (byte)((a.N[4] >> 8) & 0xff);
            r[index + 18] = (byte)(a.N[4] & 0xff);
            r[index + 19] = (byte)((a.N[3] >> 18) & 0xff);
            r[index + 20] = (byte)((a.N[3] >> 10) & 0xff);
            r[index + 21] = (byte)((a.N[3] >> 2) & 0xff);
            r[index + 22] = (byte)(((a.N[3] & 0x3) << 6) | ((a.N[2] >> 20) & 0x3f));
            r[index + 23] = (byte)((a.N[2] >> 12) & 0xff);
            r[index + 24] = (byte)((a.N[2] >> 4) & 0xff);
            r[index + 25] = (byte)(((a.N[2] & 0xf) << 4) | ((a.N[1] >> 22) & 0xf));
            r[index + 26] = (byte)((a.N[1] >> 14) & 0xff);
            r[index + 27] = (byte)((a.N[1] >> 6) & 0xff);
            r[index + 28] = (byte)(((a.N[1] & 0x3f) << 2) | ((a.N[0] >> 24) & 0x3));
            r[index + 29] = (byte)((a.N[0] >> 16) & 0xff);
            r[index + 30] = (byte)((a.N[0] >> 8) & 0xff);
            r[index + 31] = (byte)(a.N[0] & 0xff);
        }

        public static void Negate(Fe r, Fe a, UInt32 m)
        {
#if VERIFY
                    Debug.Assert(a.magnitude <= m);
                    secp256k1_fe_verify(a);
#endif
            r.N[0] = 0x3FFFC2F * 2 * (m + 1) - a.N[0];
            r.N[1] = 0x3FFFFBF * 2 * (m + 1) - a.N[1];
            r.N[2] = 0x3FFFFFF * 2 * (m + 1) - a.N[2];
            r.N[3] = 0x3FFFFFF * 2 * (m + 1) - a.N[3];
            r.N[4] = 0x3FFFFFF * 2 * (m + 1) - a.N[4];
            r.N[5] = 0x3FFFFFF * 2 * (m + 1) - a.N[5];
            r.N[6] = 0x3FFFFFF * 2 * (m + 1) - a.N[6];
            r.N[7] = 0x3FFFFFF * 2 * (m + 1) - a.N[7];
            r.N[8] = 0x3FFFFFF * 2 * (m + 1) - a.N[8];
            r.N[9] = 0x03FFFFF * 2 * (m + 1) - a.N[9];
#if VERIFY
                    r.magnitude = m + 1;
                    r.normalized = 0;
                    secp256k1_fe_verify(r);
#endif
        }

        public static void MulInt(Fe r, UInt32 a)
        {
            r.N[0] *= a;
            r.N[1] *= a;
            r.N[2] *= a;
            r.N[3] *= a;
            r.N[4] *= a;
            r.N[5] *= a;
            r.N[6] *= a;
            r.N[7] *= a;
            r.N[8] *= a;
            r.N[9] *= a;
#if VERIFY
                    r.magnitude *= a;
                    r.normalized = 0;
                    secp256k1_fe_verify(r);
#endif
        }

        public static void Add(Fe r, Fe a)
        {
#if VERIFY
                    secp256k1_fe_verify(a);
#endif
            r.N[0] += a.N[0];
            r.N[1] += a.N[1];
            r.N[2] += a.N[2];
            r.N[3] += a.N[3];
            r.N[4] += a.N[4];
            r.N[5] += a.N[5];
            r.N[6] += a.N[6];
            r.N[7] += a.N[7];
            r.N[8] += a.N[8];
            r.N[9] += a.N[9];
#if VERIFY
                    r.magnitude += a.magnitude;
                    r.normalized = 0;
                    secp256k1_fe_verify(r);
#endif
        }

#if USE_EXTERNAL_ASM

        // External assembler implementation 
        // void MulInner(uint32_t *r, const uint32_t *a, const uint32_t *  b);
        // void SqrInner(uint32_t *r, const uint32_t *a);

#else

#if VERIFY
        //#define VERIFY_BITS(x, n) VERIFY_CHECK(((x) >> (n)) == 0)
#else
        //#define VERIFY_BITS(x, n) do { } while(0)
#endif

        public static void MulInner(UInt32[] r, UInt32[] a, UInt32[] b)
        {
            UInt64 c, d;
            UInt64 u0, u1, u2, u3, u4, u5, u6, u7, u8;
            UInt32 t9, t1, t0, t2, t3, t4, t5, t6, t7;
            const UInt32 m = 0x3FFFFFF, r0 = 0x3D10, r1 = 0x400;

#if VERIFY
            if (((a[0]) >> (30)) != 0
               || ((a[1]) >> (30)) != 0
               || ((a[2]) >> (30)) != 0
               || ((a[3]) >> (30)) != 0
               || ((a[4]) >> (30)) != 0
               || ((a[5]) >> (30)) != 0
               || ((a[6]) >> (30)) != 0
               || ((a[7]) >> (30)) != 0
               || ((a[8]) >> (30)) != 0
               || ((a[9]) >> (26)) != 0
               || ((b[0]) >> (30)) != 0
               || ((b[1]) >> (30)) != 0
               || ((b[2]) >> (30)) != 0
               || ((b[3]) >> (30)) != 0
               || ((b[4]) >> (30)) != 0
               || ((b[5]) >> (30)) != 0
               || ((b[6]) >> (30)) != 0
               || ((b[7]) >> (30)) != 0
               || ((b[8]) >> (30)) != 0
               || ((b[9]) >> (26)) != 0)
                throw new ArithmeticException();
#endif

            // [... a b c] is a shorthand for ... + a<<52 + b<<26 + c<<0 mod n.
            // px is a shorthand for sum(a[i]*b[x-i], i=0..x).
            // Note that [x 0 0 0 0 0 0 0 0 0 0] = [x*R1 x*R0].
            //

            d = (UInt64)a[0] * b[9]
                + (UInt64)a[1] * b[8]
                + (UInt64)a[2] * b[7]
                + (UInt64)a[3] * b[6]
                + (UInt64)a[4] * b[5]
                + (UInt64)a[5] * b[4]
                + (UInt64)a[6] * b[3]
                + (UInt64)a[7] * b[2]
                + (UInt64)a[8] * b[1]
                + (UInt64)a[9] * b[0];
            /* #if VERIFY
            if (((d) >> (64)) != 0)
                throw new ArithmeticException();
    #endif */
            /* [d 0 0 0 0 0 0 0 0 0] = [p9 0 0 0 0 0 0 0 0 0] */
            t9 = (UInt32)(d & m); d >>= 26;
#if VERIFY
            if (((t9) >> (26)) != 0
               || ((d) >> (38)) != 0)
                throw new ArithmeticException();
#endif
            /* [d t9 0 0 0 0 0 0 0 0 0] = [p9 0 0 0 0 0 0 0 0 0] */

            c = (UInt64)a[0] * b[0];
#if VERIFY
            if (((c) >> (60)) != 0)
                throw new ArithmeticException();
#endif
            /* [d t9 0 0 0 0 0 0 0 0 c] = [p9 0 0 0 0 0 0 0 0 p0] */
            d += (UInt64)a[1] * b[9]
                 + (UInt64)a[2] * b[8]
                 + (UInt64)a[3] * b[7]
                 + (UInt64)a[4] * b[6]
                 + (UInt64)a[5] * b[5]
                 + (UInt64)a[6] * b[4]
                 + (UInt64)a[7] * b[3]
                 + (UInt64)a[8] * b[2]
                 + (UInt64)a[9] * b[1];
#if VERIFY
            if (((d) >> (63)) != 0)
                throw new ArithmeticException();
#endif
            /* [d t9 0 0 0 0 0 0 0 0 c] = [p10 p9 0 0 0 0 0 0 0 0 p0] */
            u0 = d & m; d >>= 26; c += u0 * r0;
#if VERIFY
            if (((u0) >> (26)) != 0
               || ((d) >> (37)) != 0
               || ((c) >> (61)) != 0)
                throw new ArithmeticException();
#endif
            /* [d u0 t9 0 0 0 0 0 0 0 0 c-u0*R0] = [p10 p9 0 0 0 0 0 0 0 0 p0] */
            t0 = (UInt32)(c & m); c >>= 26; c += u0 * r1;
#if VERIFY
            if (((t0) >> (26)) != 0
               || ((c) >> (37)) != 0)
                throw new ArithmeticException();
#endif
            /* [d u0 t9 0 0 0 0 0 0 0 c-u0*R1 t0-u0*R0] = [p10 p9 0 0 0 0 0 0 0 0 p0] */
            /* [d 0 t9 0 0 0 0 0 0 0 c t0] = [p10 p9 0 0 0 0 0 0 0 0 p0] */

            c += (UInt64)a[0] * b[1]
                 + (UInt64)a[1] * b[0];
#if VERIFY
            if (((c) >> (62)) != 0)
                throw new ArithmeticException();
#endif
            /* [d 0 t9 0 0 0 0 0 0 0 c t0] = [p10 p9 0 0 0 0 0 0 0 p1 p0] */
            d += (UInt64)a[2] * b[9]
                 + (UInt64)a[3] * b[8]
                 + (UInt64)a[4] * b[7]
                 + (UInt64)a[5] * b[6]
                 + (UInt64)a[6] * b[5]
                 + (UInt64)a[7] * b[4]
                 + (UInt64)a[8] * b[3]
                 + (UInt64)a[9] * b[2];
#if VERIFY
            if (((d) >> (63)) != 0)
                throw new ArithmeticException();
#endif
            /* [d 0 t9 0 0 0 0 0 0 0 c t0] = [p11 p10 p9 0 0 0 0 0 0 0 p1 p0] */
            u1 = d & m; d >>= 26; c += u1 * r0;
#if VERIFY
            if (((u1) >> (26)) != 0
               || ((d) >> (37)) != 0
               || ((c) >> (63)) != 0)
                throw new ArithmeticException();
#endif
            /* [d u1 0 t9 0 0 0 0 0 0 0 c-u1*R0 t0] = [p11 p10 p9 0 0 0 0 0 0 0 p1 p0] */
            t1 = (UInt32)(c & m); c >>= 26; c += u1 * r1;
#if VERIFY
            if (((t1) >> (26)) != 0
               || ((c) >> (38)) != 0)
                throw new ArithmeticException();
#endif
            /* [d u1 0 t9 0 0 0 0 0 0 c-u1*R1 t1-u1*R0 t0] = [p11 p10 p9 0 0 0 0 0 0 0 p1 p0] */
            /* [d 0 0 t9 0 0 0 0 0 0 c t1 t0] = [p11 p10 p9 0 0 0 0 0 0 0 p1 p0] */

            c += (UInt64)a[0] * b[2]
                 + (UInt64)a[1] * b[1]
                 + (UInt64)a[2] * b[0];
#if VERIFY
            if (((c) >> (62)) != 0)
                throw new ArithmeticException();
#endif
            /* [d 0 0 t9 0 0 0 0 0 0 c t1 t0] = [p11 p10 p9 0 0 0 0 0 0 p2 p1 p0] */
            d += (UInt64)a[3] * b[9]
                 + (UInt64)a[4] * b[8]
                 + (UInt64)a[5] * b[7]
                 + (UInt64)a[6] * b[6]
                 + (UInt64)a[7] * b[5]
                 + (UInt64)a[8] * b[4]
                 + (UInt64)a[9] * b[3];
#if VERIFY
            if (((d) >> (63)) != 0)
                throw new ArithmeticException();
#endif
            /* [d 0 0 t9 0 0 0 0 0 0 c t1 t0] = [p12 p11 p10 p9 0 0 0 0 0 0 p2 p1 p0] */
            u2 = d & m; d >>= 26; c += u2 * r0;
#if VERIFY
            if (((u2) >> (26)) != 0
               || ((d) >> (37)) != 0
               || ((c) >> (63)) != 0)
                throw new ArithmeticException();
#endif
            /* [d u2 0 0 t9 0 0 0 0 0 0 c-u2*R0 t1 t0] = [p12 p11 p10 p9 0 0 0 0 0 0 p2 p1 p0] */
            t2 = (UInt32)(c & m); c >>= 26; c += u2 * r1;
#if VERIFY
            if (((t2) >> (26)) != 0
               || ((c) >> (38)) != 0)
                throw new ArithmeticException();
#endif
            /* [d u2 0 0 t9 0 0 0 0 0 c-u2*R1 t2-u2*R0 t1 t0] = [p12 p11 p10 p9 0 0 0 0 0 0 p2 p1 p0] */
            /* [d 0 0 0 t9 0 0 0 0 0 c t2 t1 t0] = [p12 p11 p10 p9 0 0 0 0 0 0 p2 p1 p0] */

            c += (UInt64)a[0] * b[3]
                 + (UInt64)a[1] * b[2]
                 + (UInt64)a[2] * b[1]
                 + (UInt64)a[3] * b[0];
#if VERIFY
            if (((c) >> (63)) != 0)
                throw new ArithmeticException();
#endif
            /* [d 0 0 0 t9 0 0 0 0 0 c t2 t1 t0] = [p12 p11 p10 p9 0 0 0 0 0 p3 p2 p1 p0] */
            d += (UInt64)a[4] * b[9]
                 + (UInt64)a[5] * b[8]
                 + (UInt64)a[6] * b[7]
                 + (UInt64)a[7] * b[6]
                 + (UInt64)a[8] * b[5]
                 + (UInt64)a[9] * b[4];
#if VERIFY
            if (((d) >> (63)) != 0)
                throw new ArithmeticException();
#endif
            /* [d 0 0 0 t9 0 0 0 0 0 c t2 t1 t0] = [p13 p12 p11 p10 p9 0 0 0 0 0 p3 p2 p1 p0] */
            u3 = d & m; d >>= 26; c += u3 * r0;
#if VERIFY
            if (((u3) >> (26)) != 0
               || ((d) >> (37)) != 0)
                throw new ArithmeticException();
#endif
            /* #if VERIFY
            if (((c) >> (64)) != 0)
                throw new ArithmeticException();
    #endif */
            /* [d u3 0 0 0 t9 0 0 0 0 0 c-u3*R0 t2 t1 t0] = [p13 p12 p11 p10 p9 0 0 0 0 0 p3 p2 p1 p0] */
            t3 = (UInt32)(c & m); c >>= 26; c += u3 * r1;
#if VERIFY
            if (((t3) >> (26)) != 0
               || ((c) >> (39)) != 0)
                throw new ArithmeticException();
#endif
            /* [d u3 0 0 0 t9 0 0 0 0 c-u3*R1 t3-u3*R0 t2 t1 t0] = [p13 p12 p11 p10 p9 0 0 0 0 0 p3 p2 p1 p0] */
            /* [d 0 0 0 0 t9 0 0 0 0 c t3 t2 t1 t0] = [p13 p12 p11 p10 p9 0 0 0 0 0 p3 p2 p1 p0] */

            c += (UInt64)a[0] * b[4]
                 + (UInt64)a[1] * b[3]
                 + (UInt64)a[2] * b[2]
                 + (UInt64)a[3] * b[1]
                 + (UInt64)a[4] * b[0];
#if VERIFY
            if (((c) >> (63)) != 0)
                throw new ArithmeticException();
#endif
            /* [d 0 0 0 0 t9 0 0 0 0 c t3 t2 t1 t0] = [p13 p12 p11 p10 p9 0 0 0 0 p4 p3 p2 p1 p0] */
            d += (UInt64)a[5] * b[9]
                 + (UInt64)a[6] * b[8]
                 + (UInt64)a[7] * b[7]
                 + (UInt64)a[8] * b[6]
                 + (UInt64)a[9] * b[5];
#if VERIFY
            if (((d) >> (62)) != 0)
                throw new ArithmeticException();
#endif
            /* [d 0 0 0 0 t9 0 0 0 0 c t3 t2 t1 t0] = [p14 p13 p12 p11 p10 p9 0 0 0 0 p4 p3 p2 p1 p0] */
            u4 = d & m; d >>= 26; c += u4 * r0;
#if VERIFY
            if (((u4) >> (26)) != 0
               || ((d) >> (36)) != 0)
                throw new ArithmeticException();
#endif
            /* #if VERIFY
            if (((c) >> (64)) != 0)
                throw new ArithmeticException();
    #endif */
            /* [d u4 0 0 0 0 t9 0 0 0 0 c-u4*R0 t3 t2 t1 t0] = [p14 p13 p12 p11 p10 p9 0 0 0 0 p4 p3 p2 p1 p0] */
            t4 = (UInt32)(c & m); c >>= 26; c += u4 * r1;
#if VERIFY
            if (((t4) >> (26)) != 0
               || ((c) >> (39)) != 0)
                throw new ArithmeticException();
#endif
            /* [d u4 0 0 0 0 t9 0 0 0 c-u4*R1 t4-u4*R0 t3 t2 t1 t0] = [p14 p13 p12 p11 p10 p9 0 0 0 0 p4 p3 p2 p1 p0] */
            /* [d 0 0 0 0 0 t9 0 0 0 c t4 t3 t2 t1 t0] = [p14 p13 p12 p11 p10 p9 0 0 0 0 p4 p3 p2 p1 p0] */

            c += (UInt64)a[0] * b[5]
                 + (UInt64)a[1] * b[4]
                 + (UInt64)a[2] * b[3]
                 + (UInt64)a[3] * b[2]
                 + (UInt64)a[4] * b[1]
                 + (UInt64)a[5] * b[0];
#if VERIFY
            if (((c) >> (63)) != 0)
                throw new ArithmeticException();
#endif
            /* [d 0 0 0 0 0 t9 0 0 0 c t4 t3 t2 t1 t0] = [p14 p13 p12 p11 p10 p9 0 0 0 p5 p4 p3 p2 p1 p0] */
            d += (UInt64)a[6] * b[9]
                 + (UInt64)a[7] * b[8]
                 + (UInt64)a[8] * b[7]
                 + (UInt64)a[9] * b[6];
#if VERIFY
            if (((d) >> (62)) != 0)
                throw new ArithmeticException();
#endif
            /* [d 0 0 0 0 0 t9 0 0 0 c t4 t3 t2 t1 t0] = [p15 p14 p13 p12 p11 p10 p9 0 0 0 p5 p4 p3 p2 p1 p0] */
            u5 = d & m; d >>= 26; c += u5 * r0;
#if VERIFY
            if (((u5) >> (26)) != 0
               || ((d) >> (36)) != 0)
                throw new ArithmeticException();
#endif
            /* #if VERIFY
            if (((c) >> (64)) != 0)
                throw new ArithmeticException();
    #endif */
            /* [d u5 0 0 0 0 0 t9 0 0 0 c-u5*R0 t4 t3 t2 t1 t0] = [p15 p14 p13 p12 p11 p10 p9 0 0 0 p5 p4 p3 p2 p1 p0] */
            t5 = (UInt32)(c & m); c >>= 26; c += u5 * r1;
#if VERIFY
            if (((t5) >> (26)) != 0
               || ((c) >> (39)) != 0)
                throw new ArithmeticException();
#endif
            /* [d u5 0 0 0 0 0 t9 0 0 c-u5*R1 t5-u5*R0 t4 t3 t2 t1 t0] = [p15 p14 p13 p12 p11 p10 p9 0 0 0 p5 p4 p3 p2 p1 p0] */
            /* [d 0 0 0 0 0 0 t9 0 0 c t5 t4 t3 t2 t1 t0] = [p15 p14 p13 p12 p11 p10 p9 0 0 0 p5 p4 p3 p2 p1 p0] */

            c += (UInt64)a[0] * b[6]
                 + (UInt64)a[1] * b[5]
                 + (UInt64)a[2] * b[4]
                 + (UInt64)a[3] * b[3]
                 + (UInt64)a[4] * b[2]
                 + (UInt64)a[5] * b[1]
                 + (UInt64)a[6] * b[0];
#if VERIFY
            if (((c) >> (63)) != 0)
                throw new ArithmeticException();
#endif
            /* [d 0 0 0 0 0 0 t9 0 0 c t5 t4 t3 t2 t1 t0] = [p15 p14 p13 p12 p11 p10 p9 0 0 p6 p5 p4 p3 p2 p1 p0] */
            d += (UInt64)a[7] * b[9]
                 + (UInt64)a[8] * b[8]
                 + (UInt64)a[9] * b[7];
#if VERIFY
            if (((d) >> (61)) != 0)
                throw new ArithmeticException();
#endif
            /* [d 0 0 0 0 0 0 t9 0 0 c t5 t4 t3 t2 t1 t0] = [p16 p15 p14 p13 p12 p11 p10 p9 0 0 p6 p5 p4 p3 p2 p1 p0] */
            u6 = d & m; d >>= 26; c += u6 * r0;
#if VERIFY
            if (((u6) >> (26)) != 0
               || ((d) >> (35)) != 0)
                throw new ArithmeticException();
#endif
            /* #if VERIFY
            if (((c) >> (64)) != 0)
                throw new ArithmeticException();
    #endif */
            /* [d u6 0 0 0 0 0 0 t9 0 0 c-u6*R0 t5 t4 t3 t2 t1 t0] = [p16 p15 p14 p13 p12 p11 p10 p9 0 0 p6 p5 p4 p3 p2 p1 p0] */
            t6 = (UInt32)(c & m); c >>= 26; c += u6 * r1;
#if VERIFY
            if (((t6) >> (26)) != 0
               || ((c) >> (39)) != 0)
                throw new ArithmeticException();
#endif
            /* [d u6 0 0 0 0 0 0 t9 0 c-u6*R1 t6-u6*R0 t5 t4 t3 t2 t1 t0] = [p16 p15 p14 p13 p12 p11 p10 p9 0 0 p6 p5 p4 p3 p2 p1 p0] */
            /* [d 0 0 0 0 0 0 0 t9 0 c t6 t5 t4 t3 t2 t1 t0] = [p16 p15 p14 p13 p12 p11 p10 p9 0 0 p6 p5 p4 p3 p2 p1 p0] */

            c += (UInt64)a[0] * b[7]
                 + (UInt64)a[1] * b[6]
                 + (UInt64)a[2] * b[5]
                 + (UInt64)a[3] * b[4]
                 + (UInt64)a[4] * b[3]
                 + (UInt64)a[5] * b[2]
                 + (UInt64)a[6] * b[1]
                 + (UInt64)a[7] * b[0];
            /* #if VERIFY
            if (((c) >> (64)) != 0)
                throw new ArithmeticException();
    #endif */
            Debug.Assert(c <= 0x8000007C00000007);
            /* [d 0 0 0 0 0 0 0 t9 0 c t6 t5 t4 t3 t2 t1 t0] = [p16 p15 p14 p13 p12 p11 p10 p9 0 p7 p6 p5 p4 p3 p2 p1 p0] */
            d += (UInt64)a[8] * b[9]
                 + (UInt64)a[9] * b[8];
#if VERIFY
            if (((d) >> (58)) != 0)
                throw new ArithmeticException();
#endif
            /* [d 0 0 0 0 0 0 0 t9 0 c t6 t5 t4 t3 t2 t1 t0] = [p17 p16 p15 p14 p13 p12 p11 p10 p9 0 p7 p6 p5 p4 p3 p2 p1 p0] */
            u7 = d & m; d >>= 26; c += u7 * r0;
#if VERIFY
            if (((u7) >> (26)) != 0
               || ((d) >> (32)) != 0)
                throw new ArithmeticException();
#endif
            /* #if VERIFY
            if (((c) >> (64)) != 0)
                throw new ArithmeticException();
    #endif */
            Debug.Assert(c <= 0x800001703FFFC2F7);
            /* [d u7 0 0 0 0 0 0 0 t9 0 c-u7*R0 t6 t5 t4 t3 t2 t1 t0] = [p17 p16 p15 p14 p13 p12 p11 p10 p9 0 p7 p6 p5 p4 p3 p2 p1 p0] */
            t7 = (UInt32)(c & m); c >>= 26; c += u7 * r1;
#if VERIFY
            if (((t7) >> (26)) != 0
               || ((c) >> (38)) != 0)
                throw new ArithmeticException();
#endif
            /* [d u7 0 0 0 0 0 0 0 t9 c-u7*R1 t7-u7*R0 t6 t5 t4 t3 t2 t1 t0] = [p17 p16 p15 p14 p13 p12 p11 p10 p9 0 p7 p6 p5 p4 p3 p2 p1 p0] */
            /* [d 0 0 0 0 0 0 0 0 t9 c t7 t6 t5 t4 t3 t2 t1 t0] = [p17 p16 p15 p14 p13 p12 p11 p10 p9 0 p7 p6 p5 p4 p3 p2 p1 p0] */

            c += (UInt64)a[0] * b[8]
                 + (UInt64)a[1] * b[7]
                 + (UInt64)a[2] * b[6]
                 + (UInt64)a[3] * b[5]
                 + (UInt64)a[4] * b[4]
                 + (UInt64)a[5] * b[3]
                 + (UInt64)a[6] * b[2]
                 + (UInt64)a[7] * b[1]
                 + (UInt64)a[8] * b[0];
            /* #if VERIFY
            if (((c) >> (64)) != 0)
                throw new ArithmeticException();
    #endif */
            Debug.Assert(c <= 0x9000007B80000008);
            /* [d 0 0 0 0 0 0 0 0 t9 c t7 t6 t5 t4 t3 t2 t1 t0] = [p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] */
            d += (UInt64)a[9] * b[9];
#if VERIFY
            if (((d) >> (57)) != 0)
                throw new ArithmeticException();
#endif
            /* [d 0 0 0 0 0 0 0 0 t9 c t7 t6 t5 t4 t3 t2 t1 t0] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] */
            u8 = d & m; d >>= 26; c += u8 * r0;
#if VERIFY
            if (((u8) >> (26)) != 0
               || ((d) >> (31)) != 0)
                throw new ArithmeticException();
#endif
            /* #if VERIFY
            if (((c) >> (64)) != 0)
                throw new ArithmeticException();
    #endif */
            Debug.Assert(c <= 0x9000016FBFFFC2F8);
            /* [d u8 0 0 0 0 0 0 0 0 t9 c-u8*R0 t7 t6 t5 t4 t3 t2 t1 t0] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] */

            r[3] = t3;
#if VERIFY
            if (((r[3]) >> (26)) != 0)
                throw new ArithmeticException();
#endif
            /* [d u8 0 0 0 0 0 0 0 0 t9 c-u8*R0 t7 t6 t5 t4 r3 t2 t1 t0] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] */
            r[4] = t4;
#if VERIFY
            if (((r[4]) >> (26)) != 0)
                throw new ArithmeticException();
#endif
            /* [d u8 0 0 0 0 0 0 0 0 t9 c-u8*R0 t7 t6 t5 r4 r3 t2 t1 t0] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] */
            r[5] = t5;
#if VERIFY
            if (((r[5]) >> (26)) != 0)
                throw new ArithmeticException();
#endif
            /* [d u8 0 0 0 0 0 0 0 0 t9 c-u8*R0 t7 t6 r5 r4 r3 t2 t1 t0] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] */
            r[6] = t6;
#if VERIFY
            if (((r[6]) >> (26)) != 0)
                throw new ArithmeticException();
#endif
            /* [d u8 0 0 0 0 0 0 0 0 t9 c-u8*R0 t7 r6 r5 r4 r3 t2 t1 t0] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] */
            r[7] = t7;
#if VERIFY
            if (((r[7]) >> (26)) != 0)
                throw new ArithmeticException();
#endif
            /* [d u8 0 0 0 0 0 0 0 0 t9 c-u8*R0 r7 r6 r5 r4 r3 t2 t1 t0] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] */

            r[8] = (UInt32)(c & m); c >>= 26; c += u8 * r1;
#if VERIFY
            if (((r[8]) >> (26)) != 0
               || ((c) >> (39)) != 0)
                throw new ArithmeticException();
#endif
            /* [d u8 0 0 0 0 0 0 0 0 t9+c-u8*R1 r8-u8*R0 r7 r6 r5 r4 r3 t2 t1 t0] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] */
            /* [d 0 0 0 0 0 0 0 0 0 t9+c r8 r7 r6 r5 r4 r3 t2 t1 t0] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] */
            c += d * r0 + t9;
#if VERIFY
            if (((c) >> (45)) != 0)
                throw new ArithmeticException();
#endif
            /* [d 0 0 0 0 0 0 0 0 0 c-d*R0 r8 r7 r6 r5 r4 r3 t2 t1 t0] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] */
            r[9] = (UInt32)(c & (m >> 4)); c >>= 22; c += d * (r1 << 4);
#if VERIFY
            if (((r[9]) >> (22)) != 0
               || ((c) >> (46)) != 0)
                throw new ArithmeticException();
#endif
            /* [d 0 0 0 0 0 0 0 0 r9+((c-d*R1<<4)<<22)-d*R0 r8 r7 r6 r5 r4 r3 t2 t1 t0] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] */
            /* [d 0 0 0 0 0 0 0 -d*R1 r9+(c<<22)-d*R0 r8 r7 r6 r5 r4 r3 t2 t1 t0] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] */
            /* [r9+(c<<22) r8 r7 r6 r5 r4 r3 t2 t1 t0] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] */

            d = c * (r0 >> 4) + t0;
#if VERIFY
            if (((d) >> (56)) != 0)
                throw new ArithmeticException();
#endif
            /* [r9+(c<<22) r8 r7 r6 r5 r4 r3 t2 t1 d-c*R0>>4] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] */
            r[0] = (UInt32)(d & m); d >>= 26;
#if VERIFY
            if (((r[0]) >> (26)) != 0
               || ((d) >> (30)) != 0)
                throw new ArithmeticException();
#endif
            /* [r9+(c<<22) r8 r7 r6 r5 r4 r3 t2 t1+d r0-c*R0>>4] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] */
            d += c * (r1 >> 4) + t1;
#if VERIFY
            if (((d) >> (53)) != 0)
                throw new ArithmeticException();
#endif
            Debug.Assert(d <= 0x10000003FFFFBF);
            /* [r9+(c<<22) r8 r7 r6 r5 r4 r3 t2 d-c*R1>>4 r0-c*R0>>4] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] */
            /* [r9 r8 r7 r6 r5 r4 r3 t2 d r0] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] */
            r[1] = (UInt32)(d & m); d >>= 26;
#if VERIFY
            if (((r[1]) >> (26)) != 0
               || ((d) >> (27)) != 0)
                throw new ArithmeticException();
#endif
            Debug.Assert(d <= 0x4000000);
            /* [r9 r8 r7 r6 r5 r4 r3 t2+d r1 r0] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] */
            d += t2;
#if VERIFY
            if (((d) >> (27)) != 0)
                throw new ArithmeticException();
#endif
            /* [r9 r8 r7 r6 r5 r4 r3 d r1 r0] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] */
            r[2] = (UInt32)(d);
#if VERIFY
            if (((r[2]) >> (27)) != 0)
                throw new ArithmeticException();
#endif
            /* [r9 r8 r7 r6 r5 r4 r3 r2 r1 r0] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] */
        }

        public static void SqrInner(UInt32[] r, UInt32[] a)
        {
            UInt64 c, d;
            UInt64 u0, u1, u2, u3, u4, u5, u6, u7, u8;
            UInt32 t9, t0, t1, t2, t3, t4, t5, t6, t7;
            const UInt32 m = 0x3FFFFFF, r0 = 0x3D10, r1 = 0x400;

#if VERIFY
            if ((a[0] >> 30) != 0
                || (a[1] >> 30) != 0
                || (a[2] >> 30) != 0
                || (a[3] >> 30) != 0
                || (a[4] >> 30) != 0
                || (a[5] >> 30) != 0
                || (a[6] >> 30) != 0
                || (a[7] >> 30) != 0
                || (a[8] >> 30) != 0
                || (a[9] >> 26) != 0)
                throw new ArithmeticException();
#endif

            // [... a b c] is a shorthand for ... + a<<52 + b<<26 + c<<0 mod n.
            // px is a shorthand for sum(a[i]*a[x-i], i=0..x).
            // Note that [x 0 0 0 0 0 0 0 0 0 0] = [x*R1 x*R0].

            d = (UInt64)(a[0] * 2) * a[9]
                + (UInt64)(a[1] * 2) * a[8]
                + (UInt64)(a[2] * 2) * a[7]
                + (UInt64)(a[3] * 2) * a[6]
                + (UInt64)(a[4] * 2) * a[5];
            // VERIFY_BITS(d, 64);
            // [d 0 0 0 0 0 0 0 0 0] = [p9 0 0 0 0 0 0 0 0 0]
            t9 = (UInt32)(d & m);
            d >>= 26;
#if VERIFY
            if ((t9 >> 26) != 0 || (d >> 38) != 0)
                throw new ArithmeticException();
#endif
            // [d t9 0 0 0 0 0 0 0 0 0] = [p9 0 0 0 0 0 0 0 0 0] 

            c = (UInt64)a[0] * a[0];
#if VERIFY
            if ((c >> 60) != 0)
                throw new ArithmeticException();
#endif

            // [d t9 0 0 0 0 0 0 0 0 c] = [p9 0 0 0 0 0 0 0 0 p0] 
            d += (UInt64)(a[1] * 2) * a[9]
                 + (UInt64)(a[2] * 2) * a[8]
                 + (UInt64)(a[3] * 2) * a[7]
                 + (UInt64)(a[4] * 2) * a[6]
                 + (UInt64)a[5] * a[5];
#if VERIFY
            if ((d >> 63) != 0)
                throw new ArithmeticException();
#endif
            // [d t9 0 0 0 0 0 0 0 0 c] = [p10 p9 0 0 0 0 0 0 0 0 p0] 
            u0 = d & m; d >>= 26; c += u0 * r0;
#if VERIFY
            if (((u0 >> 26) != 0)
                || ((d >> 37) != 0)
                || ((c >> 61) != 0))
                throw new ArithmeticException();
#endif
            // [d u0 t9 0 0 0 0 0 0 0 0 c-u0*R0] = [p10 p9 0 0 0 0 0 0 0 0 p0] 
            t0 = (UInt32)(c & m);
            c >>= 26; c += u0 * r1;
#if VERIFY
            if (((t0) >> (26)) != 0
                || ((c) >> (37)) != 0)
                throw new ArithmeticException();
#endif
            // [d u0 t9 0 0 0 0 0 0 0 c-u0*R1 t0-u0*R0] = [p10 p9 0 0 0 0 0 0 0 0 p0] 
            // [d 0 t9 0 0 0 0 0 0 0 c t0] = [p10 p9 0 0 0 0 0 0 0 0 p0] 

            c += (UInt64)(a[0] * 2) * a[1];
#if VERIFY
            if (((c) >> (62)) != 0)
                throw new ArithmeticException();
#endif
            // [d 0 t9 0 0 0 0 0 0 0 c t0] = [p10 p9 0 0 0 0 0 0 0 p1 p0] 
            d += (UInt64)(a[2] * 2) * a[9]
                 + (UInt64)(a[3] * 2) * a[8]
                 + (UInt64)(a[4] * 2) * a[7]
                 + (UInt64)(a[5] * 2) * a[6];
#if VERIFY
            if (((d) >> (63)) != 0)
                throw new ArithmeticException();
#endif
            // [d 0 t9 0 0 0 0 0 0 0 c t0] = [p11 p10 p9 0 0 0 0 0 0 0 p1 p0] 
            u1 = d & m; d >>= 26; c += u1 * r0;
#if VERIFY
            if (((u1) >> (26)) != 0
                || ((d) >> (37)) != 0
                || ((c) >> (63)) != 0)
                throw new ArithmeticException();
#endif
            // [d u1 0 t9 0 0 0 0 0 0 0 c-u1*R0 t0] = [p11 p10 p9 0 0 0 0 0 0 0 p1 p0] 
            t1 = (UInt32)(c & m); c >>= 26; c += u1 * r1;
#if VERIFY
            if (((t1) >> (26)) != 0
                || ((c) >> (38)) != 0)
                throw new ArithmeticException();
#endif
            // [d u1 0 t9 0 0 0 0 0 0 c-u1*R1 t1-u1*R0 t0] = [p11 p10 p9 0 0 0 0 0 0 0 p1 p0] 
            // [d 0 0 t9 0 0 0 0 0 0 c t1 t0] = [p11 p10 p9 0 0 0 0 0 0 0 p1 p0] 

            c += (UInt64)(a[0] * 2) * a[2]
                 + (UInt64)a[1] * a[1];
#if VERIFY
            if (((c) >> (62)) != 0)
                throw new ArithmeticException();
#endif
            // [d 0 0 t9 0 0 0 0 0 0 c t1 t0] = [p11 p10 p9 0 0 0 0 0 0 p2 p1 p0] 
            d += (UInt64)(a[3] * 2) * a[9]
                 + (UInt64)(a[4] * 2) * a[8]
                 + (UInt64)(a[5] * 2) * a[7]
                 + (UInt64)a[6] * a[6];
#if VERIFY
            if (((d) >> (63)) != 0)
                throw new ArithmeticException();
#endif
            // [d 0 0 t9 0 0 0 0 0 0 c t1 t0] = [p12 p11 p10 p9 0 0 0 0 0 0 p2 p1 p0] 
            u2 = d & m; d >>= 26; c += u2 * r0;
#if VERIFY
            if (((u2) >> (26)) != 0
                || ((d) >> (37)) != 0
                || ((c) >> (63)) != 0)
                throw new ArithmeticException();
#endif
            // [d u2 0 0 t9 0 0 0 0 0 0 c-u2*R0 t1 t0] = [p12 p11 p10 p9 0 0 0 0 0 0 p2 p1 p0] 
            t2 = (UInt32)(c & m); c >>= 26; c += u2 * r1;
#if VERIFY
            if (((t2) >> (26)) != 0
                || ((c) >> (38)) != 0)
                throw new ArithmeticException();
#endif
            // [d u2 0 0 t9 0 0 0 0 0 c-u2*R1 t2-u2*R0 t1 t0] = [p12 p11 p10 p9 0 0 0 0 0 0 p2 p1 p0] 
            // [d 0 0 0 t9 0 0 0 0 0 c t2 t1 t0] = [p12 p11 p10 p9 0 0 0 0 0 0 p2 p1 p0] 

            c += (UInt64)(a[0] * 2) * a[3] + (UInt64)(a[1] * 2) * a[2];
#if VERIFY
            if (((c) >> (63)) != 0)
                throw new ArithmeticException();
#endif
            // [d 0 0 0 t9 0 0 0 0 0 c t2 t1 t0] = [p12 p11 p10 p9 0 0 0 0 0 p3 p2 p1 p0] 
            d += (UInt64)(a[4] * 2) * a[9]
                 + (UInt64)(a[5] * 2) * a[8]
                 + (UInt64)(a[6] * 2) * a[7];
#if VERIFY
            if (((d) >> (63)) != 0)
                throw new ArithmeticException();
#endif
            // [d 0 0 0 t9 0 0 0 0 0 c t2 t1 t0] = [p13 p12 p11 p10 p9 0 0 0 0 0 p3 p2 p1 p0] 
            u3 = d & m; d >>= 26; c += u3 * r0;
#if VERIFY
            if (((u3) >> (26)) != 0
                || ((d) >> (37)) != 0)
                throw new ArithmeticException();
#endif
            //#if VERIFY
            //            if (((c) >> (64)) != 0)
            //                throw new ArithmeticException();
            //#endif
            // [d u3 0 0 0 t9 0 0 0 0 0 c-u3*R0 t2 t1 t0] = [p13 p12 p11 p10 p9 0 0 0 0 0 p3 p2 p1 p0] 
            t3 = (UInt32)(c & m); c >>= 26; c += u3 * r1;
#if VERIFY
            if (((t3) >> (26)) != 0
                || ((c) >> (39)) != 0)
                throw new ArithmeticException();
#endif
            // [d u3 0 0 0 t9 0 0 0 0 c-u3*R1 t3-u3*R0 t2 t1 t0] = [p13 p12 p11 p10 p9 0 0 0 0 0 p3 p2 p1 p0] 
            // [d 0 0 0 0 t9 0 0 0 0 c t3 t2 t1 t0] = [p13 p12 p11 p10 p9 0 0 0 0 0 p3 p2 p1 p0] 

            c += (UInt64)(a[0] * 2) * a[4]
                 + (UInt64)(a[1] * 2) * a[3]
                 + (UInt64)a[2] * a[2];
#if VERIFY
            if (((c) >> (63)) != 0)
                throw new ArithmeticException();
#endif
            // [d 0 0 0 0 t9 0 0 0 0 c t3 t2 t1 t0] = [p13 p12 p11 p10 p9 0 0 0 0 p4 p3 p2 p1 p0] 
            d += (UInt64)(a[5] * 2) * a[9]
                 + (UInt64)(a[6] * 2) * a[8]
                 + (UInt64)a[7] * a[7];
#if VERIFY
            if (((d) >> (62)) != 0)
                throw new ArithmeticException();
#endif
            // [d 0 0 0 0 t9 0 0 0 0 c t3 t2 t1 t0] = [p14 p13 p12 p11 p10 p9 0 0 0 0 p4 p3 p2 p1 p0] 
            u4 = d & m; d >>= 26; c += u4 * r0;
#if VERIFY
            if (((u4) >> (26)) != 0
                || ((d) >> (36)) != 0)
                throw new ArithmeticException();
#endif
            // #if VERIFY
            //            if (((c) >> (64)) != 0)
            //                throw new ArithmeticException();
            //#endif 
            // [d u4 0 0 0 0 t9 0 0 0 0 c-u4*R0 t3 t2 t1 t0] = [p14 p13 p12 p11 p10 p9 0 0 0 0 p4 p3 p2 p1 p0] 
            t4 = (UInt32)(c & m); c >>= 26; c += u4 * r1;
#if VERIFY
            if (((t4) >> (26)) != 0
                || ((c) >> (39)) != 0)
                throw new ArithmeticException();
#endif
            // [d u4 0 0 0 0 t9 0 0 0 c-u4*R1 t4-u4*R0 t3 t2 t1 t0] = [p14 p13 p12 p11 p10 p9 0 0 0 0 p4 p3 p2 p1 p0] 
            // [d 0 0 0 0 0 t9 0 0 0 c t4 t3 t2 t1 t0] = [p14 p13 p12 p11 p10 p9 0 0 0 0 p4 p3 p2 p1 p0] 

            c += (UInt64)(a[0] * 2) * a[5]
                 + (UInt64)(a[1] * 2) * a[4]
                 + (UInt64)(a[2] * 2) * a[3];
#if VERIFY
            if (((c) >> (63)) != 0)
                throw new ArithmeticException();
#endif
            // [d 0 0 0 0 0 t9 0 0 0 c t4 t3 t2 t1 t0] = [p14 p13 p12 p11 p10 p9 0 0 0 p5 p4 p3 p2 p1 p0] 
            d += (UInt64)(a[6] * 2) * a[9]
                 + (UInt64)(a[7] * 2) * a[8];
#if VERIFY
            if (((d) >> (62)) != 0)
                throw new ArithmeticException();
#endif
            // [d 0 0 0 0 0 t9 0 0 0 c t4 t3 t2 t1 t0] = [p15 p14 p13 p12 p11 p10 p9 0 0 0 p5 p4 p3 p2 p1 p0] */
            u5 = d & m; d >>= 26; c += u5 * r0;
#if VERIFY
            if (((u5) >> (26)) != 0
                || ((d) >> (36)) != 0)
                throw new ArithmeticException();
#endif
            // #if VERIFY
            //            if (((c) >> (64)) != 0)
            //                throw new ArithmeticException();
            //#endif 
            // [d u5 0 0 0 0 0 t9 0 0 0 c-u5*R0 t4 t3 t2 t1 t0] = [p15 p14 p13 p12 p11 p10 p9 0 0 0 p5 p4 p3 p2 p1 p0] 
            t5 = (UInt32)(c & m); c >>= 26; c += u5 * r1;
#if VERIFY
            if (((t5) >> (26)) != 0
                || ((c) >> (39)) != 0)
                throw new ArithmeticException();
#endif
            // [d u5 0 0 0 0 0 t9 0 0 c-u5*R1 t5-u5*R0 t4 t3 t2 t1 t0] = [p15 p14 p13 p12 p11 p10 p9 0 0 0 p5 p4 p3 p2 p1 p0] 
            // [d 0 0 0 0 0 0 t9 0 0 c t5 t4 t3 t2 t1 t0] = [p15 p14 p13 p12 p11 p10 p9 0 0 0 p5 p4 p3 p2 p1 p0] 

            c += (UInt64)(a[0] * 2) * a[6]
                 + (UInt64)(a[1] * 2) * a[5]
                 + (UInt64)(a[2] * 2) * a[4]
                 + (UInt64)a[3] * a[3];
#if VERIFY
            if (((c) >> (63)) != 0)
                throw new ArithmeticException();
#endif
            // [d 0 0 0 0 0 0 t9 0 0 c t5 t4 t3 t2 t1 t0] = [p15 p14 p13 p12 p11 p10 p9 0 0 p6 p5 p4 p3 p2 p1 p0] 
            d += (UInt64)(a[7] * 2) * a[9]
                 + (UInt64)a[8] * a[8];
#if VERIFY
            if (((d) >> (61)) != 0)
                throw new ArithmeticException();
#endif
            // [d 0 0 0 0 0 0 t9 0 0 c t5 t4 t3 t2 t1 t0] = [p16 p15 p14 p13 p12 p11 p10 p9 0 0 p6 p5 p4 p3 p2 p1 p0] 
            u6 = d & m; d >>= 26; c += u6 * r0;
#if VERIFY
            if (((u6) >> (26)) != 0
                || ((d) >> (35)) != 0)
                throw new ArithmeticException();
#endif
            //#if VERIFY
            //            if (((c) >> (64)) != 0)
            //                throw new ArithmeticException();
            //#endif
            // [d u6 0 0 0 0 0 0 t9 0 0 c-u6*R0 t5 t4 t3 t2 t1 t0] = [p16 p15 p14 p13 p12 p11 p10 p9 0 0 p6 p5 p4 p3 p2 p1 p0] 
            t6 = (UInt32)(c & m); c >>= 26; c += u6 * r1;
#if VERIFY
            if (((t6) >> (26)) != 0
                || ((c) >> (39)) != 0)
                throw new ArithmeticException();
#endif
            // [d u6 0 0 0 0 0 0 t9 0 c-u6*R1 t6-u6*R0 t5 t4 t3 t2 t1 t0] = [p16 p15 p14 p13 p12 p11 p10 p9 0 0 p6 p5 p4 p3 p2 p1 p0] 
            // [d 0 0 0 0 0 0 0 t9 0 c t6 t5 t4 t3 t2 t1 t0] = [p16 p15 p14 p13 p12 p11 p10 p9 0 0 p6 p5 p4 p3 p2 p1 p0] 

            c += (UInt64)(a[0] * 2) * a[7]
                     + (UInt64)(a[1] * 2) * a[6]
                     + (UInt64)(a[2] * 2) * a[5]
                     + (UInt64)(a[3] * 2) * a[4];
            //#if VERIFY
            //            if (((c) >> (64)) != 0)
            //                throw new ArithmeticException();
            //#endif
            Debug.Assert(c <= 0x8000007C00000007);
            // [d 0 0 0 0 0 0 0 t9 0 c t6 t5 t4 t3 t2 t1 t0] = [p16 p15 p14 p13 p12 p11 p10 p9 0 p7 p6 p5 p4 p3 p2 p1 p0] 
            d += (UInt64)(a[8] * 2) * a[9];
#if VERIFY
            if (((d) >> (58)) != 0)
                throw new ArithmeticException();
#endif
            // [d 0 0 0 0 0 0 0 t9 0 c t6 t5 t4 t3 t2 t1 t0] = [p17 p16 p15 p14 p13 p12 p11 p10 p9 0 p7 p6 p5 p4 p3 p2 p1 p0] 
            u7 = d & m; d >>= 26; c += u7 * r0;
#if VERIFY
            if (((u7) >> (26)) != 0
                || ((d) >> (32)) != 0)
                throw new ArithmeticException();
#endif
            //#if VERIFY
            //            if (((c) >> (64)) != 0)
            //                throw new ArithmeticException();
            //#endif
            Debug.Assert(c <= 0x800001703FFFC2F7);
            // [d u7 0 0 0 0 0 0 0 t9 0 c-u7*R0 t6 t5 t4 t3 t2 t1 t0] = [p17 p16 p15 p14 p13 p12 p11 p10 p9 0 p7 p6 p5 p4 p3 p2 p1 p0] 
            t7 = (UInt32)(c & m); c >>= 26; c += u7 * r1;
#if VERIFY
            if (((t7) >> (26)) != 0
                || ((c) >> (38)) != 0)
                throw new ArithmeticException();
#endif
            // [d u7 0 0 0 0 0 0 0 t9 c-u7*R1 t7-u7*R0 t6 t5 t4 t3 t2 t1 t0] = [p17 p16 p15 p14 p13 p12 p11 p10 p9 0 p7 p6 p5 p4 p3 p2 p1 p0] 
            // [d 0 0 0 0 0 0 0 0 t9 c t7 t6 t5 t4 t3 t2 t1 t0] = [p17 p16 p15 p14 p13 p12 p11 p10 p9 0 p7 p6 p5 p4 p3 p2 p1 p0] 

            c += (UInt64)(a[0] * 2) * a[8]
                     + (UInt64)(a[1] * 2) * a[7]
                     + (UInt64)(a[2] * 2) * a[6]
                     + (UInt64)(a[3] * 2) * a[5]
                     + (UInt64)a[4] * a[4];
            // #if VERIFY
            //            if (((c) >> (64)) != 0)
            //                throw new ArithmeticException();
            //#endif 
            Debug.Assert(c <= 0x9000007B80000008);
            // [d 0 0 0 0 0 0 0 0 t9 c t7 t6 t5 t4 t3 t2 t1 t0] = [p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] 
            d += (UInt64)a[9] * a[9];
#if VERIFY
            if (((d) >> (57)) != 0)
                throw new ArithmeticException();
#endif
            // [d 0 0 0 0 0 0 0 0 t9 c t7 t6 t5 t4 t3 t2 t1 t0] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] 
            u8 = d & m; d >>= 26; c += u8 * r0;
#if VERIFY
            if (((u8) >> (26)) != 0
                || ((d) >> (31)) != 0)
                throw new ArithmeticException();
#endif
            // #if VERIFY
            //            if (((c) >> (64)) != 0)
            //                throw new ArithmeticException();
            //#endif 
            Debug.Assert(c <= 0x9000016FBFFFC2F8);
            // [d u8 0 0 0 0 0 0 0 0 t9 c-u8*R0 t7 t6 t5 t4 t3 t2 t1 t0] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] 

            r[3] = t3;
#if VERIFY
            if (((r[3]) >> (26)) != 0)
                throw new ArithmeticException();
#endif
            // [d u8 0 0 0 0 0 0 0 0 t9 c-u8*R0 t7 t6 t5 t4 r3 t2 t1 t0] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] 
            r[4] = t4;
#if VERIFY
            if (((r[4]) >> (26)) != 0)
                throw new ArithmeticException();
#endif
            // [d u8 0 0 0 0 0 0 0 0 t9 c-u8*R0 t7 t6 t5 r4 r3 t2 t1 t0] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] 
            r[5] = t5;
#if VERIFY
            if (((r[5]) >> (26)) != 0)
                throw new ArithmeticException();
#endif
            // [d u8 0 0 0 0 0 0 0 0 t9 c-u8*R0 t7 t6 r5 r4 r3 t2 t1 t0] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] 
            r[6] = t6;
#if VERIFY
            if (((r[6]) >> (26)) != 0)
                throw new ArithmeticException();
#endif
            // [d u8 0 0 0 0 0 0 0 0 t9 c-u8*R0 t7 r6 r5 r4 r3 t2 t1 t0] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] 
            r[7] = t7;
#if VERIFY
            if (((r[7]) >> (26)) != 0)
                throw new ArithmeticException();
#endif
            // [d u8 0 0 0 0 0 0 0 0 t9 c-u8*R0 r7 r6 r5 r4 r3 t2 t1 t0] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] 

            r[8] = (UInt32)(c & m); c >>= 26; c += u8 * r1;
#if VERIFY
            if (((r[8]) >> (26)) != 0
            || ((c) >> (39)) != 0)
                throw new ArithmeticException();
#endif
            // [d u8 0 0 0 0 0 0 0 0 t9+c-u8*R1 r8-u8*R0 r7 r6 r5 r4 r3 t2 t1 t0] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] 
            // [d 0 0 0 0 0 0 0 0 0 t9+c r8 r7 r6 r5 r4 r3 t2 t1 t0] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] 
            c += d * r0 + t9;
#if VERIFY
            if (((c) >> (45)) != 0)
                throw new ArithmeticException();
#endif
            // [d 0 0 0 0 0 0 0 0 0 c-d*R0 r8 r7 r6 r5 r4 r3 t2 t1 t0] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] 
            r[9] = (UInt32)(c & (m >> 4)); c >>= 22; c += d * (r1 << 4);
#if VERIFY
            if (((r[9]) >> (22)) != 0
            || ((c) >> (46)) != 0)
                throw new ArithmeticException();
#endif
            // [d 0 0 0 0 0 0 0 0 r9+((c-d*R1<<4)<<22)-d*R0 r8 r7 r6 r5 r4 r3 t2 t1 t0] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] 
            // [d 0 0 0 0 0 0 0 -d*R1 r9+(c<<22)-d*R0 r8 r7 r6 r5 r4 r3 t2 t1 t0] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] 
            // [r9+(c<<22) r8 r7 r6 r5 r4 r3 t2 t1 t0] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] 

            d = c * (r0 >> 4) + t0;
#if VERIFY
            if (((d) >> (56)) != 0)
                throw new ArithmeticException();
#endif
            // [r9+(c<<22) r8 r7 r6 r5 r4 r3 t2 t1 d-c*R0>>4] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] 
            r[0] = (UInt32)(d & m); d >>= 26;
#if VERIFY
            if (((r[0]) >> (26)) != 0)
                throw new ArithmeticException();
#endif
#if VERIFY
            if (((d) >> (30)) != 0)
                throw new ArithmeticException();
#endif
            // [r9+(c<<22) r8 r7 r6 r5 r4 r3 t2 t1+d r0-c*R0>>4] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] 
            d += c * (r1 >> 4) + t1;
#if VERIFY
            if (((d) >> (53)) != 0)
                throw new ArithmeticException();
#endif
            Debug.Assert(d <= 0x10000003FFFFBF);
            // [r9+(c<<22) r8 r7 r6 r5 r4 r3 t2 d-c*R1>>4 r0-c*R0>>4] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] 
            // [r9 r8 r7 r6 r5 r4 r3 t2 d r0] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] 
            r[1] = (UInt32)(d & m); d >>= 26;
#if VERIFY
            if (((r[1]) >> (26)) != 0)
                throw new ArithmeticException();
#endif
#if VERIFY
            if (((d) >> (27)) != 0)
                throw new ArithmeticException();
#endif
            Debug.Assert(d <= 0x4000000);
            // [r9 r8 r7 r6 r5 r4 r3 t2+d r1 r0] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] 
            d += t2;
#if VERIFY
            if (((d) >> (27)) != 0)
                throw new ArithmeticException();
#endif
            // [r9 r8 r7 r6 r5 r4 r3 d r1 r0] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] 
            r[2] = (UInt32)(d);
#if VERIFY
            if (((r[2]) >> (27)) != 0)
                throw new ArithmeticException();
#endif
            // [r9 r8 r7 r6 r5 r4 r3 r2 r1 r0] = [p18 p17 p16 p15 p14 p13 p12 p11 p10 p9 p8 p7 p6 p5 p4 p3 p2 p1 p0] 
        }
#endif

        public static void Mul(Fe r, Fe a, Fe b)
        {
#if VERIFY
                Debug.Assert(a.magnitude <= 8);
                Debug.Assert(b.magnitude <= 8);
                secp256k1_fe_verify(a);
                secp256k1_fe_verify(b);
                Debug.Assert(r != b);
#endif
            MulInner(r.N, a.N, b.N);
#if VERIFY
                r.magnitude = 1;
                r.normalized = 0;
                secp256k1_fe_verify(r);
#endif
        }

        public static void Sqr(Fe r, Fe a)
        {
#if VERIFY
            Debug.Assert(a.magnitude <= 8);
            secp256k1_fe_verify(a);
#endif
            SqrInner(r.N, a.N);
#if VERIFY
            r.magnitude = 1;
            r.normalized = 0;
            secp256k1_fe_verify(r);
#endif
        }

        public static void Cmov(Fe r, Fe a, bool flag)
        {
            Cmov(r, a, (UInt32)(flag ? 1 : 0));
        }

        public static void Cmov(Fe r, Fe a, UInt32 flag)
        {
            UInt32 mask0, mask1;
            mask0 = flag + ~((UInt32)0);
            mask1 = ~mask0;
            r.N[0] = (r.N[0] & mask0) | (a.N[0] & mask1);
            r.N[1] = (r.N[1] & mask0) | (a.N[1] & mask1);
            r.N[2] = (r.N[2] & mask0) | (a.N[2] & mask1);
            r.N[3] = (r.N[3] & mask0) | (a.N[3] & mask1);
            r.N[4] = (r.N[4] & mask0) | (a.N[4] & mask1);
            r.N[5] = (r.N[5] & mask0) | (a.N[5] & mask1);
            r.N[6] = (r.N[6] & mask0) | (a.N[6] & mask1);
            r.N[7] = (r.N[7] & mask0) | (a.N[7] & mask1);
            r.N[8] = (r.N[8] & mask0) | (a.N[8] & mask1);
            r.N[9] = (r.N[9] & mask0) | (a.N[9] & mask1);
#if VERIFY
            if (a.magnitude > r.magnitude)
            {
            r.magnitude = a.magnitude;
            }
            r.normalized &= a.normalized;
#endif
        }

        /// <summary>
        /// If flag is true, set *r equal to *a; otherwise leave it. Constant-time.
        /// </summary>
        /// <param name="r"></param>
        /// <param name="a"></param>
        /// <param name="flag"></param>
        public static void StorageCmov(FeStorage r, FeStorage a, bool flag)
        {
            UInt32 mask0, mask1;
            mask0 = ~((UInt32)0);
            if (flag)
                mask0++;
            mask1 = ~mask0;
            r.N[0] = (r.N[0] & mask0) | (a.N[0] & mask1);
            r.N[1] = (r.N[1] & mask0) | (a.N[1] & mask1);
            r.N[2] = (r.N[2] & mask0) | (a.N[2] & mask1);
            r.N[3] = (r.N[3] & mask0) | (a.N[3] & mask1);
            r.N[4] = (r.N[4] & mask0) | (a.N[4] & mask1);
            r.N[5] = (r.N[5] & mask0) | (a.N[5] & mask1);
            r.N[6] = (r.N[6] & mask0) | (a.N[6] & mask1);
            r.N[7] = (r.N[7] & mask0) | (a.N[7] & mask1);
        }

        public static void ToStorage(FeStorage r, Fe a)
        {
#if VERIFY
        Debug.Assert(a.normalized);
#endif
            r.N[0] = a.N[0] | a.N[1] << 26;
            r.N[1] = a.N[1] >> 6 | a.N[2] << 20;
            r.N[2] = a.N[2] >> 12 | a.N[3] << 14;
            r.N[3] = a.N[3] >> 18 | a.N[4] << 8;
            r.N[4] = a.N[4] >> 24 | a.N[5] << 2 | a.N[6] << 28;
            r.N[5] = a.N[6] >> 4 | a.N[7] << 22;
            r.N[6] = a.N[7] >> 10 | a.N[8] << 16;
            r.N[7] = a.N[8] >> 16 | a.N[9] << 10;
        }

        /// <summary>
        /// Convert a field element back from the storage type. 
        /// </summary>
        public static void FromStorage(Fe r, FeStorage a)
        {
            r.N[0] = a.N[0] & 0x3FFFFFF;
            r.N[1] = a.N[0] >> 26 | ((a.N[1] << 6) & 0x3FFFFFF);
            r.N[2] = a.N[1] >> 20 | ((a.N[2] << 12) & 0x3FFFFFF);
            r.N[3] = a.N[2] >> 14 | ((a.N[3] << 18) & 0x3FFFFFF);
            r.N[4] = a.N[3] >> 8 | ((a.N[4] << 24) & 0x3FFFFFF);
            r.N[5] = (a.N[4] >> 2) & 0x3FFFFFF;
            r.N[6] = a.N[4] >> 28 | ((a.N[5] << 4) & 0x3FFFFFF);
            r.N[7] = a.N[5] >> 22 | ((a.N[6] << 10) & 0x3FFFFFF);
            r.N[8] = a.N[6] >> 16 | ((a.N[7] << 16) & 0x3FFFFFF);
            r.N[9] = a.N[7] >> 10;
#if VERIFY
            r.magnitude = 1;
            r.normalized = 1;
#endif
        }
    }
#endif
}