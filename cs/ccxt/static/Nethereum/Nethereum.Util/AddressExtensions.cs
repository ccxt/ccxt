namespace Nethereum.Util
{
    public static class AddressExtensions
    {
        public static string ConvertToEthereumChecksumAddress(this string address)
        {
            return AddressUtil.Current.ConvertToChecksumAddress(address);
        }

        public static string ConvertToEthereumChecksumAddress(this byte[] address)
        {
            return AddressUtil.Current.ConvertToChecksumAddress(address);
        }

        public static bool IsEthereumChecksumAddress(this string address)
        {
            return AddressUtil.Current.IsChecksumAddress(address);
        }


        /// <summary>
        /// Validates if the hex string is 40 alphanumeric characters
        /// </summary>
        public static bool IsValidEthereumAddressHexFormat(this string address)
        {
            return AddressUtil.Current.IsValidEthereumAddressHexFormat(address);
        }

        public static bool IsValidEthereumAddressLength(this string address)
        {
            return AddressUtil.Current.IsValidAddressLength(address);
        }

        public static bool IsTheSameAddress(this string address, string otherAddress)
        {
            return AddressUtil.Current.AreAddressesTheSame(address, otherAddress);
        }

        public static bool IsAnEmptyAddress(this string address)
        {
            return AddressUtil.Current.IsAnEmptyAddress(address);
        }

        public static bool IsNotAnEmptyAddress(this string address)
        {
            return AddressUtil.Current.IsNotAnEmptyAddress(address);
        }

        public static string AddressValueOrEmpty(this string address)
        {
            return AddressUtil.Current.AddressValueOrEmpty(address);
        }

        public static bool IsEmptyOrEqualsAddress(this string address1, string candidate)
        {
            return AddressUtil.Current.IsEmptyOrEqualsAddress(address1, candidate);
        }
    }
}