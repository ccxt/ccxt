using System;
using System.IO;

using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Pqc.Crypto.Lms
{
    public class LMSSignature
        : IEncodable
    {
        private int q;
        private LMOtsSignature otsSignature;
        private LMSigParameters parameter;
        private byte[][] y;

        public LMSSignature(int q, LMOtsSignature otsSignature, LMSigParameters parameter, byte[][] y)
        {
            this.q = q;
            this.otsSignature = otsSignature;
            this.parameter = parameter;
            this.y = y;
        }

        public static LMSSignature GetInstance(Object src)
        {
            if (src is LMSSignature)
            {
                return (LMSSignature)src;
            }
            else if (src is BinaryReader)
            {
                byte[] data = ((BinaryReader)src).ReadBytes(4);
                Array.Reverse(data);
                int q = BitConverter.ToInt32(data, 0);
                
                LMOtsSignature otsSignature = LMOtsSignature.GetInstance(src);

                data = ((BinaryReader) src).ReadBytes(4);
                Array.Reverse(data);
                int index = BitConverter.ToInt32(data, 0);
                LMSigParameters type = LMSigParameters.GetParametersForType(index);
            
                byte[][] path = new byte[type.GetH()][];
                for (int h = 0; h < path.Length; h++)
                {
                    path[h] = new byte[type.GetM()];
                    ((BinaryReader)src).Read(path[h], 0, path[h].Length);
                }
            
                return new LMSSignature(q, otsSignature, type, path);
            }
            else if (src is byte[])
            {
                BinaryReader input = null;
                try // 1.5 / 1.6 compatibility
                {
                    input = new BinaryReader(new MemoryStream( (byte[]) src, false));
                    return GetInstance(input);
                }
                finally
                {
                    if (input != null) input.Close();// todo platform dispose
                }
            }
            else if (src is MemoryStream)
            {
                return GetInstance(Streams.ReadAll((Stream)src));
            }
            throw new Exception ($"cannot parse {src}");
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

            LMSSignature that = (LMSSignature)o;

            if (q != that.q)
            {
                return false;
            }
            if (otsSignature != null ? !otsSignature.Equals(that.otsSignature) : that.otsSignature != null)
            {
                return false;
            }
            if (parameter != null ? !parameter.Equals(that.parameter) : that.parameter != null)
            {
                return false;
            }

            return Compare2DArrays(y, that.y);
        }

        private bool Compare2DArrays(byte[][] a, byte[][] b)
        {
            for (int i = 0; i < a.Length; i++)
            {
                for (int j = 0; j < a[0].Length; j++)
                {
                    if (!a[i][j].Equals(b[i][j]))
                        return false;
                }
            }
            return true;
        }

        public override int GetHashCode()
        {
            int result = q;
            result = (31 * result + (otsSignature != null ? otsSignature.GetHashCode() : 0));
            result = (31 * result + (parameter != null ? parameter.GetHashCode() : 0));
            // result = 31 * result + Arrays.GetHashCode(y); //Todo arrays support for 2d arrays?
            return result;
        }

        public byte[] GetEncoded()
        {
            return Composer.Compose()
                .U32Str(q)
                .Bytes(otsSignature.GetEncoded())
                .U32Str(parameter.GetType())
                .Bytes(y)
                .Build();
        }

        public int GetQ()
        {
            return q;
        }

        public LMOtsSignature GetOtsSignature()
        {
            return otsSignature;
        }

        public LMSigParameters GetParameter()
        {
            return parameter;
        }

        public byte[][] GetY()
        {
            return y;
        }
    }
}