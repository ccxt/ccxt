using System;

namespace Nethereum.ABI
{
    public abstract class ArrayType : ABIType
    {
        public ABIType ElementType { get; set; }

        protected ArrayType(string name) : base(name)
        {
            InitialiseElementType(name);
        }

        public new static ArrayType CreateABIType(string typeName)
        {
            var indexFirstBracket = typeName.LastIndexOf("[", StringComparison.Ordinal);
            var indexSecondBracket = typeName.IndexOf("]", indexFirstBracket, StringComparison.Ordinal);

            if (indexFirstBracket + 1 == indexSecondBracket)
                return new DynamicArrayType(typeName);
            return new StaticArrayType(typeName);
        }

        private void InitialiseElementType(string name)
        {
            var indexLastBracket = name.LastIndexOf("[", StringComparison.Ordinal);
            var elementTypeName = name.Substring(0, indexLastBracket);
            //var indexSecondBracket = name.IndexOf("]", indexFirstBracket, StringComparison.Ordinal);

            //var subDim = indexSecondBracket + 1 == name.Length ? "" : name.Substring(indexSecondBracket + 1);
            ElementType = ABIType.CreateABIType(elementTypeName);
        }
    }
}