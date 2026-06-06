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

type OrderListsResponse struct {
	OrderLists []OrderListsResponseOrderLists
}
type OrderListsResponseOrderLists struct {
	OrderListId       int64
	ContingencyType   ContingencyTypeEnum
	ListStatusType    ListStatusTypeEnum
	ListOrderStatus   ListOrderStatusEnum
	TransactionTime   int64
	Orders            []OrderListsResponseOrderListsOrders
	ListClientOrderId []uint8
	Symbol            []uint8
}
type OrderListsResponseOrderListsOrders struct {
	OrderId       int64
	Symbol        []uint8
	ClientOrderId []uint8
}

func (o *OrderListsResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := o.RangeCheck(o.SbeSchemaVersion(), o.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	var OrderListsBlockLength uint16 = 19
	if err := _m.WriteUint16(_w, OrderListsBlockLength); err != nil {
		return err
	}
	var OrderListsNumInGroup uint32 = uint32(len(o.OrderLists))
	if err := _m.WriteUint32(_w, OrderListsNumInGroup); err != nil {
		return err
	}
	for i := range o.OrderLists {
		if err := o.OrderLists[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	return nil
}

func (o *OrderListsResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if actingVersion > o.SbeSchemaVersion() && blockLength > o.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-o.SbeBlockLength()))
	}

	if o.OrderListsInActingVersion(actingVersion) {
		var OrderListsBlockLength uint16
		if err := _m.ReadUint16(_r, &OrderListsBlockLength); err != nil {
			return err
		}
		var OrderListsNumInGroup uint32
		if err := _m.ReadUint32(_r, &OrderListsNumInGroup); err != nil {
			return err
		}
		if cap(o.OrderLists) < int(OrderListsNumInGroup) {
			o.OrderLists = make([]OrderListsResponseOrderLists, OrderListsNumInGroup)
		}
		o.OrderLists = o.OrderLists[:OrderListsNumInGroup]
		for i := range o.OrderLists {
			if err := o.OrderLists[i].Decode(_m, _r, actingVersion, uint(OrderListsBlockLength)); err != nil {
				return err
			}
		}
	}
	if doRangeCheck {
		if err := o.RangeCheck(actingVersion, o.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (o *OrderListsResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	for i := range o.OrderLists {
		if err := o.OrderLists[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	return nil
}

func OrderListsResponseInit(o *OrderListsResponse) {
	return
}

func (o *OrderListsResponseOrderLists) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteInt64(_w, o.OrderListId); err != nil {
		return err
	}
	if err := o.ContingencyType.Encode(_m, _w); err != nil {
		return err
	}
	if err := o.ListStatusType.Encode(_m, _w); err != nil {
		return err
	}
	if err := o.ListOrderStatus.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.TransactionTime); err != nil {
		return err
	}
	var OrdersBlockLength uint16 = 8
	if err := _m.WriteUint16(_w, OrdersBlockLength); err != nil {
		return err
	}
	var OrdersNumInGroup uint32 = uint32(len(o.Orders))
	if err := _m.WriteUint32(_w, OrdersNumInGroup); err != nil {
		return err
	}
	for i := range o.Orders {
		if err := o.Orders[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	if err := _m.WriteUint8(_w, uint8(len(o.ListClientOrderId))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, o.ListClientOrderId); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(o.Symbol))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, o.Symbol); err != nil {
		return err
	}
	return nil
}

func (o *OrderListsResponseOrderLists) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if !o.OrderListIdInActingVersion(actingVersion) {
		o.OrderListId = o.OrderListIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.OrderListId); err != nil {
			return err
		}
	}
	if o.ContingencyTypeInActingVersion(actingVersion) {
		if err := o.ContingencyType.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if o.ListStatusTypeInActingVersion(actingVersion) {
		if err := o.ListStatusType.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if o.ListOrderStatusInActingVersion(actingVersion) {
		if err := o.ListOrderStatus.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if !o.TransactionTimeInActingVersion(actingVersion) {
		o.TransactionTime = o.TransactionTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.TransactionTime); err != nil {
			return err
		}
	}
	if actingVersion > o.SbeSchemaVersion() && blockLength > o.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-o.SbeBlockLength()))
	}

	if o.OrdersInActingVersion(actingVersion) {
		var OrdersBlockLength uint16
		if err := _m.ReadUint16(_r, &OrdersBlockLength); err != nil {
			return err
		}
		var OrdersNumInGroup uint32
		if err := _m.ReadUint32(_r, &OrdersNumInGroup); err != nil {
			return err
		}
		if cap(o.Orders) < int(OrdersNumInGroup) {
			o.Orders = make([]OrderListsResponseOrderListsOrders, OrdersNumInGroup)
		}
		o.Orders = o.Orders[:OrdersNumInGroup]
		for i := range o.Orders {
			if err := o.Orders[i].Decode(_m, _r, actingVersion, uint(OrdersBlockLength)); err != nil {
				return err
			}
		}
	}

	if o.ListClientOrderIdInActingVersion(actingVersion) {
		var ListClientOrderIdLength uint8
		if err := _m.ReadUint8(_r, &ListClientOrderIdLength); err != nil {
			return err
		}
		if cap(o.ListClientOrderId) < int(ListClientOrderIdLength) {
			o.ListClientOrderId = make([]uint8, ListClientOrderIdLength)
		}
		o.ListClientOrderId = o.ListClientOrderId[:ListClientOrderIdLength]
		if err := _m.ReadBytes(_r, o.ListClientOrderId); err != nil {
			return err
		}
	}

	if o.SymbolInActingVersion(actingVersion) {
		var SymbolLength uint8
		if err := _m.ReadUint8(_r, &SymbolLength); err != nil {
			return err
		}
		if cap(o.Symbol) < int(SymbolLength) {
			o.Symbol = make([]uint8, SymbolLength)
		}
		o.Symbol = o.Symbol[:SymbolLength]
		if err := _m.ReadBytes(_r, o.Symbol); err != nil {
			return err
		}
	}
	return nil
}

