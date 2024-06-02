<?php
namespace Ratchet\RFC6455\Messaging;

class CloseFrameChecker {
    private $validCloseCodes = [];

    public function __construct() {
        $this->validCloseCodes = [
            Frame::CLOSE_NORMAL,
            Frame::CLOSE_GOING_AWAY,
            Frame::CLOSE_PROTOCOL,
            Frame::CLOSE_BAD_DATA,
            Frame::CLOSE_BAD_PAYLOAD,
            Frame::CLOSE_POLICY,
            Frame::CLOSE_TOO_BIG,
            Frame::CLOSE_MAND_EXT,
            Frame::CLOSE_SRV_ERR,
        ];
    }

    public function __invoke($val) {
        return ($val >= 3000 && $val <= 4999) || in_array($val, $this->validCloseCodes);
    }
}
