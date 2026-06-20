export function exportToCSV(data, filename) {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  // Get headers from first object, ignoring any media/image fields
  const headers = Object.keys(data[0]).filter(
    k => {
      const lowerK = k.toLowerCase();
      return !lowerK.includes('image') && 
             !lowerK.includes('icon') && 
             !lowerK.includes('thumbnail') && 
             !lowerK.includes('picture') && 
             !lowerK.includes('photo') &&
             !lowerK.includes('banner');
    }
  );
  
  const csvRows = [];
  
  // Header row
  csvRows.push(headers.map(header => `"${header.replace(/_/g, ' ').toUpperCase()}"`).join(','));
  
  // Data rows
  for (const row of data) {
    const values = headers.map(header => {
      let val = row[header];
      if (val === null || val === undefined) val = '';
      if (typeof val === 'object') {
        val = JSON.stringify(val); // basic handling of nested objects
      }
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  a.click();
  window.URL.revokeObjectURL(url);
}
