package main

import (
	"fmt"
	"regexp"
	"strings"
	"text/template"
)

// FuncMap retunrs a map of functions for the template engine
func FuncMap(p *Parser) template.FuncMap {
	return template.FuncMap{
		"apiToFuncName": p.apiToFuncName,
		"typeConv":      p.typeConv,
		"apiResultTest": apiResultTest,
		"title":         strings.Title,
		"apiFunc":       p.apiFunc,
		"codeLang":      p.codeLang,
		"typeInit":      p.typeInit,
		"typeMethod":    p.typeMethod,
	}
}

func (p *Parser) typeInit(name string) string {
	switch p.Lang {
	case GO:
		return fmt.Sprintf("type %s struct {", name)
	case TS:
		return fmt.Sprintf("interface %s {", name)
	default:
		return ""
	}
}

func (p *Parser) typeMethod(name string, res string) string {
	switch p.Lang {
	case GO:
		goName := strings.Title(name)
		switch goName {
		case "Ip":
			goName = "IP"
		case "Ttl":
			goName = "TTL"
		}
		if strings.Contains(goName, "Id") {
			goName = strings.ReplaceAll(goName, "Id", "ID")
		}
		return fmt.Sprintf("%s %s `json:\"%s\"`",
			goName,
			p.typeConv(res),
			name)
	case TS:
		return fmt.Sprintf("%s: %s;", name, p.typeConv(res))
	default:
		return ""
	}
}

func (p *Parser) codeLang(lang int) bool {
	if p.Lang == lang {
		return true
	}
	return false
}

func (p *Parser) apiFunc(baseName string, endpoint string, output string) string {
	funcName := baseName + p.apiToFuncName(endpoint)
	comment := fmt.Sprintf("// %s%s method for /%s\n",
		baseName, funcName, endpoint)
	body := ""
	addBody := false
	var method string
	switch {
	case strings.Contains(baseName, "Get"):
		method = "GET"
	case strings.Contains(baseName, "Post"):
		method = "POST"
		addBody = true
	case strings.Contains(baseName, "Put"):
		method = "PUT"
		addBody = true
	case strings.Contains(baseName, "Delete"):
		method = "DELETE"
	}
	if strings.Contains(baseName, "Post") || strings.Contains(baseName, "Put") {
		addBody = true
	}
	switch p.Lang {
	case GO:
		apiRequestBody := "bytes.Buffer{}"
		if addBody {
			body = ", body bytes.Buffer"
			apiRequestBody = "body"
		}
		return fmt.Sprintf(`%sfunc (c *%sExchange) %s(params *url.Values%s) (data %s, err error) {
	reqURL := c.parseEndpoint("%s")
	res, err := c.apiRequest("%s", reqURL, params, %s)
	if err != nil {
		return data, err
	}
	err = json.Unmarshal(res, &data)
	if err != nil {
		return data, handleBodyErr(res, err)
	}
	return data, nil
}`,
			comment,
			p.Info.ID,
			funcName,
			body,
			p.typeConv(output),
			endpoint,
			method,
			apiRequestBody)
	case TS:
		apiRequestBody := "{}"
		if addBody {
			body = ", body: Object"
			apiRequestBody = "body"
		}
		return fmt.Sprintf(`%sasync %s(params: Object%s): Promise<%s> {
	const reqUrl = this.parseEndpoint('%s');
	try {
		const res = await this.apiRequest('%s', reqUrl, params, %s);
		return res.data;
	} catch (e) {
		throw e;
	}
}`,
			comment,
			funcName,
			body,
			p.typeConv(output),
			endpoint,
			method,
			apiRequestBody)
	default:
		return ""
	}
}

// apiToFuncName converts the URL endpoint to a go func name
func (p *Parser) apiToFuncName(m string) string {
	x := strings.ReplaceAll(m, "/", " ")
	switch p.Lang {
	default:
		x = strings.Title(x)
	}
	x = strings.ReplaceAll(x, " ", "")
	return x
}

// typeConv takes the type string and converts for the appropriate language
func (p *Parser) typeConv(s string) string {
	array := false
	if strings.Contains(s, "[]") {
		array = true
		s = strings.TrimLeft(s, "[]")
	}
	// Pick up non-base lib types
	re := regexp.MustCompile(`(^[A-Z]|[^\.A-Z][A-Z])`)
	if re.Match([]byte(s)) {
		s = "models." + s
	}
	if strings.Contains(s, "interface{}") {
		switch p.Lang {
		case TS:
			s = strings.ReplaceAll(s, "interface{}", "Object")
		}
	}
	if strings.Contains(s, "time.Time") {
		switch p.Lang {
		case TS:
			s = strings.ReplaceAll(s, "time.Time", "Date")
		}
	}
	if strings.Contains(s, "bool") {
		switch p.Lang {
		case TS:
			s = strings.ReplaceAll(s, "bool", "boolean")
		}
	}
	if strings.Contains(s, "map[string]") {
		switch p.Lang {
		case TS:
			s = "Object"
		}
	} else {
		re = regexp.MustCompile(`(float64|float32|int64|int32)`)
		switch p.Lang {
		case TS:
			s = re.ReplaceAllString(s, "number")
		}
	}
	if array {
		switch p.Lang {
		case GO:
			s = "[]" + s
		case TS:
			s = s + "[]"
		}
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
