
using System;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Pqc.Crypto.Lms
{
    public class LMS
    {
        internal static ushort D_LEAF = 0x8282;
        internal static ushort D_INTR = 0x8383;

        public static LMSPrivateKeyParameters GenerateKeys(LMSigParameters parameterSet,
            LMOtsParameters lmOtsParameters, int q, byte[] I, byte[] rootSeed)
        {
            //
            // RFC 8554 recommends that digest used in LMS and LMOTS be of the same strength to protect against
            // attackers going after the weaker of the two digests. This is not enforced here!
            //

            // Algorithm 5, Compute LMS private key.

            // Step 1
            // -- Parameters passed in as arguments.


            // Step 2
            if (rootSeed == null || rootSeed.Length < parameterSet.GetM())
            {
                throw new ArgumentException($"root seed is less than {parameterSet.GetM()}");
            }

            int twoToH = 1 << parameterSet.GetH();

            return new LMSPrivateKeyParameters(parameterSet, lmOtsParameters, q, I, twoToH, rootSeed);
        }

        public static LMSSignature GenerateSign(LMSPrivateKeyParameters privateKey, byte[] message)
        {
            //
            // Get T from the public key.
            // This may cause the public key to be generated.
            //
            // byte[][] T = new byte[privateKey.getMaxQ()][];

            // Step 2
            LMSContext context = privateKey.GenerateLmsContext();

            context.BlockUpdate(message, 0, message.Length);

            return GenerateSign(context);
        }

        public static LMSSignature GenerateSign(LMSContext context)
        {
            //
            // Get T from the public key.
            // This may cause the public key to be generated.
            //
            // byte[][] T = new byte[privateKey.getMaxQ()][];

            // Step 1.
            LMOtsSignature ots_signature =
                LM_OTS.lm_ots_generate_signature(context.GetPrivateKey(), context.GetQ(), context.C);

            return new LMSSignature(context.GetPrivateKey().GetQ(), ots_signature, context.GetSigParams(),
                context.GetPath());
        }

        public static bool VerifySignature(LMSPublicKeyParameters publicKey, LMSSignature S, byte[] message)
        {
            LMSContext context = publicKey.GenerateOtsContext(S);

            LmsUtils.ByteArray(message, context);

            return VerifySignature(publicKey, context);
        }

        public static bool VerifySignature(LMSPublicKeyParameters publicKey, byte[] S, byte[] message)
        {
            LMSContext context = publicKey.GenerateLmsContext(S);

            LmsUtils.ByteArray(message, context);

            return VerifySignature(publicKey, context);
        }

        public static bool VerifySignature(LMSPublicKeyParameters publicKey, LMSContext context)
        {
            LMSSignature S = (LMSSignature) context.GetSignature();
            LMSigParameters lmsParameter = S.GetParameter();
            int h = lmsParameter.GetH();
            byte[][] path = S.GetY();
            byte[] Kc = LM_OTS.lm_ots_validate_signature_calculate(context);
            // Step 4
            // node_num = 2^h + q
            int node_num = (1 << h) + S.GetQ();

            // tmp = H(I || u32str(node_num) || u16str(D_LEAF) || Kc)
            byte[] I = publicKey.GetI();
            IDigest H = DigestUtilities.GetDigest(lmsParameter.GetDigestOid());
            byte[] tmp = new byte[H.GetDigestSize()];

            H.BlockUpdate(I, 0, I.Length);
            LmsUtils.U32Str(node_num, H);
            LmsUtils.U16Str(D_LEAF, H);
            H.BlockUpdate(Kc, 0, Kc.Length);
            H.DoFinal(tmp, 0);

            int i = 0;

            while (node_num > 1)
            {
                if ((node_num & 1) == 1)
                {
                    // is odd
                    H.BlockUpdate(I, 0, I.Length);
                    LmsUtils.U32Str(node_num / 2, H);
                    LmsUtils.U16Str(D_INTR, H);
                    H.BlockUpdate(path[i], 0, path[i].Length);
                    H.BlockUpdate(tmp, 0, tmp.Length);
                    H.DoFinal(tmp, 0);
                }
                else
                {
                    H.BlockUpdate(I, 0, I.Length);
                    LmsUtils.U32Str(node_num / 2, H);
                    LmsUtils.U16Str(D_INTR, H);
                    H.BlockUpdate(tmp, 0, tmp.Length);
                    H.BlockUpdate(path[i], 0, path[i].Length);
                    H.DoFinal(tmp, 0);
                }

                node_num = node_num / 2;
                i++;
            }

            byte[] Tc = tmp;
            return publicKey.MatchesT1(Tc);
        }
    }
}