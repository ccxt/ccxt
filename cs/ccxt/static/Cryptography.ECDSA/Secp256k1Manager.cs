using System;
using System.Diagnostics;
using System.Security.Cryptography;
using Cryptography.ECDSA.Internal.Secp256K1;

namespace Cryptography.ECDSA
{
    public class Secp256K1Manager
    {
        private static readonly Context Ctx;

        public static event EventHandler<Callback> IllegalCallback;
        public static event EventHandler<Callback> ErrorCallback;

        static Secp256K1Manager()
        {
            IllegalCallback += OnIllegalCallback;
            ErrorCallback += OnErrorCallback;
            Ctx = new Context();
            Ctx = Secp256K1ContextCreate(Options.ContextSign | Options.ContextVerify);
        }

        private static void OnErrorCallback(object sender, Callback secp256K1Callback)
        {
        }

        private static void OnIllegalCallback(object sender, Callback secp256K1Callback)
        {
        }


        private static Context Secp256K1ContextCreate(Options flags)
        {
            var ret = new Context
            {
                IllegalCallback = IllegalCallback,
                ErrorCallback = ErrorCallback
            };

            if ((flags & Options.FlagsTypeMask) != Options.FlagsTypeContext)
            {
                ret.IllegalCallback?.Invoke(null, new Callback("Invalid flags"));
                return null;
            }

            EcMult.secp256k1_ecmult_context_init(ret.EcMultCtx);
            EcMultGen.ContextInit(ret.EcMultGenCtx);

            if (flags.HasFlag(Options.FlagsBitContextSign))
            {
                EcMultGen.ContextBuild(ret.EcMultGenCtx, ret.ErrorCallback);
            }
            if (flags.HasFlag(Options.FlagsBitContextVerify))
            {
                EcMult.secp256k1_ecmult_context_build(ret.EcMultCtx, ret.ErrorCallback);
            }

            return ret;
        }


        private static int SignCompact(Context ctx, byte[] msg32, byte[] seckey, byte[] output64, out byte recid)
        {
            EcdsaRecoverableSignature sig = new EcdsaRecoverableSignature();
            byte loop = 0;
            int index = 0;
            bool rec = false;
            var extra = new byte[32];
            do
            {
                extra[index] = loop;
                loop++;
                if (extra[index] == 0xff)
                    index = index + 1;

                rec = Secp256K1EcdsaSignRecoverable(ctx, sig, msg32, seckey, null, extra);

            } while (!rec);

            Secp256K1EcdsaRecoverableSignatureSerializeCompact(ctx, output64, out recid, sig);
            return loop;
        }

        private static bool Secp256K1EcdsaSignRecoverable(Context ctx, EcdsaRecoverableSignature signature, byte[] msg32, byte[] seckey, NonceFunction noncefp, byte[] noncedata)
        {
            if (ctx == null || msg32 == null || signature == null || seckey == null)
                throw new NullReferenceException();

            if (!EcMultGen.ContextIsBuilt(ctx.EcMultGenCtx))
                throw new ArithmeticException();

            if (noncefp == null)
            {
                noncefp = Secp256K1T.NonceFunctionDefault;
            }

            Scalar r, s;
            Scalar sec, non, msg;
            byte recid = 1;
            bool ret = false;
            var overflow = false;

            sec = new Scalar();
            Scalar.SetB32(sec, seckey, ref overflow);
            r = new Scalar();
            s = new Scalar();
            /* Fail if the secret key is invalid. */
            if (!overflow && !Scalar.IsZero(sec))
            {
                var nonce32 = new byte[32];
                uint count = 0;
                msg = new Scalar();
                Scalar.SetB32(msg, msg32);
                non = new Scalar();

                while (true)
                {
                    ret = noncefp(nonce32, msg32, seckey, null, noncedata, count);
                    if (!ret)
                        break;

                    Scalar.SetB32(non, nonce32, ref overflow);
                    if (!Scalar.IsZero(non) && !overflow)
                    {
                        if (Secp256K1EcdsaSigSign(ctx.EcMultGenCtx, r, s, sec, msg, non, out recid))
                        {
                            break;
                        }
                    }
                    count++;
                }
                Util.MemSet(nonce32, 0, 32); //memset(nonce32, 0, 32);
                Scalar.Clear(msg);
                Scalar.Clear(non);
                Scalar.Clear(sec);
            }
            if (ret)
            {
                Secp256K1EcdsaRecoverableSignatureSave(signature, r, s, recid);
            }
            else
            {
                Util.MemSet(signature.Data, 0, EcdsaRecoverableSignature.Size); //memset(signature, 0, sizeof(* signature));
            }
            return ret;
        }

