using System;
using System.Globalization;

using Org.BouncyCastle.Math;

namespace Org.BouncyCastle.Utilities.Net
{
	public class IPAddress
	{
		/**
		 * Validate the given IPv4 or IPv6 address.
		 *
		 * @param address the IP address as a string.
		 *
		 * @return true if a valid address, false otherwise
		 */
		public static bool IsValid(
			string address)
		{
			return IsValidIPv4(address) || IsValidIPv6(address);
		}

		/**
		 * Validate the given IPv4 or IPv6 address and netmask.
		 *
		 * @param address the IP address as a string.
		 *
		 * @return true if a valid address with netmask, false otherwise
		 */
		public static bool IsValidWithNetMask(
			string address)
		{
			return IsValidIPv4WithNetmask(address) || IsValidIPv6WithNetmask(address);
		}

		/**
		 * Validate the given IPv4 address.
		 * 
		 * @param address the IP address as a string.
		 *
		 * @return true if a valid IPv4 address, false otherwise
		 */
		public static bool IsValidIPv4(
			string address)
		{
			try
			{
				return unsafeIsValidIPv4(address);
			}
			catch (FormatException) {}
			catch (OverflowException) {}
			return false;
		}

		private static bool unsafeIsValidIPv4(
			string address)
		{
			if (address.Length == 0)
				return false;

			int octets = 0;
			string temp = address + ".";

			int pos;
			int start = 0;
			while (start < temp.Length
				&& (pos = temp.IndexOf('.', start)) > start)
			{
				if (octets == 4)
					return false;

				string octetStr = temp.Substring(start, pos - start);
				int octet = int.Parse(octetStr);

				if (octet < 0 || octet > 255)
					return false;

				start = pos + 1;
				octets++;
			}

			return octets == 4;
		}

		public static bool IsValidIPv4WithNetmask(
			string address)
		{
			int index = address.IndexOf('/');
			string mask = address.Substring(index + 1);

			return (index > 0) && IsValidIPv4(address.Substring(0, index))
				&& (IsValidIPv4(mask) || IsMaskValue(mask, 32));
		}

		public static bool IsValidIPv6WithNetmask(
			string address)
		{
			int index = address.IndexOf('/');
			string mask = address.Substring(index + 1);

			return (index > 0) && (IsValidIPv6(address.Substring(0, index))
				&& (IsValidIPv6(mask) || IsMaskValue(mask, 128)));
		}

		private static bool IsMaskValue(
			string	component,
			int		size)
		{
			int val = int.Parse(component);
			try
			{
				return val >= 0 && val <= size;
			}
			catch (FormatException) {}
			catch (OverflowException) {}
			return false;
		}

		/**
		 * Validate the given IPv6 address.
		 *
		 * @param address the IP address as a string.
		 *
		 * @return true if a valid IPv4 address, false otherwise
		 */
		public static bool IsValidIPv6(
			string address)
		{
			try
			{
				return unsafeIsValidIPv6(address);
			}
			catch (FormatException) {}
			catch (OverflowException) {}
			return false;
		}

		private static bool unsafeIsValidIPv6(
			string address)
		{
			if (address.Length == 0)
			{
				return false;
			}

			int octets = 0;

			string temp = address + ":";
			bool doubleColonFound = false;
			int pos;
			int start = 0;
			while (start < temp.Length
				&& (pos = temp.IndexOf(':', start)) >= start)
			{
				if (octets == 8)
				{
					return false;
				}

				if (start != pos)
				{
					string value = temp.Substring(start, pos - start);

					if (pos == (temp.Length - 1) && value.IndexOf('.') > 0)
					{
						if (!IsValidIPv4(value))
						{
							return false;
						}

						octets++; // add an extra one as address covers 2 words.
					}
					else
					{
						string octetStr = temp.Substring(start, pos - start);
						int octet = int.Parse(octetStr, NumberStyles.AllowHexSpecifier);

						if (octet < 0 || octet > 0xffff)
							return false;
					}
				}
				else
				{
					if (pos != 1 && pos != temp.Length - 1 && doubleColonFound)
					{
						return false;
					}
					doubleColonFound = true;
				}
				start = pos + 1;
				octets++;
			}

			return octets == 8 || doubleColonFound;
		}
	}
}
