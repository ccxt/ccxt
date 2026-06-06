// Generated SBE (Simple Binary Encoding) message codec

package spot_sbe

import (
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"math"
	"unicode/utf8"
)

type ExchangeInfoResponse struct {
	RateLimits      []ExchangeInfoResponseRateLimits
	ExchangeFilters []ExchangeInfoResponseExchangeFilters
	Symbols         []ExchangeInfoResponseSymbols
	Sors            []ExchangeInfoResponseSors
}
type ExchangeInfoResponseRateLimits struct {
	RateLimitType RateLimitTypeEnum
	Interval      RateLimitIntervalEnum
	IntervalNum   uint8
	RateLimit     int64
}
type ExchangeInfoResponseExchangeFilters struct {
	Filter []uint8
}
type ExchangeInfoResponseSymbols struct {
	Status                          SymbolStatusEnum
	BaseAssetPrecision              uint8
	QuoteAssetPrecision             uint8
	BaseCommissionPrecision         uint8
	QuoteCommissionPrecision        uint8
	OrderTypes                      OrderTypes
	IcebergAllowed                  BoolEnumEnum
	OcoAllowed                      BoolEnumEnum
	OtoAllowed                      BoolEnumEnum
	QuoteOrderQtyMarketAllowed      BoolEnumEnum
	AllowTrailingStop               BoolEnumEnum
	CancelReplaceAllowed            BoolEnumEnum
	AmendAllowed                    BoolEnumEnum
	IsSpotTradingAllowed            BoolEnumEnum
	IsMarginTradingAllowed          BoolEnumEnum
	DefaultSelfTradePreventionMode  SelfTradePreventionModeEnum
	AllowedSelfTradePreventionModes AllowedSelfTradePreventionModes
	PegInstructionsAllowed          BoolEnumEnum
	Filters                         []ExchangeInfoResponseSymbolsFilters
	PermissionSets                  []ExchangeInfoResponseSymbolsPermissionSets
	Symbol                          []uint8
	BaseAsset                       []uint8
	QuoteAsset                      []uint8
}
type ExchangeInfoResponseSymbolsFilters struct {
	Filter []uint8
}
type ExchangeInfoResponseSymbolsPermissionSets struct {
	Permissions []ExchangeInfoResponseSymbolsPermissionSetsPermissions
}
type ExchangeInfoResponseSymbolsPermissionSetsPermissions struct {
	Permission []uint8
}
type ExchangeInfoResponseSors struct {
	SorSymbols []ExchangeInfoResponseSorsSorSymbols
	BaseAsset  []uint8
}
type ExchangeInfoResponseSorsSorSymbols struct {
	Symbol []uint8
}

