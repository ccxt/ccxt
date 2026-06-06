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

type ListStatusEvent struct {
	EventTime         int64
	TransactTime      int64
	OrderListId       int64
	ContingencyType   ContingencyTypeEnum
	ListStatusType    ListStatusTypeEnum
	ListOrderStatus   ListOrderStatusEnum
	SubscriptionId    uint16
	Orders            []ListStatusEventOrders
	Symbol            []uint8
	ListClientOrderId []uint8
	RejectReason      []uint8
}
type ListStatusEventOrders struct {
	OrderId       int64
	Symbol        []uint8
	ClientOrderId []uint8
}

func (l *ListStatusEvent) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := l.RangeCheck(l.SbeSchemaVersion(), l.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt64(_w, l.EventTime); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, l.TransactTime); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, l.OrderListId); err != nil {
		return err
	}
	if err := l.ContingencyType.Encode(_m, _w); err != nil {
		return err
	}
	if err := l.ListStatusType.Encode(_m, _w); err != nil {
		return err
	}
	if err := l.ListOrderStatus.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteUint16(_w, l.SubscriptionId); err != nil {
		return err
	}
	var OrdersBlockLength uint16 = 8
	if err := _m.WriteUint16(_w, OrdersBlockLength); err != nil {
		return err
	}
	var OrdersNumInGroup uint16 = uint16(len(l.Orders))
	if err := _m.WriteUint16(_w, OrdersNumInGroup); err != nil {
		return err
	}
	for i := range l.Orders {
		if err := l.Orders[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	if err := _m.WriteUint8(_w, uint8(len(l.Symbol))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, l.Symbol); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(l.ListClientOrderId))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, l.ListClientOrderId); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(l.RejectReason))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, l.RejectReason); err != nil {
		return err
	}
	return nil
}

