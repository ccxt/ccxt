// Generated SBE (Simple Binary Encoding) message codec

package binance_stream_1_0

import (
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"math"
	"unicode/utf8"
)

type DepthSnapshotStreamEvent struct {
	EventTime     int64
	BookUpdateId  int64
	PriceExponent int8
	QtyExponent   int8
	Bids          []DepthSnapshotStreamEventBids
	Asks          []DepthSnapshotStreamEventAsks
	Symbol        []uint8
}
type DepthSnapshotStreamEventBids struct {
	Price int64
	Qty   int64
}
type DepthSnapshotStreamEventAsks struct {
	Price int64
	Qty   int64
}

func (d *DepthSnapshotStreamEvent) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := d.RangeCheck(d.SbeSchemaVersion(), d.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt64(_w, d.EventTime); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, d.BookUpdateId); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, d.PriceExponent); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, d.QtyExponent); err != nil {
		return err
	}
	var BidsBlockLength uint16 = 16
	if err := _m.WriteUint16(_w, BidsBlockLength); err != nil {
		return err
	}
	var BidsNumInGroup uint16 = uint16(len(d.Bids))
	if err := _m.WriteUint16(_w, BidsNumInGroup); err != nil {
		return err
	}
	for i := range d.Bids {
		if err := d.Bids[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	var AsksBlockLength uint16 = 16
	if err := _m.WriteUint16(_w, AsksBlockLength); err != nil {
		return err
	}
	var AsksNumInGroup uint16 = uint16(len(d.Asks))
	if err := _m.WriteUint16(_w, AsksNumInGroup); err != nil {
		return err
	}
	for i := range d.Asks {
		if err := d.Asks[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	if err := _m.WriteUint8(_w, uint8(len(d.Symbol))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, d.Symbol); err != nil {
		return err
	}
	return nil
}

func (d *DepthSnapshotStreamEvent) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if !d.EventTimeInActingVersion(actingVersion) {
		d.EventTime = d.EventTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &d.EventTime); err != nil {
			return err
		}
	}
	if !d.BookUpdateIdInActingVersion(actingVersion) {
		d.BookUpdateId = d.BookUpdateIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &d.BookUpdateId); err != nil {
			return err
		}
	}
	if !d.PriceExponentInActingVersion(actingVersion) {
		d.PriceExponent = d.PriceExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &d.PriceExponent); err != nil {
			return err
		}
	}
	if !d.QtyExponentInActingVersion(actingVersion) {
		d.QtyExponent = d.QtyExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &d.QtyExponent); err != nil {
			return err
		}
	}
	if actingVersion > d.SbeSchemaVersion() && blockLength > d.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-d.SbeBlockLength()))
	}

	if d.BidsInActingVersion(actingVersion) {
		var BidsBlockLength uint16
		if err := _m.ReadUint16(_r, &BidsBlockLength); err != nil {
			return err
		}
		var BidsNumInGroup uint16
		if err := _m.ReadUint16(_r, &BidsNumInGroup); err != nil {
			return err
		}
		if cap(d.Bids) < int(BidsNumInGroup) {
			d.Bids = make([]DepthSnapshotStreamEventBids, BidsNumInGroup)
		}
		d.Bids = d.Bids[:BidsNumInGroup]
		for i := range d.Bids {
			if err := d.Bids[i].Decode(_m, _r, actingVersion, uint(BidsBlockLength)); err != nil {
				return err
			}
		}
	}

	if d.AsksInActingVersion(actingVersion) {
		var AsksBlockLength uint16
		if err := _m.ReadUint16(_r, &AsksBlockLength); err != nil {
			return err
		}
		var AsksNumInGroup uint16
		if err := _m.ReadUint16(_r, &AsksNumInGroup); err != nil {
			return err
		}
		if cap(d.Asks) < int(AsksNumInGroup) {
			d.Asks = make([]DepthSnapshotStreamEventAsks, AsksNumInGroup)
		}
		d.Asks = d.Asks[:AsksNumInGroup]
		for i := range d.Asks {
			if err := d.Asks[i].Decode(_m, _r, actingVersion, uint(AsksBlockLength)); err != nil {
				return err
			}
		}
	}

	if d.SymbolInActingVersion(actingVersion) {
		var SymbolLength uint8
		if err := _m.ReadUint8(_r, &SymbolLength); err != nil {
			return err
		}
		if cap(d.Symbol) < int(SymbolLength) {
			d.Symbol = make([]uint8, SymbolLength)
		}
		d.Symbol = d.Symbol[:SymbolLength]
		if err := _m.ReadBytes(_r, d.Symbol); err != nil {
			return err
		}
	}
	if doRangeCheck {
		if err := d.RangeCheck(actingVersion, d.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (d *DepthSnapshotStreamEvent) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if d.EventTimeInActingVersion(actingVersion) {
		if d.EventTime < d.EventTimeMinValue() || d.EventTime > d.EventTimeMaxValue() {
			return fmt.Errorf("Range check failed on d.EventTime (%v < %v > %v)", d.EventTimeMinValue(), d.EventTime, d.EventTimeMaxValue())
		}
	}
	if d.BookUpdateIdInActingVersion(actingVersion) {
		if d.BookUpdateId < d.BookUpdateIdMinValue() || d.BookUpdateId > d.BookUpdateIdMaxValue() {
			return fmt.Errorf("Range check failed on d.BookUpdateId (%v < %v > %v)", d.BookUpdateIdMinValue(), d.BookUpdateId, d.BookUpdateIdMaxValue())
		}
	}
	if d.PriceExponentInActingVersion(actingVersion) {
		if d.PriceExponent < d.PriceExponentMinValue() || d.PriceExponent > d.PriceExponentMaxValue() {
			return fmt.Errorf("Range check failed on d.PriceExponent (%v < %v > %v)", d.PriceExponentMinValue(), d.PriceExponent, d.PriceExponentMaxValue())
		}
	}
	if d.QtyExponentInActingVersion(actingVersion) {
		if d.QtyExponent < d.QtyExponentMinValue() || d.QtyExponent > d.QtyExponentMaxValue() {
			return fmt.Errorf("Range check failed on d.QtyExponent (%v < %v > %v)", d.QtyExponentMinValue(), d.QtyExponent, d.QtyExponentMaxValue())
		}
	}
	for i := range d.Bids {
		if err := d.Bids[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	for i := range d.Asks {
		if err := d.Asks[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	if !utf8.Valid(d.Symbol[:]) {
		return errors.New("d.Symbol failed UTF-8 validation")
	}
	return nil
}

func DepthSnapshotStreamEventInit(d *DepthSnapshotStreamEvent) {
	return
}

func (d *DepthSnapshotStreamEventBids) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteInt64(_w, d.Price); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, d.Qty); err != nil {
		return err
	}
	return nil
}

func (d *DepthSnapshotStreamEventBids) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if !d.PriceInActingVersion(actingVersion) {
		d.Price = d.PriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &d.Price); err != nil {
			return err
		}
	}
	if !d.QtyInActingVersion(actingVersion) {
		d.Qty = d.QtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &d.Qty); err != nil {
			return err
		}
	}
	if actingVersion > d.SbeSchemaVersion() && blockLength > d.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-d.SbeBlockLength()))
	}
	return nil
}

