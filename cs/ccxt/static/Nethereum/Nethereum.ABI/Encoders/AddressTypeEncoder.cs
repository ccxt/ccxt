using System;
using Nethereum.Hex.HexConvertors.Extensions;

namespace Nethereum.ABI.Encoders
{
    public class AddressTypeEncoder : ITypeEncoder
    {
        private readonly IntTypeEncoder _intTypeEncoder;

        public AddressTypeEncoder()
        {
            _intTypeEncoder = new IntTypeEncoder();
        }

        public byte[] Encode(object value)
        {
            var strValue = value as string;

            if ((strValue != null)
                && !strValue.StartsWith("0x", StringComparison.Ordinal))
                value = "0x" + value;

            var addr = _intTypeEncoder.Encode(value);

            for (var i = 0; i < 12; i++)
            {
                if ((addr[i] != 0) && (addr[i] != 0xFF))
                    throw new Exception("Invalid address (should be 20 bytes length): " + addr.ToHex());

                if (addr[i] == 0xFF) addr[i] = 0;
            }
            return addr;
        }

        public byte[] EncodePacked(object value)
        {
            var strValue = value as string;

            if(strValue == null) throw new Exception("Invalid type for address expected as string");

            if ((strValue != null)
                && !strValue.StartsWith("0x", StringComparison.Ordinal))
                value = "0x" + value;

            if (strValue.Length == 42) return strValue.HexToByteArray();

            throw new Exception("Invalid address (should be 20 bytes length): " + strValue);
        }
    }
}