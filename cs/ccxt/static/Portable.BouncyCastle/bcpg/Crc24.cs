using System;

namespace Org.BouncyCastle.Bcpg
{
    public class Crc24
    {
        private const int Crc24Init = 0x0b704ce;
        private const int Crc24Poly = 0x1864cfb;

        private int crc = Crc24Init;

        public Crc24()
        {
        }

        public void Update(
            int b)
        {
            crc ^= b << 16;
            for (int i = 0; i < 8; i++)
            {
                crc <<= 1;
                if ((crc & 0x1000000) != 0)
                {
                    crc ^= Crc24Poly;
                }
            }
        }

		public int Value
		{
			get { return crc; }
		}

		public void Reset()
        {
            crc = Crc24Init;
        }
    }
}