func (l *ListStatusEvent) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if !l.EventTimeInActingVersion(actingVersion) {
		l.EventTime = l.EventTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &l.EventTime); err != nil {
			return err
		}
	}
	if !l.TransactTimeInActingVersion(actingVersion) {
		l.TransactTime = l.TransactTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &l.TransactTime); err != nil {
			return err
		}
	}
	if !l.OrderListIdInActingVersion(actingVersion) {
		l.OrderListId = l.OrderListIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &l.OrderListId); err != nil {
			return err
		}
	}
	if l.ContingencyTypeInActingVersion(actingVersion) {
		if err := l.ContingencyType.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if l.ListStatusTypeInActingVersion(actingVersion) {
		if err := l.ListStatusType.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if l.ListOrderStatusInActingVersion(actingVersion) {
		if err := l.ListOrderStatus.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if !l.SubscriptionIdInActingVersion(actingVersion) {
		l.SubscriptionId = l.SubscriptionIdNullValue()
	} else {
		if err := _m.ReadUint16(_r, &l.SubscriptionId); err != nil {
			return err
		}
	}
	if actingVersion > l.SbeSchemaVersion() && blockLength > l.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-l.SbeBlockLength()))
	}

	if l.OrdersInActingVersion(actingVersion) {
		var OrdersBlockLength uint16
		if err := _m.ReadUint16(_r, &OrdersBlockLength); err != nil {
			return err
		}
		var OrdersNumInGroup uint16
		if err := _m.ReadUint16(_r, &OrdersNumInGroup); err != nil {
			return err
		}
		if cap(l.Orders) < int(OrdersNumInGroup) {
			l.Orders = make([]ListStatusEventOrders, OrdersNumInGroup)
		}
		l.Orders = l.Orders[:OrdersNumInGroup]
		for i := range l.Orders {
			if err := l.Orders[i].Decode(_m, _r, actingVersion, uint(OrdersBlockLength)); err != nil {
				return err
			}
		}
	}

	if l.SymbolInActingVersion(actingVersion) {
		var SymbolLength uint8
		if err := _m.ReadUint8(_r, &SymbolLength); err != nil {
			return err
		}
		if cap(l.Symbol) < int(SymbolLength) {
			l.Symbol = make([]uint8, SymbolLength)
		}
		l.Symbol = l.Symbol[:SymbolLength]
		if err := _m.ReadBytes(_r, l.Symbol); err != nil {
			return err
		}
	}

	if l.ListClientOrderIdInActingVersion(actingVersion) {
		var ListClientOrderIdLength uint8
		if err := _m.ReadUint8(_r, &ListClientOrderIdLength); err != nil {
			return err
		}
		if cap(l.ListClientOrderId) < int(ListClientOrderIdLength) {
			l.ListClientOrderId = make([]uint8, ListClientOrderIdLength)
		}
		l.ListClientOrderId = l.ListClientOrderId[:ListClientOrderIdLength]
		if err := _m.ReadBytes(_r, l.ListClientOrderId); err != nil {
			return err
		}
	}

	if l.RejectReasonInActingVersion(actingVersion) {
		var RejectReasonLength uint8
		if err := _m.ReadUint8(_r, &RejectReasonLength); err != nil {
			return err
		}
		if cap(l.RejectReason) < int(RejectReasonLength) {
			l.RejectReason = make([]uint8, RejectReasonLength)
		}
		l.RejectReason = l.RejectReason[:RejectReasonLength]
		if err := _m.ReadBytes(_r, l.RejectReason); err != nil {
			return err
		}
	}
	if doRangeCheck {
		if err := l.RangeCheck(actingVersion, l.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (l *ListStatusEvent) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if l.EventTimeInActingVersion(actingVersion) {
		if l.EventTime < l.EventTimeMinValue() || l.EventTime > l.EventTimeMaxValue() {
			return fmt.Errorf("Range check failed on l.EventTime (%v < %v > %v)", l.EventTimeMinValue(), l.EventTime, l.EventTimeMaxValue())
		}
	}
	if l.TransactTimeInActingVersion(actingVersion) {
		if l.TransactTime < l.TransactTimeMinValue() || l.TransactTime > l.TransactTimeMaxValue() {
			return fmt.Errorf("Range check failed on l.TransactTime (%v < %v > %v)", l.TransactTimeMinValue(), l.TransactTime, l.TransactTimeMaxValue())
		}
	}
	if l.OrderListIdInActingVersion(actingVersion) {
		if l.OrderListId < l.OrderListIdMinValue() || l.OrderListId > l.OrderListIdMaxValue() {
			return fmt.Errorf("Range check failed on l.OrderListId (%v < %v > %v)", l.OrderListIdMinValue(), l.OrderListId, l.OrderListIdMaxValue())
		}
	}
	if err := l.ContingencyType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := l.ListStatusType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := l.ListOrderStatus.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if l.SubscriptionIdInActingVersion(actingVersion) {
		if l.SubscriptionId != l.SubscriptionIdNullValue() && (l.SubscriptionId < l.SubscriptionIdMinValue() || l.SubscriptionId > l.SubscriptionIdMaxValue()) {
			return fmt.Errorf("Range check failed on l.SubscriptionId (%v < %v > %v)", l.SubscriptionIdMinValue(), l.SubscriptionId, l.SubscriptionIdMaxValue())
		}
	}
	for i := range l.Orders {
		if err := l.Orders[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	if !utf8.Valid(l.Symbol[:]) {
		return errors.New("l.Symbol failed UTF-8 validation")
	}
	if !utf8.Valid(l.ListClientOrderId[:]) {
		return errors.New("l.ListClientOrderId failed UTF-8 validation")
	}
	if !utf8.Valid(l.RejectReason[:]) {
		return errors.New("l.RejectReason failed UTF-8 validation")
	}
	return nil
}

func ListStatusEventInit(l *ListStatusEvent) {
	l.SubscriptionId = math.MaxUint16
	return
}

func (l *ListStatusEventOrders) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteInt64(_w, l.OrderId); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(l.Symbol))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, l.Symbol); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(l.ClientOrderId))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, l.ClientOrderId); err != nil {
		return err
	}
	return nil
}

func (l *ListStatusEventOrders) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if !l.OrderIdInActingVersion(actingVersion) {
		l.OrderId = l.OrderIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &l.OrderId); err != nil {
			return err
		}
	}
	if actingVersion > l.SbeSchemaVersion() && blockLength > l.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-l.SbeBlockLength()))
	}

	if l.SymbolInActingVersion(actingVersion) {
		var SymbolLength uint8
		if err := _m.ReadUint8(_r, &SymbolLength); err != nil {
			return err
		}
		if cap(l.Symbol) < int(SymbolLength) {
			l.Symbol = make([]uint8, SymbolLength)
		}
		l.Symbol = l.Symbol[:SymbolLength]
		if err := _m.ReadBytes(_r, l.Symbol); err != nil {
			return err
		}
	}

	if l.ClientOrderIdInActingVersion(actingVersion) {
		var ClientOrderIdLength uint8
		if err := _m.ReadUint8(_r, &ClientOrderIdLength); err != nil {
			return err
		}
		if cap(l.ClientOrderId) < int(ClientOrderIdLength) {
			l.ClientOrderId = make([]uint8, ClientOrderIdLength)
		}
		l.ClientOrderId = l.ClientOrderId[:ClientOrderIdLength]
		if err := _m.ReadBytes(_r, l.ClientOrderId); err != nil {
			return err
		}
	}
	return nil
}

