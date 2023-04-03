#ifndef BOOST_CERTIFY_DETAIL_KEYSTORE_DEFAULT
#define BOOST_CERTIFY_DETAIL_KEYSTORE_DEFAULT

#include <openssl/x509_vfy.h>
#include <string>

namespace boost
{
namespace certify
{
namespace detail
{

BOOST_CERTIFY_DECL bool
verify_certificate_chain(::X509_STORE_CTX*)
{
    return false;
}

} // namespace detail
} // namespace certify
} // namespace boost

#endif // BOOST_CERTIFY_DETAIL_KEYSTORE_DEFAULT
