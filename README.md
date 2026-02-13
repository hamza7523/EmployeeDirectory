# Employee Directory - SharePoint Framework Web Part

## Summary

A modern, feature-rich Employee Directory web part built with SharePoint Framework (SPFx). This solution provides an intuitive interface for managing and viewing employee information within your SharePoint environment. The web part includes search functionality, detailed employee profiles, and the ability to add new employees directly from the interface.

## Features

### Core Functionality
- **Employee Listing**: Browse all employees with a clean, card-based interface
- **Advanced Search**: Search employees by name, department, email, or employee ID
- **Employee Details**: View comprehensive employee information including:
  - Employee ID and Name
  - Job Title and Department
  - Contact Information (Email & Phone)
  - Manager Information
  - Employment Status
  - Joining Date
- **Add New Employees**: Built-in form to add new employees with auto-generated employee IDs
- **Responsive Design**: Optimized for desktop and mobile viewing
- **Real-time Updates**: Automatic list refresh after creating new employees

### User Interface
- Modern, clean design with Fluent UI components
- Color-coded status indicators (Active, Remote, On Leave, Resigned)
- Avatar generation with initials and unique colors for each employee
- Smooth transitions and interactive elements
- Dark-themed header with branding

## Used SharePoint Framework Version

SPFx 1.21.1

## Applies to

