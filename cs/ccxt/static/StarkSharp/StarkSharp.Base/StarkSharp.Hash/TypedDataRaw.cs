using Newtonsoft.Json;
using System.Collections.Generic;

namespace StarkSharp.StarkSharp.Base.StarkSharp.Hash
{
    [JsonObject(MemberSerialization.OptIn)]
    public class TypedDataRaw
    {
        public IDictionary<string, MemberDescription[]> Types { get; set; }

        public string PrimaryType { get; set; }
        public MemberValue[] Message { get; set; }
        public MemberValue[] DomainRawValues { get; set; }
    }
}