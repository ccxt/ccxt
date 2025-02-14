using System.Text;
using System.Text.RegularExpressions;
using System.Globalization;
using System.Net;
using StarkSharp.StarkCurve.Signature;
using StarkSharp.Rpc.Utils;
using StarkSharp.StarkSharp.Base.StarkSharp.Hash;
using System.IO.Compression;
using System.Numerics;

namespace ccxt;

using dict = Dictionary<string, object>;

public partial class Exchange
{

    public Exchange(object userConfig2 = null)
    {
        var userConfig = (dict)userConfig2;
        this.initializeProperties(userConfig);
        var empty = new List<string>();
        transformApiNew(this.api);

        this.initHttpClient();

        this.afterConstruct();
    }

    private void initHttpClient()
    {
        var handler = new HttpClientHandler { AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate };
        if (this.httpProxy != null && this.httpProxy.ToString().Length > 0)
        {
            var proxy = new WebProxy(this.httpProxy.ToString());
            handler.Proxy = proxy;
            this.httpClient = new HttpClient(handler);
        }
        else if (this.httpsProxy != null && this.httpsProxy.ToString().Length > 0)
        {
            var proxy = new WebProxy(this.httpsProxy.ToString());
            handler.Proxy = proxy;
            this.httpClient = new HttpClient(handler);
        }
        else
        {
            this.httpClient = new HttpClient(handler);
        }
    }

