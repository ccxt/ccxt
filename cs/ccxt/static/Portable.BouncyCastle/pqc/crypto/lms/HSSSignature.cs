
using System;
using System.IO;
using Org.BouncyCastle.Pqc.Crypto.Lms;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Pqc.Crypto.Lms
{

    public class HSSSignature
        : IEncodable
    {
        private int lMinus1;
        private LMSSignedPubKey[] signedPubKey;
        private LMSSignature signature;

        public HSSSignature(int lMinus1, LMSSignedPubKey[] signedPubKey, LMSSignature signature)
        {
            this.lMinus1 = lMinus1;
            this.signedPubKey = signedPubKey;
            this.signature = signature;
        }


        /**
     * @param src byte[], InputStream or HSSSignature
     * @param L   The HSS depth, available from public key.
     * @return An HSSSignature instance.
     * @throws IOException
     */
        public static HSSSignature GetInstance(Object src, int L)
        {
            if (src is HSSSignature)
            {
                return (HSSSignature) src;
            }
            else if (src is BinaryReader)
            {
                byte[] data = ((BinaryReader) src).ReadBytes(4);
                Array.Reverse(data);
                int lminus = BitConverter.ToInt32(data, 0);
                if (lminus != L - 1)
                {
                    throw new Exception("nspk exceeded maxNspk");
                }

                LMSSignedPubKey[] signedPubKeys = new LMSSignedPubKey[lminus];
                if (lminus != 0)
                {
                    for (int t = 0; t < signedPubKeys.Length; t++)
                    {
                        signedPubKeys[t] = new LMSSignedPubKey(LMSSignature.GetInstance(src),
                            LMSPublicKeyParameters.GetInstance(src));
                    }
                }

                LMSSignature sig = LMSSignature.GetInstance(src);

                return new HSSSignature(lminus, signedPubKeys, sig);
            }
            else if (src is byte[])
            {
                BinaryReader input = null;
                try // 1.5 / 1.6 compatibility
                {
                    input = new BinaryReader(new MemoryStream((byte[]) src));
                    return GetInstance(input, L);
                }
                finally
                {
                    if (input != null) input.Close();
                }
            }
            else if (src is MemoryStream)
            {
                return GetInstance(Streams.ReadAll((Stream) src), L);
            }

            throw new ArgumentException($"cannot parse {src}");
        }


        public int GetlMinus1()
        {
            return lMinus1;
        }

        public LMSSignedPubKey[] GetSignedPubKey()
        {
            return signedPubKey;
        }

        public LMSSignature GetSignature()
        {
            return signature;
        }

        public override bool Equals(Object o)
        {
            if (this == o)
            {
                return true;
            }

            if (o == null || GetType() != o.GetType())
            {
                return false;
            }

            HSSSignature signature1 = (HSSSignature) o;

            if (lMinus1 != signature1.lMinus1)
            {
                return false;
            }
            // Probably incorrect - comparing Object[] arrays with Arrays.equals

            if (signedPubKey.Length != signature1.signedPubKey.Length)
            {
                return false;
            }

            for (int t = 0; t < signedPubKey.Length; t++)
            {
                if (!signedPubKey[t].Equals(signature1.signedPubKey[t]))
                {
                    return false;
                }
            }

            return signature != null ? signature.Equals(signature1.signature) : signature1.signature == null;
        }

        public override int GetHashCode()
        {
            int result = lMinus1;
            result = 31 * result + signedPubKey.GetHashCode();
            result = 31 * result + (signature != null ? signature.GetHashCode() : 0);
            return result;
        }

        public byte[] GetEncoded()
        {
            Composer composer = Composer.Compose();
            composer.U32Str(lMinus1);
            if (signedPubKey != null)
            {
                foreach (LMSSignedPubKey sigPub in signedPubKey)
                {
                    composer.Bytes(sigPub);
                }
            }

            composer.Bytes(signature);
            return composer.Build();

        }

    }
}
