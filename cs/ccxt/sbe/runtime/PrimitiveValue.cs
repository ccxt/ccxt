using System;
using System.Linq;
using System.Text;

namespace Org.SbeTool.Sbe.Dll
{
    /// <summary>
    ///     Class used to encapsulate values for primitives. Used for nullValue, minValue, maxValue, and constants
    ///     <p />
    ///     <table>
    ///         <thead>
    ///             <tr>
    ///                 <th>PrimitiveType</th>
    ///                 <th>Null</th>
    ///                 <th>Min</th>
    ///                 <th>Max</th>
    ///             </tr>
    ///         </thead>
    ///         <tbody>
    ///             <tr>
    ///                 <td>char</td>
    ///                 <td>0</td>
    ///                 <td>0x20</td>
    ///                 <td>0x7E</td>
    ///             </tr>
    ///             <tr>
    ///                 <td>int8</td>
    ///                 <td>-128</td>
    ///                 <td>-127</td>
    ///                 <td>127</td>
    ///             </tr>
    ///             <tr>
    ///                 <td>uint8</td>
    ///                 <td>255</td>
    ///                 <td>0</td>
    ///                 <td>254</td>
    ///             </tr>
    ///             <tr>
    ///                 <td>int16</td>
    ///                 <td>-32768</td>
    ///                 <td>-32767</td>
    ///                 <td>32767</td>
    ///             </tr>
    ///             <tr>
    ///                 <td>uint16</td>
    ///                 <td>65535</td>
    ///                 <td>0</td>
    ///                 <td>65534</td>
    ///             </tr>
    ///             <tr>
    ///                 <td>int32</td>
    ///                 <td>2^31</td>
    ///                 <td>-2^31 + 1</td>
    ///                 <td>2^31 - 1</td>
    ///             </tr>
    ///             <tr>
    ///                 <td>uint32</td>
    ///                 <td>2^32 - 1</td>
    ///                 <td>0</td>
    ///                 <td>2^32 - 2</td>
    ///             </tr>
    ///             <tr>
    ///                 <td>int64</td>
    ///                 <td>2^63</td>
    ///                 <td>-2^63 + 1</td>
    ///                 <td>2^63 - 1</td>
    ///             </tr>
    ///             <tr>
    ///                 <td>uint64</td>
    ///                 <td>2^64 - 1</td>
    ///                 <td>0</td>
    ///                 <td>2^64 - 2</td>
    ///             </tr>
    ///         </tbody>
    ///     </table>
    /// </summary>
    public class PrimitiveValue
    {
        private enum Representation
        {
            Long,
            Double,
            ByteArray,
            ULong
        }

        #region CHAR

        /// <summary>
        /// Minimum value for CHAR SBE type
        /// </summary>
        public const long MinValueChar = 0x20;

        /// <summary>
        /// Maximum value for CHAR SBE type
        /// </summary>
        public const long MaxValueChar = 0x7E;

        /// <summary>
        /// Null value for CHAR SBE type
        /// </summary>
        public const long NullValueChar = 0;

        #endregion


        /// <summary>
        /// Minimum value for INT8 SBE type
        /// </summary>
        public const long MinValueInt8 = -127;
        /// <summary>
        /// Maximum value for CHAR SBE type
        /// </summary>
        public const long MaxValueInt8 = 127;
        /// <summary>
        /// Null value for CHAR SBE type
        /// </summary>
        public const long NullValueInt8 = -128;

        /// <summary>
        /// Minimum value for UINT8 SBE type
        /// </summary>
        public const long MinValueUint8 = 0;
        /// <summary>
        /// Maximum value for UINT8 SBE type
        /// </summary>
        public const long MaxValueUint8 = 254;
        /// <summary>
        /// Null value for UINT8 SBE type
        /// </summary>
        public const long NullValueUint8 = 255;

