// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_2

import (
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"math"
	"unicode/utf8"
)

type OrderTestWithCommissionsResponse struct {
	CommissionExponent              int8
	DiscountExponent                int8
	StandardCommissionForOrderMaker int64
	StandardCommissionForOrderTaker int64
	TaxCommissionForOrderMaker      int64
	TaxCommissionForOrderTaker      int64
	DiscountEnabledForAccount       BoolEnumEnum
	DiscountEnabledForSymbol        BoolEnumEnum
	Discount                        int64
	SpecialCommissionForOrderMaker  int64
	SpecialCommissionForOrderTaker  int64
	DiscountAsset                   []uint8
}

func (o *OrderTestWithCommissionsResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := o.RangeCheck(o.SbeSchemaVersion(), o.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt8(_w, o.CommissionExponent); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, o.DiscountExponent); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.StandardCommissionForOrderMaker); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.StandardCommissionForOrderTaker); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.TaxCommissionForOrderMaker); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.TaxCommissionForOrderTaker); err != nil {
		return err
	}
	if err := o.DiscountEnabledForAccount.Encode(_m, _w); err != nil {
		return err
	}
	if err := o.DiscountEnabledForSymbol.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.Discount); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.SpecialCommissionForOrderMaker); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.SpecialCommissionForOrderTaker); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(o.DiscountAsset))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, o.DiscountAsset); err != nil {
		return err
	}
	return nil
}

func (o *OrderTestWithCommissionsResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if !o.CommissionExponentInActingVersion(actingVersion) {
		o.CommissionExponent = o.CommissionExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &o.CommissionExponent); err != nil {
			return err
		}
	}
	if !o.DiscountExponentInActingVersion(actingVersion) {
		o.DiscountExponent = o.DiscountExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &o.DiscountExponent); err != nil {
			return err
		}
	}
	if !o.StandardCommissionForOrderMakerInActingVersion(actingVersion) {
		o.StandardCommissionForOrderMaker = o.StandardCommissionForOrderMakerNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.StandardCommissionForOrderMaker); err != nil {
			return err
		}
	}
	if !o.StandardCommissionForOrderTakerInActingVersion(actingVersion) {
		o.StandardCommissionForOrderTaker = o.StandardCommissionForOrderTakerNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.StandardCommissionForOrderTaker); err != nil {
			return err
		}
	}
	if !o.TaxCommissionForOrderMakerInActingVersion(actingVersion) {
		o.TaxCommissionForOrderMaker = o.TaxCommissionForOrderMakerNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.TaxCommissionForOrderMaker); err != nil {
			return err
		}
	}
	if !o.TaxCommissionForOrderTakerInActingVersion(actingVersion) {
		o.TaxCommissionForOrderTaker = o.TaxCommissionForOrderTakerNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.TaxCommissionForOrderTaker); err != nil {
			return err
		}
	}
	if o.DiscountEnabledForAccountInActingVersion(actingVersion) {
		if err := o.DiscountEnabledForAccount.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if o.DiscountEnabledForSymbolInActingVersion(actingVersion) {
		if err := o.DiscountEnabledForSymbol.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if !o.DiscountInActingVersion(actingVersion) {
		o.Discount = o.DiscountNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.Discount); err != nil {
			return err
		}
	}
	if !o.SpecialCommissionForOrderMakerInActingVersion(actingVersion) {
		o.SpecialCommissionForOrderMaker = o.SpecialCommissionForOrderMakerNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.SpecialCommissionForOrderMaker); err != nil {
			return err
		}
	}
	if !o.SpecialCommissionForOrderTakerInActingVersion(actingVersion) {
		o.SpecialCommissionForOrderTaker = o.SpecialCommissionForOrderTakerNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.SpecialCommissionForOrderTaker); err != nil {
			return err
		}
	}
	if actingVersion > o.SbeSchemaVersion() && blockLength > o.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-o.SbeBlockLength()))
	}

	if o.DiscountAssetInActingVersion(actingVersion) {
		var DiscountAssetLength uint8
		if err := _m.ReadUint8(_r, &DiscountAssetLength); err != nil {
			return err
		}
		if cap(o.DiscountAsset) < int(DiscountAssetLength) {
			o.DiscountAsset = make([]uint8, DiscountAssetLength)
		}
		o.DiscountAsset = o.DiscountAsset[:DiscountAssetLength]
		if err := _m.ReadBytes(_r, o.DiscountAsset); err != nil {
			return err
		}
	}
	if doRangeCheck {
		if err := o.RangeCheck(actingVersion, o.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (o *OrderTestWithCommissionsResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if o.CommissionExponentInActingVersion(actingVersion) {
		if o.CommissionExponent < o.CommissionExponentMinValue() || o.CommissionExponent > o.CommissionExponentMaxValue() {
			return fmt.Errorf("Range check failed on o.CommissionExponent (%v < %v > %v)", o.CommissionExponentMinValue(), o.CommissionExponent, o.CommissionExponentMaxValue())
		}
	}
	if o.DiscountExponentInActingVersion(actingVersion) {
		if o.DiscountExponent < o.DiscountExponentMinValue() || o.DiscountExponent > o.DiscountExponentMaxValue() {
			return fmt.Errorf("Range check failed on o.DiscountExponent (%v < %v > %v)", o.DiscountExponentMinValue(), o.DiscountExponent, o.DiscountExponentMaxValue())
		}
	}
	if o.StandardCommissionForOrderMakerInActingVersion(actingVersion) {
		if o.StandardCommissionForOrderMaker < o.StandardCommissionForOrderMakerMinValue() || o.StandardCommissionForOrderMaker > o.StandardCommissionForOrderMakerMaxValue() {
			return fmt.Errorf("Range check failed on o.StandardCommissionForOrderMaker (%v < %v > %v)", o.StandardCommissionForOrderMakerMinValue(), o.StandardCommissionForOrderMaker, o.StandardCommissionForOrderMakerMaxValue())
		}
	}
	if o.StandardCommissionForOrderTakerInActingVersion(actingVersion) {
		if o.StandardCommissionForOrderTaker < o.StandardCommissionForOrderTakerMinValue() || o.StandardCommissionForOrderTaker > o.StandardCommissionForOrderTakerMaxValue() {
			return fmt.Errorf("Range check failed on o.StandardCommissionForOrderTaker (%v < %v > %v)", o.StandardCommissionForOrderTakerMinValue(), o.StandardCommissionForOrderTaker, o.StandardCommissionForOrderTakerMaxValue())
		}
	}
	if o.TaxCommissionForOrderMakerInActingVersion(actingVersion) {
		if o.TaxCommissionForOrderMaker < o.TaxCommissionForOrderMakerMinValue() || o.TaxCommissionForOrderMaker > o.TaxCommissionForOrderMakerMaxValue() {
			return fmt.Errorf("Range check failed on o.TaxCommissionForOrderMaker (%v < %v > %v)", o.TaxCommissionForOrderMakerMinValue(), o.TaxCommissionForOrderMaker, o.TaxCommissionForOrderMakerMaxValue())
		}
	}
	if o.TaxCommissionForOrderTakerInActingVersion(actingVersion) {
		if o.TaxCommissionForOrderTaker < o.TaxCommissionForOrderTakerMinValue() || o.TaxCommissionForOrderTaker > o.TaxCommissionForOrderTakerMaxValue() {
			return fmt.Errorf("Range check failed on o.TaxCommissionForOrderTaker (%v < %v > %v)", o.TaxCommissionForOrderTakerMinValue(), o.TaxCommissionForOrderTaker, o.TaxCommissionForOrderTakerMaxValue())
		}
	}
	if err := o.DiscountEnabledForAccount.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := o.DiscountEnabledForSymbol.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if o.DiscountInActingVersion(actingVersion) {
		if o.Discount < o.DiscountMinValue() || o.Discount > o.DiscountMaxValue() {
			return fmt.Errorf("Range check failed on o.Discount (%v < %v > %v)", o.DiscountMinValue(), o.Discount, o.DiscountMaxValue())
		}
	}
	if o.SpecialCommissionForOrderMakerInActingVersion(actingVersion) {
		if o.SpecialCommissionForOrderMaker != o.SpecialCommissionForOrderMakerNullValue() && (o.SpecialCommissionForOrderMaker < o.SpecialCommissionForOrderMakerMinValue() || o.SpecialCommissionForOrderMaker > o.SpecialCommissionForOrderMakerMaxValue()) {
			return fmt.Errorf("Range check failed on o.SpecialCommissionForOrderMaker (%v < %v > %v)", o.SpecialCommissionForOrderMakerMinValue(), o.SpecialCommissionForOrderMaker, o.SpecialCommissionForOrderMakerMaxValue())
		}
	}
	if o.SpecialCommissionForOrderTakerInActingVersion(actingVersion) {
		if o.SpecialCommissionForOrderTaker != o.SpecialCommissionForOrderTakerNullValue() && (o.SpecialCommissionForOrderTaker < o.SpecialCommissionForOrderTakerMinValue() || o.SpecialCommissionForOrderTaker > o.SpecialCommissionForOrderTakerMaxValue()) {
			return fmt.Errorf("Range check failed on o.SpecialCommissionForOrderTaker (%v < %v > %v)", o.SpecialCommissionForOrderTakerMinValue(), o.SpecialCommissionForOrderTaker, o.SpecialCommissionForOrderTakerMaxValue())
		}
	}
	if !utf8.Valid(o.DiscountAsset[:]) {
		return errors.New("o.DiscountAsset failed UTF-8 validation")
	}
	return nil
}

func OrderTestWithCommissionsResponseInit(o *OrderTestWithCommissionsResponse) {
	o.SpecialCommissionForOrderMaker = math.MinInt64
	o.SpecialCommissionForOrderTaker = math.MinInt64
	return
}

func (*OrderTestWithCommissionsResponse) SbeBlockLength() (blockLength uint16) {
	return 60
}

func (*OrderTestWithCommissionsResponse) SbeTemplateId() (templateId uint16) {
	return 315
}

func (*OrderTestWithCommissionsResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*OrderTestWithCommissionsResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*OrderTestWithCommissionsResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*OrderTestWithCommissionsResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*OrderTestWithCommissionsResponse) CommissionExponentId() uint16 {
	return 1
}

func (*OrderTestWithCommissionsResponse) CommissionExponentSinceVersion() uint16 {
	return 0
}

func (o *OrderTestWithCommissionsResponse) CommissionExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.CommissionExponentSinceVersion()
}

func (*OrderTestWithCommissionsResponse) CommissionExponentDeprecated() uint16 {
	return 0
}

func (*OrderTestWithCommissionsResponse) CommissionExponentMetaAttribute(meta int) string {
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

func (*OrderTestWithCommissionsResponse) CommissionExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*OrderTestWithCommissionsResponse) CommissionExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*OrderTestWithCommissionsResponse) CommissionExponentNullValue() int8 {
	return math.MinInt8
}

