import type { Company } from "./company";

export type SearchFilters = {
  region: string;
  headcount: string;
  maxCompanies: number;
};

export type Search = {
  id: string;
  query: string;
  filters: SearchFilters;
  createdAt: string;
  companies: Company[];
};
