// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_1

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type DepthResponse struct {
	LastUpdateId  int64
	PriceExponent int8
	QtyExponent   int8
	Bids          []DepthResponseBids
	Asks          []DepthResponseAsks
}
type DepthResponseBids struct {
	Price int64
	Qty   int64
}
type DepthResponseAsks struct {
	Price int64
	Qty   int64
}

func (d *DepthResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := d.RangeCheck(d.SbeSchemaVersion(), d.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt64(_w, d.LastUpdateId); err != nil {
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
	var BidsNumInGroup uint32 = uint32(len(d.Bids))
	if err := _m.WriteUint32(_w, BidsNumInGroup); err != nil {
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
	var AsksNumInGroup uint32 = uint32(len(d.Asks))
	if err := _m.WriteUint32(_w, AsksNumInGroup); err != nil {
		return err
	}
	for i := range d.Asks {
		if err := d.Asks[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	return nil
}

func (d *DepthResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if !d.LastUpdateIdInActingVersion(actingVersion) {
		d.LastUpdateId = d.LastUpdateIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &d.LastUpdateId); err != nil {
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
		var BidsNumInGroup uint32
		if err := _m.ReadUint32(_r, &BidsNumInGroup); err != nil {
			return err
		}
		if cap(d.Bids) < int(BidsNumInGroup) {
			d.Bids = make([]DepthResponseBids, BidsNumInGroup)
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
		var AsksNumInGroup uint32
		if err := _m.ReadUint32(_r, &AsksNumInGroup); err != nil {
			return err
		}
		if cap(d.Asks) < int(AsksNumInGroup) {
			d.Asks = make([]DepthResponseAsks, AsksNumInGroup)
		}
		d.Asks = d.Asks[:AsksNumInGroup]
		for i := range d.Asks {
			if err := d.Asks[i].Decode(_m, _r, actingVersion, uint(AsksBlockLength)); err != nil {
				return err
			}
		}
	}
	if doRangeCheck {
		if err := d.RangeCheck(actingVersion, d.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (d *DepthResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if d.LastUpdateIdInActingVersion(actingVersion) {
		if d.LastUpdateId < d.LastUpdateIdMinValue() || d.LastUpdateId > d.LastUpdateIdMaxValue() {
			return fmt.Errorf("Range check failed on d.LastUpdateId (%v < %v > %v)", d.LastUpdateIdMinValue(), d.LastUpdateId, d.LastUpdateIdMaxValue())
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
	return nil
}

func DepthResponseInit(d *DepthResponse) {
	return
}

func (d *DepthResponseBids) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteInt64(_w, d.Price); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, d.Qty); err != nil {
		return err
	}
	return nil
}

func (d *DepthResponseBids) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
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

func (d *DepthResponseBids) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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

func DepthResponseBidsInit(d *DepthResponseBids) {
	return
}

func (d *DepthResponseAsks) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteInt64(_w, d.Price); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, d.Qty); err != nil {
		return err
	}
	return nil
}

func (d *DepthResponseAsks) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
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

func (d *DepthResponseAsks) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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

func DepthResponseAsksInit(d *DepthResponseAsks) {
	return
}

func (*DepthResponse) SbeBlockLength() (blockLength uint16) {
	return 10
}

func (*DepthResponse) SbeTemplateId() (templateId uint16) {
	return 200
}

func (*DepthResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*DepthResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*DepthResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*DepthResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*DepthResponse) LastUpdateIdId() uint16 {
	return 1
}

func (*DepthResponse) LastUpdateIdSinceVersion() uint16 {
	return 0
}

func (d *DepthResponse) LastUpdateIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= d.LastUpdateIdSinceVersion()
}

func (*DepthResponse) LastUpdateIdDeprecated() uint16 {
	return 0
}

func (*DepthResponse) LastUpdateIdMetaAttribute(meta int) string {
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

func (*DepthResponse) LastUpdateIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*DepthResponse) LastUpdateIdMaxValue() int64 {
	return math.MaxInt64
}

func (*DepthResponse) LastUpdateIdNullValue() int64 {
	return math.MinInt64
}

func (*DepthResponse) PriceExponentId() uint16 {
	return 2
}

func (*DepthResponse) PriceExponentSinceVersion() uint16 {
	return 0
}

func (d *DepthResponse) PriceExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= d.PriceExponentSinceVersion()
}

func (*DepthResponse) PriceExponentDeprecated() uint16 {
	return 0
}

func (*DepthResponse) PriceExponentMetaAttribute(meta int) string {
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

func (*DepthResponse) PriceExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*DepthResponse) PriceExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*DepthResponse) PriceExponentNullValue() int8 {
	return math.MinInt8
}

func (*DepthResponse) QtyExponentId() uint16 {
	return 3
}

func (*DepthResponse) QtyExponentSinceVersion() uint16 {
	return 0
}

func (d *DepthResponse) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= d.QtyExponentSinceVersion()
}

func (*DepthResponse) QtyExponentDeprecated() uint16 {
	return 0
}

func (*DepthResponse) QtyExponentMetaAttribute(meta int) string {
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

func (*DepthResponse) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*DepthResponse) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*DepthResponse) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*DepthResponseBids) PriceId() uint16 {
	return 1
}

func (*DepthResponseBids) PriceSinceVersion() uint16 {
	return 0
}

func (d *DepthResponseBids) PriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= d.PriceSinceVersion()
}

