using System;
using System.Collections.Generic;
using System.Text;
using Nethereum.Util;
using Nethereum.Util.ByteArrayConvertors;
using Nethereum.Util.HashProviders;


namespace Nethereum.ABI.ByteArrayConvertors
{
    public class AbiStructSha3KeccackHashByteArrayConvertor<T> : IByteArrayConvertor<T>
    {
        private readonly ABIEncode _abiEncode;
        public AbiStructSha3KeccackHashByteArrayConvertor()
        {
            _abiEncode = new ABIEncode();
        }
        public byte[] ConvertToByteArray(T data)
        {
            var encoded = _abiEncode.GetABIParamsEncoded(data);
            return Sha3Keccack.Current.CalculateHash(encoded);

        }
    }
}
