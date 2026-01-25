// Generated SBE (Simple Binary Encoding) message codec

package spot_sbe

import (
	"fmt"
	"io"
	"reflect"
)

type FilterTypeEnum uint8
type FilterTypeValues struct {
	MaxPosition                 FilterTypeEnum
	PriceFilter                 FilterTypeEnum
	TPlusSell                   FilterTypeEnum
	LotSize                     FilterTypeEnum
	MaxNumOrders                FilterTypeEnum
	MinNotional                 FilterTypeEnum
	MaxNumAlgoOrders            FilterTypeEnum
	ExchangeMaxNumOrders        FilterTypeEnum
	ExchangeMaxNumAlgoOrders    FilterTypeEnum
	IcebergParts                FilterTypeEnum
	MarketLotSize               FilterTypeEnum
	PercentPrice                FilterTypeEnum
	MaxNumIcebergOrders         FilterTypeEnum
	ExchangeMaxNumIcebergOrders FilterTypeEnum
	TrailingDelta               FilterTypeEnum
	PercentPriceBySide          FilterTypeEnum
	Notional                    FilterTypeEnum
	MaxNumOrderLists            FilterTypeEnum
	ExchangeMaxNumOrderLists    FilterTypeEnum
	MaxNumOrderAmends           FilterTypeEnum
	MaxAsset                    FilterTypeEnum
	NonRepresentable            FilterTypeEnum
	NullValue                   FilterTypeEnum
}

var FilterType = FilterTypeValues{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 254, 255}

func (f FilterTypeEnum) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint8(_w, uint8(f)); err != nil {
		return err
	}
	return nil
}

func (f *FilterTypeEnum) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16) error {
	if err := _m.ReadUint8(_r, (*uint8)(f)); err != nil {
		return err
	}
	return nil
}

func (f FilterTypeEnum) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if actingVersion > schemaVersion {
		return nil
	}
	value := reflect.ValueOf(FilterType)
	for idx := 0; idx < value.NumField(); idx++ {
		if f == value.Field(idx).Interface() {
			return nil
		}
	}
	return fmt.Errorf("Range check failed on FilterType, unknown enumeration value %d", f)
}

func (*FilterTypeEnum) EncodedLength() int64 {
	return 1
}

func (*FilterTypeEnum) MaxPositionSinceVersion() uint16 {
	return 0
}

func (f *FilterTypeEnum) MaxPositionInActingVersion(actingVersion uint16) bool {
	return actingVersion >= f.MaxPositionSinceVersion()
}

func (*FilterTypeEnum) MaxPositionDeprecated() uint16 {
	return 0
}

func (*FilterTypeEnum) PriceFilterSinceVersion() uint16 {
	return 0
}

func (f *FilterTypeEnum) PriceFilterInActingVersion(actingVersion uint16) bool {
	return actingVersion >= f.PriceFilterSinceVersion()
}

func (*FilterTypeEnum) PriceFilterDeprecated() uint16 {
	return 0
}

func (*FilterTypeEnum) TPlusSellSinceVersion() uint16 {
	return 0
}

func (f *FilterTypeEnum) TPlusSellInActingVersion(actingVersion uint16) bool {
	return actingVersion >= f.TPlusSellSinceVersion()
}

func (*FilterTypeEnum) TPlusSellDeprecated() uint16 {
	return 0
}

func (*FilterTypeEnum) LotSizeSinceVersion() uint16 {
	return 0
}

func (f *FilterTypeEnum) LotSizeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= f.LotSizeSinceVersion()
}

func (*FilterTypeEnum) LotSizeDeprecated() uint16 {
	return 0
}

func (*FilterTypeEnum) MaxNumOrdersSinceVersion() uint16 {
	return 0
}

func (f *FilterTypeEnum) MaxNumOrdersInActingVersion(actingVersion uint16) bool {
	return actingVersion >= f.MaxNumOrdersSinceVersion()
}

func (*FilterTypeEnum) MaxNumOrdersDeprecated() uint16 {
	return 0
}

func (*FilterTypeEnum) MinNotionalSinceVersion() uint16 {
	return 0
}

func (f *FilterTypeEnum) MinNotionalInActingVersion(actingVersion uint16) bool {
	return actingVersion >= f.MinNotionalSinceVersion()
}

func (*FilterTypeEnum) MinNotionalDeprecated() uint16 {
	return 0
}

func (*FilterTypeEnum) MaxNumAlgoOrdersSinceVersion() uint16 {
	return 0
}

func (f *FilterTypeEnum) MaxNumAlgoOrdersInActingVersion(actingVersion uint16) bool {
	return actingVersion >= f.MaxNumAlgoOrdersSinceVersion()
}

func (*FilterTypeEnum) MaxNumAlgoOrdersDeprecated() uint16 {
	return 0
}

func (*FilterTypeEnum) ExchangeMaxNumOrdersSinceVersion() uint16 {
	return 0
}

func (f *FilterTypeEnum) ExchangeMaxNumOrdersInActingVersion(actingVersion uint16) bool {
	return actingVersion >= f.ExchangeMaxNumOrdersSinceVersion()
}

func (*FilterTypeEnum) ExchangeMaxNumOrdersDeprecated() uint16 {
	return 0
}

