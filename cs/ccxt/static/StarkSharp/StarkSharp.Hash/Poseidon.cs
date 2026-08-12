using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Numerics;
using System.Security.Cryptography;
using System.Text;

namespace ccxt;

public static class StarknetPoseidon
{
    private const int Rate = 2;
    private const int Capacity = 1;
    private const int RoundsFull = 8;
    private const int RoundsPartial = 83;
    private static readonly BigInteger FieldPrime = ParseHex("0800000000000011000000000000000000000000000000000000000000000001");
    private static readonly BigInteger[][] RoundConstants = BuildRoundConstants();
    private static readonly BigInteger[][] Mds = new BigInteger[][]
    {
        new BigInteger[] { Field(3), Field(1), Field(1) },
        new BigInteger[] { Field(1), Field(-1), Field(1) },
        new BigInteger[] { Field(1), Field(1), Field(-2) },
    };

    private static BigInteger Field(BigInteger value)
    {
        var result = value % FieldPrime;
        return result.Sign < 0 ? result + FieldPrime : result;
    }

    private static BigInteger ParseHex(string hex)
    {
        hex = hex.StartsWith("0x", StringComparison.OrdinalIgnoreCase) ? hex[2..] : hex;
        return BigInteger.Parse("00" + hex, NumberStyles.AllowHexSpecifier);
    }

    private static BigInteger ToBigInteger(object value)
    {
        if (value is BigInteger bigInteger)
        {
            return bigInteger;
        }
        var valueString = value.ToString();
        if (valueString.StartsWith("0x", StringComparison.OrdinalIgnoreCase))
        {
            return ParseHex(valueString);
        }
        return BigInteger.Parse(valueString, CultureInfo.InvariantCulture);
    }

    private static BigInteger RoundConstant(string name, int index)
    {
        using var sha256 = SHA256.Create();
        var digest = sha256.ComputeHash(Encoding.UTF8.GetBytes(name + index.ToString(CultureInfo.InvariantCulture)));
        var hex = BitConverter.ToString(digest).Replace("-", "").ToLowerInvariant();
        return Field(ParseHex(hex));
    }

    private static BigInteger[][] BuildRoundConstants()
    {
        var rounds = RoundsFull + RoundsPartial;
        var width = Rate + Capacity;
        var constants = new BigInteger[rounds][];
        for (var i = 0; i < rounds; i++)
        {
            constants[i] = new BigInteger[width];
            for (var j = 0; j < width; j++)
            {
                constants[i][j] = RoundConstant("Hades", width * i + j);
            }
        }
        return constants;
    }

    private static BigInteger Sbox(BigInteger value)
    {
        return BigInteger.ModPow(value, 3, FieldPrime);
    }

    private static BigInteger[] PoseidonRound(BigInteger[] values, bool isFull, int index)
    {
        values = values.Select((value, i) => Field(value + RoundConstants[index][i])).ToArray();
        if (isFull)
        {
            values = values.Select(Sbox).ToArray();
        }
        else
        {
            values[^1] = Sbox(values[^1]);
        }
        var result = new BigInteger[Mds.Length];
        for (var row = 0; row < Mds.Length; row++)
        {
            var acc = BigInteger.Zero;
            for (var i = 0; i < values.Length; i++)
            {
                acc += Mds[row][i] * values[i];
            }
            result[row] = Field(acc);
        }
        return result;
    }

    private static BigInteger[] PoseidonHash(BigInteger[] values)
    {
        var width = Rate + Capacity;
        if (values.Length != width)
        {
            throw new ArgumentException("Poseidon: wrong values length");
        }
        values = values.Select(Field).ToArray();
        var roundIndex = 0;
        var halfRoundsFull = RoundsFull / 2;
        for (var i = 0; i < halfRoundsFull; i++)
        {
            values = PoseidonRound(values, true, roundIndex++);
        }
        for (var i = 0; i < RoundsPartial; i++)
        {
            values = PoseidonRound(values, false, roundIndex++);
        }
        for (var i = 0; i < halfRoundsFull; i++)
        {
            values = PoseidonRound(values, true, roundIndex++);
        }
        return values;
    }

    public static BigInteger HashMany(object values)
    {
        var padded = new List<BigInteger>();
        foreach (var value in (IEnumerable)values)
        {
            padded.Add(ToBigInteger(value));
        }
        padded.Add(BigInteger.One);
        while ((padded.Count % Rate) != 0)
        {
            padded.Add(BigInteger.Zero);
        }
        var state = new BigInteger[Rate + Capacity];
        for (var i = 0; i < padded.Count; i += Rate)
        {
            for (var j = 0; j < Rate; j++)
            {
                state[j] += padded[i + j];
            }
            state = PoseidonHash(state);
        }
        return state[0];
    }
}
