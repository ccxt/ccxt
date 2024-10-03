using System;
using Newtonsoft.Json;

namespace Nethereum.Hex.HexTypes
{
    public class HexRPCTypeJsonConverter<T, TValue> : JsonConverter where T : HexRPCType<TValue>
    {
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            var hexRPCType = (T) value;
            writer.WriteValue(hexRPCType.HexValue);
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue,
            JsonSerializer serializer)
        {
            if (reader.Value == null) return null;

            if (reader.Value is string)
            {
                return HexTypeFactory.CreateFromHex<TValue>((string)reader.Value);
            }
            //fallback if we get rug numbers
            return HexTypeFactory.CreateFromObject<TValue>(reader.Value);
        }

        public override bool CanConvert(Type objectType)
        {
            return objectType == typeof(T);
        }
    }
}