package ccxt

import (
	"errors"
	"fmt"
	"math"
	"reflect"
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
		if array[mid] < x {
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
    Store(price interface{}, size interface{})
    StoreArray(delta interface{})
    Limit()
    Len() int
    GetData() [][]float64
}

type OrderBookSide struct {
    Data   [][]float64  // equivalent to extending Array
    Index  []float64    // string-keyed dictionary of price levels / ids / indices
    Depth  int          // depth limit
    Length int          // current Length
    Side   bool         // false is asks, true is bids
}

func NewOrderBookSide(deltas interface{}, depth interface{}) *OrderBookSide {
    
    orderBookSide := &OrderBookSide{
        Data:   make([][]float64, 0),
        Index:  make([]float64, len(SEED)),
        Length: 0,
        Depth:  math.MaxInt32,
    }
    
    copy(orderBookSide.Index, SEED)
    
    // Set depth
    if depth != nil {
        switch d := depth.(type) {
            case int:
                orderBookSide.Depth = d
            case int64:
                orderBookSide.Depth = int(d)
            default:
                panic(fmt.Sprintf("New depth type %v", reflect.TypeOf(depth)))
        }
    }
    
    switch d := deltas.(type) {
    case [][]float64:
        for i := 0; i < len(d); i++ {
            original := d[i]
            deltaCopy := append([]float64(nil), original...)
            orderBookSide.StoreArray(deltaCopy)
        }
    case IOrderBookSide:
        for i := 0; i < d.Len(); i++ {
            original := d.GetData()[i]
            deltaCopy := append([]float64(nil), original...)
            orderBookSide.StoreArray(deltaCopy)
        }
    }
    return orderBookSide
}

func (obs *OrderBookSide) Len() int {
	return obs.Length
}

func (obs *OrderBookSide) GetData() [][]float64 {
	return obs.Data
}

func (obs *OrderBookSide) StoreArray(delta interface{}) {
    
    deltaArray, isArray := delta.([]float64)
    deltaOB, isOB := delta.(IOrderBookSide)
    deltaInterface, isInterface := delta.([]interface{})
    var price interface{}
    var size interface{}
    if isArray {
        price = deltaArray[0]
        size = deltaArray[1]
    } else if isOB {
        if len(deltaOB.GetData()) > 0 && len(deltaOB.GetData()[0]) >= 2 {
            price = deltaOB.GetData()[0][0]
            size = deltaOB.GetData()[0][1]
        }
    } else if isInterface {
        price = deltaInterface[0]
        size = deltaInterface[1]
    }
    var indexPrice float64
    if obs.Side {
        indexPrice = -price.(float64)
    } else {
        indexPrice = price.(float64)
    }
    
    index := bisectLeft(obs.Index, indexPrice)
    
    if size != 0 {
        if obs.Index[index] == indexPrice {
            obs.Data[index][1] = size.(float64)
        } else {
            obs.Length++
            // copyWithin equivalent
            copy(obs.Index[index+1:], obs.Index[index:])
            obs.Index[index] = indexPrice
            
            // Insert into Data array - ensure it grows with Length
            obs.Data = append(obs.Data, nil)
            copy(obs.Data[index+1:], obs.Data[index:obs.Len()-1])
            if isArray {
                obs.Data[index] = deltaArray
            } else if isOB {
                obs.Data[index] = []float64{deltaOB.GetData()[0][0], deltaOB.GetData()[0][1]}
            } else if isInterface {
                obs.Data[index] = []float64{deltaInterface[0].(float64), deltaInterface[1].(float64)}
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

// Store indexes an incoming delta in the string-price-keyed dictionary
func (obs *OrderBookSide) Store(price interface{}, size interface{}) {
    obs.StoreArray([]float64{price.(float64), size.(float64)})
}

// Limit replaces stored orders with new values
func (obs *OrderBookSide) Limit() {
    if obs.Length > obs.Depth {
        for i := obs.Depth; i < obs.Length; i++ {
            obs.Index[i] = math.MaxFloat64
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
func NewCountedOrderBookSide(deltas interface{}, depth interface{}) *CountedOrderBookSide {
    return &CountedOrderBookSide{
        OrderBookSide: NewOrderBookSide(deltas, depth),
    }
}

func (obs *CountedOrderBookSide) Len() int {
	return obs.Length
}

func (cobs *CountedOrderBookSide) Store(price interface{}, size interface{}) error {
    return errors.New("CountedOrderBookSide.Store() is not supported, use StoreArray([price, size, count]) instead")
}

// StoreArray handles deltas with count (3 elements: price, size, count)
func (obs *CountedOrderBookSide) StoreArray(delta interface{}) {
    
    deltaArray, isArray := delta.([]float64)
    deltaOB, isOB := delta.(IOrderBookSide)
    deltaInterface, isInterface := delta.([]interface{})
    var price interface{}
    var size interface{}
    var count interface{}
    if isArray {
        price = deltaArray[0]
        size = deltaArray[1]
        count = deltaArray[2]
    } else if isOB {
        if len(deltaOB.GetData()) > 0 && len(deltaOB.GetData()[0]) >= 2 {
            price = deltaOB.GetData()[0][0]
            size = deltaOB.GetData()[0][1]
            count = deltaOB.GetData()[0][2]
        }
    } else if isInterface {
        price = deltaInterface[0]
        size = deltaInterface[1]
        count = deltaInterface[2]
    }
    var indexPrice float64
    if obs.Side {
        indexPrice = -price.(float64)
    } else {
        indexPrice = price.(float64)
    }
    
    index := bisectLeft(obs.Index, indexPrice)
    
    if size != 0 && count != 0 {
        if obs.Index[index] == indexPrice {
            obs.Data[index][1] = size.(float64)
            obs.Data[index][2] = count.(float64)
        } else {
            obs.Length++
            // copyWithin equivalent
            copy(obs.Index[index+1:], obs.Index[index:])
            obs.Index[index] = indexPrice
            
            // Insert into Data array - ensure it grows with Length
            obs.Data = append(obs.Data, nil)
            copy(obs.Data[index+1:], obs.Data[index:obs.Len()-1])
            if isArray {
                obs.Data[index] = deltaArray
            } else if isOB {
                obs.Data[index] = []float64{deltaOB.GetData()[0][0], deltaOB.GetData()[0][1]}
            } else if isInterface {
                obs.Data[index] = []float64{deltaInterface[0].(float64), deltaInterface[1].(float64)}
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
    Data    [][]float64                 // equivalent to extending Array
    Hashmap map[interface{}]float64     // string-keyed dictionary of price levels / ids / indices  
    Index   []float64                   // price index array
    Depth   int                         // depth limit
    Length  int                         // current Length
    Side    bool                        // Side flag
}

func NewIndexedOrderBookSide(deltas interface{}, depth interface{}) *IndexedOrderBookSide {
    var deltasLength int
    if deltas != nil {
        if deltasArray, ok := deltas.([][]float64); ok {
            deltasLength = len(deltasArray)
        }
    }
    
    iobs := &IndexedOrderBookSide{
        Data:    make([][]float64, deltasLength),
        Hashmap: make(map[interface{}]float64),
        Index:   make([]float64, len(SEED)),
        Length:  0,
        Side:    false,
    }
    
    copy(iobs.Index, SEED)
    
    if depth != nil {
        iobs.Depth = depth.(int)
    } else {
        iobs.Depth = math.MaxInt32 // equivalent to Number.MAX_SAFE_INTEGER
    }
    
    // Sort upon initiation
    if deltas != nil {
        if deltasArray, ok := deltas.([][]float64); ok {
            for i := 0; i < len(deltasArray); i++ {
                iobs.Length = i
                deltaCopy := make([]float64, len(deltasArray[i]))
                copy(deltaCopy, deltasArray[i]) // slice is muy importante
                iobs.StoreArray(deltaCopy)
            }
        }
    }
    
    return iobs
}

func (obs *IndexedOrderBookSide) Len() int {
	return obs.Length
}

func (iobs *IndexedOrderBookSide) Store(price interface{}, size interface{}) error {
    return errors.New("IndexedOrderBook.Store() is not supported, use StoreArray([price, size, id]) instead")
}

// StoreArray handles deltas with id (3 elements: price, size, id)
func (obs *IndexedOrderBookSide) StoreArray(delta interface{}) {
    
    deltaArray, isArray := delta.([]float64)
    deltaOB, isOB := delta.(IOrderBookSide)
    deltaInterface, isInterface := delta.([]interface{})
    var price interface{}
    var size interface{}
    var id float64
    if isArray {
        price = deltaArray[0]
        size = deltaArray[1]
        id = deltaArray[2]
    } else if isOB {
        if len(deltaOB.GetData()) > 0 && len(deltaOB.GetData()[0]) >= 2 {
            price = deltaOB.GetData()[0][0]
            size = deltaOB.GetData()[0][1]
            id = deltaOB.GetData()[0][2]
        }
    } else if isInterface {
        price = deltaInterface[0]
        size = deltaInterface[1]
        id = deltaInterface[2].(float64)
    }
    var indexPrice float64
    if (price != nil) {
        if (obs.Side) {
            indexPrice = -price.(float64)
        } else {
            indexPrice = price.(float64)
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
            deltaArray[0] = math.Abs(indexPrice)    // ? TODO: all types
            if indexPrice == oldIdPrice {
                var index int = bisectLeft(obs.Index, indexPrice)
                for obs.Data[index][2] != id {
                    index++
                }
                obs.Index[index] = indexPrice
                obs.Data[index] = deltaArray  // ? TODO: all types
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
        var index int = bisectLeft (obs.Index, indexPrice)
        for index < obs.Length && obs.Index[index] == indexPrice && obs.Data[index][2] < id {
            index++
        }
        // insert new price level into index
        obs.Length++
        obs.Index = append(obs.Index, 0) // append a dummy value to make space
        copy(obs.Index[index+1:], obs.Index[index:len(obs.Index)-1])
        obs.Index[index] = indexPrice
        obs.Data = append(obs.Data, nil)
        copy(obs.Data[index+1:], obs.Data[index:obs.Length-1])
        obs.Data[index] = deltaArray // ? TODO: all types
        // in the rare case of very large orderbooks being sent
        if (obs.Length > len(obs.Index) - 1) {
            newIndex := make([]float64, len(obs.Index)*2)
            copy(newIndex, obs.Index)
            for i := len(obs.Index); i < len(newIndex); i++ {
                newIndex[i] = math.MaxFloat64
            }
            obs.Index = newIndex
        }
    } else if (idInHashmap) {
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
    if iobs.Length > iobs.Depth {
        for i := iobs.Depth; i < iobs.Length; i++ {
            delete(iobs.Hashmap, iobs.Data[i])
            iobs.Index[i] = math.MaxFloat64
        }
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
    obs := NewOrderBookSide(deltas, depth)
    obs.Side = false
    return obs
}

func NewBids(deltas interface{}, depth interface{}) *OrderBookSide {
    obs := NewOrderBookSide(deltas, depth)
    obs.Side = true
    return obs
}

func NewCountedAsks(deltas interface{}, depth interface{}) *CountedOrderBookSide {
    cobs := NewCountedOrderBookSide(deltas, depth)
    cobs.Side = false
    return cobs
}

func NewCountedBids(deltas interface{}, depth interface{}) *CountedOrderBookSide {
    cobs := NewCountedOrderBookSide(deltas, depth)
    cobs.Side = true
    return cobs
}

func NewIndexedAsks(deltas interface{}, depth interface{}) *IndexedOrderBookSide {
    iobs := NewIndexedOrderBookSide(deltas, depth)
    iobs.Side = false
    return iobs
}

func NewIndexedBids(deltas interface{}, depth interface{}) *IndexedOrderBookSide {
    iobs := NewIndexedOrderBookSide(deltas, depth)
    iobs.Side = true
    return iobs
}

func (ords *OrderBookSide) GetSide() bool {
	return ords.Side
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
				result.WriteString(fmt.Sprintf("[%.4f %.4f]", obs.Data[i][0], obs.Data[i][1]))
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
