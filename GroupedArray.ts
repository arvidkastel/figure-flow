/// <reference path="MultiKeyDictionary" />
/// <reference path="OrderedSet" />

class GroupedArray<T> extends Array<T>{
    private groupedValues: MultiKeyDictionary<T>;
    private groupDimensions: Array<OrderedSet>;
    protected groupers: Array<(arg:T)=>any>;
    
    constructor(array: Array<T>, groupers: Array<(arg:T)=>any> = []){
        this.groupDimensions = [];
        this.groupedValues = new MultiKeyDictionary<T>();
        super(array.length);
        array.forEach((el) => this.push(el));
        this.groupers = groupers;
    }
 
    groupByFunction(grouper:(arg:T)=>any) {
		this.groupers.push(grouper);
	}
    
    aggregate(fun:(arr:Array<T>)=>any) {
        this.performGrouping();
        
        let recursiveAggregate = 
        (lockedKeys:Array<any>, lockedIndices:Array<Number>) => {
			if (lockedKeys.length == this.groupDimensions.length) {
				return fun.call(
					{}, 
					this.groupedValues.get(lockedKeys),
					lockedKeys, 
					lockedIndices
				);
			}
			
			return this.groupDimensions[lockedKeys.length].map(
				(groupKey, i) => {
					var nextKeys = lockedKeys.slice(); 
                    nextKeys.push(groupKey);
					
                    var nextIndices = lockedIndices.slice(); nextIndices.push(i);
					
                    return recursiveAggregate(nextKeys, nextIndices);
				}
			);
		}
		
		return recursiveAggregate([],[]);
    }
    
    private performGrouping () :void {
        this.groupDimensions = this.groupers.map( () => new OrderedSet );
        
        this.forEach((value) => {
            let keys:Array<any> = this.groupers.map(
                (grouper) => grouper(value)
            );
            this.groupedValues.add(keys, value);

            keys.forEach((key,index) => {
                this.groupDimensions[index].insert(key);
            })
        });
    }
}