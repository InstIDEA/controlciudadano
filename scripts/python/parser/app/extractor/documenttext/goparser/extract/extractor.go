package extract

import (
	"bufio"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"fmt"
)

var countries = map[string]bool{}

// MoveUntil finds a word and stops the scan there.
func MoveUntil(scanner *bufio.Scanner, search string, exact bool) *bufio.Scanner {
	for scanner.Scan() {
		line := scanner.Text()

		if exact {
			if line == search {
				break
			}
		} else {
			if strings.Contains(line, search) {
				break
			}
		}

	}

	return scanner
}

func getInt(scanner *bufio.Scanner, precedence string, t ExpectedValue, exclude *[]int) int {
	value := getString(scanner, precedence, t, exclude)

	valueInt, err := strconv.Atoi(value)
	if err != nil {
		return 0
	}

	return valueInt
}

func getString(scanner *bufio.Scanner, precedence string, t ExpectedValue, exclude *[]int) string {
	var value string
	count := 1
	loop:
	for scanner.Scan() {
		line := scanner.Text()

		if isCurrLine(line, precedence) {
			for scanner.Scan() {
				count++
				if expectedValue(line, precedence, t, exclude, count) {
					value = getValue(line, precedence)
					if exclude != nil {
						*exclude = append(*exclude, count)
					}
					break loop
				}
				line = scanner.Text()
			}
		}
		count++
	}

	return strings.TrimSpace(value)
}

func contains(s []string, e string) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}

func getTotalInCategory(scanner *bufio.Scanner) int64 {
	scanner.Scan()
	scanner.Scan()
	r := strings.NewReplacer(".", "", ",", "")
	i, _ := strconv.ParseInt(r.Replace(scanner.Text()), 10, 64)

	return i
}

func stringToInt64(line string) int64 {
	return StringToInt64(line)
}

// StringToInt64 parses a string and make it an int64.
func StringToInt64(line string) int64 {
	r := strings.NewReplacer(".", "", ",", "")
	i, _ := strconv.ParseInt(r.Replace(line), 10, 64)

	return i
}

func stringToInt(line string) int {
	r := strings.NewReplacer(".", "", ",", "")
	i, _ := strconv.Atoi(r.Replace(line))

	return i
}

func stringToYear(line string) int {
	year := stringToInt(line)

	if year == 0 {
		return 0
	}

	if year < 100 {
		return 2000 + year
	}

	return year
}

func isDate(line string) bool {
	matched, _ := regexp.MatchString(`[0-9]{2}\/[0-9]{2}\/[0-9]{4}`, line)
	return matched
}

func isBarCode(line string) bool {
	matched, _ := regexp.MatchString(`[0-9]{5,6}-[0-9]{5,7}-[0-9]{1,3}`, line)
	return matched
}

func isNumber(line string) bool {
	matched, _ := regexp.MatchString(`[0-9\.\,]*[0-9]$`, line)
	return matched
}

func isCountry(line string) bool {

	if _, ok := countries[line]; ok {
		return true
	}

	resp, err := http.Get("https://restcountries.eu/rest/v2/name/" + line)

	if err != nil {
		return false
	}

	defer resp.Body.Close()

	if resp.StatusCode == 404 {
		return false
	}

	countries[line] = true

	return true
}

func isAlphaNum(line string) bool {
	matched, _ := regexp.MatchString(`[aA-zZ0-9].*$`, line)
	return matched
}

func isCurrLine(line string, startwith string) bool {
	pattern := fmt.Sprintf("^(%s).*$", startwith)
	matched, _ := regexp.MatchString(pattern, line)
	return matched
}

func expectedValue(value string, precedence string, t ExpectedValue, exclude *[]int, count int) bool {
	value = getValue(value, precedence)

	if exclude != nil {
		for _, item := range *exclude {
			if count == item {
				return false
			}
		}
	}

	switch (t) {
		case EVdate:
			return isDate(value) 
		case EVnum:
			return isNumber(value)
		case EValphaNum:
			return isAlphaNum(value)
	}
	return false
}

func getValue(value string, precedence string) string {
	r := strings.NewReplacer(":", "")
	inline := strings.Split(r.Replace(value), precedence)

	if len(inline) > 1 {
		return strings.TrimSpace(inline[1])
	}
	return value
}