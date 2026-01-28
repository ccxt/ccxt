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

type AccountCommissionResponse struct {
	CommissionExponent        int8
	DiscountExponent          int8
	StandardCommissionMaker   int64
	StandardCommissionTaker   int64
	StandardCommissionBuyer   int64
	StandardCommissionSeller  int64
	TaxCommissionMaker        int64
	TaxCommissionTaker        int64
	TaxCommissionBuyer        int64
	TaxCommissionSeller       int64
	DiscountEnabledForAccount BoolEnumEnum
	DiscountEnabledForSymbol  BoolEnumEnum
	Discount                  int64
	SpecialCommissionMaker    int64
	SpecialCommissionTaker    int64
	SpecialCommissionBuyer    int64
	SpecialCommissionSeller   int64
	Symbol                    []uint8
	DiscountAsset             []uint8
}

func (a *AccountCommissionResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := a.RangeCheck(a.SbeSchemaVersion(), a.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt8(_w, a.CommissionExponent); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, a.DiscountExponent); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.StandardCommissionMaker); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.StandardCommissionTaker); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.StandardCommissionBuyer); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.StandardCommissionSeller); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.TaxCommissionMaker); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.TaxCommissionTaker); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.TaxCommissionBuyer); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.TaxCommissionSeller); err != nil {
		return err
	}
	if err := a.DiscountEnabledForAccount.Encode(_m, _w); err != nil {
		return err
	}
	if err := a.DiscountEnabledForSymbol.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.Discount); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.SpecialCommissionMaker); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.SpecialCommissionTaker); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.SpecialCommissionBuyer); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.SpecialCommissionSeller); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(a.Symbol))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, a.Symbol); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(a.DiscountAsset))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, a.DiscountAsset); err != nil {
		return err
	}
	return nil
}

