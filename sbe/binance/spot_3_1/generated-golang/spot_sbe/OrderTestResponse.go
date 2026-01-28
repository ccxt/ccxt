// Generated SBE (Simple Binary Encoding) message codec

package spot_sbe

import (
	"io"
	"io/ioutil"
)

type OrderTestResponse struct {
}

func (o *OrderTestResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := o.RangeCheck(o.SbeSchemaVersion(), o.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (o *OrderTestResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if actingVersion > o.SbeSchemaVersion() && blockLength > o.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-o.SbeBlockLength()))
	}
	if doRangeCheck {
		if err := o.RangeCheck(actingVersion, o.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (o *OrderTestResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	return nil
}

func OrderTestResponseInit(o *OrderTestResponse) {
	return
}

func (*OrderTestResponse) SbeBlockLength() (blockLength uint16) {
	return 0
}

func (*OrderTestResponse) SbeTemplateId() (templateId uint16) {
	return 303
}

func (*OrderTestResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*OrderTestResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*OrderTestResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*OrderTestResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}
