using System;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Crypto.Agreement.Srp
{
	/**
	 * Implements the client side SRP-6a protocol. Note that this class is stateful, and therefore NOT threadsafe.
	 * This implementation of SRP is based on the optimized message sequence put forth by Thomas Wu in the paper
	 * "SRP-6: Improvements and Refinements to the Secure Remote Password Protocol, 2002"
	 */
	public class Srp6Client
	{
	    protected BigInteger N;
	    protected BigInteger g;

	    protected BigInteger privA;
	    protected BigInteger pubA;

	    protected BigInteger B;

	    protected BigInteger x;
	    protected BigInteger u;
	    protected BigInteger S;

        protected BigInteger M1;
	    protected BigInteger M2;
	    protected BigInteger Key;

        protected IDigest digest;
	    protected SecureRandom random;

	    public Srp6Client()
	    {
	    }

	    /**
	     * Initialises the client to begin new authentication attempt
	     * @param N The safe prime associated with the client's verifier
	     * @param g The group parameter associated with the client's verifier
	     * @param digest The digest algorithm associated with the client's verifier
	     * @param random For key generation
	     */
	    public virtual void Init(BigInteger N, BigInteger g, IDigest digest, SecureRandom random)
	    {
	        this.N = N;
	        this.g = g;
	        this.digest = digest;
	        this.random = random;
	    }

        public virtual void Init(Srp6GroupParameters group, IDigest digest, SecureRandom random)
        {
            Init(group.N, group.G, digest, random);
        }

	    /**
	     * Generates client's credentials given the client's salt, identity and password
	     * @param salt The salt used in the client's verifier.
	     * @param identity The user's identity (eg. username)
	     * @param password The user's password
	     * @return Client's public value to send to server
	     */
	    public virtual BigInteger GenerateClientCredentials(byte[] salt, byte[] identity, byte[] password)
	    {
	        this.x = Srp6Utilities.CalculateX(digest, N, salt, identity, password);
	        this.privA = SelectPrivateValue();
	        this.pubA = g.ModPow(privA, N);

	        return pubA;
	    }

	    /**
	     * Generates client's verification message given the server's credentials
	     * @param serverB The server's credentials
	     * @return Client's verification message for the server
	     * @throws CryptoException If server's credentials are invalid
	     */
	    public virtual BigInteger CalculateSecret(BigInteger serverB)
	    {
	        this.B = Srp6Utilities.ValidatePublicValue(N, serverB);
	        this.u = Srp6Utilities.CalculateU(digest, N, pubA, B);
	        this.S = CalculateS();

	        return S;
	    }

	    protected virtual BigInteger SelectPrivateValue()
	    {
	    	return Srp6Utilities.GeneratePrivateValue(digest, N, g, random);    	
	    }

	    private BigInteger CalculateS()
	    {
	        BigInteger k = Srp6Utilities.CalculateK(digest, N, g);
	        BigInteger exp = u.Multiply(x).Add(privA);
	        BigInteger tmp = g.ModPow(x, N).Multiply(k).Mod(N);
	        return B.Subtract(tmp).Mod(N).ModPow(exp, N);
	    }
    
        /**
	     * Computes the client evidence message M1 using the previously received values.
	     * To be called after calculating the secret S.
	     * @return M1: the client side generated evidence message
	     * @throws CryptoException
	     */
	    public virtual BigInteger CalculateClientEvidenceMessage()
	    {
		    // Verify pre-requirements
		    if (this.pubA == null || this.B == null || this.S == null)
		    {
			    throw new CryptoException("Impossible to compute M1: " +
					    "some data are missing from the previous operations (A,B,S)");
		    }
		    // compute the client evidence message 'M1'
		    this.M1 = Srp6Utilities.CalculateM1(digest, N, pubA, B, S);  
		    return M1;
	    }

        /** Authenticates the server evidence message M2 received and saves it only if correct.
	     * @param M2: the server side generated evidence message
	     * @return A boolean indicating if the server message M2 was the expected one.
	     * @throws CryptoException
	     */
	    public virtual bool VerifyServerEvidenceMessage(BigInteger serverM2)
	    {
		    // Verify pre-requirements
		    if (this.pubA == null || this.M1 == null || this.S == null)
		    {
			    throw new CryptoException("Impossible to compute and verify M2: " +
					    "some data are missing from the previous operations (A,M1,S)");
		    }

		    // Compute the own server evidence message 'M2'
		    BigInteger computedM2 = Srp6Utilities.CalculateM2(digest, N, pubA, M1, S);
		    if (computedM2.Equals(serverM2))
		    {
			    this.M2 = serverM2;
			    return true;
		    }
		    return false;
	    }

	    /**
	     * Computes the final session key as a result of the SRP successful mutual authentication
	     * To be called after verifying the server evidence message M2.
	     * @return Key: the mutually authenticated symmetric session key
	     * @throws CryptoException
	     */
	    public virtual BigInteger CalculateSessionKey()
	    {
		    // Verify pre-requirements (here we enforce a previous calculation of M1 and M2)
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
