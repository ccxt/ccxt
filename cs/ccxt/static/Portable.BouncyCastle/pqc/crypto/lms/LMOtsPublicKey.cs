using System;
using System.IO;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.IO;

using static Org.BouncyCastle.Pqc.Crypto.Lms.LM_OTS;

namespace Org.BouncyCastle.Pqc.Crypto.Lms
{
    public class LMOtsPublicKey
    {
        private LMOtsParameters parameter;
        private byte[] I;
        private int q;
        private byte[] K;


        public LMOtsPublicKey(LMOtsParameters parameter, byte[] i, int q, byte[] k)
        {
            this.parameter = parameter;
            this.I = i;
            this.q = q;
            this.K = k;
        }

        public static LMOtsPublicKey GetInstance(Object src)
        {
            
            //todo
            if (src is LMOtsPublicKey)
            {
                return (LMOtsPublicKey)src;
            }
            else if (src is BinaryReader)
            {
                byte[] data = ((BinaryReader) src).ReadBytes(4);
                Array.Reverse(data);
                int index = BitConverter.ToInt32(data, 0);
                
                LMOtsParameters parameter = LMOtsParameters.GetParametersForType(index);
                byte[] I = new byte[16];
                ((BinaryReader)src).Read(I, 0, I.Length);
                
                Array.Reverse(data);
                int q = BitConverter.ToInt32(data, 0);

                byte[] K = new byte[parameter.GetN()];
                ((BinaryReader)src).Read(K, 0, K.Length);

                return new LMOtsPublicKey(parameter, I, q, K);

            }
            else if (src is byte[])
            {
                BinaryReader input = null;
                try // 1.5 / 1.6 compatibility
                {
                    input = new BinaryReader(new MemoryStream((byte[])src, false));
                    return GetInstance(input);
                }
                finally
                {
                    if (input != null) input.Close();//todo Platform Dispose
                }
            }
            else if (src is MemoryStream)
            {
                return GetInstance(Streams.ReadAll((Stream)src));
            }
            throw new Exception ($"cannot parse {src}");
        }

        public LMOtsParameters GetParameter()
        {
            return parameter;
        }

        public byte[] GetI()
        {
            return I;
        }

        public int GetQ()
        {
            return q;
        }

        public byte[] GetK()
        {
            return K;
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

            LMOtsPublicKey that = (LMOtsPublicKey)o;

            if (q != that.q)
            {
                return false;
            }
            if (!parameter?.Equals(that.parameter) ?? that.parameter != null)
            {
                return false;
            }
            if (!Arrays.Equals(I, that.I))
            {
                return false;
            }
            return Arrays.Equals(K, that.K);
        }

        public override int GetHashCode()
        {
            int result = parameter != null ? parameter.GetHashCode() : 0;
            result = 31 * result + Arrays.GetHashCode(I);
            result = 31 * result + q;
            result = 31 * result + Arrays.GetHashCode(K);
            return result;
        }

        public byte[] GetEncoded()
        {
            return Composer.Compose()
                .U32Str(parameter.GetType())
                .Bytes(I)
                .U32Str(q)
                .Bytes(K)
                .Build();
        }

        internal LMSContext CreateOtsContext(LMOtsSignature signature)
        {
            IDigest ctx = DigestUtilities.GetDigest(parameter.GetDigestOid());

            LmsUtils.ByteArray(I, ctx);
            LmsUtils.U32Str(q, ctx);
            LmsUtils.U16Str(D_MESG, ctx);
            LmsUtils.ByteArray(signature.GetC(), ctx);

            return new LMSContext(this, signature, ctx);
        }

        internal LMSContext CreateOtsContext(LMSSignature signature)
        {
            IDigest ctx = DigestUtilities.GetDigest(parameter.GetDigestOid());

            LmsUtils.ByteArray(I, ctx);
            LmsUtils.U32Str(q, ctx);
            LmsUtils.U16Str(D_MESG, ctx);
            LmsUtils.ByteArray(signature.GetOtsSignature().GetC(), ctx);

            return new LMSContext(this, signature, ctx);
        }
    }
}