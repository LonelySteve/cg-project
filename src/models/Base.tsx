export type Size = { width: number, height: number };
export type Point = { X: number, Y: number };
export type Rect = Size & Point;

export class Color {
    protected _red: number = 0;
    protected _blue: number = 0;
    protected _green: number = 0;
    protected _alpha: number = 255;

    static get transparent(): Color {
        return new Color(0, 0, 0, 0);
    }

    static get white(): Color {
        return new Color(255, 255, 255);
    }

    static get black(): Color {
        return new Color(0, 0, 0);
    }

    constructor(red: number, green: number, blue: number, alpha?: number) {
        this.red = red;
        this.green = green;
        this.blue = blue;
        if (alpha !== undefined) {
            this.alpha = alpha;
        }
    }

    protected checkChannelValue(v: number, name: string) {
        if (v < 0 || v > 255) {
            throw new RangeError(`The ${name} channel value cannot be less than 0 or greater than 255`);
        }
    }

    public get red(): number {
        return this._red;
    }


    public set red(v: number) {
        this.checkChannelValue(v, "red");
        this._red = v;
    }

    public get blue(): number {
        return this._blue;
    }

    public set blue(v: number) {
        this.checkChannelValue(v, "blue");
        this._blue = v;
    }


    public get green(): number {
        return this._green;
    }

    public set green(v: number) {
        this.checkChannelValue(v, "green");
        this._green = v;
    }

    public get alpha(): number {
        return this._alpha;
    }

    public set alpha(v: number) {
        this.checkChannelValue(v, "alpha");
        this._alpha = v;
    }


    public get hex(): string {
        let hex = "#";
        hex += ("0" + this.red.toString(16)).slice(-2);
        hex += ("0" + this.green.toString(16)).slice(-2);
        hex += ("0" + this.blue.toString(16)).slice(-2);
        hex += ("0" + this.alpha.toString(16)).slice(-2);
        return hex;
    }
}
