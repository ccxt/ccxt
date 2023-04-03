#ifndef BOOST_CERTIFY_HTTPS_VERIFICATION_HPP
#define BOOST_CERTIFY_HTTPS_VERIFICATION_HPP

#include <boost/certify/detail/config.hpp>

#include <boost/asio/ssl/stream.hpp>
#include <boost/utility/string_view.hpp>

namespace boost
{
namespace certify
{
namespace detail
{

inline bool
verify_certificate_chain(::X509_STORE_CTX* ctx);

inline void
set_server_hostname(::SSL* handle,
                    string_view hostname,
                    system::error_code& ec);

extern "C" inline int
verify_server_certificates(int preverified, X509_STORE_CTX* ctx) noexcept;

} // namespace detail
} // namespace certify
} // namespace boost

#if BOOST_CERTIFY_USE_NATIVE_CERTIFICATE_STORE && BOOST_CERTIFY_HEADER_ONLY
#if BOOST_WINDOWS
#include <boost/certify/detail/keystore_windows.ipp>
#elif __APPLE__
#include <boost/certify/detail/keystore_apple.ipp>
#else
#include <boost/certify/detail/keystore_default.ipp>
#endif
#endif // BOOST_CERTIFY_USE_NATIVE_CERTIFICATE_STORE && BOOST_CERTIFY_HEADER_ONLY

namespace boost
{
namespace certify
{

template<class NextLayer>
void
set_server_hostname(asio::ssl::stream<NextLayer>& stream,
                    string_view hostname,
                    system::error_code& ec);

template<class NextLayer>
void
set_server_hostname(asio::ssl::stream<NextLayer>& stream, string_view hostname);

void
enable_native_https_server_verification(asio::ssl::context& context);

} // namespace certify
} // namespace boost

#include <boost/certify/impl/https_verification.hpp>
#if BOOST_CERTIFY_HEADER_ONLY
#include <boost/certify/impl/https_verification.ipp>
#endif // BOOST_CERTIFY_HEADER_ONLY

#endif // BOOST_CERTIFY_HTTPS_VERIFICATION_HPP
