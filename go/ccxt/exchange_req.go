package ccxt

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
	"time"
)

func (this *Exchange) Fetch(url interface{}, method interface{}, headers interface{}, body interface{}) chan interface{} {
	ch := make(chan interface{})
	go func() {
		defer close(ch)
		defer func() {
			if r := recover(); r != nil {
				ch <- "panic:" + ToString(r)
			}
		}()
		// Convert url to string
		urlStr, ok := url.(string)
		if !ok {
			panic("url must be a string")
		}

		// Convert method to string
		methodStr, ok := method.(string)
		if !ok {
			panic("method must be a string")
		}

		// Convert headers to map[string]string
		headersMap, ok := headers.(map[string]interface{})
		if !ok {
			panic("headers must be a map[string]interface{}")
		}

		// ####### PROXY SETTINGS #######
		proxyUrl := this.CheckProxyUrlSettings(url, method, headers, body)
		proxies := this.CheckProxySettings(url, methodStr, headersMap, body)
		httProxy := this.SafeString(proxies, 0)
		httpsProxy := this.SafeString(proxies, 1)
		socksProxy := this.SafeString(proxies, 2)

		hasHttProxyDefined := (httProxy != nil) || (httpsProxy != nil) || (socksProxy != nil)
		this.CheckConflictingProxies(hasHttProxyDefined, proxyUrl)
		if this.Verbose {
			fmt.Println("Headers:", headersMap)
			fmt.Println("\n\n")
			fmt.Printf("Request: %s %s\n", methodStr, urlStr)
			fmt.Println("\n\n")
			fmt.Printf("Body: %v\n", body)
			fmt.Println("\n\n")
		}

		headersStrMap := make(map[string]string)
		for k, v := range headersMap {
			headersStrMap[k] = fmt.Sprintf("%v", v)
		}

		client := &http.Client{
			Timeout: 30 * time.Second,
		}

		// Marshal the body to JSON if not nil
		// var requestBody []byte
		// var err error
		// if body != nil {
		// 	requestBody, err = json.Marshal(body)
		// 	if err != nil {
		// 		panic(fmt.Sprintf("failed to marshal body: %v", err))
		// 	}
		// }

		var req *http.Request
		var err error

		if body != nil {
			switch v := body.(type) {
			case string:
				// If the body is a string, use URL encoding
				// data := urlLib.Values{}
				// parsedData, err := urlLib.ParseQuery(v)
				// if err != nil {
				// 	panic(fmt.Sprintf("error parsing query string: %w", v))
				// }
				// for key, values := range parsedData {
				// 	for _, value := range values {
				// 		data.Set(key, value)
				// 	}
				// }
				req, err = http.NewRequest(methodStr, urlStr, strings.NewReader(v))
				if err != nil {
					panic(fmt.Sprintf("error creating request"))
				}
			default:
				requestBody, err := json.Marshal(body)
				if err != nil {
					panic(fmt.Sprintf("error marshalling JSON"))
				}
				req, err = http.NewRequest(methodStr, urlStr, bytes.NewBuffer(requestBody))
				if err != nil {
					panic(fmt.Sprintf("error creating request"))
				}
			}
		} else {
			req, err = http.NewRequest(methodStr, urlStr, nil)
			if err != nil {
				panic(fmt.Sprintf("error creating request"))
			}
		}
		// Create the HTTP request
		// req, err := http.NewRequest(methodStr, urlStr, bytes.NewBuffer(requestBody))
		// if err != nil {
		// 	panic(fmt.Sprintf("failed to create request: %v", err))
		// }

		// Set headers
		for key, value := range headersStrMap {
			req.Header.Set(key, value)
		}

		// strings.NewReader()
		// Send the request
		resp, err := client.Do(req)
		if err != nil {
			panic(fmt.Sprintf("request failed: %v", err))
		}
		defer resp.Body.Close()

		// Read the response body
		respBody, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			panic(fmt.Sprintf("failed to read response body: %v", err))
		}

		// Log the response (for debugging purposes)
		if this.Verbose {
			fmt.Printf("Response: %s\n", respBody)
		}

		// Check for HTTP errors
		if resp.StatusCode < 200 || resp.StatusCode >= 300 {
			// add handle http status()
			panic(fmt.Sprintf("HTTP request failed with status code %d: %s", resp.StatusCode, string(respBody)))
		}

		// Unmarshal the response body
		var result interface{}
		err = json.Unmarshal(respBody, &result)
		if err != nil {
			panic(fmt.Sprintf("failed to unmarshal response body: %v", err))
		}
		ch <- result
	}()
	return ch
}