func (a *AccountCommissionResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if !a.CommissionExponentInActingVersion(actingVersion) {
		a.CommissionExponent = a.CommissionExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &a.CommissionExponent); err != nil {
			return err
		}
	}
	if !a.DiscountExponentInActingVersion(actingVersion) {
		a.DiscountExponent = a.DiscountExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &a.DiscountExponent); err != nil {
			return err
		}
	}
	if !a.StandardCommissionMakerInActingVersion(actingVersion) {
		a.StandardCommissionMaker = a.StandardCommissionMakerNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.StandardCommissionMaker); err != nil {
			return err
		}
	}
	if !a.StandardCommissionTakerInActingVersion(actingVersion) {
		a.StandardCommissionTaker = a.StandardCommissionTakerNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.StandardCommissionTaker); err != nil {
			return err
		}
	}
	if !a.StandardCommissionBuyerInActingVersion(actingVersion) {
		a.StandardCommissionBuyer = a.StandardCommissionBuyerNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.StandardCommissionBuyer); err != nil {
			return err
		}
	}
	if !a.StandardCommissionSellerInActingVersion(actingVersion) {
		a.StandardCommissionSeller = a.StandardCommissionSellerNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.StandardCommissionSeller); err != nil {
			return err
		}
	}
	if !a.TaxCommissionMakerInActingVersion(actingVersion) {
		a.TaxCommissionMaker = a.TaxCommissionMakerNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.TaxCommissionMaker); err != nil {
			return err
		}
	}
	if !a.TaxCommissionTakerInActingVersion(actingVersion) {
		a.TaxCommissionTaker = a.TaxCommissionTakerNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.TaxCommissionTaker); err != nil {
			return err
		}
	}
	if !a.TaxCommissionBuyerInActingVersion(actingVersion) {
		a.TaxCommissionBuyer = a.TaxCommissionBuyerNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.TaxCommissionBuyer); err != nil {
			return err
		}
	}
	if !a.TaxCommissionSellerInActingVersion(actingVersion) {
		a.TaxCommissionSeller = a.TaxCommissionSellerNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.TaxCommissionSeller); err != nil {
			return err
		}
	}
	if a.DiscountEnabledForAccountInActingVersion(actingVersion) {
		if err := a.DiscountEnabledForAccount.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if a.DiscountEnabledForSymbolInActingVersion(actingVersion) {
		if err := a.DiscountEnabledForSymbol.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if !a.DiscountInActingVersion(actingVersion) {
		a.Discount = a.DiscountNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.Discount); err != nil {
			return err
		}
	}
	if !a.SpecialCommissionMakerInActingVersion(actingVersion) {
		a.SpecialCommissionMaker = a.SpecialCommissionMakerNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.SpecialCommissionMaker); err != nil {
			return err
		}
	}
	if !a.SpecialCommissionTakerInActingVersion(actingVersion) {
		a.SpecialCommissionTaker = a.SpecialCommissionTakerNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.SpecialCommissionTaker); err != nil {
			return err
		}
	}
	if !a.SpecialCommissionBuyerInActingVersion(actingVersion) {
		a.SpecialCommissionBuyer = a.SpecialCommissionBuyerNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.SpecialCommissionBuyer); err != nil {
			return err
		}
	}
	if !a.SpecialCommissionSellerInActingVersion(actingVersion) {
		a.SpecialCommissionSeller = a.SpecialCommissionSellerNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.SpecialCommissionSeller); err != nil {
			return err
		}
	}
	if actingVersion > a.SbeSchemaVersion() && blockLength > a.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-a.SbeBlockLength()))
	}

	if a.SymbolInActingVersion(actingVersion) {
		var SymbolLength uint8
		if err := _m.ReadUint8(_r, &SymbolLength); err != nil {
			return err
		}
		if cap(a.Symbol) < int(SymbolLength) {
			a.Symbol = make([]uint8, SymbolLength)
		}
		a.Symbol = a.Symbol[:SymbolLength]
		if err := _m.ReadBytes(_r, a.Symbol); err != nil {
			return err
		}
	}

	if a.DiscountAssetInActingVersion(actingVersion) {
		var DiscountAssetLength uint8
		if err := _m.ReadUint8(_r, &DiscountAssetLength); err != nil {
			return err
		}
		if cap(a.DiscountAsset) < int(DiscountAssetLength) {
			a.DiscountAsset = make([]uint8, DiscountAssetLength)
		}
		a.DiscountAsset = a.DiscountAsset[:DiscountAssetLength]
		if err := _m.ReadBytes(_r, a.DiscountAsset); err != nil {
			return err
		}
	}
	if doRangeCheck {
		if err := a.RangeCheck(actingVersion, a.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (a *AccountCommissionResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if a.CommissionExponentInActingVersion(actingVersion) {
		if a.CommissionExponent < a.CommissionExponentMinValue() || a.CommissionExponent > a.CommissionExponentMaxValue() {
			return fmt.Errorf("Range check failed on a.CommissionExponent (%v < %v > %v)", a.CommissionExponentMinValue(), a.CommissionExponent, a.CommissionExponentMaxValue())
		}
	}
	if a.DiscountExponentInActingVersion(actingVersion) {
		if a.DiscountExponent < a.DiscountExponentMinValue() || a.DiscountExponent > a.DiscountExponentMaxValue() {
			return fmt.Errorf("Range check failed on a.DiscountExponent (%v < %v > %v)", a.DiscountExponentMinValue(), a.DiscountExponent, a.DiscountExponentMaxValue())
		}
	}
	if a.StandardCommissionMakerInActingVersion(actingVersion) {
		if a.StandardCommissionMaker < a.StandardCommissionMakerMinValue() || a.StandardCommissionMaker > a.StandardCommissionMakerMaxValue() {
			return fmt.Errorf("Range check failed on a.StandardCommissionMaker (%v < %v > %v)", a.StandardCommissionMakerMinValue(), a.StandardCommissionMaker, a.StandardCommissionMakerMaxValue())
		}
	}
	if a.StandardCommissionTakerInActingVersion(actingVersion) {
		if a.StandardCommissionTaker < a.StandardCommissionTakerMinValue() || a.StandardCommissionTaker > a.StandardCommissionTakerMaxValue() {
			return fmt.Errorf("Range check failed on a.StandardCommissionTaker (%v < %v > %v)", a.StandardCommissionTakerMinValue(), a.StandardCommissionTaker, a.StandardCommissionTakerMaxValue())
		}
	}
	if a.StandardCommissionBuyerInActingVersion(actingVersion) {
		if a.StandardCommissionBuyer < a.StandardCommissionBuyerMinValue() || a.StandardCommissionBuyer > a.StandardCommissionBuyerMaxValue() {
			return fmt.Errorf("Range check failed on a.StandardCommissionBuyer (%v < %v > %v)", a.StandardCommissionBuyerMinValue(), a.StandardCommissionBuyer, a.StandardCommissionBuyerMaxValue())
		}
	}
	if a.StandardCommissionSellerInActingVersion(actingVersion) {
		if a.StandardCommissionSeller < a.StandardCommissionSellerMinValue() || a.StandardCommissionSeller > a.StandardCommissionSellerMaxValue() {
			return fmt.Errorf("Range check failed on a.StandardCommissionSeller (%v < %v > %v)", a.StandardCommissionSellerMinValue(), a.StandardCommissionSeller, a.StandardCommissionSellerMaxValue())
		}
	}
	if a.TaxCommissionMakerInActingVersion(actingVersion) {
		if a.TaxCommissionMaker < a.TaxCommissionMakerMinValue() || a.TaxCommissionMaker > a.TaxCommissionMakerMaxValue() {
			return fmt.Errorf("Range check failed on a.TaxCommissionMaker (%v < %v > %v)", a.TaxCommissionMakerMinValue(), a.TaxCommissionMaker, a.TaxCommissionMakerMaxValue())
		}
	}
	if a.TaxCommissionTakerInActingVersion(actingVersion) {
		if a.TaxCommissionTaker < a.TaxCommissionTakerMinValue() || a.TaxCommissionTaker > a.TaxCommissionTakerMaxValue() {
			return fmt.Errorf("Range check failed on a.TaxCommissionTaker (%v < %v > %v)", a.TaxCommissionTakerMinValue(), a.TaxCommissionTaker, a.TaxCommissionTakerMaxValue())
		}
	}
	if a.TaxCommissionBuyerInActingVersion(actingVersion) {
		if a.TaxCommissionBuyer < a.TaxCommissionBuyerMinValue() || a.TaxCommissionBuyer > a.TaxCommissionBuyerMaxValue() {
			return fmt.Errorf("Range check failed on a.TaxCommissionBuyer (%v < %v > %v)", a.TaxCommissionBuyerMinValue(), a.TaxCommissionBuyer, a.TaxCommissionBuyerMaxValue())
		}
	}
	if a.TaxCommissionSellerInActingVersion(actingVersion) {
		if a.TaxCommissionSeller < a.TaxCommissionSellerMinValue() || a.TaxCommissionSeller > a.TaxCommissionSellerMaxValue() {
			return fmt.Errorf("Range check failed on a.TaxCommissionSeller (%v < %v > %v)", a.TaxCommissionSellerMinValue(), a.TaxCommissionSeller, a.TaxCommissionSellerMaxValue())
		}
	}
	if err := a.DiscountEnabledForAccount.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := a.DiscountEnabledForSymbol.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if a.DiscountInActingVersion(actingVersion) {
		if a.Discount < a.DiscountMinValue() || a.Discount > a.DiscountMaxValue() {
			return fmt.Errorf("Range check failed on a.Discount (%v < %v > %v)", a.DiscountMinValue(), a.Discount, a.DiscountMaxValue())
		}
	}
	if a.SpecialCommissionMakerInActingVersion(actingVersion) {
		if a.SpecialCommissionMaker != a.SpecialCommissionMakerNullValue() && (a.SpecialCommissionMaker < a.SpecialCommissionMakerMinValue() || a.SpecialCommissionMaker > a.SpecialCommissionMakerMaxValue()) {
			return fmt.Errorf("Range check failed on a.SpecialCommissionMaker (%v < %v > %v)", a.SpecialCommissionMakerMinValue(), a.SpecialCommissionMaker, a.SpecialCommissionMakerMaxValue())
		}
	}
	if a.SpecialCommissionTakerInActingVersion(actingVersion) {
		if a.SpecialCommissionTaker != a.SpecialCommissionTakerNullValue() && (a.SpecialCommissionTaker < a.SpecialCommissionTakerMinValue() || a.SpecialCommissionTaker > a.SpecialCommissionTakerMaxValue()) {
			return fmt.Errorf("Range check failed on a.SpecialCommissionTaker (%v < %v > %v)", a.SpecialCommissionTakerMinValue(), a.SpecialCommissionTaker, a.SpecialCommissionTakerMaxValue())
		}
	}
	if a.SpecialCommissionBuyerInActingVersion(actingVersion) {
		if a.SpecialCommissionBuyer != a.SpecialCommissionBuyerNullValue() && (a.SpecialCommissionBuyer < a.SpecialCommissionBuyerMinValue() || a.SpecialCommissionBuyer > a.SpecialCommissionBuyerMaxValue()) {
			return fmt.Errorf("Range check failed on a.SpecialCommissionBuyer (%v < %v > %v)", a.SpecialCommissionBuyerMinValue(), a.SpecialCommissionBuyer, a.SpecialCommissionBuyerMaxValue())
		}
	}
	if a.SpecialCommissionSellerInActingVersion(actingVersion) {
		if a.SpecialCommissionSeller != a.SpecialCommissionSellerNullValue() && (a.SpecialCommissionSeller < a.SpecialCommissionSellerMinValue() || a.SpecialCommissionSeller > a.SpecialCommissionSellerMaxValue()) {
			return fmt.Errorf("Range check failed on a.SpecialCommissionSeller (%v < %v > %v)", a.SpecialCommissionSellerMinValue(), a.SpecialCommissionSeller, a.SpecialCommissionSellerMaxValue())
		}
	}
	if !utf8.Valid(a.Symbol[:]) {
		return errors.New("a.Symbol failed UTF-8 validation")
	}
	if !utf8.Valid(a.DiscountAsset[:]) {
		return errors.New("a.DiscountAsset failed UTF-8 validation")
	}
	return nil
}

func AccountCommissionResponseInit(a *AccountCommissionResponse) {
	a.SpecialCommissionMaker = math.MinInt64
	a.SpecialCommissionTaker = math.MinInt64
	a.SpecialCommissionBuyer = math.MinInt64
	a.SpecialCommissionSeller = math.MinInt64
	return
}

func (*AccountCommissionResponse) SbeBlockLength() (blockLength uint16) {
	return 108
}

func (*AccountCommissionResponse) SbeTemplateId() (templateId uint16) {
	return 405
}

func (*AccountCommissionResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*AccountCommissionResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*AccountCommissionResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*AccountCommissionResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*AccountCommissionResponse) CommissionExponentId() uint16 {
	return 1
}

func (*AccountCommissionResponse) CommissionExponentSinceVersion() uint16 {
	return 0
}

func (a *AccountCommissionResponse) CommissionExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.CommissionExponentSinceVersion()
}

func (*AccountCommissionResponse) CommissionExponentDeprecated() uint16 {
	return 0
}

func (*AccountCommissionResponse) CommissionExponentMetaAttribute(meta int) string {
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

func (*AccountCommissionResponse) CommissionExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*AccountCommissionResponse) CommissionExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*AccountCommissionResponse) CommissionExponentNullValue() int8 {
	return math.MinInt8
}

