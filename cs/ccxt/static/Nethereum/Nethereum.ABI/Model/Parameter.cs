using System;
using System.Collections.Generic;

namespace Nethereum.ABI.Model
{
    public class Parameter
    {
        public Parameter(string type, string name = null, int order = 1, string internalType = null, string serpentSignature = null)
        {
            Name = name;
            Type = type;
            Order = order;
            InternalType = internalType;
            SerpentSignature = serpentSignature;
            ABIType = ABIType.CreateABIType(type);
        }
      
        public Parameter(string type, int order, string internalType = null) : this(type, null, order, internalType)
        {
        }

        public string Name { get; private set; }
        public string Type { get; private set; }
        public ABIType ABIType { get; private set; }
        public int Order { get; private set; }
        public string InternalType { get; private set;}
        public Type DecodedType { get; set; }
        public bool Indexed { get; set; }
        public string SerpentSignature { get; private set; }

        public string StructTypeName {get; set;}
    }

}