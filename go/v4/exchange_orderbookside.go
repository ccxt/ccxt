package ccxt

import (
	"errors"
	"math"
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
        mid := (low + high) >> 1
        if array[mid] - x < 0 {
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

// IOrderBookSide interface
type IOrderBookSide interface {
    Store(price interface{}, size interface{})
    StoreArray(delta interface{})
    Limit()
}

// OrderBookSide struct
type OrderBookSide struct {
    data   [][]float64  // equivalent to extending Array
    index  []float64    // string-keyed dictionary of price levels / ids / indices
    depth  int          // depth limit
    length int          // current length
    side   bool         // side flag
}

// NewOrderBookSide constructor equivalent
func NewOrderBookSide(deltas interface{}, depth interface{}) *OrderBookSide {
    obs := &OrderBookSide{
        data:   make([][]float64, 0),
        index:  make([]float64, len(SEED)),
        length: 0,
        side:   false,
    }
    
    // Copy SEED values to index
    copy(obs.index, SEED)
    
    // Set depth
    if depth != nil {
        obs.depth = *depth.(*int)
    } else {
        obs.depth = math.MaxInt32 // equivalent to Number.MAX_SAFE_INTEGER
    }
    
    // Sort upon initiation
    for i := 0; i < len(deltas.([][]float64)); i++ {
        deltaCopy := make([]float64, len(deltas.([][]float64)[i]))
        copy(deltaCopy, deltas.([][]float64)[i]) // slice is muy importante
        obs.StoreArray(deltaCopy)
    }
    
    return obs
}

func (obs *OrderBookSide) StoreArray(delta interface{}) {
    price := delta.([]float64)[0]
    size := delta.([]float64)[1]
    var indexPrice float64
    if obs.side {
        indexPrice = -price
    } else {
        indexPrice = price
    }
    
    index := bisectLeft(obs.index, indexPrice)
    
    if size != 0 {
        if obs.index[index] == indexPrice {
            obs.data[index][1] = size
        } else {
            obs.length++
            // copyWithin equivalent
            copy(obs.index[index+1:], obs.index[index:len(obs.index)])
            obs.index[index] = indexPrice
            
            // Insert into data array
            obs.data = append(obs.data, nil)
            copy(obs.data[index+1:], obs.data[index:len(obs.data)-1])
            obs.data[index] = delta.([]float64)
            
            // In the rare case of very large orderbooks being sent
            if obs.length > len(obs.index)-1 {
                newIndex := make([]float64, obs.length*2)
                copy(newIndex, obs.index)
                for i := len(obs.index); i < len(newIndex); i++ {
                    newIndex[i] = math.MaxFloat64
                }
                obs.index = newIndex
            }
        }
    } else if obs.index[index] == indexPrice {
        // Remove element
        copy(obs.index[index:], obs.index[index+1:])
        obs.index[obs.length-1] = math.MaxFloat64
        
        copy(obs.data[index:], obs.data[index+1:])
        obs.data = obs.data[:len(obs.data)-1]
        obs.length--
    }
}

// Store indexes an incoming delta in the string-price-keyed dictionary
func (obs *OrderBookSide) Store(price interface{}, size interface{}) {
    obs.StoreArray([]float64{price.(float64), size.(float64)})
}

// Limit replaces stored orders with new values
func (obs *OrderBookSide) Limit() {
    if obs.length > obs.depth {
        for i := obs.depth; i < obs.length; i++ {
            obs.index[i] = math.MaxFloat64
        }
        obs.data = obs.data[:obs.depth]
        obs.length = obs.depth
    }
}

// CountedOrderBookSide struct that embeds OrderBookSide
type CountedOrderBookSide struct {
    *OrderBookSide
}

// NewCountedOrderBookSide constructor
func NewCountedOrderBookSide(deltas interface{}, depth interface{}) *CountedOrderBookSide {
    return &CountedOrderBookSide{
        OrderBookSide: NewOrderBookSide(deltas, depth),
    }
}

// Store is not supported for CountedOrderBookSide
func (cobs *CountedOrderBookSide) Store(price interface{}, size interface{}) error {
    return errors.New("CountedOrderBookSide.Store() is not supported, use StoreArray([price, size, count]) instead")
}

// StoreArray handles deltas with count (3 elements: price, size, count)
func (cobs *CountedOrderBookSide) StoreArray(delta interface{}) {
    price := delta.([]float64)[0]
    size := delta.([]float64)[1]
    count := delta.([]float64)[2]
    
    var indexPrice float64
    if cobs.side {
        indexPrice = -price
    } else {
        indexPrice = price
    }
    
    index := bisectLeft(cobs.index, indexPrice)
    
    if size != 0 && count != 0 {
        if cobs.index[index] == indexPrice {
            entry := cobs.data[index]
            entry[1] = size
            entry[2] = count
        } else {
            cobs.length++
            // copyWithin equivalent
            copy(cobs.index[index+1:], cobs.index[index:len(cobs.index)])
            cobs.index[index] = indexPrice
            
            // Insert into data array
            cobs.data = append(cobs.data, nil)
            copy(cobs.data[index+1:], cobs.data[index:len(cobs.data)-1])
            cobs.data[index] = delta.([]float64)
            
            // In the rare case of very large orderbooks being sent
            if cobs.length > len(cobs.index)-1 {
                newIndex := make([]float64, cobs.length*2)
                copy(newIndex, cobs.index)
                for i := len(cobs.index); i < len(newIndex); i++ {
                    newIndex[i] = math.MaxFloat64
                }
                cobs.index = newIndex
            }
        }
    } else if cobs.index[index] == indexPrice {
        // Remove element
        copy(cobs.index[index:], cobs.index[index+1:])
        cobs.index[cobs.length-1] = math.MaxFloat64
        
        copy(cobs.data[index:], cobs.data[index+1:])
        cobs.data = cobs.data[:len(cobs.data)-1]
        cobs.length--
    }
}

// IndexedOrderBookSide struct
type IndexedOrderBookSide struct {
    data    [][]float64                 // equivalent to extending Array
    hashmap map[interface{}]float64     // string-keyed dictionary of price levels / ids / indices  
    index   []float64                   // price index array
    depth   int                         // depth limit
    length  int                         // current length
    side    bool                        // side flag
}

// NewIndexedOrderBookSide constructor
func NewIndexedOrderBookSide(deltas interface{}, depth interface{}) *IndexedOrderBookSide {
    iobs := &IndexedOrderBookSide{
        data:    make([][]float64, len(deltas.([][]float64))),
        hashmap: make(map[interface{}]float64),
        index:   make([]float64, len(SEED)),
        length:  0,
        side:    false,
    }
    
    // Copy SEED values to index
    copy(iobs.index, SEED)
    
    // Set depth
    if depth != nil {
        iobs.depth = *depth.(*int)
    } else {
        iobs.depth = math.MaxInt32 // equivalent to Number.MAX_SAFE_INTEGER
    }
    
    // Sort upon initiation
    for i := 0; i < len(deltas.([][]float64)); i++ {
        iobs.length = i
        deltaCopy := make([]float64, len(deltas.([][]float64)[i]))
        copy(deltaCopy, deltas.([][]float64)[i]) // slice is muy importante
        iobs.StoreArray(deltaCopy)
    }
    
    return iobs
}

// Store is not supported for IndexedOrderBookSide
func (iobs *IndexedOrderBookSide) Store(price interface{}, size interface{}) error {
    return errors.New("IndexedOrderBook.Store() is not supported, use StoreArray([price, size, id]) instead")
}

// StoreArray handles deltas with id (3 elements: price, size, id)
func (iobs *IndexedOrderBookSide) StoreArray(delta interface{}) {
    price := delta.([]float64)[0]
    size := delta.([]float64)[1]
    id := delta.([]float64)[2]
    
    var indexPrice *float64
    if !math.IsNaN(price) { // equivalent to price !== undefined
        val := price
        if iobs.side {
            val = -price
        }
        indexPrice = &val
    }
    
    if size != 0 {
        if oldPrice, exists := iobs.hashmap[id]; exists {
            if indexPrice == nil {
                indexPrice = &oldPrice
            }
            // in case price is not sent
            delta.([]float64)[0] = math.Abs(*indexPrice)
            
            if *indexPrice == oldPrice {
                // find index by price and advance till the id is found
                index := bisectLeft(iobs.index, *indexPrice)
                for iobs.data[index][2] != id {
                    index++
                }
                iobs.index[index] = *indexPrice
                iobs.data[index] = delta.([]float64)
                return
            } else {
                // remove old price from index
                // find index by price and advance till the id is found
                oldIndex := bisectLeft(iobs.index, oldPrice)
                for iobs.data[oldIndex][2] != id {
                    oldIndex++
                }
                copy(iobs.index[oldIndex:], iobs.index[oldIndex+1:])
                iobs.index[iobs.length-1] = math.MaxFloat64
                copy(iobs.data[oldIndex:], iobs.data[oldIndex+1:])
                iobs.length--
            }
        }
        
        // insert new price level
        iobs.hashmap[id] = *indexPrice
        // find index by price to insert
        index := bisectLeft(iobs.index, *indexPrice)
        // if several with the same price order by id
        for index < iobs.length && iobs.index[index] == *indexPrice && iobs.data[index][2] < id {
            index++
        }
        
        // insert new price level into index
        iobs.length++
        copy(iobs.index[index+1:], iobs.index[index:])
        iobs.index[index] = *indexPrice
        
        // Insert into data array
        iobs.data = append(iobs.data, nil)
        copy(iobs.data[index+1:], iobs.data[index:len(iobs.data)-1])
        iobs.data[index] = delta.([]float64)
        
        // in the rare case of very large orderbooks being sent
        if iobs.length > len(iobs.index)-1 {
            newIndex := make([]float64, iobs.length*2)
            copy(newIndex, iobs.index)
            for i := len(iobs.index); i < len(newIndex); i++ {
                newIndex[i] = math.MaxFloat64
            }
            iobs.index = newIndex
        }
    } else if oldPrice, exists := iobs.hashmap[id]; exists {
        index := bisectLeft(iobs.index, oldPrice)
        for iobs.data[index][2] != id {
            index++
        }
        copy(iobs.index[index:], iobs.index[index+1:])
        iobs.index[iobs.length-1] = math.MaxFloat64
        copy(iobs.data[index:], iobs.data[index+1:])
        iobs.data = iobs.data[:len(iobs.data)-1]
        iobs.length--
        delete(iobs.hashmap, id)
    }
}

// Limit replaces stored orders with new values
func (iobs *IndexedOrderBookSide) Limit() {
    if iobs.length > iobs.depth {
        for i := iobs.depth; i < iobs.length; i++ {
            // diff: delete from hashmap using the id from data
            if i < len(iobs.data) && len(iobs.data[i]) > 2 {
                delete(iobs.hashmap, iobs.data[i][2])
            }
            iobs.index[i] = math.MaxFloat64
        }
        iobs.data = iobs.data[:iobs.depth]
        iobs.length = iobs.depth
    }
}

// Asks and Bids types - these are just OrderBookSide with different side values

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

// NewAsks creates an OrderBookSide with side = false (asks)
func NewAsks(deltas interface{}, depth interface{}) *OrderBookSide {
    obs := NewOrderBookSide(deltas, depth)
    obs.side = false
    return obs
}

// NewBids creates an OrderBookSide with side = true (bids)  
func NewBids(deltas interface{}, depth interface{}) *OrderBookSide {
    obs := NewOrderBookSide(deltas, depth)
    obs.side = true
    return obs
}

// NewCountedAsks creates a CountedOrderBookSide with side = false (asks)
func NewCountedAsks(deltas interface{}, depth interface{}) *CountedOrderBookSide {
    cobs := NewCountedOrderBookSide(deltas, depth)
    cobs.side = false
    return cobs
}

// NewCountedBids creates a CountedOrderBookSide with side = true (bids)
func NewCountedBids(deltas interface{}, depth interface{}) *CountedOrderBookSide {
    cobs := NewCountedOrderBookSide(deltas, depth)
    cobs.side = true
    return cobs
}

// NewIndexedAsks creates an IndexedOrderBookSide with side = false (asks)
func NewIndexedAsks(deltas interface{}, depth interface{}) *IndexedOrderBookSide {
    iobs := NewIndexedOrderBookSide(deltas, depth)
    iobs.side = false
    return iobs
}

// NewIndexedBids creates an IndexedOrderBookSide with side = true (bids)
func NewIndexedBids(deltas interface{}, depth interface{}) *IndexedOrderBookSide {
    iobs := NewIndexedOrderBookSide(deltas, depth)
    iobs.side = true
    return iobs
}

func (ords *OrderBookSide) GetSide() bool {
	return ords.side
}
