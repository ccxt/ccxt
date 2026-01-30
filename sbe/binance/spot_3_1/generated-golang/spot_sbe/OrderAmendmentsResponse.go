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

type OrderAmendmentsResponse struct {
	Amendments []OrderAmendmentsResponseAmendments
}
type OrderAmendmentsResponseAmendments struct {
	OrderId           int64
	ExecutionId       int64
	QtyExponent       int8
	OrigQty           int64
	NewQty            int64
	Time              int64
	Symbol            []uint8
	OrigClientOrderId []uint8
	NewClientOrderId  []uint8
}

func (o *OrderAmendmentsResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := o.RangeCheck(o.SbeSchemaVersion(), o.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	var AmendmentsBlockLength uint16 = 41
	if err := _m.WriteUint16(_w, AmendmentsBlockLength); err != nil {
		return err
	}
	var AmendmentsNumInGroup uint32 = uint32(len(o.Amendments))
	if err := _m.WriteUint32(_w, AmendmentsNumInGroup); err != nil {
		return err
	}
	for i := range o.Amendments {
		if err := o.Amendments[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	return nil
}

func (o *OrderAmendmentsResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if actingVersion > o.SbeSchemaVersion() && blockLength > o.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-o.SbeBlockLength()))
	}

	if o.AmendmentsInActingVersion(actingVersion) {
		var AmendmentsBlockLength uint16
		if err := _m.ReadUint16(_r, &AmendmentsBlockLength); err != nil {
			return err
		}
		var AmendmentsNumInGroup uint32
		if err := _m.ReadUint32(_r, &AmendmentsNumInGroup); err != nil {
			return err
		}
		if cap(o.Amendments) < int(AmendmentsNumInGroup) {
			o.Amendments = make([]OrderAmendmentsResponseAmendments, AmendmentsNumInGroup)
		}
		o.Amendments = o.Amendments[:AmendmentsNumInGroup]
		for i := range o.Amendments {
			if err := o.Amendments[i].Decode(_m, _r, actingVersion, uint(AmendmentsBlockLength)); err != nil {
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

func (o *OrderAmendmentsResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	for i := range o.Amendments {
		if err := o.Amendments[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	return nil
}

func OrderAmendmentsResponseInit(o *OrderAmendmentsResponse) {
	return
}

func (o *OrderAmendmentsResponseAmendments) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteInt64(_w, o.OrderId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.ExecutionId); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, o.QtyExponent); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.OrigQty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.NewQty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.Time); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(o.Symbol))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, o.Symbol); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(o.OrigClientOrderId))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, o.OrigClientOrderId); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(o.NewClientOrderId))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, o.NewClientOrderId); err != nil {
		return err
	}
	return nil
}

func (o *OrderAmendmentsResponseAmendments) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if !o.OrderIdInActingVersion(actingVersion) {
		o.OrderId = o.OrderIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.OrderId); err != nil {
			return err
		}
	}
	if !o.ExecutionIdInActingVersion(actingVersion) {
		o.ExecutionId = o.ExecutionIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.ExecutionId); err != nil {
			return err
		}
	}
	if !o.QtyExponentInActingVersion(actingVersion) {
		o.QtyExponent = o.QtyExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &o.QtyExponent); err != nil {
			return err
		}
	}
	if !o.OrigQtyInActingVersion(actingVersion) {
		o.OrigQty = o.OrigQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.OrigQty); err != nil {
			return err
		}
	}
	if !o.NewQtyInActingVersion(actingVersion) {
		o.NewQty = o.NewQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.NewQty); err != nil {
			return err
		}
	}
	if !o.TimeInActingVersion(actingVersion) {
		o.Time = o.TimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.Time); err != nil {
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

	if o.OrigClientOrderIdInActingVersion(actingVersion) {
		var OrigClientOrderIdLength uint8
		if err := _m.ReadUint8(_r, &OrigClientOrderIdLength); err != nil {
			return err
		}
		if cap(o.OrigClientOrderId) < int(OrigClientOrderIdLength) {
			o.OrigClientOrderId = make([]uint8, OrigClientOrderIdLength)
		}
		o.OrigClientOrderId = o.OrigClientOrderId[:OrigClientOrderIdLength]
		if err := _m.ReadBytes(_r, o.OrigClientOrderId); err != nil {
			return err
		}
	}

	if o.NewClientOrderIdInActingVersion(actingVersion) {
		var NewClientOrderIdLength uint8
		if err := _m.ReadUint8(_r, &NewClientOrderIdLength); err != nil {
			return err
		}
		if cap(o.NewClientOrderId) < int(NewClientOrderIdLength) {
			o.NewClientOrderId = make([]uint8, NewClientOrderIdLength)
		}
		o.NewClientOrderId = o.NewClientOrderId[:NewClientOrderIdLength]
		if err := _m.ReadBytes(_r, o.NewClientOrderId); err != nil {
			return err
		}
	}
	return nil
}

