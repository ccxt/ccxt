package ccxt

// Stream is a dummy struct to satisfy interface requirements in Exchange.
type Stream struct{}

// Subscribe is a dummy method that does nothing.
func (s *Stream) Subscribe(topic interface{}, handler interface{}, synchronous interface{}) {}

// Produce is a dummy method that does nothing.
func (s *Stream) Produce(topic interface{}, payload interface{}, err interface{}) {}

// AddWatchFunction is a dummy method that does nothing.
func (s *Stream) AddWatchFunction(name interface{}, args interface{}) {}

// ActiveWatchFunctions is a dummy field to satisfy usage in Exchange.
func (s *Stream) ActiveWatchFunctions() interface{} { return []interface{}{} }
