using System;
using System.Globalization;

namespace Nethereum.Util
{
    public static class FormattingExtensions
    {
        /// <summary>
        /// Converts formattable value to string in a culture-independent way.
        /// </summary>
        public static string ToStringInvariant<T>(this T formattable) where T : IFormattable
        {
            if (formattable == null) throw new ArgumentNullException(nameof(formattable));

            return formattable.ToString(null, CultureInfo.InvariantCulture);
        }
    }
}