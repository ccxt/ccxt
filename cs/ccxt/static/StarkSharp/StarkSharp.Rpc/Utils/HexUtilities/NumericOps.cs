using System;
using System.Numerics;
using System.Text.RegularExpressions;

namespace StarkSharp.Rpc.Utils
{
    public class NumericOps
    {
        public static BigInteger StringToBigInt(string inputValue)
        {
            try
            {
                return BigInteger.Parse(inputValue);
            }
            catch (FormatException fe)
            {
                throw new ArgumentException("The provided string cannot be converted to BigInteger.", fe);
            }
        }

        public static bool IsOfBigIntegerType(object testObject)
        {
            return testObject is BigInteger;
        }

        public static string BigIntToHexFormat(BigInteger value)
        {
            return ComposeHex(value.ToString("x"));
        }

        public static string StringNumberToHexRepresentation(string numStr)
        {
            BigInteger value = StringToBigInt(numStr);
            return BigIntToHexFormat(value);
        }

        public static string ByteArrayToHexPresentation(byte[] dataArray)
        {
            return ComposeHex(BitConverter.ToString(dataArray).Replace("-", "").ToLowerInvariant());
        }

        public static bool IsPureNumber(string checkStr)
        {
            return Regex.IsMatch(checkStr, @"^\d+$");
        }

        public static bool IsHexFormatValid(string potentialHex)
        {
            return Regex.IsMatch(potentialHex, @"^0x[0-9a-fA-F]+$");
        }

        public static string TransformHexToDecimalStr(string hexVal)
        {
            VerifyHexCorrectness(hexVal);
            return StringToBigInt(hexVal).ToString();
        }

        private static string ComposeHex(string baseHex)
        {
            return $"0x{baseHex}";
        }

        private static void VerifyHexCorrectness(string potentialHex)
        {
            if (!IsHexFormatValid(potentialHex))
            {
                throw new InvalidOperationException("The provided string doesn't represent a valid hexadecimal format.");
            }
        }
    }
}