func (d *DepthSnapshotStreamEventBids) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if d.PriceInActingVersion(actingVersion) {
		if d.Price < d.PriceMinValue() || d.Price > d.PriceMaxValue() {
			return fmt.Errorf("Range check failed on d.Price (%v < %v > %v)", d.PriceMinValue(), d.Price, d.PriceMaxValue())
		}
	}
	if d.QtyInActingVersion(actingVersion) {
		if d.Qty < d.QtyMinValue() || d.Qty > d.QtyMaxValue() {
			return fmt.Errorf("Range check failed on d.Qty (%v < %v > %v)", d.QtyMinValue(), d.Qty, d.QtyMaxValue())
		}
	}
	return nil
}

func DepthSnapshotStreamEventBidsInit(d *DepthSnapshotStreamEventBids) {
	return
}

func (d *DepthSnapshotStreamEventAsks) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteInt64(_w, d.Price); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, d.Qty); err != nil {
		return err
	}
	return nil
}

func (d *DepthSnapshotStreamEventAsks) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if !d.PriceInActingVersion(actingVersion) {
		d.Price = d.PriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &d.Price); err != nil {
			return err
		}
	}
	if !d.QtyInActingVersion(actingVersion) {
		d.Qty = d.QtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &d.Qty); err != nil {
			return err
		}
	}
	if actingVersion > d.SbeSchemaVersion() && blockLength > d.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-d.SbeBlockLength()))
	}
	return nil
}

