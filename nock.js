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


