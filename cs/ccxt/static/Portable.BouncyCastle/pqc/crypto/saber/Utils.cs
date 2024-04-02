namespace Org.BouncyCastle.Pqc.Crypto.Saber
{
    internal class Utils
    {

        private int SABER_N;
        private int SABER_L;
        private int SABER_ET;
        private int SABER_POLYBYTES;
        private int SABER_EP;
        private int SABER_KEYBYTES;

        internal Utils(SABEREngine engine)
        {
            this.SABER_N = engine.getSABER_N();
            this.SABER_L = engine.getSABER_L();
            this.SABER_ET = engine.getSABER_ET();
            this.SABER_POLYBYTES = engine.getSABER_POLYBYTES();
            this.SABER_EP = engine.getSABER_EP();
            this.SABER_KEYBYTES = engine.getSABER_KEYBYTES();
        }

        public void POLT2BS(byte[] bytes, int byteIndex, short[] data)
        {
            short j, offset_byte, offset_data;
            if (SABER_ET == 3)
            {
                for (j = 0; j < SABER_N / 8; j++)
                {
                    offset_byte = (short) (3 * j);
                    offset_data = (short) (8 * j);
                    bytes[byteIndex + offset_byte + 0] = (byte) ((data[offset_data + 0] & 0x7) |
                                                                 ((data[offset_data + 1] & 0x7) << 3) |
                                                                 ((data[offset_data + 2] & 0x3) << 6));
                    bytes[byteIndex + offset_byte + 1] = (byte) (((data[offset_data + 2] >> 2) & 0x01) |
                                                                 ((data[offset_data + 3] & 0x7) << 1) |
                                                                 ((data[offset_data + 4] & 0x7) << 4) |
                                                                 (((data[offset_data + 5]) & 0x01) << 7));
                    bytes[byteIndex + offset_byte + 2] = (byte) (((data[offset_data + 5] >> 1) & 0x03) |
                                                                 ((data[offset_data + 6] & 0x7) << 2) |
                                                                 ((data[offset_data + 7] & 0x7) << 5));
                }
            }
            else if (SABER_ET == 4)
            {
                for (j = 0; j < SABER_N / 2; j++)
                {
                    offset_byte = j;
                    offset_data = (short) (2 * j);
                    bytes[byteIndex + offset_byte] =
                        (byte) ((data[offset_data] & 0x0f) | ((data[offset_data + 1] & 0x0f) << 4));
                }
            }
            else if (SABER_ET == 6)
            {
                for (j = 0; j < SABER_N / 4; j++)
                {
                    offset_byte = (short) (3 * j);
                    offset_data = (short) (4 * j);
                    bytes[byteIndex + offset_byte + 0] =
                        (byte) ((data[offset_data + 0] & 0x3f) | ((data[offset_data + 1] & 0x03) << 6));
                    bytes[byteIndex + offset_byte + 1] = (byte) (((data[offset_data + 1] >> 2) & 0x0f) |
                                                                 ((data[offset_data + 2] & 0x0f) << 4));
                    bytes[byteIndex + offset_byte + 2] = (byte) (((data[offset_data + 2] >> 4) & 0x03) |
                                                                 ((data[offset_data + 3] & 0x3f) << 2));
                }
            }
        }

        public void BS2POLT(byte[] bytes, int byteIndex, short[] data)
        {
            short j, offset_byte, offset_data;
            if (SABER_ET == 3)
            {
                for (j = 0; j < SABER_N / 8; j++)
                {
                    offset_byte = (short) (3 * j);
                    offset_data = (short) (8 * j);
                    data[offset_data + 0] = (short) ((bytes[byteIndex + offset_byte + 0]) & 0x07);
                    data[offset_data + 1] = (short) (((bytes[byteIndex + offset_byte + 0]) >> 3) & 0x07);
                    data[offset_data + 2] = (short) ((((bytes[byteIndex + offset_byte + 0]) >> 6) & 0x03) |
                                                     (((bytes[byteIndex + offset_byte + 1]) & 0x01) << 2));
                    data[offset_data + 3] = (short) (((bytes[byteIndex + offset_byte + 1]) >> 1) & 0x07);
                    data[offset_data + 4] = (short) (((bytes[byteIndex + offset_byte + 1]) >> 4) & 0x07);
                    data[offset_data + 5] = (short) ((((bytes[byteIndex + offset_byte + 1]) >> 7) & 0x01) |
                                                     (((bytes[byteIndex + offset_byte + 2]) & 0x03) << 1));
                    data[offset_data + 6] = (short) ((bytes[byteIndex + offset_byte + 2] >> 2) & 0x07);
                    data[offset_data + 7] = (short) ((bytes[byteIndex + offset_byte + 2] >> 5) & 0x07);
                }
            }
            else if (SABER_ET == 4)
            {
                for (j = 0; j < SABER_N / 2; j++)
                {
                    offset_byte = j;
                    offset_data = (short) (2 * j);
                    data[offset_data] = (short) (bytes[byteIndex + offset_byte] & 0x0f);
                    data[offset_data + 1] = (short) ((bytes[byteIndex + offset_byte] >> 4) & 0x0f);
                }
            }
            else if (SABER_ET == 6)
            {
                for (j = 0; j < SABER_N / 4; j++)
                {
                    offset_byte = (short) (3 * j);
                    offset_data = (short) (4 * j);
                    data[offset_data + 0] = (short) (bytes[byteIndex + offset_byte + 0] & 0x3f);
                    data[offset_data + 1] = (short) (((bytes[byteIndex + offset_byte + 0] >> 6) & 0x03) |
                                                     ((bytes[byteIndex + offset_byte + 1] & 0x0f) << 2));
                    data[offset_data + 2] = (short) (((bytes[byteIndex + offset_byte + 1] & 0xff) >> 4) |
                                                     ((bytes[byteIndex + offset_byte + 2] & 0x03) << 4));
                    data[offset_data + 3] = (short) ((bytes[byteIndex + offset_byte + 2] & 0xff) >> 2);
                }
            }

        }

        private void POLq2BS(byte[] bytes, int byteIndex, short[] data)
        {
            short j, offset_byte, offset_data;
            for (j = 0; j < SABER_N / 8; j++)
            {
                offset_byte = (short) (13 * j);
                offset_data = (short) (8 * j);
                bytes[byteIndex + offset_byte + 0] = (byte) (data[offset_data + 0] & (0xff));
                bytes[byteIndex + offset_byte + 1] =
                    (byte) (((data[offset_data + 0] >> 8) & 0x1f) | ((data[offset_data + 1] & 0x07) << 5));
                bytes[byteIndex + offset_byte + 2] = (byte) ((data[offset_data + 1] >> 3) & 0xff);
                bytes[byteIndex + offset_byte + 3] =
                    (byte) (((data[offset_data + 1] >> 11) & 0x03) | ((data[offset_data + 2] & 0x3f) << 2));
                bytes[byteIndex + offset_byte + 4] =
                    (byte) (((data[offset_data + 2] >> 6) & 0x7f) | ((data[offset_data + 3] & 0x01) << 7));
                bytes[byteIndex + offset_byte + 5] = (byte) ((data[offset_data + 3] >> 1) & 0xff);
                bytes[byteIndex + offset_byte + 6] =
                    (byte) (((data[offset_data + 3] >> 9) & 0x0f) | ((data[offset_data + 4] & 0x0f) << 4));
                bytes[byteIndex + offset_byte + 7] = (byte) ((data[offset_data + 4] >> 4) & 0xff);
                bytes[byteIndex + offset_byte + 8] =
                    (byte) (((data[offset_data + 4] >> 12) & 0x01) | ((data[offset_data + 5] & 0x7f) << 1));
                bytes[byteIndex + offset_byte + 9] =
                    (byte) (((data[offset_data + 5] >> 7) & 0x3f) | ((data[offset_data + 6] & 0x03) << 6));
                bytes[byteIndex + offset_byte + 10] = (byte) ((data[offset_data + 6] >> 2) & 0xff);
                bytes[byteIndex + offset_byte + 11] =
                    (byte) (((data[offset_data + 6] >> 10) & 0x07) | ((data[offset_data + 7] & 0x1f) << 3));
                bytes[byteIndex + offset_byte + 12] = (byte) ((data[offset_data + 7] >> 5) & 0xff);
            }
        }

        private void BS2POLq(byte[] bytes, int byteIndex, short[] data)
        {
            short j, offset_byte, offset_data;
            for (j = 0; j < SABER_N / 8; j++)
            {
                offset_byte = (short) (13 * j);
                offset_data = (short) (8 * j);
                data[offset_data + 0] = (short) ((bytes[byteIndex + offset_byte + 0] & (0xff)) |
                                                 ((bytes[byteIndex + offset_byte + 1] & 0x1f) << 8));
                data[offset_data + 1] = (short) ((bytes[byteIndex + offset_byte + 1] >> 5 & (0x07)) |
                                                 ((bytes[byteIndex + offset_byte + 2] & 0xff) << 3) |
                                                 ((bytes[byteIndex + offset_byte + 3] & 0x03) << 11));
                data[offset_data + 2] = (short) ((bytes[byteIndex + offset_byte + 3] >> 2 & (0x3f)) |
                                                 ((bytes[byteIndex + offset_byte + 4] & 0x7f) << 6));
                data[offset_data + 3] = (short) ((bytes[byteIndex + offset_byte + 4] >> 7 & (0x01)) |
                                                 ((bytes[byteIndex + offset_byte + 5] & 0xff) << 1) |
                                                 ((bytes[byteIndex + offset_byte + 6] & 0x0f) << 9));
                data[offset_data + 4] = (short) ((bytes[byteIndex + offset_byte + 6] >> 4 & (0x0f)) |
                                                 ((bytes[byteIndex + offset_byte + 7] & 0xff) << 4) |
                                                 ((bytes[byteIndex + offset_byte + 8] & 0x01) << 12));
                data[offset_data + 5] = (short) ((bytes[byteIndex + offset_byte + 8] >> 1 & (0x7f)) |
                                                 ((bytes[byteIndex + offset_byte + 9] & 0x3f) << 7));
                data[offset_data + 6] = (short) ((bytes[byteIndex + offset_byte + 9] >> 6 & (0x03)) |
                                                 ((bytes[byteIndex + offset_byte + 10] & 0xff) << 2) |
                                                 ((bytes[byteIndex + offset_byte + 11] & 0x07) << 10));
                data[offset_data + 7] = (short) ((bytes[byteIndex + offset_byte + 11] >> 3 & (0x1f)) |
                                                 ((bytes[byteIndex + offset_byte + 12] & 0xff) << 5));
            }
        }

        private void POLp2BS(byte[] bytes, int byteIndex, short[] data)
        {
            short j, offset_byte, offset_data;
            for (j = 0; j < SABER_N / 4; j++)
            {
                offset_byte = (short) (5 * j);
                offset_data = (short) (4 * j);
                bytes[byteIndex + offset_byte + 0] = (byte) (data[offset_data + 0] & (0xff));
                bytes[byteIndex + offset_byte + 1] =
                    (byte) (((data[offset_data + 0] >> 8) & 0x03) | ((data[offset_data + 1] & 0x3f) << 2));
                bytes[byteIndex + offset_byte + 2] =
                    (byte) (((data[offset_data + 1] >> 6) & 0x0f) | ((data[offset_data + 2] & 0x0f) << 4));
                bytes[byteIndex + offset_byte + 3] =
                    (byte) (((data[offset_data + 2] >> 4) & 0x3f) | ((data[offset_data + 3] & 0x03) << 6));
                bytes[byteIndex + offset_byte + 4] = (byte) ((data[offset_data + 3] >> 2) & 0xff);
            }
        }

        public void BS2POLp(byte[] bytes, int byteIndex, short[] data)
        {
            short j, offset_byte, offset_data;
            for (j = 0; j < SABER_N / 4; j++)
            {
                offset_byte = (short) (5 * j);
                offset_data = (short) (4 * j);
                data[offset_data + 0] = (short) ((bytes[byteIndex + offset_byte + 0] & (0xff)) |
                                                 ((bytes[byteIndex + offset_byte + 1] & 0x03) << 8));
                data[offset_data + 1] = (short) (((bytes[byteIndex + offset_byte + 1] >> 2) & (0x3f)) |
                                                 ((bytes[byteIndex + offset_byte + 2] & 0x0f) << 6));
                data[offset_data + 2] = (short) (((bytes[byteIndex + offset_byte + 2] >> 4) & (0x0f)) |
                                                 ((bytes[byteIndex + offset_byte + 3] & 0x3f) << 4));
                data[offset_data + 3] = (short) (((bytes[byteIndex + offset_byte + 3] >> 6) & (0x03)) |
                                                 ((bytes[byteIndex + offset_byte + 4] & 0xff) << 2));
            }
        }

        public void POLVECq2BS(byte[] bytes, short[][] data)
        {
            byte i;
            for (i = 0; i < SABER_L; i++)
            {
                POLq2BS(bytes, i * SABER_POLYBYTES, data[i]);
            }
        }

        public void BS2POLVECq(byte[] bytes, int byteIndex, short[][] data)
        {
            byte i;
            for (i = 0; i < SABER_L; i++)
            {
                BS2POLq(bytes, byteIndex + i * SABER_POLYBYTES, data[i]);
            }
        }

        public void POLVECp2BS(byte[] bytes, short[][] data)
        {
            byte i;
            for (i = 0; i < SABER_L; i++)
            {
                POLp2BS(bytes, i * (SABER_EP * SABER_N / 8), data[i]);
            }
        }

        public void BS2POLVECp(byte[] bytes, short[][] data)
        {
            byte i;
            for (i = 0; i < SABER_L; i++)
            {
                BS2POLp(bytes, i * (SABER_EP * SABER_N / 8), data[i]);
            }
        }

        public void BS2POLmsg(byte[] bytes, short[] data)
        {
            byte i, j;
            for (j = 0; j < SABER_KEYBYTES; j++)
            {
                for (i = 0; i < 8; i++)
                {
                    data[j * 8 + i] = (short) ((bytes[j] >> i) & 0x01);
                }
            }
        }

        public void POLmsg2BS(byte[] bytes, short[] data)
        {
            byte i, j;
            for (j = 0; j < SABER_KEYBYTES; j++)
            {
                for (i = 0; i < 8; i++)
                {
                    bytes[j] = (byte) (bytes[j] | ((data[j * 8 + i] & 0x01) << i));
                }
            }
        }
    }
}