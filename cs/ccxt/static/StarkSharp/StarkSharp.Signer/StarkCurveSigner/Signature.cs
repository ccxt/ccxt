using System;
using System.IO;
using System.Globalization;
using Newtonsoft.Json;
using StarkSharp.StarkCurve.Extensions;
using StarkSharp.StarkCurve.Utils;
using Org.BouncyCastle.Crypto.Digests;
using Org.BouncyCastle.Security;
using BouncyBigInt = Org.BouncyCastle.Math.BigInteger;
using BigInt = System.Numerics.BigInteger;
using System.Collections.Generic;
using System.Linq;
using System.Diagnostics;
using System.Reflection;

namespace StarkSharp.StarkCurve.Signature
{
    public class StarkCurveParameters
    {
        // Map the properties to the JSON fields. Property names must match the JSON field names.
        [JsonProperty("FIELD_PRIME")]
        public BigInt FieldPrime { get; set; }

        [JsonProperty("FIELD_GEN")]
        public BigInt FieldGen { get; set; }

        [JsonProperty("ALPHA")]
        public BigInt Alpha { get; set; }

        [JsonProperty("BETA")]
        public BigInt Beta { get; set; }

        [JsonProperty("EC_ORDER")]
        public BigInt EcOrder { get; set; }

        [JsonProperty("CONSTANT_POINTS")]
        public List<List<BigInt>> ConstantPoints { get; set; }
    }

    public static class ECDSA
    {
        // private const string PedersenHashPointFilename = "StarkSharp\\StarkSharp.Signer\\StarkCurveSigner\\pedersen_params.json"; // Hey, Adjust according to your File Directory
        // private const string PedersenHashPointFilename = "pedersen_params.json"; // Hey, Adjust according to your File Directory
        // private static string PedersenHashPointFilename = Path.Combine(Directory.GetCurrentDirectory(), "StarkSharp/StarkSharp.Signer/StarkCurveSigner/pedersen_params.json"); // Hey, Adjust according to your File Directory
        // private static string PedersenHashPointFilename = "./pedersen_params.json"; // Hey, Adjust according to your File Directory

        // private static string relativePath = Assembly.GetExecutingAssembly().Location;

        // Combine the relative path with the current directory path
        private static string fullPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "static", "StarkSharp/StarkSharp.Signer/StarkCurveSigner/pedersen_params.json");
        private static readonly StarkCurveParameters PedersenParams = JsonConvert.DeserializeObject<StarkCurveParameters>(File.ReadAllText(fullPath));

        // Field parameters.
        public static readonly BigInt FieldPrime = PedersenParams.FieldPrime;
        public static readonly BigInt FieldGen = PedersenParams.FieldGen;
        public static readonly BigInt Alpha = PedersenParams.Alpha;
        public static readonly BigInt Beta = PedersenParams.Beta;
        public static readonly BigInt EcOrder = PedersenParams.EcOrder;
        public static readonly List<List<BigInt>> ConstantPoints = PedersenParams.ConstantPoints;
        public static MathUtils.ECPoint ShiftPoint => new MathUtils.ECPoint(
            PedersenParams.ConstantPoints[0][0],
            PedersenParams.ConstantPoints[0][1]
        );

        public static MathUtils.ECPoint EcGen => new MathUtils.ECPoint(
            PedersenParams.ConstantPoints[1][0],
            PedersenParams.ConstantPoints[1][1]
        );
        public static MathUtils.ECPoint MinusShiftPoint => new MathUtils.ECPoint(
            ShiftPoint.X,
            FieldPrime - ShiftPoint.Y
        );
        public static readonly int NElementBitsEcdsa = 251;
        // public static readonly int NElementBitsHash = (int)FieldPrime.GetBitLength();
        public static readonly int NElementBitsHash = 252;

        static ECDSA()
        {
            VerifyParameters();
        }

