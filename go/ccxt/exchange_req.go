package ccxt

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"
)

func (this *Exchange) Fetch(url interface{}, method interface{}, headers interface{}, body interface{}) interface{} {
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

	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	// Marshal the body to JSON if not nil
	var requestBody []byte
	var err error
	if body != nil {
		requestBody, err = json.Marshal(body)
		if err != nil {
			panic(fmt.Sprintf("failed to marshal body: %v", err))
		}
	}

	// Create the HTTP request
	req, err := http.NewRequest(methodStr, urlStr, bytes.NewBuffer(requestBody))
	if err != nil {
		panic(fmt.Sprintf("failed to create request: %v", err))
	}

	// Set headers
	for key, value := range headersStrMap {
		req.Header.Set(key, value)
	}

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
	fmt.Printf("Response: %s\n", respBody)

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

	return result
}
