using Nethereum.Util.ByteArrayConvertors;

namespace Nethereum.ABI.ByteArrayConvertors
{
    public class AbiStructEncoderByteConvertor<T> : IByteArrayConvertor<T>
    {
        private readonly ABIEncode _abiEncode = new ABIEncode();
        public AbiStructEncoderByteConvertor()
        {

        }

        public byte[] ConvertToByteArray(T data)
        {
            return _abiEncode.GetABIParamsEncoded(data);
        }
    }

}
