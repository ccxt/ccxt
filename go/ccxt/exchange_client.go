package ccxt

type Client struct {
	Futures       map[string]interface{}
	Subscriptions map[string]interface{}
}

func (c *Client) Reject(err interface{}, subHash interface{}) {
}

func (c *Client) Resolve(subHash interface{}, data interface{}) {
}
