import { WebPartContext } from "@microsoft/sp-webpart-base";
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { IEmployee } from "../models/IEmployee";

export class EmployeeService {
  private context: WebPartContext;
  private listName: string;

  constructor(context: WebPartContext, listName: string) {
    this.context = context;
    this.listName = listName;
  }

  public async getEmployees(): Promise<IEmployee[]> {
    try {
      const response: SPHttpClientResponse = await this.context.spHttpClient.get(
        `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listName}')/items?$select=Id,Title,JobTitle,Department,Email,Phone`,
        SPHttpClient.configurations.v1
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch employees: ${response.statusText}`);
      }

      const result = await response.json();
      return result.value as IEmployee[];
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  }

  public async getEmployeeById(id: number): Promise<IEmployee> {
    try {
      const response: SPHttpClientResponse = await this.context.spHttpClient.get(
        `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listName}')/items(${id})`,
        SPHttpClient.configurations.v1
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch employee: ${response.statusText}`);
      }

      const result = await response.json();
      return result as IEmployee;
    } catch (error) {
      console.error(`Error fetching employee with id ${id}:`, error);
      throw error;
    }
  }
}