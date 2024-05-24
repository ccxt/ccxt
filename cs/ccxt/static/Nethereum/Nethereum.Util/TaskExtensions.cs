using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Nethereum.Util
{
    /// <summary>
    /// https://stackoverflow.com/a/15136833/4993930
    /// </summary>
    public static class TaskExtensions
    {
#if !DOTNET35
        /// <summary>
        /// Enumerates a collection in parallel and calls an async method on each item. Useful for making 
        /// parallel async calls, e.g. independent web requests when the degree of parallelism needs to be
        /// limited.
        /// </summary>
        public static Task ForEachAsync<T>(this IEnumerable<T> source, int degreeOfParalellism, Func<T, Task> action)
        {
            return Task.WhenAll(Partitioner.Create(source).GetPartitions(degreeOfParalellism).Select(partition => Task.Run(async () =>
            {
                using (partition)
                    while (partition.MoveNext())
                        await action(partition.Current);
            })));
        }
        public static Task ForEachAsync<T>(this IEnumerable<T> source, Func<T, Task> action)
        {
            return Task.WhenAll(Partitioner.Create(source).GetPartitions(Environment.ProcessorCount).Select(partition => Task.Run(async () =>
            {
                using (partition)
                    while (partition.MoveNext())
                        await action(partition.Current);
            })));
        }
#endif
    }

}
