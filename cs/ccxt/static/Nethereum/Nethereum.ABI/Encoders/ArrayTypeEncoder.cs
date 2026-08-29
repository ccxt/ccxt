using System;
using System.Collections;
using System.Linq;

namespace Nethereum.ABI.Encoders
{
    public abstract class ArrayTypeEncoder : ITypeEncoder
    {
        public byte[] Encode(object value)
        {
            var array = value as IEnumerable;
            if ((array != null) && !(value is string))
                return EncodeList(array.Cast<object>().ToList());
            throw new Exception("Array value expected for type");
        }

        public byte[] EncodePacked(object value)
        {
            var array = value as IEnumerable;
            if ((array != null) && !(value is string))
                return EncodeListPacked(array.Cast<object>().ToList());
            throw new Exception("Array value expected for type");
        }

        public abstract byte[] EncodeList(IList l);
        public abstract byte[] EncodeListPacked(IList l);
    }
}