func (e *ExchangeInfoResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := e.RangeCheck(e.SbeSchemaVersion(), e.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	var RateLimitsBlockLength uint16 = 11
	if err := _m.WriteUint16(_w, RateLimitsBlockLength); err != nil {
		return err
	}
	var RateLimitsNumInGroup uint32 = uint32(len(e.RateLimits))
	if err := _m.WriteUint32(_w, RateLimitsNumInGroup); err != nil {
		return err
	}
	for i := range e.RateLimits {
		if err := e.RateLimits[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	var ExchangeFiltersBlockLength uint16 = 0
	if err := _m.WriteUint16(_w, ExchangeFiltersBlockLength); err != nil {
		return err
	}
	var ExchangeFiltersNumInGroup uint32 = uint32(len(e.ExchangeFilters))
	if err := _m.WriteUint32(_w, ExchangeFiltersNumInGroup); err != nil {
		return err
	}
	for i := range e.ExchangeFilters {
		if err := e.ExchangeFilters[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	var SymbolsBlockLength uint16 = 19
	if err := _m.WriteUint16(_w, SymbolsBlockLength); err != nil {
		return err
	}
	var SymbolsNumInGroup uint32 = uint32(len(e.Symbols))
	if err := _m.WriteUint32(_w, SymbolsNumInGroup); err != nil {
		return err
	}
	for i := range e.Symbols {
		if err := e.Symbols[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	var SorsBlockLength uint16 = 0
	if err := _m.WriteUint16(_w, SorsBlockLength); err != nil {
		return err
	}
	var SorsNumInGroup uint32 = uint32(len(e.Sors))
	if err := _m.WriteUint32(_w, SorsNumInGroup); err != nil {
		return err
	}
	for i := range e.Sors {
		if err := e.Sors[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	return nil
}

func (e *ExchangeInfoResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if actingVersion > e.SbeSchemaVersion() && blockLength > e.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-e.SbeBlockLength()))
	}

	if e.RateLimitsInActingVersion(actingVersion) {
		var RateLimitsBlockLength uint16
		if err := _m.ReadUint16(_r, &RateLimitsBlockLength); err != nil {
			return err
		}
		var RateLimitsNumInGroup uint32
		if err := _m.ReadUint32(_r, &RateLimitsNumInGroup); err != nil {
			return err
		}
		if cap(e.RateLimits) < int(RateLimitsNumInGroup) {
			e.RateLimits = make([]ExchangeInfoResponseRateLimits, RateLimitsNumInGroup)
		}
		e.RateLimits = e.RateLimits[:RateLimitsNumInGroup]
		for i := range e.RateLimits {
			if err := e.RateLimits[i].Decode(_m, _r, actingVersion, uint(RateLimitsBlockLength)); err != nil {
				return err
			}
		}
	}

	if e.ExchangeFiltersInActingVersion(actingVersion) {
		var ExchangeFiltersBlockLength uint16
		if err := _m.ReadUint16(_r, &ExchangeFiltersBlockLength); err != nil {
			return err
		}
		var ExchangeFiltersNumInGroup uint32
		if err := _m.ReadUint32(_r, &ExchangeFiltersNumInGroup); err != nil {
			return err
		}
		if cap(e.ExchangeFilters) < int(ExchangeFiltersNumInGroup) {
			e.ExchangeFilters = make([]ExchangeInfoResponseExchangeFilters, ExchangeFiltersNumInGroup)
		}
		e.ExchangeFilters = e.ExchangeFilters[:ExchangeFiltersNumInGroup]
		for i := range e.ExchangeFilters {
			if err := e.ExchangeFilters[i].Decode(_m, _r, actingVersion, uint(ExchangeFiltersBlockLength)); err != nil {
				return err
			}
		}
	}

	if e.SymbolsInActingVersion(actingVersion) {
		var SymbolsBlockLength uint16
		if err := _m.ReadUint16(_r, &SymbolsBlockLength); err != nil {
			return err
		}
		var SymbolsNumInGroup uint32
		if err := _m.ReadUint32(_r, &SymbolsNumInGroup); err != nil {
			return err
		}
		if cap(e.Symbols) < int(SymbolsNumInGroup) {
			e.Symbols = make([]ExchangeInfoResponseSymbols, SymbolsNumInGroup)
		}
		e.Symbols = e.Symbols[:SymbolsNumInGroup]
		for i := range e.Symbols {
			if err := e.Symbols[i].Decode(_m, _r, actingVersion, uint(SymbolsBlockLength)); err != nil {
				return err
			}
		}
	}

	if e.SorsInActingVersion(actingVersion) {
		var SorsBlockLength uint16
		if err := _m.ReadUint16(_r, &SorsBlockLength); err != nil {
			return err
		}
		var SorsNumInGroup uint32
		if err := _m.ReadUint32(_r, &SorsNumInGroup); err != nil {
			return err
		}
		if cap(e.Sors) < int(SorsNumInGroup) {
			e.Sors = make([]ExchangeInfoResponseSors, SorsNumInGroup)
		}
		e.Sors = e.Sors[:SorsNumInGroup]
		for i := range e.Sors {
			if err := e.Sors[i].Decode(_m, _r, actingVersion, uint(SorsBlockLength)); err != nil {
				return err
			}
		}
	}
	if doRangeCheck {
		if err := e.RangeCheck(actingVersion, e.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (e *ExchangeInfoResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	for i := range e.RateLimits {
		if err := e.RateLimits[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	for i := range e.ExchangeFilters {
		if err := e.ExchangeFilters[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	for i := range e.Symbols {
		if err := e.Symbols[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	for i := range e.Sors {
		if err := e.Sors[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	return nil
}

func ExchangeInfoResponseInit(e *ExchangeInfoResponse) {
	return
}

func (e *ExchangeInfoResponseRateLimits) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := e.RateLimitType.Encode(_m, _w); err != nil {
		return err
	}
	if err := e.Interval.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, e.IntervalNum); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, e.RateLimit); err != nil {
		return err
	}
	return nil
}

func (e *ExchangeInfoResponseRateLimits) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if e.RateLimitTypeInActingVersion(actingVersion) {
		if err := e.RateLimitType.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if e.IntervalInActingVersion(actingVersion) {
		if err := e.Interval.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if !e.IntervalNumInActingVersion(actingVersion) {
		e.IntervalNum = e.IntervalNumNullValue()
	} else {
		if err := _m.ReadUint8(_r, &e.IntervalNum); err != nil {
			return err
		}
	}
	if !e.RateLimitInActingVersion(actingVersion) {
		e.RateLimit = e.RateLimitNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.RateLimit); err != nil {
			return err
		}
	}
	if actingVersion > e.SbeSchemaVersion() && blockLength > e.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-e.SbeBlockLength()))
	}
	return nil
}

func (e *ExchangeInfoResponseRateLimits) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if err := e.RateLimitType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := e.Interval.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if e.IntervalNumInActingVersion(actingVersion) {
		if e.IntervalNum < e.IntervalNumMinValue() || e.IntervalNum > e.IntervalNumMaxValue() {
			return fmt.Errorf("Range check failed on e.IntervalNum (%v < %v > %v)", e.IntervalNumMinValue(), e.IntervalNum, e.IntervalNumMaxValue())
		}
	}
	if e.RateLimitInActingVersion(actingVersion) {
		if e.RateLimit < e.RateLimitMinValue() || e.RateLimit > e.RateLimitMaxValue() {
			return fmt.Errorf("Range check failed on e.RateLimit (%v < %v > %v)", e.RateLimitMinValue(), e.RateLimit, e.RateLimitMaxValue())
		}
	}
	return nil
}

func ExchangeInfoResponseRateLimitsInit(e *ExchangeInfoResponseRateLimits) {
	return
}

func (e *ExchangeInfoResponseExchangeFilters) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint8(_w, uint8(len(e.Filter))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, e.Filter); err != nil {
		return err
	}
	return nil
}

func (e *ExchangeInfoResponseExchangeFilters) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if actingVersion > e.SbeSchemaVersion() && blockLength > e.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-e.SbeBlockLength()))
	}

	if e.FilterInActingVersion(actingVersion) {
		var FilterLength uint8
		if err := _m.ReadUint8(_r, &FilterLength); err != nil {
			return err
		}
		if cap(e.Filter) < int(FilterLength) {
			e.Filter = make([]uint8, FilterLength)
		}
		e.Filter = e.Filter[:FilterLength]
		if err := _m.ReadBytes(_r, e.Filter); err != nil {
			return err
		}
	}
	return nil
}

func (e *ExchangeInfoResponseExchangeFilters) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	return nil
}

func ExchangeInfoResponseExchangeFiltersInit(e *ExchangeInfoResponseExchangeFilters) {
	return
}

func (e *ExchangeInfoResponseSymbols) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := e.Status.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, e.BaseAssetPrecision); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, e.QuoteAssetPrecision); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, e.BaseCommissionPrecision); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, e.QuoteCommissionPrecision); err != nil {
		return err
	}
	if err := e.OrderTypes.Encode(_m, _w); err != nil {
		return err
	}
	if err := e.IcebergAllowed.Encode(_m, _w); err != nil {
		return err
	}
	if err := e.OcoAllowed.Encode(_m, _w); err != nil {
		return err
	}
	if err := e.OtoAllowed.Encode(_m, _w); err != nil {
		return err
	}
	if err := e.QuoteOrderQtyMarketAllowed.Encode(_m, _w); err != nil {
		return err
	}
	if err := e.AllowTrailingStop.Encode(_m, _w); err != nil {
		return err
	}
	if err := e.CancelReplaceAllowed.Encode(_m, _w); err != nil {
		return err
	}
	if err := e.AmendAllowed.Encode(_m, _w); err != nil {
		return err
	}
	if err := e.IsSpotTradingAllowed.Encode(_m, _w); err != nil {
		return err
	}
	if err := e.IsMarginTradingAllowed.Encode(_m, _w); err != nil {
		return err
	}
	if err := e.DefaultSelfTradePreventionMode.Encode(_m, _w); err != nil {
		return err
	}
	if err := e.AllowedSelfTradePreventionModes.Encode(_m, _w); err != nil {
		return err
	}
	if err := e.PegInstructionsAllowed.Encode(_m, _w); err != nil {
		return err
	}
	var FiltersBlockLength uint16 = 0
	if err := _m.WriteUint16(_w, FiltersBlockLength); err != nil {
		return err
	}
	var FiltersNumInGroup uint32 = uint32(len(e.Filters))
	if err := _m.WriteUint32(_w, FiltersNumInGroup); err != nil {
		return err
	}
	for i := range e.Filters {
		if err := e.Filters[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	var PermissionSetsBlockLength uint16 = 0
	if err := _m.WriteUint16(_w, PermissionSetsBlockLength); err != nil {
		return err
	}
	var PermissionSetsNumInGroup uint32 = uint32(len(e.PermissionSets))
	if err := _m.WriteUint32(_w, PermissionSetsNumInGroup); err != nil {
		return err
	}
	for i := range e.PermissionSets {
		if err := e.PermissionSets[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	if err := _m.WriteUint8(_w, uint8(len(e.Symbol))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, e.Symbol); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(e.BaseAsset))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, e.BaseAsset); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(e.QuoteAsset))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, e.QuoteAsset); err != nil {
		return err
	}
	return nil
}

