"use strict";

// the code that implements nock operations on a nock noun or atom

var Promise = require('bluebird');
//var Promise = require('q');
var parseNock = require('./parse').parseNock;
var normalizeArray = require('./parse').normalizeArray;
var groupArray = require('./parse').groupArray;
var arrayToNock = require('./parse').arrayToNock;

var verbose = false;
var debug = false;

var isArray = Array.isArray;

var nockers = [
    nockDistribution,
    nockAxis,
    nockJust,
    nockFire,
    nockDepth,
    nockBump,
    nockSame,
    //nockIf,
    nockIf2,
    nockCompose,
    nockPush,
    nockCall,
    nockHint1,
    nockHint2,
];

function isAtom(noun) {
    return !isArray(noun);
}

function isCell(noun) {
    return isArray(noun);
}

function checkOp(tree, op) {
    var reason;
    if (!isCell(tree[1])) {
        reason = "/3 is not a cell";
    }
    else if (tree[1][0] !== op) {
        reason = "not the " + op + " operation";
    }
    return reason;
}


function checkDistribution(tree) {
    // looking for [a [[b c] d]]
    var reason;
    if (!isCell(tree[1])) {
        var reason = "/3 is not a cell";
    }
    else if (!isCell(tree[1][0])) {
        reason = "/6 is not a cell";
    }
    return reason ? false : true;
}

function checkAxis(tree) {
    // looking for [a [0 b]]
    var reason;
    if (reason = checkOp(tree, 0)) {
    }
    return reason ? false : true;
}

function checkJust(tree) {
    // looking for [a [0 b]]
    var reason;
    if (reason = checkOp(tree, 1)) {
    }
    return reason ? false : true;
}

function checkFire(tree) {
    // looking for [a [2 [b c]]]
    var reason;
    if (reason = checkOp(tree, 2)) {
    }
    else if (!isCell(tree[1][1])) {
        reason = "/7 is not a cell";
    }
    return reason ? false : true;
}

function checkDepth(tree) {
    // looking for [a [3 b]]
    var reason;
    if (reason = checkOp(tree, 3)) {
    }
    return reason ? false : true;
}

function checkBump(tree) {
    // looking for [a [4 b]]
    var reason;
    if (reason = checkOp(tree, 4)) {
    }
    return reason ? false : true;
}

function checkSame(tree) {
    // looking for [a [5 b]]
    var reason;
    if (reason = checkOp(tree, 5)) {
    }
    return reason ? false : true;
}

function checkIf(tree) {
    // looking for [a [6 [b [c d]]
    var reason;
    if (reason = checkOp(tree, 6)) {
    }
    else if (!isCell(tree[1][1])) {
        reason = "/7 is not a cell";
    }
    else if (!isCell(tree[1][1][1])) {
        reason = "/15 is not a cell";
    }
    return reason ? false : true;
}

function checkCompose(tree) {
    // looking for [a [7 [b c]]]
    var reason;
    if (reason = checkOp(tree, 7)) {
    }
    else if (!isCell(tree[1][1])) {
        reason = "/7 is not a cell";
    }
    return reason ? false : true;
}

function checkPush(tree) {
    // looking for [a [8 [b c]]]
    var reason;
    if (reason = checkOp(tree, 8)) {
    }
    else if (!isCell(tree[1][1])) {
        reason = "/7 is not a cell";
    }
    return reason ? false : true;
}

function checkCall(tree) {
    // looking for [a [9 [b c]]]
    var reason;
    if (reason = checkOp(tree, 9)) {
    }
    else if (!isCell(tree[1][1])) {
        reason = "/7 is not a cell";
    }
    return reason ? false : true;
}

function checkHint1(tree) {
    // looking for [a [10 [[b c] d]]]
    var reason;
    if (reason = checkOp(tree, 10)) {
    }
    else if (!isCell(tree[1][1])) {
        reason = "/7 is not a cell";
    }
    else if (!isCell(tree[1][1][0])) {
        reason = "/14 is not a cell";
    }
    // console.log("hint1: " + reason);
    return reason ? false : true;
}

