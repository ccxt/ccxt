using System;
using System.Collections;
using Nethereum.ABI.Util;
using Nethereum.Util;

namespace Nethereum.ABI.Encoders
{
    public class StaticArrayTypeEncoder : ArrayTypeEncoder
    {
        private readonly int arraySize;
        private readonly ABIType elementType;
        private readonly IntTypeEncoder intTypeEncoder;

        public StaticArrayTypeEncoder(ABIType elementType, int arraySize)
        {
            this.elementType = elementType;
            this.arraySize = arraySize;
            intTypeEncoder = new IntTypeEncoder();
        }

        public override byte[] EncodeList(IList l)
        {
            if (l.Count != arraySize)
                throw new Exception("List size (" + l.Count + ") != " + arraySize);
            
            if (elementType.IsDynamic())
            {
                var elems = new byte[arraySize + arraySize][];
                var currentSize = 0;
                for (var i = 0; i < l.Count; i++)
                {
                    elems[i] = intTypeEncoder.EncodeInt((l.Count * 32) + currentSize);
                    elems[i + l.Count] = elementType.Encode(l[i]);
                    currentSize = currentSize + elems[i + l.Count].Length;
                }
                return ByteUtil.Merge(elems);
            }
            else
            {
                var elems = new byte[arraySize][];
                for (var i = 0; i < l.Count; i++)
                    elems[i] = elementType.Encode(l[i]);
                return ByteUtil.Merge(elems);
            }
        }

        public override byte[] EncodeListPacked(IList l)
        {
            if (l.Count != arraySize)
                throw new Exception("List size (" + l.Count + ") != " + arraySize);

            var elems = new byte[arraySize][];
            for (var i = 0; i < l.Count; i++)
                elems[i] = elementType.Encode(l[i]);
            return ByteUtil.Merge(elems);
        }
    }
}