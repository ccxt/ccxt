package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"path"
	"strings"
	"text/template"

	"github.com/ccxt/ccxt/go/pkg/ccxt"
)

func apiToFuncName(m string) string {
	x := strings.ReplaceAll(m, "/", " ")
	x = strings.Title(x)
	x = strings.ReplaceAll(x, " ", "")
	return x
}

// ParseAPITemplate print template for exchange APIs
func ParseAPITemplate(info ccxt.ExchangeInfo, dir string, buildTest *bool) error {
	funcMap := template.FuncMap{
		"apiToFuncName": apiToFuncName,
		"title":         strings.Title,
	}
	tmplName := "template"
	if *buildTest {
		tmplName += "_test"
	}
	tmplName += ".txt"
	tmplPath := path.Join(dir, "../", tmplName)
	tmpl, err := template.New(tmplName).Funcs(funcMap).ParseFiles(tmplPath)
	if err != nil {
		return fmt.Errorf("Unable to parse %s\n%v", tmplPath, err)
	}
	goName := "api"
	if *buildTest {
		goName += "_test"
	}
	goName += ".go"
	goPath := path.Join(dir, goName)
	output, err := os.Create(goPath)
	if err != nil {
		return fmt.Errorf("Unable to create %s\n%v", goPath, err)
	}
	defer output.Close()
	err = tmpl.Execute(output, info)
	if err != nil {
		return fmt.Errorf("Unable to execute %s\n%v", tmplName, err)
	}
	return nil
}

func main() {
	buildTest := flag.Bool("testfiles", false, "build _test.go files")
	flag.Parse()
	root := "../../internal/app"
	files, err := ioutil.ReadDir(root)
	if err != nil {
		panic(err)
	}
	for _, file := range files {
		if file.IsDir() {
			var info ccxt.ExchangeInfo
			exchangePath := path.Join(root, file.Name())
			configName := fmt.Sprintf("%s.json", file.Name())
			config := path.Join(root, exchangePath, configName)
			f, err := os.Open(config)
			if err != nil {
				panic(err)
			}
			defer f.Close()
			json.NewDecoder(f).Decode(&info)
			err = ParseAPITemplate(info, exchangePath, buildTest)
			if err != nil {
				panic(err)
			}
		}
	}
}
