#include <httpsClass.h>
#include <boost/asio.hpp>
#include <boost/asio/spawn.hpp>

using namespace std::chrono_literals;
namespace net   = boost::asio;
namespace beast = boost::beast;
namespace http  = beast::http;
namespace ssl   = net::ssl;
using net::ip::tcp;

std::future<httpsClass::Response>
httpsClass::performRequest(Request const& request)
{
    std::promise<Response> promise;
    auto fut = promise.get_future();

    auto coro = [this, r = request, p = std::move(promise)] //
        (net::yield_context yield) mutable {
            try {
                auto& s = *ssl_stream_;
                get_lowest_layer(s).expires_after(kTimeout);

                r.prepare_payload();
                r.set(http::field::host, host_);

                auto sent = http::async_write(s, r, yield);

                http::response<http::dynamic_body> res;
                auto received = http::async_read(s, buffer_, res, yield);
                p.set_value(std::move(res));
            } catch (...) {
                p.set_exception(std::current_exception());
            }
        };

    spawn(ssl_stream_->get_executor(), std::move(coro));
    return fut;
}
