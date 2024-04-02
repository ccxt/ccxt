namespace Org.BouncyCastle.Pqc.Crypto.Sike
{
    internal class Utils
    {
        public static ulong[][] InitArray(uint size1, uint size2)
        {
            ulong[][] res = new ulong[size1][];
            for (int i = 0; i < size1; i++)
            {
                res[i] = new ulong[size2];
            }

            return res;
        }
        
        public static ulong[][][] InitArray(uint size1, uint size2, uint size3)
        {
            ulong[][][] res = new ulong[size1][][];
            for (int i = 0; i < size1; i++)
            {
                res[i] = new ulong[size2][];
                for (int j = 0; j < size2; j++)
                {
                    res[i][j] = new ulong[size3];
                }
            }

            return res;
        }
        
        public static ulong[][][][] InitArray(uint size1, uint size2, uint size3, uint size4)
        {
            ulong[][][][] res = new ulong[size1][][][];
            for (int i = 0; i < size1; i++)
            {
                res[i] = new ulong[size2][][];
                for (int j = 0; j < size2; j++)
                {
                    res[i][j] = new ulong[size3][];
                    for (int k = 0; k < size3; k++)
                    {
                        res[i][j][k] = new ulong[size4];
                    }
                }
            }

            return res;
        }
    }
}