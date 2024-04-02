using System;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Math;

namespace Org.BouncyCastle.Crypto.Agreement.Srp
{
	/**
	 * Generates new SRP verifier for user
	 */
	public class Srp6VerifierGenerator
	{
	    protected BigInteger N;
	    protected BigInteger g;
	    protected IDigest digest;

	    public Srp6VerifierGenerator()
	    {
	    }

	    /**
	     * Initialises generator to create new verifiers
	     * @param N The safe prime to use (see DHParametersGenerator)
	     * @param g The group parameter to use (see DHParametersGenerator)
	     * @param digest The digest to use. The same digest type will need to be used later for the actual authentication
	     * attempt. Also note that the final session key size is dependent on the chosen digest.
	     */
	    public virtual void Init(BigInteger N, BigInteger g, IDigest digest)
	    {
	        this.N = N;
	        this.g = g;
	        this.digest = digest;
	    }

        public virtual void Init(Srp6GroupParameters group, IDigest digest)
        {
            Init(group.N, group.G, digest);
        }

        /**
	     * Creates a new SRP verifier
	     * @param salt The salt to use, generally should be large and random
	     * @param identity The user's identifying information (eg. username)
	     * @param password The user's password
	     * @return A new verifier for use in future SRP authentication
	     */
	    public virtual BigInteger GenerateVerifier(byte[] salt, byte[] identity, byte[] password)
	    {
	    	BigInteger x = Srp6Utilities.CalculateX(digest, N, salt, identity, password);

	        return g.ModPow(x, N);
	    }
	}
}

