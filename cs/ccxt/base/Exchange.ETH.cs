
namespace ccxt;
using Nethereum.ABI;
using Nethereum.ABI.Model;
using Nethereum;
using Nethereum.ABI.ABIDeserialisation;
using Nethereum.ABI.EIP712;
using Nethereum.Signer.EIP712;
using System.Linq;

public partial class Exchange
{

    // ethAbiEncode(types, args) {
    //     return this.base16ToBinary(ethers.encode(types, args).slice(2));
    // }
    // ethEncodeStructuredData(domain, messageTypes, messageData) {
    //     return this.base16ToBinary(TypedDataEncoder.encode(domain, messageTypes, messageData).slice(-132));
    // }

    private object[] ConvertToArray(object obj)
    {
        var array = (obj as IList<object>).ToArray();
        for (var i = 0; i < array.Length; i++)
        {
            var item = array[i];
            if (item is IDictionary<string, object>)
            {
                // array[i] = ConvertToDictionary(item);
            }
            else if (item is IList<object>)
            {
                array[i] = ConvertToArray(item);
            }
        }
        return array;
    }

    public object ethAbiEncode(object types2, object args2)
    {
        //  ['(uint32,bool,uint64,uint64,bool,uint8,uint64)[]', 'uint8', 'address', 'uint256']
        //  [Array(1), 0, '0x0000000000000000000000000000000000000000', 1708007294587]

        //     // test
        //     var typesDefinion = "tuple((uint32,bool,uint64,uint64,bool,uint8,uint64)[],uint8,address,uint256)";
        //     var valsTuple = new object[]
        //     {
        //         new object[]
        //         {
        //             new object[]
        //             {
        //                 5,
        //                 true,
        //                 1000000000,
        //                 100000000,
        //                 false,
        //                 2,
        //                 0
        //             },
        //             0,
        //             "0x0000000000000000000000000000000000000000",
        //             0
        //         }
        //     };
        //     // var types = types2 as IList<object>;
        //     var vals = (args2 as IList<object>).ToArray();

        //     var objectValues = ConvertToArray(args2);

        //     var wrappedValues = new object[] { objectValues };

        //     object converted;


        //     var valsTuple2 = new object[] { vals };
        //     // var typesDefinion = "tuple(" + String.Join(",", types) + ")";

        //     var testExtract = new ABIStringSignatureDeserialiser().ExtractParameters(typesDefinion, false);
        //     var parameterEncoder = new Nethereum.ABI.FunctionEncoding.ParametersEncoder();
        //     var encoded = parameterEncoder.EncodeParameters(testExtract.ToArray(), valsTuple.ToArray());

        //     var encodedFromExchange = parameterEncoder.EncodeParameters(testExtract.ToArray(), wrappedValues);

        //     var areEqual = encoded.SequenceEqual(encodedFromExchange);

        //     return encoded;
        var types = types2 as IList<object>;
        var vals = args2 as IList<object>;
        var valsTuple = new List<object>() { vals };
        var tupleType = new TupleType();
        var components = new List<Parameter>();
        foreach (var type in types)
        {
            var typeExtract = new ABIStringSignatureDeserialiser().ExtractParameters(type.ToString(), false);
            components.Add(typeExtract[0]);
        }
        tupleType.SetComponents(components.ToArray());
        var encoded = tupleType.Encode(ConvertToArray(vals));
        return encoded;
    }

    public object ethEncodeStructuredData(object domain2, object messageTypes2, object messageData2)
    {
        // const domain =({"chainId":1337,"verifyingContract":"0x0000000000000000000000000000000000000000"})
        // const messageTypes = {"Agent":[{"name":"source","type":"uint256"},{"name":"connectionId","type":"bytes32"}]}

        var domain = domain2 as IDictionary<string, object>;
        var messageTypes = messageTypes2 as IDictionary<string, object>;
        var messageTypesKeys = messageTypes.Keys.ToArray();
        var domainValues = domain.Values.ToArray();
        var domainTypes = new Dictionary<string, string>();
        var messageData = messageData2 as IDictionary<string, object>;

        var typeRaw = new TypedDataRaw(); // contains all domain + message info

        // infer types from values
        foreach (var key in domain.Keys)
        {
            // var type = domainValue.GetType();
            var domainValue = domain[key];
            if (domainValue is string && (domainValue as string).StartsWith("0x"))
                domainTypes.Add(key, "address");
            else if (domainValue is string)
                domainTypes.Add(key, "string");
            else
                domainTypes.Add(key, "uint256"); // handle other use cases later
        }

        var types = new Dictionary<string, MemberDescription[]>();

        // fill in domain types
        var domainTypesDescription = new List<MemberDescription> { };
        var domainValuesArray = new List<MemberValue> { };
        var eip721Domain = new List<object[]>{};
        eip721Domain.Add(new object[]{
                "name",
                "string"
        });
        eip721Domain.Add(new object[]{
                "version",
                "string"
        });
        eip721Domain.Add(new object[]{
                "chainId",
                "uint256"
        });
        eip721Domain.Add(new object[]{
                "verifyingContract",
                "address"
        });
        eip721Domain.Add(new object[]{
                "salt",
                "bytes32"
        });
        foreach (var d in eip721Domain) {
            var key = d[0] as string;
            var type = d[1] as string;
            for (var i = 0; i < domain.Count; i++)
            {
                if (String.Equals(key, domain.Keys.ElementAt(i))) {
                    var value = domainValues[i];
                    var memberDescription = new MemberDescription();
                    memberDescription.Name = key;
                    memberDescription.Type = type;
                    domainTypesDescription.Add(memberDescription);

                    var memberValue = new MemberValue();
                    memberValue.TypeName = type;
                    memberValue.Value = value;
                    domainValuesArray.Add(memberValue);
                }
            }
        }
        types["EIP712Domain"] = domainTypesDescription.ToArray();
        typeRaw.DomainRawValues = domainValuesArray.ToArray();

        // fill in message types
        var messageTypesDict = new Dictionary<string, string>();
        var typeName = messageTypesKeys[0];
        var messageTypesContent = messageTypes[typeName] as IList<object>;
        var messageTypesDescription = new List<MemberDescription> { };
        for (var i = 0; i < messageTypesContent.Count; i++)
        {
            var elem = messageTypesContent[i] as IDictionary<string, object>; // {\"name\":\"source\",\"type\":\"string\"}
            var name = elem["name"] as string;
            var type = elem["type"] as string;
            messageTypesDict[name] = type;
            // var key = messageTypesContent.Keys.ElementAt(i);
            // var value = messageTypesContent.Values.ElementAt(i);
            var member = new MemberDescription();
            member.Name = name;
            member.Type = type;
            messageTypesDescription.Add(member);
        }
        types[typeName] = messageTypesDescription.ToArray();

        // fill in message values
        var messageValues = new List<MemberValue> { };
        for (var i = 0; i < messageData.Count; i++)
        {

            var key = messageData.Keys.ElementAt(i);// for instance source
            var type = messageTypesDict[key];
            var value = messageData.Values.ElementAt(i); // 1
            var member = new MemberValue();
            member.TypeName = type;
            member.Value = value;
            messageValues.Add(member);
        }
        typeRaw.Message = messageValues.ToArray();
        typeRaw.Types = types;
        typeRaw.PrimaryType = typeName;
        var typedEncoder = new Eip712TypedDataSigner();

        var encodedFromRaw = typedEncoder.EncodeTypedDataRaw((typeRaw));

        return encodedFromRaw;
    }
}