func (o *OrderListsResponseOrderLists) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if o.OrderListIdInActingVersion(actingVersion) {
		if o.OrderListId < o.OrderListIdMinValue() || o.OrderListId > o.OrderListIdMaxValue() {
			return fmt.Errorf("Range check failed on o.OrderListId (%v < %v > %v)", o.OrderListIdMinValue(), o.OrderListId, o.OrderListIdMaxValue())
		}
	}
	if err := o.ContingencyType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := o.ListStatusType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := o.ListOrderStatus.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if o.TransactionTimeInActingVersion(actingVersion) {
		if o.TransactionTime < o.TransactionTimeMinValue() || o.TransactionTime > o.TransactionTimeMaxValue() {
			return fmt.Errorf("Range check failed on o.TransactionTime (%v < %v > %v)", o.TransactionTimeMinValue(), o.TransactionTime, o.TransactionTimeMaxValue())
		}
	}
	for i := range o.Orders {
		if err := o.Orders[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	if !utf8.Valid(o.ListClientOrderId[:]) {
		return errors.New("o.ListClientOrderId failed UTF-8 validation")
	}
	if !utf8.Valid(o.Symbol[:]) {
		return errors.New("o.Symbol failed UTF-8 validation")
	}
	return nil
}

func OrderListsResponseOrderListsInit(o *OrderListsResponseOrderLists) {
	return
}

func (o *OrderListsResponseOrderListsOrders) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteInt64(_w, o.OrderId); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(o.Symbol))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, o.Symbol); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(o.ClientOrderId))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, o.ClientOrderId); err != nil {
		return err
	}
	return nil
}

func (o *OrderListsResponseOrderListsOrders) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if !o.OrderIdInActingVersion(actingVersion) {
		o.OrderId = o.OrderIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.OrderId); err != nil {
			return err
		}
	}
	if actingVersion > o.SbeSchemaVersion() && blockLength > o.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-o.SbeBlockLength()))
	}

	if o.SymbolInActingVersion(actingVersion) {
		var SymbolLength uint8
		if err := _m.ReadUint8(_r, &SymbolLength); err != nil {
			return err
		}
		if cap(o.Symbol) < int(SymbolLength) {
			o.Symbol = make([]uint8, SymbolLength)
		}
		o.Symbol = o.Symbol[:SymbolLength]
		if err := _m.ReadBytes(_r, o.Symbol); err != nil {
			return err
		}
	}

	if o.ClientOrderIdInActingVersion(actingVersion) {
		var ClientOrderIdLength uint8
		if err := _m.ReadUint8(_r, &ClientOrderIdLength); err != nil {
			return err
		}
		if cap(o.ClientOrderId) < int(ClientOrderIdLength) {
			o.ClientOrderId = make([]uint8, ClientOrderIdLength)
		}
		o.ClientOrderId = o.ClientOrderId[:ClientOrderIdLength]
		if err := _m.ReadBytes(_r, o.ClientOrderId); err != nil {
			return err
		}
	}
	return nil
}

