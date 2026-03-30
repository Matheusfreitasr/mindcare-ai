import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 }
  ]
});

const styles = StyleSheet.create({
  page: { flexDirection: 'column', backgroundColor: '#ffffff', padding: 40, fontFamily: 'Roboto' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, padding: 20, backgroundColor: '#f8fafb', borderRadius: 10 },
  headerTitle: { fontSize: 16, fontWeight: 700, color: '#111827' },
  headerSubTitle: { fontSize: 9, color: '#6b7280' },
  
  workplaces: { marginBottom: 20, padding: 15, border: '1pt solid #e5e7eb', borderRadius: 10 },
  sectionTitle: { fontSize: 10, fontWeight: 700, color: '#374151', textTransform: 'uppercase', marginBottom: 10 },
  wpItem: { fontSize: 9, color: '#4b5563', marginBottom: 4 },

  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  card: { flex: 1, backgroundColor: '#f8fafb', padding: 15, borderRadius: 10 },
  cardLabel: { fontSize: 8, color: '#6b7280', textTransform: 'uppercase', marginBottom: 5 },
  cardValue: { fontSize: 14, fontWeight: 700, color: '#20b2aa' },

  table: { width: '100%', marginTop: 10 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#20b2aa', padding: 8, borderRadius: 5 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', borderBottomStyle: 'solid', padding: 8 },
  col1: { width: '25%', fontSize: 9, color: '#374151' },
  col2: { width: '25%', fontSize: 9, fontWeight: 700, color: '#111827' },
  col3: { width: '25%', fontSize: 9, fontWeight: 700 },
  col4: { width: '25%', fontSize: 9, color: '#6b7280' },
  headerText: { fontSize: 9, color: '#ffffff', fontWeight: 700 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#9ca3af' },
});

export function MentalHealthReportPDF({ profile, userEmail, entries, range }: any) {
  const averageScore = entries.length > 0 ? Math.round(entries.reduce((sum:any, e:any) => sum + e.score, 0) / entries.length) : 0;
  const statusGeral = averageScore > 60 ? 'Bom / Estável' : (averageScore > 40 ? 'Atenção' : 'Ruim / Crítico');
  const workPlaces = profile?.work_places || [];

  return (
    <Document title={`Relatorio_MindCare_${profile?.display_name}`}>
      <Page size="A4" style={styles.page}>
        
        <View style={styles.header}>
           <View>
             <Text style={styles.headerTitle}>{profile?.display_name || 'Profissional'}</Text>
             <Text style={styles.headerSubTitle}>{userEmail}</Text>
           </View>
           <View>
             <Text style={styles.headerTitle}>{range}</Text>
             <Text style={styles.headerSubTitle}>Período Avaliado</Text>
           </View>
        </View>

        <View style={styles.workplaces}>
          <Text style={styles.sectionTitle}>Unidades de Trabalho e Turnos</Text>
          {workPlaces.length > 0 ? workPlaces.map((wp:any, i:number) => (
             <Text key={i} style={styles.wpItem}>• {wp.hospital} - Turno: {wp.shift} {wp.isOnCall ? '(Plantonista)' : ''}</Text>
          )) : <Text style={styles.wpItem}>Nenhum local cadastrado.</Text>}
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.card}><Text style={styles.cardLabel}>Score Médio</Text><Text style={styles.cardValue}>{averageScore}%</Text></View>
          <View style={styles.card}><Text style={styles.cardLabel}>Status Mental</Text><Text style={[styles.cardValue, {color: averageScore > 60 ? '#10b981' : '#ef4444'}]}>{statusGeral}</Text></View>
          <View style={styles.card}><Text style={styles.cardLabel}>Check-ins Realizados</Text><Text style={styles.cardValue}>{entries.length}</Text></View>
        </View>

        <View>
          <Text style={styles.sectionTitle}>Histórico Detalhado</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.col1, styles.headerText]}>Data</Text>
              <Text style={[styles.col2, styles.headerText]}>Score IA</Text>
              <Text style={[styles.col3, styles.headerText]}>Status</Text>
              <Text style={[styles.col4, styles.headerText]}>Unidade do Check-in</Text>
            </View>
            
            {entries.map((entry:any, index:number) => {
              const formattedDate = new Date(entry.date).toLocaleDateString('pt-BR');
              const riskColor = entry.risk_level === 'alto' ? '#ef4444' : (entry.risk_level === 'médio' ? '#f59e0b' : '#10b981');
              const statusTexto = entry.risk_level === 'alto' ? 'Ruim' : (entry.risk_level === 'médio' ? 'Atenção' : 'Bom');
              
              return (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.col1}>{formattedDate}</Text>
                  <Text style={styles.col2}>{Math.round(entry.score)}%</Text>
                  <Text style={[styles.col3, { color: riskColor }]}>{statusTexto}</Text>
                  <Text style={styles.col4}>{entry.hospital_name}</Text>
                </View>
              )
            })}
          </View>
        </View>

        <Text style={styles.footer}>Gerado Oficialmente pelo MindCare IA - Gestão de Burnout</Text>
      </Page>
    </Document>
  );
}