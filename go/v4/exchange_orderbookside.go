package ccxt

import (
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"reflect"
	"strconv"
	"strings"
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
	Data   [][]any   `json:"data"` // equivalent to extending Array
	Index  []float64 `json:"-"`    // string-keyed dictionary of price levels / ids / indices
	Depth  int       `json:"-"`    // depth limit
	Length int       `json:"-"`    // current Length
	Side   bool      `json:"-"`    // false is asks, true is bids
	// view carries the published side. The goroutine that mutates the book is
	// its only owner: it copy-on-writes Data/Index and re-publishes, readers
	// only ever read the published copy, so no critical section is needed.
	view chan sideView
}

// sideView is the immutable published state of one book side.
type sideView struct {
	data    [][]any
	index   []float64
	length  int
	depth   int
	hashmap map[any]float64 // id-keyed side only, nil elsewhere
}

func newSideView() chan sideView {
	view := make(chan sideView, 1)
	view <- sideView{}
	return view
}

// publish hands the slices the owner just built to readers.
func (obs *OrderBookSide) publish() {
	if obs.view == nil {
		return
	}
	<-obs.view
	obs.view <- sideView{data: obs.Data, index: obs.Index, length: obs.Length, depth: obs.Depth}
}

// snapshot reads the published side without taking it away from other readers.
func (obs *OrderBookSide) snapshot() sideView {
	if obs.view == nil {
		return sideView{data: obs.Data, index: obs.Index, length: obs.Length, depth: obs.Depth}
	}
	current := <-obs.view
	obs.view <- current
	return current
}

// ownData and ownIndex copy-on-write the live arrays, so the published view
// keeps the contents readers may still be walking.
func (obs *OrderBookSide) ownData() {
	rows := make([][]any, len(obs.Data))
	copy(rows, obs.Data)
	obs.Data = rows
}

func (obs *OrderBookSide) ownIndex() {
	obs.Index = append([]float64(nil), obs.Index...)
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
	published := obs.snapshot()
	if published.data == nil {
		return []byte("[]"), nil
	}
	return json.Marshal(published.data)
}

