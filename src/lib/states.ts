// State-specific constants. Refreshed annually per scripts/update-year.md.
// Sources: Tax Foundation (income tax, property tax), KFF Employer Health Benefits Survey.
// Snapshot year: 2026.

export type StateCode =
  | "AL" | "AK" | "AZ" | "AR" | "CA" | "CO" | "CT" | "DE" | "DC" | "FL"
  | "GA" | "HI" | "ID" | "IL" | "IN" | "IA" | "KS" | "KY" | "LA" | "ME"
  | "MD" | "MA" | "MI" | "MN" | "MS" | "MO" | "MT" | "NE" | "NV" | "NH"
  | "NJ" | "NM" | "NY" | "NC" | "ND" | "OH" | "OK" | "OR" | "PA" | "RI"
  | "SC" | "SD" | "TN" | "TX" | "UT" | "VT" | "VA" | "WA" | "WV" | "WI" | "WY";

export type StateData = {
  name: string;
  topMarginalRate: number;
  effectiveRateMiddleClass: number;
  avgPropertyTaxRate: number;
  avgHealthPremiumFamily: number;
};

export const STATES: Record<StateCode, StateData> = {
  AL: { name: "Alabama", topMarginalRate: 0.05, effectiveRateMiddleClass: 0.04, avgPropertyTaxRate: 0.0041, avgHealthPremiumFamily: 19800 },
  AK: { name: "Alaska", topMarginalRate: 0, effectiveRateMiddleClass: 0, avgPropertyTaxRate: 0.0104, avgHealthPremiumFamily: 23400 },
  AZ: { name: "Arizona", topMarginalRate: 0.025, effectiveRateMiddleClass: 0.025, avgPropertyTaxRate: 0.0062, avgHealthPremiumFamily: 21900 },
  AR: { name: "Arkansas", topMarginalRate: 0.039, effectiveRateMiddleClass: 0.035, avgPropertyTaxRate: 0.0061, avgHealthPremiumFamily: 20400 },
  CA: { name: "California", topMarginalRate: 0.133, effectiveRateMiddleClass: 0.06, avgPropertyTaxRate: 0.0075, avgHealthPremiumFamily: 24600 },
  CO: { name: "Colorado", topMarginalRate: 0.044, effectiveRateMiddleClass: 0.044, avgPropertyTaxRate: 0.0051, avgHealthPremiumFamily: 22100 },
  CT: { name: "Connecticut", topMarginalRate: 0.0699, effectiveRateMiddleClass: 0.05, avgPropertyTaxRate: 0.0179, avgHealthPremiumFamily: 25300 },
  DE: { name: "Delaware", topMarginalRate: 0.066, effectiveRateMiddleClass: 0.052, avgPropertyTaxRate: 0.0061, avgHealthPremiumFamily: 22400 },
  DC: { name: "District of Columbia", topMarginalRate: 0.1075, effectiveRateMiddleClass: 0.065, avgPropertyTaxRate: 0.0057, avgHealthPremiumFamily: 24900 },
  FL: { name: "Florida", topMarginalRate: 0, effectiveRateMiddleClass: 0, avgPropertyTaxRate: 0.0089, avgHealthPremiumFamily: 22800 },
  GA: { name: "Georgia", topMarginalRate: 0.0539, effectiveRateMiddleClass: 0.05, avgPropertyTaxRate: 0.0092, avgHealthPremiumFamily: 21200 },
  HI: { name: "Hawaii", topMarginalRate: 0.11, effectiveRateMiddleClass: 0.065, avgPropertyTaxRate: 0.0029, avgHealthPremiumFamily: 22000 },
  ID: { name: "Idaho", topMarginalRate: 0.058, effectiveRateMiddleClass: 0.055, avgPropertyTaxRate: 0.0069, avgHealthPremiumFamily: 21700 },
  IL: { name: "Illinois", topMarginalRate: 0.0495, effectiveRateMiddleClass: 0.0495, avgPropertyTaxRate: 0.0223, avgHealthPremiumFamily: 22500 },
  IN: { name: "Indiana", topMarginalRate: 0.03, effectiveRateMiddleClass: 0.03, avgPropertyTaxRate: 0.0084, avgHealthPremiumFamily: 21100 },
  IA: { name: "Iowa", topMarginalRate: 0.038, effectiveRateMiddleClass: 0.038, avgPropertyTaxRate: 0.0152, avgHealthPremiumFamily: 22300 },
  KS: { name: "Kansas", topMarginalRate: 0.057, effectiveRateMiddleClass: 0.054, avgPropertyTaxRate: 0.0141, avgHealthPremiumFamily: 21500 },
  KY: { name: "Kentucky", topMarginalRate: 0.04, effectiveRateMiddleClass: 0.04, avgPropertyTaxRate: 0.0083, avgHealthPremiumFamily: 20900 },
  LA: { name: "Louisiana", topMarginalRate: 0.03, effectiveRateMiddleClass: 0.03, avgPropertyTaxRate: 0.0056, avgHealthPremiumFamily: 21000 },
  ME: { name: "Maine", topMarginalRate: 0.0715, effectiveRateMiddleClass: 0.058, avgPropertyTaxRate: 0.0128, avgHealthPremiumFamily: 23200 },
  MD: { name: "Maryland", topMarginalRate: 0.0575, effectiveRateMiddleClass: 0.0475, avgPropertyTaxRate: 0.0106, avgHealthPremiumFamily: 22900 },
  MA: { name: "Massachusetts", topMarginalRate: 0.09, effectiveRateMiddleClass: 0.05, avgPropertyTaxRate: 0.0114, avgHealthPremiumFamily: 24400 },
  MI: { name: "Michigan", topMarginalRate: 0.0425, effectiveRateMiddleClass: 0.0425, avgPropertyTaxRate: 0.0138, avgHealthPremiumFamily: 22000 },
  MN: { name: "Minnesota", topMarginalRate: 0.0985, effectiveRateMiddleClass: 0.0685, avgPropertyTaxRate: 0.0102, avgHealthPremiumFamily: 22700 },
  MS: { name: "Mississippi", topMarginalRate: 0.04, effectiveRateMiddleClass: 0.04, avgPropertyTaxRate: 0.008, avgHealthPremiumFamily: 20500 },
  MO: { name: "Missouri", topMarginalRate: 0.048, effectiveRateMiddleClass: 0.045, avgPropertyTaxRate: 0.0097, avgHealthPremiumFamily: 21400 },
  MT: { name: "Montana", topMarginalRate: 0.0575, effectiveRateMiddleClass: 0.055, avgPropertyTaxRate: 0.0074, avgHealthPremiumFamily: 22100 },
  NE: { name: "Nebraska", topMarginalRate: 0.052, effectiveRateMiddleClass: 0.05, avgPropertyTaxRate: 0.0167, avgHealthPremiumFamily: 22300 },
  NV: { name: "Nevada", topMarginalRate: 0, effectiveRateMiddleClass: 0, avgPropertyTaxRate: 0.0055, avgHealthPremiumFamily: 22400 },
  NH: { name: "New Hampshire", topMarginalRate: 0, effectiveRateMiddleClass: 0, avgPropertyTaxRate: 0.0189, avgHealthPremiumFamily: 23700 },
  NJ: { name: "New Jersey", topMarginalRate: 0.1075, effectiveRateMiddleClass: 0.0637, avgPropertyTaxRate: 0.0213, avgHealthPremiumFamily: 25800 },
  NM: { name: "New Mexico", topMarginalRate: 0.059, effectiveRateMiddleClass: 0.049, avgPropertyTaxRate: 0.008, avgHealthPremiumFamily: 21300 },
  NY: { name: "New York", topMarginalRate: 0.109, effectiveRateMiddleClass: 0.0645, avgPropertyTaxRate: 0.0172, avgHealthPremiumFamily: 26100 },
  NC: { name: "North Carolina", topMarginalRate: 0.0425, effectiveRateMiddleClass: 0.0425, avgPropertyTaxRate: 0.0082, avgHealthPremiumFamily: 21500 },
  ND: { name: "North Dakota", topMarginalRate: 0.025, effectiveRateMiddleClass: 0.02, avgPropertyTaxRate: 0.0098, avgHealthPremiumFamily: 21800 },
  OH: { name: "Ohio", topMarginalRate: 0.035, effectiveRateMiddleClass: 0.03, avgPropertyTaxRate: 0.0156, avgHealthPremiumFamily: 21900 },
  OK: { name: "Oklahoma", topMarginalRate: 0.0475, effectiveRateMiddleClass: 0.045, avgPropertyTaxRate: 0.009, avgHealthPremiumFamily: 20700 },
  OR: { name: "Oregon", topMarginalRate: 0.099, effectiveRateMiddleClass: 0.085, avgPropertyTaxRate: 0.0093, avgHealthPremiumFamily: 22800 },
  PA: { name: "Pennsylvania", topMarginalRate: 0.0307, effectiveRateMiddleClass: 0.0307, avgPropertyTaxRate: 0.0149, avgHealthPremiumFamily: 22600 },
  RI: { name: "Rhode Island", topMarginalRate: 0.0599, effectiveRateMiddleClass: 0.0475, avgPropertyTaxRate: 0.0153, avgHealthPremiumFamily: 23500 },
  SC: { name: "South Carolina", topMarginalRate: 0.064, effectiveRateMiddleClass: 0.055, avgPropertyTaxRate: 0.0057, avgHealthPremiumFamily: 21400 },
  SD: { name: "South Dakota", topMarginalRate: 0, effectiveRateMiddleClass: 0, avgPropertyTaxRate: 0.0132, avgHealthPremiumFamily: 21300 },
  TN: { name: "Tennessee", topMarginalRate: 0, effectiveRateMiddleClass: 0, avgPropertyTaxRate: 0.0071, avgHealthPremiumFamily: 21100 },
  TX: { name: "Texas", topMarginalRate: 0, effectiveRateMiddleClass: 0, avgPropertyTaxRate: 0.018, avgHealthPremiumFamily: 22400 },
  UT: { name: "Utah", topMarginalRate: 0.0465, effectiveRateMiddleClass: 0.0465, avgPropertyTaxRate: 0.0057, avgHealthPremiumFamily: 21600 },
  VT: { name: "Vermont", topMarginalRate: 0.0875, effectiveRateMiddleClass: 0.068, avgPropertyTaxRate: 0.0189, avgHealthPremiumFamily: 24100 },
  VA: { name: "Virginia", topMarginalRate: 0.0575, effectiveRateMiddleClass: 0.0525, avgPropertyTaxRate: 0.008, avgHealthPremiumFamily: 22600 },
  WA: { name: "Washington", topMarginalRate: 0, effectiveRateMiddleClass: 0, avgPropertyTaxRate: 0.0094, avgHealthPremiumFamily: 23100 },
  WV: { name: "West Virginia", topMarginalRate: 0.0482, effectiveRateMiddleClass: 0.045, avgPropertyTaxRate: 0.0058, avgHealthPremiumFamily: 20800 },
  WI: { name: "Wisconsin", topMarginalRate: 0.0765, effectiveRateMiddleClass: 0.053, avgPropertyTaxRate: 0.0161, avgHealthPremiumFamily: 22300 },
  WY: { name: "Wyoming", topMarginalRate: 0, effectiveRateMiddleClass: 0, avgPropertyTaxRate: 0.0058, avgHealthPremiumFamily: 22200 },
};

export const STATE_OPTIONS = Object.entries(STATES)
  .map(([code, data]) => ({ code: code as StateCode, name: data.name }))
  .sort((a, b) => a.name.localeCompare(b.name));
