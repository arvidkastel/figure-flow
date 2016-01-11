/// <reference path="GroupedArray" />

class GroupedTable extends GroupedArray<Object>
{
    private index: { [key: string]: Object } = {};

   constructor(
       array: Array<Object>, 
       groupers: Array<(arg:Object)=>any> = []
    ){
        super(array, groupers);
    }
    computeColumn(columnName: string, fun: (obj: Object) => any): GroupedTable
    {
        this.forEach(
            (row) => row[name] = fun(row) 
        );
        return this;
    }
    
    pick(columnName:string) {
        return this.map((row) => row[columnName]);
    }
    
    filter(
        fun:(
            row:Object, 
            index:Number, 
            array:Array<Object>
        ) => Boolean
    ) {
        return new GroupedTable(
            Array.prototype.filter.call(this,fun),
            this.groupers
        );
    }
    
    addIndex(columnName:string) {
        this.forEach(
            (row) => this.index[row[columnName].toString()] = row 
        );
        return this;
    }
    
    findById(id:any):Object {
        return this.index[id.toString()] || {};
    }
    
    leftJoin(
        secondTable: GroupedTable, 
        columnName:string, 
        foreignColumnNamesArg: Array<string> = [],
        prefix = ""
    ) : GroupedTable
    {
        let foreignColumnNames = 
            foreignColumnNamesArg.length === 0 ? 
            secondTable.columnNames() : 
            foreignColumnNamesArg;
       this.forEach((row) => {
           foreignColumnNames.forEach(
               (foreignColumnName) => {
                   let foreignRow = secondTable.findById(row[columnName]); 
                   row[prefix + foreignColumnName] = foreignRow[foreignColumnName];
               }
           )
       });
       return this;
    }
    
    columnNames() : Array<string> {
        if (this.length === 0) {
            throw "Array cannot be empty"; 
        }
        return Object.keys(this[0]);
    }
    
    groupBy(columnName:string) : GroupedTable {
        this.groupByFunction((row) => row[columnName]);
        return this;
    }
    
    dump(dumper):void{
        this.forEach(
            (row) => dumper(JSON.stringify(row))
        );
    }
}