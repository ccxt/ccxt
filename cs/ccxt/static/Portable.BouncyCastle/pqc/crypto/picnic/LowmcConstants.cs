using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;

using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Pqc.Crypto.Picnic;
using Org.BouncyCastle.Utilities.Encoders;

public sealed class LowmcConstants
{
    private static readonly LowmcConstants instance = new LowmcConstants();
    
    static LowmcConstants()
    {
    }

    private LowmcConstants()
    {
        _matrixToHex = new Dictionary<string, string>(); 
        Stream input = typeof(LowmcConstants).Assembly
            .GetManifestResourceStream("Org.BouncyCastle.pqc.crypto.picnic.lowmcconstants.properties");

        using (StreamReader sr = new StreamReader(input))
        {
            // load a properties file
            string line = sr.ReadLine();
            string matrix, hexString;

            while (line != null)
            {
                string header = line;
                if (header != "")
                {
                    header = header.Replace(",", "");
                    int index = header.IndexOf('=');
                    matrix = header.Substring(0, index).Trim();
                    hexString = header.Substring(index + 1).Trim();
                    _matrixToHex.Add(matrix, hexString);
                }

                line = sr.ReadLine();
            }
        }
        
        linearMatrices_L1 = ReadFromProperty("linearMatrices_L1", 40960);
        roundConstants_L1 = ReadFromProperty("roundConstants_L1", 320);
        keyMatrices_L1 = ReadFromProperty("keyMatrices_L1", 43008);
        LMatrix_L1 = new KMatrices(20, 128, 4, linearMatrices_L1);
        KMatrix_L1 = new KMatrices(21, 128, 4, keyMatrices_L1);
        RConstants_L1 = new KMatrices(0, 1, 4, roundConstants_L1);
        //
        linearMatrices_L1_full = ReadFromProperty("linearMatrices_L1_full", 12800);
        keyMatrices_L1_full = ReadFromProperty("keyMatrices_L1_full", 12900);
        keyMatrices_L1_inv = ReadFromProperty("keyMatrices_L1_inv", 2850);
        linearMatrices_L1_inv = ReadFromProperty("linearMatrices_L1_inv", 12800);
        roundConstants_L1_full = ReadFromProperty("roundConstants_L1_full", 80);
        LMatrix_L1_full =    new KMatrices(4, 129, 5, linearMatrices_L1_full);
        LMatrix_L1_inv =     new KMatrices(4, 129, 5, linearMatrices_L1_inv);
        KMatrix_L1_full =    new KMatrices(5, 129, 5, keyMatrices_L1_full);
        KMatrix_L1_inv =     new KMatrices(1, 129, 5, keyMatrices_L1_inv);
        RConstants_L1_full = new KMatrices(4, 1, 5, roundConstants_L1_full);
        //
        linearMatrices_L3 = ReadFromProperty("linearMatrices_L3", 138240);
        roundConstants_L3 = ReadFromProperty("roundConstants_L3", 720);
        keyMatrices_L3 = ReadFromProperty("keyMatrices_L3", 142848);
        LMatrix_L3 =    new KMatrices(30, 192, 6, linearMatrices_L3);
        KMatrix_L3 =    new KMatrices(31, 192, 6, keyMatrices_L3);
        RConstants_L3 = new KMatrices(30, 1, 6, roundConstants_L3);
        //
        linearMatrices_L3_full = ReadFromProperty("linearMatrices_L3_full", 18432);
        linearMatrices_L3_inv = ReadFromProperty("linearMatrices_L3_inv", 18432);
        roundConstants_L3_full = ReadFromProperty("roundConstants_L3_full", 96);
        keyMatrices_L3_full = ReadFromProperty("keyMatrices_L3_full", 23040);
        keyMatrices_L3_inv = ReadFromProperty("keyMatrices_L3_inv", 4608);
        LMatrix_L3_full =    new KMatrices(4, 192, 6, linearMatrices_L3_full);
        LMatrix_L3_inv =     new KMatrices(4, 192, 6, linearMatrices_L3_inv);
        KMatrix_L3_full =    new KMatrices(5, 192, 6, keyMatrices_L3_full);
        KMatrix_L3_inv =     new KMatrices(1, 192, 6, keyMatrices_L3_inv);
        RConstants_L3_full = new KMatrices(4, 1, 6, roundConstants_L3_full);
        //
        linearMatrices_L5 = ReadFromProperty("linearMatrices_L5", 311296);
        roundConstants_L5 = ReadFromProperty("roundConstants_L5", 1216);
        keyMatrices_L5 = ReadFromProperty("keyMatrices_L5", 319488);
        LMatrix_L5 =    new KMatrices(38, 256, 8, linearMatrices_L5);
        KMatrix_L5 =    new KMatrices(39, 256, 8, keyMatrices_L5);
        RConstants_L5 = new KMatrices(38, 1, 8, roundConstants_L5);
        //
        linearMatrices_L5_full = ReadFromProperty("linearMatrices_L5_full", 32768);
        linearMatrices_L5_inv = ReadFromProperty("linearMatrices_L5_inv", 32768);
        roundConstants_L5_full = ReadFromProperty("roundConstants_L5_full", 128);
        keyMatrices_L5_full = ReadFromProperty("keyMatrices_L5_full", 40960);
        keyMatrices_L5_inv = ReadFromProperty("keyMatrices_L5_inv", 8160);
        LMatrix_L5_full =    new KMatrices(4, 255, 8, linearMatrices_L5_full);
        LMatrix_L5_inv =    new KMatrices(4, 255, 8, linearMatrices_L5_inv);
        KMatrix_L5_full =    new KMatrices(5, 255, 8, keyMatrices_L5_full);
        KMatrix_L5_inv =    new KMatrices(1, 255, 8, keyMatrices_L5_inv);
        RConstants_L5_full = new KMatrices(4, 1, 8, roundConstants_L5_full);
    }

