package ccxt

// since we're not generating a wrapper for the main Exchange struct, some types from methods implemented
// there might be missing here, so we define them here to avoid compilation errors when dealing with the Interface that abstracts all exchanges

type CreateLimitBuyOrderOptionsStruct struct {
	Params *map[string]interface{}
}

type CreateLimitBuyOrderOptions func(opts *CreateLimitBuyOrderOptionsStruct)

func WithCreateLimitBuyOrderParams(params map[string]interface{}) CreateLimitBuyOrderOptions {
	return func(opts *CreateLimitBuyOrderOptionsStruct) {
		opts.Params = &params
	}
}

type CreateLimitSellOrderOptionsStruct struct {
	Params *map[string]interface{}
}

type CreateLimitSellOrderOptions func(opts *CreateLimitSellOrderOptionsStruct)

func WithCreateLimitSellOrderParams(params map[string]interface{}) CreateLimitSellOrderOptions {
	return func(opts *CreateLimitSellOrderOptionsStruct) {
		opts.Params = &params
	}
}

type CreateLimitOrderOptionsStruct struct {
	Params *map[string]interface{}
}

type CreateLimitOrderOptions func(opts *CreateLimitOrderOptionsStruct)

func WithCreateLimitOrderParams(params map[string]interface{}) CreateLimitOrderOptions {
	return func(opts *CreateLimitOrderOptionsStruct) {
		opts.Params = &params
	}
}

type CreateMarketSellOrderOptionsStruct struct {
	Params *map[string]interface{}
}

type CreateMarketSellOrderOptions func(opts *CreateMarketSellOrderOptionsStruct)

func WithCreateMarketSellOrderParams(params map[string]interface{}) CreateMarketSellOrderOptions {
	return func(opts *CreateMarketSellOrderOptionsStruct) {
		opts.Params = &params
	}
}

// createMarketOrder struct with optional price and params

type CreateMarketOrderOptionsStruct struct {
	Price  *float64
	Params *map[string]interface{}
}

type CreateMarketOrderOptions func(opts *CreateMarketOrderOptionsStruct)

func WithCreateMarketOrderPrice(price float64) CreateMarketOrderOptions {
	return func(opts *CreateMarketOrderOptionsStruct) {
		opts.Price = &price
	}
}

func WithCreateMarketOrderParams(params map[string]interface{}) CreateMarketOrderOptions {
	return func(opts *CreateMarketOrderOptionsStruct) {
		opts.Params = &params
	}
}

// createPostOnlyOrder struct with optional price and params

type CreatePostOnlyOrderOptionsStruct struct {
	Price  *float64
	Params *map[string]interface{}
}

type CreatePostOnlyOrderOptions func(opts *CreatePostOnlyOrderOptionsStruct)

func WithCreatePostOnlyOrderPrice(price float64) CreatePostOnlyOrderOptions {
	return func(opts *CreatePostOnlyOrderOptionsStruct) {
		opts.Price = &price
	}
}

func WithCreatePostOnlyOrderParams(params map[string]interface{}) CreatePostOnlyOrderOptions {
	return func(opts *CreatePostOnlyOrderOptionsStruct) {
		opts.Params = &params
	}
}

// createReduceOnlyOrder struct with optional price and params

type CreateReduceOnlyOrderOptionsStruct struct {
	Price  *float64
	Params *map[string]interface{}
}

type CreateReduceOnlyOrderOptions func(opts *CreateReduceOnlyOrderOptionsStruct)

func WithCreateReduceOnlyOrderPrice(price float64) CreateReduceOnlyOrderOptions {
	return func(opts *CreateReduceOnlyOrderOptionsStruct) {
		opts.Price = &price
	}
}

func WithCreateReduceOnlyOrderParams(params map[string]interface{}) CreateReduceOnlyOrderOptions {
	return func(opts *CreateReduceOnlyOrderOptionsStruct) {
		opts.Params = &params
	}
}

// FetchBorrowRate with optional params

type FetchBorrowRateOptionsStruct struct {
	Params *map[string]interface{}
}

type FetchBorrowRateOptions func(opts *FetchBorrowRateOptionsStruct)

func WithFetchBorrowRateParams(params map[string]interface{}) FetchBorrowRateOptions {
	return func(opts *FetchBorrowRateOptionsStruct) {
		opts.Params = &params
	}
}

// FetchIndexOHLCV with optional timeframe, since, limit and params

