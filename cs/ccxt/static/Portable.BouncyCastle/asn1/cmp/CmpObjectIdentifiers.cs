using System;

namespace Org.BouncyCastle.Asn1.Cmp
{
	public abstract class CmpObjectIdentifiers
	{
		// RFC 4210

		// id-PasswordBasedMac OBJECT IDENTIFIER ::= {1 2 840 113533 7 66 13}
		public static readonly DerObjectIdentifier passwordBasedMac = new DerObjectIdentifier("1.2.840.113533.7.66.13");

		// id-DHBasedMac OBJECT IDENTIFIER ::= {1 2 840 113533 7 66 30}
		public static readonly DerObjectIdentifier dhBasedMac = new DerObjectIdentifier("1.2.840.113533.7.66.30");

		// Example InfoTypeAndValue contents include, but are not limited
		// to, the following (un-comment in this ASN.1 module and use as
		// appropriate for a given environment):
		//
		// id-it-caProtEncCert OBJECT IDENTIFIER ::= {id-it 1}
		// CAProtEncCertValue ::= CMPCertificate
		// id-it-signKeyPairTypes OBJECT IDENTIFIER ::= {id-it 2}
		// SignKeyPairTypesValue ::= SEQUENCE OF AlgorithmIdentifier
		// id-it-encKeyPairTypes OBJECT IDENTIFIER ::= {id-it 3}
		// EncKeyPairTypesValue ::= SEQUENCE OF AlgorithmIdentifier
		// id-it-preferredSymmAlg OBJECT IDENTIFIER ::= {id-it 4}
		// PreferredSymmAlgValue ::= AlgorithmIdentifier
		// id-it-caKeyUpdateInfo OBJECT IDENTIFIER ::= {id-it 5}
		// CAKeyUpdateInfoValue ::= CAKeyUpdAnnContent
		// id-it-currentCRL OBJECT IDENTIFIER ::= {id-it 6}
		// CurrentCRLValue ::= CertificateList
		// id-it-unsupportedOIDs OBJECT IDENTIFIER ::= {id-it 7}
		// UnsupportedOIDsValue ::= SEQUENCE OF OBJECT IDENTIFIER
		// id-it-keyPairParamReq OBJECT IDENTIFIER ::= {id-it 10}
		// KeyPairParamReqValue ::= OBJECT IDENTIFIER
		// id-it-keyPairParamRep OBJECT IDENTIFIER ::= {id-it 11}
		// KeyPairParamRepValue ::= AlgorithmIdentifer
		// id-it-revPassphrase OBJECT IDENTIFIER ::= {id-it 12}
		// RevPassphraseValue ::= EncryptedValue
		// id-it-implicitConfirm OBJECT IDENTIFIER ::= {id-it 13}
		// ImplicitConfirmValue ::= NULL
		// id-it-confirmWaitTime OBJECT IDENTIFIER ::= {id-it 14}
		// ConfirmWaitTimeValue ::= GeneralizedTime
		// id-it-origPKIMessage OBJECT IDENTIFIER ::= {id-it 15}
		// OrigPKIMessageValue ::= PKIMessages
		// id-it-suppLangTags OBJECT IDENTIFIER ::= {id-it 16}
		// SuppLangTagsValue ::= SEQUENCE OF UTF8String
		//
		// where
		//
		// id-pkix OBJECT IDENTIFIER ::= {
		// iso(1) identified-organization(3)
		// dod(6) internet(1) security(5) mechanisms(5) pkix(7)}
		// and
		// id-it OBJECT IDENTIFIER ::= {id-pkix 4}
		public static readonly DerObjectIdentifier it_caProtEncCert = new DerObjectIdentifier("1.3.6.1.5.5.7.4.1");
		public static readonly DerObjectIdentifier it_signKeyPairTypes = new DerObjectIdentifier("1.3.6.1.5.5.7.4.2");
		public static readonly DerObjectIdentifier it_encKeyPairTypes = new DerObjectIdentifier("1.3.6.1.5.5.7.4.3");
		public static readonly DerObjectIdentifier it_preferredSymAlg = new DerObjectIdentifier("1.3.6.1.5.5.7.4.4");
		public static readonly DerObjectIdentifier it_caKeyUpdateInfo = new DerObjectIdentifier("1.3.6.1.5.5.7.4.5");
		public static readonly DerObjectIdentifier it_currentCRL = new DerObjectIdentifier("1.3.6.1.5.5.7.4.6");
		public static readonly DerObjectIdentifier it_unsupportedOIDs = new DerObjectIdentifier("1.3.6.1.5.5.7.4.7");
		public static readonly DerObjectIdentifier it_keyPairParamReq = new DerObjectIdentifier("1.3.6.1.5.5.7.4.10");
		public static readonly DerObjectIdentifier it_keyPairParamRep = new DerObjectIdentifier("1.3.6.1.5.5.7.4.11");
		public static readonly DerObjectIdentifier it_revPassphrase = new DerObjectIdentifier("1.3.6.1.5.5.7.4.12");
		public static readonly DerObjectIdentifier it_implicitConfirm = new DerObjectIdentifier("1.3.6.1.5.5.7.4.13");
		public static readonly DerObjectIdentifier it_confirmWaitTime = new DerObjectIdentifier("1.3.6.1.5.5.7.4.14");
		public static readonly DerObjectIdentifier it_origPKIMessage = new DerObjectIdentifier("1.3.6.1.5.5.7.4.15");
		public static readonly DerObjectIdentifier it_suppLangTags = new DerObjectIdentifier("1.3.6.1.5.5.7.4.16");

