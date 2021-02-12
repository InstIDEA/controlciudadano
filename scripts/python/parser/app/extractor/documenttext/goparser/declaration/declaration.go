package declaration

import (
	"time"
)

// Declaration is the data on a public official's declaraion
type Declaration struct {
	Fecha       time.Time          `json:"fecha"`
	Cedula      int                `json:"cedula"`
	Nombre      string             `json:"nombre"`
	Apellido    string             `json:"apellido"`
	Cargo       string             `json:"cargo"`
	Institucion string             `json:"institucion"`

	// Activos
	Deposits     []*Deposit      `json:"depositos"`
	Debtors      []*Debtor       `json:"deudores"`
	RealStates   []*RealState    `json:"inmuebles"`
	Vehicles     []*Vehicle      `json:"vehiculos"`
	Agricultural []*Agricultural `json:"actividadesAgropecuarias"`
	Furniture    []*Furniture    `json:"muebles"`
	OtherAssets  []*OtherAsset   `json:"otrosActivos"`

	Debts []*Debt 	`json:"deudas"`

	IncomeMonthly   int64 `json:"ingresosMensual"`
	IncomeAnnual    int64 `json:"ingresosAnual"`
	ExpensesMonthly int64 `json:"egresosMensual"`
	ExpensesAnnual  int64 `json:"egresosAnual"`

	Assets       int64 `json:"activos"`
	Liabilities  int64 `json:"pasivos"`
	NetPatrimony int64 `json:"patrimonioNeto"`
	
	Resumen		*Summary		`json:"resumen"`
}

type Summary struct {
	TotalActivo		int64	`json:"totalActivo"`
	TotalPasivo		int64	`json:"totalPasivo"`
	PatrimonioNeto	int64 `json:"patrimonioNeto"`
}

// Deposit describes money at a financial institution.
type Deposit struct {
	TipoEntidad string `json:"tipoEntidad"`
	Entidad     string `json:"entidad"`
	Tipo        string `json:"tipo"`
	Pais        string `json:"pais"`
	Importe     int64  `json:"importe"`
}

// Debtor describes a person that owns money to the official.
type Debtor struct {
	Nombre  string `json:"nombre"`
	Clase   string `json:"clase"`
	Plazo   int    `json:"plazo"`
	Importe int64  `json:"importe"`
}

// RealState is a real state owned by the official.
type RealState struct {
	Padron                 string `json:"padron"`
	Uso                    string `json:"uso"`
	Pais                   string `json:"pais"`
	Distrito               string `json:"distrito"`
	Adquisicion            int    `json:"adquisicion"`
	TipoAdquisicion        string `json:"tipoAdquisicion"`
	SuperficieTerreno      int64  `json:"superficieTerreno"`
	ValorTerreno           int64  `json:"valorTerreno"`
	SuperficieConstruccion int64  `json:"superficieConstruccion"`
	ValorConstruccion      int64  `json:"valorConstruccion"`
	Importe                int64  `json:"importe"`
}

// Vehicle is a vehicle owned by the official.
type Vehicle struct {
	Tipo        string `json:"tipo"`
	Marca       string `json:"marca"`
	Modelo      string `json:"modelo"`
	Adquisicion int    `json:"adquisicion"`
	Fabricacion int    `json:"fabricacion"`
	Importe     int64  `json:"importe"`
}

// Agricultural is an official's agricultural activity.
type Agricultural struct {
	Tipo      string `json:"tipo"`
	Ubicacion string `json:"ubicacion"`
	Especie   string `json:"especie"`
	Cantidad  int64  `json:"cantidad"`
	Precio    int64  `json:"precio"`
	Importe   int64  `json:"importe"`
}

// Furniture is a furniture owned by the official.
type Furniture struct {
	Tipo    string `json:"tipo"`
	Importe int64  `json:"importe"`
}

// OtherAsset is another asset not included in other fields.
type OtherAsset struct {
	Descripcion string `json:"descripcion"`
	Empresa     string `json:"empresa"`
	RUC         string `json:"ruc"`
	Pais        string `json:"pais"`
	Cantidad    int64  `json:"cantidad"`
	Precio      int64  `json:"precio"`
	Importe     int64  `json:"importe"`
}

// Debt is money the official owes to others.
type Debt struct {
	Tipo    string `json:"tipo"`
	Empresa string `json:"empresa"`
	Plazo   int    `json:"plazo"`
	Cuota   int64  `json:"cuota"`
	Total   int64  `json:"total"`
	Saldo   int64  `json:"saldo"`
}

// CalculatePatrimony adds up assets and debts.
func (d *Declaration) CalculatePatrimony() int64 {

	var debts int64
	for _, v := range d.Debts {
		debts += v.Saldo
	}

	d.Assets = d.AddAssets()
	d.Liabilities = debts
	d.NetPatrimony = d.Assets - d.Liabilities

	return d.NetPatrimony
}

// AddAssets adds all the assets.
func (d *Declaration) AddAssets() int64 {
	var total int64

	for _, v := range d.Deposits {
		total += v.Importe
	}
	for _, v := range d.Debtors {
		total += v.Importe
	}
	for _, v := range d.RealStates {
		total += v.Importe
	}
	for _, v := range d.Vehicles {
		total += v.Importe
	}
	for _, v := range d.Agricultural {
		total += v.Importe
	}
	for _, v := range d.Furniture {
		total += v.Importe
	}
	for _, v := range d.OtherAssets {
		total += v.Importe
	}

	return total
}