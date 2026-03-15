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

type NewOrderListAckResponse struct {
	OrderListId       int64
	ContingencyType   ContingencyTypeEnum
	ListStatusType    ListStatusTypeEnum
	ListOrderStatus   ListOrderStatusEnum
	TransactionTime   int64
	Orders            []NewOrderListAckResponseOrders
	OrderReports      []NewOrderListAckResponseOrderReports
	ListClientOrderId []uint8
	Symbol            []uint8
}
type NewOrderListAckResponseOrders struct {
	OrderId       int64
	Symbol        []uint8
	ClientOrderId []uint8
}
type NewOrderListAckResponseOrderReports struct {
	OrderId       int64
	OrderListId   int64
	TransactTime  int64
	Symbol        []uint8
	ClientOrderId []uint8
}

func (n *NewOrderListAckResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := n.RangeCheck(n.SbeSchemaVersion(), n.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt64(_w, n.OrderListId); err != nil {
		return err
	}
	if err := n.ContingencyType.Encode(_m, _w); err != nil {
		return err
	}
	if err := n.ListStatusType.Encode(_m, _w); err != nil {
		return err
	}
	if err := n.ListOrderStatus.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, n.TransactionTime); err != nil {
		return err
	}
	var OrdersBlockLength uint16 = 8
	if err := _m.WriteUint16(_w, OrdersBlockLength); err != nil {
		return err
	}
	var OrdersNumInGroup uint16 = uint16(len(n.Orders))
	if err := _m.WriteUint16(_w, OrdersNumInGroup); err != nil {
		return err
	}
	for i := range n.Orders {
		if err := n.Orders[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	var OrderReportsBlockLength uint16 = 24
	if err := _m.WriteUint16(_w, OrderReportsBlockLength); err != nil {
		return err
	}
	var OrderReportsNumInGroup uint16 = uint16(len(n.OrderReports))
	if err := _m.WriteUint16(_w, OrderReportsNumInGroup); err != nil {
		return err
	}
	for i := range n.OrderReports {
		if err := n.OrderReports[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	if err := _m.WriteUint8(_w, uint8(len(n.ListClientOrderId))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, n.ListClientOrderId); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(n.Symbol))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, n.Symbol); err != nil {
		return err
	}
	return nil
}

func (n *NewOrderListAckResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if !n.OrderListIdInActingVersion(actingVersion) {
		n.OrderListId = n.OrderListIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.OrderListId); err != nil {
			return err
		}
	}
	if n.ContingencyTypeInActingVersion(actingVersion) {
		if err := n.ContingencyType.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if n.ListStatusTypeInActingVersion(actingVersion) {
		if err := n.ListStatusType.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if n.ListOrderStatusInActingVersion(actingVersion) {
		if err := n.ListOrderStatus.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if !n.TransactionTimeInActingVersion(actingVersion) {
		n.TransactionTime = n.TransactionTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.TransactionTime); err != nil {
			return err
		}
	}
	if actingVersion > n.SbeSchemaVersion() && blockLength > n.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-n.SbeBlockLength()))
	}

	if n.OrdersInActingVersion(actingVersion) {
		var OrdersBlockLength uint16
		if err := _m.ReadUint16(_r, &OrdersBlockLength); err != nil {
			return err
		}
		var OrdersNumInGroup uint16
		if err := _m.ReadUint16(_r, &OrdersNumInGroup); err != nil {
			return err
		}
		if cap(n.Orders) < int(OrdersNumInGroup) {
			n.Orders = make([]NewOrderListAckResponseOrders, OrdersNumInGroup)
		}
		n.Orders = n.Orders[:OrdersNumInGroup]
		for i := range n.Orders {
			if err := n.Orders[i].Decode(_m, _r, actingVersion, uint(OrdersBlockLength)); err != nil {
				return err
			}
		}
	}

	if n.OrderReportsInActingVersion(actingVersion) {
		var OrderReportsBlockLength uint16
		if err := _m.ReadUint16(_r, &OrderReportsBlockLength); err != nil {
			return err
		}
		var OrderReportsNumInGroup uint16
		if err := _m.ReadUint16(_r, &OrderReportsNumInGroup); err != nil {
			return err
		}
		if cap(n.OrderReports) < int(OrderReportsNumInGroup) {
			n.OrderReports = make([]NewOrderListAckResponseOrderReports, OrderReportsNumInGroup)
		}
		n.OrderReports = n.OrderReports[:OrderReportsNumInGroup]
		for i := range n.OrderReports {
			if err := n.OrderReports[i].Decode(_m, _r, actingVersion, uint(OrderReportsBlockLength)); err != nil {
				return err
			}
		}
	}

	if n.ListClientOrderIdInActingVersion(actingVersion) {
		var ListClientOrderIdLength uint8
		if err := _m.ReadUint8(_r, &ListClientOrderIdLength); err != nil {
			return err
		}
		if cap(n.ListClientOrderId) < int(ListClientOrderIdLength) {
			n.ListClientOrderId = make([]uint8, ListClientOrderIdLength)
		}
		n.ListClientOrderId = n.ListClientOrderId[:ListClientOrderIdLength]
		if err := _m.ReadBytes(_r, n.ListClientOrderId); err != nil {
			return err
		}
	}

	if n.SymbolInActingVersion(actingVersion) {
		var SymbolLength uint8
		if err := _m.ReadUint8(_r, &SymbolLength); err != nil {
			return err
		}
		if cap(n.Symbol) < int(SymbolLength) {
			n.Symbol = make([]uint8, SymbolLength)
		}
		n.Symbol = n.Symbol[:SymbolLength]
		if err := _m.ReadBytes(_r, n.Symbol); err != nil {
			return err
		}
	}
	if doRangeCheck {
		if err := n.RangeCheck(actingVersion, n.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (n *NewOrderListAckResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if n.OrderListIdInActingVersion(actingVersion) {
		if n.OrderListId < n.OrderListIdMinValue() || n.OrderListId > n.OrderListIdMaxValue() {
			return fmt.Errorf("Range check failed on n.OrderListId (%v < %v > %v)", n.OrderListIdMinValue(), n.OrderListId, n.OrderListIdMaxValue())
		}
	}
	if err := n.ContingencyType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := n.ListStatusType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := n.ListOrderStatus.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if n.TransactionTimeInActingVersion(actingVersion) {
		if n.TransactionTime < n.TransactionTimeMinValue() || n.TransactionTime > n.TransactionTimeMaxValue() {
			return fmt.Errorf("Range check failed on n.TransactionTime (%v < %v > %v)", n.TransactionTimeMinValue(), n.TransactionTime, n.TransactionTimeMaxValue())
		}
	}
	for i := range n.Orders {
		if err := n.Orders[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	for i := range n.OrderReports {
		if err := n.OrderReports[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	if !utf8.Valid(n.ListClientOrderId[:]) {
		return errors.New("n.ListClientOrderId failed UTF-8 validation")
	}
	if !utf8.Valid(n.Symbol[:]) {
		return errors.New("n.Symbol failed UTF-8 validation")
	}
	return nil
}

func NewOrderListAckResponseInit(n *NewOrderListAckResponse) {
	return
}

func (n *NewOrderListAckResponseOrders) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteInt64(_w, n.OrderId); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(n.Symbol))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, n.Symbol); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(n.ClientOrderId))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, n.ClientOrderId); err != nil {
		return err
	}
	return nil
}

func (n *NewOrderListAckResponseOrders) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if !n.OrderIdInActingVersion(actingVersion) {
		n.OrderId = n.OrderIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.OrderId); err != nil {
			return err
		}
	}
	if actingVersion > n.SbeSchemaVersion() && blockLength > n.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-n.SbeBlockLength()))
	}

	if n.SymbolInActingVersion(actingVersion) {
		var SymbolLength uint8
		if err := _m.ReadUint8(_r, &SymbolLength); err != nil {
			return err
		}
		if cap(n.Symbol) < int(SymbolLength) {
			n.Symbol = make([]uint8, SymbolLength)
		}
		n.Symbol = n.Symbol[:SymbolLength]
		if err := _m.ReadBytes(_r, n.Symbol); err != nil {
			return err
		}
	}

	if n.ClientOrderIdInActingVersion(actingVersion) {
		var ClientOrderIdLength uint8
		if err := _m.ReadUint8(_r, &ClientOrderIdLength); err != nil {
			return err
		}
		if cap(n.ClientOrderId) < int(ClientOrderIdLength) {
			n.ClientOrderId = make([]uint8, ClientOrderIdLength)
		}
		n.ClientOrderId = n.ClientOrderId[:ClientOrderIdLength]
		if err := _m.ReadBytes(_r, n.ClientOrderId); err != nil {
			return err
		}
	}
	return nil
}

