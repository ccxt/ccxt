using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Bcpg.Sig
{
    /**
    * packet giving signature expiration time.
    */
    public class Features
        : SignatureSubpacket
    {
        /** Identifier for the Modification Detection (packets 18 and 19) */
        public static readonly byte FEATURE_MODIFICATION_DETECTION = 0x01;
        /** Identifier for the AEAD Encrypted Data Packet (packet 20) and version 5
         Symmetric-Key Encrypted Session Key Packets (packet 3) */
        public static readonly byte FEATURE_AEAD_ENCRYPTED_DATA = 0x02;
        /** Identifier for the Version 5 Public-Key Packet format and corresponding new
           fingerprint format */
        public static readonly byte FEATURE_VERSION_5_PUBLIC_KEY = 0x04;

        private static byte[] featureToByteArray(byte feature)
        {
            byte[] data = new byte[1];
            data[0] = feature;
            return data;
        }

        public Features(
            bool critical,
            bool isLongLength,
            byte[] data): base(SignatureSubpacketTag.Features, critical, isLongLength, data)
        {

        }
      

        public Features(bool critical, byte features): this(critical, false, featureToByteArray(features))
        {

        }
   

        public Features(bool critical, int features):  this(critical, false, featureToByteArray((byte)features))
        {
           
        }

        /**
         * Returns if modification detection is supported.
         */
        public bool SupportsModificationDetection
        {
            get { return SupportsFeature(FEATURE_MODIFICATION_DETECTION); }
        }

        /**
         * Returns if a particular feature is supported.
         */
        public bool SupportsFeature(byte feature)
        {
            return (data[0] & feature) != 0;
        }
    }
}
