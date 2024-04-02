namespace Org.BouncyCastle.Bcpg
{
    public class InputStreamPacket
        : Packet
    {
        private readonly BcpgInputStream bcpgIn;

		public InputStreamPacket(
            BcpgInputStream bcpgIn)
        {
            this.bcpgIn = bcpgIn;
        }

		/// <summary>Note: you can only read from this once...</summary>
		public BcpgInputStream GetInputStream()
        {
            return bcpgIn;
        }
    }
}