func (obs *OrderBookSide) GetValue(key string, defaultValue any) any {
	published := obs.snapshot()
	switch key {
	case "Data":
		return published.data
	case "Index":
		return published.index
	case "Depth":
		return published.depth
	case "Length":
		return published.length
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
		view:   newSideView(),
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

	obs.ownData()
	obs.ownIndex()
	defer obs.publish()

	deltaArray, isArray := delta.([]float64)
	deltaOB, isOB := delta.(IOrderBookSide)
	deltaInterface, isInterface := delta.([]any)
	if isInterface {
		derefDelta(deltaInterface)
	}
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
			row := append([]any(nil), obs.Data[index]...)
			row[1] = size
			obs.Data[index] = row
		} else {
			obs.Length++
			// Live prefix only: [Length:] is MaxFloat64 seed, not book data.
			copy(obs.Index[index+1:obs.Length], obs.Index[index:obs.Length-1])
			obs.Index[index] = indexPrice

			// Insert into Data array - ensure it grows with Length
			obs.Data = append(obs.Data, nil)
			copy(obs.Data[index+1:], obs.Data[index:obs.Length-1])
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

// derefDelta flattens typed pointer elements (*float64, *string, *int64, ...)
// of an incoming delta row into the values they point at, in place. The go
// emitter types Safe*/Precise locals as pointers since
// https://github.com/ccxt/ccxt/pull/30054, and transpiled exchange code puts
// such locals straight into []any delta literals, so rows arrive as
// [*float64, *float64, *string]. The book's structural machinery (bisect
// index, id hashmap, row-id comparisons, stored-row equality) needs flat
// scalars: a pointer-priced row bisects to a duplicate level, and a
// pointer-keyed id never matches its flat form on lookup, turning replaces
// into duplicates and zero-size deletes into no-ops. Normalizing once at the
// storage boundary keeps every exchange and every entry path (snapshot seed
// via Init and live deltas alike) correct without touching generated code.
func derefDelta(delta []any) {
	for i, v := range delta {
		delta[i] = derefScalar(v)
	}
}

func normalizeNumber(value any) float64 {
	switch v := derefScalar(value).(type) {
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
	obs.ownData()
	obs.ownIndex()
	defer obs.publish()

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
		view:   newSideView(),
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

	obs.OrderBookSide.ownData()
	obs.OrderBookSide.ownIndex()
	defer obs.OrderBookSide.publish()

	deltaArray, isArray := delta.([]any)
	deltaOB, isOB := delta.(IOrderBookSide)
	deltaInterface, isInterface := delta.([]any)
	if isArray {
		// deltaInterface shares the same backing array
		derefDelta(deltaArray)
	}
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
			row := append([]any(nil), obs.Data[index]...)
			row[1] = size
			row[2] = count
			obs.Data[index] = row
		} else {
			obs.Length++
			// Live prefix only: [Length:] is MaxFloat64 seed, not book data.
			copy(obs.Index[index+1:obs.Length], obs.Index[index:obs.Length-1])
			obs.Index[index] = indexPrice

			// Insert into Data array - ensure it grows with Length
			obs.Data = append(obs.Data, nil)
			copy(obs.Data[index+1:], obs.Data[index:obs.Length-1])
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
	// view publishes the shadowing Data/Index/Depth/Length fields; the owner
	// copy-on-writes them and re-publishes, readers read the published copy.
	view chan sideView
}

func (iobs *IndexedOrderBookSide) publishIndexed() {
	if iobs.view == nil {
		return
	}
	<-iobs.view
	iobs.view <- sideView{data: iobs.Data, index: iobs.Index, length: iobs.Length, depth: iobs.Depth, hashmap: iobs.Hashmap}
}

func (iobs *IndexedOrderBookSide) snapshotIndexed() sideView {
	if iobs.view == nil {
		return sideView{data: iobs.Data, index: iobs.Index, length: iobs.Length, depth: iobs.Depth, hashmap: iobs.Hashmap}
	}
	current := <-iobs.view
	iobs.view <- current
	return current
}

func (iobs *IndexedOrderBookSide) ownIndexedData() {
	rows := make([][]any, len(iobs.Data))
	copy(rows, iobs.Data)
	iobs.Data = rows
}

func (iobs *IndexedOrderBookSide) ownIndexedIndex() {
	iobs.Index = append([]float64(nil), iobs.Index...)
}

func (iobs *IndexedOrderBookSide) ownIndexedHashmap() {
	ids := make(map[any]float64, len(iobs.Hashmap))
	for id, price := range iobs.Hashmap {
		ids[id] = price
	}
	iobs.Hashmap = ids
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
		view:    newSideView(),
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
	// deref first: an id that slipped in as *string (see derefDelta) must key
	// the hashmap by its value, not by fmt.Sprint's pointer address
	switch v := derefScalar(id).(type) {
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

	obs.ownIndexedData()
	obs.ownIndexedIndex()
	obs.ownIndexedHashmap()
	defer obs.publishIndexed()

	deltaArray, isArray := delta.([]any)
	deltaOB, isOB := delta.(IOrderBookSide)
	deltaInterface, isInterface := delta.([]any)
	if isArray {
		// deltaInterface shares the same backing array
		derefDelta(deltaArray)
	}
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
		// Live prefix only: [Length:] is MaxFloat64 seed, not book data.
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
	iobs.ownIndexedData()
	iobs.ownIndexedIndex()
	iobs.ownIndexedHashmap()
	defer iobs.publishIndexed()

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
	published := obs.snapshot()
	var result strings.Builder
	result.WriteString("OrderBookSide{")

	// Show the actual order data (price/amount pairs)
	if published.length > 0 {
		result.WriteString(" Orders:[")
		for i := 0; i < published.length && i < len(published.data); i++ {
			if i > 0 {
				result.WriteString(" ")
			}
			if len(published.data[i]) >= 2 {
				// Show price and size
				result.WriteString(fmt.Sprintf("[%.4f %.4f", published.data[i][0], published.data[i][1]))
				// Handle the third element properly - it's an array, not a float
				if len(published.data[i]) > 2 {
					result.WriteString(fmt.Sprintf(" %v", published.data[i][2]))
				}
				result.WriteString("]")
			}
		}
		result.WriteString("]")
	} else {
		result.WriteString(" Orders:[]")
	}

	result.WriteString(fmt.Sprintf(" Length:%d", published.length))
	result.WriteString(fmt.Sprintf(" Depth:%d", published.depth))
	result.WriteString(fmt.Sprintf(" Side:%v", obs.Side))
	result.WriteString("}")

	return result.String()
}

func (obs *OrderBookSide) Len() int {
	return obs.snapshot().length
}
func (obs *OrderBookSide) GetData() [][]any {
	return obs.snapshot().data
}

// assumes the first two elements are float64 and the third element is a primitive
func (obs *OrderBookSide) GetDataCopy() [][]any {
	if obs == nil {
		return [][]any{}
	}

	published := obs.snapshot() // the published rows are immutable, so the copy cannot tear
	if published.data == nil {
		return [][]any{}
	}

	out := make([][]any, len(published.data))

	for i, slice := range published.data {
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

func (obs *OrderBookSide) CopySide() IOrderBookSide {
	published := obs.snapshot()

	out := NewOrderBookSide(obs.Side, [][]any{}, published.depth)
	base := out
	base.Length = published.length
	base.Index = make([]float64, len(published.index))
	copy(base.Index, published.index)
	base.Data = make([][]any, len(published.data))
	for i, row := range published.data {
		base.Data[i] = append([]any(nil), row...)
	}
	base.publish()
	return out
}

func (cobs *CountedOrderBookSide) CopySide() IOrderBookSide {
	published := cobs.OrderBookSide.snapshot()

	out := NewCountedOrderBookSide(cobs.OrderBookSide.Side, [][]any{}, published.depth)
	base := out.OrderBookSide
	base.Length = published.length
	base.Index = make([]float64, len(published.index))
	copy(base.Index, published.index)
	base.Data = make([][]any, len(published.data))
	for i, row := range published.data {
		base.Data[i] = append([]any(nil), row...)
	}
	base.publish()
	return out
}

func (iobs *IndexedOrderBookSide) CopySide() IOrderBookSide {
	published := iobs.snapshotIndexed()

	out := NewIndexedOrderBookSide(iobs.OrderBookSide.Side, [][]any{}, published.depth)
	out.Length = published.length
	out.Index = make([]float64, len(published.index))
	copy(out.Index, published.index)
	out.Data = make([][]any, len(published.data))
	for i, row := range published.data {
		out.Data[i] = append([]any(nil), row...)
	}
	out.Hashmap = make(map[any]float64, len(published.hashmap))
	for k, v := range published.hashmap {
		out.Hashmap[k] = v
	}
	out.publishIndexed()
	return out
}
func (obs *OrderBookSide) SetLen(length int) {
	obs.Length = length
	obs.publish()
}
func (obs *OrderBookSide) SetData(data [][]any) {
	obs.Data = data
	obs.publish()
}

// GetIndex hands back the live index for the owner-side reset path (Reset
// zeroes it before refilling); a mutation through it must be followed by
// SetData/SetLen so readers get the new published copy.
func (obs *OrderBookSide) GetIndex() *[]float64 {
	return &obs.Index
}

func (obs *OrderBookSide) SetDepth(depth int) {
	obs.Depth = depth
	obs.publish()
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
	obs.publishIndexed()
}
func (obs *IndexedOrderBookSide) SetData(data [][]any) {
	obs.Data = data
	obs.publishIndexed()
}
func (obs *IndexedOrderBookSide) GetIndex() *[]float64 {
	return &obs.Index
}
func (obs *IndexedOrderBookSide) String() string {
	return obs.OrderBookSide.String()
}
func (obs *IndexedOrderBookSide) GetData() [][]any {
	return obs.snapshotIndexed().data
}

// MarshalJSON emits the side as a plain array of price levels, the promoted
// method from the embedded OrderBookSide would see a nil receiver because the
// embedded pointer is never set for indexed sides and the data lives in the
// shadowing Data field, see https://github.com/ccxt/ccxt/issues/29586
func (obs *IndexedOrderBookSide) MarshalJSON() ([]byte, error) {
	if obs == nil {
		return []byte("[]"), nil
	}
	published := obs.snapshotIndexed()
	if published.data == nil {
		return []byte("[]"), nil
	}
	return json.Marshal(published.data)
}
func (obs *IndexedOrderBookSide) GetDataCopy() [][]any {
	// data lives in the shadowing Data field published by publishIndexed, the
	// embedded OrderBookSide pointer is nil for indexed sides, so delegating
	// upward always returned an empty copy, see https://github.com/ccxt/ccxt/issues/29586
	if obs == nil {
		return [][]any{}
	}

	published := obs.snapshotIndexed()

	if published.data == nil {
		return [][]any{}
	}

	out := make([][]any, len(published.data))

	for i, slice := range published.data {
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
	return obs.snapshotIndexed().length
}
func (obs *IndexedOrderBookSide) SetDepth(depth int) {
	obs.Depth = depth
	obs.publishIndexed()
}
func (iobs *IndexedOrderBookSide) GetValue(key string, defaultValue any) any {
	published := iobs.snapshotIndexed()
	switch key {
	case "Data":
		return published.data
	case "Index":
		return published.index
	case "Depth":
		return published.depth
	case "Length":
		return published.length
	case "Side":
		return iobs.Side
	case "Hashmap":
		return published.hashmap
	default:
		return defaultValue
	}
}
