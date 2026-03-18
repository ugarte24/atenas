/** Descarga CSV con BOM UTF-8 para Excel */
export function descargarCsv(filas: string[][], nombreArchivo: string) {
  const lines = filas.map((row) =>
    row.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(';')
  );
  const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nombreArchivo.endsWith('.csv') ? nombreArchivo : `${nombreArchivo}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}