func (*OrderTestWithCommissionsResponse) DiscountExponentId() uint16 {
	return 2
}

func (*OrderTestWithCommissionsResponse) DiscountExponentSinceVersion() uint16 {
	return 0
}

func (o *OrderTestWithCommissionsResponse) DiscountExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.DiscountExponentSinceVersion()
}

func (*OrderTestWithCommissionsResponse) DiscountExponentDeprecated() uint16 {
	return 0
}

func (*OrderTestWithCommissionsResponse) DiscountExponentMetaAttribute(meta int) string {
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

func (*OrderTestWithCommissionsResponse) DiscountExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*OrderTestWithCommissionsResponse) DiscountExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*OrderTestWithCommissionsResponse) DiscountExponentNullValue() int8 {
	return math.MinInt8
}

func (*OrderTestWithCommissionsResponse) StandardCommissionForOrderMakerId() uint16 {
	return 3
}

func (*OrderTestWithCommissionsResponse) StandardCommissionForOrderMakerSinceVersion() uint16 {
	return 0
}

func (o *OrderTestWithCommissionsResponse) StandardCommissionForOrderMakerInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.StandardCommissionForOrderMakerSinceVersion()
}

func (*OrderTestWithCommissionsResponse) StandardCommissionForOrderMakerDeprecated() uint16 {
	return 0
}

