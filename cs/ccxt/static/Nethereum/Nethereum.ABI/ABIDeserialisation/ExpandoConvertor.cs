using System;
using System.Collections.Generic;
//using System.Dynamic;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Nethereum.ABI.ABIDeserialisation
{
    /// <summary>
    ///     This is a replication (copy) of Newtonsoft ExpandoObjectConverter to allow for PCL compilaton
    /// </summary>
    public class ExpandoObjectConverter : JsonConverter
    {
        /// <summary>
        ///     Gets a value indicating whether this <see cref="JsonConverter" /> can write JSON.
        /// </summary>
        /// <value>
        ///     <c>true</c> if this <see cref="JsonConverter" /> can write JSON; otherwise, <c>false</c>.
        /// </value>
        public override bool CanWrite
        {
            get { return false; }
        }

        /// <summary>
        ///     Determines whether this instance can convert the specified object type.
        /// </summary>
        /// <param name="objectType">Type of the object.</param>
        /// <returns>
        ///     <c>true</c> if this instance can convert the specified object type; otherwise, <c>false</c>.
        /// </returns>
        public override bool CanConvert(Type objectType)
        {
            return objectType == typeof(IDictionary<string, object>);
        }

        /// <summary>
        ///     Reads the JSON representation of the object.
        /// </summary>
        /// <param name="reader">The <see cref="JsonReader" /> to read from.</param>
        /// <param name="objectType">Type of the object.</param>
        /// <param name="existingValue">The existing value of object being read.</param>
        /// <param name="serializer">The calling serializer.</param>
        /// <returns>The object value.</returns>
        public override object ReadJson(JsonReader reader, Type objectType, object existingValue,
            JsonSerializer serializer)
        {
            return ReadValue(reader);
        }

        /// <summary>
        ///     Writes the JSON representation of the object.
        /// </summary>
        /// <param name="writer">The <see cref="JsonWriter" /> to write to.</param>
        /// <param name="value">The value.</param>
        /// <param name="serializer">The calling serializer.</param>
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            // can write is set to false
        }

        private bool IsPrimitiveToken(JsonToken token)
        {
            switch (token)
            {
                case JsonToken.Integer:
                case JsonToken.Float:
                case JsonToken.String:
                case JsonToken.Boolean:
                case JsonToken.Undefined:
                case JsonToken.Null:
                case JsonToken.Date:
                case JsonToken.Bytes:
                    return true;
                default:
                    return false;
            }
        }

        private object ReadList(JsonReader reader)
        {
            IList<object> list = new List<object>();

            while (reader.Read())
                switch (reader.TokenType)
                {
                    case JsonToken.Comment:
                        break;
                    default:
                        var v = ReadValue(reader);

                        list.Add(v);
                        break;
                    case JsonToken.EndArray:
                        return list;
                }

            throw new Exception("Unexpected end.");
        }

        private object ReadObject(JsonReader reader)
        {
            IDictionary<string, object> expandoObject = new Dictionary<string, object>();

            while (reader.Read())
                switch (reader.TokenType)
                {
                    case JsonToken.PropertyName:
                        var propertyName = reader.Value.ToString();

                        if (!reader.Read())
                            throw new Exception("Unexpected end.");

                        var v = ReadValue(reader);

                        expandoObject[propertyName] = v;
                        break;
                    case JsonToken.Comment:
                        break;
                    case JsonToken.EndObject:
                        return expandoObject;
                }

            throw new Exception("Unexpected end.");
        }

        private object ReadValue(JsonReader reader)
        {
            while (reader.TokenType == JsonToken.Comment)
                if (!reader.Read())
                    throw new Exception("Unexpected end.");

            switch (reader.TokenType)
            {
                case JsonToken.StartObject:
                    return ReadObject(reader);
                case JsonToken.StartArray:
                    return ReadList(reader);
                default:
                    if (IsPrimitiveToken(reader.TokenType))
                        return reader.Value;

                    throw new Exception("Unexpected token when converting ExpandoObject");
            }
        }
    }

    // Converting ABI as JArray, JObject into ExpandoObject style
    // This is only available for ABI, not generic JObject/ExpandoObject conversion
    public class JObjectToExpandoConverter {
        public List<IDictionary<string, object>> JObjectArray(JArray array) {
            var l = new List<IDictionary<string, object>>();
            foreach(JObject obj in array)
                l.Add(JObject(obj));
            return l;
        }
        public List<object> JArray(JArray array) {
            var l = new List<object>();
            foreach(JToken token in array)
                l.Add(JToken(token));
            return l;
        }
        public IDictionary<string, object> JObject(JObject obj) {
            var dic = new Dictionary<string, object>();
            foreach(var pair in obj) {
                dic[pair.Key] = JToken(pair.Value);
            }
            return dic;
        }
        public object JToken(JToken token) {
            if(token is JObject)
                return JObject((JObject)token);
            else if(token is JArray)
                return JArray((JArray)token);
            else if(token.Type == JTokenType.String)
                return token.Value<string>();
            else if(token.Type == JTokenType.Boolean)
                return token.Value<bool>();
            else if(token.Type == JTokenType.Integer)
                return token.Value<int>();
            else
                throw new Exception("unexpected token type " + token.Type);
        }
    }
}