func (*FilterTypeEnum) ExchangeMaxNumAlgoOrdersSinceVersion() uint16 {
	return 0
}

func (f *FilterTypeEnum) ExchangeMaxNumAlgoOrdersInActingVersion(actingVersion uint16) bool {
	return actingVersion >= f.ExchangeMaxNumAlgoOrdersSinceVersion()
}

func (*FilterTypeEnum) ExchangeMaxNumAlgoOrdersDeprecated() uint16 {
	return 0
}

func (*FilterTypeEnum) IcebergPartsSinceVersion() uint16 {
	return 0
}

func (f *FilterTypeEnum) IcebergPartsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= f.IcebergPartsSinceVersion()
}

func (*FilterTypeEnum) IcebergPartsDeprecated() uint16 {
	return 0
}

func (*FilterTypeEnum) MarketLotSizeSinceVersion() uint16 {
	return 0
}

func (f *FilterTypeEnum) MarketLotSizeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= f.MarketLotSizeSinceVersion()
}

func (*FilterTypeEnum) MarketLotSizeDeprecated() uint16 {
	return 0
}

func (*FilterTypeEnum) PercentPriceSinceVersion() uint16 {
	return 0
}

func (f *FilterTypeEnum) PercentPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= f.PercentPriceSinceVersion()
}

func (*FilterTypeEnum) PercentPriceDeprecated() uint16 {
	return 0
}

func (*FilterTypeEnum) MaxNumIcebergOrdersSinceVersion() uint16 {
	return 0
}

func (f *FilterTypeEnum) MaxNumIcebergOrdersInActingVersion(actingVersion uint16) bool {
	return actingVersion >= f.MaxNumIcebergOrdersSinceVersion()
}

func (*FilterTypeEnum) MaxNumIcebergOrdersDeprecated() uint16 {
	return 0
}

func (*FilterTypeEnum) ExchangeMaxNumIcebergOrdersSinceVersion() uint16 {
	return 0
}

func (f *FilterTypeEnum) ExchangeMaxNumIcebergOrdersInActingVersion(actingVersion uint16) bool {
	return actingVersion >= f.ExchangeMaxNumIcebergOrdersSinceVersion()
}

func (*FilterTypeEnum) ExchangeMaxNumIcebergOrdersDeprecated() uint16 {
	return 0
}

func (*FilterTypeEnum) TrailingDeltaSinceVersion() uint16 {
	return 0
}

func (f *FilterTypeEnum) TrailingDeltaInActingVersion(actingVersion uint16) bool {
	return actingVersion >= f.TrailingDeltaSinceVersion()
}

func (*FilterTypeEnum) TrailingDeltaDeprecated() uint16 {
	return 0
}

func (*FilterTypeEnum) PercentPriceBySideSinceVersion() uint16 {
	return 0
}

func (f *FilterTypeEnum) PercentPriceBySideInActingVersion(actingVersion uint16) bool {
	return actingVersion >= f.PercentPriceBySideSinceVersion()
}

func (*FilterTypeEnum) PercentPriceBySideDeprecated() uint16 {
	return 0
}

func (*FilterTypeEnum) NotionalSinceVersion() uint16 {
	return 0
}

func (f *FilterTypeEnum) NotionalInActingVersion(actingVersion uint16) bool {
	return actingVersion >= f.NotionalSinceVersion()
}

func (*FilterTypeEnum) NotionalDeprecated() uint16 {
	return 0
}

func (*FilterTypeEnum) MaxNumOrderListsSinceVersion() uint16 {
	return 0
}

func (f *FilterTypeEnum) MaxNumOrderListsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= f.MaxNumOrderListsSinceVersion()
}

func (*FilterTypeEnum) MaxNumOrderListsDeprecated() uint16 {
	return 0
}

func (*FilterTypeEnum) ExchangeMaxNumOrderListsSinceVersion() uint16 {
	return 0
}

func (f *FilterTypeEnum) ExchangeMaxNumOrderListsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= f.ExchangeMaxNumOrderListsSinceVersion()
}

func (*FilterTypeEnum) ExchangeMaxNumOrderListsDeprecated() uint16 {
	return 0
}

func (*FilterTypeEnum) MaxNumOrderAmendsSinceVersion() uint16 {
	return 0
}

func (f *FilterTypeEnum) MaxNumOrderAmendsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= f.MaxNumOrderAmendsSinceVersion()
}

func (*FilterTypeEnum) MaxNumOrderAmendsDeprecated() uint16 {
	return 0
}

func (*FilterTypeEnum) MaxAssetSinceVersion() uint16 {
	return 0
}

func (f *FilterTypeEnum) MaxAssetInActingVersion(actingVersion uint16) bool {
	return actingVersion >= f.MaxAssetSinceVersion()
}

func (*FilterTypeEnum) MaxAssetDeprecated() uint16 {
	return 0
}

func (*FilterTypeEnum) NonRepresentableSinceVersion() uint16 {
	return 0
}

func (f *FilterTypeEnum) NonRepresentableInActingVersion(actingVersion uint16) bool {
	return actingVersion >= f.NonRepresentableSinceVersion()
}

func (*FilterTypeEnum) NonRepresentableDeprecated() uint16 {
	return 0
}