function checkHint2(tree) {
    // looking for [a [10 [b c]]]
    var reason;
    if (reason = checkOp(tree, 10)) {
    }
    else if (!isCell(tree[1][1])) {
        reason = "/7 is not a cell";
    }
    // console.log("hint2: " + reason);
    return reason ? false : true;
}

function calcState(result, depends) {
    if (result !== null) {
        return result;
    }
    if ((depends !== null) || (depends === undefined)) {
        return "waiting...";
    }
    return null;
}

function nockDistribution(tree, engine) {
    // compute *[a [b c] d]     [*[a b c] *[a d]]
    if (!checkDistribution(tree)) {
        return null;
    }

    var that = {
        name:       "distribution",
        rule:       "*[a [b c] d] => [*[a b c] *[a d]]",
        result:     null
    };

    var a = tree[0];         // /2
    var b = tree[1][0][0];   // 12
    var c = tree[1][0][1];   // 13
    var d = tree[1][1];      // 7
    var left = null;
    var right = null;

    that.state = function () {
        return [
            { label: "[a b c]", value: [a, [b, c]] },
            { label: "[a d]", value: [a, d] },
            { label: "*[a b c]", value: calcState(left) },
            { label: "*[a d]", value: calcState(right, left) },
            { label: "result", value: calcState(that.result, left) }
        ];
    };

    that.reduce = function () {
        console.log("nockDistribution state 0: " + JSON.stringify(that.state()));
        engine.pushEval([a, [b, c]])
            .then(function(r) {
                left = r;
                console.log("nockDistribution state 1: " + JSON.stringify(that.state()));
                return engine.pushEval([a, d]);
            })
            .then(function(r) {
                right = r;
                that.result = [left, right ];
                console.log("nockDistribution state 2: " + JSON.stringify(that.state()));
            });
    };

    return that;
}


function nockAxis(tree, engine) {
    // compute /[b a]
    //  /[1 a]           a
    //  /[2 a b]         a
    //  /[3 a b]         b
    //  /[(a + a) b]     /[2 /[a b]]
    //  /[(a + a + 1) b] /[3 /[a b]]
    //  /a               /a
    if (!checkAxis(tree)) {
        return null;
    }

    var that = {
        name:       "operator 0: axis",
        rule:       "*[a 0 b] => /[b a]",
        result:     null
    };

    var a = tree[1][1];
    var b = tree[0];

    that.state = function () {
        return [
            { label: "a", value: a }, 
            { label: "b", value: b },
            { label: "result", value: that.result }
        ];
    };

    that.reduce = function () {
        if (that.result !== null) return;
        that.result = computeAxis(a, b);
    };

    return that;
}

// recursive function to look up an address in a tree
function computeAxis(address, subtree) {
    //console.log("computeAxis address=" + address + " subtree=" + JSON.stringify(subtree));
    if (address == 1) {
        return subtree;
    }

    if (!isArray(subtree)) {
        return;
    }
    if (address === 0) {
        return;
    }
    if (address === 2) {
        return subtree[0];
    }
    if (address === 3) {
        return subtree[1];
    }
    if (address % 2 === 0) {
        return computeAxis(2, computeAxis(address/2, subtree))
    }
    if (address % 2 === 1) {
        return computeAxis(3, computeAxis((address - 1)/2, subtree))
    }
    // undefined!
}

function nockJust(tree, engine) {
    // "*[a 1 b] => b",
    // compute b
    if (!checkJust(tree)) {
        return null;
    }

    var that = {
        name:       "operator 1: just",
        rule:       "*[a 1 b] => b",
        result:     null
    };

    var a = tree[0]
    var b = tree[1][1];

    that.reduce = function () {
        that.result = b;
    }

    that.state = function () {
        return [
            { label: "a", value: a },
            { label: "b", value: b },
            { label: "result", value: that.result }
        ];
    }
    return that;
}