func (e *ExchangeInfoResponseSymbols) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if e.StatusInActingVersion(actingVersion) {
		if err := e.Status.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if !e.BaseAssetPrecisionInActingVersion(actingVersion) {
		e.BaseAssetPrecision = e.BaseAssetPrecisionNullValue()
	} else {
		if err := _m.ReadUint8(_r, &e.BaseAssetPrecision); err != nil {
			return err
		}
	}
	if !e.QuoteAssetPrecisionInActingVersion(actingVersion) {
		e.QuoteAssetPrecision = e.QuoteAssetPrecisionNullValue()
	} else {
		if err := _m.ReadUint8(_r, &e.QuoteAssetPrecision); err != nil {
			return err
		}
	}
	if !e.BaseCommissionPrecisionInActingVersion(actingVersion) {
		e.BaseCommissionPrecision = e.BaseCommissionPrecisionNullValue()
	} else {
		if err := _m.ReadUint8(_r, &e.BaseCommissionPrecision); err != nil {
			return err
		}
	}
	if !e.QuoteCommissionPrecisionInActingVersion(actingVersion) {
		e.QuoteCommissionPrecision = e.QuoteCommissionPrecisionNullValue()
	} else {
		if err := _m.ReadUint8(_r, &e.QuoteCommissionPrecision); err != nil {
			return err
		}
	}
	if e.OrderTypesInActingVersion(actingVersion) {
		if err := e.OrderTypes.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if e.IcebergAllowedInActingVersion(actingVersion) {
		if err := e.IcebergAllowed.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if e.OcoAllowedInActingVersion(actingVersion) {
		if err := e.OcoAllowed.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if e.OtoAllowedInActingVersion(actingVersion) {
		if err := e.OtoAllowed.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if e.QuoteOrderQtyMarketAllowedInActingVersion(actingVersion) {
		if err := e.QuoteOrderQtyMarketAllowed.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if e.AllowTrailingStopInActingVersion(actingVersion) {
		if err := e.AllowTrailingStop.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if e.CancelReplaceAllowedInActingVersion(actingVersion) {
		if err := e.CancelReplaceAllowed.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if e.AmendAllowedInActingVersion(actingVersion) {
		if err := e.AmendAllowed.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if e.IsSpotTradingAllowedInActingVersion(actingVersion) {
		if err := e.IsSpotTradingAllowed.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if e.IsMarginTradingAllowedInActingVersion(actingVersion) {
		if err := e.IsMarginTradingAllowed.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if e.DefaultSelfTradePreventionModeInActingVersion(actingVersion) {
		if err := e.DefaultSelfTradePreventionMode.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if e.AllowedSelfTradePreventionModesInActingVersion(actingVersion) {
		if err := e.AllowedSelfTradePreventionModes.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if e.PegInstructionsAllowedInActingVersion(actingVersion) {
		if err := e.PegInstructionsAllowed.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if actingVersion > e.SbeSchemaVersion() && blockLength > e.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-e.SbeBlockLength()))
	}

	if e.FiltersInActingVersion(actingVersion) {
		var FiltersBlockLength uint16
		if err := _m.ReadUint16(_r, &FiltersBlockLength); err != nil {
			return err
		}
		var FiltersNumInGroup uint32
		if err := _m.ReadUint32(_r, &FiltersNumInGroup); err != nil {
			return err
		}
		if cap(e.Filters) < int(FiltersNumInGroup) {
			e.Filters = make([]ExchangeInfoResponseSymbolsFilters, FiltersNumInGroup)
		}
		e.Filters = e.Filters[:FiltersNumInGroup]
		for i := range e.Filters {
			if err := e.Filters[i].Decode(_m, _r, actingVersion, uint(FiltersBlockLength)); err != nil {
				return err
			}
		}
	}

	if e.PermissionSetsInActingVersion(actingVersion) {
		var PermissionSetsBlockLength uint16
		if err := _m.ReadUint16(_r, &PermissionSetsBlockLength); err != nil {
			return err
		}
		var PermissionSetsNumInGroup uint32
		if err := _m.ReadUint32(_r, &PermissionSetsNumInGroup); err != nil {
			return err
		}
		if cap(e.PermissionSets) < int(PermissionSetsNumInGroup) {
			e.PermissionSets = make([]ExchangeInfoResponseSymbolsPermissionSets, PermissionSetsNumInGroup)
		}
		e.PermissionSets = e.PermissionSets[:PermissionSetsNumInGroup]
		for i := range e.PermissionSets {
			if err := e.PermissionSets[i].Decode(_m, _r, actingVersion, uint(PermissionSetsBlockLength)); err != nil {
				return err
			}
		}
	}

	if e.SymbolInActingVersion(actingVersion) {
		var SymbolLength uint8
		if err := _m.ReadUint8(_r, &SymbolLength); err != nil {
			return err
		}
		if cap(e.Symbol) < int(SymbolLength) {
			e.Symbol = make([]uint8, SymbolLength)
		}
		e.Symbol = e.Symbol[:SymbolLength]
		if err := _m.ReadBytes(_r, e.Symbol); err != nil {
			return err
		}
	}

	if e.BaseAssetInActingVersion(actingVersion) {
		var BaseAssetLength uint8
		if err := _m.ReadUint8(_r, &BaseAssetLength); err != nil {
			return err
		}
		if cap(e.BaseAsset) < int(BaseAssetLength) {
			e.BaseAsset = make([]uint8, BaseAssetLength)
		}
		e.BaseAsset = e.BaseAsset[:BaseAssetLength]
		if err := _m.ReadBytes(_r, e.BaseAsset); err != nil {
			return err
		}
	}

	if e.QuoteAssetInActingVersion(actingVersion) {
		var QuoteAssetLength uint8
		if err := _m.ReadUint8(_r, &QuoteAssetLength); err != nil {
			return err
		}
		if cap(e.QuoteAsset) < int(QuoteAssetLength) {
			e.QuoteAsset = make([]uint8, QuoteAssetLength)
		}
		e.QuoteAsset = e.QuoteAsset[:QuoteAssetLength]
		if err := _m.ReadBytes(_r, e.QuoteAsset); err != nil {
			return err
		}
	}
	return nil
}

func (e *ExchangeInfoResponseSymbols) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if err := e.Status.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if e.BaseAssetPrecisionInActingVersion(actingVersion) {
		if e.BaseAssetPrecision < e.BaseAssetPrecisionMinValue() || e.BaseAssetPrecision > e.BaseAssetPrecisionMaxValue() {
			return fmt.Errorf("Range check failed on e.BaseAssetPrecision (%v < %v > %v)", e.BaseAssetPrecisionMinValue(), e.BaseAssetPrecision, e.BaseAssetPrecisionMaxValue())
		}
	}
	if e.QuoteAssetPrecisionInActingVersion(actingVersion) {
		if e.QuoteAssetPrecision < e.QuoteAssetPrecisionMinValue() || e.QuoteAssetPrecision > e.QuoteAssetPrecisionMaxValue() {
			return fmt.Errorf("Range check failed on e.QuoteAssetPrecision (%v < %v > %v)", e.QuoteAssetPrecisionMinValue(), e.QuoteAssetPrecision, e.QuoteAssetPrecisionMaxValue())
		}
	}
	if e.BaseCommissionPrecisionInActingVersion(actingVersion) {
		if e.BaseCommissionPrecision < e.BaseCommissionPrecisionMinValue() || e.BaseCommissionPrecision > e.BaseCommissionPrecisionMaxValue() {
			return fmt.Errorf("Range check failed on e.BaseCommissionPrecision (%v < %v > %v)", e.BaseCommissionPrecisionMinValue(), e.BaseCommissionPrecision, e.BaseCommissionPrecisionMaxValue())
		}
	}
	if e.QuoteCommissionPrecisionInActingVersion(actingVersion) {
		if e.QuoteCommissionPrecision < e.QuoteCommissionPrecisionMinValue() || e.QuoteCommissionPrecision > e.QuoteCommissionPrecisionMaxValue() {
			return fmt.Errorf("Range check failed on e.QuoteCommissionPrecision (%v < %v > %v)", e.QuoteCommissionPrecisionMinValue(), e.QuoteCommissionPrecision, e.QuoteCommissionPrecisionMaxValue())
		}
	}
	if err := e.IcebergAllowed.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := e.OcoAllowed.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := e.OtoAllowed.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := e.QuoteOrderQtyMarketAllowed.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := e.AllowTrailingStop.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := e.CancelReplaceAllowed.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := e.AmendAllowed.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := e.IsSpotTradingAllowed.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := e.IsMarginTradingAllowed.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := e.DefaultSelfTradePreventionMode.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := e.PegInstructionsAllowed.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	for i := range e.Filters {
		if err := e.Filters[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	for i := range e.PermissionSets {
		if err := e.PermissionSets[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	if !utf8.Valid(e.Symbol[:]) {
		return errors.New("e.Symbol failed UTF-8 validation")
	}
	if !utf8.Valid(e.BaseAsset[:]) {
		return errors.New("e.BaseAsset failed UTF-8 validation")
	}
	if !utf8.Valid(e.QuoteAsset[:]) {
		return errors.New("e.QuoteAsset failed UTF-8 validation")
	}
	return nil
}

func ExchangeInfoResponseSymbolsInit(e *ExchangeInfoResponseSymbols) {
	return
}

func (e *ExchangeInfoResponseSymbolsFilters) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint8(_w, uint8(len(e.Filter))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, e.Filter); err != nil {
		return err
	}
	return nil
}

func (e *ExchangeInfoResponseSymbolsFilters) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if actingVersion > e.SbeSchemaVersion() && blockLength > e.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-e.SbeBlockLength()))
	}

	if e.FilterInActingVersion(actingVersion) {
		var FilterLength uint8
		if err := _m.ReadUint8(_r, &FilterLength); err != nil {
			return err
		}
		if cap(e.Filter) < int(FilterLength) {
			e.Filter = make([]uint8, FilterLength)
		}
		e.Filter = e.Filter[:FilterLength]
		if err := _m.ReadBytes(_r, e.Filter); err != nil {
			return err
		}
	}
	return nil
}

func (e *ExchangeInfoResponseSymbolsFilters) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	return nil
}

func ExchangeInfoResponseSymbolsFiltersInit(e *ExchangeInfoResponseSymbolsFilters) {
	return
}

func (e *ExchangeInfoResponseSymbolsPermissionSets) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	var PermissionsBlockLength uint16 = 0
	if err := _m.WriteUint16(_w, PermissionsBlockLength); err != nil {
		return err
	}
	var PermissionsNumInGroup uint32 = uint32(len(e.Permissions))
	if err := _m.WriteUint32(_w, PermissionsNumInGroup); err != nil {
		return err
	}
	for i := range e.Permissions {
		if err := e.Permissions[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	return nil
}

func (e *ExchangeInfoResponseSymbolsPermissionSets) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if actingVersion > e.SbeSchemaVersion() && blockLength > e.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-e.SbeBlockLength()))
	}

	if e.PermissionsInActingVersion(actingVersion) {
		var PermissionsBlockLength uint16
		if err := _m.ReadUint16(_r, &PermissionsBlockLength); err != nil {
			return err
		}
		var PermissionsNumInGroup uint32
		if err := _m.ReadUint32(_r, &PermissionsNumInGroup); err != nil {
			return err
		}
		if cap(e.Permissions) < int(PermissionsNumInGroup) {
			e.Permissions = make([]ExchangeInfoResponseSymbolsPermissionSetsPermissions, PermissionsNumInGroup)
		}
		e.Permissions = e.Permissions[:PermissionsNumInGroup]
		for i := range e.Permissions {
			if err := e.Permissions[i].Decode(_m, _r, actingVersion, uint(PermissionsBlockLength)); err != nil {
				return err
			}
		}
	}
	return nil
}

func (e *ExchangeInfoResponseSymbolsPermissionSets) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	for i := range e.Permissions {
		if err := e.Permissions[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	return nil
}

func ExchangeInfoResponseSymbolsPermissionSetsInit(e *ExchangeInfoResponseSymbolsPermissionSets) {
	return
}

func (e *ExchangeInfoResponseSymbolsPermissionSetsPermissions) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint8(_w, uint8(len(e.Permission))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, e.Permission); err != nil {
		return err
	}
	return nil
}

func (e *ExchangeInfoResponseSymbolsPermissionSetsPermissions) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if actingVersion > e.SbeSchemaVersion() && blockLength > e.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-e.SbeBlockLength()))
	}

	if e.PermissionInActingVersion(actingVersion) {
		var PermissionLength uint8
		if err := _m.ReadUint8(_r, &PermissionLength); err != nil {
			return err
		}
		if cap(e.Permission) < int(PermissionLength) {
			e.Permission = make([]uint8, PermissionLength)
		}
		e.Permission = e.Permission[:PermissionLength]
		if err := _m.ReadBytes(_r, e.Permission); err != nil {
			return err
		}
	}
	return nil
}

