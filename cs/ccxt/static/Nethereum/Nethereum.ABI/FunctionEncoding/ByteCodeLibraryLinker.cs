using Nethereum.Hex.HexConvertors.Extensions;
namespace Nethereum.ABI.FunctionEncoding
{
    public class ByteCodeLibraryLinker
    {
        public static readonly string CONTAINS_PLACEHOLDERS_MESSAGE = $"The byte code contains library address placeholders (prefix: '{ByteCodeConstants.LIBRARY_PLACEHOLDER_PREFIX}', suffix: '{ByteCodeConstants.LIBRARY_PLACEHOLDER_SUFFIX}').";

        public static void EnsureDoesNotContainPlaceholders(string byteCode)
        {
            if (ContainsPlaceholders(byteCode))
            {
                throw new System.Exception(CONTAINS_PLACEHOLDERS_MESSAGE);
            }
        }

        public static bool ContainsPlaceholders(string byteCode)
        {
            if(string.IsNullOrEmpty(byteCode)) return false;
            //for efficiency only check for prefix
            return byteCode.Contains(ByteCodeConstants.LIBRARY_PLACEHOLDER_PREFIX);
        }

        private static string CreatePlaceholder(string key)
        {
            return ByteCodeConstants.LIBRARY_PLACEHOLDER_PREFIX + key + ByteCodeConstants.LIBRARY_PLACEHOLDER_SUFFIX;
        }

        public string LinkByteCode(string byteCode, params ByteCodeLibrary[] byteCodeLibraries)
        {
            foreach (var byteCodeLibrary in byteCodeLibraries)
            {
                var placeholder = CreatePlaceholder(byteCodeLibrary.PlaceholderKey);
                byteCode = byteCode.Replace(placeholder, byteCodeLibrary.Address.RemoveHexPrefix());
            }
            return byteCode;
        }


    }
}