        /// <summary>
        /// Minimum value for INT16 SBE type
        /// </summary>
        public const long MinValueInt16 = -32767;
        /// <summary>
        /// Maximum value for INT16 SBE type
        /// </summary>
        public const long MaxValueInt16 = 32767;
        /// <summary>
        /// Null value for INT16 SBE type
        /// </summary>
        public const long NullValueInt16 = -32768;

        /// <summary>
        /// Minimum value for UINT16 SBE type
        /// </summary>
        public const long MinValueUint16 = 0;
        /// <summary>
        /// Maximum value for UINT16 SBE type
        /// </summary>
        public const long MaxValueUint16 = 65534;
        /// <summary>
        /// Null value for UINT16 SBE type
        /// </summary>
        public const long NullValueUint16 = 65535;

        /// <summary>
        /// Minimum value for INT32 SBE type
        /// </summary>
        public const long MinValueInt32 = -2147483647;
        /// <summary>
        /// Maximum value for INT32 SBE type
        /// </summary>
        public const long MaxValueInt32 = 2147483647;
        /// <summary>
        /// Null value for INT32 SBE type
        /// </summary>
        public const long NullValueInt32 = -2147483648;

        /// <summary>
        /// Minimum value for UINT32 SBE type
        /// </summary>
        public const long MinValueUint32 = 0;
        /// <summary>
        /// Maximum value for UINT32 SBE type
        /// </summary>
        public const long MaxValueUint32 = 4294967293L; // 0xFFFFFFFD
        /// <summary>
        /// Null value for UINT32 SBE type
        /// </summary>
        public const long NullValueUint32 = 4294967294L; // 0xFFFFFFFE

        /// <summary>
        /// Minimum value for INT64 SBE type
        /// </summary>
        public const long MinValueInt64 = long.MinValue + 1; // -2^63 + 1
        /// <summary>
        /// Maximum value for INT64 SBE type
        /// </summary>
        public const long MaxValueInt64 = long.MaxValue; //  2^63 - 1  (SBE spec says -2^63 - 1)
        /// <summary>
        /// Null value for INT64 SBE type
        /// </summary>
        public const long NullValueInt64 = long.MinValue; // -2^63

        /// <summary>
        /// Minimum value for UINT64 SBE type
        /// </summary>
        public const long MinValueUint64 = 0;
        /// <summary>
        /// Maximum value for UINT64 SBE type
        /// </summary>
        public const ulong MaxValueUint64 = ulong.MaxValue - 1;
        /// <summary>
        /// Null value for UINT64 SBE type
        /// </summary>
        public const ulong NullValueUint64 = ulong.MaxValue;

        /// <summary>
        /// Minimum value for FLOAT SBE type
        /// </summary>
        public const float MinValueFloat = float.Epsilon;
        /// <summary>
        /// Maximum value for FLOAT SBE type
        /// </summary>
        public const float MaxValueFloat = float.MaxValue;
        /// <summary>
        /// Null value for FLOAT SBE type
        /// </summary>
        public const float NullValueFloat = float.NaN;

        /// <summary>
        /// Minimum value for DOUBLE SBE type
        /// </summary>
        public const double MinValueDouble = double.Epsilon;
        /// <summary>
        /// Maximum value for DOUBLE SBE type
        /// </summary>
        public const double MaxValueDouble = double.MaxValue;
        /// <summary>
        /// Null value for DOUBLE SBE type
        /// </summary>
        public const double NullValueDouble = double.NaN;

        private readonly byte[] _byteArrayValue;
        private readonly byte[] _byteArrayValueForLong = new byte[1];
        private readonly string _characterEncoding;
        private readonly double _doubleValue;
        private readonly long _longValue;
        private readonly ulong _unsignedLongValue;
        private readonly Representation _representation;
        private readonly int _size;

        /// <summary>
        ///     Construct and fill in value as a long.
        /// </summary>
        /// <param name="value"> in long format </param>
        /// <param name="size"></param>
        public PrimitiveValue(long value, int size)
        {
            _representation = Representation.Long;
            _longValue = value;
            _doubleValue = 0.0;
            _unsignedLongValue = 0;
            _byteArrayValue = null;
            _characterEncoding = null;
            _size = size;
        }

