using System;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Crmf;

namespace Org.BouncyCastle.Crmf
{
    /// <summary>
    /// Carrier for an authenticator control.
    /// </summary>
    public class AuthenticatorControl
        : IControl
    {
        private static readonly DerObjectIdentifier type = CrmfObjectIdentifiers.id_regCtrl_authenticator;

        private readonly DerUtf8String token;

        /// <summary>
        /// Basic constructor - build from a UTF-8 string representing the token.
        /// </summary>
        /// <param name="token">UTF-8 string representing the token.</param>
        public AuthenticatorControl(DerUtf8String token)
        {
            this.token = token;
        }

        /// <summary>
        /// Basic constructor - build from a string representing the token.
        /// </summary>
        /// <param name="token">string representing the token.</param>
        public AuthenticatorControl(string token)
        {
            this.token = new DerUtf8String(token);
        }

        /// <summary>
        /// Return the type of this control.
        /// </summary>
        public DerObjectIdentifier Type
        {
            get { return type; }
        }

        /// <summary>
        /// Return the token associated with this control (a UTF8String).
        /// </summary>
        public Asn1Encodable Value
        {
            get { return token; }
        }
    }
}
