namespace Org.BouncyCastle.Pqc.Crypto.Sike
{
internal class SIDH
{
    private SIKEEngine engine;

    public SIDH(SIKEEngine engine)
    {
        this.engine = engine;
    }

    // Initialization of basis points
    protected void init_basis(ulong[] gen, ulong[][] XP, ulong[][] XQ, ulong[][] XR)
    {
       engine.fpx.fpcopy(gen, 0, XP[0]);
       engine.fpx.fpcopy(gen, engine.param.NWORDS_FIELD, XP[1]);
       engine.fpx.fpcopy(gen, 2 * engine.param.NWORDS_FIELD, XQ[0]);
       engine.fpx.fpcopy(gen, 3 * engine.param.NWORDS_FIELD, XQ[1]);
       engine.fpx.fpcopy(gen, 4 * engine.param.NWORDS_FIELD, XR[0]);
       engine.fpx.fpcopy(gen, 5 * engine.param.NWORDS_FIELD, XR[1]);
    }

    // Bob's ephemeral public key generation
    // Input:  a private key PrivateKeyB in the range [0, 2^Floor(Log(2,oB)) - 1].
    // Output: the public key PublicKeyB consisting of 3 elements in GF(p^2) which are encoded by removing leading 0 bytes.
    protected internal void EphemeralKeyGeneration_B(byte[] sk, byte[] pk)
    {
        PointProj R = new PointProj(engine.param.NWORDS_FIELD),
                phiP = new PointProj(engine.param.NWORDS_FIELD),
                phiQ = new PointProj(engine.param.NWORDS_FIELD),
                phiR = new PointProj(engine.param.NWORDS_FIELD);

        PointProj[] pts = new PointProj[engine.param.MAX_INT_POINTS_BOB];

        ulong[][] XPB = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            XQB = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            XRB = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            A24plus = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            A24minus = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            A = Utils.InitArray(2, engine.param.NWORDS_FIELD);

        ulong[][][] coeff = Utils.InitArray(3, 2, engine.param.NWORDS_FIELD);
        uint i, row, m, index = 0, npts = 0, ii = 0;
        uint[] pts_index = new uint[engine.param.MAX_INT_POINTS_BOB];
        ulong[] SecretKeyB = new ulong[engine.param.NWORDS_ORDER];

        // Initialize basis points
        init_basis(engine.param.B_gen, XPB, XQB, XRB);
        init_basis(engine.param.A_gen, phiP.X, phiQ.X, phiR.X);
        engine.fpx.fpcopy(engine.param.Montgomery_one,0,phiP.Z[0]);
        engine.fpx.fpcopy(engine.param.Montgomery_one,0,phiQ.Z[0]);
        engine.fpx.fpcopy(engine.param.Montgomery_one,0,phiR.Z[0]);

        // Initialize constants: A24minus = A-2C, A24plus = A+2C, where A=6, C=1
        engine.fpx.fpcopy(engine.param.Montgomery_one, 0,A24plus[0]);
        engine.fpx.mp2_add(A24plus, A24plus, A24plus);
        engine.fpx.mp2_add(A24plus, A24plus, A24minus);
        engine.fpx.mp2_add(A24plus, A24minus, A);
        engine.fpx.mp2_add(A24minus, A24minus, A24plus);
        engine.fpx.decode_to_digits(sk, engine.param.MSG_BYTES, SecretKeyB, engine.param.SECRETKEY_B_BYTES, engine.param.NWORDS_ORDER);
        engine.isogeny.LADDER3PT(XPB, XQB, XRB, SecretKeyB, engine.param.BOB, R, A);

        // Traverse tree
        index =0;
        for(row = 1; row < engine.param.MAX_Bob; row++)
        {
            while (index < engine.param.MAX_Bob - row)
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
            engine.isogeny.eval_3_isog(phiP, coeff);
            engine.isogeny.eval_3_isog(phiQ, coeff);
            engine.isogeny.eval_3_isog(phiR, coeff);

            engine.fpx.fp2copy(pts[npts - 1].X, R.X);
            engine.fpx.fp2copy(pts[npts - 1].Z, R.Z);
            index = pts_index[npts - 1];
            npts -= 1;
        }
        engine.isogeny.get_3_isog(R, A24minus, A24plus, coeff);
        engine.isogeny.eval_3_isog(phiP, coeff);
        engine.isogeny.eval_3_isog(phiQ, coeff);
        engine.isogeny.eval_3_isog(phiR, coeff);
        engine.isogeny.inv_3_way(phiP.Z, phiQ.Z, phiR.Z);

        engine.fpx.fp2mul_mont(phiP.X, phiP.Z, phiP.X);
        engine.fpx.fp2mul_mont(phiQ.X, phiQ.Z, phiQ.X);
        engine.fpx.fp2mul_mont(phiR.X, phiR.Z, phiR.X);

        // Format public key
        engine.fpx.fp2_encode(phiP.X, pk, 0);
        engine.fpx.fp2_encode(phiQ.X, pk, engine.param.FP2_ENCODED_BYTES);
        engine.fpx.fp2_encode(phiR.X, pk, 2*engine.param.FP2_ENCODED_BYTES);
    }

