package util

import "time"

// String returns the string pointer
func String(v string) *string { return &v }

// Bool returns the bool pointer
func Bool(v bool) *bool { return &v }

// Int returns the int pointer
func Int(v int) *int { return &v }

// Float64 returns the float64 pointer
func Float64(v float64) *float64 { return &v }

// Time returns the JSONTime pointer
func Time(v time.Time) *JSONTime { return JTime(JSONTime(v)) }

// JTime returns the JSONTime pointer
func JTime(v JSONTime) *JSONTime { return &v }