func (*DepthResponseBids) PriceDeprecated() uint16 {
	return 0
}

func (*DepthResponseBids) PriceMetaAttribute(meta int) string {
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

func (*DepthResponseBids) PriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*DepthResponseBids) PriceMaxValue() int64 {
	return math.MaxInt64
}

func (*DepthResponseBids) PriceNullValue() int64 {
	return math.MinInt64
}

func (*DepthResponseBids) QtyId() uint16 {
	return 2
}

func (*DepthResponseBids) QtySinceVersion() uint16 {
	return 0
}

func (d *DepthResponseBids) QtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= d.QtySinceVersion()
}

func (*DepthResponseBids) QtyDeprecated() uint16 {
	return 0
}

func (*DepthResponseBids) QtyMetaAttribute(meta int) string {
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

func (*DepthResponseBids) QtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*DepthResponseBids) QtyMaxValue() int64 {
	return math.MaxInt64
}

func (*DepthResponseBids) QtyNullValue() int64 {
	return math.MinInt64
}

func (*DepthResponseAsks) PriceId() uint16 {
	return 1
}

func (*DepthResponseAsks) PriceSinceVersion() uint16 {
	return 0
}

func (d *DepthResponseAsks) PriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= d.PriceSinceVersion()
}

func (*DepthResponseAsks) PriceDeprecated() uint16 {
	return 0
}

func (*DepthResponseAsks) PriceMetaAttribute(meta int) string {
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

func (*DepthResponseAsks) PriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*DepthResponseAsks) PriceMaxValue() int64 {
	return math.MaxInt64
}

func (*DepthResponseAsks) PriceNullValue() int64 {
	return math.MinInt64
}

func (*DepthResponseAsks) QtyId() uint16 {
	return 2
}

func (*DepthResponseAsks) QtySinceVersion() uint16 {
	return 0
}

func (d *DepthResponseAsks) QtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= d.QtySinceVersion()
}

func (*DepthResponseAsks) QtyDeprecated() uint16 {
	return 0
}

func (*DepthResponseAsks) QtyMetaAttribute(meta int) string {
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

func (*DepthResponseAsks) QtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*DepthResponseAsks) QtyMaxValue() int64 {
	return math.MaxInt64
}

func (*DepthResponseAsks) QtyNullValue() int64 {
	return math.MinInt64
}

func (*DepthResponse) BidsId() uint16 {
	return 100
}

func (*DepthResponse) BidsSinceVersion() uint16 {
	return 0
}

func (d *DepthResponse) BidsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= d.BidsSinceVersion()
}

func (*DepthResponse) BidsDeprecated() uint16 {
	return 0
}

func (*DepthResponseBids) SbeBlockLength() (blockLength uint) {
	return 16
}

func (*DepthResponseBids) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*DepthResponse) AsksId() uint16 {
	return 101
}

func (*DepthResponse) AsksSinceVersion() uint16 {
	return 0
}

func (d *DepthResponse) AsksInActingVersion(actingVersion uint16) bool {
	return actingVersion >= d.AsksSinceVersion()
}

func (*DepthResponse) AsksDeprecated() uint16 {
	return 0
}

func (*DepthResponseAsks) SbeBlockLength() (blockLength uint) {
	return 16
}

func (*DepthResponseAsks) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}
