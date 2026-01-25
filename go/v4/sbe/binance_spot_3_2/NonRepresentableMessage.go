// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_2

import (
	"io"
	"io/ioutil"
)

type NonRepresentableMessage struct {
}

func (n *NonRepresentableMessage) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := n.RangeCheck(n.SbeSchemaVersion(), n.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (n *NonRepresentableMessage) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if actingVersion > n.SbeSchemaVersion() && blockLength > n.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-n.SbeBlockLength()))
	}
	if doRangeCheck {
		if err := n.RangeCheck(actingVersion, n.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (n *NonRepresentableMessage) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	return nil
}

func NonRepresentableMessageInit(n *NonRepresentableMessage) {
	return
}

func (*NonRepresentableMessage) SbeBlockLength() (blockLength uint16) {
	return 0
}

func (*NonRepresentableMessage) SbeTemplateId() (templateId uint16) {
	return 999
}

func (*NonRepresentableMessage) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*NonRepresentableMessage) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*NonRepresentableMessage) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*NonRepresentableMessage) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}
