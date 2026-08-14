package ccxt

import (
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"reflect"
	"strconv"
	"strings"
	"sync"
)

/**
 *
 * @param array
 * @param x
 */
func bisectLeft(array []float64, x float64) int {
	low := 0
	high := len(array) - 1

	for low <= high {
		mid := int(uint32(low+high) >> 1)
		if array[mid]-x < 0 {
			low = mid + 1
		} else {
			high = mid - 1
		}
	}

	return low
}

const SIZE = 1024

var SEED []float64

func init() {
	SEED = make([]float64, SIZE)
	for i := range SEED {
		SEED[i] = math.MaxFloat64
	}
}

type IOrderBookSide interface {
	Store(price any, size any) error
	StoreArray(delta any)
	Limit()
	Len() int
	SetLen(length int)
	GetData() [][]any
	GetDataCopy() [][]any
	SetData(data [][]any)
	GetIndex() *[]float64
	String() string
	SetDepth(depth int)
	GetValue(key string, defaultValue any) any
	CopySide() IOrderBookSide
}

type OrderBookSide struct {
	Data   [][]any      `json:"data"` // equivalent to extending Array
	Index  []float64    `json:"-"`    // string-keyed dictionary of price levels / ids / indices
	Depth  int          `json:"-"`    // depth limit
	Length int          `json:"-"`    // current Length
	Side   bool         `json:"-"`    // false is asks, true is bids
	Mutex  sync.RWMutex `json:"-"`    // protects concurrent access
}

// MarshalJSON emits the side as a plain array of price levels instead of the
// default struct shape {"data":[...]}, which leaked into serialized orderbooks,
// see https://github.com/ccxt/ccxt/issues/29586
// promoted via embedding into CountedOrderBookSide, whose embed is set;
// IndexedOrderBookSide keeps a nil embed and carries its own MarshalJSON
func (obs *OrderBookSide) MarshalJSON() ([]byte, error) {
	if obs == nil {
		return []byte("[]"), nil
	}
	obs.Mutex.RLock()
	defer obs.Mutex.RUnlock()
	if obs.Data == nil {
		return []byte("[]"), nil
	}
	return json.Marshal(obs.Data)
}

func (obs *OrderBookSide) GetValue(key string, defaultValue any) any {
	switch key {
	case "Data":
		return obs.Data
	case "Index":
		return obs.Index
	case "Depth":
		return obs.Depth
	case "Length":
		return obs.Length
	case "Side":
		return obs.Side
	default:
		return defaultValue
	}
}

func NewOrderBookSide(side bool, deltas any, depth any) *OrderBookSide {

	orderBookSide := &OrderBookSide{
		Data:   make([][]any, 0),
		Index:  make([]float64, len(SEED)),
		Length: 0,
		Depth:  math.MaxInt32,
		Side:   side,
	}
	result := Init(orderBookSide, deltas, depth)
	return result.(*OrderBookSide)
}

func Init(obs IOrderBookSide, deltas any, depth any) IOrderBookSide {
	copy(*obs.GetIndex(), SEED)

	// Set depth
	if depth != nil {
		switch d := depth.(type) {
		case int:
			obs.SetDepth(d)
		case int64:
			obs.SetDepth(int(d))
		default:
			panic(fmt.Sprintf("New depth type %v", reflect.TypeOf(depth)))
		}
	}

	switch d := deltas.(type) {
	case [][]float64:
		for i := 0; i < len(d); i++ {
			// if iobs, ok := obs.(*IndexedOrderBookSide); ok {
			// 	iobs.SetLen(i)
			// }
			original := d[i]
			deltaCopy := append([]float64(nil), original...)
			obs.StoreArray(deltaCopy)
		}
	case IOrderBookSide:
		for i := 0; i < d.Len(); i++ {
			// 	if iobs, ok := obs.(*IndexedOrderBookSide); ok {
			// 		iobs.SetLen(i)
			// 	}
			original := (d.GetData())[i]
			deltaCopy := append([]any(nil), original...)
			obs.StoreArray(deltaCopy)
		}
	case [][]any:
		for i := 0; i < len(d); i++ {
			// 	if iobs, ok := obs.(*IndexedOrderBookSide); ok {
			// 		iobs.SetLen(i)
			// 	}
			original := d[i]
			deltaCopy := append([]any(nil), original...)
			obs.StoreArray(deltaCopy)
		}
	case []any:
		for i := 0; i < len(d); i++ {
			// if iobs, ok := obs.(*IndexedOrderBookSide); ok {
			// 	iobs.SetLen(i)
			// }
			original := d[i]
			if originalArray, ok := original.([]any); ok {
				deltaCopy := append([]any(nil), originalArray...)
				obs.StoreArray(deltaCopy)
			}
			//     panic(fmt.Sprintf("NewOrderBookSide: invalid delta type %v", reflect.TypeOf(original)))
			// }
		}
	}
	return obs
}

