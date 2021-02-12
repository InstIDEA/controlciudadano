package extract

import (
	"bufio"
	"strconv"
	"strings"

	"github.com/gvso/ddjj/parser/declaration"
)

var stateTwoLines = []string{
	"EXPLOTACION",
	"TERRENO SIN",
	"EDIFICACIONES",
	"EDIFICACION PARA",
	"ADJUDICACION SEGUN",
}

var totalState int64

var stateItemNumber int

var skipState = []string{
	"#",
	"Nº FINCA",
	"DATOS PROTEGIDOS",
	"PAÍS:",
	"CTA. CTE. CTRAL. O PADRON",
	"USO",
	"DISTRITO:",
	"SUP. M2",
	"AÑO DE ADQ.",
	"VALOR CONST. G.",
	"CONST.",
	"VALOR TERRENO G.",
	"TIPO DE ADQ.:",
	"IMPORTE",
}

// RealStates returns the real states owned by the official.
func RealStates(scanner *bufio.Scanner) []*declaration.RealState {

	scanner = MoveUntil(scanner, "1.4 INMUEBLES", true)
	var states []*declaration.RealState

	values := [11]string{}
	index := 0
	stateItemNumber = 1

	// Also wants to skip item number
	skipState = append(skipState, strconv.Itoa(stateItemNumber))

	line, _ := getStateLine(scanner)
	for line != "" {

		values[index] = line

		// After reading all the possible values for a single item.
		if index == 10 {
			state := getState(scanner, values)

			states = append(states, state...)

			// Skip the next item number.
			stateItemNumber++
			skipState[len(skipState)-1] = strconv.Itoa(stateItemNumber)

			index = -1
		}

		index++

		line, _ = getStateLine(scanner)
	}

	total := addRealState(states)
	if total == 0 {
		ParserMessage("failed when extracting states")
		return nil
	}

	if total != totalState {
		ParserMessage("real states do not match")
	}

	// Reset variables for next call.
	totalState = 0
	stateItemNumber = 0

	return states
}

func getState(scanner *bufio.Scanner, values [11]string) []*declaration.RealState {

	// Casos 1, 4, 5.
	if isCountry(values[0]) {
		// En el caso 1, el valor en el último index es el tipo de adquisición.
		if !isNumber(values[10]) {
			return getState1(values)
		}

		value12, _ := getStateLine(scanner)

		// Caso 4.
		if isNumber(value12) {
			return getState4(values, value12, scanner)
		}

		// Caso 5.
		return getState5(values, value12, scanner)
	}

	// Caso 2.
	if isNumber(values[3]) {
		return getState2(values)
	}

	return getState3(values)
}

func getState1(values [11]string) []*declaration.RealState {
	return []*declaration.RealState{
		{
			Pais:                   values[0],
			Padron:                 values[1],
			Uso:                    values[2],
			Distrito:               values[3],
			SuperficieTerreno:      stringToInt64(values[4]),
			ValorTerreno:           stringToInt64(values[5]),
			Adquisicion:            stringToYear(values[6]),
			SuperficieConstruccion: stringToInt64(values[7]),
			ValorConstruccion:      stringToInt64(values[8]),
			Importe:                stringToInt64(values[9]),
			TipoAdquisicion:        values[10],
		},
	}
}

func getState2(values [11]string) []*declaration.RealState {
	return []*declaration.RealState{
		{
			Padron:                 values[0],
			Uso:                    values[1],
			SuperficieTerreno:      stringToInt64(values[2]),
			ValorTerreno:           stringToInt64(values[3]),
			Pais:                   values[4],
			Distrito:               values[5],
			Adquisicion:            stringToYear(values[6]),
			SuperficieConstruccion: stringToInt64(values[7]),
			ValorConstruccion:      stringToInt64(values[8]),
			Importe:                stringToInt64(values[9]),
			TipoAdquisicion:        values[10],
		},
	}
}

func getState3(values [11]string) []*declaration.RealState {
	return []*declaration.RealState{
		{
			Padron:                 values[0],
			Uso:                    values[1],
			Pais:                   values[2],
			Distrito:               values[3],
			SuperficieTerreno:      stringToInt64(values[4]),
			ValorTerreno:           stringToInt64(values[5]),
			Adquisicion:            stringToYear(values[6]),
			SuperficieConstruccion: stringToInt64(values[7]),
			ValorConstruccion:      stringToInt64(values[8]),
			Importe:                stringToInt64(values[9]),
			TipoAdquisicion:        values[10],
		},
	}
}

