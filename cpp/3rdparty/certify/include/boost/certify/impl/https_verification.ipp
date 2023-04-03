#ifndef BOOST_CERTIFY_IMPL_HTTPS_VERIFICATION_IPP
#define BOOST_CERTIFY_IMPL_HTTPS_VERIFICATION_IPP

#include <boost/certify/https_verification.hpp>

#include <boost/asio/ip/address.hpp>
#include <openssl/ssl.h>
#include <openssl/x509_vfy.h>

namespace boost
{
namespace certify
{
namespace detail
{

extern "C" BOOST_CERTIFY_DECL int
verify_server_certificates(int preverified, X509_STORE_CTX* ctx) noexcept
{
    if (preverified == 1)
        return true;

    auto const err = ::X509_STORE_CTX_get_error(ctx);
    if ((err == X509_V_ERR_SELF_SIGNED_CERT_IN_CHAIN ||
         err == X509_V_ERR_DEPTH_ZERO_SELF_SIGNED_CERT ||
         err == X509_V_ERR_UNABLE_TO_GET_ISSUER_CERT_LOCALLY) &&
        detail::verify_certificate_chain(ctx))
    {
        ::X509_STORE_CTX_set_error(ctx, X509_V_OK);
        return true;
    }

    return false;
}

BOOST_CERTIFY_DECL void
set_server_hostname(::X509_VERIFY_PARAM* param, string_view hostname, system::error_code& ec)
{
    ::X509_VERIFY_PARAM_set_hostflags(param,
                                      X509_CHECK_FLAG_NO_PARTIAL_WILDCARDS);
    // TODO(djarek): OpenSSL doesn't report an error here?
    if (!X509_VERIFY_PARAM_set1_host(param, hostname.data(), hostname.size()))
        ec = {static_cast<int>(::ERR_get_error()),
              asio::error::get_ssl_category()};
    else
        ec = {};
}

BOOST_CERTIFY_DECL void
set_server_hostname(::SSL* handle, string_view hostname, system::error_code& ec)
{
    auto* param = ::SSL_get0_param(handle);
    set_server_hostname(param, hostname, ec);
}


} // namespace detail

BOOST_CERTIFY_DECL void
enable_native_https_server_verification(asio::ssl::context& context)
{
    ::SSL_CTX_set_verify(context.native_handle(),
                         ::SSL_CTX_get_verify_mode(context.native_handle()),
                         &detail::verify_server_certificates);
}

} // namespace certify
} // namespace boost

#endif // BOOST_CERTIFY_IMPL_HTTPS_VERIFICATION_IPP
