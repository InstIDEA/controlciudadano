package extract

import (
	"bufio"
	"strconv"
	"strings"

	"github.com/gvso/ddjj/parser/declaration"
)

var totalFurniture int64

var furnitureItemNumber int

var skipFurniture = []string{
	"#",
	"TIPO MUEBLES",
	"IMPORTE",
}

// Furniture returns the furniture owned by the official.
func Furniture(scanner *bufio.Scanner) []*declaration.Furniture {

	scanner = MoveUntil(scanner, "TIPO MUEBLES", true)
	var furniture []*declaration.Furniture

	values := [2]string{}
	index := 0
	furnitureItemNumber = 1

	// Also wants to skip item number
	skipFurniture = append(skipFurniture, strconv.Itoa(furnitureItemNumber))

	line, _ := getFurnitureLine(scanner)
	for line != "" {

		values[index] = line

		// After reading all the possible values for a single item.
		if index == 1 {
			furnishing := getFurnishing(values)

			furniture = append(furniture, furnishing)

			// Skip the next item number.
			furnitureItemNumber++
			skipFurniture[len(skipFurniture)-1] = strconv.Itoa(furnitureItemNumber)

			index = -1
		}

		index++

		//var nextPage bool
		line, _ = getFurnitureLine(scanner)
	}

	total := addFurniture(furniture)
	if total == 0 {
		ParserMessage("failed when extracting furniture")
		return nil
	}

	if total != totalFurniture {
		ParserMessage("furniture do not match")
	}

	// Reset variables for next call.
	totalFurniture = 0
	furnitureItemNumber = 0

	return furniture
}

func getFurnishing(values [2]string) *declaration.Furniture {
	return &declaration.Furniture{
		Tipo:    values[0],
		Importe: stringToInt64(values[1]),
	}
}

func getFurnitureLine(scanner *bufio.Scanner) (line string, nextPage bool) {
	for scanner.Scan() {
		line = scanner.Text()

		// Stop looking for furniture when this is found.
		if line == "TOTAL MUEBLES:" {
			totalFurniture = getTotalInCategory(scanner)

			// Next page or end.
			scanner = MoveUntil(scanner, "TIPO MUEBLES", true)
			line = scanner.Text()
			nextPage = true

			furnitureItemNumber = 1
			skipFurniture[len(skipFurniture)-1] = strconv.Itoa(furnitureItemNumber)
		}

		if strings.Contains(line, "OBS:") || strings.Contains(line, "RECEPCIONADO EL:") {
			continue
		}
		if isDate(line) || isBarCode(line) {
			continue
		}
		if line == "" || contains(skipFurniture, line) {
			continue
		}

		return line, nextPage
	}

	return "", false
}

func addFurniture(furnishings []*declaration.Furniture) int64 {
	var total int64
	for _, f := range furnishings {
		total += f.Importe
	}

	return total
}