func (*AccountCommissionResponse) DiscountExponentId() uint16 {
	return 2
}

func (*AccountCommissionResponse) DiscountExponentSinceVersion() uint16 {
	return 0
}

func (a *AccountCommissionResponse) DiscountExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.DiscountExponentSinceVersion()
}

func (*AccountCommissionResponse) DiscountExponentDeprecated() uint16 {
	return 0
}

func (*AccountCommissionResponse) DiscountExponentMetaAttribute(meta int) string {
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

func (*AccountCommissionResponse) DiscountExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*AccountCommissionResponse) DiscountExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*AccountCommissionResponse) DiscountExponentNullValue() int8 {
	return math.MinInt8
}

func (*AccountCommissionResponse) StandardCommissionMakerId() uint16 {
	return 3
}

func (*AccountCommissionResponse) StandardCommissionMakerSinceVersion() uint16 {
	return 0
}

func (a *AccountCommissionResponse) StandardCommissionMakerInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.StandardCommissionMakerSinceVersion()
}

func (*AccountCommissionResponse) StandardCommissionMakerDeprecated() uint16 {
	return 0
}

func (*AccountCommissionResponse) StandardCommissionMakerMetaAttribute(meta int) string {
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

func (*AccountCommissionResponse) StandardCommissionMakerMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountCommissionResponse) StandardCommissionMakerMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountCommissionResponse) StandardCommissionMakerNullValue() int64 {
	return math.MinInt64
}

