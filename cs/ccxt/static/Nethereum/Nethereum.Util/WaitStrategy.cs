using System.Linq;
using System.Threading.Tasks;

namespace Nethereum.Util
{
#if !NET35
    public class WaitStrategy : IWaitStrategy
    {
        private static readonly int[] WaitIntervals = {1000, 2000, 5000, 10000, 15000};

        public Task ApplyAsync(uint retryCount)
        {
            var intervalMs = retryCount >= WaitIntervals.Length ? WaitIntervals.Last() : WaitIntervals[retryCount];

            return Task.Delay(intervalMs);
        }
    }
#endif
}