        public static void VerifyParameters()
        {
            // Calculate the number of bits in FIELD_PRIME.
            int nElementBitsEcdsa = (int)Math.Floor(BigInt.Log(FieldPrime, 2));

            Debug.Assert(nElementBitsEcdsa == 251, "nElementBitsEcdsa must be 251 bits.");

            // Calculate the bit length of FIELD_PRIME for hash operations.
            // TODOL check whether it's 251 or 252
            // int nElementBitsHash = (int)FieldPrime.GetBitLength();
            // Debug.Assert(nElementBitsHash == 252, "nElementBitsHash must be 252 bits.");

            // Assert the EC order conditions.
            Debug.Assert(BigInt.Pow(2, nElementBitsEcdsa) < EcOrder && EcOrder < FieldPrime,
                         "EC order must be greater than 2^nElementBitsEcdsa and less than FIELD_PRIME.");

            var expectedShiftPoint = new MathUtils.ECPoint(
                BigInt.Parse("49EE3EBA8C1600700EE1B87EB599F16716B0B1022947733551FDE4050CA6804", NumberStyles.AllowHexSpecifier),
                BigInt.Parse("3CA0CFE4B3BC6DDF346D49D06EA0ED34E621062C0E056C1D0405D266E10268A", NumberStyles.AllowHexSpecifier));

            var expectedEcGen = new MathUtils.ECPoint(
                BigInt.Parse("1EF15C18599971B7BECED415A40F0C7DEACFD9B0D1819E03D723D8BC943CFCA", NumberStyles.AllowHexSpecifier),
                BigInt.Parse("5668060AA49730B7BE4801DF46EC62DE53ECD11ABE43A32873000C36E8DC1F", NumberStyles.AllowHexSpecifier));

            // Assertions to ensure the points are what we expect.
            Debug.Assert(ShiftPoint.X == expectedShiftPoint.X && ShiftPoint.Y == expectedShiftPoint.Y,
                         "SHIFT_POINT is not as expected.");
            Debug.Assert(EcGen.X == expectedEcGen.X && EcGen.Y == expectedEcGen.Y,
                         "EC_GEN is not as expected.");
        }

        public class ECSignature
        {
            public BigInt R { get; }
            public BigInt S { get; }

            public ECSignature(BigInt r, BigInt s)
            {
                R = r;
                S = s;
            }
        }

        /**
            Given the x coordinate of a stark_key, returns a possible y coordinate such that together the
            point (x,y) is on the curve.
            Note that the real y coordinate is either y or -y.
            If x is invalid stark_key it throws an error.
        **/
        // (ref: https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/crypto/signature/signature.py#L84)
        public static BigInt GetYCoordinate(BigInt starkKeyXCoordinate)
        {
            var x = starkKeyXCoordinate;
            var ySquared = (BigInt.ModPow(x, 3, FieldPrime) + Alpha * x + Beta) % FieldPrime;

            if (!MathUtils.IsQuadResidue(ySquared, FieldPrime))
            {
                throw new Errors.InvalidPublicKeyError();
            }
            return MathUtils.SqrtMod(ySquared, FieldPrime);
        }

        // Returns a private key in the range [1, EC_ORDER).
        // (ref: https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/crypto/signature/signature.py#L99)
        public static BigInt GetRandomPrivateKey()
        {
            SecureRandom secureRandom = new SecureRandom();
            BouncyBigInt privateKey;
            // Calculate the number of bits in EcOrder.
            int bitLength = (int)Math.Ceiling(BigInt.Log(EcOrder, 2));

            // This loop is to ensure that 0 < privateKey < EcOrder.
            // A private key of '0' or one equal to 'EcOrder' is invalid.
            do
            {
                privateKey = new BouncyBigInt(bitLength, secureRandom);
            } while (privateKey.CompareTo(BouncyBigInt.Zero) <= 0 || privateKey.CompareTo(EcOrder) >= 0);

            return new BigInt(privateKey.ToByteArrayUnsigned());
        }