func (*AccountCommissionResponse) StandardCommissionTakerId() uint16 {
	return 4
}

func (*AccountCommissionResponse) StandardCommissionTakerSinceVersion() uint16 {
	return 0
}

func (a *AccountCommissionResponse) StandardCommissionTakerInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.StandardCommissionTakerSinceVersion()
}

func (*AccountCommissionResponse) StandardCommissionTakerDeprecated() uint16 {
	return 0
}

func (*AccountCommissionResponse) StandardCommissionTakerMetaAttribute(meta int) string {
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

func (*AccountCommissionResponse) StandardCommissionTakerMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountCommissionResponse) StandardCommissionTakerMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountCommissionResponse) StandardCommissionTakerNullValue() int64 {
	return math.MinInt64
}

func (*AccountCommissionResponse) StandardCommissionBuyerId() uint16 {
	return 5
}

func (*AccountCommissionResponse) StandardCommissionBuyerSinceVersion() uint16 {
	return 0
}

func (a *AccountCommissionResponse) StandardCommissionBuyerInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.StandardCommissionBuyerSinceVersion()
}

func (*AccountCommissionResponse) StandardCommissionBuyerDeprecated() uint16 {
	return 0
}

func (*AccountCommissionResponse) StandardCommissionBuyerMetaAttribute(meta int) string {
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

func (*AccountCommissionResponse) StandardCommissionBuyerMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountCommissionResponse) StandardCommissionBuyerMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountCommissionResponse) StandardCommissionBuyerNullValue() int64 {
	return math.MinInt64
}

