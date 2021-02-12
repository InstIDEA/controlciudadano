package extract

import (
	"bufio"
	"strconv"
	"strings"

	"github.com/gvso/ddjj/parser/declaration"
)

// Agricultural returns the agricultural activity of the official.
func Agricultural(scanner *bufio.Scanner) []*declaration.Agricultural {
	var skip = []string{
		"#",
		"TIPO ACTIVIDAD",
		"UBICACION ACTIVIDAD",
		"RAZA/TIPO PLANTACIÓN",
		"CANT. Ha.",
		"PRECIO",
		"IMPORTE",
	}

	scanner = MoveUntil(scanner, "1.7 ACTIVIDAD AGROPECUARIA", true)

	var activities []*declaration.Agricultural
	opts := &activityOpts{
		activity: &declaration.Agricultural{},
		counter:  0,
	}

	index := 1
	skip = append(skip, strconv.Itoa(index))
	var total int64
	for scanner.Scan() {
		line := scanner.Text()

		// Stop looking for debtors when this is found.
		if line == "TOTAL ACTIVIDAD AGROPECUARIA:" {
			total = getTotalInCategory(scanner)

			// Next page or end.
			scanner = MoveUntil(scanner, "TIPO ACTIVIDAD", true)
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

		a := getAgricultural(opts, line)
		if a != nil {
			activities = append(activities, a)
			opts.counter = -1
			opts.activity = &declaration.Agricultural{}

			// Skip the following item #.
			index++
			skip[len(skip)-1] = strconv.Itoa(index)
		}

		opts.counter++
	}

	totalAgricultural := addAgricultural(activities)
	if total == 0 {
		ParserMessage("failed when extracting agricultural activities")
		return nil
	}

	if totalAgricultural != total {
		ParserMessage("agricultural activities do not match")
	}

	return activities
}

type activityOpts struct {
	activity *declaration.Agricultural
	counter  int
}

func getAgricultural(opts *activityOpts, line string) *declaration.Agricultural {
	switch opts.counter {
	case 0:
		opts.activity.Tipo = line
		break
	case 1:
		opts.activity.Ubicacion = line
		break
	case 2:
		opts.activity.Especie = line
		break
	case 3:
		opts.activity.Cantidad = stringToInt64(line)
		break
	case 4:
		opts.activity.Precio = stringToInt64(line)
		break
	case 5:
		opts.activity.Importe = stringToInt64(line)
		return opts.activity
	}

	return nil
}

func addAgricultural(activities []*declaration.Agricultural) int64 {
	var total int64
	for _, a := range activities {
		total += a.Importe
	}

	return total
}
