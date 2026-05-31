import React from 'react';
import { 
  LayoutDashboard, 
  UploadCloud, 
  ShieldAlert, 
  Scale, 
  FileCheck2, 
  Grid3X3, 
  FileDown, 
  Settings as SettingsIcon,
  Lock,
  Sparkles,
  UserCheck
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  userRole, 
  setUserRole, 
  onCloseSession,
  activeSession 
}) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload Workspace', icon: UploadCloud },
    { id: 'findings', label: 'AI Audit Findings', icon: ShieldAlert },
    { id: 'reconciliation', label: 'Value Reconciliation', icon: Scale },
    { id: 'checklist', label: 'Compliance Checklist', icon: FileCheck2 },
    { id: 'heatmap', label: 'Risk Heatmap', icon: Grid3X3 },
    { id: 'report', label: 'Download Report', icon: FileDown },
    { id: 'settings', label: 'Settings & Logs', icon: SettingsIcon },
  ];

  return (
    <aside className="sidebar no-print">
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <Scale size={22} className="text-white" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-head)', fontWeight: 800 }}>Virtual CA</h2>
          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', tracking: '0.05em' }}>
            Raman Tech Copilot
          </span>
        </div>
      </div>

      <div className="sidebar-menu">
        {/* Role Selector Box */}
        <div className="role-box">
          <div className="role-box-title">Audit Persona</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={14} style={{ color: 'var(--accent)' }} />
            <select 
              value={userRole} 
              onChange={(e) => setUserRole(e.target.value)}
              className="role-select-dropdown"
            >
              <option value="individual">Taxpayer (ITR-1/4)</option>
              <option value="sme">Small Business (SME)</option>
              <option value="ca">Chartered Accountant (CA)</option>
              <option value="accountant">Consultant / Accountant</option>
            </select>
          </div>
        </div>

        {/* Navigation Items */}
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="sidebar-footer">
        {activeSession && (
          <div style={{ marginBottom: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '0.6rem', borderRadius: '6px', fontSize: '0.75rem' }}>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem' }}>Active Session Key</div>
            <div style={{ fontWeight: 600, color: 'var(--accent)', marginTop: '0.1rem' }}>
              {activeSession.consultationId}
            </div>
          </div>
        )}
        <button 
          onClick={onCloseSession}
          className="btn btn-secondary" 
          style={{ 
            width: '100%', 
            background: 'hsl(0, 85%, 20%)', 
            borderColor: 'hsl(0, 85%, 30%)', 
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem'
          }}
        >
          <Lock size={15} />
          <span>Close & Lock Session</span>
        </button>
      </div>
    </aside>
  );
}
