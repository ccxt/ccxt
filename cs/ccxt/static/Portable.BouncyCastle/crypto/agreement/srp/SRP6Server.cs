using System;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Crypto.Agreement.Srp
{
	/**
	 * Implements the server side SRP-6a protocol. Note that this class is stateful, and therefore NOT threadsafe.
	 * This implementation of SRP is based on the optimized message sequence put forth by Thomas Wu in the paper
	 * "SRP-6: Improvements and Refinements to the Secure Remote Password Protocol, 2002"
	 */
	public class Srp6Server
	{
	    protected BigInteger N;
	    protected BigInteger g;
	    protected BigInteger v;

	    protected SecureRandom random;
	    protected IDigest digest;

	    protected BigInteger A;

	    protected BigInteger privB;
	    protected BigInteger pubB;

	    protected BigInteger u;
	    protected BigInteger S;
        protected BigInteger M1;
        protected BigInteger M2;
        protected BigInteger Key;

	    public Srp6Server()
	    {
	    }

	    /**
	     * Initialises the server to accept a new client authentication attempt
	     * @param N The safe prime associated with the client's verifier
	     * @param g The group parameter associated with the client's verifier
	     * @param v The client's verifier
	     * @param digest The digest algorithm associated with the client's verifier
	     * @param random For key generation
	     */
	    public virtual void Init(BigInteger N, BigInteger g, BigInteger v, IDigest digest, SecureRandom random)
	    {
	        this.N = N;
	        this.g = g;
	        this.v = v;

	        this.random = random;
	        this.digest = digest;
	    }

        public virtual void Init(Srp6GroupParameters group, BigInteger v, IDigest digest, SecureRandom random)
        {
            Init(group.N, group.G, v, digest, random);
        }

	    /**
	     * Generates the server's credentials that are to be sent to the client.
	     * @return The server's public value to the client
	     */
	    public virtual BigInteger GenerateServerCredentials()
	    {
	        BigInteger k = Srp6Utilities.CalculateK(digest, N, g);
	        this.privB = SelectPrivateValue();
	    	this.pubB = k.Multiply(v).Mod(N).Add(g.ModPow(privB, N)).Mod(N);

	        return pubB;
	    }

	    /**
	     * Processes the client's credentials. If valid the shared secret is generated and returned.
	     * @param clientA The client's credentials
	     * @return A shared secret BigInteger
	     * @throws CryptoException If client's credentials are invalid
	     */
	    public virtual BigInteger CalculateSecret(BigInteger clientA)
	    {
	        this.A = Srp6Utilities.ValidatePublicValue(N, clientA);
	        this.u = Srp6Utilities.CalculateU(digest, N, A, pubB);
	        this.S = CalculateS();

	        return S;
	    }

	    protected virtual BigInteger SelectPrivateValue()
	    {
	    	return Srp6Utilities.GeneratePrivateValue(digest, N, g, random);    	
	    }

        private BigInteger CalculateS()
	    {
			return v.ModPow(u, N).Multiply(A).Mod(N).ModPow(privB, N);
	    }

        /** 
	     * Authenticates the received client evidence message M1 and saves it only if correct.
	     * To be called after calculating the secret S.
	     * @param M1: the client side generated evidence message
	     * @return A boolean indicating if the client message M1 was the expected one.
	     * @throws CryptoException 
	     */
	    public virtual bool VerifyClientEvidenceMessage(BigInteger clientM1)
	    {
		    // Verify pre-requirements
		    if (this.A == null || this.pubB == null || this.S == null)
		    {
			    throw new CryptoException("Impossible to compute and verify M1: " +
					    "some data are missing from the previous operations (A,B,S)");
		    }

		    // Compute the own client evidence message 'M1'
		    BigInteger computedM1 = Srp6Utilities.CalculateM1(digest, N, A, pubB, S);
		    if (computedM1.Equals(clientM1))
		    {
			    this.M1 = clientM1;
			    return true;
		    }
		    return false;
	    }

        /**
	     * Computes the server evidence message M2 using the previously verified values.
	     * To be called after successfully verifying the client evidence message M1.
	     * @return M2: the server side generated evidence message
	     * @throws CryptoException
	     */
	    public virtual BigInteger CalculateServerEvidenceMessage()
	    {
		    // Verify pre-requirements
		    if (this.A == null || this.M1 == null || this.S == null)
		    {
			    throw new CryptoException("Impossible to compute M2: " +
					    "some data are missing from the previous operations (A,M1,S)");
		    }

            // Compute the server evidence message 'M2'
		    this.M2 = Srp6Utilities.CalculateM2(digest, N, A, M1, S);  
		    return M2;
	    }

        /**
	     * Computes the final session key as a result of the SRP successful mutual authentication
	     * To be called after calculating the server evidence message M2.
	     * @return Key: the mutual authenticated symmetric session key
	     * @throws CryptoException
	     */
	    public virtual BigInteger CalculateSessionKey()
	    {
		    // Verify pre-requirements
		    if (this.S == null || this.M1 == null || this.M2 == null)
		    {
			    throw new CryptoException("Impossible to compute Key: " +
					    "some data are missing from the previous operations (S,M1,M2)");
		    }
		    this.Key = Srp6Utilities.CalculateKey(digest, N, S);
		    return Key;
	    }
	}
}