function nockFire(tree, engine) {
    // compute *[a 2 b c]       *[*[a b] *[a c]]
    if (!checkFire(tree)) {
        return null;
    }

    var that = {
        name:       "operator 2: fire",
        rule:       "*[a 2 b c] => *[*[a b] *[a c]]",
        result:     null
    };

    var a = tree[0];        // /2
    var b = tree[1][1][0];  // 14
    var c = tree[1][1][1];  // 15
    var left = null;
    var right = null;
    var combo = null;

    that.state = function () {
        return [
            { label: "a", value: a },
            { label: "b", value: b },
            { label: "c", value: c },
            { label: "*[a b]", value: calcState(left) },
            { label: "*[a c]", value: calcState(right, left) },
            { label: "combo", value: calcState(combo, right) },
            { label: "result", value: calcState(that.result, right) }
        ];
    }

    that.reduce = function () {
        console.log("nockFire state 0: " + JSON.stringify(that.state()));
        return engine.pushEval([a, b])
            .then(function(r) {
                left = r;
                console.log("nockFire state 1: " + JSON.stringify(that.state()));
                return engine.pushEval([a, c]);
            })
            .then(function(r) {
                right = r;
                combo = [ left, right ];
                console.log("nockFire state 2: " + JSON.stringify(that.state()));
                return engine.pushEval(combo);
            })
            .then(function(r) {
                that.result = r;
                console.log("nockFire state 3: " + JSON.stringify(that.state()));
                return that.result;
            });
    }

    return that;
}

function nockDepth(tree, engine) {
    // compute *[a 3 b]         ?*[a b]
    //  ?[a b]           0
    //  ?a               1

    if (!checkDepth(tree)) {
        return null;
    }

    var that = {
        name:       "operator 3: depth",
        rule:       "*[a 3 b] => ?*[a b]",
        result:     null
    };

    var a = tree[0];
    var b = tree[1][1];
    var calc = null;

    that.state = function () {
        return [
            { label: "a", value: a },
            { label: "b", value: b },
            { label: "[a b]", value: [a, b] },
            { label: "*[a b]", value: calcState(calc) },
            { label: "?*[a b]", value: calcState(that.result) }
        ];
    };

    that.reduce = function () {
        return engine.pushEval([a, b])
            .then(function(r) {
                calc = r;
                that.result = isArray(r) ? 0 : 1;
                return that.result;
            });
    };

    return that;
}

function nockBump(tree, engine) {
    // compute +*[a b]
    //  +a               1 + a

    if (!checkBump(tree)) {
        return null;
    }

    var that = {
        name:       "operator 4: bump",
        rule:       "*[a 4 b] => +*[a b]",
        result:     null
    };

    var a = tree[0];
    var b = tree[1][1];
    var calc = null;

    that.state = function () {
        return [
            { label: "a", value: a },
            { label: "b", value: b },
            { label: "[a b]", value: [a, b] },
            { label: "*[a b]", value: calcState(calc) },
            { label: "+*[a b]", value: calcState(that.result) }
        ];
    };

    that.reduce = function () {
        return engine.pushEval([a, b])
            .then(function(r) {
                calc = r;
                that.result = (typeof r == "number") ? (r + 1) : undefined;
                return that.result;
            });
    };

    return that;
}

function nockSame(tree, engine) {
    // compute =*[a b]
    //  =[a a]           0
    //  =[a b]           1
    //  =a               =a

    if (!checkSame(tree)) {
        return null;
    }

    var that = {
        name:       "operator 5: same",
        rule:       "*[a 5 b] => =*[a b]",
        result:     null
    };

    var a = tree[0];
    var b = tree[1][1];
    var calc = null;

    that.state = function () {
        return [
            { label: "a", value: a },
            { label: "b", value: b },
            { label: "[a b]", value: [a, b] },
            { label: "*[a b]", value: calcState(calc) },
            { label: "=*[a b]", value: calcState(that.result) }
        ];
    };

    that.reduce = function () {
        return engine.pushEval([a, b])
            .then(function(r) {
                calc = r;
                if (!isArray(r)) {
                    console.log("SAME ERROR");
                    that.result = undefined;
                    return;
                }
                if (JSON.stringify(r[0]) === JSON.stringify(r[1])) {
                    that.result = 0;
                }
                else {
                    that.result = 1;
                }
            });
    };

    return that;
}