func (e *ExchangeInfoResponseSymbolsPermissionSetsPermissions) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if !utf8.Valid(e.Permission[:]) {
		return errors.New("e.Permission failed UTF-8 validation")
	}
	return nil
}

func ExchangeInfoResponseSymbolsPermissionSetsPermissionsInit(e *ExchangeInfoResponseSymbolsPermissionSetsPermissions) {
	return
}

func (e *ExchangeInfoResponseSors) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	var SorSymbolsBlockLength uint16 = 0
	if err := _m.WriteUint16(_w, SorSymbolsBlockLength); err != nil {
		return err
	}
	var SorSymbolsNumInGroup uint32 = uint32(len(e.SorSymbols))
	if err := _m.WriteUint32(_w, SorSymbolsNumInGroup); err != nil {
		return err
	}
	for i := range e.SorSymbols {
		if err := e.SorSymbols[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	if err := _m.WriteUint8(_w, uint8(len(e.BaseAsset))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, e.BaseAsset); err != nil {
		return err
	}
	return nil
}

func (e *ExchangeInfoResponseSors) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if actingVersion > e.SbeSchemaVersion() && blockLength > e.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-e.SbeBlockLength()))
	}

	if e.SorSymbolsInActingVersion(actingVersion) {
		var SorSymbolsBlockLength uint16
		if err := _m.ReadUint16(_r, &SorSymbolsBlockLength); err != nil {
			return err
		}
		var SorSymbolsNumInGroup uint32
		if err := _m.ReadUint32(_r, &SorSymbolsNumInGroup); err != nil {
			return err
		}
		if cap(e.SorSymbols) < int(SorSymbolsNumInGroup) {
			e.SorSymbols = make([]ExchangeInfoResponseSorsSorSymbols, SorSymbolsNumInGroup)
		}
		e.SorSymbols = e.SorSymbols[:SorSymbolsNumInGroup]
		for i := range e.SorSymbols {
			if err := e.SorSymbols[i].Decode(_m, _r, actingVersion, uint(SorSymbolsBlockLength)); err != nil {
				return err
			}
		}
	}

	if e.BaseAssetInActingVersion(actingVersion) {
		var BaseAssetLength uint8
		if err := _m.ReadUint8(_r, &BaseAssetLength); err != nil {
			return err
		}
		if cap(e.BaseAsset) < int(BaseAssetLength) {
			e.BaseAsset = make([]uint8, BaseAssetLength)
		}
		e.BaseAsset = e.BaseAsset[:BaseAssetLength]
		if err := _m.ReadBytes(_r, e.BaseAsset); err != nil {
			return err
		}
	}
	return nil
}

