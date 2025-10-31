import * as React from 'react';
import { Stack, PrimaryButton } from '@fluentui/react';
import { EmployeeList } from './EmployeeList';
import { CreateEmployee } from './CreateEmployee';
import { EmployeeDetails } from './EmployeeDetails';
import { IEmployeeDirectoryProps } from './IEmployeeDirectoryProps';
import { IEmployee } from '../../../utils/types';

export const EmployeeDirectory: React.FC<IEmployeeDirectoryProps> = (props): JSX.Element => {
  const [view, setView] = React.useState<'list' | 'details' | 'create'>('list');
  const [selectedEmployee, setSelectedEmployee] = React.useState<IEmployee | null>(null);
  const [refreshKey, setRefreshKey] = React.useState<number>(0);

  // Handle selecting an employee from the list
  const handleSelectEmployee = (emp: IEmployee): void => {
    setSelectedEmployee(emp);
    setView('details');
  };

  // Go back to the employee list
  const handleBackToList = (): void => {
    setSelectedEmployee(null);
    setView('list');
    setRefreshKey(prev => prev + 1); // triggers list refresh
  };

  // Show the "Create Employee" form
  const handleAddNew = (): void => setView('create');

  // After creating a new employee
  const handleEmployeeSaved = (): void => {
    setView('list');
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Stack tokens={{ childrenGap: 20 }} styles={{ root: { padding: 20 } }}>
      <Stack
        horizontal
        horizontalAlign="space-between"
        verticalAlign="center"
        styles={{
          root: {
            padding: '10px 20px',
            backgroundColor: '#333',
            color: '#fff',
          }
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 25, color: 'white' }}>MAX12</div>
        {view === 'list' && (
          <PrimaryButton
            text="Add Employee"
            iconProps={{ iconName: 'Add' }}
            onClick={handleAddNew}
            styles={{
              root: {
                backgroundColor: '#333', // dark gray background
                color: '#fff',           // white text
                border: '1px solid #555',
                padding: '8px 16px',
                borderRadius: 4
              },
              rootHovered: {
                backgroundColor: '#222', // slightly lighter gray on hover
                border: '1px solid #555',
                borderRadius: 4
              },
              rootPressed: {
                backgroundColor: '#222', // slightly lighter gray on hover
                border: '1px solid #555',
                borderRadius: 4
              },
              rootChecked: {
                backgroundColor: '#222', // slightly lighter gray on hover
                border: '1px solid #555',
                borderRadius: 4
              }
            }}
          />

        )}
      </Stack>
      {view === 'list' && (
        <>

          <EmployeeList
            key={refreshKey}
            context={props.context}
            listName={props.listName || 'Employees'}
            onSelect={handleSelectEmployee}
            description={props.description || ''}
            isDarkTheme={props.isDarkTheme || false}
            environmentMessage={props.environmentMessage || ''}
            hasTeamsContext={props.hasTeamsContext || false}
            userDisplayName={props.userDisplayName || ''}
          />
        </>
      )}

      {view === 'details' && selectedEmployee && (
        <EmployeeDetails
          context={props.context}
          selected={selectedEmployee}
          onClose={handleBackToList}
        />
      )}

      {view === 'create' && (
        <CreateEmployee
          context={props.context}
          listName={props.listName}
          onSaved={handleEmployeeSaved}
        />
      )}
    </Stack>
  );
};