function nockIf(tree, engine) {
    // *[a 6 b c d]     *[a 2 [0 1] 2 [1 c d] [1 0] 2 [1 2 3] [1 0] 4 4 b]

    if (!checkIf(tree)) {
        return null;
    }

    var that = {
        name:       "operator 6: if",
        rule:       "*[a 6 b c d] => *[a 2 [0 1] 2 [1 c d] [1 0] 2 [1 2 3] [1 0] 4 4 b]",
        result:     null
    };

    var a = tree[0];          // /2
    var b = tree[1][1][0];    // 14
    var c = tree[1][1][1][0]; // 30
    var d = tree[1][1][1][1]; // 31
    var calc = null;

    var evalTree = [a, 2, [0, 1], 2, [1, c, d], [1, 0], 2, [1, 2, 3], [1, 0], 4, 4, b];
    evalTree = normalizeArray(evalTree);

    that.state = function () {
        return [
            { label: "transform", value: evalTree },
            { label: "result", value: calcState(that.result) }
        ];
    };


    that.reduce = function () {
        return engine.pushEval(evalTree)
            .then(function(r) {
                that.result = r;
            });
    }

    return that;
}

function nockIf2(tree, engine) {
    // *[a 6 b c d]     (*[a b] == 0) ? *[a c] : ((*[a b] == 1) ? *[a d] : error)

    if (!checkIf(tree)) {
        return null;
    }

    var that = {
        name:       "operator 6: if",
        //rule:       "*[a 6 b c d] => if [*a b] then *[a c] else *[a d]",
        rule:       "*[a 6 b c d] => (*[a b] == 0) ? *[a c] : ((*[a b] == 1) ? *[a d] : error)",
        result:     null
    };

    var a = tree[0];          // /2
    var b = tree[1][1][0];    // 14
    var c = tree[1][1][1][0]; // 30
    var d = tree[1][1][1][1]; // 31
    var diff = null;

    that.state = function () {
        var r = [
            { label: "a", value: a },
            { label: "b", value: b },
            { label: "[a b]", value: [a, b] },
            { label: "*[a b]", value: calcState(diff) },
        ];
        if (diff === 0) {
            r.push({ label: "[a c]", value: [a, c] });
            r.push({ label: "*[a c]", value: calcState(that.result) });
        }
        else if (diff === 1) {
            r.push({ label: "[a d]", value: [a, d] });
            r.push({ label: "*[a d]", value: calcState(that.result) });
        }
        else {
            r.push({ label: "result", value: calcState(that.result, diff) });
        }
        return r;
    };


    that.reduce = function () {
        return engine.pushEval([a, b])
            .then(function(r) {
                diff = r;
                var exp;
                that.diff = r;
                if (r === 0) {
                    exp = [a, c];
                }
                else if (r === 1) {
                    exp = [a, d];
                }
                else {
                    that.result = undefined;
                    return that.result;
                }
                return engine.pushEval(exp);
            })
            .then(function(r) {
                that.result = r;
                return that.result;
            });
    }

    return that;
}

function nockCompose(tree, engine) {
    // *[a 7 b c]       *[a 2 b 1 c]

    if (!checkCompose(tree)) {
        return null;
    }

    var that = {
        name:       "operator 7: compose",
        rule:       "*[a 7 b c] => *[a 2 b 1 c]",
        result:     null
    };

    var a = tree[0];          // /2
    var b = tree[1][1][0];    // 14
    var c = tree[1][1][1];    // 15
    var evalTree = [a, 2, b, 1, c];
    evalTree = normalizeArray(evalTree);

    that.state = function () {
        return [
            { label: "a", value: a }, 
            { label: "b", value: b },
            { label: "c", value: c },
            { label: "transform", value: evalTree },
            { label: "result", value: calcState(that.result) }
        ];
    };


    that.reduce = function () {
        return engine.pushEval(evalTree)
            .then(function(r) {
                that.result = r;
            });
    };

    return that;
}

