using System;
using System.Collections.Generic;
using System.Linq;

namespace StarknetSharp.Abi
{
    public class AbiDict
    {
        public AbiDict(List<AbiDictEntry> entries)
        {
            Entries = entries;
        }

        public List<AbiDictEntry> Entries { get; set; }
    }

    public abstract class AbiDictEntry
    {
        public string Type { get; set; }
    }

    public class FunctionDict : AbiDictEntry
    {
        public string Name { get; set; }
        public List<ParameterDict> Inputs { get; set; }
        public List<ParameterDict> Outputs { get; set; }
        public StateMutability? StateMutability { get; set; }
    }

    public abstract class ParameterDict
    {
        public string Name { get; set; }
        public string Type { get; set; }
    }

    public class StructMemberDict : ParameterDict
    {
        public int? Offset { get; set; }
    }

    public class StructDict : AbiDictEntry
    {
        public string Name { get; set; }
        public int Size { get; set; }
        public List<StructMemberDict> Members { get; set; }
    }

    public enum StateMutability
    {
        View,
        NonView
    }
}