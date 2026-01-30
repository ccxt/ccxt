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

type AccountResponse struct {
	CommissionExponent         int8
	CommissionRateMaker        int64
	CommissionRateTaker        int64
	CommissionRateBuyer        int64
	CommissionRateSeller       int64
	CanTrade                   BoolEnumEnum
	CanWithdraw                BoolEnumEnum
	CanDeposit                 BoolEnumEnum
	Brokered                   BoolEnumEnum
	RequireSelfTradePrevention BoolEnumEnum
	PreventSor                 BoolEnumEnum
	UpdateTime                 int64
	AccountType                AccountTypeEnum
	TradeGroupId               int64
	Uid                        int64
	Balances                   []AccountResponseBalances
	Permissions                []AccountResponsePermissions
	ReduceOnlyAssets           []AccountResponseReduceOnlyAssets
}
type AccountResponseBalances struct {
	Exponent int8
	Free     int64
	Locked   int64
	Asset    []uint8
}
type AccountResponsePermissions struct {
	Permission []uint8
}
type AccountResponseReduceOnlyAssets struct {
	Asset []uint8
}

func (a *AccountResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := a.RangeCheck(a.SbeSchemaVersion(), a.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt8(_w, a.CommissionExponent); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.CommissionRateMaker); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.CommissionRateTaker); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.CommissionRateBuyer); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.CommissionRateSeller); err != nil {
		return err
	}
	if err := a.CanTrade.Encode(_m, _w); err != nil {
		return err
	}
	if err := a.CanWithdraw.Encode(_m, _w); err != nil {
		return err
	}
	if err := a.CanDeposit.Encode(_m, _w); err != nil {
		return err
	}
	if err := a.Brokered.Encode(_m, _w); err != nil {
		return err
	}
	if err := a.RequireSelfTradePrevention.Encode(_m, _w); err != nil {
		return err
	}
	if err := a.PreventSor.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.UpdateTime); err != nil {
		return err
	}
	if err := a.AccountType.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.TradeGroupId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.Uid); err != nil {
		return err
	}
	var BalancesBlockLength uint16 = 17
	if err := _m.WriteUint16(_w, BalancesBlockLength); err != nil {
		return err
	}
	var BalancesNumInGroup uint32 = uint32(len(a.Balances))
	if err := _m.WriteUint32(_w, BalancesNumInGroup); err != nil {
		return err
	}
	for i := range a.Balances {
		if err := a.Balances[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	var PermissionsBlockLength uint16 = 0
	if err := _m.WriteUint16(_w, PermissionsBlockLength); err != nil {
		return err
	}
	var PermissionsNumInGroup uint32 = uint32(len(a.Permissions))
	if err := _m.WriteUint32(_w, PermissionsNumInGroup); err != nil {
		return err
	}
	for i := range a.Permissions {
		if err := a.Permissions[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	var ReduceOnlyAssetsBlockLength uint16 = 0
	if err := _m.WriteUint16(_w, ReduceOnlyAssetsBlockLength); err != nil {
		return err
	}
	var ReduceOnlyAssetsNumInGroup uint32 = uint32(len(a.ReduceOnlyAssets))
	if err := _m.WriteUint32(_w, ReduceOnlyAssetsNumInGroup); err != nil {
		return err
	}
	for i := range a.ReduceOnlyAssets {
		if err := a.ReduceOnlyAssets[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	return nil
}

func (a *AccountResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if !a.CommissionExponentInActingVersion(actingVersion) {
		a.CommissionExponent = a.CommissionExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &a.CommissionExponent); err != nil {
			return err
		}
	}
	if !a.CommissionRateMakerInActingVersion(actingVersion) {
		a.CommissionRateMaker = a.CommissionRateMakerNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.CommissionRateMaker); err != nil {
			return err
		}
	}
	if !a.CommissionRateTakerInActingVersion(actingVersion) {
		a.CommissionRateTaker = a.CommissionRateTakerNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.CommissionRateTaker); err != nil {
			return err
		}
	}
	if !a.CommissionRateBuyerInActingVersion(actingVersion) {
		a.CommissionRateBuyer = a.CommissionRateBuyerNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.CommissionRateBuyer); err != nil {
			return err
		}
	}
	if !a.CommissionRateSellerInActingVersion(actingVersion) {
		a.CommissionRateSeller = a.CommissionRateSellerNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.CommissionRateSeller); err != nil {
			return err
		}
	}
	if a.CanTradeInActingVersion(actingVersion) {
		if err := a.CanTrade.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if a.CanWithdrawInActingVersion(actingVersion) {
		if err := a.CanWithdraw.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if a.CanDepositInActingVersion(actingVersion) {
		if err := a.CanDeposit.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if a.BrokeredInActingVersion(actingVersion) {
		if err := a.Brokered.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if a.RequireSelfTradePreventionInActingVersion(actingVersion) {
		if err := a.RequireSelfTradePrevention.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if a.PreventSorInActingVersion(actingVersion) {
		if err := a.PreventSor.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if !a.UpdateTimeInActingVersion(actingVersion) {
		a.UpdateTime = a.UpdateTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.UpdateTime); err != nil {
			return err
		}
	}
	if a.AccountTypeInActingVersion(actingVersion) {
		if err := a.AccountType.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if !a.TradeGroupIdInActingVersion(actingVersion) {
		a.TradeGroupId = a.TradeGroupIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.TradeGroupId); err != nil {
			return err
		}
	}
	if !a.UidInActingVersion(actingVersion) {
		a.Uid = a.UidNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.Uid); err != nil {
			return err
		}
	}
	if actingVersion > a.SbeSchemaVersion() && blockLength > a.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-a.SbeBlockLength()))
	}

	if a.BalancesInActingVersion(actingVersion) {
		var BalancesBlockLength uint16
		if err := _m.ReadUint16(_r, &BalancesBlockLength); err != nil {
			return err
		}
		var BalancesNumInGroup uint32
		if err := _m.ReadUint32(_r, &BalancesNumInGroup); err != nil {
			return err
		}
		if cap(a.Balances) < int(BalancesNumInGroup) {
			a.Balances = make([]AccountResponseBalances, BalancesNumInGroup)
		}
		a.Balances = a.Balances[:BalancesNumInGroup]
		for i := range a.Balances {
			if err := a.Balances[i].Decode(_m, _r, actingVersion, uint(BalancesBlockLength)); err != nil {
				return err
			}
		}
	}

	if a.PermissionsInActingVersion(actingVersion) {
		var PermissionsBlockLength uint16
		if err := _m.ReadUint16(_r, &PermissionsBlockLength); err != nil {
			return err
		}
		var PermissionsNumInGroup uint32
		if err := _m.ReadUint32(_r, &PermissionsNumInGroup); err != nil {
			return err
		}
		if cap(a.Permissions) < int(PermissionsNumInGroup) {
			a.Permissions = make([]AccountResponsePermissions, PermissionsNumInGroup)
		}
		a.Permissions = a.Permissions[:PermissionsNumInGroup]
		for i := range a.Permissions {
			if err := a.Permissions[i].Decode(_m, _r, actingVersion, uint(PermissionsBlockLength)); err != nil {
				return err
			}
		}
	}

	if a.ReduceOnlyAssetsInActingVersion(actingVersion) {
		var ReduceOnlyAssetsBlockLength uint16
		if err := _m.ReadUint16(_r, &ReduceOnlyAssetsBlockLength); err != nil {
			return err
		}
		var ReduceOnlyAssetsNumInGroup uint32
		if err := _m.ReadUint32(_r, &ReduceOnlyAssetsNumInGroup); err != nil {
			return err
		}
		if cap(a.ReduceOnlyAssets) < int(ReduceOnlyAssetsNumInGroup) {
			a.ReduceOnlyAssets = make([]AccountResponseReduceOnlyAssets, ReduceOnlyAssetsNumInGroup)
		}
		a.ReduceOnlyAssets = a.ReduceOnlyAssets[:ReduceOnlyAssetsNumInGroup]
		for i := range a.ReduceOnlyAssets {
			if err := a.ReduceOnlyAssets[i].Decode(_m, _r, actingVersion, uint(ReduceOnlyAssetsBlockLength)); err != nil {
				return err
			}
		}
	}
	if doRangeCheck {
		if err := a.RangeCheck(actingVersion, a.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (a *AccountResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if a.CommissionExponentInActingVersion(actingVersion) {
		if a.CommissionExponent < a.CommissionExponentMinValue() || a.CommissionExponent > a.CommissionExponentMaxValue() {
			return fmt.Errorf("Range check failed on a.CommissionExponent (%v < %v > %v)", a.CommissionExponentMinValue(), a.CommissionExponent, a.CommissionExponentMaxValue())
		}
	}
	if a.CommissionRateMakerInActingVersion(actingVersion) {
		if a.CommissionRateMaker < a.CommissionRateMakerMinValue() || a.CommissionRateMaker > a.CommissionRateMakerMaxValue() {
			return fmt.Errorf("Range check failed on a.CommissionRateMaker (%v < %v > %v)", a.CommissionRateMakerMinValue(), a.CommissionRateMaker, a.CommissionRateMakerMaxValue())
		}
	}
	if a.CommissionRateTakerInActingVersion(actingVersion) {
		if a.CommissionRateTaker < a.CommissionRateTakerMinValue() || a.CommissionRateTaker > a.CommissionRateTakerMaxValue() {
			return fmt.Errorf("Range check failed on a.CommissionRateTaker (%v < %v > %v)", a.CommissionRateTakerMinValue(), a.CommissionRateTaker, a.CommissionRateTakerMaxValue())
		}
	}
	if a.CommissionRateBuyerInActingVersion(actingVersion) {
		if a.CommissionRateBuyer < a.CommissionRateBuyerMinValue() || a.CommissionRateBuyer > a.CommissionRateBuyerMaxValue() {
			return fmt.Errorf("Range check failed on a.CommissionRateBuyer (%v < %v > %v)", a.CommissionRateBuyerMinValue(), a.CommissionRateBuyer, a.CommissionRateBuyerMaxValue())
		}
	}
	if a.CommissionRateSellerInActingVersion(actingVersion) {
		if a.CommissionRateSeller < a.CommissionRateSellerMinValue() || a.CommissionRateSeller > a.CommissionRateSellerMaxValue() {
			return fmt.Errorf("Range check failed on a.CommissionRateSeller (%v < %v > %v)", a.CommissionRateSellerMinValue(), a.CommissionRateSeller, a.CommissionRateSellerMaxValue())
		}
	}
	if err := a.CanTrade.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := a.CanWithdraw.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := a.CanDeposit.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := a.Brokered.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := a.RequireSelfTradePrevention.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := a.PreventSor.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if a.UpdateTimeInActingVersion(actingVersion) {
		if a.UpdateTime < a.UpdateTimeMinValue() || a.UpdateTime > a.UpdateTimeMaxValue() {
			return fmt.Errorf("Range check failed on a.UpdateTime (%v < %v > %v)", a.UpdateTimeMinValue(), a.UpdateTime, a.UpdateTimeMaxValue())
		}
	}
	if err := a.AccountType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if a.TradeGroupIdInActingVersion(actingVersion) {
		if a.TradeGroupId != a.TradeGroupIdNullValue() && (a.TradeGroupId < a.TradeGroupIdMinValue() || a.TradeGroupId > a.TradeGroupIdMaxValue()) {
			return fmt.Errorf("Range check failed on a.TradeGroupId (%v < %v > %v)", a.TradeGroupIdMinValue(), a.TradeGroupId, a.TradeGroupIdMaxValue())
		}
	}
	if a.UidInActingVersion(actingVersion) {
		if a.Uid < a.UidMinValue() || a.Uid > a.UidMaxValue() {
			return fmt.Errorf("Range check failed on a.Uid (%v < %v > %v)", a.UidMinValue(), a.Uid, a.UidMaxValue())
		}
	}
	for i := range a.Balances {
		if err := a.Balances[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	for i := range a.Permissions {
		if err := a.Permissions[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	for i := range a.ReduceOnlyAssets {
		if err := a.ReduceOnlyAssets[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	return nil
}

func AccountResponseInit(a *AccountResponse) {
	a.TradeGroupId = math.MinInt64
	return
}

func (a *AccountResponseBalances) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteInt8(_w, a.Exponent); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.Free); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, a.Locked); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(a.Asset))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, a.Asset); err != nil {
		return err
	}
	return nil
}

func (a *AccountResponseBalances) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if !a.ExponentInActingVersion(actingVersion) {
		a.Exponent = a.ExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &a.Exponent); err != nil {
			return err
		}
	}
	if !a.FreeInActingVersion(actingVersion) {
		a.Free = a.FreeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.Free); err != nil {
			return err
		}
	}
	if !a.LockedInActingVersion(actingVersion) {
		a.Locked = a.LockedNullValue()
	} else {
		if err := _m.ReadInt64(_r, &a.Locked); err != nil {
			return err
		}
	}
	if actingVersion > a.SbeSchemaVersion() && blockLength > a.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-a.SbeBlockLength()))
	}

	if a.AssetInActingVersion(actingVersion) {
		var AssetLength uint8
		if err := _m.ReadUint8(_r, &AssetLength); err != nil {
			return err
		}
		if cap(a.Asset) < int(AssetLength) {
			a.Asset = make([]uint8, AssetLength)
		}
		a.Asset = a.Asset[:AssetLength]
		if err := _m.ReadBytes(_r, a.Asset); err != nil {
			return err
		}
	}
	return nil
}

