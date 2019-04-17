package main

import (
	"bytes"
	"fmt"
	"go/format"
	"os"
	"path"
	"strings"
	"text/template"

	"github.com/ccxt/ccxt/go/pkg/ccxt"
)

// Language enum
const (
	GO = iota
	TS
	JS
	PYTHON
	PHP
)

// Parser for building language files
type Parser struct {
	Lang    int
	Test    bool
	Info    ccxt.ExchangeInfo
	FuncMap template.FuncMap
}

// ParserData sends data for the template engine
type ParserData struct {
	Info ccxt.ExchangeInfo
	Lang int
}

// Transcribe template for set language
func (p *Parser) Transcribe(filepath string) error {
	if !p.Test && strings.Contains(filepath, "_test") {
		return nil
	}
	fmt.Println(filepath)
	tmpl, err := template.New(path.Base(filepath)).Funcs(p.FuncMap).ParseFiles(filepath)
	if err != nil {
		return err
	}
	var outFile string
	switch p.Lang {
	case GO:
		outFile = strings.Replace(filepath, "templates", "go", 1)
		outFile = strings.Replace(outFile, ".txt", ".go", 1)
	case TS:
		outFile = strings.Replace(filepath, "templates", "ts", 1)
		outFile = strings.Replace(outFile, ".txt", ".ts", 1)
	case JS:
		outFile = strings.Replace(filepath, "templates", "js", 1)
		outFile = strings.Replace(outFile, ".txt", ".js", 1)
	case PYTHON:
		outFile = strings.Replace(filepath, "templates", "python", 1)
		outFile = strings.Replace(outFile, ".txt", ".py", 1)
	case PHP:
		outFile = strings.Replace(filepath, "templates", "php", 1)
		outFile = strings.Replace(outFile, ".txt", ".php", 1)
	}
	if !strings.Contains(outFile, p.Info.ID) {
		filename := path.Base(outFile)
		outFile = strings.Replace(outFile,
			filename,
			p.Info.ID+"/"+filename, 1)
	}
	outDir := path.Dir(outFile)
	if _, err := os.Stat(outDir); os.IsNotExist(err) {
		os.MkdirAll(outDir, os.ModePerm)
	}
	output, err := os.Create(outFile)
	if err != nil {
		return err
	}
	defer output.Close()
	data := ParserData{
		Info: p.Info,
		Lang: p.Lang,
	}
	// use gofmt if the output is *.go
	if p.Lang == GO {
		src := new(bytes.Buffer)
		err = tmpl.Execute(src, data)
		if err != nil {
			return err
		}
		srcFormatted, err := format.Source(src.Bytes())
		if err != nil {
			return err
		}
		_, err = output.Write(srcFormatted)
		if err != nil {
			return err
		}
	} else {
		err = tmpl.Execute(output, data)
		if err != nil {
			return err
		}
	}
	return nil
}
