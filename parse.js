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