    // Alice's ephemeral public key generation
    // Input:  a private key PrivateKeyA in the range [0, 2^eA - 1].
    // Output: the public key PublicKeyA consisting of 3 elements in GF(p^2) which are encoded by removing leading 0 bytes.
    protected internal void EphemeralKeyGeneration_A(byte[] ephemeralsk, byte[] ct)
    {
        PointProj R = new PointProj(engine.param.NWORDS_FIELD),
                phiP = new PointProj(engine.param.NWORDS_FIELD),
                phiQ = new PointProj(engine.param.NWORDS_FIELD),
                phiR = new PointProj(engine.param.NWORDS_FIELD);

        PointProj[] pts = new PointProj[engine.param.MAX_INT_POINTS_ALICE];
        ulong[][] XPA = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            XQA = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            XRA = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            A24plus = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            C24 = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            A = Utils.InitArray(2, engine.param.NWORDS_FIELD);

        ulong[][][] coeff = Utils.InitArray(3, 2, engine.param.NWORDS_FIELD);
        uint index = 0, npts = 0, ii = 0, m, i, row;
        uint[] pts_index = new uint[engine.param.MAX_INT_POINTS_ALICE];
        ulong[] SecretKeyA = new ulong[engine.param.NWORDS_ORDER];

        // Initialize basis points
        init_basis(engine.param.A_gen, XPA, XQA, XRA);
        init_basis(engine.param.B_gen, phiP.X, phiQ.X, phiR.X);
        engine.fpx.fpcopy(engine.param.Montgomery_one, 0, phiP.Z[0]);
        engine.fpx.fpcopy(engine.param.Montgomery_one, 0, phiQ.Z[0]);
        engine.fpx.fpcopy(engine.param.Montgomery_one, 0, phiR.Z[0]);

        // Initialize constants: A24plus = A+2C, C24 = 4C, where A=6, C=1
        engine.fpx.fpcopy(engine.param.Montgomery_one, 0, A24plus[0]);
        engine.fpx.mp2_add(A24plus, A24plus, A24plus);
        engine.fpx.mp2_add(A24plus, A24plus, C24);
        engine.fpx.mp2_add(A24plus, C24, A);
        engine.fpx.mp2_add(C24, C24, A24plus);

        // Retrieve kernel point
        engine.fpx.decode_to_digits(ephemeralsk, 0, SecretKeyA, engine.param.SECRETKEY_A_BYTES, engine.param.NWORDS_ORDER);
        engine.isogeny.LADDER3PT(XPA, XQA, XRA, SecretKeyA, engine.param.ALICE, R, A);

        if (engine.param.OALICE_BITS % 2 == 1)
        {
            PointProj S = new PointProj(engine.param.NWORDS_FIELD);
            engine.isogeny.xDBLe(R, S, A24plus, C24, (engine.param.OALICE_BITS - 1));
            engine.isogeny.get_2_isog(S, A24plus, C24);
            engine.isogeny.eval_2_isog(phiP, S);
            engine.isogeny.eval_2_isog(phiQ, S);
            engine.isogeny.eval_2_isog(phiR, S);
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
            engine.isogeny.eval_4_isog(phiP, coeff);
            engine.isogeny.eval_4_isog(phiQ, coeff);
            engine.isogeny.eval_4_isog(phiR, coeff);

            engine.fpx.fp2copy(pts[npts-1].X, R.X);
            engine.fpx.fp2copy(pts[npts-1].Z, R.Z);
            index = pts_index[npts-1];
            npts -= 1;
        }

        engine.isogeny.get_4_isog(R, A24plus, C24, coeff);
        engine.isogeny.eval_4_isog(phiP, coeff);
        engine.isogeny.eval_4_isog(phiQ, coeff);
        engine.isogeny.eval_4_isog(phiR, coeff);

        engine.isogeny.inv_3_way(phiP.Z, phiQ.Z, phiR.Z);
        engine.fpx.fp2mul_mont(phiP.X, phiP.Z, phiP.X);
        engine.fpx.fp2mul_mont(phiQ.X, phiQ.Z, phiQ.X);
        engine.fpx.fp2mul_mont(phiR.X, phiR.Z, phiR.X);

        // Format public key
        engine.fpx.fp2_encode(phiP.X, ct,0);
        engine.fpx.fp2_encode(phiQ.X, ct, engine.param.FP2_ENCODED_BYTES);
        engine.fpx.fp2_encode(phiR.X, ct,2*engine.param.FP2_ENCODED_BYTES);

    }

