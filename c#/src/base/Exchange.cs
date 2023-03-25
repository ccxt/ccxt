using System.Net.Http.Headers;
using System.Text.Json.Serialization;
using System.Text;
using System.Text.Json;
using System;
using System.Collections.Generic;
using System.Net.NetworkInformation;
using System.Net.Http;
using System.Threading.Tasks;
using System.Text.RegularExpressions;
using Newtonsoft.Json.Linq;
// using Json.Net;
// using Newtonsoft.Json;

namespace Main;

using dict = Dictionary<string, object>;

public partial class Exchange
{
    public HttpClient client { get; set; } = new HttpClient();
    public string id { get; set; } = "Exchange";

    public string version { get; set; } = "";
    public string userAgent { get; set; }
    public bool verbose { get; set; } = true;
    public bool enableRateLimit { get; set; } = true;
    public long lastRestRequestTimestamp { get; set; } = 0;
    public string url { get; set; } = "";

    public string hostname { get; set; } = "";

    public dict baseCurrencies { get; set; } = new dict();

    // public dict currencies  { get; set; } = new dict();

    public bool reloadingMarkets { get; set; } = false;

    public Task<object> marketsLoading { get; set; } = null;

    public dict quoteCurrencies { get; set; } = new dict();

    public dict api { get; set; } = new dict();

    public dict transformedApi { get; set; } = new dict();

    public bool reduceFees { get; set; } = false;

    public dict markets_by_id { get; set; } = null;

    public List<string> symbols { get; set; } = new List<string>();

    public List<string> codes { get; set; } = new List<string>();

    public List<string> ids { get; set; } = new List<string>();

    public bool substituteCommonCurrencyCodes { get; set; } = false;

    public dict commonCurrencies { get; set; } = new dict();

    public object limits { get; set; } = new dict();

    public string precisionMode { get; set; } = "SIGNIFICANT_DIGITS";

    public object currencies_by_id { get; set; } = new dict();

    public object accounts { get; set; } = new dict();

    public object accountsById { get; set; } = new dict();

    public object status { get; set; } = new dict();

    public int paddingMode { get; set; } = 0;

    public object number { get; set; }

    public Exchange()
    {
        this.initializeProperties();
        var empty = new List<string>();
        transformApiNew(this.api);
        // Console.WriteLine(this.transformedApi);
    }

    // private void transformApi(dict api, List<string> paths = null)
    // {
    //     paths ??= new List<string>();
    //     List<string> keyList = new List<string>(api.Keys);
    //     foreach (string key in keyList)
    //     {
    //         var value = api[key];
    //         if (value.GetType() == typeof(dict))
    //         {
    //             var dictValue = value as dict;

    //             if (dictValue.GetValueOrDefault("cost") != null)
    //             {
    //                 // handle cenarios like this: 
    //                 // binance: 'continuousKlines': { 'cost': 1, 'byLimit': [ [ 99, 1 ], [ 499, 2 ], [ 1000, 5 ], [ 10000, 10 ] ] }
    //                 // duplicated for now:
    //                 if (isHttpMethod(key))
    //                 {
    //                     string input = string.Join("/", paths) + "/" + key;
    //                     string pattern = @"[^a-zA-Z0-9]";
    //                     Regex rgx = new Regex(pattern);
    //                     var result = rgx.Split(input);
    //                     // create unified endpoint name
    //                     var completePaths = result.Select(x => char.ToUpper(x[0]) + x.Substring(1)).ToList();
    //                     var path = string.Join("", completePaths);
    //                     path = char.ToLower(path[0]) + path.Substring(1); // lowercase first letter
    //                     this.transformedApi[path] = new dict {
    //                         { "method", paths.Last().ToUpper() },
    //                         { "path",   key },
    //                         { "api",    paths[paths.Count-2]},
    //                         { "cost",   dictValue.GetValueOrDefault("cost")}
    //                     };
    //                 }
    //             }
    //             else
    //             {
    //                 paths.Add(key);
    //                 transformApi(dictValue, paths);
    //             }
    //         }
    //         else
    //         {
    //             if (isHttpMethod(paths.Last()))
    //             {
    //                 string input = string.Join("/", paths) + "/" + key;
    //                 string pattern = @"[^a-zA-Z0-9]";
    //                 Regex rgx = new Regex(pattern);
    //                 var result = rgx.Split(input);
    //                 // create unified endpoint name
    //                 var completePaths = result.Select(x => char.ToUpper(x[0]) + x.Substring(1)).ToList();
    //                 var path = string.Join("", completePaths);
    //                 path = char.ToLower(path[0]) + path.Substring(1); // lowercase first letter
    //                 this.transformedApi[path] = new dict {
    //                     { "method", paths.Last().ToUpper() },
    //                     { "path",   key },
    //                     { "api",    paths[paths.Count-2]},
    //                     { "cost",   value}
    //                 };
    //             }
    //         };
    //     }
    // }

