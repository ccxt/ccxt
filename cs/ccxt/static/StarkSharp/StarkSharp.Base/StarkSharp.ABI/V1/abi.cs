using StarkSharp.Base.Cairo;
using System;
using System.Collections.Generic;
using System.Linq;

namespace StarknetSharp.Abi
{
    public class Abi
    {
        public Abi(Function[] functions, Event[] events, Struct[] structures)
        {
            Functions = functions;
            Events = events;
            Structures = structures;
        }

        public Function[] Functions { get; set; }
        public Event[] Events { get; set; }
        public Struct[] Structures { get; set; }
    }
}