import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IEmployeeDirectoryProps {
  context: WebPartContext;
  listName?: string;
  description?: string;
  isDarkTheme?: boolean;
  environmentMessage?: string;
  hasTeamsContext?: boolean;
  userDisplayName?: string;
}