func (l *ListStatusEventOrders) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if l.OrderIdInActingVersion(actingVersion) {
		if l.OrderId < l.OrderIdMinValue() || l.OrderId > l.OrderIdMaxValue() {
			return fmt.Errorf("Range check failed on l.OrderId (%v < %v > %v)", l.OrderIdMinValue(), l.OrderId, l.OrderIdMaxValue())
		}
	}
	if !utf8.Valid(l.Symbol[:]) {
		return errors.New("l.Symbol failed UTF-8 validation")
	}
	if !utf8.Valid(l.ClientOrderId[:]) {
		return errors.New("l.ClientOrderId failed UTF-8 validation")
	}
	return nil
}

func ListStatusEventOrdersInit(l *ListStatusEventOrders) {
	return
}

func (*ListStatusEvent) SbeBlockLength() (blockLength uint16) {
	return 29
}

func (*ListStatusEvent) SbeTemplateId() (templateId uint16) {
	return 606
}

func (*ListStatusEvent) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*ListStatusEvent) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*ListStatusEvent) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*ListStatusEvent) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*ListStatusEvent) EventTimeId() uint16 {
	return 1
}

func (*ListStatusEvent) EventTimeSinceVersion() uint16 {
	return 0
}

func (l *ListStatusEvent) EventTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= l.EventTimeSinceVersion()
}

func (*ListStatusEvent) EventTimeDeprecated() uint16 {
	return 0
}

func (*ListStatusEvent) EventTimeMetaAttribute(meta int) string {
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

func (*ListStatusEvent) EventTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ListStatusEvent) EventTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*ListStatusEvent) EventTimeNullValue() int64 {
	return math.MinInt64
}

func (*ListStatusEvent) TransactTimeId() uint16 {
	return 2
}

func (*ListStatusEvent) TransactTimeSinceVersion() uint16 {
	return 0
}

func (l *ListStatusEvent) TransactTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= l.TransactTimeSinceVersion()
}

func (*ListStatusEvent) TransactTimeDeprecated() uint16 {
	return 0
}

func (*ListStatusEvent) TransactTimeMetaAttribute(meta int) string {
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

func (*ListStatusEvent) TransactTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ListStatusEvent) TransactTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*ListStatusEvent) TransactTimeNullValue() int64 {
	return math.MinInt64
}

func (*ListStatusEvent) OrderListIdId() uint16 {
	return 3
}

func (*ListStatusEvent) OrderListIdSinceVersion() uint16 {
	return 0
}

func (l *ListStatusEvent) OrderListIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= l.OrderListIdSinceVersion()
}

func (*ListStatusEvent) OrderListIdDeprecated() uint16 {
	return 0
}

func (*ListStatusEvent) OrderListIdMetaAttribute(meta int) string {
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

func (*ListStatusEvent) OrderListIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ListStatusEvent) OrderListIdMaxValue() int64 {
	return math.MaxInt64
}

func (*ListStatusEvent) OrderListIdNullValue() int64 {
	return math.MinInt64
}

func (*ListStatusEvent) ContingencyTypeId() uint16 {
	return 4
}

func (*ListStatusEvent) ContingencyTypeSinceVersion() uint16 {
	return 0
}

func (l *ListStatusEvent) ContingencyTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= l.ContingencyTypeSinceVersion()
}

func (*ListStatusEvent) ContingencyTypeDeprecated() uint16 {
	return 0
}

func (*ListStatusEvent) ContingencyTypeMetaAttribute(meta int) string {
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

func (*ListStatusEvent) ListStatusTypeId() uint16 {
	return 5
}

func (*ListStatusEvent) ListStatusTypeSinceVersion() uint16 {
	return 0
}

func (l *ListStatusEvent) ListStatusTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= l.ListStatusTypeSinceVersion()
}

func (*ListStatusEvent) ListStatusTypeDeprecated() uint16 {
	return 0
}

