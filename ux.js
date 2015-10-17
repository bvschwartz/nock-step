"use strict";

var parse = require("./parse");
var nock = require("./nock");

angular.module('nockApp', [])

    .controller('nockController', ['$scope', 'nockTree', '$timeout', function ($scope, nockTree, $timeout) {

        $scope.nockData = nockTree.info.nockData;
        $scope.stack = nockTree.info.stack;

        $scope.step = function () {
            nockTree.step();
            $timeout(function() {
                nockTree.update();
            }, 100);
        };

        $scope.state = function (nocker) {
            return nocker.state();
        };

        $scope.treeString = function (tree) {
            if (tree === null) {
                return "";
            }
            else if (typeof tree === 'string') {
                return tree;
            }
            else if (tree) {
                return JSON.stringify(tree).replace(/,/g, " ");
            }
            else {
                return JSON.stringify(tree);
            }
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
        //nockExpression = "[1 [[1 [6 [[5 [[4 [0 3]] [0 5]]] [[0 3] [2 [[[0 2] [4 [0 3]]] [0 4]]]]]]] [0 1]]]";
        nockExpression = "[[40 43] [6 [3 0 1] [4 0 2] [4 0 1]]]";
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
            engine = nock.nockEngine(nockTree);
            nockTreeInstance.stack = engine.stack;
        }

        var update = function () {
            if (!engine) return;
            //console.log(JSON.stringify(nockTree));

            //console.log("UPDATE: stack " + engine.stack.length + ", result: " + nockData.result);
            engine.stack.forEach(function(level) {
                level.state = level.nocker.state();
            });

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
            parsed[key] = decodeURIComponent(value.replace(/\+/g, '%20'));
        }
    }
    return parsed;
};
