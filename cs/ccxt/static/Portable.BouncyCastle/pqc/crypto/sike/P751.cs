using System.Collections.Generic;
using System.IO;

namespace Org.BouncyCastle.Pqc.Crypto.Sike
{
    internal class P751
    : Internal
{
    // Encoding of field elements, elements over Z_order, elements over GF(p^2) and elliptic curve points:
    // --------------------------------------------------------------------------------------------------
    // Elements over GF(p) and Z_order are encoded with the least significant octet (and digit) located at the leftmost position (i.e., little endian format).
    // Elements (a+b*i) over GF(p^2), where a and b are defined over GF(p), are encoded as {a, b}, with a in the least significant position.
    // Elliptic curve points P = (x,y) are encoded as {x, y}, with x in the least significant position.
    // Internally, the number of digits used to represent all these elements is obtained by approximating the number of bits to the immediately greater multiple of 32.
    // For example, a 751-bit field element is represented with Ceil(751 / 64) = 12 64-bit digits or Ceil(751 / 32) = 24 32-bit digits.

    //
    // Curve isogeny system "SIDHp751". Base curve: Montgomery curve By^2 = Cx^3 + Ax^2 + Cx defined over GF(p751^2), where A=6, B=1, C=1 and p751 = 2^372*3^239-1
    //
    internal P751(bool isCompressed)
    {
        this.COMPRESS = isCompressed;
        CRYPTO_SECRETKEYBYTES = 644;
        CRYPTO_PUBLICKEYBYTES = 564;
        CRYPTO_BYTES = 32;
        CRYPTO_CIPHERTEXTBYTES = 596;
        if(isCompressed)
        {
            CRYPTO_SECRETKEYBYTES = 602;
            CRYPTO_PUBLICKEYBYTES = 335;
            CRYPTO_CIPHERTEXTBYTES = 410;
        }


        NWORDS_FIELD = 12;  // Number of words of a 751-bit field element
        PRIME_ZERO_WORDS = 5;   // Number of "0" digits in the least significant part of p751 + 1


        // Basic constants
        NBITS_FIELD = 751;
        MAXBITS_FIELD = 768;
        MAXWORDS_FIELD = ((MAXBITS_FIELD+RADIX-1)/RADIX);           // Max. number of words to represent field elements
        NWORDS64_FIELD = ((NBITS_FIELD+63)/64);         // Number of 64-bit words of a 751-bit field element
        NBITS_ORDER = 384;
        NWORDS_ORDER = ((NBITS_ORDER+RADIX-1)/RADIX);           // Number of words of oA and oB, where oA and oB are the subgroup orders of Alice and Bob, resp.
        NWORDS64_ORDER = ((NBITS_ORDER+63)/64);         // Number of 64-bit words of a 384-bit element
        MAXBITS_ORDER = NBITS_ORDER;
        ALICE = 0;
        BOB = 1;
        OALICE_BITS = 372;
        OBOB_BITS = 379;
        OBOB_EXPON = 239;
        MASK_ALICE = 0x0F;
        MASK_BOB = 0x03;
        PARAM_A = 6;
        PARAM_C = 1;
        // Fixed parameters for isogeny tree computation
        MAX_INT_POINTS_ALICE = 8;
        MAX_INT_POINTS_BOB = 10;
        MAX_Alice = 186;
        MAX_Bob = 239;
        MSG_BYTES = 32;
        SECRETKEY_A_BYTES = ((OALICE_BITS + 7) / 8);
        SECRETKEY_B_BYTES = ((OBOB_BITS - 1 + 7) / 8);
        FP2_ENCODED_BYTES = 2*((NBITS_FIELD + 7) / 8);


        PRIME = new ulong[] { 0xFFFFFFFFFFFFFFFFL, 0xFFFFFFFFFFFFFFFFL, 0xFFFFFFFFFFFFFFFFL, 0xFFFFFFFFFFFFFFFFL, 0xFFFFFFFFFFFFFFFFL, 0xEEAFFFFFFFFFFFFFL,
                0xE3EC968549F878A8L, 0xDA959B1A13F7CC76L, 0x084E9867D6EBE876L, 0x8562B5045CB25748L, 0x0E12909F97BADC66L, 0x00006FE5D541F71CL };
        PRIMEx2 = new ulong[] { 0xFFFFFFFFFFFFFFFEL, 0xFFFFFFFFFFFFFFFFL, 0xFFFFFFFFFFFFFFFFL, 0xFFFFFFFFFFFFFFFFL, 0xFFFFFFFFFFFFFFFFL, 0xDD5FFFFFFFFFFFFFL,
                0xC7D92D0A93F0F151L, 0xB52B363427EF98EDL, 0x109D30CFADD7D0EDL, 0x0AC56A08B964AE90L, 0x1C25213F2F75B8CDL, 0x0000DFCBAA83EE38L };
        PRIMEx4 = new ulong[] { 0xFFFFFFFFFFFFFFFCL, 0xFFFFFFFFFFFFFFFFL, 0xFFFFFFFFFFFFFFFFL, 0xFFFFFFFFFFFFFFFFL, 0xFFFFFFFFFFFFFFFFL, 0xBABFFFFFFFFFFFFFL,
                0x8FB25A1527E1E2A3L, 0x6A566C684FDF31DBL, 0x213A619F5BAFA1DBL, 0x158AD41172C95D20L, 0x384A427E5EEB719AL, 0x0001BF975507DC70L };
        PRIMEp1 = new ulong[] { 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0xEEB0000000000000L,
                0xE3EC968549F878A8L, 0xDA959B1A13F7CC76L, 0x084E9867D6EBE876L, 0x8562B5045CB25748L, 0x0E12909F97BADC66L, 0x00006FE5D541F71CL };
        PRIMEx16p = new ulong[] { 0x0000000000000010L, 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x2A00000000000000L,
                0x826D2F56C0F0EAE2L, 0xAD4C9CBD81067123L, 0xF62CF3052282F124L, 0x53A95F7469B516FEL, 0x3DADEC0D08A4732FL, 0x58AD934557C11C7EL,
                0x7F731B89B2DA43F2L, 0x51AE9F5F5F6AFF3BL, 0xD74319A6C9BCA375L, 0x5BAB790796CF84D4L, 0xA421554FE2E49CA8L, 0x20AD617C8DF437CFL,
                0x3AB06E7A12F5FF7BL, 0x70A25E037E40347EL, 0x51F1D323FB4C1151L, 0xAE0D99AA4835FED9L, 0xDF5429960D2536B6L, 0x000000030E91D466L };
        Alice_order = new ulong[] { 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x0010000000000000L };
        Bob_order = new ulong[] { 0xC968549F878A8EEBL, 0x59B1A13F7CC76E3EL, 0xE9867D6EBE876DA9L, 0x2B5045CB25748084L, 0x2909F97BADC66856L, 0x06FE5D541F71C0E1L };
        A_gen = new ulong[] { 0x884F46B74000BAA8L, 0xBA52630F939DEC20L, 0xC16FB97BA714A04DL, 0x082536745B1AB3DBL, 0x1117157F446F9E82L, 0xD2F27D621A018490L,
                0x6B24AB523D544BCDL, 0x9307D6AA2EA85C94L, 0xE1A096729528F20FL, 0x896446F868F3255CL, 0x2401D996B1BFF8A5L, 0x00000EF8786A5C0AL,   // XPA0
                0xAEB78B3B96F59394L, 0xAB26681E29C90B74L, 0xE520AC30FDC4ACF1L, 0x870AAAE3A4B8111BL, 0xF875BDB738D64EFFL, 0x50109A7ECD7ED6BCL,
                0x4CC64848FF0C56FBL, 0xE617CB6C519102C9L, 0x9C74B3835921E609L, 0xC91DDAE4A35A7146L, 0x7FC82A155C1B9129L, 0x0000214FA6B980B3L,   // XPA1
                0x0F93CC38680A8CA9L, 0x762E733822E7FED7L, 0xE549F005AC0ADB67L, 0x94A71FDD2C43A4EDL, 0xD48645C2B04721C5L, 0x432DA1FE4D4CA4DCL,
                0xBC99655FAA7A80E8L, 0xB2C6D502BCFD4823L, 0xEE92F40CA2EC8BDBL, 0x7B074132EFB6D16CL, 0x3340B46FA38A7633L, 0x0000215749657F6CL,   // XQA0
                0xECFF375BF3079F4CL, 0xFBFE74B043E80EF3L, 0x17376CBE3C5C7AD1L, 0xC06327A7E29CDBF2L, 0x2111649C438BF3D4L, 0xC1F9298261BA2E97L,
                0x1F9FECE869CFD1C2L, 0x01A39B4FC9346D62L, 0x147CD1D3E82A3C9FL, 0xDE84E9D249E533EEL, 0x1C48A5ADFB7C578DL, 0x000061ACA0B82E1DL,   // XQA1
                0x1600C525D41059F1L, 0xA596899A0A1D83F7L, 0x6BFDEED6D2B23F35L, 0x5C7E707270C23910L, 0x276CA1A4E8369411L, 0xB193651A602925A0L,
                0x243D239F1CA1F04AL, 0x543DC6DA457860ADL, 0xCDA590F325181DE9L, 0xD3AB7ACFDA80B395L, 0x6C97468580FDDF7BL, 0x0000352A3E5C4C77L,   // XRA0
                0x9B794F9FD1CC3EE8L, 0xDB32E40A9B2FD23EL, 0x26192A2542E42B67L, 0xA18E94FCA045BCE7L, 0x96DC1BC38E7CDA2DL, 0x9A1D91B752487DE2L,
                0xCC63763987436DA3L, 0x1316717AACCC551DL, 0xC4C368A4632AFE72L, 0x4B6EA85C9CCD5710L, 0x7A12CAD582C7BC9AL, 0x00001C7E240149BFL }; // XRA1
        B_gen = new ulong[] { 0x85691AAF4015F88CL, 0x7478C5B8C36E9631L, 0x7EF2A185DE4DD6E2L, 0x943BBEE46BEB9DC7L, 0x1A3EC62798792D22L, 0x791BC4B084B31D69L,
                0x03DBE6522CEA17C4L, 0x04749AA65D665D83L, 0x3D52B5C45EF450F3L, 0x0B4219848E36947DL, 0xA4CF7070466BDE27L, 0x0000334B1FA6D193L,   // XPB0
                0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L,
                0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L,   // XPB1
                0x8E7CB3FA53211340L, 0xD67CE54F7A05EEE0L, 0xFDDC2C8BCE46FC38L, 0x08587FAE3110DF1EL, 0xD6B8246FA22B058BL, 0x4DAC3ACC905A5DBDL,
                0x51D0BF2FADCED3E8L, 0xE5A2406DF6484425L, 0x907F177584F671B8L, 0x4738A2FFCCED051CL, 0x2B0067B4177E4853L, 0x00002806AC948D3DL,   // XQB0
                0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L,
                0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L,   // XQB1
                0xB56457016D1D6D1CL, 0x03DECCB38F39C491L, 0xDFB910AC8A559452L, 0xA9D0F17D1FF24883L, 0x8562BBAF515C248CL, 0x249B2A6DDB1CB67DL,
                0x3131AF96FB46835CL, 0xE10258398480C3E1L, 0xEAB5E2B872D4FAB1L, 0xB71E63875FAEB1DFL, 0xF8384D4F13757CF6L, 0x0000361EC9B09912L,   // XRB0
                0x58C967899ED16EF4L, 0x81998376DC622A4BL, 0x3D1C1DCFE0B12681L, 0x9347DEBB953E1730L, 0x9ABB344D3A82C2D7L, 0xE4881BD2820552B2L,
                0x0037247923D90266L, 0x2E3156EDB157E5A5L, 0xF86A46A7506823F7L, 0x8FE5523A7B7F1CFCL, 0xFA3CFFA38372F67BL, 0x0000692DCE85FFBDL }; // XRB1
        Montgomery_R2 = new ulong[] { 0x233046449DAD4058L, 0xDB010161A696452AL, 0x5E36941472E3FD8EL, 0xF40BFE2082A2E706L, 0x4932CCA8904F8751L, 0x1F735F1F1EE7FC81L,
                0xA24F4D80C1048E18L, 0xB56C383CCDB607C5L, 0x441DD47B735F9C90L, 0x5673ED2C6A6AC82AL, 0x06C905261132294BL, 0x000041AD830F1F35L };
        Montgomery_one = new ulong[] { 0x00000000000249adL, 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x8310000000000000L,
                0x5527b1e4375c6c66L, 0x697797bf3f4f24d0L, 0xc89db7b2ac5c4e2eL, 0x4ca4b439d2076956L, 0x10f7926c7512c7e9L, 0x00002d5b24bce5e2L };

        strat_Alice = new uint[] {
                80, 48, 27, 15, 8, 4, 2, 1, 1, 2, 1, 1, 4, 2, 1, 1, 2, 1, 1, 7, 4, 2, 1, 1, 2, 1,
                1, 3, 2, 1, 1, 1, 1, 12, 7, 4, 2, 1, 1, 2, 1, 1, 3, 2, 1, 1, 1, 1, 5, 3, 2, 1, 1,
                1, 1, 2, 1, 1, 1, 21, 12, 7, 4, 2, 1, 1, 2, 1, 1, 3, 2, 1, 1, 1, 1, 5, 3, 2, 1,
                1, 1, 1, 2, 1, 1, 1, 9, 5, 3, 2, 1, 1, 1, 1, 2, 1, 1, 1, 4, 2, 1, 1, 1, 2, 1, 1,
                33, 20, 12, 7, 4, 2, 1, 1, 2, 1, 1, 3, 2, 1, 1, 1, 1, 5, 3, 2, 1, 1, 1, 1, 2, 1,
                1, 1, 8, 5, 3, 2, 1, 1, 1, 1, 2, 1, 1, 1, 4, 2, 1, 1, 2, 1, 1, 16, 8, 4, 2, 1, 1,
                1, 2, 1, 1, 4, 2, 1, 1, 2, 1, 1, 8, 4, 2, 1, 1, 2, 1, 1, 4, 2, 1, 1, 2, 1, 1 };

        strat_Bob = new uint[] {
                112, 63, 32, 16, 8, 4, 2, 1, 1, 2, 1, 1, 4, 2, 1, 1, 2, 1, 1, 8, 4, 2, 1, 1, 2, 1,
                1, 4, 2, 1, 1, 2, 1, 1, 16, 8, 4, 2, 1, 1, 2, 1, 1, 4, 2, 1, 1, 2, 1, 1, 8, 4, 2,
                1, 1, 2, 1, 1, 4, 2, 1, 1, 2, 1, 1, 31, 16, 8, 4, 2, 1, 1, 2, 1, 1, 4, 2, 1, 1, 2,
                1, 1, 8, 4, 2, 1, 1, 2, 1, 1, 4, 2, 1, 1, 2, 1, 1, 15, 8, 4, 2, 1, 1, 2, 1, 1, 4,
                2, 1, 1, 2, 1, 1, 7, 4, 2, 1, 1, 2, 1, 1, 3, 2, 1, 1, 1, 1, 49, 31, 16, 8, 4, 2,
                1, 1, 2, 1, 1, 4, 2, 1, 1, 2, 1, 1, 8, 4, 2, 1, 1, 2, 1, 1, 4, 2, 1, 1, 2, 1, 1,
                15, 8, 4, 2, 1, 1, 2, 1, 1, 4, 2, 1, 1, 2, 1, 1, 7, 4, 2, 1, 1, 2, 1, 1, 3, 2, 1,
                1, 1, 1, 21, 12, 8, 4, 2, 1, 1, 2, 1, 1, 4, 2, 1, 1, 2, 1, 1, 5, 3, 2, 1, 1, 1, 1,
                2, 1, 1, 1, 9, 5, 3, 2, 1, 1, 1, 1, 2, 1, 1, 1, 4, 2, 1, 1, 1, 2, 1, 1 };


        if(COMPRESS)
        {
            MASK2_BOB = 0x00;
            MASK3_BOB = 0xFF;
            ORDER_A_ENCODED_BYTES = SECRETKEY_A_BYTES;
            ORDER_B_ENCODED_BYTES = SECRETKEY_B_BYTES;
            PARTIALLY_COMPRESSED_CHUNK_CT = (4 * ORDER_A_ENCODED_BYTES + FP2_ENCODED_BYTES + 2);
            COMPRESSED_CHUNK_CT = (3 * ORDER_A_ENCODED_BYTES + FP2_ENCODED_BYTES + 2);
            UNCOMPRESSEDPK_BYTES = 564;
            // Table sizes used by the Entangled basis generation
            TABLE_R_LEN = 17;
            TABLE_V_LEN = 34;
            TABLE_V3_LEN = 20;
            // Parameters for discrete log computations
            // Binary Pohlig-Hellman reduced to smaller logs of order ell^W
            W_2 = 4;
            W_3 = 3;
            // ell^w
            ELL2_W = (uint) (1 << (int)W_2);
            ELL3_W = 27;
            // ell^(e mod w)
            ELL2_EMODW = (uint) (1 << (int)(OALICE_BITS % W_2));
            ELL3_EMODW = 9;
            // # of digits in the discrete log
            DLEN_2 = ((OALICE_BITS + W_2 - 1) / W_2);
            DLEN_3 = ((OBOB_EXPON + W_3 - 1) / W_3);
            PLEN_2 = 94;
            PLEN_3 = 81;

            // Import compression tables from properties
            _props = new Dictionary<string, string>(); 
            Stream input = typeof(P751).Assembly
                    .GetManifestResourceStream("Org.BouncyCastle.pqc.crypto.sike.p751.properties");
            
            using (StreamReader sr = new StreamReader(input))
            {
                    // load a properties file
                    string line = sr.ReadLine();
                    string matrix, hexString;
                    int i = 0;
                    while (line != null)
                    {
                            string header = line;
                            if (header != "")
                            {
                                    if (i > 1)
                                    {
                                            header = header.Replace(",", "");
                                    }
                                    int index = header.IndexOf('=');
                                    matrix = header.Substring(0, index).Trim();
                                    hexString = header.Substring(index + 1).Trim();
                                    _props.Add(matrix, hexString);
                            }

                            line = sr.ReadLine();
                            i++;
                    }
            }
            ph2_path = ReadIntsFromProperty("ph2_path", PLEN_2);
            ph3_path = ReadIntsFromProperty("ph3_path", PLEN_3);
            A_gen = ReadFromProperty("A_gen", 6 * NWORDS64_FIELD);
            B_gen = ReadFromProperty("B_gen", 6 * NWORDS64_FIELD);
            XQB3 = ReadFromProperty("XQB3", 2 * NWORDS64_FIELD);
            A_basis_zero = ReadFromProperty("A_basis_zero", 8 * NWORDS64_FIELD);
            B_basis_zero = ReadFromProperty("B_basis_zero", 8 * NWORDS64_FIELD);
            B_gen_3_tors = ReadFromProperty("B_gen_3_tors", 16 * NWORDS64_FIELD);
            g_R_S_im = ReadFromProperty("g_R_S_im", NWORDS64_FIELD );
            Montgomery_R2 = ReadFromProperty("Montgomery_R2", NWORDS64_FIELD);
            Montgomery_RB1 = ReadFromProperty("Montgomery_RB1", NWORDS64_FIELD);
            Montgomery_RB2 = ReadFromProperty("Montgomery_RB2", NWORDS64_FIELD);
            Montgomery_one = ReadFromProperty( "Montgomery_one", NWORDS64_FIELD);
            threeinv = ReadFromProperty("threeinv", NWORDS64_FIELD);
            u_entang = ReadFromProperty("u_entang", 2 * NWORDS64_FIELD);
            u0_entang = ReadFromProperty("u0_entang", 2 * NWORDS64_FIELD);
            table_r_qr = ReadFromProperty("table_r_qr", TABLE_R_LEN, NWORDS64_FIELD);
            table_r_qnr = ReadFromProperty("table_r_qnr", TABLE_R_LEN, NWORDS64_FIELD);
            table_v_qr = ReadFromProperty("table_v_qr", TABLE_V_LEN, NWORDS64_FIELD);
            table_v_qnr = ReadFromProperty("table_v_qnr", TABLE_V_LEN, NWORDS64_FIELD);
            v_3_torsion = ReadFromProperty("v_3_torsion", TABLE_V3_LEN, 2, NWORDS64_FIELD);
            T_tate3 = ReadFromProperty("T_tate3", (6 * (OBOB_EXPON - 1) + 4) * NWORDS64_FIELD);
            T_tate2_firststep_P = ReadFromProperty("T_tate2_firststep_P", 4 * NWORDS64_FIELD);
            T_tate2_P = ReadFromProperty("T_tate2_P", 3 * (OALICE_BITS - 2) * NWORDS64_FIELD);
            T_tate2_firststep_Q = ReadFromProperty("T_tate2_firststep_Q", 4 * NWORDS64_FIELD);
            T_tate2_Q = ReadFromProperty("T_tate2_Q", 3 * (OALICE_BITS - 2) * NWORDS64_FIELD);
            ph2_T = ReadFromProperty("ph2_T",DLEN_2*(ELL2_W >> 1)*2*NWORDS64_FIELD);
            ph3_T1 = ReadFromProperty( "ph3_T1", DLEN_3*(ELL3_W>>1)*2*NWORDS64_FIELD);
            ph3_T2 = ReadFromProperty( "ph3_T2", DLEN_3*(ELL3_W>>1)*2*NWORDS64_FIELD);

            Montgomery_R = new ulong[NWORDS64_FIELD];
            ph2_T1 = new ulong[2*((DLEN_2 - 1)*(ELL2_W/2) + (ph2_path[PLEN_2 - 1]-1))];
            ph2_T2 = new ulong[2*((DLEN_2 - 1)*(ELL2_W/2) + (ph2_path[PLEN_2 - 1]-1))];
            ph3_T = new ulong[DLEN_3*(ELL3_W>>1)*2*NWORDS64_FIELD];
        }


    }
}

}