- [SharePoint Framework](https://aka.ms/spfx)
- [Microsoft 365 tenant](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)
- SharePoint Online
- Microsoft Teams (as a Teams Tab or Personal App)

> Get your own free development tenant by subscribing to [Microsoft 365 developer program](http://aka.ms/o365devprogram)

## Prerequisites

Before you begin, ensure you have the following:

### Software Requirements
- **Node.js** v22.14.0 or higher (< v23.0.0)
- **npm** (comes with Node.js)
- **Gulp** CLI installed globally: `npm install -g gulp-cli`
- **Yeoman** and **SharePoint Generator** (optional, for scaffolding)

### SharePoint Requirements
- SharePoint Online tenant with app catalog
- Permissions to create SharePoint lists
- Permissions to add custom web parts to pages

### SharePoint List Structure
Create a SharePoint list named **"Employees"** with the following columns:

| Column Name | Type | Required | Description |
|-------------|------|----------|-------------|
| Title | Single line of text | Yes | Employee ID (e.g., EMP001) |
| EmployeeName | Single line of text | Yes | Full name of the employee |
| JobTitle | Single line of text | Yes | Job position/title |
| Department | Choice | No | Department (HR, Finance, IT, Marketing, Operations, Procurement, Sales) |
| Email | Single line of text | No | Email address |
| Phone | Single line of text | No | Contact number |
| Manager | Person or Group | No | Employee's manager |
| Status | Choice | No | Employment status (Active, Remote, OnLeave, Resigned) |
| JoiningDate | Date and Time | No | Date employee joined |

## Solution

| Solution | Author(s) |
| -------- | --------- |
| employee-directory | MAX12 Development Team |

## Version History

| Version | Date | Comments |
| ------- | ---- | -------- |
| 1.0.2.0 | February 2026 | Enhanced UI with status indicators and manager information |
| 1.0.0.0 | Initial | Initial release with basic CRUD functionality |

## Installation & Configuration

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/employee-directory.git
cd employee-directory
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure the Solution

#### Update serve.json
Edit `config/serve.json` and update the `initialPage` URL to match your SharePoint site:
```json
{
  "initialPage": "https://yourtenant.sharepoint.com/sites/YourSite/_layouts/workbench.aspx"
}
```

#### Update package-solution.json (Optional)
Edit `config/package-solution.json` to customize the solution name and metadata:
```json
{
  "solution": {
    "name": "employee-directory-client-side-solution",
    "id": "12eb1ced-7633-41ab-b2a1-221211335b98"
  }
}
```

### 4. Build and Test Locally

#### Serve the web part locally
```bash
gulp serve
```
This will:
- Start the local development server on https://localhost:4321
- Open your SharePoint workbench
- Allow you to add the web part to the page

#### Build the solution
```bash
gulp build
```

#### Bundle the solution
```bash
gulp bundle --ship
```

#### Package the solution
```bash
gulp package-solution --ship
```

### 5. Deploy to SharePoint

1. Navigate to your SharePoint App Catalog
2. Upload the `.sppkg` file from `sharepoint/solution/employee-directory.sppkg`
3. Check "Make this solution available to all sites in the organization"
4. Click **Deploy**

### 6. Add to a SharePoint Page

1. Navigate to your SharePoint site
2. Create or edit a page
3. Click **+** to add a web part
4. Search for "employee-directory"
5. Add the web part to your page

### 7. Configure the Web Part

1. Click the **Edit** (pencil) icon on the web part
2. In the property pane, configure:
   - **Description**: Optional description for the web part
   - **List Name**: Enter "Employees" (or your custom list name)
3. Save and publish the page

## Usage

### Viewing Employees
- Browse through the employee list in the main view
- Use the search box to filter by name, department, email, or ID
- Click on any employee to view their full details

### Adding New Employees
1. Click the **Add Employee** button in the top-right corner
2. Fill in the employee information:
   - Employee Name (required)
   - Job Title (required)
   - Department (optional dropdown)
   - Phone (optional)
   - Status (optional dropdown)
   - Joining Date (optional)
3. Click **Save** to add the employee
4. The system automatically generates a unique Employee ID

### Employee Details View
- View comprehensive employee information
- See color-coded employment status
- View manager information
- Click **Close** to return to the employee list

## Technical Architecture

### Technologies Used
- **SharePoint Framework (SPFx)** 1.21.1
- **React** 17.0.1
- **TypeScript** 5.3.3
- **Fluent UI React** (@fluentui/react) 8.106.4
- **PnPjs** 4.17.0 - SharePoint data access
- **Office UI Fabric Core** - Styling

### Project Structure
```
employee-directory/
├── config/                      # SPFx configuration files
│   ├── config.json             # Bundle configuration
│   ├── package-solution.json   # Solution package configuration
│   └── serve.json              # Development server configuration
├── src/
│   ├── utils/
│   │   ├── helper.ts           # Utility functions (initials, colors)
│   │   └── types.ts            # TypeScript interfaces
│   └── webparts/
│       └── employeeDirectory/
│           ├── components/
│           │   ├── EmployeeDirectory.tsx      # Main container component
│           │   ├── EmployeeList.tsx           # Employee listing component
│           │   ├── EmployeeDetails.tsx        # Detail view component
│           │   ├── CreateEmployee.tsx         # Add employee form
│           │   └── *.styles.ts                # Component styles
│           ├── services/
│           │   └── EmployeeService.ts         # SharePoint data service
│           └── EmployeeDirectoryWebPart.ts    # Web part entry point
├── package.json                # NPM dependencies
└── tsconfig.json              # TypeScript configuration
```

### Key Components

#### EmployeeDirectory.tsx
Main container component that manages view states (list, details, create) and navigation between views.

#### EmployeeList.tsx
Displays all employees with search functionality. Uses PnPjs for efficient SharePoint list querying with select and expand operations.

#### EmployeeDetails.tsx
Shows detailed employee information with Fluent UI Persona component and status indicators.

#### CreateEmployee.tsx
Form component for adding new employees with auto-generated employee IDs (EMP001, EMP002, etc.).

### Data Access
The solution uses **PnPjs v4** for SharePoint data operations:
- Efficient querying with `select()` and `expand()`
- Type-safe operations
- Automatic batching support
- Built-in error handling

## Customization

### Changing Department Options
Edit `src/webparts/employeeDirectory/components/CreateEmployee.tsx`:
```typescript
const departmentOptions: IDropdownOption[] = [
  { key: 'Your Department', text: 'Your Department' },
  // Add more departments
];
```

### Changing Status Options
Edit the status options in `CreateEmployee.tsx`:
```typescript
const statusOptions: IDropdownOption[] = [
  { key: 'YourStatus', text: 'Your Status' },
  // Add more statuses
];
```

### Styling Customization
Modify the styles in:
- `src/webparts/employeeDirectory/components/EmployeePage.styles.ts` - Inline styles
- `src/webparts/employeeDirectory/components/EmployeeDirectory.module.scss` - SCSS styles

### Branding
Update the header branding in `EmployeeDirectory.tsx`:
```typescript
<div style={{ fontWeight: 700, fontSize: 25, color: 'white' }}>
  YOUR COMPANY NAME
</div>
```

## Troubleshooting

### Common Issues

**Issue**: "List 'Employees' does not exist"
- **Solution**: Ensure the SharePoint list is created with the exact name "Employees" or update the list name in the web part properties

**Issue**: Missing employee data
- **Solution**: Verify all required columns exist in the SharePoint list and match the expected internal names

**Issue**: Web part not appearing
- **Solution**: Ensure the solution is deployed to the app catalog and added to the site's app list

**Issue**: Build errors
- **Solution**: Clear the node_modules and reinstall:
  ```bash
  rm -rf node_modules
  npm install
  ```

## Performance Considerations

- The solution uses efficient PnPjs queries with select/expand
- Employee list items are filtered client-side for responsive search
- Avatar colors are generated using hash functions for consistency
- Component state management minimizes re-renders

## Browser Support

- Microsoft Edge (Chromium)
- Google Chrome
- Mozilla Firefox
- Safari (macOS)

## Security & Permissions

The web part requires:
- **Read** permissions on the Employees list
- **Write** permissions to add new employees
- Inherits SharePoint site permissions

## License

**THIS CODE IS PROVIDED _AS IS_ WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

## References

- [SharePoint Framework Documentation](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/sharepoint-framework-overview)
- [Fluent UI React Components](https://developer.microsoft.com/en-us/fluentui#/controls/web)
- [PnPjs Documentation](https://pnp.github.io/pnpjs/)
- [Building for Microsoft Teams](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/build-for-teams-overview)
- [Microsoft 365 Patterns and Practices](https://aka.ms/m365pnp)

## Support

For issues, questions, or contributions, please create an issue in the repository or contact the development team.

---

**Developed with ❤️ using SharePoint Framework**
