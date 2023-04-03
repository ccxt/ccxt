#ifndef BOOST_CERTIFY_STATUS_CACHE_HPP
#define BOOST_CERTIFY_STATUS_CACHE_HPP

#include <mutex>
#include <string>
#include <unordered_map>

namespace boost
{
namespace certify
{

enum class certificate_status
{
    valid,
    revoked,
    unknown
};

class status_cache
{
public:
    using clock_type = std::chrono::system_clock;
    using time_point = std::chrono::system_clock::time_point;

    certificate_status check(std::string const& spki) const
    {
        std::lock_guard<std::mutex> guard{mtx_};
        auto it = status_cache_.find(spki);
        if (it == status_cache_.end())
            return certificate_status::unknown;
        if (it->second.valid_until <= clock_type::now())
            return certificate_status::unknown;

        return it->second.status;
    }

    void mark_valid(std::string const& spki, time_point valid_until)
    {
        std::lock_guard<std::mutex> guard{mtx_};
        auto& value = status_cache_[spki];
        if (value.status == certificate_status::revoked ||
            valid_until <= clock_type::now())
            return;

        value.status = certificate_status::valid;
        value.valid_until = valid_until;
    }

    void revoke(std::string const& spki)
    {
        std::lock_guard<std::mutex> guard{mtx_};
        auto& value = status_cache_[spki];
        value.status = certificate_status::revoked;
        value.valid_until = time_point::max();
    }

private:
    struct value
    {
        time_point valid_until{time_point::min()};
        certificate_status status{certificate_status::unknown};
    };

    std::unordered_map<std::string, value> status_cache_;
    mutable std::mutex mtx_;
};
} // namespace certify
} // namespace boost

#endif // BOOST_CERTIFY_STATUS_CACHE_HPP
