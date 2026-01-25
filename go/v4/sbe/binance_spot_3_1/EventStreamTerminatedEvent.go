// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_1

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type EventStreamTerminatedEvent struct {
	EventTime      int64
	SubscriptionId uint16
}

func (e *EventStreamTerminatedEvent) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := e.RangeCheck(e.SbeSchemaVersion(), e.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt64(_w, e.EventTime); err != nil {
		return err
	}
	if err := _m.WriteUint16(_w, e.SubscriptionId); err != nil {
		return err
	}
	return nil
}

func (e *EventStreamTerminatedEvent) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if !e.EventTimeInActingVersion(actingVersion) {
		e.EventTime = e.EventTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.EventTime); err != nil {
			return err
		}
	}
	if !e.SubscriptionIdInActingVersion(actingVersion) {
		e.SubscriptionId = e.SubscriptionIdNullValue()
	} else {
		if err := _m.ReadUint16(_r, &e.SubscriptionId); err != nil {
			return err
		}
	}
	if actingVersion > e.SbeSchemaVersion() && blockLength > e.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-e.SbeBlockLength()))
	}
	if doRangeCheck {
		if err := e.RangeCheck(actingVersion, e.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (e *EventStreamTerminatedEvent) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if e.EventTimeInActingVersion(actingVersion) {
		if e.EventTime < e.EventTimeMinValue() || e.EventTime > e.EventTimeMaxValue() {
			return fmt.Errorf("Range check failed on e.EventTime (%v < %v > %v)", e.EventTimeMinValue(), e.EventTime, e.EventTimeMaxValue())
		}
	}
	if e.SubscriptionIdInActingVersion(actingVersion) {
		if e.SubscriptionId != e.SubscriptionIdNullValue() && (e.SubscriptionId < e.SubscriptionIdMinValue() || e.SubscriptionId > e.SubscriptionIdMaxValue()) {
			return fmt.Errorf("Range check failed on e.SubscriptionId (%v < %v > %v)", e.SubscriptionIdMinValue(), e.SubscriptionId, e.SubscriptionIdMaxValue())
		}
	}
	return nil
}

func EventStreamTerminatedEventInit(e *EventStreamTerminatedEvent) {
	e.SubscriptionId = math.MaxUint16
	return
}

func (*EventStreamTerminatedEvent) SbeBlockLength() (blockLength uint16) {
	return 10
}

func (*EventStreamTerminatedEvent) SbeTemplateId() (templateId uint16) {
	return 602
}

func (*EventStreamTerminatedEvent) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*EventStreamTerminatedEvent) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*EventStreamTerminatedEvent) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*EventStreamTerminatedEvent) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*EventStreamTerminatedEvent) EventTimeId() uint16 {
	return 1
}

func (*EventStreamTerminatedEvent) EventTimeSinceVersion() uint16 {
	return 0
}

func (e *EventStreamTerminatedEvent) EventTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.EventTimeSinceVersion()
}

func (*EventStreamTerminatedEvent) EventTimeDeprecated() uint16 {
	return 0
}

func (*EventStreamTerminatedEvent) EventTimeMetaAttribute(meta int) string {
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

func (*EventStreamTerminatedEvent) EventTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*EventStreamTerminatedEvent) EventTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*EventStreamTerminatedEvent) EventTimeNullValue() int64 {
	return math.MinInt64
}

func (*EventStreamTerminatedEvent) SubscriptionIdId() uint16 {
	return 2
}

func (*EventStreamTerminatedEvent) SubscriptionIdSinceVersion() uint16 {
	return 1
}

func (e *EventStreamTerminatedEvent) SubscriptionIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.SubscriptionIdSinceVersion()
}

func (*EventStreamTerminatedEvent) SubscriptionIdDeprecated() uint16 {
	return 0
}

func (*EventStreamTerminatedEvent) SubscriptionIdMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "optional"
	}
	return ""
}

func (*EventStreamTerminatedEvent) SubscriptionIdMinValue() uint16 {
	return 0
}

func (*EventStreamTerminatedEvent) SubscriptionIdMaxValue() uint16 {
	return math.MaxUint16 - 1
}

func (*EventStreamTerminatedEvent) SubscriptionIdNullValue() uint16 {
	return math.MaxUint16
}