func (*OrderTestWithCommissionsResponse) StandardCommissionForOrderMakerMetaAttribute(meta int) string {
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

func (*OrderTestWithCommissionsResponse) StandardCommissionForOrderMakerMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderTestWithCommissionsResponse) StandardCommissionForOrderMakerMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderTestWithCommissionsResponse) StandardCommissionForOrderMakerNullValue() int64 {
	return math.MinInt64
}

func (*OrderTestWithCommissionsResponse) StandardCommissionForOrderTakerId() uint16 {
	return 4
}

func (*OrderTestWithCommissionsResponse) StandardCommissionForOrderTakerSinceVersion() uint16 {
	return 0
}

func (o *OrderTestWithCommissionsResponse) StandardCommissionForOrderTakerInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.StandardCommissionForOrderTakerSinceVersion()
}

func (*OrderTestWithCommissionsResponse) StandardCommissionForOrderTakerDeprecated() uint16 {
	return 0
}

func (*OrderTestWithCommissionsResponse) StandardCommissionForOrderTakerMetaAttribute(meta int) string {
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

func (*OrderTestWithCommissionsResponse) StandardCommissionForOrderTakerMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderTestWithCommissionsResponse) StandardCommissionForOrderTakerMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderTestWithCommissionsResponse) StandardCommissionForOrderTakerNullValue() int64 {
	return math.MinInt64
}

func (*OrderTestWithCommissionsResponse) TaxCommissionForOrderMakerId() uint16 {
	return 5
}

func (*OrderTestWithCommissionsResponse) TaxCommissionForOrderMakerSinceVersion() uint16 {
	return 0
}

func (o *OrderTestWithCommissionsResponse) TaxCommissionForOrderMakerInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.TaxCommissionForOrderMakerSinceVersion()
}

func (*OrderTestWithCommissionsResponse) TaxCommissionForOrderMakerDeprecated() uint16 {
	return 0
}

func (*OrderTestWithCommissionsResponse) TaxCommissionForOrderMakerMetaAttribute(meta int) string {
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

func (*OrderTestWithCommissionsResponse) TaxCommissionForOrderMakerMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderTestWithCommissionsResponse) TaxCommissionForOrderMakerMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderTestWithCommissionsResponse) TaxCommissionForOrderMakerNullValue() int64 {
	return math.MinInt64
}

func (*OrderTestWithCommissionsResponse) TaxCommissionForOrderTakerId() uint16 {
	return 6
}

func (*OrderTestWithCommissionsResponse) TaxCommissionForOrderTakerSinceVersion() uint16 {
	return 0
}

func (o *OrderTestWithCommissionsResponse) TaxCommissionForOrderTakerInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.TaxCommissionForOrderTakerSinceVersion()
}

func (*OrderTestWithCommissionsResponse) TaxCommissionForOrderTakerDeprecated() uint16 {
	return 0
}

func (*OrderTestWithCommissionsResponse) TaxCommissionForOrderTakerMetaAttribute(meta int) string {
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

func (*OrderTestWithCommissionsResponse) TaxCommissionForOrderTakerMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderTestWithCommissionsResponse) TaxCommissionForOrderTakerMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderTestWithCommissionsResponse) TaxCommissionForOrderTakerNullValue() int64 {
	return math.MinInt64
}

func (*OrderTestWithCommissionsResponse) DiscountEnabledForAccountId() uint16 {
	return 7
}

func (*OrderTestWithCommissionsResponse) DiscountEnabledForAccountSinceVersion() uint16 {
	return 0
}

func (o *OrderTestWithCommissionsResponse) DiscountEnabledForAccountInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.DiscountEnabledForAccountSinceVersion()
}

func (*OrderTestWithCommissionsResponse) DiscountEnabledForAccountDeprecated() uint16 {
	return 0
}

