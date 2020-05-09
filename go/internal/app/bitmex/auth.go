package bitmex

import (
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/ccxt/ccxt/go/internal/util"
)

// SignRequest takes the req and adds the correct headers
func (c *Exchange) SignRequest(req *http.Request, method string, u *url.URL, data []byte) error {
	path := u.Path
	if u.RawQuery != "" {
		path += "?" + u.RawQuery
	}
	expires := time.Now().Add(time.Second * 2).Unix()
	payload := fmt.Sprintf("%s%s%d%s", method, path, expires, string(data))
	signature, err := util.HMAC(payload, c.Config.Secret, "sha256", "hex")
	if err != nil {
		return err
	}
	req.Header.Add("api-expires", strconv.FormatInt(expires, 10))
	req.Header.Add("api-key", c.Config.APIKey)
	req.Header.Add("api-signature", signature)
	return nil
}