function nockPush(tree, engine) {
    // *[a 8 b c]       *[a 7 [[7 [0 1] b] 0 1] c]

    if (!checkPush(tree)) {
        return null;
    }

    var that = {
        name:       "operator 8: push",
        rule:       "*[a 8 b c] => *[a 7 [[7 [0 1] b] 0 1] c]",
        result:     null
    };

    var a = tree[0];          // /2
    var b = tree[1][1][0];    // 14
    var c = tree[1][1][1];    // 15
    var evalTree = [a, 7, [[7, [0, 1], b], 0, 1], c];
    evalTree = normalizeArray(evalTree);

    that.state = function () {
        return [
            { label: "a", value: a }, 
            { label: "b", value: b },
            { label: "c", value: c },
            { label: "transform", value: evalTree },
            { label: "result", value: calcState(that.result) }
        ];
    };

    that.reduce = function () {
        return engine.pushEval(evalTree)
            .then(function(r) {
                that.result = r;
            });
    };

    return that;
}

function nockCall(tree, engine) {
    // *[a 9 b c]       *[a 7 c 2 [0 1] 0 b]

    if (!checkCall(tree)) {
        return null;
    }

    var that = {
        name:       "operator 9: call",
        rule:       "*[a 9 b c] => *[a 7 c 2 [0 1] 0 b]",
        result:     null
    };

    var a = tree[0];          // /2
    var b = tree[1][1][0];    // 14
    var c = tree[1][1][1];    // 15
    var evalTree = [a, 7, c, 2, [0, 1], 0, b];
    evalTree = normalizeArray(evalTree);

    that.state = function () {
        return [
            { label: "a", value: a }, 
            { label: "b", value: b },
            { label: "c", value: c },
            { label: "transform", value: evalTree },
            { label: "result", value: calcState(that.result) }
        ];
    };

    that.reduce = function () {
        console.log(JSON.stringify(that.state));
        return engine.pushEval(evalTree)
            .then(function(r) {
                that.result = r;
            });
    };

    return that;
}
function nockHint1(tree, engine) {
    // *[a 10 [b c] d]  *[a 8 c 7 [0 3] d]

    if (!checkHint1(tree)) {
        return null;
    }

    var that = {
        name:       "operator 10: hint(1)",
        rule:       "*[a 10 [b c] d] => *[a 8 c 7 [0 3] d]",
        result:     null
    };


    var a = tree[0];            // /2
    var b = tree[1][1][0][0];   // 28
    var c = tree[1][1][0][1];   // 29
    var d = tree[1][1][1];      // 15
    var evalTree = [a, 8, c, 7, [0, 3], d];
    evalTree = normalizeArray(evalTree);

    that.state = function () {
        return [
            { label: "a", value: a }, 
            { label: "b", value: b },
            { label: "c", value: c },
            { label: "d", value: d },
            { label: "transform", value: evalTree },
            { label: "result", value: calcState(that.result) }
        ];
    };

    that.reduce = function () {
        return engine.pushEval(evalTree)
            .then(function(r) {
                that.result = r;
            });
    };

    return that;
}
function nockHint2(tree, engine) {
    // *[a 10 b c]      *[a c]

    if (!checkHint2(tree)) {
        return null;
    }

    var that = {
        name:       "operator 10: hint(2)",
        rule:       "*[a 10 b c] => *[a c]",
        result:     null
    };

    var a = tree[0];          // /2
    var b = tree[1][1][0];    // 14
    var c = tree[1][1][1];    // 15
    var evalTree = [a, c];
    evalTree = normalizeArray(evalTree);

    that.state = function () {
        return [
            { label: "a", value: a }, 
            { label: "b", value: b },
            { label: "c", value: c },
            { label: "transform", value: evalTree },
            { label: "result", value: calcState(that.result) }
        ];
    };

    that.reduce = function () {
        return engine.pushEval(evalTree)
            .then(function(r) {
                that.result = r;
            });
    };

    return that;
}

