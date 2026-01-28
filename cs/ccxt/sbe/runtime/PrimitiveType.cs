namespace Org.SbeTool.Sbe.Dll
{
    /// <summary>
    /// Primitive types from which all other types are composed.
    /// 
    ///
    /// <table>
    ///     <thead>
    ///         <tr>
    ///             <th>PrimitiveType Type</th>
    ///             <th>Description</th>
    ///             <th>Length (octets)</th>
    ///         </tr>
    ///     </thead>
    ///     <tbody>
    ///         <tr>
    ///             <td>char</td>
    ///             <td>Character</td>
    ///             <td>1</td>
    ///         </tr>
    ///         <tr>
    ///             <td>int8</td>
    ///             <td>Signed byte</td>
    ///             <td>1</td>
    ///         </tr>
    ///         <tr>
    ///             <td>uint8</td>
    ///             <td>Unsigned Byte / single byte character</td>
    ///             <td>1</td>
    ///         </tr>
    ///         <tr>
    ///             <td>int16</td>
    ///             <td>Signed integer</td>
    ///             <td>2</td>
    ///         </tr>
    ///         <tr>
    ///             <td>uint16</td>
    ///             <td>Unsigned integer</td>
    ///             <td>2</td>
    ///         </tr>
    ///         <tr>
    ///             <td>int32</td>
    ///             <td>Signed integer</td>
    ///             <td>4</td>
    ///         </tr>
    ///         <tr>
    ///             <td>uint32</td>
    ///             <td>Unsigned integer</td>
    ///             <td>4</td>
    ///         </tr>
    ///         <tr>
    ///             <td>int64</td>
    ///             <td>Signed integer</td>
    ///             <td>8</td>
    ///         </tr>
    ///         <tr>
    ///             <td>uint64</td>
    ///             <td>Unsigned integer</td>
    ///             <td>8</td>
    ///         </tr>
    ///         <tr>
    ///             <td>float</td>
    ///             <td>Single precision floating point</td>
    ///             <td>4</td>
    ///         </tr>
    ///         <tr>
    ///             <td>double</td>
    ///             <td>Double precision floating point</td>
    ///             <td>8</td>
    ///         </tr>
    ///     </tbody>
    /// </table>
    /// </summary>
    public class PrimitiveType
    {
        /// <summary>
        /// Primitive type representation for SBE type CHAR
        /// </summary>
        public static readonly PrimitiveType SbeChar = new PrimitiveType("char", 1, PrimitiveValue.MinValueChar, PrimitiveValue.MaxValueChar, PrimitiveValue.NullValueChar, SbePrimitiveType.Char);

        /// <summary>
        /// Primitive type representation for SBE type INT8
        /// </summary>
        public static readonly PrimitiveType SbeInt8 = new PrimitiveType("int8", 1, PrimitiveValue.MinValueInt8, PrimitiveValue.MaxValueInt8, PrimitiveValue.NullValueInt8, SbePrimitiveType.Int8);

        /// <summary>
        /// Primitive type representation for SBE type INT16
        /// </summary>
        public static readonly PrimitiveType SbeInt16 = new PrimitiveType("int16", 2, PrimitiveValue.MinValueInt16, PrimitiveValue.MaxValueInt16, PrimitiveValue.NullValueInt16, SbePrimitiveType.Int16);

        /// <summary>
        /// Primitive type representation for SBE type INT32
        /// </summary>
        public static readonly PrimitiveType SbeInt32 = new PrimitiveType("int32", 4, PrimitiveValue.MinValueInt32, PrimitiveValue.MaxValueInt32, PrimitiveValue.NullValueInt32, SbePrimitiveType.Int32);

        /// <summary>
        /// Primitive type representation for SBE type INT64
        /// </summary>
        public static readonly PrimitiveType SbeInt64 = new PrimitiveType("int64", 8, PrimitiveValue.MinValueInt64, PrimitiveValue.MaxValueInt64, PrimitiveValue.NullValueInt64, SbePrimitiveType.Int64);

        /// <summary>
        /// Primitive type representation for SBE type UINT8
        /// </summary>
        public static readonly PrimitiveType SbeUInt8 = new PrimitiveType("uint8", 1, PrimitiveValue.MinValueUint8, PrimitiveValue.MaxValueUint8, PrimitiveValue.NullValueUint8, SbePrimitiveType.UInt8);
        
        /// <summary>
        /// Primitive type representation for SBE type UINT16
        /// </summary>
        public static readonly PrimitiveType SbeUInt16 = new PrimitiveType("uint16", 2, PrimitiveValue.MinValueUint16, PrimitiveValue.MaxValueUint16, PrimitiveValue.NullValueUint16, SbePrimitiveType.UInt16);

        /// <summary>
        /// Primitive type representation for SBE type UINT32
        /// </summary>
        public static readonly PrimitiveType SbeUInt32 = new PrimitiveType("uint32", 4, PrimitiveValue.MinValueUint32, PrimitiveValue.MaxValueUint32, PrimitiveValue.NullValueUint32, SbePrimitiveType.UInt32);

        /// <summary>
        /// Primitive type representation for SBE type UINT64
        /// </summary>
        public static readonly PrimitiveType SbeUInt64 = new PrimitiveType("uint64", 8, PrimitiveValue.MinValueUint64, PrimitiveValue.MaxValueUint64, PrimitiveValue.NullValueUint64, SbePrimitiveType.UInt64);
        
        /// <summary>
        /// Primitive type representation for SBE type FLOAT
        /// </summary>
        public static readonly PrimitiveType SbeFloat = new PrimitiveType("float", 4, PrimitiveValue.MinValueFloat, PrimitiveValue.MaxValueFloat, PrimitiveValue.NullValueFloat, SbePrimitiveType.Float);

        /// <summary>
        /// Primitive type representation for SBE type DOUBLE
        /// </summary>
        public static readonly PrimitiveType SbeDouble = new PrimitiveType("double", 8, PrimitiveValue.MinValueDouble, PrimitiveValue.MaxValueDouble, PrimitiveValue.NullValueDouble, SbePrimitiveType.Double);

        private readonly PrimitiveValue _maxValue;
        private readonly PrimitiveValue _minValue;
        private readonly string _name;
        private readonly PrimitiveValue _nullValue;
        private readonly int _size;
        private readonly SbePrimitiveType _sbePrimitiveType;

        internal PrimitiveType(string name, int size, long minValue, long maxValue, long nullValue, SbePrimitiveType sbePrimitiveType)
        {
            _name = name;
            _size = size;
            _sbePrimitiveType = sbePrimitiveType;
            _minValue = new PrimitiveValue(minValue, size);
            _maxValue = new PrimitiveValue(maxValue, size);
            _nullValue = new PrimitiveValue(nullValue, size);
        }

        internal PrimitiveType(string name, int size, double minValue, double maxValue, double nullValue, SbePrimitiveType sbePrimitiveType)
        {
            _name = name;
            _size = size;
            _sbePrimitiveType = sbePrimitiveType;
            _minValue = new PrimitiveValue(minValue, size);
            _maxValue = new PrimitiveValue(maxValue, size);
            _nullValue = new PrimitiveValue(nullValue, size);
        }

        /// <summary>
        ///     The name of the primitive type as a String.
        /// </summary>
        /// <value>the name as a String</value>
        public string PrimitiveName
        {
            get { return _name; }
        }

        /// <summary>
        ///     The size of the primitive type in octets.
        /// </summary>
        /// <value>size (in octets) of the primitive type</value>
        public int Size
        {
            get { return _size; }
        }

        /// <summary>
        ///     The minValue of the primitive type.
        /// </summary>
        /// <value>default minValue of the primitive type</value>
        public PrimitiveValue MinValue
        {
            get { return _minValue; }
        }

        /// <summary>
        ///     The maxValue of the primitive type.
        /// </summary>
        /// <value>default maxValue of the primitive type</value>
        public PrimitiveValue MaxValue
        {
            get { return _maxValue; }
        }

        /// <summary>
        ///     The nullValue of the primitive type.
        /// </summary>
        /// <value>default nullValue of the primitive type</value>
        public PrimitiveValue NullValue
        {
            get { return _nullValue; }
        }

        /// <summary>
        /// The SBE Type of the primitive type.
        /// </summary>
        public SbePrimitiveType Type
        {
            get { return _sbePrimitiveType; }
        }

        /// <summary>
        /// The PrimitiveName as a string.
        /// </summary>
        public override string ToString() => PrimitiveName;
    }
}
