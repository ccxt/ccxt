
using Org.BouncyCastle.Crypto.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.Cmce
{

    class Utils
    {
        internal static void StoreGF(byte[] dest, int offset, ushort a)
        {
            dest[offset + 0] = (byte) (a & 0xFF);
            dest[offset + 1] = (byte) (a >> 8);
        }

        internal static ushort LoadGF(byte[] src, int offset, int gfmask)
        {
            return (ushort) (Pack.LE_To_UInt16(src, offset) & gfmask);
        }

        internal static uint Load4(byte[] input, int offset)
        {
            return Pack.LE_To_UInt32(input, offset);
        }

        internal static void Store8(byte[] output, int offset, ulong input)
        {
            //use pack
            output[offset + 0] = (byte) ((input >> 0x00) & 0xFF);
            output[offset + 1] = (byte) ((input >> 0x08) & 0xFF);
            output[offset + 2] = (byte) ((input >> 0x10) & 0xFF);
            output[offset + 3] = (byte) ((input >> 0x18) & 0xFF);
            output[offset + 4] = (byte) ((input >> 0x20) & 0xFF);
            output[offset + 5] = (byte) ((input >> 0x28) & 0xFF);
            output[offset + 6] = (byte) ((input >> 0x30) & 0xFF);
            output[offset + 7] = (byte) ((input >> 0x38) & 0xFF);
        }

        internal static ulong Load8(byte[] input, int offset)
        {
            return Pack.LE_To_UInt64(input, offset);
        }

        internal static ushort Bitrev(ushort a, int GFBITS)
        {
            a = (ushort) (((a & 0x00FF) << 8) | ((a & 0xFF00) >> 8));
            a = (ushort) (((a & 0x0F0F) << 4) | ((a & 0xF0F0) >> 4));
            a = (ushort) (((a & 0x3333) << 2) | ((a & 0xCCCC) >> 2));
            a = (ushort) (((a & 0x5555) << 1) | ((a & 0xAAAA) >> 1));
            if (GFBITS == 12)
                return (ushort) (a >> 4);
            return (ushort) (a >> 3);
        }

    }
}