    private void transformApiNew(dict api, List<string> paths = null)
    {
        paths ??= new List<string>();
        List<string> keyList = new List<string>(api.Keys);
        foreach (string key in keyList)
        {
            var value = api[key];

            if (isHttpMethod(key))
            {
                var dictValue = value as dict;
                List<string> endpoints = null;
                if (dictValue != null)
                {
                    endpoints = new List<string>(dictValue.Keys);
                }
                else
                {
                    if (value.GetType() == typeof(List<object>))
                    {
                        // when endpoints are a list of string
                        endpoints = new List<string>();
                        var listValue = value as List<object>;
                        foreach (var item in listValue)
                        {
                            endpoints.Add(item.ToString());
                        }
                    }
                }
                // var endpoints = new List<string>(dictValue.Keys);
                foreach (string endpoint in endpoints)
                {
                    var cost = 1;
                    if (dictValue != null)
                    {
                        var config = dictValue[endpoint];

                        if (config.GetType() == typeof(dict))
                        {
                            var dictConfig = config as dict;
                            var rawCost = dictConfig.GetValueOrDefault("cost");
                            cost = rawCost != null ? Convert.ToInt32(rawCost) : 1;
                        }
                        else
                        {
                            cost = (int)cost;
                        }
                    }

                    // calculate the endpoint
                    string input = string.Join("/", paths) + "/" + key + "/" + endpoint;
                    string pattern = @"[^a-zA-Z0-9]";
                    Regex rgx = new Regex(pattern);
                    var result = rgx.Split(input);
                    // create unified endpoint name
                    var completePaths = result.Where(x => x.Length > 0).Select(x => char.ToUpper(x[0]) + x.Substring(1)).ToList();
                    var path = string.Join("", completePaths);
                    path = char.ToLower(path[0]) + path.Substring(1); // lowercase first letter
                    var apiObj = paths.Count > 1 ? (object)paths : paths[0];
                    this.transformedApi[path] = new dict {
                            { "method", key.ToUpper() },
                            { "path",   endpoint },
                            { "api",    apiObj},
                            { "cost",  cost}
                        };
                }
            }
            else
            {
                transformApiNew((dict)value, paths.Concat(new List<string> { key }).ToList());
            }
        }
    }