func (a *AccountResponseBalances) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if a.ExponentInActingVersion(actingVersion) {
		if a.Exponent < a.ExponentMinValue() || a.Exponent > a.ExponentMaxValue() {
			return fmt.Errorf("Range check failed on a.Exponent (%v < %v > %v)", a.ExponentMinValue(), a.Exponent, a.ExponentMaxValue())
		}
	}
	if a.FreeInActingVersion(actingVersion) {
		if a.Free < a.FreeMinValue() || a.Free > a.FreeMaxValue() {
			return fmt.Errorf("Range check failed on a.Free (%v < %v > %v)", a.FreeMinValue(), a.Free, a.FreeMaxValue())
		}
	}
	if a.LockedInActingVersion(actingVersion) {
		if a.Locked < a.LockedMinValue() || a.Locked > a.LockedMaxValue() {
			return fmt.Errorf("Range check failed on a.Locked (%v < %v > %v)", a.LockedMinValue(), a.Locked, a.LockedMaxValue())
		}
	}
	if !utf8.Valid(a.Asset[:]) {
		return errors.New("a.Asset failed UTF-8 validation")
	}
	return nil
}

func AccountResponseBalancesInit(a *AccountResponseBalances) {
	return
}

func (a *AccountResponsePermissions) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint8(_w, uint8(len(a.Permission))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, a.Permission); err != nil {
		return err
	}
	return nil
}

