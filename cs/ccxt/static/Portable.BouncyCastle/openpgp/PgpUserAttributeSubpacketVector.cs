using Org.BouncyCastle.Bcpg.Attr;

namespace Org.BouncyCastle.Bcpg.OpenPgp
{
	/// <remarks>Container for a list of user attribute subpackets.</remarks>
    public class PgpUserAttributeSubpacketVector
    {
        public static PgpUserAttributeSubpacketVector FromSubpackets(UserAttributeSubpacket[] packets)
        {
            if (packets == null)
            {
                packets = new UserAttributeSubpacket[0];
            }
            return new PgpUserAttributeSubpacketVector(packets);
        }

        private readonly UserAttributeSubpacket[] packets;

		internal PgpUserAttributeSubpacketVector(
            UserAttributeSubpacket[] packets)
        {
            this.packets = packets;
        }

		public UserAttributeSubpacket GetSubpacket(
            UserAttributeSubpacketTag type)
        {
            for (int i = 0; i != packets.Length; i++)
            {
                if (packets[i].SubpacketType == type)
                {
                    return packets[i];
                }
            }

			return null;
        }

		public ImageAttrib GetImageAttribute()
        {
            UserAttributeSubpacket p = GetSubpacket(UserAttributeSubpacketTag.ImageAttribute);

            return p == null ? null : (ImageAttrib) p;
        }

		internal UserAttributeSubpacket[] ToSubpacketArray()
        {
            return packets;
        }

		public override bool Equals(
            object obj)
        {
            if (obj == this)
                return true;

			PgpUserAttributeSubpacketVector other = obj as PgpUserAttributeSubpacketVector;

			if (other == null)
				return false;

			if (other.packets.Length != packets.Length)
            {
                return false;
            }

			for (int i = 0; i != packets.Length; i++)
            {
                if (!other.packets[i].Equals(packets[i]))
                {
                    return false;
                }
            }

			return true;
        }

		public override int GetHashCode()
        {
            int code = 0;

			foreach (object o in packets)
			{
				code ^= o.GetHashCode();
			}

			return code;
        }
    }
}
