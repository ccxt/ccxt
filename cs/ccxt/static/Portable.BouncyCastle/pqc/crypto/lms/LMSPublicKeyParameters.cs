using System;
using System.IO;
using Org.BouncyCastle.Pqc.Crypto.Lms;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.IO;

using static Org.BouncyCastle.Pqc.Crypto.Lms.LMS;

namespace Org.BouncyCastle.Pqc.Crypto.Lms
{
    public class LMSPublicKeyParameters
        : LMSKeyParameters, ILMSContextBasedVerifier
    {
        private LMSigParameters parameterSet;
        private LMOtsParameters lmOtsType;
        private byte[] I;
        private byte[] T1;

        public LMSPublicKeyParameters(LMSigParameters parameterSet, LMOtsParameters lmOtsType, byte[] T1, byte[] I)
            : base(false)
        {
            this.parameterSet = parameterSet;
            this.lmOtsType = lmOtsType;
            this.I = Arrays.Clone(I);
            this.T1 = Arrays.Clone(T1);
        }

        public static LMSPublicKeyParameters GetInstance(Object src)
        {
            if (src is LMSPublicKeyParameters)
            {
                return (LMSPublicKeyParameters)src;
            }
            // todo
             else if (src is BinaryReader)
             {
                 byte[] data = ((BinaryReader) src).ReadBytes(4);
                 Array.Reverse(data);
                 int pubType = BitConverter.ToInt32(data, 0);
                 LMSigParameters lmsParameter = LMSigParameters.GetParametersForType(pubType);
                 
                 data = ((BinaryReader) src).ReadBytes(4);
                 Array.Reverse(data);
                 int index = BitConverter.ToInt32(data, 0);
                 LMOtsParameters ostTypeCode = LMOtsParameters.GetParametersForType(index);
            
                 byte[] I = new byte[16];
                 ((BinaryReader)src).Read(I, 0, I.Length);//change to readbytes?
            
                 byte[] T1 = new byte[lmsParameter.GetM()];
                 ((BinaryReader)src).Read(T1, 0, T1.Length);
                 return new LMSPublicKeyParameters(lmsParameter, ostTypeCode, T1, I);
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
                     if (input != null)
                     {
                         input.Close();
                     }
                 }
             }
            else if (src is MemoryStream)
            {
                return GetInstance(Streams.ReadAll((Stream)src));
            }
            throw new Exception ($"cannot parse {src}");
        }

        public override byte[] GetEncoded()
        {
            return this.ToByteArray();
        }

        public LMSigParameters GetSigParameters()
        {
            return parameterSet;
        }

        public LMOtsParameters GetOtsParameters()
        {
            return lmOtsType;
        }

        public LMSParameters GetLmsParameters()
        {
            return new LMSParameters(this.GetSigParameters(), this.GetOtsParameters());
        }

        public byte[] GetT1()
        {
            return Arrays.Clone(T1);
        }

        internal bool MatchesT1(byte[] sig)
        {
            return Arrays.ConstantTimeAreEqual(T1, sig);
        }

        public byte[] GetI()
        {
            return Arrays.Clone(I);
        }

        byte[] RefI()
        {
            return I;
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

            LMSPublicKeyParameters publicKey = (LMSPublicKeyParameters)o;

            if (!parameterSet.Equals(publicKey.parameterSet))
            {
                return false;
            }
            if (!lmOtsType.Equals(publicKey.lmOtsType))
            {
                return false;
            }
            if (!Arrays.AreEqual(I, publicKey.I))
            {
                return false;
            }
            return Arrays.AreEqual(T1, publicKey.T1);
        }

        public override int GetHashCode()
        {
            int result = parameterSet.GetHashCode();
            result = 31 * result + lmOtsType.GetHashCode();
            result = 31 * result + Arrays.GetHashCode(I);
            result = 31 * result + Arrays.GetHashCode(T1);
            return result;
        }

        internal byte[] ToByteArray()
        {
            return Composer.Compose()
                .U32Str(parameterSet.GetType())
                .U32Str(lmOtsType.GetType())
                .Bytes(I)
                .Bytes(T1)
                .Build();
        }

        public LMSContext GenerateLmsContext(byte[] signature)
        {
            try
            {
                return GenerateOtsContext(LMSSignature.GetInstance(signature));
            }
            catch (IOException e)
            {
                throw new IOException($"cannot parse signature: {e.Message}");
            }
        }

        internal LMSContext GenerateOtsContext(LMSSignature S)
        {
            int ots_typecode = GetOtsParameters().GetType();
            if (S.GetOtsSignature().GetParamType().GetType() != ots_typecode)
            {
                throw new ArgumentException("ots type from lsm signature does not match ots" +
                    " signature type from embedded ots signature");
            }

            return new LMOtsPublicKey(LMOtsParameters.GetParametersForType(ots_typecode), I,  S.GetQ(), null).CreateOtsContext(S);
        }

        public bool Verify(LMSContext context)
        {
            return VerifySignature(this, context);
        }
    }
}