// find the matching nock function evaluator
function findNocker(tree, engine) {
    var nocker;

    if (!isCell(tree)) {
        return false;
    }

    for (var i = 0; i < nockers.length; i++) {
        var n = nockers[i](tree, engine);
        if (n) {
            nocker = n;
            break;
        }
    }
    if (nocker) {
        console.log("nocker " + i + ": " + (nocker && (nocker.name + ": " + nocker.rule)));
    }
    return nocker;
}

function nockEngine(tree) {
    var that = {
        done: false,
        result: null,
        stack: []
    };

    that.pushEval = pushEval;
    that.step = step;

    that.pushEval(tree);

    function pushEval(tree) {
        console.log("pushEval expression: " + arrayToNock(tree));

        var resolver = Promise.defer();
        var nocker = findNocker(tree, that);
        if (!nocker) {
            console.log("could not find a nocker");
            return Promise.resolve(undefined);
        }

        that.stack.push({
            tree: tree,
            nocker: nocker,
            resolver: resolver,
            reduced: false
        });

        verbose && console.log("pushEval nocker: " + nocker.name);
        return resolver.promise;
    }

    var step = 0;
    var nocount = 0;
    function step() {
        step++;
        debug && console.log("STEP " + step);
        if (that.stack.length === 0) {
            console.log("STEP: done, no stack");
            that.done = true;
            return;
        }
        var top = that.stack[that.stack.length - 1];
        if (that.stack.length === 1 && top.nocker.result !== null) {
            debug && console.log("STEP: done " + top.nocker.result);
            that.done = true;
            that.result = top.nocker.result;
            return;
        }
        debug && console.log("STEP " + top.nocker.name + " result: " + top.nocker.result);
        if (!top.reduced) {
            console.log("STEP not reduced " + top.nocker.name);
            top.nocker.reduce();
            top.reduced = true;
            return;
        }
        if (top.nocker.result === null) {
            debug && console.log("!!!!!! STEP no result for " + top.nocker.name);
            if (nocount++ > 3) {
                process.exit();
            }
            return;
        }
        if (top.nocker.result === undefined) {
            that.result = undefined
            that.done = true;
        }
        nocount = 0;
        console.log("STEP resolve/pop " + top.nocker.name + " result: " + top.nocker.result);
        top.resolver && top.resolver.resolve(top.nocker.result);
        (that.stack.length > 1) && that.stack.pop();
    }

    return that;
}

module.exports.nockEngine = nockEngine;

///////////////////////////////////////////////////
if (require.main !== module) {
    return;
}

// new tests
function nt1() {
    var engine = null;

    var tests = [
        { text: "[0 [0, 99]" },
        { text: "[0 [1, 99]" }
    ];

    tests.forEach(function(t) {
        console.log("test: " + t.text);
        var nock = parseNock(t.text);
        var n = nockJust(nock, engine);
        if (!n) {
            console.log("no match");
            return;
        }
        console.log("... state: " + JSON.stringify(n.state()));
        n.reduce();
        console.log("... state: " + JSON.stringify(n.state()));
    });
}

//nt1();
//process.exit();

var nockTextTests = [
    // distribution
    "[0 [1 2] 3]",
    "[[0 0] [[1 1] [2 2]] [3 3]]",

    // axis
    "[55 [0 1]]",
    "[[44 55] [0 3]]",

    // just
    "[88 [1 99]]",
    "[[88 88] [1 [99 99]]]",

    // fire
    "[1 2 3 4]",
    "[[1 1] 2 [3 3] [4 4]]",
    
    // depth
    "[1 [3 4]]",
    "[[1 1] [3 4]]",

    // bump
    "[44 [4 0 1]]",
    "[[44 44] [4 0 1]]",

    // same
    "[[44 44] [5 [0 1]]]",  // yes
    "[[44 45] [5 [0 1]]]",  // no

    // if
    "[0 [6 [1 [2 3]]",

    // compose
    "[1 7 2 3]",

    // push
    "[1 8 2 3]",

    // call
    "[1 9 2 3]",

    // hint
    "[1 10 [[2 3] 4]]",
    "[1 10 2 3]",

    // errors
    "[1 10 2]",
    "[1 0]",
    "[1 1]",
    "[1 2]",
    "[1 3]",
    "[1 4]",
    "[1 5]",
    "[1 6]",
    "[1 7]",
    "[1 8]",
    "[1 9]",
    "[1 10]",
    "[1]"
];

