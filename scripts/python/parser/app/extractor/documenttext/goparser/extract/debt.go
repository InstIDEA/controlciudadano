package extract

import (
	"bufio"
	"strconv"
	"strings"

	"github.com/gvso/ddjj/parser/declaration"
)

var totalDebt int64

var debtItemNumber int

var skipDebt = []string{
	"#",
	"TIPO DEUDA",
	"EMPRESA",
	"PLAZO",
	"CUOTA MENSUAL",
	"TOTAL DEUDA",
	"SALDO DEUDA",
}

// Debts returns money the official owes.
func Debts(scanner *bufio.Scanner) []*declaration.Debt {

	scanner = MoveUntil(scanner, "2.1 TIPOS DE DEUDAS", true)

	// Also wants to skip item number
	debtItemNumber = 1
	skipDebt = append(skipDebt, strconv.Itoa(debtItemNumber))

	var debts []*declaration.Debt

	values, nextPage := getDebtValues(scanner, 0, false)
	for values[0] != "" {
		debt := getDebt(scanner, values)
		debts = append(debts, debt...)

		if nextPage {
			debtItemNumber = 1
		} else {
			debtItemNumber++
		}
		// Also wants to skip item number
		skipDebt[len(skipDebt)-1] = strconv.Itoa(debtItemNumber)

		values, nextPage = getDebtValues(scanner, 0, false)
	}

	total := addDebts(debts)
	if total == 0 {
		ParserMessage("failed when extracting debts")
		return nil
	}

	if total != totalDebt {
		ParserMessage("The amount in debts do not match")
	}

	// Reset variables for next call.
	totalDebt = 0
	debtItemNumber = 0

	return debts
}

func getDebtValues(scanner *bufio.Scanner, index int, remaining bool) (values [6]string, nextPage bool) {
	line, _ := getDebtLine(scanner)
	for line != "" {

		values[index] = line

		// After reading all the possible values for a single item.
		if index == 5 {
			return
		}

		index++

		line, nextPage = getDebtLine(scanner)
	}

	if remaining {
		return
	}

	return [6]string{}, false
}

func getDebt(scanner *bufio.Scanner, values [6]string) []*declaration.Debt {
	// En algunos casos, el importe de la primera deuda está casi al final de la
	// lista. La otra pecuriaridad es que el tipo de deuda de los items 2...n
	// están al final. Por ejemplo: Juan Afara 2014
	// Case 2.
	if !isNumber(values[5]) {
		// En algunos casos, los saldos aparecen, en orden, al final de todos los
		// datos. Por ejemplo: Justo Zacarias 2014
		value7, _ := getStateLine(scanner)
		if !isNumber(value7) {
			return getDebt3(scanner, values, value7)
		}

		return getDebt2(scanner, values, value7)
	}

	return []*declaration.Debt{getDebt1(values)}
}

func getDebt1(values [6]string) *declaration.Debt {
	return &declaration.Debt{
		Tipo:    values[0],
		Empresa: values[1],
		Plazo:   stringToInt(values[2]),
		Cuota:   stringToInt64(values[3]),
		Total:   stringToInt64(values[4]),
		Saldo:   stringToInt64(values[5]),
	}
}