func (n *NewOrderListAckResponseOrders) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if n.OrderIdInActingVersion(actingVersion) {
		if n.OrderId < n.OrderIdMinValue() || n.OrderId > n.OrderIdMaxValue() {
			return fmt.Errorf("Range check failed on n.OrderId (%v < %v > %v)", n.OrderIdMinValue(), n.OrderId, n.OrderIdMaxValue())
		}
	}
	if !utf8.Valid(n.Symbol[:]) {
		return errors.New("n.Symbol failed UTF-8 validation")
	}
	if !utf8.Valid(n.ClientOrderId[:]) {
		return errors.New("n.ClientOrderId failed UTF-8 validation")
	}
	return nil
}

func NewOrderListAckResponseOrdersInit(n *NewOrderListAckResponseOrders) {
	return
}

func (n *NewOrderListAckResponseOrderReports) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteInt64(_w, n.OrderId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, n.OrderListId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, n.TransactTime); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(n.Symbol))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, n.Symbol); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(n.ClientOrderId))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, n.ClientOrderId); err != nil {
		return err
	}
	return nil
}

func (n *NewOrderListAckResponseOrderReports) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if !n.OrderIdInActingVersion(actingVersion) {
		n.OrderId = n.OrderIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.OrderId); err != nil {
			return err
		}
	}
	if !n.OrderListIdInActingVersion(actingVersion) {
		n.OrderListId = n.OrderListIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.OrderListId); err != nil {
			return err
		}
	}
	if !n.TransactTimeInActingVersion(actingVersion) {
		n.TransactTime = n.TransactTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.TransactTime); err != nil {
			return err
		}
	}
	if actingVersion > n.SbeSchemaVersion() && blockLength > n.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-n.SbeBlockLength()))
	}

	if n.SymbolInActingVersion(actingVersion) {
		var SymbolLength uint8
		if err := _m.ReadUint8(_r, &SymbolLength); err != nil {
			return err
		}
		if cap(n.Symbol) < int(SymbolLength) {
			n.Symbol = make([]uint8, SymbolLength)
		}
		n.Symbol = n.Symbol[:SymbolLength]
		if err := _m.ReadBytes(_r, n.Symbol); err != nil {
			return err
		}
	}

	if n.ClientOrderIdInActingVersion(actingVersion) {
		var ClientOrderIdLength uint8
		if err := _m.ReadUint8(_r, &ClientOrderIdLength); err != nil {
			return err
		}
		if cap(n.ClientOrderId) < int(ClientOrderIdLength) {
			n.ClientOrderId = make([]uint8, ClientOrderIdLength)
		}
		n.ClientOrderId = n.ClientOrderId[:ClientOrderIdLength]
		if err := _m.ReadBytes(_r, n.ClientOrderId); err != nil {
			return err
		}
	}
	return nil
}

