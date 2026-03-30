import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Camera, Loader2, Briefcase, Edit3, ShieldCheck, Save, Phone, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function ProfilePage({ profile, setProfile }: any) {
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const workPlaces = Array.isArray(profile?.work_places) ? profile.work_places : [];

  const [editName, setEditName] = useState(profile?.display_name || '');
  const [editPhone, setEditPhone] = useState(profile?.emergency_contact || '');
  const [editWorkPlaces, setEditWorkPlaces] = useState<any[]>(workPlaces);

  const uploadAvatar = async (event: any) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      await supabase.from('profiles').update({ avatar_url: publicUrl } as any).eq('id', user.id);
      
      setProfile({ ...profile, avatar_url: publicUrl });
      toast.success('Fotografia atualizada com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao atualizar a fotografia.');
    } finally { setUploading(false); }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { error } = await supabase.from('profiles').update({
        display_name: editName,
        emergency_contact: editPhone,
        work_places: editWorkPlaces
      } as any).eq('id', user.id);
      
      if (error) throw error;
      
      setProfile({ ...profile, display_name: editName, emergency_contact: editPhone, work_places: editWorkPlaces });
      setIsEditing(false);
      toast.success('Perfil atualizado e guardado!');
    } catch (error) {
      toast.error('Erro ao guardar as alterações.');
    } finally { setSaving(false); }
  };

  const addWorkplace = () => setEditWorkPlaces([...editWorkPlaces, { hospital: '', shift: 'Matutino', isOnCall: false }]);
  const updateWorkplace = (index: number, field: string, value: any) => {
    const updated = [...editWorkPlaces];
    updated[index][field] = value;
    setEditWorkPlaces(updated);
  };
  const removeWorkplace = (index: number) => {
    const updated = [...editWorkPlaces];
    updated.splice(index, 1);
    setEditWorkPlaces(updated);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 animate-in fade-in duration-700">
      <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-gray-50 flex flex-col items-center gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#20b2aa]/5 to-transparent opacity-50"></div>
        <div className="relative z-10 group">
          <div className="w-32 h-32 rounded-[3.5rem] bg-gray-50 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center relative">
            {uploading ? ( <Loader2 className="animate-spin text-[#20b2aa]" size={30} /> ) : profile?.avatar_url ? ( <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Avatar" /> ) : ( <User size={50} className="text-gray-200" /> )}
          </div>
          <label className="absolute -bottom-2 -right-2 bg-[#20b2aa] p-3 rounded-2xl text-white shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-all">
             <Camera size={18}/><input type="file" className="hidden" accept="image/*" onChange={uploadAvatar} disabled={uploading} />
          </label>
        </div>
        <div className="text-center z-10 space-y-1">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter">{profile?.display_name || 'Profissional'}</h2>
          <div className="inline-flex items-center gap-2 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 mt-2">
            <ShieldCheck size={14} className="text-emerald-500" /><p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Enfermeiro Verificado</p>
          </div>
        </div>
      </div>

      {isEditing ? (
        <div className="bg-white p-8 rounded-[3.5rem] shadow-xl border border-gray-50 space-y-6 animate-in fade-in">
          <h4 className="text-[10px] font-black text-[#20b2aa] uppercase tracking-[0.3em] ml-2">Editar os seus Dados</h4>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-4">Nome Completo</label>
              <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full p-4 bg-gray-50 rounded-full font-bold text-sm outline-none border-2 border-transparent focus:border-[#20b2aa]/20" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-4">Contacto de Emergência (Opcional)</label>
              <input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="Ex: (98) 90000-0000" className="w-full p-4 bg-gray-50 rounded-full font-bold text-sm outline-none border-2 border-transparent focus:border-[#20b2aa]/20" />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-4">
            <div className="flex items-center justify-between ml-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Unidades de Trabalho e Turnos</label>
              <button onClick={addWorkplace} className="flex items-center gap-1 text-[10px] font-black text-[#20b2aa] uppercase bg-[#20b2aa]/10 px-3 py-1.5 rounded-full hover:bg-[#20b2aa]/20"><Plus size={12}/> Adicionar</button>
            </div>
            {editWorkPlaces.map((wp: any, i: number) => (
              <div key={i} className="p-4 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-3">
                <div className="flex justify-between items-center">
                   <input placeholder="Nome do Hospital" value={wp.hospital} onChange={e => updateWorkplace(i, 'hospital', e.target.value)} className="flex-1 p-3 bg-white rounded-xl font-bold text-xs outline-none border border-gray-100 focus:border-[#20b2aa]/30" />
                   <button onClick={() => removeWorkplace(i)} className="p-3 text-red-400 hover:bg-red-50 rounded-xl ml-2 transition-colors"><Trash2 size={16}/></button>
                </div>
                <div className="flex items-center gap-3">
                   <select value={wp.shift} onChange={e => updateWorkplace(i, 'shift', e.target.value)} className="flex-1 p-3 bg-white rounded-xl font-bold text-xs outline-none border border-gray-100 text-gray-600">
                     <option value="Matutino">Matutino</option><option value="Vespertino">Vespertino</option><option value="Noturno">Noturno</option>
                   </select>
                   <label className="flex items-center gap-2 bg-white p-3 rounded-xl border border-gray-100 cursor-pointer">
                     <span className="text-[10px] font-bold text-gray-500">Faz Plantão?</span>
                     <input type="checkbox" checked={wp.isOnCall} onChange={e => updateWorkplace(i, 'isOnCall', e.target.checked)} className="w-4 h-4 accent-[#20b2aa]" />
                   </label>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
             <button onClick={() => setIsEditing(false)} className="flex-1 py-5 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest text-gray-500 bg-gray-100 hover:bg-gray-200">Cancelar</button>
             <button onClick={handleSaveProfile} disabled={saving} className="flex-[2] bg-[#20b2aa] text-white py-5 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-[#1a9089]">
               {saving ? <Loader2 className="animate-spin" size={18}/> : <><Save size={18}/> Guardar Perfil</>}
             </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-[3.5rem] shadow-xl border border-gray-50 space-y-6">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">A sua Rotina Profissional</h4>
          
          {profile?.emergency_contact && (
             <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-[2rem] border border-gray-100">
                <div className="p-3 bg-white rounded-xl text-[#20b2aa] shadow-sm"><Phone size={20}/></div>
                <div><p className="font-black text-gray-800 text-sm uppercase tracking-tight">{profile.emergency_contact}</p><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Contacto de Emergência</p></div>
             </div>
          )}

          <div className="space-y-3">
            {workPlaces.length > 0 ? workPlaces.map((wp: any, i: number) => (
              <div key={i} className="p-5 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-center gap-4 hover:border-[#20b2aa]/30 transition-colors">
                <div className="p-3 bg-white rounded-xl text-[#20b2aa] shadow-sm"><Briefcase size={20}/></div>
                <div>
                    <p className="font-black text-gray-800 text-sm uppercase tracking-tight">{wp.hospital}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{wp.shift} {wp.isOnCall ? '• Plantonista' : ''}</p>
                </div>
              </div>
            )) : <p className="text-xs text-gray-400 font-bold p-4 text-center bg-gray-50 rounded-3xl">Nenhum local de trabalho adicionado.</p>}
          </div>

          <button onClick={() => setIsEditing(true)} className="w-full bg-gray-50 border border-gray-200 text-[#20b2aa] py-6 rounded-full font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all hover:bg-white hover:border-[#20b2aa]/30 flex justify-center items-center gap-2">
            <Edit3 size={18}/> Editar os Meus Dados
          </button>
        </div>
      )}
    </div>
  );
}