func (a *AccountResponsePermissions) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if actingVersion > a.SbeSchemaVersion() && blockLength > a.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-a.SbeBlockLength()))
	}

	if a.PermissionInActingVersion(actingVersion) {
		var PermissionLength uint8
		if err := _m.ReadUint8(_r, &PermissionLength); err != nil {
			return err
		}
		if cap(a.Permission) < int(PermissionLength) {
			a.Permission = make([]uint8, PermissionLength)
		}
		a.Permission = a.Permission[:PermissionLength]
		if err := _m.ReadBytes(_r, a.Permission); err != nil {
			return err
		}
	}
	return nil
}

func (a *AccountResponsePermissions) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if !utf8.Valid(a.Permission[:]) {
		return errors.New("a.Permission failed UTF-8 validation")
	}
	return nil
}

func AccountResponsePermissionsInit(a *AccountResponsePermissions) {
	return
}

func (a *AccountResponseReduceOnlyAssets) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint8(_w, uint8(len(a.Asset))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, a.Asset); err != nil {
		return err
	}
	return nil
}

func (a *AccountResponseReduceOnlyAssets) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if actingVersion > a.SbeSchemaVersion() && blockLength > a.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-a.SbeBlockLength()))
	}

	if a.AssetInActingVersion(actingVersion) {
		var AssetLength uint8
		if err := _m.ReadUint8(_r, &AssetLength); err != nil {
			return err
		}
		if cap(a.Asset) < int(AssetLength) {
			a.Asset = make([]uint8, AssetLength)
		}
		a.Asset = a.Asset[:AssetLength]
		if err := _m.ReadBytes(_r, a.Asset); err != nil {
			return err
		}
	}
	return nil
}