func (e *ExchangeInfoResponseSors) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	for i := range e.SorSymbols {
		if err := e.SorSymbols[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	if !utf8.Valid(e.BaseAsset[:]) {
		return errors.New("e.BaseAsset failed UTF-8 validation")
	}
	return nil
}

func ExchangeInfoResponseSorsInit(e *ExchangeInfoResponseSors) {
	return
}

func (e *ExchangeInfoResponseSorsSorSymbols) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint8(_w, uint8(len(e.Symbol))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, e.Symbol); err != nil {
		return err
	}
	return nil
}

func (e *ExchangeInfoResponseSorsSorSymbols) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if actingVersion > e.SbeSchemaVersion() && blockLength > e.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-e.SbeBlockLength()))
	}

	if e.SymbolInActingVersion(actingVersion) {
		var SymbolLength uint8
		if err := _m.ReadUint8(_r, &SymbolLength); err != nil {
			return err
		}
		if cap(e.Symbol) < int(SymbolLength) {
			e.Symbol = make([]uint8, SymbolLength)
		}
		e.Symbol = e.Symbol[:SymbolLength]
		if err := _m.ReadBytes(_r, e.Symbol); err != nil {
			return err
		}
	}
	return nil
}

func (e *ExchangeInfoResponseSorsSorSymbols) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if !utf8.Valid(e.Symbol[:]) {
		return errors.New("e.Symbol failed UTF-8 validation")
	}
	return nil
}

func ExchangeInfoResponseSorsSorSymbolsInit(e *ExchangeInfoResponseSorsSorSymbols) {
	return
}

func (*ExchangeInfoResponse) SbeBlockLength() (blockLength uint16) {
	return 0
}

func (*ExchangeInfoResponse) SbeTemplateId() (templateId uint16) {
	return 103
}

func (*ExchangeInfoResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*ExchangeInfoResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*ExchangeInfoResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*ExchangeInfoResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*ExchangeInfoResponseRateLimits) RateLimitTypeId() uint16 {
	return 1
}

func (*ExchangeInfoResponseRateLimits) RateLimitTypeSinceVersion() uint16 {
	return 0
}

func (e *ExchangeInfoResponseRateLimits) RateLimitTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.RateLimitTypeSinceVersion()
}

func (*ExchangeInfoResponseRateLimits) RateLimitTypeDeprecated() uint16 {
	return 0
}

func (*ExchangeInfoResponseRateLimits) RateLimitTypeMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*ExchangeInfoResponseRateLimits) IntervalId() uint16 {
	return 2
}

func (*ExchangeInfoResponseRateLimits) IntervalSinceVersion() uint16 {
	return 0
}

func (e *ExchangeInfoResponseRateLimits) IntervalInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.IntervalSinceVersion()
}

func (*ExchangeInfoResponseRateLimits) IntervalDeprecated() uint16 {
	return 0
}

func (*ExchangeInfoResponseRateLimits) IntervalMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*ExchangeInfoResponseRateLimits) IntervalNumId() uint16 {
	return 3
}

func (*ExchangeInfoResponseRateLimits) IntervalNumSinceVersion() uint16 {
	return 0
}

func (e *ExchangeInfoResponseRateLimits) IntervalNumInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.IntervalNumSinceVersion()
}

func (*ExchangeInfoResponseRateLimits) IntervalNumDeprecated() uint16 {
	return 0
}

func (*ExchangeInfoResponseRateLimits) IntervalNumMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*ExchangeInfoResponseRateLimits) IntervalNumMinValue() uint8 {
	return 0
}

func (*ExchangeInfoResponseRateLimits) IntervalNumMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*ExchangeInfoResponseRateLimits) IntervalNumNullValue() uint8 {
	return math.MaxUint8
}

func (*ExchangeInfoResponseRateLimits) RateLimitId() uint16 {
	return 4
}

func (*ExchangeInfoResponseRateLimits) RateLimitSinceVersion() uint16 {
	return 0
}

func (e *ExchangeInfoResponseRateLimits) RateLimitInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.RateLimitSinceVersion()
}

func (*ExchangeInfoResponseRateLimits) RateLimitDeprecated() uint16 {
	return 0
}

func (*ExchangeInfoResponseRateLimits) RateLimitMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*ExchangeInfoResponseRateLimits) RateLimitMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExchangeInfoResponseRateLimits) RateLimitMaxValue() int64 {
	return math.MaxInt64
}

func (*ExchangeInfoResponseRateLimits) RateLimitNullValue() int64 {
	return math.MinInt64
}

func (*ExchangeInfoResponseExchangeFilters) FilterMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*ExchangeInfoResponseExchangeFilters) FilterSinceVersion() uint16 {
	return 0
}

func (e *ExchangeInfoResponseExchangeFilters) FilterInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.FilterSinceVersion()
}

func (*ExchangeInfoResponseExchangeFilters) FilterDeprecated() uint16 {
	return 0
}

