using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Text;

namespace Nethereum.ABI.CompilationMetadata
{
    public static class CompilationMetadataDeserialiser
    {
        public static CompilationMetadata DeserialiseCompilationMetadata(string json)
        {
           return JsonConvert.DeserializeObject<CompilationMetadata>(json);    
        }
    }
    public class CompilationMetadata
    {
        /// <summary>
        /// Required: The version of the metadata format
        /// </summary>
        [JsonProperty("version")]
        public string Version { get; set; }
        /// <summary>
        /// Required: Source code language, basically selects a "sub-version"
        /// of the specification
        /// </summary>
        [JsonProperty("language")]
        public string Language { get; set; }

        [JsonProperty("compiler")]
        public Compiler Compiler { get; set; }

        [JsonProperty("output")]
        public Output Output { get; set; }

        [JsonProperty("sources")]
        public Dictionary<string, SourceCode> Sources { get; set; } = new Dictionary<string, SourceCode>();

        [JsonProperty("settings")]
        public Settings Settings { get; set; }
    }

    public class Compiler
    {
        [JsonProperty("version")]
        public string Version { get; set; }

        [JsonProperty("keccak256")]
        public string Keccak256 { get; set; }
    }

    public class Output
    {
        [JsonProperty("abi")]
        public JArray Abi { get; set; }

        [JsonProperty("devdoc")]
        public DevDoc DevDoc { get; set; }

        [JsonProperty("userdoc")]
        public UserDoc UserDoc { get; set; }
    }

    public class DevDocStatementBase
    {
        [JsonProperty("details")]
        public string Details { get; set; }

        [JsonProperty("notice")]
        public string Notice { get; set; }
    }

    public class DevDocStateVariable
    {
        [JsonProperty("details")]
        public string Details { get; set; }

        [JsonProperty("notice")]
        public string Notice { get; set; }
    }

    public class DevDocMethod: DevDocStatementBase
    {
       
        [JsonProperty("params")]
        public IDictionary<string, string> Params { get; set; }

        [JsonProperty("returns")]
        public IDictionary<string, string> Returns { get; set; }
        
    }

    public class DevDocError : DevDocStatementBase
    {

        [JsonProperty("params")]
        public IDictionary<string, string> Params { get; set; }

    }

    public class DevDocEvent : DevDocStatementBase
    {
        [JsonProperty("params")]
        public IDictionary<string, string> Params { get; set; }
    }

    public class DevDoc
    {
        [JsonProperty("author")]
        public string Author { get; set; }

        [JsonProperty("details")]
        public string Details { get; set; }

        [JsonProperty("errors")]
        public IDictionary<string, DevDocError> Errors { get; set; }

        [JsonProperty("events")]
        public IDictionary<string, DevDocEvent> Events { get; set; }

        [JsonProperty("kind")]
        public string Kind { get; set; }

        [JsonProperty("methods")]
        public IDictionary<string, DevDocMethod> Methods { get; set; }

        [JsonProperty("stateVariables")]
        public IDictionary<string, DevDocStateVariable> StateVariables { get; set; }

        [JsonProperty("title")]
        public string Title { get; set; }

        [JsonProperty("version")]
        public int Version { get; set; }
    }


    public class OptimizationDetails
    {
        [JsonProperty("peephole")]
        public bool PeepHole { get; set; }

        [JsonProperty("inliner")]
        public bool Inliner { get; set; }

        [JsonProperty("jumpdestRemover")]
        public bool JumpDestRemover { get; set; }

        [JsonProperty("orderLiterals")]
        public bool OrderLiterals { get; set; }

        [JsonProperty("deduplicate")]
        public bool Deduplicate { get; set; }

        [JsonProperty("cse")]
        public bool Cse { get; set; }

        [JsonProperty("constantOptimizer")]
        public bool ConstantOptimizer { get; set; }

        [JsonProperty("yul")]
        public bool Yul { get; set; }

        [JsonProperty("yulDetails")]
        public YulDetails YulDetails { get; set; }
    }


    public class Metadata
    {
        [JsonProperty("appendCBOR")]
        public bool AppendCBOR { get; set; }

        [JsonProperty("bytecodeHash")]
        public string BytecodeHash { get; set; }

        [JsonProperty("useLiteralContent")]
        public bool UseLiteralContent { get; set; }
    }


    public class Optimizer
    {
        [JsonProperty("enabled")]
        public bool Enabled { get; set; }

        [JsonProperty("runs")]
        public int Runs { get; set; }

        [JsonProperty("details")]
        public OptimizationDetails Details { get; set; }
    }

   

    public class SourceCode
    {
        [JsonProperty("content")]
        public string Content { get; set; }

        [JsonProperty("keccak256")]
        public string Keccak256 { get; set; }

        [JsonProperty("urls")]
        public List<string> Urls { get; set; } = new List<string>();

        [JsonProperty("license")]
        public string License { get; set; }
    }
    public class Settings
    {

        [JsonProperty("evmVersion")]
        public string EvmVersion { get; set; }

        [JsonProperty("remappings")]
        public List<string> Remappings { get; set; } = new List<string>();

        [JsonProperty("optimizer")]
        public Optimizer Optimizer { get; set; }

        [JsonProperty("metadata")]
        public Metadata Metadata { get; set; }

        [JsonProperty("compilationTarget")]
        public IDictionary<string, string> CompilationTarget { get; set; } = new Dictionary<string, string>();

        [JsonProperty("libraries")]
        public IDictionary<string, string> Libraries { get; set; } = new Dictionary<string, string>();
    }

    public class UserDocStatement 
    {
        [JsonProperty("notice")]
        public string Notice { get; set; }
    }

    public class UserDoc
    {
        [JsonProperty("errors")]
        public IDictionary<string, UserDocStatement> Errors { get; set; }

        [JsonProperty("events")]
        public IDictionary<string, UserDocStatement> Events { get; set; }

        [JsonProperty("kind")]
        public string Kind { get; set; }

        [JsonProperty("methods")]
        public IDictionary<string, UserDocStatement> Methods { get; set; }

        [JsonProperty("version")]
        public int Version { get; set; }
    }

    public class YulDetails
    {
        [JsonProperty("optimizerSteps")]
        public string OptimizerSteps { get; set; }

        [JsonProperty("stackAllocation")]
        public bool StackAllocation { get; set; }
    }
}
