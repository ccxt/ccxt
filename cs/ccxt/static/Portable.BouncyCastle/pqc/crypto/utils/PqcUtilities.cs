using System;
using System.Collections.Generic;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.BC;
using Org.BouncyCastle.Pqc.Crypto.Cmce;
using Org.BouncyCastle.Pqc.Crypto.Picnic;
using Org.BouncyCastle.Pqc.Crypto.Saber;
using Org.BouncyCastle.Pqc.Crypto.Sike;
using Org.BouncyCastle.Pqc.Crypto.SphincsPlus;

namespace Org.BouncyCastle.Pqc.Crypto.Utilities
{
    public class PqcUtilities
    {
        private readonly static Dictionary<CmceParameters, DerObjectIdentifier> mcElieceOids = new Dictionary<CmceParameters, DerObjectIdentifier>();
        private readonly static Dictionary<DerObjectIdentifier, CmceParameters> mcElieceParams = new Dictionary<DerObjectIdentifier, CmceParameters>();
        
        private readonly static Dictionary<SABERParameters, DerObjectIdentifier> saberOids = new Dictionary<SABERParameters, DerObjectIdentifier>();
        private readonly static Dictionary<DerObjectIdentifier, SABERParameters> saberParams = new Dictionary<DerObjectIdentifier, SABERParameters>();

        private readonly static Dictionary<PicnicParameters, DerObjectIdentifier> picnicOids = new Dictionary<PicnicParameters, DerObjectIdentifier>();
        private readonly static Dictionary<DerObjectIdentifier, PicnicParameters> picnicParams = new Dictionary<DerObjectIdentifier, PicnicParameters>();
        
