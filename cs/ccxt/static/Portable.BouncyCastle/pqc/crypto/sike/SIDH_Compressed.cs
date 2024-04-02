using System;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.Sike
{
internal class SIDH_Compressed
{
    private SIKEEngine engine;

    public SIDH_Compressed(SIKEEngine engine)
    {
        this.engine = engine;
    }
    protected void init_basis(ulong[] gen, ulong[][] XP, ulong[][] XQ, ulong[][] XR)
    { // Initialization of basis points

        engine.fpx.fpcopy(gen, 0, XP[0]);
        engine.fpx.fpcopy(gen,   engine.param.NWORDS_FIELD, XP[1]);
        engine.fpx.fpcopy(gen, 2*engine.param.NWORDS_FIELD, XQ[0]);
        engine.fpx.fpcopy(gen, 3*engine.param.NWORDS_FIELD, XQ[1]);
        engine.fpx.fpcopy(gen, 4*engine.param.NWORDS_FIELD, XR[0]);
        engine.fpx.fpcopy(gen, 5*engine.param.NWORDS_FIELD, XR[1]);
    }


    protected internal void FormatPrivKey_B(byte[] skB)
    {
        skB[engine.param.SECRETKEY_B_BYTES-2] &= (byte)engine.param.MASK3_BOB;
        skB[engine.param.SECRETKEY_B_BYTES-1] &= (byte)engine.param.MASK2_BOB;    // Clear necessary bits so that 3*ephemeralsk is still less than Bob_order
        engine.fpx.mul3(skB);       // Multiply ephemeralsk by 3
    }

    // Generation of Alice's secret key
    // Outputs random value in [0, 2^eA - 1]
    protected void random_mod_order_A(byte[] random_digits, SecureRandom random)
    {
        byte[] temp = new byte[engine.param.SECRETKEY_A_BYTES];
        random.NextBytes(temp);
        System.Array.Copy(temp, 0, random_digits, 0, engine.param.SECRETKEY_A_BYTES);
        random_digits[0] &= 0xFE;                            // Make private scalar even
        random_digits[engine.param.SECRETKEY_A_BYTES-1] &= (byte)engine.param.MASK_ALICE;    // Masking last byte
    }

    // Generation of Bob's secret key
    // Outputs random value in [0, 2^Floor(Log(2, oB)) - 1]
    protected void random_mod_order_B(byte[] random_digits, SecureRandom random)
    {
        byte[] temp = new byte[engine.param.SECRETKEY_B_BYTES];
        random.NextBytes(temp);
        System.Array.Copy(temp, 0, random_digits, 0, engine.param.SECRETKEY_A_BYTES);
        FormatPrivKey_B(random_digits);
    }

    // Project 3-pouint ladder
    protected void Ladder3pt_dual(PointProj[] Rs, ulong[] m, uint AliceOrBob, PointProj R, ulong[][] A24)
    {
        PointProj R0 = new PointProj(engine.param.NWORDS_FIELD),
                  R2 = new PointProj(engine.param.NWORDS_FIELD);
        ulong mask;
        uint i, nbits, bit, swap, prevbit = 0;

        if (AliceOrBob == engine.param.ALICE)
        {
            nbits = engine.param.OALICE_BITS;
        } else
        {
            nbits = engine.param.OBOB_BITS;
        }

        engine.fpx.fp2copy(Rs[1].X, R0.X);
        engine.fpx.fp2copy(Rs[1].Z, R0.Z);
        engine.fpx.fp2copy(Rs[2].X, R2.X);
        engine.fpx.fp2copy(Rs[2].Z, R2.Z);
        engine.fpx.fp2copy(Rs[0].X, R.X);
        engine.fpx.fp2copy(Rs[0].Z, R.Z);

        // Main loop
        for (i = 0; i < nbits; i++)
        {
            bit = (uint ) ((m[i >> (int)Internal.LOG2RADIX] >> (int)(i & (Internal.RADIX-1))) & 1);
            swap = bit ^ prevbit;
            prevbit = bit;
            mask = 0 - (ulong)swap;

            engine.isogeny.swap_points(R, R2, mask);
            engine.isogeny.xDBLADD(R0, R2, R.X, A24);
            engine.fpx.fp2mul_mont(R2.X, R.Z, R2.X);
        }
        swap = 0 ^ prevbit;
        mask = 0 - (ulong)swap;
        engine.isogeny.swap_points(R, R2, mask);
    }



    protected void Elligator2(ulong[][] a24, uint[] r, uint rIndex, ulong[][] x, byte[] bit, uint bitOffset, uint COMPorDEC)
    { // Generate an x-coordinate of a pouint on curve with (affine) coefficient a24 
        // Use the counter r
        uint i;
        ulong[] one_fp = new ulong[engine.param.NWORDS_FIELD],
                a2 = new ulong[engine.param.NWORDS_FIELD],
                b2 = new ulong[engine.param.NWORDS_FIELD],
                N = new ulong[engine.param.NWORDS_FIELD],
                temp0 = new ulong[engine.param.NWORDS_FIELD],
                temp1 = new ulong[engine.param.NWORDS_FIELD];
        ulong[][] A = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            y2 = Utils.InitArray(2, engine.param.NWORDS_FIELD);
        uint t_ptr = 0;

//        System.out.print("a24: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", a24[di][dj] );}System.out.Println();}

        engine.fpx.fpcopy(engine.param.Montgomery_one, 0, one_fp);
        engine.fpx.fp2add(a24, a24, A);
        engine.fpx.fpsubPRIME(A[0], one_fp, A[0]);
        engine.fpx.fp2add(A, A, A);                       // A = 4*a24-2


//        System.out.print("A: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", A[di][dj] );}System.out.Println();}

        // Elligator computation
        t_ptr = r[rIndex]; //(ulong[][] *)&v_3_torsion[r];
        engine.fpx.fp2mul_mont(A, engine.param.v_3_torsion[t_ptr], x);     // x = A*v; v := 1/(1 + U*r^2) table lookup
        engine.fpx.fp2neg(x);                             // x = -A*v;

//        System.out.print("x: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", x[di][dj] );}System.out.Println();}


        if (COMPorDEC == 0) //COMPRESSION
        {
            engine.fpx.fp2add(A, x, y2);                      // y2 = x + A
            engine.fpx.fp2mul_mont(y2,  x,  y2);              // y2 = x*(x + A)
            engine.fpx.fpaddPRIME(y2[0],  one_fp,  y2[0]);         // y2 = x(x + A) + 1
            engine.fpx.fp2mul_mont(x, y2, y2);                // y2 = x*(x^2 + Ax + 1);
            engine.fpx.fpsqr_mont(y2[0], a2);
            engine.fpx.fpsqr_mont(y2[1], b2);
            engine.fpx.fpaddPRIME(a2, b2, N);                      // N := norm(y2);

//            System.out.print("N: ");
//            for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//            {System.out.printf("%016x ", N[dj] );}System.out.Println();

            engine.fpx.fpcopy(N,0, temp0);
            for (i = 0; i < engine.param.OALICE_BITS - 2; i++)
            {
                engine.fpx.fpsqr_mont(temp0,  temp0);
            }
            for (i = 0; i < engine.param.OBOB_EXPON; i++)
            {
                engine.fpx.fpsqr_mont(temp0,  temp1);
                engine.fpx.fpmul_mont(temp0,  temp1,  temp0);
            }
            engine.fpx.fpsqr_mont(temp0, temp1);              // z = N^((p + 1) div 4);
            engine.fpx.fpcorrectionPRIME(temp1);
            engine.fpx.fpcorrectionPRIME(N);

//            System.out.print("N: ");
//            for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//            {System.out.printf("%016x ", N[dj] );}System.out.Println();

            if(!Fpx.subarrayEquals(temp1, N, engine.param.NWORDS_FIELD))
            {
                engine.fpx.fp2neg(x);
                engine.fpx.fp2sub(x, A, x);     // x = -x - A;
                if (COMPorDEC == 0)
                {
                    bit[bitOffset] = 1;
                }
            }
        }
        else
        {
            if (bit[bitOffset] == 1) // todo check
            {
                engine.fpx.fp2neg(x);
                engine.fpx.fp2sub(x,A,x);       // x = -x - A;
            }
        }
//        System.out.print("x: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", x[di][dj] );}System.out.Println();}
    }


    protected void make_positive(ulong[][] x)
    {
        uint nbytes = engine.param.NWORDS_FIELD;
        ulong[] zero = new ulong[engine.param.NWORDS_FIELD];

        engine.fpx.from_fp2mont(x, x);
        if (!Fpx.subarrayEquals(x[0], zero, nbytes))
        {
            if ((x[0][0] & 1) == 1)
            {
                engine.fpx.fp2neg(x);
            }
        }
        else
        {
            if ((x[1][0] & 1) == 1)
            {
                engine.fpx.fp2neg(x);
            }
        }
        engine.fpx.to_fp2mont(x, x);
    }


    protected void BiQuad_affine(ulong[][] a24, ulong[][] x0, ulong[][] x1, PointProj R)
    {
        ulong[][] Ap2 = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            aa = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            bb = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            cc = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            t0 = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            t1 = Utils.InitArray(2, engine.param.NWORDS_FIELD);

        engine.fpx.fp2add(a24, a24, Ap2);
        engine.fpx.fp2add(Ap2, Ap2, Ap2);    // Ap2 = a+2 = 4*a24

        engine.fpx.fp2sub(x0, x1, aa);
        engine.fpx.fp2sqr_mont(aa, aa);

        engine.fpx.fp2mul_mont(x0, x1, cc);
        engine.fpx.fpsubPRIME(cc[0], engine.param.Montgomery_one, cc[0]);
        engine.fpx.fp2sqr_mont(cc, cc);

        engine.fpx.fpsubPRIME(x0[0], engine.param.Montgomery_one, bb[0]);
        engine.fpx.fpcopy(x0[1], 0, bb[1]);
        engine.fpx.fp2sqr_mont(bb, bb);
        engine.fpx.fp2mul_mont(Ap2, x0, t0);
        engine.fpx.fp2add(bb, t0, bb);
        engine.fpx.fp2mul_mont(x1, bb, bb);
        engine.fpx.fpsubPRIME(x1[0], engine.param.Montgomery_one, t0[0]);
        engine.fpx.fpcopy(x1[1], 0, t0[1]);
        engine.fpx.fp2sqr_mont(t0, t0);
        engine.fpx.fp2mul_mont(Ap2, x1, t1);
        engine.fpx.fp2add(t0, t1, t0);
        engine.fpx.fp2mul_mont(x0, t0, t0);
        engine.fpx.fp2add(bb, t0, bb);
        engine.fpx.fp2add(bb, bb, bb);

        engine.fpx.fp2sqr_mont(bb, t0);
        engine.fpx.fp2mul_mont(aa, cc, t1);
        engine.fpx.fp2add(t1, t1, t1);
        engine.fpx.fp2add(t1, t1, t1);
        engine.fpx.fp2sub(t0, t1, t0);
        engine.fpx.sqrt_Fp2(t0, t0);
        make_positive(t0);    // Make the sqrt "positive"
        engine.fpx.fp2add(bb, t0, R.X);
        engine.fpx.fp2add(aa, aa, R.Z);
    }


    protected void get_4_isog_dual(PointProj P, ulong[][] A24, ulong[][] C24, ulong[][][] coeff)
    {
        engine.fpx.fp2sub(P.X, P.Z, coeff[1]);
        engine.fpx.fp2add(P.X, P.Z, coeff[2]);
        engine.fpx.fp2sqr_mont(P.Z, coeff[4]);
        engine.fpx.fp2add(coeff[4], coeff[4], coeff[0]);
        engine.fpx.fp2sqr_mont(coeff[0], C24);
        engine.fpx.fp2add(coeff[0], coeff[0], coeff[0]);
        engine.fpx.fp2sqr_mont(P.X, coeff[3]);
        engine.fpx.fp2add(coeff[3], coeff[3], A24);
        engine.fpx.fp2sqr_mont(A24, A24);
    }

//    if (engine.param.OALICE_BITS % 2 == 1)

    protected void eval_dual_2_isog(ulong[][] X2, ulong[][] Z2, PointProj P)
    {
        ulong[][] t0 = Utils.InitArray(2, engine.param.NWORDS_FIELD);

        engine.fpx.fp2add(P.X, P.Z, t0);
        engine.fpx.fp2sub(P.X, P.Z, P.Z);
        engine.fpx.fp2sqr_mont(t0, t0);
        engine.fpx.fp2sqr_mont(P.Z, P.Z);
        engine.fpx.fp2sub(t0, P.Z, P.Z);
        engine.fpx.fp2mul_mont(X2, P.Z, P.Z);
        engine.fpx.fp2mul_mont(Z2, t0, P.X);
    }

    protected void eval_final_dual_2_isog(PointProj P)
    {
        ulong[][] t0 = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            t1 = Utils.InitArray(2, engine.param.NWORDS_FIELD);
        ulong[] t2 = new ulong[engine.param.NWORDS_FIELD];

        engine.fpx.fp2add(P.X, P.Z, t0);
        engine.fpx.fp2mul_mont(P.X, P.Z, t1);
        engine.fpx.fp2sqr_mont(t0, P.X);
        engine.fpx.fpcopy(P.X[0], 0, t2);
        engine.fpx.fpcopy(P.X[1], 0, (P.X)[0]);
        engine.fpx.fpcopy(t2, 0, P.X[1]);
        engine.fpx.fpnegPRIME((P.X)[1]);
        engine.fpx.fp2add(t1, t1, P.Z);
        engine.fpx.fp2add(P.Z, P.Z, P.Z);
    }


    protected void eval_dual_4_isog_shared(ulong[][] X4pZ4, ulong[][] X42, ulong[][] Z42, ulong[][][] coeff, uint coeffOffset)
    {
//        System.out.print("coeff0: ");
//        for (uint di = 0; di < 2; di++){
//            for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++){
//                System.out.printf("%016x ", coeff[0 + coeffOffset][di][dj]);}System.out.Println();}
//        System.out.print("coeff1: ");
//        for (uint di = 0; di < 2; di++){
//            for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++){
//                System.out.printf("%016x ", coeff[1 + coeffOffset][di][dj]);}System.out.Println();}
//        System.out.print("coeff2: ");
//        for (uint di = 0; di < 2; di++){
//            for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++){
//                System.out.printf("%016x ", coeff[2 + coeffOffset][di][dj]);}System.out.Println();}

        engine.fpx.fp2sub(X42, Z42, coeff[0 + coeffOffset]);
        engine.fpx.fp2add(X42, Z42, coeff[1 + coeffOffset]);
        engine.fpx.fp2sqr_mont(X4pZ4, coeff[2 + coeffOffset]);
        engine.fpx.fp2sub(coeff[2 + coeffOffset], coeff[1 + coeffOffset], coeff[2 + coeffOffset]);

//        System.out.print("coeff0: ");
//        for (uint di = 0; di < 2; di++){
//            for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++){
//                System.out.printf("%016x ", coeff[0 + coeffOffset][di][dj]);}System.out.Println();}
//        System.out.print("coeff1: ");
//        for (uint di = 0; di < 2; di++){
//            for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++){
//                System.out.printf("%016x ", coeff[1 + coeffOffset][di][dj]);}System.out.Println();}
//        System.out.print("coeff2: ");
//        for (uint di = 0; di < 2; di++){
//            for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++){
//                System.out.printf("%016x ", coeff[2 + coeffOffset][di][dj]);}System.out.Println();}
    }


    protected void eval_dual_4_isog(ulong[][] A24, ulong[][] C24, ulong[][][] coeff, uint coeffOffset, PointProj P)
    {
        ulong[][] t0 = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            t1 = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            t2 = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            t3 = Utils.InitArray(2, engine.param.NWORDS_FIELD);

        engine.fpx.fp2add(P.X, P.Z, t0);
        engine.fpx.fp2sub(P.X, P.Z, t1);
        engine.fpx.fp2sqr_mont(t0, t0);
        engine.fpx.fp2sqr_mont(t1, t1);
        engine.fpx.fp2sub(t0, t1, t2);
        engine.fpx.fp2sub(C24, A24, t3);
        engine.fpx.fp2mul_mont(t2, t3, t3);
        engine.fpx.fp2mul_mont(C24, t0, t2);
        engine.fpx.fp2sub(t2, t3, t2);
        engine.fpx.fp2mul_mont(t2, t0, P.X);
        engine.fpx.fp2mul_mont(t3, t1, P.Z);
        engine.fpx.fp2mul_mont(coeff[0 + coeffOffset], P.X, P.X);
        engine.fpx.fp2mul_mont(coeff[1 + coeffOffset], P.Z, t0);
        engine.fpx.fp2add(P.X, t0, P.X);
        engine.fpx.fp2mul_mont(coeff[2 + coeffOffset], P.Z, P.Z);
    }


    protected void eval_full_dual_4_isog(ulong[][][][] As, PointProj P)
    {
        //todo : check
        // First all 4-isogenies
        for(uint i = 0; i < engine.param.MAX_Alice; i++)
        {
            eval_dual_4_isog(As[engine.param.MAX_Alice-i][0],
                    As[engine.param.MAX_Alice-i][1],
                    As[engine.param.MAX_Alice-i-1], 2,
                    P);
        }
        if (engine.param.OALICE_BITS % 2 == 1)
        {
            eval_dual_2_isog(As[engine.param.MAX_Alice][2], As[engine.param.MAX_Alice][3], P);
        }
        eval_final_dual_2_isog(P);    // to A = 0
    }


    protected void TripleAndParabola_proj(PointProjFull R, ulong[][] l1x, ulong[][] l1z)
    {
        engine.fpx.fp2sqr_mont(R.X, l1z);
        engine.fpx.fp2add(l1z, l1z, l1x);
        engine.fpx.fp2add(l1x, l1z, l1x);
        engine.fpx.fpaddPRIME(l1x[0], engine.param.Montgomery_one, l1x[0]);
        engine.fpx.fp2add(R.Y, R.Y, l1z);
    }


    protected void Tate3_proj(PointProjFull P, PointProjFull Q, ulong[][] gX, ulong[][] gZ)
    {
        ulong[][] t0 = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            l1x = Utils.InitArray(2, engine.param.NWORDS_FIELD);

        TripleAndParabola_proj(P, l1x, gZ);
        engine.fpx.fp2sub(Q.X, P.X, gX);
        engine.fpx.fp2mul_mont(l1x, gX, gX);
        engine.fpx.fp2sub(P.Y, Q.Y, t0);
        engine.fpx.fp2mul_mont(gZ, t0, t0);
        engine.fpx.fp2add(gX, t0, gX);
    }


    protected void FinalExpo3(ulong[][] gX, ulong[][] gZ)
    {
        uint i;

        ulong[][] f_ = Utils.InitArray(2, engine.param.NWORDS_FIELD);

        engine.fpx.fp2copy(gZ, f_);
        engine.fpx.fpnegPRIME(f_[1]);
        engine.fpx.fp2mul_mont(gX, f_, f_);
        engine.fpx.fp2inv_mont_bingcd(f_);
        engine.fpx.fpnegPRIME(gX[1]);
        engine.fpx.fp2mul_mont(gX,gZ, gX);
        engine.fpx.fp2mul_mont(gX,f_, gX);
        for(i = 0; i < engine.param.OALICE_BITS; i++)
        {
            engine.fpx.fp2sqr_mont(gX, gX);
        }
        for(i = 0; i < engine.param.OBOB_EXPON-1; i++)
        {
            engine.fpx.cube_Fp2_cycl(gX, engine.param.Montgomery_one);
        }
    }


    protected void FinalExpo3_2way(ulong[][][] gX, ulong[][][] gZ)
    {
        uint i, j;

        ulong[][][] f_ = Utils.InitArray(2, 2, engine.param.NWORDS_FIELD),
            finv = Utils.InitArray(2, 2, engine.param.NWORDS_FIELD);

        for(i = 0; i < 2; i++)
        {
            engine.fpx.fp2copy(gZ[i], f_[i]);
            engine.fpx.fpnegPRIME(f_[i][1]);    // Conjugate
            engine.fpx.fp2mul_mont(gX[i], f_[i], f_[i]);
        }
        engine.fpx.mont_n_way_inv(f_, 2, finv);
        for(i = 0; i < 2; i++)
        {
            engine.fpx.fpnegPRIME(gX[i][1]);
            engine.fpx.fp2mul_mont(gX[i], gZ[i], gX[i]);
            engine.fpx.fp2mul_mont(gX[i], finv[i], gX[i]);
            for(j = 0; j < engine.param.OALICE_BITS; j++)
            {
                engine.fpx.fp2sqr_mont(gX[i], gX[i]);
            }
            for(j = 0; j < engine.param.OBOB_EXPON-1; j++)
            {
                engine.fpx.cube_Fp2_cycl(gX[i], engine.param.Montgomery_one);
            }
        }
    }


    private bool FirstPoint_dual(PointProj P, PointProjFull R, byte[] ind)
    {
        PointProjFull R3 = new PointProjFull(engine.param.NWORDS_FIELD),
                      S3 = new PointProjFull(engine.param.NWORDS_FIELD);

        ulong[][][] gX = Utils.InitArray(2, 2, engine.param.NWORDS_FIELD),
            gZ = Utils.InitArray(2, 2, engine.param.NWORDS_FIELD);
        ulong[] zero = new ulong[engine.param.NWORDS_FIELD];
        uint nbytes = engine.param.NWORDS_FIELD;// (((engine.param.NBITS_FIELD)+7)/8);
        uint alpha,beta;

        engine.fpx.fpcopy(engine.param.B_gen_3_tors, 0*engine.param.NWORDS_FIELD, (R3.X)[0]);
        engine.fpx.fpcopy(engine.param.B_gen_3_tors, 1*engine.param.NWORDS_FIELD, (R3.X)[1]);
        engine.fpx.fpcopy(engine.param.B_gen_3_tors, 2*engine.param.NWORDS_FIELD, (R3.Y)[0]);
        engine.fpx.fpcopy(engine.param.B_gen_3_tors, 3*engine.param.NWORDS_FIELD, (R3.Y)[1]);
        engine.fpx.fpcopy(engine.param.B_gen_3_tors, 4*engine.param.NWORDS_FIELD, (S3.X)[0]);
        engine.fpx.fpcopy(engine.param.B_gen_3_tors, 5*engine.param.NWORDS_FIELD, (S3.X)[1]);
        engine.fpx.fpcopy(engine.param.B_gen_3_tors, 6*engine.param.NWORDS_FIELD, (S3.Y)[0]);
        engine.fpx.fpcopy(engine.param.B_gen_3_tors, 7*engine.param.NWORDS_FIELD, (S3.Y)[1]);



        engine.isogeny.CompletePoint(P,R);


//        System.out.print("RX: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", R.X[di][dj] );}System.out.Println();}
//
//        System.out.print("RZ: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", R.Z[di][dj] );}System.out.Println();}
//
//        System.out.print("RY: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", R.Y[di][dj] );}System.out.Println();}




        Tate3_proj(R3,R,gX[0],gZ[0]);
        Tate3_proj(S3,R,gX[1],gZ[1]);
        FinalExpo3_2way(gX,gZ);

        // Do small DLog with respect to g_R3_S3
        engine.fpx.fp2correction(gX[0]);
        engine.fpx.fp2correction(gX[1]);


//        System.out.print("gX0: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", gX[0][di][dj] );}System.out.Println();}
//
//        System.out.print("gX1: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", gX[1][di][dj] );}System.out.Println();}




        if (Fpx.subarrayEquals(gX[0][1], zero, nbytes)) // = 1
        {
            alpha = 0;
        }
        else if (Fpx.subarrayEquals(gX[0][1], engine.param.g_R_S_im, nbytes)) // = g_R3_S3
        {
            alpha = 1;
        }
        else    // = g_R3_S3^2
        {
            alpha = 2;
        }

        if (Fpx.subarrayEquals(gX[1][1], zero, nbytes)) // = 1
        {
            beta = 0;
        }
        else if (Fpx.subarrayEquals(gX[1][1], engine.param.g_R_S_im, nbytes))// = g_R3_S3
        {
            beta = 1;
        }
        else    // = g_R3_S3^2
        {
            beta = 2;
        }





        if (alpha == 0 && beta == 0)   // Not full order
        {
            return false;
        }

        // Return the 3-torsion pouint that R lies above
        if (alpha == 0)         // Lies above R3
        {
            ind[0] = 0;
        }
        else if (beta == 0)         // Lies above S3
        {
            ind[0] = 1;
        }
        else if (alpha + beta == 3) // Lies above R3+S3
        {
            ind[0] = 3;
        }
        else                        // Lies above R3-S3
        {
            ind[0] = 2;
        }

        return true;
    }


    private bool SecondPoint_dual(PointProj P, PointProjFull R, byte[] ind)
    {
        PointProjFull RS3 = new PointProjFull(engine.param.NWORDS_FIELD);

        ulong[][] gX = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            gZ = Utils.InitArray(2, engine.param.NWORDS_FIELD);

        ulong[] zero = new ulong[engine.param.NWORDS_FIELD];
        uint nbytes = engine.param.NWORDS_FIELD;

        // Pair with 3-torsion pouint determined by first point
        engine.fpx.fpcopy(engine.param.B_gen_3_tors, (4*ind[0] + 0)*engine.param.NWORDS_FIELD, (RS3.X)[0]);
        engine.fpx.fpcopy(engine.param.B_gen_3_tors, (4*ind[0] + 1)*engine.param.NWORDS_FIELD, (RS3.X)[1]);
        engine.fpx.fpcopy(engine.param.B_gen_3_tors, (4*ind[0] + 2)*engine.param.NWORDS_FIELD, (RS3.Y)[0]);
        engine.fpx.fpcopy(engine.param.B_gen_3_tors, (4*ind[0] + 3)*engine.param.NWORDS_FIELD, (RS3.Y)[1]);

        engine.isogeny.CompletePoint(P, R);
        Tate3_proj(RS3, R, gX, gZ);
        FinalExpo3(gX, gZ);

        engine.fpx.fp2correction(gX);
        if (!Fpx.subarrayEquals(gX[1], zero, nbytes))    // Not equal to 1
        {
            return true;
        }
        else
        {
            return false;
        }
    }


    protected void FirstPoint3n(ulong[][] a24, ulong[][][][] As, ulong[][] x, PointProjFull R, uint[] r, byte[] ind, byte[] bitEll)
    {
        bool b = false;
        PointProj P = new PointProj(engine.param.NWORDS_FIELD);
        ulong[] zero = new ulong[engine.param.NWORDS_FIELD];
        r[0] = 0;

        while (!b)
        {
//            System.out.println("r: " + r[1]);


            bitEll[0] = 0;

//            System.out.println("bitEll: " + bitEll[0]);
//            System.out.println("ind: " + ind[0]);

            Elligator2(a24, r, 0, x, bitEll,0, 0);    // Get x-coordinate on curve a24


//            System.out.print("x: ");
//            for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//            {System.out.printf("%016x ", x[di][dj] );}System.out.Println();}
//            System.out.println("bitEll: " + bitEll[0]);
//            System.out.println("ind: " + ind[0]);


            engine.fpx.fp2copy(x, P.X);
            engine.fpx.fpcopy(engine.param.Montgomery_one, 0, P.Z[0]);
            engine.fpx.fpcopy(zero, 0, P.Z[1]);
            eval_full_dual_4_isog(As, P);    // Move x over to A = 0

//            System.out.print("PZ: ");
//            for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//            {System.out.printf("%016x ", P.Z[di][dj] );}System.out.Println();}
//
//            System.out.print("PX: ");
//            for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//            {System.out.printf("%016x ", P.X[di][dj] );}System.out.Println();}
//
//
//            System.out.print("\nRZ: ");
//            for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//            {System.out.printf("%016x ", R.Z[di][dj] );}System.out.Println();}
//
//            System.out.print("RX: ");
//            for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//            {System.out.printf("%016x ", R.X[di][dj] );}System.out.Println();}


            b = FirstPoint_dual(P, R, ind);  // Compute DLog with 3-torsion points
            r[0] = r[0] + 1;
        }
    }


    protected void SecondPoint3n(ulong[][] a24, ulong[][][][] As, ulong[][] x, PointProjFull R, uint[] r, byte[] ind, byte[] bitEll)
    {
        bool b = false;
        PointProj P = new PointProj(engine.param.NWORDS_FIELD);
        ulong[] zero = new ulong[engine.param.NWORDS_FIELD];

        while (!b)
        {

//            System.out.println("r: " + r[1]);


            bitEll[0] = 0;

//            System.out.println("bitEll: " + bitEll[0]);
//            System.out.println("ind: " + ind[0]);

            Elligator2(a24, r, 1, x, bitEll, 0, 0);

//            System.out.print("x: ");
//            for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//            {System.out.printf("%016x ", x[di][dj] );}System.out.Println();}


//            System.out.println("bitEll: " + bitEll[0]);
//            System.out.println("ind: " + ind[0]);


            engine.fpx.fp2copy(x, P.X);
            engine.fpx.fpcopy(engine.param.Montgomery_one, 0, P.Z[0]);
            engine.fpx.fpcopy(zero, 0, P.Z[1]);
            eval_full_dual_4_isog(As, P);    // Move x over to A = 0

//            System.out.print("PZ: ");
//            for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//            {System.out.printf("%016x ", P.Z[di][dj] );}System.out.Println();}
//
//            System.out.print("PX: ");
//            for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//            {System.out.printf("%016x ", P.X[di][dj] );}System.out.Println();}
//
//
//            System.out.print("\nRZ: ");
//            for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//            {System.out.printf("%016x ", R.Z[di][dj] );}System.out.Println();}
//
//            System.out.print("RX: ");
//            for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//            {System.out.printf("%016x ", R.X[di][dj] );}System.out.Println();}

            b = SecondPoint_dual(P, R, ind);
            r[1] = r[1] + 1;
        }
    }


    protected void makeDiff(PointProjFull R, PointProjFull S, PointProj D)
    {
        ulong[][] t0 = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            t1 = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            t2 = Utils.InitArray(2, engine.param.NWORDS_FIELD);
        uint nbytes = engine.param.NWORDS_FIELD;

        engine.fpx.fp2sub(R.X, S.X, t0);
        engine.fpx.fp2sub(R.Y, S.Y, t1);
        engine.fpx.fp2sqr_mont(t0, t0);
        engine.fpx.fp2sqr_mont(t1, t1);
        engine.fpx.fp2add(R.X, S.X, t2);
        engine.fpx.fp2mul_mont(t0, t2, t2);
        engine.fpx.fp2sub(t1, t2, t1);
        engine.fpx.fp2mul_mont(D.Z, t1, t1);
        engine.fpx.fp2mul_mont(D.X, t0, t0);
        engine.fpx.fp2correction(t0);
        engine.fpx.fp2correction(t1);
        if (Fpx.subarrayEquals(t0[0], t1[0], nbytes) & Fpx.subarrayEquals(t0[1], t1[1], nbytes))
        {
            engine.fpx.fp2neg(S.Y);
        }
    }


    protected void BuildOrdinary3nBasis_dual(ulong[][] a24, ulong[][][][] As, PointProjFull[] R, uint[] r, uint[] bitsEll, uint bitsEllOffset)
    {
        PointProj D = new PointProj(engine.param.NWORDS_FIELD);

        ulong[][][] xs = Utils.InitArray(2, 2, engine.param.NWORDS_FIELD);
        byte[] ind = new byte[1],
               bit = new byte[1];

//        System.out.print("a24: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", a24[di][dj] );}System.out.Println();}

//        System.out.print("As: ");
//        for (uint di = 0; di < engine.param.MAX_Alice+1; di++){
//        for (uint dj = 0; dj < 5; dj++){
//        for (uint dk = 0; dk < 2; dk++){
//        for (uint dl = 0; dl < engine.param.NWORDS_FIELD; dl++){
//        System.out.printf("%016x ", As[di][dj][dk][dl]);}}}}System.out.Println();



        FirstPoint3n(a24, As, xs[0], R[0], r, ind, bit);

//        System.out.println("bitEll: " + bitsEll[bitsEllOffset]);
//        System.out.println("ind: " + ind[0]);

        bitsEll[bitsEllOffset] = bit[0];

//        System.out.println("bitEll: " + bitsEll[bitsEllOffset]);
        r[1] = r[0];
        SecondPoint3n(a24, As, xs[1], R[1], r, ind, bit);
        bitsEll[bitsEllOffset] |= (uint)((int)bit[0] << 1);//todo check

//        System.out.println("bitEll: " + bitsEll[bitsEllOffset]);
//        System.out.println("ind: " + ind[0]);


//        System.out.print("R0X: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", R[0].X[di][dj] );}System.out.Println();}
//
//        System.out.print("R0Z: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", R[0].Z[di][dj] );}System.out.Println();}
//
//        System.out.print("R1X: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", R[1].X[di][dj] );}System.out.Println();}
//
//        System.out.print("R1Z: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", R[1].Z[di][dj] );}System.out.Println();}

        // Get x-coordinate of difference
        BiQuad_affine(a24, xs[0], xs[1], D);
        eval_full_dual_4_isog(As, D);    // Move x over to A = 0
        makeDiff(R[0], R[1], D);
    }


    protected void FullIsogeny_A_dual(byte[] PrivateKeyA, ulong[][][][] As, ulong[][] a24, uint sike)
    {
        // Input:  a private key PrivateKeyA in the range [0, 2^eA - 1]. 
        // Output: the public key PublicKeyA consisting of 3 elements in GF(p^2) which are encoded by removing leading 0 bytes.
        PointProj R = new PointProj(engine.param.NWORDS_FIELD);
        PointProj[] pts = new PointProj[engine.param.MAX_INT_POINTS_ALICE];

        ulong[][] XPA = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            XQA = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            XRA = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            A24 = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            C24 = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            A = Utils.InitArray(2, engine.param.NWORDS_FIELD);

        ulong[][][] coeff = Utils.InitArray(5, 2, engine.param.NWORDS_FIELD);

        uint i, row, m, index = 0, npts = 0, ii = 0;
        uint[] pts_index = new uint[engine.param.MAX_INT_POINTS_ALICE];
        ulong[] SecretKeyA = new ulong[engine.param.NWORDS_ORDER];

        // Initialize basis points
        init_basis(engine.param.A_gen, XPA, XQA, XRA);

//        System.out.print("XPA: ");
//        for (uint di = 0; di < 2; di++){
//        for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++){
//            System.out.printf("%016x ", XPA[di][dj]);}System.out.Println();}
//
//        System.out.print("XQA: ");
//        for (uint di = 0; di < 2; di++){
//            for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++){
//                System.out.printf("%016x ", XQA[di][dj]);}System.out.Println();}
//
//        System.out.print("XRA: ");
//        for (uint di = 0; di < 2; di++){
//            for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++){
//                System.out.printf("%016x ", XRA[di][dj]);}System.out.Println();}

        // Initialize constants: A24 = A+2C, C24 = 4C, where A=6, C=1
        engine.fpx.fpcopy(engine.param.Montgomery_one, 0, A24[0]);
        engine.fpx.fp2add(A24, A24, A24);
        engine.fpx.fp2add(A24, A24, C24);
        engine.fpx.fp2add(A24, C24, A);
        engine.fpx.fp2add(C24, C24, A24);

//        System.out.print("A24: ");
//        for (uint di = 0; di < 2; di++){
//        for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++){
//            System.out.printf("%016x ", A24[di][dj]);}System.out.Println();}
//        System.out.print("C24: ");
//        for (uint di = 0; di < 2; di++){
//            for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++){
//                System.out.printf("%016x ", C24[di][dj]);}System.out.Println();}
//        System.out.print("A: ");
//        for (uint di = 0; di < 2; di++){
//            for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++){
//                System.out.printf("%016x ", A[di][dj]);}System.out.Println();}
//

        // Retrieve kernel point
        engine.fpx.decode_to_digits(PrivateKeyA, engine.param.MSG_BYTES, SecretKeyA, engine.param.SECRETKEY_A_BYTES, engine.param.NWORDS_ORDER);

//        System.out.print("SecretKeyA: ");
//        for (uint di = 0; di < engine.param.NWORDS_ORDER; di++)
//        {System.out.printf("%016x ", SecretKeyA[di]);}System.out.Println();

        engine.isogeny.LADDER3PT(XPA, XQA, XRA, SecretKeyA, engine.param.ALICE, R, A);

//        System.out.print("RX: ");
//        for (uint di = 0; di < 2; di++){
//            for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++){
//                System.out.printf("%016x ", R.X[di][dj]);}System.out.Println();}
//
//        System.out.print("RZ: ");
//        for (uint di = 0; di < 2; di++){
//            for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++){
//                System.out.printf("%016x ", R.Z[di][dj]);}System.out.Println();}
//
//        System.out.print("A: ");
//        for (uint di = 0; di < 2; di++){
//            for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++){
//                System.out.printf("%016x ", A[di][dj]);}System.out.Println();}


        engine.fpx.fp2inv_mont(R.Z);
        engine.fpx.fp2mul_mont(R.X,R.Z,R.X);
        engine.fpx.fpcopy(engine.param.Montgomery_one, 0, R.Z[0]);
        engine.fpx.fpzero(R.Z[1]);

//        System.out.print("RX: ");
//        for (uint di = 0; di < 2; di++){
//            for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++){
//                System.out.printf("%016x ", R.X[di][dj]);}System.out.Println();}
//
//        System.out.print("RZ: ");
//        for (uint di = 0; di < 2; di++){
//            for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++){
//                System.out.printf("%016x ", R.Z[di][dj]);}System.out.Println();}




        if (sike == 1)
        {
            engine.fpx.fp2_encode(R.X, PrivateKeyA, engine.param.MSG_BYTES + engine.param.SECRETKEY_A_BYTES + engine.param.CRYPTO_PUBLICKEYBYTES);  // privA ||= x(KA) = x(PA + sk_A*QA)
        }

//        System.out.println("PrivateKeyA: " + Hex.toHexstring(PrivateKeyA));



        if (engine.param.OALICE_BITS % 2 == 1)
        {
            PointProj S = new PointProj(engine.param.NWORDS_FIELD);

            engine.isogeny.xDBLe(R, S, A24, C24, engine.param.OALICE_BITS - 1);
            engine.isogeny.get_2_isog(S, A24, C24);
            engine.isogeny.eval_2_isog(R, S);
            engine.fpx.fp2copy(S.X, As[engine.param.MAX_Alice][2]);
            engine.fpx.fp2copy(S.Z, As[engine.param.MAX_Alice][3]);
        }


        //todo check tree treversal
        // Traverse tree
        index = 0;
        for (row = 1; row < engine.param.MAX_Alice; row++)
        {
            while (index < engine.param.MAX_Alice-row)
            {
                pts[npts] = new PointProj(engine.param.NWORDS_FIELD);
                engine.fpx.fp2copy(R.X, pts[npts].X);
                engine.fpx.fp2copy(R.Z, pts[npts].Z);
                pts_index[npts++] = index;
                m = engine.param.strat_Alice[ii++];
                engine.isogeny.xDBLe(R, R, A24, C24, 2*m);
                index += m;
            }

//            System.out.println("row: " + row);
//            System.out.print("RX: ");
//            for (uint di = 0; di < 2; di++){
//                for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++){
//                    System.out.printf("%016x ", R.X[di][dj]);}System.out.Println();}
//
//            System.out.print("RZ: ");
//            for (uint di = 0; di < 2; di++){
//                for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++){
//                    System.out.printf("%016x ", R.Z[di][dj]);}System.out.Println();}
//        System.out.print("A24: ");
//        for (uint di = 0; di < 2; di++){
//        for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++){
//            System.out.printf("%016x ", A24[di][dj]);}System.out.Println();}
//        System.out.print("C24: ");
//        for (uint di = 0; di < 2; di++){
//            for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++){
//                System.out.printf("%016x ", C24[di][dj]);}System.out.Println();}




            engine.fpx.fp2copy(A24, As[row-1][0]);
            engine.fpx.fp2copy(C24, As[row-1][1]);
            get_4_isog_dual(R, A24, C24, coeff);
            for (i = 0; i < npts; i++)
            {
                engine.isogeny.eval_4_isog(pts[i], coeff);

//                System.out.print(i + "ptsX: ");
//                for (uint di = 0; di < 2; di++){
//                    for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++){
//                        System.out.printf("%016x ", pts[i].X[di][dj]);}System.out.Println();}
//
//                System.out.print(i + "ptsZ: ");
//                for (uint di = 0; di < 2; di++){
//                    for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++){
//                        System.out.printf("%016x ", pts[i].Z[di][dj]);}System.out.Println();}
            }
            eval_dual_4_isog_shared(coeff[2], coeff[3], coeff[4], As[row-1], 2);//*(As+row-1)+2); todo check

            engine.fpx.fp2copy(pts[npts-1].X, R.X);
            engine.fpx.fp2copy(pts[npts-1].Z, R.Z);

//            System.out.print("RX: ");
//            for (uint di = 0; di < 2; di++){
//                for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++){
//                    System.out.printf("%016x ", R.X[di][dj]);}System.out.Println();}
//
//            System.out.print("RZ: ");
//            for (uint di = 0; di < 2; di++){
//                for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++){
//                    System.out.printf("%016x ", R.Z[di][dj]);}System.out.Println();}

            index = pts_index[npts-1];
            npts -= 1;
        }


//        System.out.print("A24: ");
//        for (uint di = 0; di < 2; di++){
//        for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++){
//        System.out.printf("%016x ", A24[di][dj]);}System.out.Println();}
//        System.out.print("C24: ");
//        for (uint di = 0; di < 2; di++){
//        for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++){
//        System.out.printf("%016x ", C24[di][dj]);}System.out.Println();}

        engine.fpx.fp2copy(A24, As[engine.param.MAX_Alice-1][0]);
        engine.fpx.fp2copy(C24, As[engine.param.MAX_Alice-1][1]);

        get_4_isog_dual(R, A24, C24, coeff);
        eval_dual_4_isog_shared(coeff[2], coeff[3], coeff[4], As[engine.param.MAX_Alice-1], 2); //todo check
        engine.fpx.fp2copy(A24, As[engine.param.MAX_Alice][0]);
        engine.fpx.fp2copy(C24, As[engine.param.MAX_Alice][1]);

//        System.out.print("A24: ");
//        for (uint di = 0; di < 2; di++){
//            for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++){
//                System.out.printf("%016x ", A24[di][dj]);}System.out.Println();}
//        System.out.print("C24: ");
//        for (uint di = 0; di < 2; di++){
//            for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++){
//                System.out.printf("%016x ", C24[di][dj]);}System.out.Println();}
//
        engine.fpx.fp2inv_mont_bingcd(C24);
        engine.fpx.fp2mul_mont(A24, C24, a24);
//
//        System.out.print("a24: ");
//        for (uint di = 0; di < 2; di++){
//            for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++){
//                System.out.printf("%016x ", a24[di][dj]);}System.out.Println();}
    }


    protected void Dlogs3_dual(ulong[][][] f, int[] D, ulong[] d0, ulong[] c0, ulong[] d1, ulong[] c1)
    {
        solve_dlog(f[0], D, d0, 3);
        solve_dlog(f[2], D, c0, 3);
        solve_dlog(f[1], D, d1, 3);
        solve_dlog(f[3], D, c1, 3);
        engine.fpx.mp_sub(engine.param.Bob_order, c0, c0, engine.param.NWORDS_ORDER);
        engine.fpx.mp_sub(engine.param.Bob_order, c1, c1, engine.param.NWORDS_ORDER);
    }


    protected void BuildOrdinary3nBasis_Decomp_dual(ulong[][] A24, PointProj[] Rs, uint[] r, uint[] bitsEll, uint bitsEllIndex)
    {
        byte[] bitEll = new byte[2];

        bitEll[0] = (byte) (bitsEll[bitsEllIndex] & 0x1);
        bitEll[1] = (byte) ((bitsEll[bitsEllIndex] >> 1) & 0x1);

        // Elligator2 both x-coordinates
        r[0] -= 1;
        Elligator2(A24, r, 0, Rs[0].X, bitEll, 0, 1);
        r[1] -= 1;
        Elligator2(A24, r, 1, Rs[1].X, bitEll, 1, 1);
        // Get x-coordinate of difference
        BiQuad_affine(A24, Rs[0].X, Rs[1].X, Rs[2]);
    }


    protected void PKADecompression_dual(byte[] SecretKeyB, byte[] CompressedPKA, PointProj R, ulong[][] A)
    {
        byte bit;
        uint[] rs = new uint[3];
        ulong[][] A24 = Utils.InitArray(2, engine.param.NWORDS_FIELD);
        PointProj[] Rs = new PointProj[3];
        Rs[0] = new PointProj(engine.param.NWORDS_FIELD);
        Rs[1] = new PointProj(engine.param.NWORDS_FIELD);
        Rs[2] = new PointProj(engine.param.NWORDS_FIELD);


        ulong[] t1 = new ulong[engine.param.NWORDS_ORDER],
               t2 = new ulong[engine.param.NWORDS_ORDER],
               t3 = new ulong[engine.param.NWORDS_ORDER],
               t4 = new ulong[engine.param.NWORDS_ORDER],
               vone = new ulong[engine.param.NWORDS_ORDER],
               temp = new ulong[engine.param.NWORDS_ORDER],
               SKin = new ulong[engine.param.NWORDS_ORDER];


        engine.fpx.fp2_decode(CompressedPKA, A, 3*engine.param.ORDER_B_ENCODED_BYTES);
        vone[0] = 1;
        engine.fpx.to_Montgomery_mod_order(vone, vone, engine.param.Bob_order, engine.param.Montgomery_RB2, engine.param.Montgomery_RB1);  // Converting to Montgomery representation


//        System.out.printf("bit: %02x\n", CompressedPKA[3*engine.param.ORDER_B_ENCODED_BYTES + engine.param.FP2_ENCODED_BYTES]);
//        System.out.printf("bit: %02x\n", ((CompressedPKA[3*engine.param.ORDER_B_ENCODED_BYTES + engine.param.FP2_ENCODED_BYTES] & 0xff) >> 7));
        bit = (byte) ((CompressedPKA[3*engine.param.ORDER_B_ENCODED_BYTES + engine.param.FP2_ENCODED_BYTES] & 0xff) >> 7);
//        System.out.println("bit: " + bit);

        byte[] rs_temp = new byte[3];
        System.Array.Copy(CompressedPKA, 3*engine.param.ORDER_B_ENCODED_BYTES + engine.param.FP2_ENCODED_BYTES, rs_temp, 0, 3);
        rs[0] = (uint) (rs_temp[0] & 0xffff);
        rs[1] = (uint) (rs_temp[1] & 0xffff);
        rs[2] = (uint) (rs_temp[2] & 0xffff);

        rs[0] &= 0x7F;

        engine.fpx.fpaddPRIME(A[0], engine.param.Montgomery_one, A24[0]);
        engine.fpx.fpcopy(A[1], 0, A24[1]);
        engine.fpx.fpaddPRIME(A24[0], engine.param.Montgomery_one, A24[0]);
        engine.fpx.fp2div2(A24, A24);
        engine.fpx.fp2div2(A24, A24);

        BuildOrdinary3nBasis_Decomp_dual(A24, Rs, rs, rs, 2);
        engine.fpx.fpcopy(engine.param.Montgomery_one, 0, Rs[0].Z[0]);
        engine.fpx.fpcopy(engine.param.Montgomery_one, 0, Rs[1].Z[0]);

        engine.isogeny.swap_points(Rs[0], Rs[1], ((ulong) -bit));//todo check
        engine.fpx.decode_to_digits(SecretKeyB, 0, SKin, engine.param.SECRETKEY_B_BYTES, engine.param.NWORDS_ORDER);
        engine.fpx.to_Montgomery_mod_order(SKin, t1, engine.param.Bob_order, engine.param.Montgomery_RB2, engine.param.Montgomery_RB1);    // Converting to Montgomery representation
        engine.fpx.decode_to_digits(CompressedPKA, 0, temp, engine.param.ORDER_B_ENCODED_BYTES, engine.param.NWORDS_ORDER);
        engine.fpx.to_Montgomery_mod_order(temp, t2, engine.param.Bob_order, engine.param.Montgomery_RB2, engine.param.Montgomery_RB1);
        engine.fpx.decode_to_digits(CompressedPKA, engine.param.ORDER_B_ENCODED_BYTES, temp, engine.param.ORDER_B_ENCODED_BYTES, engine.param.NWORDS_ORDER);
        engine.fpx.to_Montgomery_mod_order(temp, t3, engine.param.Bob_order, engine.param.Montgomery_RB2, engine.param.Montgomery_RB1);
        engine.fpx.decode_to_digits(CompressedPKA, 2*engine.param.ORDER_B_ENCODED_BYTES, temp, engine.param.ORDER_B_ENCODED_BYTES, engine.param.NWORDS_ORDER);
        engine.fpx.to_Montgomery_mod_order(temp, t4, engine.param.Bob_order, engine.param.Montgomery_RB2, engine.param.Montgomery_RB1);

        if (bit == 0)
        {
            engine.fpx.Montgomery_multiply_mod_order(t1, t3, t3, engine.param.Bob_order, engine.param.Montgomery_RB2);
            engine.fpx.mp_add(t3, vone, t3, engine.param.NWORDS_ORDER);
            engine.fpx.Montgomery_inversion_mod_order_bingcd(t3, t3, engine.param.Bob_order, engine.param.Montgomery_RB2, engine.param.Montgomery_RB1);
            engine.fpx.Montgomery_multiply_mod_order(t1, t4, t4, engine.param.Bob_order, engine.param.Montgomery_RB2);
            engine.fpx.mp_add(t2, t4, t4, engine.param.NWORDS_ORDER);
            engine.fpx.Montgomery_multiply_mod_order(t3, t4, t3, engine.param.Bob_order, engine.param.Montgomery_RB2);
            engine.fpx.from_Montgomery_mod_order(t3, t3, engine.param.Bob_order, engine.param.Montgomery_RB2);    // Converting back from Montgomery representation
            Ladder3pt_dual(Rs, t3, engine.param.BOB, R, A24);
        }
        else
        {
            engine.fpx.Montgomery_multiply_mod_order(t1, t4, t4, engine.param.Bob_order, engine.param.Montgomery_RB2);
            engine.fpx.mp_add(t4, vone, t4, engine.param.NWORDS_ORDER);
            engine.fpx.Montgomery_inversion_mod_order_bingcd(t4, t4, engine.param.Bob_order, engine.param.Montgomery_RB2, engine.param.Montgomery_RB1);
            engine.fpx.Montgomery_multiply_mod_order(t1, t3, t3, engine.param.Bob_order, engine.param.Montgomery_RB2);
            engine.fpx.mp_add(t2, t3, t3, engine.param.NWORDS_ORDER);
            engine.fpx.Montgomery_multiply_mod_order(t3, t4, t3, engine.param.Bob_order, engine.param.Montgomery_RB2);
            engine.fpx.from_Montgomery_mod_order(t3, t3, engine.param.Bob_order, engine.param.Montgomery_RB2);    // Converting back from Montgomery representation
            Ladder3pt_dual(Rs,t3,engine.param.BOB, R, A24);
        }
        engine.isogeny.Double(R, R, A24, engine.param.OALICE_BITS);    // x, z := Double(A24, x, 1, eA);
    }


    protected void Compress_PKA_dual(ulong[] d0, ulong[] c0, ulong[] d1, ulong[] c1, ulong[][] a24, uint[] rs, byte[] CompressedPKA)
    {
        uint bit;
        ulong[] temp = new ulong[engine.param.NWORDS_ORDER],
               inv = new ulong[engine.param.NWORDS_ORDER];
        ulong[][] A = Utils.InitArray(2, engine.param.NWORDS_FIELD);

        engine.fpx.fp2add(a24,a24,A);
        engine.fpx.fp2add(A,A,A);
        engine.fpx.fpsubPRIME(A[0],engine.param.Montgomery_one,A[0]);
        engine.fpx.fpsubPRIME(A[0],engine.param.Montgomery_one,A[0]);    // 4*a24-2

        bit = engine.fpx.mod3(d1);
        engine.fpx.to_Montgomery_mod_order(c0, c0, engine.param.Bob_order, engine.param.Montgomery_RB2, engine.param.Montgomery_RB1);   // Converting to Montgomery representation
        engine.fpx.to_Montgomery_mod_order(c1, c1, engine.param.Bob_order, engine.param.Montgomery_RB2, engine.param.Montgomery_RB1);
        engine.fpx.to_Montgomery_mod_order(d0, d0, engine.param.Bob_order, engine.param.Montgomery_RB2, engine.param.Montgomery_RB1);
        engine.fpx.to_Montgomery_mod_order(d1, d1, engine.param.Bob_order, engine.param.Montgomery_RB2, engine.param.Montgomery_RB1);

//        System.out.print("d0: ");
//        for (uint dj = 0; dj < engine.param.NWORDS_ORDER; dj++)
//        {System.out.printf("%016x ", d0[dj] );}System.out.Println();
//
//        System.out.print("c0: ");
//        for (uint dj = 0; dj < engine.param.NWORDS_ORDER; dj++)
//        {System.out.printf("%016x ", c0[dj] );}System.out.Println();
//
//        System.out.print("d1: ");
//        for (uint dj = 0; dj < engine.param.NWORDS_ORDER; dj++)
//        {System.out.printf("%016x ", d1[dj] );}System.out.Println();
//
//        System.out.print("c1: ");
//        for (uint dj = 0; dj < engine.param.NWORDS_ORDER; dj++)
//        {System.out.printf("%016x ", c1[dj] );}System.out.Println();

        if (bit != 0)
        {  // Storing [d1*c0inv, c1*c0inv, d0*c0inv] and setting bit "NBITS_ORDER" to 0
            engine.fpx.Montgomery_inversion_mod_order_bingcd(d1, inv, engine.param.Bob_order, engine.param.Montgomery_RB2, engine.param.Montgomery_RB1);
            engine.fpx.Montgomery_neg(d0, engine.param.Bob_order);
            engine.fpx.Montgomery_multiply_mod_order(d0, inv, temp, engine.param.Bob_order, engine.param.Montgomery_RB2);
            engine.fpx.from_Montgomery_mod_order(temp, temp, engine.param.Bob_order, engine.param.Montgomery_RB2);                    // Converting back from Montgomery representation
            engine.fpx.encode_to_bytes(temp, CompressedPKA, 0, engine.param.ORDER_B_ENCODED_BYTES);
            engine.fpx.Montgomery_neg(c1, engine.param.Bob_order);
            engine.fpx.Montgomery_multiply_mod_order(c1, inv, temp, engine.param.Bob_order, engine.param.Montgomery_RB2);
            engine.fpx.from_Montgomery_mod_order(temp, temp, engine.param.Bob_order, engine.param.Montgomery_RB2);
            engine.fpx.encode_to_bytes(temp, CompressedPKA, engine.param.ORDER_B_ENCODED_BYTES, engine.param.ORDER_B_ENCODED_BYTES);
            engine.fpx.Montgomery_multiply_mod_order(c0, inv, temp, engine.param.Bob_order, engine.param.Montgomery_RB2);
            engine.fpx.from_Montgomery_mod_order(temp, temp, engine.param.Bob_order, engine.param.Montgomery_RB2);
            engine.fpx.encode_to_bytes(temp, CompressedPKA, 2*engine.param.ORDER_B_ENCODED_BYTES, engine.param.ORDER_B_ENCODED_BYTES);
            CompressedPKA[3*engine.param.ORDER_B_ENCODED_BYTES + engine.param.FP2_ENCODED_BYTES] = 0x00;
        }
        else
        {  // Storing [d1*d0inv, c1*d0inv, c0*d0inv] and setting bit "NBITS_ORDER" to 1
            engine.fpx.Montgomery_inversion_mod_order_bingcd(d0, inv, engine.param.Bob_order, engine.param.Montgomery_RB2, engine.param.Montgomery_RB1);
            engine.fpx.Montgomery_neg(d1, engine.param.Bob_order);
            engine.fpx.Montgomery_multiply_mod_order(d1, inv, temp, engine.param.Bob_order, engine.param.Montgomery_RB2);
            engine.fpx.from_Montgomery_mod_order(temp, temp, engine.param.Bob_order, engine.param.Montgomery_RB2);                     // Converting back from Montgomery representation
            engine.fpx.encode_to_bytes(temp, CompressedPKA, 0, engine.param.ORDER_B_ENCODED_BYTES);
            engine.fpx.Montgomery_multiply_mod_order(c1, inv, temp, engine.param.Bob_order, engine.param.Montgomery_RB2);
            engine.fpx.from_Montgomery_mod_order(temp, temp, engine.param.Bob_order, engine.param.Montgomery_RB2);
            engine.fpx.encode_to_bytes(temp, CompressedPKA, engine.param.ORDER_B_ENCODED_BYTES, engine.param.ORDER_B_ENCODED_BYTES);
            engine.fpx.Montgomery_neg(c0, engine.param.Bob_order);
            engine.fpx.Montgomery_multiply_mod_order(c0, inv, temp, engine.param.Bob_order, engine.param.Montgomery_RB2);
            engine.fpx.from_Montgomery_mod_order(temp, temp, engine.param.Bob_order, engine.param.Montgomery_RB2);
            engine.fpx.encode_to_bytes(temp, CompressedPKA, 2*engine.param.ORDER_B_ENCODED_BYTES, engine.param.ORDER_B_ENCODED_BYTES);
            CompressedPKA[3*engine.param.ORDER_B_ENCODED_BYTES + engine.param.FP2_ENCODED_BYTES] = (byte) 0x80;
        }

        engine.fpx.fp2_encode(A, CompressedPKA, 3*engine.param.ORDER_B_ENCODED_BYTES);
        CompressedPKA[3*engine.param.ORDER_B_ENCODED_BYTES + engine.param.FP2_ENCODED_BYTES] |= (byte)rs[0];
        CompressedPKA[3*engine.param.ORDER_B_ENCODED_BYTES + engine.param.FP2_ENCODED_BYTES + 1] = (byte) rs[1];
        CompressedPKA[3*engine.param.ORDER_B_ENCODED_BYTES + engine.param.FP2_ENCODED_BYTES + 2] = (byte) rs[2];
    }

    // Alice's ephemeral public key generation using compression -- SIKE protocol
    // Output: PrivateKeyA[MSG_BYTES + engine.param.SECRETKEY_A_BYTES] <- x(K_A) where K_A = PA + sk_A*Q_A
    protected internal uint EphemeralKeyGeneration_A_extended(byte[] PrivateKeyA, byte[] CompressedPKA)
    {
        uint[] rs = new uint[3];
        int[] D = new int[engine.param.DLEN_3];
        ulong[][] a24 = Utils.InitArray(2, engine.param.NWORDS_FIELD);
        
        ulong[][][][] As = Utils.InitArray(engine.param.MAX_Alice + 1, 5, 2, engine.param.NWORDS_FIELD);
        ulong[][][] f = Utils.InitArray(4, 2, engine.param.NWORDS_FIELD);
        ulong[] c0 = new ulong[engine.param.NWORDS_ORDER],
               d0 = new ulong[engine.param.NWORDS_ORDER],
               c1 = new ulong[engine.param.NWORDS_ORDER],
               d1 = new ulong[engine.param.NWORDS_ORDER];
        PointProjFull[] Rs = new PointProjFull[2];
        Rs[0] = new PointProjFull(engine.param.NWORDS_FIELD);
        Rs[1] = new PointProjFull(engine.param.NWORDS_FIELD);

        FullIsogeny_A_dual(PrivateKeyA, As, a24, 1);                // CHECK DONE

        BuildOrdinary3nBasis_dual(a24, As, Rs, rs, rs, 2);      // CHECK DONE

//        System.out.println("After BuildOrdinary");
//        System.out.print("Rs0X: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", Rs[0].X[di][dj] );}System.out.Println();}
//
//        System.out.print("Rs0Z: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", Rs[0].Z[di][dj] );}System.out.Println();}
//
//        System.out.print("Rs1X: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", Rs[1].X[di][dj] );}System.out.Println();}
//
//        System.out.print("Rs1Z: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", Rs[1].Z[di][dj] );}System.out.Println();}


        Tate3_pairings(Rs, f);  // CHECK DONE

//        System.out.print("f: ");
//        for (uint di = 0; di < 4; di++){for (uint dj = 0; dj < 2; dj++){for (uint dk = 0; dk < engine.param.NWORDS_FIELD; dk++)
//        {System.out.printf("%016x ", f[di][dj][dk]);}System.out.Println();}System.out.Println();}

        Dlogs3_dual(f, D, d0, c0, d1, c1);

//        System.out.print("D: ");
//        for (uint dj = 0; dj < engine.param.DLEN_3; dj++)
//        {System.out.printf("%08x ", D[dj] );}System.out.Println();
//
//        System.out.print("d0: ");
//        for (uint dj = 0; dj < engine.param.NWORDS_ORDER; dj++)
//        {System.out.printf("%016x ", d0[dj] );}System.out.Println();
//
//        System.out.print("c0: ");
//        for (uint dj = 0; dj < engine.param.NWORDS_ORDER; dj++)
//        {System.out.printf("%016x ", c0[dj] );}System.out.Println();
//
//        System.out.print("d1: ");
//        for (uint dj = 0; dj < engine.param.NWORDS_ORDER; dj++)
//        {System.out.printf("%016x ", d1[dj] );}System.out.Println();
//
//        System.out.print("c1: ");
//        for (uint dj = 0; dj < engine.param.NWORDS_ORDER; dj++)
//        {System.out.printf("%016x ", c1[dj] );}System.out.Println();

        Compress_PKA_dual(d0, c0, d1, c1, a24, rs, CompressedPKA);
        return 0;
    }

    // Alice's ephemeral public key generation using compression -- SIDH protocol
    // Output: PrivateKeyA[MSG_BYTES + engine.param.SECRETKEY_A_BYTES] <- x(K_A) where K_A = PA + sk_A*Q_A
    private uint EphemeralKeyGeneration_A(byte[] PrivateKeyA, byte[] CompressedPKA)
    {
        uint[] rs = new uint[3];
        int[]  D = new int[engine.param.DLEN_3];
        ulong[] c0 = new ulong[engine.param.NWORDS_ORDER],
               d0 = new ulong[engine.param.NWORDS_ORDER],
               c1 = new ulong[engine.param.NWORDS_ORDER],
               d1 = new ulong[engine.param.NWORDS_ORDER];
        ulong[][] a24 = Utils.InitArray(2, engine.param.NWORDS_FIELD);
        ulong[][][] f = Utils.InitArray(4, 2, engine.param.NWORDS_FIELD);
        ulong[][][][] As = Utils.InitArray(engine.param.MAX_Alice + 1, 5, 2, engine.param.NWORDS_FIELD);
        PointProjFull[] Rs = new PointProjFull[2];

        FullIsogeny_A_dual(PrivateKeyA, As, a24, 0);
        BuildOrdinary3nBasis_dual(a24, As, Rs, rs, rs, 2);
        Tate3_pairings(Rs, f);
        Dlogs3_dual(f, D, d0, c0, d1, c1);
        Compress_PKA_dual(d0, c0, d1, c1, a24, rs, CompressedPKA);
        return 0;
    }

    // Bob's ephemeral shared secret computation using compression
    // It produces a shared secret key SharedSecretB using his secret key PrivateKeyB and Alice's decompressed data point_R and param_A
    // Inputs: Bob's PrivateKeyB is an integer in the range [1, oB-1], where oB = 3^OBOB_EXP.
    //         Alice's decompressed data consists of point_R in (X:Z) coordinates and the curve parameter param_A in GF(p^2).
    // Output: a shared secret SharedSecretB that consists of one element in GF(p^2).
    internal uint EphemeralSecretAgreement_B(byte[] PrivateKeyB, byte[] PKA, byte[] SharedSecretB)
    {
        uint i, ii = 0, row, m, index = 0, npts = 0;
        uint[] pts_index = new uint[engine.param.MAX_INT_POINTS_BOB];
        ulong[][] A24plus = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            A24minus = Utils.InitArray(2, engine.param.NWORDS_FIELD);
        PointProj R = new PointProj(engine.param.NWORDS_FIELD);
        PointProj[] pts = new PointProj[engine.param.MAX_INT_POINTS_BOB];
        ulong[][] jinv = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            A = Utils.InitArray(2, engine.param.NWORDS_FIELD);
        ulong[][][] coeff = Utils.InitArray(3, 2, engine.param.NWORDS_FIELD);
        ulong[][] param_A = Utils.InitArray(2, engine.param.NWORDS_FIELD);

        PKADecompression_dual(PrivateKeyB, PKA, R, param_A);
        engine.fpx.fp2copy(param_A, A);
        engine.fpx.fpaddPRIME(engine.param.Montgomery_one, engine.param.Montgomery_one, A24minus[0]);
        engine.fpx.fp2add(A, A24minus, A24plus);
        engine.fpx.fp2sub(A, A24minus, A24minus);

//        System.out.print("A24minus: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", A24minus[di][dj] );}System.out.Println();}

        // Traverse tree
        index = 0;
        for (row = 1; row < engine.param.MAX_Bob; row++)
        {
            while (index < engine.param.MAX_Bob-row)
            {
                pts[npts] = new PointProj(engine.param.NWORDS_FIELD);
                engine.fpx.fp2copy(R.X, pts[npts].X);
                engine.fpx.fp2copy(R.Z, pts[npts].Z);
                pts_index[npts++] = index;
                m = engine.param.strat_Bob[ii++];
                engine.isogeny.xTPLe(R, R, A24minus, A24plus, m);
                index += m;
            }
            engine.isogeny.get_3_isog(R, A24minus, A24plus, coeff);

            for (i = 0; i < npts; i++)
            {
                engine.isogeny.eval_3_isog(pts[i], coeff);
            }

            engine.fpx.fp2copy(pts[npts-1].X, R.X);
            engine.fpx.fp2copy(pts[npts-1].Z, R.Z);
            index = pts_index[npts-1];
            npts -= 1;
        }

        engine.isogeny.get_3_isog(R, A24minus, A24plus, coeff);
        engine.fpx.fp2add(A24plus, A24minus, A);
        engine.fpx.fp2add(A, A, A);
        engine.fpx.fp2sub(A24plus, A24minus, A24plus);
        engine.isogeny.j_inv(A, A24plus, jinv);
        engine.fpx.fp2_encode(jinv, SharedSecretB, 0);    // Format shared secret

        return 0;
    }


    protected void BuildEntangledXonly(ulong[][] A, PointProj[] R, byte[] qnr, byte[] ind)
    {
        ulong[] s = new ulong[engine.param.NWORDS_FIELD];
        ulong[][] t_ptr,
            r = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            t = Utils.InitArray(2, engine.param.NWORDS_FIELD);
        uint t_ptrOffset = 0;

        // Select the correct table
        if (engine.fpx.is_sqr_fp2(A,  s))
        {
//            System.out.println("qnr = 1");
            t_ptr = engine.param.table_v_qnr;
            qnr[0] = 1;
        }
        else
        {
//            System.out.println("qnr = 0");
            t_ptr = engine.param.table_v_qr;
            qnr[0] = 0;
        }

        // Get x0
        ind[0] = 0;
        do
        {
//            System.out.println("ind: " + ind[0]);

            engine.fpx.fp2mul_mont(A,  t_ptr, t_ptrOffset,  R[0].X);    // R[0].X =  A*v
            t_ptrOffset += 2;
            engine.fpx.fp2neg(R[0].X);                                  // R[0].X = -A*v
            engine.fpx.fp2add(R[0].X,  A,  t);
            engine.fpx.fp2mul_mont(R[0].X,  t,  t);
            engine.fpx.fpaddPRIME(t[0],  engine.param.Montgomery_one, t[0]);
            engine.fpx.fp2mul_mont(R[0].X,  t,  t);                     // t = R[0].X^3 + A*R[0].X^2 + R[0].X

//            System.out.print("R0X: ");
//            for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//            {System.out.printf("%016x ", R[0].X[di][dj] );}System.out.Println();}
            ind[0] += 1;
        } while (!engine.fpx.is_sqr_fp2(t,  s));
        ind[0] -= 1;

        if (qnr[0] == 1)
        {
            engine.fpx.fpcopy(engine.param.table_r_qnr[ind[0]], 0, r[0]);
        }
        else
        {
            engine.fpx.fpcopy(engine.param.table_r_qr[ind[0]], 0, r[0]);
        }

        // Get x1
        engine.fpx.fp2add(R[0].X, A, R[1].X);
        engine.fpx.fp2neg(R[1].X);    // R[1].X = -R[0].X-A

        // Get difference x2,  z2
        engine.fpx.fp2sub(R[0].X, R[1].X, R[2].Z);
        engine.fpx.fp2sqr_mont(R[2].Z, R[2].Z);

        engine.fpx.fpcopy(r[0], 0, r[1]);    // (1+i)*ind
        engine.fpx.fpaddPRIME(engine.param.Montgomery_one, r[0], r[0]);
        engine.fpx.fp2sqr_mont(r, r);
        engine.fpx.fp2mul_mont(t, r, R[2].X);
    }


    protected void RecoverY(ulong[][] A, PointProj[] xs, PointProjFull[] Rs)
    {
        ulong[][] t0 = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            t1 = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            t2 = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            t3 = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            t4 = Utils.InitArray(2, engine.param.NWORDS_FIELD);

        engine.fpx.fp2mul_mont(xs[2].X, xs[1].Z, t0);
        engine.fpx.fp2mul_mont(xs[1].X, xs[2].Z, t1);
        engine.fpx.fp2mul_mont(xs[1].X, xs[2].X, t2);
        engine.fpx.fp2mul_mont(xs[1].Z, xs[2].Z, t3);
        engine.fpx.fp2sqr_mont(xs[1].X, t4);
        engine.fpx.fp2sqr_mont(xs[1].Z, Rs[1].X);
        engine.fpx.fp2sub(t2, t3, Rs[1].Y);
        engine.fpx.fp2mul_mont(xs[1].X, Rs[1].Y, Rs[1].Y);
        engine.fpx.fp2add(t4, Rs[1].X, t4);
        engine.fpx.fp2mul_mont(xs[2].Z, t4, t4);
        engine.fpx.fp2mul_mont(A, t1, Rs[1].X);
        engine.fpx.fp2sub(t0, t1, Rs[1].Z);

        engine.fpx.fp2mul_mont(Rs[0].X, Rs[1].Z, t0);
        engine.fpx.fp2add(t2, Rs[1].X, t1);
        engine.fpx.fp2add(t1, t1, t1);
        engine.fpx.fp2sub(t0, t1, t0);
        engine.fpx.fp2mul_mont(xs[1].Z, t0, t0);
        engine.fpx.fp2sub(t0, t4, t0);
        engine.fpx.fp2mul_mont(Rs[0].X, t0, t0);
        engine.fpx.fp2add(t0, Rs[1].Y, Rs[1].Y);
        engine.fpx.fp2mul_mont(Rs[0].Y, t3, t0);
        engine.fpx.fp2mul_mont(xs[1].X, t0, Rs[1].X);
        engine.fpx.fp2add(Rs[1].X, Rs[1].X, Rs[1].X);
        engine.fpx.fp2mul_mont(xs[1].Z, t0, Rs[1].Z);
        engine.fpx.fp2add(Rs[1].Z, Rs[1].Z, Rs[1].Z);

        engine.fpx.fp2inv_mont_bingcd(Rs[1].Z);
        engine.fpx.fp2mul_mont(Rs[1].X, Rs[1].Z, Rs[1].X);
        engine.fpx.fp2mul_mont(Rs[1].Y, Rs[1].Z, Rs[1].Y);
    }


    protected void BuildOrdinary2nBasis_dual(ulong[][] A, ulong[][][][] Ds, PointProjFull[] Rs, byte[] qnr, byte[] ind)
    {
        uint i;
        ulong[] t0 = new ulong[engine.param.NWORDS_FIELD];
        ulong[][] A6 = Utils.InitArray(2, engine.param.NWORDS_FIELD);
        PointProj[] xs = new PointProj[3];
        xs[0] = new PointProj(engine.param.NWORDS_FIELD);
        xs[1] = new PointProj(engine.param.NWORDS_FIELD);
        xs[2] = new PointProj(engine.param.NWORDS_FIELD);

        // Generate x-only entangled basis 
        BuildEntangledXonly(A, xs, qnr, ind);

//        System.out.Println();System.out.Println();
//        System.out.print("xs0X: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", xs[0].X[di][dj] );}System.out.Println();}
//
//        System.out.print("xs0Z: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", xs[0].Z[di][dj] );}System.out.Println();}
//
//        System.out.print("xs1X: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", xs[1].X[di][dj] );}System.out.Println();}
//
//        System.out.print("xs1Z: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", xs[1].Z[di][dj] );}System.out.Println();}
//
//        System.out.print("xs2X: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", xs[2].X[di][dj] );}System.out.Println();}
//
//        System.out.print("xs2Z: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", xs[2].Z[di][dj] );}System.out.Println();}




        engine.fpx.fpcopy(engine.param.Montgomery_one,0, (xs[0].Z)[0]);
        engine.fpx.fpcopy(engine.param.Montgomery_one,0, (xs[1].Z)[0]);

        // Move them back to A = 6 
        for(i = 0; i < engine.param.MAX_Bob; i++)
        {
            engine.isogeny.eval_3_isog(xs[0], Ds[engine.param.MAX_Bob-1-i]);
            engine.isogeny.eval_3_isog(xs[1], Ds[engine.param.MAX_Bob-1-i]);
            engine.isogeny.eval_3_isog(xs[2], Ds[engine.param.MAX_Bob-1-i]);
        }

        // Recover y-coordinates with a single sqrt on A = 6
        engine.fpx.fpcopy(engine.param.Montgomery_one,0, A6[0]);
        engine.fpx.fpaddPRIME(A6[0], A6[0], t0);
        engine.fpx.fpaddPRIME(t0, t0, A6[0]);
        engine.fpx.fpaddPRIME(A6[0], t0, A6[0]);    // A6 = 6 

        engine.isogeny.CompleteMPoint(A6, xs[0], Rs[0]);
        RecoverY(A6, xs, Rs);
    }

    // Bob's ephemeral public key generation
    // Input:  a private key PrivateKeyB in the range [0, 2^Floor(Log(2,oB)) - 1].
    // Output: the public key PublicKeyB consisting of 3 elements in GF(p^2) which are encoded by removing leading 0 bytes.
    protected void FullIsogeny_B_dual(byte[] PrivateKeyB, ulong[][][][] Ds, ulong[][] A)
    {
        PointProj R = new PointProj(engine.param.NWORDS_FIELD),
        Q3 = new PointProj(engine.param.NWORDS_FIELD);
        PointProj[] pts = new PointProj[engine.param.MAX_INT_POINTS_BOB];
        ulong[][] XPB = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            XQB = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            XRB = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            A24plus = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            A24minus = Utils.InitArray(2, engine.param.NWORDS_FIELD);
        ulong[][][] coeff = Utils.InitArray(3, 2, engine.param.NWORDS_FIELD);
        uint i, row, m, index = 0, npts = 0, ii = 0;
        uint[] pts_index = new uint[engine.param.MAX_INT_POINTS_BOB];
        ulong[] SecretKeyB = new ulong[engine.param.NWORDS_ORDER];

        // Initialize basis points
        init_basis(engine.param.B_gen, XPB, XQB, XRB);

//        System.out.print("XPB: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", XPB[di][dj] );}System.out.Println();}
//
//        System.out.print("XQB: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", XQB[di][dj] );}System.out.Println();}
//
//        System.out.print("XRB: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", XRB[di][dj] );}System.out.Println();}



        engine.fpx.fpcopy(engine.param.XQB3, 0, Q3.X[0]);
        engine.fpx.fpcopy(engine.param.XQB3, engine.param.NWORDS_FIELD, (Q3.X)[1]);
        engine.fpx.fpcopy(engine.param.Montgomery_one, 0, Q3.Z[0]);

        // Initialize constants: A24minus = A-2C, A24plus = A+2C, where A=6, C=1
        engine.fpx.fpcopy(engine.param.Montgomery_one, 0, A24plus[0]);
        engine.fpx.fp2add(A24plus, A24plus, A24plus);
        engine.fpx.fp2add(A24plus, A24plus, A24minus);
        engine.fpx.fp2add(A24plus, A24minus, A);
        engine.fpx.fp2add(A24minus, A24minus, A24plus);

        // Retrieve kernel point
        engine.fpx.decode_to_digits(PrivateKeyB, 0, SecretKeyB, engine.param.SECRETKEY_B_BYTES, engine.param.NWORDS_ORDER);
        engine.isogeny.LADDER3PT(XPB, XQB, XRB, SecretKeyB, engine.param.BOB, R, A);

        // Traverse tree
        index = 0;
        for (row = 1; row < engine.param.MAX_Bob; row++)
        {
            while (index < engine.param.MAX_Bob-row)
            {
                pts[npts] = new PointProj(engine.param.NWORDS_FIELD);
                engine.fpx.fp2copy(R.X, pts[npts].X);
                engine.fpx.fp2copy(R.Z, pts[npts].Z);
                pts_index[npts++] = index;
                m = engine.param.strat_Bob[ii++];
                engine.isogeny.xTPLe(R, R, A24minus, A24plus, m);
                index += m;
            }
            engine.isogeny.get_3_isog(R, A24minus, A24plus, coeff);
            for (i = 0; i < npts; i++)
            {
                engine.isogeny.eval_3_isog(pts[i], coeff);
            }
            engine.isogeny.eval_3_isog(Q3, coeff);    // Kernel of dual 
            engine.fpx.fp2sub(Q3.X,Q3.Z,Ds[row-1][0]);
            engine.fpx.fp2add(Q3.X,Q3.Z,Ds[row-1][1]);

            engine.fpx.fp2copy(pts[npts-1].X, R.X);
            engine.fpx.fp2copy(pts[npts-1].Z, R.Z);
            index = pts_index[npts-1];
            npts -= 1;
        }
        engine.isogeny.get_3_isog(R, A24minus, A24plus, coeff);
        engine.isogeny.eval_3_isog(Q3, coeff);    // Kernel of dual 
        engine.fpx.fp2sub(Q3.X, Q3.Z, Ds[engine.param.MAX_Bob-1][0]);
        engine.fpx.fp2add(Q3.X, Q3.Z, Ds[engine.param.MAX_Bob-1][1]);

        engine.fpx.fp2add(A24plus, A24minus, A);
        engine.fpx.fp2sub(A24plus, A24minus, A24plus);
        engine.fpx.fp2inv_mont_bingcd(A24plus);
        engine.fpx.fp2mul_mont(A24plus, A, A);
        engine.fpx.fp2add(A, A, A);    // A = 2*(A24plus+A24mins)/(A24plus-A24minus) 
    }


    protected void Dlogs2_dual(ulong[][][] f, int[] D, ulong[] d0, ulong[] c0, ulong[] d1, ulong[] c1)
    {
        solve_dlog(f[0], D, d0, 2);
        solve_dlog(f[2], D, c0, 2);
        solve_dlog(f[1], D, d1, 2);
        solve_dlog(f[3], D, c1, 2);
        engine.fpx.mp_sub(engine.param.Alice_order, c0, c0, engine.param.NWORDS_ORDER);
        engine.fpx.mp_sub(engine.param.Alice_order, c1, c1, engine.param.NWORDS_ORDER);
    }


    protected void BuildEntangledXonly_Decomp(ulong[][] A, PointProj[] R, uint qnr, uint ind)
    {
        ulong[][] t_ptr,
            r = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            t = Utils.InitArray(2, engine.param.NWORDS_FIELD);

        // Select the correct table
        if ( qnr == 1 )
        {
            t_ptr = engine.param.table_v_qnr;
        }
        else
        {
            t_ptr = engine.param.table_v_qr;
        }

        if (ind >= engine.param.TABLE_V_LEN/2)
        {
            ind = 0;
        }
        // Get x0     
        engine.fpx.fp2mul_mont(A, t_ptr, ind * 2, R[0].X);    // x1 =  A*v
        engine.fpx.fp2neg(R[0].X);                        // R[0].X = -A*v
        engine.fpx.fp2add(R[0].X, A, t);
        engine.fpx.fp2mul_mont(R[0].X, t, t);
        engine.fpx.fpaddPRIME(t[0], engine.param.Montgomery_one, t[0]);
        engine.fpx.fp2mul_mont(R[0].X, t, t);             // t = R[0].X^3 + A*R[0].X^2 + R[0].X

        if (qnr == 1)
        {
            engine.fpx.fpcopy(engine.param.table_r_qnr[ind], 0, r[0]);
        }
        else
        {
            engine.fpx.fpcopy(engine.param.table_r_qr[ind], 0, r[0]);
        }

        // Get x1 
        engine.fpx.fp2add(R[0].X, A, R[1].X);
        engine.fpx.fp2neg(R[1].X);    // R[1].X = -R[0].X-A

        // Get difference x2,z2 
        engine.fpx.fp2sub(R[0].X, R[1].X, R[2].Z);
        engine.fpx.fp2sqr_mont(R[2].Z, R[2].Z);

        engine.fpx.fpcopy(r[0], 0, r[1]); // (1+i)*ind
        engine.fpx.fpaddPRIME(engine.param.Montgomery_one, r[0], r[0]);
        engine.fpx.fp2sqr_mont(r, r);
        engine.fpx.fp2mul_mont(t, r, R[2].X);
    }

    // Bob's PK decompression -- SIKE protocol
    protected void PKBDecompression_extended(byte[] SecretKeyA, uint SecretKeyAOffset, byte[] CompressedPKB, PointProj R, ulong[][] A, byte[] tphiBKA_t, uint tphiBKA_tOffset)
    { 
        ulong mask = unchecked((ulong) -1L);
        uint qnr, ind;
        ulong[][] A24 = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            Adiv2 = Utils.InitArray(2, engine.param.NWORDS_FIELD);
        
        ulong[] tmp1 = new ulong[2*engine.param.NWORDS_ORDER],
                tmp2 = new ulong[2*engine.param.NWORDS_ORDER],
                inv = new ulong[engine.param.NWORDS_ORDER],
                scal = new ulong[2*engine.param.NWORDS_ORDER],
                SKin = new ulong[engine.param.NWORDS_ORDER],
                a0 = new ulong[engine.param.NWORDS_ORDER],
                a1 = new ulong[engine.param.NWORDS_ORDER],
                b0 = new ulong[engine.param.NWORDS_ORDER],
                b1 = new ulong[engine.param.NWORDS_ORDER];
        PointProj[] Rs = new PointProj[3];
        Rs[0] = new PointProj(engine.param.NWORDS_FIELD);
        Rs[1] = new PointProj(engine.param.NWORDS_FIELD);
        Rs[2] = new PointProj(engine.param.NWORDS_FIELD);

        mask >>= (int)(engine.param.MAXBITS_ORDER - engine.param.OALICE_BITS);

        engine.fpx.fp2_decode(CompressedPKB, A, 4*engine.param.ORDER_A_ENCODED_BYTES);
        qnr = (uint) (CompressedPKB[4*engine.param.ORDER_A_ENCODED_BYTES + engine.param.FP2_ENCODED_BYTES] & 0x01); //todo check
        ind = CompressedPKB[4*engine.param.ORDER_A_ENCODED_BYTES + engine.param.FP2_ENCODED_BYTES + 1];

//        System.out.print("A: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", A[di][dj] );}System.out.Println();}
//
//
//        System.out.println("qnr: " + qnr);
//        System.out.println("ind: " + ind);

        BuildEntangledXonly_Decomp(A, Rs, qnr, ind);

//        System.out.print("Rs0X: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", Rs[0].X[di][dj] );}System.out.Println();}
//
//        System.out.print("Rs0Z: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", Rs[0].Z[di][dj] );}System.out.Println();}
//
//        System.out.print("Rs1X: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", Rs[1].X[di][dj] );}System.out.Println();}
//
//        System.out.print("Rs1Z: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", Rs[1].Z[di][dj] );}System.out.Println();}


        engine.fpx.fpcopy(engine.param.Montgomery_one, 0, Rs[0].Z[0]);
        engine.fpx.fpcopy(engine.param.Montgomery_one, 0, Rs[1].Z[0]);

        engine.fpx.fpaddPRIME(A[0], engine.param.Montgomery_one, A24[0]);
        engine.fpx.fpcopy(A[1], 0, A24[1]);
        engine.fpx.fpaddPRIME(A24[0], engine.param.Montgomery_one, A24[0]);
        engine.fpx.fp2div2(A24, A24);
        engine.fpx.fp2div2(A24, A24);

        engine.fpx.decode_to_digits(SecretKeyA, SecretKeyAOffset, SKin, engine.param.SECRETKEY_A_BYTES, engine.param.NWORDS_ORDER);
        engine.fpx.decode_to_digits(CompressedPKB, 0, a0, engine.param.ORDER_A_ENCODED_BYTES, engine.param.NWORDS_ORDER);
        engine.fpx.decode_to_digits(CompressedPKB, engine.param.ORDER_A_ENCODED_BYTES, b0, engine.param.ORDER_A_ENCODED_BYTES, engine.param.NWORDS_ORDER);
        engine.fpx.decode_to_digits(CompressedPKB, 2*engine.param.ORDER_A_ENCODED_BYTES, a1, engine.param.ORDER_A_ENCODED_BYTES, engine.param.NWORDS_ORDER);
        engine.fpx.decode_to_digits(CompressedPKB, 3*engine.param.ORDER_A_ENCODED_BYTES, b1, engine.param.ORDER_A_ENCODED_BYTES, engine.param.NWORDS_ORDER);

        if ( (a0[0] & 1) == 1)
        {
            engine.fpx.multiply(SKin, b1, tmp1, engine.param.NWORDS_ORDER);
            engine.fpx.mp_add(tmp1, b0, tmp1, engine.param.NWORDS_ORDER);
            tmp1[engine.param.NWORDS_ORDER-1] &= mask;
            engine.fpx.multiply(SKin, a1, tmp2, engine.param.NWORDS_ORDER);
            engine.fpx.mp_add(tmp2, a0, tmp2, engine.param.NWORDS_ORDER);
            tmp2[engine.param.NWORDS_ORDER-1] &= mask;
            engine.fpx.inv_mod_orderA(tmp2, inv);
            engine.fpx.multiply(tmp1, inv, scal, engine.param.NWORDS_ORDER);
            scal[engine.param.NWORDS_ORDER-1] &= mask;
            Ladder3pt_dual(Rs, scal, engine.param.ALICE, R, A24);
        }
        else
        {
            engine.fpx.multiply(SKin, a1, tmp1, engine.param.NWORDS_ORDER);
            engine.fpx.mp_add(tmp1, a0, tmp1, engine.param.NWORDS_ORDER);
            tmp1[engine.param.NWORDS_ORDER-1] &= (ulong)mask;
            engine.fpx.multiply(SKin, b1, tmp2, engine.param.NWORDS_ORDER);
            engine.fpx.mp_add(tmp2, b0, tmp2, engine.param.NWORDS_ORDER);
            tmp2[engine.param.NWORDS_ORDER-1] &= (ulong)mask;
            engine.fpx.inv_mod_orderA(tmp2, inv);
            engine.fpx.multiply(inv, tmp1, scal, engine.param.NWORDS_ORDER);
            scal[engine.param.NWORDS_ORDER-1] &= (ulong)mask;
            engine.isogeny.swap_points(Rs[0], Rs[1], unchecked((ulong)-1L));//check
            Ladder3pt_dual(Rs, scal, engine.param.ALICE, R, A24);
        }

        engine.fpx.fp2div2(A,Adiv2);
        engine.isogeny.xTPLe_fast(R, R, Adiv2, engine.param.OBOB_EXPON);

        engine.fpx.fp2_encode(R.X, tphiBKA_t, tphiBKA_tOffset);
        engine.fpx.fp2_encode(R.Z, tphiBKA_t, tphiBKA_tOffset + engine.param.FP2_ENCODED_BYTES);
        engine.fpx.encode_to_bytes(inv, tphiBKA_t, tphiBKA_tOffset + 2*engine.param.FP2_ENCODED_BYTES, engine.param.ORDER_A_ENCODED_BYTES);
    }

    // Bob's PK compression -- SIKE protocol
    protected void Compress_PKB_dual_extended(ulong[] d0, ulong[] c0, ulong[] d1, ulong[] c1, ulong[][] A, byte[] qnr, byte[] ind, byte[] CompressedPKB)
    {
        ulong mask = unchecked((ulong) -1L);
        ulong[] tmp = new ulong[2*engine.param.NWORDS_ORDER],
        D = new ulong[2*engine.param.NWORDS_ORDER], Dinv = new ulong[2*engine.param.NWORDS_ORDER];

        mask >>= (int)(engine.param.MAXBITS_ORDER - engine.param.OALICE_BITS);

        engine.fpx.multiply(c0, d1, tmp, engine.param.NWORDS_ORDER);
        engine.fpx.multiply(c1, d0, D, engine.param.NWORDS_ORDER);
        engine.fpx.Montgomery_neg(D, engine.param.Alice_order);
        engine.fpx.mp_add(tmp, D, D, engine.param.NWORDS_ORDER);
        D[engine.param.NWORDS_ORDER-1] &= (ulong)mask;
        engine.fpx.inv_mod_orderA(D, Dinv);


//        System.out.print("D: ");
//        for (uint dj = 0; dj < 2*engine.param.NWORDS_ORDER; dj++)
//        {System.out.printf("%016x ", D[dj] );}System.out.Println();
//
//        System.out.print("Dinv: ");
//        for (uint dj = 0; dj < 2*engine.param.NWORDS_ORDER; dj++)
//        {System.out.printf("%016x ", Dinv[dj] );}System.out.Println();



        engine.fpx.multiply(d1, Dinv, tmp, engine.param.NWORDS_ORDER); // a0' = 3^n * d1 / D
        tmp[engine.param.NWORDS_ORDER-1] &= mask;

//        System.out.print("tmp: ");
//        for (uint dj = 0; dj < 2*engine.param.NWORDS_ORDER; dj++)
//        {System.out.printf("%016x ", tmp[dj] );}System.out.Println();


        engine.fpx.encode_to_bytes(tmp, CompressedPKB, 0, engine.param.ORDER_A_ENCODED_BYTES);

        engine.fpx.Montgomery_neg(d0, engine.param.Alice_order);
        engine.fpx.multiply(d0, Dinv, tmp, engine.param.NWORDS_ORDER); // b0' = 3^n * (- d0 / D)
        tmp[engine.param.NWORDS_ORDER-1] &= (ulong)mask;
        engine.fpx.encode_to_bytes(tmp,CompressedPKB, engine.param.ORDER_A_ENCODED_BYTES, engine.param.ORDER_A_ENCODED_BYTES);

        engine.fpx.Montgomery_neg(c1, engine.param.Alice_order);
        engine.fpx.multiply(c1, Dinv, tmp, engine.param.NWORDS_ORDER); // a1' = 3^n * (- c1 / D)
        tmp[engine.param.NWORDS_ORDER-1] &= (ulong)mask;
        engine.fpx.encode_to_bytes(tmp, CompressedPKB, 2*engine.param.ORDER_A_ENCODED_BYTES, engine.param.ORDER_A_ENCODED_BYTES);

        engine.fpx.multiply(c0, Dinv, tmp, engine.param.NWORDS_ORDER); // b1' = 3^n * (c0 / D)
        tmp[engine.param.NWORDS_ORDER-1] &= (ulong)mask;
        engine.fpx.encode_to_bytes(tmp, CompressedPKB, 3*engine.param.ORDER_A_ENCODED_BYTES, engine.param.ORDER_A_ENCODED_BYTES);

        engine.fpx.fp2_encode(A, CompressedPKB, 4*engine.param.ORDER_A_ENCODED_BYTES);
        CompressedPKB[4*engine.param.ORDER_A_ENCODED_BYTES + engine.param.FP2_ENCODED_BYTES] = qnr[0];
        CompressedPKB[4*engine.param.ORDER_A_ENCODED_BYTES + engine.param.FP2_ENCODED_BYTES + 1] = ind[0];
    }

    // Bob's PK decompression -- SIDH protocol
    protected void PKBDecompression(byte[] SecretKeyA, uint SecretKeyAOffset, byte[] CompressedPKB, PointProj R, ulong[][] A)
    {
        ulong mask = unchecked((ulong) -1L);
        uint bit,qnr,ind;

        ulong[][] A24 = Utils.InitArray(2, engine.param.NWORDS_FIELD);
        ulong[] tmp1 = new ulong[2*engine.param.NWORDS_ORDER],
               tmp2 = new ulong[2*engine.param.NWORDS_ORDER],
               vone = new ulong[2*engine.param.NWORDS_ORDER],
               SKin = new ulong[engine.param.NWORDS_ORDER],
               comp_temp = new ulong[engine.param.NWORDS_ORDER];
        PointProj[] Rs = new PointProj[3];

        mask >>= (int)(engine.param.MAXBITS_ORDER - engine.param.OALICE_BITS);
        vone[0] = 1;

        engine.fpx.fp2_decode(CompressedPKB, A, 3*engine.param.ORDER_A_ENCODED_BYTES);
        bit = (uint) (CompressedPKB[3*engine.param.ORDER_A_ENCODED_BYTES + engine.param.FP2_ENCODED_BYTES] >> 7);
        qnr = (uint) (CompressedPKB[3*engine.param.ORDER_A_ENCODED_BYTES + engine.param.FP2_ENCODED_BYTES] & 0x1);
        ind = CompressedPKB[3*engine.param.ORDER_A_ENCODED_BYTES + engine.param.FP2_ENCODED_BYTES + 1];

        // Rebuild the basis 
        BuildEntangledXonly_Decomp(A,Rs,qnr,ind);
        engine.fpx.fpcopy(engine.param.Montgomery_one, 0, Rs[0].Z[0]);
        engine.fpx.fpcopy(engine.param.Montgomery_one, 0, Rs[1].Z[0]);

        engine.fpx.fpaddPRIME(A[0], engine.param.Montgomery_one, A24[0]);
        engine.fpx.fpcopy(A[1], 0, A24[1]);
        engine.fpx.fpaddPRIME(A24[0], engine.param.Montgomery_one, A24[0]);
        engine.fpx.fp2div2(A24, A24);
        engine.fpx.fp2div2(A24, A24);

        engine.fpx.decode_to_digits(SecretKeyA, SecretKeyAOffset, SKin, engine.param.SECRETKEY_A_BYTES, engine.param.NWORDS_ORDER);
        engine.isogeny.swap_points(Rs[0], Rs[1], 0-(ulong)bit);
        if (bit == 0)
        {
            engine.fpx.decode_to_digits(CompressedPKB, engine.param.ORDER_A_ENCODED_BYTES, comp_temp, engine.param.ORDER_A_ENCODED_BYTES, engine.param.NWORDS_ORDER);
            engine.fpx.multiply(SKin, comp_temp, tmp1, engine.param.NWORDS_ORDER);
            engine.fpx.mp_add(tmp1, vone, tmp1, engine.param.NWORDS_ORDER);
            tmp1[engine.param.NWORDS_ORDER-1] &= (ulong)mask;
            engine.fpx.inv_mod_orderA(tmp1, tmp2);
            engine.fpx.decode_to_digits(CompressedPKB, 2*engine.param.ORDER_A_ENCODED_BYTES, comp_temp, engine.param.ORDER_A_ENCODED_BYTES, engine.param.NWORDS_ORDER);
            engine.fpx.multiply(SKin, comp_temp, tmp1, engine.param.NWORDS_ORDER);
            engine.fpx.decode_to_digits(CompressedPKB, 0, comp_temp, engine.param.ORDER_A_ENCODED_BYTES, engine.param.NWORDS_ORDER);
            engine.fpx.mp_add(comp_temp, tmp1, tmp1, engine.param.NWORDS_ORDER);
            engine.fpx.multiply(tmp1, tmp2, vone, engine.param.NWORDS_ORDER);
            vone[engine.param.NWORDS_ORDER-1] &= mask;
            Ladder3pt_dual(Rs, vone, engine.param.ALICE, R, A24);
        }
        else
        {
            engine.fpx.decode_to_digits(CompressedPKB, 2*engine.param.ORDER_A_ENCODED_BYTES, comp_temp, engine.param.ORDER_A_ENCODED_BYTES, engine.param.NWORDS_ORDER);
            engine.fpx.multiply(SKin, comp_temp, tmp1, engine.param.NWORDS_ORDER);
            engine.fpx.mp_add(tmp1, vone, tmp1, engine.param.NWORDS_ORDER);
            tmp1[engine.param.NWORDS_ORDER-1] &= mask;
            engine.fpx.inv_mod_orderA(tmp1, tmp2);
            engine.fpx.decode_to_digits(CompressedPKB, engine.param.ORDER_A_ENCODED_BYTES, comp_temp, engine.param.ORDER_A_ENCODED_BYTES, engine.param.NWORDS_ORDER);
            engine.fpx.multiply(SKin, comp_temp, tmp1, engine.param.NWORDS_ORDER);
            engine.fpx.decode_to_digits(CompressedPKB, 0, comp_temp, engine.param.ORDER_A_ENCODED_BYTES, engine.param.NWORDS_ORDER);
            engine.fpx.mp_add(comp_temp, tmp1, tmp1, engine.param.NWORDS_ORDER);
            engine.fpx.multiply(tmp1, tmp2, vone, engine.param.NWORDS_ORDER);
            vone[engine.param.NWORDS_ORDER-1] &= mask;
            Ladder3pt_dual(Rs, vone, engine.param.ALICE, R, A24);
        }
        engine.fpx.fp2div2(A, A24);
        engine.isogeny.xTPLe_fast(R, R, A24, engine.param.OBOB_EXPON);
    }

    // Bob's PK compression -- SIDH protocol
    protected void Compress_PKB_dual(ulong[] d0, ulong[] c0, ulong[] d1, ulong[] c1, ulong[][] A, byte[] qnr, byte[] ind, byte[] CompressedPKB)
    {
        
        ulong[] tmp = new ulong[2*engine.param.NWORDS_ORDER],
               inv = new ulong[engine.param.NWORDS_ORDER];
        if ((d1[0] & 1) == 1)
        {  // Storing [-d0*d1^-1 = b1*a0^-1, -c1*d1^-1 = a1*a0^-1, c0*d1^-1 = b0*a0^-1] and setting bit384 to 0
            engine.fpx.inv_mod_orderA(d1, inv);
            engine.fpx.Montgomery_neg(d0, engine.param.Alice_order);
            engine.fpx.multiply(d0, inv, tmp, engine.param.NWORDS_ORDER);
            engine.fpx.encode_to_bytes(tmp, CompressedPKB, 0, engine.param.ORDER_A_ENCODED_BYTES);
            CompressedPKB[engine.param.ORDER_A_ENCODED_BYTES-1] &= (byte) engine.param.MASK_ALICE;
            engine.fpx.Montgomery_neg(c1, engine.param.Alice_order);
            engine.fpx.multiply(c1, inv, tmp, engine.param.NWORDS_ORDER);
            engine.fpx.encode_to_bytes(tmp, CompressedPKB,engine.param.ORDER_A_ENCODED_BYTES, engine.param.ORDER_A_ENCODED_BYTES);
            CompressedPKB[2*engine.param.ORDER_A_ENCODED_BYTES-1] &= (byte) engine.param.MASK_ALICE;
            engine.fpx.multiply(c0, inv, tmp, engine.param.NWORDS_ORDER);
            engine.fpx.encode_to_bytes(tmp, CompressedPKB, 2*engine.param.ORDER_A_ENCODED_BYTES, engine.param.ORDER_A_ENCODED_BYTES);
            CompressedPKB[3*engine.param.ORDER_A_ENCODED_BYTES-1] &= (byte) engine.param.MASK_ALICE;
            CompressedPKB[3*engine.param.ORDER_A_ENCODED_BYTES + engine.param.FP2_ENCODED_BYTES] = 0x00;
        }
        else
        {  // Storing [ -d1*d0^-1 = b1*b0inv, c1*d0^-1 = a1*b0inv, -c0*d0^-1 = a0*b0inv] and setting bit384 to 1
            engine.fpx.inv_mod_orderA(d0, inv);
            engine.fpx.Montgomery_neg(d1, engine.param.Alice_order);
            engine.fpx.multiply(d1, inv, tmp, engine.param.NWORDS_ORDER);
            engine.fpx.encode_to_bytes(tmp, CompressedPKB,0, engine.param.ORDER_A_ENCODED_BYTES);
            CompressedPKB[engine.param.ORDER_A_ENCODED_BYTES - 1] &= (byte) engine.param.MASK_ALICE;
            engine.fpx.multiply(c1, inv, tmp, engine.param.NWORDS_ORDER);
            engine.fpx.encode_to_bytes(tmp, CompressedPKB, engine.param.ORDER_A_ENCODED_BYTES, engine.param.ORDER_A_ENCODED_BYTES);
            CompressedPKB[2*engine.param.ORDER_A_ENCODED_BYTES-1] &= (byte) engine.param.MASK_ALICE;
            engine.fpx.Montgomery_neg(c0, engine.param.Alice_order);
            engine.fpx.multiply(c0, inv, tmp, engine.param.NWORDS_ORDER);
            engine.fpx.encode_to_bytes(tmp, CompressedPKB,2*engine.param.ORDER_A_ENCODED_BYTES, engine.param.ORDER_A_ENCODED_BYTES);
            CompressedPKB[3*engine.param.ORDER_A_ENCODED_BYTES-1] &= (byte) engine.param.MASK_ALICE;
            CompressedPKB[3*engine.param.ORDER_A_ENCODED_BYTES + engine.param.FP2_ENCODED_BYTES] = (byte) 0x80;
        }

        engine.fpx.fp2_encode(A, CompressedPKB,3*engine.param.ORDER_A_ENCODED_BYTES);
        CompressedPKB[3*engine.param.ORDER_A_ENCODED_BYTES + engine.param.FP2_ENCODED_BYTES] |= qnr[0];
        CompressedPKB[3*engine.param.ORDER_A_ENCODED_BYTES + engine.param.FP2_ENCODED_BYTES + 1] = ind[0];
        CompressedPKB[3*engine.param.ORDER_A_ENCODED_BYTES + engine.param.FP2_ENCODED_BYTES + 2] = 0;
    }

    // Bob's ephemeral public key generation using compression -- SIKE protocol
    protected internal uint EphemeralKeyGeneration_B_extended(byte[] PrivateKeyB, byte[] CompressedPKB, uint sike)
    {
        byte[] qnr = new byte[1], ind = new byte[1];
        int[] D = new int[engine.param.DLEN_2];
        ulong[] c0 = new ulong[engine.param.NWORDS_ORDER],
               d0 = new ulong[engine.param.NWORDS_ORDER],
               c1 = new ulong[engine.param.NWORDS_ORDER],
               d1 = new ulong[engine.param.NWORDS_ORDER];
        ulong[][][][] Ds = Utils.InitArray(engine.param.MAX_Bob, 2, 2, engine.param.NWORDS_FIELD);
        ulong[][][] f = Utils.InitArray(4, 2, engine.param.NWORDS_FIELD);
        ulong[][] A = Utils.InitArray(2, engine.param.NWORDS_FIELD);

        PointProjFull[] Rs = new PointProjFull[2];
        Rs[0] = new PointProjFull(engine.param.NWORDS_FIELD);
        Rs[1] = new PointProjFull(engine.param.NWORDS_FIELD);

        PointProj Pw = new PointProj(engine.param.NWORDS_FIELD),
                  Qw = new PointProj(engine.param.NWORDS_FIELD);

        FullIsogeny_B_dual(PrivateKeyB, Ds, A);

//        System.out.print("A: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", A[di][dj] );}System.out.Println();}System.out.Println();

//        System.out.print("Ds: ");
//        for (uint di = 0; di < engine.param.MAX_Bob; di++){for (uint dj = 0; dj < 2; dj++){for (uint dk = 0; dk < 2; dk++){for (uint dl = 0; dl < engine.param.NWORDS_FIELD; dl++)
//        {System.out.printf("%016x ", Ds[di][dj][dk][dl]);}System.out.Println();}System.out.Println();}}System.out.Println();



        BuildOrdinary2nBasis_dual(A, Ds, Rs, qnr, ind);  // Generate a basis in E_A and pulls it back to E_A6. Rs[0] and Rs[1] affinized.


        // Maps from y^2 = x^3 + 6x^2 + x into y^2 = x^3 -11x + 14
        engine.fpx.fpaddPRIME(engine.param.Montgomery_one, Rs[0].X[0], Rs[0].X[0]);
        engine.fpx.fpaddPRIME(engine.param.Montgomery_one, Rs[0].X[0], Rs[0].X[0]);  // Weierstrass form
        engine.fpx.fpaddPRIME(engine.param.Montgomery_one, Rs[1].X[0], Rs[1].X[0]);
        engine.fpx.fpaddPRIME(engine.param.Montgomery_one, Rs[1].X[0], Rs[1].X[0]);  // Weierstrass form

        engine.fpx.fpcopy(engine.param.A_basis_zero, 0*engine.param.NWORDS_FIELD, Pw.X[0]);
        engine.fpx.fpcopy(engine.param.A_basis_zero, 1*engine.param.NWORDS_FIELD, Pw.X[1]);
        engine.fpx.fpcopy(engine.param.A_basis_zero, 2*engine.param.NWORDS_FIELD, Pw.Z[0]);//y
        engine.fpx.fpcopy(engine.param.A_basis_zero, 3*engine.param.NWORDS_FIELD, Pw.Z[1]);//y
        engine.fpx.fpcopy(engine.param.A_basis_zero, 4*engine.param.NWORDS_FIELD, Qw.X[0]);
        engine.fpx.fpcopy(engine.param.A_basis_zero, 5*engine.param.NWORDS_FIELD, Qw.X[1]);
        engine.fpx.fpcopy(engine.param.A_basis_zero, 6*engine.param.NWORDS_FIELD, Qw.Z[0]);//y
        engine.fpx.fpcopy(engine.param.A_basis_zero, 7*engine.param.NWORDS_FIELD, Qw.Z[1]);//y



//        System.out.Println();
//        System.out.print("Rs0X: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", Rs[0].X[di][dj] );}System.out.Println();}
//
//        System.out.print("Rs0Y: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", Rs[0].Y[di][dj] );}System.out.Println();}
//
//        System.out.print("Rs0Z: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", Rs[0].Z[di][dj] );}System.out.Println();}
//
//        System.out.print("Rs1X: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", Rs[1].X[di][dj] );}System.out.Println();}
//
//        System.out.print("Rs1Y: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", Rs[1].Y[di][dj] );}System.out.Println();}
//
//        System.out.print("Rs1Z: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", Rs[1].Z[di][dj] );}System.out.Println();}


        Tate2_pairings(Pw, Qw, Rs, f);
        engine.fpx.fp2correction(f[0]);
        engine.fpx.fp2correction(f[1]);
        engine.fpx.fp2correction(f[2]);
        engine.fpx.fp2correction(f[3]);

//        System.out.print("\nf: ");
//        for (uint di = 0; di < 4; di++){for (uint dj = 0; dj < 2; dj++){for (uint dk = 0; dk < engine.param.NWORDS_FIELD; dk++)
//        {System.out.printf("%016x ", f[di][dj][dk]);}System.out.Println();}System.out.Println();}


        Dlogs2_dual(f, D, d0, c0, d1, c1);


//        System.out.print("D: ");
//        for (uint dj = 0; dj < engine.param.DLEN_2; dj++)
//        {System.out.printf("%08x ", D[dj] );}System.out.Println();
//
//        System.out.print("d0: ");
//        for (uint dj = 0; dj < engine.param.NWORDS_ORDER; dj++)
//        {System.out.printf("%016x ", d0[dj] );}System.out.Println();
//
//        System.out.print("c0: ");
//        for (uint dj = 0; dj < engine.param.NWORDS_ORDER; dj++)
//        {System.out.printf("%016x ", c0[dj] );}System.out.Println();
//
//        System.out.print("d1: ");
//        for (uint dj = 0; dj < engine.param.NWORDS_ORDER; dj++)
//        {System.out.printf("%016x ", d1[dj] );}System.out.Println();
//
//        System.out.print("c1: ");
//        for (uint dj = 0; dj < engine.param.NWORDS_ORDER; dj++)
//        {System.out.printf("%016x ", c1[dj] );}System.out.Println();

        if (sike == 1)
        {
            Compress_PKB_dual_extended(d0, c0, d1, c1, A, qnr, ind, CompressedPKB);
        }
        else
        {
            Compress_PKB_dual(d0, c0, d1, c1, A, qnr, ind, CompressedPKB);
        }

        return 0;
    }

    // Bob's ephemeral public key generation using compression -- SIDH protocol
    protected uint EphemeralKeyGeneration_B(byte[] PrivateKeyB, byte[] CompressedPKB)
    {
        return EphemeralKeyGeneration_B_extended(PrivateKeyB, CompressedPKB, 0);
    }

    // Alice's ephemeral shared secret computation using compression -- SIKE protocol
    protected internal uint EphemeralSecretAgreement_A_extended(byte[] PrivateKeyA, uint PrivateKeyAOffset, byte[] PKB, byte[] SharedSecretA, uint sike)
    {
        uint i, ii = 0, row, m, index = 0, npts = 0;
        uint[] pts_index = new uint[engine.param.MAX_INT_POINTS_ALICE];
        ulong[][] A24plus = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            C24 = Utils.InitArray(2, engine.param.NWORDS_FIELD);
        
        PointProj R = new PointProj(engine.param.NWORDS_FIELD);
        PointProj[] pts = new PointProj[engine.param.MAX_INT_POINTS_ALICE];
        ulong[][] jinv = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            A = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            param_A = Utils.InitArray(2, engine.param.NWORDS_FIELD);
        ulong[][][] coeff = Utils.InitArray(5, 2, engine.param.NWORDS_FIELD);


        if (sike == 1)
        {
            PKBDecompression_extended(PrivateKeyA, PrivateKeyAOffset, PKB, R, param_A, SharedSecretA, engine.param.FP2_ENCODED_BYTES);
        }
        else
        {
            PKBDecompression(PrivateKeyA, PrivateKeyAOffset, PKB, R, param_A);
        }

        engine.fpx.fp2copy(param_A, A);
        engine.fpx.fpaddPRIME(engine.param.Montgomery_one, engine.param.Montgomery_one, C24[0]);
        engine.fpx.fp2add(A, C24, A24plus);
        engine.fpx.fpaddPRIME(C24[0], C24[0], C24[0]);    

        if (engine.param.OALICE_BITS % 2 == 1)
        {
            PointProj S = new PointProj(engine.param.NWORDS_FIELD);

            engine.isogeny.xDBLe(R, S, A24plus, C24, (engine.param.OALICE_BITS - 1));
            engine.isogeny.get_2_isog(S, A24plus, C24);
            engine.isogeny.eval_2_isog(R, S);
        }

        // Traverse tree
        index = 0;
        for (row = 1; row < engine.param.MAX_Alice; row++)
        {
            while (index < engine.param.MAX_Alice-row)
            {
                pts[npts] = new PointProj(engine.param.NWORDS_FIELD);
                engine.fpx.fp2copy(R.X, pts[npts].X);
                engine.fpx.fp2copy(R.Z, pts[npts].Z);
                pts_index[npts++] = index;
                m = engine.param.strat_Alice[ii++];
                engine.isogeny.xDBLe(R, R, A24plus, C24, 2*m);
                index += m;
            }
            engine.isogeny.get_4_isog(R, A24plus, C24, coeff);

            for (i = 0; i < npts; i++)
            {
                engine.isogeny.eval_4_isog(pts[i], coeff);
            }

            engine.fpx.fp2copy(pts[npts-1].X, R.X);
            engine.fpx.fp2copy(pts[npts-1].Z, R.Z);
            index = pts_index[npts-1];
            npts -= 1;
        }

        engine.isogeny.get_4_isog(R, A24plus, C24, coeff);
        engine.fpx.fp2add(A24plus, A24plus, A24plus);
        engine.fpx.fp2sub(A24plus, C24, A24plus);
        engine.fpx.fp2add(A24plus, A24plus, A24plus);
        engine.isogeny.j_inv(A24plus, C24, jinv);
        engine.fpx.fp2_encode(jinv, SharedSecretA, 0);    // Format shared secret

        return 0;
    }

    // Alice's ephemeral shared secret computation using compression -- SIDH protocol
    // It produces a shared secret key SharedSecretA using her secret key PrivateKeyA and Bob's decompressed data point_R and param_A
    // Inputs: Alice's PrivateKeyA is an even integer in the range [2, oA-2], where oA = 2^engine.param.OALICE_BITS.
    //         Bob's decompressed data consists of point_R in (X:Z) coordinates and the curve parameter param_A in GF(p^2).
    // Output: a shared secret SharedSecretA that consists of one element in GF(p^2).
    uint EphemeralSecretAgreement_A(byte[] PrivateKeyA, uint PrivateKeyAOffset, byte[] PKB, byte[] SharedSecretA)
    {
        return EphemeralSecretAgreement_A_extended(PrivateKeyA, PrivateKeyAOffset, PKB, SharedSecretA, 0);
    }


    protected internal byte validate_ciphertext(byte[] ephemeralsk_, byte[] CompressedPKB, byte[] xKA, uint xKAOffset, byte[] tphiBKA_t, uint tphiBKA_tOffset)
    { // If ct validation passes returns 0, otherwise returns -1.
        PointProj[] phis = new PointProj[3],
                    pts = new PointProj[engine.param.MAX_INT_POINTS_BOB];

        phis[0] = new PointProj(engine.param.NWORDS_FIELD);
        phis[1] = new PointProj(engine.param.NWORDS_FIELD);
        phis[2] = new PointProj(engine.param.NWORDS_FIELD);

        PointProj R = new PointProj(engine.param.NWORDS_FIELD),
                  S = new PointProj(engine.param.NWORDS_FIELD);

        ulong[][] XPB = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            XQB = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            XRB = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            A24plus = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            A24minus = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            A = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            comp1 = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            comp2 = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            one = Utils.InitArray(2, engine.param.NWORDS_FIELD);
        ulong[][][] coeff = Utils.InitArray(3, 2, engine.param.NWORDS_FIELD);;

        uint i, row, m, index = 0, npts = 0, ii = 0;
        uint[] pts_index = new uint[engine.param.MAX_INT_POINTS_BOB];
        ulong[] temp = new ulong[engine.param.NWORDS_ORDER],
               sk = new ulong[engine.param.NWORDS_ORDER];

        engine.fpx.fpcopy(engine.param.Montgomery_one, 0, one[0]);

        // Initialize basis points
        init_basis(engine.param.B_gen, XPB, XQB, XRB);

        engine.fpx.fp2_decode(xKA, phis[0].X, xKAOffset);
        engine.fpx.fpcopy(engine.param.Montgomery_one, 0, phis[0].Z[0]); // phi[0] <- PA + skA*QA

        // Initialize constants: A24minus = A-2C, A24plus = A+2C, where A=6, C=1
        engine.fpx.fpcopy(engine.param.Montgomery_one, 0, A24plus[0]);
        engine.fpx.fp2add(A24plus, A24plus, A24plus);
        engine.fpx.fp2add(A24plus, A24plus, A24minus);  // A24minus = 4
        engine.fpx.fp2add(A24plus, A24minus, A);        // A = 6
        engine.fpx.fp2add(A24minus, A24minus, A24plus); // A24plus = 8

        // Retrieve kernel point
        engine.fpx.decode_to_digits(ephemeralsk_, 0, sk, engine.param.SECRETKEY_B_BYTES, engine.param.NWORDS_ORDER);
        engine.isogeny.LADDER3PT(XPB, XQB, XRB, sk, engine.param.BOB, R, A);

        // Traverse tree
        index = 0;
        for (row = 1; row < engine.param.MAX_Bob; row++)
        {
            while (index < engine.param.MAX_Bob-row)
            {
                pts[npts] = new PointProj(engine.param.NWORDS_FIELD);
                engine.fpx.fp2copy(R.X, pts[npts].X);
                engine.fpx.fp2copy(R.Z, pts[npts].Z);
                pts_index[npts++] = index;
                m = engine.param.strat_Bob[ii++];
                engine.isogeny.xTPLe(R, R, A24minus, A24plus, m);
                index += m;
            }
            engine.isogeny.get_3_isog(R, A24minus, A24plus, coeff);
            for (i = 0; i < npts; i++)
            {
                engine.isogeny.eval_3_isog(pts[i], coeff);
            }
            engine.isogeny.eval_3_isog(phis[0], coeff);

            engine.fpx.fp2copy(pts[npts-1].X, R.X);
            engine.fpx.fp2copy(pts[npts-1].Z, R.Z);
            index = pts_index[npts-1];
            npts -= 1;
        }
        engine.isogeny.get_3_isog(R, A24minus, A24plus, coeff);
        engine.isogeny.eval_3_isog(phis[0], coeff);  // phis[0] <- phiB(PA + skA*QA)

        engine.fpx.fp2_decode(CompressedPKB, A, 4*engine.param.ORDER_A_ENCODED_BYTES);

        // Single equation check: t*(phiP + skA*phiQ) =? t*3^n*((a0+skA*a1)*S1 + (b0+skA*b1)*S2) for t in {(a0+skA*a1)^-1, (b0+skA*b1)^-1}

        engine.fpx.fp2_decode(tphiBKA_t, S.X, tphiBKA_tOffset);
        engine.fpx.fp2_decode(tphiBKA_t, S.Z, tphiBKA_tOffset + engine.param.FP2_ENCODED_BYTES);  // Recover t*3^n*((a0+skA*a1)*S1 + (b0+skA*b1)*S2)
        engine.fpx.decode_to_digits(tphiBKA_t, tphiBKA_tOffset + 2*engine.param.FP2_ENCODED_BYTES, temp, engine.param.ORDER_A_ENCODED_BYTES, engine.param.NWORDS_ORDER);
        engine.isogeny.Ladder(phis[0], temp, A, engine.param.OALICE_BITS, R);         // t*(phiP + skA*phiQ)

        engine.fpx.fp2mul_mont(R.X, S.Z, comp1);
        engine.fpx.fp2mul_mont(R.Z, S.X, comp2);
        return (engine.fpx.cmp_f2elm(comp1, comp2));
    }



    /// DLOG

    // Computes the discrete log of input r = g^d where g = e(P,Q)^ell^e, and P,Q are torsion generators in the initial curve
    // Return the integer d
    void solve_dlog(ulong[][] r, int[] D, ulong[] d, uint ell)
    {
        if (ell == 2)
        {
            if (engine.param.OALICE_BITS % (int)engine.param.W_2 == 0)
            {
                Traverse_w_div_e_fullsigned(r, 0, 0, engine.param.PLEN_2 - 1, engine.param.ph2_path,
                        engine.param.ph2_T, D, engine.param.DLEN_2, engine.param.ELL2_W, engine.param.W_2);
            }
            else
            {
                Traverse_w_notdiv_e_fullsigned(r, 0, 0, engine.param.PLEN_2 - 1, engine.param.ph2_path,
                        engine.param.ph2_T1, engine.param.ph2_T2, D, engine.param.DLEN_2, ell, engine.param.ELL2_W,
                        engine.param.ELL2_EMODW, engine.param.W_2, engine.param.OALICE_BITS);
            }
            from_base(D, d, engine.param.DLEN_2, engine.param.ELL2_W);
        }
        else if (ell == 3)
        {
            if (engine.param.OBOB_EXPON % (int)engine.param.W_3 == 0)
            {
                Traverse_w_div_e_fullsigned(r, 0, 0, engine.param.PLEN_3 - 1, engine.param.ph3_path,
                        engine.param.ph3_T, D, engine.param.DLEN_3, engine.param.ELL3_W, engine.param.W_3);
            }
            else
            {
                Traverse_w_notdiv_e_fullsigned(r, 0, 0, engine.param.PLEN_3 - 1, engine.param.ph3_path,
                        engine.param.ph3_T1, engine.param.ph3_T2, D, engine.param.DLEN_3, ell, engine.param.ELL3_W,
                        engine.param.ELL3_EMODW, engine.param.W_3, engine.param.OBOB_EXPON);
            }
            from_base(D, d, engine.param.DLEN_3, engine.param.ELL3_W);
        }
    }

    // Convert a number in base "base" with signed digits: (D[k-1]D[k-2]...D[1]D[0])_base < 2^(NWORDS_ORDER*RADIX) into decimal
    // Output: r = D[k-1]*base^(k-1) + ... + D[1]*base + D[0]
    private void from_base(int[] D, ulong[] r, uint Dlen, uint baseNum)
    {
        ulong[] ell = new ulong[engine.param.NWORDS_ORDER],
               digit = new ulong[engine.param.NWORDS_ORDER],
               temp = new ulong[engine.param.NWORDS_ORDER];
        uint ellw;

        ell[0] = baseNum;
        if (D[Dlen-1] < 0)
        {
            digit[0] = (ulong) (((int)-D[Dlen-1])*(int) ell[0]); //todo check
            if ((baseNum & 1) == 0)
            {
                engine.fpx.Montgomery_neg(digit, engine.param.Alice_order);
                engine.fpx.copy_words(digit, r, engine.param.NWORDS_ORDER);
            }
            else
            {
                engine.fpx.mp_sub(engine.param.Bob_order, digit, r, engine.param.NWORDS_ORDER);
            }
        }
        else
        {
            r[0] = ((uint)D[Dlen-1]*ell[0]);
        }

        for (uint i = Dlen-2; i >= 1; i--)
        {
            ellw = baseNum;
            Arrays.Fill(digit, 0);
            if (D[i] < 0)
            {
                digit[0] = (ulong) (-D[i]);//todo check
                if ((baseNum & 1) == 0)
                {
                    engine.fpx.Montgomery_neg(digit, engine.param.Alice_order);
                }
                else
                {
                    engine.fpx.mp_sub(engine.param.Bob_order, digit, digit, engine.param.NWORDS_ORDER);
                }
            }
            else
            {
                digit[0] = (uint) D[i];
            }
            engine.fpx.mp_add(r, digit, r, engine.param.NWORDS_ORDER);
            if ((baseNum & 1) != 0)
            {
                if (!engine.fpx.is_orderelm_lt(r, engine.param.Bob_order))
                {
                    engine.fpx.mp_sub(r, engine.param.Bob_order, r, engine.param.NWORDS_ORDER);
                }
            }

            if ((baseNum & 1) == 0)
            {
                while (ellw > 1)
                {
                    engine.fpx.mp_add(r, r, r, engine.param.NWORDS_ORDER);
                    ellw /= 2;
                }
            }
            else
            {
                while (ellw > 1)
                {
                    Arrays.Fill(temp, 0);
                    engine.fpx.mp_add(r, r, temp, engine.param.NWORDS_ORDER);
                    if (!engine.fpx.is_orderelm_lt(temp, engine.param.Bob_order))
                    {
                        engine.fpx.mp_sub(temp, engine.param.Bob_order, temp, engine.param.NWORDS_ORDER);
                    }

                    engine.fpx.mp_add(r, temp, r, engine.param.NWORDS_ORDER);

                    if (!engine.fpx.is_orderelm_lt(r, engine.param.Bob_order))
                    {
                        engine.fpx.mp_sub(r, engine.param.Bob_order, r, engine.param.NWORDS_ORDER);
                    }
                    ellw /= 3;
                }
            }
        }
        Arrays.Fill(digit, 0);
        if (D[0] < 0)
        {
            digit[0] = (ulong) (-D[0]); // todo check
            if ((baseNum & 1) == 0)
            {
                engine.fpx.Montgomery_neg(digit, engine.param.Alice_order);
            }
            else
            {
                engine.fpx.mp_sub(engine.param.Bob_order, digit, digit, engine.param.NWORDS_ORDER);
            }
        }
        else
        {
            digit[0] = (uint) D[0];
        }
        engine.fpx.mp_add(r, digit, r, engine.param.NWORDS_ORDER);
        if ((baseNum & 1) != 0)
        {
            if (!engine.fpx.is_orderelm_lt(r, engine.param.Bob_order))
            {
                engine.fpx.mp_sub(r, engine.param.Bob_order, r, engine.param.NWORDS_ORDER);
            }
        }
    }



    // Traverse a Pohlig-Hellman optimal strategy to solve a discrete log in a group of order ell^e
    // Leaves are used to recover the digits which are numbers from 0 to ell^w-1 except by the last leaf that gives a digit between 0 and ell^(e mod w)
    // Assume w does not divide the exponent e
    void Traverse_w_notdiv_e_fullsigned(ulong[][] r, uint j, uint k, uint z, uint[] P, ulong[] CT1, ulong[] CT2,
                                        int[] D, uint Dlen, uint ell, uint ellw, uint ell_emodw, uint w, uint e)
    {
        ulong[][] rp = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            alpha = Utils.InitArray(2, engine.param.NWORDS_FIELD);


        if (z > 1)
        {
            uint t = P[z], goleft;
            engine.fpx.fp2copy(r, rp);
//            System.out.println("t: " + t);
//            System.out.println("e: " + e);
//            System.out.println("w: " + w);

            goleft = (j > 0) ? w*(z-t) : (e % w) + w*(z-t-1);
//            System.out.println("goleft: " + goleft);
            for (uint i = 0; i < goleft; i++)
            {
                if ((ell & 1) == 0)
                {
//                    System.out.println("Sqr");
                    engine.fpx.sqr_Fp2_cycl(rp, engine.param.Montgomery_one);
                }
                else
                {
//                    System.out.println("Cube");
                    engine.fpx.cube_Fp2_cycl(rp, engine.param.Montgomery_one);
                }

//                System.out.print("rp: ");
//                for (uint di = 0; di < 2; di++){
//                for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++){
//                System.out.printf("%016x ", rp[di][dj]);}System.out.Println();}System.out.Println();

            }

            Traverse_w_notdiv_e_fullsigned(rp, j + (z - t), k, t, P, CT1, CT2, D, Dlen, ell, ellw, ell_emodw, w, e);

            engine.fpx.fp2copy(r, rp);
            for (uint h = k; h < k + t; h++)
            {
                if (D[h] != 0)
                {
                    if (j > 0)
                    {
                        if ((int)D[h] < 0)
                        {
                            engine.fpx.fp2copy(CT2, (uint) (engine.param.NWORDS_FIELD * (2*(j + h)*(ellw/2)+2*(-D[h]-1))), alpha); //todo check offset
                            engine.fpx.fpnegPRIME(alpha[1]);
                            engine.fpx.fp2mul_mont(rp, alpha, rp);
                        }
                        else
                        {
                            engine.fpx.fp2mul_mont(rp, CT2, (uint) (engine.param.NWORDS_FIELD * (2*((j + h)*(ellw/2) + (D[h]-1)))), rp);
                        }
                    }
                    else
                    {
                        if ((int)D[h] < 0)
                        {
                            engine.fpx.fp2copy(CT1, (uint)(engine.param.NWORDS_FIELD * (2 * ((j + h) * (ellw / 2) + (-D[h] - 1)))), alpha); //todo check offset
                            engine.fpx.fpnegPRIME(alpha[1]);
                            engine.fpx.fp2mul_mont(rp, alpha, rp);
                        }
                        else
                        {
                            engine.fpx.fp2mul_mont(rp, CT1, (uint)(engine.param.NWORDS_FIELD * (2*((j + h)*(ellw/2) + (D[h]-1)))), rp);
                        }
                    }
                }
            }

            Traverse_w_notdiv_e_fullsigned(rp, j, k + t, z - t, P, CT1, CT2, D, Dlen, ell, ellw, ell_emodw, w, e);
        }
        else
        {
//            System.out.print("ELSE >\n");
            engine.fpx.fp2copy(r, rp);
            engine.fpx.fp2correction(rp);
//            System.out.print("rp: ");
//            for (uint di = 0; di < 2; di++){
//            for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++){
//            System.out.printf("%016x ", rp[di][dj]);}System.out.Println();}


            if (engine.fpx.is_felm_zero(rp[1]) && Fpx.subarrayEquals(rp[0],engine.param.Montgomery_one, engine.param.NWORDS_FIELD))
            {
//                System.out.print("IF0 > ");
                D[k] = 0;
            }
            else
            {
//                System.out.print("ELSE0 > ");

                if (!(j == 0 && k == Dlen - 1))
                {
//                    System.out.print("IF1 > ");

                    for (uint t = 1; t <= (ellw/2); t++)
                    {
//                        System.out.println(2*(ellw/2)*(Dlen-1) + 2*(t-1));
//                        System.out.print("rp: ");
//                        for (uint di = 0; di < 2; di++){
//                            for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++){
//                                System.out.printf("%016x ", rp[di][dj]);}System.out.Println();}

                        if (Fpx.subarrayEquals(rp, CT2, engine.param.NWORDS_FIELD * (2 *(ellw/2)*(Dlen-1) + 2*(t-1)), 2*engine.param.NWORDS_FIELD))
                        {
//                            System.out.print("FORIF > ");

                            D[k] = -(int)t;
                            break;
                        }
                        else
                        {
//                            System.out.print("FORELSE >\n");

                            engine.fpx.fp2copy(CT2, engine.param.NWORDS_FIELD *(2*((ellw/2)*(Dlen-1) + (t-1))), alpha);

//                            System.out.println("offset: " + 2*((ellw/2)*(Dlen-1) + (t-1)));

                            engine.fpx.fpnegPRIME(alpha[1]);
                            engine.fpx.fpcorrectionPRIME(alpha[1]);

//                            System.out.print("alpha: ");
//                            for (uint di = 0; di < 2; di++){
//                                for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++){
//                                    System.out.printf("%016x ", alpha[di][dj]);}System.out.Println();}

                            if (Fpx.subarrayEquals(rp, alpha, 2*engine.param.NWORDS_FIELD))
                            {
//                                System.out.print("INIF > ");

                                D[k] = (int)t;
                                break;
                            }
                        }
                    }
                }
                else
                {
//                    System.out.print("ELSE1 > ");

                    for (uint t = 1; t <= ell_emodw/2; t++)
                    {
                        if (Fpx.subarrayEquals(rp, CT1,engine.param.NWORDS_FIELD * (2*(ellw/2)*(Dlen - 1) + 2*(t-1)), 2*engine.param.NWORDS_FIELD))
                        {
//                            System.out.print("FORIF > ");
                            D[k] = -(int)t;
                            break;
                        }
                        else
                        {
//                            System.out.print("FORELSE > ");

                            engine.fpx.fp2copy(CT1, engine.param.NWORDS_FIELD * (2*((ellw/2)*(Dlen-1) + (t-1))), alpha);
                            engine.fpx.fpnegPRIME(alpha[1]);
                            engine.fpx.fpcorrectionPRIME(alpha[1]);
                            if (Fpx.subarrayEquals(rp, alpha, 2*engine.param.NWORDS_FIELD))
                            {
//                                System.out.print("INIF > ");

                                D[k] = (int)t;
                                break;
                            }
                        }
                    }
                }
//                System.out.Println();
            }
        }
    }



    // Traverse a Pohlig-Hellman optimal strategy to solve a discrete log in a group of order ell^e
    // The leaves of the tree will be used to recover the signed digits which are numbers from +/-{0,1... Ceil((ell^w-1)/2)}
    // Assume the integer w divides the exponent e
    void Traverse_w_div_e_fullsigned(ulong[][] r, uint j, uint k, uint z, uint[] P, ulong[] CT, int[] D, uint Dlen, uint ellw, uint w)
    {
        ulong[][] rp = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            alpha = Utils.InitArray(2, engine.param.NWORDS_FIELD);

        if (z > 1)
        {
            uint t = P[z];
            engine.fpx.fp2copy(r, rp);
            for (uint i = 0; i < z-t; i++)
            {
                if ((ellw & 1) == 0)
                {
                    for (uint ii = 0; ii < w; ii++)
                    {
                        engine.fpx.sqr_Fp2_cycl(rp, engine.param.Montgomery_one);
                    }
                }
                else
                {
                    for (uint ii = 0; ii < w; ii++)
                    {
                        engine.fpx.cube_Fp2_cycl(rp, engine.param.Montgomery_one);
                    }
                }
            }

            Traverse_w_div_e_fullsigned(rp, j + (z - t), k, t, P, CT, D, Dlen, ellw, w);

            engine.fpx.fp2copy(r, rp);
            for (uint h = k; h < k + t; h++)
            {
                if (D[h] != 0)
                {
                    if((int)D[h] < 0)
                    {
                        engine.fpx.fp2copy(CT,  (uint)(engine.param.NWORDS_FIELD * (2*((j + h)*(ellw/2) + (-D[h]-1)))), alpha);//todo check offset
                        engine.fpx.fpnegPRIME(alpha[1]);
                        engine.fpx.fp2mul_mont(rp, alpha, rp);
                    }
                    else
                    {
                        engine.fpx.fp2mul_mont(rp, CT,  (uint) (engine.param.NWORDS_FIELD * (2*((j + h)*(ellw/2) + (D[h]-1)))), rp);
                    }
                }
            }
            Traverse_w_div_e_fullsigned(rp, j, k + t, z - t, P, CT, D, Dlen, ellw, w);
        }
        else
        {
            engine.fpx.fp2copy(r, rp);
            engine.fpx.fp2correction(rp);

            if (engine.fpx.is_felm_zero(rp[1]) && Fpx.subarrayEquals(rp[0], engine.param.Montgomery_one, engine.param.NWORDS_FIELD))
            {
                D[k] = 0;
            }
            else
            {
                for (uint t = 1; t <= ellw/2; t++)
                {
                    if (Fpx.subarrayEquals(rp, CT, engine.param.NWORDS_FIELD * (2*((Dlen - 1)*(ellw/2) + (t-1))), 2*engine.param.NWORDS_FIELD))
                    {
                        D[k] = -(int)t; // todo check
                        break;
                    }
                    else
                    {
                        engine.fpx.fp2copy(CT, engine.param.NWORDS_FIELD * (2*((Dlen - 1)*(ellw/2) + (t-1))), alpha);
                        engine.fpx.fpnegPRIME(alpha[1]);
                        engine.fpx.fpcorrectionPRIME(alpha[1]);
                        if (Fpx.subarrayEquals(rp, alpha, 2*engine.param.NWORDS_FIELD ))
                        {
                            D[k] = (int)t;
                            break;
                        }
                    }
                }
            }
        }
    }
    ///
    
    //Pairing

    private static uint t_points = 2;
    private void Tate3_pairings(PointProjFull[] Qj, ulong[][][] f)
    {
        ulong[] x = new ulong[engine.param.NWORDS_FIELD],
                y = new ulong[engine.param.NWORDS_FIELD],
                l1 = new ulong[engine.param.NWORDS_FIELD],
                l2 = new ulong[engine.param.NWORDS_FIELD],
                n1 = new ulong[engine.param.NWORDS_FIELD],
                n2 = new ulong[engine.param.NWORDS_FIELD],
                x2 = new ulong[engine.param.NWORDS_FIELD],
                x23 = new ulong[engine.param.NWORDS_FIELD],
                x2p3 = new ulong[engine.param.NWORDS_FIELD];

        ulong[][][] xQ2s = Utils.InitArray(t_points, 2, engine.param.NWORDS_FIELD),
            finv = Utils.InitArray(2*t_points, 2, engine.param.NWORDS_FIELD);
        ulong[][] one = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            t0 = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            t1 = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            t2 = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            t3 = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            t4 = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            t5 = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            g = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            h = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            tf = Utils.InitArray(2, engine.param.NWORDS_FIELD);


        engine.fpx.fpcopy(engine.param.Montgomery_one, 0, one[0]);

        for (uint j = 0; j < t_points; j++) 
        {
            engine.fpx.fp2copy(one, f[j]);
            engine.fpx.fp2copy(one, f[j+t_points]);
            engine.fpx.fp2sqr_mont(Qj[j].X, xQ2s[j]);
        }


//        System.out.print("f: ");
//        for (uint di = 0; di < 4; di++){for (uint dj = 0; dj < 2; dj++){for (uint dk = 0; dk < engine.param.NWORDS_FIELD; dk++)
//        {System.out.printf("%016x ", f[di][dj][dk]);}System.out.Println();}System.out.Println();}


//        System.out.print("xQ2s0: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", xQ2s[0][di][dj] );}System.out.Println();}
//
//        System.out.print("xQ2s1: ");
//        for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//        {System.out.printf("%016x ", xQ2s[1][di][dj] );}System.out.Println();}





        for (uint k = 0; k < engine.param.OBOB_EXPON - 1; k++)
        {
//            System.out.println("k: " + k);
            System.Array.Copy(engine.param.T_tate3, engine.param.NWORDS_FIELD * (6*k + 0), l1, 0, engine.param.NWORDS_FIELD);
            System.Array.Copy(engine.param.T_tate3, engine.param.NWORDS_FIELD * (6*k + 1), l2, 0, engine.param.NWORDS_FIELD);
            System.Array.Copy(engine.param.T_tate3, engine.param.NWORDS_FIELD * (6*k + 2), n1, 0, engine.param.NWORDS_FIELD);
            System.Array.Copy(engine.param.T_tate3, engine.param.NWORDS_FIELD * (6*k + 3), n2, 0, engine.param.NWORDS_FIELD);
            System.Array.Copy(engine.param.T_tate3, engine.param.NWORDS_FIELD * (6*k + 4), x23, 0, engine.param.NWORDS_FIELD);
            System.Array.Copy(engine.param.T_tate3, engine.param.NWORDS_FIELD * (6*k + 5), x2p3, 0, engine.param.NWORDS_FIELD);

//            System.out.print("l1: ");
//            for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//            {System.out.printf("%016x ", l1[dj] );}System.out.Println();
//
//            System.out.print("l2: ");
//            for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//            {System.out.printf("%016x ", l2[dj] );}System.out.Println();
//
//            System.out.print("n1: ");
//            for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//            {System.out.printf("%016x ", n1[dj] );}System.out.Println();
//
//            System.out.print("n2: ");
//            for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//            {System.out.printf("%016x ", n2[dj] );}System.out.Println();
//
//            System.out.print("x23: ");
//            for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//            {System.out.printf("%016x ", x23[dj] );}System.out.Println();
//
//            System.out.print("x2p3: ");
//            for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//            {System.out.printf("%016x ", x2p3[dj] );}System.out.Println();


            for (uint j = 0; j < t_points; j++)
            {
//                System.out.println("j: " + j);
                engine.fpx.fpmul_mont(Qj[j].X[0], l1, t0[0]);
                engine.fpx.fpmul_mont(Qj[j].X[1], l1, t0[1]);
                engine.fpx.fpmul_mont(Qj[j].X[0], l2, t2[0]);
                engine.fpx.fpmul_mont(Qj[j].X[1], l2, t2[1]);
                engine.fpx.fpaddPRIME(xQ2s[j][0], x23, t4[0]);
                engine.fpx.fpcopy(xQ2s[j][1], 0, t4[1]);
                engine.fpx.fpmul_mont(Qj[j].X[0], x2p3, t5[0]);
                engine.fpx.fpmul_mont(Qj[j].X[1], x2p3, t5[1]);

//                System.out.print("t5: ");
//                for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//                {System.out.printf("%016x ", t5[di][dj] );}System.out.Println();}



                engine.fpx.fp2sub(t0, Qj[j].Y, t1);
                engine.fpx.fpaddPRIME(t1[0], n1, t1[0]);
                engine.fpx.fp2sub(t2, Qj[j].Y, t3);
                engine.fpx.fpaddPRIME(t3[0], n2, t3[0]);
                engine.fpx.fp2mul_mont(t1, t3, g);
                engine.fpx.fp2sub(t4, t5, h);
                engine.fpx.fp2_conj(h, h);
                engine.fpx.fp2mul_mont(g, h, g);

                engine.fpx.fp2sqr_mont(f[j], tf);
                engine.fpx.fp2mul_mont(f[j], tf, f[j]);
                engine.fpx.fp2mul_mont(f[j], g, f[j]);

                engine.fpx.fpsubPRIME(t0[1], Qj[j].Y[0], t1[0]);
                engine.fpx.fpaddPRIME(t0[0], Qj[j].Y[1], t1[1]);
                engine.fpx.fpnegPRIME(t1[1]);
                engine.fpx.fpaddPRIME(t1[1], n1, t1[1]);
                engine.fpx.fpsubPRIME(t2[1], Qj[j].Y[0], t3[0]);
                engine.fpx.fpaddPRIME(t2[0], Qj[j].Y[1], t3[1]);
                engine.fpx.fpnegPRIME(t3[1]);
                engine.fpx.fpaddPRIME(t3[1], n2, t3[1]);

                engine.fpx.fp2mul_mont(t1, t3, g);
                engine.fpx.fp2add(t4, t5, h);
                engine.fpx.fp2_conj(h, h);
                engine.fpx.fp2mul_mont(g, h, g);

                engine.fpx.fp2sqr_mont(f[j+t_points], tf);
                engine.fpx.fp2mul_mont(f[j+t_points], tf, f[j+t_points]);
                engine.fpx.fp2mul_mont(f[j+t_points], g, f[j+t_points]);

//                System.out.print("f: ");
//                for (uint di = 0; di < 4; di++){for (uint dj = 0; dj < 2; dj++){for (uint dk = 0; dk < engine.param.NWORDS_FIELD; dk++)
//                {System.out.printf("%016x ", f[di][dj][dk]);}System.out.Println();}System.out.Println();}

            }
        }

//        System.out.print("f: ");
//        for (uint di = 0; di < 4; di++){for (uint dj = 0; dj < 2; dj++){for (uint dk = 0; dk < engine.param.NWORDS_FIELD; dk++)
//        {System.out.printf("%016x ", f[di][dj][dk]);}System.out.Println();}System.out.Println();}


        for (uint j = 0; j < t_points; j++)
        {
            System.Array.Copy(engine.param.T_tate3,  engine.param.NWORDS_FIELD * (6*(engine.param.OBOB_EXPON-1) + 0), x, 0, engine.param.NWORDS_FIELD);
            System.Array.Copy(engine.param.T_tate3,  engine.param.NWORDS_FIELD * (6*(engine.param.OBOB_EXPON-1) + 1), y, 0, engine.param.NWORDS_FIELD);
            System.Array.Copy(engine.param.T_tate3,  engine.param.NWORDS_FIELD * (6*(engine.param.OBOB_EXPON-1) + 2), l1, 0, engine.param.NWORDS_FIELD);
            System.Array.Copy(engine.param.T_tate3,  engine.param.NWORDS_FIELD * (6*(engine.param.OBOB_EXPON-1) + 3), x2, 0, engine.param.NWORDS_FIELD);

            engine.fpx.fpsubPRIME(Qj[j].X[0], x, t0[0]);
            engine.fpx.fpcopy(Qj[j].X[1], 0, t0[1]);
            engine.fpx.fpmul_mont(l1, t0[0], t1[0]);
            engine.fpx.fpmul_mont(l1, t0[1], t1[1]);
            engine.fpx.fp2sub(t1, Qj[j].Y, t2);
            engine.fpx.fpaddPRIME(t2[0], y, t2[0]);
            engine.fpx.fp2mul_mont(t0, t2, g);
            engine.fpx.fpsubPRIME(Qj[j].X[0], x2, h[0]);
            engine.fpx.fpcopy(Qj[j].X[1],0, h[1]);
            engine.fpx.fpnegPRIME(h[1]);
            engine.fpx.fp2mul_mont(g, h, g);

            engine.fpx.fp2sqr_mont(f[j], tf);
            engine.fpx.fp2mul_mont(f[j], tf, f[j]);
            engine.fpx.fp2mul_mont(f[j], g, f[j]);

            engine.fpx.fpaddPRIME(Qj[j].X[0], x, t0[0]);
            engine.fpx.fpmul_mont(l1, t0[0], t1[0]);
            engine.fpx.fpsubPRIME(Qj[j].Y[0], t1[1], t2[0]);
            engine.fpx.fpaddPRIME(Qj[j].Y[1], t1[0], t2[1]);
            engine.fpx.fpsubPRIME(t2[1], y, t2[1]);
            engine.fpx.fp2mul_mont(t0, t2, g);
            engine.fpx.fpaddPRIME(Qj[j].X[0], x2, h[0]);
            engine.fpx.fp2mul_mont(g, h, g);

            engine.fpx.fp2sqr_mont(f[j+t_points], tf);
            engine.fpx.fp2mul_mont(f[j+t_points], tf, f[j+t_points]);
            engine.fpx.fp2mul_mont(f[j+t_points], g, f[j+t_points]);
        }
//        System.out.print("f: ");
//        for (uint di = 0; di < 4; di++){for (uint dj = 0; dj < 2; dj++){for (uint dk = 0; dk < engine.param.NWORDS_FIELD; dk++)
//        {System.out.printf("%016x ", f[di][dj][dk]);}System.out.Println();}System.out.Println();}


        // Final exponentiation:
        engine.fpx.mont_n_way_inv(f, 2*t_points, finv);
        for (uint j = 0; j < 2*t_points; j++)
        {
            final_exponentiation_3_torsion(f[j], finv[j], f[j]);
        }
    }

    // The exponentiation for pairings in the 3-torsion group. Raising the value f to the power (p^2-1)/3^eB.
    private void final_exponentiation_3_torsion(ulong[][] f, ulong[][] finv, ulong[][] fout)
    {
        ulong[] one = new ulong[engine.param.NWORDS_FIELD];
        ulong[][] temp = Utils.InitArray(2, engine.param.NWORDS_FIELD);
        uint i;

        engine.fpx.fpcopy(engine.param.Montgomery_one, 0, one);

        // f = f^p
        engine.fpx.fp2_conj(f, temp);
        engine.fpx.fp2mul_mont(temp, finv, temp);              // temp = f^(p-1)

        for (i = 0; i < engine.param.OALICE_BITS; i++)
        {
            engine.fpx.sqr_Fp2_cycl(temp, one);
        }
        engine.fpx.fp2copy(temp, fout);
    }

    private void Tate2_pairings(PointProj P, PointProj Q, PointProjFull[] Qj, ulong[][][] f)
    {
        ulong[] x, y, x_, y_, l1;
        ulong[][][] finv = Utils.InitArray(2 * t_points, 2, engine.param.NWORDS_FIELD);

        ulong[][] x_first,
            y_first,
            one = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            l1_first = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            t0 = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            t1 = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            g = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            h = Utils.InitArray(2, engine.param.NWORDS_FIELD);

        uint x_Offset, y_Offset, l1Offset, xOffset, yOffset;


        engine.fpx.fpcopy(engine.param.Montgomery_one, 0, one[0]);

        for (uint j = 0; j < t_points; j++)
        {
            engine.fpx.fp2copy(one, f[j]);
            engine.fpx.fp2copy(one, f[j+t_points]);
        }

        // Pairings with P
        x_first = P.X;
        y_first = P.Z;

        x_Offset = 0; // engine.param.T_tate2_firststep_P
        y_Offset = 1; // engine.param.T_tate2_firststep_P
        x_ = engine.param.T_tate2_firststep_P;
        y_ = engine.param.T_tate2_firststep_P;

        engine.fpx.fpcopy(engine.param.T_tate2_firststep_P, 2*engine.param.NWORDS_FIELD, l1_first[0]);
        engine.fpx.fpcopy(engine.param.T_tate2_firststep_P, 3*engine.param.NWORDS_FIELD, l1_first[1]);


        for (uint j = 0; j < t_points; j++)
        {
            engine.fpx.fp2sub(Qj[j].X, x_first, t0);
            engine.fpx.fp2sub(Qj[j].Y, y_first, t1);
            engine.fpx.fp2mul_mont(l1_first, t0, t0);
            engine.fpx.fp2sub(t0, t1, g);

            engine.fpx.fpsubPRIME(Qj[j].X[0], engine.param.T_tate2_firststep_P, x_Offset, h[0]);
            engine.fpx.fpcopy(Qj[j].X[1], 0, h[1]);
            engine.fpx.fpnegPRIME(h[1]);
            engine.fpx.fp2mul_mont(g, h, g);

            engine.fpx.fp2sqr_mont(f[j], f[j]);
            engine.fpx.fp2mul_mont(f[j], g, f[j]);
        }
        //////////////////////////////////////////////////




        xOffset = 0; //engine.param.T_tate2_firststep_P
        yOffset = 1 * engine.param.NWORDS_FIELD; //engine.param.T_tate2_firststep_P
        x = x_;
        y = y_;

        for (uint k = 0; k < engine.param.OALICE_BITS - 2; k++)
        {

            x_ = engine.param.T_tate2_P;
            y_ = engine.param.T_tate2_P;
            l1 = engine.param.T_tate2_P;
            x_Offset = engine.param.NWORDS_FIELD * (3 * k + 0);
            y_Offset = engine.param.NWORDS_FIELD * (3 * k + 1);
            l1Offset = engine.param.NWORDS_FIELD * (3 * k + 2);
            for (uint j = 0; j < t_points; j++)
            {
                engine.fpx.fpsubPRIME(x, xOffset, Qj[j].X[0], t0[1]);
                engine.fpx.fpmul_mont(l1, l1Offset, t0[1], t0[1]);
                engine.fpx.fpmul_mont(l1, l1Offset, Qj[j].X[1], t0[0]);

//                System.out.print("t0: ");
//                for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//                {System.out.printf("%016x ", t0[di][dj] );}System.out.Println();}

                engine.fpx.fpsubPRIME(Qj[j].Y[1], y, yOffset, t1[1]);

//                System.out.print("t1: ");
//                for (uint di = 0; di < 2; di++){for (uint dj = 0; dj < engine.param.NWORDS_FIELD; dj++)
//                {System.out.printf("%016x ", t1[di][dj] );}System.out.Println();}

                engine.fpx.fpsubPRIME(t0[1], t1[1], g[1]);
                engine.fpx.fpsubPRIME(t0[0], Qj[j].Y[0], g[0]);

                engine.fpx.fpsubPRIME(Qj[j].X[0], x_, x_Offset, h[0]);
                engine.fpx.fpcopy(Qj[j].X[1], 0, h[1]);
                engine.fpx.fpnegPRIME(h[1]);
                engine.fpx.fp2mul_mont(g, h, g);

                engine.fpx.fp2sqr_mont(f[j], f[j]);
                engine.fpx.fp2mul_mont(f[j], g, f[j]);
            }
            x = x_;
            y = y_;
            yOffset = y_Offset;
            xOffset = x_Offset;
        }

//        System.out.print("\nf: ");
//        for (uint di = 0; di < 4; di++){for (uint dj = 0; dj < 2; dj++){for (uint dk = 0; dk < engine.param.NWORDS_FIELD; dk++)
//        {System.out.printf("%016x ", f[di][dj][dk]);}System.out.Println();}System.out.Println();}


        for (uint j = 0; j < t_points; j++)
        {
            engine.fpx.fpsubPRIME(Qj[j].X[0], x, xOffset, g[0]);
            engine.fpx.fpcopy(Qj[j].X[1], 0, g[1]);
            engine.fpx.fp2sqr_mont(f[j], f[j]);
            engine.fpx.fp2mul_mont(f[j], g, f[j]);
        }
//        System.out.print("\nnf: ");
//        for (uint di = 0; di < 4; di++){for (uint dj = 0; dj < 2; dj++){for (uint dk = 0; dk < engine.param.NWORDS_FIELD; dk++)
//        {System.out.printf("%016x ", f[di][dj][dk]);}System.out.Println();}System.out.Println();}


        // Pairings with Q
        x_first = Q.X;
        y_first = Q.Z;
        x_ = engine.param.T_tate2_firststep_Q;
        y_ = engine.param.T_tate2_firststep_Q;
        x_Offset = 0;
        y_Offset = 1 * engine.param.NWORDS_FIELD;

        engine.fpx.fpcopy(engine.param.T_tate2_firststep_Q, 2 * engine.param.NWORDS_FIELD, l1_first[0]);
        engine.fpx.fpcopy(engine.param.T_tate2_firststep_Q, 3 * engine.param.NWORDS_FIELD, l1_first[1]);

        for (uint j = 0; j < t_points; j++)
        {
            engine.fpx.fp2sub(Qj[j].X, x_first, t0);
            engine.fpx.fp2sub(Qj[j].Y, y_first, t1);
            engine.fpx.fp2mul_mont(l1_first, t0, t0);
            engine.fpx.fp2sub(t0, t1, g);

            engine.fpx.fpsubPRIME(Qj[j].X[0], x_, x_Offset, h[0]);
            engine.fpx.fpcopy(Qj[j].X[1], 0, h[1]);
            engine.fpx.fpnegPRIME(h[1]);
            engine.fpx.fp2mul_mont(g, h, g);

            engine.fpx.fp2sqr_mont(f[j+t_points], f[j+t_points]);
            engine.fpx.fp2mul_mont(f[j+t_points], g, f[j+t_points]);
        }
        x = x_;
        y = y_;
        yOffset = y_Offset;
        xOffset = x_Offset;

        for (uint k = 0; k < engine.param.OALICE_BITS - 2; k++)
        {
            x_ = engine.param.T_tate2_Q;
            y_ = engine.param.T_tate2_Q;
            l1 = engine.param.T_tate2_Q;

            x_Offset = engine.param.NWORDS_FIELD * (3*k + 0);
            y_Offset = engine.param.NWORDS_FIELD * (3*k + 1);
            l1Offset = engine.param.NWORDS_FIELD * (3*k + 2);
            for (uint j = 0; j < t_points; j++)
            {
                engine.fpx.fpsubPRIME(Qj[j].X[0], x, xOffset, t0[0]);
                engine.fpx.fpmul_mont(l1, l1Offset, t0[0], t0[0]);
                engine.fpx.fpmul_mont(l1, l1Offset, Qj[j].X[1], t0[1]);
                engine.fpx.fpsubPRIME(Qj[j].Y[0], y, yOffset, t1[0]);
                engine.fpx.fpsubPRIME(t0[0], t1[0], g[0]);
                engine.fpx.fpsubPRIME(t0[1], Qj[j].Y[1], g[1]);

                engine.fpx.fpsubPRIME(Qj[j].X[0], x_, x_Offset, h[0]);
                engine.fpx.fpcopy(Qj[j].X[1], 0, h[1]);
                engine.fpx.fpnegPRIME(h[1]);
                engine.fpx.fp2mul_mont(g, h, g);

                engine.fpx.fp2sqr_mont(f[j+t_points], f[j+t_points]);
                engine.fpx.fp2mul_mont(f[j+t_points], g, f[j+t_points]);
            }
            x = x_;
            y = y_;
            yOffset = y_Offset;
            xOffset = x_Offset;
        }
        // Last iteration
        for (uint j = 0; j < t_points; j++)
        {
            engine.fpx.fpsubPRIME(Qj[j].X[0], x, xOffset, g[0]);
            engine.fpx.fpcopy(Qj[j].X[1], 0, g[1]);

            engine.fpx.fp2sqr_mont(f[j+t_points], f[j+t_points]);
            engine.fpx.fp2mul_mont(f[j+t_points], g, f[j+t_points]);
        }

        // Final exponentiation:
        engine.fpx.mont_n_way_inv(f, 2*t_points, finv);
        for (uint j = 0; j < 2*t_points; j++)
        {
            final_exponentiation_2_torsion(f[j], finv[j], f[j]);
        }
    }

    // The exponentiation for pairings in the 2^eA-torsion group. Raising the value f to the power (p^2-1)/2^eA.
    private void final_exponentiation_2_torsion(ulong[][] f, ulong[][] finv, ulong[][] fout)
    {
        ulong[] one = new ulong[engine.param.NWORDS_FIELD];
        ulong[][] temp = Utils.InitArray(2, engine.param.NWORDS_FIELD);
        uint i;

        engine.fpx.fpcopy(engine.param.Montgomery_one, 0, one);

        // f = f^p
        engine.fpx.fp2_conj(f, temp);
        engine.fpx.fp2mul_mont(temp, finv, temp);              // temp = f^(p-1)

        for (i = 0; i < engine.param.OBOB_EXPON; i++)
        {
            engine.fpx.cube_Fp2_cycl(temp, one);
        }
        engine.fpx.fp2copy(temp, fout);
    }



}

}