func (*AccountCommissionResponse) StandardCommissionSellerId() uint16 {
	return 6
}

func (*AccountCommissionResponse) StandardCommissionSellerSinceVersion() uint16 {
	return 0
}

func (a *AccountCommissionResponse) StandardCommissionSellerInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.StandardCommissionSellerSinceVersion()
}

func (*AccountCommissionResponse) StandardCommissionSellerDeprecated() uint16 {
	return 0
}

func (*AccountCommissionResponse) StandardCommissionSellerMetaAttribute(meta int) string {
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

func (*AccountCommissionResponse) StandardCommissionSellerMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountCommissionResponse) StandardCommissionSellerMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountCommissionResponse) StandardCommissionSellerNullValue() int64 {
	return math.MinInt64
}

func (*AccountCommissionResponse) TaxCommissionMakerId() uint16 {
	return 7
}

func (*AccountCommissionResponse) TaxCommissionMakerSinceVersion() uint16 {
	return 0
}

func (a *AccountCommissionResponse) TaxCommissionMakerInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.TaxCommissionMakerSinceVersion()
}

func (*AccountCommissionResponse) TaxCommissionMakerDeprecated() uint16 {
	return 0
}

func (*AccountCommissionResponse) TaxCommissionMakerMetaAttribute(meta int) string {
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

func (*AccountCommissionResponse) TaxCommissionMakerMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountCommissionResponse) TaxCommissionMakerMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountCommissionResponse) TaxCommissionMakerNullValue() int64 {
	return math.MinInt64
}

func (*AccountCommissionResponse) TaxCommissionTakerId() uint16 {
	return 8
}

func (*AccountCommissionResponse) TaxCommissionTakerSinceVersion() uint16 {
	return 0
}