        // Seed generation
        // (ref: https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/crypto/signature/signature.py#L263)
        public static BigInt GrindKey(BouncyBigInt seed)
        {
            BouncyBigInt shamask = new BouncyBigInt(BigInt.Pow(2, 256).ToString());
            BouncyBigInt order = new BouncyBigInt(EcOrder.ToString());
            BouncyBigInt limit = shamask.Subtract(shamask.Mod(order));
            byte[] seedByte = seed.ToByteArrayUnsigned();
            byte[] msg = new byte[33];
            Sha256Digest sha256 = new Sha256Digest();
            byte[] result = new byte[sha256.GetDigestSize()];
            for (int i = 0; i < 100000; i++) {
                BigInt bi = new BigInt(i);
                seedByte.CopyTo(msg, 0);
                bi.ToByteArray().CopyTo(msg, seedByte.Length);
                sha256.BlockUpdate(msg, 0, msg.Length);
                sha256.DoFinal(result, 0);

                BouncyBigInt key = new BouncyBigInt(1, result);
                if (key.CompareTo(limit) < 0) {
                    key = key.Mod(order);
                    // require to append one zero for positive value
                    // byte[] keyByte = key.ToByteArrayUnsigned();
                    // Array.Reverse(keyByte);
                    // return new BigInt(keyByte);
                    return BigInt.Parse(key.ToString());
                }
            }

            throw new InvalidOperationException("GrindKey is broken: tried 100k vals");
        }

        // Generate private key from ethereum signature
        // (ref: https://github.com/paulmillr/scure-starknet/blob/main/index.ts#L143)
        public static BigInt EthSigToPrivate(string sigHex)
        {
            sigHex = sigHex.Replace("0x", "");
            if (sigHex.Length != 130)
                throw new ArgumentException("Wrong ethereum signature");

            BouncyBigInt seed = new BouncyBigInt(sigHex.Substring(0, 64), 16);
            return GrindKey(seed);
        }

        // Obtain public key coordinates from stark curve given the private key
        // (ref: https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/crypto/signature/signature.py#L104)
        public static MathUtils.ECPoint PrivateKeyToECPointOnStarkCurve(BigInt privKey)
        {
            if (privKey <= 0 || privKey >= EcOrder)
                throw new ArgumentOutOfRangeException(nameof(privKey), "Private key must be in the range (0, EC_ORDER).");

            return MathUtils.ECMult(privKey, EcGen, Alpha, FieldPrime);
        }

        // (ref: https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/crypto/signature/signature.py#L109)
        public static BigInt PrivateToStarkKey(BigInt privKey)
        {
            return PrivateKeyToECPointOnStarkCurve(privKey).X;
        }

        // (ref: https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/crypto/signature/signature.py#L113)
        public static BigInt InvModCurveSize(BigInt x)
        {
            return MathUtils.DivMod(1, x, EcOrder);
        }

        // TODO: Fix back and forth conversion of BigInt and BouncyBigInt
        // (ref: https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/crypto/signature/signature.py#L117)
        public static BigInt GenerateKRFC6979(BigInt msgHash, BigInt privKey, BigInt? seed = null)
        {
            // Convert to BouncyCastle's BigInteger type.
            var bcPrivKey = new BouncyBigInt(privKey.ToString());
            var bcEcOrder = new BouncyBigInt(EcOrder.ToString());
            var bcMsgHash = new BouncyBigInt(msgHash.ToString());

            // Prepare message hash
            byte[] preparedMsgHash = PrepareMessageHash(bcMsgHash);

            // Prepare the signer with the new SeededHMacDsaKCalculator
            var signer = new SeededHMacDsaKCalculator(new Sha256Digest());

            // If a seed is provided, convert it to a byte array and set it as extra entropy
            if (seed.HasValue)
            {
                if (seed.Value < 0)
                {
                    throw new ArgumentOutOfRangeException("seed must be non-negative");
                }

                var seedBytes = seed.Value.ToByteArray();

                // Ensure big-endian byte order
                if (BitConverter.IsLittleEndian)
                {
                    Array.Reverse(seedBytes);
                }

                // Remove potential extra zero byte
                if (seedBytes.Length > 1 && seedBytes[0] == 0)
                {
                    seedBytes = seedBytes.Skip(1).ToArray();
                }

                signer.SetExtraEntropy(seedBytes); // Set the seed bytes as extra entropy
            }

            // Initialize with private key's value modulo EcOrder.
            signer.Init(bcEcOrder, bcPrivKey, preparedMsgHash);

            // Generate and return the 'k' value
            var nextK = signer.NextK();

            // Convert to a byte array (unsigned)
            var unsignedBytes = nextK.ToByteArrayUnsigned();

            return BigIntergerExtensions.UnsignedByesToBigInt(unsignedBytes);
        }

