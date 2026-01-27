package ccxt

import (
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
	Store(price interface{}, size interface{}) error
	StoreArray(delta interface{})
	Limit()
	Len() int
	SetLen(length int)
	GetData() [][]interface{}
	GetDataCopy() [][]interface{}
	SetData(data [][]interface{})
	GetIndex() *[]float64
	String() string
	SetDepth(depth int)
	GetValue(key string, defaultValue interface{}) interface{}
}

type OrderBookSide struct {
	Data   [][]interface{} `json:"data"` // equivalent to extending Array
	Index  []float64       `json:"-"`    // string-keyed dictionary of price levels / ids / indices
	Depth  int             `json:"-"`    // depth limit
	Length int             `json:"-"`    // current Length
	Side   bool            `json:"-"`    // false is asks, true is bids
	Mutex  sync.RWMutex    `json:"-"`    // protects concurrent access
}

func (obs *OrderBookSide) GetValue(key string, defaultValue interface{}) interface{} {
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

func NewOrderBookSide(side bool, deltas interface{}, depth interface{}) *OrderBookSide {

	orderBookSide := &OrderBookSide{
		Data:   make([][]interface{}, 0),
		Index:  make([]float64, len(SEED)),
		Length: 0,
		Depth:  math.MaxInt32,
		Side:   side,
	}
	result := Init(orderBookSide, deltas, depth)
	return result.(*OrderBookSide)
}

func Init(obs IOrderBookSide, deltas interface{}, depth interface{}) IOrderBookSide {
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
			deltaCopy := append([]interface{}(nil), original...)
			obs.StoreArray(deltaCopy)
		}
	case [][]interface{}:
		for i := 0; i < len(d); i++ {
			// 	if iobs, ok := obs.(*IndexedOrderBookSide); ok {
			// 		iobs.SetLen(i)
			// 	}
			original := d[i]
			deltaCopy := append([]interface{}(nil), original...)
			obs.StoreArray(deltaCopy)
		}
	case []interface{}:
		for i := 0; i < len(d); i++ {
			// if iobs, ok := obs.(*IndexedOrderBookSide); ok {
			// 	iobs.SetLen(i)
			// }
			original := d[i]
			if originalArray, ok := original.([]interface{}); ok {
				deltaCopy := append([]interface{}(nil), originalArray...)
				obs.StoreArray(deltaCopy)
			}
			//     panic(fmt.Sprintf("NewOrderBookSide: invalid delta type %v", reflect.TypeOf(original)))
			// }
		}
	}
	return obs
}

func (obs *OrderBookSide) StoreArray(delta interface{}) {

	obs.Mutex.Lock()
	defer obs.Mutex.Unlock()

	deltaArray, isArray := delta.([]float64)
	deltaOB, isOB := delta.(IOrderBookSide)
	deltaInterface, isInterface := delta.([]interface{})
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
			// copyWithin equivalent
			copy(obs.Index[index+1:], obs.Index[index:])
			obs.Index[index] = indexPrice

			// Insert into Data array - ensure it grows with Length
			obs.Data = append(obs.Data, nil)
			copy(obs.Data[index+1:], obs.Data[index:obs.Len()-1])
			if isArray {
				obs.Data[index] = []interface{}{deltaArray[0], deltaArray[1]}
			} else if isOB {
				obs.Data[index] = []interface{}{(deltaOB.GetData())[0][0], (deltaOB.GetData())[0][1]}
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
		copy(obs.Index[index:], obs.Index[index+1:])
		obs.Index[obs.Length-1] = math.MaxFloat64

		copy(obs.Data[index:], obs.Data[index+1:])
		obs.Data = obs.Data[:obs.Length-1]
		obs.Length--
	}
}

