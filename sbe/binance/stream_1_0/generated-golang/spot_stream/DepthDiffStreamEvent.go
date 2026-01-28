// Generated SBE (Simple Binary Encoding) message codec

package spot_stream

import (
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"math"
	"unicode/utf8"
)

type DepthDiffStreamEvent struct {
	EventTime         int64
	FirstBookUpdateId int64
	LastBookUpdateId  int64
	PriceExponent     int8
	QtyExponent       int8
	Bids              []DepthDiffStreamEventBids
	Asks              []DepthDiffStreamEventAsks
	Symbol            []uint8
}
type DepthDiffStreamEventBids struct {
	Price int64
	Qty   int64
}
type DepthDiffStreamEventAsks struct {
	Price int64
	Qty   int64
}

func (d *DepthDiffStreamEvent) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := d.RangeCheck(d.SbeSchemaVersion(), d.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt64(_w, d.EventTime); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, d.FirstBookUpdateId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, d.LastBookUpdateId); err != nil {
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

func (d *DepthDiffStreamEvent) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if !d.EventTimeInActingVersion(actingVersion) {
		d.EventTime = d.EventTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &d.EventTime); err != nil {
			return err
		}
	}
	if !d.FirstBookUpdateIdInActingVersion(actingVersion) {
		d.FirstBookUpdateId = d.FirstBookUpdateIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &d.FirstBookUpdateId); err != nil {
			return err
		}
	}
	if !d.LastBookUpdateIdInActingVersion(actingVersion) {
		d.LastBookUpdateId = d.LastBookUpdateIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &d.LastBookUpdateId); err != nil {
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
			d.Bids = make([]DepthDiffStreamEventBids, BidsNumInGroup)
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
			d.Asks = make([]DepthDiffStreamEventAsks, AsksNumInGroup)
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

func (d *DepthDiffStreamEvent) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if d.EventTimeInActingVersion(actingVersion) {
		if d.EventTime < d.EventTimeMinValue() || d.EventTime > d.EventTimeMaxValue() {
			return fmt.Errorf("Range check failed on d.EventTime (%v < %v > %v)", d.EventTimeMinValue(), d.EventTime, d.EventTimeMaxValue())
		}
	}
	if d.FirstBookUpdateIdInActingVersion(actingVersion) {
		if d.FirstBookUpdateId < d.FirstBookUpdateIdMinValue() || d.FirstBookUpdateId > d.FirstBookUpdateIdMaxValue() {
			return fmt.Errorf("Range check failed on d.FirstBookUpdateId (%v < %v > %v)", d.FirstBookUpdateIdMinValue(), d.FirstBookUpdateId, d.FirstBookUpdateIdMaxValue())
		}
	}
	if d.LastBookUpdateIdInActingVersion(actingVersion) {
		if d.LastBookUpdateId < d.LastBookUpdateIdMinValue() || d.LastBookUpdateId > d.LastBookUpdateIdMaxValue() {
			return fmt.Errorf("Range check failed on d.LastBookUpdateId (%v < %v > %v)", d.LastBookUpdateIdMinValue(), d.LastBookUpdateId, d.LastBookUpdateIdMaxValue())
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

func DepthDiffStreamEventInit(d *DepthDiffStreamEvent) {
	return
}

func (d *DepthDiffStreamEventBids) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteInt64(_w, d.Price); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, d.Qty); err != nil {
		return err
	}
	return nil
}

func (d *DepthDiffStreamEventBids) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
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

func (d *DepthDiffStreamEventBids) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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

func DepthDiffStreamEventBidsInit(d *DepthDiffStreamEventBids) {
	return
}

func (d *DepthDiffStreamEventAsks) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteInt64(_w, d.Price); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, d.Qty); err != nil {
		return err
	}
	return nil
}

func (d *DepthDiffStreamEventAsks) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
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

func (d *DepthDiffStreamEventAsks) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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

func DepthDiffStreamEventAsksInit(d *DepthDiffStreamEventAsks) {
	return
}

func (*DepthDiffStreamEvent) SbeBlockLength() (blockLength uint16) {
	return 26
}

func (*DepthDiffStreamEvent) SbeTemplateId() (templateId uint16) {
	return 10003
}

func (*DepthDiffStreamEvent) SbeSchemaId() (schemaId uint16) {
	return 1
}