    public static LowmcConstants Instance
    {
        get { return instance; }
    }

    private static Dictionary<string, string> _matrixToHex;

    // Parameters for security level L1
    // Block/key size: 128
    // Rounds: 20
    private static uint[] linearMatrices_L1;
    private static uint[] roundConstants_L1;
    private static uint[] keyMatrices_L1;

    private static KMatrices LMatrix_L1;
    private static KMatrices KMatrix_L1;
    private static KMatrices RConstants_L1;

    // Parameters for security level L1, full s-box layer
    // Block/key size: 129
    // Rounds: 4
    // Note that each 129-bit row of the matrix is zero padded to 160 bits (the next multiple of 32)
    private static uint[] linearMatrices_L1_full;
    private static uint[] keyMatrices_L1_full;
    private static uint[] keyMatrices_L1_inv;
    private static uint[] linearMatrices_L1_inv;
    private static uint[] roundConstants_L1_full;

    private static KMatrices LMatrix_L1_full;
    private static KMatrices LMatrix_L1_inv;
    private static KMatrices KMatrix_L1_full;
    private static KMatrices KMatrix_L1_inv;
    private static KMatrices RConstants_L1_full;


    // Parameters for security level L3
    // Block/key size: 192
    // Rounds: 30
    private static uint[] linearMatrices_L3;
    private static uint[] roundConstants_L3;
    private static uint[] keyMatrices_L3;

    private static KMatrices LMatrix_L3;
    private static KMatrices KMatrix_L3;
    private static KMatrices RConstants_L3;

    // Parameters for security level L3, full s-box layer
    // Block/key size: 192
    // S-boxes: 64
    // Rounds: 4
    private static uint[] linearMatrices_L3_full;
    private static uint[] linearMatrices_L3_inv;
    private static uint[] roundConstants_L3_full;
    private static uint[] keyMatrices_L3_full;
    private static uint[] keyMatrices_L3_inv;

    private static KMatrices LMatrix_L3_full;
    private static KMatrices LMatrix_L3_inv;
    private static KMatrices KMatrix_L3_full;
    private static KMatrices KMatrix_L3_inv;
    private static KMatrices RConstants_L3_full;


    // Parameters for security level L5
    // Block/key size: 256
    // Rounds: 38
    private static uint[] linearMatrices_L5;
    private static uint[] roundConstants_L5;
    private static uint[] keyMatrices_L5;

    private static KMatrices LMatrix_L5;
    private static KMatrices KMatrix_L5;
    private static KMatrices RConstants_L5;

    // Parameters for security level L5, full nonlinear layer
    // Block/key size: 255
    // S-boxes: 85
    // Rounds: 4
    private static uint[] linearMatrices_L5_full;
    private static uint[] linearMatrices_L5_inv;
    private static uint[] roundConstants_L5_full;
    private static uint[] keyMatrices_L5_full;
    private static uint[] keyMatrices_L5_inv;

    private static KMatrices LMatrix_L5_full;
    private static KMatrices LMatrix_L5_inv;
    private static KMatrices KMatrix_L5_full;
    private static KMatrices KMatrix_L5_inv;
    private static KMatrices RConstants_L5_full;