func (a *AccountResponseReduceOnlyAssets) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if !utf8.Valid(a.Asset[:]) {
		return errors.New("a.Asset failed UTF-8 validation")
	}
	return nil
}

func AccountResponseReduceOnlyAssetsInit(a *AccountResponseReduceOnlyAssets) {
	return
}

func (*AccountResponse) SbeBlockLength() (blockLength uint16) {
	return 64
}

func (*AccountResponse) SbeTemplateId() (templateId uint16) {
	return 400
}

func (*AccountResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*AccountResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*AccountResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*AccountResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*AccountResponse) CommissionExponentId() uint16 {
	return 1
}

func (*AccountResponse) CommissionExponentSinceVersion() uint16 {
	return 0
}

func (a *AccountResponse) CommissionExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.CommissionExponentSinceVersion()
}

func (*AccountResponse) CommissionExponentDeprecated() uint16 {
	return 0
}

func (*AccountResponse) CommissionExponentMetaAttribute(meta int) string {
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

func (*AccountResponse) CommissionExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*AccountResponse) CommissionExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*AccountResponse) CommissionExponentNullValue() int8 {
	return math.MinInt8
}

func (*AccountResponse) CommissionRateMakerId() uint16 {
	return 2
}

func (*AccountResponse) CommissionRateMakerSinceVersion() uint16 {
	return 0
}

