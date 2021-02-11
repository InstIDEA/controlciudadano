package main

import (
	"bufio"
	"fmt"
	"io"
	"os"
	"strings"

	"code.sajari.com/docconv"

	"github.com/gvso/ddjj/parser/declaration"
	"github.com/gvso/ddjj/parser/extract"
)

func handleSingleFile(filePath string) {
	dat, err := os.Open(filePath)
	if err == nil {
		dec, err := extractPDF(dat)
		if err != nil {
			s := fmt.Sprint("Failed to process file", filePath, ": ", err)
			extract.ParserMessage(s)
			return
		}
		extract.ParserData(dec)
	} else {
		s := fmt.Sprint("File ", filePath, " not found. ", err)
		extract.ParserMessage(s)
	}
}

func main() {
	if len(os.Args) <= 1 {
		extract.ParserMessage("Missing file path")
		return
	}
    handleSingleFile(os.Args[1])
	extract.ParserPrint()
}

func extractPDF(file io.Reader) (*declaration.Declaration, error) {
	res, err := docconv.Convert(file, "application/pdf", true)
	if err != nil {
		extract.ParserMessage(err.Error())
		return nil, err
	}

	extract.ParserRawData(res.Body)

	body := &res.Body
	d := &declaration.Declaration { }

	// Basic Info.
	scanner := bufio.NewScanner(strings.NewReader(res.Body))
	d.Fecha = extract.Date(scanner)

	scanner = bufio.NewScanner(strings.NewReader(res.Body))
	d.Cedula = extract.Cedula(scanner)

	scanner = bufio.NewScanner(strings.NewReader(res.Body))
	d.Nombre = extract.Name(scanner)

	scanner = bufio.NewScanner(strings.NewReader(res.Body))
	d.Apellido = extract.Lastname(scanner)

	scanner = bufio.NewScanner(strings.NewReader(res.Body))
	d.Institucion = extract.Institution(scanner)

	scanner = bufio.NewScanner(strings.NewReader(res.Body))
	d.Cargo = extract.JobTitle(scanner)

	// Deposits
	scanner = bufio.NewScanner(strings.NewReader(res.Body))
	d.Deposits = extract.Deposits(scanner)

	// Debtors.
	scanner = bufio.NewScanner(strings.NewReader(res.Body))
	d.Debtors = extract.Debtors(scanner)

	// Real state.
	scanner = bufio.NewScanner(strings.NewReader(res.Body))
	d.RealStates = extract.RealStates(scanner)

	// Vehicles
	scanner = bufio.NewScanner(strings.NewReader(res.Body))
	d.Vehicles = extract.Vehicles(scanner)

	// Agricultural activity
	scanner = bufio.NewScanner(strings.NewReader(res.Body))
	d.Agricultural = extract.Agricultural(scanner)

	// Furniture
	scanner = bufio.NewScanner(strings.NewReader(res.Body))
	d.Furniture = extract.Furniture(scanner)

	// Other assets
	scanner = bufio.NewScanner(strings.NewReader(res.Body))
	d.OtherAssets = extract.Assets(scanner)

	// Debts
	scanner = bufio.NewScanner(strings.NewReader(res.Body))
	d.Debts = extract.Debts(scanner)

	// Income and Expenses
	scanner = bufio.NewScanner(strings.NewReader(res.Body))
	d.IncomeMonthly = extract.MonthlyIncome(scanner)

	scanner = bufio.NewScanner(strings.NewReader(res.Body))
	d.IncomeAnnual = extract.AnnualIncome(scanner)

	scanner = bufio.NewScanner(strings.NewReader(res.Body))
	d.ExpensesMonthly = extract.MonthlyExpenses(scanner)

	scanner = bufio.NewScanner(strings.NewReader(res.Body))
	d.ExpensesAnnual = extract.AnnualExpenses(scanner)

	// Summary
	d.Resumen = extract.GetSummary(body)

	d.CalculatePatrimony()

	if d.Assets != d.Resumen.TotalActivo {
		extract.ParserMessage("calculated assets and summary assets does not match")
	}

	if d.Liabilities != d.Resumen.TotalPasivo {
		extract.ParserMessage("calculated liabilities and summary liabilities does not match")
	}

	if d.NetPatrimony != d.Resumen.PatrimonioNeto {
		extract.ParserMessage("calculated net patrimony and summary net patrimony does not match")
	}

	return d, nil
}