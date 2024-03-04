using Nethereum.ABI;
using Nethereum.ABI.FunctionEncoding.Attributes;
using Nethereum.ABI.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace Nethereum.ABI.EIP712
{
    public class MemberDescriptionFactory
    {
        public static Dictionary<string, MemberDescription[]> GetTypesMemberDescription(params Type[] types)
        {
            var dictionary = new Dictionary<string, MemberDescription[]>();
            foreach(var type in types)
            {
                AddMemberDescriptionFromTypeToDictionary(dictionary, type);
            }
            return dictionary;
        }

        public static void AddMemberDescriptionFromTypeToDictionary(Dictionary<string, MemberDescription[]> dictionary, Type type)
        {
            var parameters = ExtractParametersFromAttributes(type).OrderBy(x => x.Order);
            var structTypeName = type.Name;
            if (StructAttribute.IsStructType(type))
            {
                structTypeName = StructAttribute.GetAttribute(type).Name;
            }
         
            var typeMembers = new List<MemberDescription>();
            foreach (var parameter in parameters)
            {
                var typeName = parameter.Type;

                if (parameter.ABIType is TupleType tupleType)
                {
                    typeName = parameter.StructTypeName;
                }

                if (parameter.ABIType is ArrayType arrayType)
                {
                    if (arrayType.ElementType is TupleType tupleTypeElement)
                    {
                        typeName = parameter.StructTypeName;
                    }
                }

                typeMembers.Add(new MemberDescription
                {
                    Type = typeName,
                    Name = parameter.Name
                });
            }

            dictionary[structTypeName] = typeMembers.ToArray();
        }

        private static Parameter[] ExtractParametersFromAttributes(Type contractMessageType)
        {
            var properties = PropertiesExtractor.GetPropertiesWithParameterAttribute(contractMessageType);
            var parameters = new List<Parameter>();

            foreach (var property in properties)
            {
                var parameterAttribute = property.GetCustomAttribute<ParameterAttribute>(true);
                parameters.Add(parameterAttribute.Parameter);
            }
            return parameters.ToArray();
        }
    }
}