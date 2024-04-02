
using System;
using Org.BouncyCastle.Crypto;

namespace Org.BouncyCastle.Pqc.Crypto.Picnic
{
    public class PicnicParameters
        : ICipherParameters
        {
        public static PicnicParameters picnicl1fs = new PicnicParameters("picnicl1fs", 1);
        public static PicnicParameters picnicl1ur = new PicnicParameters("picnicl1ur", 2);
        public static PicnicParameters picnicl3fs = new PicnicParameters("picnicl3fs", 3);
        public static PicnicParameters picnicl3ur = new PicnicParameters("picnicl3ur", 4);
        public static PicnicParameters picnicl5fs = new PicnicParameters("picnicl5fs", 5);
        public static PicnicParameters picnicl5ur = new PicnicParameters("picnicl5ur", 6);
        public static PicnicParameters picnic3l1 = new PicnicParameters("picnic3l1", 7);
        public static PicnicParameters picnic3l3 = new PicnicParameters("picnic3l3", 8);
        public static PicnicParameters picnic3l5 = new PicnicParameters("picnic3l5", 9);
        public static PicnicParameters picnicl1full = new PicnicParameters("picnicl1full", 10);
        public static PicnicParameters picnicl3full = new PicnicParameters("picnicl3full", 11);
        public static PicnicParameters picnicl5full = new PicnicParameters("picnicl5full", 12);

        private String name;
        private int param;
        private PicnicParameters(String name, int param)
        {
            this.name = name;
            this.param = param;
        }

        public String GetName()
        {
            return name;
        }

        internal PicnicEngine GetEngine()
        {
            return new PicnicEngine(param);
        }
    }
}