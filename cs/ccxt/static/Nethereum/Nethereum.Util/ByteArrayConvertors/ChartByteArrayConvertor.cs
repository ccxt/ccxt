using System.Text;

namespace Nethereum.Util.ByteArrayConvertors
{
    public class ChartByteArrayConvertor : IByteArrayConvertor<char>
    {
        public byte[] ConvertToByteArray(char data)
        {
            return Encoding.UTF8.GetBytes(new[] { data });
        }
    }

}
