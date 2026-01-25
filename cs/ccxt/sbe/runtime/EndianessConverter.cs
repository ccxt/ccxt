using System;
using System.Net;

namespace Org.SbeTool.Sbe.Dll
{
    /// <summary>
    /// Utility class to manipulate endianess 
    /// </summary>
    public static class EndianessConverter
    {
        // TODO: we could assume the system is always little endian and have two methods for each
        // TODO: (one no-op and another one which reverse, so we do not have branching)

        private static readonly ByteOrder NativeByteOrder = BitConverter.IsLittleEndian
            ? ByteOrder.LittleEndian
            : ByteOrder.BigEndian;

        /// <summary>
        /// Applies the specified endianess to an int16 (reverse bytes if input endianess is different from system's endianess)
        /// </summary>
        /// <param name="byteOrder">the endianess to apply</param>
        /// <param name="value">the value to be converted</param>
        /// <returns>The value with applied endainess</returns>
        public static short ApplyInt16(ByteOrder byteOrder, short value)
        {
            if (byteOrder == NativeByteOrder) return value;

            return (short)((value & 0xFFU) << 8 | (value & 0xFF00U) >> 8);
        }

        /// <summary>
        /// Applies the specified endianess to an uint16 (reverse bytes if input endianess is different from system's endianess)
        /// </summary>
        /// <param name="byteOrder">the endianess to apply</param>
        /// <param name="value">the value to be converted</param>
        /// <returns>The value with applied endainess</returns>
        public static ushort ApplyUint16(ByteOrder byteOrder, ushort value)
        {
            if (byteOrder == NativeByteOrder) return value;

            return (ushort)((value & 0xFFU) << 8 | (value & 0xFF00U) >> 8);
        }

        /// <summary>
        /// Applies the specified endianess to an int32 (reverse bytes if input endianess is different from system's endianess)
        /// </summary>
        /// <param name="byteOrder">the endianess to apply</param>
        /// <param name="value">the value to be converted</param>
        /// <returns>The value with applied endainess</returns>
        public static int ApplyInt32(ByteOrder byteOrder, int value)
        {
            if (byteOrder == NativeByteOrder) return value;

            return (int)((value & 0x000000FFU) << 24 | (value & 0x0000FF00U) << 8 |
                   (value & 0x00FF0000U) >> 8 | (value & 0xFF000000U) >> 24);
        }

        /// <summary>
        /// Applies the specified endianess to an uint32 (reverse bytes if input endianess is different from system's endianess)
        /// </summary>
        /// <param name="byteOrder">the endianess to apply</param>
        /// <param name="value">the value to be converted</param>
        /// <returns>The value with applied endainess</returns>
        public static uint ApplyUint32(ByteOrder byteOrder, uint value)
        {
            if (byteOrder == NativeByteOrder) return value;

            return (value & 0x000000FFU) << 24 | (value & 0x0000FF00U) << 8 |
                   (value & 0x00FF0000U) >> 8 | (value & 0xFF000000U) >> 24;
        }

        /// <summary>
        /// Applies the specified endianess to an uint64 (reverse bytes if input endianess is different from system's endianess)
        /// </summary>
        /// <param name="byteOrder">the endianess to apply</param>
        /// <param name="value">the value to be converted</param>
        /// <returns>The value with applied endainess</returns>
        public static ulong ApplyUint64(ByteOrder byteOrder, ulong value)
        {
            if (byteOrder == NativeByteOrder) return value;

            return (value & 0x00000000000000FFUL) << 56 | (value & 0x000000000000FF00UL) << 40 |
                    (value & 0x0000000000FF0000UL) << 24 | (value & 0x00000000FF000000UL) << 8 |
                    (value & 0x000000FF00000000UL) >> 8 | (value & 0x0000FF0000000000UL) >> 24 |
                    (value & 0x00FF000000000000UL) >> 40 | (value & 0xFF00000000000000UL) >> 56;
        }

        /// <summary>
        /// Applies the specified endianess to an int64 (reverse bytes if input endianess is different from system's endianess)
        /// </summary>
        /// <param name="byteOrder">the endianess to apply</param>
        /// <param name="value">the value to be converted</param>
        /// <returns>The value with applied endainess</returns>
        public static long ApplyInt64(ByteOrder byteOrder, long value)
        {
            if (byteOrder == NativeByteOrder) return value;

            return IPAddress.HostToNetworkOrder(value);
        }

        /// <summary>
        /// Applies the specified endianess to a double (reverse bytes if input endianess is different from system's endianess)
        /// </summary>
        /// <param name="byteOrder">the endianess to apply</param>
        /// <param name="value">the value to be converted</param>
        /// <returns>The value with applied endainess</returns>
        public static double ApplyDouble(ByteOrder byteOrder, double value)
        {
            if (byteOrder == NativeByteOrder) return value;

            return BitConverter.Int64BitsToDouble(IPAddress.HostToNetworkOrder(BitConverter.DoubleToInt64Bits(value)));
        }

        /// <summary>
        /// Applies the specified endianess to an float (reverse bytes if input endianess is different from system's endianess)
        /// </summary>
        /// <param name="byteOrder">the endianess to apply</param>
        /// <param name="value">the value to be converted</param>
        /// <returns>The value with applied endainess</returns>
        public unsafe static float ApplyFloat(ByteOrder byteOrder, float value)
        {
            if (byteOrder == NativeByteOrder) return value;

            int valueInt = *(int*) &value;
            int applied = ApplyInt32(byteOrder, valueInt);

            return *(float*) &applied;
        }
    }
}