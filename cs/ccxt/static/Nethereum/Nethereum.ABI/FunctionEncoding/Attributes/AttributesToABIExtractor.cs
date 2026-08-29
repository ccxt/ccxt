using System;
using System.Collections.Generic;
using System.Reflection;
using Nethereum.ABI.Decoders;
using Nethereum.ABI.Model;

namespace Nethereum.ABI.FunctionEncoding.Attributes
{
    public class AttributesToABIExtractor
    {
        public ContractABI ExtractContractABI(params Type[] contractMessagesTypes)
        {
            var contractABI = new ContractABI();
            var functions = new List<FunctionABI>();
            var events = new List<EventABI>();
            var errors = new List<ErrorABI>();

            foreach (var contractMessageType in contractMessagesTypes)
            {
                if (FunctionAttribute.IsFunctionType(contractMessageType))
                {
                    functions.Add(ExtractFunctionABI(contractMessageType));
                }

                if (EventAttribute.IsEventType(contractMessageType))
                {
                    events.Add(ExtractEventABI(contractMessageType));
                }

                if (ErrorAttribute.IsErrorType(contractMessageType))
                {
                    errors.Add(ExtractErrorABI(contractMessageType));
                }
            }

            contractABI.Functions = functions.ToArray();
            contractABI.Events = events.ToArray();
            contractABI.Errors = errors.ToArray();
            return contractABI;
        }

        public ErrorABI ExtractErrorABI(Type contractMessageType)
        {
            if (ErrorAttribute.IsErrorType(contractMessageType))
            {
                var errorAttribute = ErrorAttribute.GetAttribute(contractMessageType);
                var errorABI = new ErrorABI(errorAttribute.Name);
                errorABI.InputParameters = ExtractParametersFromAttributes(contractMessageType);
                return errorABI;
            }
            return null;
        }

        public FunctionABI ExtractFunctionABI(Type contractMessageType)
        {
            if (FunctionAttribute.IsFunctionType(contractMessageType))
            {
                var functionAttribute = FunctionAttribute.GetAttribute(contractMessageType);
                var functionABI = new FunctionABI(functionAttribute.Name, false);
                functionABI.InputParameters = ExtractParametersFromAttributes(contractMessageType);

                if (functionAttribute.DTOReturnType != null)
                {
                    functionABI.OutputParameters = ExtractParametersFromAttributes(functionAttribute.DTOReturnType);
                }
                else if (functionAttribute.ReturnType != null)
                {
                    var parameter = new Parameter(functionAttribute.ReturnType);
                    functionABI.OutputParameters = new Parameter[] { parameter };
                }
                return functionABI;
            }
            return null;
        }

        public EventABI ExtractEventABI(Type contractMessageType)
        {
            if (EventAttribute.IsEventType(contractMessageType))
            {
                var eventAttribute = EventAttribute.GetAttribute(contractMessageType);
                var eventABI = new EventABI(eventAttribute.Name, eventAttribute.IsAnonymous);
                eventABI.InputParameters = ExtractParametersFromAttributes(contractMessageType);
                return eventABI;
            }
            return null;
        }

        public Parameter[] ExtractParametersFromAttributes(Type contractMessageType)
        {
            var properties = PropertiesExtractor.GetPropertiesWithParameterAttribute(contractMessageType);
            var parameters = new List<Parameter>();

            foreach (var property in properties)
            {
                var parameterAttribute = property.GetCustomAttribute<ParameterAttribute>(true);
                
                InitTupleComponentsFromTypeAttributes(property.PropertyType, parameterAttribute.Parameter.ABIType);
                
                parameters.Add(parameterAttribute.Parameter);   
            }
            return parameters.ToArray();
        }


        public void InitTupleComponentsFromTypeAttributes(Type type, ABIType abiType)
        {
            if (abiType is TupleType abiTupleType)
            {
                var properties = PropertiesExtractor.GetPropertiesWithParameterAttribute(type);
                var parameters = new List<Parameter>();
                var parameterObjects = new List<Parameter>();

                foreach (var property in properties)
                {
                    var parameterAttribute = property.GetCustomAttribute<ParameterAttribute>(true);
                    parameterAttribute.Parameter.DecodedType = property.PropertyType;
                    InitTupleComponentsFromTypeAttributes(property.PropertyType, parameterAttribute.Parameter.ABIType);
 
                    parameterObjects.Add(parameterAttribute.Parameter);
                }
                abiTupleType.SetComponents(parameterObjects.ToArray());
            }

            var abiArrayType = abiType as ArrayType;

            while (abiArrayType != null)
            {
                var arrayListType = ArrayTypeDecoder.GetIListElementType(type);
                if(arrayListType == null) throw new Exception("Only types that implement IList<T> are supported for encoding");

                if (abiArrayType.ElementType is TupleType arrayTupleType)
                {
                    InitTupleComponentsFromTypeAttributes(arrayListType, arrayTupleType);
                    abiArrayType = null;
                }
                else
                {
                    abiArrayType = abiArrayType.ElementType as ArrayType;
                }
            }
        }
    }
}
