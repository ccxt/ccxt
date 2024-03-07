using System.Collections.Generic;
using System.Collections;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using Nethereum.ABI.ABIDeserialisation;
using System.Linq;
using System;
using Nethereum.Hex.HexConvertors.Extensions;

namespace Nethereum.ABI.EIP712
{
    public static class TypedDataRawJsonConversion
    {

        public static string ToJson(this TypedDataRaw typedDataRaw)
        {
            return SerialiseRawTypedDataToJson(typedDataRaw);
        }

        public static string ToJson<TDomain>(this TypedData<TDomain> typedData)
        {
            typedData.EnsureDomainRawValuesAreInitialised();
            return SerialiseRawTypedDataToJson(typedData);
        }

        public static string ToJson<TMessage, TDomain>(this TypedData<TDomain> typedData, TMessage message)
        {
            return SerialiseTypedDataToJson(typedData, message);
        }        

        /// <summary>
        /// Encode typed data using a non standard json (streamlined)
        /// if a Domain type is not included in the json, the generic DomainType will be used
        /// enables using a different message key selector
        /// if a primary type is not set and it includes only a single type this will be used as the primary type
        /// </summary>
        public static TypedDataRaw DeserialiseJsonToRawTypedData<DomainType>(string json, string messageKeySelector = "message")
        {
            var convertor = new ExpandoObjectConverter();
            var jsonDeserialised = JsonConvert.DeserializeObject<IDictionary<string, object>>(json, convertor);
            var types = jsonDeserialised["types"] as IDictionary<string, object>;
            var typeMemberDescriptions = GetMemberDescriptions(types);
            if (!typeMemberDescriptions.ContainsKey("EIP712Domain"))
            {
                var domainMemberDescription = MemberDescriptionFactory.GetTypesMemberDescription(typeof(DomainType)).FirstOrDefault();
                typeMemberDescriptions.Add(domainMemberDescription.Key, domainMemberDescription.Value);
            }

            var domainValues = GetMemberValues((IDictionary<string, object>)jsonDeserialised["domain"], "EIP712Domain", typeMemberDescriptions);
            var primaryType = string.Empty;

            if (jsonDeserialised.ContainsKey("primaryType"))
            {
                primaryType = jsonDeserialised["primaryType"].ToString();
            }
            else
            {
                if (types.Count == 1)
                {
                    primaryType = types.First().Key;
                }
                else
                {
                    throw new Exception("Primary type not set");
                }
            }

            var message = jsonDeserialised[messageKeySelector];
            var messageValues = GetMemberValues((IDictionary<string, object>)message, primaryType, typeMemberDescriptions);

            var rawTypedData = new TypedDataRaw()
            {
                DomainRawValues = domainValues.ToArray(),
                PrimaryType = primaryType,
                Message = messageValues.ToArray(),
                Types = typeMemberDescriptions
            };

            return rawTypedData;
        }


        public static TypedDataRaw DeserialiseJsonToRawTypedData(string json)
        {
            return DeserialiseJsonToRawTypedData<Domain>(json);
        }

        public static string SerialiseTypedDataToJson<TMessage, TDomain>(TypedData<TDomain> typedData, TMessage message)
        {
            typedData.EnsureDomainRawValuesAreInitialised();
            typedData.Message = MemberValueFactory.CreateFromMessage(message);
            return SerialiseRawTypedDataToJson(typedData);
        }

        public static string SerialiseRawTypedDataToJson(TypedDataRaw typedDataRaw)
        {
            var jobject = (JObject)JToken.FromObject(typedDataRaw);
            var domainProperty = new JProperty("domain");
            var domainProperties = GetJProperties("EIP712Domain", typedDataRaw.DomainRawValues, typedDataRaw);
            domainProperty.Value = new JObject(domainProperties.ToArray());
            jobject.Add(domainProperty);
            var messageProperty = new JProperty("message");
            var messageProperties = GetJProperties(typedDataRaw.PrimaryType, typedDataRaw.Message, typedDataRaw);
            messageProperty.Value = new JObject(messageProperties.ToArray());
            jobject.Add(messageProperty);
            return jobject.ToString();
        }
        private static MemberValue GetMemberValue(string memberType, object memberValue, Dictionary<string, MemberDescription[]> typeMemberDescriptions)
        {

            if (Eip712TypedDataEncoder.IsReferenceType(memberType))
            {
                return new MemberValue()
                {
                    TypeName = memberType,
                    Value = GetMemberValues((IDictionary<string, object>)memberValue, memberType, typeMemberDescriptions).ToArray()
                };
            }
            else
            {
                if (memberType.StartsWith("bytes") && !memberType.Contains("["))
                {
                    return new MemberValue()
                    {
                        TypeName = memberType,
                        Value = ((string)memberValue).HexToByteArray()
                    };
                }
                else
                {
                    if (memberType.Contains("["))
                    {
                        var items = (IList)memberValue;
                        var innerType = memberType.Substring(0, memberType.LastIndexOf("["));
                        if (Eip712TypedDataEncoder.IsReferenceType(innerType))
                        {
                            var itemsMemberValues = new List<MemberValue[]>();
                            foreach (var item in items)
                            {
                                itemsMemberValues.Add(GetMemberValues((IDictionary<string, object>)item, innerType, typeMemberDescriptions).ToArray());
                            }

                            return new MemberValue() { TypeName = memberType, Value = itemsMemberValues };
                        }
                        else
                        {
                            var itemsMemberValues = new List<object>();

                            foreach (var item in items)
                            {
                                itemsMemberValues.Add(item);
                            }

                            return new MemberValue() { TypeName = memberType, Value = itemsMemberValues };
                        }

                    }
                    else
                    {
                        return new MemberValue()
                        {
                            TypeName = memberType,
                            Value = memberValue
                        };
                    }
                }
            }
        }

