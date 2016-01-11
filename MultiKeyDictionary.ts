class MultiKeyDictionary<T> {
    private values: { [key: string]: Array<T> } = {};

    add(keys: Array<any>, value) {
        let key: string = keys.toString();
        if (this.values[key] !== undefined)  {
            this.values[key].push(value);
        } else {
            this.values[key] = [];
            this.values[key].push(value);
        }
    }

    has(keys: Array<any>): boolean {
        return this.values[keys.toString()] !== undefined;
    }

    get(keys: Array<any>) {
        let val = this.values[keys.toString()];
        return val !== undefined ? val : [];
    }
}