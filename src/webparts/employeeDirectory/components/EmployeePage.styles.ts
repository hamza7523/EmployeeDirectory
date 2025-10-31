// EmployeePage.styles.ts
import type { CSSProperties } from 'react';


export const containerStyle: CSSProperties = { 
  padding: 18, 
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif'" 
};

export const cardStyle: CSSProperties = { 
  background: '#fff', 
  borderRadius: 12, 
  padding: 18, 
  boxShadow: '0 8px 22px rgba(2,6,23,0.06)' 
};

export const gridStyle: CSSProperties = { 
  display: 'grid', 
  gridTemplateColumns: '1fr 380px', 
  gap: 20, 
  alignItems: 'start' 
};

export const searchStyle: CSSProperties = { 
  padding: '12px 14px', 
  width: '100%', 
  borderRadius: 10, 
  border: '1px solid #e8edf2', 
  outline: 'none', 
  boxSizing: 'border-box',
  fontSize: 14
};

export const listStyle: CSSProperties = { 
  listStyle: 'none', 
  padding: 0, 
  margin: 0, 
  maxHeight: 520, 
  overflowY: 'auto', 
  width: '100%'
};

export const itemStyle: CSSProperties = { 
  display: 'flex', 
  gap: 14, 
  padding: '14px 12px', 
  borderBottom: '1px solid #f3f6f9', 
  cursor: 'pointer', 
  alignItems: 'flex-start',
  transition: 'background 0.2s ease'
};

export const avatar = (bg: string): CSSProperties => ({ 
  width: 48, 
  height: 48, 
  borderRadius: '50%', 
  display: 'inline-flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  color: '#fff', 
  background: bg, 
  fontWeight: 700, 
  fontSize: 14,
  flexShrink: 0
});

export const nameStyle: CSSProperties = { 
  fontWeight: 700, 
  fontSize: 15, 
  color: '#091827', 
  marginBottom: 4,
  lineHeight: 1.3
};

export const metaStyle: CSSProperties = { 
  fontSize: 13, 
  color: '#475569',
  lineHeight: 1.4
};

export const rightColCard: CSSProperties = { 
  borderRadius: 10, 
  padding: 18, 
  border: '1px solid #eef2f6', 
  background: '#fcfeff' 
};

export const formInputStyle: CSSProperties = { 
  padding: 10, 
  borderRadius: 8, 
  border: '1px solid #e8edf2', 
  width: '100%', 
  boxSizing: 'border-box',
  fontSize: 14
};

export const rowEnd: CSSProperties = { 
  display: 'flex', 
  gap: 10, 
  justifyContent: 'flex-end', 
  marginTop: 8 
};

export const ghostBtn: CSSProperties = { 
  padding: '9px 14px', 
  background: 'transparent', 
  color: '#0f172a', 
  border: '1px solid #e8edf2', 
  borderRadius: 10, 
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 14
};
