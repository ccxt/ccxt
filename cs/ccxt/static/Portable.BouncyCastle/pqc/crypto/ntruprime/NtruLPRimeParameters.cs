using System;
using System.ComponentModel;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Digests;
using Org.BouncyCastle.Crypto.Modes;

namespace Org.BouncyCastle.Pqc.Crypto.NtruPrime
{
    public class NtruLPRimeParameters : ICipherParameters
    {

        private String name;
        private int p;
        private int q;
        private int _roundedBytes;
        private bool LPR;
        private int _w;
        private int _rqBytes;
        private int _tau0;
        private int _tau1;
        private int _tau2;
        private int _tau3;
        private int _skBytes;
        private int _pkBytes;
        private int _ctBytes;
        private int _defaultKeySize;
        private NtruPrimeEngine _primeEngine;
        
        private NtruLPRimeParameters(String name, int p, int q, bool LPR, int w, int tau0,
            int tau1, int tau2, int tau3, int skBytes, int pkBytes, int ctBytes, int roundedBytes, int rqBytes, int defaultKeySize)
        {
            this.name = name;
            this.p = p;
            this.q = q;
            this.LPR = LPR;
            this._w = w;
            this._tau0 = tau0;
            this._tau1 = tau1;
            this._tau2 = tau2;
            this._tau3 = tau3;
            
            // KEM Parameters
            this._roundedBytes = roundedBytes;
            this._rqBytes = rqBytes;
            this._skBytes = skBytes;
            this._pkBytes = pkBytes;
            this._ctBytes = ctBytes;
            this._primeEngine = new NtruPrimeEngine(p,q, LPR, w, tau0, tau1, tau2, tau3, skBytes, pkBytes, ctBytes, roundedBytes, rqBytes, defaultKeySize / 8);
            this._defaultKeySize = defaultKeySize;
        }

        public static NtruLPRimeParameters ntrulpr653 = new NtruLPRimeParameters("NTRU_LPRime_653", 653, 4621, true, 252, 2175,113,2031,290,1125,897,1025, 865, -1, 128);
        public static NtruLPRimeParameters ntrulpr761 = new NtruLPRimeParameters("NTRU_LPRime_761", 761, 4591, true, 250, 2156,114,2007,287,1294,1039,1167, 1007, -1, 128);
        public static NtruLPRimeParameters ntrulpr857 = new NtruLPRimeParameters("NTRU_LPRime_857", 857, 5167, true, 281, 2433,101,2265,324,1463,1184,1312, 1152, -1, 128);
        public static NtruLPRimeParameters ntrulpr953 = new NtruLPRimeParameters("NTRU_LPRime_953", 953, 6343, true, 345, 2997,82,2798,400,1652,1349,1477, 1317, -1, 192);
        public static NtruLPRimeParameters ntrulpr1013 = new NtruLPRimeParameters("NTRU_LPRime_1013", 1013, 7177, true, 392, 3367,73,3143,449,1773,1455,1583, 1423, -1, 192);
        public static NtruLPRimeParameters ntrulpr1277 = new NtruLPRimeParameters("NTRU_LPRime_1277", 1277, 7879, true, 429, 3724,66,3469,496,2231,1847,1975, 1815, -1, 256);
        
        public int P => p;
        public bool lpr => LPR;
        
        public int Q => q;

        public int DefaultKeySize => _defaultKeySize;
        
        internal NtruPrimeEngine PrimeEngine => _primeEngine;

    }
}
