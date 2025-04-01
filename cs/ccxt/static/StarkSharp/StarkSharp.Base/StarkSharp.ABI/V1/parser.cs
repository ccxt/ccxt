using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;

namespace StarknetSharp.Abi
{
    public class AbiParser
    {
        public AbiParser()
        {
        }

        public Abi Parse(string abiJson)
        {
            var abi = JsonConvert.DeserializeObject<AbiDto>(abiJson);

            var functions = abi.Functions.Select(f => new Function(f.Name, ConvertParameters(f.Inputs), ConvertParameters(f.Outputs))).ToArray();
            var events = abi.Events.Select(e => new Event(e.Name, ConvertParameters(e.Data))).ToArray();
            var structures = abi.Structures.Select(s => new Struct(s.Name, ConvertParameters(s.Members))).ToArray();

            return new Abi(functions, events, structures);
        }

        private Parameter[] ConvertParameters(ParameterDto[] parameterDtos)
        {
            return parameterDtos.Select(p => new Parameter(p.Name, p.Type)).ToArray();
        }

    }

    public class AbiDto
    {
        public FunctionDto[] Functions { get; set; }
        public EventDto[] Events { get; set; }
        public StructDto[] Structures { get; set; }
    }

    public class FunctionDto
    {
        public string Name { get; set; }
        public ParameterDto[] Inputs { get; set; }
        public ParameterDto[] Outputs { get; set; }
    }

    public class EventDto
    {
        public string Name { get; set; }
        public ParameterDto[] Data { get; set; }
    }

    public class StructDto
    {
        public string Name { get; set; }
        public ParameterDto[] Members { get; set; }
    }

    public class ParameterDto
    {
        public string Name { get; set; }
        public string Type { get; set; }
    }

    public class Function
    {
        public Function(string name, Parameter[] inputs, Parameter[] outputs)
        {
            Name = name;
            Inputs = inputs;
            Outputs = outputs;
        }

        public string Name { get; set; }
        public Parameter[] Inputs { get; set; }
        public Parameter[] Outputs { get; set; }
    }

    public class Event
    {
        public Event(string name, Parameter[] data)
        {
            Name = name;
            Data = data;
        }

        public string Name { get; set; }
        public Parameter[] Data { get; set; }
    }

    public class Struct
    {
        public Struct(string name, Parameter[] members)
        {
            Name = name;
            Members = members;
        }

        public string Name { get; set; }
        public Parameter[] Members { get; set; }
    }

    public class Parameter
    {
        public Parameter(string name, string type)
        {
            Name = name;
            Type = type;
        }

        public string Name { get; set; }
        public string Type { get; set; }
    }
}