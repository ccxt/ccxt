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

type OrderListResponse struct {
	OrderListId       int64
	ContingencyType   ContingencyTypeEnum
	ListStatusType    ListStatusTypeEnum
	ListOrderStatus   ListOrderStatusEnum
	TransactionTime   int64
	Orders            []OrderListResponseOrders
	ListClientOrderId []uint8
	Symbol            []uint8
}
type OrderListResponseOrders struct {
	OrderId       int64
	Symbol        []uint8
	ClientOrderId []uint8
}

func (o *OrderListResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := o.RangeCheck(o.SbeSchemaVersion(), o.SbeSchemaVersion()); err != nil {
			return err
		}
	}
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
	var OrdersNumInGroup uint16 = uint16(len(o.Orders))
	if err := _m.WriteUint16(_w, OrdersNumInGroup); err != nil {
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

func (o *OrderListResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
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
		var OrdersNumInGroup uint16
		if err := _m.ReadUint16(_r, &OrdersNumInGroup); err != nil {
			return err
		}
		if cap(o.Orders) < int(OrdersNumInGroup) {
			o.Orders = make([]OrderListResponseOrders, OrdersNumInGroup)
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
	if doRangeCheck {
		if err := o.RangeCheck(actingVersion, o.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (o *OrderListResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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

func OrderListResponseInit(o *OrderListResponse) {
	return
}

func (o *OrderListResponseOrders) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
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

func (o *OrderListResponseOrders) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
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

func (o *OrderListResponseOrders) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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

func OrderListResponseOrdersInit(o *OrderListResponseOrders) {
	return
}

func (*OrderListResponse) SbeBlockLength() (blockLength uint16) {
	return 19
}

func (*OrderListResponse) SbeTemplateId() (templateId uint16) {
	return 313
}

func (*OrderListResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*OrderListResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*OrderListResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*OrderListResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*OrderListResponse) OrderListIdId() uint16 {
	return 1
}

func (*OrderListResponse) OrderListIdSinceVersion() uint16 {
	return 0
}

func (o *OrderListResponse) OrderListIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.OrderListIdSinceVersion()
}

func (*OrderListResponse) OrderListIdDeprecated() uint16 {
	return 0
}

func (*OrderListResponse) OrderListIdMetaAttribute(meta int) string {
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

func (*OrderListResponse) OrderListIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderListResponse) OrderListIdMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderListResponse) OrderListIdNullValue() int64 {
	return math.MinInt64
}

func (*OrderListResponse) ContingencyTypeId() uint16 {
	return 2
}

func (*OrderListResponse) ContingencyTypeSinceVersion() uint16 {
	return 0
}

func (o *OrderListResponse) ContingencyTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.ContingencyTypeSinceVersion()
}

func (*OrderListResponse) ContingencyTypeDeprecated() uint16 {
	return 0
}

func (*OrderListResponse) ContingencyTypeMetaAttribute(meta int) string {
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

func (*OrderListResponse) ListStatusTypeId() uint16 {
	return 3
}

func (*OrderListResponse) ListStatusTypeSinceVersion() uint16 {
	return 0
}

func (o *OrderListResponse) ListStatusTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.ListStatusTypeSinceVersion()
}

func (*OrderListResponse) ListStatusTypeDeprecated() uint16 {
	return 0
}

func (*OrderListResponse) ListStatusTypeMetaAttribute(meta int) string {
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

func (*OrderListResponse) ListOrderStatusId() uint16 {
	return 4
}

func (*OrderListResponse) ListOrderStatusSinceVersion() uint16 {
	return 0
}

func (o *OrderListResponse) ListOrderStatusInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.ListOrderStatusSinceVersion()
}

func (*OrderListResponse) ListOrderStatusDeprecated() uint16 {
	return 0
}

func (*OrderListResponse) ListOrderStatusMetaAttribute(meta int) string {
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

func (*OrderListResponse) TransactionTimeId() uint16 {
	return 5
}

func (*OrderListResponse) TransactionTimeSinceVersion() uint16 {
	return 0
}

func (o *OrderListResponse) TransactionTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.TransactionTimeSinceVersion()
}

func (*OrderListResponse) TransactionTimeDeprecated() uint16 {
	return 0
}

func (*OrderListResponse) TransactionTimeMetaAttribute(meta int) string {
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

func (*OrderListResponse) TransactionTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderListResponse) TransactionTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderListResponse) TransactionTimeNullValue() int64 {
	return math.MinInt64
}

func (*OrderListResponseOrders) OrderIdId() uint16 {
	return 1
}

func (*OrderListResponseOrders) OrderIdSinceVersion() uint16 {
	return 0
}

func (o *OrderListResponseOrders) OrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.OrderIdSinceVersion()
}

func (*OrderListResponseOrders) OrderIdDeprecated() uint16 {
	return 0
}

func (*OrderListResponseOrders) OrderIdMetaAttribute(meta int) string {
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

func (*OrderListResponseOrders) OrderIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderListResponseOrders) OrderIdMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderListResponseOrders) OrderIdNullValue() int64 {
	return math.MinInt64
}

func (*OrderListResponseOrders) SymbolMetaAttribute(meta int) string {
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

func (*OrderListResponseOrders) SymbolSinceVersion() uint16 {
	return 0
}

func (o *OrderListResponseOrders) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.SymbolSinceVersion()
}

func (*OrderListResponseOrders) SymbolDeprecated() uint16 {
	return 0
}

func (OrderListResponseOrders) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (OrderListResponseOrders) SymbolHeaderLength() uint64 {
	return 1
}

func (*OrderListResponseOrders) ClientOrderIdMetaAttribute(meta int) string {
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

func (*OrderListResponseOrders) ClientOrderIdSinceVersion() uint16 {
	return 0
}

func (o *OrderListResponseOrders) ClientOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.ClientOrderIdSinceVersion()
}

func (*OrderListResponseOrders) ClientOrderIdDeprecated() uint16 {
	return 0
}

func (OrderListResponseOrders) ClientOrderIdCharacterEncoding() string {
	return "UTF-8"
}

func (OrderListResponseOrders) ClientOrderIdHeaderLength() uint64 {
	return 1
}

func (*OrderListResponse) OrdersId() uint16 {
	return 100
}

func (*OrderListResponse) OrdersSinceVersion() uint16 {
	return 0
}

func (o *OrderListResponse) OrdersInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.OrdersSinceVersion()
}

func (*OrderListResponse) OrdersDeprecated() uint16 {
	return 0
}

func (*OrderListResponseOrders) SbeBlockLength() (blockLength uint) {
	return 8
}

func (*OrderListResponseOrders) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*OrderListResponse) ListClientOrderIdMetaAttribute(meta int) string {
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

func (*OrderListResponse) ListClientOrderIdSinceVersion() uint16 {
	return 0
}

func (o *OrderListResponse) ListClientOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.ListClientOrderIdSinceVersion()
}

func (*OrderListResponse) ListClientOrderIdDeprecated() uint16 {
	return 0
}

func (OrderListResponse) ListClientOrderIdCharacterEncoding() string {
	return "UTF-8"
}

func (OrderListResponse) ListClientOrderIdHeaderLength() uint64 {
	return 1
}

func (*OrderListResponse) SymbolMetaAttribute(meta int) string {
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

func (*OrderListResponse) SymbolSinceVersion() uint16 {
	return 0
}

func (o *OrderListResponse) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.SymbolSinceVersion()
}

func (*OrderListResponse) SymbolDeprecated() uint16 {
	return 0
}

func (OrderListResponse) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (OrderListResponse) SymbolHeaderLength() uint64 {
	return 1
}
