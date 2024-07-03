using System;
using System.Collections.Generic;

namespace StarkSharp.Connectors.Components
{
    public class QueryInteraction
    {
        public QueryInteractionType _queryType;
        public string[] _query { get; set; }

        public enum QueryInteractionType
        {
            starknet_getClassHashAt,
            starknet_getStorageAt,
            starknet_getStateUpdate,
            starknet_getBlockWithTxHashes,
            starknet_getBlockWithTxs,
            starknet_getClass,
            starknet_getClassAt,
            starknet_getTransactionByBlockIdAndIndex,
            starknet_getTransactionReceipt,
            starknet_getBlockTransactionCount,
            starknet_getTransactionByHash,
            starknet_pendingTransactions,
            starknet_blockHashAndNumber,
            starknet_blockNumber,
            starknet_chainId,
            starknet_syncing
        }
        public QueryInteraction(QueryInteractionType queryInteractionType, List<string> query)
        {
            _queryType = queryInteractionType;
            _query = query.ToArray();
        }
    }
}
