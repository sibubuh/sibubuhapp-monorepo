export type FinancialReport = {
  title: string
  description: string
  downloadLink: string
}

export type QuarterlyReports = {
  q1?: FinancialReport[]
  q2?: FinancialReport[]
  q3?: FinancialReport[]
  q4?: FinancialReport[]
}

export type FinancialReportsByYear = {
  [year: string]: QuarterlyReports
}