func (obs *OrderBookSide) StoreArray(delta any) {

	obs.Mutex.Lock()
	defer obs.Mutex.Unlock()

	deltaArray, isArray := delta.([]float64)
	deltaOB, isOB := delta.(IOrderBookSide)
	deltaInterface, isInterface := delta.([]any)
	var price float64
	var size float64
	if isArray {
		price = deltaArray[0]
		size = deltaArray[1]
	} else if isOB {
		if len(deltaOB.GetData()) > 0 && len((deltaOB.GetData())[0]) >= 2 {
			price = (deltaOB.GetData())[0][0].(float64)
			size = (deltaOB.GetData())[0][1].(float64)
		}
	} else if isInterface {
		price = normalizeNumber(deltaInterface[0])
		size = normalizeNumber(deltaInterface[1])
	}
	var indexPrice float64
	if obs.Side {
		indexPrice = -price
	} else {
		indexPrice = price
	}

	index := bisectLeft(obs.Index, indexPrice)

	if size != 0 {
		if obs.Index[index] == indexPrice {
			obs.Data[index][1] = size
		} else {
			obs.Length++
			// copyWithin equivalent, bounded by the live prefix: everything
			// from Length on is the MaxFloat64 seed sentinel, so shifting the
			// whole capacity memmoved ~1000 sentinels on every insert
			copy(obs.Index[index+1:obs.Length], obs.Index[index:obs.Length-1])
			obs.Index[index] = indexPrice

			// Insert into Data array - ensure it grows with Length
			obs.Data = append(obs.Data, nil)
			copy(obs.Data[index+1:], obs.Data[index:obs.Len()-1])
			if isArray {
				obs.Data[index] = []any{deltaArray[0], deltaArray[1]}
			} else if isOB {
				obs.Data[index] = []any{(deltaOB.GetData())[0][0], (deltaOB.GetData())[0][1]}
			} else if isInterface {
				obs.Data[index] = deltaInterface
			}

			// In the rare case of very large orderbooks being sent
			if obs.Length > len(obs.Index)-1 {
				newIndex := make([]float64, len(obs.Index)*2)
				copy(newIndex, obs.Index)
				for i := len(obs.Index); i < len(newIndex); i++ {
					newIndex[i] = math.MaxFloat64
				}
				obs.Index = newIndex
			}
		}
	} else if obs.Index[index] == indexPrice {
		// Remove element
		copy(obs.Index[index:obs.Length-1], obs.Index[index+1:obs.Length])
		obs.Index[obs.Length-1] = math.MaxFloat64

		copy(obs.Data[index:], obs.Data[index+1:])
		obs.Data = obs.Data[:obs.Length-1]
		obs.Length--
	}
}

func normalizeNumber(value any) float64 {
	switch v := value.(type) {
	case float64:
		return v
	case int:
		return float64(v)
	case int64:
		return float64(v)
	case string:
		f, err := strconv.ParseFloat(v, 64)
		if err != nil {
			panic(fmt.Sprintf("normalizeNumber: cannot convert string to float: %v", err))
		}
		return f
	default:
		panic(fmt.Sprintf("normalizeNumber: unsupported type %v", reflect.TypeOf(value)))
	}
}

