using System.Collections.Generic; 

namespace StarkSharp.StarkSharp.Base.StarkSharp.Hash
{
    public class Adress
    {
   
    public static readonly int CONTRACT_ADDRESS_PREFIX = 0;
    public static readonly int L2_ADDRESS_UPPER_BOUND = 0;

    public int ComputeHashOnElements(List<int> data)
    {
        int result = 0;
        foreach (var item in data)
        {
            result += item; 
        }
        return result;
    }

    public int ComputeAddress(int classHash, List<int> constructorCalldata, int salt, int deployerAddress = 0)
    {
        int constructorCalldataHash = ComputeHashOnElements(constructorCalldata);
        int rawAddress = ComputeHashOnElements(
            new List<int> {
            CONTRACT_ADDRESS_PREFIX,
            deployerAddress,
            salt,
            classHash,
            constructorCalldataHash
            }
        );

        return rawAddress % L2_ADDRESS_UPPER_BOUND;
    }
    }
}
