using System;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.Lms
{
    public class LM_OTS
    {
        private static ushort D_PBLC = 0x8080;
        private static int ITER_K = 20;
        private static int ITER_PREV = 23;
        private static int ITER_J = 22;
        
        internal static int SEED_RANDOMISER_INDEX = ~2;
        internal static int SEED_LEN = 32;
        internal static int MAX_HASH = 32;
        internal static ushort D_MESG = 0x8181;


        public static int Coef(byte[] S, int i, int w)
        {
            int index = (i * w) / 8;
            int digits_per_byte = 8 / w;
            int shift = w * (~i & (digits_per_byte - 1));
            int mask = (1 << w) - 1;

            return (S[index] >> shift) & mask;
        }


        public static int Cksm(byte[] S, int sLen, LMOtsParameters parameters)
        {
            int sum = 0;

            int w = parameters.GetW();

            // NB assumption about size of "w" not overflowing integer.
            int twoWpow = (1 << w) - 1;

            for (int i = 0; i < (sLen * 8 / parameters.GetW()); i++)
            {
                sum = sum + twoWpow - Coef(S, i, parameters.GetW());
            }
            return sum << parameters.GetLs();
        }


        public static LMOtsPublicKey lms_ots_generatePublicKey(LMOtsPrivateKey privateKey)
        {
            byte[] K = lms_ots_generatePublicKey(privateKey.GetParameter(), privateKey.GetI(), privateKey.GetQ(), privateKey.GetMasterSecret());
            return new LMOtsPublicKey(privateKey.GetParameter(), privateKey.GetI(), privateKey.GetQ(), K);
        }

        internal static byte[] lms_ots_generatePublicKey(LMOtsParameters parameter, byte[] I, int q, byte[] masterSecret)
        {


            //
            // Start hash that computes the final value.
            //
            IDigest publicContext = DigestUtilities.GetDigest(parameter.GetDigestOid());
            byte[] prehashPrefix = Composer.Compose()
                .Bytes(I)
                .U32Str(q)
                .U16Str(D_PBLC)
                .PadUntil(0, 22)
                .Build();
            publicContext.BlockUpdate(prehashPrefix, 0, prehashPrefix.Length);

            IDigest ctx = DigestUtilities.GetDigest(parameter.GetDigestOid());

            byte[] buf = Composer.Compose()
                .Bytes(I)
                .U32Str(q)
                .PadUntil(0, 23 + ctx.GetDigestSize())
                .Build();


            SeedDerive derive = new SeedDerive(I, masterSecret, DigestUtilities.GetDigest(parameter.GetDigestOid()));
            derive.SetQ(q);
            derive.SetJ(0);

            int p = parameter.GetP();
            int n = parameter.GetN();
            int twoToWminus1 = (1 << parameter.GetW()) - 1;


            for (ushort i = 0; i < p; i++)
            {
                derive.deriveSeed(buf, i < p - 1, ITER_PREV); // Private Key!
                Pack.UInt16_To_BE(i, buf, ITER_K);
                for (int j = 0; j < twoToWminus1; j++)
                {
                    buf[ITER_J] = (byte)j;
                    ctx.BlockUpdate(buf, 0, buf.Length);
                    ctx.DoFinal(buf, ITER_PREV);
                }
                publicContext.BlockUpdate(buf, ITER_PREV, n);
            }

            byte[] K = new byte[publicContext.GetDigestSize()];
            publicContext.DoFinal(K, 0);

            return K;

        }

        public static LMOtsSignature lm_ots_generate_signature(LMSigParameters sigParams, LMOtsPrivateKey privateKey, byte[][] path, byte[] message, bool preHashed)
        {
            //
            // Add the randomizer.
            //

            byte[] C;
            byte[] Q = new byte[MAX_HASH + 2];

            if (!preHashed)
            {
                LMSContext qCtx = privateKey.GetSignatureContext(sigParams, path);

                LmsUtils.ByteArray(message, 0, message.Length, qCtx);

                C = qCtx.C;
                Q = qCtx.GetQ();
            }
            else
            {
                C = new byte[SEED_LEN];
                Array.Copy(message, 0, Q, 0, privateKey.GetParameter().GetN());
            }

            return lm_ots_generate_signature(privateKey, Q, C);
        }

        public static LMOtsSignature lm_ots_generate_signature(LMOtsPrivateKey privateKey, byte[] Q, byte[] C)
        {
            LMOtsParameters parameter = privateKey.GetParameter();

            int n = parameter.GetN();
            int p = parameter.GetP();
            int w = parameter.GetW();

            byte[] sigComposer = new byte[p * n];

            IDigest ctx = DigestUtilities.GetDigest(parameter.GetDigestOid());

            SeedDerive derive = privateKey.GetDerivationFunction();

            int cs = Cksm(Q, n, parameter);
            Q[n] = (byte)((cs >> 8) & 0xFF);
            Q[n + 1] = (byte)cs;

            byte[] tmp = Composer.Compose()
                .Bytes(privateKey.GetI())
                .U32Str(privateKey.GetQ())
                .PadUntil(0, ITER_PREV + n)
                .Build();

            derive.SetJ(0);
            for (ushort i = 0; i < p; i++)
            {
                Pack.UInt16_To_BE(i, tmp, ITER_K);
                derive.deriveSeed(tmp, i < p - 1, ITER_PREV);
                int a = Coef(Q, i, w);
                for (int j = 0; j < a; j++)
                {
                    tmp[ITER_J] = (byte)j;
                    ctx.BlockUpdate(tmp, 0, ITER_PREV + n);
                    ctx.DoFinal(tmp, ITER_PREV);
                }
                Array.Copy(tmp, ITER_PREV, sigComposer, n * i, n);
            }

            return new LMOtsSignature(parameter, C, sigComposer);
        }

        public static bool lm_ots_validate_signature(LMOtsPublicKey publicKey, LMOtsSignature signature, byte[] message, bool prehashed)
        {
            if (!signature.GetParamType().Equals(publicKey.GetParameter())) // todo check
            {
                throw new LMSException("public key and signature ots types do not match");
            }
            return Arrays.AreEqual(lm_ots_validate_signature_calculate(publicKey, signature, message), publicKey.GetK());
        }

        public static byte[] lm_ots_validate_signature_calculate(LMOtsPublicKey publicKey, LMOtsSignature signature, byte[] message)
        {
            LMSContext ctx = publicKey.CreateOtsContext(signature);

            LmsUtils.ByteArray(message, ctx);

            return lm_ots_validate_signature_calculate(ctx);
        }

        public static byte[] lm_ots_validate_signature_calculate(LMSContext context)
        {
            LMOtsPublicKey publicKey = context.GetPublicKey();
            LMOtsParameters parameter = publicKey.GetParameter();
            Object sig = context.GetSignature();
            LMOtsSignature signature;
            if (sig is LMSSignature)
            {
                signature = ((LMSSignature)sig).GetOtsSignature();
            }
            else
            {
                signature = (LMOtsSignature)sig;
            }

            int n = parameter.GetN();
            int w = parameter.GetW();
            int p = parameter.GetP();
            byte[] Q = context.GetQ();

            int cs = Cksm(Q, n, parameter);
            Q[n] = (byte)((cs >> 8) & 0xFF);
            Q[n + 1] = (byte)cs;

            byte[] I = publicKey.GetI();
            int    q = publicKey.GetQ();

            IDigest finalContext = DigestUtilities.GetDigest(parameter.GetDigestOid());
            LmsUtils.ByteArray(I, finalContext);
            LmsUtils.U32Str(q, finalContext);
            LmsUtils.U16Str(D_PBLC, finalContext);

            byte[] tmp = Composer.Compose()
                .Bytes(I)
                .U32Str(q)
                .PadUntil(0, ITER_PREV + n)
                .Build();

            int max_digit = (1 << w) - 1;

            byte[] y = signature.GetY();

            IDigest ctx = DigestUtilities.GetDigest(parameter.GetDigestOid());
            for (ushort i = 0; i < p; i++)
            {
                Pack.UInt16_To_BE(i, tmp, ITER_K);
                Array.Copy(y, i * n, tmp, ITER_PREV, n);
                int a = Coef(Q, i, w);

                for (int j = a; j < max_digit; j++)
                {
                    tmp[ITER_J] = (byte)j;
                    ctx.BlockUpdate(tmp, 0, ITER_PREV + n);
                    ctx.DoFinal(tmp, ITER_PREV);
                }

                finalContext.BlockUpdate(tmp, ITER_PREV, n);
            }

            byte[] K = new byte[n];
            finalContext.DoFinal(K, 0);

            return K;
        }
    }
}