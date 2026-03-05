import { OrganizationUnit, JobLevel, EmploymentType } from "@prisma/client"

export interface OrgUnitWithParent extends OrganizationUnit {
  parent?: OrganizationUnit | null;
}

export interface SettingsDataProps {
  units: OrgUnitWithParent[];
  levels: JobLevel[];
  types: EmploymentType[];
}