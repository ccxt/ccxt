namespace Nethereum.Util.HashProviders
{
    public interface IHashProvider
    {
        byte[] ComputeHash(byte[] data);
    }

}
