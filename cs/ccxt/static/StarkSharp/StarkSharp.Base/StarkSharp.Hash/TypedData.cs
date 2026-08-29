using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Collections;
using System.Numerics;
using System;
using StarkSharp.Rpc.Utils;

namespace StarkSharp.StarkSharp.Base.StarkSharp.Hash
{
    // Encode revision 0
    // TODO: implement revision 1
    public class TypedData
    {
        public string EncodeTypedDataRaw(TypedDataRaw typedData, object address)
        {
            List<string> message = new List<string>{
                StarknetOps.EncodeShortString("StarkNet Message"),
                HashStruct(typedData.Types, "StarkNetDomain", typedData.DomainRawValues),
                address.ToString(),
                HashStruct(typedData.Types, typedData.PrimaryType, typedData.Message)
            };
            return Address.ComputeHashOnElements(message.ToArray()).ToString("x");
        }

        public string HashStruct<T>(T message, string primaryType, params Type[] types)
        {
            var memberDescriptions = MemberDescriptionFactory.GetTypesMemberDescription(types);
            var memberValue = MemberValueFactory.CreateFromMessage(message);
            return HashStruct(memberDescriptions, primaryType, memberValue);
        }

        private string HashStruct(IDictionary<string, MemberDescription[]> types, string primaryType, IEnumerable<MemberValue> message)
        {
            var encodedType = EncodeType(types, primaryType);
            string typeHash = StarknetOps.CalculateFunctionSelector(encodedType);

            string[] encodedData = EncodeData(types, message);
            string[] msg = new string[encodedData.Length + 1];
            msg[0] = typeHash;
            Array.Copy(encodedData, 0, msg, 1, encodedData.Length);

            return Address.ComputeHashOnElements(msg).ToString("x");
        }

        private static string EncodeType(IDictionary<string, MemberDescription[]> types, string typeName)
        {
            var encodedTypes = EncodeTypes(types, typeName);
            var encodedPrimaryType = encodedTypes.Single(x => x.Key == typeName);
            var encodedReferenceTypes = encodedTypes.Where(x => x.Key != typeName).OrderBy(x => x.Key).Select(x => x.Value);
            var fullyEncodedType = encodedPrimaryType.Value + string.Join(string.Empty, encodedReferenceTypes.ToArray());

            return fullyEncodedType;
        }

        private static IList<KeyValuePair<string, string>> EncodeTypes(IDictionary<string, MemberDescription[]> types, string currentTypeName)
        {
            var currentTypeMembers = types[currentTypeName];
            var currentTypeMembersEncoded = currentTypeMembers.Select(x => x.Name + ":" + x.Type);
            var result = new List<KeyValuePair<string, string>>
            {
                new KeyValuePair<string, string>(currentTypeName, currentTypeName + "(" + string.Join(",", currentTypeMembersEncoded.ToArray()) + ")")
            };

            result.AddRange(currentTypeMembers.Select(x => ConvertToElementType(x.Type)).Distinct().Where(IsReferenceType).SelectMany(x => EncodeTypes(types, x)));

            return result;
        }

        private static string ConvertToElementType(string type)
        {
            return type;
        }

        internal static bool IsReferenceType(string typeName)
        {
            // TODO: struct data
            switch (typeName)
            {
                case "felt":
                    return false;
                default:
                    return true;
            }
        }

        private string[] EncodeData(IDictionary<string, MemberDescription[]> types, IEnumerable<MemberValue> memberValues)
        {
            // TODO: struct data & reference
            List<string> result = new List<string>{};
            foreach (var memberValue in memberValues)
            {
                Type valueType = memberValue.Value.GetType();
                if (valueType == typeof(string)) {
                    string value = memberValue.Value.ToString();
                    Regex numRegex = new Regex("^[0-9]+$");
                    Regex hexRegex = new Regex("^(0x)?[0-9A-Fa-f]+$");
                    if (numRegex.IsMatch(value)) {
                        result.Add(BigInteger.Parse(value).ToString("x"));
                    } else if (hexRegex.IsMatch(value)) {
                        result.Add(value.Replace("0x", ""));
                    } else {
                        result.Add(NumericOps.ByteArrayToHexPresentation(Encoding.UTF8.GetBytes(value)));
                    }
                } else if (valueType == typeof(int) || valueType == typeof(long) ) {
                    BigInteger value = BigInteger.Parse(memberValue.Value.ToString());
                    result.Add(value.ToString("x"));
                } else {
                    Console.WriteLine("Not support the type of value");
                }
            }
            return result.ToArray();
        }
    }
}