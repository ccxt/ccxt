using System;
using System.IO;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Pqc.Crypto.Lms
{
    public class LMOtsSignature
        : IEncodable
    {
        private LMOtsParameters ParamType;
        private byte[] C;
        private byte[] y;

        public LMOtsSignature(LMOtsParameters ParamType, byte[] c, byte[] y)
        {
            this.ParamType = ParamType;
            C = c;
            this.y = y;
        }

        public static LMOtsSignature GetInstance(Object src)
        {
            if (src is LMOtsSignature)
            {
                return (LMOtsSignature)src;
            }
            //TODO replace inputstreams with something
            
            else if (src is BinaryReader)
            {
                byte[] data = ((BinaryReader) src).ReadBytes(4);
                Array.Reverse(data);
                int index = BitConverter.ToInt32(data, 0);
                LMOtsParameters type = LMOtsParameters.GetParametersForType(index);
                byte[] C = new byte[type.GetN()];
            
                ((BinaryReader)src).Read(C, 0, C.Length);
            
                byte[] sig = new byte[type.GetP()*type.GetN()];
                ((BinaryReader)src).Read(sig, 0, sig.Length);
            
            
                return new LMOtsSignature(type, C, sig);
            }
            else if (src is byte[])
            {
                BinaryReader input = null;
                try // 1.5 / 1.4 compatibility
                {
                    input = new BinaryReader(new MemoryStream((byte[])src, false));
                    return GetInstance(input);
                }
                finally
                {
                    if (input != null) input.Close();
                }
            }
            else if (src is MemoryStream)
            {
                return GetInstance(Streams.ReadAll((Stream)src));
            }
            throw new Exception ($"cannot parse {src}");
        }
        public LMOtsParameters GetParamType()
        {
            return ParamType;
        }

        public byte[] GetC()
        {
            return C;
        }

        public byte[] GetY()
        {
            return y;
        }

        public override bool Equals(object o)
        {
            if (this == o)
            {
                return true;
            }
            if (o == null || GetType() != o.GetType())
            {
                return false;
            }

            LMOtsSignature that = (LMOtsSignature)o;

            if (ParamType != null ? !ParamType.Equals(that.ParamType) : that.ParamType != null)
            {
                return false;
            }
            if (!Arrays.AreEqual(C, that.C))
            {
                return false;
            }
            return Arrays.AreEqual(y, that.y);
        }

        public override int GetHashCode()
        {
            int result = ParamType != null ? ParamType.GetHashCode() : 0;
            result = 31 * result + Arrays.GetHashCode(C);
            result = 31 * result + Arrays.GetHashCode(y);
            return result;
        }

        public byte[] GetEncoded()
        {
            return Composer.Compose()
                .U32Str(ParamType.GetType())
                .Bytes(C)
                .Bytes(y)
                .Build();
        }
    }
}