func (a *AccountResponse) CommissionRateMakerInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.CommissionRateMakerSinceVersion()
}

func (*AccountResponse) CommissionRateMakerDeprecated() uint16 {
	return 0
}

func (*AccountResponse) CommissionRateMakerMetaAttribute(meta int) string {
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

func (*AccountResponse) CommissionRateMakerMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountResponse) CommissionRateMakerMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountResponse) CommissionRateMakerNullValue() int64 {
	return math.MinInt64
}

func (*AccountResponse) CommissionRateTakerId() uint16 {
	return 3
}

func (*AccountResponse) CommissionRateTakerSinceVersion() uint16 {
	return 0
}

func (a *AccountResponse) CommissionRateTakerInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.CommissionRateTakerSinceVersion()
}

func (*AccountResponse) CommissionRateTakerDeprecated() uint16 {
	return 0
}

func (*AccountResponse) CommissionRateTakerMetaAttribute(meta int) string {
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

func (*AccountResponse) CommissionRateTakerMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountResponse) CommissionRateTakerMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountResponse) CommissionRateTakerNullValue() int64 {
	return math.MinInt64
}

func (*AccountResponse) CommissionRateBuyerId() uint16 {
	return 4
}

func (*AccountResponse) CommissionRateBuyerSinceVersion() uint16 {
	return 0
}

func (a *AccountResponse) CommissionRateBuyerInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.CommissionRateBuyerSinceVersion()
}

func (*AccountResponse) CommissionRateBuyerDeprecated() uint16 {
	return 0
}

func (*AccountResponse) CommissionRateBuyerMetaAttribute(meta int) string {
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

func (*AccountResponse) CommissionRateBuyerMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountResponse) CommissionRateBuyerMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountResponse) CommissionRateBuyerNullValue() int64 {
	return math.MinInt64
}

func (*AccountResponse) CommissionRateSellerId() uint16 {
	return 5
}

func (*AccountResponse) CommissionRateSellerSinceVersion() uint16 {
	return 0
}

func (a *AccountResponse) CommissionRateSellerInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.CommissionRateSellerSinceVersion()
}

func (*AccountResponse) CommissionRateSellerDeprecated() uint16 {
	return 0
}

func (*AccountResponse) CommissionRateSellerMetaAttribute(meta int) string {
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

func (*AccountResponse) CommissionRateSellerMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountResponse) CommissionRateSellerMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountResponse) CommissionRateSellerNullValue() int64 {
	return math.MinInt64
}

func (*AccountResponse) CanTradeId() uint16 {
	return 6
}

func (*AccountResponse) CanTradeSinceVersion() uint16 {
	return 0
}

func (a *AccountResponse) CanTradeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.CanTradeSinceVersion()
}

func (*AccountResponse) CanTradeDeprecated() uint16 {
	return 0
}

func (*AccountResponse) CanTradeMetaAttribute(meta int) string {
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

func (*AccountResponse) CanWithdrawId() uint16 {
	return 7
}

func (*AccountResponse) CanWithdrawSinceVersion() uint16 {
	return 0
}

func (a *AccountResponse) CanWithdrawInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.CanWithdrawSinceVersion()
}

func (*AccountResponse) CanWithdrawDeprecated() uint16 {
	return 0
}

func (*AccountResponse) CanWithdrawMetaAttribute(meta int) string {
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

func (*AccountResponse) CanDepositId() uint16 {
	return 8
}

func (*AccountResponse) CanDepositSinceVersion() uint16 {
	return 0
}

func (a *AccountResponse) CanDepositInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.CanDepositSinceVersion()
}

func (*AccountResponse) CanDepositDeprecated() uint16 {
	return 0
}

