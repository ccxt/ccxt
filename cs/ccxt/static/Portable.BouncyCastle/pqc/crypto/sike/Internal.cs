using System;
using System.Collections.Generic;
using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Pqc.Crypto.Sike
{

    internal abstract class Internal
        {
                protected static Dictionary<string, string> _props;
                
                protected internal static uint RADIX = 64;
                protected internal static uint LOG2RADIX = 6;

                protected internal uint CRYPTO_PUBLICKEYBYTES;
                protected internal int CRYPTO_CIPHERTEXTBYTES;
                protected internal uint CRYPTO_BYTES;
                protected internal uint CRYPTO_SECRETKEYBYTES;



                protected internal uint NWORDS_FIELD;     // Number of words of a n-bit field element
                protected internal uint PRIME_ZERO_WORDS;  // Number of "0" digits in the least significant part of PRIME + 1
                protected internal uint NBITS_FIELD;
                protected internal uint MAXBITS_FIELD;
                protected uint MAXWORDS_FIELD;   // Max. number of words to represent field elements
                protected uint NWORDS64_FIELD;   // Number of 64-bit words of a 434-bit field element
                protected internal uint NBITS_ORDER;
                protected internal uint NWORDS_ORDER;     // Number of words of oA and oB, where oA and oB are the subgroup orders of Alice and Bob, resp.
                protected uint NWORDS64_ORDER;   // Number of 64-bit words of a x-bit element
                protected internal uint MAXBITS_ORDER;
                protected internal uint ALICE;
                protected internal uint BOB;
                protected internal uint OALICE_BITS;
                protected internal uint OBOB_BITS;
                protected internal uint OBOB_EXPON;
                protected internal uint MASK_ALICE;
                protected internal uint MASK_BOB;
                protected uint PARAM_A;
                protected uint PARAM_C;

                // Fixed parameters for isogeny tree computation
                protected internal uint MAX_INT_POINTS_ALICE;
                protected internal uint MAX_INT_POINTS_BOB;
                protected internal uint MAX_Alice;
                protected internal uint MAX_Bob;
                protected internal uint MSG_BYTES;
                protected internal uint SECRETKEY_A_BYTES;
                protected internal uint SECRETKEY_B_BYTES;
                protected internal uint FP2_ENCODED_BYTES;

                protected bool COMPRESS;

                // Compressed Parameters
                protected internal uint MASK2_BOB;
                protected internal uint MASK3_BOB;
                protected internal uint ORDER_A_ENCODED_BYTES;
                protected internal uint ORDER_B_ENCODED_BYTES;
                protected internal uint PARTIALLY_COMPRESSED_CHUNK_CT;
                protected uint COMPRESSED_CHUNK_CT;
                protected uint UNCOMPRESSEDPK_BYTES;
                // Table sizes used by the Entangled basis generation
                protected uint TABLE_R_LEN;
                protected internal uint TABLE_V_LEN;
                protected uint TABLE_V3_LEN;
                // Parameters for discrete log computations
                // Binary Pohlig-Hellman reduced to smaller logs of order ell^W
                protected internal uint W_2;
                protected internal uint W_3;
                // ell^w    
                protected internal uint ELL2_W;
                protected internal uint ELL3_W;
                // ell^(e mod w)
                protected internal uint ELL2_EMODW;
                protected internal uint ELL3_EMODW;
                // # of digits in the discrete log
                protected internal uint DLEN_2; // ceil(eA/W_2)
                protected internal uint DLEN_3; // ceil(eB/W_3)
                // Use compressed tables: FULL_SIGNED


                // Encoding of field elements
                protected internal uint PLEN_2;
                protected internal uint PLEN_3;

                protected internal ulong[] PRIME;
                protected internal ulong[] PRIMEx2;
                protected internal ulong[] PRIMEx4;
                protected internal ulong[] PRIMEp1;
                protected ulong[] PRIMEx16p;
                protected ulong[] PRIMEp1x64;
                protected internal ulong[] Alice_order;        // Order of Alice's subgroup
                protected internal ulong[] Bob_order;     // Order of Bob's subgroup
                protected internal ulong[] A_gen;    // Alice's generator values {XPA0 + XPA1*iL, XQA0 + xQA1*iL, XRA0 + XRA1*i} in GF(p^2)L, expressed in Montgomery representation
                protected internal ulong[] B_gen;    // Bob's generator values {XPB0L, XQB0L, XRB0 + XRB1*i} in GF(p^2)L, expressed in Montgomery representation
                protected internal ulong[] Montgomery_R2;    // Montgomery constant Montgomery_R2 = (2^448)^2 mod p434
                protected internal ulong[] Montgomery_one;    // Value one in Montgomery representation

                // Fixed parameters for isogeny tree computation
                protected internal uint[] strat_Alice;
                protected internal uint[] strat_Bob;

                //Compressed Encodings
                //todo: abstract this more?
                protected internal ulong[] XQB3;
                protected internal ulong[] A_basis_zero;
                protected ulong[] B_basis_zero;
                protected internal ulong[] B_gen_3_tors;
                protected internal ulong[] g_R_S_im;
                protected ulong[] g_phiR_phiS_re;
                protected ulong[] g_phiR_phiS_im;
                protected ulong[] Montgomery_R;
                protected internal ulong[] Montgomery_RB1;
                protected internal ulong[] Montgomery_RB2;
                protected ulong[] threeinv;
                protected internal uint[] ph2_path;
                protected internal uint[] ph3_path;
                protected ulong[] u_entang;
                protected ulong[] u0_entang;
                protected internal ulong[][] table_r_qr;
                protected internal ulong[][] table_r_qnr;
                protected internal ulong[][] table_v_qr;
                protected internal ulong[][] table_v_qnr;
                protected internal ulong[][][] v_3_torsion;

                protected internal ulong[] T_tate3;
                protected internal ulong[] T_tate2_firststep_P;
                protected internal ulong[] T_tate2_P;
                protected internal ulong[] T_tate2_firststep_Q;
                protected internal ulong[] T_tate2_Q;

                ///Compressed Dlogs
                protected internal ulong[] ph2_T;
                protected internal ulong[] ph2_T1;
                protected internal ulong[] ph2_T2;
                protected internal ulong[] ph3_T;
                protected internal ulong[] ph3_T1;
                protected internal ulong[] ph3_T2;


                static protected uint[] ReadIntsFromProperty(string key, uint intSize)
                {
                        uint[] ints = new uint[intSize];
                        string s = _props[key];
                        uint i = 0;
                        foreach (string number in s.Split(','))
                        {
                                ints[i] = UInt32.Parse(number);
                                i++;
                        }
                        return ints;
                }

                static protected ulong[] ReadFromProperty(string key, uint ulongSize)
                {
                        string s = _props[key];
                        s = s.Replace(",", "");
                        byte[] bytes = Hex.Decode(s);
                        ulong[] ulongs = new ulong[ulongSize];
                        for (int i = 0; i < bytes.Length / 8; i++)
                        {
                                ulongs[i] = Pack.BE_To_UInt64(bytes, i * 8);
                        }
                        return ulongs;
                }

                static protected ulong[][] ReadFromProperty(string key, uint d1Size, uint d2Size)
                {
                        string s = _props[key];
                        s = s.Replace(",", "");
                        byte[] bytes = Hex.Decode(s);
                        ulong[][] ulongs = new ulong[d1Size][]; //[d2Size];
                        for (int k = 0; k < d1Size; k++)
                        {
                                ulongs[k] = new ulong[d2Size];
                        }
                        uint i, j;
                        for (uint x = 0; x < bytes.Length / 8; x++)
                        {
                                i = x/d2Size;
                                j = x%d2Size;
                                ulongs[i][j] = Pack.BE_To_UInt64(bytes, (int)x * 8);
                        }
                        return ulongs;
                }

                static protected ulong[][][] ReadFromProperty(string key, uint d1Size, uint d2Size, uint d3Size)
                {
                        string s = _props[key];
                        s = s.Replace(",", "");
                        byte[] bytes = Hex.Decode(s);
                        ulong[][][] ulongs = new ulong[d1Size][][]; //[d2Size][d3Size];
                        for (int l = 0; l < d1Size; l++)
                        {
                                ulongs[l] = new ulong[d2Size][];
                                for (int m = 0; m < d2Size; m++)
                                {
                                        ulongs[l][m] = new ulong[d3Size];
                                }
                        }
                        
                        uint i, j, k;
                        for (uint x = 0; x < bytes.Length / 8; x++)
                        {
                                i = x/(d2Size * d3Size);
                                j = x%(d2Size * d3Size)/d3Size;
                                k = x % d3Size;
                                ulongs[i][j][k] = Pack.BE_To_UInt64(bytes, (int)x * 8);
                        }
                        return ulongs;
                }


        }

}