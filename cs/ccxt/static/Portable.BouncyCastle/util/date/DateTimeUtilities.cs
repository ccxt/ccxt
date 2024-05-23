using System;

namespace Org.BouncyCastle.Utilities.Date
{
	public class DateTimeUtilities
	{
		public static readonly DateTime UnixEpoch = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);

		private DateTimeUtilities()
		{
		}

		/// <summary>
		/// Return the number of milliseconds since the Unix epoch (1 Jan., 1970 UTC) for a given DateTime value.
		/// </summary>
		/// <param name="dateTime">A UTC DateTime value not before epoch.</param>
		/// <returns>Number of whole milliseconds after epoch.</returns>
		/// <exception cref="ArgumentException">'dateTime' is before epoch.</exception>
		public static long DateTimeToUnixMs(
			DateTime dateTime)
		{
			if (dateTime.CompareTo(UnixEpoch) < 0)
				throw new ArgumentException("DateTime value may not be before the epoch", "dateTime");

			return (dateTime.Ticks - UnixEpoch.Ticks) / TimeSpan.TicksPerMillisecond;
		}

		/// <summary>
		/// Create a DateTime value from the number of milliseconds since the Unix epoch (1 Jan., 1970 UTC).
		/// </summary>
		/// <param name="unixMs">Number of milliseconds since the epoch.</param>
		/// <returns>A UTC DateTime value</returns>
		public static DateTime UnixMsToDateTime(
			long unixMs)
		{
			return new DateTime(unixMs * TimeSpan.TicksPerMillisecond + UnixEpoch.Ticks, DateTimeKind.Utc);
		}

		/// <summary>
		/// Return the current number of milliseconds since the Unix epoch (1 Jan., 1970 UTC).
		/// </summary>
		public static long CurrentUnixMs()
		{
			return DateTimeToUnixMs(DateTime.UtcNow);
		}
	}
}
