declare module "pdf-parse" {
  interface PdfParseResult {
    text: string;
    numpages: number;
    info?: Record<string, unknown>;
  }
  // pdf-parse accepts either a Buffer or a file path string.
  function pdfParse(data: string | Buffer): Promise<PdfParseResult>;
  export default pdfParse;
}
