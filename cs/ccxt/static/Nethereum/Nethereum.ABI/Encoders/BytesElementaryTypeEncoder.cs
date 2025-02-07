using System;
using System.Linq;

namespace Nethereum.ABI.Encoders
{
    public class BytesElementaryTypeEncoder : ITypeEncoder
    {
        private readonly int _size;

        public BytesElementaryTypeEncoder(int size)
        {
            if(size > 32) throw new ArgumentException("bytes(Number) for an elementary type can only be a Maximum of 32");
            this._size = size;
        }

        public byte[] Encode(object value)
        {
            //default to false, this is a byte array we are not responsible for endianism
            return Encode(value, false);
        }

        public byte[] EncodePacked(object value)
        {
            if (_size == 1 && value is byte)
            {
                value = new byte[1] { (byte)value };
            }

            if (_size == 16 && value is Guid)
            {
                value = ((Guid)value).ToByteArray();
            }

            if (!(value is byte[]))
                throw new Exception("byte[] value expected for type 'bytes'");
            var byteArray = (byte[])value;

            if (byteArray.Length != _size)
                throw new Exception("byte[] size expected to be " + _size);

            return byteArray;

        }

        public byte[] Encode(object value, bool checkEndian)
        {
            if(_size == 1 && value is byte)
            {
                value = new byte[1] { (byte)value };
            }

            if (_size == 16 && value is Guid)
            {
                value = ((Guid) value).ToByteArray();
            }

            if (!(value is byte[]))
                throw new Exception("byte[] value expected for type 'bytes'");
            var byteArray = (byte[])value;

            if (byteArray.Length != _size)
                throw new Exception("byte[] size expected to be " + _size);

            var returnArray = new byte[((byteArray.Length - 1) / 32 + 1) * 32]; // padding 32 bytes

            //It should always be Big Endian.
            if (BitConverter.IsLittleEndian && checkEndian)
                byteArray = byteArray.Reverse().ToArray();

            Array.Copy(byteArray, 0, returnArray, 0, byteArray.Length);

            return returnArray;
        }
    }
}