        /// <summary>
        ///     Construct and fill in value as a double.
        /// </summary>
        /// <param name="value"> in double format </param>
        /// <param name="size"></param>
        public PrimitiveValue(double value, int size)
        {
            _representation = Representation.Double;
            _longValue = 0;
            _unsignedLongValue = 0;
            _doubleValue = value;
            _byteArrayValue = null;
            _characterEncoding = null;
            _size = size;
        }

        /// <summary>
        ///     Construct and fill in value as a double.
        /// </summary>
        /// <param name="value"> in double format </param>
        /// <param name="size"></param>
        public PrimitiveValue(ulong value, int size)
        {
            _representation = Representation.ULong;
            _unsignedLongValue = 0;
            _longValue = 0;
            _doubleValue = 0;
            _byteArrayValue = null;
            _characterEncoding = null;
            _size = size;
        }

        /// <summary>
        ///     Construct and fill in value as a byte array.
        /// </summary>
        /// <param name="value"> as a byte array </param>
        /// <param name="characterEncoding"></param>
        /// <param name="size"></param>
        public PrimitiveValue(byte[] value, string characterEncoding, int size)
        {
            _representation = Representation.ByteArray;
            _longValue = 0;
            _doubleValue = 0.0;
            _unsignedLongValue = 0;
            _byteArrayValue = value;
            _characterEncoding = characterEncoding;
            _size = size;
        }

        /// <summary>
        ///     Return size for this PrimitiveValue for serialization purposes.
        /// </summary>
        /// <value>size for serialization</value>
        public int Size
        {
            get { return _size; }
        }

        /// <summary>
        ///     The character encoding of the byte array representation.
        /// </summary>
        /// <value>the character encoding of te byte array representation.</value>
        public string CharacterEncoding
        {
            get { return _characterEncoding; }
        }

        /// <summary>
        ///     Parse constant value string and set representation based on type
        /// </summary>
        /// <param name="value">     expressed as a String </param>
        /// <param name="primitiveType"> that this is supposed to be </param>
        /// <returns> a new <seealso cref="PrimitiveValue" /> for the value. </returns>
        public static PrimitiveValue Parse(string value, PrimitiveType primitiveType)
        {
            switch (primitiveType.Type)
            {
                case SbePrimitiveType.Char:
                    if (value.Length > 1)
                    {
                        throw new ArgumentException("Constant char value malformed: " + value);
                    }
                    return new PrimitiveValue(byte.Parse(value), 1);

                case SbePrimitiveType.Int8:
                    return new PrimitiveValue(Convert.ToSByte(value), 1);

                case SbePrimitiveType.Int16:
                    return new PrimitiveValue(Convert.ToInt16(value), 2);

                case SbePrimitiveType.Int32:
                    return new PrimitiveValue(Convert.ToInt32(value), 4);

                case SbePrimitiveType.Int64:
                    return new PrimitiveValue(Convert.ToInt64(value), 8);

                case SbePrimitiveType.UInt8:
                    return new PrimitiveValue(Convert.ToByte(value), 1);

                case SbePrimitiveType.UInt16:
                    return new PrimitiveValue(Convert.ToUInt16(value), 2);

                case SbePrimitiveType.UInt32:
                    return new PrimitiveValue(Convert.ToUInt32(value), 4);

                case SbePrimitiveType.UInt64:
                    return new PrimitiveValue(Convert.ToUInt64(value), 8);

                case SbePrimitiveType.Float:
                    return new PrimitiveValue(Convert.ToDouble(value), 4);

                case SbePrimitiveType.Double:
                    return new PrimitiveValue(Convert.ToDouble(value), 8);

                default:
                    throw new ArgumentException("Unknown PrimitiveType: " + primitiveType);
            }
        }

        /// <summary>
        ///     Return long value for this PrimitiveValue
        /// </summary>
        /// <returns>value expressed as a long</returns>
        public long LongValue()
        {
            if (_representation != Representation.Long)
            {
                throw new InvalidOperationException("PrimitiveValue is not a long representation");
            }

            return _longValue;
        }

