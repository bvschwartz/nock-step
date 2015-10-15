(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process){
"use strict";

// the code that implements nock operations on a nock noun or atom

var parseNock = require('./parse').parseNock;
var normalizeArray = require('./parse').normalizeArray;
var groupArray = require('./parse').groupArray;

var verbose = false;

var isArray = Array.isArray;

var nockers = [
    {
        name:       "distribution",
        rule:       "*[a [b c] d] => [*[a b c] *[a d]]",
        checkFunc:    checkDistribution,
        doFunc:       doDistribution
    },
    {
        name:       "operator 0: axis",
        rule:       "*[a 0 b] => /[b a]",
        checkFunc:    checkAxis,
        doFunc:       doAxis
    },
    {
        name:       "operator 1: just",
        rule:       "*[a 1 b] => b",
        checkFunc:    checkJust,
        doFunc:       doJust
    },
    {
        name:       "operator 2: fire",
        rule:       "*[a 2 b c] => *[*[a b] *[a c]]",
        checkFunc:    checkFire,
        doFunc:       doFire
    },
    {
        name:       "operator 3: depth",
        rule:       "*[a 3 b] => ?*[a b]",
        checkFunc:    checkDepth,
        doFunc:       doDepth
    },
    {
        name:       "operator 4: bump",
        rule:       "*[a 4 b] => +*[a b]",
        checkFunc:    checkBump,
        doFunc:       doBump
    },
    {
        name:       "operator 5: same",
        rule:       "*[a 5 b] => =*[a b]",
        checkFunc:    checkSame,
        doFunc:       doSame
    },
    {
        name:       "operator 6: if",
        rule:       "*[a 6 b c d] => *[a 2 [0 1] 2 [1 c d] [1 0] 2 [1 2 3] [1 0] 4 4 b]",
        checkFunc:    checkIf,
        //doFunc:       doIfFull
        doFunc:       doIf
    },
    {
        name:       "operator 7: compose",
        rule:       "*[a 7 b c] => *[a 2 b 1 c]",
        checkFunc:    checkCompose,
        doFunc:       doCompose
    },
    {
        name:       "operator 8: push",
        rule:       "*[a 8 b c] => *[a 7 [[7 [0 1] b] 0 1] c]",
        checkFunc:    checkPush,
        doFunc:       doPush
    },
    {
        name:       "operator 9: call",
        rule:       "*[a 9 b c] => *[a 7 c 2 [0 1] 0 b]",
        checkFunc:    checkCall,
        doFunc:       doCall
    },
    {
        name:       "operator 10: hint(1)",
        rule:       "*[a 10 [b c] d] => *[a 8 c 7 [0 3] d]",
        checkFunc:    checkHint1,
        doFunc:       doHint1
    },
    {
        name:       "operator 10: hint(2)",
        rule:       "*[a 10 b c] => *[a c]",
        checkFunc:    checkHint2,
        doFunc:       doHint2
    },
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

function doDistribution(tree, state, engine) {
    // compute *[a [b c] d]     [*[a b c] *[a d]]

    if (state.evalResult !== null) {

        if (state.compute.leftResult !== null) {
            // this is the right result, we are done
            verbose && console.log("DISTRO RIGHT: " + JSON.stringify(state.evalResult));
            state.compute.rightResult = state.evalResult;
            state.result = [ state.compute.leftResult, state.compute.rightResult ];
            verbose && console.log("DISTRO: returning " + JSON.stringify(state.result));
            return;
        }

        // this is the left result, compute right result
        verbose && console.log("DISTRO LEFT: " + JSON.stringify(state.evalResult));
        verbose && console.log("DISTRO: COMPUTE RIGHT: " + JSON.stringify([state.compute.a, state.compute.d]));
        state.compute.leftResult = state.evalResult;
        engine.pushEval([state.compute.a, state.compute.d]);
        return;
    }

    state.compute = {
        leftResult: null,
        rightResult: null
    };

    state.compute.a = tree[0];         // /2
    state.compute.b = tree[1][0][0];   // 12
    state.compute.c = tree[1][0][1];   // 13
    state.compute.d = tree[1][1];      // 7
    verbose && console.log("DISTRO a=" + JSON.stringify(state.compute.a));
    verbose && console.log("DISTRO b=" + JSON.stringify(state.compute.b));
    verbose && console.log("DISTRO c=" + JSON.stringify(state.compute.c));
    verbose && console.log("DISTRO d=" + JSON.stringify(state.compute.d));

    // first compute the left side
    verbose && console.log("DISTRO: COMPUTE LEFT: " + JSON.stringify([state.compute.a, [state.compute.b, state.compute.c]]));
    engine.pushEval([state.compute.a, [state.compute.b, state.compute.c]]);
}

function doAxis(tree, state, engine) {
    // compute /[b a]
    //  /[1 a]           a
    //  /[2 a b]         a
    //  /[3 a b]         b
    //  /[(a + a) b]     /[2 /[a b]]
    //  /[(a + a + 1) b] /[3 /[a b]]
    //  /a               /a
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

    var fullAddress = tree[1][1];
    var fullSubtree = tree[0];

    state.result = computeAxis(fullAddress, fullSubtree);
    // console.log("doAxis: returning " + JSON.stringify(state.result));
}

function doJust(tree, state, engine) {
    // compute b
    state.result = undefined;
    if (isArray(tree[1])) {
        state.result = tree[1][1];
    }
}
function doFire(tree, state, engine) {
    // compute *[a 2 b c]       *[*[a b] *[a c]]
    if (state.evalResult !== null) {

        if (state.compute.rightResult !== null) {
            // this is the combined result, we are done
            verbose && console.log("FIRE COMBINED: " + JSON.stringify(state.evalResult));
            state.compute.combinedResult = state.evalResult;
            state.result = state.compute.combinedResult;
            return;
        }

        if (state.compute.leftResult !== null) {
            // this is the right result, compute combined result
            verbose && console.log("FIRE RIGHT: " + JSON.stringify(state.evalResult));
            verbose && console.log("FIRE IN THE HOLE: COMBINED");
            state.compute.rightResult = state.evalResult;
            engine.pushEval([ state.compute.leftResult, state.compute.rightResult]);
            return;
        }

        // this is the left result, compute right result
        verbose && console.log("FIRE LEFT: " + JSON.stringify(state.evalResult));
        verbose && console.log("FIRE IN THE HOLE: RIGHT");
        state.compute.leftResult = state.evalResult;
        engine.pushEval([state.compute.a, state.compute.c]);
        return;
    }

    state.compute = {
        leftResult: null,
        rightResult: null,
        combinedResult: null
    }

    state.compute.a = tree[0];          // /2
    state.compute.b = tree[1][1][0];    // 14
    state.compute.c = tree[1][1][1];    // 15
    verbose && console.log("FIRE a=" + JSON.stringify(state.compute.a));
    verbose && console.log("FIRE b=" + JSON.stringify(state.compute.b));
    verbose && console.log("FIRE c=" + JSON.stringify(state.compute.c));

    // first compute the left side
    verbose && console.log("FIRE IN THE HOLE: LEFT")
    engine.pushEval([state.compute.a, state.compute.b]);
}
function doDepth(tree, state, engine) {
    // compute *[a 3 b]         ?*[a b]
    //  ?[a b]           0
    //  ?a               1

    if (state.evalResult !== null) {
        verbose && console.log("Compute depth of: " + JSON.stringify(state.evalResult) + " " + typeof(state.evalResult));
        state.result = isArray(state.evalResult) ? 0 : 1;
        return;
    }

    //console.log("doDepth /2=" + tree[0] + " /7=" + JSON.stringify(tree[1][1]));
    if (tree[1][0] !== 3) {
        console.log("INTERNAL ERROR"); process.exit();
    }
    engine.pushEval([ tree[0], tree[1][1] ]);
}

function doBump(tree, state, engine) {
    // compute +*[a b]
    //  +a               1 + a
    if (state.evalResult !== null) {
        state.result = undefined;
        if (typeof state.evalResult == "number") {
            verbose && console.log("BUMPING " + state.evalResult);
            state.result = state.evalResult + 1;
        }
        else {
            verbose && console.log("CANNOT BUMP NON NUMBER " + state.evalResult);
        }
        return;
    }
    //console.log("doBump /2=" + tree[0] + " /7=" + JSON.stringify(tree[1][1]));
    engine.pushEval([ tree[0], tree[1][1] ]);
}

function doSame(tree, state, engine) {
    // compute =*[a b]
    //  =[a a]           0
    //  =[a b]           1
    //  =a               =a
    if (state.evalResult !== null) {
        state.result = undefined;
        if (isArray(state.evalResult) && isArray(state.evalResult)) {
            verbose && console.log("compare: " + JSON.stringify(state.evalResult));
            verbose && console.log("compare: " + JSON.stringify(state.evalResult[0]) + " to " + JSON.stringify(state.evalResult[1]));
            if (JSON.stringify(state.evalResult[0]) === JSON.stringify(state.evalResult[1])) {
                state.result = 0;
            }
            else {
                state.result = 1;
            }
        }
        return;
    }

    console.log("doSame fullTree: " + JSON.stringify(tree));
    console.log("doSame /2=" + JSON.stringify(tree[0]) + " /7=" + JSON.stringify(tree[1][1]));
    engine.pushEval([ tree[0], tree[1][1] ]);
}

function doIf(tree, state, engine) {
    // *[a 6 b c d]     *[a 2 [0 1] 2 [1 c d] [1 0] 2 [1 2 3] [1 0] 4 4 b]

    if (state.evalResult !== null) {
        if (state.compute.diffResult === null) {
            state.compute.diffResult = state.evalResult;
            verbose && console.log("IF DIFF: " + JSON.stringify(state.compute.diffResult));

            if (state.compute.diffResult === 0) {
                evalTree = [state.compute.terms.a, state.compute.terms.c];
            }
            else if (state.compute.diffResult === 1) {
                evalTree = [state.compute.terms.a, state.compute.terms.d];
            }
            else {
                state.result = undefined;
                return;
            }
            evalTree = normalizeArray(evalTree);
            verbose && console.log("IF EVAL COMPUTE: " + JSON.stringify(evalTree));
            engine.pushEval(evalTree);
        }
        else {
            verbose && console.log("IF COMPUTE: " + JSON.stringify(state.evalResult));
            state.result = state.evalResult;
        }
        return;
    }

    var a = tree[0];          // /2
    var b = tree[1][1][0];    // 14
    var c = tree[1][1][1][0]; // 30
    var d = tree[1][1][1][1]; // 31

    verbose && console.log("IF: " + JSON.stringify(tree));
    verbose && console.log("IF a =" + JSON.stringify(a));
    verbose && console.log("IF b =" + JSON.stringify(b));
    verbose && console.log("IF c =" + JSON.stringify(c));
    verbose && console.log("IF d =" + JSON.stringify(d));

    state.compute = {
        diffResult: null,

        terms: {
            a: a,
            b: b,
            c: c,
            d: d
        }
    };

    var evalTree = [a, b];
    evalTree = normalizeArray(evalTree);
    verbose && console.log("IF EVAL DIFF: " + JSON.stringify(evalTree));
    engine.pushEval(evalTree);
}

function doIfFull(tree, state, engine) {
    // *[a 6 b c d]     *[a 2 [0 1] 2 [1 c d] [1 0] 2 [1 2 3] [1 0] 4 4 b]

    if (state.evalResult !== null) {
        state.result = state.evalResult;
        return;
    }

    var a = tree[0];          // /2
    var b = tree[1][1][0];    // 14
    var c = tree[1][1][1][0]; // 30
    var d = tree[1][1][1][1]; // 31
    verbose && console.log("IF: " + JSON.stringify(tree));
    verbose && console.log("IF a =" + JSON.stringify(a));
    verbose && console.log("IF b =" + JSON.stringify(b));
    verbose && console.log("IF c =" + JSON.stringify(c));
    verbose && console.log("IF d =" + JSON.stringify(d));

    var evalTree = [a, 2, [0, 1], 2, [1, c, d], [1, 0], 2, [1, 2, 3], [1, 0], 4, 4, b];
    evalTree = normalizeArray(evalTree);
    verbose && console.log("IF EVAL: " + JSON.stringify(evalTree));
    engine.pushEval(evalTree);
}

function doCompose(tree, state, engine) {
    // *[a 7 b c]       *[a 2 b 1 c]

    if (state.evalResult !== null) {
        state.result = state.evalResult;
        return;
    }

    var a = tree[0];          // /2
    var b = tree[1][1][0];    // 14
    var c = tree[1][1][1];    // 15
    var evalTree = [a, 2, b, 1, c];
    evalTree = normalizeArray(evalTree);
    engine.pushEval(evalTree);
}
function doPush(tree, state, engine) {
    // *[a 8 b c]       *[a 7 [[7 [0 1] b] 0 1] c]

    if (state.evalResult !== null) {
        state.result = state.evalResult;
        return;
    }

    var a = tree[0];          // /2
    var b = tree[1][1][0];    // 14
    var c = tree[1][1][1];    // 15
    var evalTree = [a, 7, [[7, [0, 1], b], 0, 1], c];
    evalTree = normalizeArray(evalTree);
    engine.pushEval(evalTree);

}
function doCall(tree, state, engine) {
    // *[a 9 b c]       *[a 7 c 2 [0 1] 0 b]

    if (state.evalResult !== null) {
        state.result = state.evalResult;
        return;
    }

    var a = tree[0];          // /2
    var b = tree[1][1][0];    // 14
    var c = tree[1][1][1];    // 15
    verbose && console.log("CALL tree =" + JSON.stringify(tree));
    verbose && console.log("CALL a =" + JSON.stringify(a));
    verbose && console.log("CALL b =" + JSON.stringify(b));
    verbose && console.log("CALL c =" + JSON.stringify(c));
    var evalTree = [a, 7, c, 2, [0, 1], 0, b];
    evalTree = normalizeArray(evalTree);
    engine.pushEval(evalTree);

}
function doHint1(tree, state, engine) {
    // *[a 10 [b c] d]  *[a 8 c 7 [0 3] d]

    if (state.evalResult !== null) {
        state.result = state.evalResult;
        return;
    }

    var a = tree[0];            // /2
    var b = tree[1][1][0][0];   // 28
    var c = tree[1][1][0][1];   // 29
    var d = tree[1][1][1];      // 15
    verbose && console.log("HINT1 tree =" + JSON.stringify(tree));
    verbose && console.log("HINT1 a =" + JSON.stringify(a));
    verbose && console.log("HINT1 b =" + JSON.stringify(b));
    verbose && console.log("HINT1 c =" + JSON.stringify(c));
    verbose && console.log("HINT1 d =" + JSON.stringify(d));
    var evalTree = [a, 8, c, 7, [0, 3], d];
    evalTree = normalizeArray(evalTree);
    engine.pushEval(evalTree);
}
function doHint2(tree, state, engine) {
    // *[a 10 b c]      *[a c]

    if (state.evalResult !== null) {
        state.result = state.evalResult;
        return;
    }

    var a = tree[0];          // /2
    var b = tree[1][1][0];    // 14
    var c = tree[1][1][1];    // 15
    verbose && console.log("HINT2 a =" + JSON.stringify(a));
    verbose && console.log("HINT2 b =" + JSON.stringify(b));
    verbose && console.log("HINT2 c =" + JSON.stringify(c));
    var evalTree = [a, c];
    evalTree = normalizeArray(evalTree);
    engine.pushEval(evalTree);
}


// find the matching nock function evaluator
function findNockEvaluator(tree) {
    var nocker;

    if (!isCell(tree)) {
        return false;
    }

    for (var i = 0; i < nockers.length; i++) {
        var n = nockers[i];
        if (n.checkFunc(tree)) {
            nocker = n;
            break;
        }
    }
    //console.log("nocker: " + (nocker && (nocker.name + ": " + nocker.rule)));
    return nocker;
}


// evaluate a nockTree and return an object that can be stepped
function nockEvalEngine(tree) {
    //verbose && console.log("Eval tree: " + JSON.stringify(tree));
    //var nocker = findNockEvaluator(tree);
    //verbose && console.log("NockEvaluator: " + nocker.name);

    //verbose && console.log("computing: " + ((nocker && nocker.name) || "NO-MATCH") + " for tree " + JSON.stringify(tree));

    var stepCount = 0;
    var that = {
        done: false,
        result: null,
        stack: [],
        step: step,
        pushEval: pushEval
    };
    that.pushEval(tree);


    function step() {
        var top = that.stack[that.stack.length - 1];
        //console.log("step: working on " + top.nocker.name);
        if (top.state.result === null) {
            top.nocker.doFunc(top.tree, top.state, that);
            return;
        }
        var popped = top;
        that.stack.pop();
        if (that.stack.length == 0) {
            that.done = true;
            that.result = popped.state.result;
            console.log("computation complete: '" + popped.nocker.name + "' result of " + JSON.stringify(popped.state.result) + " returned to '" + top.nocker.name + "'");
        }
        else {
            top = that.stack[that.stack.length - 1];
            top.state.evalResult = popped.state.result;
            console.log(that.stack.length + "... done with computation: '" + popped.nocker.name + "' result of " + JSON.stringify(popped.state.result) + " returned to '" + top.nocker.name + "'");
        }
    }

    function pushEval(pushTree) {
        verbose && console.log("PUSH EVAL, STACK HEIGHT: " + that.stack.length);
        var pushNocker = findNockEvaluator(pushTree);
        if (!pushNocker) {
            that.done = true;
            that.result = undefined;
        }
        that.stack.push ({
            nocker: pushNocker,
            tree: pushTree,
            state: {
                result: null,
                evalResult: null
            }
        });
        console.log(that.stack.length + " push computation: " + ((pushNocker && pushNocker.name && ("'" + pushNocker.name + "'")) || "NO-MATCH") + " for tree " + JSON.stringify(pushTree));
    }

    return that;
}

module.exports.nockEvalEngine = nockEvalEngine;

///////////////////////////////////////////////////
if (require.main !== module) {
    return;
}

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

function nockEvalTest() {
    computeTests.map(function(data) {
        var tree = parseNock(data.nock);
        var engine = nockEvalEngine(tree);
        var maxSteps = 1000000;
        var steps = maxSteps;
        while (!engine.done) {
            //console.log("STATE: " + engine.state);
            engine.step();
            if (--steps == 0) {
                console.log("Too many steps: " + maxSteps);
                break;
            }
        }
        var good = data.result;
        if (typeof good == "string") {
            good = parseNock(good);
        }
        good = JSON.stringify(normalizeArray(good));
        var mine = JSON.stringify(engine.result);
        console.log("eval " + data.nock + " final value is: " + JSON.stringify(engine.result) + " PASS: " + (good === mine));
        if (good !== mine) {
            console.log("... should have been: " + JSON.stringify(good));
            process.exit();
        }
        console.log("\n\n");
    });
}

//nockTextTest();
nockEvalTest();



}).call(this,require('_process'))
},{"./parse":2,"_process":4}],2:[function(require,module,exports){
"use strict";

// Parse textual nock into a normalized data structure
// This is a simple recursive descent parser

// During the parse we pass around a mutable data structure
// that lets us keep track of our position in the text
// stream as well as the Nock data we are building up.
// Each Nock node is represented as an array, each
// element of the array represents an atom or cell.
// And the cells can be 2 or more wide unless we
// are restricted to classic Nock.

var verbose = false;

var samples = [
    "  [ 0 [ 1 [ 2 [ 3 4 ] ] ] ]  ",
    "[0 [1 [2 [3 4]]]]",
    "[0 1 2 3 4]",

    "[[0 [0 0]] [[1 [1 1]] [2 [2 2]]]]",
    "[[0 0 0] [1 1 1] 2 2 2]",
    "[[1 2 3] [4 5 6] 7 8 9]",
    "[[1 2 3 10] [4 5 6 11] 7 8 9 12]",

    "[1 [2 [3 [4 [5 6]]]]]",

    "[1 11 111 1111 [2 22 222 2222 [3 33 333 3333 [4 44 44 4444 [5 55 555 5555 6 66 666 6666]]]]]",

    "[1 11 111 [2 22 222 [3 33 333 [4 44 444 [5 55 555 6 66 666]]]]]",

    "[2 [6 [[28 29] [30 31]]]]",
    "[2 [6 [[28 29] [30 [62 63]]]]]",

    "[[97 2][1 42 0]]",

    "[[11 22 33] 10 [111 [0 7]] 222]",

];

var formulas = [
    { label: "+1", code: "[4 [0 1]]" },
    { label: "+2", code: "[4 [4 [0 1]]]" },
    { label: "+3", code: "[4 [4 [4 [0 1]]]]" },

    { label: "+1", code: "[4 0 1]" },
    { label: "+2", code: "[4 4 0 1]" },
    { label: "+3", code: "[4 4 4 0 1]" },

    { label: "?", code: "[6 [[1 0] [[0 2] [0 3]]]]" },
];

function stripWhite(ps) {
    var stripped = false;
    while(ps.text.match(/^[\s,]/)) {
        ps.text = ps.text.substr(1);
        stripped = true;
    }
    return stripped;
}

function parseAtom(ps) {
    var atom = null;
    var m = ps.text.match(/^[0-9]+/);
    if (m) {
        atom = parseInt(m[0], 10);
        ps.text = ps.text.substr(m[0].length);
        return atom;
    }
    m = ps.text.match(/^\w/);
    if (m) {
        atom = m[0];
        ps.text = ps.text.substr(m[0].length);
        return atom;
    }
    //console.log("atom: " + atom + " text: " + ps.text);
    return null;
}

function nextRight(ps) {
    stripWhite(ps);
    if (ps.text[0] === '[') {
        return nextCell(ps);
    }
    if (ps.text[0] === ']') {
        return null;
    }
    var atom = parseAtom(ps);
    if (atom !== null) {
        return atom;
    }
    else {
        return null;
    }
}

function nextCell(ps) {
    var cell = [];
    stripWhite(ps);
    if (ps.text[0] === '[') {
        //console.log("we've got a cell");
        ps.text = ps.text.substr(1);
        var nodes = 0;
        while (true) {
            var parsed = nextRight(ps);
            if (parsed === null) {
                break;
            }
            if (++nodes > 2) {
                //console.log("Non-normalized Nock");
                ps.fancy = true;
            }
            cell.push(parsed);
            stripWhite(ps);
        }
        
        if (ps.text[0] === ']') {
            //console.log("...end of cell");
            ps.text = ps.text.substr(1);
        }
    }
    return cell;
}

function normalizeArray(nock) {
    if (!Array.isArray(nock)) {
        return nock;
    }
    function normalizeCell(cell) {
        if (!Array.isArray(cell)) {
            return cell;
        }
        if (cell.length == 0) {
            return undefined;
        }
        if (cell.length == 1) {
            return cell[0];
        }
        //console.log("cell=" + JSON.stringify(cell) + " cell[0]=" + JSON.stringify(cell[0]) + " cell[1+]=" + JSON.stringify(cell.slice(1)));
        return [ normalizeCell(cell[0]), normalizeCell(cell.slice(1)) ];
    }
    return normalizeCell(nock);
}

function simplifyNock(nock) {
    if (!Array.isArray(nock)) {
        return nock;
    }
    function simplifyCell(cell) {
        var debug = false;
        debug && console.log("WORKON " + JSON.stringify(cell));

        if (!Array.isArray(cell)) {
            debug && console.log("EXIT");
            return cell;
        }

        cell = cell.map(function (item) {
            return simplifyCell(item);
        });
        debug && console.log("MODIFIED " + JSON.stringify(cell));
        
        var allArrays = false;
        cell.map(function (item) {
            if (!Array.isArray(item)) {
                allArrays = false;
            }
        });

        if (Array.isArray(cell[cell.length - 1])) {
            //cell = [cell[0]].concat(cell[1]);
            cell = cell.slice(0, cell.length - 1).concat(cell[cell.length - 1]);
        }

        debug && console.log("RETURN " + JSON.stringify(cell));
        return cell;
    }
    return simplifyCell(nock);
}

function parseNockRaw(text) {
    //console.log("parse: " + text);
    var ps = { text: text };
    var nock = nextCell(ps);
    ps.classic = !ps.fancy;
    return nock;
}

function parseNock(text) {
    var nock = parseNockRaw(text);
    // TODO: this is a bug, we shouldn't need to simplify before normalizing!
    //console.log("RAW: " + JSON.stringify(nock));
    nock = simplifyNock(nock);
    //console.log("SIM: " + JSON.stringify(nock));
    nock = normalizeArray(nock);
    //console.log("NOR: " + JSON.stringify(nock));
    verbose && console.log("parsed " + text + " to " + JSON.stringify(nock));

    return nock;
}
module.exports.parseNock = parseNock;
module.exports.normalizeArray = normalizeArray;
module.exports.groupArray = simplifyNock;

///////////////////////////////////////////////////
if (require.main !== module) {
    return;
}

verbose = true;

function parseTest(text) {
    var nock = parseNockRaw(nock);
    console.log("...... " + JSON.stringify(nock));

    var normalized = normalizeArray(nock);
    console.log("...... " + JSON.stringify(normalized) + " (classic)");

    var simplified = simplifyNock(normalized);
    console.log("...... " + JSON.stringify(simplified) + " (simplified)");
}

function test1() {
    samples.map(function(sample) {
        parseNock(sample);
    });
    formulas.map(function(f) {
        console.log(f.label);
        parseNock(f.code);
    });
}




//parseNock("[[11 22 33] 10 [111 [0 7]] 222]");
test1();

},{}],3:[function(require,module,exports){
"use strict";

var parse = require("./parse");
var nock = require("./nock");

angular.module('nockApp', [])

    .controller('nockController', ['$scope', 'nockTree', function ($scope, nockTree) {

        console.log("nockController...");
        $scope.nockData = nockTree.info.nockData;
        $scope.stack = nockTree.info.stack;

        $scope.step = function () {
            nockTree.step();
            $scope.nockData = nockTree.info.nockData;
        };

        $scope.treeString = function (tree) {
            return JSON.stringify(tree).replace(/,/g, " ");
        };
    }])

    .factory('nockTree', ['$rootScope', function ($rootScope) {

        console.log("nockTree...");
        var nockTreeInstance = {};
        var nockData = {};
        var nockExpression;
        //nockExpression = "[ [[[4 0 1] [1 99]] [0 2]] 9 5 [0 1]]";
        //nockExpression = "[[1 2] [3 4]]";
        //nockExpression = "[[[4 0 1]] [1 99]] [0 2]]";
        //nockExpression = "[[40 43] [6 [3 0 1] [4 0 2] [4 0 1]]]";
        //nockExpression = "[[[[6 [[5 [[4 [0 3]] [0 5]]] [[0 3] [2 [[[0 2] [4 [0 3]]] [0 4]]]]]] 2] 0] [6 [[5 [[4 [0 3]] [0 5]]] [[0 3] [2 [[[0 2] [4 [0 3]]] [0 4]]]]]]]";
        nockExpression = "[1 [2 [[[[1 [6 [[5 [[4 [0 3]] [0 5]]] [[0 3] [2 [[[0 2] [4 [0 3]]] [0 4]]]]]]] [0 1]] [1 0]] [1 [2 [[0 1] [0 4]]]]]]]";
        var q = parseQueryString(window.location.href);
        if (q.nock) {
            nockExpression = q.nock;
        }
        nockData.nockExpression = nockExpression;
        nockData.result = null;

        var nockTree = parse.parseNock(nockExpression);
        var engine;
        console.log("NOCK TREE: " + JSON.stringify(nockTree));
        if (!nockTree) {
            nockData.normalizedExpression = undefined;
            
            nockTreeInstance.stack = [];
        }
        else {
            nockData.normalizedExpression = JSON.stringify(nockTree).replace(/,/g, " ").replace(/ +/g, " ");
            engine = nock.nockEvalEngine(nockTree);
            nockTreeInstance.stack = engine.stack;
        }

        var update = function () {
            if (!engine) return;
            //console.log(JSON.stringify(nockTree));

            //console.log("initing test script");
            var dagre = dagreD3.dagre;
            var g = new dagreD3.graphlib.Graph();
            g.setGraph({});

            // Default to assigning a new object as a label for each new edge.
            g.setDefaultEdgeLabel(function() { return {}; });

            function addNode(tree, address) {
                var node = "node" + address;
                var label = "/" + address;
                var isLeaf = !Array.isArray(tree);
                if (isLeaf) {
                    label = tree.toString();
                }

                g.setNode(node, { label: label, width: 50, height: 20, leaf: isLeaf });
                if (Array.isArray(tree)) {
                    var leftNode = addNode(tree[0], address * 2);
                    var rightNode = addNode(tree[1], address * 2 + 1);
                    g.setEdge(node, leftNode);
                    g.setEdge(node, rightNode);
                }
                return node;
            }
            addNode(nockTree, 1);
            dagre.layout(g);

            nockData.nodes = [];
            nockData.edges = [];
            g.nodes().forEach(function(nodeName) {
                var node = g.node(nodeName);
                //console.log("Node " + nodeName + ": " + JSON.stringify(node));
                nockData.nodes.push({
                    name: nodeName,
                    label: node.label,
                    x: node.x,
                    y: node.y,
                    width: node.width,
                    height: node.height,
                    leaf: node.leaf
                });
            });
            var canvas = document.getElementById("edge-canvas");
            var ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            g.edges().forEach(function(e) {
                //console.log("Edge " + e.v + " -> " + e.w + ": " + JSON.stringify(g.edge(e)));
                var path = new Path2D()
                var points = g.edge(e).points;
                for (var i = 0; i < points.length; i++) {
                    var p = points[i];
                    if (i == 0) {
                        path.moveTo(p.x, p.y);
                    }
                    else {
                        path.lineTo(p.x, p.y);
                    }
                }
                ctx.stroke(path);
            });

            nockTreeInstance.nockData = nockData;
        }

        var step = function () {
            if (!engine) return;
            if (engine.stack.length === 0) {
                console.log("engine.step: nothing to do ");
                return;
            }

            var topOfStack = engine.stack[engine.stack.length - 1];
            //console.log("BEFORE: ");
            //console.log(topOfStack);

            engine.step();
            nockData.result = engine.result;

            if (engine.stack.length === 0) {
                console.log("engine.step: stack is empty after step");
            }
            else {
                var topOfStack = engine.stack[engine.stack.length - 1];
                //console.log("AFTER: ");
                //console.log(topOfStack);
                //console.log("STACK HEIGHT: " + engine.stack.length);

                //nockTree = topOfStack.tree;
                nockTree = topOfStack.state.result == null ? topOfStack.tree : topOfStack.state.result;
            }

            update();
        }

        update();
        return {
            update: update,
            step: step,
            info: nockTreeInstance,
        };
    }])

;

var parseQueryString = function (url) {
    // first find the ?
    var i = url.indexOf("?");
    var query = (i >= 0) ? url.substring(i + 1) : url;
    var parts = query.split("&");
    var parsed = {};
    for (var i = 0;  i < parts.length; i++) {
        var part = parts[i];
        var pair = part.split("=");
        var key = pair[0];
        var value = pair[1] || "";
        if (key) {
            parsed[key] = unescape(value);
        }
    }
    return parsed;
};

},{"./nock":1,"./parse":2}],4:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[3]);
