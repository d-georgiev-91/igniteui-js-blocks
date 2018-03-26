export abstract class IgxExporterOptionsBase {
    private _fileName: string;

    public ignoreColumnsVisibility = false;
    public ignoreFiltering = false;
    public ignoreColumnsOrder = false;

    // public ignoreSorting: boolean;
    // public ignoreSummaries: boolean;

    constructor(fileName: string, private _fileExtension: string) {
        this.setFileName(fileName);
    }

    private setFileName(fileName: string): void {
        this._fileName = fileName + (fileName.endsWith(this._fileExtension) === false ? this._fileExtension : "");
    }

    get fileName() {
        return this._fileName;
    }

    set fileName(value) {
        this.setFileName(value);
    }

}
