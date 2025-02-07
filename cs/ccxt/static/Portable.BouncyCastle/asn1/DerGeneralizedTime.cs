using System;
using System.Globalization;
using System.IO;
using System.Text;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1
{
    /**
     * Generalized time object.
     */
    public class DerGeneralizedTime
        : Asn1Object
    {
        internal class Meta : Asn1UniversalType
        {
            internal static readonly Asn1UniversalType Instance = new Meta();

            private Meta() : base(typeof(DerGeneralizedTime), Asn1Tags.GeneralizedTime) {}

            internal override Asn1Object FromImplicitPrimitive(DerOctetString octetString)
            {
                return CreatePrimitive(octetString.GetOctets());
            }
        }

        /**
         * return a generalized time from the passed in object
         *
         * @exception ArgumentException if the object cannot be converted.
         */
        public static DerGeneralizedTime GetInstance(object obj)
        {
            if (obj == null || obj is DerGeneralizedTime)
            {
                return (DerGeneralizedTime)obj;
            }
            else if (obj is IAsn1Convertible)
            {
                Asn1Object asn1Object = ((IAsn1Convertible)obj).ToAsn1Object();
                if (asn1Object is DerGeneralizedTime)
                    return (DerGeneralizedTime)asn1Object;
            }
            else if (obj is byte[])
            {
                try
                {
                    return (DerGeneralizedTime)Meta.Instance.FromByteArray((byte[])obj);
                }
                catch (IOException e)
                {
                    throw new ArgumentException("failed to construct generalized time from byte[]: " + e.Message);
                }
            }

            throw new ArgumentException("illegal object in GetInstance: " + Platform.GetTypeName(obj), "obj");
        }

        /**
         * return a generalized Time object from a tagged object.
         *
         * @param taggedObject the tagged object holding the object we want
         * @param declaredExplicit true if the object is meant to be explicitly tagged false otherwise.
         * @exception ArgumentException if the tagged object cannot be converted.
         */
        public static DerGeneralizedTime GetInstance(Asn1TaggedObject taggedObject, bool declaredExplicit)
        {
            return (DerGeneralizedTime)Meta.Instance.GetContextInstance(taggedObject, declaredExplicit);
        }

        private readonly string time;

        /**
         * The correct format for this is YYYYMMDDHHMMSS[.f]Z, or without the Z
         * for local time, or Z+-HHMM on the end, for difference between local
         * time and UTC time. The fractional second amount f must consist of at
         * least one number with trailing zeroes removed.
         *
         * @param time the time string.
         * @exception ArgumentException if string is an illegal format.
         */
        public DerGeneralizedTime(
            string time)
        {
            this.time = time;

            try
            {
                ToDateTime();
            }
            catch (FormatException e)
            {
                throw new ArgumentException("invalid date string: " + e.Message);
            }
        }

        /**
         * base constructor from a local time object
         */
        public DerGeneralizedTime(DateTime time)
        {
            this.time = time.ToUniversalTime().ToString(@"yyyyMMddHHmmss\Z");
        }

        internal DerGeneralizedTime(
            byte[] bytes)
        {
            //
            // explicitly convert to characters
            //
            this.time = Strings.FromAsciiByteArray(bytes);
        }

        /**
         * Return the time.
         * @return The time string as it appeared in the encoded object.
         */
        public string TimeString
        {
            get { return time; }
        }

        /**
         * return the time - always in the form of
         *  YYYYMMDDhhmmssGMT(+hh:mm|-hh:mm).
         * <p>
         * Normally in a certificate we would expect "Z" rather than "GMT",
         * however adding the "GMT" means we can just use:
         * <pre>
         *     dateF = new SimpleDateFormat("yyyyMMddHHmmssz");
         * </pre>
         * To read in the time and Get a date which is compatible with our local
         * time zone.</p>
         */
        public string GetTime()
        {
            //
            // standardise the format.
            //
            if (time[time.Length - 1] == 'Z')
                return time.Substring(0, time.Length - 1) + "GMT+00:00";

            int signPos = time.Length - 5;
            char sign = time[signPos];
            if (sign == '-' || sign == '+')
            {
                return time.Substring(0, signPos)
                    + "GMT"
                    + time.Substring(signPos, 3)
                    + ":"
                    + time.Substring(signPos + 3);
            }
            else
            {
                signPos = time.Length - 3;
                sign = time[signPos];
                if (sign == '-' || sign == '+')
                {
                    return time.Substring(0, signPos)
                        + "GMT"
                        + time.Substring(signPos)
                        + ":00";
                }
            }

            return time + CalculateGmtOffset();
        }

        private string CalculateGmtOffset()
        {
            char sign = '+';
            DateTime time = ToDateTime();

            TimeSpan offset = TimeZoneInfo.Local.GetUtcOffset(time);
            if (offset.CompareTo(TimeSpan.Zero) < 0)
            {
                sign = '-';
                offset = offset.Duration();
            }
            int hours = offset.Hours;
            int minutes = offset.Minutes;

            return "GMT" + sign + Convert(hours) + ":" + Convert(minutes);
        }

        private static string Convert(
            int time)
        {
            if (time < 10)
            {
                return "0" + time;
            }

            return time.ToString();
        }

        public DateTime ToDateTime()
        {
            string formatStr;
            string d = time;
            bool makeUniversal = false;

            if (Platform.EndsWith(d, "Z"))
            {
                if (HasFractionalSeconds)
                {
                    int fCount = d.Length - d.IndexOf('.') - 2;
                    formatStr = @"yyyyMMddHHmmss." + FString(fCount) + @"\Z";
                }
                else if (HasSeconds)
                {
                    formatStr = @"yyyyMMddHHmmss\Z";
                }
                else if (HasMinutes)
                {
                    formatStr = @"yyyyMMddHHmm\Z";
                }
                else
                {
                    formatStr = @"yyyyMMddHH\Z";
                }
            }
            else if (time.IndexOf('-') > 0 || time.IndexOf('+') > 0)
            {
                d = GetTime();
                makeUniversal = true;

                if (HasFractionalSeconds)
                {
                    int fCount = Platform.IndexOf(d, "GMT") - 1 - d.IndexOf('.');
                    formatStr = @"yyyyMMddHHmmss." + FString(fCount) + @"'GMT'zzz";
                }
                else
                {
                    formatStr = @"yyyyMMddHHmmss'GMT'zzz";
                }
            }
            else
            {
                if (HasFractionalSeconds)
                {
                    int fCount = d.Length - 1 - d.IndexOf('.');
                    formatStr = @"yyyyMMddHHmmss." + FString(fCount);
                }
                else if (HasSeconds)
                {
                    formatStr = @"yyyyMMddHHmmss";
                }
                else if (HasMinutes)
                {
                    formatStr = @"yyyyMMddHHmm";
                }
                else
                {
                    formatStr = @"yyyyMMddHH";
                }

                // TODO?
//				dateF.setTimeZone(new SimpleTimeZone(0, TimeZone.getDefault().getID()));
            }

            return ParseDateString(d, formatStr, makeUniversal);
        }

        private string FString(
            int count)
        {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < count; ++i)
            {
                sb.Append('f');
            }
            return sb.ToString();
        }

        private DateTime ParseDateString(string	s, string format, bool makeUniversal)
        {
            /*
             * NOTE: DateTime.Kind and DateTimeStyles.AssumeUniversal not available in .NET 1.1
             */
            DateTimeStyles style = DateTimeStyles.None;
            if (Platform.EndsWith(format, "Z"))
            {
                try
                {
                    style = (DateTimeStyles)Enums.GetEnumValue(typeof(DateTimeStyles), "AssumeUniversal");
                }
                catch (Exception)
                {
                }

                style |= DateTimeStyles.AdjustToUniversal;
            }

            DateTime dt = DateTime.ParseExact(s, format, DateTimeFormatInfo.InvariantInfo, style);

            return makeUniversal ? dt.ToUniversalTime() : dt;
        }

        private bool HasFractionalSeconds
        {
            get { return time.IndexOf('.') == 14; }
        }

        private bool HasSeconds =>  IsDigit(12) && IsDigit(13);

        private bool HasMinutes => IsDigit(10) && IsDigit(11);

        private bool IsDigit(int pos)
        {
            return time.Length > pos && char.IsDigit(time[pos]);
        }

        private byte[] GetOctets(int encoding)
        {
            if (Asn1OutputStream.EncodingDer == encoding && time[time.Length - 1] == 'Z')
            {
                if (!HasMinutes)
                    return Strings.ToAsciiByteArray(time.Insert(time.Length - 1, "0000"));
                if (!HasSeconds)
                    return Strings.ToAsciiByteArray(time.Insert(time.Length - 1, "00"));

                if (HasFractionalSeconds)
                {
                    int ind = time.Length - 2;
                    while (ind > 0 && time[ind] == '0')
                    {
                        --ind;
                    }

                    if (time[ind] != '.')
                    {
                        ++ind;
                    }

                    if (ind != time.Length - 1)
                    {
                        return Strings.ToAsciiByteArray(time.Remove(ind, time.Length - 1 - ind));
                    }
                }
            }

            return Strings.ToAsciiByteArray(time);
        }

        internal override IAsn1Encoding GetEncoding(int encoding)
        {
            return new PrimitiveEncoding(Asn1Tags.Universal, Asn1Tags.GeneralizedTime, GetOctets(encoding));
        }

        internal override IAsn1Encoding GetEncodingImplicit(int encoding, int tagClass, int tagNo)
        {
            return new PrimitiveEncoding(tagClass, tagNo, GetOctets(encoding));
        }

        protected override bool Asn1Equals(Asn1Object asn1Object)
        {
            DerGeneralizedTime that = asn1Object as DerGeneralizedTime;
            return null != that
                && this.time.Equals(that.time);
        }

        protected override int Asn1GetHashCode()
        {
            return time.GetHashCode();
        }

        internal static DerGeneralizedTime CreatePrimitive(byte[] contents)
        {
            return new DerGeneralizedTime(contents);
        }
    }
}
