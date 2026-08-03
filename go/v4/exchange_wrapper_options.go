package ccxt

// Order Options
// type OrderOptions struct {
// 	Price  float64
// 	Params map[string]any
// }

// type OrderOption func(*OrderOptions)

// func WithPrice(price float64) OrderOption {
// 	return func(opts *OrderOptions) {
// 		opts.Price = price
// 	}
// }

// type Options struct {
// 	Limit  int64
// 	Since  int64
// 	Params map[string]any
// }

// type Option func(*Options)

// func WithLimit(limit int64) Option {
// 	return func(opts *Options) {
// 		opts.Limit = limit
// 	}
// }

// func WithSince(since int64) Option {
// 	return func(opts *Options) {
// 		opts.Since = since
// 	}
// }

// generic with Params

// func WithParams(params map[string]any) any {
// 	return func(opts any) {
// 		switch o := opts.(type) {
// 		case *Options:
// 			o.Params = params
// 		case *OrderOptions:
// 			o.Params = params
// 		}
// 	}
// }

// func CreateOrder2(symbol string, amount float64, options ...Option) {
// 	// Start with default options
// 	opts := OrderOptions{
// 		Price:  0,                            // Default to 0 if price is not set
// 		Params: make(map[string]any), // Default empty map if params are not set
// 	}

// 	// Apply each option to modify the defaults
// 	for _, option := range options {
// 		option(&opts)
// 	}

// 	// Now you can use opts.Price, opts.Params, etc. as per configuration
// 	fmt.Printf("Symbol: %s, Amount: %f, Price: %f, Params: %v\n", symbol, amount, opts.Price, opts.Params)

// 	// Your order creation logic here
// }

// func teste() {
// 	CreateOrder2()
// }