// Store indexes an incoming delta in the string-price-keyed dictionary
func (obs *OrderBookSide) Store(price any, size any) error {
	obs.StoreArray([]float64{normalizeNumber(price), normalizeNumber(size)})
	return nil
}

// Limit replaces stored orders with new values
func (obs *OrderBookSide) Limit() {
	obs.Mutex.Lock()
	defer obs.Mutex.Unlock()

	if obs.Length > obs.Depth {
		for i := obs.Depth; i < obs.Length; i++ {
			obs.Index[i] = math.MaxFloat64
			// obs.Length--
		}
		// Ensure Data array is synchronized with new Length
		if obs.Length > obs.Depth {
			obs.Data = obs.Data[:obs.Depth]
		}
		obs.Length = obs.Depth
	}
}

type CountedOrderBookSide struct {
	*OrderBookSide
}

// NewCountedOrderBookSide constructor
func NewCountedOrderBookSide(side bool, deltas any, depth any) *CountedOrderBookSide {

	// orderBookSide := &CountedOrderBookSide{
	// 	OrderBookSide: NewOrderBookSide(side, deltas, depth),
	// }
	orderBookSide := &OrderBookSide{
		Data:   make([][]any, 0),
		Index:  make([]float64, len(SEED)),
		Length: 0,
		Depth:  math.MaxInt32,
		Side:   side,
	}

	countedOrderBookSide := &CountedOrderBookSide{
		OrderBookSide: orderBookSide,
	}
	result := Init(countedOrderBookSide, deltas, depth)
	return result.(*CountedOrderBookSide)
}

func (cobs *CountedOrderBookSide) Store(price any, size any) error {
	return errors.New("CountedOrderBookSide.Store() is not supported, use StoreArray([price, size, count]) instead")
}

// StoreArray handles deltas with count (3 elements: price, size, count)
func (obs *CountedOrderBookSide) StoreArray(delta any) {

	obs.OrderBookSide.Mutex.Lock()
	defer obs.OrderBookSide.Mutex.Unlock()

	deltaArray, isArray := delta.([]any)
	deltaOB, isOB := delta.(IOrderBookSide)
	deltaInterface, isInterface := delta.([]any)
	var price float64
	var size float64
	var count any
	if isArray {
		price = normalizeNumber(deltaArray[0])
		size = normalizeNumber(deltaArray[1])
		count = deltaArray[2]
	} else if isOB {
		price = (deltaOB.GetData())[0][0].(float64)
		size = (deltaOB.GetData())[0][1].(float64)
		count = (deltaOB.GetData())[0][2]
	} else if isInterface {
		price = normalizeNumber(deltaInterface[0])
		size = normalizeNumber(deltaInterface[1])
		count = deltaInterface[2]
	}
	var indexPrice float64
	if obs.Side {
		indexPrice = -price
	} else {
		indexPrice = price
	}

	index := bisectLeft(obs.Index, indexPrice)

	if size != 0 && count != 0 {
		if obs.Index[index] == indexPrice {
			obs.Data[index][1] = size
			obs.Data[index][2] = count
		} else {
			obs.Length++
			// copyWithin equivalent, bounded by the live prefix, see StoreArray
			copy(obs.Index[index+1:obs.Length], obs.Index[index:obs.Length-1])
			obs.Index[index] = indexPrice

			// Insert into Data array - ensure it grows with Length
			obs.Data = append(obs.Data, nil)
			copy(obs.Data[index+1:], obs.Data[index:obs.Len()-1])
			if isArray {
				obs.Data[index] = []any{deltaArray[0], deltaArray[1], deltaArray[2]}
			} else if isOB {
				obs.Data[index] = []any{(deltaOB.GetData())[0][0], (deltaOB.GetData())[0][1], (deltaOB.GetData())[0][2]}
			} else if isInterface {
				obs.Data[index] = deltaInterface
			}

			// In the rare case of very large orderbooks being sent
			if obs.Length > len(obs.Index)-1 {
				newIndex := make([]float64, len(obs.Index)*2)
				copy(newIndex, obs.Index)
				for i := len(obs.Index); i < len(newIndex); i++ {
					newIndex[i] = math.MaxFloat64
				}
				obs.Index = newIndex
			}
		}
	} else if obs.Index[index] == indexPrice {
		// Remove element
		copy(obs.Index[index:obs.Length-1], obs.Index[index+1:obs.Length])
		obs.Index[obs.Length-1] = math.MaxFloat64

		copy(obs.Data[index:], obs.Data[index+1:])
		obs.Data = obs.Data[:obs.Length-1]
		obs.Length--
	}
}

