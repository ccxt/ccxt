using System;
using System.Collections.Generic;

namespace Org.BouncyCastle.Pqc.Crypto.Lms
{
    public class HSS
    {
        public static HSSPrivateKeyParameters GenerateHssKeyPair(HSSKeyGenerationParameters parameters)
        {
            //
            // LmsPrivateKey can derive and hold the public key so we just use an array of those.
            //
            LMSPrivateKeyParameters[] keys = new LMSPrivateKeyParameters[parameters.GetDepth()];
            LMSSignature[] sig = new LMSSignature[parameters.GetDepth() - 1];

            byte[] rootSeed = new byte[32];
            parameters.Random.NextBytes(rootSeed);

            byte[] I = new byte[16];
            parameters.Random.NextBytes(I);

            //
            // Set the HSS key up with a valid root LMSPrivateKeyParameters and placeholders for the remaining LMS keys.
            // The placeholders pass enough information to allow the HSSPrivateKeyParameters to be properly reset to an
            // index of zero. Rather than repeat the same reset-to-index logic in this static method.
            //

            byte[] zero = new byte[0];

            long hssKeyMaxIndex = 1;
            for (int t = 0; t < keys.Length; t++)
            {
                if (t == 0)
                {
                    keys[t] = new LMSPrivateKeyParameters(
                        parameters.GetLmsParameters()[t].GetLmSigParam(),
                        parameters.GetLmsParameters()[t].GetLmotsParam(),
                        0,
                        I,
                        1 << parameters.GetLmsParameters()[t].GetLmSigParam().GetH(),
                        rootSeed);
                }
                else
                {
                    keys[t] = new PlaceholderLMSPrivateKey(
                        parameters.GetLmsParameters()[t].GetLmSigParam(),
                        parameters.GetLmsParameters()[t].GetLmotsParam(),
                        -1,
                        zero,
                        1 << parameters.GetLmsParameters()[t].GetLmSigParam().GetH(),
                        zero);
                }
                hssKeyMaxIndex *= 1 << parameters.GetLmsParameters()[t].GetLmSigParam().GetH();
            }

            // if this has happened we're trying to generate a really large key
            // we'll use MAX_VALUE so that it's at least usable until someone upgrades the structure.
            if (hssKeyMaxIndex == 0)
            {
                hssKeyMaxIndex = long.MaxValue;
            }

            return new HSSPrivateKeyParameters(
                parameters.GetDepth(),
                new List<LMSPrivateKeyParameters>(keys),
                new List<LMSSignature>(sig),
                0, hssKeyMaxIndex);
        }

        /**
         * Increments an HSS private key without doing any work on it.
         * HSS private keys are automatically incremented when when used to create signatures.
         * <p/>
         * The HSS private key is ranged tested before this incrementation is applied.
         * LMS keys will be replaced as required.
         *
         * @param keyPair
         */
        public static void IncrementIndex(HSSPrivateKeyParameters keyPair)
        {
            lock (keyPair)
            {
                RangeTestKeys(keyPair);
                keyPair.IncIndex();
                (keyPair.GetKeys()[(keyPair.L - 1)] as LMSPrivateKeyParameters).IncIndex();
            }
        }


        public static void RangeTestKeys(HSSPrivateKeyParameters keyPair)
        {
            lock (keyPair)
            {
                if (keyPair.GetIndex() >= keyPair.IndexLimit)
                {
                    throw new Exception(
                        "hss private key" +
                            ((keyPair.IsShard()) ? " shard" : "") +
                            " is exhausted");
                }


                int L = keyPair.L;
                int d = L;
                var prv = keyPair.GetKeys();
                while ((prv[d - 1] as LMSPrivateKeyParameters).GetIndex() == 1 << ((prv[(d - 1)] as LMSPrivateKeyParameters ).GetSigParameters().GetH()))
                {
                    d = d - 1;
                    if (d == 0)
                    {
                        throw new Exception(
                            "hss private key" +
                                ((keyPair.IsShard()) ? " shard" : "") +
                                " is exhausted the maximum limit for this HSS private key");
                    }
                }


                while (d < L)
                {
                    keyPair.ReplaceConsumedKey(d);
                    d = d + 1;
                }
            }
        }


        public static HSSSignature GenerateSignature(HSSPrivateKeyParameters keyPair, byte[] message)
        {
            LMSSignedPubKey[] signed_pub_key;
            LMSPrivateKeyParameters nextKey;
            int L = keyPair.L;

            lock (keyPair)
            {
                RangeTestKeys(keyPair);
                
                var keys = keyPair.GetKeys();
                var sig = keyPair.GetSig();

                nextKey = keyPair.GetKeys()[L - 1] as LMSPrivateKeyParameters;

                // Step 2. Stand in for sig[L-1]
                int i = 0;
                signed_pub_key = new LMSSignedPubKey[L - 1];
                while (i < L - 1)
                {
                    signed_pub_key[i] = new LMSSignedPubKey(
                        sig[i] as LMSSignature,
                        (keys[i + 1] as LMSPrivateKeyParameters).GetPublicKey());
                    i = i + 1;
                }

                //
                // increment the index.
                //
                keyPair.IncIndex();
            }

            LMSContext context = nextKey.GenerateLmsContext().WithSignedPublicKeys(signed_pub_key);

            context.BlockUpdate(message, 0, message.Length);

            return GenerateSignature(L, context);
        }

        public static HSSSignature GenerateSignature(int L, LMSContext context)
        {
            return new HSSSignature(L - 1, context.GetSignedPubKeys(), LMS.GenerateSign(context));
        }

        public static bool VerifySignature(HSSPublicKeyParameters publicKey, HSSSignature signature, byte[] message)
        {
            int Nspk = signature.GetlMinus1();
            if (Nspk + 1 != publicKey.GetL())
            {
                return false;
            }

            LMSSignature[] sigList = new LMSSignature[Nspk + 1];
            LMSPublicKeyParameters[] pubList = new LMSPublicKeyParameters[Nspk];

            for (int i = 0; i < Nspk; i++)
            {
                sigList[i] = signature.GetSignedPubKey()[i].GetSignature();
                pubList[i] = signature.GetSignedPubKey()[i].GetPublicKey();
            }
            sigList[Nspk] = signature.GetSignature();

            LMSPublicKeyParameters key = publicKey.GetLmsPublicKey();

            for (int i = 0; i < Nspk; i++)
            {
                LMSSignature sig = sigList[i];
                byte[] msg = pubList[i].ToByteArray();
                if (!LMS.VerifySignature(key, sig, msg))
                {
                    return false;
                }
                try
                {
                    key = pubList[i];
                }
                catch (Exception ex)
                {
                    throw new Exception(ex.Message, ex);
                }
            }
            return LMS.VerifySignature(key, sigList[Nspk], message);
        }


        class PlaceholderLMSPrivateKey
            : LMSPrivateKeyParameters
        {

            public PlaceholderLMSPrivateKey(LMSigParameters lmsParameter, LMOtsParameters otsParameters, int q, byte[] I, int maxQ, byte[] masterSecret)
                : base(lmsParameter, otsParameters, q, I, maxQ, masterSecret)
            {}

            LMOtsPrivateKey GetNextOtsPrivateKey()
            {
                throw new Exception("placeholder only");
            }

            public LMSPublicKeyParameters GetPublicKey()
            {
                throw new Exception("placeholder only");
            }
        }
    }
}