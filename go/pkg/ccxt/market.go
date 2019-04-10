package ccxt

// Market struct
type Market struct {
	Exchange  *Exchange
	ID        string // exchange specific
	Symbol    string // ccxt unified
	Base      string
	Quote     string
	Lot       float64
	Precision Precision
	Limits    Limits
	Info      interface{}
}

// Precision struct
type Precision struct {
	Amount int
	Price  int
	Cost   int
}

// Limits struct
type Limits struct {
	Amount MinMax
	Price  MinMax
	Cost   MinMax
}

// MinMax struct
type MinMax struct {
	Min float64
	Max float64
}
