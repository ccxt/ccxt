#ifndef BOOST_CERTIFY_DETAIL_SPKI_DIGEST_HPP
#define BOOST_CERTIFY_DETAIL_SPKI_DIGEST_HPP

#include <array>
#include <boost/make_unique.hpp>
#include <cassert>
#include <openssl/x509.h>

namespace boost
{
namespace certify
{
namespace detail
{

inline std::array<std::uint8_t, 32>
spki_digest(unsigned char* buf, std::size_t buflen)
{
    std::array<std::uint8_t, 32> digest;
    SHA256(buf, buflen, digest.data());
    return digest;
}

inline std::array<std::uint8_t, 32>
spki_digest(::X509* cert)
{
    struct pkey_ptr
    {
        ~pkey_ptr()
        {
            EVP_PKEY_free(ptr);
        }

        EVP_PKEY* ptr;
    };
    pkey_ptr pkey{X509_get_pubkey(cert)};

    std::size_t buflen = i2d_PUBKEY(pkey.ptr, nullptr);
    unsigned char* buf = nullptr;
    auto p = boost::make_unique_noinit<unsigned char[]>(buflen);
    buf = p.get();
    auto ret = i2d_PUBKEY(pkey.ptr, &buf);
    assert(ret);

    return spki_digest(p.get(), buflen);
}
} // namespace detail
} // namespace certify
} // namespace boost

#endif // BOOST_CERTIFY_DETAIL_SPKI_DIGEST_HPP
