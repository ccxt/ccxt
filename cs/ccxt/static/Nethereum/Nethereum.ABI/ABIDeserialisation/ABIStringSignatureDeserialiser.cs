using Nethereum.ABI.Model;
using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;


namespace Nethereum.ABI.ABIDeserialisation
{

    public class ABIStringSignatureDeserialiser
    {
        //https://stackoverflow.com/questions/546433/regular-expression-to-match-balanced-parentheses
        //balanced parameters to support tuples
        private const string paramsRegPattern = @"\((?<params>(?>\((?<c>)|[^()]+|\)(?<-c>))*(?(c)(?!)))?\)";
     
        public List<Parameter> ExtractParameters(string parameters, bool canIndex = false)
        {

            var parametersArray = Regex.Split(parameters, @",(?![^(](?<params>(?>\((?<c>)|[^()]+|\)(?<-c>))*(?(c)(?!)))?\))"); 
            var returnParameters = new List<Parameter>();
            var parameterOrder = 0;
            foreach(var parameter in parametersArray)
            {
                parameterOrder = parameterOrder + 1;
                bool isIndexed = false;
                string name = null;
                var nameTypeIndex = Regex.Split(parameter.Trim(), @"\s+(?![^(](?<params>(?>\((?<c>)|[^()]+|\)(?<-c>))*(?(c)(?!)))?\))");
                string type = GetType(nameTypeIndex[0]);
                if (canIndex && nameTypeIndex.Length == 3 && parameter.IndexOf("indexed") > -1)
                {
                    name = nameTypeIndex[2];
                    isIndexed = true;
                    
                }
                else if (nameTypeIndex.Length == 2)
                {
                    name = nameTypeIndex[1];
                    type = GetType(nameTypeIndex[0]);
                }
                
                var returnParameter = new Parameter(type, name, parameterOrder);
                var tupleType = returnParameter.ABIType as TupleType;
                if(tupleType != null)
                {
                    var match = Regex.Match(parameter, paramsRegPattern);
                    tupleType.SetComponents(ExtractParameters(match.Groups["params"].Value).ToArray());
                }

                var arrayType = returnParameter.ABIType as ArrayType;

                while (arrayType != null)
                {

                    if (arrayType.ElementType is TupleType arrayTupleType)
                    {
                        var match = Regex.Match(parameter, paramsRegPattern);
                        arrayTupleType.SetComponents(ExtractParameters(match.Groups["params"].Value).ToArray());
                        arrayType = null;
                    }
                    else
                    {
                        arrayType = arrayType.ElementType as ArrayType;
                    }
                }

                returnParameter.Indexed = isIndexed;
                returnParameters.Add(returnParameter);

                
            }
            return returnParameters;
        }

        private string GetType(string type)
        {
            type = type.Trim();
            if (type.StartsWith("tuple") || type.StartsWith("("))
            {
                if (type.EndsWith("]"))
                {
                    var index = type.LastIndexOf("[");
                    return "tuple" + type.Substring(index, type.Length - index);
                }
                else
                {
                    return "tuple";
                }
            }
            return type;
        }

        public ErrorABI ExtractErrorABI(string signature, string name, string parameters)
        {
            var errorABI = new ErrorABI(name);
            errorABI.InputParameters = new List<Parameter>().ToArray();
            if (!string.IsNullOrEmpty(parameters))
            {
                errorABI.InputParameters = ExtractParameters(parameters).ToArray();
            }
            return errorABI;
        }

        public EventABI ExtractEventABI(string signature, string name, string parameters)
        {
            var eventAbi = new EventABI(name, false);
            eventAbi.InputParameters = new List<Parameter>().ToArray();
            if (!string.IsNullOrEmpty(parameters))
            {
                eventAbi.InputParameters = ExtractParameters(parameters, true).ToArray();
            }
            return eventAbi;
        }

        public ConstructorABI ExtractConstructorABI(string signature, string name, string parameters)
        {
            var constructor = new ConstructorABI();
            constructor.InputParameters = new List<Parameter>().ToArray();
            if (!string.IsNullOrEmpty(parameters))
            {
                constructor.InputParameters = ExtractParameters(parameters).ToArray();
            }
            return constructor;
        }

        public FunctionABI ExtractFunctionABI(string signature, string name, string parameters)
        {
            var matchReturns = Regex.Match(signature, @"returns\s*" + paramsRegPattern);
            var parameterReturns = matchReturns.Groups["params"].Value;
            var matchModifier = Regex.Match(signature, @"\)\s*\w*\s+(?<modifier>view|pure|constant)");
            var modifier = matchModifier.Groups["modifier"].Value;
            var function = new FunctionABI(name, !string.IsNullOrEmpty(modifier));
            function.InputParameters = new List<Parameter>().ToArray();
            function.OutputParameters = new List<Parameter>().ToArray();
            if (!string.IsNullOrEmpty(parameterReturns))
            {
                function.OutputParameters = ExtractParameters(parameterReturns).ToArray();
            }

            if (!string.IsNullOrEmpty(parameters))
            {
                function.InputParameters = ExtractParameters(parameters).ToArray();
            }
            
            return function;
        }

        public ContractABI ExtractContractABIWithLineBreakSplitSignatures(string signatures)
        {
            return ExtractContractABI(signatures.Split(new string[] { "\r\n", "\r", "\n" }, StringSplitOptions.None));
        }
       
        public ContractABI ExtractContractABI(params string[] signatures)
        {
            var contractABI = new ContractABI();
            var functions = new List<FunctionABI>();
            var events = new List<EventABI>();
            var errors = new List<ErrorABI>();
            
            foreach(var signature in signatures)
            {
                
                var match = Regex.Match(signature.Trim(), @"(?<scope>\w*)\s*(?<name>\w*)\s*" + paramsRegPattern);
                var scope = match.Groups["scope"].Value;
                var name = match.Groups["name"].Value;
                var parameters = match.Groups["params"].Value;
 
                if (scope == "function")
                {
                    functions.Add(ExtractFunctionABI(signature.Trim(), name, parameters));
                }

                if (scope == "event")
                {
                    events.Add(ExtractEventABI(signature.Trim(), name, parameters));
                }

                if (scope == "error")
                {
                    errors.Add(ExtractErrorABI(signature.Trim(), name, parameters));
                }

                if (scope == "constructor")
                {
                    contractABI.Constructor = ExtractConstructorABI(signature.Trim(), name, parameters);
                }
            }

            contractABI.Functions = functions.ToArray();
            contractABI.Events = events.ToArray();
            contractABI.Errors = errors.ToArray();
            return contractABI;
        }

       
    }
}