        private static byte[] PrepareMessageHash(BouncyBigInt msgHash)
        {
            if (1 <= msgHash.BitLength % 8 && msgHash.BitLength % 8 <= 4 && msgHash.BitLength >= 248)
            {
                msgHash = msgHash.ShiftLeft(4);
            }

            // Convert the message hash to a byte array
            byte[] msgHashBytes = msgHash.ToByteArray();
            return msgHashBytes;
        }

        // (ref: https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/crypto/signature/signature.py#L137)
        public static ECSignature Sign(BigInt msgHash, BigInt privKey, BigInt? seed = null)
        {
            EnsureMessageIsSignable(msgHash);

            while (true)
            {
                var k = GenerateKRFC6979(msgHash, privKey, seed);
                seed = seed.HasValue ? seed + 1 : new BigInt(1); // Update seed for next iteration in case the value of k is bad.

                BigInt r = CalculateR(k);
                if (IsInvalidValue(r)) continue;

                BigInt temp = CalculateTemp(msgHash, r, privKey);
                if (temp == 0) continue; // Bad value. This fails with negligible probability.

                BigInt s = CalculateS(k, temp);
                if (IsInvalidValue(s)) continue;

                return new ECSignature(r, s);
            }
        }

        private static void EnsureMessageIsSignable(BigInt msgHash)
        {
            if (msgHash < 0 || msgHash >= BigInt.Pow(2, NElementBitsEcdsa))
                throw new ArgumentException("Message not signable.");
        }

        private static BigInt CalculateR(BigInt k)
        {
            return new BigInt((MathUtils.ECMult(k, EcGen, Alpha, FieldPrime)).X.ToByteArray());
        }

        private static BigInt CalculateTemp(BigInt msgHash, BigInt r, BigInt privKey)
        {
            return (msgHash + r * privKey) % EcOrder;
        }

        private static BigInt CalculateS(BigInt k, BigInt temp)
        {
            var w = MathUtils.DivMod(k, temp, EcOrder);
            return InvModCurveSize(w);
        }

        private static bool IsInvalidValue(BigInt value)
        {
            return value <= 0 || value >= BigInt.Pow(2, NElementBitsEcdsa);
        }

        public static MathUtils.ECPoint MimicEcMultAir(BigInt m, MathUtils.ECPoint point, MathUtils.ECPoint shiftPoint)
        {
            EnsureValidScalar(m);

            MathUtils.ECPoint result = shiftPoint;
            for (int i = 0; i < NElementBitsEcdsa; i++)
            {
                PreventInvalidOperation(result, point);

                if (IsBitSet(m, 0))
                    result = MathUtils.ECAdd(result, point, FieldPrime);

                point = MathUtils.ECDouble(point, Alpha, FieldPrime);
                m >>= 1;
            }

            EnsureAllBitsProcessed(m);

            return result;
        }

        private static void EnsureValidScalar(BigInt m)
        {
            if (m <= 0 || m >= BigInt.Pow(2, NElementBitsEcdsa))
                throw new ArgumentException("Invalid 'm' value");
        }

        private static void PreventInvalidOperation(MathUtils.ECPoint partialSum, MathUtils.ECPoint point)
        {
            if (partialSum.X == point.X)
                throw new InvalidOperationException("Invalid operation");
        }

        private static bool IsBitSet(BigInt value, int position)
        {
            return (value & (1 << position)) != 0;
        }

        private static void EnsureAllBitsProcessed(BigInt m)
        {
            if (m != 0)
                throw new InvalidOperationException("Invalid operation");
        }

        public static bool IsPointOnCurve(BigInt x, BigInt y)
        {
            BigInt leftSide = BigInt.ModPow(y, 2, FieldPrime);
            BigInt rightSide = (BigInt.ModPow(x, 3, FieldPrime) + Alpha * x + Beta) % FieldPrime;
            return leftSide == rightSide;
        }