        private static void Secp256K1EcdsaRecoverableSignatureSave(EcdsaRecoverableSignature sig, Scalar r, Scalar s, byte recid)
        {
            Buffer.BlockCopy(r.D, 0, sig.Data, 0, 32);
            Buffer.BlockCopy(s.D, 0, sig.Data, 32, 32);
            sig.Data[64] = recid;
        }

        private static bool Secp256K1EcdsaSigSign(EcmultGenContext ctx, Scalar sigr, Scalar sigs, Scalar seckey, Scalar message, Scalar nonce, out byte recid)
        {
            var b = new byte[32];
            GeJ rp;
            Ge r = new Ge();
            Scalar n = new Scalar();
            bool overflow = false;

            EcMultGen.secp256k1_ecmult_gen(ctx, out rp, nonce);
            Group.SetGeJ(r, rp);
            Field.Normalize(r.X);
            Field.Normalize(r.Y);
            Field.GetB32(b, r.X);
            Scalar.SetB32(sigr, b, ref overflow);
            /* These two conditions should be checked before calling */
            Debug.Assert(!Scalar.IsZero(sigr));
            Debug.Assert(!overflow);


            // The overflow condition is cryptographically unreachable as hitting it requires finding the discrete log
            // of some P where P.x >= order, and only 1 in about 2^127 points meet this criteria.
            recid = (byte)((overflow ? 2 : 0) | (Field.IsOdd(r.Y) ? 1 : 0));

            Scalar.Mul(n, sigr, seckey);
            Scalar.Add(n, n, message);
            Scalar.Inverse(sigs, nonce);
            Scalar.Mul(sigs, sigs, n);
            Scalar.Clear(n);
            Group.secp256k1_gej_clear(rp);
            Group.secp256k1_ge_clear(r);
            if (Scalar.IsZero(sigs))
            {
                return false;
            }
            if (Scalar.IsHigh(sigs))
            {
                Scalar.Negate(sigs, sigs);
                recid ^= 1;
            }
            return true;
        }

        private static bool Secp256K1EcdsaRecoverableSignatureSerializeCompact(Context ctx, byte[] output64, out byte recid, EcdsaRecoverableSignature sig)
        {
            return Secp256K1EcdsaRecoverableSignatureSerializeCompact(ctx, output64, 0, out recid, sig);
        }

        private static bool Secp256K1EcdsaRecoverableSignatureSerializeCompact(Context ctx, byte[] outputxx, int skip, out byte recid, EcdsaRecoverableSignature sig)
        {
            Scalar r = new Scalar();
            Scalar s = new Scalar();
            recid = 0;

            if (outputxx == null)
            {
                ctx.IllegalCallback?.Invoke(null, new Callback("(outputxx != null)"));
                return false;
            }
            //___________________________________________________________________________________________________________________________________
            if (sig == null)
            {
                ctx.IllegalCallback?.Invoke(null, new Callback("(sig != null)"));
                return false;
            }
            //___________________________________________________________________________________________________________________________________

            Secp256K1EcdsaRecoverableSignatureLoad(r, s, out recid, sig);
            Scalar.GetB32(outputxx, skip + 0, r);
            Scalar.GetB32(outputxx, skip + 32, s);
            return true;
        }

        private static void Secp256K1EcdsaRecoverableSignatureLoad(Scalar r, Scalar s, out byte recid, EcdsaRecoverableSignature sig)
        {
            Buffer.BlockCopy(sig.Data, 0, r.D, 0, 32);
            Buffer.BlockCopy(sig.Data, 32, s.D, 0, 32);
            recid = sig.Data[64];
        }

        private static byte[] SignCompact(byte[] data, byte[] seckey, out byte recoveryId)
        {
            EcdsaRecoverableSignature sig = new EcdsaRecoverableSignature();
            byte loop = 0;
            int index = 0;
            bool rec;
            var extra = new byte[32];
            do
            {
                extra[index] = loop++;
                if (loop == 0xff) { index = index + 1; loop = 0; }
                rec = Secp256K1EcdsaSignRecoverable(Ctx, sig, data, seckey, null, extra);

            } while (!rec);
            var output64 = new byte[64];
            Secp256K1EcdsaRecoverableSignatureSerializeCompact(Ctx, output64, out recoveryId, sig);
            return output64;
        }