func (*AccountResponse) CanDepositMetaAttribute(meta int) string {
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

func (*AccountResponse) BrokeredId() uint16 {
	return 9
}

func (*AccountResponse) BrokeredSinceVersion() uint16 {
	return 0
}

func (a *AccountResponse) BrokeredInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.BrokeredSinceVersion()
}

func (*AccountResponse) BrokeredDeprecated() uint16 {
	return 0
}

func (*AccountResponse) BrokeredMetaAttribute(meta int) string {
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

func (*AccountResponse) RequireSelfTradePreventionId() uint16 {
	return 10
}

func (*AccountResponse) RequireSelfTradePreventionSinceVersion() uint16 {
	return 0
}

func (a *AccountResponse) RequireSelfTradePreventionInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.RequireSelfTradePreventionSinceVersion()
}

func (*AccountResponse) RequireSelfTradePreventionDeprecated() uint16 {
	return 0
}

func (*AccountResponse) RequireSelfTradePreventionMetaAttribute(meta int) string {
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

func (*AccountResponse) PreventSorId() uint16 {
	return 11
}

func (*AccountResponse) PreventSorSinceVersion() uint16 {
	return 0
}

func (a *AccountResponse) PreventSorInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.PreventSorSinceVersion()
}

func (*AccountResponse) PreventSorDeprecated() uint16 {
	return 0
}

func (*AccountResponse) PreventSorMetaAttribute(meta int) string {
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

func (*AccountResponse) UpdateTimeId() uint16 {
	return 12
}

func (*AccountResponse) UpdateTimeSinceVersion() uint16 {
	return 0
}

func (a *AccountResponse) UpdateTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.UpdateTimeSinceVersion()
}

func (*AccountResponse) UpdateTimeDeprecated() uint16 {
	return 0
}

func (*AccountResponse) UpdateTimeMetaAttribute(meta int) string {
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

func (*AccountResponse) UpdateTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountResponse) UpdateTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountResponse) UpdateTimeNullValue() int64 {
	return math.MinInt64
}

func (*AccountResponse) AccountTypeId() uint16 {
	return 13
}

func (*AccountResponse) AccountTypeSinceVersion() uint16 {
	return 0
}

func (a *AccountResponse) AccountTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.AccountTypeSinceVersion()
}

func (*AccountResponse) AccountTypeDeprecated() uint16 {
	return 0
}

func (*AccountResponse) AccountTypeMetaAttribute(meta int) string {
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

func (*AccountResponse) TradeGroupIdId() uint16 {
	return 14
}

func (*AccountResponse) TradeGroupIdSinceVersion() uint16 {
	return 0
}

func (a *AccountResponse) TradeGroupIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.TradeGroupIdSinceVersion()
}

func (*AccountResponse) TradeGroupIdDeprecated() uint16 {
	return 0
}

func (*AccountResponse) TradeGroupIdMetaAttribute(meta int) string {
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

func (*AccountResponse) TradeGroupIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountResponse) TradeGroupIdMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountResponse) TradeGroupIdNullValue() int64 {
	return math.MinInt64
}

func (*AccountResponse) UidId() uint16 {
	return 15
}

func (*AccountResponse) UidSinceVersion() uint16 {
	return 0
}

func (a *AccountResponse) UidInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.UidSinceVersion()
}

func (*AccountResponse) UidDeprecated() uint16 {
	return 0
}

func (*AccountResponse) UidMetaAttribute(meta int) string {
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

func (*AccountResponse) UidMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountResponse) UidMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountResponse) UidNullValue() int64 {
	return math.MinInt64
}

func (*AccountResponseBalances) ExponentId() uint16 {
	return 1
}

func (*AccountResponseBalances) ExponentSinceVersion() uint16 {
	return 0
}

func (a *AccountResponseBalances) ExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.ExponentSinceVersion()
}

func (*AccountResponseBalances) ExponentDeprecated() uint16 {
	return 0
}

func (*AccountResponseBalances) ExponentMetaAttribute(meta int) string {
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

func (*AccountResponseBalances) ExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*AccountResponseBalances) ExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*AccountResponseBalances) ExponentNullValue() int8 {
	return math.MinInt8
}

func (*AccountResponseBalances) FreeId() uint16 {
	return 2
}

func (*AccountResponseBalances) FreeSinceVersion() uint16 {
	return 0
}