        private static Dictionary<string, MemberDescription[]> GetMemberDescriptions(IDictionary<string, object> types)
        {
            var typeMemberDescriptions = new Dictionary<string, MemberDescription[]>();
            foreach (var type in types)
            {
                var memberDescriptions = new List<MemberDescription>();
                foreach (var typeMember in type.Value as List<object>)
                {
                    var typeMemberDictionary = (IDictionary<string, object>)typeMember;
                    memberDescriptions.Add(
                          new MemberDescription()
                          {
                              Name = (string)typeMemberDictionary["name"],
                              Type = (string)typeMemberDictionary["type"]
                          });
                }
                typeMemberDescriptions.Add(type.Key, memberDescriptions.ToArray());
            }

            return typeMemberDescriptions;
        }

        private static List<MemberValue> GetMemberValues(IDictionary<string, object> deserialisedObject, string typeName, Dictionary<string, MemberDescription[]> typeMemberDescriptions)
        {
            var memberValues = new List<MemberValue>();
            var typeMemberDescription = typeMemberDescriptions[typeName];
            foreach (var member in typeMemberDescription)
            {

                var memberType = member.Type;
                var memberValue = deserialisedObject[member.Name];

                memberValues.Add(GetMemberValue(memberType, memberValue, typeMemberDescriptions));
            }

            return memberValues;
        }

        private static List<JProperty> GetJProperties(string mainTypeName, MemberValue[] values, TypedDataRaw typedDataRaw)
        {
            var properties = new List<JProperty>();
            var mainType = typedDataRaw.Types[mainTypeName];
            for (int i = 0; i < mainType.Length; i++)
            {
                var memberType = mainType[i].Type;
                var memberName = mainType[i].Name;
                if (Eip712TypedDataEncoder.IsReferenceType(memberType))
                {
                    var memberProperty = new JProperty(memberName);
                    if (values[i].Value != null)
                    {
                        memberProperty.Value = new JObject(GetJProperties(memberType, (MemberValue[])values[i].Value, typedDataRaw).ToArray());
                    }
                    else
                    {
                        memberProperty.Value = null;
                    }
                    properties.Add(memberProperty);
                }
                else
                {
                    if (memberType.StartsWith("bytes"))
                    {
                        var name = memberName;
                        if (values[i].Value is byte[])
                        {
                            var value = ((byte[])values[i].Value).ToHex();
                            properties.Add(new JProperty(name, value));
                        }
                        else
                        {
                            var value = values[i].Value;
                            properties.Add(new JProperty(name, value));
                        }
                    }
                    else
                    {
                        if (memberType.Contains("["))
                        {
                            var memberProperty = new JProperty(memberName);
                            var memberValueArray = new JArray();
                            var innerType = memberType.Substring(0, memberType.LastIndexOf("["));
                            if (values[i].Value == null)
                            {
                                memberProperty.Value = null;
                                properties.Add(memberProperty);
                            }
                            else
                            {
                                if (Eip712TypedDataEncoder.IsReferenceType(innerType))
                                {
                                    var items = (List<MemberValue[]>)values[i].Value;

                                    foreach (var item in items)
                                    {
                                        memberValueArray.Add(new JObject(GetJProperties(innerType, item, typedDataRaw).ToArray()));
                                    }
                                    memberProperty.Value = memberValueArray;
                                    properties.Add(memberProperty);
                                }
                                else
                                {
                                    var items = (IList)values[i].Value;

                                    foreach (var item in items)
                                    {
                                        memberValueArray.Add(item);
                                    }

                                    memberProperty.Value = memberValueArray;
                                    properties.Add(memberProperty);
                                }
                            }

                        }
                        else
                        {

                            var name = memberName;
                            var value = values[i].Value;
                            properties.Add(new JProperty(name, value));
                        }
                    }
                }
            }
            return properties;
        }

    }
}