func (a *AccountCommissionResponse) TaxCommissionTakerInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.TaxCommissionTakerSinceVersion()
}

func (*AccountCommissionResponse) TaxCommissionTakerDeprecated() uint16 {
	return 0
}

func (*AccountCommissionResponse) TaxCommissionTakerMetaAttribute(meta int) string {
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

func (*AccountCommissionResponse) TaxCommissionTakerMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountCommissionResponse) TaxCommissionTakerMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountCommissionResponse) TaxCommissionTakerNullValue() int64 {
	return math.MinInt64
}

func (*AccountCommissionResponse) TaxCommissionBuyerId() uint16 {
	return 9
}

func (*AccountCommissionResponse) TaxCommissionBuyerSinceVersion() uint16 {
	return 0
}

func (a *AccountCommissionResponse) TaxCommissionBuyerInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.TaxCommissionBuyerSinceVersion()
}

func (*AccountCommissionResponse) TaxCommissionBuyerDeprecated() uint16 {
	return 0
}

func (*AccountCommissionResponse) TaxCommissionBuyerMetaAttribute(meta int) string {
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

func (*AccountCommissionResponse) TaxCommissionBuyerMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountCommissionResponse) TaxCommissionBuyerMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountCommissionResponse) TaxCommissionBuyerNullValue() int64 {
	return math.MinInt64
}

func (*AccountCommissionResponse) TaxCommissionSellerId() uint16 {
	return 10
}

func (*AccountCommissionResponse) TaxCommissionSellerSinceVersion() uint16 {
	return 0
}

func (a *AccountCommissionResponse) TaxCommissionSellerInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.TaxCommissionSellerSinceVersion()
}

func (*AccountCommissionResponse) TaxCommissionSellerDeprecated() uint16 {
	return 0
}

func (*AccountCommissionResponse) TaxCommissionSellerMetaAttribute(meta int) string {
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

func (*AccountCommissionResponse) TaxCommissionSellerMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountCommissionResponse) TaxCommissionSellerMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountCommissionResponse) TaxCommissionSellerNullValue() int64 {
	return math.MinInt64
}

func (*AccountCommissionResponse) DiscountEnabledForAccountId() uint16 {
	return 11
}

func (*AccountCommissionResponse) DiscountEnabledForAccountSinceVersion() uint16 {
	return 0
}

func (a *AccountCommissionResponse) DiscountEnabledForAccountInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.DiscountEnabledForAccountSinceVersion()
}

func (*AccountCommissionResponse) DiscountEnabledForAccountDeprecated() uint16 {
	return 0
}

func (*AccountCommissionResponse) DiscountEnabledForAccountMetaAttribute(meta int) string {
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

func (*AccountCommissionResponse) DiscountEnabledForSymbolId() uint16 {
	return 12
}

func (*AccountCommissionResponse) DiscountEnabledForSymbolSinceVersion() uint16 {
	return 0
}

func (a *AccountCommissionResponse) DiscountEnabledForSymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.DiscountEnabledForSymbolSinceVersion()
}

func (*AccountCommissionResponse) DiscountEnabledForSymbolDeprecated() uint16 {
	return 0
}

func (*AccountCommissionResponse) DiscountEnabledForSymbolMetaAttribute(meta int) string {
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

func (*AccountCommissionResponse) DiscountId() uint16 {
	return 13
}

func (*AccountCommissionResponse) DiscountSinceVersion() uint16 {
	return 0
}

func (a *AccountCommissionResponse) DiscountInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.DiscountSinceVersion()
}

func (*AccountCommissionResponse) DiscountDeprecated() uint16 {
	return 0
}

func (*AccountCommissionResponse) DiscountMetaAttribute(meta int) string {
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

func (*AccountCommissionResponse) DiscountMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountCommissionResponse) DiscountMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountCommissionResponse) DiscountNullValue() int64 {
	return math.MinInt64
}

func (*AccountCommissionResponse) SpecialCommissionMakerId() uint16 {
	return 14
}

func (*AccountCommissionResponse) SpecialCommissionMakerSinceVersion() uint16 {
	return 1
}

