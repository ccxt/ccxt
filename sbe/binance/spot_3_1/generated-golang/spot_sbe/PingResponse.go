// Generated SBE (Simple Binary Encoding) message codec

package spot_sbe

import (
	"io"
	"io/ioutil"
)

type PingResponse struct {
}

func (p *PingResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := p.RangeCheck(p.SbeSchemaVersion(), p.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (p *PingResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if actingVersion > p.SbeSchemaVersion() && blockLength > p.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-p.SbeBlockLength()))
	}
	if doRangeCheck {
		if err := p.RangeCheck(actingVersion, p.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (p *PingResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	return nil
}

func PingResponseInit(p *PingResponse) {
	return
}

func (*PingResponse) SbeBlockLength() (blockLength uint16) {
	return 0
}

func (*PingResponse) SbeTemplateId() (templateId uint16) {
	return 101
}

func (*PingResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*PingResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*PingResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*PingResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}
