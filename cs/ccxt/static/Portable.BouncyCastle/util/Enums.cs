using System;

using Org.BouncyCastle.Utilities.Date;

namespace Org.BouncyCastle.Utilities
{
    internal abstract class Enums
    {
        internal static Enum GetEnumValue(Type enumType, string s)
        {
            if (!enumType.IsEnum)
                throw new ArgumentException("Not an enumeration type", nameof(enumType));

            // We only want to parse single named constants
            if (s.Length > 0 && char.IsLetter(s[0]) && s.IndexOf(',') < 0)
            {
                s = s.Replace('-', '_');
                s = s.Replace('/', '_');

                return (Enum)Enum.Parse(enumType, s, false);
            }

            throw new ArgumentException();
        }

        internal static Array GetEnumValues(Type enumType)
        {
            if (!enumType.IsEnum)
                throw new ArgumentException("Not an enumeration type", nameof(enumType));

            return Enum.GetValues(enumType);
        }

        internal static Enum GetArbitraryValue(Type enumType)
        {
            Array values = GetEnumValues(enumType);
            int pos = (int)(DateTimeUtilities.CurrentUnixMs() & int.MaxValue) % values.Length;
            return (Enum)values.GetValue(pos);
        }
    }
}
