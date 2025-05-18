<?php

class Voucher {
    public $code;
    public $value;
    public $expiry;
    public $status;

    public function __construct($code, $value, $expiry, $status = 'aktiv') {
        $this->code = $code;
        $this->value = $value;
        $this->expiry = $expiry;
        $this->status = $status;
    }

    public function isExpired() {
        return strtotime($this->expiry) < time();
    }

    public function toArray() {
        return [
            'code' => $this->code,
            'value' => $this->value,
            'expiry' => $this->expiry,
            'status' => $this->status
        ];
    }
}
