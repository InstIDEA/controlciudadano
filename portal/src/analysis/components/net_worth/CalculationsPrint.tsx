import React from "react";
import {formatMoney, formatToDay} from "../../../formatters";
import {DeclarationData, NetWorthIncreaseAnalysis} from "../../../APIModel";
import {NetWorthCalculations} from "../../NetWorthHook";

export function CalculationsPrint(props: {
    data: NetWorthIncreaseAnalysis,
    calculations: NetWorthCalculations
}) {

    const {
        earnings,
        totalIncome,
        forInversion,
        variation,
        result
    } = props.calculations;

    return <div className="print-only">
        <table className="nw-calc">
            <tbody>
            <tr className="row-header">
                <th colSpan={3} className="col-align-left">ANÁLISIS</th>
                <th className="col-align-right">FUENTE</th>
            </tr>
            <tr>
                <td colSpan={4} className="row-divider"/>
            </tr>
            <tr>
                <td className="row-header col-align-left">TIEMPO DE ANÁLISIS</td>
                <td/>
                <td className="col-align-right col-value">{props.data.duration + " AÑOS"}</td>
                <td className="col-align-right col-value">DJBR</td>
            </tr>
            <tr>
                <td colSpan={4} className="row-divider"/>
            </tr>
            <tr>
                <td className="row-header col-align-left">VARIACIÓN</td>
                <td/>
                <td className="col-align-right col-value">{formatMoney(variation.amount)}</td>
                <td className="col-align-right col-value">{variation.source}</td>
            </tr>
            <tr>
                <td className="row-header col-align-left">PATRIMONIO NETO INICIAL</td>
                <td/>
                <td className="col-align-right col-value">{formatMoney(props.data.firstYear.netWorth.amount)}</td>
                <td className="col-align-right col-value">{props.data.firstYear.netWorth.source}</td>
            </tr>
            <tr>
                <td className="row-header col-align-left">PATRIMONIO NETO FINAL</td>
                <td/>
                <td className="col-align-right col-value">{formatMoney(props.data.lastYear.netWorth.amount)}</td>
                <td className="col-align-right col-value">{props.data.lastYear.netWorth.source}</td>
            </tr>
            <tr>
                <td colSpan={4} className="row-divider"/>
            </tr>
            <tr className="row-header">
                <td className="col-align-left">INGRESOS</td>
                <td/>
                <td className="col-align-right">TOTALES</td>
                <td/>
            </tr>
            <tr>
                <td className="row-header col-align-left">POR AÑO</td>
                <td/>
                <td className="col-align-right col-value">{formatMoney(earnings.amount)}</td>
                <td className="col-align-right col-value">{earnings.source}</td>
            </tr>
            <tr>
                <td className="row-header col-align-left">EN PERIODO</td>
                <td/>
                <td className="col-align-right col-value">{formatMoney(totalIncome.amount * props.data.duration)}</td>
                <td className="col-align-right col-value">{totalIncome.source}</td>
            </tr>
            <tr>
                <td className="row-header col-align-left">PARA MANTENIMIENTO</td>
                <td/>
                <td className="col-align-right col-value">{formatMoney(totalIncome.amount * 0.65)}</td>
                <td className="col-align-right col-value">{totalIncome.source}</td>
            </tr>
            <tr>
                <td className="row-header col-align-left">PARA INVERSIÓN</td>
                <td/>
                <td className="col-align-right col-value">{formatMoney(forInversion.amount)}</td>
                <td className="col-align-right col-value">{forInversion.source}</td>
            </tr>
            <tr>
                <td colSpan={4} className="row-divider"/>
            </tr>
            <tr className="row-header">
                <td/>
                <td className="col-align-right">CONSISTENCIA</td>
                <td className="col-align-right">VALOR</td>
                <td/>
            </tr>
            <tr>
                <td className="row-header col-align-left">RESULTADO DEL ANÁLISIS</td>
                <td className="col-align-right col-value">
                    {result.amount > 1.1 ? "ALTA" :
                        result.amount > 1 ? "MEDIA" :
                            "BAJA"}
                </td>
                <td className="col-align-right col-value">{result.amount.toFixed(2)}</td>
                <td className="col-align-right col-value">{variation.source}</td>
            </tr>
            </tbody>
        </table>
        <div className="print-pagebreak"/>
        <DeclarationDataTable data={props.data.firstYear}/>
        <div className="print-pagebreak"/>
        <DeclarationDataTable data={props.data.lastYear}/>
    </div>
}


function DeclarationDataTable(props: {
    data: DeclarationData
}) {
    return <table className="nw-calc">
        <tbody>
        <tr className="row-header">
            <th colSpan={4} className="col-align-left">DECLARACIÓN {formatToDay(props.data.date)}</th>
        </tr>
        <tr>
            <td colSpan={4} className="row-divider"/>
        </tr>
        <tr className="row-header">
            <td colSpan={2} className="col-align-left">DATOS</td>
            <td className="col-align-right">VALOR</td>
            <td className="col-align-right">FUENTE</td>
        </tr>
        <tr>
            <td className="row-header col-align-left">TOTAL ACTIVOS</td>
            <td/>
            <td className="col-align-right col-value">{formatMoney(props.data.totalActive.amount)}</td>
            <td className="col-align-right col-value">{props.data.totalActive.source}</td>
        </tr>
        <tr>
            <td className="row-header col-align-left">TOTAL PASIVOS</td>
            <td/>
            <td className="col-align-right col-value">{formatMoney(props.data.totalPassive.amount)}</td>
            <td className="col-align-right col-value">{props.data.totalPassive.source}</td>
        </tr>
        <tr>
            <td className="row-header col-align-left">PATRIMONIO NETO</td>
            <td/>
            <td className="col-align-right col-value">{formatMoney(props.data.netWorth.amount)}</td>
            <td className="col-align-right col-value">{props.data.netWorth.source}</td>
        </tr>
        <tr>
            <td colSpan={4} className="row-divider"/>
        </tr>
        <tr className="row-header">
            <td className="col-align-left">INGRESOS</td>
            <td/>
            <td className="col-align-right"/>
            <td/>
        </tr>
        <tr>
            <td className="row-header col-align-left">ANUAL</td>
            <td/>
            <td className="col-align-right col-value">{formatMoney(props.data.totalIncome.amount)}</td>
            <td className="col-align-right col-value">{props.data.totalIncome.source}</td>
        </tr>
        {props.data.incomes.map(ingreso => <tr key={ingreso.name}>
                <td className="row-header col-align-left">
                    {ingreso.periodicity.replaceAll("monthly", "Mensual").replaceAll("yearly", "Anual").toUpperCase()}
                </td>
                <td/>
                <td className="col-align-right col-value">{formatMoney(ingreso.amount)}</td>
                <td className="col-align-right col-value">{ingreso.source}</td>
            </tr>
        )}
        </tbody>
    </table>
}

