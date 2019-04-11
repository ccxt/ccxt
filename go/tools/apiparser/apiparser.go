package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"path"
	"regexp"
	"strings"
	"text/template"

	"github.com/ccxt/ccxt/go/pkg/ccxt"
)

// apiToFuncName converts the URL endpoint to a go func name
func apiToFuncName(m string) string {
	x := strings.ReplaceAll(m, "/", " ")
	x = strings.Title(x)
	x = strings.ReplaceAll(x, " ", "")
	return x
}

// apiResult takes the endpoint val and links to the appropriate data type
func apiResult(s string) string {
	re := regexp.MustCompile(`^(string|float|int)`)
	if re.Match([]byte(s)) {
		return s
	}
	if strings.Contains(s, "[]") {
		s = strings.TrimLeft(s, "[]")
		s = "[]models." + s
	} else {
		s = "models." + s
	}
	return s
}

func apiResultTest(s string) string {
	if strings.Contains(s, "[]") {
		return "data == nil"
	}
	re := regexp.MustCompile(`^(string|float|int)`)
	if re.Match([]byte(s)) {
		switch s {
		case "string":
			return "data == \"\""
		case "float64":
			return "data == 0.0"
		case "int64":
			return "data == 0"
		case "interface{}":
			return "data == nil"
		}
	}
	return fmt.Sprintf("reflect.DeepEqual(data, (models.%s{}))", s)
}

// ParseAPITemplate print template for exchange APIs
func ParseAPITemplate(info ccxt.ExchangeInfo, dir string, file string, buildTest *bool) error {
	funcMap := template.FuncMap{
		"apiToFuncName": apiToFuncName,
		"apiResult":     apiResult,
		"apiResultTest": apiResultTest,
		"title":         strings.Title,
	}
	tmplName := file
	if *buildTest {
		tmplName += "_test"
	}
	tmplName += ".txt"
	tmplPath := path.Join(dir, "../", tmplName)
	tmpl, err := template.New(tmplName).Funcs(funcMap).ParseFiles(tmplPath)
	if err != nil {
		return fmt.Errorf("Unable to parse %s\n%v", tmplPath, err)
	}
	goName := strings.TrimPrefix(file, "tmpl_")
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
			err = ParseAPITemplate(info, exchangePath, "tmpl_exchange", buildTest)
			if err != nil {
				panic(err)
			}
			err = ParseAPITemplate(info, exchangePath, "tmpl_api", buildTest)
			if err != nil {
				panic(err)
			}
		}
	}
}
