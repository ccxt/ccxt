using System.Collections;
using Nethereum.ABI.FunctionEncoding;
using Nethereum.ABI.Util;
using Nethereum.Util;

namespace Nethereum.ABI.Encoders
{
    public class DynamicArrayTypeEncoder : ArrayTypeEncoder
    {
        private readonly ABIType _elementType;
        private readonly IntTypeEncoder _intTypeEncoder;

        public DynamicArrayTypeEncoder(ABIType elementType)
        {
           
            this._elementType = elementType;
            _intTypeEncoder = new IntTypeEncoder();
        }

        public override byte[] EncodeList(IList l)
        {
            if (_elementType.IsDynamic())
            {
                var elems = new byte[l.Count + 1 + l.Count][];
                elems[0] = _intTypeEncoder.EncodeInt(l.Count);

                var currentSize = 0;
                for (var i = 0; i < l.Count; i++)
                {
                    elems[i + 1] = _intTypeEncoder.EncodeInt((l.Count * 32) + currentSize); //location element
                    elems[i + 1 + l.Count] = _elementType.Encode(l[i]);
                    currentSize = currentSize + elems[i + 1 + l.Count].Length;
                }
                return ByteUtil.Merge(elems);
            }
            else
            {
                var elems = new byte[l.Count + 1][];
                elems[0] = _intTypeEncoder.EncodeInt(l.Count);
                for (var i = 0; i < l.Count; i++)
                    elems[i + 1] = _elementType.Encode(l[i]);
                return ByteUtil.Merge(elems);
            }
        }

        public override byte[] EncodeListPacked(IList l)
        {
            var elems = new byte[l.Count][];
            for (var i = 0; i < l.Count; i++)
                elems[i] = _elementType.Encode(l[i]);
            return ByteUtil.Merge(elems);
        }
    }
}