using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using Nethereum.Hex.HexConvertors.Extensions;
using Nethereum.ABI;
using Nethereum.ABI.FunctionEncoding;
using Nethereum.Util;
using System.Collections;
using System.Numerics;
using System;

namespace Nethereum.ABI.EIP712
{
    public class Eip712TypedDataEncoder
    {
        private readonly ABIEncode _abiEncode = new ABIEncode();
        public static Eip712TypedDataEncoder Current { get; } = new Eip712TypedDataEncoder();
        private readonly ParametersEncoder _parametersEncoder = new ParametersEncoder();

        // <summary>
        /// Encodes data according to EIP-712, it uses a predefined typed data schema and converts and encodes the provide the message value
        /// </summary>
        public byte[] EncodeTypedData<T, TDomain>(T message, TypedData<TDomain> typedData)
        {
            typedData.Message = MemberValueFactory.CreateFromMessage(message);
            typedData.EnsureDomainRawValuesAreInitialised();
            return EncodeTypedDataRaw(typedData);
        }

        /// <summary>
        /// Encodes data according to EIP-712.
        /// Infers types of message fields from <see cref="Nethereum.ABI.FunctionEncoding.Attributes.ParameterAttribute"/>. 
        /// For flat messages only, for complex messages with reference type fields use "EncodeTypedData(TypedData typedData).
        /// </summary>
        public byte[] EncodeTypedData<T, TDomain>(T data, TDomain domain, string primaryTypeName)
        {
            var typedData = GenerateTypedData(data, domain, primaryTypeName);

            return EncodeTypedData(typedData);
        }

        public byte[] EncodeTypedData(string json)
        {
            var typedDataRaw = TypedDataRawJsonConversion.DeserialiseJsonToRawTypedData(json);
            return EncodeTypedDataRaw(typedDataRaw);
        }

        /// <summary>
        /// Encode typed data using a non standard json, which may not include the Domain type and uses a different key selector for message
        /// </summary>
         public byte[] EncodeTypedData<DomainType>(string json, string messageKeySelector = "message")
        {
            var typedDataRaw = TypedDataRawJsonConversion.DeserialiseJsonToRawTypedData<DomainType>(json, messageKeySelector);
            return EncodeTypedDataRaw(typedDataRaw);
        }

        public byte[] EncodeAndHashTypedData<T, TDomain>(T message, TypedData<TDomain> typedData)
        {
            var encodedData = EncodeTypedData(message, typedData);
            return Sha3Keccack.Current.CalculateHash(encodedData);
        }

        public byte[] EncodeAndHashTypedData<TDomain>(TypedData<TDomain> typedData)
        {
            var encodedData = EncodeTypedData(typedData);
            return Sha3Keccack.Current.CalculateHash(encodedData);
        }

        /// <summary>
        /// Encodes data according to EIP-712.
        /// </summary>
        public byte[] EncodeTypedData<TDomain>(TypedData<TDomain> typedData)
        {
            typedData.EnsureDomainRawValuesAreInitialised();
            return EncodeTypedDataRaw(typedData);
        }

        public byte[] EncodeTypedDataRaw(TypedDataRaw typedData)
        {
            using (var memoryStream = new MemoryStream())
            using (var writer = new BinaryWriter(memoryStream))
            {
                writer.Write("1901".HexToByteArray());
                writer.Write(HashStruct(typedData.Types, "EIP712Domain", typedData.DomainRawValues));
                writer.Write(HashStruct(typedData.Types, typedData.PrimaryType, typedData.Message));

                writer.Flush();
                var result = memoryStream.ToArray();
                return result;
            }
        }

        public byte[] HashDomainSeparator<TDomain>(TypedData<TDomain> typedData)
        {
            typedData.EnsureDomainRawValuesAreInitialised();
            using (var memoryStream = new MemoryStream())
            using (var writer = new BinaryWriter(memoryStream))
            {
                writer.Write(HashStruct(typedData.Types, "EIP712Domain", typedData.DomainRawValues));
                writer.Flush();
                var result = memoryStream.ToArray();
                return result;
            }
        }

        public byte[] HashStruct<T>(T message, string primaryType, params Type[] types)
        {
            var memberDescriptions = MemberDescriptionFactory.GetTypesMemberDescription(types);
            var memberValue = MemberValueFactory.CreateFromMessage(message);
            return HashStruct(memberDescriptions, primaryType, memberValue);
        }

        public string GetEncodedType(string primaryType, params Type[] types)
        {
            var memberDescriptions = MemberDescriptionFactory.GetTypesMemberDescription(types);
            return EncodeType(memberDescriptions, primaryType);
        }

        public string GetEncodedTypeDomainSeparator<TDomain>(TypedData<TDomain> typedData)
        {
            typedData.EnsureDomainRawValuesAreInitialised();
            return EncodeType(typedData.Types, "EIP712Domain");
        }

        private byte[] HashStruct(IDictionary<string, MemberDescription[]> types, string primaryType, IEnumerable<MemberValue> message)
        {
            using (var memoryStream = new MemoryStream())
            using (var writer = new BinaryWriter(memoryStream))
            {
                var encodedType = EncodeType(types, primaryType);
                var typeHash = Sha3Keccack.Current.CalculateHash(Encoding.UTF8.GetBytes(encodedType));
                writer.Write(typeHash);

                EncodeData(writer, types, message);

                writer.Flush();
                return Sha3Keccack.Current.CalculateHash(memoryStream.ToArray());
            }
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
            var currentTypeMembersEncoded = currentTypeMembers.Select(x => x.Type + " " + x.Name);
            var result = new List<KeyValuePair<string, string>>
            {
                new KeyValuePair<string, string>(currentTypeName, currentTypeName + "(" + string.Join(",", currentTypeMembersEncoded.ToArray()) + ")")
            };

            result.AddRange(currentTypeMembers.Select(x => ConvertToElementType(x.Type)).Distinct().Where(IsReferenceType).SelectMany(x => EncodeTypes(types, x)));

            return result;
        }

