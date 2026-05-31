import React, { useState } from 'react';
import { 
  Grid3X3, 
  AlertOctagon, 
  ShieldAlert, 
  Info,
  ChevronRight
} from 'lucide-react';

export default function RiskHeatmap({ 
  findings, 
  setActiveTab 
}) {
  const [selectedCell, setSelectedCell] = useState(null);

  // Map findings to a 4x4 matrix based on severity & description keyword analysis
  const getMatrixCoordinates = (finding) => {
    const sev = finding.severity;
    const title = finding.title.toLowerCase();

    let y = 0; // Notice Probability (0: Negligible, 1: Low, 2: Medium, 3: High)
    let x = 0; // Tax Value Exposure (0: Low, 1: Medium, 2: High, 3: Extreme)

    if (sev === "critical") {
      y = 3; 
      x = 3;
    } else if (sev === "high") {
      y = 2;
      x = 2;
      if (title.includes("omission") || title.includes("round-tripping")) {
        x = 3;
      }
    } else if (sev === "medium") {
      y = 1;
      x = 1;
      if (title.includes("mutual")) {
        y = 2;
        x = 2;
      }
    } else {
      y = 0;
      x = 0;
    }

    return { x, y };
  };

  // 4x4 Grid definition
  const yLabels = ["High Notice Risk", "Medium Notice Risk", "Low Notice Risk", "Negligible Notice"];
  const xLabels = ["Low Value Exposure", "Medium Value Exposure", "High Value Exposure", "Extreme Value Exposure"];
  
  // Matrix cells mapping
  const matrix = Array(4).fill(null).map(() => Array(4).fill(null).map(() => []));
  
  findings.forEach(finding => {
    const { x, y } = getMatrixCoordinates(finding);
    matrix[y][x].push(finding);
  });

  // Cell color classes mapping
  const getCellClass = (y, x) => {
    const sum = y + x;
    if (sum >= 5) return "risk-critical-2";
    if (sum === 4) return "risk-critical-1";
    if (sum === 3) return "risk-high-2";
    if (sum === 2) return "risk-medium-2";
    if (sum === 1) return "risk-medium-1";
    return "risk-low-1";
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Page Title */}
      <div>
        <h1 className="title-gradient" style={{ fontSize: '2.2rem', fontFamily: 'var(--font-head)', fontWeight: 800 }}>
          Interactive Risk Heatmap
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
          Mapping audit findings by financial liability exposure versus statutory notice probability.
        </p>
      </div>

      {findings.length === 0 ? (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '5rem 1rem', border: '1px dashed var(--border)', textAlign: 'center' }}>
          <Grid3X3 size={48} style={{ color: 'var(--accent)', opacity: 0.5 }} />
          <h4 style={{ fontWeight: 700 }}>Risk Matrix Empty</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '340px' }}>
            Please go to the **Upload Workspace** and load an audit package to visualize the tax exposure matrix.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem' }}>
          
          {/* Left Column: Heatmap Matrix */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-head)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <AlertOctagon size={18} style={{ color: 'var(--accent)' }} />
              <span>Tax Risk Profile Coordinates</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
              
              {/* Heatmap Grid */}
              <div className="heatmap-grid">
                
                {/* Headers */}
                <div className="heatmap-x-headers">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                  <span>Extreme</span>
                </div>

                {/* Grid Rows (Y-axis desc) */}
                {Array(4).fill(null).map((_, yIdx) => {
                  const y = 3 - yIdx; // reverse to show High on top
                  return (
                    <React.Fragment key={yIdx}>
                      {/* Y axis Label */}
                      <div className="heatmap-label-y">
                        {y === 3 && "High Notice"}
                        {y === 2 && "Medium Notice"}
                        {y === 1 && "Low Notice"}
                        {y === 0 && "Negligible"}
                      </div>

                      {/* 4 Cells for this row */}
                      {Array(4).fill(null).map((_, x) => {
                        const cellFindings = matrix[y][x];
                        const count = cellFindings.length;
                        const cellClass = getCellClass(y, x);
                        const isSelected = selectedCell && selectedCell.x === x && selectedCell.y === y;

                        return (
                          <div 
                            key={x}
                            className={`heatmap-cell ${cellClass}`}
                            style={{ 
                              outline: isSelected ? '3px solid var(--accent)' : 'none',
                              outlineOffset: '2px',
                              opacity: count === 0 ? 0.35 : 1
                            }}
                            onClick={() => count > 0 && setSelectedCell({ x, y, findings: cellFindings })}
                          >
                            <span className="heatmap-cell-count">{count > 0 ? count : ""}</span>
                            <span className="heatmap-cell-label">
                              {count > 0 ? `${count} Issues` : "Reconciled"}
                            </span>
                          </div>
                        );
                      })}
                    </React.Fragment>
                  );
                })}

                {/* X axis Label */}
                <div className="heatmap-label-x">
                  Financial Exposure Value (Tax liability / Penalty liability)
                </div>

              </div>

            </div>
          </div>

          {/* Right Column: Selected Cell Findings Detail */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-head)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ShieldAlert size={18} style={{ color: 'var(--color-critical)' }} />
              <span>Risk Coordinates Inspector</span>
            </h3>

            {!selectedCell ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '4rem 1rem', border: '1px dashed var(--border)', borderRadius: '8px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                <Info size={32} style={{ color: 'var(--accent)', opacity: 0.6 }} />
                <h4 style={{ fontWeight: 600, fontSize: '0.9rem' }}>Select active matrix cells</h4>
                <p style={{ fontSize: '0.75rem', maxWidth: '240px' }}>
                  Click on any colored cell in the risk matrix containing items to inspect detailed tax codes.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '6px', borderBottom: '2px solid var(--accent)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Coordinates Active</div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                    Notice Prob: <span style={{ color: 'var(--accent)' }}>{yLabels[3 - selectedCell.y]}</span> <br />
                    Exposure: <span style={{ color: 'var(--accent)' }}>{xLabels[selectedCell.x]}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '320px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                  {selectedCell.findings.map((f) => (
                    <div 
                      key={f.id}
                      style={{ 
                        padding: '0.75rem',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        background: 'var(--bg-secondary)',
                        cursor: 'pointer'
                      }}
                      onClick={() => setActiveTab('findings')}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className={`badge badge-${f.severity}`} style={{ fontSize: '0.65rem' }}>
                          {f.severity}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                          {f.taxSection}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '0.4rem' }}>{f.title}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.3 }}>
                        {f.description.slice(0, 85)}...
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 600, marginTop: '0.4rem' }}>
                        <span>Open details drawer</span>
                        <ChevronRight size={10} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