func (*ListStatusEvent) ListStatusTypeMetaAttribute(meta int) string {
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

func (*ListStatusEvent) ListOrderStatusId() uint16 {
	return 6
}

func (*ListStatusEvent) ListOrderStatusSinceVersion() uint16 {
	return 0
}

func (l *ListStatusEvent) ListOrderStatusInActingVersion(actingVersion uint16) bool {
	return actingVersion >= l.ListOrderStatusSinceVersion()
}

func (*ListStatusEvent) ListOrderStatusDeprecated() uint16 {
	return 0
}

func (*ListStatusEvent) ListOrderStatusMetaAttribute(meta int) string {
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

func (*ListStatusEvent) SubscriptionIdId() uint16 {
	return 7
}

func (*ListStatusEvent) SubscriptionIdSinceVersion() uint16 {
	return 1
}

func (l *ListStatusEvent) SubscriptionIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= l.SubscriptionIdSinceVersion()
}

func (*ListStatusEvent) SubscriptionIdDeprecated() uint16 {
	return 0
}

func (*ListStatusEvent) SubscriptionIdMetaAttribute(meta int) string {
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

func (*ListStatusEvent) SubscriptionIdMinValue() uint16 {
	return 0
}

func (*ListStatusEvent) SubscriptionIdMaxValue() uint16 {
	return math.MaxUint16 - 1
}

func (*ListStatusEvent) SubscriptionIdNullValue() uint16 {
	return math.MaxUint16
}

func (*ListStatusEventOrders) OrderIdId() uint16 {
	return 1
}

func (*ListStatusEventOrders) OrderIdSinceVersion() uint16 {
	return 0
}

func (l *ListStatusEventOrders) OrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= l.OrderIdSinceVersion()
}

func (*ListStatusEventOrders) OrderIdDeprecated() uint16 {
	return 0
}

func (*ListStatusEventOrders) OrderIdMetaAttribute(meta int) string {
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

func (*ListStatusEventOrders) OrderIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ListStatusEventOrders) OrderIdMaxValue() int64 {
	return math.MaxInt64
}

func (*ListStatusEventOrders) OrderIdNullValue() int64 {
	return math.MinInt64
}

func (*ListStatusEventOrders) SymbolMetaAttribute(meta int) string {
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

func (*ListStatusEventOrders) SymbolSinceVersion() uint16 {
	return 0
}

func (l *ListStatusEventOrders) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= l.SymbolSinceVersion()
}

func (*ListStatusEventOrders) SymbolDeprecated() uint16 {
	return 0
}

func (ListStatusEventOrders) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (ListStatusEventOrders) SymbolHeaderLength() uint64 {
	return 1
}

func (*ListStatusEventOrders) ClientOrderIdMetaAttribute(meta int) string {
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

func (*ListStatusEventOrders) ClientOrderIdSinceVersion() uint16 {
	return 0
}

func (l *ListStatusEventOrders) ClientOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= l.ClientOrderIdSinceVersion()
}

func (*ListStatusEventOrders) ClientOrderIdDeprecated() uint16 {
	return 0
}

func (ListStatusEventOrders) ClientOrderIdCharacterEncoding() string {
	return "UTF-8"
}

func (ListStatusEventOrders) ClientOrderIdHeaderLength() uint64 {
	return 1
}

func (*ListStatusEvent) OrdersId() uint16 {
	return 100
}

func (*ListStatusEvent) OrdersSinceVersion() uint16 {
	return 0
}

func (l *ListStatusEvent) OrdersInActingVersion(actingVersion uint16) bool {
	return actingVersion >= l.OrdersSinceVersion()
}

func (*ListStatusEvent) OrdersDeprecated() uint16 {
	return 0
}

func (*ListStatusEventOrders) SbeBlockLength() (blockLength uint) {
	return 8
}

func (*ListStatusEventOrders) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*ListStatusEvent) SymbolMetaAttribute(meta int) string {
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

func (*ListStatusEvent) SymbolSinceVersion() uint16 {
	return 0
}

func (l *ListStatusEvent) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= l.SymbolSinceVersion()
}

func (*ListStatusEvent) SymbolDeprecated() uint16 {
	return 0
}

func (ListStatusEvent) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (ListStatusEvent) SymbolHeaderLength() uint64 {
	return 1
}

func (*ListStatusEvent) ListClientOrderIdMetaAttribute(meta int) string {
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

func (*ListStatusEvent) ListClientOrderIdSinceVersion() uint16 {
	return 0
}

func (l *ListStatusEvent) ListClientOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= l.ListClientOrderIdSinceVersion()
}

func (*ListStatusEvent) ListClientOrderIdDeprecated() uint16 {
	return 0
}

func (ListStatusEvent) ListClientOrderIdCharacterEncoding() string {
	return "UTF-8"
}

func (ListStatusEvent) ListClientOrderIdHeaderLength() uint64 {
	return 1
}

func (*ListStatusEvent) RejectReasonMetaAttribute(meta int) string {
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

func (*ListStatusEvent) RejectReasonSinceVersion() uint16 {
	return 0
}

func (l *ListStatusEvent) RejectReasonInActingVersion(actingVersion uint16) bool {
	return actingVersion >= l.RejectReasonSinceVersion()
}

func (*ListStatusEvent) RejectReasonDeprecated() uint16 {
	return 0
}

func (ListStatusEvent) RejectReasonCharacterEncoding() string {
	return "UTF-8"
}

func (ListStatusEvent) RejectReasonHeaderLength() uint64 {
	return 1
}