type IndexedOrderBookSide struct {
	*OrderBookSide
	Hashmap map[any]float64 // string-keyed dictionary of price levels / ids / indices
	Data    [][]any         // equivalent to extending Array
	Index   []float64       // string-keyed dictionary of price levels / ids / indices
	Depth   int             // depth limit
	Length  int             // current Length
	Side    bool            // false is asks, true is bids
	Mutex   sync.RWMutex    // protects concurrent access
}

func NewIndexedOrderBookSide(side bool, deltas any, depth any) *IndexedOrderBookSide {
	dataLength := 0
	switch d := deltas.(type) {
	case []float64:
		dataLength = len(d)
	case []any:
		dataLength = len(d)
	case IOrderBookSide:
		dataLength = d.Len()
	}

	orderBookSide := &IndexedOrderBookSide{
		Data:    make([][]any, dataLength),
		Index:   make([]float64, len(SEED)),
		Length:  0,
		Depth:   math.MaxInt32,
		Hashmap: make(map[any]float64),
		Side:    side,
	}
	result := Init(orderBookSide, deltas, depth)
	return result.(*IndexedOrderBookSide)
}

func (iobs *IndexedOrderBookSide) Store(price any, size any) error {
	return errors.New("IndexedOrderBook.Store() is not supported, use StoreArray([price, size, id]) instead")
}

// ids arrive as freshly parsed json values whose dynamic type can differ from
// delta to delta (json number vs string), and go interface equality is type
// sensitive, so hashmap keys and row-id comparisons are normalized through a
// single string form, mirroring the C# lane of
// https://github.com/ccxt/ccxt/pull/29749
func normalizeId(id any) string {
	switch v := id.(type) {
	case string:
		return v
	case float64:
		return strconv.FormatFloat(v, 'f', -1, 64)
	default:
		return fmt.Sprint(v)
	}
}

// bounded row lookup by normalized id from a bisect position, -1 when the row
// is gone, so a stale hashmap entry degrades gracefully instead of walking off
// the slice with an index-out-of-range panic that would kill the ws read
// goroutine, see https://github.com/ccxt/ccxt/pull/29749
func (obs *IndexedOrderBookSide) findRowById(start int, id string) int {
	index := start
	for index < obs.Length && index < len(obs.Data) {
		row := obs.Data[index]
		if len(row) > 2 && normalizeId(row[2]) == id {
			return index
		}
		index++
	}
	return -1
}