    public async virtual Task<object> fetch(object url2, object method2, object headers2, object body2)
    {
        var url = url2 as String;
        var method = method2 as String;
        var headers = headers2 as dict;
        var body = body2 as String;

        if (this.verbose)
            this.log("fetch Request:\n" + this.id + " " + method + " " + url + "\nRequestHeaders:\n" + this.stringifyObject(headers) + "\nRequestBody:\n" + this.stringifyObject(body) + "\n");

        // add headers
        client.DefaultRequestHeaders.Accept.Clear();
        var headersList = new List<string>(headers.Keys);

        var contentType = "";
        foreach (string key in headersList)
        {

            if (key != "Content-Type")
            {
                client.DefaultRequestHeaders.Add(key, headers[key].ToString());
            }
            else
            {
                // can't set content type header here, because it's part of the content
                // check: https://nzpcmad.blogspot.com/2017/07/aspnet-misused-header-name-make-sure.html
                contentType = headers[key].ToString();

            }
        }
        // user agent
        if (this.userAgent != null && this.userAgent.Length > 0)
            client.DefaultRequestHeaders.Add("User-Agent", userAgent);


        var result = "";
        HttpResponseMessage response = null;
        try
        {
            if (method == "GET")
            {
                response = await this.client.GetAsync(url);
                result = await response.Content.ReadAsStringAsync();
            }
            else if (method == "POST")
            {
                contentType = contentType == "" ? "application/json" : contentType;
                var contentTypeHeader = new MediaTypeWithQualityHeaderValue(contentType);
                // var stringContent = new StringContent(System.Text.Json.JsonSerializer.Serialize(body), Encoding.UTF8, contentTypeHeader);
                var stringContent = new StringContent(body, Encoding.UTF8, contentTypeHeader);
                response = await this.client.PostAsync(url, stringContent);
                result = await response.Content.ReadAsStringAsync();
            }

            var responseHeaders = response?.Headers.ToDictionary(x => x, y => y.Value.First());
            var httpStatusCode = response?.StatusCode;
            var httpStatusText = response?.ReasonPhrase;

            if (this.verbose)
            {
                this.log("handleRestResponse:\n" + this.id + method + url + " " + httpStatusCode + " " + httpStatusText + "\nResponseHeaders:\n" + this.stringifyObject(responseHeaders) + "\nResponseBody:\n" + result + "\n");
            }

            // handleErrors(httpStatusCode, httpStatusText, url, method, headers, body, result);

        }
        catch (Exception e)
        {
            Console.WriteLine(e);
        }

        var converted = JsonHelper.Deserialize(result);
        return converted;
    }

    public async virtual Task<object> fetch2(string path, string api, string method, dict headers, dict body, dict parameters, dict config, dict context = null)
    {
        if (this.enableRateLimit)
        {
            var cost = config["cost"]; // protect this call
            // await this.throttle();
        }
        this.lastRestRequestTimestamp = this.milliseconds();
        var request = this.sign(path, api, method, parameters, headers, body);
        return await fetch(request["url"] as String, request["method"] as String, request["headers"] as dict, request["body"] as dict);
    }

    public object call(string implicitEndpoint, object parameters2)
    {
        var parameters = (dict)parameters2;
        if (this.transformedApi.GetValueOrDefault(implicitEndpoint) != null)
        {
            var endpointInfo = this.transformedApi[implicitEndpoint] as dict;
            var method = endpointInfo["method"] as String;
            var path = endpointInfo["path"] as String;
            var api = endpointInfo["api"] as String;
            var cost = endpointInfo["cost"] != null ? endpointInfo["cost"] : 1;

            // return await this.fetch2(path, api, method, new dict(), new dict(), parameters, new dict { { "cost", cost } });

        }
        throw new Exception("Endpoint not found!");
    }

    public async virtual Task<object> callAsync(object implicitEndpoint2, object parameters = null)
    {
        parameters ??= new Dictionary<string, object>();
        var implicitEndpoint = (string)implicitEndpoint2;
        if (this.transformedApi.GetValueOrDefault(implicitEndpoint) != null)
        {
            var endpointInfo = this.transformedApi[implicitEndpoint] as dict;
            var method = endpointInfo["method"] as String;
            var path = endpointInfo["path"] as String;
            var api = endpointInfo["api"];
            var cost = endpointInfo["cost"] != null ? endpointInfo["cost"] : 1;

            // return await this.fetch2(path, api, method, new dict(), new dict(), (dict)parameters, new dict { { "cost", cost } });
            return await this.fetch2(path, api, method, (dict)parameters, new dict(), new dict(), new dict { { "cost", cost } });

        }
        throw new Exception("Endpoint not found!");
    }