    // Alice's ephemeral shared secret computation
    // It produces a shared secret key SharedSecretA using her secret key PrivateKeyA and Bob's public key PublicKeyB
    // Inputs: Alice's PrivateKeyA is an integer in the range [0, oA-1].
    //         Bob's PublicKeyB consists of 3 elements in GF(p^2) encoded by removing leading 0 bytes.
    // Output: a shared secret SharedSecretA that consists of one element in GF(p^2) encoded by removing leading 0 bytes.
    protected internal void EphemeralSecretAgreement_A(byte[] ephemeralsk, byte[] pk, byte[] jinvariant)
    {
        PointProj R = new PointProj(engine.param.NWORDS_FIELD);
        PointProj[] pts = new PointProj[engine.param.MAX_INT_POINTS_ALICE];
        ulong[][][] PKB = Utils.InitArray(3, 2, engine.param.NWORDS_FIELD),
            coeff = Utils.InitArray(3, 2, engine.param.NWORDS_FIELD);
        ulong[][] jinv = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            A24plus = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            C24 = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            A = Utils.InitArray(2, engine.param.NWORDS_FIELD);

        uint i = 0, row = 0, m = 0, index = 0, npts = 0, ii = 0;
        uint[] pts_index = new uint[engine.param.MAX_INT_POINTS_ALICE];
        ulong[] SecretKeyA = new ulong[engine.param.NWORDS_ORDER];

        // Initialize images of Bob's basis
        engine.fpx.fp2_decode(pk, PKB[0], 0);
        engine.fpx.fp2_decode(pk, PKB[1], engine.param.FP2_ENCODED_BYTES);
        engine.fpx.fp2_decode(pk, PKB[2], 2*engine.param.FP2_ENCODED_BYTES);

        // Initialize constants: A24plus = A+2C, C24 = 4C, where C=1
        engine.isogeny.get_A(PKB[0], PKB[1], PKB[2], A);
        engine.fpx.mp_add(engine.param.Montgomery_one, engine.param.Montgomery_one, C24[0], engine.param.NWORDS_FIELD);
        engine.fpx.mp2_add(A, C24, A24plus);
        engine.fpx.mp_add(C24[0], C24[0], C24[0], engine.param.NWORDS_FIELD);

        // Retrieve kernel point
        engine.fpx.decode_to_digits(ephemeralsk, 0, SecretKeyA, engine.param.SECRETKEY_A_BYTES, engine.param.NWORDS_ORDER);
        engine.isogeny.LADDER3PT(PKB[0], PKB[1], PKB[2], SecretKeyA, engine.param.ALICE, R, A);

        if (engine.param.OALICE_BITS % 2 == 1)
        {
            PointProj S = new PointProj(engine.param.NWORDS_FIELD);

            engine.isogeny.xDBLe(R, S, A24plus, C24, engine.param.OALICE_BITS - 1);
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
        engine.fpx.mp2_add(A24plus, A24plus, A24plus);
        engine.fpx.fp2sub(A24plus, C24, A24plus);
        engine.fpx.fp2add(A24plus, A24plus, A24plus);
        engine.isogeny.j_inv(A24plus, C24, jinv);
        engine.fpx.fp2_encode(jinv, jinvariant, 0);    // Format shared secret
    }

    // Bob's ephemeral shared secret computation
    // It produces a shared secret key SharedSecretB using his secret key PrivateKeyB and Alice's public key PublicKeyA
    // Inputs: Bob's PrivateKeyB is an integer in the range [0, 2^Floor(Log(2,oB)) - 1].
    //         Alice's PublicKeyA consists of 3 elements in GF(p^2) encoded by removing leading 0 bytes.
    // Output: a shared secret SharedSecretB that consists of one element in GF(p^2) encoded by removing leading 0 bytes.
    protected internal void EphemeralSecretAgreement_B(byte[] sk, byte[] ct, byte[] jinvariant_)
    {
        PointProj R = new PointProj(engine.param.NWORDS_FIELD);
        PointProj[] pts = new PointProj[engine.param.MAX_INT_POINTS_BOB];
        ulong[][][] coeff = Utils.InitArray(3, 2, engine.param.NWORDS_FIELD),
            PKB = Utils.InitArray(3, 2, engine.param.NWORDS_FIELD);

        ulong[][] jinv = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            A24plus = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            A24minus = Utils.InitArray(2, engine.param.NWORDS_FIELD),
            A = Utils.InitArray(2, engine.param.NWORDS_FIELD);
        uint i, row, m, index = 0, npts = 0, ii = 0;
        uint[] pts_index = new uint[engine.param.MAX_INT_POINTS_BOB];
        ulong[] SecretKeyB = new ulong[engine.param.NWORDS_ORDER];

        // Initialize images of Alice's basis
        engine.fpx.fp2_decode(ct,  PKB[0], 0);
        engine.fpx.fp2_decode(ct, PKB[1], engine.param.FP2_ENCODED_BYTES);
        engine.fpx.fp2_decode(ct, PKB[2], 2*engine.param.FP2_ENCODED_BYTES);

        // Initialize constants: A24plus = A+2C, A24minus = A-2C, where C=1
        engine.isogeny.get_A(PKB[0], PKB[1], PKB[2], A);
        engine.fpx.mp_add(engine.param.Montgomery_one, engine.param.Montgomery_one, A24minus[0], engine.param.NWORDS_FIELD);
        engine.fpx.mp2_add(A, A24minus, A24plus);
        engine.fpx.mp2_sub_p2(A, A24minus, A24minus);

        // Retrieve kernel point
        engine.fpx.decode_to_digits(sk, engine.param.MSG_BYTES, SecretKeyB, engine.param.SECRETKEY_B_BYTES, engine.param.NWORDS_ORDER);
        engine.isogeny.LADDER3PT(PKB[0], PKB[1], PKB[2], SecretKeyB, engine.param.BOB, R, A);

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

            for (i = 0; i < npts; i++) {
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
        engine.fpx.fp2_encode(jinv, jinvariant_, 0);    // Format shared secret
    }

}

}