using System;
using System.Collections.Generic;
using Org.BouncyCastle.Crypto.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.SphincsPlus
{
    interface ISPHINCSPlusEngineProvider
    {
        int N
        {
            get;
        }

        SPHINCSPlusEngine Get();
    }

    public class SPHINCSPlusParameters
    {
        public static SPHINCSPlusParameters sha2_128f = new SPHINCSPlusParameters("sha2-128f-robust",
            new Sha2EngineProvider(true, 16, 16, 22, 6, 33, 66));

        public static SPHINCSPlusParameters sha2_128s = new SPHINCSPlusParameters("sha2-128s-robust",
            new Sha2EngineProvider(true, 16, 16, 7, 12, 14, 63));

        public static SPHINCSPlusParameters sha2_192f = new SPHINCSPlusParameters("sha2-192f-robust",
            new Sha2EngineProvider(true, 24, 16, 22, 8, 33, 66));

        public static SPHINCSPlusParameters sha2_192s = new SPHINCSPlusParameters("sha2-192s-robust",
            new Sha2EngineProvider(true, 24, 16, 7, 14, 17, 63));

        public static SPHINCSPlusParameters sha2_256f = new SPHINCSPlusParameters("sha2-256f-robust",
            new Sha2EngineProvider(true, 32, 16, 17, 9, 35, 68));

        public static SPHINCSPlusParameters sha2_256s = new SPHINCSPlusParameters("sha2-256s-robust",
            new Sha2EngineProvider(true, 32, 16, 8, 14, 22, 64));

        public static SPHINCSPlusParameters sha2_128f_simple = new SPHINCSPlusParameters("sha2-128f-simple",
            new Sha2EngineProvider(false, 16, 16, 22, 6, 33, 66));

        public static SPHINCSPlusParameters sha2_128s_simple = new SPHINCSPlusParameters("sha2-128s-simple",
            new Sha2EngineProvider(false, 16, 16, 7, 12, 14, 63));

        public static SPHINCSPlusParameters sha2_192f_simple = new SPHINCSPlusParameters("sha2-192f-simple",
            new Sha2EngineProvider(false, 24, 16, 22, 8, 33, 66));

        public static SPHINCSPlusParameters sha2_192s_simple = new SPHINCSPlusParameters("sha2-192s-simple",
            new Sha2EngineProvider(false, 24, 16, 7, 14, 17, 63));

        public static SPHINCSPlusParameters sha2_256f_simple = new SPHINCSPlusParameters("sha2-256f-simple",
            new Sha2EngineProvider(false, 32, 16, 17, 9, 35, 68));

        public static SPHINCSPlusParameters sha2_256s_simple = new SPHINCSPlusParameters("sha2-256s-simple",
            new Sha2EngineProvider(false, 32, 16, 8, 14, 22, 64));

        // SHAKE-256.

        public static SPHINCSPlusParameters shake_128f = new SPHINCSPlusParameters("shake-128f-robust",
            new Shake256EngineProvider(true, 16, 16, 22, 6, 33, 66));

        public static SPHINCSPlusParameters shake_128s = new SPHINCSPlusParameters("shake-128s-robust",
            new Shake256EngineProvider(true, 16, 16, 7, 12, 14, 63));

        public static SPHINCSPlusParameters shake_192f = new SPHINCSPlusParameters("shake-192f-robust",
            new Shake256EngineProvider(true, 24, 16, 22, 8, 33, 66));

        public static SPHINCSPlusParameters shake_192s = new SPHINCSPlusParameters("shake-192s-robust",
            new Shake256EngineProvider(true, 24, 16, 7, 14, 17, 63));

        public static SPHINCSPlusParameters shake_256f = new SPHINCSPlusParameters("shake-256f-robust",
            new Shake256EngineProvider(true, 32, 16, 17, 9, 35, 68));

        public static SPHINCSPlusParameters shake_256s = new SPHINCSPlusParameters("shake-256s-robust",
            new Shake256EngineProvider(true, 32, 16, 8, 14, 22, 64));

        public static SPHINCSPlusParameters shake_128f_simple = new SPHINCSPlusParameters("shake-128f-simple",
            new Shake256EngineProvider(false, 16, 16, 22, 6, 33, 66));

        public static SPHINCSPlusParameters shake_128s_simple = new SPHINCSPlusParameters("shake-128s-simple",
            new Shake256EngineProvider(false, 16, 16, 7, 12, 14, 63));

        public static SPHINCSPlusParameters shake_192f_simple = new SPHINCSPlusParameters("shake-192f-simple",
            new Shake256EngineProvider(false, 24, 16, 22, 8, 33, 66));

        public static SPHINCSPlusParameters shake_192s_simple = new SPHINCSPlusParameters("shake-192s-simple",
            new Shake256EngineProvider(false, 24, 16, 7, 14, 17, 63));

        public static SPHINCSPlusParameters shake_256f_simple = new SPHINCSPlusParameters("shake-256f-simple",
            new Shake256EngineProvider(false, 32, 16, 17, 9, 35, 68));

        public static SPHINCSPlusParameters shake_256s_simple = new SPHINCSPlusParameters("shake-256s-simple",
            new Shake256EngineProvider(false, 32, 16, 8, 14, 22, 64));

        // Haraka.

        public static SPHINCSPlusParameters haraka_128f = new SPHINCSPlusParameters("haraka-128f-robust", new Haraka256EngineProvider(true, 16, 16, 22, 6, 33, 66));
        public static SPHINCSPlusParameters haraka_128s = new SPHINCSPlusParameters("haraka-128s-robust", new Haraka256EngineProvider(true, 16, 16, 7, 12, 14, 63));

        public static SPHINCSPlusParameters haraka_256f = new SPHINCSPlusParameters("haraka-256f-robust", new Haraka256EngineProvider(true, 32, 16, 17, 9, 35, 68));
        public static SPHINCSPlusParameters haraka_256s = new SPHINCSPlusParameters("haraka-256s-robust", new Haraka256EngineProvider(true, 32, 16, 8, 14, 22, 64));

        public static SPHINCSPlusParameters haraka_192f = new SPHINCSPlusParameters("haraka-192f-robust", new Haraka256EngineProvider(true, 24, 16, 22, 8, 33, 66));
        public static SPHINCSPlusParameters haraka_192s = new SPHINCSPlusParameters("haraka-192s-robust", new Haraka256EngineProvider(true, 24, 16, 7, 14, 17, 63));

        public static SPHINCSPlusParameters haraka_128f_simple = new SPHINCSPlusParameters("haraka-128f-simple", new Haraka256EngineProvider(false, 16, 16, 22, 6, 33, 66));
        public static SPHINCSPlusParameters haraka_128s_simple = new SPHINCSPlusParameters("haraka-128s-simple", new Haraka256EngineProvider(false, 16, 16, 7, 12, 14, 63));

        public static SPHINCSPlusParameters haraka_192f_simple = new SPHINCSPlusParameters("haraka-192f-simple", new Haraka256EngineProvider(false, 24, 16, 22, 8, 33, 66));
        public static SPHINCSPlusParameters haraka_192s_simple = new SPHINCSPlusParameters("haraka-192s-simple", new Haraka256EngineProvider(false, 24, 16, 7, 14, 17, 63));

        public static SPHINCSPlusParameters haraka_256f_simple = new SPHINCSPlusParameters("haraka-256f-simple", new Haraka256EngineProvider(false, 32, 16, 17, 9, 35, 68));
        public static SPHINCSPlusParameters haraka_256s_simple = new SPHINCSPlusParameters("haraka-256s-simple", new Haraka256EngineProvider(false, 32, 16, 8, 14, 22, 64));


        private static uint sphincsPlus_sha2_128f_robust = 0x010101;
        private static uint sphincsPlus_sha2_128s_robust = 0x010102;
        private static uint sphincsPlus_sha2_192f_robust = 0x010103;
        private static uint sphincsPlus_sha2_192s_robust = 0x010104;
        private static uint sphincsPlus_sha2_256f_robust = 0x010105;
        private static uint sphincsPlus_sha2_256s_robust = 0x010106;

        private static uint sphincsPlus_sha2_128f_simple = 0x010201;
        private static uint sphincsPlus_sha2_128s_simple = 0x010202;
        private static uint sphincsPlus_sha2_192f_simple = 0x010203;
        private static uint sphincsPlus_sha2_192s_simple = 0x010204;
        private static uint sphincsPlus_sha2_256f_simple = 0x010205;
        private static uint sphincsPlus_sha2_256s_simple = 0x010206;

        private static uint sphincsPlus_shake_128f_robust = 0x020101;
        private static uint sphincsPlus_shake_128s_robust = 0x020102;
        private static uint sphincsPlus_shake_192f_robust = 0x020103;
        private static uint sphincsPlus_shake_192s_robust = 0x020104;
        private static uint sphincsPlus_shake_256f_robust = 0x020105;
        private static uint sphincsPlus_shake_256s_robust = 0x020106;

        private static uint sphincsPlus_shake_128f_simple = 0x020201;
        private static uint sphincsPlus_shake_128s_simple = 0x020202;
        private static uint sphincsPlus_shake_192f_simple = 0x020203;
        private static uint sphincsPlus_shake_192s_simple = 0x020204;
        private static uint sphincsPlus_shake_256f_simple = 0x020205;
        private static uint sphincsPlus_shake_256s_simple = 0x020206;

        private static uint sphincsPlus_haraka_128f_robust = 0x030101;
        private static uint sphincsPlus_haraka_128s_robust = 0x030102;
        private static uint sphincsPlus_haraka_192f_robust = 0x030103;
        private static uint sphincsPlus_haraka_192s_robust = 0x030104;
        private static uint sphincsPlus_haraka_256f_robust = 0x030105;
        private static uint sphincsPlus_haraka_256s_robust = 0x030106;

        private static uint sphincsPlus_haraka_128f_simple = 0x030201;
        private static uint sphincsPlus_haraka_128s_simple = 0x030202;
        private static uint sphincsPlus_haraka_192f_simple = 0x030203;
        private static uint sphincsPlus_haraka_192s_simple = 0x030204;
        private static uint sphincsPlus_haraka_256f_simple = 0x030205;
        private static uint sphincsPlus_haraka_256s_simple = 0x030206;


        private static Dictionary<uint, SPHINCSPlusParameters> oidToParams = new Dictionary<uint, SPHINCSPlusParameters>();
        private static Dictionary<SPHINCSPlusParameters, uint> paramsToOid = new Dictionary<SPHINCSPlusParameters, uint>();

        static SPHINCSPlusParameters()
        {
            oidToParams[sphincsPlus_sha2_128f_robust] = SPHINCSPlusParameters.sha2_128f;
            oidToParams[sphincsPlus_sha2_128s_robust] = SPHINCSPlusParameters.sha2_128s;
            oidToParams[sphincsPlus_sha2_192f_robust] = SPHINCSPlusParameters.sha2_192f;
            oidToParams[sphincsPlus_sha2_192s_robust] = SPHINCSPlusParameters.sha2_192s;
            oidToParams[sphincsPlus_sha2_256f_robust] = SPHINCSPlusParameters.sha2_256f;
            oidToParams[sphincsPlus_sha2_256s_robust] = SPHINCSPlusParameters.sha2_256s;

            oidToParams[sphincsPlus_sha2_128f_simple] = SPHINCSPlusParameters.sha2_128f_simple;
            oidToParams[sphincsPlus_sha2_128s_simple] = SPHINCSPlusParameters.sha2_128s_simple;
            oidToParams[sphincsPlus_sha2_192f_simple] = SPHINCSPlusParameters.sha2_192f_simple;
            oidToParams[sphincsPlus_sha2_192s_simple] = SPHINCSPlusParameters.sha2_192s_simple;
            oidToParams[sphincsPlus_sha2_256f_simple] = SPHINCSPlusParameters.sha2_256f_simple;
            oidToParams[sphincsPlus_sha2_256s_simple] = SPHINCSPlusParameters.sha2_256s_simple;

            oidToParams[sphincsPlus_shake_128f_robust] = SPHINCSPlusParameters.shake_128f;
            oidToParams[sphincsPlus_shake_128s_robust] = SPHINCSPlusParameters.shake_128s;
            oidToParams[sphincsPlus_shake_192f_robust] = SPHINCSPlusParameters.shake_192f;
            oidToParams[sphincsPlus_shake_192s_robust] = SPHINCSPlusParameters.shake_192s;
            oidToParams[sphincsPlus_shake_256f_robust] = SPHINCSPlusParameters.shake_256f;
            oidToParams[sphincsPlus_shake_256s_robust] = SPHINCSPlusParameters.shake_256s;

            oidToParams[sphincsPlus_shake_128f_simple] = SPHINCSPlusParameters.shake_128f_simple;
            oidToParams[sphincsPlus_shake_128s_simple] = SPHINCSPlusParameters.shake_128s_simple;
            oidToParams[sphincsPlus_shake_192f_simple] = SPHINCSPlusParameters.shake_192f_simple;
            oidToParams[sphincsPlus_shake_192s_simple] = SPHINCSPlusParameters.shake_192s_simple;
            oidToParams[sphincsPlus_shake_256f_simple] = SPHINCSPlusParameters.shake_256f_simple;
            oidToParams[sphincsPlus_shake_256s_simple] = SPHINCSPlusParameters.shake_256s_simple;

            oidToParams[sphincsPlus_haraka_128f_simple] = SPHINCSPlusParameters.haraka_128f_simple;
            oidToParams[sphincsPlus_haraka_128f_robust] = SPHINCSPlusParameters.haraka_128f;
            oidToParams[sphincsPlus_haraka_192f_simple] = SPHINCSPlusParameters.haraka_192f_simple;
            oidToParams[sphincsPlus_haraka_192f_robust] = SPHINCSPlusParameters.haraka_192f;
            oidToParams[sphincsPlus_haraka_256f_simple] = SPHINCSPlusParameters.haraka_256f_simple;
            oidToParams[sphincsPlus_haraka_256f_robust] = SPHINCSPlusParameters.haraka_256f;

            oidToParams[sphincsPlus_haraka_128s_simple] = SPHINCSPlusParameters.haraka_128s_simple;
            oidToParams[sphincsPlus_haraka_128s_robust] = SPHINCSPlusParameters.haraka_128s;
            oidToParams[sphincsPlus_haraka_192s_simple] = SPHINCSPlusParameters.haraka_192s_simple;
            oidToParams[sphincsPlus_haraka_192s_robust] = SPHINCSPlusParameters.haraka_192s;
            oidToParams[sphincsPlus_haraka_256s_simple] = SPHINCSPlusParameters.haraka_256s_simple;
            oidToParams[sphincsPlus_haraka_256s_robust] = SPHINCSPlusParameters.haraka_256s;


            paramsToOid[SPHINCSPlusParameters.sha2_128f] = sphincsPlus_sha2_128f_robust;
            paramsToOid[SPHINCSPlusParameters.sha2_128s] = sphincsPlus_sha2_128s_robust;
            paramsToOid[SPHINCSPlusParameters.sha2_192f] = sphincsPlus_sha2_192f_robust;
            paramsToOid[SPHINCSPlusParameters.sha2_192s] = sphincsPlus_sha2_192s_robust;
            paramsToOid[SPHINCSPlusParameters.sha2_256f] = sphincsPlus_sha2_256f_robust;
            paramsToOid[SPHINCSPlusParameters.sha2_256s] = sphincsPlus_sha2_256s_robust;

            paramsToOid[SPHINCSPlusParameters.sha2_128f_simple] = sphincsPlus_sha2_128f_simple;
            paramsToOid[SPHINCSPlusParameters.sha2_128s_simple] = sphincsPlus_sha2_128s_simple;
            paramsToOid[SPHINCSPlusParameters.sha2_192f_simple] = sphincsPlus_sha2_192f_simple;
            paramsToOid[SPHINCSPlusParameters.sha2_192s_simple] = sphincsPlus_sha2_192s_simple;
            paramsToOid[SPHINCSPlusParameters.sha2_256f_simple] = sphincsPlus_sha2_256f_simple;
            paramsToOid[SPHINCSPlusParameters.sha2_256s_simple] = sphincsPlus_sha2_256s_simple;

            paramsToOid[SPHINCSPlusParameters.shake_128f] = sphincsPlus_shake_128f_robust;
            paramsToOid[SPHINCSPlusParameters.shake_128s] = sphincsPlus_shake_128s_robust;
            paramsToOid[SPHINCSPlusParameters.shake_192f] = sphincsPlus_shake_192f_robust;
            paramsToOid[SPHINCSPlusParameters.shake_192s] = sphincsPlus_shake_192s_robust;
            paramsToOid[SPHINCSPlusParameters.shake_256f] = sphincsPlus_shake_256f_robust;
            paramsToOid[SPHINCSPlusParameters.shake_256s] = sphincsPlus_shake_256s_robust;

            paramsToOid[SPHINCSPlusParameters.shake_128f_simple] = sphincsPlus_shake_128f_simple;
            paramsToOid[SPHINCSPlusParameters.shake_128s_simple] = sphincsPlus_shake_128s_simple;
            paramsToOid[SPHINCSPlusParameters.shake_192f_simple] = sphincsPlus_shake_192f_simple;
            paramsToOid[SPHINCSPlusParameters.shake_192s_simple] = sphincsPlus_shake_192s_simple;
            paramsToOid[SPHINCSPlusParameters.shake_256f_simple] = sphincsPlus_shake_256f_simple;
            paramsToOid[SPHINCSPlusParameters.shake_256s_simple] = sphincsPlus_shake_256s_simple;

            paramsToOid[SPHINCSPlusParameters.haraka_128f_simple] = sphincsPlus_haraka_128f_simple;
            paramsToOid[SPHINCSPlusParameters.haraka_192f_simple] = sphincsPlus_haraka_192f_simple;
            paramsToOid[SPHINCSPlusParameters.haraka_256f_simple] = sphincsPlus_haraka_256f_simple;
            paramsToOid[SPHINCSPlusParameters.haraka_128s_simple] = sphincsPlus_haraka_128s_simple;
            paramsToOid[SPHINCSPlusParameters.haraka_192s_simple] = sphincsPlus_haraka_192s_simple;
            paramsToOid[SPHINCSPlusParameters.haraka_256s_simple] = sphincsPlus_haraka_256s_simple;
            paramsToOid[SPHINCSPlusParameters.haraka_128f] = sphincsPlus_haraka_128f_robust;
            paramsToOid[SPHINCSPlusParameters.haraka_192f] = sphincsPlus_haraka_192f_robust;
            paramsToOid[SPHINCSPlusParameters.haraka_256f] = sphincsPlus_haraka_256f_robust;
            paramsToOid[SPHINCSPlusParameters.haraka_128s] = sphincsPlus_haraka_128s_robust;
            paramsToOid[SPHINCSPlusParameters.haraka_192s] = sphincsPlus_haraka_192s_robust;
            paramsToOid[SPHINCSPlusParameters.haraka_256s] = sphincsPlus_haraka_256s_robust;
        }

        private String name;
        private ISPHINCSPlusEngineProvider engineProvider;

        private SPHINCSPlusParameters(String name, ISPHINCSPlusEngineProvider engineProvider)
        {
            this.name = name;
            this.engineProvider = engineProvider;
        }

        public String Name => name;

        internal int N => engineProvider.N;

        internal SPHINCSPlusEngine GetEngine()
        {
            return engineProvider.Get();
        }

        /**
         * Return the SPHINCS+ parameters that map to the passed in parameter ID.
         * 
         * @param id the oid of interest.
         * @return the parameter set.
         */
        public static SPHINCSPlusParameters GetParams(uint id)
        {
            return (SPHINCSPlusParameters)oidToParams[id];
        }

        /**
         * Return the OID that maps to the passed in SPHINCS+ parameters.
         *
         * @param params the parameters of interest.
         * @return the OID for the parameter set.
         */
        public static uint GetID(SPHINCSPlusParameters parameters)
        {
            return paramsToOid[parameters];
        }

        public byte[] GetEncoded()
        {
            return Pack.UInt32_To_BE(GetID(this));
        }
    }

    class Sha2EngineProvider : ISPHINCSPlusEngineProvider
    {
        private readonly bool robust;
        private readonly int n;
        private readonly uint w;
        private readonly uint d;
        private readonly int a;
        private readonly int k;
        private readonly uint h;

        internal Sha2EngineProvider(bool robust, int n, uint w, uint d, int a, int k, uint h)
        {
            this.robust = robust;
            this.n = n;
            this.w = w;
            this.d = d;
            this.a = a;
            this.k = k;
            this.h = h;
        }

        public int N => this.n;

        public SPHINCSPlusEngine Get()
        {
            return new SPHINCSPlusEngine.Sha2Engine(robust, n, w, d, a, k, h);
        }
    }

    class Shake256EngineProvider : ISPHINCSPlusEngineProvider
    {
        private readonly bool robust;
        private readonly int n;
        private readonly uint w;
        private readonly uint d;
        private readonly int a;
        private readonly int k;
        private readonly uint h;

        internal Shake256EngineProvider(bool robust, int n, uint w, uint d, int a, int k, uint h)
        {
            this.robust = robust;
            this.n = n;
            this.w = w;
            this.d = d;
            this.a = a;
            this.k = k;
            this.h = h;
        }

        public int N => this.n;

        public SPHINCSPlusEngine Get()
        {
            return new SPHINCSPlusEngine.Shake256Engine(robust, n, w, d, a, k, h);
        }
    }

    class Haraka256EngineProvider : ISPHINCSPlusEngineProvider
    {
        private readonly bool robust;
        private readonly int n;
        private readonly uint w;
        private readonly uint d;
        private readonly int a;
        private readonly int k;
        private readonly uint h;

        public Haraka256EngineProvider(bool robust, int n, uint w, uint d, int a, int k, uint h)
        {
            this.robust = robust;
            this.n = n;
            this.w = w;
            this.d = d;
            this.a = a;
            this.k = k;
            this.h = h;
        }

        public int N => this.n;

        public SPHINCSPlusEngine Get()
        {
            return new SPHINCSPlusEngine.HarakaSEngine(robust, n, w, d, a, k, h);
        }
    }
}