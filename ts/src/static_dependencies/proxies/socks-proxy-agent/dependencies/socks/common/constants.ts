import {Duplex} from 'stream';
import {Socket, SocketConnectOpts} from 'net';
import {RequireOnlyOne} from './util.js';

const DEFAULT_TIMEOUT = 30000;

type SocksProxyType = 4 | 5;

// prettier-ignore
const ERRORS = {
  InvalidSocksCommand: 'An invalid SOCKS command was provided. Valid options are connect, bind, and associate.',
  InvalidSocksCommandForOperation: 'An invalid SOCKS command was provided. Only a subset of commands are supported for this operation.',
  InvalidSocksCommandChain: 'An invalid SOCKS command was provided. Chaining currently only supports the connect command.',
  InvalidSocksClientOptionsDestination: 'An invalid destination host was provided.',
  InvalidSocksClientOptionsExistingSocket: 'An invalid existing socket was provided. This should be an instance of stream.Duplex.',
  InvalidSocksClientOptionsProxy: 'Invalid SOCKS proxy details were provided.',
  InvalidSocksClientOptionsTimeout: 'An invalid timeout value was provided. Please enter a value above 0 (in ms).',
  InvalidSocksClientOptionsProxiesLength: 'At least two socks proxies must be provided for chaining.',
  InvalidSocksClientOptionsCustomAuthRange: 'Custom auth must be a value between 0x80 and 0xFE.',
  InvalidSocksClientOptionsCustomAuthOptions: 'When a custom_auth_method is provided, custom_auth_request_handler, custom_auth_response_size, and custom_auth_response_handler must also be provided and valid.',
  NegotiationError: 'Negotiation error',
  SocketClosed: 'Socket closed',
  ProxyConnectionTimedOut: 'Proxy connection timed out',
  InternalError: 'SocksClient internal error (this should not happen)',
  InvalidSocks4HandshakeResponse: 'Received invalid Socks4 handshake response',
  Socks4ProxyRejectedConnection: 'Socks4 Proxy rejected connection',
  InvalidSocks4IncomingConnectionResponse: 'Socks4 invalid incoming connection response',
  Socks4ProxyRejectedIncomingBoundConnection: 'Socks4 Proxy rejected incoming bound connection',
  InvalidSocks5InitialHandshakeResponse: 'Received invalid Socks5 initial handshake response',
  InvalidSocks5IntiailHandshakeSocksVersion: 'Received invalid Socks5 initial handshake (invalid socks version)',
  InvalidSocks5InitialHandshakeNoAcceptedAuthType: 'Received invalid Socks5 initial handshake (no accepted authentication type)',
  InvalidSocks5InitialHandshakeUnknownAuthType: 'Received invalid Socks5 initial handshake (unknown authentication type)',
  Socks5AuthenticationFailed: 'Socks5 Authentication failed',
  InvalidSocks5FinalHandshake: 'Received invalid Socks5 final handshake response',
  InvalidSocks5FinalHandshakeRejected: 'Socks5 proxy rejected connection',
  InvalidSocks5IncomingConnectionResponse: 'Received invalid Socks5 incoming connection response',
  Socks5ProxyRejectedIncomingBoundConnection: 'Socks5 Proxy rejected incoming bound connection',
};

const SOCKS_INCOMING_PACKET_SIZES = {
  Socks5InitialHandshakeResponse: 2,
  Socks5UserPassAuthenticationResponse: 2,
  // Command response + incoming connection (bind)
  Socks5ResponseHeader: 5, // We need at least 5 to read the hostname length, then we wait for the address+port information.
  Socks5ResponseIPv4: 10, // 4 header + 4 ip + 2 port
  Socks5ResponseIPv6: 22, // 4 header + 16 ip + 2 port
  Socks5ResponseHostname: (hostNameLength: number) => hostNameLength + 7, // 4 header + 1 host length + host + 2 port
  // Command response + incoming connection (bind)
  Socks4Response: 8, // 2 header + 2 port + 4 ip
};

type SocksCommandOption = 'connect' | 'bind' | 'associate';

enum SocksCommand {
  connect = 0x01,
  bind = 0x02,
  associate = 0x03,
}

enum Socks4Response {
  Granted = 0x5a,
  Failed = 0x5b,
  Rejected = 0x5c,
  RejectedIdent = 0x5d,
}

enum Socks5Auth {
  NoAuth = 0x00,
  GSSApi = 0x01,
  UserPass = 0x02,
}

const SOCKS5_CUSTOM_AUTH_START = 0x80;
const SOCKS5_CUSTOM_AUTH_END = 0xfe;

const SOCKS5_NO_ACCEPTABLE_AUTH = 0xff;