        private readonly static Dictionary<SIKEParameters, DerObjectIdentifier> sikeOids = new Dictionary<SIKEParameters, DerObjectIdentifier>();
        private readonly static Dictionary<DerObjectIdentifier, SIKEParameters> sikeParams = new Dictionary<DerObjectIdentifier, SIKEParameters>();

        
        static PqcUtilities()
        {
            // CMCE
            mcElieceOids[CmceParameters.mceliece348864r3] = BCObjectIdentifiers.mceliece348864_r3;
            mcElieceOids[CmceParameters.mceliece348864fr3] = BCObjectIdentifiers.mceliece348864f_r3;
            mcElieceOids[CmceParameters.mceliece460896r3] = BCObjectIdentifiers.mceliece460896_r3;
            mcElieceOids[CmceParameters.mceliece460896fr3] = BCObjectIdentifiers.mceliece460896f_r3;
            mcElieceOids[CmceParameters.mceliece6688128r3] = BCObjectIdentifiers.mceliece6688128_r3;
            mcElieceOids[CmceParameters.mceliece6688128fr3] = BCObjectIdentifiers.mceliece6688128f_r3;
            mcElieceOids[CmceParameters.mceliece6960119r3] = BCObjectIdentifiers.mceliece6960119_r3;
            mcElieceOids[CmceParameters.mceliece6960119fr3] = BCObjectIdentifiers.mceliece6960119f_r3;
            mcElieceOids[CmceParameters.mceliece8192128r3] = BCObjectIdentifiers.mceliece8192128_r3;
            mcElieceOids[CmceParameters.mceliece8192128fr3] = BCObjectIdentifiers.mceliece8192128f_r3;

            mcElieceParams[BCObjectIdentifiers.mceliece348864_r3] = CmceParameters.mceliece348864r3;
            mcElieceParams[BCObjectIdentifiers.mceliece348864f_r3] = CmceParameters.mceliece348864fr3;
            mcElieceParams[BCObjectIdentifiers.mceliece460896_r3] = CmceParameters.mceliece460896r3;
            mcElieceParams[BCObjectIdentifiers.mceliece460896f_r3] = CmceParameters.mceliece460896fr3;
            mcElieceParams[BCObjectIdentifiers.mceliece6688128_r3] = CmceParameters.mceliece6688128r3;
            mcElieceParams[BCObjectIdentifiers.mceliece6688128f_r3] = CmceParameters.mceliece6688128fr3;
            mcElieceParams[BCObjectIdentifiers.mceliece6960119_r3] = CmceParameters.mceliece6960119r3;
            mcElieceParams[BCObjectIdentifiers.mceliece6960119f_r3] = CmceParameters.mceliece6960119fr3;
            mcElieceParams[BCObjectIdentifiers.mceliece8192128_r3] = CmceParameters.mceliece8192128r3;
            mcElieceParams[BCObjectIdentifiers.mceliece8192128f_r3] = CmceParameters.mceliece8192128fr3;
            
            saberOids[SABERParameters.lightsaberkem128r3] = BCObjectIdentifiers.lightsaberkem128r3;
            saberOids[SABERParameters.saberkem128r3] = BCObjectIdentifiers.saberkem128r3;
            saberOids[SABERParameters.firesaberkem128r3] = BCObjectIdentifiers.firesaberkem128r3;
            saberOids[SABERParameters.lightsaberkem192r3] = BCObjectIdentifiers.lightsaberkem192r3;
            saberOids[SABERParameters.saberkem192r3] = BCObjectIdentifiers.saberkem192r3;
            saberOids[SABERParameters.firesaberkem192r3] = BCObjectIdentifiers.firesaberkem192r3;
            saberOids[SABERParameters.lightsaberkem256r3] = BCObjectIdentifiers.lightsaberkem256r3;
            saberOids[SABERParameters.saberkem256r3] = BCObjectIdentifiers.saberkem256r3;
            saberOids[SABERParameters.firesaberkem256r3] = BCObjectIdentifiers.firesaberkem256r3;
            
            saberParams[BCObjectIdentifiers.lightsaberkem128r3] = SABERParameters.lightsaberkem128r3;
            saberParams[BCObjectIdentifiers.saberkem128r3] = SABERParameters.saberkem128r3;
            saberParams[BCObjectIdentifiers.firesaberkem128r3] = SABERParameters.firesaberkem128r3;
            saberParams[BCObjectIdentifiers.lightsaberkem192r3] = SABERParameters.lightsaberkem192r3;
            saberParams[BCObjectIdentifiers.saberkem192r3] = SABERParameters.saberkem192r3;
            saberParams[BCObjectIdentifiers.firesaberkem192r3] = SABERParameters.firesaberkem192r3;
            saberParams[BCObjectIdentifiers.lightsaberkem256r3] = SABERParameters.lightsaberkem256r3;
            saberParams[BCObjectIdentifiers.saberkem256r3] = SABERParameters.saberkem256r3;
            saberParams[BCObjectIdentifiers.firesaberkem256r3] = SABERParameters.firesaberkem256r3;

            
            picnicOids[PicnicParameters.picnicl1fs] = BCObjectIdentifiers.picnicl1fs;
            picnicOids[PicnicParameters.picnicl1ur] = BCObjectIdentifiers.picnicl1ur;
            picnicOids[PicnicParameters.picnicl3fs] = BCObjectIdentifiers.picnicl3fs;
            picnicOids[PicnicParameters.picnicl3ur] = BCObjectIdentifiers.picnicl3ur;
            picnicOids[PicnicParameters.picnicl5fs] = BCObjectIdentifiers.picnicl5fs;
            picnicOids[PicnicParameters.picnicl5ur] = BCObjectIdentifiers.picnicl5ur;
            picnicOids[PicnicParameters.picnic3l1] = BCObjectIdentifiers.picnic3l1;
            picnicOids[PicnicParameters.picnic3l3] = BCObjectIdentifiers.picnic3l3;
            picnicOids[PicnicParameters.picnic3l5] = BCObjectIdentifiers.picnic3l5;
            picnicOids[PicnicParameters.picnicl1full] = BCObjectIdentifiers.picnicl1full;
            picnicOids[PicnicParameters.picnicl3full] = BCObjectIdentifiers.picnicl3full;
            picnicOids[PicnicParameters.picnicl5full] = BCObjectIdentifiers.picnicl5full;
    
            picnicParams[BCObjectIdentifiers.picnicl1fs] = PicnicParameters.picnicl1fs;
            picnicParams[BCObjectIdentifiers.picnicl1ur] = PicnicParameters.picnicl1ur;
            picnicParams[BCObjectIdentifiers.picnicl3fs] = PicnicParameters.picnicl3fs;
            picnicParams[BCObjectIdentifiers.picnicl3ur] = PicnicParameters.picnicl3ur;
            picnicParams[BCObjectIdentifiers.picnicl5fs] = PicnicParameters.picnicl5fs;
            picnicParams[BCObjectIdentifiers.picnicl5ur] = PicnicParameters.picnicl5ur;
            picnicParams[BCObjectIdentifiers.picnic3l1] = PicnicParameters.picnic3l1;
            picnicParams[BCObjectIdentifiers.picnic3l3] = PicnicParameters.picnic3l3;
            picnicParams[BCObjectIdentifiers.picnic3l5] = PicnicParameters.picnic3l5;
            picnicParams[BCObjectIdentifiers.picnicl1full] = PicnicParameters.picnicl1full;
            picnicParams[BCObjectIdentifiers.picnicl3full] = PicnicParameters.picnicl3full;
            picnicParams[BCObjectIdentifiers.picnicl5full] = PicnicParameters.picnicl5full;
            
            sikeParams[BCObjectIdentifiers.sikep434] = SIKEParameters.sikep434;
            sikeParams[BCObjectIdentifiers.sikep503] = SIKEParameters.sikep503;
            sikeParams[BCObjectIdentifiers.sikep610] = SIKEParameters.sikep610;
            sikeParams[BCObjectIdentifiers.sikep751] = SIKEParameters.sikep751;
            sikeParams[BCObjectIdentifiers.sikep434_compressed] = SIKEParameters.sikep434_compressed;
            sikeParams[BCObjectIdentifiers.sikep503_compressed] = SIKEParameters.sikep503_compressed;
            sikeParams[BCObjectIdentifiers.sikep610_compressed] = SIKEParameters.sikep610_compressed;
            sikeParams[BCObjectIdentifiers.sikep751_compressed] = SIKEParameters.sikep751_compressed;
            
            sikeOids[SIKEParameters.sikep434] = BCObjectIdentifiers.sikep434;
            sikeOids[SIKEParameters.sikep503] = BCObjectIdentifiers.sikep503;
            sikeOids[SIKEParameters.sikep610] = BCObjectIdentifiers.sikep610;
            sikeOids[SIKEParameters.sikep751] = BCObjectIdentifiers.sikep751;
            sikeOids[SIKEParameters.sikep434_compressed] = BCObjectIdentifiers.sikep434_compressed;
            sikeOids[SIKEParameters.sikep503_compressed] = BCObjectIdentifiers.sikep503_compressed;
            sikeOids[SIKEParameters.sikep610_compressed] = BCObjectIdentifiers.sikep610_compressed;
            sikeOids[SIKEParameters.sikep751_compressed] = BCObjectIdentifiers.sikep751_compressed;
        }

