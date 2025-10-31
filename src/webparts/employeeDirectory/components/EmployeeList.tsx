import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  containerStyle,
  cardStyle,
  searchStyle,
  listStyle,
  itemStyle,
  avatar,
  nameStyle,
  metaStyle
} from './EmployeePage.styles';
import { spfi, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';

import { IEmployee } from '../../../utils/types';
import { IEmployeeDirectoryProps } from './IEmployeeDirectoryProps';

interface IEmployeeListProps extends IEmployeeDirectoryProps {
  onSelect?: (emp: IEmployee) => void;
}

interface IRawEmployeeItem {
  Id: number;
  Title: string;
  EmployeeName?: string;
  JobTitle?: string;
  Department?: string;
  Email?: string;
  Phone?: string;
  Status?: string;
  JoiningDate?: string;
  Manager?: {
    Id?: number;
    Title?: string;
  };
  [key: string]: unknown;
}

// ---------------- Utilities ----------------
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

// ---------------- Component ----------------
export const EmployeeList: React.FC<IEmployeeListProps> = ({ context, listName, onSelect }) => {
  const LIST_NAME = listName || 'Employees';
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [search, setSearch] = useState<string>('');
  const [selected, setSelected] = useState<IEmployee>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>();

  const sp = useMemo(() => spfi().using(SPFx(context)), [context]);

  useEffect(() => {
    const fetchEmployees = async (): Promise<void> => {

      setLoading(true);
      setError(undefined);

      try {
        const rawItems: IRawEmployeeItem[] = await sp.web.lists
          .getByTitle(LIST_NAME)
          .items
          .select(
            'Id',
            'Title',
            'EmployeeName',
            'JobTitle',
            'Department',
            'Email',
            'Phone',
            'Status',
            'JoiningDate',
            'Manager/Id',
            'Manager/Title'
          )
          .expand('Manager')();

        const mapped: IEmployee[] = rawItems.map((item): IEmployee => ({
          Id: item.Id,
          Title: item.Title ?? '',
          EmployeeName: item.EmployeeName ?? item.Title ?? '',
          JobTitle: item.JobTitle ?? '',
          Department: item.Department ?? '',
          Email: item.Email ?? '',
          Phone: item.Phone ?? '',
          Status: item.Status ?? '',
          JoiningDate: item.JoiningDate ?? '',
          Manager: item.Manager
            ? {
                Id: item.Manager.Id ?? 0,
                Title: item.Manager.Title ?? ''
              }
            : undefined
        }));

        setEmployees(mapped);
      } catch (err: unknown) {
        console.error('Load employees error', err);
        setError(String(err ?? 'Failed to load employees.'));
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees().catch(console.error);
  }, [sp, LIST_NAME]);

  const filtered = employees.filter(emp => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      emp.EmployeeName?.toLowerCase().includes(s) ||
      emp.Department?.toLowerCase().includes(s) ||
      emp.Email?.toLowerCase().includes(s) ||
      emp.Title?.toLowerCase().includes(s)
    );
  });

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <h1 style={{ margin: 0 }}>Employee Directory</h1>
          <div style={{ color: '#6b7280', fontSize: 13 }}>Search, view and add employees from the SharePoint list.</div>
        </div>
      </div>

      <div style={cardStyle}>
        <div>
          <div style={{ marginBottom: 12 }}>
            <input
              placeholder="Search by name, department or email"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={searchStyle}
            />
          </div>

          {loading && <div style={{ padding: 12 }}>Loading employees...</div>}
          {error && <div style={{ padding: 12, color: 'red' }}>{error}</div>}

          <ul style={listStyle}>
            {filtered.length === 0 && !loading && <li style={{ padding: 18, color: '#6b7280' }}>No employees found.</li>}

            {filtered.map(emp => (
              <li
                key={emp.Title}
                onClick={() => {
                  setSelected(emp);
                  onSelect?.(emp);
                }}
                style={{
                  ...itemStyle,
                  background: selected?.Id === emp.Id ? 'rgba(14,165,169,0.1)' : 'transparent',
                }}
              >
                <div style={avatar(colorFromString(emp.EmployeeName || emp.Title))}>
                  {initialsFromName(emp.EmployeeName || emp.Title)}
                </div>

                <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
                  <div style={nameStyle}>{emp.EmployeeName}</div>
                  <div style={metaStyle}>
                    {emp.JobTitle || '—'}
                    {emp.JobTitle && emp.Department ? ' • ' + emp.Department : emp.Department ? ' • ' + emp.Department : ''}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {emp.Email || 'No email'}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                    <strong>Manager:</strong> {emp.Manager?.Title || '—'}
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
      </div>
    </div>
  );
};
