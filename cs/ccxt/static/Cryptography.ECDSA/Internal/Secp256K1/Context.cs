namespace Cryptography.ECDSA.Internal.Secp256K1
{
    /// <summary>
    /// Opaque data structure that holds context information (precomputed tables etc.).
    /// 
    /// The purpose of context structures is to cache large precomputed data tables 
    /// that are expensive to construct, and also to maintain the randomization data for blinding.
    /// 
    /// Do not create a new context object for each operation, as construction is
    /// far slower than all other API calls (~100 times slower than an ECDSA  verification).
    /// 
    /// A constructed context can safely be used from multiple threads
    /// simultaneously, but API call that take a non-const pointer to a context
    /// need exclusive access to it. In particular this is the case for
    /// secp256k1_context_destroy and secp256k1_context_randomize.
    /// 
    /// Regarding randomization, either do it once at creation time (in which case
    /// you do not need any locking for the other calls), or use a read-write lock.
    /// </summary>
    internal class Context : ContextStruct
    {
    }
}