var xcomputeTests = [
    { nock: "[[40 43] [6 [3 0 1] [4 0 2] [4 0 1]]]", result: 41 },
    { nock: "[[[[6 [[5 [[4 [0 3]] [0 5]]] [[0 3] [2 [[[0 2] [4 [0 3]]] [0 4]]]]]] 2] 0] [6 [[5 [[4 [0 3]] [0 5]]] [[0 3] [2 [[[0 2] [4 [0 3]]] [0 4]]]]]]]", result: 1 },
];
var computeTests = [
    // distribution
    { nock: "[[19 42] [0 3] 0 2]", result: "[42 19]" },

    // 1 just
    { nock: "[44 [1 45]", result: 45},
    { nock: "[44 [1 [45 50]]", result: "[45 50]"},

    // 2 fire
    { nock: "[[[40 43] [4 0 1]] [2 [0 4] [0 3]]]", result: 41 },
    { nock: "[[[40 43] [4 0 1]] [2 [0 5] [0 3]]]", result: 44 },

    // 3 depth
    { nock: "[44 [3 0 1]]", result: 1},
    { nock: "[[44 45] [3 0 1]]", result: 0},

    // 4 bump 
    { nock: "[44 [4 0 1]]", result: 45},
    { nock: "[[44 44] [4 0 1]]", result: undefined},

    // 5 equals
    { nock: "[[44 44] [5 0 1]]", result: 0},
    { nock: "[[[1 2 3] [1 2 3]] [5 0 1]]", result: 0},
    { nock: "[[44 45] [5 0 1]]", result: 1},
    { nock: "[44 [5 0 1]]", result: undefined},
    { nock: "[[44 [45 56]] [5 0 1]]", result: 1},

    // 0 axis
    { nock: "[[88 99] 0 1]", result: [88, 99]},
    { nock: "[[88 99] 0 2]", result: 88},
    { nock: "[[88 99] 0 3]", result: 99},

    { nock: "[[1 2 3 4] 0 1]", result: [1,[2, [3, 4]]]},
    { nock: "[[1 2 3 4] 0 3]", result: [2, [3, 4]]},

    { nock: "[[[97 2] [1 42 0]] 0 1]", result: "[[97 2][1 42 0]]"},
    { nock: "[[[97 2] [1 42 0]] 0 2]", result: "[97 2]"},
    { nock: "[[[97 2] [1 42 0]] 0 3]", result: "[1 42 0]"},
    { nock: "[[[97 2] [1 42 0]] 0 4]", result: 97},
    { nock: "[[[97 2] [1 42 0]] 0 5]", result: 2},
    { nock: "[[[97 2] [1 42 0]] 0 6]", result: 1 },
    { nock: "[[[97 2] [1 42 0]] 0 7]", result: "[42 0]"},

    { nock: "[[1 2 3 4] 0 7]", result: "[3, 4]"},
    { nock: "[[1 2 3 4] 0 15]", result: 4},

    { nock: "[[[[8 9] [10 11]] [12 13] 14 30 31] 0 8]", result: 8},
    { nock: "[[[2 4] 3] 0 4]", result: 2 },

    { nock: "[[[97 2] [1 42 0]] 0 100]", result: undefined},
    { nock: "[[[97 2] [1 42 0]] 0 0]", result: undefined},

    // 6 if
    { nock: "[[40 43] [6 [3 0 1] [4 0 2] [4 0 1]]]", result: 41 },

    // 7 compose
    { nock: "[[42 44] [7 [4 0 3] [3 0 1]]]", result: 1 },

    // 8 push
    { nock: "[[88 99] [8 [1 77] [0 2]]]", result: 77 },
    { nock: "[[88 99] [8 [1 77] [0 3]]]", result: "[88 99]" },

    // 9 call
    // *[a 9 b c]
    // need an example!
    // for the following core, /4 is bump, /5 is just 99, and /3 is /2
    // a = [[[4 0 1] [1 99]][0 2]]
    // b = 6
    // c = [0 1]
    // so this just fires the JUST 99 arm
    { nock: "[ [[[4 0 1][1 99]][0 2]] 9 5 [0 1]]", result: 99 },

    // 10 hint 1
    // *[a 10 [b c] d]
    { nock: "[[11 22 33] 10 [111 222] [0 7]]", result: undefined },
    { nock: "[[11 22 33] 10 [111 [0 1]] [0 7]]", result: 33 },

    // 10 hint 2
    // *[a 10 b c]
    { nock: "[[11 22 33] 10 111 [0 7]]", result: 33 },

    // decrement
    // [99 [2 [[[0 1] [[[1 [0 6]] [[0 1] [1 95]]] [1 [0 1]]]] [1 [0 1]]]]] is [99 [[[0 6] [99 95]] [0 1]]]
    //{ nock: "[99 [2 [[[0 1] [[[1 [0 6]] [[0 1] [1 95]]] [1 [0 1]]]] [1 [0 1]]]]]", result: "[99 [[[0 6] [99 95]] [0 1]]]" },
    { nock: "[13 [2 [[[[1 [6 [[5 [[4 [0 3]] [0 5]]] [[0 3] [2 [[[0 2] [4 [0 3]]] [0 4]]]]]]] [0 1]] [1 0]] [1 [2 [[0 1] [0 4]]]]]]]", result: 12 },

    // misc
    { nock: "[[40 43] [6 [3 0 1] [4 0 2] [4 0 1]]]", result: 41 },
    { nock: "[[[[6 [[5 [[4 [0 3]] [0 5]]] [[0 3] [2 [[[0 2] [4 [0 3]]] [0 4]]]]]] 2] 0] [6 [[5 [[4 [0 3]] [0 5]]] [[0 3] [2 [[[0 2] [4 [0 3]]] [0 4]]]]]]]", result: 1 },
    { nock: "[2 [2 [[[[1 [6 [[5 [[4 [0 3]] [0 5]]] [[0 3] [2 [[[0 2] [4 [0 3]]] [0 4]]]]]]] [0 1]] [1 0]] [1 [2 [[0 1] [0 4]]]]]]]", result: 1 },

];