func getDebt2(scanner *bufio.Scanner, values [6]string, value7 string) []*declaration.Debt {
	debts := []*declaration.Debt{}

	firstDebt := getDebt1(values)
	debts = append(debts, firstDebt)

	debtItemNumber++
	skipDebt = append(skipDebt, strconv.Itoa(debtItemNumber))

	// values[5] is the empresa in the second element.
	business := values[5]
	values, _ = getDebtValues(scanner, 3, false)
	values[1] = business
	values[2] = value7
	secondDebt := getDebt1(values)
	debts = append(debts, secondDebt)

	// Skip next item number.
	debtItemNumber++
	skipDebt = append(skipDebt, strconv.Itoa(debtItemNumber))

	counter := 0
	index := 0
	values, nextPage := getDebtValues(scanner, index, true)
	for !isNumber(values[5]) && !nextPage {
		// Shift to the right by 1 and do not get the last value since it's the
		// business for the next item.
		var v [6]string
		for i := index; i < 5; i++ {
			v[i+1] = values[i]
		}
		business = values[5]

		// For iterations 2...n, copy the business extracted in previous iteration.
		if index == 1 {
			values[1] = business
		}

		debts = append(debts, getDebt1(v))

		debtItemNumber++
		skipDebt = append(skipDebt, strconv.Itoa(debtItemNumber))
		counter++

		index = 1
		values, nextPage = getDebtValues(scanner, index, true)
	}

	// Append the last debt.
	var v [6]string
	for i := index; i < 5; i++ {
		v[i+1] = values[i]
	}
	business = values[5]
	if index == 1 {
		values[1] = business
	}
	debts = append(debts, getDebt1(v))
	debtItemNumber++
	skipDebt = append(skipDebt, strconv.Itoa(debtItemNumber))
	counter++

	// Now get the importe for first item and type for items 2...n.
	// values[0] is total deuda which we don't care about.
	// values[1] is the saldo for first item.
	// The rest are the tipo de deuda for 2...n
	values, _ = getDebtValues(scanner, 0, true)
	firstDebt.Saldo = stringToInt64(values[1])
	remaining := len(debts) - 1
	index = 1
	for i := 2; i < 6 && remaining > 0; i++ {
		debts[index].Tipo = values[i]
		remaining--
		index++
	}

	// Get tipo de deudas as many as necessary.
	for remaining > 0 {
		values, _ = getDebtValues(scanner, 0, true)

		for i := 0; i < 6 && remaining > 0; i++ {
			debts[index].Tipo = values[i]
			remaining--
			index++
		}
	}

	// Restore skip debts to default state. The caller would remove the other
	// remaining value.
	skipDebt = skipDebt[:len(skipDebt)-counter-2]
	debtItemNumber = 1

	return debts
}

func getDebt3(scanner *bufio.Scanner, values [6]string, value7 string) []*declaration.Debt {
	debts := []*declaration.Debt{}

	firstDebt := getDebt1(values)
	debts = append(debts, firstDebt)

	// Skip next item number.
	debtItemNumber++
	skipDebt = append(skipDebt, strconv.Itoa(debtItemNumber))

	values2, _ := getDebtValues(scanner, 2, false)
	values2[0] = values[5]
	values2[1] = value7
	secondDebt := getDebt1(values2)
	debts = append(debts, secondDebt)

	// Skip next item number.
	debtItemNumber++
	skipDebt = append(skipDebt, strconv.Itoa(debtItemNumber))

	counter := 0
	var nextTipo string
	values, nextPage := getDebtValues(scanner, 0, true)
	for values[5] != "" && !isNumber(values[5]) && !nextPage {

		if nextTipo != "" {
			values[0] = nextTipo
		}

		nextTipo = values[5]
		debts = append(debts, getDebt1(values))

		debtItemNumber++
		skipDebt = append(skipDebt, strconv.Itoa(debtItemNumber))
		counter++

		values, nextPage = getDebtValues(scanner, 1, true)
	}

	// values[0] is total deuda.
	firstDebt.Saldo = stringToInt64(values[1])
	secondDebt.Saldo = stringToInt64(values[2])
	index := 2

	values, _ = getDebtValues(scanner, 0, true)
	for i := 2; i < len(values); i++ {
		if values[i] == "" {
			break
		}

		debts[index].Saldo = StringToInt64(values[i])
		index++
		if i == len(values)-1 {
			values, _ = getDebtValues(scanner, 0, true)
			i = 0
		}
	}

	// Restore skip debts to default state. The caller would remove the other
	// remaining value.
	skipDebt = skipDebt[:len(skipDebt)-counter-2]
	debtItemNumber = 1

	return debts
}

func getDebtLine(scanner *bufio.Scanner) (line string, nextPage bool) {
	for scanner.Scan() {
		line = scanner.Text()

		// Stop looking for debts when this is found.
		if line == "TOTALES" {
			totalDebt = getTotalInCategory(scanner)

			// Next page or end.
			scanner = MoveUntil(scanner, "TIPO DEUDA", true)
			line = scanner.Text()
			nextPage = true

			debtItemNumber = 1
			skipDebt[len(skipDebt)-1] = strconv.Itoa(debtItemNumber)
		}

		if strings.Contains(line, "OBS:") || strings.Contains(line, "RECEPCIONADO EL:") {
			continue
		}
		if isDate(line) || isBarCode(line) {
			continue
		}
		if line == "" || contains(skipDebt, line) {
			continue
		}

		return line, nextPage
	}

	return "", false
}

func addDebts(debts []*declaration.Debt) int64 {
	var total int64
	for _, d := range debts {
		total += d.Saldo
	}

	return total
}
