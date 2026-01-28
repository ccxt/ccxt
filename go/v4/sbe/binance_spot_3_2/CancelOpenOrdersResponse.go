// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_2

import (
	"io"
	"io/ioutil"
)

type CancelOpenOrdersResponse struct {
	Responses []CancelOpenOrdersResponseResponses
}
type CancelOpenOrdersResponseResponses struct {
	Response []uint8
}

func (c *CancelOpenOrdersResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := c.RangeCheck(c.SbeSchemaVersion(), c.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	var ResponsesBlockLength uint16 = 0
	if err := _m.WriteUint16(_w, ResponsesBlockLength); err != nil {
		return err
	}
	var ResponsesNumInGroup uint32 = uint32(len(c.Responses))
	if err := _m.WriteUint32(_w, ResponsesNumInGroup); err != nil {
		return err
	}
	for i := range c.Responses {
		if err := c.Responses[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	return nil
}

func (c *CancelOpenOrdersResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if actingVersion > c.SbeSchemaVersion() && blockLength > c.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-c.SbeBlockLength()))
	}

	if c.ResponsesInActingVersion(actingVersion) {
		var ResponsesBlockLength uint16
		if err := _m.ReadUint16(_r, &ResponsesBlockLength); err != nil {
			return err
		}
		var ResponsesNumInGroup uint32
		if err := _m.ReadUint32(_r, &ResponsesNumInGroup); err != nil {
			return err
		}
		if cap(c.Responses) < int(ResponsesNumInGroup) {
			c.Responses = make([]CancelOpenOrdersResponseResponses, ResponsesNumInGroup)
		}
		c.Responses = c.Responses[:ResponsesNumInGroup]
		for i := range c.Responses {
			if err := c.Responses[i].Decode(_m, _r, actingVersion, uint(ResponsesBlockLength)); err != nil {
				return err
			}
		}
	}
	if doRangeCheck {
		if err := c.RangeCheck(actingVersion, c.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (c *CancelOpenOrdersResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	for i := range c.Responses {
		if err := c.Responses[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	return nil
}

func CancelOpenOrdersResponseInit(c *CancelOpenOrdersResponse) {
	return
}

func (c *CancelOpenOrdersResponseResponses) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint16(_w, uint16(len(c.Response))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, c.Response); err != nil {
		return err
	}
	return nil
}

func (c *CancelOpenOrdersResponseResponses) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if actingVersion > c.SbeSchemaVersion() && blockLength > c.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-c.SbeBlockLength()))
	}

	if c.ResponseInActingVersion(actingVersion) {
		var ResponseLength uint16
		if err := _m.ReadUint16(_r, &ResponseLength); err != nil {
			return err
		}
		if cap(c.Response) < int(ResponseLength) {
			c.Response = make([]uint8, ResponseLength)
		}
		c.Response = c.Response[:ResponseLength]
		if err := _m.ReadBytes(_r, c.Response); err != nil {
			return err
		}
	}
	return nil
}

func (c *CancelOpenOrdersResponseResponses) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	return nil
}

func CancelOpenOrdersResponseResponsesInit(c *CancelOpenOrdersResponseResponses) {
	return
}

func (*CancelOpenOrdersResponse) SbeBlockLength() (blockLength uint16) {
	return 0
}

func (*CancelOpenOrdersResponse) SbeTemplateId() (templateId uint16) {
	return 306
}

func (*CancelOpenOrdersResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*CancelOpenOrdersResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*CancelOpenOrdersResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*CancelOpenOrdersResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*CancelOpenOrdersResponseResponses) ResponseMetaAttribute(meta int) string {
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

func (*CancelOpenOrdersResponseResponses) ResponseSinceVersion() uint16 {
	return 0
}

func (c *CancelOpenOrdersResponseResponses) ResponseInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.ResponseSinceVersion()
}

func (*CancelOpenOrdersResponseResponses) ResponseDeprecated() uint16 {
	return 0
}

func (CancelOpenOrdersResponseResponses) ResponseCharacterEncoding() string {
	return "null"
}

func (CancelOpenOrdersResponseResponses) ResponseHeaderLength() uint64 {
	return 2
}

func (*CancelOpenOrdersResponse) ResponsesId() uint16 {
	return 100
}

func (*CancelOpenOrdersResponse) ResponsesSinceVersion() uint16 {
	return 0
}

func (c *CancelOpenOrdersResponse) ResponsesInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.ResponsesSinceVersion()
}

func (*CancelOpenOrdersResponse) ResponsesDeprecated() uint16 {
	return 0
}

func (*CancelOpenOrdersResponseResponses) SbeBlockLength() (blockLength uint) {
	return 0
}

func (*CancelOpenOrdersResponseResponses) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}