func (n *NewOrderListAckResponseOrderReports) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if n.OrderIdInActingVersion(actingVersion) {
		if n.OrderId < n.OrderIdMinValue() || n.OrderId > n.OrderIdMaxValue() {
			return fmt.Errorf("Range check failed on n.OrderId (%v < %v > %v)", n.OrderIdMinValue(), n.OrderId, n.OrderIdMaxValue())
		}
	}
	if n.OrderListIdInActingVersion(actingVersion) {
		if n.OrderListId != n.OrderListIdNullValue() && (n.OrderListId < n.OrderListIdMinValue() || n.OrderListId > n.OrderListIdMaxValue()) {
			return fmt.Errorf("Range check failed on n.OrderListId (%v < %v > %v)", n.OrderListIdMinValue(), n.OrderListId, n.OrderListIdMaxValue())
		}
	}
	if n.TransactTimeInActingVersion(actingVersion) {
		if n.TransactTime < n.TransactTimeMinValue() || n.TransactTime > n.TransactTimeMaxValue() {
			return fmt.Errorf("Range check failed on n.TransactTime (%v < %v > %v)", n.TransactTimeMinValue(), n.TransactTime, n.TransactTimeMaxValue())
		}
	}
	if !utf8.Valid(n.Symbol[:]) {
		return errors.New("n.Symbol failed UTF-8 validation")
	}
	if !utf8.Valid(n.ClientOrderId[:]) {
		return errors.New("n.ClientOrderId failed UTF-8 validation")
	}
	return nil
}

func NewOrderListAckResponseOrderReportsInit(n *NewOrderListAckResponseOrderReports) {
	n.OrderListId = math.MinInt64
	return
}

func (*NewOrderListAckResponse) SbeBlockLength() (blockLength uint16) {
	return 19
}

func (*NewOrderListAckResponse) SbeTemplateId() (templateId uint16) {
	return 309
}

