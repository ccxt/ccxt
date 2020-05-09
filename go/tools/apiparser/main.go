package main

import (
	"encoding/json"
	"flag"
	"io/ioutil"
	"os"
	"path"
	"path/filepath"
)

func main() {
	buildTest := flag.Bool("testfiles", false, "build _test.go files")
	// filename := flag.String("name", "", "base template name")
	flag.Parse()
	root := "../../../templates/internal/app"
	files, err := ioutil.ReadDir(root)
	if err != nil {
		panic(err)
	}
	var pkgs map[string][]string
	for _, file := range files {
		if file.IsDir() {
			pkg := file.Name()
			if pkgs == nil {
				pkgs = make(map[string][]string)
			}
			if pkgs[pkg] == nil {
				pkgs[pkg] = make([]string, 0)
			}
		}
	}
	for _, file := range files {
		name := file.Name()
		if filepath.Ext(name) == ".txt" {
			for pkg := range pkgs {
				filename := path.Join(root, name)
				pkgs[pkg] = append(pkgs[pkg], filename)
			}
		}
	}
	for pkg := range pkgs {
		pkgFiles, err := ioutil.ReadDir(path.Join(root, pkg))
		if err != nil {
			panic(err)
		}
		for _, pkgFile := range pkgFiles {
			name := pkgFile.Name()
			if pkgFile.IsDir() && name == "models" {
				modelFiles, err := ioutil.ReadDir(path.Join(root, pkg, "models"))
				if err != nil {
					panic(err)
				}
				for _, modelFile := range modelFiles {
					name := modelFile.Name()
					if filepath.Ext(name) == ".txt" {
						filename := path.Join(root, pkg, "models/", name)
						pkgs[pkg] = append(pkgs[pkg], filename)
					}
				}
			}
			if filepath.Ext(name) == ".txt" {
				filename := path.Join(root, pkg, name)
				pkgs[pkg] = append(pkgs[pkg], filename)
			}
		}
	}
	for pkg, files := range pkgs {
		p := Parser{
			Lang: TS,
			Test: *buildTest,
		}
		p.FuncMap = FuncMap(&p)

		config := path.Join(root, pkg, pkg+".json")
		f, err := os.Open(config)
		if err != nil {
			panic(err)
		}
		err = json.NewDecoder(f).Decode(&p.Info)
		if err != nil {
			panic(err)
		}
		f.Close()
		for _, file := range files {
			filepath := path.Join(root, file)
			err = p.Transcribe(filepath)
			if err != nil {
				panic(err)
			}
		}
	}
}
