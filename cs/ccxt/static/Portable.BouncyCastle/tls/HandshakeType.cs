using System;

namespace Org.BouncyCastle.Tls
{
    public abstract class HandshakeType
    {
        /*
         * RFC 2246 7.4
         */
        public const short hello_request = 0;
        public const short client_hello = 1;
        public const short server_hello = 2;
        public const short certificate = 11;
        public const short server_key_exchange = 12;
        public const short certificate_request = 13;
        public const short server_hello_done = 14;
        public const short certificate_verify = 15;
        public const short client_key_exchange = 16;
        public const short finished = 20;

        /*
         * RFC 3546 2.4
         */
        public const short certificate_url = 21;
        public const short certificate_status = 22;

        /*
         * (DTLS) RFC 4347 4.3.2
         */
        public const short hello_verify_request = 3;

        /*
         * RFC 4680
         */
        public const short supplemental_data = 23;

        /*
         * RFC 8446
         */
        public const short new_session_ticket = 4;
        public const short end_of_early_data = 5;
        public const short hello_retry_request = 6;
        public const short encrypted_extensions = 8;
        public const short key_update = 24;
        public const short message_hash = 254;

        /*
         * RFC 8879
         */
        public const short compressed_certificate = 25;

        public static string GetName(short handshakeType)
        {
            switch (handshakeType)
            {
            case hello_request:
                return "hello_request";
            case client_hello:
                return "client_hello";
            case server_hello:
                return "server_hello";
            case certificate:
                return "certificate";
            case server_key_exchange:
                return "server_key_exchange";
            case certificate_request:
                return "certificate_request";
            case server_hello_done:
                return "server_hello_done";
            case certificate_verify:
                return "certificate_verify";
            case client_key_exchange:
                return "client_key_exchange";
            case finished:
                return "finished";
            case certificate_url:
                return "certificate_url";
            case certificate_status:
                return "certificate_status";
            case hello_verify_request:
                return "hello_verify_request";
            case supplemental_data:
                return "supplemental_data";
            case new_session_ticket:
                return "new_session_ticket";
            case end_of_early_data:
                return "end_of_early_data";
            case hello_retry_request:
                return "hello_retry_request";
            case encrypted_extensions:
                return "encrypted_extensions";
            case key_update:
                return "key_update";
            case message_hash:
                return "message_hash";
            case compressed_certificate:
                return "compressed_certificate";
            default:
                return "UNKNOWN";
            }
        }

        public static string GetText(short handshakeType)
        {
            return GetName(handshakeType) + "(" + handshakeType + ")";
        }

        public static bool IsRecognized(short handshakeType)
        {
            switch (handshakeType)
            {
            case hello_request:
            case client_hello:
            case server_hello:
            case certificate:
            case server_key_exchange:
            case certificate_request:
            case server_hello_done:
            case certificate_verify:
            case client_key_exchange:
            case finished:
            case certificate_url:
            case certificate_status:
            case hello_verify_request:
            case supplemental_data:
            case new_session_ticket:
            case end_of_early_data:
            case hello_retry_request:
            case encrypted_extensions:
            case key_update:
            case message_hash:
            case compressed_certificate:
                return true;
            default:
                return false;
            }
        }
    }
}