func (*NewOrderListAckResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*NewOrderListAckResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*NewOrderListAckResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*NewOrderListAckResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*NewOrderListAckResponse) OrderListIdId() uint16 {
	return 1
}

func (*NewOrderListAckResponse) OrderListIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListAckResponse) OrderListIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrderListIdSinceVersion()
}

func (*NewOrderListAckResponse) OrderListIdDeprecated() uint16 {
	return 0
}

func (*NewOrderListAckResponse) OrderListIdMetaAttribute(meta int) string {
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

func (*NewOrderListAckResponse) OrderListIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListAckResponse) OrderListIdMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListAckResponse) OrderListIdNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListAckResponse) ContingencyTypeId() uint16 {
	return 2
}

func (*NewOrderListAckResponse) ContingencyTypeSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListAckResponse) ContingencyTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.ContingencyTypeSinceVersion()
}

func (*NewOrderListAckResponse) ContingencyTypeDeprecated() uint16 {
	return 0
}

func (*NewOrderListAckResponse) ContingencyTypeMetaAttribute(meta int) string {
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

func (*NewOrderListAckResponse) ListStatusTypeId() uint16 {
	return 3
}

func (*NewOrderListAckResponse) ListStatusTypeSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListAckResponse) ListStatusTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.ListStatusTypeSinceVersion()
}

func (*NewOrderListAckResponse) ListStatusTypeDeprecated() uint16 {
	return 0
}

func (*NewOrderListAckResponse) ListStatusTypeMetaAttribute(meta int) string {
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

func (*NewOrderListAckResponse) ListOrderStatusId() uint16 {
	return 4
}

func (*NewOrderListAckResponse) ListOrderStatusSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListAckResponse) ListOrderStatusInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.ListOrderStatusSinceVersion()
}

func (*NewOrderListAckResponse) ListOrderStatusDeprecated() uint16 {
	return 0
}

func (*NewOrderListAckResponse) ListOrderStatusMetaAttribute(meta int) string {
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

func (*NewOrderListAckResponse) TransactionTimeId() uint16 {
	return 5
}

func (*NewOrderListAckResponse) TransactionTimeSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListAckResponse) TransactionTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.TransactionTimeSinceVersion()
}

func (*NewOrderListAckResponse) TransactionTimeDeprecated() uint16 {
	return 0
}

func (*NewOrderListAckResponse) TransactionTimeMetaAttribute(meta int) string {
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

func (*NewOrderListAckResponse) TransactionTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListAckResponse) TransactionTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListAckResponse) TransactionTimeNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListAckResponseOrders) OrderIdId() uint16 {
	return 1
}

func (*NewOrderListAckResponseOrders) OrderIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListAckResponseOrders) OrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrderIdSinceVersion()
}

func (*NewOrderListAckResponseOrders) OrderIdDeprecated() uint16 {
	return 0
}

func (*NewOrderListAckResponseOrders) OrderIdMetaAttribute(meta int) string {
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

func (*NewOrderListAckResponseOrders) OrderIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListAckResponseOrders) OrderIdMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListAckResponseOrders) OrderIdNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListAckResponseOrders) SymbolMetaAttribute(meta int) string {
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

func (*NewOrderListAckResponseOrders) SymbolSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListAckResponseOrders) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.SymbolSinceVersion()
}

func (*NewOrderListAckResponseOrders) SymbolDeprecated() uint16 {
	return 0
}

func (NewOrderListAckResponseOrders) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (NewOrderListAckResponseOrders) SymbolHeaderLength() uint64 {
	return 1
}

func (*NewOrderListAckResponseOrders) ClientOrderIdMetaAttribute(meta int) string {
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

func (*NewOrderListAckResponseOrders) ClientOrderIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListAckResponseOrders) ClientOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.ClientOrderIdSinceVersion()
}

func (*NewOrderListAckResponseOrders) ClientOrderIdDeprecated() uint16 {
	return 0
}

func (NewOrderListAckResponseOrders) ClientOrderIdCharacterEncoding() string {
	return "UTF-8"
}

func (NewOrderListAckResponseOrders) ClientOrderIdHeaderLength() uint64 {
	return 1
}

func (*NewOrderListAckResponseOrderReports) OrderIdId() uint16 {
	return 1
}

func (*NewOrderListAckResponseOrderReports) OrderIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListAckResponseOrderReports) OrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrderIdSinceVersion()
}

func (*NewOrderListAckResponseOrderReports) OrderIdDeprecated() uint16 {
	return 0
}