func (a *AccountResponseBalances) FreeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.FreeSinceVersion()
}

func (*AccountResponseBalances) FreeDeprecated() uint16 {
	return 0
}

func (*AccountResponseBalances) FreeMetaAttribute(meta int) string {
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

func (*AccountResponseBalances) FreeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountResponseBalances) FreeMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountResponseBalances) FreeNullValue() int64 {
	return math.MinInt64
}

func (*AccountResponseBalances) LockedId() uint16 {
	return 3
}

func (*AccountResponseBalances) LockedSinceVersion() uint16 {
	return 0
}

func (a *AccountResponseBalances) LockedInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.LockedSinceVersion()
}

func (*AccountResponseBalances) LockedDeprecated() uint16 {
	return 0
}

func (*AccountResponseBalances) LockedMetaAttribute(meta int) string {
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

func (*AccountResponseBalances) LockedMinValue() int64 {
	return math.MinInt64 + 1
}

func (*AccountResponseBalances) LockedMaxValue() int64 {
	return math.MaxInt64
}

func (*AccountResponseBalances) LockedNullValue() int64 {
	return math.MinInt64
}

func (*AccountResponseBalances) AssetMetaAttribute(meta int) string {
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

func (*AccountResponseBalances) AssetSinceVersion() uint16 {
	return 0
}

func (a *AccountResponseBalances) AssetInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.AssetSinceVersion()
}

func (*AccountResponseBalances) AssetDeprecated() uint16 {
	return 0
}

func (AccountResponseBalances) AssetCharacterEncoding() string {
	return "UTF-8"
}

func (AccountResponseBalances) AssetHeaderLength() uint64 {
	return 1
}

func (*AccountResponsePermissions) PermissionMetaAttribute(meta int) string {
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

func (*AccountResponsePermissions) PermissionSinceVersion() uint16 {
	return 0
}

func (a *AccountResponsePermissions) PermissionInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.PermissionSinceVersion()
}

func (*AccountResponsePermissions) PermissionDeprecated() uint16 {
	return 0
}

func (AccountResponsePermissions) PermissionCharacterEncoding() string {
	return "UTF-8"
}

func (AccountResponsePermissions) PermissionHeaderLength() uint64 {
	return 1
}

func (*AccountResponseReduceOnlyAssets) AssetMetaAttribute(meta int) string {
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

func (*AccountResponseReduceOnlyAssets) AssetSinceVersion() uint16 {
	return 0
}

func (a *AccountResponseReduceOnlyAssets) AssetInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.AssetSinceVersion()
}

func (*AccountResponseReduceOnlyAssets) AssetDeprecated() uint16 {
	return 0
}

func (AccountResponseReduceOnlyAssets) AssetCharacterEncoding() string {
	return "UTF-8"
}

func (AccountResponseReduceOnlyAssets) AssetHeaderLength() uint64 {
	return 1
}

func (*AccountResponse) BalancesId() uint16 {
	return 100
}

func (*AccountResponse) BalancesSinceVersion() uint16 {
	return 0
}

func (a *AccountResponse) BalancesInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.BalancesSinceVersion()
}

func (*AccountResponse) BalancesDeprecated() uint16 {
	return 0
}

func (*AccountResponseBalances) SbeBlockLength() (blockLength uint) {
	return 17
}

func (*AccountResponseBalances) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*AccountResponse) PermissionsId() uint16 {
	return 101
}

func (*AccountResponse) PermissionsSinceVersion() uint16 {
	return 0
}

func (a *AccountResponse) PermissionsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.PermissionsSinceVersion()
}

func (*AccountResponse) PermissionsDeprecated() uint16 {
	return 0
}

func (*AccountResponsePermissions) SbeBlockLength() (blockLength uint) {
	return 0
}

func (*AccountResponsePermissions) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*AccountResponse) ReduceOnlyAssetsId() uint16 {
	return 102
}

func (*AccountResponse) ReduceOnlyAssetsSinceVersion() uint16 {
	return 0
}

func (a *AccountResponse) ReduceOnlyAssetsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.ReduceOnlyAssetsSinceVersion()
}

func (*AccountResponse) ReduceOnlyAssetsDeprecated() uint16 {
	return 0
}

func (*AccountResponseReduceOnlyAssets) SbeBlockLength() (blockLength uint) {
	return 0
}

func (*AccountResponseReduceOnlyAssets) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}
