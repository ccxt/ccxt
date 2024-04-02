using System;
using System.Globalization;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cms
{
    public class Time
        : Asn1Encodable, IAsn1Choice
    {
        private readonly Asn1Object time;

		public static Time GetInstance(
            Asn1TaggedObject	obj,
            bool				explicitly)
        {
            return GetInstance(obj.GetObject());
        }

		public Time(
            Asn1Object time)
        {
            if (time == null)
                throw new ArgumentNullException("time");
            if (!(time is DerUtcTime) && !(time is DerGeneralizedTime))
                throw new ArgumentException("unknown object passed to Time");

            this.time = time;
        }

		/**
         * creates a time object from a given date - if the date is between 1950
         * and 2049 a UTCTime object is Generated, otherwise a GeneralizedTime
         * is used.
         */
        public Time(
            DateTime date)
        {
            string d = date.ToString("yyyyMMddHHmmss", CultureInfo.InvariantCulture) + "Z";

			int year = int.Parse(d.Substring(0, 4));

			if (year < 1950 || year > 2049)
            {
                time = new DerGeneralizedTime(d);
            }
            else
            {
                time = new DerUtcTime(d.Substring(2));
            }
        }

		public static Time GetInstance(
            object obj)
        {
            if (obj == null || obj is Time)
                return (Time)obj;
			if (obj is DerUtcTime)
                return new Time((DerUtcTime)obj);
			if (obj is DerGeneralizedTime)
                return new Time((DerGeneralizedTime)obj);

            throw new ArgumentException("unknown object in factory: " + Platform.GetTypeName(obj), "obj");
        }

		public string TimeString
        {
			get
			{
				if (time is DerUtcTime)
				{
					return ((DerUtcTime)time).AdjustedTimeString;
				}
				else
				{
					return ((DerGeneralizedTime)time).GetTime();
				}
			}
        }

		public DateTime Date
        {
			get
			{
				try
				{
					if (time is DerUtcTime)
					{
						return ((DerUtcTime)time).ToAdjustedDateTime();
					}

					return ((DerGeneralizedTime)time).ToDateTime();
				}
				catch (FormatException e)
				{
					// this should never happen
					throw new InvalidOperationException("invalid date string: " + e.Message);
				}
			}
        }

		/**
         * Produce an object suitable for an Asn1OutputStream.
         * <pre>
         * Time ::= CHOICE {
         *             utcTime        UTCTime,
         *             generalTime    GeneralizedTime }
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
            return time;
        }
    }
}