func getState4(values [11]string, nextImporte string, scanner *bufio.Scanner) []*declaration.RealState {
	state1 := &declaration.RealState{
		Pais:                   values[0],
		Padron:                 values[1],
		Uso:                    values[2],
		Distrito:               values[3],
		SuperficieTerreno:      stringToInt64(values[4]),
		ValorTerreno:           stringToInt64(values[5]),
		Adquisicion:            stringToYear(values[6]),
		SuperficieConstruccion: stringToInt64(values[7]),
		ValorConstruccion:      stringToInt64(values[8]),
		Importe:                stringToInt64(values[9]),
		// TipoAdquisicion is the 13th value.
	}

	// Skip the next item number.
	stateItemNumber++
	skipState[len(skipState)-1] = strconv.Itoa(stateItemNumber)

	// Retrieve the 10 values missing from the next item.
	need := 10
	otherValues := [10]string{}
	for need > 0 {
		line, _ := getStateLine(scanner)
		otherValues[10-need] = line
		need--
	}

	// 11 regular values + 1 extra value. The type is in the 13th value, so index 0.
	state1.TipoAdquisicion = otherValues[0]

	state2 := &declaration.RealState{
		ValorConstruccion:      stringToInt64(values[10]),
		Importe:                stringToInt64(nextImporte),
		Pais:                   otherValues[1],
		Padron:                 otherValues[2],
		Uso:                    otherValues[3],
		Distrito:               otherValues[4],
		SuperficieTerreno:      stringToInt64(otherValues[5]),
		ValorTerreno:           stringToInt64(otherValues[6]),
		Adquisicion:            stringToYear(otherValues[7]),
		SuperficieConstruccion: stringToInt64(otherValues[8]),
		TipoAdquisicion:        otherValues[9],
	}

	return []*declaration.RealState{state1, state2}
}

func getState5(values [11]string, tipoAdq string, scanner *bufio.Scanner) []*declaration.RealState {
	state1 := &declaration.RealState{
		Pais:              values[0],
		Padron:            values[1],
		Uso:               values[2],
		Distrito:          values[3],
		SuperficieTerreno: stringToInt64(values[4]),
		ValorTerreno:      stringToInt64(values[5]),
		Adquisicion:       stringToYear(values[6]),
		// Adquisicion of the next item is values[7]
		SuperficieConstruccion: stringToInt64(values[8]),
		ValorConstruccion:      stringToInt64(values[9]),
		Importe:                stringToInt64(values[10]),
		TipoAdquisicion:        tipoAdq,
	}

	// Skip the next item number.
	stateItemNumber++
	skipState[len(skipState)-1] = strconv.Itoa(stateItemNumber)

	// Retrieve the 10 values missing from the next item.
	need := 10
	otherValues := [10]string{}
	for need > 0 {
		line, _ := getStateLine(scanner)
		otherValues[10-need] = line
		need--
	}

	state2 := &declaration.RealState{
		Adquisicion:            stringToYear(values[7]),
		Pais:                   otherValues[0],
		Padron:                 otherValues[1],
		Uso:                    otherValues[2],
		Distrito:               otherValues[3],
		SuperficieTerreno:      stringToInt64(otherValues[4]),
		ValorTerreno:           stringToInt64(otherValues[5]),
		SuperficieConstruccion: stringToInt64(otherValues[6]),
		ValorConstruccion:      stringToInt64(otherValues[7]),
		Importe:                stringToInt64(otherValues[8]),
		TipoAdquisicion:        otherValues[9],
	}

	return []*declaration.RealState{state1, state2}
}

func getStateLine(scanner *bufio.Scanner) (line string, nextPage bool) {
	for scanner.Scan() {
		line = scanner.Text()

		// Stop looking for real state when this is found.
		if line == "TOTAL INMUEBLES:" {
			totalState = getTotalInCategory(scanner)

			// Next page or end.
			scanner = MoveUntil(scanner, "Nº FINCA", true)
			line = scanner.Text()
			nextPage = true

			stateItemNumber = 1
			skipState[len(skipState)-1] = strconv.Itoa(stateItemNumber)
		}

		if contains(stateTwoLines, line) {
			nextLine, _ := getStateLine(scanner)
			line += " " + nextLine
		}

		if strings.Contains(line, "OBS:") || strings.Contains(line, "RECEPCIONADO EL:") {
			continue
		}
		if isDate(line) || isBarCode(line) {
			continue
		}
		if line == "" || contains(skipState, line) {
			continue
		}

		return line, nextPage
	}

	return "", false
}

func addRealState(states []*declaration.RealState) int64 {
	var total int64
	for _, d := range states {
		total += d.Importe
	}

	return total
}
