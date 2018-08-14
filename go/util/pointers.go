package util

import "time"

func String(v string) *string { return &v }

func Bool(v bool) *bool { return &v }

func Int(v int) *int { return &v }

func Float64(v float64) *float64 { return &v }

func Time(v time.Time) *JSONTime { return JTime(JSONTime(v)) }

func JTime(v JSONTime) *JSONTime { return &v }