    private static uint[] ReadFromProperty(string key, int intSize)
    {
        string s = _matrixToHex[key];
        byte[] bytes = Hex.Decode(s);
        uint[] ints = new uint[intSize];
        for (int i = 0; i < bytes.Length/4; i++)
        {
            ints[i] = Pack.LE_To_UInt32(bytes, i*4);
        }
                
        return ints;
    }

    
    
    // Functions to return individual matricies and round constants

    /* Return a pointer to the r-th matrix. The caller must know the dimensions */
    private KMatricesWithPointer GET_MAT(KMatrices m, int r)
    {
        KMatricesWithPointer mwp = new KMatricesWithPointer(m);
        mwp.SetMatrixPointer(r*mwp.GetSize());
        return mwp;
    }


    /* Return the LowMC linear matrix for this round */
    internal KMatricesWithPointer LMatrix(PicnicEngine engine, int round)
    {

        if(engine.stateSizeBits == 128)
        {
            return GET_MAT(LMatrix_L1, round);
        }
        else if(engine.stateSizeBits == 129)
        {
            return GET_MAT(LMatrix_L1_full, round);
        }
        else if(engine.stateSizeBits == 192)
        {
            if(engine.numRounds == 4)
            {
                return GET_MAT(LMatrix_L3_full, round);
            }
            else
            {
                return GET_MAT(LMatrix_L3, round);
            }
        }
        else if(engine.stateSizeBits == 255)
        {
            return GET_MAT(LMatrix_L5_full, round);
        }
        else if(engine.stateSizeBits == 256)
        {
            return GET_MAT(LMatrix_L5, round);
        }
        else
        {
            return null;
        }
    }

    /* Return the LowMC inverse linear layer matrix for this round */
    internal KMatricesWithPointer LMatrixInv(PicnicEngine engine, int round)
    {
        if(engine.stateSizeBits == 129)
        {
            return GET_MAT(LMatrix_L1_inv, round);
        }
        else if(engine.stateSizeBits == 192 && engine.numRounds == 4)
        {
            return GET_MAT(LMatrix_L3_inv, round);
        }
        else if(engine.stateSizeBits == 255)
        {
            return GET_MAT(LMatrix_L5_inv, round);
        }
        else
        {
            return null;
        }
    }

    /* Return the LowMC key matrix for this round */
    internal KMatricesWithPointer KMatrix(PicnicEngine engine, int round)
    {
        if(engine.stateSizeBits == 128)
        {
            return GET_MAT(KMatrix_L1, round);
        }
        else if(engine.stateSizeBits == 129)
        {
            return GET_MAT(KMatrix_L1_full, round);
        }
        else if(engine.stateSizeBits == 192)
        {
            if(engine.numRounds == 4)
            {
                return GET_MAT(KMatrix_L3_full, round);
            }
            else
            {
                return GET_MAT(KMatrix_L3, round);
            }
        }
        else if(engine.stateSizeBits == 255)
        {
            return GET_MAT(KMatrix_L5_full, round);
        }
        else if(engine.stateSizeBits == 256)
        {
            return GET_MAT(KMatrix_L5, round);
        }
        else
        {
            return null;
        }
    }

    /* Return the LowMC inverse key matrix for this round */
    internal KMatricesWithPointer KMatrixInv(PicnicEngine engine, int round)
    {
        if(engine.stateSizeBits == 129)
        {
            return GET_MAT(KMatrix_L1_inv, round);
        }
        else if(engine.stateSizeBits == 192 && engine.numRounds == 4)
        {
            return GET_MAT(KMatrix_L3_inv, round);
        }
        else if(engine.stateSizeBits == 255)
        {
            return GET_MAT(KMatrix_L5_inv, round);
        }
        else
        {
            return null;
        }
    }


    /* Return the LowMC round constant for this round */
    internal KMatricesWithPointer RConstant(PicnicEngine engine, int round)
    {
        if(engine.stateSizeBits == 128)
        {
            return GET_MAT(RConstants_L1, round);
        }
        else if(engine.stateSizeBits == 129)
        {
            return GET_MAT(RConstants_L1_full, round);
        }
        else if(engine.stateSizeBits == 192)
        {
            if(engine.numRounds == 4)
            {
                return GET_MAT(RConstants_L3_full, round);
            }
            else
            {
                return GET_MAT(RConstants_L3, round);
            }
        }
        else if(engine.stateSizeBits == 255)
        {
            return GET_MAT(RConstants_L5_full, round);
        }
        else if(engine.stateSizeBits == 256)
        {
            return GET_MAT(RConstants_L5, round);
        }
        else
        {
            return null;
        }
    }


}
