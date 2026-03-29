import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/integrations/supabase/client';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';

export const ExportButtons = ({ entries }: { entries: any[] }) => {
  
  const exportToPDF = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user?.id).single();
      const p = profile as any;

      const doc = new jsPDF();
      
      // Cabeçalho Profissional
      doc.setFillColor(32, 178, 170);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('Relatório de Saúde Mental', 14, 20);
      doc.setFontSize(10);
      doc.text('Gestão de Burnout para Enfermeiros - MindCare IA', 14, 28);

      // Informações do Profissional
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(11);
      doc.text(`Profissional: ${p?.display_name || 'Usuário do Sistema'}`, 14, 50);
      
      // Ajuste para não cortar a lista de hospitais no topo
      const hospitalList = p?.hospitals?.join(', ') || 'N/A';
      const splitHospitals = doc.splitTextToSize(`Vínculos Registrados: ${hospitalList}`, 180);
      doc.text(splitHospitals, 14, 57);

      const avgScore = entries.length > 0 
        ? (entries.reduce((acc, e) => acc + Number(e.score), 0) / entries.length).toFixed(1)
        : '0.0';

      doc.setFont('helvetica', 'bold');
      doc.text(`Score Médio Acumulado no Período: ${avgScore}/10`, 14, 75);

      // Tabela de Dados com ajuste de largura para não cortar nomes
      const tableData = entries.map(e => [
        new Date(e.date).toLocaleDateString('pt-BR'),
        (e as any).hospital_ref || 'Não informado',
        e.fatigue,
        e.stress,
        e.sleep_quality,
        e.score,
        e.risk_level === 'low' ? 'Baixo' : e.risk_level === 'moderate' ? 'Moderado' : 'Alto'
      ]);

      autoTable(doc, {
        head: [['Data', 'Unidade Hospitalar', 'Fad', 'Est', 'Son', 'Score', 'Risco']],
        body: tableData,
        startY: 85,
        theme: 'grid',
        styles: { 
          fontSize: 8, 
          cellPadding: 3,
          overflow: 'linebreak', // Faz o texto pular linha se for grande
          halign: 'center'
        },
        headStyles: { 
          fillColor: [32, 178, 170], 
          textColor: [255, 255, 255], 
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { cellWidth: 22 }, // Data
          1: { cellWidth: 70, halign: 'left' }, // Unidade Hospitalar (Largura maior e alinhado à esquerda)
          2: { cellWidth: 15 }, // Fadiga
          3: { cellWidth: 15 }, // Estresse
          4: { cellWidth: 15 }, // Sono
          5: { cellWidth: 18, fontStyle: 'bold' }, // Score
          6: { cellWidth: 25, fontStyle: 'bold' }  // Risco
        },
        didParseCell: function(data) {
          if (data.section === 'body' && data.column.index === 6) {
            const risk = data.cell.raw;
            if (risk === 'Alto') data.cell.styles.textColor = [220, 38, 38];
            if (risk === 'Moderado') data.cell.styles.textColor = [180, 83, 9];
          }
        }
      });

      // Rodapé
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Documento gerado pelo MindCare IA - Gestão de Burnout.', 14, 285);

      doc.save(`mindcare_relatorio_${p?.display_name?.replace(/\s+/g, '_') || 'enfermeiro'}.pdf`);
      toast.success('PDF gerado sem cortes!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao gerar PDF.');
    }
  };

  return (
    <button 
      onClick={exportToPDF} 
      className="flex items-center justify-center gap-2 bg-[#20b2aa] text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-[#1a9089] transition-all w-full sm:w-auto"
    >
      <FileText size={20} />
      BAIXAR RELATÓRIO COMPLETO (PDF)
    </button>
  );
};