    public void handleErrors(int statusCode, string statusText, string url, string method, dict responseHeaders, dict responseBody, dict response, dict requestHeaders, dict requestBody)
    {
        // it is a stub method that must be virtuald in the derived exchange classes
        // throw new NotSupported (this.id + ' handleErrors() not implemented yet');
    }


    public virtual dict sign(object path, object api, string method = "GET", dict headers = null, object body2 = null, object parameters2 = null)
    {
        api ??= "public";
        headers ??= new dict();
        body2 ??= new dict();
        parameters2 ??= new dict();

        var body = (dict)body2;
        var parameters = (dict)parameters2;

        var url = this.url;
        if (((string)api) == "public")
        {
            if (parameters.Keys.Count > 0)
                url += path + "?" + this.urlencode(parameters);
        }

        return new dict {
            { "url", this.url + path },
            { "method", method },
            { "headers", headers },
            { "body", body },
        };
    }

    public Int64 seconds()
    {
        double res = (DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1)).TotalSeconds);
        return Convert.ToInt64(res);
    }

    public async virtual Task<object> loadMarketsHelper(bool reload = false, dict parameters = null)
    {
        if (!reload && this.markets != null)
        {
            if (this.markets_by_id == null)
            {
                return this.setMarkets(this.markets);
            }
            // return Task.FromResult(this.markets);
            return this.markets;
        }

        object currencies = null;
        var has = this.has as dict;
        if (has["fetchCurrencies"] != null)
        {
            currencies = await this.fetchCurrencies();
        }
        var markets = await this.fetchMarkets();
        return this.setMarkets(markets, currencies);
    }

    public virtual Task<object> loadMarkets(object reload2 = null, object parameters2 = null)
    {
        // parameters ??= new dict();
        // await fetch("", "", new dict(), new dict());
        // return new dict();
        reload2 ??= false;
        var reload = (bool)reload2;
        parameters2 ??= new dict();
        var parameters = (dict)parameters2;
        if ((reload && !this.reloadingMarkets) || this.marketsLoading == null)
        {
            this.reloadingMarkets = true;
            this.marketsLoading = (this.loadMarketsHelper(reload, parameters).ContinueWith((t) =>
            {
                this.reloadingMarkets = false;
                return t.Result;
            }));
        }

        return marketsLoading;
    }

    public async virtual Task loadTimeDifference()
    {
        // var response = await this.fetch2("", "", "", new dict(), new dict(), new dict(), new dict());
        // this.options["timeDifference"] = this.milliseconds() - this.parse8601(response["iso8601"] as String);
    }

    public virtual async Task<object> fetchMarkets(object parameters = null)
    {
        return this.toArray(this.markets);
    }

    public virtual async Task<object> fetchCurrencies(object parameters = null)
    {
        return this.currencies;
    }

    public void log(string s)
    {
        Console.WriteLine(s);
    }

    public string totp(object a)
    {
        return "";
    }

    public bool checkAddress(object address)
    {
        return true;
    }

    public string parseTimeframe(object timeframe)
    {

        // var x = this.teste(1, 2, 3, 3);
        return ""; // stub
    }

    public async Task throttle(object cost)
    {
        return;
    }

    public string stringifyObject(object d2)
    {
        var output = "";

        if (d2 == null)
            return output;

        if (d2.GetType() == typeof(dict))
        {
            var d = (dict)d2;
            if (d == null)
                return output;

            foreach (var key in d.Keys)
            {
                output += key + ", " + d[key] + "\n";
            }
            return output;
        }
        else if (d2.GetType() == typeof(List<object>))
        {
            var d = (List<object>)d2;
            if (d == null)
                return output;

            foreach (var key in d)
            {
                output += key + "\n";
            }
            return output;
        }

        return (string)output;

    }

    public virtual void setSandboxMode(object enable)
    {
        // this.enableRateLimit = enable;
        // this.enableRateLimit = true;
        // stub implement later
    }

    public void throwDynamicException(object broad, object str, object message)
    {
        //stub to implement later
    }

    public void checkRequiredDependencies()
    {
        // stub to implement later
    }


}
