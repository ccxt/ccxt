using System;
using System.Linq;
using System.Numerics;
using Nethereum.ABI.Decoders;
using Nethereum.ABI.Util;

namespace Nethereum.ABI.Encoders
{
    public class IntTypeEncoder : ITypeEncoder
    {
        private readonly IntTypeDecoder intTypeDecoder;
        private readonly bool _signed;
        private readonly uint _size;


        public IntTypeEncoder(bool signed, uint size)
        {
            intTypeDecoder = new IntTypeDecoder();
            _signed = signed;
            _size = size;
        }

        public IntTypeEncoder() : this(false, 256)
        {

        }

        public byte[] Encode(object value)
        {
            return Encode(value, 32);
        }

        public byte[] Encode(object value, uint numberOfBytesArray)
        {
            BigInteger bigInt;

            var stringValue = value as string;

            if (stringValue != null)
                bigInt = intTypeDecoder.Decode<BigInteger>(stringValue);
            else if (value is BigInteger)
                bigInt = (BigInteger)value;
            else if (value.IsNumber())
                bigInt = BigInteger.Parse(value.ToString());
            else if (value is Enum)
                bigInt = (BigInteger)(int)value;
            else
                throw new Exception($"Invalid value for type '{this}'. Value: {value ?? "null"}, ValueType: ({value?.GetType()})");
            return EncodeInt(bigInt, numberOfBytesArray);
        }

        public byte[] EncodePacked(object value)
        {
            return Encode(value, _size / 8);
        }

        public byte[] EncodeInt(int value)
        {
            return EncodeInt(new BigInteger(value));
        }

        public static byte[] EncodeSignedUnsigned256(BigInteger value, uint numberOfBytesArray)
        {
            if (value <= (IntType.MAX_UINT256_VALUE*-1))
            {
                value = 1 + IntType.MAX_UINT256_VALUE + (value);
            }

            //It should always be Big Endian.
            var bytes = BitConverter.IsLittleEndian
                ? value.ToByteArray().Reverse().ToArray()
                : value.ToByteArray();


            if (bytes.Length == 33 && value.Sign > 0)
            {
                if (bytes[0] == 0x00)
                {
                    bytes = bytes.Skip(1).ToArray();
                }
            }
            else
            {
                if(bytes.Length > 32 && value < 0)
                {
                    value = 1 + IntType.MAX_UINT256_VALUE + (value);
                    return EncodeSignedUnsigned256(value, numberOfBytesArray);
                }
                else
                {
                    if(bytes.Length > 32)
                    {
                        throw new OverflowException();
                    }
                }
            }

            var ret = new byte[numberOfBytesArray];

            for (var i = 0; i < ret.Length; i++)
                if (value.Sign < 0)
                    ret[i] = 0xFF;
                else
                    ret[i] = 0;

            Array.Copy(bytes, 0, ret, (int)numberOfBytesArray - bytes.Length, bytes.Length);

            return ret;
        }


        public byte[] EncodeInt(BigInteger value, uint numberOfBytesArray, bool validate = true, bool overflowToDefault = false)
        {
            if (validate)
            {
                ValidateValue(value);
            }
            //It should always be Big Endian.
            var bytes = BitConverter.IsLittleEndian
                ? value.ToByteArray().Reverse().ToArray()
                : value.ToByteArray();

            if (bytes.Length == 33 && !_signed)
            {
                if (bytes[0] == 0x00)
                {
                    bytes = bytes.Skip(1).ToArray();
                }
                else
                {
                    if (overflowToDefault)
                    {
                        var defaultValue  = new byte[numberOfBytesArray];

                        for (var i = 0; i < defaultValue.Length; i++)
                            if (value.Sign < 0)
                                defaultValue[i] = 0xFF;
                            else
                                defaultValue[i] = 0;

                        return defaultValue;
                    }
                    else
                    {
                        throw new ArgumentOutOfRangeException(nameof(value),
                            $"Unsigned SmartContract integer must not exceed maximum value for uint256: {IntType.MAX_UINT256_VALUE.ToString()}. Current value is: {value}");
                    }
                }
            }

            var ret = new byte[numberOfBytesArray];

            for (var i = 0; i < ret.Length; i++)
                if (value.Sign < 0)
                    ret[i] = 0xFF;
                else
                    ret[i] = 0;

            Array.Copy(bytes, 0, ret, (int)numberOfBytesArray - bytes.Length, bytes.Length);

            return ret;
        }

        public byte[] EncodeInt(BigInteger value)
        {
            return EncodeInt(value, 32);
        }


        public void ValidateValue(BigInteger value)
        {
            if (_signed && value > IntType.GetMaxSignedValue(_size)) throw new ArgumentOutOfRangeException(nameof(value),
                $"Signed SmartContract integer must not exceed maximum value for int{_size}: {IntType.GetMaxSignedValue(_size).ToString()}. Current value is: {value}");

            if (_signed && value < IntType.GetMinSignedValue(_size)) throw new ArgumentOutOfRangeException(nameof(value),
                $"Signed SmartContract integer must not be less than the minimum value for int{_size}: {IntType.GetMinSignedValue(_size)}. Current value is: {value}");

            if (!_signed && value > IntType.GetMaxUnSignedValue(_size)) throw new ArgumentOutOfRangeException(nameof(value),
                $"Unsigned SmartContract integer must not exceed maximum value for uint{_size}: {IntType.GetMaxUnSignedValue(_size)}. Current value is: {value}");

            if (!_signed && value < IntType.MIN_UINT_VALUE) throw new ArgumentOutOfRangeException(nameof(value),
                $"Unsigned SmartContract integer must not be less than the minimum value of uint: {IntType.MIN_UINT_VALUE.ToString()}. Current value is: {value}");

        }

        
    }
}