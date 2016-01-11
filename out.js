var MultiKeyDictionary = (function () {
    function MultiKeyDictionary() {
        this.values = {};
    }
    MultiKeyDictionary.prototype.add = function (keys, value) {
        var key = keys.toString();
        if (this.values[key] !== undefined) {
            this.values[key].push(value);
        }
        else {
            this.values[key] = [];
            this.values[key].push(value);
        }
    };
    MultiKeyDictionary.prototype.has = function (keys) {
        return this.values[keys.toString()] !== undefined;
    };
    MultiKeyDictionary.prototype.get = function (keys) {
        var val = this.values[keys.toString()];
        return val !== undefined ? val : [];
    };
    return MultiKeyDictionary;
})();
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var OrderedSet = (function (_super) {
    __extends(OrderedSet, _super);
    function OrderedSet() {
        _super.apply(this, arguments);
    }
    OrderedSet.prototype.insert = function (value) {
        if (this.indexOf(value) == -1) {
            this.push(value);
        }
    };
    return OrderedSet;
})(Array);
/// <reference path="MultiKeyDictionary" />
/// <reference path="OrderedSet" />
var GroupedArray = (function (_super) {
    __extends(GroupedArray, _super);
    function GroupedArray(array, groupers) {
        var _this = this;
        if (groupers === void 0) { groupers = []; }
        this.groupDimensions = [];
        this.groupedValues = new MultiKeyDictionary();
        _super.call(this, array.length);
        array.forEach(function (el) { return _this.push(el); });
        this.groupers = groupers;
    }
    GroupedArray.prototype.groupByFunction = function (grouper) {
        this.groupers.push(grouper);
    };
    GroupedArray.prototype.aggregate = function (fun) {
        var _this = this;
        this.performGrouping();
        var recursiveAggregate = function (lockedKeys, lockedIndices) {
            if (lockedKeys.length == _this.groupDimensions.length) {
                return fun.call({}, _this.groupedValues.get(lockedKeys), lockedKeys, lockedIndices);
            }
            return _this.groupDimensions[lockedKeys.length].map(function (groupKey, i) {
                var nextKeys = lockedKeys.slice();
                nextKeys.push(groupKey);
                var nextIndices = lockedIndices.slice();
                nextIndices.push(i);
                return recursiveAggregate(nextKeys, nextIndices);
            });
        };
        return recursiveAggregate([], []);
    };
    GroupedArray.prototype.performGrouping = function () {
        var _this = this;
        this.groupDimensions = this.groupers.map(function () { return new OrderedSet; });
        this.forEach(function (value) {
            var keys = _this.groupers.map(function (grouper) { return grouper(value); });
            _this.groupedValues.add(keys, value);
            keys.forEach(function (key, index) {
                _this.groupDimensions[index].insert(key);
            });
        });
    };
    return GroupedArray;
})(Array);
/// <reference path="GroupedArray" />
var GroupedTable = (function (_super) {
    __extends(GroupedTable, _super);
    function GroupedTable(array, groupers) {
        if (groupers === void 0) { groupers = []; }
        _super.call(this, array, groupers);
        this.index = {};
    }
    GroupedTable.prototype.computeColumn = function (columnName, fun) {
        this.forEach(function (row) { return row[name] = fun(row); });
        return this;
    };
    GroupedTable.prototype.pick = function (columnName) {
        return this.map(function (row) { return row[columnName]; });
    };
    GroupedTable.prototype.filter = function (fun) {
        return new GroupedTable(Array.prototype.filter.call(this, fun), this.groupers);
    };
    GroupedTable.prototype.addIndex = function (columnName) {
        var _this = this;
        this.forEach(function (row) { return _this.index[row[columnName].toString()] = row; });
        return this;
    };
    GroupedTable.prototype.findById = function (id) {
        return this.index[id.toString()] || {};
    };
    GroupedTable.prototype.leftJoin = function (secondTable, columnName, foreignColumnNamesArg, prefix) {
        if (foreignColumnNamesArg === void 0) { foreignColumnNamesArg = []; }
        if (prefix === void 0) { prefix = ""; }
        var foreignColumnNames = foreignColumnNamesArg.length === 0 ?
            secondTable.columnNames() :
            foreignColumnNamesArg;
        this.forEach(function (row) {
            foreignColumnNames.forEach(function (foreignColumnName) {
                var foreignRow = secondTable.findById(row[columnName]);
                row[prefix + foreignColumnName] = foreignRow[foreignColumnName];
            });
        });
        return this;
    };
    GroupedTable.prototype.columnNames = function () {
        if (this.length === 0) {
            throw "Array cannot be empty";
        }
        return Object.keys(this[0]);
    };
    GroupedTable.prototype.groupBy = function (columnName) {
        this.groupByFunction(function (row) { return row[columnName]; });
        return this;
    };
    GroupedTable.prototype.dump = function (dumper) {
        this.forEach(function (row) { return dumper(JSON.stringify(row)); });
    };
    return GroupedTable;
})(GroupedArray);
/// <reference path="GroupedTable" />
var users = new GroupedTable([
    { id: 0, name: "arvid" },
    { id: 1, name: "pelle" }
])
    .addIndex("id");
var buys = new GroupedTable([
    { user_id: 0, amount: 1, month: "jan" },
    { user_id: 0, amount: 4, month: "jan" },
    { user_id: 1, amount: 3, month: "feb" },
    { user_id: 0, amount: 1, month: "jan" },
    { user_id: 0, amount: 4, month: "feb" },
    { user_id: 1, amount: 3, month: "feb" }
])
    .leftJoin(users, "user_id", ["name"], "user.")
    .groupBy('user.name')
    .groupBy('month')
    .filter(function (row) { return row.amount > 1; });
var count = buys.aggregate(function (arr) { return arr.length; });
console.log(count);
buys.dump(console.log);
