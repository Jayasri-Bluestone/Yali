export function exportToCSV(data, filename) {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  function flattenObject(ob, prefix = '', result = {}) {
    for (const i in ob) {
      if (!Object.prototype.hasOwnProperty.call(ob, i)) continue;

      const lowerK = String(i).toLowerCase();
      // Filter out media/image fields
      if (
        lowerK.includes('image') || 
        lowerK.includes('icon') || 
        lowerK.includes('thumbnail') || 
        lowerK.includes('picture') || 
        lowerK.includes('photo') || 
        lowerK.includes('banner') || 
        lowerK.includes('screenshot') || 
        lowerK.includes('logo') || 
        lowerK.includes('avatar')
      ) {
        continue;
      }

      // Filter out base64 images if they somehow slip through
      if (typeof ob[i] === 'string' && ob[i].startsWith('data:image')) {
        continue;
      }
      
      const keyName = prefix ? `${prefix}_${i}` : i;
      
      if (typeof ob[i] === 'object' && ob[i] !== null) {
        if (Array.isArray(ob[i]) && ob[i].length === 0) {
          result[keyName] = '';
        } else {
          flattenObject(ob[i], keyName, result);
        }
      } else {
        result[keyName] = ob[i];
      }
    }
    return result;
  }

  // 1. Parse JSON strings and Flatten all data rows
  const flattenedData = data.map(row => {
    let processedRow = { ...row };
    for (let key in processedRow) {
      if (typeof processedRow[key] === 'string' && (processedRow[key].startsWith('[') || processedRow[key].startsWith('{'))) {
        try {
          processedRow[key] = JSON.parse(processedRow[key]);
        } catch (e) {
          // ignore
        }
      }
    }
    return flattenObject(processedRow);
  });

  // 2. Gather all unique headers across all flattened rows
  const headerSet = new Set();
  flattenedData.forEach(row => {
    Object.keys(row).forEach(key => headerSet.add(key));
  });
  const headers = Array.from(headerSet);

  const csvRows = [];
  
  // Header row
  csvRows.push(headers.map(header => `"${header.replace(/_/g, ' ').toUpperCase()}"`).join(','));
  
  // Data rows
  for (const row of flattenedData) {
    const values = headers.map(header => {
      let val = row[header];
      if (val === null || val === undefined) val = '';
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  a.click();
  window.URL.revokeObjectURL(url);
}