// StoreArray handles deltas with id (3 elements: price, size, id)
func (obs *IndexedOrderBookSide) StoreArray(delta any) {

	obs.Mutex.Lock()
	defer obs.Mutex.Unlock()

	deltaArray, isArray := delta.([]any)
	deltaOB, isOB := delta.(IOrderBookSide)
	deltaInterface, isInterface := delta.([]any)
	var price float64
	var size float64
	var id any
	// price and size can legitimately arrive as nil, e.g. bitmex sends its
	// orderBookL2 updates and deletes without a price, and normalizeNumber
	// panics on nil, so nil is tracked instead of converted; a nil size is a
	// removal, a nil price is recovered from the hashmap below,
	// see https://github.com/ccxt/ccxt/pull/29749
	priceMissing := false
	var rawPrice any
	var rawSize any
	if isArray {
		rawPrice = deltaArray[0]
		rawSize = deltaArray[1]
		id = deltaArray[2]
	} else if isOB {
		if len(deltaOB.GetData()) > 0 && len((deltaOB.GetData())[0]) >= 2 {
			rawPrice = (deltaOB.GetData())[0][0]
			rawSize = (deltaOB.GetData())[0][1]
			id = (deltaOB.GetData())[0][2]
		}
	} else if isInterface {
		rawPrice = deltaInterface[0]
		rawSize = deltaInterface[1]
		id = deltaInterface[2]
	}
	if rawPrice == nil {
		priceMissing = true
	} else {
		price = normalizeNumber(rawPrice)
	}
	if rawSize != nil {
		size = normalizeNumber(rawSize)
	}
	var indexPrice float64
	if !priceMissing && price != 0 {
		if obs.Side {
			indexPrice = -price
		} else {
			indexPrice = price
		}
	} else {
		// no usable price on this delta: recovered from the hashmap below for
		// known ids, unknown ids without a price cannot be placed
		priceMissing = true
	}

	stringId := normalizeId(id)
	oldIdPrice, idInHashmap := obs.Hashmap[stringId]
	if size != 0 {
		if idInHashmap {
			if priceMissing {
				// the former check here compared against 0 while the missing
				// price sentinel was MaxFloat64, so this recovery never fired
				// and a price-less update corrupted the row,
				// see https://github.com/ccxt/ccxt/pull/29749
				indexPrice = oldIdPrice
				priceMissing = false
			}
			if deltaArray != nil {
				deltaArray[0] = math.Abs(indexPrice)
			}
			if indexPrice == oldIdPrice {
				index := obs.findRowById(bisectLeft(obs.Index, indexPrice), stringId)
				if index >= 0 {
					obs.Index[index] = indexPrice
					// Store the entire delta array like TypeScript does
					if isArray {
						obs.Data[index] = []any{deltaArray[0], deltaArray[1], deltaArray[2]}
					} else if isInterface {
						obs.Data[index] = deltaInterface
					} else if isOB {
						obs.Data[index] = (deltaOB.GetData())[0]
					}
					return
				}
				// stale hashmap entry, the row is gone: fall through and
				// insert as new, see https://github.com/ccxt/ccxt/pull/29749
			} else {
				oldIndex := obs.findRowById(bisectLeft(obs.Index, oldIdPrice), stringId)
				if oldIndex >= 0 {
					copy(obs.Index[oldIndex:obs.Length-1], obs.Index[oldIndex+1:obs.Length])
					obs.Index[obs.Length-1] = math.MaxFloat64
					copy(obs.Data[oldIndex:], obs.Data[oldIndex+1:])
					obs.Data = obs.Data[:obs.Length-1]
					obs.Length--
				}
				// stale entry: nothing to move, fall through and insert as new
			}
		}
		if priceMissing {
			// unknown id with no price on the delta: there is nowhere to
			// place the level, drop it instead of inserting at the sentinel
			return
		}
		obs.Hashmap[stringId] = indexPrice
		var index int = bisectLeft(obs.Index, indexPrice)
		// for index < obs.Length && obs.Index[index] == indexPrice && obs.Index[2] < id.(float64) { // TODO: this makes no sense, id is type [string, string]
		for index < obs.Length && obs.Index[index] == indexPrice { // TODO: this makes no sense, id is type [string, string]
			index++
		}
		// insert new price level into index
		obs.Length++
		// shift only the live prefix; slots from Length on are MaxFloat64
		// sentinels, so no extra slot has to be appended to make space. The
		// former append grew Index by one slot per insert while the delete
		// branch below never shrank it back, so Index leaked one float64 per
		// insert/delete cycle
		copy(obs.Index[index+1:obs.Length], obs.Index[index:obs.Length-1])
		obs.Index[index] = indexPrice
		obs.Data = append(obs.Data, nil)
		copy(obs.Data[index+1:], obs.Data[index:obs.Length-1])
		// Store the entire delta array like TypeScript does
		if isArray {
			obs.Data[index] = []any{deltaArray[0], deltaArray[1], deltaArray[2]}
		} else if isInterface {
			obs.Data[index] = deltaInterface
		} else if isOB {
			// Convert interface array to float64 array
			data := deltaOB.GetData()
			floatArray := make([]any, len(data))
			for i, v := range data[0] { // TODO: correct?
				if f, ok := v.(float64); ok {
					floatArray[i] = f
				} else if s, ok := v.(string); ok {
					// Handle string values by converting to float64
					if f, err := strconv.ParseFloat(s, 64); err == nil {
						floatArray[i] = f
					}
				}
			}
			obs.Data[index] = floatArray
		}
		// in the rare case of very large orderbooks being sent
		if obs.Length > len(obs.Index)-1 {
			newIndex := make([]float64, len(obs.Index)*2)
			copy(newIndex, obs.Index)
			for i := len(obs.Index); i < len(newIndex); i++ {
				newIndex[i] = math.MaxFloat64
			}
			obs.Index = newIndex
		}
	} else if idInHashmap {
		index := obs.findRowById(bisectLeft(obs.Index, oldIdPrice), stringId)
		if index >= 0 {
			copy(obs.Index[index:obs.Length-1], obs.Index[index+1:obs.Length])
			obs.Index[obs.Length-1] = math.MaxFloat64

			copy(obs.Data[index:], obs.Data[index+1:])
			obs.Data = obs.Data[:obs.Length-1]
			obs.Length--
		}
		// a stale entry has no row to remove, just heal the hashmap,
		// see https://github.com/ccxt/ccxt/pull/29749
		delete(obs.Hashmap, stringId)
	}

}

