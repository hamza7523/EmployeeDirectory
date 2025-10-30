import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { spfi, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';

import { IEmployeeDirectoryProps } from './IEmployeeDirectoryProps';
import { IEmployee } from '../models/IEmployee';

const defaultForm = { name: '', job: '', dept: '', email: '', phone: '' };

/* ---------- Types ---------- */
interface IRawSharePointItem {
  Id?: number;
  ID?: number;
  id?: number;
  Title?: string | { 
    Title?: string; 
    Name?: string; 
    DisplayName?: string; 
    FullName?: string; 
    Label?: string; 
    Email?: string; 
  };
  JobTitle?: string;
  Position?: string;
  Department?: string;
  Dept?: string;
  Email?: string;
  EMail?: string;
  Phone?: string;
  ContactNumber?: string;
  [key: string]: unknown;
}

/* ---------- Utilities ---------- */

function extractString(value: unknown): string | undefined {
  if (value === null) return undefined;
  if (typeof value === 'string') {
    const t = value.trim();
    return t.length ? t : undefined;
  }
  if (typeof value === 'number') return String(value);
  if (typeof value === 'object') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj: any = value as any;
    // Person/lookup fields often expose Title or Name
    if (typeof obj.Title === 'string' && obj.Title.trim()) return obj.Title.trim();
    if (typeof obj.Name === 'string' && obj.Name.trim()) return obj.Name.trim();
    if (typeof obj.DisplayName === 'string' && obj.DisplayName.trim()) return obj.DisplayName.trim();
    if (typeof obj.FullName === 'string' && obj.FullName.trim()) return obj.FullName.trim();
    if (typeof obj.Label === 'string' && obj.Label.trim()) return obj.Label.trim();
    if (typeof obj.Email === 'string' && obj.Email.trim()) return obj.Email.trim();
    // if array form, try first item
    if (Array.isArray(obj) && obj.length > 0) return extractString(obj[0]);
  }
  return undefined;
}

/** Return true if value looks like an employee code (EMP001, E-123, numeric codes) */
function looksLikeCode(val?: string): boolean {
  if (!val) return false;
  return /^[A-Za-z]{1,4}\d{2,6}$/.test(val) // EMP001, AB1234
    || /^E[-_]\d+$/i.test(val)
    || /^\d{3,6}$/.test(val);
}

/** Try to find a human name field in the raw item by scanning keys */
function findHumanName(raw: Record<string, unknown>): string | undefined {
  const keys = Object.keys(raw);
  // priority fields commonly used
  const priority = [
    'FullName', 'Full_x0020_Name', 'EmployeeName', 'Employee_x0020_Name',
    'DisplayName', 'PreferredName', 'Name', 'Title', 'Employee', 'Person',
    'Author', 'Editor', 'CreatedBy', 'ModifiedBy'
  ];

  // 1) Check priority list first (in order)
  for (const k of priority) {
    if (k in raw) {
      const v = extractString((raw as any)[k]);
      if (v && !looksLikeCode(v)) return v;
      // if v is code, keep searching
    }
  }

  // 2) Scan keys for name-like tokens
  for (const k of keys) {
    if (/name|fullname|display|preferred|employee|person|contact/i.test(k)) {
      const v = extractString(raw[k]);
      if (v && !looksLikeCode(v)) return v;
    }
  }

  // 3) Try any key that seems text-like and is not code
  for (const k of keys) {
    const v = extractString(raw[k]);
    if (v && v.length > 1 && !looksLikeCode(v)) {
      return v;
    }
  }

  // 4) fallback undefined
  return undefined;
}

/** Normalize a raw SharePoint item into our IEmployee shape */
function normalizeItem(raw: IRawSharePointItem): IEmployee {
  const Id = raw.Id ?? raw.ID ?? raw.id ?? 0;

  // Prefer a human name found in various columns; if none, fall back to Title (even if Title is code)
  const humanName = findHumanName(raw);
  const Title = humanName ?? extractString(raw.Title) ?? `#${Id}`;

  const JobTitle = extractString(raw.JobTitle) ?? extractString(raw.Position) ?? '';
  const Department = extractString(raw.Department) ?? extractString(raw.Dept) ?? '';
  const Email = extractString(raw.Email) ?? extractString(raw.EMail) ?? '';
  const Phone = extractString(raw.Phone) ?? extractString(raw.ContactNumber) ?? '';

  return {
    Id: Number(Id),
    Title,
    JobTitle,
    Department,
    Email,
    Phone,
  };
}

/** deterministic color from string */
function colorFromString(s: string): string {
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash << 5) - hash + s.charCodeAt(i);
  const h = Math.abs(hash) % 360;
  return `hsl(${h} 70% 45%)`;
}

