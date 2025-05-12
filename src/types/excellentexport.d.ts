declare module "excellentexport" {
  export interface ExcelOptions {
    table: HTMLTableElement;
    filename: string;
    name?: string;
    sheet?: {
      name: string;
    };
  }

  export interface ConvertOptions {
    anchor: HTMLAnchorElement;
    filename: string;
    format: "xlsx" | "xls" | "csv";
  }

  export interface SheetOptions {
    name: string;
    from: {
      table?: string;
      data?: any[];
    };
  }

  const ExcellentExport: {
    convert: (options: ConvertOptions, sheets: SheetOptions[]) => boolean;
    excel: (options: ExcelOptions) => boolean;
  };

  export default ExcellentExport;
}