func (ExchangeInfoResponseExchangeFilters) FilterCharacterEncoding() string {
	return "null"
}

func (ExchangeInfoResponseExchangeFilters) FilterHeaderLength() uint64 {
	return 1
}

func (*ExchangeInfoResponseSymbols) StatusId() uint16 {
	return 1
}

func (*ExchangeInfoResponseSymbols) StatusSinceVersion() uint16 {
	return 0
}

func (e *ExchangeInfoResponseSymbols) StatusInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.StatusSinceVersion()
}

func (*ExchangeInfoResponseSymbols) StatusDeprecated() uint16 {
	return 0
}

func (*ExchangeInfoResponseSymbols) StatusMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*ExchangeInfoResponseSymbols) BaseAssetPrecisionId() uint16 {
	return 2
}

func (*ExchangeInfoResponseSymbols) BaseAssetPrecisionSinceVersion() uint16 {
	return 0
}

func (e *ExchangeInfoResponseSymbols) BaseAssetPrecisionInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.BaseAssetPrecisionSinceVersion()
}

func (*ExchangeInfoResponseSymbols) BaseAssetPrecisionDeprecated() uint16 {
	return 0
}

func (*ExchangeInfoResponseSymbols) BaseAssetPrecisionMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*ExchangeInfoResponseSymbols) BaseAssetPrecisionMinValue() uint8 {
	return 0
}

func (*ExchangeInfoResponseSymbols) BaseAssetPrecisionMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*ExchangeInfoResponseSymbols) BaseAssetPrecisionNullValue() uint8 {
	return math.MaxUint8
}

func (*ExchangeInfoResponseSymbols) QuoteAssetPrecisionId() uint16 {
	return 3
}

func (*ExchangeInfoResponseSymbols) QuoteAssetPrecisionSinceVersion() uint16 {
	return 0
}

func (e *ExchangeInfoResponseSymbols) QuoteAssetPrecisionInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.QuoteAssetPrecisionSinceVersion()
}

func (*ExchangeInfoResponseSymbols) QuoteAssetPrecisionDeprecated() uint16 {
	return 0
}

func (*ExchangeInfoResponseSymbols) QuoteAssetPrecisionMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*ExchangeInfoResponseSymbols) QuoteAssetPrecisionMinValue() uint8 {
	return 0
}

func (*ExchangeInfoResponseSymbols) QuoteAssetPrecisionMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*ExchangeInfoResponseSymbols) QuoteAssetPrecisionNullValue() uint8 {
	return math.MaxUint8
}

func (*ExchangeInfoResponseSymbols) BaseCommissionPrecisionId() uint16 {
	return 4
}

func (*ExchangeInfoResponseSymbols) BaseCommissionPrecisionSinceVersion() uint16 {
	return 0
}

func (e *ExchangeInfoResponseSymbols) BaseCommissionPrecisionInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.BaseCommissionPrecisionSinceVersion()
}

func (*ExchangeInfoResponseSymbols) BaseCommissionPrecisionDeprecated() uint16 {
	return 0
}

func (*ExchangeInfoResponseSymbols) BaseCommissionPrecisionMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*ExchangeInfoResponseSymbols) BaseCommissionPrecisionMinValue() uint8 {
	return 0
}

func (*ExchangeInfoResponseSymbols) BaseCommissionPrecisionMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*ExchangeInfoResponseSymbols) BaseCommissionPrecisionNullValue() uint8 {
	return math.MaxUint8
}

func (*ExchangeInfoResponseSymbols) QuoteCommissionPrecisionId() uint16 {
	return 5
}

func (*ExchangeInfoResponseSymbols) QuoteCommissionPrecisionSinceVersion() uint16 {
	return 0
}

func (e *ExchangeInfoResponseSymbols) QuoteCommissionPrecisionInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.QuoteCommissionPrecisionSinceVersion()
}

func (*ExchangeInfoResponseSymbols) QuoteCommissionPrecisionDeprecated() uint16 {
	return 0
}

func (*ExchangeInfoResponseSymbols) QuoteCommissionPrecisionMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*ExchangeInfoResponseSymbols) QuoteCommissionPrecisionMinValue() uint8 {
	return 0
}

func (*ExchangeInfoResponseSymbols) QuoteCommissionPrecisionMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*ExchangeInfoResponseSymbols) QuoteCommissionPrecisionNullValue() uint8 {
	return math.MaxUint8
}

func (*ExchangeInfoResponseSymbols) OrderTypesId() uint16 {
	return 6
}

func (*ExchangeInfoResponseSymbols) OrderTypesSinceVersion() uint16 {
	return 0
}

func (e *ExchangeInfoResponseSymbols) OrderTypesInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.OrderTypesSinceVersion()
}

func (*ExchangeInfoResponseSymbols) OrderTypesDeprecated() uint16 {
	return 0
}

func (*ExchangeInfoResponseSymbols) OrderTypesMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*ExchangeInfoResponseSymbols) IcebergAllowedId() uint16 {
	return 7
}

func (*ExchangeInfoResponseSymbols) IcebergAllowedSinceVersion() uint16 {
	return 0
}

func (e *ExchangeInfoResponseSymbols) IcebergAllowedInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.IcebergAllowedSinceVersion()
}

func (*ExchangeInfoResponseSymbols) IcebergAllowedDeprecated() uint16 {
	return 0
}

func (*ExchangeInfoResponseSymbols) IcebergAllowedMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*ExchangeInfoResponseSymbols) OcoAllowedId() uint16 {
	return 8
}

func (*ExchangeInfoResponseSymbols) OcoAllowedSinceVersion() uint16 {
	return 0
}

func (e *ExchangeInfoResponseSymbols) OcoAllowedInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.OcoAllowedSinceVersion()
}

func (*ExchangeInfoResponseSymbols) OcoAllowedDeprecated() uint16 {
	return 0
}

func (*ExchangeInfoResponseSymbols) OcoAllowedMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*ExchangeInfoResponseSymbols) OtoAllowedId() uint16 {
	return 9
}

func (*ExchangeInfoResponseSymbols) OtoAllowedSinceVersion() uint16 {
	return 0
}

func (e *ExchangeInfoResponseSymbols) OtoAllowedInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.OtoAllowedSinceVersion()
}

func (*ExchangeInfoResponseSymbols) OtoAllowedDeprecated() uint16 {
	return 0
}

func (*ExchangeInfoResponseSymbols) OtoAllowedMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*ExchangeInfoResponseSymbols) QuoteOrderQtyMarketAllowedId() uint16 {
	return 10
}

func (*ExchangeInfoResponseSymbols) QuoteOrderQtyMarketAllowedSinceVersion() uint16 {
	return 0
}

func (e *ExchangeInfoResponseSymbols) QuoteOrderQtyMarketAllowedInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.QuoteOrderQtyMarketAllowedSinceVersion()
}

func (*ExchangeInfoResponseSymbols) QuoteOrderQtyMarketAllowedDeprecated() uint16 {
	return 0
}

