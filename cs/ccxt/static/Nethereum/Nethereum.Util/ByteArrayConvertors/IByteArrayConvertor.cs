namespace Nethereum.Util.ByteArrayConvertors
{
    public interface IByteArrayConvertor<T>
    {
        byte[] ConvertToByteArray(T data);
    }

}
