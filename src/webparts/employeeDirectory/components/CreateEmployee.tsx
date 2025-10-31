import * as React from 'react';
import {
    Stack,
    TextField,
    Dropdown,
    IDropdownOption,
    PrimaryButton,
    DatePicker,
    Text
} from '@fluentui/react';
import { IEmployee } from '../../../utils/types';
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';

interface EmployeeFormProps {
    context:  WebPartContext;// SPFx context, could type as WebPartContext
    listName?: string;
    onSaved?: () => void; // callback after saving
}
interface IRawEmployeeItem {
  Title?: string;
  EmployeeName?: string;
  JobTitle?: string;
  Department?: string;
  Phone?: string;
  Status?: string;
  JoiningDate?: string;
}
export const CreateEmployee: React.FC<EmployeeFormProps> = ({
    context,
    listName = 'Employees',
    onSaved
}): JSX.Element => {
    const [form, setForm] = React.useState<Partial<IEmployee>>({});
    const [loading, setLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string>();

    const sp = React.useMemo(() => spfi().using(SPFx(context)), [context]);

    const departmentOptions: IDropdownOption[] = [
        { key: 'Human Resources (HR)', text: 'Human Resources (HR)' },
        { key: 'Finance', text: 'Finance' },
        { key: 'Information Technology (IT)', text: 'Information Technology (IT)' },
        { key: 'Marketing', text: 'Marketing' },
        { key: 'Operations', text: 'Operations' },
        { key: 'Procurement', text: 'Procurement' },
        { key: 'Sales', text: 'Sales' },
    ];

    const statusOptions: IDropdownOption[] = [
        { key: 'Active', text: 'Active' },
        { key: 'Remote', text: 'Remote' },
        { key: 'OnLeave', text: 'On Leave' },
        { key: 'Resigned', text: 'Resigned' },
    ];

    const handleChange = (field: keyof IEmployee, value: string | undefined): void => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (): Promise<void> => {
        if (!form.EmployeeName || !form.JobTitle) {
            alert('Employee Name and Job Title are required.');
            return;
        }

        setLoading(true);
        setError(undefined);

        try {
            // Fetch existing employees to determine next ID
            const existingItems = await sp.web.lists.getByTitle(listName).items.select('Title')();

const existingIds = (existingItems as IRawEmployeeItem[])
  .map(item => parseInt(item.Title?.replace(/^EMP/, '') || '0', 10))
  .filter(n => !isNaN(n));

            const nextNum = (existingIds.length ? Math.max(...existingIds) + 1 : 1)
                .toString()
                .padStart(3, '0');

            const newEmployeeId = `EMP${nextNum}`;

            // Add new employee item
            await sp.web.lists.getByTitle(listName).items.add({
                Title: newEmployeeId,
                EmployeeName: form.EmployeeName,
                JobTitle: form.JobTitle,
                Department: form.Department,
                Phone: form.Phone,
                Status: form.Status,
                JoiningDate: form.JoiningDate,
            });

            alert('Employee saved successfully!');
            setForm({});
            onSaved?.();
        } catch (err: unknown) {
            console.error(err);
            setError('Failed to save employee. ' + ((err as Error)?.message ?? ''));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Stack
            tokens={{ childrenGap: 15 }}
            styles={{
                root: {
                   
                    padding: 20,
                    border: '1px solid #eee',
                    borderRadius: 8,
                },
            }}
        >
            <h1>Add New Employee</h1>

            {error && <Text style={{ color: 'red' }}>{error}</Text>}

            <TextField
                label="Employee Name"
                value={form.EmployeeName || ''}
                onChange={(_, v) => handleChange('EmployeeName', v)}
                required
            />

            <TextField
                label="Job Title"
                value={form.JobTitle || ''}
                onChange={(_, v) => handleChange('JobTitle', v)}
                required
            />

            <Dropdown
                label="Department"
                options={departmentOptions}
                selectedKey={form.Department}
                onChange={(_, option) => handleChange('Department', option?.key as string)}
            />

            <TextField
                label="Phone"
                value={form.Phone || ''}
                onChange={(_, v) => handleChange('Phone', v)}
            />

            <Dropdown
                label="Status"
                options={statusOptions}
                selectedKey={form.Status}
                onChange={(_, option) => handleChange('Status', option?.key as string)}
            />

            <DatePicker
                label="Joining Date"
                value={form.JoiningDate ? new Date(form.JoiningDate) : undefined}
                onSelectDate={date => handleChange('JoiningDate', date?.toISOString())}
            />

            <Stack horizontal tokens={{ childrenGap: 10 }} horizontalAlign="end">
                <PrimaryButton
                    text="Cancel"
                    onClick={() => onSaved?.()} // go back to list
                    styles={{
                        root: { backgroundColor: '#e53935', color: '#fff', border: 'none' },
                        rootHovered: { backgroundColor: '#d32f2f', border: 'none' },
                        rootPressed: { backgroundColor: '#d32f2f', border: 'none' },
                        rootChecked: { backgroundColor: '#d32f2f', border: 'none' },
                    }}
                />
                <PrimaryButton
                    text={loading ? 'Saving...' : 'Save'}
                    onClick={handleSubmit}
                    disabled={loading}
                    styles={{
                        root: { backgroundColor: '#198754', color: '#fff', border: 'none' },
                        rootHovered: { backgroundColor: '#157347', border: 'none' },
                        rootPressed: {
      backgroundColor: '#157347', border: 'none' 
    },
    rootChecked: {
     backgroundColor: '#157347', border: 'none' 
                    }}}
                />
            </Stack>
        </Stack>
    );
};
