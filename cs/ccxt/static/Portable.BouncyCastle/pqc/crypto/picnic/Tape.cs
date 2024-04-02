using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Pqc.Crypto.Picnic;
using Org.BouncyCastle.Utilities;

public class Tape
{
    internal byte[][] tapes;
    internal int pos;
    int nTapes;

    private PicnicEngine engine;
    public Tape(PicnicEngine engine)
    {
        this.engine = engine;
        tapes = new byte[engine.numMPCParties][]; //[2 * engine.andSizeBytes];
        for (int i = 0; i < engine.numMPCParties; i++)
        {
            tapes[i] = new byte[2 * engine.andSizeBytes];
        }
        pos = 0;
        nTapes = engine.numMPCParties;
    }

    protected internal void SetAuxBits(byte[] input)
    {
        int last = engine.numMPCParties - 1;
        int pos = 0;
        int n = engine.stateSizeBits;

        for(int j = 0; j < engine.numRounds; j++)
        {
            for(int i = 0; i < n; i++)
            {
                Utils.SetBit(this.tapes[last], n + n*2*j  + i, Utils.GetBit(input, pos++));
            }
        }
    }

    /* Input is the tapes for one parallel repitition; i.e., tapes[t]
     * Updates the random tapes of all players with the mask values for the output of
     * AND gates, and computes the N-th party's share such that the AND gate invariant
     * holds on the mask values.
     */
    protected internal void ComputeAuxTape(byte[] inputs)
    {
        uint[] roundKey = new uint[PicnicEngine.LOWMC_MAX_WORDS];
        uint[] x = new uint[PicnicEngine.LOWMC_MAX_WORDS];
        uint[] y = new uint[PicnicEngine.LOWMC_MAX_WORDS];
        uint[] key = new uint[PicnicEngine.LOWMC_MAX_WORDS];
        uint[] key0 = new uint[PicnicEngine.LOWMC_MAX_WORDS];

        key0[engine.stateSizeWords - 1] = 0;
        TapesToParityBits(key0, engine.stateSizeBits);

//        System.out.print("key0: ");
//        for (int i = 0; i < key0.Length; i++)
//        {System.out.printf("%08x ", key0[i]);}System.out.Println();

        // key = key0 x KMatrix[0]^(-1)
        KMatricesWithPointer current = LowmcConstants.Instance.KMatrixInv(engine, 0);
        engine.matrix_mul(key, key0, current.GetData(), current.GetMatrixPointer());

//        System.out.print("key: ");
//        for (int i = 0; i < key0.Length; i++)
//        {System.out.printf("%08x ", key[i]);}System.out.Println();


        if(inputs != null)
        {
            Pack.UInt32_To_LE(Arrays.CopyOf(key, engine.stateSizeWords), inputs, 0);
        }


        for (int r = engine.numRounds; r > 0; r--)
        {
            current = LowmcConstants.Instance.KMatrix(engine, r);
            engine.matrix_mul(roundKey, key, current.GetData(), current.GetMatrixPointer());    // roundKey = key * KMatrix(r)

            engine.xor_array(x, x, roundKey, 0, engine.stateSizeWords);

            current = LowmcConstants.Instance.LMatrixInv(engine, r-1);
            engine.matrix_mul(y, x, current.GetData(), current.GetMatrixPointer());

            if(r == 1)
            {
                // Use key as input
                System.Array.Copy(key0, 0, x, 0, key0.Length);
            }
            else
            {
                this.pos = engine.stateSizeBits * 2 * (r - 1);
                // Read input mask shares from tapes
                TapesToParityBits(x, engine.stateSizeBits);
            }

            this.pos = engine.stateSizeBits * 2 * (r - 1) + engine.stateSizeBits;
            engine.aux_mpc_sbox(x, y, this);
        }

        // Reset the random tape counter so that the online execution uses the
        // same random bits as when computing the aux shares
        this.pos = 0;
    }

    private void TapesToParityBits(uint[] output, int outputBitLen)
    {
        for (int i = 0; i < outputBitLen; i++)
        {
            Utils.SetBitInWordArray(output, i, Utils.Parity16(TapesToWord()));
        }
    }

    protected internal uint TapesToWord()
    {
        byte[] shares = new byte[4];

        for (int i = 0; i < 16; i++)
        {
            byte bit = Utils.GetBit(this.tapes[i], this.pos);
            Utils.SetBit(shares, i, bit);
        }
        this.pos++;
        return Pack.LE_To_UInt32(shares, 0);
    }
}