        /// <summary>Signs a data and returns the signature in compact form.  Returns null on failure.</summary>
        /// <param name="data">The data to sign.  This data is not hashed.  For use with bitcoins, you probably want to double-SHA256 hash this before calling this method.</param>
        /// <param name="seckey">The private key to use to sign the data.</param>
        /// <param name="recoveryId">This will contain the recovery ID needed to retrieve the key from the compact signature using the RecoverKeyFromCompact method.</param> 
        public static byte[] SignCompact(byte[] data, byte[] seckey, out int recoveryId)
        {
            if (data == null)
                throw new ArgumentNullException(nameof(data));
            if (data.Length == 0)
                throw new ArgumentOutOfRangeException(nameof(data));
            if (seckey == null)
                throw new ArgumentNullException(nameof(seckey));
            if (seckey.Length != 32)
                throw new ArgumentOutOfRangeException(nameof(seckey));

            recoveryId = 0;

            EcdsaRecoverableSignature sig = new EcdsaRecoverableSignature();
            {
                if (!Secp256K1EcdsaSignRecoverable(Ctx, sig, data, seckey, null, null))
                    return null;
            }
            var sigbytes = new byte[64];
            byte recid;
            {
                if (!Secp256K1EcdsaRecoverableSignatureSerializeCompact(Ctx, sigbytes, out recid, sig))
                    return null;
            }
            recoveryId = recid;
            return sigbytes;
        }

        /// <summary>
        /// Get compressed and compact signature (possible in not canonical form)
        /// </summary>
        /// <param name="data">Hashed data</param>
        /// <param name="seckey">Private key (32 bytes)</param>
        /// <returns> 65 bytes compressed / compact</returns>
        public static byte[] SignCompressedCompact(byte[] data, byte[] seckey)
        {
            if (data == null)
                throw new ArgumentNullException(nameof(data));
            if (data.Length == 0)
                throw new ArgumentOutOfRangeException(nameof(data));
            if (seckey == null)
                throw new ArgumentNullException(nameof(seckey));
            if (seckey.Length != 32)
                throw new ArgumentOutOfRangeException(nameof(seckey));

            byte recoveryId = 0;

            EcdsaRecoverableSignature sig = new EcdsaRecoverableSignature();
            byte loop = 0;
            int index = 0;
            bool rec;
            byte[] extra = null;
            var r = RandomNumberGenerator.Create();

            do
            {
                if (loop == 0xff) { index = index + 1; loop = 0; }
                if (loop > 0)
                {
                    extra = new byte[32];
                    r.GetBytes(extra);
                }
                loop++;
                rec = Secp256K1EcdsaSignRecoverable(Ctx, sig, data, seckey, null, extra);
            } while (!(rec && IsCanonical(sig.Data)));

            var output65 = new byte[65];
            Secp256K1EcdsaRecoverableSignatureSerializeCompact(Ctx, output65, 1, out recoveryId, sig);

            //4 - compressed | 27 - compact
            output65[0] = (byte)(recoveryId + 4 + 27);
            return output65;
        }

        // test after Secp256K1EcdsaRecoverableSignatureSerializeCompact
        public static bool IsCanonical(byte[] sig, int skip)
        {
            return !((sig[skip + 0] & 0x80) > 0)
                   && !(sig[skip + 0] == 0 && !((sig[skip + 1] & 0x80) > 0))
                   && !((sig[skip + 32] & 0x80) > 0)
                   && !(sig[skip + 32] == 0 && !((sig[skip + 33] & 0x80) > 0));
        }

        //test after Secp256K1EcdsaSignRecoverable
        private static bool IsCanonical(byte[] sig)
        {
            return !((sig[31] & 0x80) > 0)
                   && !(sig[31] == 0 && !((sig[30] & 0x80) > 0))
                   && !((sig[63] & 0x80) > 0)
                   && !(sig[63] == 0 && !((sig[62] & 0x80) > 0));
        }

        public static byte[] GetPublicKey(byte[] privateKey, bool compressed)
        {
            if (privateKey == null)
                throw new ArgumentNullException(nameof(privateKey));
            if (privateKey.Length != 32)
                throw new ArgumentOutOfRangeException(nameof(privateKey));

            var key = new PubKey();
            if (!Secp256K1T.EcPubKeyCreate(Ctx, key, privateKey))
                return null;
            return SerializePublicKey(key, compressed);
        }


        private static byte[] SerializePublicKey(PubKey publicKey, bool compressed)
        {
            var count = compressed ? 33 : 65;
            var pubkey = new byte[count];
            {
                if (!Secp256K1T.EcPubkeySerialize(pubkey, ref count, publicKey, compressed ? Options.EcCompressed : Options.EcUncompressed))
                    return null;
            }
            if (count == pubkey.Length)
                return pubkey;

            var smallkey = new byte[count];
            Array.Copy(pubkey, 0, smallkey, 0, count);
            return smallkey;
        }

        public static byte[] GenerateRandomKey()
        {
            var rand = RandomNumberGenerator.Create();
            var key = new byte[32];
            rand.GetBytes(key);
            return key;
        }
    }
}