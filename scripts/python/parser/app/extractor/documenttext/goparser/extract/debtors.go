package extract

import (
	"bufio"
	"strconv"
	"strings"

	"github.com/gvso/ddjj/parser/declaration"
)

// Debtors returns the debts people have with the official.
func Debtors(scanner *bufio.Scanner) []*declaration.Debtor {
	var skip = []string{
		"#",
		"NOMBRE DEL DEUDOR",
		"CLASE (A LA VISTA O PLAZOS)",
		"PLAZO EN",
		"IMPORTE",
	}

	scanner = MoveUntil(scanner, "1.3 CUENTAS A COBRAR", true)

	var debtors []*declaration.Debtor
	opts := &debtorOpts{
		debtor:  &declaration.Debtor{},
		counter: 0,
	}

	index := 1
	skip = append(skip, strconv.Itoa(index))
	var total int64
	for scanner.Scan() {
		line := scanner.Text()

		// Stop looking for debtors when this is found.
		if line == "TOTAL CUENTAS POR COBRAR:" {
			total = getTotalInCategory(scanner)

			// Next page or end.
			scanner = MoveUntil(scanner, "NOMBRE DEL DEUDOR", true)
			line = scanner.Text()
			if line == "" {
				break
			}

			index = 1
		}

		if strings.Contains(line, "OBS:") {
			continue
		}
		if contains(skip, line) || line == "" {
			if line == strconv.Itoa(index) {
				// Delete the index to avoid confusion with Plazo.
				skip = skip[:len(skip)-1]
			}
			continue
		}

		d := getDebtor(opts, line)
		if d != nil {
			debtors = append(debtors, d)
			opts.counter = -1
			opts.debtor = &declaration.Debtor{}

			// Skip the following item #.
			index++
			skip[len(skip)-1] = strconv.Itoa(index)
		}

		opts.counter++
	}

	totalDebtors := addDebtors(debtors)
	
	if total == 0 {
		ParserMessage("failed when extracting debtors")
		return nil
	}

	if totalDebtors != total {
		ParserMessage("debtors do not match")
	}

	return debtors
}

type debtorOpts struct {
	debtor  *declaration.Debtor
	counter int
}

func getDebtor(opts *debtorOpts, line string) *declaration.Debtor {
	switch opts.counter {
	case 0:
		opts.debtor.Nombre = line
		break
	case 1:
		opts.debtor.Clase = line
		break
	case 2:
		value, _ := strconv.Atoi(line)
		opts.debtor.Plazo = value
		break
	case 3:
		value := strings.ReplaceAll(line, ".", "")
		i, _ := strconv.ParseInt(value, 10, 64)
		opts.debtor.Importe = i
		return opts.debtor
	}

	return nil
}

func addDebtors(debtors []*declaration.Debtor) int64 {
	var total int64
	for _, d := range debtors {
		total += d.Importe
	}

	return total
}
