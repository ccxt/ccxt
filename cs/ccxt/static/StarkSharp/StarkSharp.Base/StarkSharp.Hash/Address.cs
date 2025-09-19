using System.Collections.Generic;
using StarkSharp.StarkCurve.Signature;
using System;
using System.Globalization;
using System.Linq;
using System.Numerics;

namespace StarkSharp.StarkSharp.Base.StarkSharp.Hash
{
    public static class Address
    {
        public static string CONTRACT_ADDRESS_PREFIX = "535441524b4e45545f434f4e54524143545f41444452455353";

        // 2**251 - 256
        public static BigInteger L2_ADDRESS_UPPER_BOUND = HexToBigInteger("7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00");

        public static BigInteger ComputeStarknetAddress(string classHash, List<string> constructorCalldata, string salt, string deployerAddress = "0")
        {
            BigInteger constructorCalldataHash = ComputeHashOnElements(constructorCalldata.ToArray());
            BigInteger rawAddress = ComputeHashOnElements(
                new List<string> {
                    CONTRACT_ADDRESS_PREFIX,
                    deployerAddress,
                    salt,
                    classHash,
                    constructorCalldataHash.ToString("X")
                }.ToArray()
            );

            return rawAddress % L2_ADDRESS_UPPER_BOUND;
        }

        public static BigInteger ComputeHashOnElements(string[] data)
        {
            // Convert data strings to big integers using LINQ
            BigInteger[] dataAsBigIntegers = data.Select(d => HexToBigInteger(d)).ToArray();

            // Compute the hash
            return ECDSA.PedersenArrayHash(dataAsBigIntegers);
        }

        public static BigInteger HexToBigInteger(string hex)
        {
            // BigInteger X = BigInteger.Pow(2, 251) + 17 * BigInteger.Pow(2, 192) + 1;
            // BigInteger fieldSize = X * 2;  // The field size is 2X because the range is -X to X - 1.
            try
            {
                var hexNumber = hex.StartsWith("0x") ? hex.Substring(2) : hex; // check if it starts with '0x' and remove it
                // Try to parse the hex string
                if (!BigInteger.TryParse(hexNumber, NumberStyles.AllowHexSpecifier, CultureInfo.InvariantCulture, out BigInteger result))
                {
                    // Console.WriteLine("Error converting hex to BigInteger: Invalid hex string.");
                }
                // Make the BigInteger positive if it's interpreted as negative
                if (result.Sign < 0)
                {
                    result = new BigInteger(result.ToByteArray().Concat(new byte[] { 0 }).ToArray());
                }
                // Ensure the result is within the range -X < result < X
                // if (result >= X)
                // {
                //     result = (result + X) % fieldSize - X;  // Mapping the value to the range -X to X - 1.
                // }
                return result;
            }
            catch (System.Exception e)
            {
                Console.WriteLine("Error converting hex to BigInteger: " + e.Message);
                throw;
            }
        }

        public static string BigIntegerToHex(BigInteger bigInteger)
        {
            // Similar to HexToBigInteger, create BigIntegerToHex in the field of order X.
            BigInteger X = BigInteger.Pow(2, 251) + 17 * BigInteger.Pow(2, 192) + 1;
            BigInteger fieldSize = X * 2;  // The field size is 2X because the range is -X to X - 1.
            // Ensure the result is within the range -X < result < X
            if (bigInteger >= X)
            {
                bigInteger = (bigInteger + X) % fieldSize - X;  // Mapping the value to the range -X to X - 1.
            }
            // Make the BigInteger negative if it's interpreted as positive
            if (bigInteger.Sign > 0)
            {
                bigInteger = new BigInteger(bigInteger.ToByteArray().Concat(new byte[] { 0 }).ToArray());
            }
            // Convert the BigInteger to a hex string
            string hex = bigInteger.ToString("x");
            // Add the '0x' prefix
            return "0x" + hex;
        }
    }
}