    private void transformApiNew(dict api, List<string> paths = null)
    {
        if (api == null)
            return;
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
                    if (value is IList<object>)
                    {
                        // when endpoints are a list of string
                        endpoints = new List<string>();
                        var listValue = value as IList<object>;
                        foreach (var item in listValue)
                        {
                            endpoints.Add(item.ToString());
                        }
                    }
                }
                // var endpoints = new List<string>(dictValue.Keys);
                foreach (string endpoint in endpoints)
                {
                    double cost = 1;
                    if (dictValue != null)
                    {
                        var config = dictValue[endpoint];

                        if (config.GetType() == typeof(dict))
                        {
                            var dictConfig = config as dict;
                            var success = dictConfig.TryGetValue("cost", out var rl);
                            cost = success ? Convert.ToDouble(rl) : 1;
                        }
                        else
                        {
                            try
                            {
                                if (config != null)
                                {
                                    cost = Convert.ToDouble(config);
                                }
                            }
                            catch { }
                        }
                    }

                    // calculate the endpoint
                    // string input = string.Join("/", paths) + "/" + key + "/" + endpoint;
                    string pattern = @"[^a-zA-Z0-9]";
                    Regex rgx = new Regex(pattern);
                    var result = rgx.Split(endpoint);
                    // create unified endpoint name
                    var listKey = new List<string>() { key };
                    var pathParts = paths.Concat(listKey).Concat(result.Where(x => x.Length > 0));
                    var completePaths = pathParts.Select(x => char.ToUpper(x[0]) + x.Substring(1)).ToList();
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

    public void handleHttpStatusCode(object code, object reason, object url, object method, object body)
    {
        var codeString = code.ToString();
        var codeInHttpExceptions = safeValue(this.httpExceptions, codeString);
        if (codeInHttpExceptions != null)
        {
            var errorMessage = this.id + ' ' + method + ' ' + url + ' ' + codeString + ' ' + reason + ' ' + body;
            var Exception = NewException(codeInHttpExceptions as Type, errorMessage);
            throw Exception;
        }
    }

    public async virtual Task<object> fetch(object url2, object method2 = null, object headers2 = null, object body2 = null)
    {

        if (fetchResponse != null)
        {
            return fetchResponse;
        }

        var url = url2 as String;
        var method = method2 as String;
        var headers3 = headers2 as dict;
        var headers = this.extend(this.headers, headers3) as dict;
        var body = body2 as String;

        if (this.verbose)
            this.log("fetch Request:\n" + this.id + " " + method + " " + url + "\nRequestHeaders:\n" + this.stringifyObject(headers) + "\nRequestBody:\n" + this.json(body) + "\n");

        // to do: add all proxies support
        this.checkProxySettings();
        // add headers
        // httpClient.DefaultRequestHeaders.Accept.Clear();
        // httpClient.DefaultRequestHeaders.Clear();
        var headersList = new List<string>(headers.Keys);

        var contentType = "";
        // foreach (string key in headersList)
        // {

        //     if (key.ToLower() != "content-type")
        //     {
        //         httpClient.DefaultRequestHeaders.Add(key, headers[key].ToString());
        //     }
        //     else
        //     {
        //         // can't set content type header here, because it's part of the content
        //         // check: https://nzpcmad.blogspot.com/2017/07/aspnet-misused-header-name-make-sure.html
        //         contentType = headers[key].ToString();

        //     }
        // }

        var request = new HttpRequestMessage();
        request.RequestUri = new Uri(url);

        // set user agent
        if (this.userAgent != null && this.userAgent.Length > 0)
            request.Headers.Add("User-Agent", userAgent);

        // set headers
        foreach (string key in headersList)
        {
            if (key.ToLower() != "content-type")
            {
                request.Headers.Add(key, headers[key].ToString());
            }
            else
            {
                // can't set content type header here, because it's part of the content
                // check: https://nzpcmad.blogspot.com/2017/07/aspnet-misused-header-name-make-sure.html
                contentType = headers[key].ToString();
            }
        }
        var result = "";
        HttpResponseMessage response = null;
        object responseBody = null;
        try
        {
            if (method == "GET")
            {
                request.Method = HttpMethod.Get;
                response = await httpClient.SendAsync(request);
                result = await response.Content.ReadAsStringAsync();
            }
            else
            {
                contentType = contentType == "" ? "application/json" : contentType;
#if NET7_0_OR_GREATER
            var contentTypeHeader = new MediaTypeWithQualityHeaderValue(contentType);
#else
                var contentTypeHeader = contentType;
#endif

                var stringContent = body != null ? new StringContent(body, Encoding.UTF8, contentTypeHeader) : null;
                if (stringContent != null)
                {
                    stringContent.Headers.ContentType.CharSet = "";
                }
                request.Content = stringContent;

                if (method == "POST")
                {
                    // response = await this.httpClient.PostAsync(url, stringContent);
                    request.Method = HttpMethod.Post;
                    response = await this.httpClient.SendAsync(request);
                }
                else if (method == "PUT")
                {
                    request.Method = HttpMethod.Put;
                    response = await this.httpClient.SendAsync(request);
                    // response = await this.httpClient.PutAsync(url, stringContent);
                }
                else if (method == "DELETE")
                {
                    request.Method = HttpMethod.Delete;
                    response = await this.httpClient.SendAsync(request);
                    // response = await this.httpClient.DeleteAsync(url);
                }
                else if (method == "PUT")
                {
                    // response = await this.httpClient.PutAsync(url, stringContent);
                    request.Method = HttpMethod.Put;
                    response = await this.httpClient.SendAsync(request);
                }
                else if (method == "PATCH")
                {
                    // // workaround for the lack of putAsync
                    // // https://github.com/RicoSuter/NSwag/issues/107
                    // var methodInner = new HttpMethod("PATCH");
                    // var patchRequest = new HttpRequestMessage(methodInner, url)
                    // {
                    //     Content = stringContent
                    // };
                    request.Method = new HttpMethod("PATCH");
                    // response = await httpClient.SendAsync(patchRequest);
                    response = await httpClient.SendAsync(request);
                }

                var responseEncoding = response.Content.Headers.ContentEncoding;
                if (responseEncoding.Contains("gzip"))
                {
                    using var stream = await response.Content.ReadAsStreamAsync();
                    using var decompressedStream = new GZipStream(stream, CompressionMode.Decompress);
                    using var streamReader = new StreamReader(decompressedStream);
                    result = await streamReader.ReadToEndAsync();
                }
                else
                {
                    result = await response.Content.ReadAsStringAsync();
                }
            }

        }
        catch (Exception e)
        {
            if (e is HttpRequestException || e is WebException || e is HttpListenerException) // add more exceptions here
            {
                var errorMessage = this.id + ' ' + method + ' ' + url + ' ' + e.Message;
                throw new NetworkError(errorMessage);

            }
            throw e;
        }

        this.httpClient.DefaultRequestHeaders.Clear();

        var responseHeaders = response?.Headers.ToDictionary(x => x, y => y.Value.First());
        this.last_response_headers = responseHeaders;
        this.last_request_headers = headers;
        var httpStatusCode = (int)response?.StatusCode;
        var httpStatusText = response?.ReasonPhrase;

        if (this.verbose)
        {
            this.log("handleRestResponse:\n" + this.id + " " + method + " " + url + " " + httpStatusCode + " " + httpStatusText + "\nResponseHeaders:\n" + this.stringifyObject(responseHeaders) + "\nResponseBody:\n" + result + "\n");
        }

        try
        {
            responseBody = JsonHelper.Deserialize(result);
        }
        catch (Exception e)
        {
            responseBody = result; // if parsing fails, return the original result
        }

        var res = handleErrors(httpStatusCode, httpStatusText, url, method, responseHeaders, result, responseBody, headers, body);
        if (res == null)
            handleHttpStatusCode(httpStatusCode, httpStatusText, url, method, result);

        return responseBody;
    }

    // public async virtual Task<object> fetch2(string path, string api, string method, dict headers, dict body, dict parameters, dict config, dict context = null)
    // {
    //     if (this.enableRateLimit)
    //     {
    //         var cost = config["cost"]; // protect this call
    //         var now = this.milliseconds();
    //         await this.throttler.throttle(cost);
    //         var delay = this.milliseconds() - now;
    //         Console.WriteLine("throttle delay: " + delay);
    //     }
    //     this.lastRestRequestTimestamp = this.milliseconds();
    //     var request = this.sign(path, api, method, parameters, headers, body);
    //     return await fetch(request["url"] as String, request["method"] as String, request["headers"] as dict, request["body"] as dict);
    // }

    public object call(string implicitEndpoint, object parameters2)
    {
        var parameters = (dict)parameters2;
        if (this.transformedApi.TryGetValue(implicitEndpoint, out var info))
        {
            var endpointInfo = info as dict;
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
        if (this.transformedApi.TryGetValue(implicitEndpoint, out var info))
        {
            var endpointInfo = info as dict;
            var method = endpointInfo["method"] as String;
            var path = endpointInfo["path"] as String;
            var api = endpointInfo["api"];
            var cost = endpointInfo["cost"] != null ? endpointInfo["cost"] : 1;

            // return await this.fetch2(path, api, method, new dict(), new dict(), (dict)parameters, new dict { { "cost", cost } });
            // var res = await this.fetch2(path, api, method, parameters, new dict(), new dict(), new dict { { "cost", cost } });
            var res = await this.fetch2(path, api, method, parameters, new dict(), null, new dict { { "cost", cost } }); // body null here, does it make a difference?
            return res;

        }
        throw new Exception("Endpoint not found!");
    }


    public void handleErrors(int statusCode, string statusText, string url, string method, dict responseHeaders, dict responseBody, dict response, dict requestHeaders, dict requestBody)
    {
        // it is a stub method that must be virtuald in the derived exchange classes
        // throw new NotSupported (this.id + ' handleErrors() not implemented yet');
    }

    public int randNumber(int size)
    {
        Random random = new Random();
        string number = "";
        for (int i = 0; i < size; i++)
        {
            number += random.Next(0, 10);
        }
        return int.Parse(number);
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

    public virtual async Task<object> fetchMarkets(object parameters = null)
    {
        return this.toArray(this.markets);
    }

    public virtual async Task<object> fetchMarketsWs(object parameters = null)
    {
        return this.toArray(this.markets);
    }

    public virtual async Task<object> fetchCurrencies(object parameters = null)
    {
        return this.currencies;
    }

    public async Task<Currencies> FetchCurrencies(object parameters = null)
    {
        var res = await this.fetchCurrencies(parameters);
        return new Currencies(res);
    }

    public virtual async Task<object> fetchCurrenciesWs(object parameters = null)
    {
        return this.currencies;
    }

    public async Task<Currencies> FetchCurrenciesWs(object parameters = null)
    {
        var res = await this.fetchCurrenciesWs(parameters);
        return new Currencies(res);
    }

    public void log(object s)
    {
        Console.WriteLine((string)s);
    }

    public string totp(object a)
    {
        return "";
    }

    public List<string> unique(object obj)
    {
        return (obj as List<string>).ToList();
    }

    public int parseTimeframe(object timeframe2)
    {
        var timeframe = (string)timeframe2;
        var amount = Int32.Parse(timeframe.Substring(0, timeframe.Length - 1));
        var unit = timeframe.Substring(timeframe.Length - 1);
        int scale = 0;
        if (unit == "y")
        {
            scale = 60 * 60 * 24 * 365;
        }
        else if (unit == "M")
        {
            scale = 60 * 60 * 24 * 30;
        }
        else if (unit == "w")
        {
            scale = 60 * 60 * 24 * 7;
        }
        else if (unit == "d")
        {
            scale = 60 * 60 * 24;
        }
        else if (unit == "h")
        {
            scale = 60 * 60;
        }
        else if (unit == "m")
        {
            scale = 60;
        }
        else if (unit == "s")
        {
            scale = 1;
        }
        else
        {
            throw new Exception("Invalid timeframe: " + timeframe);
        }
        return amount * scale;
    }

    public async Task throttle(object cost)
    {
        await (await this.throttler.throttle(cost));
    }

    public object clone(object o)
    {
        return o;
    }

    // public virtual void setSandboxMode(object enable2)
    // {
    //     var enable = (bool)enable2;
    //     var urls = safeValue(this.urls, "api");
    //     var apiBackup = safeValue(this.urls, "apiBackup");
    //     if (enable)
    //     {
    //         var urlsDict = this.urls as dict;
    //         var test = safeValue(urlsDict, "test");
    //         var api = safeValue(urlsDict, "api");
    //         if (test != null)
    //         {
    //             if (api.GetType() == typeof(string))
    //             {
    //                 urlsDict["apiBackup"] = urls;
    //                 ((dict)this.urls)["api"] = test as dict;

    //             }
    //             else
    //             {
    //                 urlsDict["apiBackup"] = api;
    //                 ((dict)this.urls)["api"] = test; // clone here?
    //             }
    //         }
    //         else
    //         {
    //             throw new NotSupported("Sandbox mode is not supported by this exchange");

    //         }

    //     }
    //     else if (apiBackup != null)
    //     {
    //         if (api.GetType() == typeof(string))
    //         {
    //             api = apiBackup as dict;

    //         }
    //         else
    //         {
    //             api = apiBackup as dict; // clone this
    //         }
    //     }

    // }

    public void checkRequiredDependencies()
    {
        // stub to implement later
    }

    private async Task closeClient(string key, WebSocketClient client)
    {
        await client.Close();
        this.clients.TryRemove(key, out _);
    }

    public async Task Close()
    {
        var tasks = new List<Task>();
        if (this.clients.Keys.Count > 0)
        {
            foreach (var key in this.clients.Keys)
            {

                var client = this.clients[key];
                tasks.Add(closeClient(key, client));

            }
            await Task.WhenAll(tasks);
        }
    }

    public async Task close()
    {
        await this.Close();
    }

    public virtual object parseNumber(object value, object defaultValue = null)
    {
        if (value == null || (value.GetType() == typeof(string) && value.ToString().Trim() == ""))
            return defaultValue;


        try
        {
            return Convert.ToDouble(value, CultureInfo.InvariantCulture);
        }
        catch (Exception e)
        {
            return defaultValue;
        }
        // if (this.number.GetType() == typeof(float).GetType())
        // {
        //     return double.Parse(value.ToString(), CultureInfo.InvariantCulture);
        // }
        // return value;
    }

    public object convertToBigInt(object value)
    {
        if (value.GetType() == typeof(float).GetType())
        {
            return Convert.ToInt64(value);
        }
        return value;
    }

    public bool valueIsDefined(object value)
    {
        return value != null;
    }

    public object arraySlice(object array, object first, object second = null)
    {
        // to do; improve this implementation to handle ArrayCache (thread-safe) better
        var firstInt = Convert.ToInt32(first);

        if (array is byte[])
        {
            var byteArray = (byte[])array;
            if (second == null)
            {
                if (firstInt < 0)
                {
                    var index = byteArray.Length + firstInt;
                    index = index < 0 ? 0 : index;
                    return byteArray[index..].ToList();
                }
                return byteArray[firstInt..].ToList();
            }
            var secondInt2 = Convert.ToInt32(second);
            return byteArray[firstInt..secondInt2];
        }

        var parsedArray = ((IList<object>)array);
        var isArrayCache = array is ccxt.pro.ArrayCache;
        // var typedArray = (array is ArrayCache) ? (ArrayCache)array : (IList<object>array);
        if (second == null)
        {
            if (firstInt < 0)
            {
                var index = parsedArray.Count + firstInt;
                index = index < 0 ? 0 : index;

                if (isArrayCache)
                {
                    // we need to make sure our implementation of ToArray is called, otherwise
                    // it will call the default one that is not thread-safe
                    return (((array as ccxt.pro.ArrayCache).ToArray()[index..])).ToList();

                }
                else
                {
                    return (parsedArray.ToArray()[index..]).ToList();
                }
            }
            if (isArrayCache)
            {
                return ((array as ccxt.pro.ArrayCache).ToArray()[firstInt..]).ToList();
            }
            else
            {
                return (parsedArray.ToArray()[firstInt..]).ToList();

            }
        }
        var secondInt = Convert.ToInt32(second);
        if (isArrayCache)
        {
            return ((array as ccxt.pro.ArrayCache).ToArray()[firstInt..secondInt]).ToList();

        }
        else
        {
            return (parsedArray.ToArray()[firstInt..secondInt]).ToList();

        }
    }

    public object stringToCharsArray(object str)
    {
        var step = str.ToString().ToCharArray();
        var res = new List<string>();
        foreach (var item in step)
        {
            res.Add(item.ToString());
        }
        return res;
    }

    public Task sleep(object ms)
    {
        return Task.Delay(Convert.ToInt32(ms));
    }

    public void initThrottler() {
        this.throttler = new Throttler(this.tokenBucket);
    }

    public bool isEmpty(object a)
    {
        if (a == null)
            return true;
        if (a.GetType() == typeof(string))
            return a.ToString().Length == 0;
        if (a is IList<object>)
            return ((IList<object>)a).Count == 0;
        if (a is IDictionary<string, object>)
            return ((IDictionary<string, object>)a).Count == 0;
        return false;
    }

    public object retrieveStarkAccount(object signature, object accountClassHash, object accountProxyClassHash)
    {
        var signatureStr = signature.ToString();
        var accountClassHashStr = accountClassHash.ToString();
        var accountProxyClassHashStr = accountProxyClassHash.ToString();
        BigInteger privatekey = ECDSA.EthSigToPrivate(signatureStr);
        BigInteger publicKey = ECDSA.PrivateToStarkKey(privatekey);
        // compute address
        List<string> calldata = new List<string>{
            accountClassHash.ToString(),
            StarknetOps.CalculateFunctionSelector("initialize"),
            "2",
            publicKey.ToString("x"),
            "0",
        };
        BigInteger accountAddress = Address.ComputeStarknetAddress(
            accountProxyClassHash.ToString(),
            calldata,
            publicKey.ToString("x")
        );
        var account = createSafeDictionary();
        account["privateKey"] = privatekey.ToString("x");
        account["publicKey"] = add("0x", publicKey.ToString("x"));
        account["address"] = add("0x", accountAddress.ToString("x"));
        return account;
    }

    public object starknetSign(object msgHash, object privateKey)
    {
        var privateKeyString = privateKey.ToString().Replace("0x", "");
        var msgHashStr = msgHash.ToString().Replace("0x", "");
        var bigIntHash = BigInteger.Parse(msgHashStr, System.Globalization.NumberStyles.HexNumber);
        var bigIntKey = BigInteger.Parse(privateKeyString, System.Globalization.NumberStyles.HexNumber); ;
        var res = ECDSA.Sign(bigIntHash, bigIntKey);
        return this.json(new List<string> { res.R.ToString(), res.S.ToString() });
    }

    public object starknetEncodeStructuredData(object domain2, object messageTypes2, object messageData2, object address)
    {
        var domain = domain2 as IDictionary<string, object>;
        var messageTypes = messageTypes2 as IDictionary<string, object>;
        var messageTypesKeys = messageTypes.Keys.ToArray();
        var domainValues = domain.Values.ToArray();
        var domainTypes = new Dictionary<string, string>();
        var messageData = messageData2 as IDictionary<string, object>;

        var typeRaw = new TypedDataRaw(); // contains all domain + message info

        // infer types from values
        foreach (var key in domain.Keys)
        {
            // var type = domainValue.GetType();
            var domainValue = domain[key];
            if (domainValue is string && (domainValue as string).StartsWith("0x"))
                domainTypes.Add(key, "address");
            else if (domainValue is string)
                domainTypes.Add(key, "string");
            else
                domainTypes.Add(key, "uint256"); // handle other use cases later
        }

        var types = new Dictionary<string, MemberDescription[]>();

        // fill in domain types
        var domainTypesDescription = new List<MemberDescription> { };
        var domainValuesArray = new List<MemberValue> { };
        var sip12Domain = new List<object[]> { };
        sip12Domain.Add(new object[]{
                "name",
                "felt"
        });
        sip12Domain.Add(new object[]{
                "chainId",
                "felt"
        });
        sip12Domain.Add(new object[]{
                "version",
                "felt"
        });
        foreach (var d in sip12Domain)
        {
            var key = d[0] as string;
            var type = d[1] as string;
            for (var i = 0; i < domain.Count; i++)
            {
                if (String.Equals(key, domain.Keys.ElementAt(i)))
                {
                    var value = domainValues[i];
                    var memberDescription = new MemberDescription();
                    memberDescription.Name = key;
                    memberDescription.Type = type;
                    domainTypesDescription.Add(memberDescription);

                    var memberValue = new MemberValue();
                    memberValue.TypeName = type;
                    memberValue.Value = value;
                    domainValuesArray.Add(memberValue);
                }
            }
        }
        types["StarkNetDomain"] = domainTypesDescription.ToArray();
        typeRaw.DomainRawValues = domainValuesArray.ToArray();

        // fill in message types
        var messageTypesDict = new Dictionary<string, string>();
        var typeName = messageTypesKeys[0];
        var messageTypesContent = messageTypes[typeName] as IList<object>;
        var messageTypesDescription = new List<MemberDescription> { };
        for (var i = 0; i < messageTypesContent.Count; i++)
        {
            var elem = messageTypesContent[i] as IDictionary<string, object>; // {\"name\":\"source\",\"type\":\"string\"}
            var name = elem["name"] as string;
            var type = elem["type"] as string;
            messageTypesDict[name] = type;
            // var key = messageTypesContent.Keys.ElementAt(i);
            // var value = messageTypesContent.Values.ElementAt(i);
            var member = new MemberDescription();
            member.Name = name;
            member.Type = type;
            messageTypesDescription.Add(member);
        }
        types[typeName] = messageTypesDescription.ToArray();

        // fill in message values
        var messageValues = new List<MemberValue> { };
        for (var i = 0; i < messageData.Count; i++)
        {

            var key = messageData.Keys.ElementAt(i);// for instance source
            var type = messageTypesDict[key];
            var value = messageData.Values.ElementAt(i); // 1
            var member = new MemberValue();
            member.TypeName = type;
            member.Value = value;
            messageValues.Add(member);
        }
        typeRaw.Message = messageValues.ToArray();
        typeRaw.Types = types;
        typeRaw.PrimaryType = typeName;

        var encodedFromRaw = new TypedData().EncodeTypedDataRaw((typeRaw), address);

        return encodedFromRaw;
    }

    public ECDSA.ECSignature Stark()
    {
        // debug only remove later
        var msgHash = "111111";
        var bytes = Exchange.StringToByteArray(msgHash);
        var bigInt = new BigInteger(bytes);
        var res = ECDSA.Sign(bigInt, bigInt);
        return res;
    }

    public object spawn(object action, object[] args = null)
    {
        // stub to implement later
        // var task = Task.Run(() => DynamicInvoker.InvokeMethod(action, args));
        // task.Wait();
        // return task.Result;
        // var res = DynamicInvoker.InvokeMethod(action, args);
        // return res;
        var future = new Future();
        Task.Run(() =>
        {
            try
            {
                var invokedAction = DynamicInvoker.InvokeMethod(action, args);
                if (invokedAction is Task<object>)
                {
                    var res = (Task<object>)invokedAction;
                    res.Wait();
                    future.resolve(res.Result);
                    return;
                }
                if (invokedAction is Task)
                {
                    var task = invokedAction as Task;
                    task.Wait();
                    future.resolve(task);
                    return;
                }

            }
            catch (Exception e)
            {
                future.reject(e);
            }
        });
        return future;
    }

    public void delay(object timeout2, object methodName, object[] args = null)
    {
        Task.Delay(Convert.ToInt32(timeout2)).ContinueWith((t) => spawn(methodName, args));
    }
    public void setProperty(object obj, object property, object defaultValue = null)
    {
        var type = obj.GetType();
        var prop = type.GetProperty(property.ToString());
        if (prop != null)
        {
            prop.SetValue(obj, defaultValue);
        }
    }
    public object getProperty(object obj, object property, object defaultValue = null)
    {
        var type = obj.GetType();
        var prop = type.GetProperty(property.ToString());
        return (prop != null) ? prop.GetValue(obj) : defaultValue;
    }

    public object fixStringifiedJsonMembers(object content2)
    {
        var content = (string)content2;
        var modified = content.Replace('\\', ' ');
        modified = modified.Replace("\"{", "{");
        modified = modified.Replace("}\"", "}");
        return modified;
    }

    /// <summary>
    /// Returns the market object for a given market symbol.
    /// </summary>
    /// <remarks>
    /// <list type="table">
    /// <item>
    /// <term>market</term>
    /// <description>
    /// string : the market symbol, example: BTC/USD
    /// </description>
    /// </item>
    /// </list>
    /// </remarks>
    /// <returns> <term>Market</term>Market structure </returns>
    public Market Market(string market)
    {
        var genericMarket = this.market(market);
        return new Market(genericMarket);
    }

    /// <summary>
    /// Returns the Currency object for a given market symbol.
    /// </summary>
    /// <remarks>
    /// <list type="table">
    /// <item>
    /// <term>market</term>
    /// <description>
    /// string : the currency code, example: BTC
    /// </description>
    /// </item>
    /// </list>
    /// </remarks>
    /// <returns> <term>Currency</term>Market structure </returns>

    public Currency Currency(string currency)
    {
        var genericCurrency = this.currency(currency);
        return new Currency(genericCurrency);
    }

    /// <summary>
    /// Returns a dictionary of market objects for all markets.
    /// </summary>
    /// <remarks>
    /// </remarks>
    /// <returns> <term>Dictionary</term>string, MarketInterface</returns>
    public async Task<Dictionary<string, MarketInterface>> LoadMarkets()
    {
        var res = await this.loadMarkets();
        var dictRest = res as Dictionary<string, object>;
        var returnRest = new Dictionary<string, MarketInterface>();
        foreach (var item in dictRest)
        {
            returnRest.Add(item.Key, new MarketInterface(item.Value));
        }
        return returnRest;
        // return ((IList<object>)res).Select(item => new MarketInterface(item)).ToList<MarketInterface>();
    }

    public string randomBytes(object length2)
    {
        var length = Convert.ToInt32(length2);
        var bytes = new byte[length];
        var rng = new Random();
        rng.NextBytes(bytes);
        return Convert.ToBase64String(bytes);
    }

    public void extendExchangeOptions(object options2)
    {
        var options = (dict)options2;
        var extended = this.extend(this.options, options);
        this.options = new System.Collections.Concurrent.ConcurrentDictionary<string, object>(extended);
    }

    public IDictionary<string, object> createSafeDictionary()
    {
        return new System.Collections.Concurrent.ConcurrentDictionary<string, object>();
    }
    public class DynamicInvoker
    {
        public static object InvokeMethod(object action, object[] parameters)
        {
            // var methodName = (string)methodName2;
            // // Assuming the method is in the current class for simplicity
            // MethodInfo methodInfo = typeof(DynamicInvoker).GetMethod(methodName);

            // if (methodInfo != null)
            // {
            //     Delegate methodDelegate = Delegate.CreateDelegate(typeof(Action), methodInfo);
            //     methodDelegate.DynamicInvoke(parameters);
            // }
            // else
            // {
            //     throw new Exception("Method not found.");
            // }
            Delegate myDelegate = action as Delegate;

            // Get parameter types
            // MethodInfo methodInfo = myDelegate.Method;
            // ParameterInfo[] parametersAux = methodInfo.GetParameters();

            // Prepare arguments (in a real scenario, these would be dynamically determined)
            // object[] args = new object[parametersAux.Length];
            // args[0] = 123; // Assuming the first parameter is an int
            // args[1] = "Hello"; // Assuming the second parameter is a string

            // Dynamically invoke the action
            var result = myDelegate.DynamicInvoke(parameters);
            return result;
        }
    }

}

public static class BoolExtensions
{
    public static string ToString(this bool _bool)
    {
        return _bool.ToString().ToLowerInvariant();
    }
}
