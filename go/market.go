package ccxt

type Market struct {
	Exchange Exchange

	ID        string // exchange specific
	Symbol    string // ccxt unified
	Base      string
	Quote     string
	Lot       float64
	Precision Precision
	Limits    Limits
	Info      interface{}
}

type Precision struct {
	Amount int
	Price  int
	Cost   int
}

type Limits struct {
	Amount MinMax
	Price  MinMax
	Cost   MinMax
}

type MinMax struct {
	Min float64
	Max float64
}