// Limit replaces stored orders with new values
func (iobs *IndexedOrderBookSide) Limit() {
	iobs.Mutex.Lock()
	defer iobs.Mutex.Unlock()

	if iobs.Length > iobs.Depth {
		for i := iobs.Depth; i < iobs.Length && i < len(iobs.Data); i++ {
			if len(iobs.Data[i]) > 2 {
				delete(iobs.Hashmap, normalizeId(iobs.Data[i][2]))
			}
			iobs.Index[i] = math.MaxFloat64
		}
	}
	if iobs.Length > iobs.Depth {
		iobs.Data = iobs.Data[:iobs.Depth]
		iobs.Length = iobs.Depth
	}
}

// Asks and Bids types - these are just OrderBookSide with different Side values

type Asks struct {
	*OrderBookSide
}
type Bids struct {
	*OrderBookSide
}
type CountedAsks struct {
	*CountedOrderBookSide
}
type CountedBids struct {
	*CountedOrderBookSide
}
type IndexedAsks struct {
	*IndexedOrderBookSide
}
type IndexedBids struct {
	*IndexedOrderBookSide
}

func NewAsks(deltas any, depth any) *OrderBookSide {
	obs := NewOrderBookSide(false, deltas, depth)
	return obs
}

func NewBids(deltas any, depth any) *OrderBookSide {
	obs := NewOrderBookSide(true, deltas, depth)
	return obs
}

func NewCountedAsks(deltas any, depth any) *CountedOrderBookSide {
	cobs := NewCountedOrderBookSide(false, deltas, depth)
	// cobs.Side = false
	return cobs
}

func NewCountedBids(deltas any, depth any) *CountedOrderBookSide {
	cobs := NewCountedOrderBookSide(true, deltas, depth)
	return cobs
}

func NewIndexedAsks(deltas any, depth any) *IndexedOrderBookSide {
	iobs := NewIndexedOrderBookSide(false, deltas, depth)
	// iobs.Side = false
	return iobs
}

func NewIndexedBids(deltas any, depth any) *IndexedOrderBookSide {
	iobs := NewIndexedOrderBookSide(true, deltas, depth)
	// iobs.Side = true
	return iobs
}

