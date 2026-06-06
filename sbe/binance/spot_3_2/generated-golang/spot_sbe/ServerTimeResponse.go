// Generated SBE (Simple Binary Encoding) message codec

package spot_sbe

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type ServerTimeResponse struct {
	ServerTime int64
}

func (s *ServerTimeResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := s.RangeCheck(s.SbeSchemaVersion(), s.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt64(_w, s.ServerTime); err != nil {
		return err
	}
	return nil
}

func (s *ServerTimeResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if !s.ServerTimeInActingVersion(actingVersion) {
		s.ServerTime = s.ServerTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &s.ServerTime); err != nil {
			return err
		}
	}
	if actingVersion > s.SbeSchemaVersion() && blockLength > s.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-s.SbeBlockLength()))
	}
	if doRangeCheck {
		if err := s.RangeCheck(actingVersion, s.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (s *ServerTimeResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if s.ServerTimeInActingVersion(actingVersion) {
		if s.ServerTime < s.ServerTimeMinValue() || s.ServerTime > s.ServerTimeMaxValue() {
			return fmt.Errorf("Range check failed on s.ServerTime (%v < %v > %v)", s.ServerTimeMinValue(), s.ServerTime, s.ServerTimeMaxValue())
		}
	}
	return nil
}

func ServerTimeResponseInit(s *ServerTimeResponse) {
	return
}

func (*ServerTimeResponse) SbeBlockLength() (blockLength uint16) {
	return 8
}

func (*ServerTimeResponse) SbeTemplateId() (templateId uint16) {
	return 102
}

func (*ServerTimeResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*ServerTimeResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*ServerTimeResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*ServerTimeResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*ServerTimeResponse) ServerTimeId() uint16 {
	return 1
}

func (*ServerTimeResponse) ServerTimeSinceVersion() uint16 {
	return 0
}

func (s *ServerTimeResponse) ServerTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= s.ServerTimeSinceVersion()
}

func (*ServerTimeResponse) ServerTimeDeprecated() uint16 {
	return 0
}

func (*ServerTimeResponse) ServerTimeMetaAttribute(meta int) string {
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

func (*ServerTimeResponse) ServerTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ServerTimeResponse) ServerTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*ServerTimeResponse) ServerTimeNullValue() int64 {
	return math.MinInt64
}
