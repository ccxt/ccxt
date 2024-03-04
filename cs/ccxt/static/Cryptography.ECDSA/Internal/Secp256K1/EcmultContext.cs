namespace Cryptography.ECDSA.Internal.Secp256K1
{
    internal class EcMultContext
    {
        //For accelerating the computation of a*P + b*G:
        public GeStorage[] PreG;    //odd multiples of the generator
#if USE_ENDOMORPHISM
        public secp256k1_ge_storage[] pre_g_128; // odd multiples of 2^128*generator
#endif
    }
}