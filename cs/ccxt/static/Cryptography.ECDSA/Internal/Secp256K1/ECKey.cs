﻿
namespace Cryptography.ECDSA.Internal.Secp256K1
{
    internal class ECKey
    {
        //public static bool secp256k1_eckey_pubkey_parse(secp256k1_ge elem, byte[] pub, int size)
        //{
        //    if (size == 33 && (pub[0] == 0x02 || pub[0] == 0x03))
        //    {
        //        secp256k1_fe x = new secp256k1_fe();
        //        return Field.secp256k1_fe_set_b32(x, pub, 1) && Group.secp256k1_ge_set_xo_var(elem, x, pub[0] == 0x03);
        //    }
        //    if (size == 65 && (pub[0] == 0x04 || pub[0] == 0x06 || pub[0] == 0x07))
        //    {
        //        secp256k1_fe x = new secp256k1_fe();
        //        secp256k1_fe y = new secp256k1_fe();
        //        if (!Field.secp256k1_fe_set_b32(x, pub, 1) || !Field.secp256k1_fe_set_b32(y, pub, 33))
        //        {
        //            return false;
        //        }
        //        Group.secp256k1_ge_set_xy(elem, x, y);
        //        if ((pub[0] == 0x06 || pub[0] == 0x07) && Field.secp256k1_fe_is_odd(y) != (pub[0] == 0x07))
        //        {
        //            return false;
        //        }
        //        return Group.secp256k1_ge_is_valid_var(elem);
        //    }
        //    else
        //    {
        //        return false;
        //    }
        //}

        public static bool PubkeySerialize(Ge elem, byte[] pub, ref int size, bool compressed)
        {
            if (Group.secp256k1_ge_is_infinity(elem))
                return false;

            Field.NormalizeVar(elem.X);
            Field.NormalizeVar(elem.Y);
            Field.GetB32(pub, 1, elem.X);

            if (compressed)
            {
                size = 33;
                pub[0] = (byte)(0x02 | (Field.IsOdd(elem.Y) ? 0x01 : 0x00));
            }
            else
            {
                size = 65;
                pub[0] = 0x04;
                Field.GetB32(pub, 33, elem.Y);
            }
            return true;
        }

        //static int secp256k1_eckey_privkey_tweak_add(secp256k1_scalar* key, const secp256k1_scalar* tweak)
        //{
        //    secp256k1_scalar_add(key, key, tweak);
        //    if (secp256k1_scalar_is_zero(key))
        //    {
        //        return 0;
        //    }
        //    return 1;
        //}

        //static int secp256k1_eckey_pubkey_tweak_add(const secp256k1_ecmult_context* ctx, secp256k1_ge* key, const secp256k1_scalar* tweak)
        //{
        //    secp256k1_gej pt;
        //    secp256k1_scalar one;
        //    secp256k1_gej_set_ge(&pt, key);
        //    secp256k1_scalar_set_int(&one, 1);
        //    secp256k1_ecmult(ctx, &pt, &pt, &one, tweak);

        //    if (secp256k1_gej_is_infinity(&pt))
        //    {
        //        return 0;
        //    }
        //    secp256k1_ge_set_gej(key, &pt);
        //    return 1;
        //}

        //static int secp256k1_eckey_privkey_tweak_mul(secp256k1_scalar* key, const secp256k1_scalar* tweak)
        //{
        //    if (secp256k1_scalar_is_zero(tweak))
        //    {
        //        return 0;
        //    }

        //    secp256k1_scalar_mul(key, key, tweak);
        //    return 1;
        //}

        //static int secp256k1_eckey_pubkey_tweak_mul(const secp256k1_ecmult_context* ctx, secp256k1_ge* key, const secp256k1_scalar* tweak)
        //{
        //    secp256k1_scalar zero;
        //    secp256k1_gej pt;
        //    if (secp256k1_scalar_is_zero(tweak))
        //    {
        //        return 0;
        //    }

        //    secp256k1_scalar_set_int(&zero, 0);
        //    secp256k1_gej_set_ge(&pt, key);
        //    secp256k1_ecmult(ctx, &pt, &pt, tweak, &zero);
        //    secp256k1_ge_set_gej(key, &pt);
        //    return 1;
        //}

    }
}