func (o *OrderAmendmentsResponseAmendments) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if o.OrderIdInActingVersion(actingVersion) {
		if o.OrderId < o.OrderIdMinValue() || o.OrderId > o.OrderIdMaxValue() {
			return fmt.Errorf("Range check failed on o.OrderId (%v < %v > %v)", o.OrderIdMinValue(), o.OrderId, o.OrderIdMaxValue())
		}
	}
	if o.ExecutionIdInActingVersion(actingVersion) {
		if o.ExecutionId < o.ExecutionIdMinValue() || o.ExecutionId > o.ExecutionIdMaxValue() {
			return fmt.Errorf("Range check failed on o.ExecutionId (%v < %v > %v)", o.ExecutionIdMinValue(), o.ExecutionId, o.ExecutionIdMaxValue())
		}
	}
	if o.QtyExponentInActingVersion(actingVersion) {
		if o.QtyExponent < o.QtyExponentMinValue() || o.QtyExponent > o.QtyExponentMaxValue() {
			return fmt.Errorf("Range check failed on o.QtyExponent (%v < %v > %v)", o.QtyExponentMinValue(), o.QtyExponent, o.QtyExponentMaxValue())
		}
	}
	if o.OrigQtyInActingVersion(actingVersion) {
		if o.OrigQty < o.OrigQtyMinValue() || o.OrigQty > o.OrigQtyMaxValue() {
			return fmt.Errorf("Range check failed on o.OrigQty (%v < %v > %v)", o.OrigQtyMinValue(), o.OrigQty, o.OrigQtyMaxValue())
		}
	}
	if o.NewQtyInActingVersion(actingVersion) {
		if o.NewQty < o.NewQtyMinValue() || o.NewQty > o.NewQtyMaxValue() {
			return fmt.Errorf("Range check failed on o.NewQty (%v < %v > %v)", o.NewQtyMinValue(), o.NewQty, o.NewQtyMaxValue())
		}
	}
	if o.TimeInActingVersion(actingVersion) {
		if o.Time < o.TimeMinValue() || o.Time > o.TimeMaxValue() {
			return fmt.Errorf("Range check failed on o.Time (%v < %v > %v)", o.TimeMinValue(), o.Time, o.TimeMaxValue())
		}
	}
	if !utf8.Valid(o.Symbol[:]) {
		return errors.New("o.Symbol failed UTF-8 validation")
	}
	if !utf8.Valid(o.OrigClientOrderId[:]) {
		return errors.New("o.OrigClientOrderId failed UTF-8 validation")
	}
	if !utf8.Valid(o.NewClientOrderId[:]) {
		return errors.New("o.NewClientOrderId failed UTF-8 validation")
	}
	return nil
}

func OrderAmendmentsResponseAmendmentsInit(o *OrderAmendmentsResponseAmendments) {
	return
}

func (*OrderAmendmentsResponse) SbeBlockLength() (blockLength uint16) {
	return 0
}

func (*OrderAmendmentsResponse) SbeTemplateId() (templateId uint16) {
	return 316
}

func (*OrderAmendmentsResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*OrderAmendmentsResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*OrderAmendmentsResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*OrderAmendmentsResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*OrderAmendmentsResponseAmendments) OrderIdId() uint16 {
	return 1
}

func (*OrderAmendmentsResponseAmendments) OrderIdSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendmentsResponseAmendments) OrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.OrderIdSinceVersion()
}

func (*OrderAmendmentsResponseAmendments) OrderIdDeprecated() uint16 {
	return 0
}

func (*OrderAmendmentsResponseAmendments) OrderIdMetaAttribute(meta int) string {
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

func (*OrderAmendmentsResponseAmendments) OrderIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderAmendmentsResponseAmendments) OrderIdMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderAmendmentsResponseAmendments) OrderIdNullValue() int64 {
	return math.MinInt64
}

func (*OrderAmendmentsResponseAmendments) ExecutionIdId() uint16 {
	return 2
}

func (*OrderAmendmentsResponseAmendments) ExecutionIdSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendmentsResponseAmendments) ExecutionIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.ExecutionIdSinceVersion()
}

func (*OrderAmendmentsResponseAmendments) ExecutionIdDeprecated() uint16 {
	return 0
}

func (*OrderAmendmentsResponseAmendments) ExecutionIdMetaAttribute(meta int) string {
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

func (*OrderAmendmentsResponseAmendments) ExecutionIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderAmendmentsResponseAmendments) ExecutionIdMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderAmendmentsResponseAmendments) ExecutionIdNullValue() int64 {
	return math.MinInt64
}

func (*OrderAmendmentsResponseAmendments) QtyExponentId() uint16 {
	return 3
}

func (*OrderAmendmentsResponseAmendments) QtyExponentSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendmentsResponseAmendments) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.QtyExponentSinceVersion()
}

