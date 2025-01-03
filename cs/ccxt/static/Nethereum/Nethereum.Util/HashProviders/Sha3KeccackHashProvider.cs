
namespace Nethereum.Util.HashProviders
{
    public class Sha3KeccackHashProvider : IHashProvider
    {
        public byte[] ComputeHash(byte[] data)
        {
            return Sha3Keccack.Current.CalculateHash(data);
        }
    }

}