		// RFC 4211

		// id-pkix OBJECT IDENTIFIER ::= { iso(1) identified-organization(3)
		// dod(6) internet(1) security(5) mechanisms(5) pkix(7) }
		//
		// arc for Internet X.509 PKI protocols and their components
		// id-pkip OBJECT IDENTIFIER :: { id-pkix pkip(5) }
		//
		// arc for Registration Controls in CRMF
		// id-regCtrl OBJECT IDENTIFIER ::= { id-pkip regCtrl(1) }
		//
		// arc for Registration Info in CRMF
		// id-regInfo OBJECT IDENTIFIER ::= { id-pkip id-regInfo(2) }

		public static readonly DerObjectIdentifier regCtrl_regToken = new DerObjectIdentifier("1.3.6.1.5.5.7.5.1.1");
		public static readonly DerObjectIdentifier regCtrl_authenticator = new DerObjectIdentifier("1.3.6.1.5.5.7.5.1.2");
		public static readonly DerObjectIdentifier regCtrl_pkiPublicationInfo = new DerObjectIdentifier("1.3.6.1.5.5.7.5.1.3");
		public static readonly DerObjectIdentifier regCtrl_pkiArchiveOptions = new DerObjectIdentifier("1.3.6.1.5.5.7.5.1.4");
		public static readonly DerObjectIdentifier regCtrl_oldCertID = new DerObjectIdentifier("1.3.6.1.5.5.7.5.1.5");
		public static readonly DerObjectIdentifier regCtrl_protocolEncrKey = new DerObjectIdentifier("1.3.6.1.5.5.7.5.1.6");

		// From RFC4210:
		// id-regCtrl-altCertTemplate OBJECT IDENTIFIER ::= {id-regCtrl 7}
		public static readonly DerObjectIdentifier regCtrl_altCertTemplate = new DerObjectIdentifier("1.3.6.1.5.5.7.5.1.7");

		public static readonly DerObjectIdentifier regInfo_utf8Pairs = new DerObjectIdentifier("1.3.6.1.5.5.7.5.2.1");
		public static readonly DerObjectIdentifier regInfo_certReq = new DerObjectIdentifier("1.3.6.1.5.5.7.5.2.2");

		// id-smime OBJECT IDENTIFIER ::= { iso(1) member-body(2)
		// us(840) rsadsi(113549) pkcs(1) pkcs9(9) 16 }
		//
		// id-ct OBJECT IDENTIFIER ::= { id-smime 1 } -- content types
		//
		// id-ct-encKeyWithID OBJECT IDENTIFIER ::= {id-ct 21}
		public static readonly DerObjectIdentifier ct_encKeyWithID = new DerObjectIdentifier("1.2.840.113549.1.9.16.1.21");
	}
}