type FetchIndexOHLCVOptionsStruct struct {
	Timeframe *string
	Since     *int64
	Limit     *int64
	Params    *map[string]interface{}
}
type FetchIndexOHLCVOptions func(opts *FetchIndexOHLCVOptionsStruct)

func WithFetchIndexOHLCVTimeframe(timeframe string) FetchIndexOHLCVOptions {
	return func(opts *FetchIndexOHLCVOptionsStruct) {
		opts.Timeframe = &timeframe
	}
}

func WithFetchIndexOHLCVSince(since int64) FetchIndexOHLCVOptions {
	return func(opts *FetchIndexOHLCVOptionsStruct) {
		opts.Since = &since
	}
}

func WithFetchIndexOHLCVLimit(limit int64) FetchIndexOHLCVOptions {
	return func(opts *FetchIndexOHLCVOptionsStruct) {
		opts.Limit = &limit
	}
}

func WithFetchIndexOHLCVParams(params map[string]interface{}) FetchIndexOHLCVOptions {
	return func(opts *FetchIndexOHLCVOptionsStruct) {
		opts.Params = &params
	}
}

// fetchMarkOHLCV with optional timeframe, since, limit and params

type FetchMarkOHLCVOptionsStruct struct {
	Timeframe *string
	Since     *int64
	Limit     *int64
	Params    *map[string]interface{}
}

type FetchMarkOHLCVOptions func(opts *FetchMarkOHLCVOptionsStruct)

func WithFetchMarkOHLCVTimeframe(timeframe string) FetchMarkOHLCVOptions {
	return func(opts *FetchMarkOHLCVOptionsStruct) {
		opts.Timeframe = &timeframe
	}
}

func WithFetchMarkOHLCVSince(since int64) FetchMarkOHLCVOptions {
	return func(opts *FetchMarkOHLCVOptionsStruct) {
		opts.Since = &since
	}
}

func WithFetchMarkOHLCVLimit(limit int64) FetchMarkOHLCVOptions {
	return func(opts *FetchMarkOHLCVOptionsStruct) {
		opts.Limit = &limit
	}
}

func WithFetchMarkOHLCVParams(params map[string]interface{}) FetchMarkOHLCVOptions {
	return func(opts *FetchMarkOHLCVOptionsStruct) {
		opts.Params = &params
	}
}

// FetchLongShortRatio with optional timeframe and params

type FetchLongShortRatioOptionsStruct struct {
	Timeframe *string
	Params    *map[string]interface{}
}

type FetchLongShortRatioOptions func(opts *FetchLongShortRatioOptionsStruct)

func WithFetchLongShortRatioTimeframe(timeframe string) FetchLongShortRatioOptions {
	return func(opts *FetchLongShortRatioOptionsStruct) {
		opts.Timeframe = &timeframe
	}
}

func WithFetchLongShortRatioParams(params map[string]interface{}) FetchLongShortRatioOptions {
	return func(opts *FetchLongShortRatioOptionsStruct) {
		opts.Params = &params
	}
}

// fetchPremiumINdexOHLCV with optional timeframe, since, limit and params

type FetchPremiumIndexOHLCVOptionsStruct struct {
	Timeframe *string
	Since     *int64
	Limit     *int64
	Params    *map[string]interface{}
}

type FetchPremiumIndexOHLCVOptions func(opts *FetchPremiumIndexOHLCVOptionsStruct)

func WithFetchPremiumIndexOHLCVTimeframe(timeframe string) FetchPremiumIndexOHLCVOptions {
	return func(opts *FetchPremiumIndexOHLCVOptionsStruct) {
		opts.Timeframe = &timeframe
	}
}

func WithFetchPremiumIndexOHLCVSince(since int64) FetchPremiumIndexOHLCVOptions {
	return func(opts *FetchPremiumIndexOHLCVOptionsStruct) {
		opts.Since = &since
	}
}

func WithFetchPremiumIndexOHLCVLimit(limit int64) FetchPremiumIndexOHLCVOptions {
	return func(opts *FetchPremiumIndexOHLCVOptionsStruct) {
		opts.Limit = &limit
	}
}

func WithFetchPremiumIndexOHLCVParams(params map[string]interface{}) FetchPremiumIndexOHLCVOptions {
	return func(opts *FetchPremiumIndexOHLCVOptionsStruct) {
		opts.Params = &params
	}
}
