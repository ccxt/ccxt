using System.Linq;
using Nethereum.ABI.Model;
using Nethereum.Hex.HexConvertors.Extensions;

namespace Nethereum.ABI
{
    public class TupleType : ABIType
    {
        public Parameter[] Components { get; protected set; }

        public void SetComponents(Parameter[] components)
        {
            this.Components = components;
            ((TupleTypeEncoder) Encoder).Components = components;
            ((TupleTypeDecoder) Decoder).Components = components;
        }

        public TupleType() : base("tuple")
        {
            Decoder = new TupleTypeDecoder();
            Encoder = new TupleTypeEncoder();
        }

        public T DecodeComplexType<T>(string encoded)
        {
            return DecodeComplexType<T>(encoded.HexToByteArray());
        }

        public T DecodeComplexType<T>(byte[] encoded)
        {
            return ((TupleTypeDecoder)Decoder).DecodeComplexType<T>(encoded);
        }

        public override int FixedSize {
            get
            {
                if (Components == null) return -1;
                if (Components.Any(x => x.ABIType.IsDynamic())) return -1;
                return Components.Sum(x => x.ABIType.FixedSize);
            }
        }
    }
}