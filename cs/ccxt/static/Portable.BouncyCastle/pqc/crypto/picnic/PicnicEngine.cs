using System;

using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Digests;
using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.Picnic
{
    public class PicnicEngine
    {
        // same for all parameter sets
        protected internal static readonly int saltSizeBytes = 32;
        private static readonly uint MAX_DIGEST_SIZE = 64;

        private static readonly int WORD_SIZE_BITS = 32; // the word size for the implementation. Not a LowMC parameter
        private static readonly uint LOWMC_MAX_STATE_SIZE = 64;
        protected internal static readonly uint LOWMC_MAX_WORDS = (LOWMC_MAX_STATE_SIZE / 4);
        protected internal static readonly uint LOWMC_MAX_KEY_BITS = 256;
        protected internal static readonly uint LOWMC_MAX_AND_GATES = (3 * 38 * 10 + 4); /* Rounded to nearest byte */
        private static readonly uint MAX_AUX_BYTES = ((LOWMC_MAX_AND_GATES + LOWMC_MAX_KEY_BITS) / 8 + 1);

        /* Maximum lengths in bytes */
        private static readonly uint PICNIC_MAX_LOWMC_BLOCK_SIZE = 32;
        private static readonly uint PICNIC_MAX_PUBLICKEY_SIZE = (2 * PICNIC_MAX_LOWMC_BLOCK_SIZE + 1);

        /** Largest serialized public key size, in bytes */
        private static readonly uint PICNIC_MAX_PRIVATEKEY_SIZE = (3 * PICNIC_MAX_LOWMC_BLOCK_SIZE + 2);

        /** Largest serialized private key size, in bytes */
        private static readonly uint PICNIC_MAX_SIGNATURE_SIZE = 209522;

        /** Largest signature size, in bytes */

        private static readonly uint TRANSFORM_FS = 0;

        private static readonly uint TRANSFORM_UR = 1;
        private static readonly uint TRANSFORM_INVALID = 255;

        /// parameters
        private int CRYPTO_SECRETKEYBYTES;

        private int CRYPTO_PUBLICKEYBYTES;
        private int CRYPTO_BYTES;



        // varies between parameter sets
        protected internal int numRounds;
        private int numSboxes;
        protected internal int stateSizeBits;
        protected internal int stateSizeBytes;
        protected internal int stateSizeWords;
        protected internal int andSizeBytes;
        private int UnruhGWithoutInputBytes;
        protected internal int UnruhGWithInputBytes;
        protected internal int numMPCRounds; // T
        protected internal int numOpenedRounds; // u
        protected internal int numMPCParties; // N
        protected internal int seedSizeBytes;
        protected internal int digestSizeBytes;
        protected internal int pqSecurityLevel;

        ///
        private uint transform;

        private int parameters;
        protected internal IXof digest;
        private int signatureLength;

        public int GetSecretKeySize()
        {
            return CRYPTO_SECRETKEYBYTES;
        }

        public int GetPublicKeySize()
        {
            return CRYPTO_PUBLICKEYBYTES;
        }

        public int GetSignatureSize(int messageLength)
        {
            return CRYPTO_BYTES + messageLength;
        }

        //todo dont do this
        public int GetTrueSignatureSize()
        {
            return signatureLength + 4;
        }

        internal PicnicEngine(int picnicParams)
        {
            parameters = picnicParams;
            switch (parameters)
            {
                case 1:
                case 2:
                    /*Picnic_L1_FS
                      Picnic_L1_UR*/
                    pqSecurityLevel = 64;
                    stateSizeBits = 128;
                    numMPCRounds = 219;
                    numMPCParties = 3;
                    numSboxes = 10;
                    numRounds = 20;
                    digestSizeBytes = 32;
                    break;
                case 3:
                case 4:
                    /* Picnic_L3_FS
                       Picnic_L3_UR*/
                    pqSecurityLevel = 96;
                    stateSizeBits = 192;
                    numMPCRounds = 329;
                    numMPCParties = 3;
                    numSboxes = 10;
                    numRounds = 30;
                    digestSizeBytes = 48;
                    break;
                case 5:
                case 6:
                    /* Picnic_L5_FS
                       Picnic_L5_UR*/
                    pqSecurityLevel = 128;
                    stateSizeBits = 256;
                    numMPCRounds = 438;
                    numMPCParties = 3;
                    numSboxes = 10;
                    numRounds = 38;
                    digestSizeBytes = 64;
                    break;
                case 7:
                    /*Picnic3_L1*/
                    pqSecurityLevel = 64;
                    stateSizeBits = 129;
                    numMPCRounds = 250;
                    numOpenedRounds = 36;
                    numMPCParties = 16;
                    numSboxes = 43;
                    numRounds = 4;
                    digestSizeBytes = 32;
                    break;
                case 8:
                    /*Picnic3_L3*/
                    pqSecurityLevel = 96;
                    stateSizeBits = 192;
                    numMPCRounds = 419;
                    numOpenedRounds = 52;
                    numMPCParties = 16;
                    numSboxes = 64;
                    numRounds = 4;
                    digestSizeBytes = 48;
                    break;
                case 9:
                    /*Picnic3_L5*/
                    pqSecurityLevel = 128;
                    stateSizeBits = 255;
                    numMPCRounds = 601;
                    numOpenedRounds = 68;
                    numMPCParties = 16;
                    numSboxes = 85;
                    numRounds = 4;
                    digestSizeBytes = 64;
                    break;
                case 10:
                    /*Picnic_L1_full*/
                    pqSecurityLevel = 64;
                    stateSizeBits = 129;
                    numMPCRounds = 219;
                    numMPCParties = 3;
                    numSboxes = 43;
                    numRounds = 4;
                    digestSizeBytes = 32;
                    break;
                case 11:
                    /*Picnic_L3_full*/
                    pqSecurityLevel = 96;
                    stateSizeBits = 192;
                    numMPCRounds = 329;
                    numMPCParties = 3;
                    numSboxes = 64;
                    numRounds = 4;
                    digestSizeBytes = 48;
                    break;
                case 12:
                    /*Picnic_L5_full*/
                    pqSecurityLevel = 128;
                    stateSizeBits = 255;
                    numMPCRounds = 438;
                    numMPCParties = 3;
                    numSboxes = 85;
                    numRounds = 4;
                    digestSizeBytes = 64;
                    break;
            }

            switch (parameters)
            {
                case 1: /*Picnic_L1_FS*/
                    CRYPTO_SECRETKEYBYTES = 49;
                    CRYPTO_PUBLICKEYBYTES = 33;
                    CRYPTO_BYTES = 34036;
                    break;
                case 2: /* Picnic_L1_UR*/
                    CRYPTO_SECRETKEYBYTES = 49;
                    CRYPTO_PUBLICKEYBYTES = 33;
                    CRYPTO_BYTES = 53965;
                    break;
                case 3: /*Picnic_L3_FS*/
                    CRYPTO_SECRETKEYBYTES = 73;
                    CRYPTO_PUBLICKEYBYTES = 49;
                    CRYPTO_BYTES = 76784;
                    break;
                case 4: /*Picnic_L3_UR*/
                    CRYPTO_SECRETKEYBYTES = 73;
                    CRYPTO_PUBLICKEYBYTES = 49;
                    CRYPTO_BYTES = 121857;
                    break;
                case 5: /*Picnic_L5_FS*/
                    CRYPTO_SECRETKEYBYTES = 97;
                    CRYPTO_PUBLICKEYBYTES = 65;
                    CRYPTO_BYTES = 132876;
                    break;
                case 6: /*Picnic_L5_UR*/
                    CRYPTO_SECRETKEYBYTES = 97;
                    CRYPTO_PUBLICKEYBYTES = 65;
                    CRYPTO_BYTES = 209526;
                    break;
                case 7: /*Picnic3_L1*/
                    CRYPTO_SECRETKEYBYTES = 52;
                    CRYPTO_PUBLICKEYBYTES = 35;
                    CRYPTO_BYTES = 14612;
                    break;
                case 8: /*Picnic3_L3*/
                    CRYPTO_SECRETKEYBYTES = 73;
                    CRYPTO_PUBLICKEYBYTES = 49;
                    CRYPTO_BYTES = 35028;
                    break;
                case 9: /*Picnic3_L5*/
                    CRYPTO_SECRETKEYBYTES = 97;
                    CRYPTO_PUBLICKEYBYTES = 65;
                    CRYPTO_BYTES = 61028;
                    break;
                case 10: /*Picnic_L1_full*/
                    CRYPTO_SECRETKEYBYTES = 52;
                    CRYPTO_PUBLICKEYBYTES = 35;
                    CRYPTO_BYTES = 32061;
                    break;
                case 11: /*Picnic_L3_full*/
                    CRYPTO_SECRETKEYBYTES = 73;
                    CRYPTO_PUBLICKEYBYTES = 49;
                    CRYPTO_BYTES = 71179;
                    break;
                case 12: /*Picnic_L5_full*/
                    CRYPTO_SECRETKEYBYTES = 97;
                    CRYPTO_PUBLICKEYBYTES = 65;
                    CRYPTO_BYTES = 126286;
                    break;
                default:
                    CRYPTO_SECRETKEYBYTES = -1;
                    CRYPTO_PUBLICKEYBYTES = -1;
                    CRYPTO_BYTES = -1;
                    break;
            }

            // calculated depending on above parameters
            andSizeBytes = Utils.NumBytes(numSboxes * 3 * numRounds);
            stateSizeBytes = Utils.NumBytes(stateSizeBits);
            seedSizeBytes = Utils.NumBytes(2 * pqSecurityLevel);
            stateSizeWords = (stateSizeBits + WORD_SIZE_BITS - 1) / WORD_SIZE_BITS;

            switch (parameters)
            {
            case 1:
            case 3:
            case 5:
            case 7:
            case 8:
            case 9:
            case 10:
            case 11:
            case 12:
                transform = TRANSFORM_FS;
                break;
            case 2:
            case 4:
            case 6:
                transform = TRANSFORM_UR;
                break;
            default:
                transform = TRANSFORM_INVALID;
                break;
            }

            if (transform == 1)
            {
                UnruhGWithoutInputBytes = seedSizeBytes + andSizeBytes;
                UnruhGWithInputBytes = UnruhGWithoutInputBytes + stateSizeBytes;
            }

            int shakeSize = (stateSizeBits == 128 || stateSizeBits == 129) ? 128 : 256;
            digest = new ShakeDigest(shakeSize);
        }

        public bool crypto_sign_open(byte[] m, byte[] sm, byte[] pk)
        {
            uint sigLen = Pack.LE_To_UInt32(sm, 0);
            byte[] m_from_sm = Arrays.CopyOfRange(sm, 4, 4 + m.Length);
            int ret = picnic_verify(pk, m_from_sm, sm, sigLen);
            Array.Copy(sm, 4, m, 0, m.Length);
            return ret != -1;
        }

        private int picnic_verify(byte[] pk, byte[] message, byte[] signature, uint sigLen)
        {
            byte[] plaintext_bytes = new byte[PICNIC_MAX_LOWMC_BLOCK_SIZE];
            byte[] ciphertext_bytes = new byte[PICNIC_MAX_LOWMC_BLOCK_SIZE];
            picnic_read_public_key(ciphertext_bytes, plaintext_bytes, pk);
            uint[] ciphertext = new uint[stateSizeWords];
            uint[] plaintext = new uint[stateSizeWords];

            Pack.LE_To_UInt32(plaintext_bytes, 0, plaintext);
            Pack.LE_To_UInt32(ciphertext_bytes, 0, ciphertext);

            if (is_picnic3(parameters))
            {
                Signature2 sig = new Signature2(this);
                DeserializeSignature2(sig, signature, sigLen, message.Length + 4);

                return verify_picnic3(sig, ciphertext, plaintext, message);
            }
            else
            {
                Signature sig = new Signature(this);
                int ret = DeserializeSignature(sig, signature, sigLen, message.Length + 4);
                if (ret != 0)
                {
                    Console.Error.Write("Error couldn't deserialize signature!");
                }

                return Verify(sig, ciphertext, plaintext, message);
            }
        }

        private int Verify(Signature sig, uint[] pubKey, uint[] plaintext, byte[] message)
        {
            byte[][][] AS = new byte[numMPCRounds][][];//numMPCRounds, numMPCParties, digestSizeBytes
            for (int i = 0; i < numMPCRounds; i++)
            {
                AS[i] = new byte[numMPCParties][];
                for (int j = 0; j < numMPCParties; j++)
                {
                    AS[i][j] = new byte[digestSizeBytes];
                }
            }
            
            byte[][][] gs = new byte[numMPCRounds][][];// numMPCRounds, 3, UnruhGWithInputBytes
            for (int i = 0; i < numMPCRounds; i++)
            {
                gs[i] = new byte[3][];
                for (int j = 0; j < 3; j++)
                {
                    gs[i][j] = new byte[UnruhGWithInputBytes];
                }
            }
            
            uint[][][] viewOutputs = new uint[numMPCRounds][][];// numMPCRounds, 3, stateSizeBytes
            for (int i = 0; i < numMPCRounds; i++)
            {
                viewOutputs[i] = new uint[3][];
                for (int j = 0; j < 3; j++)
                {
                    viewOutputs[i][j] = new uint[stateSizeBytes];
                }
            }
            Signature.Proof[] proofs = sig.proofs;

            byte[] received_challengebits = sig.challengeBits;
            int status = 0;
            byte[] computed_challengebits = null;

            byte[] tmp = new byte[System.Math.Max(6 * stateSizeBytes, stateSizeBytes + andSizeBytes)];

            Tape tape = new Tape(this);

            View[] view1s = new View[numMPCRounds];
            View[] view2s = new View[numMPCRounds];

            /* Allocate a slab of memory for the 3rd view's output in each round */
            for (int i = 0; i < numMPCRounds; i++)
            {
                view1s[i] = new View(this);
                view2s[i] = new View(this);

                VerifyProof(proofs[i], view1s[i], view2s[i],
                    GetChallenge(received_challengebits, i), sig.salt, (uint)i,
                    tmp, plaintext, tape);

                // create ordered array of commitments with order computed based on the challenge
                // check commitments of the two opened views
                int challenge = GetChallenge(received_challengebits, i);
                Commit(proofs[i].seed1, 0, view1s[i],  AS[i][challenge]);
                Commit(proofs[i].seed2, 0, view2s[i],  AS[i][(challenge + 1) % 3]);
                Array.Copy(proofs[i].view3Commitment, 0,  AS[i][(challenge + 2) % 3], 0, digestSizeBytes);
                if (transform == TRANSFORM_UR)
                {
                    G(challenge, proofs[i].seed1, 0, view1s[i], gs[i][challenge]);
                    G((challenge + 1) % 3, proofs[i].seed2, 0, view2s[i], gs[i][(challenge + 1) % 3]);
                    int view3UnruhLength = (challenge == 0) ? UnruhGWithInputBytes : UnruhGWithoutInputBytes;
                    Array.Copy(proofs[i].view3UnruhG, 0, gs[i][(challenge + 2) % 3], 0, view3UnruhLength);
                }

                viewOutputs[i][challenge] = view1s[i].outputShare;
                viewOutputs[i][(challenge + 1) % 3] = view2s[i].outputShare;
                uint[] view3Output = new uint[stateSizeWords]; /* pointer into the slab to the current 3rd view */
                xor_three(view3Output, view1s[i].outputShare, view2s[i].outputShare, pubKey, stateSizeBytes);
                viewOutputs[i][(challenge + 2) % 3] = view3Output;
            }

            computed_challengebits = new byte[Utils.NumBytes(2 * numMPCRounds)];

            H3(pubKey, plaintext, viewOutputs, AS, computed_challengebits, sig.salt, message, gs);

            if (!SubarrayEquals(received_challengebits, computed_challengebits, Utils.NumBytes(2 * numMPCRounds)))
            {
                Console.Error.Write(("Invalid signature. Did not verify\n"));
                status = -1;
            }

            return status;
        }

        void VerifyProof(Signature.Proof proof, View view1, View view2, int challenge, byte[] salt, 
            uint roundNumber, byte[] tmp, uint[] plaintext, Tape tape)
        {
            Array.Copy(proof.communicatedBits, 0, view2.communicatedBits, 0, andSizeBytes);
            tape.pos = 0;

//        Console.Error.Write("tmp: " + Hex.toHexString(tmp));

            bool status = false;
            switch (challenge)
            {
            case 0:
            {
                // in this case, both views' inputs are derivable from the input share
                status = CreateRandomTape(proof.seed1, 0, salt, roundNumber,
                    0, tmp, stateSizeBytes + andSizeBytes);

                Pack.LE_To_UInt32(tmp, 0, view1.inputShare); //todo check
                Array.Copy(tmp, stateSizeBytes, tape.tapes[0], 0, andSizeBytes);

                status = status && CreateRandomTape(proof.seed2, 0, salt, roundNumber,
                    1, tmp, stateSizeBytes + andSizeBytes);

                if (!status)
                {
                    break;
                }

                Pack.LE_To_UInt32(tmp, 0, view2.inputShare); //todo check
                Array.Copy(tmp, stateSizeBytes, tape.tapes[1], 0, andSizeBytes);

                break;
            }
            case 1:
            {
                // in this case view2's input share was already given to us explicitly as
                // it is not computable from the seed. We just need to compute view1's input from
                // its seed
                status = CreateRandomTape(proof.seed1, 0, salt, roundNumber,
                    1, tmp, stateSizeBytes + andSizeBytes);

                Pack.LE_To_UInt32(tmp, 0, view1.inputShare); //todo check
                Array.Copy(tmp, stateSizeBytes, tape.tapes[0], 0, andSizeBytes);
                status = status && CreateRandomTape(proof.seed2, 0, salt, roundNumber,
                    2, tape.tapes[1], andSizeBytes);
                if (!status)
                {
                    break;
                }

                Array.Copy(proof.inputShare, 0, view2.inputShare, 0, stateSizeBytes);
                break;
            }
            case 2:
            {
                // in this case view1's input share was already given to us explicitly as
                // it is not computable from the seed. We just need to compute view2's input from
                // its seed
                status = CreateRandomTape(proof.seed1, 0, salt, roundNumber, 2, tape.tapes[0], andSizeBytes);
                Array.Copy(proof.inputShare, 0, view1.inputShare, 0, stateSizeBytes);
                status = status && CreateRandomTape(proof.seed2, 0, salt, roundNumber, 0, tmp,
                    (stateSizeBytes + andSizeBytes));
                if (!status)
                {
                    break;
                }

                Pack.LE_To_UInt32(tmp, 0, view2.inputShare); //todo check
                Array.Copy(tmp, stateSizeBytes, tape.tapes[1], 0, andSizeBytes);
                break;
            }
            default:
            {
                Console.Error.Write("Invalid Challenge!");
                break;
            }
            }

            if (!status)
            {
                Console.Error.Write(
                    "Failed to generate random tapes, signature verification will fail (but signature may actually be valid)\n");
            }

            /* When input shares are read from the tapes, and the length is not a whole number of bytes, the trailing bits must be zero */
            byte[] view_bytes = new byte[stateSizeBytes * 4];
            Pack.UInt32_To_LE(view1.inputShare, view_bytes, 0);
            Arrays.Fill(view_bytes, stateSizeBytes, view_bytes.Length,
                (byte) 0); //todo have correct size: reduce view.inputshare by /4
            Utils.ZeroTrailingBits(view_bytes, stateSizeBits);
            Pack.LE_To_UInt32(view_bytes, 0, view1.inputShare);

            Pack.UInt32_To_LE(view2.inputShare, view_bytes, 0);
            Arrays.Fill(view_bytes, stateSizeBytes, view_bytes.Length, (byte) 0);
            Utils.ZeroTrailingBits(view_bytes, stateSizeBits);

            Pack.LE_To_UInt32(view_bytes, 0, view2.inputShare);

            uint[] tmp_ints = Pack.LE_To_UInt32(tmp, 0, tmp.Length / 4);
            mpc_LowMC_verify(view1, view2, tape, tmp_ints, plaintext, challenge);
        }

        void mpc_LowMC_verify(View view1, View view2, Tape tapes, uint[] tmp, uint[] plaintext,  int challenge)
        {
            Utils.Fill(tmp, 0, tmp.Length, 0);

            mpc_xor_constant_verify(tmp, plaintext, 0, stateSizeWords, challenge);

            KMatricesWithPointer current = LowmcConstants.Instance.KMatrix(this, 0);
            matrix_mul_offset(tmp, 0,
                view1.inputShare, 0,
                current.GetData(), current.GetMatrixPointer());
            matrix_mul_offset(tmp, stateSizeWords,
                view2.inputShare, 0,
                current.GetData(), current.GetMatrixPointer());

            mpc_xor(tmp, tmp, stateSizeWords, 2);

            for (int r = 1; r <= numRounds; ++r)
            {
                current = LowmcConstants.Instance.KMatrix(this, r);
                matrix_mul_offset(tmp, 0,
                    view1.inputShare, 0,
                    current.GetData(), current.GetMatrixPointer());
                matrix_mul_offset(tmp, stateSizeWords,
                    view2.inputShare, 0,
                    current.GetData(), current.GetMatrixPointer());

                mpc_substitution_verify(tmp, tapes, view1, view2);

                current = LowmcConstants.Instance.LMatrix(this, r - 1);
                mpc_matrix_mul(tmp, 2 * stateSizeWords,
                    tmp, 2 * stateSizeWords,
                    current.GetData(), current.GetMatrixPointer(), 2);

                current = LowmcConstants.Instance.RConstant(this, r - 1);
                mpc_xor_constant_verify(tmp, current.GetData(), current.GetMatrixPointer(), stateSizeWords, challenge);
                mpc_xor(tmp, tmp, stateSizeWords, 2);
            }

            Array.Copy(tmp, 2 * stateSizeWords, view1.outputShare, 0, stateSizeWords);
            Array.Copy(tmp, 3 * stateSizeWords, view2.outputShare, 0, stateSizeWords);
        }

        void mpc_substitution_verify(uint[] state, Tape rand, View view1, View view2)
        {
            uint[] a = new uint[2];
            uint[] b = new uint[2];
            uint[] c = new uint[2];

            uint[] ab = new uint[2];
            uint[] bc = new uint[2];
            uint[] ca = new uint[2];

            int stateOffset;
            for (int i = 0; i < numSboxes * 3; i += 3)
            {
                for (int j = 0; j < 2; j++)
                {
                    stateOffset = ((2 + j) * stateSizeWords) * 32;
                    a[j] = Utils.GetBitFromWordArray(state, stateOffset + i + 2);
                    b[j] = Utils.GetBitFromWordArray(state, stateOffset + i + 1);
                    c[j] = Utils.GetBitFromWordArray(state, stateOffset + i);
                }

                mpc_AND_verify(a, b, ab, rand, view1, view2);
                mpc_AND_verify(b, c, bc, rand, view1, view2);
                mpc_AND_verify(c, a, ca, rand, view1, view2);

                for (int j = 0; j < 2; j++)
                {
                    stateOffset = ((2 + j) * stateSizeWords) * 32;
                    Utils.SetBitInWordArray(state, stateOffset + i + 2, a[j] ^ (bc[j]));
                    Utils.SetBitInWordArray(state, stateOffset + i + 1, a[j] ^ b[j] ^ (ca[j]));
                    Utils.SetBitInWordArray(state, stateOffset + i, a[j] ^ b[j] ^ c[j] ^ (ab[j]));
                }
            }
        }

        void mpc_AND_verify(uint[] in1, uint[] in2, uint[] output, Tape rand, View view1, View view2)
        {
            uint[] r = {Utils.GetBit(rand.tapes[0], rand.pos), Utils.GetBit(rand.tapes[1], rand.pos)};

            output[0] = (in1[0] & in2[1]) ^ (in1[1] & in2[0]) ^ (in1[0] & in2[0]) ^ r[0] ^ r[1];
            Utils.SetBit(view1.communicatedBits, rand.pos, (byte) (output[0] & 0xff));
            output[1] = Utils.GetBit(view2.communicatedBits, rand.pos);

            rand.pos++;
        }

        private void mpc_xor_constant_verify(uint[] state, uint[] input, int inOffset, int length, int challenge)
        {
            /* During verify, where the first share is stored in state depends on the challenge */
            int offset = 0;
            if (challenge == 0)
            {
                offset = 2 * stateSizeWords;
            }
            else if (challenge == 2)
            {
                offset = 3 * stateSizeWords;
            }
            else
            {
                return;
            }

            for (int i = 0; i < length; i++)
            {
                state[i + offset] = state[i + offset] ^ input[i +inOffset];
            }

        }


        private int DeserializeSignature(Signature sig, byte[] sigBytes, uint sigBytesLen, int sigBytesOffset)
        {
            Signature.Proof[] proofs = sig.proofs;
            byte[] challengeBits = sig.challengeBits;

            /* Validate input buffer is large enough */
            if (sigBytesLen < Utils.NumBytes(2 * numMPCRounds))
            {
                /* ensure the input has at least the challenge */
                return -1;
            }

            int inputShareSize = ComputeInputShareSize(sigBytes, stateSizeBytes);
            int bytesExpected = Utils.NumBytes(2 * numMPCRounds) + saltSizeBytes +
                                numMPCRounds * (2 * seedSizeBytes + andSizeBytes + digestSizeBytes) + inputShareSize;

            if (transform == TRANSFORM_UR)
            {
                bytesExpected += UnruhGWithoutInputBytes * numMPCRounds;
            }

            if (sigBytesLen < bytesExpected)
            {
                return -1;
            }

            Array.Copy(sigBytes, sigBytesOffset, challengeBits, 0, Utils.NumBytes(2 * numMPCRounds));
            sigBytesOffset += Utils.NumBytes(2 * numMPCRounds);

            if (!IsChallengeValid(challengeBits))
            {
                return -1;
            }

            Array.Copy(sigBytes, sigBytesOffset, sig.salt, 0, saltSizeBytes);
            sigBytesOffset += saltSizeBytes;

            for (int i = 0; i < numMPCRounds; i++)
            {
                int challenge = GetChallenge(challengeBits, i);

                Array.Copy(sigBytes, sigBytesOffset, proofs[i].view3Commitment, 0, digestSizeBytes);

                sigBytesOffset += digestSizeBytes;

                if (transform == TRANSFORM_UR)
                {
                    int view3UnruhLength = (challenge == 0) ? UnruhGWithInputBytes : UnruhGWithoutInputBytes;
                    Array.Copy(sigBytes, sigBytesOffset, proofs[i].view3UnruhG, 0, view3UnruhLength);
                    sigBytesOffset += view3UnruhLength;
                }

                Array.Copy(sigBytes, sigBytesOffset, proofs[i].communicatedBits, 0, andSizeBytes);
                sigBytesOffset += andSizeBytes;

                Array.Copy(sigBytes, sigBytesOffset, proofs[i].seed1, 0, seedSizeBytes);
                sigBytesOffset += seedSizeBytes;

                Array.Copy(sigBytes, sigBytesOffset, proofs[i].seed2, 0, seedSizeBytes);
                sigBytesOffset += seedSizeBytes;

                if (challenge == 1 || challenge == 2)
                {
                    Pack.LE_To_UInt32(sigBytes, sigBytesOffset, proofs[i].inputShare, 0, stateSizeBytes / 4);
                    if (stateSizeBits == 129)
                    {
                        proofs[i].inputShare[stateSizeWords - 1] = (uint)sigBytes[sigBytesOffset + stateSizeBytes - 1] & 0xff;
                    }

                    sigBytesOffset += stateSizeBytes;
                    if (!ArePaddingBitsZero(Pack.UInt32_To_LE(proofs[i].inputShare), stateSizeBits))
                    {
                        return -1;
                    }
                }

            }

            return 0;
        }

        private bool IsChallengeValid(byte[] challengeBits)
        {
            for (int i = 0; i < numMPCRounds; i++)
            {
                int challenge = GetChallenge(challengeBits, i);
                if (challenge > 2)
                {
                    return false;
                }
            }

            return true;
        }

        private int ComputeInputShareSize(byte[] challengeBits, int stateSizeBytes)
        {
            /* When the FS transform is used, the input share is included in the proof
             * only when the challenge is 1 or 2.  When dersializing, to compute the
             * number of bytes expected, we must check how many challenge values are 1
             * or 2. The parameter stateSizeBytes is the size of an input share. */
            int inputShareSize = 0;

            for (int i = 0; i < numMPCRounds; i++)
            {
                int challenge = GetChallenge(challengeBits, i);
                if (challenge == 1 || challenge == 2)
                {
                    inputShareSize += stateSizeBytes;
                }
            }

            return inputShareSize;
        }

        private  uint picnic_read_public_key(byte[] ciphertext, byte[] plaintext, byte[] pk)
        {
            Array.Copy(pk, 1, ciphertext, 0, stateSizeBytes);
            Array.Copy(pk, 1 + stateSizeBytes, plaintext, 0, stateSizeBytes);
            return 0;
        }

        private int verify_picnic3(Signature2 sig, uint[] pubKey, uint[] plaintext, byte[] message)
        {
            byte[][][] C = new byte[numMPCRounds][][]; // [numMPCRounds][numMPCParties][digestSizeBytes]
            for (int i = 0; i < numMPCRounds; i++)
            {
                C[i] = new byte[numMPCParties][];
                for (int j = 0; j < numMPCParties; j++)
                {
                    C[i][j] = new byte[digestSizeBytes];
                }
            }
            
            byte[][] Ch = new byte[numMPCRounds][];    // [numMPCRounds][digestSizeBytes]
            for (int i = 0; i < numMPCRounds; i++)
            {
                Ch[i] = new byte[digestSizeBytes];
            }
            byte[][] Cv = new byte[numMPCRounds][];    // [numMPCRounds][digestSizeBytes]
            for (int i = 0; i < numMPCRounds; i++)
            {
                Cv[i] = new byte[digestSizeBytes];
            }
            
            Msg[] msgs = new Msg[numMPCRounds];

            Tree treeCv = new Tree(this, (uint)numMPCRounds, digestSizeBytes);
            byte[] challengeHash = new byte[MAX_DIGEST_SIZE];
            Tree[] seeds = new Tree[numMPCRounds];
            Tape[] tapes = new Tape[numMPCRounds];
            Tree iSeedsTree = new Tree(this, (uint)numMPCRounds, seedSizeBytes);

            int ret = iSeedsTree.ReconstructSeeds(sig.challengeC, (uint)numOpenedRounds,
                sig.iSeedInfo, (uint)sig.iSeedInfoLen, sig.salt, 0);

            if (ret != 0)
            {
                return -1;
            }

            /* Populate seeds with values from the signature */
            for (uint t = 0; t < numMPCRounds; t++)
            {
                if (!Contains(sig.challengeC, numOpenedRounds, t))
                {
                    /* Expand iSeed[t] to seeds for each parties, using a seed tree */
                    seeds[t] = new Tree(this, (uint)numMPCParties, seedSizeBytes);
                    seeds[t].GenerateSeeds(iSeedsTree.GetLeaf(t), sig.salt, t);
                }
                else
                {
                    /* We don't have the initial seed for the round, but instead a seed
                     * for each unopened party */
                    seeds[t] = new Tree(this, (uint)numMPCParties, seedSizeBytes);
                    int P_index = IndexOf(sig.challengeC, numOpenedRounds, t);
                    uint[] hideList = new uint[1];
                    hideList[0] = sig.challengeP[P_index];
                    ret = seeds[t].ReconstructSeeds(hideList, 1,
                        sig.proofs[t].seedInfo, (uint)sig.proofs[t].seedInfoLen,
                        sig.salt, t);
                    if (ret != 0)
                    {
                        Console.Error.Write("Failed to reconstruct seeds for round %d\n", t);
                        return -1;
                    }
                }
            }

            /* Commit */
            uint last = (uint)numMPCParties - 1;
            byte[] auxBits = new byte[MAX_AUX_BYTES];
            for (uint t = 0; t < numMPCRounds; t++)
            {
                tapes[t] = new Tape(this);
                /* Compute random tapes for all parties.  One party for each repitition
                 * challengeC will have a bogus seed; but we won't use that party's
                 * random tape. */
                CreateRandomTapes(tapes[t], seeds[t].GetLeaves(), seeds[t].GetLeavesOffset(), sig.salt, t);

                if (!Contains(sig.challengeC, numOpenedRounds, t))
                {
                    /* We're given iSeed, have expanded the seeds, compute aux from scratch so we can comnpte Com[t] */
                    tapes[t].ComputeAuxTape(null);
                    for (uint j = 0; j < last; j++)
                    {
                        commit(C[t][j], seeds[t].GetLeaf(j), null, sig.salt, t, j);
                    }

                    GetAuxBits(auxBits, tapes[t]);
                    commit(C[t][last], seeds[t].GetLeaf(last), auxBits, sig.salt, t, last);
                }
                else
                {
                    /* We're given all seeds and aux bits, except for the unopened
                     * party, we get their commitment */
                    uint unopened = sig.challengeP[IndexOf(sig.challengeC, numOpenedRounds, t)];

                    for (uint j = 0; j < last; j++)
                    {
                        if (j != unopened)
                        {
                            commit(C[t][j], seeds[t].GetLeaf(j), null, sig.salt, t, j);
                        }
                    }

                    if (last != unopened)
                    {
                        commit(C[t][last], seeds[t].GetLeaf(last), sig.proofs[t].aux, sig.salt, t, last);
                    }

                    Array.Copy(sig.proofs[t].C, 0, C[t][unopened], 0, digestSizeBytes);
                }
            }

            /* Commit to the commitments */
            for (int t = 0; t < numMPCRounds; t++)
            {
                commit_h(Ch[t], C[t]);
            }

            /* Commit to the views */
            uint[] tmp_shares = new uint[stateSizeBits];
            for (uint t = 0; t < numMPCRounds; t++)
            {
                msgs[t] = new Msg(this);
                if (Contains(sig.challengeC, numOpenedRounds, (uint)t))
                {
                    /* 2. When t is in C, we have everything we need to re-compute the view, as an honest signer would.
                     * We simulate the MPC with one fewer party; the unopened party's values are all set to zero. */
                    uint unopened = sig.challengeP[IndexOf(sig.challengeC, numOpenedRounds, t)];

                    int tapeLengthBytes = 2 * andSizeBytes;
                    if (unopened != last)
                    {
                        // sig.proofs[t].aux is only set when P_t != N
                        tapes[t].SetAuxBits(sig.proofs[t].aux);
                    }
                    
                    Array.Copy(sig.proofs[t].msgs, 0, msgs[t].msgs[unopened], 0, andSizeBytes);

                    Arrays.Fill(tapes[t].tapes[unopened], (byte) 0);
                    msgs[t].unopened =  (int) unopened;

                    byte[] input_bytes = new byte[stateSizeWords * 4];
                    Array.Copy(sig.proofs[t].input, 0, input_bytes, 0, sig.proofs[t].input.Length);

                    uint[] temp = new uint[stateSizeWords];
                    Pack.LE_To_UInt32(input_bytes, 0, temp, 0, stateSizeWords);

                    int rv = SimulateOnline(temp, tapes[t], tmp_shares, msgs[t], plaintext, pubKey);
                    if (rv != 0)
                    {
                        Console.Error.Write("MPC simulation failed for round %d, signature invalid\n", t);
                        return -1;
                    }

                    commit_v(Cv[t], sig.proofs[t].input, msgs[t]);
                }
                else
                {
                    Cv[t] = null;
                }
            }

            int missingLeavesSize = numMPCRounds - numOpenedRounds;
            uint[] missingLeaves = GetMissingLeavesList(sig.challengeC);
            ret = treeCv.AddMerkleNodes(missingLeaves, (uint)missingLeavesSize, sig.cvInfo, (uint)sig.cvInfoLen);
            if (ret != 0)
            {
                return -1;
            }

            ret = treeCv.VerifyMerkleTree(Cv, sig.salt);
            if (ret != 0)
            {
                return -1;
            }

            /* Compute the challenge hash */
            HCP(challengeHash, null, null, Ch, treeCv.nodes[0], sig.salt, pubKey, plaintext, message);

            /* Compare to challenge from signature */
            if (!SubarrayEquals(sig.challengeHash, challengeHash, digestSizeBytes))
            {
                Console.Error.Write("Challenge does not match, signature invalid\n");
                return -1;
            }

            return ret;
        }

        private int DeserializeSignature2(Signature2 sig, byte[] sigBytes, uint sigLen, int sigBytesOffset)
        {
            /* Read the challenge and salt */
            int bytesRequired = digestSizeBytes + saltSizeBytes;

            if (sigBytes.Length < bytesRequired)
            {
                return -1;
            }

            Array.Copy(sigBytes, sigBytesOffset, sig.challengeHash, 0, digestSizeBytes);
            sigBytesOffset += digestSizeBytes;

            Array.Copy(sigBytes, sigBytesOffset, sig.salt, 0, saltSizeBytes);
            sigBytesOffset += saltSizeBytes;

            ExpandChallengeHash(sig.challengeHash, sig.challengeC, sig.challengeP);

            /* Add size of iSeeds tree data */
            Tree tree = new Tree(this, (uint)numMPCRounds, seedSizeBytes);
            sig.iSeedInfoLen = (int)tree.RevealSeedsSize(sig.challengeC, (uint)numOpenedRounds);
            bytesRequired += sig.iSeedInfoLen;
//        System.out.printf("iSeedInfoLen: %04x\n", sig.iSeedInfoLen);

            /* Add the size of the Cv Merkle tree data */
            int missingLeavesSize = numMPCRounds - numOpenedRounds;
            uint[] missingLeaves = GetMissingLeavesList(sig.challengeC);
            tree = new Tree(this, (uint)numMPCRounds, digestSizeBytes);
            sig.cvInfoLen = (int)tree.OpenMerkleTreeSize(missingLeaves, (uint)missingLeavesSize);
            bytesRequired += sig.cvInfoLen;

            /* Compute the number of bytes required for the proofs */
            uint[] hideList = new uint[1];
            tree = new Tree(this, (uint)numMPCParties, seedSizeBytes);
            int seedInfoLen = (int)tree.RevealSeedsSize(hideList, 1);
            for (uint t = 0; t < numMPCRounds; t++)
            {
                if (Contains(sig.challengeC, numOpenedRounds, t))
                {
                     uint P_t = sig.challengeP[IndexOf(sig.challengeC, numOpenedRounds, t)];
                    if (P_t != (numMPCParties - 1))
                    {
                        bytesRequired += andSizeBytes;
                    }

                    bytesRequired += seedInfoLen;
                    bytesRequired += stateSizeBytes;
                    bytesRequired += andSizeBytes;
                    bytesRequired += digestSizeBytes;
                }
            }

            /* Fail if the signature does not have the exact number of bytes we expect */
            if (sigLen != bytesRequired)
            {
                Console.Error.Write("sigBytesLen = %d, expected bytesRequired = %d\n", sigBytes.Length, bytesRequired);
                return -1;
            }

            sig.iSeedInfo = new byte[sig.iSeedInfoLen];
            Array.Copy(sigBytes, sigBytesOffset, sig.iSeedInfo, 0, sig.iSeedInfoLen);
            sigBytesOffset += sig.iSeedInfoLen;
//        Console.Error.Write("iSeedInfo: " + Hex.toHexString(sig.iSeedInfo));

            sig.cvInfo = new byte[sig.cvInfoLen];
            Array.Copy(sigBytes, sigBytesOffset, sig.cvInfo, 0, sig.cvInfoLen);
            sigBytesOffset += sig.cvInfoLen;

            /* Read the proofs */
            for (uint t = 0; t < numMPCRounds; t++)
            {
                if (Contains(sig.challengeC, numOpenedRounds, (uint)t))
                {
                    sig.proofs[t] = new Signature2.Proof2(this);
                    sig.proofs[t].seedInfoLen = seedInfoLen;
                    sig.proofs[t].seedInfo = new byte[sig.proofs[t].seedInfoLen];
                    Array.Copy(sigBytes, sigBytesOffset, sig.proofs[t].seedInfo, 0, sig.proofs[t].seedInfoLen);
                    sigBytesOffset += sig.proofs[t].seedInfoLen;

                    uint P_t = sig.challengeP[IndexOf(sig.challengeC, numOpenedRounds, t)];
                    if (P_t != (numMPCParties - 1))
                    {
                        Array.Copy(sigBytes, sigBytesOffset, sig.proofs[t].aux, 0, andSizeBytes);
                        sigBytesOffset += andSizeBytes;
                        if (!ArePaddingBitsZero(sig.proofs[t].aux, 3 * numRounds * numSboxes))
                        {
                            Console.Error.Write("failed while deserializing aux bits\n");
                            return -1;
                        }
                    }

                    Array.Copy(sigBytes, sigBytesOffset, sig.proofs[t].input, 0, stateSizeBytes);
                    sigBytesOffset += stateSizeBytes;

                    int msgsByteLength = andSizeBytes;
                    Array.Copy(sigBytes, sigBytesOffset, sig.proofs[t].msgs, 0, msgsByteLength);
                    sigBytesOffset += msgsByteLength;
                    int msgsBitLength = 3 * numRounds * numSboxes;
                    if (!ArePaddingBitsZero(sig.proofs[t].msgs, msgsBitLength))
                    {
                        Console.Error.Write("failed while deserializing msgs bits\n");
                        return -1;
                    }

                    Array.Copy(sigBytes, sigBytesOffset, sig.proofs[t].C, 0, digestSizeBytes);
                    sigBytesOffset += digestSizeBytes;
                }
            }

            return 0;
        }

        private bool ArePaddingBitsZero(byte[] data, int bitLength)
        {
            int byteLength = Utils.NumBytes(bitLength);
            for (int i = bitLength; i < byteLength * 8; i++)
            {
                 uint bit_i = Utils.GetBit(data, i);
                if (bit_i != 0)
                {
                    return false;
                }
            }

            return true;
        }

        public void crypto_sign(byte[] sm, byte[] m, byte[] sk)
        {
            picnic_sign(sk, m, sm);
            Array.Copy(m, 0, sm, 4, m.Length);
            sm = Arrays.CopyOfRange(sm, 0, signatureLength);
        }

        private void picnic_sign(byte[] sk, byte[] message, byte[] signature)
        {
            //todo unify conversion

            byte[] data_bytes = new byte[PICNIC_MAX_LOWMC_BLOCK_SIZE];
            Array.Copy(sk, 1, data_bytes, 0, stateSizeBytes);
            byte[] ciphertext_bytes = new byte[PICNIC_MAX_LOWMC_BLOCK_SIZE];
            Array.Copy(sk, 1 + stateSizeBytes, ciphertext_bytes, 0, stateSizeBytes);
            byte[] plaintext_bytes = new byte[PICNIC_MAX_LOWMC_BLOCK_SIZE];
            Array.Copy(sk, 1 + 2 * stateSizeBytes, plaintext_bytes, 0, stateSizeBytes);
            uint[] data = new uint[stateSizeWords];
            uint[] ciphertext = new uint[stateSizeWords];
            uint[] plaintext = new uint[stateSizeWords];

            Pack.LE_To_UInt32(data_bytes, 0, data);
            Pack.LE_To_UInt32(plaintext_bytes, 0, plaintext);
            Pack.LE_To_UInt32(ciphertext_bytes, 0, ciphertext);

            if (!is_picnic3(parameters))
            {
                Signature sig = new Signature(this);

                int ret = sign_picnic1(data, ciphertext, plaintext, message, sig);
                if (ret != 0)
                {
                    Console.Error.Write("Failed to create signature\n");
                }

                int len = SerializeSignature(sig, signature, message.Length + 4);
                if (len == -1)
                {
                    Console.Error.Write("Failed to serialize signature\n");
                }

                signatureLength = len;
                Pack.UInt32_To_LE((uint)len, signature, 0);
            }
            else
            {
                Signature2 sig = new Signature2(this);
                sign_picnic3(data, ciphertext, plaintext, message, sig);
                int len = SerializeSignature2(sig, signature, message.Length + 4);
                signatureLength = len;
                Pack.UInt32_To_LE((uint)len, signature, 0);
            }
        }

        /*** Serialization functions ***/

        int SerializeSignature(Signature sig, byte[] sigBytes, int sigOffset)
        {
            Signature.Proof[] proofs = sig.proofs;
            byte[] challengeBits = sig.challengeBits;

            /* Validate input buffer is large enough */
            int bytesRequired = Utils.NumBytes(2 * numMPCRounds) + saltSizeBytes +
                                numMPCRounds * (2 * seedSizeBytes + stateSizeBytes + andSizeBytes + digestSizeBytes);

            if (transform == TRANSFORM_UR)
            {
                bytesRequired += UnruhGWithoutInputBytes * numMPCRounds;
            }

            if (CRYPTO_BYTES < bytesRequired)
            {
                return -1;
            }

            int sigByteIndex = sigOffset;

            Array.Copy(challengeBits, 0, sigBytes, sigByteIndex, Utils.NumBytes(2 * numMPCRounds));
            sigByteIndex += Utils.NumBytes(2 * numMPCRounds);

            Array.Copy(sig.salt, 0, sigBytes, sigByteIndex, saltSizeBytes);

            sigByteIndex += saltSizeBytes;

            for (int i = 0; i < numMPCRounds; i++)
            {
                int challenge = GetChallenge(challengeBits, i);

                Array.Copy(proofs[i].view3Commitment, 0, sigBytes, sigByteIndex, digestSizeBytes);
                sigByteIndex += digestSizeBytes;

                if (transform == TRANSFORM_UR)
                {
                    int view3UnruhLength = (challenge == 0) ? UnruhGWithInputBytes : UnruhGWithoutInputBytes;
                    Array.Copy(proofs[i].view3UnruhG, 0, sigBytes, sigByteIndex, view3UnruhLength);
                    sigByteIndex += view3UnruhLength;
                }

                Array.Copy(proofs[i].communicatedBits, 0, sigBytes, sigByteIndex, andSizeBytes);
                sigByteIndex += andSizeBytes;

                Array.Copy(proofs[i].seed1, 0, sigBytes, sigByteIndex, seedSizeBytes);
                sigByteIndex += seedSizeBytes;

                Array.Copy(proofs[i].seed2, 0, sigBytes, sigByteIndex, seedSizeBytes);
                sigByteIndex += seedSizeBytes;

                if (challenge == 1 || challenge == 2)
                {
                    Pack.UInt32_To_LE(proofs[i].inputShare, 0, stateSizeWords, sigBytes, sigByteIndex);
                    sigByteIndex += stateSizeBytes;
                }

            }

            return sigByteIndex - sigOffset;
        }

        int GetChallenge(byte[] challenge, int round)
        {
            return (Utils.GetBit(challenge, 2 * round + 1) << 1) | Utils.GetBit(challenge, 2 * round);
        }

        private int SerializeSignature2(Signature2 sig, byte[] sigBytes, int sigOffset)
        {
            /* Compute the number of bytes required for the signature */
            int bytesRequired = digestSizeBytes + saltSizeBytes; /* challenge and salt */

            bytesRequired += sig.iSeedInfoLen; /* Encode only iSeedInfo, the length will be recomputed by deserialize */
            bytesRequired += sig.cvInfoLen;

            for (uint t = 0; t < numMPCRounds; t++)
            {
                /* proofs */
                if (Contains(sig.challengeC, numOpenedRounds, (uint)t))
                {
                    uint P_t = sig.challengeP[IndexOf(sig.challengeC, numOpenedRounds, t)];
                    bytesRequired += sig.proofs[t].seedInfoLen;
                    if (P_t != (numMPCParties - 1))
                    {
                        bytesRequired += andSizeBytes;
                    }

                    bytesRequired += stateSizeBytes;
                    bytesRequired += andSizeBytes;
                    bytesRequired += digestSizeBytes;
                }
            }

            if (sigBytes.Length < bytesRequired)
            {
                return -1;
            }

            int sigByteIndex = sigOffset;
            Array.Copy(sig.challengeHash, 0, sigBytes, sigByteIndex, digestSizeBytes);
            sigByteIndex += digestSizeBytes;

            Array.Copy(sig.salt, 0, sigBytes, sigByteIndex, saltSizeBytes);
            sigByteIndex += saltSizeBytes;

            Array.Copy(sig.iSeedInfo, 0, sigBytes, sigByteIndex, sig.iSeedInfoLen);
            sigByteIndex += sig.iSeedInfoLen;

            Array.Copy(sig.cvInfo, 0, sigBytes, sigByteIndex, sig.cvInfoLen);
            sigByteIndex += sig.cvInfoLen;

            /* Write the proofs */
            for (uint t = 0; t < numMPCRounds; t++)
            {
                if (Contains(sig.challengeC, numOpenedRounds, t))
                {
                    Array.Copy(sig.proofs[t].seedInfo, 0, sigBytes, sigByteIndex, sig.proofs[t].seedInfoLen);
                    sigByteIndex += sig.proofs[t].seedInfoLen;

                    uint P_t = sig.challengeP[IndexOf(sig.challengeC, numOpenedRounds, t)];

                    if (P_t != (numMPCParties - 1))
                    {
                        Array.Copy(sig.proofs[t].aux, 0, sigBytes, sigByteIndex, andSizeBytes);
                        sigByteIndex += andSizeBytes;
                    }

                    Array.Copy(sig.proofs[t].input, 0, sigBytes, sigByteIndex, stateSizeBytes);
                    sigByteIndex += stateSizeBytes;

                    Array.Copy(sig.proofs[t].msgs, 0, sigBytes, sigByteIndex, andSizeBytes);
                    sigByteIndex += andSizeBytes;

                    Array.Copy(sig.proofs[t].C, 0, sigBytes, sigByteIndex, digestSizeBytes);
                    sigByteIndex += digestSizeBytes;
                }
            }

            return sigByteIndex - sigOffset;
        }

        private int sign_picnic1(uint[] privateKey, uint[] pubKey, uint[] plaintext, byte[] message, Signature sig)
        {
            bool status;

            /* Allocate views and commitments for all parallel iterations */
            View[][] views = new View[numMPCRounds][]; // numMPCRounds, 3
            for (int i = 0; i < numMPCRounds; i++)
            {
                views[i] = new View[3];
            }

            byte[][][] AS = new byte[numMPCRounds][][]; // numMPCRounds, numMPCParties, digestSizeBytes
            for (int i = 0; i < numMPCRounds; i++)
            {
                AS[i] = new byte[numMPCParties][];
                for (int j = 0; j < numMPCParties; j++)
                {
                    AS[i][j] = new byte[digestSizeBytes];
                }
            }

            byte[][][] gs = new byte[numMPCRounds][][]; // numMPCRounds, 3, UnruhGWithInputBytes
            for (int i = 0; i < numMPCRounds; i++)
            {
                gs[i] = new byte[3][];
                for (int j = 0; j < 3; j++)
                {
                    gs[i][j] = new byte[UnruhGWithInputBytes];
                }
            }


            /* Compute seeds for all parallel iterations */
            byte[] seeds = ComputeSeeds(privateKey, pubKey, plaintext, message);
            int seedLen = numMPCParties * seedSizeBytes;

            Array.Copy(seeds, (seedLen) * (numMPCRounds), sig.salt, 0, saltSizeBytes);

            //Allocate a random tape (re-used per parallel iteration), and a temporary buffer
            Tape tape = new Tape(this);

            byte[] tmp = new byte[System.Math.Max(9 * stateSizeBytes, stateSizeBytes + andSizeBytes)];
            byte[] view_byte = new byte[stateSizeBytes * 4];

            for (int k = 0; k < numMPCRounds; k++)
            {
                views[k][0] = new View(this);
                views[k][1] = new View(this);
                views[k][2] = new View(this);
                // for first two players get all tape INCLUDING INPUT SHARE from seed
                for (int j = 0; j < 2; j++)
                {
                    status = CreateRandomTape(seeds, (seedLen) * k + j * seedSizeBytes,
                        sig.salt, (uint)k, (uint)j, tmp,  stateSizeBytes + andSizeBytes);
                    if (!status)
                    {
                        Console.Error.Write("createRandomTape failed \n");
                        return -1;
                    }

                    Array.Copy(tmp, 0, view_byte, 0, stateSizeBytes);
                    Utils.ZeroTrailingBits(view_byte, stateSizeBits);
                    Pack.LE_To_UInt32(view_byte, 0, views[k][j].inputShare);
                    Array.Copy(tmp, stateSizeBytes, tape.tapes[j], 0, andSizeBytes);
                }

                // Now set third party's wires. The random bits are from the seed, the input is
                // the XOR of other two inputs and the private key
                status = CreateRandomTape(seeds, (seedLen) * k + 2 * seedSizeBytes,
                    sig.salt, (uint)k, 2, tape.tapes[2], andSizeBytes);
                if (!status)
                {
                    Console.Error.Write("createRandomTape failed \n");
                    return -1;
                }

                xor_three(views[k][2].inputShare, privateKey, views[k][0].inputShare, views[k][1].inputShare,
                    stateSizeBytes);
                tape.pos = 0;

                uint[] tmp_int = Pack.LE_To_UInt32(tmp, 0, tmp.Length / 4);

                mpc_LowMC(tape, views[k], plaintext, tmp_int);
                Pack.UInt32_To_LE(tmp_int, tmp, 0);

                uint[] temp = new uint[LOWMC_MAX_WORDS];
                xor_three(temp, views[k][0].outputShare, views[k][1].outputShare, views[k][2].outputShare,
                    stateSizeBytes);


                if (!SubarrayEquals(temp, pubKey, stateSizeWords))
                {
                    Console.Error.WriteLine("Simulation failed; output does not match public key (round = " + k + ")");
                    return -1;
                }

                //Committing
                Commit(seeds, ((seedLen) * k) + 0 * seedSizeBytes, views[k][0],  AS[k][0]);
                Commit(seeds, ((seedLen) * k) + 1 * seedSizeBytes, views[k][1],  AS[k][1]);
                Commit(seeds, ((seedLen) * k) + 2 * seedSizeBytes, views[k][2],  AS[k][2]);

                if (transform == TRANSFORM_UR)
                {
                    G(0, seeds, ((seedLen) * k) + 0 * seedSizeBytes, views[k][0], gs[k][0]);
                    G(1, seeds, ((seedLen) * k) + 1 * seedSizeBytes, views[k][1], gs[k][1]);
                    G(2, seeds, ((seedLen) * k) + 2 * seedSizeBytes, views[k][2], gs[k][2]);
                }
            }

            //Generating challenges
            uint[][][] viewOutputs = new uint[numMPCRounds][][]; // [3][stateSizeBytes] 
            for (int i = 0; i < numMPCRounds; i++)
            {
                viewOutputs[i] = new uint[3][];
                for (int j = 0; j < 3; j++)
                {
                    viewOutputs[i][j] = views[i][j].outputShare;
                }
            }

            H3(pubKey, plaintext, viewOutputs, AS, sig.challengeBits, sig.salt, message, gs);

            //Packing Z
            for (int i = 0; i < numMPCRounds; i++)
            {
                Signature.Proof proof = sig.proofs[i];
                Prove(proof, GetChallenge(sig.challengeBits, i), seeds, ((seedLen) * i),
                    views[i],  AS[i],
                (transform != TRANSFORM_UR) ? null : gs[i]); //todo check if
            }

            return 0;
        }

        /* Caller must allocate the first parameter */
        void Prove(Signature.Proof proof, int challenge, byte[] seeds, int seedsOffset,
            View[] views, byte[][] commitments, byte[][] gs)
        {
            if (challenge == 0)
            {
                Array.Copy(seeds, seedsOffset + 0 * seedSizeBytes, proof.seed1, 0, seedSizeBytes);
                Array.Copy(seeds, seedsOffset + 1 * seedSizeBytes, proof.seed2, 0, seedSizeBytes);
            }
            else if (challenge == 1)
            {
                Array.Copy(seeds, seedsOffset + 1 * seedSizeBytes, proof.seed1, 0, seedSizeBytes);
                Array.Copy(seeds, seedsOffset + 2 * seedSizeBytes, proof.seed2, 0, seedSizeBytes);
            }
            else if (challenge == 2)
            {
                Array.Copy(seeds, seedsOffset + 2 * seedSizeBytes, proof.seed1, 0, seedSizeBytes);
                Array.Copy(seeds, seedsOffset + 0 * seedSizeBytes, proof.seed2, 0, seedSizeBytes);
            }
            else
            {
                Console.Error.Write("Invalid challenge");
            }

            if (challenge == 1 || challenge == 2)
            {
                Array.Copy(views[2].inputShare, 0, proof.inputShare, 0, stateSizeBytes);
            }

            Array.Copy(views[(challenge + 1) % 3].communicatedBits, 0, proof.communicatedBits, 0, andSizeBytes);

            Array.Copy(commitments[(challenge + 2) % 3], 0, proof.view3Commitment, 0, digestSizeBytes);
            if (transform == TRANSFORM_UR)
            {
                int view3UnruhLength = (challenge == 0) ? UnruhGWithInputBytes : UnruhGWithoutInputBytes;
                Array.Copy(gs[(challenge + 2) % 3], 0, proof.view3UnruhG, 0, view3UnruhLength);
            }
        }

        void H3(uint[] circuitOutput, uint[] plaintext, uint[][][] viewOutputs,
            byte[][][] AS, byte[] challengeBits, byte[] salt,
            byte[] message, byte[][][] gs)
        {
            byte[] hash = new byte[digestSizeBytes];

            /* Depending on the number of rounds, we might not set part of the last
             * byte, make sure it's always zero. */
            challengeBits[Utils.NumBytes(numMPCRounds * 2) - 1] = 0;

            digest.Update((byte) 1);

            /* Hash the output share from each view */
            for (int i = 0; i < numMPCRounds; i++)
            {
                for (int j = 0; j < 3; j++)
                {
                    digest.BlockUpdate(Pack.UInt32_To_LE(viewOutputs[i][j]), 0, stateSizeBytes);
                }
            }

            /* Hash all the commitments C */
            for (int i = 0; i < numMPCRounds; i++)
            {
                for (int j = 0; j < 3; j++)
                {
                    digest.BlockUpdate( AS[i][j],

                    0, digestSizeBytes);
                }
            }

            /* Hash all the commitments G */
            if (transform == TRANSFORM_UR)
            {
                for (int i = 0; i < numMPCRounds; i++)
                {
                    for (int j = 0; j < 3; j++)
                    {
                        int view3UnruhLength = (j == 2) ? UnruhGWithInputBytes : UnruhGWithoutInputBytes;
                        digest.BlockUpdate(gs[i][j], 0, view3UnruhLength);
                    }
                }
            }

            /* Hash the public key */
            digest.BlockUpdate(Pack.UInt32_To_LE(circuitOutput), 0, stateSizeBytes);
            digest.BlockUpdate(Pack.UInt32_To_LE(plaintext), 0, stateSizeBytes);

            /* Hash the salt & message */
            digest.BlockUpdate(salt, 0, saltSizeBytes);
            digest.BlockUpdate(message, 0, message.Length);
            digest.DoFinal(hash, 0, digestSizeBytes);

            /* Convert hash to a packed string of values in {0,1,2} */
            int round = 0;
            bool isNotDone = true;
            while (isNotDone)
            {
                for (int i = 0; i < digestSizeBytes; i++)
                {
                     uint one_byte = hash[i];
                    /* iterate over each pair of bits in the byte */
                    for (int j = 0; j < 8; j += 2)
                    {
                        uint bitPair = ((one_byte >> (6 - j)) & 0x03);
                        if (bitPair < 3)
                        {
                            SetChallenge(challengeBits, round, bitPair);
                            round++;
                            if (round == numMPCRounds)
                            {
                                isNotDone = false;
                                break;
                            }
                        }
                    }

                    if (!isNotDone)
                    {
                        break;
                    }
                }

                if (!isNotDone)
                {
                    break;
                }

                /* We need more bits; hash set hash = H_1(hash) */
                digest.Update((byte) 1);
                digest.BlockUpdate(hash, 0, digestSizeBytes);
                digest.DoFinal(hash, 0, digestSizeBytes);
            }
        }

        private void SetChallenge(byte[] challenge, int round, uint trit)
        {
            /* challenge must have length numBytes(numMPCRounds*2)
             * 0 <= index < numMPCRounds
             * trit must be in {0,1,2} */
            Utils.SetBit(challenge, 2 * round, (byte) (trit & 1));
            Utils.SetBit(challenge, 2 * round + 1, (byte) ((trit >> 1) & 1));
        }

        /* This is the random "permuatation" function G for Unruh's transform */
        private void G(int viewNumber, byte[] seed, int seedOffset, View view, byte[] output)
        {
            int outputBytes = seedSizeBytes + andSizeBytes;

            /* Hash the seed with H_5, store digest in output */
            digest.Update((byte) 5);
            digest.BlockUpdate(seed, seedOffset, seedSizeBytes);
            digest.DoFinal(output, 0, digestSizeBytes);

            /* Hash H_5(seed), the view, and the length */
            digest.BlockUpdate(output, 0, digestSizeBytes);
            if (viewNumber == 2)
            {
                digest.BlockUpdate(Pack.UInt32_To_LE(view.inputShare), 0, stateSizeBytes);
                outputBytes += stateSizeBytes;
            }

            digest.BlockUpdate(view.communicatedBits, 0, andSizeBytes);

            digest.BlockUpdate(Pack.UInt32_To_LE((uint)outputBytes), 0, 2);
            digest.DoFinal(output, 0, outputBytes);
        }

        private void mpc_LowMC(Tape tapes, View[] views, uint[] plaintext, uint[] slab)
        {
            Utils.Fill(slab, 0, slab.Length, 0);

            mpc_xor_constant(slab, 3 * stateSizeWords, plaintext, 0, stateSizeWords);

            KMatricesWithPointer current = LowmcConstants.Instance.KMatrix(this, 0);
            for (int player = 0; player < 3; player++)
            {
                matrix_mul_offset(slab, player * stateSizeWords, views[player].inputShare, 0,
                    current.GetData(), current.GetMatrixPointer());
            }

            mpc_xor(slab, slab, stateSizeWords, 3);

            for (int r = 1; r <= numRounds; r++)
            {
                current = LowmcConstants.Instance.KMatrix(this, r);
                for (int player = 0; player < 3; player++)
                {
                    matrix_mul_offset(slab, player * stateSizeWords,
                        views[player].inputShare, 0,
                        current.GetData(), current.GetMatrixPointer());
                }

                mpc_substitution(slab, tapes, views);

                current = LowmcConstants.Instance.LMatrix(this, r - 1);
                mpc_matrix_mul(slab, 3 * stateSizeWords,
                    slab, 3 * stateSizeWords,
                    current.GetData(), current.GetMatrixPointer(), 3);

                current = LowmcConstants.Instance.RConstant(this, r - 1);
                mpc_xor_constant(slab, 3 * stateSizeWords,
                    current.GetData(), current.GetMatrixPointer(), stateSizeWords);

                mpc_xor(slab, slab, stateSizeWords, 3);
            }

            for (int i = 0; i < 3; i++)
            {
                Array.Copy(slab, (3 + i) * stateSizeWords, views[i].outputShare, 0, stateSizeWords);
            }
        }

        private void Commit(byte[] seed, int seedOffset, View view, byte[] hash)
        {
            /* Hash the seed, store result in `hash` */
            digest.Update((byte) 4);
            digest.BlockUpdate(seed, seedOffset, seedSizeBytes);
            digest.DoFinal(hash, 0, digestSizeBytes);

            /* Compute H_0(H_4(seed), view) */
            digest.Update((byte) 0);
            digest.BlockUpdate(hash, 0, digestSizeBytes);
            digest.BlockUpdate(Pack.UInt32_To_LE(view.inputShare), 0, stateSizeBytes);
            digest.BlockUpdate(view.communicatedBits, 0, andSizeBytes);
            digest.BlockUpdate(Pack.UInt32_To_LE(view.outputShare), 0, stateSizeBytes);
            digest.DoFinal(hash, 0, digestSizeBytes);
        }

        private void mpc_substitution(uint[] state, Tape rand, View[] views)
        {
            uint[] a = new uint[3];
            uint[] b = new uint[3];
            uint[] c = new uint[3];

            uint[] ab = new uint[3];
            uint[] bc = new uint[3];
            uint[] ca = new uint[3];

            int stateOffset;
            for (int i = 0; i < numSboxes * 3; i += 3)
            {

                for (int j = 0; j < 3; j++)
                {
                    stateOffset = ((3 + j) * stateSizeWords) * 32;
                    a[j] = Utils.GetBitFromWordArray(state, stateOffset + i + 2);
                    b[j] = Utils.GetBitFromWordArray(state, stateOffset + i + 1);
                    c[j] = Utils.GetBitFromWordArray(state, stateOffset + i);
                }

                mpc_AND(a, b, ab, rand, views);
                mpc_AND(b, c, bc, rand, views);
                mpc_AND(c, a, ca, rand, views);

                for (int j = 0; j < 3; j++)
                {
                    stateOffset = ((3 + j) * stateSizeWords) * 32;
                    Utils.SetBitInWordArray(state, stateOffset + i + 2, a[j] ^ (bc[j]));
                    Utils.SetBitInWordArray(state, stateOffset + i + 1, a[j] ^ b[j] ^ (ca[j]));
                    Utils.SetBitInWordArray(state, stateOffset + i, a[j] ^ b[j] ^ c[j] ^ (ab[j]));
                }
            }
        }

        /*** Functions implementing Sign ***/
        private void mpc_AND(uint[] in1, uint[] in2, uint[] output, Tape rand, View[] views)
        {
            uint[] r = new uint[]
            {
                Utils.GetBit(rand.tapes[0], rand.pos),
                Utils.GetBit(rand.tapes[1], rand.pos),
                Utils.GetBit(rand.tapes[2], rand.pos)
            };

            for (int i = 0; i < 3; i++)
            {
                output[i] =
                (in1[i] & in2[(i + 1) % 3]) ^ (in1[(i + 1) % 3] & in2[i])
                                            ^ (in1[i] & in2[i]) ^ r[i] ^ r[(i + 1) % 3];

                Utils.SetBit(views[i].communicatedBits, rand.pos, (byte) (output[i] & 0xff));
            }

            rand.pos++;
        }

        private void mpc_xor(uint[] state, uint[] input, int len, int players)
        {
            for (int player = 0; player < players; player++)
            {
                for (int i = 0; i < len; i++)
                {
                    state[i + (players + player) * stateSizeWords] =
                        state[i + (players + player) * stateSizeWords] ^ input[i+player * stateSizeWords];
                }
            }
        }

        private void mpc_matrix_mul(uint[] output, int outputOffset, uint[] state, int stateOffset,
            uint[] matrix, int matrixOffset, int players)
        {
            for (int player = 0; player < players; player++)
            {
                matrix_mul_offset(output, outputOffset + player * stateSizeWords,
                    state, stateOffset + player * stateSizeWords,
                    matrix, matrixOffset);
            }
        }

        /* Compute the XOR of in with the first state vectors. */
        private void mpc_xor_constant(uint[] state, int stateOffset, uint[] input, int inOffset, int len)
        {
            for (int i = 0; i < len; i++)
            {
                state[i + stateOffset] = state[i + stateOffset] ^ input[i+inOffset];
            }
        }

        private bool CreateRandomTape(byte[] seed, int seedOffset, byte[] salt,  uint roundNumber, uint playerNumber,
            byte[] tape, int tapeLen)
        {
            if (tapeLen < digestSizeBytes)
            {
                return false;
            }

            /* Hash the seed and a constant, store the result in tape. */
            digest.Update((byte) 2);
            digest.BlockUpdate(seed, seedOffset, seedSizeBytes);
            digest.DoFinal(tape, 0, digestSizeBytes);
//        Console.Error.Write("tape: " + Hex.toHexString(tape));

            /* Expand the hashed seed, salt, round and player indices, and output
             * length to create the tape. */
            digest.BlockUpdate(tape, 0, digestSizeBytes); // Hash the hashed seed
            digest.BlockUpdate(salt, 0, saltSizeBytes);
            digest.BlockUpdate(Pack.UInt32_To_LE(roundNumber), 0, 2);
            digest.BlockUpdate(Pack.UInt32_To_LE(playerNumber), 0, 2);
            digest.BlockUpdate(Pack.UInt32_To_LE((uint)tapeLen), 0, 2);
            digest.DoFinal(tape, 0, tapeLen);

            return true;
        }

        private byte[] ComputeSeeds(uint[] privateKey, uint[] publicKey, uint[] plaintext, byte[] message)
        {
            byte[] allSeeds = new byte[seedSizeBytes * (numMPCParties * numMPCRounds) + saltSizeBytes];

            digest.BlockUpdate(Pack.UInt32_To_LE(privateKey), 0, stateSizeBytes);
            digest.BlockUpdate(message, 0, message.Length);
            digest.BlockUpdate(Pack.UInt32_To_LE(publicKey), 0, stateSizeBytes);
            digest.BlockUpdate(Pack.UInt32_To_LE(plaintext), 0, stateSizeBytes);
            digest.BlockUpdate(Pack.UInt32_To_LE((uint)stateSizeBits), 0, 2);

            // Derive the N*T seeds + 1 salt
            digest.DoFinal(allSeeds, 0, seedSizeBytes * (numMPCParties * numMPCRounds) + saltSizeBytes);

            return allSeeds;
        }

        private void sign_picnic3(uint[] privateKey, uint[] pubKey, uint[] plaintext, byte[] message, Signature2 sig)
        {
            byte[] saltAndRoot = new byte[saltSizeBytes + seedSizeBytes];
            ComputeSaltAndRootSeed(saltAndRoot, privateKey, pubKey, plaintext, message);

            byte[] root = Arrays.CopyOfRange(saltAndRoot, saltSizeBytes, saltAndRoot.Length);
            sig.salt = Arrays.CopyOfRange(saltAndRoot, 0, saltSizeBytes);

            Tree iSeedsTree = new Tree(this, (uint)numMPCRounds, seedSizeBytes);
            iSeedsTree.GenerateSeeds(root, sig.salt, 0);

            byte[][] iSeeds = iSeedsTree.GetLeaves();
            uint iSeedsOffset = iSeedsTree.GetLeavesOffset();

            Tape[] tapes = new Tape[numMPCRounds];
            Tree[] seeds = new Tree[numMPCRounds];
            for (uint t = 0; t < numMPCRounds; t++)
            {
                tapes[t] = new Tape(this);

                seeds[t] = new Tree(this, (uint)numMPCParties, seedSizeBytes);
                seeds[t].GenerateSeeds(iSeeds[t + iSeedsOffset], sig.salt, t);
                CreateRandomTapes(tapes[t], seeds[t].GetLeaves(), seeds[t].GetLeavesOffset(), sig.salt, t);
            }

            byte[][] inputs = new byte[numMPCRounds][];// numMPCRounds, stateSizeWords * 4;
            for (int i = 0; i < numMPCRounds; i++)
            {
                inputs[i] = new byte[stateSizeWords * 4];
            }
            
            byte[] auxBits = new byte[MAX_AUX_BYTES];
            for (int t = 0; t < numMPCRounds; t++)
            {
                tapes[t].ComputeAuxTape(inputs[t]);
            }

            /* Commit to seeds and aux bits */
            byte[][][] C = new byte[numMPCRounds][][];//[numMPCParties][digestSizeBytes]
            for (int i = 0; i < numMPCRounds; i++)
            {
                C[i] = new byte[numMPCParties][];
                for (int j = 0; j < numMPCParties; j++)
                {
                    C[i][j] = new byte[digestSizeBytes];
                }
            }

            for (int t = 0; t < numMPCRounds; t++)
            {
                for (uint j = 0; j < numMPCParties - 1; j++)
                {
                    commit(C[t][j], seeds[t].GetLeaf(j), null, sig.salt, (uint)t, j);
                }

                uint last = (uint)numMPCParties - 1;
                GetAuxBits(auxBits, tapes[t]);
                commit(C[t][last], seeds[t].GetLeaf(last), auxBits, sig.salt, (uint)t, last);
            }

            /* Simulate the online phase of the MPC */
            Msg[] msgs = new Msg[numMPCRounds];
            uint[] tmp_shares = new uint[stateSizeBits];
            for (int t = 0; t < numMPCRounds; t++)
            {
                msgs[t] = new Msg(this);
                uint[] maskedKey = Pack.LE_To_UInt32(inputs[t], 0, stateSizeWords);
                xor_array(maskedKey, maskedKey, privateKey, 0, stateSizeWords);
                int rv = SimulateOnline(maskedKey, tapes[t], tmp_shares, msgs[t], plaintext, pubKey);
                if (rv != 0)
                {
                    Console.Error.Write("MPC simulation failed, aborting signature\n");
                }

                Pack.UInt32_To_LE(maskedKey, inputs[t], 0);
            }

            /* Commit to the commitments and views */
            byte[][] Ch = new byte[numMPCRounds][];//[digestSizeBytes];
            for (int i = 0; i < numMPCRounds; i++)
            {
                Ch[i] = new byte[digestSizeBytes];
            }
            
            byte[][] Cv = new byte[numMPCRounds][];//[digestSizeBytes];
            for (int i = 0; i < numMPCRounds; i++)
            {
                Cv[i] = new byte[digestSizeBytes];
            }
            for (int t = 0; t < numMPCRounds; t++)
            {
                commit_h(Ch[t], C[t]);
                commit_v(Cv[t], inputs[t], msgs[t]);
            }

            /* Create a Merkle tree with Cv as the leaves */
            Tree treeCv = new Tree(this, (uint)numMPCRounds, digestSizeBytes);
            treeCv.BuildMerkleTree(Cv, sig.salt);

            /* Compute the challenge; two lists of integers */
            sig.challengeC = new uint[numOpenedRounds];
            sig.challengeP = new uint[numOpenedRounds];
            sig.challengeHash = new byte[digestSizeBytes];
            HCP(sig.challengeHash, sig.challengeC, sig.challengeP, Ch, treeCv.nodes[0], sig.salt, pubKey, plaintext,
                message);

            /* Send information required for checking commitments with Merkle tree.
             * The commitments the verifier will be missing are those not in challengeC. */
            int missingLeavesSize = numMPCRounds - numOpenedRounds;
            uint[] missingLeaves = GetMissingLeavesList(sig.challengeC);
            int[] cvInfoLen = new int[1];
            sig.cvInfo = treeCv.OpenMerkleTree(missingLeaves, (uint)missingLeavesSize, cvInfoLen);
            sig.cvInfoLen = cvInfoLen[0];

            /* Reveal iSeeds for unopened rounds, those in {0..T-1} \ ChallengeC. */
            sig.iSeedInfo = new byte[numMPCRounds * seedSizeBytes];
            sig.iSeedInfoLen = iSeedsTree.RevealSeeds(sig.challengeC, (uint)numOpenedRounds,
                sig.iSeedInfo, numMPCRounds * seedSizeBytes);


            /* Assemble the proof */
            sig.proofs = new Signature2.Proof2[numMPCRounds];
            for (uint t = 0; t < numMPCRounds; t++)
            {
                if (Contains(sig.challengeC, numOpenedRounds, t))
                {
                    sig.proofs[t] = new Signature2.Proof2(this);
                    int P_index = IndexOf(sig.challengeC, numOpenedRounds, t);

                    uint[] hideList = new uint[1];
                    hideList[0] = sig.challengeP[P_index];
                    sig.proofs[t].seedInfo = new byte[numMPCParties * seedSizeBytes];
                    sig.proofs[t].seedInfoLen = seeds[t].RevealSeeds(hideList, 1, sig.proofs[t].seedInfo,
                        (numMPCParties * seedSizeBytes));

                    int last = numMPCParties - 1;
                    if (sig.challengeP[P_index] != last)
                    {
                        GetAuxBits(sig.proofs[t].aux, tapes[t]);
                    }

                    Array.Copy(inputs[t], 0, sig.proofs[t].input, 0, stateSizeBytes);
                    Array.Copy(msgs[t].msgs[sig.challengeP[P_index]], 0, sig.proofs[t].msgs, 0, andSizeBytes);
                    Array.Copy(C[t][sig.challengeP[P_index]], 0, sig.proofs[t].C, 0, digestSizeBytes);
                }
            }
        }

        private static int IndexOf(uint[] list, int len, uint value)
        {
            return Array.IndexOf(list, value, 0, len);
        }

        private uint[] GetMissingLeavesList(uint[] challengeC)
        {
            uint missingLeavesSize = (uint)(numMPCRounds - numOpenedRounds);
            uint[] missingLeaves = new uint[missingLeavesSize];
            uint pos = 0;

            for (int i = 0; i < numMPCRounds; i++)
            {
                if (!Contains(challengeC, numOpenedRounds, (uint)i))
                {
                    missingLeaves[pos] = (uint)i;
                    pos++;
                }
            }

            return missingLeaves;
        }


        private void HCP(byte[] challengeHash, uint[] challengeC, uint[] challengeP, byte[][] Ch,
            byte[] hCv, byte[] salt, uint[] pubKey, uint[] plaintext, byte[] message)
        {
            for (int t = 0; t < numMPCRounds; t++)
            {
                digest.BlockUpdate(Ch[t], 0, digestSizeBytes);
            }

            digest.BlockUpdate(hCv, 0, digestSizeBytes);
            digest.BlockUpdate(salt, 0, saltSizeBytes);
            digest.BlockUpdate(Pack.UInt32_To_LE(pubKey), 0, stateSizeBytes);
            digest.BlockUpdate(Pack.UInt32_To_LE(plaintext), 0, stateSizeBytes);
            digest.BlockUpdate(message, 0, message.Length);
            digest.DoFinal(challengeHash, 0, digestSizeBytes);

            if ((challengeC != null) && (challengeP != null))
            {
                ExpandChallengeHash(challengeHash, challengeC, challengeP);
            }
        }

        static int BitsToChunks(int chunkLenBits, byte[] input, int inputLen, uint[] chunks)
        {
            if (chunkLenBits > inputLen * 8)
            {
                return 0;
            }

            int chunkCount = ((inputLen * 8) / chunkLenBits);

            for (int i = 0; i < chunkCount; i++)
            {
                chunks[i] = 0;
                for (int j = 0; j < chunkLenBits; j++)
                {
                    chunks[i] += (uint) (Utils.GetBit(input, i * chunkLenBits + j) << j);
                }
            }

            return chunkCount;
        }

        static uint AppendUnique(uint[] list,  uint value,  uint position)
        {
            if (position == 0)
            {
                list[position] = value;
                return position + 1;
            }

            for (int i = 0; i < position; i++)
            {
                if (list[i] == value)
                {
                    return position;
                }
            }

            list[position] = value;
            return position + 1;
        }

        private void ExpandChallengeHash(byte[] challengeHash, uint[] challengeC, uint[] challengeP)
        {
            // Populate C
            uint bitsPerChunkC = Utils.ceil_log2((uint)numMPCRounds);
            uint bitsPerChunkP = Utils.ceil_log2((uint)numMPCParties);
            uint[] chunks = new uint[digestSizeBytes * 8 / System.Math.Min(bitsPerChunkC, bitsPerChunkP)];
            byte[] h = new byte[MAX_DIGEST_SIZE];

            Array.Copy(challengeHash, 0, h, 0, digestSizeBytes);

            uint countC = 0;
            while (countC < numOpenedRounds)
            {
                int numChunks = BitsToChunks((int)bitsPerChunkC, h, digestSizeBytes, chunks);
                for (int i = 0; i < numChunks; i++)
                {
                    if (chunks[i] < numMPCRounds)
                    {
                        countC = AppendUnique(challengeC, chunks[i], countC);
                    }

                    if (countC == numOpenedRounds)
                    {
                        break;
                    }
                }

                digest.Update((byte) 1);
                digest.BlockUpdate(h, 0, digestSizeBytes);
                digest.DoFinal(h, 0, digestSizeBytes);
            }

            // Note that we always compute h = H(h) after setting C
             uint countP = 0;

            while (countP < numOpenedRounds)
            {
                int numChunks = BitsToChunks((int)bitsPerChunkP, h, digestSizeBytes, chunks);
                for (int i = 0; i < numChunks; i++)
                {
                    if (chunks[i] < numMPCParties)
                    {
                        challengeP[countP] = chunks[i];
                        countP++;
                    }

                    if (countP == numOpenedRounds)
                    {
                        break;
                    }
                }

                digest.Update((byte) 1);
                digest.BlockUpdate(h, 0, digestSizeBytes);
                digest.DoFinal(h, 0, digestSizeBytes);
            }
        }

        private void commit_h(byte[] digest_arr, byte[][] C)
        {
            for (int i = 0; i < numMPCParties; i++)
            {
                digest.BlockUpdate(C[i], 0, digestSizeBytes);
            }

            digest.DoFinal(digest_arr, 0, digestSizeBytes);
        }

        private void commit_v(byte[] digest_arr, byte[] input, Msg msg)
        {
            digest.BlockUpdate(input, 0, stateSizeBytes);
            for (int i = 0; i < numMPCParties; i++)
            {
                int msgs_size = Utils.NumBytes(msg.pos);
                digest.BlockUpdate(msg.msgs[i], 0, msgs_size);
            }

            digest.DoFinal(digest_arr, 0, digestSizeBytes);
        }

        private int SimulateOnline(uint[] maskedKey, Tape tape, uint[] tmp_shares,
            Msg msg, uint[] plaintext, uint[] pubKey)
        {
            int ret = 0;
            uint[] roundKey = new uint[LOWMC_MAX_WORDS];
            uint[] state = new uint[LOWMC_MAX_WORDS];

            KMatricesWithPointer current = LowmcConstants.Instance.KMatrix(this, 0);
            matrix_mul(roundKey, maskedKey, current.GetData(),
                current.GetMatrixPointer()); // roundKey = maskedKey * KMatrix[0]
            xor_array(state, roundKey, plaintext, 0, stateSizeWords); // state = plaintext + roundKey

            for (int r = 1; r <= numRounds; r++)
            {
                TapesToWords(tmp_shares, tape);
                mpc_sbox(state, tmp_shares, tape, msg);

                current = LowmcConstants.Instance.LMatrix(this, r - 1);
                matrix_mul(state, state, current.GetData(),
                    current.GetMatrixPointer()); // state = state * LMatrix (r-1)

                current = LowmcConstants.Instance.RConstant(this, r - 1);
                xor_array(state, state, current.GetData(), current.GetMatrixPointer(),
                    stateSizeWords); // state += RConstant

                current = LowmcConstants.Instance.KMatrix(this, r);
                matrix_mul(roundKey, maskedKey, current.GetData(), current.GetMatrixPointer());
                xor_array(state, roundKey, state, 0, stateSizeWords); // state += roundKey
            }

            if (!SubarrayEquals(state, pubKey, stateSizeWords))
            {
                ret = -1;
            }

            return ret;
        }

        private void CreateRandomTapes(Tape tape, byte[][] seeds,  uint seedsOffset, byte[] salt,  uint t)
        {
            int tapeSizeBytes = 2 * andSizeBytes;
            for (uint i = 0; i < numMPCParties; i++)
            {
                digest.BlockUpdate(seeds[i + seedsOffset], 0, seedSizeBytes);
                digest.BlockUpdate(salt, 0, saltSizeBytes);
                digest.BlockUpdate(Pack.UInt32_To_LE(t), 0, 2);
                digest.BlockUpdate(Pack.UInt32_To_LE(i), 0, 2);
                digest.DoFinal(tape.tapes[i], 0, tapeSizeBytes);
            }
        }

        private static bool SubarrayEquals(byte[] a, byte[] b, int length)
        {
            if (a.Length < length || b.Length < length)
                return false;

            for (int i = 0; i < length; i++)
            {
                if (a[i] != b[i])
                    return false;
            }

            return true;
        }

        private static bool SubarrayEquals(uint[] a, uint[] b, int length)
        {
            if (a.Length < length || b.Length < length)
                return false;

            for (int i = 0; i < length; i++)
            {
                if (a[i] != b[i])
                    return false;
            }

            return true;
        }

        static uint Extend(uint bit)
        {
            return ~(bit - 1);
        }

        private void WordToMsgs(uint w, Msg msg)
        {
            for (int i = 0; i < numMPCParties; i++)
            {
                 uint w_i = Utils.GetBit(Pack.UInt32_To_LE(w), i);
                Utils.SetBit(msg.msgs[i], msg.pos, (byte) (w_i & 0xff));
            }

            msg.pos++;
        }

        private uint mpc_AND(uint a, uint b, uint mask_a, uint mask_b, Tape tape, Msg msg)
        {
            uint and_helper = tape.TapesToWord(); // The special mask value setup during preprocessing for each AND gate
            uint s_shares = (Extend(a) & mask_b) ^ (Extend(b) & mask_a) ^ and_helper;

            byte[] temp = Pack.UInt32_To_LE(s_shares);

            if (msg.unopened >= 0)
            {
                 uint unopenedPartyBit = Utils.GetBit(msg.msgs[msg.unopened], msg.pos);
                Utils.SetBit(temp, msg.unopened, (byte) (unopenedPartyBit & 0xff));
                s_shares = Pack.LE_To_UInt32(temp, 0);
            }

            // Broadcast each share of s
            WordToMsgs(s_shares, msg);
            return Utils.Parity16(s_shares) ^ (a & b);
        }

        private void mpc_sbox(uint[] state, uint[] state_masks, Tape tape, Msg msg)
        {
            for (int i = 0; i < numSboxes * 3; i += 3)
            {
                uint a = Utils.GetBitFromWordArray(state, i + 2);
                uint mask_a = state_masks[i + 2];

                uint b = Utils.GetBitFromWordArray(state, i + 1);
                uint mask_b = state_masks[i + 1];

                uint c = Utils.GetBitFromWordArray(state, i);
                uint mask_c = state_masks[i];

                uint ab = mpc_AND(a, b, mask_a, mask_b, tape, msg);
                uint bc = mpc_AND(b, c, mask_b, mask_c, tape, msg);
                uint ca = mpc_AND(c, a, mask_c, mask_a, tape, msg);

                uint d = a ^ bc;
                uint e = a ^ b ^ ca;
                uint f = a ^ b ^ c ^ ab;

                Utils.SetBitInWordArray(state, i + 2, d);
                Utils.SetBitInWordArray(state, i + 1, e);
                Utils.SetBitInWordArray(state, i, f);
            }
        }

        protected internal void aux_mpc_sbox(uint[] input, uint[] output, Tape tape)
        {
            for (int i = 0; i < numSboxes * 3; i += 3)
            {
                uint a = Utils.GetBitFromWordArray(input, i + 2);
                uint b = Utils.GetBitFromWordArray(input, i + 1);
                uint c = Utils.GetBitFromWordArray(input, i);

                uint d = Utils.GetBitFromWordArray(output, i + 2);
                uint e = Utils.GetBitFromWordArray(output, i + 1);
                uint f = Utils.GetBitFromWordArray(output, i);

                uint fresh_output_mask_ab = f ^ a ^ b ^ c;
                uint fresh_output_mask_bc = d ^ a;
                uint fresh_output_mask_ca = e ^ a ^ b;

                aux_mpc_AND(a, b, fresh_output_mask_ab, tape);
                aux_mpc_AND(b, c, fresh_output_mask_bc, tape);
                aux_mpc_AND(c, a, fresh_output_mask_ca, tape);
            }
        }

        private void aux_mpc_AND(uint mask_a, uint mask_b, uint fresh_output_mask, Tape tape)
        {
            int lastParty = numMPCParties - 1;
            uint and_helper = tape.TapesToWord();
            and_helper = Utils.Parity16(and_helper) ^ Utils.GetBit(tape.tapes[lastParty], tape.pos - 1);
            uint aux_bit = (mask_a & mask_b) ^ and_helper ^ fresh_output_mask;
            Utils.SetBit(tape.tapes[lastParty], tape.pos - 1, (byte) (aux_bit & 0xff));
        }


        private bool Contains(uint[] list, int len, uint value)
        {
            for (int i = 0; i < len; i++)
            {
                if (list[i] == value)
                {
                    return true;
                }
            }

            return false;
        }

        private void TapesToWords(uint[] shares, Tape tape)
        {
            for (int w = 0; w < stateSizeBits; w++)
            {
                shares[w] = tape.TapesToWord();
            }
        }

        private void GetAuxBits(byte[] output, Tape tape)
        {
            var lastTape = tape.tapes[numMPCParties - 1];
            int n = stateSizeBits, pos = 0, tapePos = 0;

            for (int j = 0; j < numRounds; j++)
            {
                tapePos += n;

                for (int i = 0; i < n; i++)
                {
                    Utils.SetBit(output, pos++, Utils.GetBit(lastTape, tapePos++));
                }
            }
        }

        private void commit(byte[] digest_arr, byte[] seed, byte[] aux, byte[] salt,  uint t,  uint j)
        {
            /* Compute C[t][j];  as digest = H(seed||[aux]) aux is optional */
            digest.BlockUpdate(seed, 0, seedSizeBytes);
            if (aux != null)
            {
                digest.BlockUpdate(aux, 0, andSizeBytes);
            }

            digest.BlockUpdate(salt, 0, saltSizeBytes);
            digest.BlockUpdate(Pack.UInt32_To_LE(t), 0, 2);
            digest.BlockUpdate(Pack.UInt32_To_LE(j), 0, 2);
            digest.DoFinal(digest_arr, 0, digestSizeBytes);
        }

        private void ComputeSaltAndRootSeed(byte[] saltAndRoot, uint[] privateKey, uint[] pubKey, uint[] plaintext, byte[] message)
        {
            //todo unify conversion
            //copy back to byte array
            byte[] privatekey_bytes = new byte[PICNIC_MAX_LOWMC_BLOCK_SIZE];
            byte[] pubkey_bytes = new byte[PICNIC_MAX_LOWMC_BLOCK_SIZE];
            byte[] plaintext_bytes = new byte[PICNIC_MAX_LOWMC_BLOCK_SIZE];
            Pack.UInt32_To_LE(privateKey, privatekey_bytes, 0);
            Pack.UInt32_To_LE(pubKey, pubkey_bytes, 0);
            Pack.UInt32_To_LE(plaintext, plaintext_bytes, 0);
            privatekey_bytes = Arrays.CopyOfRange(privatekey_bytes, 0, stateSizeBytes);
            pubkey_bytes = Arrays.CopyOfRange(pubkey_bytes, 0, stateSizeBytes);
            plaintext_bytes = Arrays.CopyOfRange(plaintext_bytes, 0, stateSizeBytes);
            //

            // init done in constructor
            digest.BlockUpdate(privatekey_bytes, 0, stateSizeBytes);
            digest.BlockUpdate(message, 0, message.Length);
            digest.BlockUpdate(pubkey_bytes, 0, stateSizeBytes);
            digest.BlockUpdate(plaintext_bytes, 0, stateSizeBytes);
            digest.BlockUpdate(Pack.UInt16_To_LE((ushort) (stateSizeBits & 0xffff)), 0, 2);
            digest.DoFinal(saltAndRoot, 0, saltAndRoot.Length);
        }

        static bool is_picnic3(int parameters)
        {
            return parameters == 7 /*Picnic3_L1*/ ||
                   parameters == 8 /*Picnic3_L3*/ ||
                   parameters == 9 /*Picnic3_L5*/ ;
        }

        //todo return int;
        public void crypto_sign_keypair(byte[] pk, byte[] sk, SecureRandom random)
        {
            // set array sizes
            byte[] plaintext_bytes = new byte[PICNIC_MAX_LOWMC_BLOCK_SIZE];
            byte[] ciphertext_bytes = new byte[PICNIC_MAX_LOWMC_BLOCK_SIZE];
            byte[] data_bytes = new byte[PICNIC_MAX_LOWMC_BLOCK_SIZE];

            picnic_keygen(plaintext_bytes, ciphertext_bytes, data_bytes, random);
            picnic_write_public_key(ciphertext_bytes, plaintext_bytes, pk);
            picnic_write_private_key(data_bytes, ciphertext_bytes, plaintext_bytes, sk);
        }

        private int picnic_write_private_key(byte[] data, byte[] ciphertext, byte[] plaintext, byte[] buf)
        {
            int bytesRequired = 1 + 3 * stateSizeBytes;
            if (buf.Length < bytesRequired)
            {
                Console.Error.Write("Failed writing private key!");
                return -1;
            }

            buf[0] = (byte) parameters;
            Array.Copy(data, 0, buf, 1, stateSizeBytes);
            Array.Copy(ciphertext, 0, buf, 1 + stateSizeBytes, stateSizeBytes);
            Array.Copy(plaintext, 0, buf, 1 + 2 * stateSizeBytes, stateSizeBytes);
            return bytesRequired;
        }

        private int picnic_write_public_key(byte[] ciphertext, byte[] plaintext, byte[] buf)
        {
            int bytesRequired = 1 + 2 * stateSizeBytes;
            if (buf.Length < bytesRequired)
            {
                Console.Error.Write("Failed writing public key!");
                return -1;
            }

            buf[0] = (byte) parameters;
            Array.Copy(ciphertext, 0, buf, 1, stateSizeBytes);
            Array.Copy(plaintext, 0, buf, 1 + stateSizeBytes, stateSizeBytes);
            return bytesRequired;

        }

        // todo use object to store pt and ct in public key and data in private key
        private void picnic_keygen(byte[] plaintext_bytes, byte[] ciphertext_bytes, byte[] data_bytes,
            SecureRandom random)
        {
            uint[] data = new uint[data_bytes.Length / 4];
            uint[] plaintext = new uint[plaintext_bytes.Length / 4];
            uint[] ciphertext = new uint[ciphertext_bytes.Length / 4];

            // generate a private key
            random.NextBytes(data_bytes, 0, stateSizeBytes);
            Utils.ZeroTrailingBits(data_bytes, stateSizeBits);
            Pack.LE_To_UInt32(data_bytes, 0, data);

            // generate a plaintext block
            random.NextBytes(plaintext_bytes, 0, stateSizeBytes);
            Utils.ZeroTrailingBits(plaintext_bytes, stateSizeBits);
            Pack.LE_To_UInt32(plaintext_bytes, 0, plaintext);

            // compute ciphertext
            LowMCEnc(plaintext, ciphertext, data);

            //copy back to byte array
            Pack.UInt32_To_LE(data, data_bytes, 0);
            Pack.UInt32_To_LE(plaintext, plaintext_bytes, 0);
            Pack.UInt32_To_LE(ciphertext, ciphertext_bytes, 0);
        }

        private void LowMCEnc(uint[] plaintext, uint[] output, uint[] key)
        {
            uint[] roundKey = new uint[LOWMC_MAX_WORDS];

            if (plaintext != output)
            {
                /* output will hold the intermediate state */
                Array.Copy(plaintext, 0, output, 0, stateSizeWords);
            }

            KMatricesWithPointer current = LowmcConstants.Instance.KMatrix(this, 0);
            matrix_mul(roundKey, key, current.GetData(), current.GetMatrixPointer());

            xor_array(output, output, roundKey, 0, stateSizeWords);

            for (int r = 1; r <= numRounds; r++)
            {
                current = LowmcConstants.Instance.KMatrix(this, r);
                matrix_mul(roundKey, key, current.GetData(), current.GetMatrixPointer());

                Substitution(output);

                current = LowmcConstants.Instance.LMatrix(this, r - 1);
                matrix_mul(output, output, current.GetData(), current.GetMatrixPointer());

                current = LowmcConstants.Instance.RConstant(this, r - 1);
                xor_array(output, output, current.GetData(), current.GetMatrixPointer(), stateSizeWords);
                xor_array(output, output, roundKey, 0, stateSizeWords);
            }
        }

        private void Substitution(uint[] state)
        {
            for (int i = 0; i < numSboxes * 3; i += 3)
            {
                uint a = Utils.GetBitFromWordArray(state, i + 2);
                uint b = Utils.GetBitFromWordArray(state, i + 1);
                uint c = Utils.GetBitFromWordArray(state, i);

                Utils.SetBitInWordArray(state, i + 2, (a ^ (b & c)));
                Utils.SetBitInWordArray(state, i + 1, (a ^ b ^ (a & c)));
                Utils.SetBitInWordArray(state, i, (a ^ b ^ c ^ (a & b)));
            }
        }

        private void xor_three(uint[] output, uint[] in1, uint[] in2, uint[] in3, int lenBytes)
        {
            int wholeWords = stateSizeWords;
            for (int i = 0; i < wholeWords; i++)
            {
                output[i] = in1[i] ^ in2[i] ^ in3[i];
            }
        }

        protected internal void xor_array(uint[] output, uint[] in1, uint[] in2, int in2_offset, int length)
        {
            for (int i = 0; i < length; i++)
            {
                output[i] = in1[i] ^ in2[i + in2_offset];
            }
        }

        protected internal void matrix_mul(uint[] output, uint[] state, uint[] matrix, int matrixOffset)
        {
            matrix_mul_offset(output, 0, state, 0, matrix, matrixOffset);
        }

        protected void matrix_mul_offset(uint[] output, int outputOffset, uint[] state, int stateOffset, uint[] matrix,
            int matrixOffset)
        {
            // Use temp to correctly handle the case when state = output
            uint[] temp = new uint[LOWMC_MAX_WORDS];
            temp[stateSizeWords - 1] = 0;
            int wholeWords = stateSizeBits / WORD_SIZE_BITS;

            for (int i = 0; i < stateSizeBits; i++)
            {
                uint prod = 0;
                for (int j = 0; j < wholeWords; j++)
                {
                    int index = i * stateSizeWords + j;
                    prod ^= state[j + stateOffset] & matrix[matrixOffset + index];
                }

                for (int j = wholeWords * WORD_SIZE_BITS; j < stateSizeBits; j++)
                {
                    int index = i * stateSizeWords * WORD_SIZE_BITS + j;
                    uint bit = Utils.GetBitFromWordArray(state, stateOffset * 32 + j)
                             & Utils.GetBitFromWordArray(matrix, matrixOffset * 32 + index);
                    prod ^= bit;
                }

                Utils.SetBit(temp, i, Utils.Parity32(prod));
            }

            Array.Copy(temp, 0, output, outputOffset, stateSizeWords);
        }
    }
}
