// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_2

import (
	"io"
	"io/ioutil"
)

type CancelReplaceOrderResponse struct {
	CancelResult     CancelReplaceStatusEnum
	NewOrderResult   CancelReplaceStatusEnum
	CancelResponse   []uint8
	NewOrderResponse []uint8
}

func (c *CancelReplaceOrderResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := c.RangeCheck(c.SbeSchemaVersion(), c.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := c.CancelResult.Encode(_m, _w); err != nil {
		return err
	}
	if err := c.NewOrderResult.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteUint16(_w, uint16(len(c.CancelResponse))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, c.CancelResponse); err != nil {
		return err
	}
	if err := _m.WriteUint32(_w, uint32(len(c.NewOrderResponse))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, c.NewOrderResponse); err != nil {
		return err
	}
	return nil
}

func (c *CancelReplaceOrderResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if c.CancelResultInActingVersion(actingVersion) {
		if err := c.CancelResult.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if c.NewOrderResultInActingVersion(actingVersion) {
		if err := c.NewOrderResult.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if actingVersion > c.SbeSchemaVersion() && blockLength > c.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-c.SbeBlockLength()))
	}

	if c.CancelResponseInActingVersion(actingVersion) {
		var CancelResponseLength uint16
		if err := _m.ReadUint16(_r, &CancelResponseLength); err != nil {
			return err
		}
		if cap(c.CancelResponse) < int(CancelResponseLength) {
			c.CancelResponse = make([]uint8, CancelResponseLength)
		}
		c.CancelResponse = c.CancelResponse[:CancelResponseLength]
		if err := _m.ReadBytes(_r, c.CancelResponse); err != nil {
			return err
		}
	}

	if c.NewOrderResponseInActingVersion(actingVersion) {
		var NewOrderResponseLength uint32
		if err := _m.ReadUint32(_r, &NewOrderResponseLength); err != nil {
			return err
		}
		if cap(c.NewOrderResponse) < int(NewOrderResponseLength) {
			c.NewOrderResponse = make([]uint8, NewOrderResponseLength)
		}
		c.NewOrderResponse = c.NewOrderResponse[:NewOrderResponseLength]
		if err := _m.ReadBytes(_r, c.NewOrderResponse); err != nil {
			return err
		}
	}
	if doRangeCheck {
		if err := c.RangeCheck(actingVersion, c.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (c *CancelReplaceOrderResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if err := c.CancelResult.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := c.NewOrderResult.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	return nil
}

func CancelReplaceOrderResponseInit(c *CancelReplaceOrderResponse) {
	return
}

func (*CancelReplaceOrderResponse) SbeBlockLength() (blockLength uint16) {
	return 2
}

func (*CancelReplaceOrderResponse) SbeTemplateId() (templateId uint16) {
	return 307
}

func (*CancelReplaceOrderResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*CancelReplaceOrderResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*CancelReplaceOrderResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*CancelReplaceOrderResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*CancelReplaceOrderResponse) CancelResultId() uint16 {
	return 1
}

func (*CancelReplaceOrderResponse) CancelResultSinceVersion() uint16 {
	return 0
}

func (c *CancelReplaceOrderResponse) CancelResultInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.CancelResultSinceVersion()
}

func (*CancelReplaceOrderResponse) CancelResultDeprecated() uint16 {
	return 0
}

func (*CancelReplaceOrderResponse) CancelResultMetaAttribute(meta int) string {
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

func (*CancelReplaceOrderResponse) NewOrderResultId() uint16 {
	return 2
}

func (*CancelReplaceOrderResponse) NewOrderResultSinceVersion() uint16 {
	return 0
}

func (c *CancelReplaceOrderResponse) NewOrderResultInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.NewOrderResultSinceVersion()
}

func (*CancelReplaceOrderResponse) NewOrderResultDeprecated() uint16 {
	return 0
}

func (*CancelReplaceOrderResponse) NewOrderResultMetaAttribute(meta int) string {
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

func (*CancelReplaceOrderResponse) CancelResponseMetaAttribute(meta int) string {
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

func (*CancelReplaceOrderResponse) CancelResponseSinceVersion() uint16 {
	return 0
}

func (c *CancelReplaceOrderResponse) CancelResponseInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.CancelResponseSinceVersion()
}

func (*CancelReplaceOrderResponse) CancelResponseDeprecated() uint16 {
	return 0
}

func (CancelReplaceOrderResponse) CancelResponseCharacterEncoding() string {
	return "null"
}

func (CancelReplaceOrderResponse) CancelResponseHeaderLength() uint64 {
	return 2
}

func (*CancelReplaceOrderResponse) NewOrderResponseMetaAttribute(meta int) string {
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

func (*CancelReplaceOrderResponse) NewOrderResponseSinceVersion() uint16 {
	return 0
}

func (c *CancelReplaceOrderResponse) NewOrderResponseInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.NewOrderResponseSinceVersion()
}

func (*CancelReplaceOrderResponse) NewOrderResponseDeprecated() uint16 {
	return 0
}

func (CancelReplaceOrderResponse) NewOrderResponseCharacterEncoding() string {
	return "null"
}

func (CancelReplaceOrderResponse) NewOrderResponseHeaderLength() uint64 {
	return 4
}