enum Socks5Response {
  Granted = 0x00,
  Failure = 0x01,
  NotAllowed = 0x02,
  NetworkUnreachable = 0x03,
  HostUnreachable = 0x04,
  ConnectionRefused = 0x05,
  TTLExpired = 0x06,
  CommandNotSupported = 0x07,
  AddressNotSupported = 0x08,
}

enum Socks5HostType {
  IPv4 = 0x01,
  Hostname = 0x03,
  IPv6 = 0x04,
}

enum SocksClientState {
  Created = 0,
  Connecting = 1,
  Connected = 2,
  SentInitialHandshake = 3,
  ReceivedInitialHandshakeResponse = 4,
  SentAuthentication = 5,
  ReceivedAuthenticationResponse = 6,
  SentFinalHandshake = 7,
  ReceivedFinalResponse = 8,
  BoundWaitingForConnection = 9,
  Established = 10,
  Disconnected = 11,
  Error = 99,
}

/**
 * Represents a SocksProxy
 */
type SocksProxy = RequireOnlyOne<
  {
    // The ip address (or hostname) of the proxy. (this is equivalent to the host option)
    ipaddress?: string;
    // The ip address (or hostname) of the proxy. (this is equivalent to the ipaddress option)
    host?: string;
    // Numeric port number of the proxy.
    port: number;
    // 4 or 5 (4 is also used for 4a).
    type: SocksProxyType;
    /* For SOCKS v4, the userId can be used for authentication.
     For SOCKS v5, userId is used as the username for username/password authentication. */
    userId?: string;
    // For SOCKS v5, this password is used in username/password authentication.
    password?: string;
    // If present, this auth method will be sent to the proxy server during the initial handshake.
    custom_auth_method?: number;
    // If present with custom_auth_method, the payload of the returned Buffer of the provided function is sent during the auth handshake.
    custom_auth_request_handler?: () => Promise<Buffer>;
    // If present with custom_auth_method, this is the expected total response size of the data returned from the server during custom auth handshake.
    custom_auth_response_size?: number;
    // If present with custom_auth_method, the response from the server is passed to this function. If true is returned from this function, socks client will continue the handshake process, if false it will disconnect.
    custom_auth_response_handler?: (data: Buffer) => Promise<boolean>;
  },
  'host' | 'ipaddress'
>;

/**
 * Represents a remote host
 */
interface SocksRemoteHost {
  // IPv4, IPv6, or Hostname.
  host: string;
  // Numeric port number.
  port: number;
}

/**
 * SocksClient connection options.
 */
interface SocksClientOptions {
  // connect, bind, associate.
  command: SocksCommandOption;
  // The remote destination host to connect to via the proxy.
  destination: SocksRemoteHost;
  // The proxy server to use.
  proxy: SocksProxy;
  // The amount of time to wait when establishing a proxy connection (ms).
  timeout?: number;
  // Used internally for proxy chaining.
  existing_socket?: Duplex;
  // Whether to set TCP_NODELAY
  set_tcp_nodelay?: boolean;
  // TCP SocketConnection Options host/port in this object will be overriden by host/port in destination property.
  socket_options?: SocketConnectOpts;
}

/**
 * SocksClient chain connection options.
 */
interface SocksClientChainOptions {
  // Only the connect command is supported when chaining.
  command: 'connect';
  // The remote destination host to connect to via the proxy.
  destination: SocksRemoteHost;
  // The list of proxy servers to chain.
  proxies: SocksProxy[];
  // The amount of time to wait when establishing a proxy connection (ms).
  timeout?: number;
  // If true, the list of proxies will be shuffled (default: false)
  randomizeChain?: false;
}

interface SocksClientEstablishedEvent {
  // The raw net.Socket that is a proxied connection through the proxy to the destination host.
  socket: Socket;
  // If provided, this is the remote host that connected to the proxy when using bind.
  remoteHost?: SocksRemoteHost;
}

type SocksClientBoundEvent = SocksClientEstablishedEvent;

interface SocksUDPFrameDetails {
  // The frame number of the packet.
  frameNumber?: number;

  // The remote host.
  remoteHost: SocksRemoteHost;

  // The packet data.
  data: Buffer;
}

export {
  DEFAULT_TIMEOUT,
  ERRORS,
  SocksProxyType,
  SocksCommand,
  Socks4Response,
  Socks5Auth,
  Socks5HostType,
  Socks5Response,
  SocksClientState,
  SocksProxy,
  SocksRemoteHost,
  SocksCommandOption,
  SocksClientOptions,
  SocksClientChainOptions,
  SocksClientEstablishedEvent,
  SocksClientBoundEvent,
  SocksUDPFrameDetails,
  SOCKS_INCOMING_PACKET_SIZES,
  SOCKS5_CUSTOM_AUTH_START,
  SOCKS5_CUSTOM_AUTH_END,
  SOCKS5_NO_ACCEPTABLE_AUTH,
};
