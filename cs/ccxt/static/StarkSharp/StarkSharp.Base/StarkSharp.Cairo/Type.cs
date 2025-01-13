
using System.Collections.Generic;


namespace StarkSharp.Base.Cairo
{
    public abstract class CairoType { }
    public class FeltType : CairoType { }
    public class BoolType : CairoType { }
    public class TupleType : CairoType
    {
        public List<CairoType> Types { get; set; }
    }

    public class NamedTupleType : CairoType
    {
        public Dictionary<string, CairoType> Types { get; set; }
    }

    public class ArrayType : CairoType
    {
        public CairoType InnerType { get; set; }
    }

    public class StructType : CairoType
    {
        public string Name { get; set; }
        public Dictionary<string, CairoType> Types { get; set; }
    }
    public class EnumType : CairoType
    {
        public string Name { get; set; }
        public Dictionary<string, CairoType> Variants { get; set; }
    }
    public class OptionType : CairoType
    {
        public CairoType Type { get; set; }
    }
    public class UintType : CairoType
    {
        public int Bits { get; set; }

        public void CheckRange(int value)
        {
        }
    }

    public class TypeIdentifier : CairoType
    {
        public string Name { get; set; }
    }
    public class UnitType : CairoType { }
    public class EventType : CairoType
    {
        public string Name { get; set; }
        public Dictionary<string, CairoType> Types { get; set; }
    }
}
