using System;
using System.IO;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.Lms
{
    /**
    * Type to assist in build LMS messages.
    */
    public class Composer
    {
        //Todo make sure MemoryStream works properly (not sure about byte arrays as inputs)
        private MemoryStream bos = new MemoryStream();

        private Composer()
        {

        }

        public static Composer Compose()
        {
            return new Composer();
        }

        public Composer U64Str(long n)
        {
            U32Str((int) (n >> 32));
            U32Str((int) n);

            return this;
        }

        public Composer U32Str(int n)
        {
            bos.WriteByte((byte)(n >> 24));
            bos.WriteByte((byte)(n >> 16));
            bos.WriteByte((byte)(n >> 8));
            bos.WriteByte((byte)(n));
            return this;
        }

        public Composer U16Str(uint n)
        {
            n &= 0xFFFF;
            bos.WriteByte((byte)(n >> 8));
            bos.WriteByte((byte)(n));
            return this;
        }

        public Composer Bytes(IEncodable[] encodable)
        {
            try
            {
                foreach (var e in encodable)
                {
                    bos.Write(e.GetEncoded(), 0, e.GetEncoded().Length);// todo count?
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }

            return this;
        }


        public Composer Bytes(IEncodable encodable)
        {
            try
            {
                bos.Write(encodable.GetEncoded(), 0, encodable.GetEncoded().Length);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }

            return this;
        }

        public Composer Pad(int v, int len)
        {
            for (; len >= 0; len--)
            {
                try
                {
                    bos.WriteByte((byte) v);
                }
                catch (Exception ex)
                {
                    throw new Exception(ex.Message, ex);
                }
            }

            return this;
        }

        public Composer Bytes(byte[][] arrays)
        {
            try
            {
                foreach (byte[] array in arrays)
                {
                    bos.Write(array, 0, array.Length); //todo count?
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }

            return this;
        }

        public Composer Bytes(byte[][] arrays, int start, int end)
        {
            try
            {
                int j = start;
                while (j != end)
                {
                    bos.Write(arrays[j], 0, arrays[j].Length);//todo count?
                    j++;
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }

            return this;
        }


        public Composer Bytes(byte[] array)
        {
            try
            {
                bos.Write(array, 0, array.Length);//todo count?
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }

            return this;
        }


        public Composer Bytes(byte[] array, int start, int len)
        {
            try
            {
                bos.Write(array, start, len);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }

            return this;
        }

        public byte[] Build()
        {
            return bos.ToArray();
        }

        public Composer PadUntil(int v, int requiredLen)
        {
            while (bos.Length < requiredLen)
            {
                bos.WriteByte((byte) v);
            }

            return this;
        }

        public Composer GetBool(bool v)
        {
            bos.WriteByte((byte) (v ? 1 : 0));
            return this;
        }
            
    }
}