        /// <summary>
        ///     Return unsigned long value for this PrimitiveValue
        /// </summary>
        /// <returns>value expressed as a ulong</returns>
        public ulong ULongValue()
        {
            if (_representation != Representation.ULong)
            {
                throw new InvalidOperationException("PrimitiveValue is not a ulong representation");
            }

            return _unsignedLongValue;
        }

        /// <summary>
        ///     Return double value for this PrimitiveValue.
        /// </summary>
        /// <returns>value expressed as a double</returns>
        public double DoubleValue()
        {
            if (_representation != Representation.Double)
            {
                throw new InvalidOperationException("PrimitiveValue is not a double representation");
            }

            return _doubleValue;
        }

        /// <summary>
        ///     Return byte array value for this PrimitiveValue.
        /// </summary>
        /// <returns> value expressed as a byte array </returns>
        public byte[] ByteArrayValue()
        {
            if (_representation != Representation.ByteArray)
            {
                throw new InvalidOperationException("PrimitiveValue is not a byte[] representation");
            }

            return _byteArrayValue;
        }

        /// <summary>
        ///     Return byte array value for this PrimitiveValue given a particular type
        /// </summary>
        /// <param name="type"> of this value </param>
        /// <returns> value expressed as a byte array </returns>
        public byte[] ByteArrayValue(SbePrimitiveType type)
        {
            if (_representation == Representation.ByteArray)
            {
                return _byteArrayValue;
            }
            if (_representation == Representation.Long && _size == 1 && type == SbePrimitiveType.Char)
            {
                _byteArrayValueForLong[0] = (byte) _longValue;
                return _byteArrayValueForLong;
            }
            throw new InvalidOperationException("PrimitiveValue is not a byte[] representation");
        }

        /// <summary>
        ///     Return String representation of this object
        /// </summary>
        /// <returns> String representing object value </returns>
        public override string ToString()
        {
            switch (_representation)
            {
                case Representation.Long:
                    return Convert.ToString(_longValue);

                case Representation.ULong:
                    return Convert.ToString(_longValue);

                case Representation.Double:
                    return Convert.ToString(_doubleValue);

                case Representation.ByteArray:
                    return Encoding.GetEncoding(_characterEncoding).GetString(_byteArrayValue);

                default:
                    throw new InvalidOperationException("Unsupported Representation: " + _representation);
            }
        }

        /// <summary>
        ///     Determine if two values are equivalent.
        /// </summary>
        /// <param name="value"> to compare this value with </param>
        /// <returns> equivalence of values </returns>
        public override bool Equals(object value)
        {
            if (null != value && this.GetType().Equals(value.GetType()))
            {
                var rhs = (PrimitiveValue) value;

                if (_representation == rhs._representation)
                {
                    switch (_representation)
                    {
                        case Representation.Long:
                            return _longValue == rhs._longValue;

                        case Representation.ULong:
                            return _unsignedLongValue == rhs._unsignedLongValue;

                        case Representation.Double:
                            return BitConverter.DoubleToInt64Bits(_doubleValue) == BitConverter.DoubleToInt64Bits(rhs._doubleValue);

                        case Representation.ByteArray:
                            return _byteArrayValue.SequenceEqual(rhs._byteArrayValue);
                    }
                }
            }

            return false;
        }

        /// <summary>
        ///     Return hashCode for value. This is the underlying representations hashCode for the value
        /// </summary>
        /// <returns> int value of the hashCode </returns>
        public override int GetHashCode()
        {
            switch (_representation)
            {
                case Representation.Long:
                    return _longValue.GetHashCode();

                case Representation.ULong:
                    return _unsignedLongValue.GetHashCode();

                case Representation.Double:
                    return _doubleValue.GetHashCode();

                case Representation.ByteArray:
                    return _byteArrayValue.GetHashCode();

                default:
                    throw new InvalidOperationException("Unrecognised representation: " + _representation);
            }
        }
    }
}
