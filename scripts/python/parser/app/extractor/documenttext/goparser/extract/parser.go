package extract

import (
	"fmt"
	"encoding/json"
	"github.com/gvso/ddjj/parser/declaration"
)

type parserData struct {
	Message	[]string					`json:"message"`
	Status	int							`json:"status"`
	Data	*declaration.Declaration	`json:"data"`
	Raw		[]string					`json:"raw"`
}

type ExpectedValue int
const (
    EVdate ExpectedValue = iota
	EValphaNum
	EVnum
)

var parser parserData

func ParserMessage(msg string) {
	parser.Message = append(parser.Message, msg)
}

func ParserStatus(code int) {
	parser.Status = code
}

func ParserData(d *declaration.Declaration) {
	parser.Data = d
}

func ParserRawData(s string) {
	parser.Raw = append(parser.Raw, s)
}

func ParserPrint() {
	parser.Status = 1
	b, err := json.MarshalIndent(parser, "", "\t")
	if err != nil {
		fmt.Println("{ message: null, status: 0, data: null, raw: null }")
		return
	}
	fmt.Println(string(b))
}