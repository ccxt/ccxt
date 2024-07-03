using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StarkSharp.Base.Net
{
    public class NetEnum
    {
        public enum Tag
        {
            Pending,
            Latest
        }

        public enum CallType
        {
            Pure,
            View,
            NonConst
        }

        public enum EventType
        {
            Emit,
            Init
        }
        public enum L1toL2Type
        {
            Finalize,
            Retry
        }
        public enum TransactionType
        {
            Invoke,
            Declare,
            DeployAccount,
            Deploy,
            L1Handler
        }

    }
}
