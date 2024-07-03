using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StarkSharp.Base.Net
{
    public class NetUtils
    {
        public static string HashToFelt(string value)
        {
            return value.StartsWith("0x") ? value : $"0x{Convert.ToInt64(value):X}";
        }

        public static bool IsBlockIdentifier(object value)
        {
            var tags = Enum.GetNames(typeof(Tag)).ToArray();

            return value is string strValue && tags.Contains(strValue);
        }

        public enum Tag
        {
            Pending,
            Latest
        }
    }
}
