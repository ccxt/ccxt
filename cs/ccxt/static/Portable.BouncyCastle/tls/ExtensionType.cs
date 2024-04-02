using System;

namespace Org.BouncyCastle.Tls
{
    public abstract class ExtensionType
    {
        /*
         * RFC 2546 2.3.
         */
        public const int server_name = 0;
        public const int max_fragment_length = 1;
        public const int client_certificate_url = 2;
        public const int trusted_ca_keys = 3;
        public const int truncated_hmac = 4;
        public const int status_request = 5;

        /*
         * RFC 4681
         */
        public const int user_mapping = 6;

        /*
         * RFC 5878
         */
        public const int client_authz = 7;
        public const int server_authz = 8;

        /*
         * RFC 6091
         */
        public const int cert_type = 9;

        /*
         * RFC 7919 (originally 'elliptic_curves' from RFC 4492)
         */
        public const int supported_groups = 10;

        /*
         * RFC 4492 5.1.
         */
        public const int ec_point_formats = 11;

        /*
         * RFC 5054 2.8.1.
         */
        public const int srp = 12;

        /*
         * RFC 5246 7.4.1.4.
         */
        public const int signature_algorithms = 13;

        /*
         * RFC 5764 9.
         */
        public const int use_srtp = 14;

        /*
         * RFC 6520 6.
         */
        public const int heartbeat = 15;

        /*
         * RFC 7301
         */
        public const int application_layer_protocol_negotiation = 16;

        /*
         * RFC 6961
         */
        public const int status_request_v2 = 17;

        /*
         * RFC 6962
         */
        public const int signed_certificate_timestamp = 18;

        /*
         * RFC 7250
         */
        public const int client_certificate_type = 19;
        public const int server_certificate_type = 20;

        /*
         * RFC 7685
         */
        public const int padding = 21;

        /*
         * RFC 7366
         */
        public const int encrypt_then_mac = 22;

        /*
         * RFC 7627
         */
        public const int extended_master_secret = 23;

        /*
         * RFC 8472
         */
        public const int token_binding = 24;

        /*
         * RFC 7924
         */
        public const int cached_info = 25;

        /*
         * RFC 8879
         */
        public const int compress_certificate = 27;

        /*
         * RFC 8449
         */
        public const int record_size_limit = 28;

        /*
         * RFC 5077 7.
         */
        public const int session_ticket = 35;

        /*
         * RFC 8446
         */
        public const int pre_shared_key = 41;
        public const int early_data = 42;
        public const int supported_versions = 43;
        public const int cookie = 44;
        public const int psk_key_exchange_modes = 45;
        public const int certificate_authorities = 47;
        public const int oid_filters = 48;
        public const int post_handshake_auth = 49;
        public const int signature_algorithms_cert = 50;
        public const int key_share = 51;

        /*
         * RFC 5746 3.2.
         */
        public const int renegotiation_info = 0xff01;

        public static string GetName(int extensionType)
        {
            switch (extensionType)
            {
            case server_name:
                return "server_name";
            case max_fragment_length:
                return "max_fragment_length";
            case client_certificate_url:
                return "client_certificate_url";
            case trusted_ca_keys:
                return "trusted_ca_keys";
            case truncated_hmac:
                return "truncated_hmac";
            case status_request:
                return "status_request";
            case user_mapping:
                return "user_mapping";
            case client_authz:
                return "client_authz";
            case server_authz:
                return "server_authz";
            case cert_type:
                return "cert_type";
            case supported_groups:
                return "supported_groups";
            case ec_point_formats:
                return "ec_point_formats";
            case srp:
                return "srp";
            case signature_algorithms:
                return "signature_algorithms";
            case use_srtp:
                return "use_srtp";
            case heartbeat:
                return "heartbeat";
            case application_layer_protocol_negotiation:
                return "application_layer_protocol_negotiation";
            case status_request_v2:
                return "status_request_v2";
            case signed_certificate_timestamp:
                return "signed_certificate_timestamp";
            case client_certificate_type:
                return "client_certificate_type";
            case server_certificate_type:
                return "server_certificate_type";
            case padding:
                return "padding";
            case encrypt_then_mac:
                return "encrypt_then_mac";
            case extended_master_secret:
                return "extended_master_secret";
            case token_binding:
                return "token_binding";
            case cached_info:
                return "cached_info";
            case compress_certificate:
                return "compress_certificate";
            case record_size_limit:
                return "record_size_limit";
            case session_ticket:
                return "session_ticket";
            case pre_shared_key:
                return "pre_shared_key";
            case early_data:
                return "early_data";
            case supported_versions:
                return "supported_versions";
            case cookie:
                return "cookie";
            case psk_key_exchange_modes:
                return "psk_key_exchange_modes";
            case certificate_authorities:
                return "certificate_authorities";
            case oid_filters:
                return "oid_filters";
            case post_handshake_auth:
                return "post_handshake_auth";
            case signature_algorithms_cert:
                return "signature_algorithms_cert";
            case key_share:
                return "key_share";
            case renegotiation_info:
                return "renegotiation_info";
            default:
                return "UNKNOWN";
            }
        }

        public static string GetText(int extensionType)
        {
            return GetName(extensionType) + "(" + extensionType + ")";
        }

        public static bool IsRecognized(int extensionType)
        {
            switch (extensionType)
            {
            case server_name:
            case max_fragment_length:
            case client_certificate_url:
            case trusted_ca_keys:
            case truncated_hmac:
            case status_request:
            case user_mapping:
            case client_authz:
            case server_authz:
            case cert_type:
            case supported_groups:
            case ec_point_formats:
            case srp:
            case signature_algorithms:
            case use_srtp:
            case heartbeat:
            case application_layer_protocol_negotiation:
            case status_request_v2:
            case signed_certificate_timestamp:
            case client_certificate_type:
            case server_certificate_type:
            case padding:
            case encrypt_then_mac:
            case extended_master_secret:
            case token_binding:
            case cached_info:
            case compress_certificate:
            case record_size_limit:
            case session_ticket:
            case pre_shared_key:
            case early_data:
            case supported_versions:
            case cookie:
            case psk_key_exchange_modes:
            case certificate_authorities:
            case oid_filters:
            case post_handshake_auth:
            case signature_algorithms_cert:
            case key_share:
            case renegotiation_info:
                return true;
            default:
                return false;
            }
        }
    }
}