function initialsFromName(name: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* ---------- Component ---------- */

export default function EmployeeDirectory(props: IEmployeeDirectoryProps): JSX.Element {
  const LIST_NAME = props.listName || 'Employees';
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [search, setSearch] = useState<string>('');
  const [form, setForm] = useState(defaultForm);
  const [selected, setSelected] = useState<IEmployee | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);

  // Create sp once per context
  const sp = useMemo(() => spfi().using(SPFx(props.context)), [props.context]);

  useEffect(() => {
    loadEmployees().catch((err) => {
      // eslint-disable-next-line no-console
      console.error('loadEmployees (useEffect) error', err);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.context, LIST_NAME]);

  async function loadEmployees(): Promise<void> {
    setLoading(true);
    setError(undefined);
    try {
      // Fetch items without $select so we can inspect all available fields
      // (callable pattern: invoke by calling ())
      const rawItems = await sp.web.lists.getByTitle(LIST_NAME).items();

      // Normalize: pick human-friendly name whenever available
      const normalized = (rawItems || []).map((r: IRawSharePointItem) => normalizeItem(r));
      setEmployees(normalized);
    } catch (err: unknown) {
      console.error('Load employees error (single call)', err);

      // fallback: paged iterator approach
      try {
        const all = await fetchAllEmployees();
        setEmployees(all);
      } catch (innerErr) {
        console.error('Load employees error (paged fallback)', innerErr);
        setEmployees([]);
        setError(String(innerErr || 'Failed to load employees.'));
      }
    } finally {
      setLoading(false);
    }
  }

  async function fetchAllEmployees(): Promise<IEmployee[]> {
    const pageSize = 2000;
    const list = sp.web.lists.getByTitle(LIST_NAME);

    let allItems: IEmployee[] = [];
    const iterator = list.items.top(pageSize);

    for await (const page of iterator) {
      const normalized = (page || []).map((r: IRawSharePointItem) => normalizeItem(r));
      allItems = allItems.concat(normalized);
    }

    return allItems;
  }

  async function addEmployee(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    setError(undefined);
    try {
      // Create with Title set to the name (common convention)
      await sp.web.lists.getByTitle(LIST_NAME).items.add({
        Title: form.name,
        JobTitle: form.job,
        Department: form.dept,
        Email: form.email,
        Phone: form.phone,
      });
      setForm(defaultForm);
      await loadEmployees();
    } catch (err: unknown) {
      console.error('Add item error', err);
      setError(String(err || 'Failed to add employee.'));
    } finally {
      setLoading(false);
    }
  }

  const filtered = employees.filter((emp) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (emp.Title || '').toLowerCase().indexOf(s) !== -1
      || (emp.Department || '').toLowerCase().indexOf(s) !== -1
      || (emp.Email || '').toLowerCase().indexOf(s) !== -1;
  });

  /* ---------- Styles ---------- */
  const containerStyle: React.CSSProperties = { 
    padding: 18, 
    maxWidth: 1100, 
    margin: '0 auto', 
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif'" 
  };
  
  const cardStyle: React.CSSProperties = { 
    background: '#fff', 
    borderRadius: 12, 
    padding: 18, 
    boxShadow: '0 8px 22px rgba(2,6,23,0.06)' 
  };
  
  const gridStyle: React.CSSProperties = { 
    display: 'grid', 
    gridTemplateColumns: '1fr 380px', 
    gap: 20, 
    alignItems: 'start' 
  };
  
  const searchStyle: React.CSSProperties = { 
    padding: '12px 14px', 
    width: '100%', 
    borderRadius: 10, 
    border: '1px solid #e8edf2', 
    outline: 'none', 
    boxSizing: 'border-box',
    fontSize: 14
  };
  
  const listStyle: React.CSSProperties = { 
    listStyle: 'none', 
    padding: 0, 
    margin: 0, 
    maxHeight: 520, 
    overflowY: 'auto' 
  };
  
  const itemStyle: React.CSSProperties = { 
    display: 'flex', 
    gap: 14, 
    padding: '14px 12px', 
    borderBottom: '1px solid #f3f6f9', 
    cursor: 'pointer', 
    alignItems: 'flex-start',
    transition: 'background 0.2s ease'
  };
  
  const avatar = (bg: string): React.CSSProperties => ({ 
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
  
  const nameStyle: React.CSSProperties = { 
    fontWeight: 700, 
    fontSize: 15, 
    color: '#091827', 
    marginBottom: 4,
    lineHeight: 1.3
  };
  
  const metaStyle: React.CSSProperties = { 
    fontSize: 13, 
    color: '#475569',
    lineHeight: 1.4
  };
  
  const rightColCard: React.CSSProperties = { 
    borderRadius: 10, 
    padding: 18, 
    border: '1px solid #eef2f6', 
    background: '#fcfeff' 
  };
  
  const formInputStyle: React.CSSProperties = { 
    padding: 10, 
    borderRadius: 8, 
    border: '1px solid #e8edf2', 
    width: '100%', 
    boxSizing: 'border-box',
    fontSize: 14
  };
  
  const rowEnd: React.CSSProperties = { 
    display: 'flex', 
    gap: 10, 
    justifyContent: 'flex-end', 
    marginTop: 8 
  };
  
  const primaryBtn: React.CSSProperties = { 
    padding: '9px 14px', 
    background: '#0ea5a9', 
    color: '#fff', 
    border: 'none', 
    borderRadius: 10, 
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14
  };
  
  const ghostBtn: React.CSSProperties = { 
    padding: '9px 14px', 
    background: 'transparent', 
    color: '#0f172a', 
    border: '1px solid #e8edf2', 
    borderRadius: 10, 
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14
  };

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20 }}>Employee Directory</h2>
          <div style={{ color: '#6b7280', fontSize: 13 }}>Search, view and add employees from the SharePoint list.</div>
        </div>
        <div style={{ fontSize: 12, color: '#6b7280' }}>List: <strong>{LIST_NAME}</strong></div>
      </div>

      <div style={cardStyle}>
        <div style={gridStyle}>
          {/* Left: Search + List */}
          <div>
            <div style={{ marginBottom: 12 }}>
              <input 
                placeholder="Search by name, department or email" 
                value={search} 
                onChange={(ev) => setSearch(ev.target.value)} 
                style={searchStyle} 
              />
            </div>

            {loading && <div style={{ padding: 12 }}>Loading employees...</div>}
            {error && <div style={{ padding: 12, color: 'red' }}>{error}</div>}

            <ul style={listStyle}>
              {filtered.length === 0 && !loading ? (
                <li style={{ padding: 18, color: '#6b7280' }}>No employees found.</li>
              ) : null}
              
              {filtered.map((emp) => (
                <li
                  key={emp.Id}
                  onClick={() => setSelected(emp)}
                  style={{
                    ...itemStyle,
                    background: selected?.Id === emp.Id 
                      ? 'linear-gradient(90deg, rgba(14,165,169,0.04), rgba(99,102,241,0.02))' 
                      : 'transparent',
                  }}
                >
                  <div style={avatar(colorFromString(emp.Title))}>
                    {initialsFromName(emp.Title)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
                    <div style={nameStyle}>{emp.Title}</div>
                    <div style={metaStyle}>
                      {emp.JobTitle || '—'}
                      {emp.JobTitle && emp.Department ? ' • ' + emp.Department : emp.Department ? ' • ' + emp.Department : ''}
                    </div>
                    <div style={{ 
                      fontSize: 12, 
                      color: '#6b7280', 
                      marginTop: 4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {emp.Email || 'No email'}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', minWidth: 60, paddingTop: 4, flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>ID</div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{emp.Id}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Form & Details */}
          <div style={rightColCard}>
            <form onSubmit={addEmployee}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Add Employee</div>

              <div style={{ display: 'grid', gap: 8 }}>
                <input 
                  required 
                  placeholder="Name" 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  style={formInputStyle} 
                />
                <input 
                  placeholder="Job Title" 
                  value={form.job} 
                  onChange={(e) => setForm({ ...form, job: e.target.value })} 
                  style={formInputStyle} 
                />
                <input 
                  placeholder="Department" 
                  value={form.dept} 
                  onChange={(e) => setForm({ ...form, dept: e.target.value })} 
                  style={formInputStyle} 
                />
                <input 
                  placeholder="Email" 
                  type="email" 
                  value={form.email} 
                  onChange={(e) => setForm({ ...form, email: e.target.value })} 
                  style={formInputStyle} 
                />
                <input 
                  placeholder="Phone" 
                  value={form.phone} 
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                  style={formInputStyle} 
                />
                <div style={rowEnd}>
                  <button 
                    type="button" 
                    onClick={() => setForm(defaultForm)} 
                    style={ghostBtn}
                  >
                    Clear
                  </button>
                  <button 
                    type="submit" 
                    style={primaryBtn} 
                    disabled={loading}
                  >
                    {loading ? 'Adding...' : 'Add'}
                  </button>
                </div>
              </div>
            </form>

            <div style={{ height: 20, borderTop: '1px solid #e8edf2', margin: '16px 0' }} />

            <div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Selected Employee</div>
              {selected ? (
                <div style={{ padding: 12, borderRadius: 8, border: '1px solid #eef2f6' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                    <div style={avatar(colorFromString(selected.Title))}>
                      {initialsFromName(selected.Title)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16 }}>{selected.Title}</div>
                      <div style={{ color: '#6b7280', fontSize: 13 }}>{selected.JobTitle || '—'}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: 13, color: '#374151' }}>
                    <div><strong>Department:</strong> {selected.Department || '—'}</div>
                    <div><strong>Email:</strong> {selected.Email || '—'}</div>
                    <div><strong>Phone:</strong> {selected.Phone || '—'}</div>
                    <div style={{ marginTop: 8 }}>
                      <button 
                        onClick={() => setSelected(undefined)} 
                        style={ghostBtn}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ color: '#6b7280' }}>Select an employee to view details.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}