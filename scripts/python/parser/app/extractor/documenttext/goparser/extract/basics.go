package extract

import (
	"bufio"
	"time"
)

// Date returns the date for the declaration.
func Date(scanner *bufio.Scanner) time.Time {
	date := getString(scanner, "DECLARACIÓN", EVdate, nil)
	if date == "" {
		ParserMessage("Failed when extracting date")
		return time.Time{}
	}

	t, err := time.Parse("02/01/2006", date)
	if err != nil {
		ParserMessage("failed when parse date")
		return time.Time{}
	}

	return t
}

// Cedula returns the ID card number.
func Cedula(scanner *bufio.Scanner) int {
	value := getInt(scanner, "CÉDULA", EVnum, nil)
	if value == 0 {
		ParserMessage("failed when extracting cedula")
	}
	return value
}

// Name returns the official's name.
func Name(scanner *bufio.Scanner) string {
	value := getString(scanner, "NOMBRE", EValphaNum, nil)
	if value == "" {
		ParserMessage("failed when extracting name")
	}
	return value
}

// Lastname returns the official's lastname.
func Lastname(scanner *bufio.Scanner) string {
	value := getString(scanner, "APELLIDOS", EValphaNum, nil)
	if value == "" {
		ParserMessage("failed when extracting lastname")
	}
	return value
}

// Institution returns the official's work place.
func Institution(scanner *bufio.Scanner) string {
	value := getString(scanner, "DIRECCIÓN", EValphaNum, nil)
	if value == "" {
		ParserMessage("failed when extracting institucion")
	}
	return value
}

// JobTitle returns the official's job title.
func JobTitle(scanner *bufio.Scanner) string {
	value := getString(scanner, "CARGO", EValphaNum, nil)
	if value == "" {
		ParserMessage("failed when extracting cargo")
		return ""
	}
	return value
}