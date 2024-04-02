using System.Collections.Generic;
using System.IO;

namespace Org.BouncyCastle.Pqc.Crypto.Sike
{
    internal class P610
    : Internal
{
        internal P610(bool isCompressed)
    {
        this.COMPRESS = isCompressed;
        CRYPTO_SECRETKEYBYTES = 524;
        CRYPTO_PUBLICKEYBYTES = 462;
        CRYPTO_BYTES = 24;
        CRYPTO_CIPHERTEXTBYTES = 486;
        if(isCompressed)
        {
            CRYPTO_SECRETKEYBYTES =  491;
            CRYPTO_PUBLICKEYBYTES =  274;
            CRYPTO_CIPHERTEXTBYTES = 336;
        }


        NWORDS_FIELD = 10;  // Number of words of a 610-bit field element
        PRIME_ZERO_WORDS = 4;    // Number of "0" digits in the least significant part of p610 + 1



        // Basic constants

        NBITS_FIELD = 610;
        MAXBITS_FIELD = 640;
        MAXWORDS_FIELD = ((MAXBITS_FIELD+RADIX-1)/RADIX);   // Max. number of words to represent field elements
        NWORDS64_FIELD = ((NBITS_FIELD+63)/64);     // Number of 64-bit words of a 610-bit field element
        NBITS_ORDER = 320;
        NWORDS_ORDER = ((NBITS_ORDER+RADIX-1)/RADIX);   // Number of words of oA and oB, where oA and oB are the subgroup orders of Alice and Bob, resp
        NWORDS64_ORDER = ((NBITS_ORDER+63)/64);     // Number of 64-bit words of a 320-bit element
        MAXBITS_ORDER = NBITS_ORDER;
        ALICE = 0;
        BOB = 1;
        OALICE_BITS = 305;
        OBOB_BITS = 305;
        OBOB_EXPON = 192;
        MASK_ALICE = 0x01;
        MASK_BOB = 0xFF;
        PARAM_A = 6;
        PARAM_C = 1;
        // Fixed parameters for isogeny tree computation
        MAX_INT_POINTS_ALICE = 8;
        MAX_INT_POINTS_BOB = 10;
        MAX_Alice = 152;
        MAX_Bob = 192;
        MSG_BYTES = 24;
        SECRETKEY_A_BYTES = ((OALICE_BITS + 7) / 8);
        SECRETKEY_B_BYTES = ((OBOB_BITS - 1 + 7) / 8);
        FP2_ENCODED_BYTES = 2*((NBITS_FIELD + 7) / 8);

        PRIME = new ulong[] { 0xFFFFFFFFFFFFFFFFL, 0xFFFFFFFFFFFFFFFFL, 0xFFFFFFFFFFFFFFFFL, 0xFFFFFFFFFFFFFFFFL, 0x6E01FFFFFFFFFFFFL,
                0xB1784DE8AA5AB02EL, 0x9AE7BF45048FF9ABL, 0xB255B2FA10C4252AL, 0x819010C251E7D88CL, 0x000000027BF6A768L };
        PRIMEx2 = new ulong[] { 0xFFFFFFFFFFFFFFFEL, 0xFFFFFFFFFFFFFFFFL, 0xFFFFFFFFFFFFFFFFL, 0xFFFFFFFFFFFFFFFFL, 0xDC03FFFFFFFFFFFFL,
                0x62F09BD154B5605CL, 0x35CF7E8A091FF357L, 0x64AB65F421884A55L, 0x03202184A3CFB119L, 0x00000004F7ED4ED1L };
        PRIMEx4 = new ulong[] { 0xFFFFFFFFFFFFFFFCL, 0xFFFFFFFFFFFFFFFFL, 0xFFFFFFFFFFFFFFFFL, 0xFFFFFFFFFFFFFFFFL, 0xB807FFFFFFFFFFFFL,
                0xC5E137A2A96AC0B9L, 0x6B9EFD14123FE6AEL, 0xC956CBE8431094AAL, 0x06404309479F6232L, 0x00000009EFDA9DA2L };
        PRIMEp1 = new ulong[] { 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x6E02000000000000L,
                0xB1784DE8AA5AB02EL, 0x9AE7BF45048FF9ABL, 0xB255B2FA10C4252AL, 0x819010C251E7D88CL, 0x000000027BF6A768L };
        PRIMEx16p = new ulong[] { 0x0000000000000010L, 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x3FC0000000000000L,
                0xD0F642EAB4A9FA32L, 0xA308175F6E00CA89L, 0xB549A0BDE77B5AACL, 0xCDFDE7B5C304EE69L, 0x7FDB7FF0812B12EFL,
                0xE09BA529B9FE1167L, 0xD249C196DAB8CD7FL, 0xD4E22754A3F20928L, 0x97825638B19A7CCEL, 0x05E04550FC4CCE0DL,
                0x8FB5DA1152CDE50CL, 0xF9649BA3EA408644L, 0x4473C93E6441063DL, 0xBE190269D1337B7BL, 0x0000000000000062L };
        Alice_order = new ulong[] { 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x0002000000000000L };
        Bob_order = new ulong[] { 0x26F4552D58173701L, 0xDFA28247FCD5D8BCL, 0xD97D086212954D73L, 0x086128F3EC46592AL, 0x00013DFB53B440C8L };
        A_gen = new ulong[] { 0x5019EC96A75AC57AL, 0x8AEA0E717712C6F1L, 0x03C067C819D29E5EL, 0x59F454425FE307D9L, 0x6D29215D9AD5E6D4L,
                0xD8C5A27CDC9DD34AL, 0x972DC274DAB435B3L, 0x82A597C70A80E10FL, 0x48175986EFED547FL, 0x00000000671A3592L,   // XPA0
                0xE4BA9CC3EEEC53F4L, 0xBD34E4FEDB0132D3L, 0x1B7125C87BEE960CL, 0x25D615BF3CFAA355L, 0xFC8EC20DC367D66AL,
                0xB44F3FD1CC73289CL, 0xD84BF51195C2E012L, 0x38D7C756EB370F48L, 0xBBC236249F94F72AL, 0x000000013020CC63L,   // XPA1
                0x1D7C945D3DBCC38CL, 0x9A5F7C12CA8BA5B9L, 0x1E8F87985B01CBE3L, 0xD2CABF82F5BC5235L, 0x3BDE474ECCA9FAA2L,
                0xB98CD975DF9FB0A8L, 0x444E4464B9C67790L, 0xCB2E888565CE6AD9L, 0xDB64FFE2A1C350E2L, 0x00000001D7532756L,   // XQA0
                0x1E8B3AA2382C9079L, 0x28CB31E08A943C00L, 0xE04D02266E8A63E1L, 0x84A2D260214EF65FL, 0xD5933DA25018E226L,
                0xBC8BF038928C4BA9L, 0x91E9D0CB7EAF58A9L, 0x04A4627B75E008E1L, 0x58CEF27583E50C2EL, 0x00000002170DDF44L,   // XQA1
                0x261DD0782CEC958DL, 0xC25B3AE64BBC0311L, 0x9F21B8A8981B15FEL, 0xA3C0B52CD5FFC45BL, 0x5D2E65A016702C6AL,
                0x8C5586CA98722EDEL, 0x61490A967A6B4B1AL, 0xFA64E30231F719AFL, 0x9CEAB8B6301BB2DFL, 0x00000000CF5AEA7DL,   // XRA0
                0xB980435A77B912C0L, 0x2B4A97F70E0FC873L, 0x415C7FA4DE96F43CL, 0xE5EED95643E443FDL, 0xCBE18DB57C51B354L,
                0x51C96C3FFABD2D46L, 0x5C14637B9A5765D6L, 0x45D2369C4D0199A5L, 0x25A1F9C5BBF1E683L, 0x000000025AD7A11BL }; // XRA1
        B_gen = new ulong[] { 0xC6C8E180E41884BAL, 0x2161D2F4FBC32B95L, 0xCBF83091BDB34092L, 0xD742CC0AD4CC7E38L, 0x61A1FA7E1B14FBD7L,
                0xF0E5FC70137597C4L, 0x1F0C8F2585E20B1FL, 0xC68E44A1C032A4C2L, 0xE3C65FB8AF155A0DL, 0x00000001409EE8D5L,   // XPB0
                0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L,
                0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L,   // XPB1
                0xF586DB4A16BE1880L, 0x712F10D95E6C65A9L, 0x9D5AAC3B83584B87L, 0x4ECDAA98182C8261L, 0xAD7D4C15588FD230L,
                0x4197C54E96B7D926L, 0xED15BB13E8C588EDL, 0x3E299AEAD5AAD7C7L, 0xF36B25F1BD579F79L, 0x000000021CE65B5BL,   // XQB0
                0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L,
                0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L,   // XQB1
                0x7A87897A0C4C3FD7L, 0x3C1879ECD4D33D76L, 0x595C28A36FFBA1A0L, 0xF53FF66A2A7FD0FBL, 0xB39F5A91230E56FAL,
                0x81F21610DA3EA8B5L, 0xEBB3B9A627428A90L, 0x8661123B35748010L, 0xE196173B9C48781DL, 0x00000002198166ACL,   // XRB0
                0x5E3CC79B37006D6AL, 0xE0358A9AB2EA7923L, 0x3B725CB595180951L, 0x0724637F1DD0C191L, 0x7BB031B67DAB9D19L,
                0x53CCB8BECEDD3435L, 0xEE5DF7FFEBFA7A0AL, 0x899EDB7D8B9694C4L, 0x0CA38EB4AE5506B6L, 0x00000001489DE1CDL }; // XRB1
        Montgomery_R2 = new ulong[] { 0xE75F5D201A197727L, 0xE0B85963B627392EL, 0x6BC1707818DE493DL, 0xDC7F419940D1A0C5L, 0x7358030979EDE54AL,
                0x84F4BEBDEED75A5CL, 0x7ECCA66E13427B47L, 0xC5BB4E65280080B3L, 0x7019950F516DA19AL, 0x000000008E290FF3L };
        Montgomery_one = new ulong[] { 0x00000000670CC8E6L, 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x9A34000000000000L,
                0x4D99C2BD28717A3FL, 0x0A4A1839A323D41CL, 0xD2B62215D06AD1E2L, 0x1369026E862CAF3DL, 0x000000010894E964L };

        strat_Alice = new uint[] {
                67, 37, 21, 12, 7, 4, 2, 1, 1, 2, 1, 1, 3, 2, 1, 1, 1, 1, 5, 3, 2, 1, 1, 1, 1,
                2, 1, 1, 1, 9, 5, 3, 2, 1, 1, 1, 1, 2, 1, 1, 1, 4, 2, 1, 1, 1, 2, 1, 1, 16, 9,
                5, 3, 2, 1, 1, 1, 1, 2, 1, 1, 1, 4, 2, 1, 1, 1, 2, 1, 1, 8, 4, 2, 1, 1, 2, 1,
                1, 4, 2, 1, 1, 2, 1, 1, 33, 16, 8, 5, 2, 1, 1, 1, 2, 1, 1, 1, 4, 2, 1, 1, 2, 1,
                1, 8, 4, 2, 1, 1, 2, 1, 1, 4, 2, 1, 1, 2, 1, 1, 16, 8, 4, 2, 1, 1, 1, 2, 1, 1,
                4, 2, 1, 1, 2, 1, 1, 8, 4, 2, 1, 1, 2, 1, 1, 4, 2, 1, 1, 2, 1, 1 };

        strat_Bob = new uint[] {
                86, 48, 27, 15, 8, 4, 2, 1, 1, 2, 1, 1, 4, 2, 1, 1, 2, 1, 1, 7, 4, 2, 1, 1, 2, 1,
                1, 3, 2, 1, 1, 1, 1, 12, 7, 4, 2, 1, 1, 2, 1, 1, 3, 2, 1, 1, 1, 1, 5, 3, 2, 1, 1,
                1, 1, 2, 1, 1, 1, 21, 12, 7, 4, 2, 1, 1, 2, 1, 1, 3, 2, 1, 1, 1, 1, 5, 3, 2, 1, 1,
                1, 1, 2, 1, 1, 1, 9, 5, 3, 2, 1, 1, 1, 1, 2, 1, 1, 1, 4, 2, 1, 1, 1, 2, 1, 1, 38,
                21, 12, 7, 4, 2, 1, 1, 2, 1, 1, 3, 2, 1, 1, 1, 1, 5, 3, 2, 1, 1, 1, 1, 2, 1, 1, 1,
                9, 5, 3, 2, 1, 1, 1, 1, 2, 1, 1, 1, 4, 2, 1, 1, 1, 2, 1, 1, 17, 9, 5, 3, 2, 1, 1,
                1, 1, 2, 1, 1, 1, 4, 2, 1, 1, 1, 2, 1, 1, 8, 4, 2, 1, 1, 1, 2, 1, 1, 4, 2, 1, 1, 2,
                1, 1 };

        if(COMPRESS)
        {
            MASK2_BOB = 0x07;
            MASK3_BOB = 0xFF;
            ORDER_A_ENCODED_BYTES = SECRETKEY_A_BYTES;
            ORDER_B_ENCODED_BYTES = (SECRETKEY_B_BYTES + 1);
            PARTIALLY_COMPRESSED_CHUNK_CT = (4 * ORDER_A_ENCODED_BYTES + FP2_ENCODED_BYTES + 2);
            COMPRESSED_CHUNK_CT = (3 * ORDER_A_ENCODED_BYTES + FP2_ENCODED_BYTES + 2);
            UNCOMPRESSEDPK_BYTES = 480;
            // Table sizes used by the Entangled basis generation
            TABLE_R_LEN = 17;
            TABLE_V_LEN = 34;
            TABLE_V3_LEN = 20;
            // Parameters for discrete log computations
            // Binary Pohlig-Hellman reduced to smaller logs of order ell^W
            W_2 = 5;
            W_3 = 3;
            // ell^w
            ELL2_W = (uint) (1 << (int)W_2);
            ELL3_W = 27;
            // ell^(e mod w)
            ELL2_EMODW = (uint) (1 << (int)(OALICE_BITS % W_2));
            ELL3_EMODW = 1;
            // # of digits in the discrete log
            DLEN_2 = ((OALICE_BITS + W_2 - 1) / W_2);  // ceil(eA/W_2)
            DLEN_3 = ((OBOB_EXPON + W_3 - 1) / W_3);   // ceil(eB/W_3)
            this.PLEN_2 = 62;
            this.PLEN_3 = 65;

            // Import compression tables from properties
            _props = new Dictionary<string, string>(); 
            Stream input = typeof(P610).Assembly
                    .GetManifestResourceStream("Org.BouncyCastle.pqc.crypto.sike.p610.properties");
            
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
                                    i++;
                            }

                            line = sr.ReadLine();
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
            ph3_T = ReadFromProperty( "ph3_T", DLEN_3*(ELL3_W >> 1)*2*NWORDS64_FIELD);

            Montgomery_R = new ulong[NWORDS64_FIELD];
            ph3_T1 = new ulong[DLEN_3*(ELL3_W >> 1)*2*NWORDS64_FIELD];
            ph3_T2 = new ulong[DLEN_3*(ELL3_W >> 1)*2*NWORDS64_FIELD];
            ph2_T1 = new ulong[2*((DLEN_2 - 1)*(ELL2_W/2) + (ph2_path[PLEN_2 - 1]-1))];
            ph2_T2 = new ulong[2*((DLEN_2 - 1)*(ELL2_W/2) + (ph2_path[PLEN_2 - 1]-1))];

        }
    }

}

}