        private static string ConvertToElementType(string type)
        {
            if (type.Contains("["))
            {
                return type.Substring(0, type.IndexOf("["));
            }
            return type;
        }

        internal static bool IsReferenceType(string typeName)
        {
            switch (typeName)
            {
                // TODO: specify more precise conditions
                case var bytes when new Regex("bytes\\d+").IsMatch(bytes):
                case var @uint when new Regex("uint\\d+").IsMatch(@uint):
                case var @int when new Regex("int\\d+").IsMatch(@int):
                case "bytes":
                case "string":
                case "bool":
                case "address":
                    return false;
                case var array when array.Contains("["):
                    return false;
                default:
                    return true;
            }
        }

        private void EncodeData(BinaryWriter writer, IDictionary<string, MemberDescription[]> types, IEnumerable<MemberValue> memberValues)
        {
            foreach (var memberValue in memberValues)
            {
                switch (memberValue.TypeName)
                {
                    case var refType when IsReferenceType(refType):
                        {
                            writer.Write(HashStruct(types, memberValue.TypeName, (IEnumerable<MemberValue>)memberValue.Value));
                            break;
                        }
                    case "string":
                        {
                            var value = Encoding.UTF8.GetBytes((string)memberValue.Value);
                            var abiValueEncoded = Sha3Keccack.Current.CalculateHash(value);
                            writer.Write(abiValueEncoded);
                            break;
                        }
                    case "bytes":
                        {
                            byte[] value;
                            if (memberValue.Value is string)
                            {
                                value = ((string)memberValue.Value).HexToByteArray();
                            }
                            else
                            {
                                value = (byte[])memberValue.Value;
                            }
                            var abiValueEncoded = Sha3Keccack.Current.CalculateHash(value);
                            writer.Write(abiValueEncoded);
                            break;
                        }
                    default:
                        {
                            if (memberValue.TypeName.Contains("["))
                            {
                                var items = (IList)memberValue.Value;
                                var itemsMemberValues = new List<MemberValue>();
                                foreach (var item in items)
                                {
                                    itemsMemberValues.Add(new MemberValue()
                                    {
                                        TypeName = memberValue.TypeName.Substring(0, memberValue.TypeName.LastIndexOf("[")),
                                        Value = item
                                    });
                                }
                                using (var memoryStream = new MemoryStream())
                                using (var writerItem = new BinaryWriter(memoryStream))
                                {
                                    EncodeData(writerItem, types, itemsMemberValues);
                                    writerItem.Flush();
                                    writer.Write(Sha3Keccack.Current.CalculateHash(memoryStream.ToArray()));
                                }

                            }
                            else if(memberValue.TypeName.StartsWith("int") || memberValue.TypeName.StartsWith("uint"))
                            {
                                object value;
                                if (memberValue.Value is string)
                                {
                                    BigInteger parsedOutput;
                                    if(BigInteger.TryParse((string)memberValue.Value, out parsedOutput))
                                    {
                                        value = parsedOutput;
                                    }
                                    else
                                    {
                                        value = memberValue.Value;
                                    }
                                }
                                else
                                {
                                    value = memberValue.Value;
                                }
                                var abiValue = new ABIValue(memberValue.TypeName, value);
                                var abiValueEncoded = _abiEncode.GetABIEncoded(abiValue);
                                writer.Write(abiValueEncoded);
                            }
                            else
                            {
                                var abiValue = new ABIValue(memberValue.TypeName, memberValue.Value);
                                var abiValueEncoded = _abiEncode.GetABIEncoded(abiValue);
                                writer.Write(abiValueEncoded);
                            }
                            break;
                        }
                }
            }


        }

        /// <summary>
        /// For flat messages only, for complex messages with reference type fields use "EncodeTypedData(TypedData typedData).
        /// </summary>
        public TypedData<TDomain> GenerateTypedData<T, TDomain>(T data, TDomain domain, string primaryTypeName)
        {
            var parameters = _parametersEncoder.GetParameterAttributeValues(typeof(T), data).OrderBy(x => x.ParameterAttribute.Order);

            var typeMembers = new List<MemberDescription>();
            var typeValues = new List<MemberValue>();
            foreach (var parameterAttributeValue in parameters)
            {
                typeMembers.Add(new MemberDescription
                {
                    Type = parameterAttributeValue.ParameterAttribute.Type,
                    Name = parameterAttributeValue.ParameterAttribute.Name
                });

                typeValues.Add(new MemberValue
                {
                    TypeName = parameterAttributeValue.ParameterAttribute.Type,
                    Value = parameterAttributeValue.Value
                });
            }

            var result = new TypedData<TDomain>
            {
                PrimaryType = primaryTypeName,
                Types = new Dictionary<string, MemberDescription[]>
                {
                    [primaryTypeName] = typeMembers.ToArray(),
                    ["EIP712Domain"] = MemberDescriptionFactory.GetTypesMemberDescription(typeof(TDomain))["EIP712Domain"]
                },
                Message = typeValues.ToArray(),
                Domain = domain
            };

            return result;
        }
    }
}