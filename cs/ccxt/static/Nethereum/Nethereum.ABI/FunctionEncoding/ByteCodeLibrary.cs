using Nethereum.Util;
namespace Nethereum.ABI.FunctionEncoding
{
    public class ByteCodeLibrary
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="path">The full path of the solidity file for example: "C:/MyLibrary.sol"</param>
        /// <param name="libraryName">The name of the library "MyLibrary" not "MyLibrary.sol"</param>
        /// <param name="libraryAddress"></param>
        /// <returns></returns>
        public static ByteCodeLibrary CreateFromPath(string path, string libraryName, string libraryAddress)
        {
            path = path.Replace("\\", "/");
            var placeHolderKey = Sha3Keccack.Current.CalculateHash(path + ":" + libraryName).Substring(0, 34);
            return new ByteCodeLibrary() { PlaceholderKey = placeHolderKey, Address = libraryAddress };
        }

        public string PlaceholderKey { get; set; }
        public string Address { get; set; }
    }
}