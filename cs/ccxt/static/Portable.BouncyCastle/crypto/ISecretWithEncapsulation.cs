using System;

namespace Org.BouncyCastle.Crypto
{
    public interface ISecretWithEncapsulation
        : IDisposable 
    {
        
        ///<summary>
        /// Return the secret associated with the encapsulation.
        /// </summary>
        /// <returns> the secret the encapsulation is for.</returns>
        byte[] GetSecret();

        /// <summary>
        /// Return the data that carries the secret in its encapsulated form.
        /// </summary>
        /// <returns> the encapsulation of the secret.</returns>
        byte[] GetEncapsulation();
    }
}