func (*OrderTestWithCommissionsResponse) DiscountEnabledForAccountMetaAttribute(meta int) string {
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

func (*OrderTestWithCommissionsResponse) DiscountEnabledForSymbolId() uint16 {
	return 8
}

func (*OrderTestWithCommissionsResponse) DiscountEnabledForSymbolSinceVersion() uint16 {
	return 0
}

func (o *OrderTestWithCommissionsResponse) DiscountEnabledForSymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.DiscountEnabledForSymbolSinceVersion()
}

func (*OrderTestWithCommissionsResponse) DiscountEnabledForSymbolDeprecated() uint16 {
	return 0
}

func (*OrderTestWithCommissionsResponse) DiscountEnabledForSymbolMetaAttribute(meta int) string {
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

func (*OrderTestWithCommissionsResponse) DiscountId() uint16 {
	return 9
}

func (*OrderTestWithCommissionsResponse) DiscountSinceVersion() uint16 {
	return 0
}

func (o *OrderTestWithCommissionsResponse) DiscountInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.DiscountSinceVersion()
}

func (*OrderTestWithCommissionsResponse) DiscountDeprecated() uint16 {
	return 0
}

func (*OrderTestWithCommissionsResponse) DiscountMetaAttribute(meta int) string {
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

func (*OrderTestWithCommissionsResponse) DiscountMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderTestWithCommissionsResponse) DiscountMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderTestWithCommissionsResponse) DiscountNullValue() int64 {
	return math.MinInt64
}

func (*OrderTestWithCommissionsResponse) SpecialCommissionForOrderMakerId() uint16 {
	return 10
}

func (*OrderTestWithCommissionsResponse) SpecialCommissionForOrderMakerSinceVersion() uint16 {
	return 1
}

func (o *OrderTestWithCommissionsResponse) SpecialCommissionForOrderMakerInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.SpecialCommissionForOrderMakerSinceVersion()
}

func (*OrderTestWithCommissionsResponse) SpecialCommissionForOrderMakerDeprecated() uint16 {
	return 0
}

func (*OrderTestWithCommissionsResponse) SpecialCommissionForOrderMakerMetaAttribute(meta int) string {
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

func (*OrderTestWithCommissionsResponse) SpecialCommissionForOrderMakerMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderTestWithCommissionsResponse) SpecialCommissionForOrderMakerMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderTestWithCommissionsResponse) SpecialCommissionForOrderMakerNullValue() int64 {
	return math.MinInt64
}

func (*OrderTestWithCommissionsResponse) SpecialCommissionForOrderTakerId() uint16 {
	return 11
}

func (*OrderTestWithCommissionsResponse) SpecialCommissionForOrderTakerSinceVersion() uint16 {
	return 1
}

func (o *OrderTestWithCommissionsResponse) SpecialCommissionForOrderTakerInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.SpecialCommissionForOrderTakerSinceVersion()
}

func (*OrderTestWithCommissionsResponse) SpecialCommissionForOrderTakerDeprecated() uint16 {
	return 0
}

func (*OrderTestWithCommissionsResponse) SpecialCommissionForOrderTakerMetaAttribute(meta int) string {
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

func (*OrderTestWithCommissionsResponse) SpecialCommissionForOrderTakerMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderTestWithCommissionsResponse) SpecialCommissionForOrderTakerMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderTestWithCommissionsResponse) SpecialCommissionForOrderTakerNullValue() int64 {
	return math.MinInt64
}

func (*OrderTestWithCommissionsResponse) DiscountAssetMetaAttribute(meta int) string {
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

func (*OrderTestWithCommissionsResponse) DiscountAssetSinceVersion() uint16 {
	return 0
}

func (o *OrderTestWithCommissionsResponse) DiscountAssetInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.DiscountAssetSinceVersion()
}

func (*OrderTestWithCommissionsResponse) DiscountAssetDeprecated() uint16 {
	return 0
}

func (OrderTestWithCommissionsResponse) DiscountAssetCharacterEncoding() string {
	return "UTF-8"
}

func (OrderTestWithCommissionsResponse) DiscountAssetHeaderLength() uint64 {
	return 1
}
