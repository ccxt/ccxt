package ccxt

import (
	"bytes"
	"compress/gzip"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"strings"
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

		if this.FetchResponse != nil {
			ch <- this.FetchResponse
			return
		}
		this.UpdateProxySettings() // for now this needs to be here

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

		headersStrMap := make(map[string]string)
		for k, v := range headersMap {
			headersStrMap[k] = fmt.Sprintf("%v", v)
		}

		headersOptions, ok := this.Options.Load("headers")
		if ok {
			if headersOptions != nil {
				for key, value := range headersOptions.(map[string]interface{}) {
					if _, exists := headersStrMap[key]; !exists {
						headersStrMap[key] = fmt.Sprintf("%v", value)
					}
				}
			} else {
				panic("headersOptions should be a map[string]interface{}")
			}

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
					panic("error creating request")
				}
			default:
				requestBody, err := json.Marshal(body)
				if err != nil {
					panic("error marshalling JSON")
				}
				req, err = http.NewRequest(methodStr, urlStr, bytes.NewBuffer(requestBody))
				if err != nil {
					panic("error creating request")
				}
			}
		} else {
			req, err = http.NewRequest(methodStr, urlStr, nil)
			if err != nil {
				panic("error creating request")
			}
		}
		// Create the HTTP request
		// req, err := http.NewRequest(methodStr, urlStr, bytes.NewBuffer(requestBody))
		// if err != nil {
		// 	panic(fmt.Sprintf("failed to create request: %v", err))
		// }

		//set default headers
		defaultHeaders := this.Headers.(map[string]interface{})
		for key, value := range defaultHeaders {
			req.Header.Set(key, value.(string))
		}

		// Set headers
		for key, value := range headersStrMap {
			req.Header.Set(key, value)
		}

		if this.Verbose {
			fmt.Println("Headers:", req.Header)
			fmt.Printf("\n\n\n")
			fmt.Printf("Request: %s %s\n", methodStr, urlStr)
			fmt.Printf("\n\n\n")
			fmt.Printf("Body: %v\n", body)
			fmt.Printf("\n\n\n")
		}

		// strings.NewReader()
		// Send the request
		resp, err := this.httpClient.Do(req)

		// Read the response body
		// respBody, err := ioutil.ReadAll(resp.Body)
		var respBody []byte

		if resp == nil {
			// when resp is nil: The request failed at the transport level (e.g., network issue, DNS lookup failure).
			networkError := NetworkError(fmt.Sprintf("Network error: %v", err))
			panic(networkError)
		}

		if err == nil {
			defer resp.Body.Close()
			if resp.Header.Get("Content-Encoding") == "gzip" {
				gzipReader, err := gzip.NewReader(resp.Body)
				if err != nil {
					panic(fmt.Sprintf("Error creating gzip reader: %s", err))
				}
				defer gzipReader.Close()

				decompressedData, err := io.ReadAll(gzipReader)
				if err != nil {
					panic(fmt.Sprintf("Error reading decompressed data: %s", err))
				}
				respBody = decompressedData
			} else {
				respBodyAux, err := ioutil.ReadAll(resp.Body)
				if err != nil {
					panic(fmt.Sprintf("failed to read response body: %v", err))
				}
				respBody = respBodyAux
			}
		}

		// Use ParseJSON to handle JSON parsing with proper number normalization
		var result interface{}
		result = ParseJSON(string(respBody))

		if result == nil {
			// If ParseJSON failed, fallback to raw string
			result = string(respBody)
		} else {
			if this.ReturnResponseHeaders {
				if resultMap, ok := result.(map[string]interface{}); ok {
					resultMap["responseHeaders"] = HeaderToMap(resp.Header)
					result = resultMap
				}
			}
		}

		// Log the response (for debugging purposes)
		if this.Verbose {
			fmt.Printf("Response: %s\n", respBody)
		}

		statusText := http.StatusText(resp.StatusCode)
		// handleErrorResult := <-this.callInternal("handleErrors", resp.StatusCode, statusText, urlStr, methodStr, headers, string(respBody), result, headersStrMap, body)
		handleErrorResult := this.DerivedExchange.HandleErrors(resp.StatusCode, statusText, urlStr, methodStr, headers, string(respBody), result, headersStrMap, body)
		PanicOnError(handleErrorResult)

		if handleErrorResult == nil {
			this.HandleHttpStatusCode(resp.StatusCode, statusText, urlStr, methodStr, result)
		}

		// Check for HTTP errors
		if resp.StatusCode < 200 || resp.StatusCode >= 300 {
			// add handle http status()
			panic(fmt.Sprintf("HTTP request failed with status code %d: %s", resp.StatusCode, string(respBody)))
		}

		// only handling failure here
		if err != nil {
			panic(fmt.Sprintf("request failed: %v", err))
		}

		ch <- result
	}()
	return ch
}

func (this *Exchange) HandleHttpStatusCode(code interface{}, reason interface{}, url interface{}, method interface{}, body interface{}) {

	codeString := ToString(code)
	codeinHttpExceptions := SafeValue(this.HttpExceptions, codeString, nil)

	if codeinHttpExceptions != nil {
		errorMessage := this.Id + " " + ToString(method) + " " + ToString(url) + " " + ToString(code) + " " + ToString(reason) + " " + ToString(body)
		functionError := codeinHttpExceptions.(func(...interface{}) error)
		panic(functionError(errorMessage))
	}

}

func HeaderToMap(header http.Header) map[string]interface{} {
	result := make(map[string]interface{})
	for key, values := range header {
		if len(values) == 1 {
			result[key] = values[0]
		} else {
			result[key] = values
		}
	}
	return result
}
