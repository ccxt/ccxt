package main

import (
	"encoding/json"
	"os"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func TestAPIParser(t *testing.T) {
	Convey("Setup apiparser", t, func() {
		p := Parser{
			Lang: GO,
		}
		p.FuncMap = FuncMap(&p)
		f, err := os.Open("test.json")
		So(err, ShouldBeNil)
		defer f.Close()
		err = json.NewDecoder(f).Decode(&p.Info)
		So(err, ShouldBeNil)
		Convey("Parse go file", func() {
			err = p.Transcribe("../api.txt")
			So(err, ShouldBeNil)
		})
		Convey("Parse go test file", func() {
			err = p.Transcribe("../api_test.txt")
			So(err, ShouldBeNil)
		})
		Convey("Parse ts file", func() {
			p.Lang = TS
			err = p.Transcribe("../api.txt")
			So(err, ShouldBeNil)
		})
		Convey("Parse ts test file", func() {
			p.Lang = TS
			err = p.Transcribe("../api_test.txt")
			So(err, ShouldBeNil)
		})
		Reset(func() {
			err := os.RemoveAll("../bitmex")
			if err != nil {
				t.Fatal(err)
			}
		})
	})
}
