import React, { useState } from 'react';
import { User, Building, Mail, Save, Check, Trash2 } from 'lucide-react';
import { useStore } from '../store';

export function Settings() {
  const { teacher, updateTeacher, papers, questionBank, clearAllPapers, clearAllBankQuestions } = useStore();
  const [form, setForm] = useState({ ...teacher });
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'data'>('profile');

  // Keep form in sync when online profile loads
  React.useEffect(() => {
    setForm(teacher);
  }, [teacher]);

  const handleSave = async () => {
    await updateTeacher(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid var(--color-border)',
    borderRadius: 'var(--radius-md)', fontSize: 14,
    outline: 'none', fontFamily: 'var(--font-sans)',
    color: 'var(--color-charcoal)', background: 'white',
  };

  const handleClearAllPapers = async () => {
    if (confirm('Delete ALL question papers from the online server? This cannot be undone.')) {
      await clearAllPapers();
    }
  };

  const handleClearAllQuestions = async () => {
    if (confirm('Delete ALL saved questions from the online server? This cannot be undone.')) {
      await clearAllBankQuestions();
    }
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 720, margin: '0 auto' }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Settings</h2>
      <p style={{ color: 'var(--color-muted)', fontSize: 14, marginBottom: 24 }}>Manage your profile and application preferences.</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--color-cream)', padding: 4, borderRadius: 'var(--radius-md)', width: 'fit-content' }}>
        {(['profile', 'data'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              padding: '8px 20px', borderRadius: 8, border: 'none',
              background: activeTab === t ? 'white' : 'transparent',
              color: activeTab === t ? 'var(--color-charcoal)' : 'var(--color-muted)',
              fontWeight: activeTab === t ? 600 : 500,
              fontSize: 14, cursor: 'pointer',
              boxShadow: activeTab === t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            {t === 'profile' ? '👤 Profile' : '🗄️ Data'}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="card">
          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--color-border)' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'var(--color-terra)',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 700,
            }}>
              {form.avatar || form.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 18 }}>{form.name}</div>
              <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>{form.email}</div>
              <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>{form.institution}</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-charcoal-light)', marginBottom: 6 }}>
                <User size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Full Name
              </label>
              <input style={inputStyle} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Your full name" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-charcoal-light)', marginBottom: 6 }}>
                <Mail size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Email Address
              </label>
              <input style={inputStyle} type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="your@email.com" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-charcoal-light)', marginBottom: 6 }}>
                <Building size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Institution / Coaching Name
              </label>
              <input style={inputStyle} value={form.institution} onChange={(e) => setForm((p) => ({ ...p, institution: e.target.value }))} placeholder="Institution name" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-charcoal-light)', marginBottom: 6 }}>
                Avatar Initials
              </label>
              <input style={{ ...inputStyle, width: 80 }} value={form.avatar} maxLength={2} onChange={(e) => setForm((p) => ({ ...p, avatar: e.target.value.toUpperCase() }))} placeholder="RS" />
              <p style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 4 }}>Enter up to 2 initials for your profile picture.</p>
            </div>

            <button
              className={saved ? 'btn-success' : 'btn-primary'}
              onClick={handleSave}
              style={{ alignSelf: 'flex-start', marginTop: 8 }}
            >
              {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Profile</>}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'data' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Stats */}
          <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {[
              { label: 'Question Papers', value: papers.length },
              { label: 'Questions in Bank', value: questionBank.length },
              { label: 'Published Papers', value: papers.filter((p) => p.status === 'published').length },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-terra)' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Danger Zone */}
          <div className="card" style={{ border: '1px solid var(--color-red-light)' }}>
            <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-red)', marginBottom: 16 }}>⚠️ Danger Zone</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>Delete All Question Papers</div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>Permanently delete all {papers.length} question papers from online server.</div>
                </div>
                <button className="btn-danger" onClick={handleClearAllPapers} style={{ fontSize: 12 }}>
                  <Trash2 size={13} /> Delete All Papers
                </button>
              </div>
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>Clear Saved Questions</div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>Remove all {questionBank.length} custom saved questions from your online bank.</div>
                </div>
                <button className="btn-danger" onClick={handleClearAllQuestions} style={{ fontSize: 12 }}>
                  <Trash2 size={13} /> Clear Bank
                </button>
              </div>
            </div>
          </div>

          {/* Cloud Storage Architecture */}
          <div className="card" style={{ background: 'var(--color-cream)', border: 'none' }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>☁️ Online Cloud Architecture</div>
            <div style={{ fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.8 }}>
              <div><strong>Status:</strong> Connected to PaperGen Online Server</div>
              <div><strong>Storage:</strong> Fully online server database. Zero data is stored on local devices.</div>
              <div><strong>Question Bank:</strong> 489,558 official questions across JEE Main, JEE Advanced, NEET UG, and MHT-CET.</div>
              <div><strong>Sync:</strong> Real-time server persistence for question papers, custom questions, and teacher profile.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
