using System;
using System.Linq;
using System.Numerics;
using Nethereum.Util;


namespace StarkSharp.Rpc.Utils
{
    public static class StarknetOps
    {
        // Compute the Starknet Keccak hash for a string
        private static readonly BigInteger MASK_250 = BigInteger.Pow(2, 250);

        public static BigInteger ComputeStarknetKeccak(string value)
        {
            try
            {
                string processedValue = ProcessHexValue(value);
                byte[] processedBytes = ConvertHexStringToBytes(processedValue);
                processedBytes = EnsureHighOrderBitIsNotSet(processedBytes);

                BigInteger hash = new BigInteger(processedBytes);
                return hash % MASK_250;
            }
            catch (Exception ex)
            {

                // LogError(ex);

                throw new InvalidOperationException("Failed to compute Starknet Keccak hash.", ex);
            }
        }
        // Remove '0x' prefix from a string
        public static string RemoveHexPrefix(string hexValue)
        {
            const string hexPrefix = "0x";
            if (hexValue.StartsWith(hexPrefix, StringComparison.OrdinalIgnoreCase))
            {
                return hexValue.Substring(hexPrefix.Length);
            }
            return hexValue;
        }

        // Append '0x' prefix to a string
        public static string PrefixHex(string hex)
        {
            return "0x" + RemoveHexPrefix(hex);
        }
        private static string ConvertToHexString(string number) => BigInteger.Parse(number).ToString("x");

        // Hash a BigInteger with Keccak
        public static string HashBnWithKeccak(BigInteger value)
        {
            string strippedHex = RemoveHexPrefix(NumericOps.BigIntToHexFormat(value));
            string evenHex = strippedHex.Length % 2 == 0 ? strippedHex : "0" + strippedHex;
            return PrefixHex(NumericOps.TransformHexToDecimalStr(new Sha3Keccack().CalculateHashFromHex(evenHex)));
        }

        // Hash a string with Keccak
        public static string HashStringWithKeccak(string input)
        {
            try
            {
                byte[] inputBytes = ConvertToUTF8Bytes(input);
                byte[] hashedBytes = ComputeKeccakHash(inputBytes);
                return AddHexPrefix(NumericOps.ByteArrayToHexPresentation(hashedBytes));
            }
            catch (Exception ex)
            {

                // LogError(ex);

                throw new InvalidOperationException("Failed to hash string with Keccak.", ex);
            }
        }
        private static byte[] ConvertToUTF8Bytes(string value)
        {
            return System.Text.Encoding.UTF8.GetBytes(value);
        }
        private static byte[] ComputeKeccakHash(byte[] inputBytes)
        {
            Sha3Keccack sha3 = new Sha3Keccack();
            return sha3.CalculateHash(inputBytes);
        }
        private static string AddHexPrefix(string hex)
        {
            return hex.StartsWith("0x", StringComparison.OrdinalIgnoreCase) ? hex : "0x" + hex;
        }
        private static string ProcessHexValue(string value)
        {
            string strippedValue = RemoveHexPrefix(HashStringWithKeccak(value));
            return strippedValue.Length <= 64 ? strippedValue : strippedValue.Substring(strippedValue.Length - 64);
        }

        private static byte[] ConvertHexStringToBytes(string hexString)
        {
            return Enumerable.Range(0, hexString.Length / 2)
                             .Select(x => Convert.ToByte(hexString.Substring(x * 2, 2), 16))
                             .Reverse()
                             .ToArray();
        }

        private static byte[] EnsureHighOrderBitIsNotSet(byte[] bytes)
        {
            if ((bytes[bytes.Length - 1] & 0x80) > 0)
            {
                Array.Resize(ref bytes, bytes.Length + 1);
            }
            return bytes;
        }

        // Extract the selector from a function's name
        public static string CalculateFunctionSelector(string functionIdentifier)
        {
            try
            {
                return NumericOps.BigIntToHexFormat(ComputeStarknetKeccak(functionIdentifier));
            }
            catch (Exception ex)
            {
                return $"An error occurred: {ex.Message}";
            }
        }

        // Determine the selector based on input
        public static string DetermineSelector(string input)
        {
            switch (true)
            {
                case bool _ when NumericOps.IsHexFormatValid(input):
                    return input;

                case bool _ when NumericOps.IsPureNumber(input):
                    return ConvertToHexString(input);

                default:
                    return CalculateFunctionSelector(input);
            }
        }

        public static string EncodeShortString(string data)
        {
            if (data.Length > 31) {
                throw new InvalidOperationException("Shortstring cannot be longer than 31 characters.");
            }
            // TODO: verify whether the shortstring is in vm range
            return NumericOps.ByteArrayToHexPresentation(ConvertToUTF8Bytes(data));
        }
    }
}

