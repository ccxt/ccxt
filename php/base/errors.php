<?php

namespace ccxt;

class BaseError            extends \Exception    {}
class ExchangeError        extends BaseError     {}
class NotSupported         extends ExchangeError {}
class AuthenticationError  extends ExchangeError {}
class InsufficientFunds    extends ExchangeError {}
class InvalidOrder         extends ExchangeError {}
class OrderNotFound        extends InvalidOrder  {}
class OrderNotCached       extends InvalidOrder  {}
class NetworkError         extends BaseError     {}
class DDoSProtection       extends NetworkError  {}
class RequestTimeout       extends NetworkError  {}
class ExchangeNotAvailable extends NetworkError  {}

$curl_errors = array (
    0 => 'CURLE_OK',
    1 => 'CURLE_UNSUPPORTED_PROTOCOL',
    2 => 'CURLE_FAILED_INIT',
    3 => 'CURLE_URL_MALFORMAT',
    4 => 'CURLE_NOT_BUILT_IN',
    5 => 'CURLE_COULDNT_RESOLVE_PROXY',
    6 => 'CURLE_COULDNT_RESOLVE_HOST',
    7 => 'CURLE_COULDNT_CONNECT',
    8 => 'CURLE_FTP_WEIRD_SERVER_REPLY',
    9 => 'CURLE_REMOTE_ACCESS_DENIED',
    10 => 'CURLE_FTP_ACCEPT_FAILED',
    11 => 'CURLE_FTP_WEIRD_PASS_REPLY',
    12 => 'CURLE_FTP_ACCEPT_TIMEOUT',
    13 => 'CURLE_FTP_WEIRD_PASV_REPLY',
    14 => 'CURLE_FTP_WEIRD_227_FORMAT',
    15 => 'CURLE_FTP_CANT_GET_HOST',
    16 => 'CURLE_HTTP2',
    17 => 'CURLE_FTP_COULDNT_SET_TYPE',
    18 => 'CURLE_PARTIAL_FILE',
    19 => 'CURLE_FTP_COULDNT_RETR_FILE',
    21 => 'CURLE_QUOTE_ERROR',
    22 => 'CURLE_HTTP_RETURNED_ERROR',
    23 => 'CURLE_WRITE_ERROR',
    25 => 'CURLE_UPLOAD_FAILED',
    26 => 'CURLE_READ_ERROR',
    27 => 'CURLE_OUT_OF_MEMORY',
    28 => 'CURLE_OPERATION_TIMEDOUT',
    30 => 'CURLE_FTP_PORT_FAILED',
    31 => 'CURLE_FTP_COULDNT_USE_REST',
    33 => 'CURLE_RANGE_ERROR',
    34 => 'CURLE_HTTP_POST_ERROR',
    35 => 'CURLE_SSL_CONNECT_ERROR',
    36 => 'CURLE_BAD_DOWNLOAD_RESUME',
    37 => 'CURLE_FILE_COULDNT_READ_FILE',
    38 => 'CURLE_LDAP_CANNOT_BIND',
    39 => 'CURLE_LDAP_SEARCH_FAILED',
    41 => 'CURLE_FUNCTION_NOT_FOUND',
    42 => 'CURLE_ABORTED_BY_CALLBACK',
    43 => 'CURLE_BAD_FUNCTION_ARGUMENT',
    45 => 'CURLE_INTERFACE_FAILED',
    47 => 'CURLE_TOO_MANY_REDIRECTS',
    48 => 'CURLE_UNKNOWN_OPTION',
    49 => 'CURLE_TELNET_OPTION_SYNTAX',
    51 => 'CURLE_PEER_FAILED_VERIFICATION',
    52 => 'CURLE_GOT_NOTHING',
    53 => 'CURLE_SSL_ENGINE_NOTFOUND',
    54 => 'CURLE_SSL_ENGINE_SETFAILED',
    55 => 'CURLE_SEND_ERROR',
    56 => 'CURLE_RECV_ERROR',
    58 => 'CURLE_SSL_CERTPROBLEM',
    59 => 'CURLE_SSL_CIPHER',
    60 => 'CURLE_SSL_CACERT',
    61 => 'CURLE_BAD_CONTENT_ENCODING',
    62 => 'CURLE_LDAP_INVALID_URL',
    63 => 'CURLE_FILESIZE_EXCEEDED',
    64 => 'CURLE_USE_SSL_FAILED',
    65 => 'CURLE_SEND_FAIL_REWIND',
    66 => 'CURLE_SSL_ENGINE_INITFAILED',
    67 => 'CURLE_LOGIN_DENIED',
    68 => 'CURLE_TFTP_NOTFOUND',
    69 => 'CURLE_TFTP_PERM',
    70 => 'CURLE_REMOTE_DISK_FULL',
    71 => 'CURLE_TFTP_ILLEGAL',
    72 => 'CURLE_TFTP_UNKNOWNID',
    73 => 'CURLE_REMOTE_FILE_EXISTS',
    74 => 'CURLE_TFTP_NOSUCHUSER',
    75 => 'CURLE_CONV_FAILED',
    76 => 'CURLE_CONV_REQD',
    77 => 'CURLE_SSL_CACERT_BADFILE',
    78 => 'CURLE_REMOTE_FILE_NOT_FOUND',
    79 => 'CURLE_SSH',
    80 => 'CURLE_SSL_SHUTDOWN_FAILED',
    81 => 'CURLE_AGAIN',
    82 => 'CURLE_SSL_CRL_BADFILE',
    83 => 'CURLE_SSL_ISSUER_ERROR',
    84 => 'CURLE_FTP_PRET_FAILED',
    85 => 'CURLE_RTSP_CSEQ_ERROR',
    86 => 'CURLE_RTSP_SESSION_ERROR',
    87 => 'CURLE_FTP_BAD_FILE_LIST',
    88 => 'CURLE_CHUNK_FAILED',
    89 => 'CURLE_NO_CONNECTION_AVAILABLE',
    90 => 'CURLE_SSL_PINNEDPUBKEYNOTMATCH',
    91 => 'CURLE_SSL_INVALIDCERTSTATUS',
    92 => 'CURLE_HTTP2_STREAM',
);

?>