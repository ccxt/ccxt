#ifndef BOOST_CERTIFY_EXTENSIONS_HPP
#define BOOST_CERTIFY_EXTENSIONS_HPP

#include <boost/certify/detail/config.hpp>

#include <boost/asio/ssl/stream.hpp>
#include <boost/utility/string_view.hpp>

namespace boost
{
namespace certify
{

template<class AsyncStream>
string_view
sni_hostname(asio::ssl::stream<AsyncStream> const& stream);

template<class AsyncStream>
void
sni_hostname(asio::ssl::stream<AsyncStream>& stream,
             std::string const& hostname,
             system::error_code& ec);

template<class AsyncStream>
void
sni_hostname(asio::ssl::stream<AsyncStream>& stream,
             std::string const& hostname);

} // namespace certify
} // namespace boost

#include <boost/certify/impl/extensions.hpp>
#endif // BOOST_CERTIFY_EXTENSIONS_HPP