func (a *AccountCommissionResponse) SpecialCommissionMakerInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.SpecialCommissionMakerSinceVersion()
}

func (*AccountCommissionResponse) SpecialCommissionMakerDeprecated() uint16 {
	return 0
}

func (*AccountCommissionResponse) SpecialCommissionMakerMetaAttribute(meta int) string {
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

func (*AccountCommissionResponse) SpecialCommissionMakerMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountCommissionResponse) SpecialCommissionMakerMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountCommissionResponse) SpecialCommissionMakerNullValue() int64 {
	return math.MinInt64
}

func (*AccountCommissionResponse) SpecialCommissionTakerId() uint16 {
	return 15
}

func (*AccountCommissionResponse) SpecialCommissionTakerSinceVersion() uint16 {
	return 1
}

func (a *AccountCommissionResponse) SpecialCommissionTakerInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.SpecialCommissionTakerSinceVersion()
}

func (*AccountCommissionResponse) SpecialCommissionTakerDeprecated() uint16 {
	return 0
}

func (*AccountCommissionResponse) SpecialCommissionTakerMetaAttribute(meta int) string {
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

func (*AccountCommissionResponse) SpecialCommissionTakerMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountCommissionResponse) SpecialCommissionTakerMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountCommissionResponse) SpecialCommissionTakerNullValue() int64 {
	return math.MinInt64
}

func (*AccountCommissionResponse) SpecialCommissionBuyerId() uint16 {
	return 16
}

func (*AccountCommissionResponse) SpecialCommissionBuyerSinceVersion() uint16 {
	return 1
}

func (a *AccountCommissionResponse) SpecialCommissionBuyerInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.SpecialCommissionBuyerSinceVersion()
}

func (*AccountCommissionResponse) SpecialCommissionBuyerDeprecated() uint16 {
	return 0
}

func (*AccountCommissionResponse) SpecialCommissionBuyerMetaAttribute(meta int) string {
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

func (*AccountCommissionResponse) SpecialCommissionBuyerMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountCommissionResponse) SpecialCommissionBuyerMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountCommissionResponse) SpecialCommissionBuyerNullValue() int64 {
	return math.MinInt64
}

func (*AccountCommissionResponse) SpecialCommissionSellerId() uint16 {
	return 17
}

func (*AccountCommissionResponse) SpecialCommissionSellerSinceVersion() uint16 {
	return 1
}

func (a *AccountCommissionResponse) SpecialCommissionSellerInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.SpecialCommissionSellerSinceVersion()
}

func (*AccountCommissionResponse) SpecialCommissionSellerDeprecated() uint16 {
	return 0
}

func (*AccountCommissionResponse) SpecialCommissionSellerMetaAttribute(meta int) string {
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

func (*AccountCommissionResponse) SpecialCommissionSellerMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountCommissionResponse) SpecialCommissionSellerMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountCommissionResponse) SpecialCommissionSellerNullValue() int64 {
	return math.MinInt64
}

func (*AccountCommissionResponse) SymbolMetaAttribute(meta int) string {
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

func (*AccountCommissionResponse) SymbolSinceVersion() uint16 {
	return 0
}

func (a *AccountCommissionResponse) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.SymbolSinceVersion()
}

func (*AccountCommissionResponse) SymbolDeprecated() uint16 {
	return 0
}

func (AccountCommissionResponse) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (AccountCommissionResponse) SymbolHeaderLength() uint64 {
	return 1
}

func (*AccountCommissionResponse) DiscountAssetMetaAttribute(meta int) string {
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

func (*AccountCommissionResponse) DiscountAssetSinceVersion() uint16 {
	return 0
}

func (a *AccountCommissionResponse) DiscountAssetInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.DiscountAssetSinceVersion()
}

func (*AccountCommissionResponse) DiscountAssetDeprecated() uint16 {
	return 0
}

func (AccountCommissionResponse) DiscountAssetCharacterEncoding() string {
	return "UTF-8"
}

func (AccountCommissionResponse) DiscountAssetHeaderLength() uint64 {
	return 1
}
