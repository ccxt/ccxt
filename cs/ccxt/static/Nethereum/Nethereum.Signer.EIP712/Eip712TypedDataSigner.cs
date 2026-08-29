using Nethereum.ABI.EIP712;
using Nethereum.Util;

namespace Nethereum.Signer.EIP712
{

    /// <summary>
    /// Implementation of EIP-712 signer
    /// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md
    /// </summary>
    public class Eip712TypedDataSigner
    {

        // private readonly EthereumMessageSigner _signer = new EthereumMessageSigner();
        // public static Eip712TypedDataSigner Current { get; } = new Eip712TypedDataSigner();

        // /// <summary>
        // /// Encodes data according to EIP-712, hashes it and signs with <paramref name="key"/>.
        // /// Infers types of message fields from <see cref="Nethereum.ABI.FunctionEncoding.Attributes.ParameterAttribute"/>.
        // /// For flat messages only, for complex messages with reference type fields use "SignTypedData(TypedData typedData, EthECKey key)" method.
        // /// </summary>
        // public string SignTypedData<T, TDomain>(T data, TDomain domain, string primaryTypeName, EthECKey key) 
        // {
        //     var typedData = Eip712TypedDataEncoder.Current.GenerateTypedData(data, domain, primaryTypeName);

        //     return SignTypedData(typedData, key);
        // }


        // /// <summary>
        // /// Encodes data according to EIP-712, hashes it and signs with <paramref name="key"/>.
        // /// </summary>
        // public string SignTypedData<TDomain>(TypedData<TDomain> typedData, EthECKey key) 
        // { 
        //     var encodedData = EncodeTypedData(typedData);
        //     return _signer.HashAndSign(encodedData, key);
        // }

        // /// <summary>
        // /// Encodes data according to EIP-712, hashes it and signs with <paramref name="key"/>.
        // /// Matches the signature produced by eth_signTypedData_v4
        // /// </summary>
        // public string SignTypedDataV4<TDomain>(TypedData<TDomain> typedData, EthECKey key) 
        // {
        //     var encodedData = EncodeTypedData(typedData);
        //     var signature = key.SignAndCalculateV(Sha3Keccack.Current.CalculateHash(encodedData));
        //     return EthECDSASignature.CreateStringSignature(signature);
        // }

        // public string SignTypedDataV4(string json, EthECKey key)
        // {
        //     var encodedData = EncodeTypedData(json);
        //     var signature = key.SignAndCalculateV(Sha3Keccack.Current.CalculateHash(encodedData));
        //     return EthECDSASignature.CreateStringSignature(signature);
        // }

        // /// <summary>
        // /// Sign typed data using a non standard json (streamlined)
        // /// if a Domain type is not included in the json, the generic DomainType will be used
        // /// enables using a different message key selector
        // /// if a primary type is not set and if it includes only a single type this will be used as the primary type
        // /// </summary>
        // public string SignTypedDataV4<TDomain>(string json, EthECKey key, string messageKeySelector = "message")
        // {
        //     var encodedData = EncodeTypedData<TDomain>(json, messageKeySelector);
        //     var signature = key.SignAndCalculateV(Sha3Keccack.Current.CalculateHash(encodedData));
        //     return EthECDSASignature.CreateStringSignature(signature);
        // }


        // /// <summary>
        // /// Signs using a predefined typed data schema and converts and encodes the provide the message value
        // /// </summary>
        // public string SignTypedDataV4<T, TDomain>(T message, TypedData<TDomain> typedData, EthECKey key) 
        // {
        //     var encodedData = EncodeTypedData(message, typedData);
        //     var signature = key.SignAndCalculateV(Sha3Keccack.Current.CalculateHash(encodedData));
        //     return EthECDSASignature.CreateStringSignature(signature);
        // }

        // public string RecoverFromSignatureV4<T,TDomain>(T message, TypedData<TDomain> typedData, string signature) 
        // {
        //     typedData.EnsureDomainRawValuesAreInitialised();
        //     var encodedData = EncodeTypedData(message, typedData);
        //     return new MessageSigner().EcRecover(Sha3Keccack.Current.CalculateHash(encodedData), signature);
        // }

        // public string RecoverFromSignatureV4<TDomain>(TypedData<TDomain> typedData, string signature) 
        // {
        //     typedData.EnsureDomainRawValuesAreInitialised();
        //     var encodedData = EncodeTypedDataRaw(typedData);
        //     return  new MessageSigner().EcRecover(Sha3Keccack.Current.CalculateHash(encodedData), signature);
        // }

        // public string RecoverFromSignatureV4(string json, string signature, string messageKeySelector = "message")
        // {
        //     var encodedData = EncodeTypedData<Domain>(json, messageKeySelector);
        //     return new MessageSigner().EcRecover(Sha3Keccack.Current.CalculateHash(encodedData), signature);
        // }


        // public string RecoverFromSignatureV4(byte[] encodedData, string signature)
        // {
        //     return new MessageSigner().EcRecover(Sha3Keccack.Current.CalculateHash(encodedData), signature);
        // }

        // public string RecoverFromSignatureHashV4(byte[] hash, string signature)
        // {
        //     return new MessageSigner().EcRecover(hash, signature);
        // }

        public byte[] EncodeTypedData<TDomain>(TypedData<TDomain> typedData)
        {
            return Eip712TypedDataEncoder.Current.EncodeTypedData(typedData);
        }

        public byte[] EncodeTypedDataRaw(TypedDataRaw typedData)
        {
            return Eip712TypedDataEncoder.Current.EncodeTypedDataRaw(typedData);
        }

        public byte[] EncodeTypedData(string json)
        {
            return Eip712TypedDataEncoder.Current.EncodeTypedData(json);
        }


        /// <summary>
        /// Encode typed data using a non standard json (streamlined)
        /// if a Domain type is not included in the json, the generic DomainType will be used
        /// enables using a different message key selector
        /// if a primary type is not set and if it includes only a single type this will be used as the primary type
        /// </summary>
        public byte[] EncodeTypedData<TDomain>(string json, string messageKeySelector = "message")
        {
            return Eip712TypedDataEncoder.Current.EncodeTypedData<TDomain>(json, messageKeySelector);
        }

        public byte[] EncodeTypedData<T, TDomain>(T message, TypedData<TDomain> typedData)
        {
            return Eip712TypedDataEncoder.Current.EncodeTypedData(message, typedData);
        }


    }
}