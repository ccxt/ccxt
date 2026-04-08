namespace Nethereum.ABI
{
    public class ABIValue
    {
        public ABIValue(ABIType abiType, object value)
        {
            ABIType = abiType;
            Value = value;
        }

        public ABIValue(string abiType, object value)
        {
            ABIType = ABIType.CreateABIType(abiType);
            Value = value;
        }

        public ABIType ABIType { get; set; }
        public object Value { get; set; }
    }
}