func (d *DepthSnapshotStreamEventAsks) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if d.PriceInActingVersion(actingVersion) {
		if d.Price < d.PriceMinValue() || d.Price > d.PriceMaxValue() {
			return fmt.Errorf("Range check failed on d.Price (%v < %v > %v)", d.PriceMinValue(), d.Price, d.PriceMaxValue())
		}
	}
	if d.QtyInActingVersion(actingVersion) {
		if d.Qty < d.QtyMinValue() || d.Qty > d.QtyMaxValue() {
			return fmt.Errorf("Range check failed on d.Qty (%v < %v > %v)", d.QtyMinValue(), d.Qty, d.QtyMaxValue())
		}
	}
	return nil
}

func DepthSnapshotStreamEventAsksInit(d *DepthSnapshotStreamEventAsks) {
	return
}

func (*DepthSnapshotStreamEvent) SbeBlockLength() (blockLength uint16) {
	return 18
}

func (*DepthSnapshotStreamEvent) SbeTemplateId() (templateId uint16) {
	return 10002
}

func (*DepthSnapshotStreamEvent) SbeSchemaId() (schemaId uint16) {
	return 1
}

func (*DepthSnapshotStreamEvent) SbeSchemaVersion() (schemaVersion uint16) {
	return 0
}

func (*DepthSnapshotStreamEvent) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*DepthSnapshotStreamEvent) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*DepthSnapshotStreamEvent) EventTimeId() uint16 {
	return 1
}

func (*DepthSnapshotStreamEvent) EventTimeSinceVersion() uint16 {
	return 0
}

func (d *DepthSnapshotStreamEvent) EventTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= d.EventTimeSinceVersion()
}

func (*DepthSnapshotStreamEvent) EventTimeDeprecated() uint16 {
	return 0
}

func (*DepthSnapshotStreamEvent) EventTimeMetaAttribute(meta int) string {
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

func (*DepthSnapshotStreamEvent) EventTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*DepthSnapshotStreamEvent) EventTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*DepthSnapshotStreamEvent) EventTimeNullValue() int64 {
	return math.MinInt64
}

func (*DepthSnapshotStreamEvent) BookUpdateIdId() uint16 {
	return 2
}

func (*DepthSnapshotStreamEvent) BookUpdateIdSinceVersion() uint16 {
	return 0
}

func (d *DepthSnapshotStreamEvent) BookUpdateIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= d.BookUpdateIdSinceVersion()
}

func (*DepthSnapshotStreamEvent) BookUpdateIdDeprecated() uint16 {
	return 0
}

func (*DepthSnapshotStreamEvent) BookUpdateIdMetaAttribute(meta int) string {
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

func (*DepthSnapshotStreamEvent) BookUpdateIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*DepthSnapshotStreamEvent) BookUpdateIdMaxValue() int64 {
	return math.MaxInt64
}

func (*DepthSnapshotStreamEvent) BookUpdateIdNullValue() int64 {
	return math.MinInt64
}

func (*DepthSnapshotStreamEvent) PriceExponentId() uint16 {
	return 3
}

func (*DepthSnapshotStreamEvent) PriceExponentSinceVersion() uint16 {
	return 0
}

func (d *DepthSnapshotStreamEvent) PriceExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= d.PriceExponentSinceVersion()
}

func (*DepthSnapshotStreamEvent) PriceExponentDeprecated() uint16 {
	return 0
}

func (*DepthSnapshotStreamEvent) PriceExponentMetaAttribute(meta int) string {
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

func (*DepthSnapshotStreamEvent) PriceExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*DepthSnapshotStreamEvent) PriceExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*DepthSnapshotStreamEvent) PriceExponentNullValue() int8 {
	return math.MinInt8
}

func (*DepthSnapshotStreamEvent) QtyExponentId() uint16 {
	return 4
}

func (*DepthSnapshotStreamEvent) QtyExponentSinceVersion() uint16 {
	return 0
}

func (d *DepthSnapshotStreamEvent) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= d.QtyExponentSinceVersion()
}

func (*DepthSnapshotStreamEvent) QtyExponentDeprecated() uint16 {
	return 0
}

func (*DepthSnapshotStreamEvent) QtyExponentMetaAttribute(meta int) string {
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

func (*DepthSnapshotStreamEvent) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*DepthSnapshotStreamEvent) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*DepthSnapshotStreamEvent) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*DepthSnapshotStreamEventBids) PriceId() uint16 {
	return 1
}

func (*DepthSnapshotStreamEventBids) PriceSinceVersion() uint16 {
	return 0
}

func (d *DepthSnapshotStreamEventBids) PriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= d.PriceSinceVersion()
}

func (*DepthSnapshotStreamEventBids) PriceDeprecated() uint16 {
	return 0
}

