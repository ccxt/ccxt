#ifndef CERTIFY_TLS_DETAIL_KEYSTORE_APPLE
#define CERTIFY_TLS_DETAIL_KEYSTORE_APPLE

#include <boost/asio/ssl/verify_context.hpp>
#include <boost/assert.hpp>

#include <string>
#include <vector>

#include <CoreFoundation/CFData.h>
#include <Security/SecBase.h>
#include <Security/SecCertificate.h>
#include <Security/SecPolicy.h>
#include <Security/SecTrust.h>

namespace boost
{
namespace certify
{

namespace detail
{

template<class T>
struct cf_deleter
{
    using pointer = T;

    void operator()(T t)
    {
        CFRelease(t);
    }
};

template<class T>
using cf_ptr = std::unique_ptr<T, cf_deleter<T>>;

BOOST_CERTIFY_DECL bool
dump_cert(X509* cert, std::vector<unsigned char>& buffer)
{
    auto cert_len = ::i2d_X509(cert, nullptr);
    if (cert_len <= 0)
        return false;
    buffer.resize(cert_len);
    auto* b = buffer.data();
    ::i2d_X509(cert, &b);
    BOOST_ASSERT(b != nullptr);
    return true;
}

struct certs_vec
{
    certs_vec() = default;

    certs_vec(certs_vec const&) = delete;
    certs_vec(certs_vec&&) = delete;

    certs_vec& operator=(certs_vec&&) = delete;
    certs_vec& operator=(certs_vec const&) = delete;

    ~certs_vec()
    {
        for (auto ref : vec_)
            if (ref != nullptr)
                CFRelease(ref);
    }

    std::vector<void const*> vec_;
};

BOOST_CERTIFY_DECL bool
verify_certificate_chain(::X509_STORE_CTX* ctx)
{
    auto* const chain = ::X509_STORE_CTX_get_chain(ctx);
    auto const cert_count = sk_X509_num(chain);
    if (cert_count <= 0)
        return false;

    certs_vec cf_certs;
    std::vector<unsigned char> buffer;
    for (int i = 0; i < cert_count; ++i)
    {
        auto* const cert = sk_X509_value(chain, i);
        if (!detail::dump_cert(cert, buffer))
            return false;

        cf_ptr<CFDataRef> ref{CFDataCreateWithBytesNoCopy(
          nullptr, buffer.data(), buffer.size(), kCFAllocatorNull)};
        if (ref == nullptr)
            return false;

        cf_certs.vec_.push_back(nullptr);
        cf_certs.vec_.back() = SecCertificateCreateWithData(nullptr, ref.get());
        if (cf_certs.vec_.back() == nullptr)
            return false;
    }

    cf_ptr<CFArrayRef> cert_array{[&]() {
        auto* p = cf_certs.vec_.data();
        return CFArrayCreate(nullptr, p, cf_certs.vec_.size(), nullptr);
    }()};
    if (cert_array == nullptr)
        return false;

    // No need to pass hostname in - it's already verified by OpenSSL at this
    // point.
    cf_ptr<SecPolicyRef> policy{SecPolicyCreateSSL(true, /*hostname*/ nullptr)};

    OSStatus status;
    auto trust = [&]() -> cf_ptr<SecTrustRef> {
        SecTrustRef t = nullptr;
        status =
          SecTrustCreateWithCertificates(cert_array.get(), policy.get(), &t);
        return cf_ptr<SecTrustRef>{t};
    }();

    if (status != noErr)
        return false;

    return SecTrustEvaluateWithError(trust.get(), nullptr);
}

} // namespace detail
} // namespace certify
} // namespace boost

#endif // CERTIFY_TLS_DETAIL_KEYSTORE_APPLE