func (*OrderAmendmentsResponseAmendments) QtyExponentDeprecated() uint16 {
	return 0
}

func (*OrderAmendmentsResponseAmendments) QtyExponentMetaAttribute(meta int) string {
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

func (*OrderAmendmentsResponseAmendments) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*OrderAmendmentsResponseAmendments) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*OrderAmendmentsResponseAmendments) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*OrderAmendmentsResponseAmendments) OrigQtyId() uint16 {
	return 4
}

func (*OrderAmendmentsResponseAmendments) OrigQtySinceVersion() uint16 {
	return 0
}

func (o *OrderAmendmentsResponseAmendments) OrigQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.OrigQtySinceVersion()
}

func (*OrderAmendmentsResponseAmendments) OrigQtyDeprecated() uint16 {
	return 0
}

func (*OrderAmendmentsResponseAmendments) OrigQtyMetaAttribute(meta int) string {
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

func (*OrderAmendmentsResponseAmendments) OrigQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderAmendmentsResponseAmendments) OrigQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderAmendmentsResponseAmendments) OrigQtyNullValue() int64 {
	return math.MinInt64
}

func (*OrderAmendmentsResponseAmendments) NewQtyId() uint16 {
	return 5
}

func (*OrderAmendmentsResponseAmendments) NewQtySinceVersion() uint16 {
	return 0
}

func (o *OrderAmendmentsResponseAmendments) NewQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.NewQtySinceVersion()
}

func (*OrderAmendmentsResponseAmendments) NewQtyDeprecated() uint16 {
	return 0
}

func (*OrderAmendmentsResponseAmendments) NewQtyMetaAttribute(meta int) string {
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

func (*OrderAmendmentsResponseAmendments) NewQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderAmendmentsResponseAmendments) NewQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderAmendmentsResponseAmendments) NewQtyNullValue() int64 {
	return math.MinInt64
}

func (*OrderAmendmentsResponseAmendments) TimeId() uint16 {
	return 6
}

func (*OrderAmendmentsResponseAmendments) TimeSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendmentsResponseAmendments) TimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.TimeSinceVersion()
}

func (*OrderAmendmentsResponseAmendments) TimeDeprecated() uint16 {
	return 0
}

func (*OrderAmendmentsResponseAmendments) TimeMetaAttribute(meta int) string {
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

func (*OrderAmendmentsResponseAmendments) TimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderAmendmentsResponseAmendments) TimeMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderAmendmentsResponseAmendments) TimeNullValue() int64 {
	return math.MinInt64
}

func (*OrderAmendmentsResponseAmendments) SymbolMetaAttribute(meta int) string {
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

func (*OrderAmendmentsResponseAmendments) SymbolSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendmentsResponseAmendments) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.SymbolSinceVersion()
}

func (*OrderAmendmentsResponseAmendments) SymbolDeprecated() uint16 {
	return 0
}

func (OrderAmendmentsResponseAmendments) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (OrderAmendmentsResponseAmendments) SymbolHeaderLength() uint64 {
	return 1
}

func (*OrderAmendmentsResponseAmendments) OrigClientOrderIdMetaAttribute(meta int) string {
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

func (*OrderAmendmentsResponseAmendments) OrigClientOrderIdSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendmentsResponseAmendments) OrigClientOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.OrigClientOrderIdSinceVersion()
}

func (*OrderAmendmentsResponseAmendments) OrigClientOrderIdDeprecated() uint16 {
	return 0
}

func (OrderAmendmentsResponseAmendments) OrigClientOrderIdCharacterEncoding() string {
	return "UTF-8"
}

func (OrderAmendmentsResponseAmendments) OrigClientOrderIdHeaderLength() uint64 {
	return 1
}

func (*OrderAmendmentsResponseAmendments) NewClientOrderIdMetaAttribute(meta int) string {
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

func (*OrderAmendmentsResponseAmendments) NewClientOrderIdSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendmentsResponseAmendments) NewClientOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.NewClientOrderIdSinceVersion()
}

func (*OrderAmendmentsResponseAmendments) NewClientOrderIdDeprecated() uint16 {
	return 0
}

func (OrderAmendmentsResponseAmendments) NewClientOrderIdCharacterEncoding() string {
	return "UTF-8"
}

func (OrderAmendmentsResponseAmendments) NewClientOrderIdHeaderLength() uint64 {
	return 1
}

func (*OrderAmendmentsResponse) AmendmentsId() uint16 {
	return 100
}

func (*OrderAmendmentsResponse) AmendmentsSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendmentsResponse) AmendmentsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.AmendmentsSinceVersion()
}

func (*OrderAmendmentsResponse) AmendmentsDeprecated() uint16 {
	return 0
}

func (*OrderAmendmentsResponseAmendments) SbeBlockLength() (blockLength uint) {
	return 41
}

func (*OrderAmendmentsResponseAmendments) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}