func (*DepthSnapshotStreamEventBids) PriceMetaAttribute(meta int) string {
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

func (*DepthSnapshotStreamEventBids) PriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*DepthSnapshotStreamEventBids) PriceMaxValue() int64 {
	return math.MaxInt64
}

func (*DepthSnapshotStreamEventBids) PriceNullValue() int64 {
	return math.MinInt64
}

func (*DepthSnapshotStreamEventBids) QtyId() uint16 {
	return 2
}

func (*DepthSnapshotStreamEventBids) QtySinceVersion() uint16 {
	return 0
}

func (d *DepthSnapshotStreamEventBids) QtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= d.QtySinceVersion()
}

func (*DepthSnapshotStreamEventBids) QtyDeprecated() uint16 {
	return 0
}

func (*DepthSnapshotStreamEventBids) QtyMetaAttribute(meta int) string {
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

func (*DepthSnapshotStreamEventBids) QtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*DepthSnapshotStreamEventBids) QtyMaxValue() int64 {
	return math.MaxInt64
}

func (*DepthSnapshotStreamEventBids) QtyNullValue() int64 {
	return math.MinInt64
}

func (*DepthSnapshotStreamEventAsks) PriceId() uint16 {
	return 1
}

func (*DepthSnapshotStreamEventAsks) PriceSinceVersion() uint16 {
	return 0
}

func (d *DepthSnapshotStreamEventAsks) PriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= d.PriceSinceVersion()
}

func (*DepthSnapshotStreamEventAsks) PriceDeprecated() uint16 {
	return 0
}

func (*DepthSnapshotStreamEventAsks) PriceMetaAttribute(meta int) string {
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

func (*DepthSnapshotStreamEventAsks) PriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*DepthSnapshotStreamEventAsks) PriceMaxValue() int64 {
	return math.MaxInt64
}

func (*DepthSnapshotStreamEventAsks) PriceNullValue() int64 {
	return math.MinInt64
}

func (*DepthSnapshotStreamEventAsks) QtyId() uint16 {
	return 2
}

func (*DepthSnapshotStreamEventAsks) QtySinceVersion() uint16 {
	return 0
}

func (d *DepthSnapshotStreamEventAsks) QtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= d.QtySinceVersion()
}

func (*DepthSnapshotStreamEventAsks) QtyDeprecated() uint16 {
	return 0
}

func (*DepthSnapshotStreamEventAsks) QtyMetaAttribute(meta int) string {
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

func (*DepthSnapshotStreamEventAsks) QtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*DepthSnapshotStreamEventAsks) QtyMaxValue() int64 {
	return math.MaxInt64
}

func (*DepthSnapshotStreamEventAsks) QtyNullValue() int64 {
	return math.MinInt64
}

func (*DepthSnapshotStreamEvent) BidsId() uint16 {
	return 100
}

func (*DepthSnapshotStreamEvent) BidsSinceVersion() uint16 {
	return 0
}

func (d *DepthSnapshotStreamEvent) BidsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= d.BidsSinceVersion()
}

func (*DepthSnapshotStreamEvent) BidsDeprecated() uint16 {
	return 0
}

func (*DepthSnapshotStreamEventBids) SbeBlockLength() (blockLength uint) {
	return 16
}

func (*DepthSnapshotStreamEventBids) SbeSchemaVersion() (schemaVersion uint16) {
	return 0
}

func (*DepthSnapshotStreamEvent) AsksId() uint16 {
	return 101
}

func (*DepthSnapshotStreamEvent) AsksSinceVersion() uint16 {
	return 0
}

func (d *DepthSnapshotStreamEvent) AsksInActingVersion(actingVersion uint16) bool {
	return actingVersion >= d.AsksSinceVersion()
}

func (*DepthSnapshotStreamEvent) AsksDeprecated() uint16 {
	return 0
}

func (*DepthSnapshotStreamEventAsks) SbeBlockLength() (blockLength uint) {
	return 16
}

func (*DepthSnapshotStreamEventAsks) SbeSchemaVersion() (schemaVersion uint16) {
	return 0
}

func (*DepthSnapshotStreamEvent) SymbolMetaAttribute(meta int) string {
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

func (*DepthSnapshotStreamEvent) SymbolSinceVersion() uint16 {
	return 0
}

func (d *DepthSnapshotStreamEvent) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= d.SymbolSinceVersion()
}

func (*DepthSnapshotStreamEvent) SymbolDeprecated() uint16 {
	return 0
}

func (DepthSnapshotStreamEvent) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (DepthSnapshotStreamEvent) SymbolHeaderLength() uint64 {
	return 1
}
