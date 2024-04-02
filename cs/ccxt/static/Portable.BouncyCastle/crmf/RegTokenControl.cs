using System;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Crmf;

namespace Org.BouncyCastle.Crmf
{
    public class RegTokenControl
        : IControl
    {
        private static readonly DerObjectIdentifier type = CrmfObjectIdentifiers.id_regCtrl_regToken;

        private readonly DerUtf8String token;

        /// <summary>
        /// Basic constructor - build from a UTF-8 string representing the token.
        /// </summary>
        /// <param name="token">UTF-8 string representing the token.</param>
        public RegTokenControl(DerUtf8String token)
        {
            this.token = token;
        }

        /// <summary>
        /// Basic constructor - build from a string representing the token.
        /// </summary>
        /// <param name="token">string representing the token.</param>
        public RegTokenControl(string token)
        {
            this.token = new DerUtf8String(token);
        }

        /// <summary>
        /// Return the type of this control.
        /// </summary>
        /// <returns>CRMFObjectIdentifiers.id_regCtrl_regToken</returns>
        public DerObjectIdentifier Type
        {
            get { return type; }
        }

        /// <summary>
        /// Return the token associated with this control (a UTF8String).
        /// </summary>
        /// <returns>a UTF8String.</returns>
        public Asn1Encodable Value
        {
            get { return token; }
        }
    }
}
