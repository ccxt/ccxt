using System;
using System.Collections.Generic;
using System.Linq;

namespace StarknetSharp.Abi
{
    public class ContractAbiEntrySchema
    {
        public ContractAbiEntrySchema(AbiComponentSchema schema)
        {
            Schema = schema;
        }

        public AbiComponentSchema Schema { get; set; }
    }

    public abstract class AbiComponentSchema
    {
        public string Type { get; set; }
    }

    public class FunctionAbiEntrySchema : AbiComponentSchema
    {
        public string Name { get; set; }
        public List<ParameterSchema> Inputs { get; set; }
        public List<ParameterSchema> Outputs { get; set; }
    }

    public abstract class ParameterSchema
    {
        public string Name { get; set; }
        public string Type { get; set; }
    }

    public class StructMemberSchema : ParameterSchema
    {
        public int Offset { get; set; }
    }
}