using System.Collections.Generic;
using System.IO;

namespace Org.BouncyCastle.Pqc.Crypto.Sike
{

    internal class P503
    : Internal
{
    // Encoding of field elements, elements over Z_order, elements over GF(p^2) and elliptic curve points:
    // --------------------------------------------------------------------------------------------------
    // Elements over GF(p) and Z_order are encoded with the least significant octet (and digit) located at the leftmost position (i.e., little endian format).
    // Elements (a+b*i) over GF(p^2), where a and b are defined over GF(p), are encoded as {a, b}, with a in the least significant position.
    // Elliptic curve points P = (x,y) are encoded as {x, y}, with x in the least significant position.
    // Internally, the number of digits used to represent all these elements is obtained by approximating the number of bits to the immediately greater multiple of 32.
    // For example, a 503-bit field element is represented with Ceil(503 / 64) = 8 64-bit digits or Ceil(503 / 32) = 16 32-bit digits.

    //
    // Curve isogeny system "SIDHp503". Base curve: Montgomery curve By^2 = Cx^3 + Ax^2 + Cx defined over GF(p503^2), where A=6, B=1, C=1 and p503 = 2^250*3^159-1
    //
    internal P503(bool isCompressed)
    {
        this.COMPRESS = isCompressed;
        CRYPTO_SECRETKEYBYTES = 434;
        CRYPTO_PUBLICKEYBYTES = 378;
        CRYPTO_BYTES = 24;
        CRYPTO_CIPHERTEXTBYTES = 402;
        if(isCompressed)
        {
            CRYPTO_SECRETKEYBYTES = 407;
            CRYPTO_PUBLICKEYBYTES = 225;
            CRYPTO_CIPHERTEXTBYTES = 280;
        }

        this.NWORDS_FIELD = 8;               // Number of words of a 503-bit field element
        this.PRIME_ZERO_WORDS = 3;               // Number of "0" digits in the least significant part of p503 + 1


        // Basic constants
        this.NBITS_FIELD = 503;
        this.MAXBITS_FIELD = 512;
        this.MAXWORDS_FIELD = ((MAXBITS_FIELD+RADIX-1)/RADIX);    // Max. number of words to represent field elements;
        this.NWORDS64_FIELD = ((NBITS_FIELD+63)/64);              // Number of 64-bit words of a 503-bit field element;
        this.NBITS_ORDER = 256;
        this.NWORDS_ORDER = ((NBITS_ORDER+RADIX-1)/RADIX);        // Number of words of oA and oB, where oA and oB are the subgroup orders of Alice and Bob, resp.;
        this.NWORDS64_ORDER = ((NBITS_ORDER+63)/64);              // Number of 64-bit words of a 256-bit element;
        this.MAXBITS_ORDER = NBITS_ORDER;
        this.ALICE = 0;
        this.BOB = 1;
        this.OALICE_BITS = 250;
        this.OBOB_BITS = 253;
        this.OBOB_EXPON = 159;
        this.MASK_ALICE = 0x03;
        this.MASK_BOB = 0x0F;
        this.PARAM_A = 6;
        this.PARAM_C = 1;
        // Fixed parameters for isogeny tree computation
        this.MAX_INT_POINTS_ALICE = 7;
        this.MAX_INT_POINTS_BOB = 8;
        this.MAX_Alice = 125;
        this.MAX_Bob = 159;
        this.MSG_BYTES = 24;
        this.SECRETKEY_A_BYTES = ((OALICE_BITS + 7) / 8);
        this.SECRETKEY_B_BYTES = ((OBOB_BITS - 1 + 7) / 8);
        this.FP2_ENCODED_BYTES = 2*((NBITS_FIELD + 7) / 8);


        PRIME = new ulong[] { 0xFFFFFFFFFFFFFFFFL, 0xFFFFFFFFFFFFFFFFL, 0xFFFFFFFFFFFFFFFFL, 0xABFFFFFFFFFFFFFFL,0x13085BDA2211E7A0L, 0x1B9BF6C87B7E7DAFL, 0x6045C6BDDA77A4D0L, 0x004066F541811E1EL };
        PRIMEx2 = new ulong[] { 0xFFFFFFFFFFFFFFFEL, 0xFFFFFFFFFFFFFFFFL, 0xFFFFFFFFFFFFFFFFL, 0x57FFFFFFFFFFFFFFL,0x2610B7B44423CF41L, 0x3737ED90F6FCFB5EL, 0xC08B8D7BB4EF49A0L, 0x0080CDEA83023C3CL };
        PRIMEx4 = new ulong[] { 0xFFFFFFFFFFFFFFFCL, 0xFFFFFFFFFFFFFFFFL, 0xFFFFFFFFFFFFFFFFL, 0xAFFFFFFFFFFFFFFFL,0x4C216F6888479E82L, 0x6E6FDB21EDF9F6BCL, 0x81171AF769DE9340L, 0x01019BD506047879L };
        PRIMEp1 = new ulong[] { 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0xAC00000000000000L,0x13085BDA2211E7A0L, 0x1B9BF6C87B7E7DAFL, 0x6045C6BDDA77A4D0L, 0x004066F541811E1EL };
        PRIMEp1x64 = new ulong[] { 0xC216F6888479E82BL, 0xE6FDB21EDF9F6BC4L, 0x1171AF769DE93406L, 0x1019BD5060478798L };
        PRIMEx16p = new ulong[] { 0x0000000000000010L, 0x0000000000000000L, 0x0000000000000000L, 0x8000000000000000L,0x9EF484BBBDC30BEAL, 0x8C8126F090304A1DL, 0xF7472844B10B65FCL, 0x30F32157CFDC3C33L,
                0x1463AB4329A333F7L, 0xDFC933977C47D3A4L, 0x338A3767F6F2520BL, 0x4F8CB7565CCC13FAL,0xDE43B73AACD2189BL, 0xBCF845CAC5405FBDL, 0x516D02A09E684B7AL, 0x0001033A4091BB86L };
        Alice_order = new ulong[] { 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x0400000000000000L };
        Bob_order = new ulong[] { 0xC216F6888479E82BL, 0xE6FDB21EDF9F6BC4L, 0x1171AF769DE93406L, 0x1019BD5060478798L };
        A_gen = new ulong[] { 0x5D083011589AD893L, 0xADFD8D2CB67D0637L, 0x330C9AC34FFB6361L, 0xF0D47489A2E805A2L,
                0x27E2789259C6B8DCL, 0x63866A2C121931B9L, 0x8D4C65A7137DCF44L, 0x003A183AE5967B3FL,   // XPA0
                0x7E3541B8C96D1519L, 0xD3ADAEEC0D61A26CL, 0xC0A2219CE7703DD9L, 0xFF3E46658FCDBC52L,
                0xD5B38DEAE6E196FFL, 0x1AAC826364956D58L, 0xEC9F4875B9A5F27AL, 0x001B0B475AB99843L,   // XPA1
                0x4D83695107D03BADL, 0x221F3299005E2FCFL, 0x78E6AE22F30DECF2L, 0x6D982DB5111253E4L,
                0x504C80A8AB4526A8L, 0xEFD0C3AA210BB024L, 0xCB77483501DC6FCFL, 0x001052544A96BDF3L,   // XQA0
                0x0D74FE3402BCAE47L, 0xDF5B8CDA832D8AEDL, 0xB86BCF06E4BD837EL, 0x892A2933A0FA1F63L,
                0x9F88FC67B6CCB461L, 0x822926EA9DDA3AC8L, 0xEAC8DDE5855425EDL, 0x000618FE6DA37A80L,   // XQA1
                0x1D9D32D2DC877C17L, 0x5517CD8F71D5B02BL, 0x395AFB8F6B60C117L, 0x3AE31AC85F9098C8L,
                0x5F5341C198450848L, 0xF8C609DBEA435C6AL, 0xD832BC7EDC7BA5E4L, 0x002AD98AA6968BF5L,   // XRA0
                0xC466CAB0F73C2E5BL, 0x7B1817148FB2CF9CL, 0x873E87C099E470A0L, 0xBB17AC6D17A7BAC1L,
                0xA146FDCD0F2E2A58L, 0x88B311E9CEAB6201L, 0x37604CF5C7951757L, 0x0006804071C74BF9L }; // XRA1
        B_gen = new ulong[] { 0xDF630FC5FB2468DBL, 0xC30C5541C102040EL, 0x3CDC9987B76511FCL, 0xF54B5A09353D0CDDL,
                0x3ADBA8E00703C42FL, 0x8253F9303DDC95D0L, 0x62D30778763ABFD7L, 0x001CD00FB581CD55L,   // XPB0
                0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L,
                0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L,   // XPB1
                0x2E3457A12B429261L, 0x311F94E89627DCF8L, 0x5B71C98FD1DB73F6L, 0x3671DB7DCFC21541L,
                0xB6D1484C9FE0CF4FL, 0x19CD110717356E35L, 0xF4F9FB00AC9919DFL, 0x0035BC124D38A70BL,   // XQB0
                0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L,
                0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L, 0x0000000000000000L,   // XQB1
                0x2E08BB99413D2952L, 0xD3021467CD088D72L, 0x21017AF859752245L, 0x26314ED8FFD9DE5CL,
                0x4AF43C73344B6686L, 0xCFA1F91149DF0993L, 0xF327A95365587A89L, 0x000DBF54E03D3906L,   // XRB0
                0x03E03FF342F5F304L, 0x993D604D7B4B6E56L, 0x80412F4D9280E71FL, 0x0FFDC9EF990B3982L,
                0xE584E64C51604931L, 0x1374F42AC8B0BBD7L, 0x07D5BC37DFA41A5FL, 0x00396CCFD61FD34CL }; // XRB1
        Montgomery_R2 = new ulong[] { 0x5289A0CF641D011FL, 0x9B88257189FED2B9L, 0xA3B365D58DC8F17AL, 0x5BC57AB6EFF168ECL,
                0x9E51998BD84D4423L, 0xBF8999CBAC3B5695L, 0x46E9127BCE14CDB6L, 0x003F6CFCE8B81771L };
        Montgomery_one = new ulong[] { 0x00000000000003F9L, 0x0000000000000000L, 0x0000000000000000L, 0xB400000000000000L,
                0x63CB1A6EA6DED2B4L, 0x51689D8D667EB37DL, 0x8ACD77C71AB24142L, 0x0026FBAEC60F5953L };
        strat_Alice = new uint[] {
                61, 32, 16, 8, 4, 2, 1, 1, 2, 1, 1, 4, 2, 1, 1, 2, 1, 1, 8, 4, 2, 1, 1, 2, 1, 1,
                4, 2, 1, 1, 2, 1, 1, 16, 8, 4, 2, 1, 1, 2, 1, 1, 4, 2, 1, 1, 2, 1, 1, 8, 4, 2, 1,
                1, 2, 1, 1, 4, 2, 1, 1, 2, 1, 1, 29, 16, 8, 4, 2, 1, 1, 2, 1, 1, 4, 2, 1, 1, 2, 1,
                1, 8, 4, 2, 1, 1, 2, 1, 1, 4, 2, 1, 1, 2, 1, 1, 13, 8, 4, 2, 1, 1, 2, 1, 1, 4, 2,
                1, 1, 2, 1, 1, 5, 4, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1 };
        strat_Bob = new uint[] {
                71, 38, 21, 13, 8, 4, 2, 1, 1, 2, 1, 1, 4, 2, 1, 1, 2, 1, 1, 5, 4, 2, 1, 1, 2, 1,
                1, 2, 1, 1, 1, 9, 5, 3, 2, 1, 1, 1, 1, 2, 1, 1, 1, 4, 2, 1, 1, 1, 2, 1, 1, 17, 9,
                5, 3, 2, 1, 1, 1, 1, 2, 1, 1, 1, 4, 2, 1, 1, 1, 2, 1, 1, 8, 4, 2, 1, 1, 1, 2, 1,
                1, 4, 2, 1, 1, 2, 1, 1, 33, 17, 9, 5, 3, 2, 1, 1, 1, 1, 2, 1, 1, 1, 4, 2, 1, 1, 1,
                2, 1, 1, 8, 4, 2, 1, 1, 1, 2, 1, 1, 4, 2, 1, 1, 2, 1, 1, 16, 8, 4, 2, 1, 1, 1, 2,
                1, 1, 4, 2, 1, 1, 2, 1, 1, 8, 4, 2, 1, 1, 2, 1, 1, 4, 2, 1, 1, 2, 1, 1 };

        if(COMPRESS)
        {
            this.MASK2_BOB = 0x03;
            this.MASK3_BOB = 0xFF;
            this.ORDER_A_ENCODED_BYTES = SECRETKEY_A_BYTES;
            this.ORDER_B_ENCODED_BYTES = SECRETKEY_B_BYTES;
            this.PARTIALLY_COMPRESSED_CHUNK_CT = (4 * ORDER_A_ENCODED_BYTES + FP2_ENCODED_BYTES + 2);
            this.COMPRESSED_CHUNK_CT = (3 * ORDER_A_ENCODED_BYTES + FP2_ENCODED_BYTES + 2);
            this.UNCOMPRESSEDPK_BYTES = 378;
            // Table sizes used by the Entangled basis generation
            this.TABLE_R_LEN = 17;
            this.TABLE_V_LEN = 34;
            this.TABLE_V3_LEN = 20;
            // Parameters for discrete log computations
            // Binary Pohlig-Hellman reduced to smaller logs of order ell^W
            this.W_2 = 5;
            this.W_3 = 3;
            // ell^w
            this.ELL2_W = (uint) (1 << (int)W_2);
            this.ELL3_W = 27;
            // ell^(e mod w)
            this.ELL2_EMODW = (uint) (1 << (int)(OALICE_BITS % W_2));
            this.ELL3_EMODW = 1;
            // # of digits in the discrete log
            this.DLEN_2 = ((OALICE_BITS + W_2 - 1) / W_2); // ceil(eA/W_2);
            this.DLEN_3 = ((OBOB_EXPON + W_3 - 1) / W_3); // ceil(eB/W_3);
            this.PLEN_2 = 51;
            this.PLEN_3 = 54;

            // Import compression tables from properties
            _props = new Dictionary<string, string>(); 
            Stream input = typeof(P503).Assembly
                .GetManifestResourceStream("Org.BouncyCastle.pqc.crypto.sike.p503.properties");
            
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
            ph3_T = ReadFromProperty( "ph3_T", DLEN_3*(ELL3_W>>1)*2*NWORDS64_FIELD);

            Montgomery_R = new ulong[NWORDS64_FIELD];
            ph3_T1 = new ulong[DLEN_3*(ELL3_W >> 1)*2*NWORDS64_FIELD];
            ph3_T2 = new ulong[DLEN_3*(ELL3_W >> 1)*2*NWORDS64_FIELD];
            ph2_T1 = new ulong[2*((DLEN_2 - 1)*(ELL2_W/2) + (ph2_path[PLEN_2 - 1]-1))];
            ph2_T2 = new ulong[2*((DLEN_2 - 1)*(ELL2_W/2) + (ph2_path[PLEN_2 - 1]-1))];


        }




    }
}

}