using Newtonsoft.Json;
using System.Collections.Generic;

namespace Nethereum.ABI.EIP712
{
    [JsonObject(MemberSerialization.OptIn)]
    public class TypedData<TDomain>: TypedDataRaw
    { 
        
        public TDomain Domain { get; set; }

        public void InitDomainRawValues()
        {
            DomainRawValues = MemberValueFactory.CreateFromMessage(Domain);
        }

        public void SetMessage<T>(T message)
        {
            Message = MemberValueFactory.CreateFromMessage(message);
        }

        public void EnsureDomainRawValuesAreInitialised()
        {
           if(DomainRawValues == null)
            {
                InitDomainRawValues();
            }
        }
    }
}