        public static bool IsValidStarkPrivateKey(BigInt privateKey)
        {
            return privateKey > 0 && privateKey < EcOrder;
        }

        public static bool IsValidStarkKey(BigInt starkKey)
        {
            try
            {
                GetYCoordinate(starkKey);
                return true;
            }
            catch (InvalidOperationException)
            {
                return false;
            }
        }

        public static bool Verify(BigInt msgHash, BigInt r, BigInt s, object publicKey)
        {
            if (!(publicKey is BigInt) && !(publicKey is MathUtils.ECPoint))
                throw new ArgumentException("Invalid public key type");

            if (publicKey is BigInt publicKeyInt)
            {
                try
                {
                    BigInt y = GetYCoordinate(publicKeyInt);
                    return VerifyWithPoint(msgHash, r, s, new MathUtils.ECPoint(publicKeyInt, y)) ||
                           VerifyWithPoint(msgHash, r, s, new MathUtils.ECPoint(publicKeyInt, (-y) % FieldPrime));
                }
                catch
                {
                    return false;
                }
            }
            else
            {
                return VerifyWithPoint(msgHash, r, s, (MathUtils.ECPoint)publicKey);
            }
        }

        private static bool VerifyWithPoint(BigInt msgHash, BigInt r, BigInt s, MathUtils.ECPoint publicKeyPoint)
        {
            // Ensure the public key point is on the curve
            if (!IsPointOnCurve(publicKeyPoint.X, publicKeyPoint.Y))
                throw new ArgumentException("Public key is not on the curve");

            // Signature validation
            try
            {
                MathUtils.ECPoint zG = MimicEcMultAir(msgHash, EcGen, MinusShiftPoint);
                MathUtils.ECPoint rQ = MimicEcMultAir(r, publicKeyPoint, ShiftPoint);
                MathUtils.ECPoint wB = MimicEcMultAir(s, MathUtils.ECAdd(zG, rQ, FieldPrime), ShiftPoint);
                BigInt x = MathUtils.ECAdd(wB, MinusShiftPoint, FieldPrime).X;

                // Comparison without mod n, differing from classic ECDSA
                return r == x;
            }
            catch (Exception)
            {
                // Catch any assertion errors from the computations
                return false;
            }
        }

        public static BigInt PedersenHash(params BigInt[] elements)
        {
            return PedersenHashAsPoint(elements).X;
        }

        public static MathUtils.ECPoint PedersenHashAsPoint(params BigInt[] elements)
        {
            MathUtils.ECPoint point = ShiftPoint;

            for (int i = 0; i < elements.Length; i++)
            {
                BigInt x = elements[i];
                if (x < 0 || x >= FieldPrime)
                    throw new ArgumentException("Element out of bounds", nameof(elements));

                List<List<BigInt>> pointList = ConstantPoints.GetRange(2 + i * NElementBitsHash, NElementBitsHash);

                if (pointList.Count != NElementBitsHash)
                    throw new InvalidOperationException("Invalid point list size");

                foreach (List<BigInt> pt in pointList)
                {
                    if (point.X == pt[0])
                        throw new InvalidOperationException("Unhashable input due to point collision");

                    MathUtils.ECPoint ecPt = new MathUtils.ECPoint(pt[0], pt[1]);
                    if ((x & 1) != 0)
                    {
                        point = MathUtils.ECAdd(point, ecPt, FieldPrime);
                    }
                    x >>= 1;
                }

                if (x != 0)
                    throw new InvalidOperationException("Non-zero value after processing bits");
            }

            return point;
        }

        public static BigInt PedersenArrayHash(params BigInt[] elements)
        {
            BigInt[] nElements = new BigInt[elements.Length + 1];
            Array.Copy(elements, nElements, elements.Length);
            nElements[nElements.Length - 1] = new BigInt(elements.Length);
            return nElements.Aggregate(new BigInt(0), (x, y) => PedersenHashAsPoint(x, y).X);
        }

    }
}