func (*DepthDiffStreamEvent) SbeSchemaVersion() (schemaVersion uint16) {
	return 0
}

func (*DepthDiffStreamEvent) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*DepthDiffStreamEvent) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*DepthDiffStreamEvent) EventTimeId() uint16 {
	return 1
}

func (*DepthDiffStreamEvent) EventTimeSinceVersion() uint16 {
	return 0
}

func (d *DepthDiffStreamEvent) EventTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= d.EventTimeSinceVersion()
}

func (*DepthDiffStreamEvent) EventTimeDeprecated() uint16 {
	return 0
}

func (*DepthDiffStreamEvent) EventTimeMetaAttribute(meta int) string {
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

func (*DepthDiffStreamEvent) EventTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*DepthDiffStreamEvent) EventTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*DepthDiffStreamEvent) EventTimeNullValue() int64 {
	return math.MinInt64
}

func (*DepthDiffStreamEvent) FirstBookUpdateIdId() uint16 {
	return 2
}

func (*DepthDiffStreamEvent) FirstBookUpdateIdSinceVersion() uint16 {
	return 0
}

func (d *DepthDiffStreamEvent) FirstBookUpdateIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= d.FirstBookUpdateIdSinceVersion()
}

func (*DepthDiffStreamEvent) FirstBookUpdateIdDeprecated() uint16 {
	return 0
}

func (*DepthDiffStreamEvent) FirstBookUpdateIdMetaAttribute(meta int) string {
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

func (*DepthDiffStreamEvent) FirstBookUpdateIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*DepthDiffStreamEvent) FirstBookUpdateIdMaxValue() int64 {
	return math.MaxInt64
}

func (*DepthDiffStreamEvent) FirstBookUpdateIdNullValue() int64 {
	return math.MinInt64
}

func (*DepthDiffStreamEvent) LastBookUpdateIdId() uint16 {
	return 3
}

func (*DepthDiffStreamEvent) LastBookUpdateIdSinceVersion() uint16 {
	return 0
}

func (d *DepthDiffStreamEvent) LastBookUpdateIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= d.LastBookUpdateIdSinceVersion()
}

func (*DepthDiffStreamEvent) LastBookUpdateIdDeprecated() uint16 {
	return 0
}

func (*DepthDiffStreamEvent) LastBookUpdateIdMetaAttribute(meta int) string {
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

func (*DepthDiffStreamEvent) LastBookUpdateIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*DepthDiffStreamEvent) LastBookUpdateIdMaxValue() int64 {
	return math.MaxInt64
}

func (*DepthDiffStreamEvent) LastBookUpdateIdNullValue() int64 {
	return math.MinInt64
}

func (*DepthDiffStreamEvent) PriceExponentId() uint16 {
	return 4
}

func (*DepthDiffStreamEvent) PriceExponentSinceVersion() uint16 {
	return 0
}

func (d *DepthDiffStreamEvent) PriceExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= d.PriceExponentSinceVersion()
}

func (*DepthDiffStreamEvent) PriceExponentDeprecated() uint16 {
	return 0
}

func (*DepthDiffStreamEvent) PriceExponentMetaAttribute(meta int) string {
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

func (*DepthDiffStreamEvent) PriceExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*DepthDiffStreamEvent) PriceExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*DepthDiffStreamEvent) PriceExponentNullValue() int8 {
	return math.MinInt8
}

func (*DepthDiffStreamEvent) QtyExponentId() uint16 {
	return 5
}

func (*DepthDiffStreamEvent) QtyExponentSinceVersion() uint16 {
	return 0
}

func (d *DepthDiffStreamEvent) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= d.QtyExponentSinceVersion()
}

func (*DepthDiffStreamEvent) QtyExponentDeprecated() uint16 {
	return 0
}

func (*DepthDiffStreamEvent) QtyExponentMetaAttribute(meta int) string {
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

func (*DepthDiffStreamEvent) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*DepthDiffStreamEvent) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*DepthDiffStreamEvent) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*DepthDiffStreamEventBids) PriceId() uint16 {
	return 1
}

func (*DepthDiffStreamEventBids) PriceSinceVersion() uint16 {
	return 0
}

func (d *DepthDiffStreamEventBids) PriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= d.PriceSinceVersion()
}

func (*DepthDiffStreamEventBids) PriceDeprecated() uint16 {
	return 0
}