func (o *OrderListsResponseOrderListsOrders) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if o.OrderIdInActingVersion(actingVersion) {
		if o.OrderId < o.OrderIdMinValue() || o.OrderId > o.OrderIdMaxValue() {
			return fmt.Errorf("Range check failed on o.OrderId (%v < %v > %v)", o.OrderIdMinValue(), o.OrderId, o.OrderIdMaxValue())
		}
	}
	if !utf8.Valid(o.Symbol[:]) {
		return errors.New("o.Symbol failed UTF-8 validation")
	}
	if !utf8.Valid(o.ClientOrderId[:]) {
		return errors.New("o.ClientOrderId failed UTF-8 validation")
	}
	return nil
}

func OrderListsResponseOrderListsOrdersInit(o *OrderListsResponseOrderListsOrders) {
	return
}

func (*OrderListsResponse) SbeBlockLength() (blockLength uint16) {
	return 0
}

func (*OrderListsResponse) SbeTemplateId() (templateId uint16) {
	return 314
}

func (*OrderListsResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*OrderListsResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*OrderListsResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*OrderListsResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*OrderListsResponseOrderLists) OrderListIdId() uint16 {
	return 1
}

func (*OrderListsResponseOrderLists) OrderListIdSinceVersion() uint16 {
	return 0
}

func (o *OrderListsResponseOrderLists) OrderListIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.OrderListIdSinceVersion()
}

func (*OrderListsResponseOrderLists) OrderListIdDeprecated() uint16 {
	return 0
}

func (*OrderListsResponseOrderLists) OrderListIdMetaAttribute(meta int) string {
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

func (*OrderListsResponseOrderLists) OrderListIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderListsResponseOrderLists) OrderListIdMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderListsResponseOrderLists) OrderListIdNullValue() int64 {
	return math.MinInt64
}

func (*OrderListsResponseOrderLists) ContingencyTypeId() uint16 {
	return 2
}

func (*OrderListsResponseOrderLists) ContingencyTypeSinceVersion() uint16 {
	return 0
}

func (o *OrderListsResponseOrderLists) ContingencyTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.ContingencyTypeSinceVersion()
}

func (*OrderListsResponseOrderLists) ContingencyTypeDeprecated() uint16 {
	return 0
}

func (*OrderListsResponseOrderLists) ContingencyTypeMetaAttribute(meta int) string {
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

func (*OrderListsResponseOrderLists) ListStatusTypeId() uint16 {
	return 3
}

func (*OrderListsResponseOrderLists) ListStatusTypeSinceVersion() uint16 {
	return 0
}

func (o *OrderListsResponseOrderLists) ListStatusTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.ListStatusTypeSinceVersion()
}

func (*OrderListsResponseOrderLists) ListStatusTypeDeprecated() uint16 {
	return 0
}

func (*OrderListsResponseOrderLists) ListStatusTypeMetaAttribute(meta int) string {
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

func (*OrderListsResponseOrderLists) ListOrderStatusId() uint16 {
	return 4
}

func (*OrderListsResponseOrderLists) ListOrderStatusSinceVersion() uint16 {
	return 0
}

func (o *OrderListsResponseOrderLists) ListOrderStatusInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.ListOrderStatusSinceVersion()
}

func (*OrderListsResponseOrderLists) ListOrderStatusDeprecated() uint16 {
	return 0
}

func (*OrderListsResponseOrderLists) ListOrderStatusMetaAttribute(meta int) string {
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

func (*OrderListsResponseOrderLists) TransactionTimeId() uint16 {
	return 5
}

func (*OrderListsResponseOrderLists) TransactionTimeSinceVersion() uint16 {
	return 0
}

func (o *OrderListsResponseOrderLists) TransactionTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.TransactionTimeSinceVersion()
}

func (*OrderListsResponseOrderLists) TransactionTimeDeprecated() uint16 {
	return 0
}

func (*OrderListsResponseOrderLists) TransactionTimeMetaAttribute(meta int) string {
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

func (*OrderListsResponseOrderLists) TransactionTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderListsResponseOrderLists) TransactionTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderListsResponseOrderLists) TransactionTimeNullValue() int64 {
	return math.MinInt64
}