// String returns a formatted string representation of the OrderBookSide struct
func (obs *OrderBookSide) String() string {
	var result strings.Builder
	result.WriteString("OrderBookSide{")

	// Show the actual order data (price/amount pairs)
	if obs.Length > 0 {
		result.WriteString(" Orders:[")
		for i := 0; i < obs.Length && i < len(obs.Data); i++ {
			if i > 0 {
				result.WriteString(" ")
			}
			if len(obs.Data[i]) >= 2 {
				// Show price and size
				result.WriteString(fmt.Sprintf("[%.4f %.4f", obs.Data[i][0], obs.Data[i][1]))
				// Handle the third element properly - it's an array, not a float
				if len(obs.Data[i]) > 2 {
					result.WriteString(fmt.Sprintf(" %v", obs.Data[i][2]))
				}
				result.WriteString("]")
			}
		}
		result.WriteString("]")
	} else {
		result.WriteString(" Orders:[]")
	}

	result.WriteString(fmt.Sprintf(" Length:%d", obs.Length))
	result.WriteString(fmt.Sprintf(" Depth:%d", obs.Depth))
	result.WriteString(fmt.Sprintf(" Side:%v", obs.Side))
	result.WriteString("}")

	return result.String()
}

func (obs *OrderBookSide) Len() int {
	return obs.Length
}
func (obs *OrderBookSide) GetData() [][]any {
	return obs.Data
}

// assumes the first two elements are float64 and the third element is a primitive
func (obs *OrderBookSide) GetDataCopy() [][]any {
	if obs == nil {
		return [][]any{}
	}

	obs.Mutex.RLock() // read lock prevents writes while copying
	defer obs.Mutex.RUnlock()

	if obs.Data == nil {
		return [][]any{}
	}

	out := make([][]any, len(obs.Data))

	for i, slice := range obs.Data {
		if slice == nil {
			out[i] = []any{}
			continue
		}

		newSlice := make([]any, len(slice))
		for j, val := range slice {
			switch v := val.(type) {
			case map[string]any:
				newMap := make(map[string]any, len(v))
				for key, value := range v {
					newMap[key] = value
				}
				newSlice[j] = newMap
			case []any:
				newSlice[j] = append([]any{}, v...)
			default:
				newSlice[j] = v
			}
		}
		out[i] = newSlice
	}

	return out
}

func (ords *OrderBookSide) GetSide() bool {
	return ords.Side
}

func (obs *OrderBookSide) CopySide() IOrderBookSide {
	obs.Mutex.RLock()
	defer obs.Mutex.RUnlock()

	out := NewOrderBookSide(obs.Side, [][]any{}, obs.Depth)
	base := out
	base.Length = obs.Length
	base.Index = make([]float64, len(obs.Index))
	copy(base.Index, obs.Index)
	base.Data = make([][]any, len(obs.Data))
	for i, row := range obs.Data {
		base.Data[i] = append([]any(nil), row...)
	}
	return out
}

func (cobs *CountedOrderBookSide) CopySide() IOrderBookSide {
	cobs.OrderBookSide.Mutex.RLock()
	defer cobs.OrderBookSide.Mutex.RUnlock()

	out := NewCountedOrderBookSide(cobs.OrderBookSide.Side, [][]any{}, cobs.OrderBookSide.Depth)
	base := out.OrderBookSide
	base.Length = cobs.OrderBookSide.Length
	base.Index = make([]float64, len(cobs.OrderBookSide.Index))
	copy(base.Index, cobs.OrderBookSide.Index)
	base.Data = make([][]any, len(cobs.OrderBookSide.Data))
	for i, row := range cobs.OrderBookSide.Data {
		base.Data[i] = append([]any(nil), row...)
	}
	return out
}

func (iobs *IndexedOrderBookSide) CopySide() IOrderBookSide {
	iobs.Mutex.RLock()
	defer iobs.Mutex.RUnlock()

	out := NewIndexedOrderBookSide(iobs.OrderBookSide.Side, [][]any{}, iobs.OrderBookSide.Depth)
	out.Length = iobs.Length
	out.Index = make([]float64, len(iobs.Index))
	copy(out.Index, iobs.Index)
	out.Data = make([][]any, len(iobs.Data))
	for i, row := range iobs.Data {
		out.Data[i] = append([]any(nil), row...)
	}
	out.Hashmap = make(map[any]float64, len(iobs.Hashmap))
	for k, v := range iobs.Hashmap {
		out.Hashmap[k] = v
	}
	return out
}
func (obs *OrderBookSide) SetLen(length int) {
	obs.Length = length
}
func (obs *OrderBookSide) SetData(data [][]any) {
	obs.Data = data
}
func (obs *OrderBookSide) GetIndex() *[]float64 {
	return &obs.Index
}