func (*DepthDiffStreamEventBids) PriceMetaAttribute(meta int) string {
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

func (*DepthDiffStreamEventBids) PriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*DepthDiffStreamEventBids) PriceMaxValue() int64 {
	return math.MaxInt64
}

func (*DepthDiffStreamEventBids) PriceNullValue() int64 {
	return math.MinInt64
}

func (*DepthDiffStreamEventBids) QtyId() uint16 {
	return 2
}

func (*DepthDiffStreamEventBids) QtySinceVersion() uint16 {
	return 0
}

func (d *DepthDiffStreamEventBids) QtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= d.QtySinceVersion()
}

func (*DepthDiffStreamEventBids) QtyDeprecated() uint16 {
	return 0
}

func (*DepthDiffStreamEventBids) QtyMetaAttribute(meta int) string {
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

func (*DepthDiffStreamEventBids) QtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*DepthDiffStreamEventBids) QtyMaxValue() int64 {
	return math.MaxInt64
}

func (*DepthDiffStreamEventBids) QtyNullValue() int64 {
	return math.MinInt64
}

func (*DepthDiffStreamEventAsks) PriceId() uint16 {
	return 1
}

func (*DepthDiffStreamEventAsks) PriceSinceVersion() uint16 {
	return 0
}

func (d *DepthDiffStreamEventAsks) PriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= d.PriceSinceVersion()
}

func (*DepthDiffStreamEventAsks) PriceDeprecated() uint16 {
	return 0
}

func (*DepthDiffStreamEventAsks) PriceMetaAttribute(meta int) string {
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

func (*DepthDiffStreamEventAsks) PriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*DepthDiffStreamEventAsks) PriceMaxValue() int64 {
	return math.MaxInt64
}

func (*DepthDiffStreamEventAsks) PriceNullValue() int64 {
	return math.MinInt64
}

func (*DepthDiffStreamEventAsks) QtyId() uint16 {
	return 2
}

func (*DepthDiffStreamEventAsks) QtySinceVersion() uint16 {
	return 0
}

func (d *DepthDiffStreamEventAsks) QtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= d.QtySinceVersion()
}

func (*DepthDiffStreamEventAsks) QtyDeprecated() uint16 {
	return 0
}

func (*DepthDiffStreamEventAsks) QtyMetaAttribute(meta int) string {
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

func (*DepthDiffStreamEventAsks) QtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*DepthDiffStreamEventAsks) QtyMaxValue() int64 {
	return math.MaxInt64
}

func (*DepthDiffStreamEventAsks) QtyNullValue() int64 {
	return math.MinInt64
}

func (*DepthDiffStreamEvent) BidsId() uint16 {
	return 100
}

func (*DepthDiffStreamEvent) BidsSinceVersion() uint16 {
	return 0
}

func (d *DepthDiffStreamEvent) BidsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= d.BidsSinceVersion()
}

func (*DepthDiffStreamEvent) BidsDeprecated() uint16 {
	return 0
}

func (*DepthDiffStreamEventBids) SbeBlockLength() (blockLength uint) {
	return 16
}

func (*DepthDiffStreamEventBids) SbeSchemaVersion() (schemaVersion uint16) {
	return 0
}

func (*DepthDiffStreamEvent) AsksId() uint16 {
	return 101
}

func (*DepthDiffStreamEvent) AsksSinceVersion() uint16 {
	return 0
}

func (d *DepthDiffStreamEvent) AsksInActingVersion(actingVersion uint16) bool {
	return actingVersion >= d.AsksSinceVersion()
}

func (*DepthDiffStreamEvent) AsksDeprecated() uint16 {
	return 0
}

func (*DepthDiffStreamEventAsks) SbeBlockLength() (blockLength uint) {
	return 16
}

func (*DepthDiffStreamEventAsks) SbeSchemaVersion() (schemaVersion uint16) {
	return 0
}

func (*DepthDiffStreamEvent) SymbolMetaAttribute(meta int) string {
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

func (*DepthDiffStreamEvent) SymbolSinceVersion() uint16 {
	return 0
}

func (d *DepthDiffStreamEvent) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= d.SymbolSinceVersion()
}

func (*DepthDiffStreamEvent) SymbolDeprecated() uint16 {
	return 0
}

func (DepthDiffStreamEvent) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (DepthDiffStreamEvent) SymbolHeaderLength() uint64 {
	return 1
}