func (*NewOrderListAckResponseOrderReports) OrderIdMetaAttribute(meta int) string {
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

func (*NewOrderListAckResponseOrderReports) OrderIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListAckResponseOrderReports) OrderIdMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListAckResponseOrderReports) OrderIdNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListAckResponseOrderReports) OrderListIdId() uint16 {
	return 2
}

func (*NewOrderListAckResponseOrderReports) OrderListIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListAckResponseOrderReports) OrderListIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrderListIdSinceVersion()
}

func (*NewOrderListAckResponseOrderReports) OrderListIdDeprecated() uint16 {
	return 0
}

func (*NewOrderListAckResponseOrderReports) OrderListIdMetaAttribute(meta int) string {
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

func (*NewOrderListAckResponseOrderReports) OrderListIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListAckResponseOrderReports) OrderListIdMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListAckResponseOrderReports) OrderListIdNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListAckResponseOrderReports) TransactTimeId() uint16 {
	return 3
}

func (*NewOrderListAckResponseOrderReports) TransactTimeSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListAckResponseOrderReports) TransactTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.TransactTimeSinceVersion()
}

func (*NewOrderListAckResponseOrderReports) TransactTimeDeprecated() uint16 {
	return 0
}

func (*NewOrderListAckResponseOrderReports) TransactTimeMetaAttribute(meta int) string {
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

func (*NewOrderListAckResponseOrderReports) TransactTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListAckResponseOrderReports) TransactTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListAckResponseOrderReports) TransactTimeNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListAckResponseOrderReports) SymbolMetaAttribute(meta int) string {
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

func (*NewOrderListAckResponseOrderReports) SymbolSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListAckResponseOrderReports) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.SymbolSinceVersion()
}

func (*NewOrderListAckResponseOrderReports) SymbolDeprecated() uint16 {
	return 0
}

func (NewOrderListAckResponseOrderReports) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (NewOrderListAckResponseOrderReports) SymbolHeaderLength() uint64 {
	return 1
}

func (*NewOrderListAckResponseOrderReports) ClientOrderIdMetaAttribute(meta int) string {
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

func (*NewOrderListAckResponseOrderReports) ClientOrderIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListAckResponseOrderReports) ClientOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.ClientOrderIdSinceVersion()
}

func (*NewOrderListAckResponseOrderReports) ClientOrderIdDeprecated() uint16 {
	return 0
}

func (NewOrderListAckResponseOrderReports) ClientOrderIdCharacterEncoding() string {
	return "UTF-8"
}

func (NewOrderListAckResponseOrderReports) ClientOrderIdHeaderLength() uint64 {
	return 1
}

func (*NewOrderListAckResponse) OrdersId() uint16 {
	return 100
}

func (*NewOrderListAckResponse) OrdersSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListAckResponse) OrdersInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrdersSinceVersion()
}

func (*NewOrderListAckResponse) OrdersDeprecated() uint16 {
	return 0
}

func (*NewOrderListAckResponseOrders) SbeBlockLength() (blockLength uint) {
	return 8
}

func (*NewOrderListAckResponseOrders) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*NewOrderListAckResponse) OrderReportsId() uint16 {
	return 101
}

func (*NewOrderListAckResponse) OrderReportsSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListAckResponse) OrderReportsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrderReportsSinceVersion()
}

func (*NewOrderListAckResponse) OrderReportsDeprecated() uint16 {
	return 0
}

func (*NewOrderListAckResponseOrderReports) SbeBlockLength() (blockLength uint) {
	return 24
}

func (*NewOrderListAckResponseOrderReports) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*NewOrderListAckResponse) ListClientOrderIdMetaAttribute(meta int) string {
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

func (*NewOrderListAckResponse) ListClientOrderIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListAckResponse) ListClientOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.ListClientOrderIdSinceVersion()
}

func (*NewOrderListAckResponse) ListClientOrderIdDeprecated() uint16 {
	return 0
}

func (NewOrderListAckResponse) ListClientOrderIdCharacterEncoding() string {
	return "UTF-8"
}

func (NewOrderListAckResponse) ListClientOrderIdHeaderLength() uint64 {
	return 1
}

func (*NewOrderListAckResponse) SymbolMetaAttribute(meta int) string {
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

func (*NewOrderListAckResponse) SymbolSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListAckResponse) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.SymbolSinceVersion()
}

func (*NewOrderListAckResponse) SymbolDeprecated() uint16 {
	return 0
}

func (NewOrderListAckResponse) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (NewOrderListAckResponse) SymbolHeaderLength() uint64 {
	return 1
}