func (*OrderListsResponseOrderListsOrders) OrderIdId() uint16 {
	return 1
}

func (*OrderListsResponseOrderListsOrders) OrderIdSinceVersion() uint16 {
	return 0
}

func (o *OrderListsResponseOrderListsOrders) OrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.OrderIdSinceVersion()
}

func (*OrderListsResponseOrderListsOrders) OrderIdDeprecated() uint16 {
	return 0
}

func (*OrderListsResponseOrderListsOrders) OrderIdMetaAttribute(meta int) string {
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

func (*OrderListsResponseOrderListsOrders) OrderIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderListsResponseOrderListsOrders) OrderIdMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderListsResponseOrderListsOrders) OrderIdNullValue() int64 {
	return math.MinInt64
}

func (*OrderListsResponseOrderListsOrders) SymbolMetaAttribute(meta int) string {
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

func (*OrderListsResponseOrderListsOrders) SymbolSinceVersion() uint16 {
	return 0
}

func (o *OrderListsResponseOrderListsOrders) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.SymbolSinceVersion()
}

func (*OrderListsResponseOrderListsOrders) SymbolDeprecated() uint16 {
	return 0
}

func (OrderListsResponseOrderListsOrders) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (OrderListsResponseOrderListsOrders) SymbolHeaderLength() uint64 {
	return 1
}

func (*OrderListsResponseOrderListsOrders) ClientOrderIdMetaAttribute(meta int) string {
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

func (*OrderListsResponseOrderListsOrders) ClientOrderIdSinceVersion() uint16 {
	return 0
}

func (o *OrderListsResponseOrderListsOrders) ClientOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.ClientOrderIdSinceVersion()
}

func (*OrderListsResponseOrderListsOrders) ClientOrderIdDeprecated() uint16 {
	return 0
}

func (OrderListsResponseOrderListsOrders) ClientOrderIdCharacterEncoding() string {
	return "UTF-8"
}

func (OrderListsResponseOrderListsOrders) ClientOrderIdHeaderLength() uint64 {
	return 1
}

func (*OrderListsResponseOrderLists) ListClientOrderIdMetaAttribute(meta int) string {
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

func (*OrderListsResponseOrderLists) ListClientOrderIdSinceVersion() uint16 {
	return 0
}

func (o *OrderListsResponseOrderLists) ListClientOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.ListClientOrderIdSinceVersion()
}

func (*OrderListsResponseOrderLists) ListClientOrderIdDeprecated() uint16 {
	return 0
}

func (OrderListsResponseOrderLists) ListClientOrderIdCharacterEncoding() string {
	return "UTF-8"
}

func (OrderListsResponseOrderLists) ListClientOrderIdHeaderLength() uint64 {
	return 1
}

func (*OrderListsResponseOrderLists) SymbolMetaAttribute(meta int) string {
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

func (*OrderListsResponseOrderLists) SymbolSinceVersion() uint16 {
	return 0
}

func (o *OrderListsResponseOrderLists) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.SymbolSinceVersion()
}

func (*OrderListsResponseOrderLists) SymbolDeprecated() uint16 {
	return 0
}

func (OrderListsResponseOrderLists) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (OrderListsResponseOrderLists) SymbolHeaderLength() uint64 {
	return 1
}

func (*OrderListsResponse) OrderListsId() uint16 {
	return 100
}

func (*OrderListsResponse) OrderListsSinceVersion() uint16 {
	return 0
}

func (o *OrderListsResponse) OrderListsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.OrderListsSinceVersion()
}

func (*OrderListsResponse) OrderListsDeprecated() uint16 {
	return 0
}

func (*OrderListsResponseOrderLists) SbeBlockLength() (blockLength uint) {
	return 19
}

func (*OrderListsResponseOrderLists) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*OrderListsResponseOrderLists) OrdersId() uint16 {
	return 100
}

func (*OrderListsResponseOrderLists) OrdersSinceVersion() uint16 {
	return 0
}

func (o *OrderListsResponseOrderLists) OrdersInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.OrdersSinceVersion()
}

func (*OrderListsResponseOrderLists) OrdersDeprecated() uint16 {
	return 0
}

func (*OrderListsResponseOrderListsOrders) SbeBlockLength() (blockLength uint) {
	return 8
}

func (*OrderListsResponseOrderListsOrders) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}
