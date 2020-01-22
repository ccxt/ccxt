'use strict';

const WsClient = require ('./WsClient')

module.exports = class SignalRClient extends WsClient {

    // todo: implement signalr

}

/*

// signalr-client
//By: [Matthew Whited](mailto:matt@whited.us?subject=signalr-client)  (c) 2018
// v0.0.17

//modifications made to add support for https/wss By: Anthony DiPierro

//TODO: Fix HTTPS Proxy
// https://newspaint.wordpress.com/2012/11/05/node-js-http-and-https-proxy/
// ~Vincent Miceli
//TODO: consider changing binding/start order

var url = require('url'),
    querystring = require('querystring'),
    http = require('http'),
    https = require('https'),
    WebSocketClient = require('websocket').client; // https://github.com/Worlize/WebSocket-Node

var states = {
    connection: {
        unbound: 0,
        bound: 1,
        connecting: 2,
        connected: 3,
        disconnecting: 4,
        disconnected: 5,
        connectFailed: 6,
        errorOccured: 7,
        retryingConnection: 8,
        bindingError: 9,
        retryingFailed: 10,
    },
    getConnection: function (code) {
        for (value in states.connection) {
            if (states.connection[value] == code)
                return value;
        }        ;
        return undefined;
    }
};

function toCleanHubNames(hubNames) {
    var res = [], o = 0;

    if (hubNames.length && hubNames.length > 0) {
        for (var i = 0; i < hubNames.length; i++) {
            var p = hubNames[i];
            if (typeof p === "string") {
                res[o++] = { name: p.toLowerCase() };
            }
        }
    }

    return res;
}

function removeUndefinedProperties(obj) {
    if (obj) {
        for (var propName in obj) {
            if (typeof obj[propName] == "undefined") {
                delete obj[propName];
            }
        }
    }
}
function mergeFrom(target, source) {
    target = target || {};

    if (source) {
        for (var propName in source) {
            target[propName] = source[propName];
        }
    }
    else {
        target = {};
    }
}

function negotiateProxies(baseUrl, hubNames, onSuccess, onError, _client) {

    var cleanedHubs = toCleanHubNames(hubNames);
    if (!cleanedHubs || cleanedHubs.length < 1) {
        onError('you must define at least one hub name and they must be typeof string');
        return;
    }

    var negotiateData = "";
    var negotiateUrl = baseUrl + "/negotiate?" + querystring.stringify({
        connectionData: JSON.stringify(cleanedHubs),
        clientProtocol: 1.5
    });
    var negotiateUrlOptions = url.parse(negotiateUrl, true);

    var negotiateFunction = function (res) {
        res.on('data', function (chunk) {
            negotiateData += chunk;
        });
        res.on('end', function (endRes) {
            try {
                if (res.statusCode == 200) {
                    var negotiateObj = JSON.parse(negotiateData);
                    negotiateObj.Hubs = cleanedHubs;
                    onSuccess(negotiateObj);
                } else if (res.statusCode == 401 || res.statusCode == 302) {
                    if (_client.serviceHandlers.onUnauthorized) {
                        _client.serviceHandlers.onUnauthorized(res);
                    } else {
                        onError('Negotiate Unauthorized', undefined, res.statusCode);
                    }
                } else {
                    onError('Negotiate Unknown', undefined, res.statusCode);
                }
            } catch (e) {
                onError('Parse Error', e, negotiateData);
            }
        });
        res.on('error', function (e) {
            _client.connection.state = states.connection.bindingError;
            if (_client.serviceHandlers.bindingError) {
                _client.serviceHandlers.bindingError(e);
            } else {
                onError('HTTP Error', e);
            }
        });
    };
    var negotiateErrorFunction = function (e) {
        _client.connection.state = states.connection.bindingError;
        if (_client.serviceHandlers.bindingError) {
            _client.serviceHandlers.bindingError(e);
        } else {
            onError('HTTP Negotiate Error', e);
        }
    };

    if (negotiateUrlOptions.headers === undefined) {
        negotiateUrlOptions.headers = {};
    }
    if (_client.headers) {
        for (var propName in _client.headers) {
            negotiateUrlOptions.headers[propName] = _client.headers[propName];
        }
    }

    if (_client.proxy && _client.proxy.host && _client.proxy.port) {
        negotiateUrlOptions.path = negotiateUrlOptions.protocol + '//' + negotiateUrlOptions.host + negotiateUrlOptions.path;
        negotiateUrlOptions.headers.host = negotiateUrlOptions.host;
        negotiateUrlOptions.host = _client.proxy.host;
        negotiateUrlOptions.port = _client.proxy.port;
    }

    if (negotiateUrlOptions.protocol === 'http:') {
        var negotiateResult = http.get(negotiateUrlOptions, negotiateFunction).on('error', negotiateErrorFunction);
    } else if (negotiateUrlOptions.protocol === 'wss:') {
        negotiateUrlOptions.protocol = 'https:';
        var negotiateResult = https.get(negotiateUrlOptions, negotiateFunction).on('error', negotiateErrorFunction);
    } else {
        onError('Protocol Error', undefined, negotiateUrlOptions);
    }
}

function getBindings(baseUrl, hubNames, onSuccess, onError, _client) {
    negotiateProxies(baseUrl, hubNames, function (negotiatedOptions) {

        if (!negotiatedOptions.TryWebSockets) {
            onError('This client only supports websockets', undefined, negotiatedOptions);
            return;
        }

        //negotiatedOptions.Url	                    "/signalr"	        String
        //negotiatedOptions.ProtocolVersion	        "1.2"	            String
        //negotiatedOptions.TryWebSockets	        true	            Boolean
        //negotiatedOptions.ConnectionToken	        "..."	            String
        //negotiatedOptions.ConnectionId	        "..."	            String
        //negotiatedOptions.Hubs                    [{name: "..."}]     Array
        //negotiatedOptions.KeepAliveTimeout	    20	                Number
        //negotiatedOptions.DisconnectTimeout	    30	                Number
        //negotiatedOptions.TransportConnectTimeout	5	                Number

        onSuccess({
            url: baseUrl,
            connection: {
                token: negotiatedOptions.ConnectionToken,
                id: negotiatedOptions.ConnectionId
            },
            timeouts: {
                keepAlive: negotiatedOptions.KeepAliveTimeout,
                disconnect: negotiatedOptions.DisconnectTimeout,
                connect: negotiatedOptions.TransportConnectTimeout
            },
            hubs: negotiatedOptions.Hubs
        });

    }, onError, _client);
}

function getConnectQueryString(_client) {
    var connectData = "";
    var qs = {
        clientProtocol: 1.5,
        transport: "webSockets",
        connectionToken: _client.connection.token,
        connectionData: JSON.stringify(_client.hubData),
        tid: 10
    };

    if (_client.queryString) {
        for (var propName in _client.queryString) {
            qs[propName] = _client.queryString[propName];
        }
    }

    var connectQueryString = _client.url + "/connect?" + querystring.stringify(qs);
    return connectQueryString;
}

function getAbortQueryString(_client) {
    var qs = {
        clientProtocol: 1.5,
        transport: "serverSentEvents",
        connectionData: JSON.stringify(_client.hubData),
        connectionToken: _client.connection.token

    };

    if (_client.queryString) {
        for (var propName in _client.queryString) {
            qs[propName] = _client.queryString[propName];
        }
    }

    var abortQueryString = _client.url + "/abort?" + querystring.stringify(qs);

    return abortQueryString;

}

function getStartQueryString(_client) {
    var qs = {
        clientProtocol: 1.5,
        transport: "webSockets",
        connectionData: JSON.stringify(_client.hubData),
        connectionToken: _client.connection.token
    };

    if (_client.queryString) {
        for (var propName in _client.queryString) {
            qs[propName] = _client.queryString[propName];
        }
    }

    var startQueryString = _client.url + "/start?" + querystring.stringify(qs);

    return startQueryString;
}


function getArgValues(params) {
    var res = [];

    if (params.length && params.length > 1) {
        for (var i = 1; i < params.length; i++) {
            var p = params[i];
            if (typeof p === "function" || typeof p === "undefined") {
                p = null;
            }
            res[i - 1] = p;
        }
    }

    return res;
}

function handlerErrors(errorMessage, e, errorData) {
    console.log("Error Message: ", errorMessage);
    console.log("Exception: ", e);
    console.log("Error Data: ", errorData);

    //throw errorMessage;
}

function buildPayload(hubName, methodName, args, messageId) {
    var data = {
        H: hubName,
        M: methodName,
        A: args,
        I: messageId
    };
    var payload = JSON.stringify(data);
    return payload;
};

function clientInterface(baseUrl, hubs, reconnectTimeout, doNotStart) {
    var client = this;
    var _client = {
        proxy: {},
        headers: {},
        queryString: {},
        pub: client,
        url: baseUrl,
        connection: {
            state: states.connection.unbound,
            token: null,
            id: null
        },
        timeouts: {
            keepAlive: 0,
            disconnect: 0,
            connect: 0
        },
        hubs: [],
        hubData: [],
        handlers: {},
        serviceHandlers: {
            bound: undefined,           // void function(){}
            connectFailed: undefined,   // void function(error){}
            connected: undefined,       // void function(connection){}
            connectionLost: undefined,   // void function(error){}
            disconnected: undefined,    // void function(){}
            onerror: undefined,         // void function(error){}
            messageReceived: undefined, // bool function(message){ return true }
            bindingError: undefined,    // function(error) {}
            onUnauthorized: undefined,  // function(res) {}
            reconnected: undefined,     // void function(connection){}
            reconnecting: undefined     // function(retry) { return false; }
        },

        // https://github.com/Worlize/WebSocket-Node
        websocket: {
            client: new WebSocketClient(),
            connection: null,
            messageid: 0,
            reconnectTimeout: reconnectTimeout || 10,
            reconnectCount: 0
        }
    };

    client.__defineGetter__('url', function () { return _client.url; });
    client.__defineGetter__('state', function () {
        var result = {
            code: _client.connection.state,
            desc: states.getConnection(_client.connection.state)
        };
        return result;
    });

    client.__defineGetter__('connection', function () { return _client.connection; });

    client.__defineGetter__('handlers', function () { return _client.handlers; });
    client.__defineSetter__('handlers', function (val) { mergeFrom(_client.handlers, val); });

    client.__defineGetter__('serviceHandlers', function () { return _client.serviceHandlers; });
    client.__defineSetter__('serviceHandlers', function (val) { mergeFrom(_client.serviceHandlers, val); });

    client.__defineGetter__('hubs', function () {
        var ret = [], x = 0;
        for (h in _client.hubs) {
            ret[x++] = h;
        }
        return ret;
    });
    client.__defineGetter__('lastMessageId', function () { return _client.websocket.messageid; });

    client.__defineGetter__('headers', function () {
        removeUndefinedProperties(_client.headers);
        return _client.headers;
    });
    client.__defineSetter__('headers', function (val) { mergeFrom(_client.headers, val); });

    client.__defineGetter__('proxy', function () { return _client.proxy; });
    client.__defineSetter__('proxy', function (val) { mergeFrom(_client.proxy, val); });

    client.__defineGetter__('queryString', function () {
        removeUndefinedProperties(_client.queryString);
        return _client.queryString;
    });
    client.__defineSetter__('queryString', function (val) { mergeFrom(_client.queryString, val); });

    client.hub = function (hubName) {
        _client.start(false);
        return _client.hubs[hubName.toLowerCase()];
    };
    client.on = function (hubName, methodName, callback) {
        var handler = _client.handlers[hubName.toLowerCase()];
        if (!handler) {
            handler = _client.handlers[hubName.toLowerCase()] = {};
        }
        var method = handler[methodName.toLowerCase()] = callback;
    };
    client.end = function () {
        if ((_client.connection.state == states.connection.connecting
            || _client.connection.state == states.connection.connected)
            && _client.websocket.connection) {
            _client.connection.state = states.connection.disconnecting;
            var connection = _client.websocket.connection;
            _client.websocket.connection = undefined;
            connection.close();
        }
    };
    client.invoke = function (hubName, methodName) {
        var hub = client.hub(hubName);
        if (!hub)
            return;
        var args = getArgValues(arguments);
        return hub.invoke.apply(hub, args);
    };

	var callTimeout = 30000;
	var callCallbacks = {};

    client.__defineGetter__('callTimeout', function () { return callTimeout; });
    client.__defineSetter__('callTimeout', function (val) { callTimeout = val; });

    client.call = function (hubName, methodName) {
		var nohub = typeof client.invoke.apply(client, arguments) === 'undefined';
		return {
			done: function (cb, timeout) { // cb(err, result)
				if (nohub) {
					cb('No Hub');
					return;
				}
				var messageId = client.lastMessageId;
				var timeoutId = setTimeout(
					function () {
						delete callCallbacks[messageId];
						cb('Timeout');
					},
					timeout || callTimeout
				);
				callCallbacks[messageId] = function (err, result) {
					clearTimeout(timeoutId);
					delete callCallbacks[messageId];
					cb(err, result);
				};
			}
		};
    };
	function handleCallResult(messageId, err, result) {
		var cb = callCallbacks[messageId];
		if (cb) cb(err, result);
	}

    client.start = function () {
        _client.getBinding();
    };

    _client.invoke = function (_hub, methodName, args) {
        _client.start(false);

        var payload = buildPayload(_hub.data.name, methodName, args, ++_client.websocket.messageid);
        //try to send message to signalR host
        sendPayload(payload);
        return payload;
    };

    function sendPayload(payload) {
        if (_client.websocket.connection) {
            _client.websocket.connection.send(payload);
        } else {
            setImmediate(sendPayload, payload);
        }
    }
    function scheduleReconnection(isInitalRetry) {
        //Ensure state is still reconnecting
        if (_client.connection.state == states.connection.retryingConnection) {
            if (isInitalRetry) {
                _client.websocket.reconnectCount = 0;
            } else {
                _client.websocket.reconnectCount++;
            }
            var cancelRetry = false;
            if (_client.serviceHandlers.reconnecting) {
                var retry = { inital: isInitalRetry, count: _client.websocket.reconnectCount };
                cancelRetry = _client.serviceHandlers.reconnecting.apply(client, [retry]);
            }
            if (!cancelRetry) {
                setTimeout(function () {
                    var connectQueryString = getConnectQueryString(_client);
                    _client.websocket.client.connect(connectQueryString, undefined, undefined, _client.headers);
                }, 1000 * _client.websocket.reconnectTimeout);
                return true;
            }
            else {
                _client.connection.state = states.connection.retryingFailed;
            }
        }
        return false;
    }

    function abort() {

        if (_client.connection.state === states.connection.disconnected || _client.connection.state === states.connection.disconnecting) {

            var abortQueryString = getAbortQueryString(_client);

            var abortUrlOptions = url.parse(abortQueryString, true);
            var requestObject = undefined;


            if (abortUrlOptions.protocol === 'http:') {
                requestObject = http;
            } else if (abortUrlOptions.protocol === 'wss:') {
                abortUrlOptions.protocol = 'https:';
                requestObject = https;
            } else {
                handlerErrors('Protocol Error', undefined, abortUrlOptions);
            }

            abortUrlOptions = {
                hostname: abortUrlOptions.hostname,
                port: abortUrlOptions.port,
                method: 'POST',
                path: abortUrlOptions.path
            };

            var req = requestObject.request(abortUrlOptions,
            function (res) {

                //console.log('STATUS: ' + res.statusCode);
                //console.log('HEADERS: ' + JSON.stringify(res.headers));

                res.on('data', function (chunk) {
                    //str += chunk;
                });

                res.on('end', function () {
                    console.log('Connection aborted');

                });

            });

            req.on('error', function (e) {
                handlerErrors('Can\'t abort connection', e, abortUrlOptions);
            });

            req.end();
        }

    };

    function startCommunication(onSuccess, onError) {

        var startUrl = getStartQueryString(_client);

        var startUrlOptions = url.parse(startUrl, true);

        var startData = "";
        var startFunction = function (res) {
            res.on('data', function (chunk) {
                startData += chunk;
            });
            res.on('end', function (endRes) {
                try {
                    if (res.statusCode == 200) {
                        var startObj = JSON.parse(startData);
                        onSuccess(startObj);
                    } else if (res.statusCode == 401 || res.statusCode == 302) {
                        if (_client.serviceHandlers.onUnauthorized) {
                            _client.serviceHandlers.onUnauthorized(res);
                        } else {
                            console.log('start::Unauthorized (' + res.statusCode + ')');
                        }
                    } else {
                        console.log('start::unknown (' + res.statusCode + ')');
                    }
                } catch (e) {
                    onError('Parse Error', e, startData);
                }
            });
            res.on('error', function (e) {
                _client.connection.state = states.connection.bindingError;
                if (_client.serviceHandlers.bindingError) {
                    _client.serviceHandlers.bindingError(e);
                } else {
                    onError('HTTP Error', e);
                }
            });
        }

        var startErrorFunction = function (e) {
            _client.connection.state = states.connection.bindingError;
            if (_client.serviceHandlers.bindingError) {
                _client.serviceHandlers.bindingError(e);
            } else {
                onError('HTTP start Error', e);
            }
        };

        if (startUrlOptions.headers === undefined) {
            startUrlOptions.headers = {};
        }
        if (_client.headers) {
            for (var propName in _client.headers) {
                startUrlOptions.headers[propName] = _client.headers[propName];
            }
        }

        if (_client.proxy && _client.proxy.host && _client.proxy.port) {
            startUrlOptions.path = startUrlOptions.protocol + '//' + startUrlOptions.host + startUrlOptions.path;
            startUrlOptions.headers.host = startUrlOptions.host;
            startUrlOptions.host = _client.proxy.host;
            startUrlOptions.port = _client.proxy.port;
        }

        if (startUrlOptions.protocol === 'http:') {
            var startResult = http.get(startUrlOptions, startFunction).on('error', startErrorFunction);
        } else if (startUrlOptions.protocol === 'wss:') {
            startUrlOptions.protocol = 'https:';
            var startResult = https.get(startUrlOptions, startFunction).on('error', startErrorFunction);
        } else {
            onError('Protocol Error', undefined, startUrlOptions);
        }


    };

    _client.start = function (tryOnceAgain) {
        //connected: 3,
        //retryingConnection: 8,
        //connecting: 2,
        if (_client.connection.state == states.connection.connected
            || _client.connection.state == states.connection.retryingConnection
            || _client.connection.state == states.connection.connecting) {
            return true;
        }
        //unbound: 0,
        //bindingError: 9,
        else if (_client.connection.state == states.connection.bindingError
            || _client.connection.state == states.connection.unbound) {
            if (!tryOnceAgain) {
                _client.getBinding();
                setImmediate(_client.start, true);
            }
            return false;
        }
        //bound: 1,
        //disconnecting: 4,
        //disconnected: 5,
        //connectFailed: 6,
        //errorOccured: 7,
        else if (_client.connection.state == states.connection.bound
            || _client.connection.state == states.connection.disconnecting
            || _client.connection.state == states.connection.disconnected
            || _client.connection.state == states.connection.connectFailed
            || _client.connection.state == states.connection.errorOccured) {
            _client.connection.state = states.connection.connecting;

            //connect to websockets
            var connectQueryString = getConnectQueryString(_client);
            _client.websocket.client.connect(connectQueryString, undefined, undefined, _client.headers);
            return false;
        }
        return true;
    };

    _client.websocket.client.on('connectFailed', function (error) {
        if (_client.connection.state == states.connection.retryingConnection
            && scheduleReconnection(false)) {
        } else {
            _client.connection.state = states.connection.connectFailed;
            if (_client.serviceHandlers.connectFailed) {
                _client.serviceHandlers.connectFailed.apply(client, [error]);
            } else {
                console.log("Connect Failed!");
            }
        }
    });
    _client.websocket.client.on('connect', function (connection) {
        _client.websocket.connection = connection;
        _client.websocket.messageid = 0; //Reset MessageID on new connection

        //Note: check for reconnecting
        if (_client.connection.state == states.connection.retryingConnection) {
            //Note: reconnected event
            if (_client.serviceHandlers.reconnected) {
                _client.serviceHandlers.reconnected.apply(client, [connection]);
            } else {
                console.log("Reconnected!");
            }
        } else {
            if (_client.serviceHandlers.connected) {
                startCommunication(function (data) {

                    _client.serviceHandlers.connected.apply(client, [connection]);
                },
                handlerErrors);
            } else {
                console.log("Connected!");
            }
        }
        connection.on('error', function (error) {
            _client.websocket.connection = undefined;
            _client.connection.state = states.connection.errorOccured;

            //Note: Add support for automatic retry
            if (error.code == "ECONNRESET") {
                _client.connection.state = states.connection.retryingConnection;
                if (_client.serviceHandlers.connectionLost) {
                    _client.serviceHandlers.connectionLost.apply(client, [error]);
                } else {
                    console.log("Scheduled Reconnection: " + error.toString());
                }
                scheduleReconnection(true);
            } else {
                if (_client.serviceHandlers.onerror) {
                    _client.serviceHandlers.onerror.apply(client, [error]);
                } else {
                    console.log("Connection Error: " + error.toString());
                }
            }
        });
        connection.on('close', function () {
            if (_client.connection.state != states.connection.retryingConnection) {
                _client.connection.state = states.connection.disconnected;
            }
            if (_client.serviceHandlers.disconnected) {
                _client.serviceHandlers.disconnected.apply(client);
            }
            //Abort connection
            abort();

            _client.websocket.connection = undefined; //Release connection on close
        });
        connection.on('message', function (message) {
            var handled = false;
            if (_client.serviceHandlers.messageReceived) {
                handled = _client.serviceHandlers.messageReceived.apply(client, [message]);
            }
            if (!handled) {
                //{"C":"d-8F1AB453-B,0|C,0|D,1|E,0","S":1,"M":[]}
                if (message.type === 'utf8' && message.utf8Data != "{}") {
                    var parsed = JSON.parse(message.utf8Data);

                    //{"C":"d-74C09D5E-B,1|C,0|D,1|E,0","M":[{"H":"TestHub","M":"addMessage","A":["ie","sgds"]}]}
                    if (parsed.hasOwnProperty('M')) {
                        for (var i = 0; i < parsed.M.length; i++) {
                            var mesg = parsed.M[i];
                            var hubName = mesg.H.toLowerCase();
                            var handler = _client.handlers[hubName];
                            if (handler) {
                                var methodName = mesg.M.toLowerCase();
                                var method = handler[methodName];
                                if (method) {
                                    var hub = client.hub(hubName)
                                    method.apply(hub, mesg.A);
                                }
                            }
                        }
                    }
					else if (parsed.hasOwnProperty('I')) {
						handleCallResult(+parsed.I, parsed.E, parsed.R);
					}
                }
            }
        });
    });

    _client.getBinding = function () {
        getBindings(baseUrl, hubs, function (bindings) {

            _client.hubData = bindings.hubs;

            //hubs:
            for (var i = 0; i < bindings.hubs.length; i++) {
                var hubData = bindings.hubs[i];
                _client.hubs[hubData.name] = new hubInterface(_client, hubData);
            }

            //timeouts: { keepAlive: disconnect: connect: },
            _client.timeouts.keepAlive = bindings.timeouts.keepAlive;
            _client.timeouts.disconnect = bindings.timeouts.disconnect;
            _client.timeouts.connect = bindings.timeouts.connect;

            //connection: { token: id: },
            _client.connection.state = states.connection.bound;
            _client.connection.id = bindings.connection.id;
            _client.connection.token = bindings.connection.token;

            if (_client.serviceHandlers.bound) {
                _client.serviceHandlers.bound.apply(client);
            }

            _client.start(true);
        }, function(errorMessage, exception, errorData) {
            if (_client.serviceHandlers.onerror) {
                _client.serviceHandlers.onerror(errorMessage, exception, errorData);
            } else {
                handlerErrors(errorMessage, exception, errorData);
            }
        }, _client);
    };

    if (doNotStart) {
    }
    else {
        _client.getBinding();
    }
}

function hubInterface(_client, hubData) {
    var hub = this;
    var _hub = {
        pub: hub,
        client: _client,
        data: hubData
    };

    hub.__defineGetter__('name', function () { return _hub.data.name; });
    hub.__defineGetter__('client', function () { return _hub.client.pub; });
    hub.__defineGetter__('handlers', function () { return _hub.client.handlers[_hub.data.name]; });
    hub.invoke = function (methodName) {
        var args = getArgValues(arguments);
        return _hub.client.invoke(_hub, methodName, args);
    };
    hub.on = function (methodName, callback) {
        _hub.client.pub.on(_hub.data.name, methodName, callback);
    };
}

module.exports = {
    client: clientInterface
};

*/