function nockTextTest() {
    nockTextTests.map(function(nockText) {
        var msg = (nockText + "                                              ").substr(0, 40) + " ";
        var nock = parseNock(nockText);
        var nocker = findNockEvaluator(nock);
        if (nocker) {
            console.log(msg + nocker.name);
        } 
        else {
            console.log(msg + "!!! nock error !!! " + JSON.stringify(nock));
        }
    });
}

function nockEvalTests() {
    var i = 0;
    
    function nextTest() {
        if (i === computeTests.length - 1) {
            return;
        }
        var data = computeTests[i];
        var tree = parseNock(data.nock);
        console.log("TEST " + i + ": " + arrayToNock(tree));
        var engine = nockEngine(tree);
        var iid = setInterval(function () {
            engine.step();
            if (engine.done) {
                console.log("DONE\n\n");
                clearInterval(iid);
                i++;
                if (checkResult(data, engine.result)) {
                    nextTest();
                }
            }
        }, 0);
    }

    function checkResult(data, result) {
        var good = data.result;
        if (typeof good == "string") {
            good = parseNock(good);
        }
        good = JSON.stringify(normalizeArray(good));
        var mine = JSON.stringify(result);
        console.log("eval " + data.nock + " final value is: " + JSON.stringify(result) + " PASS: " + (good === mine));
        if (good !== mine) {
            console.log("... should have been: " + JSON.stringify(good));
            process.exit();
        }
        console.log("\n\n");
        return true;
    }

    nextTest();
}

//nockTextTest();
nockEvalTests();


