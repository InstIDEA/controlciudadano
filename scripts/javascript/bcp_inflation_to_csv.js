const readXlsxFile = require('read-excel-file/node');

const file_path = process.argv[2] || '../sources/bcp/ipc.xlsx';

const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

function processFile() {
  return readXlsxFile(file_path).then((rows) => {
    let year = undefined;
    let data = {};

    rows.forEach(row => {
      const isMonth = row[0] && typeof row[0] === 'string' && months.includes(row[0].trim());
      const isYear = checkIfYear(row[0]);

      // console.log(row);
      if (isYear) {
        year = row[0];
      }


      if (isYear && row[0] < 1964) { // this is the first year with months
        data[year] = {};
        months.forEach(m => {
          data[year][m] = row[5]
        })
      }

      if (isMonth) {
        if (!data[year]) data[year] = {};
        data[year][row[0]] = row[5];
      }

    })

    return data;
  })
}

function checkIfYear(val) {

  if (!val) return false;
  const parsed = parseInt(val);
  if (isNaN(parsed)) return false;

  return parsed >= 1950 && parsed <= 2030;
}


console.log(['year', 'month', 'index'].join(','))
processFile().then(d => {
  Object.keys(d).forEach(year => {
    Object.keys(d[year]).forEach(month => {
      console.log([year, months.indexOf(month) + 1, d[year][month]].join(','));
    })
  })
});