        public static DerObjectIdentifier McElieceOidLookup(CmceParameters parameters)
        {
            return mcElieceOids[parameters];
        }

        internal static CmceParameters McElieceParamsLookup(DerObjectIdentifier oid)
        {
            return mcElieceParams[oid];
        }
        
        internal static DerObjectIdentifier SaberOidLookup(SABERParameters parameters)
        {
            return saberOids[parameters];
        }
        internal static SABERParameters SaberParamsLookup(DerObjectIdentifier oid)
        {
            return saberParams[oid];
        }

        internal static DerObjectIdentifier SphincsPlusOidLookup(SPHINCSPlusParameters parameters)
        {
            uint pId = SPHINCSPlusParameters.GetID(parameters);

            if ((pId & 0x020000) == 0x020000)
            {
                return BCObjectIdentifiers.sphincsPlus_shake_256;
            }

            if ((pId & 0x05) == 0x05 || (pId & 0x06) == 0x06)
            {
                return BCObjectIdentifiers.sphincsPlus_sha_512;
            }

            return BCObjectIdentifiers.sphincsPlus_sha_256;
        }

        internal static DerObjectIdentifier PicnicOidLookup(PicnicParameters parameters)
        {
            return picnicOids[parameters];
        }

        internal static PicnicParameters PicnicParamsLookup(DerObjectIdentifier oid)
        {
            return picnicParams[oid];
        }
        internal static DerObjectIdentifier SikeOidLookup(SIKEParameters parameters)
        {
            return sikeOids[parameters];
        }

        internal static SIKEParameters SikeParamsLookup(DerObjectIdentifier oid)
        {
            return sikeParams[oid];
        }

    }
}