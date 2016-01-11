class ColumnGrouper implements IGrouper{
    private _values: OrderedSet;
    
    constructor(private _columnName:string) {
        this._values = new OrderedSet(); 
    }
    
    classify(row:Object) : any {
        this._values.insert(row[this._columnName]);
    }
    
    name():string {
        return this._columnName;
    }
    
    values(): Array<any> {
        return this._values;
    }
    
    labels():Array<string> {
        return this._values.map( value=>value.toString() );
    }
}