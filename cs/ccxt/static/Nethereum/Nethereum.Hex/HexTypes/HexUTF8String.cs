using Nethereum.Hex.HexConvertors;
using Newtonsoft.Json;

namespace Nethereum.Hex.HexTypes
{
    [JsonConverter(typeof(HexRPCTypeJsonConverter<HexUTF8String, string>))]
    public class HexUTF8String : HexRPCType<string>
    {
        private HexUTF8String() : base(new HexUTF8StringConvertor())
        {
        }

        public HexUTF8String(string value) : base(value, new HexUTF8StringConvertor())
        {
        }

        public static HexUTF8String CreateFromHex(string hex)
        {
            return new HexUTF8String {HexValue = hex};
        }
    }
}