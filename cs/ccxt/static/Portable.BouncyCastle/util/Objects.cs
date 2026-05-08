namespace Org.BouncyCastle.Utilities
{
    public static class Objects
    {
        public static int GetHashCode(object obj)
        {
            return null == obj ? 0 : obj.GetHashCode();
        }
    }
}