func (*ExchangeInfoResponseSymbols) QuoteOrderQtyMarketAllowedMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*ExchangeInfoResponseSymbols) AllowTrailingStopId() uint16 {
	return 11
}

func (*ExchangeInfoResponseSymbols) AllowTrailingStopSinceVersion() uint16 {
	return 0
}

func (e *ExchangeInfoResponseSymbols) AllowTrailingStopInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.AllowTrailingStopSinceVersion()
}

func (*ExchangeInfoResponseSymbols) AllowTrailingStopDeprecated() uint16 {
	return 0
}

func (*ExchangeInfoResponseSymbols) AllowTrailingStopMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*ExchangeInfoResponseSymbols) CancelReplaceAllowedId() uint16 {
	return 12
}

func (*ExchangeInfoResponseSymbols) CancelReplaceAllowedSinceVersion() uint16 {
	return 0
}

func (e *ExchangeInfoResponseSymbols) CancelReplaceAllowedInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.CancelReplaceAllowedSinceVersion()
}

func (*ExchangeInfoResponseSymbols) CancelReplaceAllowedDeprecated() uint16 {
	return 0
}

func (*ExchangeInfoResponseSymbols) CancelReplaceAllowedMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*ExchangeInfoResponseSymbols) AmendAllowedId() uint16 {
	return 13
}

func (*ExchangeInfoResponseSymbols) AmendAllowedSinceVersion() uint16 {
	return 0
}

func (e *ExchangeInfoResponseSymbols) AmendAllowedInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.AmendAllowedSinceVersion()
}

func (*ExchangeInfoResponseSymbols) AmendAllowedDeprecated() uint16 {
	return 0
}

func (*ExchangeInfoResponseSymbols) AmendAllowedMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*ExchangeInfoResponseSymbols) IsSpotTradingAllowedId() uint16 {
	return 14
}

func (*ExchangeInfoResponseSymbols) IsSpotTradingAllowedSinceVersion() uint16 {
	return 0
}

func (e *ExchangeInfoResponseSymbols) IsSpotTradingAllowedInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.IsSpotTradingAllowedSinceVersion()
}

func (*ExchangeInfoResponseSymbols) IsSpotTradingAllowedDeprecated() uint16 {
	return 0
}

func (*ExchangeInfoResponseSymbols) IsSpotTradingAllowedMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*ExchangeInfoResponseSymbols) IsMarginTradingAllowedId() uint16 {
	return 15
}

func (*ExchangeInfoResponseSymbols) IsMarginTradingAllowedSinceVersion() uint16 {
	return 0
}

func (e *ExchangeInfoResponseSymbols) IsMarginTradingAllowedInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.IsMarginTradingAllowedSinceVersion()
}

func (*ExchangeInfoResponseSymbols) IsMarginTradingAllowedDeprecated() uint16 {
	return 0
}

func (*ExchangeInfoResponseSymbols) IsMarginTradingAllowedMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*ExchangeInfoResponseSymbols) DefaultSelfTradePreventionModeId() uint16 {
	return 16
}

func (*ExchangeInfoResponseSymbols) DefaultSelfTradePreventionModeSinceVersion() uint16 {
	return 0
}

func (e *ExchangeInfoResponseSymbols) DefaultSelfTradePreventionModeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.DefaultSelfTradePreventionModeSinceVersion()
}

func (*ExchangeInfoResponseSymbols) DefaultSelfTradePreventionModeDeprecated() uint16 {
	return 0
}

func (*ExchangeInfoResponseSymbols) DefaultSelfTradePreventionModeMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*ExchangeInfoResponseSymbols) AllowedSelfTradePreventionModesId() uint16 {
	return 17
}

func (*ExchangeInfoResponseSymbols) AllowedSelfTradePreventionModesSinceVersion() uint16 {
	return 0
}

func (e *ExchangeInfoResponseSymbols) AllowedSelfTradePreventionModesInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.AllowedSelfTradePreventionModesSinceVersion()
}

func (*ExchangeInfoResponseSymbols) AllowedSelfTradePreventionModesDeprecated() uint16 {
	return 0
}

func (*ExchangeInfoResponseSymbols) AllowedSelfTradePreventionModesMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*ExchangeInfoResponseSymbols) PegInstructionsAllowedId() uint16 {
	return 18
}

func (*ExchangeInfoResponseSymbols) PegInstructionsAllowedSinceVersion() uint16 {
	return 1
}

func (e *ExchangeInfoResponseSymbols) PegInstructionsAllowedInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.PegInstructionsAllowedSinceVersion()
}

func (*ExchangeInfoResponseSymbols) PegInstructionsAllowedDeprecated() uint16 {
	return 0
}

func (*ExchangeInfoResponseSymbols) PegInstructionsAllowedMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "optional"
	}
	return ""
}

func (*ExchangeInfoResponseSymbolsFilters) FilterMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*ExchangeInfoResponseSymbolsFilters) FilterSinceVersion() uint16 {
	return 0
}

func (e *ExchangeInfoResponseSymbolsFilters) FilterInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.FilterSinceVersion()
}

func (*ExchangeInfoResponseSymbolsFilters) FilterDeprecated() uint16 {
	return 0
}

func (ExchangeInfoResponseSymbolsFilters) FilterCharacterEncoding() string {
	return "null"
}

func (ExchangeInfoResponseSymbolsFilters) FilterHeaderLength() uint64 {
	return 1
}

func (*ExchangeInfoResponseSymbolsPermissionSetsPermissions) PermissionMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*ExchangeInfoResponseSymbolsPermissionSetsPermissions) PermissionSinceVersion() uint16 {
	return 0
}

func (e *ExchangeInfoResponseSymbolsPermissionSetsPermissions) PermissionInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.PermissionSinceVersion()
}

func (*ExchangeInfoResponseSymbolsPermissionSetsPermissions) PermissionDeprecated() uint16 {
	return 0
}

func (ExchangeInfoResponseSymbolsPermissionSetsPermissions) PermissionCharacterEncoding() string {
	return "UTF-8"
}

func (ExchangeInfoResponseSymbolsPermissionSetsPermissions) PermissionHeaderLength() uint64 {
	return 1
}

func (*ExchangeInfoResponseSymbols) SymbolMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*ExchangeInfoResponseSymbols) SymbolSinceVersion() uint16 {
	return 0
}

func (e *ExchangeInfoResponseSymbols) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.SymbolSinceVersion()
}

func (*ExchangeInfoResponseSymbols) SymbolDeprecated() uint16 {
	return 0
}

func (ExchangeInfoResponseSymbols) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (ExchangeInfoResponseSymbols) SymbolHeaderLength() uint64 {
	return 1
}

func (*ExchangeInfoResponseSymbols) BaseAssetMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*ExchangeInfoResponseSymbols) BaseAssetSinceVersion() uint16 {
	return 0
}

func (e *ExchangeInfoResponseSymbols) BaseAssetInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.BaseAssetSinceVersion()
}

