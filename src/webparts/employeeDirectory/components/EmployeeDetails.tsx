import * as React from 'react';
import { IEmployee } from '../../../utils/types';
import { Stack, Text, Persona, PersonaSize, PrimaryButton } from '@fluentui/react';
import { initialsFromName, colorFromString } from '../../../utils/helper';
import { IEmployeeDirectoryProps } from './IEmployeeDirectoryProps';

interface IEmployeeDetailsProps extends IEmployeeDirectoryProps {
  selected: IEmployee;
  onClose: () => void;
}

export const EmployeeDetails: React.FC<IEmployeeDetailsProps> = ({ selected, onClose }) => {
    if (!selected) return null;

    const initials = initialsFromName(selected.EmployeeName || selected.Title);
    const bgColor = colorFromString(selected.EmployeeName || selected.Title);

    // Map status to colors
    const statusColors: Record<string, string> = {
        Active: 'green',
        Remote: 'teal',
        OnLeave: 'orange',
        Resigned: 'red'
    };
    const statusColor = statusColors[selected.Status || ''] || 'gray';

    return (
        <Stack tokens={{ childrenGap: 24 }} styles={{ root: { padding: 16, border: '1px solid #eef2f6', borderRadius: 8, background: '#fcfeff' } }}>
            <h1>Employee Details</h1>

            <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 12 }}>
                <Persona
                    text={selected.EmployeeName}
                    secondaryText={selected.JobTitle}
                    size={PersonaSize.size100}
                    imageInitials={initials}
                    initialsColor={bgColor}
                    styles={{
                        primaryText: { fontSize: 24, fontWeight: 700 },
                        secondaryText: { fontSize: 18 }
                    }}
                />
            </Stack>

            <Stack tokens={{ childrenGap: 15 }}>
                <Text styles={{ root: { fontSize: 18 } }}>
                    <strong>Employee ID:</strong> {selected.Title}
                </Text>
                <Text styles={{ root: { fontSize: 18 } }}>
                    <strong>Department:</strong> {selected.Department || "—"}
                </Text>
                <Text styles={{ root: { fontSize: 18 } }}>
                    <strong>Email:</strong> {selected.Email || "—"}
                </Text>
                <Text styles={{ root: { fontSize: 18 } }}>
                    <strong>Phone:</strong> {selected.Phone || "—"}
                </Text>
                <Text styles={{ root: { fontSize: 18 } }}>
                    <strong>Manager:</strong> {selected.Manager?.Title || "—"}
                </Text>
                <Text styles={{ root: { fontSize: 18 } }}>
  <strong>Status:</strong>{' '}
  <span style={{ color: statusColor }}>
    {selected.Status || '—'}
  </span>
</Text>
                <Text styles={{ root: { fontSize: 18 } }}>
                    <strong>Joining Date:</strong> {selected.JoiningDate || "—"}
                </Text>
            </Stack>

            <Stack horizontal horizontalAlign="end" styles={{ root: { marginTop: 12 } }}>
                <PrimaryButton 
                    text="Close" 
                    onClick={onClose} 
                    styles={{
                        root: { backgroundColor: '#e53935', color: '#fff', border: 'none' },
                        rootHovered: { backgroundColor: '#d32f2f', border: 'none' },
                        rootPressed: { backgroundColor: '#d32f2f', border: 'none' },
                        rootChecked: { backgroundColor: '#d32f2f', border: 'none' }
                    }} 
                />
            </Stack>
        </Stack>
    );
};
