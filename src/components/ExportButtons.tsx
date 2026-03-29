import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DailyEntry } from '@/lib/burnout';

interface ExportButtonsProps {
  entries: DailyEntry[];
}

export const ExportButtons = ({ entries }: ExportButtonsProps) => {
  const exportToCSV = () => {
    const headers = ['Data', 'Cansaco', 'Estresse', 'Qualidade do Sono', 'Score', 'Nivel de Risco'];
    const rows = entries.map(entry => [
      entry.date,
      entry.fatigue,
      entry.stress,
      entry.sleep_quality,
      entry.score,
      entry.risk_level
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'historico_burnout.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Historico de Monitoramento - MindCare IA', 14, 15);

    const tableData = entries.map(entry => [
      entry.date,
      entry.fatigue.toString(),
      entry.stress.toString(),
      entry.sleep_quality.toString(),
      entry.score.toString(),
      entry.risk_level === 'low' ? 'Baixo' : entry.risk_level === 'moderate' ? 'Moderado' : 'Alto'
    ]);

    autoTable(doc, {
      head: [['Data', 'Cansaco', 'Estresse', 'Sono', 'Score', 'Risco']],
      body: tableData,
      startY: 20,
      theme: 'grid',
      headStyles: { fillColor: [32, 178, 170] }
    });

    doc.save('historico_burnout.pdf');
  };

  if (!entries || entries.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-6">
      <button 
        onClick={exportToCSV}
        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium border border-gray-300"
      >
        Baixar Histórico (CSV)
      </button>
      <button 
        onClick={exportToPDF}
        className="px-4 py-2 bg-[#20b2aa] text-white rounded-md hover:bg-[#1a9089] transition-colors font-medium"
      >
        Baixar Histórico (PDF)
      </button>
    </div>
  );
};