func normalizeNumber(value interface{}) float64 {
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
func (obs *OrderBookSide) Store(price interface{}, size interface{}) error {
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
func NewCountedOrderBookSide(side bool, deltas interface{}, depth interface{}) *CountedOrderBookSide {

	// orderBookSide := &CountedOrderBookSide{
	// 	OrderBookSide: NewOrderBookSide(side, deltas, depth),
	// }
	orderBookSide := &OrderBookSide{
		Data:   make([][]interface{}, 0),
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

func (cobs *CountedOrderBookSide) Store(price interface{}, size interface{}) error {
	return errors.New("CountedOrderBookSide.Store() is not supported, use StoreArray([price, size, count]) instead")
}

// StoreArray handles deltas with count (3 elements: price, size, count)
func (obs *CountedOrderBookSide) StoreArray(delta interface{}) {

	obs.OrderBookSide.Mutex.Lock()
	defer obs.OrderBookSide.Mutex.Unlock()

	deltaArray, isArray := delta.([]interface{})
	deltaOB, isOB := delta.(IOrderBookSide)
	deltaInterface, isInterface := delta.([]interface{})
	var price float64
	var size float64
	var count interface{}
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
			// copyWithin equivalent
			copy(obs.Index[index+1:], obs.Index[index:])
			obs.Index[index] = indexPrice

			// Insert into Data array - ensure it grows with Length
			obs.Data = append(obs.Data, nil)
			copy(obs.Data[index+1:], obs.Data[index:obs.Len()-1])
			if isArray {
				obs.Data[index] = []interface{}{deltaArray[0], deltaArray[1], deltaArray[2]}
			} else if isOB {
				obs.Data[index] = []interface{}{(deltaOB.GetData())[0][0], (deltaOB.GetData())[0][1], (deltaOB.GetData())[0][2]}
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
		copy(obs.Index[index:], obs.Index[index+1:])
		obs.Index[obs.Length-1] = math.MaxFloat64

		copy(obs.Data[index:], obs.Data[index+1:])
		obs.Data = obs.Data[:obs.Length-1]
		obs.Length--
	}
}

type IndexedOrderBookSide struct {
	*OrderBookSide
	Hashmap map[interface{}]float64 // string-keyed dictionary of price levels / ids / indices
	Data    [][]interface{}         // equivalent to extending Array
	Index   []float64               // string-keyed dictionary of price levels / ids / indices
	Depth   int                     // depth limit
	Length  int                     // current Length
	Side    bool                    // false is asks, true is bids
	Mutex   sync.RWMutex            // protects concurrent access
}

func NewIndexedOrderBookSide(side bool, deltas interface{}, depth interface{}) *IndexedOrderBookSide {
	dataLength := 0
	switch d := deltas.(type) {
	case []float64:
		dataLength = len(d)
	case []interface{}:
		dataLength = len(d)
	case IOrderBookSide:
		dataLength = d.Len()
	}

	orderBookSide := &IndexedOrderBookSide{
		Data:    make([][]interface{}, dataLength),
		Index:   make([]float64, len(SEED)),
		Length:  0,
		Depth:   math.MaxInt32,
		Hashmap: make(map[interface{}]float64),
		Side:    side,
	}
	result := Init(orderBookSide, deltas, depth)
	return result.(*IndexedOrderBookSide)
}

func (iobs *IndexedOrderBookSide) Store(price interface{}, size interface{}) error {
	return errors.New("IndexedOrderBook.Store() is not supported, use StoreArray([price, size, id]) instead")
}

// StoreArray handles deltas with id (3 elements: price, size, id)
// StoreArray handles deltas with id (3 elements: price, size, id)
func (obs *IndexedOrderBookSide) StoreArray(delta interface{}) {

	obs.Mutex.Lock()
	defer obs.Mutex.Unlock()

	deltaArray, isArray := delta.([]interface{})
	deltaOB, isOB := delta.(IOrderBookSide)
	deltaInterface, isInterface := delta.([]interface{})
	var price float64
	var size float64
	var id interface{}
	if isArray {
		price = normalizeNumber(deltaArray[0])
		size = normalizeNumber(deltaArray[1])
		id = deltaArray[2]
	} else if isOB {
		if len(deltaOB.GetData()) > 0 && len((deltaOB.GetData())[0]) >= 2 {
			price = normalizeNumber((deltaOB.GetData())[0][0])
			size = normalizeNumber((deltaOB.GetData())[0][1])
			id = (deltaOB.GetData())[0][2]
		}
	} else if isInterface {
		price = normalizeNumber(deltaInterface[0])
		size = normalizeNumber(deltaInterface[1])
		id = deltaInterface[2]
	}
	var indexPrice float64
	if price != 0 {
		if obs.Side {
			indexPrice = -normalizeNumber(price)
		} else {
			indexPrice = normalizeNumber(price)
		}
	} else {
		indexPrice = math.MaxFloat64
	}

	oldIdPrice, idInHashmap := obs.Hashmap[id]
	if size != 0 {
		if idInHashmap {
			if indexPrice == 0 {
				indexPrice = oldIdPrice
			}
			deltaArray[0] = math.Abs(indexPrice) // ? TODO: all types
			if indexPrice == oldIdPrice {
				var index int = bisectLeft(obs.Index, indexPrice)
				for obs.Data[index][2] != id {
					index++
				}
				obs.Index[index] = indexPrice
				// Store the entire delta array like TypeScript does
				if isArray {
					obs.Data[index] = []interface{}{deltaArray[0], deltaArray[1], deltaArray[2]}
				} else if isInterface {
					obs.Data[index] = deltaInterface
				} else if isOB {
					// Convert float64 array to interface array
					obs.Data[index] = (deltaOB.GetData())[0] // TODO: correct?
				}
				return
			} else {
				var oldIndex int = bisectLeft(obs.Index, oldIdPrice)
				for obs.Data[oldIndex][2] != id {
					oldIndex++
				}
				copy(obs.Index[oldIndex:], obs.Index[oldIndex+1:])
				obs.Index = obs.Index[:len(obs.Index)-1]
				obs.Index[obs.Length-1] = math.MaxFloat64
				copy(obs.Data[oldIndex:], obs.Data[oldIndex+1:])
				obs.Data = obs.Data[:obs.Length-1]
				obs.Length--
			}
		}
		obs.Hashmap[id] = indexPrice
		var index int = bisectLeft(obs.Index, indexPrice)
		// for index < obs.Length && obs.Index[index] == indexPrice && obs.Index[2] < id.(float64) { // TODO: this makes no sense, id is type [string, string]
		for index < obs.Length && obs.Index[index] == indexPrice { // TODO: this makes no sense, id is type [string, string]
			index++
		}
		// insert new price level into index
		obs.Length++
		obs.Index = append(obs.Index, 0) // append a dummy value to make space
		copy(obs.Index[index+1:], obs.Index[index:len(obs.Index)-1])
		obs.Index[index] = indexPrice
		obs.Data = append(obs.Data, nil)
		copy(obs.Data[index+1:], obs.Data[index:obs.Length-1])
		// Store the entire delta array like TypeScript does
		if isArray {
			obs.Data[index] = []interface{}{deltaArray[0], deltaArray[1], deltaArray[2]}
		} else if isInterface {
			obs.Data[index] = deltaInterface
		} else if isOB {
			// Convert interface array to float64 array
			data := deltaOB.GetData()
			floatArray := make([]interface{}, len(data))
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
		index := bisectLeft(obs.Index, oldIdPrice)
		for obs.Data[index][2] != id {
			index++
		}
		copy(obs.Index[index:], obs.Index[index+1:])
		obs.Index[obs.Length-1] = math.MaxFloat64

		copy(obs.Data[index:], obs.Data[index+1:])
		obs.Data = obs.Data[:obs.Length-1]
		obs.Length--
		delete(obs.Hashmap, id)
	}

}

// Limit replaces stored orders with new values
func (iobs *IndexedOrderBookSide) Limit() {
	iobs.Mutex.Lock()
	defer iobs.Mutex.Unlock()

	if iobs.Length > iobs.Depth {
		for i := iobs.Depth; i < iobs.Length; i++ {
			delete(iobs.Hashmap, iobs.Data[i][2])
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

func NewAsks(deltas interface{}, depth interface{}) *OrderBookSide {
	obs := NewOrderBookSide(false, deltas, depth)
	return obs
}

func NewBids(deltas interface{}, depth interface{}) *OrderBookSide {
	obs := NewOrderBookSide(true, deltas, depth)
	return obs
}

func NewCountedAsks(deltas interface{}, depth interface{}) *CountedOrderBookSide {
	cobs := NewCountedOrderBookSide(false, deltas, depth)
	// cobs.Side = false
	return cobs
}

func NewCountedBids(deltas interface{}, depth interface{}) *CountedOrderBookSide {
	cobs := NewCountedOrderBookSide(true, deltas, depth)
	return cobs
}

func NewIndexedAsks(deltas interface{}, depth interface{}) *IndexedOrderBookSide {
	iobs := NewIndexedOrderBookSide(false, deltas, depth)
	// iobs.Side = false
	return iobs
}

func NewIndexedBids(deltas interface{}, depth interface{}) *IndexedOrderBookSide {
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
func (obs *OrderBookSide) GetData() [][]interface{} {
	return obs.Data
}

// assumes the first two elements are float64 and the third element is a primitive
func (obs *OrderBookSide) GetDataCopy() [][]interface{} {
	if obs == nil {
		return [][]interface{}{}
	}

	obs.Mutex.RLock() // read lock prevents writes while copying
	defer obs.Mutex.RUnlock()

	if obs.Data == nil {
		return [][]interface{}{}
	}

	out := make([][]interface{}, len(obs.Data))

	for i, slice := range obs.Data {
		if slice == nil {
			out[i] = []interface{}{}
			continue
		}

		newSlice := make([]interface{}, len(slice))
		for j, val := range slice {
			switch v := val.(type) {
			case map[string]interface{}:
				newMap := make(map[string]interface{}, len(v))
				for key, value := range v {
					newMap[key] = value
				}
				newSlice[j] = newMap
			case []interface{}:
				newSlice[j] = append([]interface{}{}, v...)
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
func (obs *OrderBookSide) SetLen(length int) {
	obs.Length = length
}
func (obs *OrderBookSide) SetData(data [][]interface{}) {
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
func (obs *CountedOrderBookSide) GetData() [][]interface{} {
	return obs.OrderBookSide.GetData()
}
func (obs *CountedOrderBookSide) GetDataCopy() [][]interface{} {
	return obs.OrderBookSide.GetDataCopy()
}
func (obs *CountedOrderBookSide) SetData(data [][]interface{}) {
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
func (obs *CountedOrderBookSide) GetValue(key string, defaultValue interface{}) interface{} {
	return obs.OrderBookSide.GetValue(key, defaultValue)
}
func (obs *IndexedOrderBookSide) SetLen(length int) {
	obs.Length = length
}
func (obs *IndexedOrderBookSide) SetData(data [][]interface{}) {
	obs.Data = data
}
func (obs *IndexedOrderBookSide) GetIndex() *[]float64 {
	return &obs.Index
}
func (obs *IndexedOrderBookSide) String() string {
	return obs.OrderBookSide.String()
}
func (obs *IndexedOrderBookSide) GetData() [][]interface{} {
	return obs.Data
}
func (obs *IndexedOrderBookSide) GetDataCopy() [][]interface{} {
	return obs.OrderBookSide.GetDataCopy()
}
func (obs *IndexedOrderBookSide) Len() int {
	return obs.Length
}
func (obs *IndexedOrderBookSide) SetDepth(depth int) {
	obs.Depth = depth
}
func (iobs *IndexedOrderBookSide) GetValue(key string, defaultValue interface{}) interface{} {
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
