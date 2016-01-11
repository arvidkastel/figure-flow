class OrderedSet extends Array {
    insert(value):void {
		if (this.indexOf(value) == -1) {
			this.push(value);
		}
	}
}