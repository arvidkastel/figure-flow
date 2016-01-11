/// <reference path="GroupedTable" />



var users = new GroupedTable(
    [
        {id:0, name:"arvid"},
        {id:1, name:"pelle"}
    ]
)
.addIndex("id");

var buys = new GroupedTable(
    [
        {user_id: 0, amount: 1, month:"jan"},
        {user_id: 0, amount: 4, month:"jan"},
        {user_id: 1, amount: 3, month:"feb"},
        {user_id: 0, amount: 1, month:"jan"},
        {user_id: 0, amount: 4, month:"feb"},
        {user_id: 1, amount: 3, month:"feb"}
    ]
)
.leftJoin(users, "user_id", ["name"], "user.")
.groupBy('user.name')
.groupBy('month')
.filter((row) => row.amount > 1);
var count = buys.aggregate((arr) => arr.length);
console.log(count);
buys.dump(console.log);