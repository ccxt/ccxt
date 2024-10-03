using Nethereum.ABI.Model;
using System.Collections.Generic;
using System.Numerics;

namespace Nethereum.ABI.ABIRepository
{
    public interface IABIInfoStorage
    {
        void AddABIInfo(ABIInfo abiInfo);
        ErrorABI FindErrorABI(BigInteger chainId, string contractAddress, string signature);
        List<ErrorABI> FindErrorABI(string signature);
        EventABI FindEventABI(BigInteger chainId, string contractAddress, string signature);
        List<EventABI> FindEventABI(string signature);
        FunctionABI FindFunctionABI(BigInteger chainId, string contractAddress, string signature);
        List<FunctionABI> FindFunctionABI(string signature);
        FunctionABI FindFunctionABIFromInputData(BigInteger chainId, string contractAddress, string inputData);
        List<FunctionABI> FindFunctionABIFromInputData(string inputData);
        ABIInfo GetABIInfo(BigInteger chainId, string contractAddress);
    }
}