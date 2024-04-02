using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Digests;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Pqc.Crypto.Sike
{
    
internal class SIKEEngine
{
    private SecureRandom random;
    
    protected internal Internal param;
    protected internal Isogeny isogeny;
    protected internal Fpx fpx;
    private SIDH sidh;
    private SIDH_Compressed sidhCompressed;
    private bool isCompressed;

    public uint GetDefaultSessionKeySize()
    {
        return param.MSG_BYTES * 8;
    }

    public int GetCipherTextSize()
    {
        return param.CRYPTO_CIPHERTEXTBYTES;
    }

    public uint GetPrivateKeySize()
    {
        return param.CRYPTO_SECRETKEYBYTES;
    }

    public uint GetPublicKeySize()
    {
        return param.CRYPTO_PUBLICKEYBYTES;
    }
    public SIKEEngine(int ver, bool isCompressed, SecureRandom random)
    {
        this.random = random;
        this.isCompressed = isCompressed;
        //todo switch for different parameters
        switch(ver)
        {
            case 434:
                param = new P434(isCompressed);
                break;
            case 503:
                param = new P503(isCompressed);
                break;
            case 610:
                param = new P610(isCompressed);
                break;
            case 751:
                param = new P751(isCompressed);
                break;
            default:
                break;
                
        }
        fpx = new Fpx(this);
        isogeny = new Isogeny(this);
        if(isCompressed)
        {
            sidhCompressed = new SIDH_Compressed(this);
        }
        sidh = new SIDH(this);
    }

    // SIKE's key generation
    // Outputs: secret key sk (CRYPTO_SECRETKEYBYTES = MSG_BYTES + SECRETKEY_B_BYTES + CRYPTO_PUBLICKEYBYTES bytes)
    //          public key pk (CRYPTO_PUBLICKEYBYTES bytes)
    public int crypto_kem_keypair(byte[] pk, byte[] sk, SecureRandom random)
    {
        random.NextBytes(sk, 0, (int)param.MSG_BYTES);

        if (isCompressed)
        {
            // Generation of Alice's secret key
            // Outputs random value in [0, 2^eA - 1]

            random.NextBytes(sk, (int)param.MSG_BYTES, (int)param.SECRETKEY_A_BYTES);
            sk[param.MSG_BYTES] &= 0xFE;                                                    // Make private scalar even
            sk[param.MSG_BYTES + param.SECRETKEY_A_BYTES - 1] &= (byte)param.MASK_ALICE;    // Masking last

            sidhCompressed.EphemeralKeyGeneration_A_extended(sk, pk);

            // Append public key pk to secret key sk
            System.Array.Copy(pk, 0, sk, param.MSG_BYTES + param.SECRETKEY_A_BYTES, param.CRYPTO_PUBLICKEYBYTES);
        }
        else
        {
            // Generation of Bob's secret key
            // Outputs random value in [0, 2^Floor(Log(2, oB)) - 1]
            // todo/org: SIDH.random_mod_order_B(sk, random);

            random.NextBytes(sk, (int)param.MSG_BYTES, (int)param.SECRETKEY_B_BYTES);
            sk[param.MSG_BYTES + param.SECRETKEY_B_BYTES - 1] &= (byte)param.MASK_BOB;

            sidh.EphemeralKeyGeneration_B(sk, pk);

            // Append public key pk to secret key sk
            System.Array.Copy(pk, 0, sk, param.MSG_BYTES + param.SECRETKEY_B_BYTES, param.CRYPTO_PUBLICKEYBYTES);

        }

        return 0;
    }

    // SIKE's encapsulation
    // Input:   public key pk         (CRYPTO_PUBLICKEYBYTES bytes)
    // Outputs: shared secret ss      (CRYPTO_BYTES bytes)
    //          ciphertext message ct (CRYPTO_CIPHERTEXTBYTES = CRYPTO_PUBLICKEYBYTES + MSG_BYTES bytes)
    public int crypto_kem_enc(byte[] ct, byte[] ss, byte[] pk, SecureRandom random)
    {
        if(isCompressed)
        {
            byte[] ephemeralsk = new byte[param.SECRETKEY_B_BYTES];
            byte[] jinvariant = new byte[param.FP2_ENCODED_BYTES];
            byte[] h = new byte[param.MSG_BYTES];
            byte[] temp = new byte[param.CRYPTO_CIPHERTEXTBYTES + param.MSG_BYTES];

            // Generate ephemeralsk <- G(m||pk) mod oB
            random.NextBytes(temp, 0, (int)param.MSG_BYTES);
            System.Array.Copy(pk, 0, temp, param.MSG_BYTES, param.CRYPTO_PUBLICKEYBYTES);

            IXof digest = new ShakeDigest(256);
            digest.BlockUpdate(temp, 0, (int) (param.CRYPTO_PUBLICKEYBYTES + param.MSG_BYTES));
            digest.DoFinal(ephemeralsk, 0, (int) param.SECRETKEY_B_BYTES);

            sidhCompressed.FormatPrivKey_B(ephemeralsk);

//            System.out.println("ephemeralsk: " + Hex.toHexstring(ephemeralsk));


            // Encrypt
            sidhCompressed.EphemeralKeyGeneration_B_extended(ephemeralsk, ct, 1);

//            System.out.println("ct: " + Hex.toHexstring(ct));
//            System.out.println("pk: " + Hex.toHexstring(pk));

            sidhCompressed.EphemeralSecretAgreement_B(ephemeralsk, pk, jinvariant);

//            System.out.println("jinv: " + Hex.toHexstring(jinvariant));

            digest.BlockUpdate(jinvariant, 0, (int) param.FP2_ENCODED_BYTES);
            digest.DoFinal(h, 0, (int) param.MSG_BYTES);

//            System.out.println("h: " + Hex.toHexstring(h));
//            System.out.println("temp: " + Hex.toHexstring(temp));

            for (int i = 0; i < param.MSG_BYTES; i++)
            {
                ct[i + param.PARTIALLY_COMPRESSED_CHUNK_CT] = (byte) (temp[i] ^ h[i]);
            }

            // Generate shared secret ss <- H(m||ct)
            System.Array.Copy(ct, 0, temp, param.MSG_BYTES, param.CRYPTO_CIPHERTEXTBYTES);

            digest.BlockUpdate(temp, 0, (int) (param.CRYPTO_CIPHERTEXTBYTES + param.MSG_BYTES));
            digest.DoFinal(ss, 0, (int) param.CRYPTO_BYTES);
            return 0;
        }
        else
        {
            byte[] ephemeralsk = new byte[param.SECRETKEY_A_BYTES];
            byte[] jinvariant = new byte[param.FP2_ENCODED_BYTES];
            byte[] h = new byte[param.MSG_BYTES];
            byte[] temp = new byte[param.CRYPTO_CIPHERTEXTBYTES + param.MSG_BYTES];

            // Generate ephemeralsk <- G(m||pk) mod oA
            random.NextBytes(temp, 0, (int)param.MSG_BYTES);
            System.Array.Copy(pk, 0, temp, param.MSG_BYTES, param.CRYPTO_PUBLICKEYBYTES);

            IXof digest = new ShakeDigest(256);
            digest.BlockUpdate(temp, 0, (int) (param.CRYPTO_PUBLICKEYBYTES + param.MSG_BYTES));
            digest.DoFinal(ephemeralsk, 0, (int) param.SECRETKEY_A_BYTES);
            ephemeralsk[param.SECRETKEY_A_BYTES - 1] &= (byte) param.MASK_ALICE;

            // Encrypt
            sidh.EphemeralKeyGeneration_A(ephemeralsk, ct);
            sidh.EphemeralSecretAgreement_A(ephemeralsk, pk, jinvariant);

            digest.BlockUpdate(jinvariant, 0, (int) param.FP2_ENCODED_BYTES);
            digest.DoFinal(h, 0, (int) param.MSG_BYTES);

            for (int i = 0; i < param.MSG_BYTES; i++)
            {
                ct[i + param.CRYPTO_PUBLICKEYBYTES] = (byte) (temp[i] ^ h[i]);
            }

            // Generate shared secret ss <- H(m||ct)
            System.Array.Copy(ct, 0, temp, param.MSG_BYTES, param.CRYPTO_CIPHERTEXTBYTES);

            digest.BlockUpdate(temp, 0, (int) (param.CRYPTO_CIPHERTEXTBYTES + param.MSG_BYTES));
            digest.DoFinal(ss, 0, (int) param.CRYPTO_BYTES);

            return 0;
        }
    }

    // SIKE's decapsulation
    // Input:   secret key sk         (CRYPTO_SECRETKEYBYTES = MSG_BYTES + SECRETKEY_B_BYTES + CRYPTO_PUBLICKEYBYTES bytes)
    //          ciphertext message ct (CRYPTO_CIPHERTEXTBYTES = CRYPTO_PUBLICKEYBYTES + MSG_BYTES bytes)
    // Outputs: shared secret ss      (CRYPTO_BYTES bytes)
    public int crypto_kem_dec(byte[] ss, byte[] ct, byte[] sk)
    {
        if (isCompressed)
        {
            byte[] ephemeralsk_ = new byte[param.SECRETKEY_B_BYTES];
            byte[] jinvariant_ = new byte[param.FP2_ENCODED_BYTES + 2*param.FP2_ENCODED_BYTES + param.SECRETKEY_A_BYTES],
                   h_ = new byte[param.MSG_BYTES];
            byte[] temp = new byte[param.CRYPTO_CIPHERTEXTBYTES + param.MSG_BYTES];
            byte[] tphiBKA_t = jinvariant_;//jinvariant_[param.FP2_ENCODED_BYTES];

            // Decrypt
            sidhCompressed.EphemeralSecretAgreement_A_extended(sk, param.MSG_BYTES, ct, jinvariant_, 1);

            IXof digest = new ShakeDigest(256);
            digest.BlockUpdate(jinvariant_, 0, (int) param.FP2_ENCODED_BYTES);
            digest.DoFinal(h_, 0, (int) param.MSG_BYTES);

//            System.out.println("h_: " + Hex.toHexstring(h_));

            for (int i = 0; i < param.MSG_BYTES; i++)
            {
                temp[i] = (byte) (ct[i + param.PARTIALLY_COMPRESSED_CHUNK_CT] ^ h_[i]);
            }

            // Generate ephemeralsk_ <- G(m||pk) mod oB
            System.Array.Copy(sk, param.MSG_BYTES + param.SECRETKEY_A_BYTES, temp, param.MSG_BYTES, param.CRYPTO_PUBLICKEYBYTES);

            digest.BlockUpdate(temp, 0, (int) (param.CRYPTO_PUBLICKEYBYTES + param.MSG_BYTES));
            digest.DoFinal(ephemeralsk_, 0, (int) param.SECRETKEY_B_BYTES);
            sidhCompressed.FormatPrivKey_B(ephemeralsk_);

            // Generate shared secret ss <- H(m||ct), or output ss <- H(s||ct) in case of ct verification failure
            // No need to recompress, just check if x(phi(P) + t*phi(Q)) == x((a0 + t*a1)*R1 + (b0 + t*b1)*R2)
            byte selector = sidhCompressed.validate_ciphertext(ephemeralsk_, ct, sk, param.MSG_BYTES + param.SECRETKEY_A_BYTES + param.CRYPTO_PUBLICKEYBYTES, tphiBKA_t, param.FP2_ENCODED_BYTES);
            // If ct validation passes (selector = 0) then do ss = H(m||ct), otherwise (selector = -1) load s to do ss = H(s||ct)
            fpx.ct_cmov(temp, sk, param.MSG_BYTES, selector);

            System.Array.Copy(ct, 0, temp, param.MSG_BYTES, param.CRYPTO_CIPHERTEXTBYTES);
            digest.BlockUpdate(temp, 0, (int) (param.CRYPTO_CIPHERTEXTBYTES + param.MSG_BYTES));
            digest.DoFinal(ss, 0, (int) param.CRYPTO_BYTES);

            return 0;
        }
        else
        {
            byte[] ephemeralsk_ = new byte[param.SECRETKEY_A_BYTES];
            byte[] jinvariant_ = new byte[param.FP2_ENCODED_BYTES];
            byte[] h_ = new byte[param.MSG_BYTES];
            byte[] c0_ = new byte[param.CRYPTO_PUBLICKEYBYTES];
            byte[] temp = new byte[param.CRYPTO_CIPHERTEXTBYTES + param.MSG_BYTES];

            // Decrypt
            // int EphemeralSecretAgreement_B(PrivateKeyB, PublicKeyA, SharedSecretB)
            sidh.EphemeralSecretAgreement_B(sk, ct, jinvariant_);

            IXof digest = new ShakeDigest(256);
            digest.BlockUpdate(jinvariant_, 0, (int) param.FP2_ENCODED_BYTES);
            digest.DoFinal(h_, 0, (int) param.MSG_BYTES);
            for (int i = 0; i < param.MSG_BYTES; i++)
            {
                temp[i] = (byte) (ct[i + param.CRYPTO_PUBLICKEYBYTES] ^ h_[i]);
            }

            // Generate ephemeralsk_ <- G(m||pk) mod oA
            System.Array.Copy(sk, param.MSG_BYTES + param.SECRETKEY_B_BYTES, temp, param.MSG_BYTES, param.CRYPTO_PUBLICKEYBYTES);

            digest.BlockUpdate(temp, 0, (int) (param.CRYPTO_PUBLICKEYBYTES + param.MSG_BYTES));
            digest.DoFinal(ephemeralsk_, 0, (int) param.SECRETKEY_A_BYTES);
            ephemeralsk_[param.SECRETKEY_A_BYTES - 1] &= (byte) param.MASK_ALICE;


            // Generate shared secret ss <- H(m||ct), or output ss <- H(s||ct) in case of ct verification failure
            sidh.EphemeralKeyGeneration_A(ephemeralsk_, c0_);

            // If selector = 0 then do ss = H(m||ct), else if selector = -1 load s to do ss = H(s||ct)
            byte selector = fpx.ct_compare(c0_, ct, param.CRYPTO_PUBLICKEYBYTES);
            fpx.ct_cmov(temp, sk, param.MSG_BYTES, selector);

            System.Array.Copy(ct, 0, temp, param.MSG_BYTES, param.CRYPTO_CIPHERTEXTBYTES);
            digest.BlockUpdate(temp, 0, (int) (param.CRYPTO_CIPHERTEXTBYTES + param.MSG_BYTES));
            digest.DoFinal(ss, 0, (int) param.CRYPTO_BYTES);

            return 0;
        }
    }

}

}