func (obs *OrderBookSide) SetDepth(depth int) {
	obs.Depth = depth
}
func (obs *CountedOrderBookSide) SetLen(length int) {
	obs.OrderBookSide.SetLen(length)
}
func (obs *CountedOrderBookSide) GetData() [][]any {
	return obs.OrderBookSide.GetData()
}
func (obs *CountedOrderBookSide) GetDataCopy() [][]any {
	return obs.OrderBookSide.GetDataCopy()
}
func (obs *CountedOrderBookSide) SetData(data [][]any) {
	obs.OrderBookSide.SetData(data)
}
func (obs *CountedOrderBookSide) GetIndex() *[]float64 {
	return obs.OrderBookSide.GetIndex()
}
func (obs *CountedOrderBookSide) String() string {
	return obs.OrderBookSide.String()
}
func (obs *CountedOrderBookSide) Len() int {
	return obs.Length
}
func (obs *CountedOrderBookSide) SetDepth(depth int) {
	obs.OrderBookSide.SetDepth(depth)
}
func (obs *CountedOrderBookSide) GetValue(key string, defaultValue any) any {
	return obs.OrderBookSide.GetValue(key, defaultValue)
}
func (obs *IndexedOrderBookSide) SetLen(length int) {
	obs.Length = length
}
func (obs *IndexedOrderBookSide) SetData(data [][]any) {
	obs.Data = data
}
func (obs *IndexedOrderBookSide) GetIndex() *[]float64 {
	return &obs.Index
}
func (obs *IndexedOrderBookSide) String() string {
	return obs.OrderBookSide.String()
}
func (obs *IndexedOrderBookSide) GetData() [][]any {
	return obs.Data
}

// MarshalJSON emits the side as a plain array of price levels, the promoted
// method from the embedded OrderBookSide would see a nil receiver because the
// embedded pointer is never set for indexed sides and the data lives in the
// shadowing Data field, see https://github.com/ccxt/ccxt/issues/29586
func (obs *IndexedOrderBookSide) MarshalJSON() ([]byte, error) {
	if obs == nil {
		return []byte("[]"), nil
	}
	obs.Mutex.RLock()
	defer obs.Mutex.RUnlock()
	if obs.Data == nil {
		return []byte("[]"), nil
	}
	return json.Marshal(obs.Data)
}
func (obs *IndexedOrderBookSide) GetDataCopy() [][]any {
	// data lives in the shadowing Data field guarded by the shadowing Mutex,
	// the embedded OrderBookSide pointer is nil for indexed sides, so delegating
	// upward always returned an empty copy, see https://github.com/ccxt/ccxt/issues/29586
	if obs == nil {
		return [][]any{}
	}

	obs.Mutex.RLock()
	defer obs.Mutex.RUnlock()

	if obs.Data == nil {
		return [][]any{}
	}

	out := make([][]any, len(obs.Data))

	for i, slice := range obs.Data {
		if slice == nil {
			out[i] = []any{}
			continue
		}

		newSlice := make([]any, len(slice))
		for j, val := range slice {
			switch v := val.(type) {
			case map[string]any:
				newMap := make(map[string]any, len(v))
				for key, value := range v {
					newMap[key] = value
				}
				newSlice[j] = newMap
			case []any:
				newSlice[j] = append([]any{}, v...)
			default:
				newSlice[j] = v
			}
		}
		out[i] = newSlice
	}

	return out
}
func (obs *IndexedOrderBookSide) Len() int {
	return obs.Length
}
func (obs *IndexedOrderBookSide) SetDepth(depth int) {
	obs.Depth = depth
}
func (iobs *IndexedOrderBookSide) GetValue(key string, defaultValue any) any {
	switch key {
	case "Data":
		return iobs.Data
	case "Index":
		return iobs.Index
	case "Depth":
		return iobs.Depth
	case "Length":
		return iobs.Length
	case "Side":
		return iobs.Side
	case "Hashmap":
		return iobs.Hashmap
	default:
		return defaultValue
	}
}