func (*ExchangeInfoResponseSymbols) BaseAssetDeprecated() uint16 {
	return 0
}

func (ExchangeInfoResponseSymbols) BaseAssetCharacterEncoding() string {
	return "UTF-8"
}

func (ExchangeInfoResponseSymbols) BaseAssetHeaderLength() uint64 {
	return 1
}

func (*ExchangeInfoResponseSymbols) QuoteAssetMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*ExchangeInfoResponseSymbols) QuoteAssetSinceVersion() uint16 {
	return 0
}

func (e *ExchangeInfoResponseSymbols) QuoteAssetInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.QuoteAssetSinceVersion()
}

func (*ExchangeInfoResponseSymbols) QuoteAssetDeprecated() uint16 {
	return 0
}

func (ExchangeInfoResponseSymbols) QuoteAssetCharacterEncoding() string {
	return "UTF-8"
}

func (ExchangeInfoResponseSymbols) QuoteAssetHeaderLength() uint64 {
	return 1
}

func (*ExchangeInfoResponseSorsSorSymbols) SymbolMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*ExchangeInfoResponseSorsSorSymbols) SymbolSinceVersion() uint16 {
	return 0
}

func (e *ExchangeInfoResponseSorsSorSymbols) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.SymbolSinceVersion()
}

func (*ExchangeInfoResponseSorsSorSymbols) SymbolDeprecated() uint16 {
	return 0
}

func (ExchangeInfoResponseSorsSorSymbols) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (ExchangeInfoResponseSorsSorSymbols) SymbolHeaderLength() uint64 {
	return 1
}

func (*ExchangeInfoResponseSors) BaseAssetMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*ExchangeInfoResponseSors) BaseAssetSinceVersion() uint16 {
	return 0
}

func (e *ExchangeInfoResponseSors) BaseAssetInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.BaseAssetSinceVersion()
}

func (*ExchangeInfoResponseSors) BaseAssetDeprecated() uint16 {
	return 0
}

func (ExchangeInfoResponseSors) BaseAssetCharacterEncoding() string {
	return "UTF-8"
}

func (ExchangeInfoResponseSors) BaseAssetHeaderLength() uint64 {
	return 1
}

func (*ExchangeInfoResponse) RateLimitsId() uint16 {
	return 100
}

func (*ExchangeInfoResponse) RateLimitsSinceVersion() uint16 {
	return 0
}

func (e *ExchangeInfoResponse) RateLimitsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.RateLimitsSinceVersion()
}

func (*ExchangeInfoResponse) RateLimitsDeprecated() uint16 {
	return 0
}

func (*ExchangeInfoResponseRateLimits) SbeBlockLength() (blockLength uint) {
	return 11
}

func (*ExchangeInfoResponseRateLimits) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*ExchangeInfoResponse) ExchangeFiltersId() uint16 {
	return 101
}

func (*ExchangeInfoResponse) ExchangeFiltersSinceVersion() uint16 {
	return 0
}

func (e *ExchangeInfoResponse) ExchangeFiltersInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.ExchangeFiltersSinceVersion()
}

func (*ExchangeInfoResponse) ExchangeFiltersDeprecated() uint16 {
	return 0
}

func (*ExchangeInfoResponseExchangeFilters) SbeBlockLength() (blockLength uint) {
	return 0
}

func (*ExchangeInfoResponseExchangeFilters) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*ExchangeInfoResponse) SymbolsId() uint16 {
	return 102
}

func (*ExchangeInfoResponse) SymbolsSinceVersion() uint16 {
	return 0
}

func (e *ExchangeInfoResponse) SymbolsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.SymbolsSinceVersion()
}

func (*ExchangeInfoResponse) SymbolsDeprecated() uint16 {
	return 0
}

func (*ExchangeInfoResponseSymbols) SbeBlockLength() (blockLength uint) {
	return 19
}

func (*ExchangeInfoResponseSymbols) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*ExchangeInfoResponseSymbols) FiltersId() uint16 {
	return 100
}

func (*ExchangeInfoResponseSymbols) FiltersSinceVersion() uint16 {
	return 0
}

func (e *ExchangeInfoResponseSymbols) FiltersInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.FiltersSinceVersion()
}

func (*ExchangeInfoResponseSymbols) FiltersDeprecated() uint16 {
	return 0
}

func (*ExchangeInfoResponseSymbolsFilters) SbeBlockLength() (blockLength uint) {
	return 0
}

func (*ExchangeInfoResponseSymbolsFilters) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*ExchangeInfoResponseSymbols) PermissionSetsId() uint16 {
	return 101
}

func (*ExchangeInfoResponseSymbols) PermissionSetsSinceVersion() uint16 {
	return 0
}

func (e *ExchangeInfoResponseSymbols) PermissionSetsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.PermissionSetsSinceVersion()
}

func (*ExchangeInfoResponseSymbols) PermissionSetsDeprecated() uint16 {
	return 0
}

func (*ExchangeInfoResponseSymbolsPermissionSets) SbeBlockLength() (blockLength uint) {
	return 0
}

func (*ExchangeInfoResponseSymbolsPermissionSets) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*ExchangeInfoResponseSymbolsPermissionSets) PermissionsId() uint16 {
	return 100
}

func (*ExchangeInfoResponseSymbolsPermissionSets) PermissionsSinceVersion() uint16 {
	return 0
}

func (e *ExchangeInfoResponseSymbolsPermissionSets) PermissionsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.PermissionsSinceVersion()
}

func (*ExchangeInfoResponseSymbolsPermissionSets) PermissionsDeprecated() uint16 {
	return 0
}

func (*ExchangeInfoResponseSymbolsPermissionSetsPermissions) SbeBlockLength() (blockLength uint) {
	return 0
}

func (*ExchangeInfoResponseSymbolsPermissionSetsPermissions) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*ExchangeInfoResponse) SorsId() uint16 {
	return 103
}

func (*ExchangeInfoResponse) SorsSinceVersion() uint16 {
	return 0
}

func (e *ExchangeInfoResponse) SorsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.SorsSinceVersion()
}

func (*ExchangeInfoResponse) SorsDeprecated() uint16 {
	return 0
}

func (*ExchangeInfoResponseSors) SbeBlockLength() (blockLength uint) {
	return 0
}

func (*ExchangeInfoResponseSors) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*ExchangeInfoResponseSors) SorSymbolsId() uint16 {
	return 1
}

func (*ExchangeInfoResponseSors) SorSymbolsSinceVersion() uint16 {
	return 0
}

func (e *ExchangeInfoResponseSors) SorSymbolsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.SorSymbolsSinceVersion()
}

func (*ExchangeInfoResponseSors) SorSymbolsDeprecated() uint16 {
	return 0
}

func (*ExchangeInfoResponseSorsSorSymbols) SbeBlockLength() (blockLength uint) {
	return 0
}

func (*ExchangeInfoResponseSorsSorSymbols) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}
