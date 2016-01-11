interface IGrouper {
    name() : string;
    values() : Array<any>;
    labels() : Array<string>;
    classify(row:Object) : any;
}