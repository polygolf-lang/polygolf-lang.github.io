/*!
  Copyright (c) 2022 Jared Hughes.
  Licensed under the MIT License (MIT), see
  https://github.com/jared-hughes/polygolf
*/
"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/nearley/lib/nearley.js
  var require_nearley = __commonJS({
    "node_modules/nearley/lib/nearley.js"(exports, module) {
      (function(root, factory) {
        if (typeof module === "object" && module.exports) {
          module.exports = factory();
        } else {
          root.nearley = factory();
        }
      })(exports, function() {
        function Rule(name, symbols, postprocess) {
          this.id = ++Rule.highestId;
          this.name = name;
          this.symbols = symbols;
          this.postprocess = postprocess;
          return this;
        }
        Rule.highestId = 0;
        Rule.prototype.toString = function(withCursorAt) {
          var symbolSequence = typeof withCursorAt === "undefined" ? this.symbols.map(getSymbolShortDisplay).join(" ") : this.symbols.slice(0, withCursorAt).map(getSymbolShortDisplay).join(" ") + " \u25CF " + this.symbols.slice(withCursorAt).map(getSymbolShortDisplay).join(" ");
          return this.name + " \u2192 " + symbolSequence;
        };
        function State(rule, dot, reference, wantedBy) {
          this.rule = rule;
          this.dot = dot;
          this.reference = reference;
          this.data = [];
          this.wantedBy = wantedBy;
          this.isComplete = this.dot === rule.symbols.length;
        }
        State.prototype.toString = function() {
          return "{" + this.rule.toString(this.dot) + "}, from: " + (this.reference || 0);
        };
        State.prototype.nextState = function(child) {
          var state = new State(this.rule, this.dot + 1, this.reference, this.wantedBy);
          state.left = this;
          state.right = child;
          if (state.isComplete) {
            state.data = state.build();
            state.right = void 0;
          }
          return state;
        };
        State.prototype.build = function() {
          var children = [];
          var node = this;
          do {
            children.push(node.right.data);
            node = node.left;
          } while (node.left);
          children.reverse();
          return children;
        };
        State.prototype.finish = function() {
          if (this.rule.postprocess) {
            this.data = this.rule.postprocess(this.data, this.reference, Parser.fail);
          }
        };
        function Column(grammar2, index) {
          this.grammar = grammar2;
          this.index = index;
          this.states = [];
          this.wants = {};
          this.scannable = [];
          this.completed = {};
        }
        Column.prototype.process = function(nextColumn) {
          var states = this.states;
          var wants = this.wants;
          var completed = this.completed;
          for (var w = 0; w < states.length; w++) {
            var state = states[w];
            if (state.isComplete) {
              state.finish();
              if (state.data !== Parser.fail) {
                var wantedBy = state.wantedBy;
                for (var i = wantedBy.length; i--; ) {
                  var left = wantedBy[i];
                  this.complete(left, state);
                }
                if (state.reference === this.index) {
                  var exp = state.rule.name;
                  (this.completed[exp] = this.completed[exp] || []).push(state);
                }
              }
            } else {
              var exp = state.rule.symbols[state.dot];
              if (typeof exp !== "string") {
                this.scannable.push(state);
                continue;
              }
              if (wants[exp]) {
                wants[exp].push(state);
                if (completed.hasOwnProperty(exp)) {
                  var nulls = completed[exp];
                  for (var i = 0; i < nulls.length; i++) {
                    var right = nulls[i];
                    this.complete(state, right);
                  }
                }
              } else {
                wants[exp] = [state];
                this.predict(exp);
              }
            }
          }
        };
        Column.prototype.predict = function(exp) {
          var rules = this.grammar.byName[exp] || [];
          for (var i = 0; i < rules.length; i++) {
            var r = rules[i];
            var wantedBy = this.wants[exp];
            var s = new State(r, 0, this.index, wantedBy);
            this.states.push(s);
          }
        };
        Column.prototype.complete = function(left, right) {
          var copy = left.nextState(right);
          this.states.push(copy);
        };
        function Grammar(rules, start) {
          this.rules = rules;
          this.start = start || this.rules[0].name;
          var byName = this.byName = {};
          this.rules.forEach(function(rule) {
            if (!byName.hasOwnProperty(rule.name)) {
              byName[rule.name] = [];
            }
            byName[rule.name].push(rule);
          });
        }
        Grammar.fromCompiled = function(rules, start) {
          var lexer2 = rules.Lexer;
          if (rules.ParserStart) {
            start = rules.ParserStart;
            rules = rules.ParserRules;
          }
          var rules = rules.map(function(r) {
            return new Rule(r.name, r.symbols, r.postprocess);
          });
          var g = new Grammar(rules, start);
          g.lexer = lexer2;
          return g;
        };
        function StreamLexer() {
          this.reset("");
        }
        StreamLexer.prototype.reset = function(data, state) {
          this.buffer = data;
          this.index = 0;
          this.line = state ? state.line : 1;
          this.lastLineBreak = state ? -state.col : 0;
        };
        StreamLexer.prototype.next = function() {
          if (this.index < this.buffer.length) {
            var ch = this.buffer[this.index++];
            if (ch === "\n") {
              this.line += 1;
              this.lastLineBreak = this.index;
            }
            return { value: ch };
          }
        };
        StreamLexer.prototype.save = function() {
          return {
            line: this.line,
            col: this.index - this.lastLineBreak
          };
        };
        StreamLexer.prototype.formatError = function(token, message) {
          var buffer = this.buffer;
          if (typeof buffer === "string") {
            var lines = buffer.split("\n").slice(
              Math.max(0, this.line - 5),
              this.line
            );
            var nextLineBreak = buffer.indexOf("\n", this.index);
            if (nextLineBreak === -1)
              nextLineBreak = buffer.length;
            var col = this.index - this.lastLineBreak;
            var lastLineDigits = String(this.line).length;
            message += " at line " + this.line + " col " + col + ":\n\n";
            message += lines.map(function(line, i) {
              return pad(this.line - lines.length + i + 1, lastLineDigits) + " " + line;
            }, this).join("\n");
            message += "\n" + pad("", lastLineDigits + col) + "^\n";
            return message;
          } else {
            return message + " at index " + (this.index - 1);
          }
          function pad(n, length) {
            var s = String(n);
            return Array(length - s.length + 1).join(" ") + s;
          }
        };
        function Parser(rules, start, options) {
          if (rules instanceof Grammar) {
            var grammar2 = rules;
            var options = start;
          } else {
            var grammar2 = Grammar.fromCompiled(rules, start);
          }
          this.grammar = grammar2;
          this.options = {
            keepHistory: false,
            lexer: grammar2.lexer || new StreamLexer()
          };
          for (var key in options || {}) {
            this.options[key] = options[key];
          }
          this.lexer = this.options.lexer;
          this.lexerState = void 0;
          var column = new Column(grammar2, 0);
          var table = this.table = [column];
          column.wants[grammar2.start] = [];
          column.predict(grammar2.start);
          column.process();
          this.current = 0;
        }
        Parser.fail = {};
        Parser.prototype.feed = function(chunk) {
          var lexer2 = this.lexer;
          lexer2.reset(chunk, this.lexerState);
          var token;
          while (true) {
            try {
              token = lexer2.next();
              if (!token) {
                break;
              }
            } catch (e) {
              var nextColumn = new Column(this.grammar, this.current + 1);
              this.table.push(nextColumn);
              var err = new Error(this.reportLexerError(e));
              err.offset = this.current;
              err.token = e.token;
              throw err;
            }
            var column = this.table[this.current];
            if (!this.options.keepHistory) {
              delete this.table[this.current - 1];
            }
            var n = this.current + 1;
            var nextColumn = new Column(this.grammar, n);
            this.table.push(nextColumn);
            var literal = token.text !== void 0 ? token.text : token.value;
            var value = lexer2.constructor === StreamLexer ? token.value : token;
            var scannable = column.scannable;
            for (var w = scannable.length; w--; ) {
              var state = scannable[w];
              var expect = state.rule.symbols[state.dot];
              if (expect.test ? expect.test(value) : expect.type ? expect.type === token.type : expect.literal === literal) {
                var next = state.nextState({ data: value, token, isToken: true, reference: n - 1 });
                nextColumn.states.push(next);
              }
            }
            nextColumn.process();
            if (nextColumn.states.length === 0) {
              var err = new Error(this.reportError(token));
              err.offset = this.current;
              err.token = token;
              throw err;
            }
            if (this.options.keepHistory) {
              column.lexerState = lexer2.save();
            }
            this.current++;
          }
          if (column) {
            this.lexerState = lexer2.save();
          }
          this.results = this.finish();
          return this;
        };
        Parser.prototype.reportLexerError = function(lexerError) {
          var tokenDisplay, lexerMessage;
          var token = lexerError.token;
          if (token) {
            tokenDisplay = "input " + JSON.stringify(token.text[0]) + " (lexer error)";
            lexerMessage = this.lexer.formatError(token, "Syntax error");
          } else {
            tokenDisplay = "input (lexer error)";
            lexerMessage = lexerError.message;
          }
          return this.reportErrorCommon(lexerMessage, tokenDisplay);
        };
        Parser.prototype.reportError = function(token) {
          var tokenDisplay = (token.type ? token.type + " token: " : "") + JSON.stringify(token.value !== void 0 ? token.value : token);
          var lexerMessage = this.lexer.formatError(token, "Syntax error");
          return this.reportErrorCommon(lexerMessage, tokenDisplay);
        };
        Parser.prototype.reportErrorCommon = function(lexerMessage, tokenDisplay) {
          var lines = [];
          lines.push(lexerMessage);
          var lastColumnIndex = this.table.length - 2;
          var lastColumn = this.table[lastColumnIndex];
          var expectantStates = lastColumn.states.filter(function(state) {
            var nextSymbol = state.rule.symbols[state.dot];
            return nextSymbol && typeof nextSymbol !== "string";
          });
          if (expectantStates.length === 0) {
            lines.push("Unexpected " + tokenDisplay + ". I did not expect any more input. Here is the state of my parse table:\n");
            this.displayStateStack(lastColumn.states, lines);
          } else {
            lines.push("Unexpected " + tokenDisplay + ". Instead, I was expecting to see one of the following:\n");
            var stateStacks = expectantStates.map(function(state) {
              return this.buildFirstStateStack(state, []) || [state];
            }, this);
            stateStacks.forEach(function(stateStack) {
              var state = stateStack[0];
              var nextSymbol = state.rule.symbols[state.dot];
              var symbolDisplay = this.getSymbolDisplay(nextSymbol);
              lines.push("A " + symbolDisplay + " based on:");
              this.displayStateStack(stateStack, lines);
            }, this);
          }
          lines.push("");
          return lines.join("\n");
        };
        Parser.prototype.displayStateStack = function(stateStack, lines) {
          var lastDisplay;
          var sameDisplayCount = 0;
          for (var j = 0; j < stateStack.length; j++) {
            var state = stateStack[j];
            var display = state.rule.toString(state.dot);
            if (display === lastDisplay) {
              sameDisplayCount++;
            } else {
              if (sameDisplayCount > 0) {
                lines.push("    ^ " + sameDisplayCount + " more lines identical to this");
              }
              sameDisplayCount = 0;
              lines.push("    " + display);
            }
            lastDisplay = display;
          }
        };
        Parser.prototype.getSymbolDisplay = function(symbol) {
          return getSymbolLongDisplay(symbol);
        };
        Parser.prototype.buildFirstStateStack = function(state, visited) {
          if (visited.indexOf(state) !== -1) {
            return null;
          }
          if (state.wantedBy.length === 0) {
            return [state];
          }
          var prevState = state.wantedBy[0];
          var childVisited = [state].concat(visited);
          var childResult = this.buildFirstStateStack(prevState, childVisited);
          if (childResult === null) {
            return null;
          }
          return [state].concat(childResult);
        };
        Parser.prototype.save = function() {
          var column = this.table[this.current];
          column.lexerState = this.lexerState;
          return column;
        };
        Parser.prototype.restore = function(column) {
          var index = column.index;
          this.current = index;
          this.table[index] = column;
          this.table.splice(index + 1);
          this.lexerState = column.lexerState;
          this.results = this.finish();
        };
        Parser.prototype.rewind = function(index) {
          if (!this.options.keepHistory) {
            throw new Error("set option `keepHistory` to enable rewinding");
          }
          this.restore(this.table[index]);
        };
        Parser.prototype.finish = function() {
          var considerations = [];
          var start = this.grammar.start;
          var column = this.table[this.table.length - 1];
          column.states.forEach(function(t) {
            if (t.rule.name === start && t.dot === t.rule.symbols.length && t.reference === 0 && t.data !== Parser.fail) {
              considerations.push(t);
            }
          });
          return considerations.map(function(c) {
            return c.data;
          });
        };
        function getSymbolLongDisplay(symbol) {
          var type3 = typeof symbol;
          if (type3 === "string") {
            return symbol;
          } else if (type3 === "object") {
            if (symbol.literal) {
              return JSON.stringify(symbol.literal);
            } else if (symbol instanceof RegExp) {
              return "character matching " + symbol;
            } else if (symbol.type) {
              return symbol.type + " token";
            } else if (symbol.test) {
              return "token matching " + String(symbol.test);
            } else {
              throw new Error("Unknown symbol type: " + symbol);
            }
          }
        }
        function getSymbolShortDisplay(symbol) {
          var type3 = typeof symbol;
          if (type3 === "string") {
            return symbol;
          } else if (type3 === "object") {
            if (symbol.literal) {
              return JSON.stringify(symbol.literal);
            } else if (symbol instanceof RegExp) {
              return symbol.toString();
            } else if (symbol.type) {
              return "%" + symbol.type;
            } else if (symbol.test) {
              return "<" + String(symbol.test) + ">";
            } else {
              throw new Error("Unknown symbol type: " + symbol);
            }
          }
        }
        return {
          Parser,
          Grammar,
          Rule
        };
      });
    }
  });

  // node_modules/moo/moo.js
  var require_moo = __commonJS({
    "node_modules/moo/moo.js"(exports, module) {
      (function(root, factory) {
        if (typeof define === "function" && define.amd) {
          define([], factory);
        } else if (typeof module === "object" && module.exports) {
          module.exports = factory();
        } else {
          root.moo = factory();
        }
      })(exports, function() {
        "use strict";
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        var toString2 = Object.prototype.toString;
        var hasSticky = typeof new RegExp().sticky === "boolean";
        function isRegExp(o) {
          return o && toString2.call(o) === "[object RegExp]";
        }
        function isObject(o) {
          return o && typeof o === "object" && !isRegExp(o) && !Array.isArray(o);
        }
        function reEscape(s) {
          return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
        }
        function reGroups(s) {
          var re = new RegExp("|" + s);
          return re.exec("").length - 1;
        }
        function reCapture(s) {
          return "(" + s + ")";
        }
        function reUnion(regexps) {
          if (!regexps.length)
            return "(?!)";
          var source = regexps.map(function(s) {
            return "(?:" + s + ")";
          }).join("|");
          return "(?:" + source + ")";
        }
        function regexpOrLiteral(obj) {
          if (typeof obj === "string") {
            return "(?:" + reEscape(obj) + ")";
          } else if (isRegExp(obj)) {
            if (obj.ignoreCase)
              throw new Error("RegExp /i flag not allowed");
            if (obj.global)
              throw new Error("RegExp /g flag is implied");
            if (obj.sticky)
              throw new Error("RegExp /y flag is implied");
            if (obj.multiline)
              throw new Error("RegExp /m flag is implied");
            return obj.source;
          } else {
            throw new Error("Not a pattern: " + obj);
          }
        }
        function pad(s, length) {
          if (s.length > length) {
            return s;
          }
          return Array(length - s.length + 1).join(" ") + s;
        }
        function lastNLines(string2, numLines) {
          var position = string2.length;
          var lineBreaks = 0;
          while (true) {
            var idx = string2.lastIndexOf("\n", position - 1);
            if (idx === -1) {
              break;
            } else {
              lineBreaks++;
            }
            position = idx;
            if (lineBreaks === numLines) {
              break;
            }
            if (position === 0) {
              break;
            }
          }
          var startPosition = lineBreaks < numLines ? 0 : position + 1;
          return string2.substring(startPosition).split("\n");
        }
        function objectToRules(object) {
          var keys = Object.getOwnPropertyNames(object);
          var result = [];
          for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var thing = object[key];
            var rules = [].concat(thing);
            if (key === "include") {
              for (var j = 0; j < rules.length; j++) {
                result.push({ include: rules[j] });
              }
              continue;
            }
            var match = [];
            rules.forEach(function(rule) {
              if (isObject(rule)) {
                if (match.length)
                  result.push(ruleOptions(key, match));
                result.push(ruleOptions(key, rule));
                match = [];
              } else {
                match.push(rule);
              }
            });
            if (match.length)
              result.push(ruleOptions(key, match));
          }
          return result;
        }
        function arrayToRules(array) {
          var result = [];
          for (var i = 0; i < array.length; i++) {
            var obj = array[i];
            if (obj.include) {
              var include = [].concat(obj.include);
              for (var j = 0; j < include.length; j++) {
                result.push({ include: include[j] });
              }
              continue;
            }
            if (!obj.type) {
              throw new Error("Rule has no type: " + JSON.stringify(obj));
            }
            result.push(ruleOptions(obj.type, obj));
          }
          return result;
        }
        function ruleOptions(type3, obj) {
          if (!isObject(obj)) {
            obj = { match: obj };
          }
          if (obj.include) {
            throw new Error("Matching rules cannot also include states");
          }
          var options = {
            defaultType: type3,
            lineBreaks: !!obj.error || !!obj.fallback,
            pop: false,
            next: null,
            push: null,
            error: false,
            fallback: false,
            value: null,
            type: null,
            shouldThrow: false
          };
          for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) {
              options[key] = obj[key];
            }
          }
          if (typeof options.type === "string" && type3 !== options.type) {
            throw new Error("Type transform cannot be a string (type '" + options.type + "' for token '" + type3 + "')");
          }
          var match = options.match;
          options.match = Array.isArray(match) ? match : match ? [match] : [];
          options.match.sort(function(a, b) {
            return isRegExp(a) && isRegExp(b) ? 0 : isRegExp(b) ? -1 : isRegExp(a) ? 1 : b.length - a.length;
          });
          return options;
        }
        function toRules(spec) {
          return Array.isArray(spec) ? arrayToRules(spec) : objectToRules(spec);
        }
        var defaultErrorRule = ruleOptions("error", { lineBreaks: true, shouldThrow: true });
        function compileRules(rules, hasStates) {
          var errorRule = null;
          var fast = /* @__PURE__ */ Object.create(null);
          var fastAllowed = true;
          var unicodeFlag = null;
          var groups = [];
          var parts = [];
          for (var i = 0; i < rules.length; i++) {
            if (rules[i].fallback) {
              fastAllowed = false;
            }
          }
          for (var i = 0; i < rules.length; i++) {
            var options = rules[i];
            if (options.include) {
              throw new Error("Inheritance is not allowed in stateless lexers");
            }
            if (options.error || options.fallback) {
              if (errorRule) {
                if (!options.fallback === !errorRule.fallback) {
                  throw new Error("Multiple " + (options.fallback ? "fallback" : "error") + " rules not allowed (for token '" + options.defaultType + "')");
                } else {
                  throw new Error("fallback and error are mutually exclusive (for token '" + options.defaultType + "')");
                }
              }
              errorRule = options;
            }
            var match = options.match.slice();
            if (fastAllowed) {
              while (match.length && typeof match[0] === "string" && match[0].length === 1) {
                var word = match.shift();
                fast[word.charCodeAt(0)] = options;
              }
            }
            if (options.pop || options.push || options.next) {
              if (!hasStates) {
                throw new Error("State-switching options are not allowed in stateless lexers (for token '" + options.defaultType + "')");
              }
              if (options.fallback) {
                throw new Error("State-switching options are not allowed on fallback tokens (for token '" + options.defaultType + "')");
              }
            }
            if (match.length === 0) {
              continue;
            }
            fastAllowed = false;
            groups.push(options);
            for (var j = 0; j < match.length; j++) {
              var obj = match[j];
              if (!isRegExp(obj)) {
                continue;
              }
              if (unicodeFlag === null) {
                unicodeFlag = obj.unicode;
              } else if (unicodeFlag !== obj.unicode && options.fallback === false) {
                throw new Error("If one rule is /u then all must be");
              }
            }
            var pat = reUnion(match.map(regexpOrLiteral));
            var regexp = new RegExp(pat);
            if (regexp.test("")) {
              throw new Error("RegExp matches empty string: " + regexp);
            }
            var groupCount = reGroups(pat);
            if (groupCount > 0) {
              throw new Error("RegExp has capture groups: " + regexp + "\nUse (?: \u2026 ) instead");
            }
            if (!options.lineBreaks && regexp.test("\n")) {
              throw new Error("Rule should declare lineBreaks: " + regexp);
            }
            parts.push(reCapture(pat));
          }
          var fallbackRule = errorRule && errorRule.fallback;
          var flags = hasSticky && !fallbackRule ? "ym" : "gm";
          var suffix = hasSticky || fallbackRule ? "" : "|";
          if (unicodeFlag === true)
            flags += "u";
          var combined = new RegExp(reUnion(parts) + suffix, flags);
          return { regexp: combined, groups, fast, error: errorRule || defaultErrorRule };
        }
        function compile2(rules) {
          var result = compileRules(toRules(rules));
          return new Lexer({ start: result }, "start");
        }
        function checkStateGroup(g, name, map) {
          var state = g && (g.push || g.next);
          if (state && !map[state]) {
            throw new Error("Missing state '" + state + "' (in token '" + g.defaultType + "' of state '" + name + "')");
          }
          if (g && g.pop && +g.pop !== 1) {
            throw new Error("pop must be 1 (in token '" + g.defaultType + "' of state '" + name + "')");
          }
        }
        function compileStates(states, start) {
          var all = states.$all ? toRules(states.$all) : [];
          delete states.$all;
          var keys = Object.getOwnPropertyNames(states);
          if (!start)
            start = keys[0];
          var ruleMap = /* @__PURE__ */ Object.create(null);
          for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            ruleMap[key] = toRules(states[key]).concat(all);
          }
          for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var rules = ruleMap[key];
            var included = /* @__PURE__ */ Object.create(null);
            for (var j = 0; j < rules.length; j++) {
              var rule = rules[j];
              if (!rule.include)
                continue;
              var splice = [j, 1];
              if (rule.include !== key && !included[rule.include]) {
                included[rule.include] = true;
                var newRules = ruleMap[rule.include];
                if (!newRules) {
                  throw new Error("Cannot include nonexistent state '" + rule.include + "' (in state '" + key + "')");
                }
                for (var k = 0; k < newRules.length; k++) {
                  var newRule = newRules[k];
                  if (rules.indexOf(newRule) !== -1)
                    continue;
                  splice.push(newRule);
                }
              }
              rules.splice.apply(rules, splice);
              j--;
            }
          }
          var map = /* @__PURE__ */ Object.create(null);
          for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            map[key] = compileRules(ruleMap[key], true);
          }
          for (var i = 0; i < keys.length; i++) {
            var name = keys[i];
            var state = map[name];
            var groups = state.groups;
            for (var j = 0; j < groups.length; j++) {
              checkStateGroup(groups[j], name, map);
            }
            var fastKeys = Object.getOwnPropertyNames(state.fast);
            for (var j = 0; j < fastKeys.length; j++) {
              checkStateGroup(state.fast[fastKeys[j]], name, map);
            }
          }
          return new Lexer(map, start);
        }
        function keywordTransform(map) {
          var isMap = typeof Map !== "undefined";
          var reverseMap = isMap ? /* @__PURE__ */ new Map() : /* @__PURE__ */ Object.create(null);
          var types = Object.getOwnPropertyNames(map);
          for (var i = 0; i < types.length; i++) {
            var tokenType = types[i];
            var item = map[tokenType];
            var keywordList = Array.isArray(item) ? item : [item];
            keywordList.forEach(function(keyword) {
              if (typeof keyword !== "string") {
                throw new Error("keyword must be string (in keyword '" + tokenType + "')");
              }
              if (isMap) {
                reverseMap.set(keyword, tokenType);
              } else {
                reverseMap[keyword] = tokenType;
              }
            });
          }
          return function(k) {
            return isMap ? reverseMap.get(k) : reverseMap[k];
          };
        }
        var Lexer = function(states, state) {
          this.startState = state;
          this.states = states;
          this.buffer = "";
          this.stack = [];
          this.reset();
        };
        Lexer.prototype.reset = function(data, info) {
          this.buffer = data || "";
          this.index = 0;
          this.line = info ? info.line : 1;
          this.col = info ? info.col : 1;
          this.queuedToken = info ? info.queuedToken : null;
          this.queuedText = info ? info.queuedText : "";
          this.queuedThrow = info ? info.queuedThrow : null;
          this.setState(info ? info.state : this.startState);
          this.stack = info && info.stack ? info.stack.slice() : [];
          return this;
        };
        Lexer.prototype.save = function() {
          return {
            line: this.line,
            col: this.col,
            state: this.state,
            stack: this.stack.slice(),
            queuedToken: this.queuedToken,
            queuedText: this.queuedText,
            queuedThrow: this.queuedThrow
          };
        };
        Lexer.prototype.setState = function(state) {
          if (!state || this.state === state)
            return;
          this.state = state;
          var info = this.states[state];
          this.groups = info.groups;
          this.error = info.error;
          this.re = info.regexp;
          this.fast = info.fast;
        };
        Lexer.prototype.popState = function() {
          this.setState(this.stack.pop());
        };
        Lexer.prototype.pushState = function(state) {
          this.stack.push(this.state);
          this.setState(state);
        };
        var eat = hasSticky ? function(re, buffer) {
          return re.exec(buffer);
        } : function(re, buffer) {
          var match = re.exec(buffer);
          if (match[0].length === 0) {
            return null;
          }
          return match;
        };
        Lexer.prototype._getGroup = function(match) {
          var groupCount = this.groups.length;
          for (var i = 0; i < groupCount; i++) {
            if (match[i + 1] !== void 0) {
              return this.groups[i];
            }
          }
          throw new Error("Cannot find token type for matched text");
        };
        function tokenToString() {
          return this.value;
        }
        Lexer.prototype.next = function() {
          var index = this.index;
          if (this.queuedGroup) {
            var token = this._token(this.queuedGroup, this.queuedText, index);
            this.queuedGroup = null;
            this.queuedText = "";
            return token;
          }
          var buffer = this.buffer;
          if (index === buffer.length) {
            return;
          }
          var group = this.fast[buffer.charCodeAt(index)];
          if (group) {
            return this._token(group, buffer.charAt(index), index);
          }
          var re = this.re;
          re.lastIndex = index;
          var match = eat(re, buffer);
          var error = this.error;
          if (match == null) {
            return this._token(error, buffer.slice(index, buffer.length), index);
          }
          var group = this._getGroup(match);
          var text2 = match[0];
          if (error.fallback && match.index !== index) {
            this.queuedGroup = group;
            this.queuedText = text2;
            return this._token(error, buffer.slice(index, match.index), index);
          }
          return this._token(group, text2, index);
        };
        Lexer.prototype._token = function(group, text2, offset) {
          var lineBreaks = 0;
          if (group.lineBreaks) {
            var matchNL = /\n/g;
            var nl = 1;
            if (text2 === "\n") {
              lineBreaks = 1;
            } else {
              while (matchNL.exec(text2)) {
                lineBreaks++;
                nl = matchNL.lastIndex;
              }
            }
          }
          var token = {
            type: typeof group.type === "function" && group.type(text2) || group.defaultType,
            value: typeof group.value === "function" ? group.value(text2) : text2,
            text: text2,
            toString: tokenToString,
            offset,
            lineBreaks,
            line: this.line,
            col: this.col
          };
          var size = text2.length;
          this.index += size;
          this.line += lineBreaks;
          if (lineBreaks !== 0) {
            this.col = size - nl + 1;
          } else {
            this.col += size;
          }
          if (group.shouldThrow) {
            var err = new Error(this.formatError(token, "invalid syntax"));
            throw err;
          }
          if (group.pop)
            this.popState();
          else if (group.push)
            this.pushState(group.push);
          else if (group.next)
            this.setState(group.next);
          return token;
        };
        if (typeof Symbol !== "undefined" && Symbol.iterator) {
          var LexerIterator = function(lexer2) {
            this.lexer = lexer2;
          };
          LexerIterator.prototype.next = function() {
            var token = this.lexer.next();
            return { value: token, done: !token };
          };
          LexerIterator.prototype[Symbol.iterator] = function() {
            return this;
          };
          Lexer.prototype[Symbol.iterator] = function() {
            return new LexerIterator(this);
          };
        }
        Lexer.prototype.formatError = function(token, message) {
          if (token == null) {
            var text2 = this.buffer.slice(this.index);
            var token = {
              text: text2,
              offset: this.index,
              lineBreaks: text2.indexOf("\n") === -1 ? 0 : 1,
              line: this.line,
              col: this.col
            };
          }
          var numLinesAround = 2;
          var firstDisplayedLine = Math.max(token.line - numLinesAround, 1);
          var lastDisplayedLine = token.line + numLinesAround;
          var lastLineDigits = String(lastDisplayedLine).length;
          var displayedLines = lastNLines(
            this.buffer,
            this.line - token.line + numLinesAround + 1
          ).slice(0, 5);
          var errorLines = [];
          errorLines.push(message + " at line " + token.line + " col " + token.col + ":");
          errorLines.push("");
          for (var i = 0; i < displayedLines.length; i++) {
            var line = displayedLines[i];
            var lineNo = firstDisplayedLine + i;
            errorLines.push(pad(String(lineNo), lastLineDigits) + "  " + line);
            if (lineNo === token.line) {
              errorLines.push(pad("", lastLineDigits + token.col + 1) + "^");
            }
          }
          return errorLines.join("\n");
        };
        Lexer.prototype.clone = function() {
          return new Lexer(this.states, this.state);
        };
        Lexer.prototype.has = function(tokenType) {
          return true;
        };
        return {
          compile: compile2,
          states: compileStates,
          error: Object.freeze({ error: true }),
          fallback: Object.freeze({ fallback: true }),
          keywords: keywordTransform
        };
      });
    }
  });

  // node_modules/@datastructures-js/heap/src/heap.js
  var require_heap = __commonJS({
    "node_modules/@datastructures-js/heap/src/heap.js"(exports) {
      var Heap = class {
        /**
         * @param {function} compare
         * @param {array} [_values]
         * @param {number|string|object} [_leaf]
         */
        constructor(compare, _values, _leaf) {
          if (typeof compare !== "function") {
            throw new Error("Heap constructor expects a compare function");
          }
          this._compare = compare;
          this._nodes = Array.isArray(_values) ? _values : [];
          this._leaf = _leaf || null;
        }
        /**
         * Converts the heap to a cloned array without sorting.
         * @public
         * @returns {Array}
         */
        toArray() {
          return Array.from(this._nodes);
        }
        /**
         * Checks if a parent has a left child
         * @private
         */
        _hasLeftChild(parentIndex) {
          const leftChildIndex = parentIndex * 2 + 1;
          return leftChildIndex < this.size();
        }
        /**
         * Checks if a parent has a right child
         * @private
         */
        _hasRightChild(parentIndex) {
          const rightChildIndex = parentIndex * 2 + 2;
          return rightChildIndex < this.size();
        }
        /**
         * Compares two nodes
         * @private
         */
        _compareAt(i, j) {
          return this._compare(this._nodes[i], this._nodes[j]);
        }
        /**
         * Swaps two nodes in the heap
         * @private
         */
        _swap(i, j) {
          const temp = this._nodes[i];
          this._nodes[i] = this._nodes[j];
          this._nodes[j] = temp;
        }
        /**
         * Checks if parent and child should be swapped
         * @private
         */
        _shouldSwap(parentIndex, childIndex) {
          if (parentIndex < 0 || parentIndex >= this.size()) {
            return false;
          }
          if (childIndex < 0 || childIndex >= this.size()) {
            return false;
          }
          return this._compareAt(parentIndex, childIndex) > 0;
        }
        /**
         * Compares children of a parent
         * @private
         */
        _compareChildrenOf(parentIndex) {
          if (!this._hasLeftChild(parentIndex) && !this._hasRightChild(parentIndex)) {
            return -1;
          }
          const leftChildIndex = parentIndex * 2 + 1;
          const rightChildIndex = parentIndex * 2 + 2;
          if (!this._hasLeftChild(parentIndex)) {
            return rightChildIndex;
          }
          if (!this._hasRightChild(parentIndex)) {
            return leftChildIndex;
          }
          const compare = this._compareAt(leftChildIndex, rightChildIndex);
          return compare > 0 ? rightChildIndex : leftChildIndex;
        }
        /**
         * Compares two children before a position
         * @private
         */
        _compareChildrenBefore(index, leftChildIndex, rightChildIndex) {
          const compare = this._compareAt(rightChildIndex, leftChildIndex);
          if (compare <= 0 && rightChildIndex < index) {
            return rightChildIndex;
          }
          return leftChildIndex;
        }
        /**
         * Recursively bubbles up a node if it's in a wrong position
         * @private
         */
        _heapifyUp(startIndex) {
          let childIndex = startIndex;
          let parentIndex = Math.floor((childIndex - 1) / 2);
          while (this._shouldSwap(parentIndex, childIndex)) {
            this._swap(parentIndex, childIndex);
            childIndex = parentIndex;
            parentIndex = Math.floor((childIndex - 1) / 2);
          }
        }
        /**
         * Recursively bubbles down a node if it's in a wrong position
         * @private
         */
        _heapifyDown(startIndex) {
          let parentIndex = startIndex;
          let childIndex = this._compareChildrenOf(parentIndex);
          while (this._shouldSwap(parentIndex, childIndex)) {
            this._swap(parentIndex, childIndex);
            parentIndex = childIndex;
            childIndex = this._compareChildrenOf(parentIndex);
          }
        }
        /**
         * Recursively bubbles down a node before a given index
         * @private
         */
        _heapifyDownUntil(index) {
          let parentIndex = 0;
          let leftChildIndex = 1;
          let rightChildIndex = 2;
          let childIndex;
          while (leftChildIndex < index) {
            childIndex = this._compareChildrenBefore(
              index,
              leftChildIndex,
              rightChildIndex
            );
            if (this._shouldSwap(parentIndex, childIndex)) {
              this._swap(parentIndex, childIndex);
            }
            parentIndex = childIndex;
            leftChildIndex = parentIndex * 2 + 1;
            rightChildIndex = parentIndex * 2 + 2;
          }
        }
        /**
         * Inserts a new value into the heap
         * @public
         * @param {number|string|object} value
         * @returns {Heap}
         */
        insert(value) {
          this._nodes.push(value);
          this._heapifyUp(this.size() - 1);
          if (this._leaf === null || this._compare(value, this._leaf) > 0) {
            this._leaf = value;
          }
          return this;
        }
        /**
         * Inserts a new value into the heap
         * @public
         * @param {number|string|object} value
         * @returns {Heap}
         */
        push(value) {
          return this.insert(value);
        }
        /**
         * Removes and returns the root node in the heap
         * @public
         * @returns {number|string|object}
         */
        extractRoot() {
          if (this.isEmpty()) {
            return null;
          }
          const root = this.root();
          this._nodes[0] = this._nodes[this.size() - 1];
          this._nodes.pop();
          this._heapifyDown(0);
          if (root === this._leaf) {
            this._leaf = this.root();
          }
          return root;
        }
        /**
         * Removes and returns the root node in the heap
         * @public
         * @returns {number|string|object}
         */
        pop() {
          return this.extractRoot();
        }
        /**
         * Applies heap sort and return the values sorted by priority
         * @public
         * @returns {array}
         */
        sort() {
          for (let i = this.size() - 1; i > 0; i -= 1) {
            this._swap(0, i);
            this._heapifyDownUntil(i);
          }
          return this._nodes;
        }
        /**
         * Fixes node positions in the heap
         * @public
         * @returns {Heap}
         */
        fix() {
          for (let i = Math.floor(this.size() / 2) - 1; i >= 0; i -= 1) {
            this._heapifyDown(i);
          }
          for (let i = Math.floor(this.size() / 2); i < this.size(); i += 1) {
            const value = this._nodes[i];
            if (this._leaf === null || this._compare(value, this._leaf) > 0) {
              this._leaf = value;
            }
          }
          return this;
        }
        /**
         * Verifies that all heap nodes are in the right position
         * @public
         * @returns {boolean}
         */
        isValid() {
          const isValidRecursive = (parentIndex) => {
            let isValidLeft = true;
            let isValidRight = true;
            if (this._hasLeftChild(parentIndex)) {
              const leftChildIndex = parentIndex * 2 + 1;
              if (this._compareAt(parentIndex, leftChildIndex) > 0) {
                return false;
              }
              isValidLeft = isValidRecursive(leftChildIndex);
            }
            if (this._hasRightChild(parentIndex)) {
              const rightChildIndex = parentIndex * 2 + 2;
              if (this._compareAt(parentIndex, rightChildIndex) > 0) {
                return false;
              }
              isValidRight = isValidRecursive(rightChildIndex);
            }
            return isValidLeft && isValidRight;
          };
          return isValidRecursive(0);
        }
        /**
         * Returns a shallow copy of the heap
         * @public
         * @returns {Heap}
         */
        clone() {
          return new Heap(this._compare, this._nodes.slice(), this._leaf);
        }
        /**
         * Returns the root node in the heap
         * @public
         * @returns {number|string|object}
         */
        root() {
          if (this.isEmpty()) {
            return null;
          }
          return this._nodes[0];
        }
        /**
         * Returns the root node in the heap
         * @public
         * @returns {number|string|object}
         */
        top() {
          return this.root();
        }
        /**
         * Returns a leaf node in the heap
         * @public
         * @returns {number|string|object}
         */
        leaf() {
          return this._leaf;
        }
        /**
         * Returns the number of nodes in the heap
         * @public
         * @returns {number}
         */
        size() {
          return this._nodes.length;
        }
        /**
         * Checks if the heap is empty
         * @public
         * @returns {boolean}
         */
        isEmpty() {
          return this.size() === 0;
        }
        /**
         * Clears the heap
         * @public
         */
        clear() {
          this._nodes = [];
          this._leaf = null;
        }
        /**
         * Implements an iterable on the heap
         * @public
         */
        [Symbol.iterator]() {
          let size = this.size();
          return {
            next: () => {
              size -= 1;
              return {
                value: this.pop(),
                done: size === -1
              };
            }
          };
        }
        /**
         * Builds a heap from a array of values
         * @public
         * @static
         * @param {array} values
         * @param {function} compare
         * @returns {Heap}
         */
        static heapify(values, compare) {
          if (!Array.isArray(values)) {
            throw new Error("Heap.heapify expects an array of values");
          }
          if (typeof compare !== "function") {
            throw new Error("Heap.heapify expects a compare function");
          }
          return new Heap(compare, values).fix();
        }
        /**
         * Checks if a list of values is a valid heap
         * @public
         * @static
         * @param {array} values
         * @param {function} compare
         * @returns {boolean}
         */
        static isHeapified(values, compare) {
          return new Heap(compare, values).isValid();
        }
      };
      exports.Heap = Heap;
    }
  });

  // node_modules/@datastructures-js/heap/src/minHeap.js
  var require_minHeap = __commonJS({
    "node_modules/@datastructures-js/heap/src/minHeap.js"(exports) {
      var { Heap } = require_heap();
      var getMinCompare = (getCompareValue) => (a, b) => {
        const aVal = typeof getCompareValue === "function" ? getCompareValue(a) : a;
        const bVal = typeof getCompareValue === "function" ? getCompareValue(b) : b;
        return aVal < bVal ? -1 : 1;
      };
      var MinHeap = class {
        /**
         * @param {function} [getCompareValue]
         * @param {Heap} [_heap]
         */
        constructor(getCompareValue, _heap) {
          this._getCompareValue = getCompareValue;
          this._heap = _heap || new Heap(getMinCompare(getCompareValue));
        }
        /**
         * Converts the heap to a cloned array without sorting.
         * @public
         * @returns {Array}
         */
        toArray() {
          return Array.from(this._heap._nodes);
        }
        /**
         * Inserts a new value into the heap
         * @public
         * @param {number|string|object} value
         * @returns {MinHeap}
         */
        insert(value) {
          return this._heap.insert(value);
        }
        /**
         * Inserts a new value into the heap
         * @public
         * @param {number|string|object} value
         * @returns {Heap}
         */
        push(value) {
          return this.insert(value);
        }
        /**
         * Removes and returns the root node in the heap
         * @public
         * @returns {number|string|object}
         */
        extractRoot() {
          return this._heap.extractRoot();
        }
        /**
         * Removes and returns the root node in the heap
         * @public
         * @returns {number|string|object}
         */
        pop() {
          return this.extractRoot();
        }
        /**
         * Applies heap sort and return the values sorted by priority
         * @public
         * @returns {array}
         */
        sort() {
          return this._heap.sort();
        }
        /**
         * Fixes node positions in the heap
         * @public
         * @returns {MinHeap}
         */
        fix() {
          return this._heap.fix();
        }
        /**
         * Verifies that all heap nodes are in the right position
         * @public
         * @returns {boolean}
         */
        isValid() {
          return this._heap.isValid();
        }
        /**
         * Returns the root node in the heap
         * @public
         * @returns {number|string|object}
         */
        root() {
          return this._heap.root();
        }
        /**
         * Returns the root node in the heap
         * @public
         * @returns {number|string|object}
         */
        top() {
          return this.root();
        }
        /**
         * Returns a leaf node in the heap
         * @public
         * @returns {number|string|object}
         */
        leaf() {
          return this._heap.leaf();
        }
        /**
         * Returns the number of nodes in the heap
         * @public
         * @returns {number}
         */
        size() {
          return this._heap.size();
        }
        /**
         * Checks if the heap is empty
         * @public
         * @returns {boolean}
         */
        isEmpty() {
          return this._heap.isEmpty();
        }
        /**
         * Clears the heap
         * @public
         */
        clear() {
          this._heap.clear();
        }
        /**
         * Returns a shallow copy of the MinHeap
         * @public
         * @returns {MinHeap}
         */
        clone() {
          return new MinHeap(this._getCompareValue, this._heap.clone());
        }
        /**
         * Implements an iterable on the heap
         * @public
         */
        [Symbol.iterator]() {
          let size = this.size();
          return {
            next: () => {
              size -= 1;
              return {
                value: this.pop(),
                done: size === -1
              };
            }
          };
        }
        /**
         * Builds a MinHeap from an array
         * @public
         * @static
         * @param {array} values
         * @param {function} [getCompareValue]
         * @returns {MinHeap}
         */
        static heapify(values, getCompareValue) {
          if (!Array.isArray(values)) {
            throw new Error("MinHeap.heapify expects an array");
          }
          const heap = new Heap(getMinCompare(getCompareValue), values);
          return new MinHeap(getCompareValue, heap).fix();
        }
        /**
         * Checks if a list of values is a valid min heap
         * @public
         * @static
         * @param {array} values
         * @param {function} [getCompareValue]
         * @returns {boolean}
         */
        static isHeapified(values, getCompareValue) {
          const heap = new Heap(getMinCompare(getCompareValue), values);
          return new MinHeap(getCompareValue, heap).isValid();
        }
      };
      exports.MinHeap = MinHeap;
    }
  });

  // node_modules/@datastructures-js/heap/src/maxHeap.js
  var require_maxHeap = __commonJS({
    "node_modules/@datastructures-js/heap/src/maxHeap.js"(exports) {
      var { Heap } = require_heap();
      var getMaxCompare = (getCompareValue) => (a, b) => {
        const aVal = typeof getCompareValue === "function" ? getCompareValue(a) : a;
        const bVal = typeof getCompareValue === "function" ? getCompareValue(b) : b;
        return aVal < bVal ? 1 : -1;
      };
      var MaxHeap = class {
        /**
         * @param {function} [getCompareValue]
         * @param {Heap} [_heap]
         */
        constructor(getCompareValue, _heap) {
          this._getCompareValue = getCompareValue;
          this._heap = _heap || new Heap(getMaxCompare(getCompareValue));
        }
        /**
         * Inserts a new value into the heap
         * @public
         * @param {number|string|object} value
         * @returns {MaxHeap}
         */
        insert(value) {
          return this._heap.insert(value);
        }
        /**
         * Inserts a new value into the heap
         * @public
         * @param {number|string|object} value
         * @returns {Heap}
         */
        push(value) {
          return this.insert(value);
        }
        /**
         * Removes and returns the root node in the heap
         * @public
         * @returns {number|string|object}
         */
        extractRoot() {
          return this._heap.extractRoot();
        }
        /**
         * Removes and returns the root node in the heap
         * @public
         * @returns {number|string|object}
         */
        pop() {
          return this.extractRoot();
        }
        /**
         * Applies heap sort and return the values sorted by priority
         * @public
         * @returns {array}
         */
        sort() {
          return this._heap.sort();
        }
        /**
         * Converts the heap to a cloned array without sorting.
         * @public
         * @returns {Array}
         */
        toArray() {
          return Array.from(this._heap._nodes);
        }
        /**
         * Fixes node positions in the heap
         * @public
         * @returns {MaxHeap}
         */
        fix() {
          return this._heap.fix();
        }
        /**
         * Verifies that all heap nodes are in the right position
         * @public
         * @returns {boolean}
         */
        isValid() {
          return this._heap.isValid();
        }
        /**
         * Returns the root node in the heap
         * @public
         * @returns {number|string|object}
         */
        root() {
          return this._heap.root();
        }
        /**
         * Returns the root node in the heap
         * @public
         * @returns {number|string|object}
         */
        top() {
          return this.root();
        }
        /**
         * Returns a leaf node in the heap
         * @public
         * @returns {number|string|object}
         */
        leaf() {
          return this._heap.leaf();
        }
        /**
         * Returns the number of nodes in the heap
         * @public
         * @returns {number}
         */
        size() {
          return this._heap.size();
        }
        /**
         * Checks if the heap is empty
         * @public
         * @returns {boolean}
         */
        isEmpty() {
          return this._heap.isEmpty();
        }
        /**
         * Clears the heap
         * @public
         */
        clear() {
          this._heap.clear();
        }
        /**
         * Returns a shallow copy of the MaxHeap
         * @public
         * @returns {MaxHeap}
         */
        clone() {
          return new MaxHeap(this._getCompareValue, this._heap.clone());
        }
        /**
         * Implements an iterable on the heap
         * @public
         */
        [Symbol.iterator]() {
          let size = this.size();
          return {
            next: () => {
              size -= 1;
              return {
                value: this.pop(),
                done: size === -1
              };
            }
          };
        }
        /**
         * Builds a MaxHeap from an array
         * @public
         * @static
         * @param {array} values
         * @param {function} [getCompareValue]
         * @returns {MaxHeap}
         */
        static heapify(values, getCompareValue) {
          if (!Array.isArray(values)) {
            throw new Error("MaxHeap.heapify expects an array");
          }
          const heap = new Heap(getMaxCompare(getCompareValue), values);
          return new MaxHeap(getCompareValue, heap).fix();
        }
        /**
         * Checks if a list of values is a valid max heap
         * @public
         * @static
         * @param {array} values
         * @param {function} [getCompareValue]
         * @returns {boolean}
         */
        static isHeapified(values, getCompareValue) {
          const heap = new Heap(getMaxCompare(getCompareValue), values);
          return new MaxHeap(getCompareValue, heap).isValid();
        }
      };
      exports.MaxHeap = MaxHeap;
    }
  });

  // node_modules/@datastructures-js/heap/index.js
  var require_heap2 = __commonJS({
    "node_modules/@datastructures-js/heap/index.js"(exports) {
      var { Heap } = require_heap();
      var { MinHeap } = require_minHeap();
      var { MaxHeap } = require_maxHeap();
      exports.Heap = Heap;
      exports.MinHeap = MinHeap;
      exports.MaxHeap = MaxHeap;
    }
  });

  // node_modules/@datastructures-js/priority-queue/src/minPriorityQueue.js
  var require_minPriorityQueue = __commonJS({
    "node_modules/@datastructures-js/priority-queue/src/minPriorityQueue.js"(exports) {
      var { Heap, MinHeap } = require_heap2();
      var getMinCompare = (getCompareValue) => (a, b) => {
        const aVal = typeof getCompareValue === "function" ? getCompareValue(a) : a;
        const bVal = typeof getCompareValue === "function" ? getCompareValue(b) : b;
        return aVal < bVal ? -1 : 1;
      };
      var MinPriorityQueue2 = class {
        constructor(getCompareValue, _heap) {
          if (getCompareValue && typeof getCompareValue !== "function") {
            throw new Error("MinPriorityQueue constructor requires a callback for object values");
          }
          this._heap = _heap || new MinHeap(getCompareValue);
        }
        /**
         * Returns an element with highest priority in the queue
         * @public
         * @returns {number|string|object}
         */
        front() {
          return this._heap.root();
        }
        /**
         * Returns an element with lowest priority in the queue
         * @public
         * @returns {number|string|object}
         */
        back() {
          return this._heap.leaf();
        }
        /**
         * Adds a value to the queue
         * @public
         * @param {number|string|object} value
         * @returns {MinPriorityQueue}
         */
        enqueue(value) {
          return this._heap.insert(value);
        }
        /**
         * Adds a value to the queue
         * @public
         * @param {number|string|object} value
         * @returns {MinPriorityQueue}
         */
        push(value) {
          return this.enqueue(value);
        }
        /**
         * Removes and returns an element with highest priority in the queue
         * @public
         * @returns {number|string|object}
         */
        dequeue() {
          return this._heap.extractRoot();
        }
        /**
         * Removes and returns an element with highest priority in the queue
         * @public
         * @returns {number|string|object}
         */
        pop() {
          return this.dequeue();
        }
        /**
         * Removes all elements that match a criteria in the callback
         * @public
         * @param {function} cb
         * @returns {array}
         */
        remove(cb) {
          if (typeof cb !== "function") {
            throw new Error("MinPriorityQueue remove expects a callback");
          }
          const removed = [];
          const dequeued = [];
          while (!this.isEmpty()) {
            const popped = this.pop();
            if (cb(popped)) {
              removed.push(popped);
            } else {
              dequeued.push(popped);
            }
          }
          dequeued.forEach((val) => this.push(val));
          return removed;
        }
        /**
         * Returns the number of elements in the queue
         * @public
         * @returns {number}
         */
        size() {
          return this._heap.size();
        }
        /**
         * Checks if the queue is empty
         * @public
         * @returns {boolean}
         */
        isEmpty() {
          return this._heap.isEmpty();
        }
        /**
         * Clears the queue
         * @public
         */
        clear() {
          this._heap.clear();
        }
        /**
         * Returns a sorted list of elements from highest to lowest priority
         * @public
         * @returns {array}
         */
        toArray() {
          return this._heap.clone().sort().reverse();
        }
        /**
         * Implements an iterable on the min priority queue
         * @public
         */
        [Symbol.iterator]() {
          let size = this.size();
          return {
            next: () => {
              size -= 1;
              return {
                value: this.pop(),
                done: size === -1
              };
            }
          };
        }
        /**
         * Creates a priority queue from an existing array
         * @public
         * @static
         * @returns {MinPriorityQueue}
         */
        static fromArray(values, getCompareValue) {
          const heap = new Heap(getMinCompare(getCompareValue), values);
          return new MinPriorityQueue2(
            getCompareValue,
            new MinHeap(getCompareValue, heap).fix()
          );
        }
      };
      exports.MinPriorityQueue = MinPriorityQueue2;
    }
  });

  // node_modules/@datastructures-js/priority-queue/src/maxPriorityQueue.js
  var require_maxPriorityQueue = __commonJS({
    "node_modules/@datastructures-js/priority-queue/src/maxPriorityQueue.js"(exports) {
      var { Heap, MaxHeap } = require_heap2();
      var getMaxCompare = (getCompareValue) => (a, b) => {
        const aVal = typeof getCompareValue === "function" ? getCompareValue(a) : a;
        const bVal = typeof getCompareValue === "function" ? getCompareValue(b) : b;
        return aVal < bVal ? 1 : -1;
      };
      var MaxPriorityQueue = class {
        constructor(getCompareValue, _heap) {
          if (getCompareValue && typeof getCompareValue !== "function") {
            throw new Error("MaxPriorityQueue constructor requires a callback for object values");
          }
          this._heap = _heap || new MaxHeap(getCompareValue);
        }
        /**
         * Returns an element with highest priority in the queue
         * @public
         * @returns {number|string|object}
         */
        front() {
          return this._heap.root();
        }
        /**
         * Returns an element with lowest priority in the queue
         * @public
         * @returns {number|string|object}
         */
        back() {
          return this._heap.leaf();
        }
        /**
         * Adds a value to the queue
         * @public
         * @param {number|string|object} value
         * @returns {MaxPriorityQueue}
         */
        enqueue(value) {
          return this._heap.insert(value);
        }
        /**
         * Adds a value to the queue
         * @public
         * @param {number|string|object} value
         * @returns {MaxPriorityQueue}
         */
        push(value) {
          return this.enqueue(value);
        }
        /**
         * Removes and returns an element with highest priority in the queue
         * @public
         * @returns {number|string|object}
         */
        dequeue() {
          return this._heap.extractRoot();
        }
        /**
         * Removes and returns an element with highest priority in the queue
         * @public
         * @returns {number|string|object}
         */
        pop() {
          return this.dequeue();
        }
        /**
         * Removes all elements that match a criteria in the callback
         * @public
         * @param {function} cb
         * @returns {array}
         */
        remove(cb) {
          if (typeof cb !== "function") {
            throw new Error("MaxPriorityQueue remove expects a callback");
          }
          const removed = [];
          const dequeued = [];
          while (!this.isEmpty()) {
            const popped = this.pop();
            if (cb(popped)) {
              removed.push(popped);
            } else {
              dequeued.push(popped);
            }
          }
          dequeued.forEach((val) => this.push(val));
          return removed;
        }
        /**
         * Returns the number of elements in the queue
         * @public
         * @returns {number}
         */
        size() {
          return this._heap.size();
        }
        /**
         * Checks if the queue is empty
         * @public
         * @returns {boolean}
         */
        isEmpty() {
          return this._heap.isEmpty();
        }
        /**
         * Clears the queue
         * @public
         */
        clear() {
          this._heap.clear();
        }
        /**
         * Returns a sorted list of elements from highest to lowest priority
         * @public
         * @returns {array}
         */
        toArray() {
          return this._heap.clone().sort().reverse();
        }
        /**
         * Implements an iterable on the min priority queue
         * @public
         */
        [Symbol.iterator]() {
          let size = this.size();
          return {
            next: () => {
              size -= 1;
              return {
                value: this.pop(),
                done: size === -1
              };
            }
          };
        }
        /**
         * Creates a priority queue from an existing array
         * @public
         * @static
         * @returns {MaxPriorityQueue}
         */
        static fromArray(values, getCompareValue) {
          const heap = new Heap(getMaxCompare(getCompareValue), values);
          return new MaxPriorityQueue(
            getCompareValue,
            new MaxHeap(getCompareValue, heap).fix()
          );
        }
      };
      exports.MaxPriorityQueue = MaxPriorityQueue;
    }
  });

  // node_modules/@datastructures-js/priority-queue/src/priorityQueue.js
  var require_priorityQueue = __commonJS({
    "node_modules/@datastructures-js/priority-queue/src/priorityQueue.js"(exports) {
      var { Heap } = require_heap2();
      var PriorityQueue = class {
        /**
         * Creates a priority queue
         * @params {function} compare
         */
        constructor(compare, _values) {
          if (typeof compare !== "function") {
            throw new Error("PriorityQueue constructor expects a compare function");
          }
          this._heap = new Heap(compare, _values);
          if (_values) {
            this._heap.fix();
          }
        }
        /**
         * Returns an element with highest priority in the queue
         * @public
         * @returns {number|string|object}
         */
        front() {
          return this._heap.root();
        }
        /**
         * Returns an element with lowest priority in the queue
         * @public
         * @returns {number|string|object}
         */
        back() {
          return this._heap.leaf();
        }
        /**
         * Adds a value to the queue
         * @public
         * @param {number|string|object} value
         * @returns {PriorityQueue}
         */
        enqueue(value) {
          return this._heap.insert(value);
        }
        /**
         * Adds a value to the queue
         * @public
         * @param {number|string|object} value
         * @returns {PriorityQueue}
         */
        push(value) {
          return this.enqueue(value);
        }
        /**
         * Removes and returns an element with highest priority in the queue
         * @public
         * @returns {number|string|object}
         */
        dequeue() {
          return this._heap.extractRoot();
        }
        /**
         * Removes and returns an element with highest priority in the queue
         * @public
         * @returns {number|string|object}
         */
        pop() {
          return this.dequeue();
        }
        /**
         * Removes all elements that match a criteria in the callback
         * @public
         * @param {function} cb
         * @returns {array}
         */
        remove(cb) {
          if (typeof cb !== "function") {
            throw new Error("PriorityQueue remove expects a callback");
          }
          const removed = [];
          const dequeued = [];
          while (!this.isEmpty()) {
            const popped = this.pop();
            if (cb(popped)) {
              removed.push(popped);
            } else {
              dequeued.push(popped);
            }
          }
          dequeued.forEach((val) => this.push(val));
          return removed;
        }
        /**
         * Returns the number of elements in the queue
         * @public
         * @returns {number}
         */
        size() {
          return this._heap.size();
        }
        /**
         * Checks if the queue is empty
         * @public
         * @returns {boolean}
         */
        isEmpty() {
          return this._heap.isEmpty();
        }
        /**
         * Clears the queue
         * @public
         */
        clear() {
          this._heap.clear();
        }
        /**
         * Returns a sorted list of elements from highest to lowest priority
         * @public
         * @returns {array}
         */
        toArray() {
          return this._heap.clone().sort().reverse();
        }
        /**
         * Implements an iterable on the priority queue
         * @public
         */
        [Symbol.iterator]() {
          let size = this.size();
          return {
            next: () => {
              size -= 1;
              return {
                value: this.pop(),
                done: size === -1
              };
            }
          };
        }
        /**
         * Creates a priority queue from an existing array
         * @public
         * @static
         * @returns {PriorityQueue}
         */
        static fromArray(values, compare) {
          return new PriorityQueue(compare, values);
        }
      };
      exports.PriorityQueue = PriorityQueue;
    }
  });

  // node_modules/@datastructures-js/priority-queue/index.js
  var require_priority_queue = __commonJS({
    "node_modules/@datastructures-js/priority-queue/index.js"(exports, module) {
      var { MinPriorityQueue: MinPriorityQueue2 } = require_minPriorityQueue();
      var { MaxPriorityQueue } = require_maxPriorityQueue();
      var { PriorityQueue } = require_priorityQueue();
      module.exports = { MinPriorityQueue: MinPriorityQueue2, MaxPriorityQueue, PriorityQueue };
    }
  });

  // src/common/fragments.ts
  function getChild(node, pathFragment) {
    if (typeof pathFragment === "string") {
      return node[pathFragment];
    } else {
      return node[pathFragment.prop][pathFragment.index];
    }
  }
  function* getChildKeys(node) {
    for (const key in node) {
      const value = node[key];
      if (Array.isArray(value) || typeof value?.kind === "string" && key !== "type") {
        yield key;
      }
    }
  }
  function* getChildFragments(node) {
    for (const key of getChildKeys(node)) {
      const value = node[key];
      if (Array.isArray(value)) {
        for (const v of value.map((_, i) => ({ prop: key, index: i })))
          yield v;
      } else {
        yield key;
      }
    }
  }
  function* getChildren(node) {
    for (const fragment of getChildFragments(node))
      yield getChild(node, fragment);
  }
  function fromChildRemapFunc(node, func2) {
    const newNode = { ...node };
    let changed = false;
    for (const key of getChildKeys(node)) {
      const value = node[key];
      if (Array.isArray(value)) {
        newNode[key] = [];
        value.forEach((n, i) => {
          const m = func2({ prop: key, index: i });
          if (m !== n)
            changed = true;
          if (m.kind === "Block" && node.kind === "Block") {
            newNode[key].push(...m.children);
          } else {
            newNode[key].push(m);
          }
        });
      } else {
        changed = true;
        newNode[key] = func2(key);
      }
    }
    if (!changed)
      return node;
    return newNode;
  }

  // src/common/expandVariants.ts
  function expandVariants(program2) {
    const n = numVariants(program2);
    if (n > 16)
      throw new Error(`Variant count ${n} exceeds arbitrary limit. Giving up`);
    return allVariantOptions(program2);
  }
  function numVariants(node) {
    if (node.kind === "Variants") {
      return node.variants.map(numVariants).reduce((a, b) => a + b);
    } else {
      return [...getChildren(node)].map(numVariants).reduce((a, b) => a * b, 1);
    }
  }
  function allVariantOptions(node) {
    if (node.kind === "Variants") {
      return node.variants.flatMap(allVariantOptions);
    } else {
      const frags = [...getChildFragments(node)];
      const fragIndexMap = new Map(frags.map((f, i) => [fragToString(f), i]));
      if (frags.length === 0)
        return [node];
      const options = frags.map(
        (frag) => allVariantOptions(getChild(node, frag))
      );
      return cartesianProduct(options).map(
        (opt) => fromChildRemapFunc(node, (f) => opt[fragIndexMap.get(fragToString(f))])
      );
    }
  }
  function fragToString(f) {
    return typeof f === "string" ? f : f.prop + ":" + f.index.toString();
  }
  function cartesianProduct(a) {
    if (a.length === 0)
      return [[]];
    return cartesianProduct(a.slice(1)).flatMap(
      (p) => a[0].map((e) => [e].concat(p))
    );
  }

  // src/common/Language.ts
  function required(...plugins) {
    return {
      mode: "required",
      plugins
    };
  }
  function simplegolf(...plugins) {
    return {
      mode: "simplegolf",
      plugins
    };
  }
  function search(...plugins) {
    return {
      mode: "search",
      plugins
    };
  }
  function flattenTree(tokenTree) {
    const flattened = [];
    function stepTree(t) {
      if (typeof t === "string")
        flattened.push(t);
      else
        t.map(stepTree);
    }
    stepTree(tokenTree);
    return flattened;
  }
  function isWord(a, i) {
    return /\w/.test(a[i]);
  }
  function defaultWhitespaceInsertLogic(a, b) {
    return isWord(a, a.length - 1) && isWord(b, 0);
  }
  function defaultDetokenizer(whitespace = defaultWhitespaceInsertLogic, indent = 1) {
    return function(tokenTree) {
      const tokens = flattenTree(tokenTree);
      let indentLevel = 0;
      let result = tokens[0];
      for (let i = 1; i < tokens.length; i++) {
        if (tokens[i] === "$INDENT$")
          indentLevel++;
        else if (tokens[i] === "$DEDENT$")
          indentLevel--;
        else if (tokens[i] !== "$GLUE$") {
          if (tokens[i - 1] !== "$INDENT$" && tokens[i - 1] !== "$DEDENT$" && tokens[i - 1] !== "$GLUE$" && whitespace(tokens[i - 1], tokens[i]))
            result += " ";
          result += tokens[i] + (tokens[i] === "\n" ? " ".repeat(indentLevel * indent) : "");
        }
      }
      return result.trim();
    };
  }

  // src/common/errors.ts
  var PolygolfError = class extends Error {
    source;
    constructor(message, source) {
      super(message);
      this.source = source;
      this.name = "PolygolfError";
      Object.setPrototypeOf(this, PolygolfError.prototype);
    }
  };

  // src/IR/assignments.ts
  function mutatingBinaryOp(name, variable2, right) {
    return {
      kind: "MutatingBinaryOp",
      variable: variable2,
      right,
      name
    };
  }
  function varDeclaration(variable2, variableType) {
    return {
      kind: "VarDeclaration",
      variable: typeof variable2 === "string" ? id(variable2) : variable2,
      variableType
    };
  }
  function assignment(variable2, expr) {
    return {
      kind: "Assignment",
      variable: typeof variable2 === "string" ? id(variable2) : variable2,
      expr
    };
  }
  function manyToManyAssignment(variables, exprs) {
    return {
      kind: "ManyToManyAssignment",
      variables: variables.map((v) => typeof v === "string" ? id(v) : v),
      exprs
    };
  }
  function oneToManyAssignment(variables, expr) {
    return {
      kind: "OneToManyAssignment",
      variables: variables.map((v) => typeof v === "string" ? id(v) : v),
      expr
    };
  }
  function varDeclarationWithAssignment(assignment2) {
    if (assignment2.kind === "Assignment" && assignment2.variable.kind !== "Identifier" || assignment2.kind !== "Assignment" && assignment2.variables.some((y) => y.kind !== "Identifier")) {
      throw new PolygolfError(
        "VarDeclarationWithAssignment needs assignments to variables.",
        assignment2.source
      );
    }
    return {
      kind: "VarDeclarationWithAssignment",
      assignment: assignment2
    };
  }
  function varDeclarationBlock(children) {
    return {
      kind: "VarDeclarationBlock",
      children
    };
  }

  // src/IR/opcodes.ts
  var FrontendOpCodes = [
    "add",
    "sub",
    "mul",
    "div",
    "pow",
    "mod",
    "bit_and",
    "bit_or",
    "bit_xor",
    "min",
    "max",
    "lt",
    "leq",
    "eq",
    "neq",
    "gt",
    "geq",
    "or",
    "and",
    "array_contains",
    "list_contains",
    "table_contains_key",
    "set_contains",
    "array_get",
    "list_get",
    "table_get",
    "list_push",
    "concat",
    "repeat",
    "text_contains",
    "text_byte_find",
    "text_codepoint_find",
    "text_split",
    "text_get_byte",
    "text_get_byte_slice",
    "text_get_codepoint",
    "text_get_codepoint_slice",
    "join",
    "right_align",
    "int_to_bin_aligned",
    "int_to_hex_aligned",
    "simplify_fraction",
    "abs",
    "bit_not",
    "neg",
    "not",
    "int_to_text",
    "int_to_bin",
    "int_to_hex",
    "text_to_int",
    "bool_to_int",
    "int_to_text_byte",
    // Returns a single byte text using the specified byte.
    "int_to_codepoint",
    // Returns a single codepoint text using the specified integer.
    "list_length",
    "text_byte_length",
    // Returns the text length in bytes.
    "text_codepoint_length",
    // Returns the text length in codepoints.
    "text_split_whitespace",
    "join",
    "text_byte_reversed",
    // Returns a text containing the reversed order of bytes.
    "text_codepoint_reversed",
    // Returns a text containing the reversed order of codepoints.
    "text_byte_to_int",
    "codepoint_to_int",
    "true",
    "false",
    "print",
    "println",
    "print_int",
    "println_int",
    "text_replace",
    "array_set",
    "list_set",
    "table_set",
    "sorted"
  ];
  function isFrontend(op) {
    return FrontendOpCodes.includes(op);
  }
  var UnaryOpCodes = [
    "print",
    "println",
    "print_int",
    "println_int",
    "argv_get",
    "abs",
    "bit_not",
    "neg",
    "not",
    "int_to_text",
    "int_to_bin",
    "int_to_hex",
    "int_to_bool",
    "text_to_int",
    "bool_to_int",
    "int_to_text_byte",
    "int_to_codepoint",
    "list_length",
    "text_codepoint_length",
    "text_byte_length",
    "text_split_whitespace",
    "sorted",
    "text_byte_reversed",
    "text_codepoint_reversed",
    "text_byte_to_int",
    // (text_byte_to_int (text_get_byte $x $i)) is equivalent to (text_get_byte_to_int $x $i), "text_byte_to_int" is the inverse of "int_to_text_byte"
    "codepoint_to_int"
    // (codepoint_to_int (text_get_codepoint $x $i)) is equivalent to (text_get_codepoint_to_int $x $i), "codepoint_to_int" is the inverse of "int_to_codepoint"
  ];
  function isUnary(op) {
    return UnaryOpCodes.includes(op);
  }
  var CommutativeOpCodes = [
    "add",
    "mul",
    "bit_and",
    "bit_or",
    "bit_xor",
    "and",
    "or",
    "gcd",
    "min",
    "max"
  ];
  function isCommutative(op) {
    return CommutativeOpCodes.includes(op);
  }
  var AssociativeOpCodes = [...CommutativeOpCodes, "concat"];
  function isAssociative(op) {
    return AssociativeOpCodes.includes(op);
  }
  var BinaryOpCodes = [
    // (num, num) => num
    "add",
    "sub",
    "mul",
    "div",
    "trunc_div",
    "unsigned_trunc_div",
    "pow",
    "mod",
    "rem",
    "unsigned_rem",
    "bit_and",
    "bit_or",
    "bit_xor",
    "bit_shift_left",
    "bit_shift_right",
    "gcd",
    "min",
    "max",
    // (num, num) => bool
    "lt",
    "leq",
    "eq",
    "neq",
    "geq",
    "gt",
    // (bool, bool) => bool
    "or",
    "and",
    "unsafe_or",
    "unsafe_and",
    // membership
    "array_contains",
    "list_contains",
    "table_contains_key",
    "set_contains",
    // collection get
    "array_get",
    "list_get",
    "table_get",
    // other
    "println_list_joined",
    "list_push",
    "list_find",
    // returns the 0-index of the first occurence of or -1 if it is not found
    "concat",
    "repeat",
    "text_contains",
    "text_codepoint_find",
    // (text_codepoint_find a b) returns the codepoint-0-index of the start of the first occurence of b in a or -1 if it is not found
    "text_byte_find",
    // (text_byte_find a b) returns the byte-0-index of the start of the first occurence of b in a or -1 if it is not found
    "text_split",
    "text_get_byte",
    // returns a single byte text at the specified byte-0-index
    "text_get_codepoint",
    // returns a single codepoint text at the specified codepoint-0-index
    "text_get_codepoint_to_int",
    // gets the codepoint at the specified codepoint-0-index as an integer
    "text_get_byte_to_int",
    // gets the byte at the specified byte-0-index as an integer
    "join",
    "right_align",
    "int_to_bin_aligned",
    // Converts the given integer to text representing the value in binary. The result is aligned with 0s to the specified number of places.
    "int_to_hex_aligned",
    // Converts the given integer to text representing the value in hexadecimal. The result is aligned with 0s to the specified number of places.
    "simplify_fraction"
    // Given two integers, p,q, returns a text representation of the reduced version of the fraction p/q.
  ];
  function isBinary(op) {
    return BinaryOpCodes.includes(op);
  }
  var OpCodes = [
    ...BinaryOpCodes,
    ...UnaryOpCodes,
    "true",
    "false",
    "argv",
    "argc",
    "text_replace",
    "text_multireplace",
    // simultaneous replacement. Equivalent to chained text_replace if the inputs and outputs have no overlap
    "text_get_codepoint_slice",
    // Returns a slice of the input text. Indeces are codepoint-0-based, start is inclusive, end is exclusive.
    "text_get_byte_slice",
    // Returns a slice of the input text. Indeces are byte-0-based, start is inclusive, end is exclusive.
    // collection set
    "array_set",
    "list_set",
    "table_set",
    "println_many_joined"
    // Expects one text argument denoting the delimiter and then any number of texts to be joined and printed.
  ];
  function isOpCode(op) {
    return OpCodes.includes(op);
  }
  function arity(op) {
    if (isUnary(op))
      return 1;
    if (isBinary(op))
      return 2;
    switch (op) {
      case "true":
      case "false":
      case "argv":
      case "argc":
        return 0;
      case "text_replace":
      case "text_get_byte_slice":
      case "text_get_codepoint_slice":
      case "array_set":
      case "list_set":
      case "table_set":
        return 3;
      case "println_many_joined":
      case "text_multireplace":
        return -1;
    }
  }
  function flipOpCode(op) {
    switch (op) {
      case "eq":
      case "neq":
        return op;
      case "lt":
        return "gt";
      case "gt":
        return "lt";
      case "leq":
        return "geq";
      case "geq":
        return "leq";
    }
    return null;
  }
  function booleanNotOpCode(op) {
    switch (op) {
      case "eq":
        return "neq";
      case "neq":
        return "eq";
      case "lt":
        return "geq";
      case "gt":
        return "leq";
      case "leq":
        return "gt";
      case "geq":
        return "lt";
    }
    return null;
  }

  // src/IR/collections.ts
  function arrayConstructor(exprs) {
    return {
      kind: "ArrayConstructor",
      exprs
    };
  }
  function listConstructor(exprs) {
    return {
      kind: "ListConstructor",
      exprs
    };
  }
  function setConstructor(exprs) {
    return {
      kind: "SetConstructor",
      exprs
    };
  }
  function tableConstructor(kvPairs) {
    return {
      kind: "TableConstructor",
      kvPairs
    };
  }

  // src/common/objective.ts
  function getObjectiveFunc(options) {
    if (options.objective === "bytes")
      return byteLength;
    if (options.objective === "chars")
      return charLength;
    return options.objective;
  }
  var charLength = (str) => {
    if (str === null)
      return Infinity;
    let i = 0;
    let len = 0;
    while (i < str.length) {
      const value = str.charCodeAt(i++);
      if (value >= 55296 && value <= 56319 && i < str.length) {
        const extra = str.charCodeAt(i++);
        if ((extra & 64512) === 56320) {
          len++;
        } else {
          len++;
          i--;
        }
      } else {
        len++;
      }
    }
    return len;
  };
  var byteLength = (x) => x === null ? Infinity : Buffer.byteLength(x, "utf-8");
  function isError(x) {
    return x instanceof Error;
  }
  function shorterBy(obj) {
    return (a, b) => isError(a.result) ? b : isError(b.result) ? a : obj(a.result) < obj(b.result) ? a : b;
  }

  // src/common/symbols.ts
  var SymbolTable = class extends Map {
    getRequired(key) {
      const ret = this.get(key);
      if (ret === void 0)
        throw new Error(
          `Symbol not found: ${key}. Defined symbols: ${[...this.keys()].join(", ")}`
        );
      return ret;
    }
  };
  var symbolTableCache = /* @__PURE__ */ new WeakMap();
  function symbolTableRoot(program2) {
    if (symbolTableCache.has(program2))
      return symbolTableCache.get(program2);
    const existing = /* @__PURE__ */ new Set();
    const defs = [
      ...programToSpine(program2).compactMap(
        (_, s) => introducedSymbols(s, existing)?.map((name) => {
          existing.add(name);
          return [name, s];
        })
      )
    ].flat(1);
    const table = new SymbolTable(defs);
    if (table.size < defs.length) {
      const sortedNames = defs.map(([name]) => name).sort();
      const duplicate = sortedNames.find(
        (name, i) => i > 0 && sortedNames[i - 1] === name
      );
      if (duplicate !== void 0)
        throw new Error(`Duplicate symbol: ${duplicate}`);
    }
    symbolTableCache.set(program2, table);
    return table;
  }
  function getDeclaredIdentifiers(program2) {
    return symbolTableRoot(program2).keys();
  }
  function getIdentifierType(expr, program2) {
    return getTypeFromBinding(
      expr.name,
      symbolTableRoot(program2).getRequired(expr.name)
    );
  }
  function isIdentifierReadonly(expr, program2) {
    if (expr.builtin)
      return true;
    const definingNode = symbolTableRoot(program2).get(expr.name);
    return definingNode !== void 0 && definingNode.node.kind !== "Assignment";
  }
  function introducedSymbols(spine, existing) {
    const node = spine.node;
    switch (node.kind) {
      case "ForRange":
      case "ForDifferenceRange":
      case "ForEach":
      case "ForEachKey":
      case "ForArgv":
        return node.variable === void 0 ? [] : [node.variable.name];
      case "ForEachPair":
        return [node.keyVariable.name, node.valueVariable.name];
      case "Assignment":
        if (node.variable.kind === "Identifier" && // for backwards-compatibility, treat the first assignment of each
        // variable as a declaration. Otherwise we should:
        //    // treat every user-annotated assignment as a declaration
        //    node.variable.type !== undefined
        !existing.has(node.variable.name))
          return [node.variable.name];
        break;
      case "OneToManyAssignment":
      case "ManyToManyAssignment":
        return node.variables.filter((x) => x.kind === "Identifier" && !existing.has(x.name)).map((x) => x.name);
    }
  }
  function getTypeFromBinding(name, spine) {
    const node = spine.node;
    const program2 = spine.root.node;
    switch (node.kind) {
      case "ForRange":
      case "ForDifferenceRange": {
        const start = getType(node.start, program2);
        let end = getType(
          node.kind === "ForRange" ? node.end : node.difference,
          program2
        );
        const step = getType(node.increment, program2);
        if (start.kind !== "integer" || end.kind !== "integer" || step.kind !== "integer") {
          throw new PolygolfError(
            `Unexpected for range type (${start.kind},${end.kind},${step.kind})`,
            node.source
          );
        }
        if (node.kind === "ForDifferenceRange")
          end = integerType(add(start.low, end.low), add(start.high, end.high));
        if (lt(0n, step.low))
          return integerType(
            start.low,
            node.inclusive ? end.high : sub(end.high, 1n)
          );
        if (lt(step.high, 0n))
          return integerType(
            node.inclusive ? end.low : add(end.low, 1n),
            start.high
          );
        return integerTypeIncludingAll(start.low, start.high, end.low, end.high);
      }
      case "ForEach":
        return getCollectionTypes(node.collection, program2)[0];
      case "ForArgv":
        return textType();
      case "ForEachKey":
        return getCollectionTypes(node.table, program2)[0];
      case "ForEachPair": {
        const _types = getCollectionTypes(node.table, program2);
        const types = _types.length === 1 ? [integerType(), _types[0]] : _types;
        return name === node.keyVariable.name ? types[0] : types[1];
      }
      case "Assignment": {
        const assignedType = getType(node.expr, program2);
        if (node.variable.type !== void 0 && !isSubtype(assignedType, node.variable.type))
          throw new PolygolfError(
            `Value of type ${assignedType.kind} cannot be assigned to ${node.variable.name} of type ${node.variable.type.kind}`,
            node.source
          );
        return node.variable.type ?? assignedType;
      }
      default:
        throw new Error(
          `Programming error: node of type ${node.kind} does not bind any symbol`
        );
    }
  }

  // src/common/getType.ts
  var cachedType = /* @__PURE__ */ new WeakMap();
  var currentlyFinding = /* @__PURE__ */ new WeakSet();
  function getType(expr, context) {
    const program2 = "kind" in context ? context : context.root.node;
    if (cachedType.has(expr))
      return cachedType.get(expr);
    if (currentlyFinding.has(expr))
      throw new PolygolfError(
        `Expression defined in terms of itself`,
        expr.source
      );
    currentlyFinding.add(expr);
    try {
      const t = calcType(expr, program2);
      currentlyFinding.delete(expr);
      cachedType.set(expr, t);
      return t;
    } catch (e) {
      currentlyFinding.delete(expr);
      if (e instanceof Error && !(e instanceof PolygolfError)) {
        throw new PolygolfError(e.message, expr.source);
      }
      throw e;
    }
  }
  function calcType(expr, program2) {
    if (expr.type !== void 0)
      return expr.type;
    const type3 = (e) => getType(e, program2);
    switch (expr.kind) {
      case "Function":
        return functionType(expr.args.map(type3), type3(expr.expr));
      case "Block":
      case "VarDeclaration":
        return voidType;
      case "Variants":
        return expr.variants.map(type3).reduce(union);
      case "Assignment": {
        if (expr.variable.kind === "Identifier" && isIdentifierReadonly(expr.variable, program2)) {
          throw new PolygolfError(
            `Type error. Cannot assign to readonly identifier ${expr.variable.name}.`,
            expr.source
          );
        }
        const a = type3(expr.variable);
        const b = type3(expr.expr);
        if (isSubtype(b, a)) {
          return b;
        }
        throw new Error(
          `Type error. Cannot assign ${toString(b)} to ${toString(a)}.`
        );
      }
      case "IndexCall": {
        const a = type3(expr.collection);
        const b = type3(expr.index);
        let expectedIndex;
        let result;
        switch (a.kind) {
          case "Array":
            expectedIndex = expr.oneIndexed ? integerType(1, a.length) : integerType(0, a.length - 1);
            result = a.member;
            break;
          case "List": {
            expectedIndex = integerType(expr.oneIndexed ? 1 : 0, "oo");
            result = a.member;
            break;
          }
          case "Table": {
            expectedIndex = a.key;
            result = a.value;
            break;
          }
          default:
            throw new Error(
              "Type error. IndexCall must be used on a collection."
            );
        }
        if (isSubtype(b, expectedIndex)) {
          return result;
        }
        throw new Error(
          `Type error. Cannot index ${toString(a)} with ${toString(b)}.`
        );
      }
      case "PolygolfOp":
        return getOpCodeType(expr, program2);
      case "MutatingBinaryOp":
        return voidType;
      case "FunctionCall": {
        const fType = type3(expr.func);
        if (fType.kind !== "Function") {
          throw new Error(`Type error. Type ${toString(fType)} is not callable.`);
        }
        if (expr.args.every((x, i) => isSubtype(type3(x), fType.arguments[i]))) {
          return fType.result;
        }
        throw new Error(
          `Type error. Function expected [${fType.arguments.map(toString).join(", ")}] but got [${expr.args.map((x) => toString(type3(x))).join(", ")}].`
        );
      }
      case "Identifier":
        return getIdentifierType(expr, program2);
      case "TextLiteral": {
        const codepoints = charLength(expr.value);
        return textType(
          integerType(codepoints, codepoints),
          codepoints === byteLength(expr.value)
        );
      }
      case "IntegerLiteral":
        return integerType(expr.value, expr.value);
      case "ArrayConstructor":
        return arrayType(
          expr.exprs.map(type3).reduce((a, b) => union(a, b)),
          expr.exprs.length
        );
      case "ListConstructor":
        return expr.exprs.length > 0 ? listType(expr.exprs.map(type3).reduce((a, b) => union(a, b))) : listType("void");
      case "SetConstructor":
        return expr.exprs.length > 0 ? setType(expr.exprs.map(type3).reduce((a, b) => union(a, b))) : setType("void");
      case "KeyValue": {
        const k = type3(expr.key);
        const v = type3(expr.value);
        if (k.kind === "integer" || k.kind === "text")
          return keyValueType(k, v);
        throw new Error(
          `Type error. Operator 'key_value' error. Expected [-oo..oo | Text, T1] but got [${toString(
            k
          )}, ${toString(v)}].`
        );
      }
      case "TableConstructor": {
        const types = expr.kvPairs.map(type3);
        if (types.every((x) => x.kind === "KeyValue")) {
          const kvTypes = types;
          const kTypes = kvTypes.map((x) => x.key);
          const vTypes = kvTypes.map((x) => x.value);
          return expr.kvPairs.length > 0 ? tableType(
            kTypes.reduce((a, b) => union(a, b)),
            vTypes.reduce((a, b) => union(a, b))
          ) : tableType(integerType(), "void");
        }
        throw new Error(
          "Programming error. Type of KeyValue nodes should always be KeyValue."
        );
      }
      case "ConditionalOp": {
        const conditionType = type3(expr.condition);
        if (isSubtype(conditionType, booleanType))
          return union(type3(expr.consequent), type3(expr.alternate));
        throw new Error(
          `Type error. Operator '${expr.isSafe ? "conditional" : "unsafe_conditional"}' error. Expected [Boolean, T1, T1] but got [${toString(
            conditionType
          )}, ${toString(type3(expr.condition))}, ${toString(
            type3(expr.alternate)
          )}].`
        );
      }
      case "ManyToManyAssignment":
        return voidType;
      case "ImportStatement":
        return voidType;
      case "OneToManyAssignment":
        return type3(expr.expr);
      case "IfStatement":
      case "ForRange":
      case "WhileLoop":
      case "ForArgv":
        return voidType;
      case "ImplicitConversion": {
        return type3(polygolfOp(expr.behavesLike, expr.expr));
      }
    }
    throw new Error(`Type error. Unexpected node ${expr.kind}.`);
  }
  function getTypeBitNot(t) {
    return integerType(sub(-1n, t.high), sub(-1n, t.low));
  }
  function getOpCodeType(expr, program2) {
    const types = getArgs(expr).map((x) => getType(x, program2));
    function expectVariadicType(expected, minArityOrArityCheck = 2) {
      const arityCheck = typeof minArityOrArityCheck === "number" ? (x) => x >= minArityOrArityCheck : minArityOrArityCheck;
      if (!arityCheck(types.length) || types.some((x, i) => !isSubtype(x, expected))) {
        throw new Error(
          `Type error. Operator '${expr.op ?? "null"}' type error. Expected [...${toString(expected)}] but got [${types.map(toString).join(", ")}].`
        );
      }
    }
    function expectType(...expected) {
      if (types.length !== expected.length || types.some((x, i) => !isSubtype(x, expected[i]))) {
        throw new Error(
          `Type error. Operator '${expr.op ?? "null"}' type error. Expected [${expected.map(toString).join(", ")}] but got [${types.map(toString).join(", ")}].`
        );
      }
    }
    function expectGenericType(...expected) {
      function _throw() {
        let i = 1;
        const expectedS = expected.map((e) => {
          switch (e) {
            case "List":
            case "Set":
              return `(${e} T${i++})`;
            case "Array":
            case "Table":
              return `(${e} T${i++} T${i++})`;
          }
          return e[0];
        });
        throw new Error(
          `Type error. Operator '${expr.op ?? "null"} type error. Expected [${expectedS.join(", ")}] but got [${types.map(toString).join(", ")}].`
        );
      }
      if (types.length !== expected.length)
        _throw();
      const typeArgs = [];
      for (let i = 0; i < types.length; i++) {
        const exp = expected[i];
        const got = types[i];
        if (typeof exp === "string") {
          if (exp === "List" && got.kind === "List") {
            typeArgs.push(got.member);
          } else if (exp === "Array" && got.kind === "Array") {
            typeArgs.push(got.member);
            typeArgs.push(integerType(0, got.length - 1));
          } else if (exp === "Set" && got.kind === "Set") {
            typeArgs.push(got.member);
          } else if (exp === "Table" && got.kind === "Table") {
            typeArgs.push(got.key);
            typeArgs.push(got.value);
          } else {
            _throw();
          }
        }
      }
      for (let i = 0; i < types.length; i++) {
        const exp = expected[i];
        const got = types[i];
        if (typeof exp !== "string") {
          const expInstantiated = exp[1](typeArgs);
          if (!isSubtype(got, expInstantiated))
            _throw();
        }
      }
      return typeArgs;
    }
    switch (expr.op) {
      case "gcd": {
        expectType(integerType(), integerType(1));
        const [a, b] = types;
        return integerType(
          1n,
          min(max(abs(a.low), abs(a.high)), max(abs(b.low), abs(b.high)))
        );
      }
      case "add":
      case "sub":
      case "mul":
      case "div":
      case "trunc_div":
      case "unsigned_trunc_div":
      case "pow":
      case "mod":
      case "rem":
      case "unsigned_rem":
      case "bit_and":
      case "bit_or":
      case "bit_xor":
      case "bit_shift_left":
      case "bit_shift_right":
      case "min":
      case "max": {
        const op = expr.op;
        if (isAssociative(op)) {
          expectVariadicType(integerType());
        } else {
          expectType(integerType(), integerType());
        }
        return types.reduce(
          (a, b) => getArithmeticType(op, a, b)
        );
      }
      case "lt":
      case "leq":
      case "eq":
      case "neq":
      case "geq":
      case "gt":
        expectType(integerType(), integerType());
        return booleanType;
      case "unsafe_or":
      case "unsafe_and":
        return booleanType;
      case "or":
      case "and":
        expectVariadicType(booleanType);
        return booleanType;
      case "array_contains":
        expectGenericType("Array", ["T1", (x) => x[0]]);
        return booleanType;
      case "list_contains":
        expectGenericType("List", ["T1", (x) => x[0]]);
        return booleanType;
      case "table_contains_key":
        expectGenericType("Table", ["T1", (x) => x[0]]);
        return booleanType;
      case "set_contains":
        expectGenericType("Set", ["T1", (x) => x[0]]);
        return booleanType;
      case "array_get":
        return expectGenericType("Array", ["T2", (x) => x[1]])[0];
      case "list_get":
        return expectGenericType("List", ["0..oo", () => integerType(0)])[0];
      case "table_get":
        return expectGenericType("Table", ["T1", (x) => x[0]])[1];
      case "argv_get":
        expectType(integerType(0));
        return textType();
      case "list_push":
        return expectGenericType("List", ["T1", (x) => x[0]])[0];
      case "list_find":
        expectGenericType("List", ["T1", (x) => x[0]]);
        return integerType(-1, (1n << 31n) - 1n);
      case "concat": {
        expectVariadicType(textType());
        const textTypes = types;
        return textType(
          textTypes.map((x) => x.codepointLength).reduce((a, b) => getArithmeticType("add", a, b)),
          textTypes.every((x) => x.isAscii)
        );
      }
      case "repeat": {
        expectType(textType(), integerType(0));
        const [t, i] = types;
        return textType(
          getArithmeticType("mul", t.codepointLength, i),
          t.isAscii
        );
      }
      case "text_contains":
        expectType(textType(), textType());
        return booleanType;
      case "text_codepoint_find":
      case "text_byte_find":
        expectType(textType(), textType(integerType(1, "oo")));
        return integerType(
          -1,
          sub(
            mul(
              types[0].codepointLength.high,
              expr.op === "text_byte_find" && !types[0].isAscii ? 4n : 1n
            ),
            types[1].codepointLength.low
          )
        );
      case "text_split":
        expectType(textType(), textType());
        return listType(types[0]);
      case "text_get_byte":
      case "text_get_codepoint":
        expectType(textType(), integerType(0));
        return textType(integerType(1, 1), types[0].isAscii);
      case "join":
        expectType(listType(textType()), textType());
        return textType(
          integerType(0, "oo"),
          types[0].member.isAscii && types[1].isAscii
        );
      case "right_align":
        expectType(textType(), integerType(0));
        return textType(integerType(0, "oo"), types[0].isAscii);
      case "int_to_bin_aligned":
      case "int_to_hex_aligned": {
        expectType(integerType(0), integerType(0));
        const t1 = types[0];
        const t2 = types[0];
        if (isFiniteType(t1) && isFiniteType(t2)) {
          return textType(
            integerTypeIncludingAll(
              BigInt(
                t1.high.toString(expr.op === "int_to_bin_aligned" ? 2 : 16).length
              ),
              t2.high
            ),
            true
          );
        }
        return textType(integerType(), true);
      }
      case "simplify_fraction": {
        expectType(integerType(), integerType());
        const t1 = types[0];
        const t2 = types[1];
        if (isFiniteType(t1) && isFiniteType(t2))
          return textType(
            integerType(
              0,
              1 + Math.max(t1.low.toString().length, t1.high.toString().length) + Math.max(t2.low.toString().length, t2.high.toString().length)
            ),
            true
          );
        return textType();
      }
      case "abs": {
        expectType(integerType());
        const t = types[0];
        if (lt(t.low, 0n) && lt(0n, t.high))
          return integerType(0, max(neg(t.low), t.high));
        return integerType(
          min(abs(t.low), abs(t.high)),
          max(abs(t.low), abs(t.high))
        );
      }
      case "bit_not": {
        expectType(integerType());
        const t = types[0];
        return getTypeBitNot(t);
      }
      case "neg": {
        expectType(integerType());
        const t = types[0];
        return integerType(neg(t.high), neg(t.low));
      }
      case "not":
        expectType(booleanType);
        return booleanType;
      case "int_to_bool":
        expectType(integerType());
        return booleanType;
      case "int_to_text":
      case "int_to_bin":
      case "int_to_hex": {
        expectType(integerType(expr.op === "int_to_text" ? "-oo" : 0));
        const t = types[0];
        if (isFiniteType(t))
          return textType(
            integerTypeIncludingAll(
              ...[t.low, t.high, ...typeContains(t, 0n) ? [0n] : []].map(
                (x) => BigInt(
                  x.toString(
                    expr.op === "int_to_bin" ? 2 : expr.op === "int_to_hex" ? 16 : 10
                  ).length
                )
              )
            ),
            true
          );
        return textType(integerType(1), true);
      }
      case "text_to_int": {
        expectType(textType(integerType(), true));
        const t = types[0];
        if (!isFiniteType(t.codepointLength))
          return integerType();
        return integerType(
          1n - 10n ** (t.codepointLength.high - 1n),
          10n ** t.codepointLength.high - 1n
        );
      }
      case "bool_to_int":
        expectType(booleanType);
        return integerType(0, 1);
      case "int_to_text_byte":
        expectType(integerType(0, 255));
        return textType(
          integerType(1n, 1n),
          lt(types[0].high, 128n)
        );
      case "int_to_codepoint":
        expectType(integerType(0, 1114111));
        return textType(
          integerType(1n, 1n),
          lt(types[0].high, 128n)
        );
      case "list_length":
        expectGenericType("List");
        return integerType(0);
      case "text_byte_length": {
        expectType(textType());
        const codepointLength = types[0].codepointLength;
        return integerType(
          codepointLength.low,
          min(
            1n << 31n,
            mul(codepointLength.high, types[0].isAscii ? 1n : 4n)
          )
        );
      }
      case "text_codepoint_length":
        expectType(textType());
        return types[0].codepointLength;
      case "text_split_whitespace":
        expectType(textType());
        return listType(types[0]);
      case "sorted":
        return listType(expectGenericType("List")[0]);
      case "text_byte_reversed":
      case "text_codepoint_reversed":
        expectType(textType());
        return types[0];
      case "true":
      case "false":
        expectType();
        return booleanType;
      case "argc":
        expectType();
        return integerType(0, 2 ** 31 - 1);
      case "argv":
        expectType();
        return listType(textType());
      case "print":
      case "println":
        expectType(textType());
        return voidType;
      case "print_int":
      case "println_int":
        expectType(integerType());
        return voidType;
      case "println_list_joined":
        expectType(listType(textType()), textType());
        return voidType;
      case "println_many_joined":
        expectVariadicType(textType(), 1);
        return voidType;
      case "text_replace": {
        expectType(textType(), textType(integerType(1, "oo")), textType());
        const [a, c] = [types[0], types[2]];
        return textType(
          getArithmeticType("mul", a.codepointLength, c.codepointLength),
          a.isAscii && c.isAscii
        );
      }
      case "text_multireplace":
        expectVariadicType(textType(), (x) => x > 2 && x % 2 > 0);
        return textType();
      case "text_get_byte_slice":
      case "text_get_codepoint_slice": {
        expectType(textType(), integerType(0), integerType(0));
        const [t, i1, i2] = types;
        const maximum = min(
          t.codepointLength.high,
          max(0n, sub(i2.high, i1.low))
        );
        return textType(integerType(0n, maximum), t.isAscii);
      }
      case "text_get_codepoint_to_int":
        expectType(textType(), integerType(0));
        return integerType(0, types[0].isAscii ? 127 : 1114111);
      case "text_get_byte_to_int":
        expectType(textType(), integerType(0));
        return integerType(0, types[0].isAscii ? 127 : 255);
      case "codepoint_to_int":
        expectType(textType(integerType(1, 1)));
        return integerType(0, types[0].isAscii ? 127 : 1114111);
      case "text_byte_to_int":
        expectType(textType(integerType(1, 1)));
        return integerType(0, types[0].isAscii ? 127 : 255);
      case "array_set":
        return expectGenericType(
          "Array",
          ["T2", (x) => x[1]],
          ["T1", (x) => x[0]]
        )[0];
      case "list_set":
        return expectGenericType(
          "List",
          ["0..oo", () => integerType(0)],
          ["T1", (x) => x[0]]
        )[0];
      case "table_set":
        return expectGenericType(
          "Table",
          ["T1", (x) => x[0]],
          ["T2", (x) => x[1]]
        )[1];
      case null:
        throw new Error(
          "Cannot determine type based on null opcode - this is most likely a programming error - a plugin introduced a node missing both an opcode and a type annotation."
        );
    }
  }
  function getArithmeticType(op, a, b) {
    switch (op) {
      case "min":
        return integerType(min(a.low, b.low), min(a.high, b.high));
      case "max":
        return integerType(max(a.low, b.low), max(a.high, b.high));
      case "add":
        return integerType(add(a.low, b.low), add(a.high, b.high));
      case "sub":
        return integerType(sub(a.low, b.high), sub(a.high, b.low));
      case "mul": {
        const M = (x, y) => {
          try {
            return mul(x, y);
          } catch {
            return 0n;
          }
        };
        return integerTypeIncludingAll(
          M(a.low, b.low),
          M(a.low, b.high),
          M(a.high, b.low),
          M(a.high, b.high)
        );
      }
      case "div": {
        const values = [];
        if (lt(b.low, 0n)) {
          values.push(
            floorDiv(a.low, min(-1n, b.high)),
            floorDiv(a.high, min(-1n, b.high))
          );
        }
        if (lt(0n, b.high)) {
          values.push(
            floorDiv(a.low, max(1n, b.low)),
            floorDiv(a.high, max(1n, b.low))
          );
        }
        if (b.low === "-oo" && lt(a.low, 0n) || b.high === "oo" && lt(0n, a.high))
          values.push(0n);
        else if (b.low === "-oo" && lt(0n, a.high) || b.high === "oo" && lt(a.low, 0n))
          values.push(-1n);
        else {
          if (b.low !== 0n)
            values.push(floorDiv(a.low, b.low), floorDiv(a.high, b.low));
          if (b.high !== 0n)
            values.push(floorDiv(a.low, b.high), floorDiv(a.high, b.high));
        }
        return integerTypeIncludingAll(...values);
      }
      case "trunc_div": {
        const values = [];
        if (lt(b.low, 0n)) {
          values.push(
            truncDiv(a.low, min(-1n, b.high)),
            truncDiv(a.high, min(-1n, b.high))
          );
        }
        if (lt(0n, b.high)) {
          values.push(
            truncDiv(a.low, max(1n, b.low)),
            truncDiv(a.high, max(1n, b.low))
          );
        }
        if (b.low === "-oo" || b.high === "oo")
          values.push(0n);
        else if (b.low !== 0n && isFiniteBound(b.low))
          values.push(truncDiv(a.low, b.low), truncDiv(a.high, b.low));
        if (b.high !== 0n && isFiniteBound(b.high))
          values.push(truncDiv(a.low, b.high), truncDiv(a.high, b.high));
        return integerTypeIncludingAll(...values);
      }
      case "mod":
        return getIntegerTypeMod(a, b);
      case "rem":
        return getIntegerTypeRem(a, b);
      case "unsigned_rem":
      case "unsigned_trunc_div":
        if (leq(0n, a.low) && leq(0n, b.low)) {
          return getArithmeticType(
            op === "unsigned_rem" ? "rem" : "trunc_div",
            a,
            b
          );
        }
        return integerType();
      case "pow": {
        if (lt(b.low, 0n))
          throw new Error(
            `Type error. Operator 'pow' expected [-oo..oo, 0..oo] but got [${toString(a)}, ${toString(b)}].`
          );
        const values = [];
        if (b.high === "oo") {
          if (typeContains(a, -1n))
            values.push(-1n, 1n);
          if (typeContains(a, 0n))
            values.push(0n);
          if (typeContains(a, 1n))
            values.push(1n);
          if (lt(a.low, -1n))
            values.push("-oo", "oo");
          else if (lt(1n, a.high)) {
            values.push("oo");
            values.push(a.low ** b.low);
          }
        } else if (isFiniteType(b)) {
          if (a.high === "oo")
            values.push(b.high === 0n ? 1n : "oo");
          if (isFiniteBound(a.low))
            values.push(a.low ** b.low);
          if (isFiniteBound(a.low))
            values.push(a.low ** b.high);
          if (isFiniteBound(a.high))
            values.push(a.high ** b.low);
          if (isFiniteBound(a.high))
            values.push(a.high ** b.high);
          if (b.low !== b.high) {
            if (isFiniteBound(a.low))
              values.push(a.low ** (b.low + 1n));
            if (isFiniteBound(a.low))
              values.push(a.low ** (b.high - 1n));
            if (isFiniteBound(a.high))
              values.push(a.high ** (b.low + 1n));
            if (isFiniteBound(a.high))
              values.push(a.high ** (b.high - 1n));
            if (a.low === "-oo")
              values.push(
                ...b.high === 0n ? [1n] : ["-oo", "oo"]
              );
          } else {
            if (a.low === "-oo") {
              if (b.low % 2n === 1n) {
                values.push(b.high === 0n ? 1n : "-oo");
                values.push(isFiniteBound(a.high) ? a.high ** b.low : "oo");
              } else {
                values.push(b.high === 0n ? 1n : "oo");
                values.push(lt(a.high, 0n) ? a.high ** b.low : 0n);
              }
            }
          }
        }
        return integerTypeIncludingAll(...values);
      }
      case "bit_and":
        return getTypeBitNot(
          getArithmeticType("bit_or", getTypeBitNot(a), getTypeBitNot(b))
        );
      case "bit_shift_left":
        return getArithmeticType(
          "mul",
          a,
          getArithmeticType("pow", integerType(2, 2), b)
        );
      case "bit_shift_right":
        return getArithmeticType(
          "div",
          a,
          getArithmeticType("pow", integerType(2, 2), b)
        );
      case "bit_or":
      case "bit_xor": {
        const left = max(abs(a.low), abs(a.high));
        const right = max(abs(b.low), abs(b.high));
        if (isFiniteBound(left) && isFiniteBound(right)) {
          const larger = lt(left, right) ? left : right;
          const lim = 2n ** BigInt(larger.toString(2).length);
          if (lt(-1n, a.low) && lt(-1n, b.low))
            return integerType(0n, lim);
          return integerType(neg(lim), lim);
        }
        return integerType();
      }
    }
    throw new Error(`Type error. Unknown opcode. ${op ?? "null"}`);
  }
  function getCollectionTypes(expr, program2) {
    const exprType = getType(expr, program2);
    switch (exprType.kind) {
      case "Array":
      case "List":
      case "Set":
        return [exprType.member];
      case "Table":
        return [exprType.key, exprType.value];
      case "text":
        return [textType(integerType(1, 1), exprType.isAscii)];
    }
    throw new Error("Type error. Node is not a collection.");
  }
  function getIntegerTypeMod(a, b) {
    if (isConstantType(a) && isConstantType(b)) {
      return constantIntegerType(
        a.low - b.low * floorDiv(a.low, b.low)
      );
    }
    const values = [];
    if (lt(b.low, 0n))
      values.push(sub(b.low, -1n));
    if (lt(0n, b.high))
      values.push(sub(b.high, 1n));
    values.push(0n);
    return integerTypeIncludingAll(...values);
  }
  function getIntegerTypeRem(a, b) {
    if (isConstantType(a) && isConstantType(b)) {
      return constantIntegerType(a.low % b.low);
    }
    const m = max(abs(b.low), abs(b.high));
    return integerType(lt(a.low, 0n) ? neg(m) : 0n, m);
  }

  // src/common/stringify.ts
  var cachedStringification = /* @__PURE__ */ new WeakMap();
  function stringify(x) {
    if (cachedStringification.has(x))
      return cachedStringification.get(x);
    const result = JSON.stringify(
      x,
      (key, value) => key === "source" ? void 0 : typeof value === "bigint" ? value.toString() + "n" : value,
      2
    );
    cachedStringification.set(x, result);
    return result;
  }

  // src/IR/exprs.ts
  function implicitConversion(behavesLike, expr) {
    return {
      kind: "ImplicitConversion",
      expr,
      behavesLike
    };
  }
  function keyValue(key, value) {
    return {
      kind: "KeyValue",
      key,
      value
    };
  }
  function _polygolfOp(op, ...args) {
    return {
      kind: "PolygolfOp",
      op,
      args
    };
  }
  function polygolfOp(op, ...args) {
    if (op === "not" || op === "bit_not") {
      const arg = args[0];
      if (isPolygolfOp(arg)) {
        if (arg.op === op)
          return arg.args[0];
        if (op === "not") {
          const negated = booleanNotOpCode(arg.op);
          if (negated != null) {
            return polygolfOp(negated, arg.args[0], arg.args[1]);
          }
        }
      }
    }
    if (op === "neg") {
      if (isIntLiteral(args[0])) {
        return int(-args[0].value);
      }
      return polygolfOp("mul", int(-1), args[0]);
    }
    if (op === "sub") {
      return polygolfOp("add", args[0], polygolfOp("neg", args[1]));
    }
    if (isAssociative(op)) {
      args = args.flatMap((x) => isPolygolfOp(x, op) ? x.args : [x]);
      if (op === "add")
        args = simplifyPolynomial(args);
      else {
        if (isCommutative(op)) {
          args = args.filter((x) => isIntLiteral(x)).concat(args.filter((x) => !isIntLiteral(x)));
        } else {
          args = args.filter((x) => !isTextLiteral(x, ""));
          if (args.length === 0 || args.length === 1 && args[0].kind === "ImplicitConversion") {
            args = [text(""), args[0]];
          }
        }
        const newArgs = [];
        for (const arg of args) {
          if (newArgs.length > 0) {
            const combined = evalBinaryOp(op, newArgs[newArgs.length - 1], arg);
            if (combined !== null) {
              newArgs[newArgs.length - 1] = combined;
            } else {
              newArgs.push(arg);
            }
          } else
            newArgs.push(arg);
        }
        args = newArgs;
        if (op === "mul" && args.length > 1 && isNegativeLiteral(args[0])) {
          const toNegate = args.find(
            (x) => isPolygolfOp(x, "add") && x.args.some(isNegative)
          );
          if (toNegate !== void 0) {
            args = args.map(
              (x) => isIntLiteral(x) ? int(-x.value) : x === toNegate ? polygolfOp(
                "add",
                ...x.args.map((y) => polygolfOp("neg", y))
              ) : x
            );
          }
        }
      }
      if (op === "mul" && args.length > 1 && isIntLiteral(args[0], 1n) && args[1].kind !== "ImplicitConversion") {
        args = args.slice(1);
      }
      if (args.length === 1)
        return args[0];
    }
    if (isBinary(op) && args.length === 2) {
      const combined = evalBinaryOp(op, args[0], args[1]);
      if (combined !== null) {
        return combined;
      }
    }
    return _polygolfOp(op, ...args);
  }
  function evalBinaryOp(op, left, right) {
    if (op === "concat" && isTextLiteral(left) && isTextLiteral(right)) {
      return text(left.value + right.value);
    }
    if (isIntLiteral(left) && isIntLiteral(right)) {
      try {
        const type3 = getArithmeticType(
          op,
          integerType(left.value, left.value),
          integerType(right.value, right.value)
        );
        if (isConstantType(type3))
          return int(type3.low);
      } catch {
      }
    }
    return null;
  }
  function simplifyPolynomial(terms) {
    const coeffMap = /* @__PURE__ */ new Map();
    let constant = 0n;
    function add2(coeff, rest) {
      const stringified = rest.map(stringify).join("");
      if (coeffMap.has(stringified)) {
        const [oldCoeff, expr] = coeffMap.get(stringified);
        coeffMap.set(stringified, [oldCoeff + coeff, expr]);
      } else {
        if (rest.length === 1)
          coeffMap.set(stringified, [coeff, rest[0]]);
        else
          coeffMap.set(stringified, [coeff, _polygolfOp("mul", ...rest)]);
      }
    }
    for (const x of terms) {
      if (isIntLiteral(x))
        constant += x.value;
      else if (isPolygolfOp(x, "mul")) {
        if (isIntLiteral(x.args[0]))
          add2(x.args[0].value, x.args.slice(1));
        else
          add2(1n, x.args);
      } else
        add2(1n, [x]);
    }
    let result = [];
    for (const [coeff, expr] of coeffMap.values()) {
      if (coeff === 1n)
        result.push(expr);
      else if (coeff !== 0n)
        result.push(_polygolfOp("mul", int(coeff), expr));
    }
    if (result.length < 1 || constant !== 0n || result.length === 1 && result[0].kind === "ImplicitConversion")
      result = [int(constant), ...result];
    return result;
  }
  var add1 = (expr) => polygolfOp("add", expr, int(1n));
  var sub1 = (expr) => polygolfOp("add", expr, int(-1n));
  function functionCall(func2, ...args) {
    return {
      kind: "FunctionCall",
      func: typeof func2 === "string" ? id(func2, true) : func2,
      args: args.flat()
    };
  }
  function methodCall(object, ident, ...args) {
    return {
      kind: "MethodCall",
      ident: typeof ident === "string" ? id(ident, true) : ident,
      object,
      args
    };
  }
  function propertyCall(object, ident) {
    return {
      kind: "PropertyCall",
      ident: typeof ident === "string" ? id(ident, true) : ident,
      object: [object].flat()[0]
    };
  }
  function indexCall(collection, index, oneIndexed = false) {
    return {
      kind: "IndexCall",
      collection: typeof collection === "string" ? id(collection) : collection,
      index,
      oneIndexed
    };
  }
  function rangeIndexCall(collection, low, high, step, oneIndexed = false) {
    return {
      kind: "RangeIndexCall",
      collection: typeof collection === "string" ? id(collection) : collection,
      low,
      high,
      step,
      oneIndexed
    };
  }
  function binaryOp(name, left, right) {
    return {
      kind: "BinaryOp",
      left,
      right,
      name
    };
  }
  function unaryOp(name, arg) {
    return {
      kind: "UnaryOp",
      arg,
      name
    };
  }
  function conditional(condition, consequent, alternate, isSafe = true) {
    return {
      kind: "ConditionalOp",
      condition,
      consequent,
      alternate,
      isSafe
    };
  }
  function func(args, expr) {
    return {
      kind: "Function",
      args: args.map((x) => typeof x === "string" ? id(x) : x),
      expr
    };
  }
  function namedArg(name, value) {
    return {
      kind: "NamedArg",
      name,
      value
    };
  }
  function print(value, newline = true) {
    return polygolfOp(newline ? "println" : "print", value);
  }
  function getArgs(node) {
    switch (node.kind) {
      case "BinaryOp":
        return [node.left, node.right];
      case "MutatingBinaryOp":
        return [node.variable, node.right];
      case "UnaryOp":
        return [node.arg];
      case "FunctionCall":
        return node.args;
      case "MethodCall":
        return [node.object, ...node.args];
      case "PolygolfOp":
        return node.args;
      case "IndexCall":
        return [node.collection, node.index];
      case "RangeIndexCall":
        return [node.collection, node.low, node.high, node.step];
    }
  }
  function isTextLiteral(x, ...vals) {
    return x.kind === "TextLiteral" && (vals.length === 0 || vals.includes(x.value));
  }
  function isIntLiteral(x, ...vals) {
    return x.kind === "IntegerLiteral" && (vals.length === 0 || vals.includes(x.value));
  }
  function isNegativeLiteral(expr) {
    return isIntLiteral(expr) && expr.value < 0n;
  }
  function isNegative(expr) {
    return isNegativeLiteral(expr) || isPolygolfOp(expr, "mul") && isNegativeLiteral(expr.args[0]);
  }
  function isPolygolfOp(x, ...ops) {
    return x.kind === "PolygolfOp" && (ops.length === 0 || ops?.includes(x.op));
  }

  // src/IR/loops.ts
  function whileLoop(condition, body) {
    return { kind: "WhileLoop", condition, body };
  }
  function forRange(variable2, start, end, increment, body, inclusive = false) {
    return {
      kind: "ForRange",
      variable: typeof variable2 === "string" ? id(variable2) : variable2,
      start,
      end,
      increment,
      body,
      inclusive
    };
  }
  function forDifferenceRange(variable2, start, difference, increment, body, inclusive = false) {
    return {
      kind: "ForDifferenceRange",
      variable: typeof variable2 === "string" ? id(variable2) : variable2,
      start,
      difference,
      increment,
      body,
      inclusive
    };
  }
  function forRangeCommon(bounds, ...body) {
    return forRange(
      bounds[0],
      typeof bounds[1] === "number" ? int(BigInt(bounds[1])) : bounds[1],
      typeof bounds[2] === "number" ? int(BigInt(bounds[2])) : bounds[2],
      bounds[3] === void 0 ? int(1n) : typeof bounds[3] === "number" ? int(BigInt(bounds[3])) : bounds[3],
      body.length > 1 ? block(body) : body[0],
      bounds[4]
    );
  }
  function forEach(variable2, collection, body) {
    return {
      kind: "ForEach",
      variable: typeof variable2 === "string" ? id(variable2) : variable2,
      collection,
      body
    };
  }
  function forEachKey(variable2, table, body) {
    return {
      kind: "ForEachKey",
      variable: typeof variable2 === "string" ? id(variable2) : variable2,
      table,
      body
    };
  }
  function forCLike(init, condition, append, body) {
    return {
      kind: "ForCLike",
      init,
      condition,
      append,
      body
    };
  }
  function forEachPair(keyVariable, valueVariable, table, body) {
    return {
      kind: "ForEachPair",
      keyVariable: typeof keyVariable === "string" ? id(keyVariable) : keyVariable,
      valueVariable: typeof valueVariable === "string" ? id(valueVariable) : valueVariable,
      table,
      body
    };
  }
  function forArgv(variable2, argcUpperBound, body) {
    return {
      kind: "ForArgv",
      variable: variable2,
      argcUpperBound,
      body
    };
  }

  // src/IR/terminals.ts
  function id(name, builtin3 = false) {
    return { kind: "Identifier", name, builtin: builtin3 };
  }
  function builtin2(name) {
    return id(name, true);
  }
  function int(value) {
    return { kind: "IntegerLiteral", value: BigInt(value) };
  }
  function text(value) {
    return { kind: "TextLiteral", value };
  }

  // src/IR/toplevel.ts
  function block(children) {
    return {
      kind: "Block",
      children: children.flatMap((x) => x.kind === "Block" ? x.children : [x])
    };
  }
  function blockOrSingle(children) {
    return children.length === 1 ? children[0] : block(children);
  }
  function ifStatement(condition, consequent, alternate) {
    return { kind: "IfStatement", condition, consequent, alternate };
  }
  function variants(variants2) {
    return { kind: "Variants", variants: variants2 };
  }
  function importStatement(name, modules) {
    return { kind: "ImportStatement", name, modules };
  }

  // src/IR/types.ts
  var booleanType = { kind: "boolean" };
  var voidType = { kind: "void" };
  var int64Type = integerType(
    -9223372036854775808n,
    9223372036854775807n
  );
  function type2(type3) {
    switch (type3) {
      case "void":
        return voidType;
      case "boolean":
        return booleanType;
      case "int64":
        return int64Type;
      default:
        return type3;
    }
  }
  function functionType(args, result) {
    return {
      kind: "Function",
      arguments: args,
      result
    };
  }
  function keyValueType(key, value) {
    return {
      kind: "KeyValue",
      key,
      value: type2(value)
    };
  }
  function tableType(key, value) {
    return {
      kind: "Table",
      key,
      value: type2(value)
    };
  }
  function setType(member) {
    return {
      kind: "Set",
      member: type2(member)
    };
  }
  function listType(member) {
    return {
      kind: "List",
      member: type2(member)
    };
  }
  function arrayType(member, length) {
    return {
      kind: "Array",
      member: type2(member),
      length
    };
  }
  function integerType(low = "-oo", high = "oo") {
    function toIntegerBound(x) {
      if (x === -Infinity || x === "-oo")
        return "-oo";
      if (x === Infinity || x === "oo")
        return "oo";
      return BigInt(x);
    }
    low = toIntegerBound(low);
    high = toIntegerBound(high);
    if (low === "oo" || high === "-oo" || lt(high, low)) {
      throw Error(`Nonsensical integer range ${low}..${high}`);
    }
    return {
      kind: "integer",
      low,
      high
    };
  }
  function constantIntegerType(c) {
    return {
      kind: "integer",
      low: c,
      high: c
    };
  }
  function textType(codepointLength = integerType(0, "oo"), isAscii = false) {
    if (typeof codepointLength === "number") {
      codepointLength = integerType(0n, codepointLength);
    }
    if (lt(codepointLength.low, 0n)) {
      codepointLength = integerType(0n, codepointLength.high);
    }
    return {
      kind: "text",
      codepointLength,
      isAscii
    };
  }
  var asciiType = textType(integerType(0), true);
  function integerTypeIncludingAll(...values) {
    return integerType(...integerBoundMinAndMax(values));
  }
  function typeContains(type3, value) {
    return leq(type3.low, value) && leq(value, type3.high);
  }
  function integerBoundMinAndMax(args) {
    return args.reduce(
      ([cMin, cMax], e) => {
        return [min(cMin, e), max(cMax, e)];
      },
      [args[0], args[0]]
    );
  }
  function toString(a) {
    switch (a.kind) {
      case "Function":
        return `(Func ${a.arguments.map(toString).join(" ")} ${toString(
          a.result
        )})`;
      case "List":
        return `(List ${toString(a.member)})`;
      case "Array":
        return `(Array ${toString(a.member)} ${a.length})`;
      case "Set":
        return `(Set ${toString(a.member)})`;
      case "Table":
        return `(Table ${toString(a.key)} ${toString(a.value)})`;
      case "KeyValue":
        return `(KeyValue ${toString(a.key)} ${toString(a.value)})`;
      case "void":
        return "Void";
      case "text": {
        const name = a.isAscii ? "Ascii" : "Text";
        const length = toString(a.codepointLength);
        return length === "0..oo" ? name : `(${name} ${length})`;
      }
      case "boolean":
        return "Bool";
      case "integer":
        return `${a.low.toString()}..${a.high.toString()}`;
    }
  }
  function intersection(a, b) {
    if (a.kind === "Function" && b.kind === "Function") {
      return functionType(
        a.arguments.map((t, i) => union(t, b.arguments[i])),
        intersection(a.result, b.result)
      );
    } else if (a.kind === "List" && b.kind === "List") {
      if (a.member.kind === "void")
        return b;
      if (b.member.kind === "void")
        return a;
      return listType(intersection(a.member, b.member));
    } else if (a.kind === "Array" && b.kind === "Array") {
      if (a.length === b.length)
        return arrayType(intersection(a.member, b.member), a.length);
    } else if (a.kind === "Set" && b.kind === "Set") {
      if (a.member.kind === "void")
        return b;
      if (b.member.kind === "void")
        return a;
      return setType(intersection(a.member, b.member));
    } else if (a.kind === "KeyValue" && b.kind === "KeyValue") {
      return keyValueType(
        intersection(a.key, b.key),
        intersection(a.value, b.value)
      );
    } else if (a.kind === "Table" && b.kind === "Table") {
      if (a.value.kind === "void")
        return b;
      if (b.value.kind === "void")
        return a;
      return tableType(
        intersection(a.key, b.key),
        intersection(a.value, b.value)
      );
    } else if (a.kind === "integer" && b.kind === "integer") {
      const low = max(a.low, b.low);
      const high = min(a.high, b.high);
      if (leq(low, high))
        return integerType(low, high);
    } else if (a.kind === "text" && b.kind === "text") {
      return textType(
        intersection(a.codepointLength, b.codepointLength),
        a.isAscii || b.isAscii
      );
    } else if (a.kind === b.kind) {
      return a;
    }
    throw new Error("Empty intersection.");
  }
  function union(a, b) {
    try {
      if (a.kind === "Function" && b.kind === "Function") {
        return functionType(
          a.arguments.map((t, i) => intersection(t, b.arguments[i])),
          union(a.result, b.result)
        );
      } else if (a.kind === "List" && b.kind === "List") {
        if (a.member.kind === "void")
          return b;
        if (b.member.kind === "void")
          return a;
        return listType(union(a.member, b.member));
      } else if (a.kind === "Array" && b.kind === "Array") {
        if (a.length === b.length)
          return arrayType(union(a.member, b.member), a.length);
      } else if (a.kind === "Set" && b.kind === "Set") {
        if (a.member.kind === "void")
          return b;
        if (b.member.kind === "void")
          return a;
        return setType(union(a.member, b.member));
      } else if (a.kind === "KeyValue" && b.kind === "KeyValue") {
        return keyValueType(union(a.key, b.key), union(a.value, b.value));
      } else if (a.kind === "Table" && b.kind === "Table") {
        if (a.value.kind === "void")
          return b;
        if (b.value.kind === "void")
          return a;
        return tableType(union(a.key, b.key), union(a.value, b.value));
      } else if (a.kind === "integer" && b.kind === "integer") {
        return b.kind === "integer" ? integerType(min(a.low, b.low), max(a.high, b.high)) : integerType();
      } else if (a.kind === "text" && b.kind === "text") {
        return textType(
          union(a.codepointLength, b.codepointLength),
          a.isAscii && b.isAscii
        );
      } else if (a.kind === b.kind) {
        return a;
      }
      throw new Error(`Cannot model union of ${toString(a)} and ${toString(b)}.`);
    } catch (e) {
      throw new Error(
        `Cannot model union of ${toString(a)} and ${toString(b)}.
${e instanceof Error ? e.message : ""}`
      );
    }
  }
  function isSubtype(a, b) {
    if (a.kind === "Function" && b.kind === "Function") {
      return a.arguments.every((t, i) => isSubtype(b.arguments[i], t)) && isSubtype(a.result, b.result);
    }
    if (a.kind === "Set" && b.kind === "Set" || a.kind === "List" && b.kind === "List") {
      return a.member.kind === "void" || isSubtype(a.member, b.member);
    }
    if (a.kind === "Array" && b.kind === "Array") {
      return a.length === b.length && isSubtype(a.member, b.member);
    }
    if (a.kind === "KeyValue" && b.kind === "KeyValue")
      return false;
    if (a.kind === "Table" && b.kind === "Table") {
      return isSubtype(a.key, b.key) && isSubtype(a.value, b.value);
    }
    if (a.kind === "integer" && b.kind === "integer") {
      return leq(b.low, a.low) && leq(a.high, b.high);
    }
    if (a.kind === "text" && b.kind === "text") {
      return isSubtype(a.codepointLength, b.codepointLength) && (a.isAscii || !b.isAscii);
    }
    return a.kind === b.kind;
  }
  function abs(a) {
    return leq(a, 0n) ? neg(a) : a;
  }
  function min(a, b) {
    return leq(a, b) ? a : b;
  }
  function max(a, b) {
    return leq(a, b) ? b : a;
  }
  function leq(a, b) {
    return a === "-oo" || b === "oo" || a !== "oo" && b !== "-oo" && a <= b;
  }
  function lt(a, b) {
    return leq(a, b) && a !== b;
  }
  function neg(a) {
    return a === "oo" ? "-oo" : a === "-oo" ? "oo" : -a;
  }
  function add(a, b) {
    if (leq(b, a))
      [a, b] = [b, a];
    if (a === "-oo" && b === "oo")
      throw new Error("Indeterminate result of -oo + oo.");
    if (a === "-oo")
      return a;
    if (b === "oo")
      return b;
    return a + b;
  }
  function sub(a, b) {
    return add(a, neg(b));
  }
  function mul(a, b) {
    if (leq(b, a))
      [a, b] = [b, a];
    if (a === "-oo" && b === 0n || b === "oo" && a === 0n)
      throw new Error("Indeterminate result of 0 * oo.");
    if (a === "-oo")
      return lt(b, 0n) ? "oo" : "-oo";
    if (b === "oo")
      return lt(a, 0n) ? "-oo" : "oo";
    return a * b;
  }
  function floorDiv(a, b) {
    const res = truncDiv(a, b);
    return mul(res, b) !== a && lt(a, 0n) !== lt(b, 0n) ? sub(res, 1n) : res;
  }
  function truncDiv(a, b) {
    if (b === 0n)
      throw new Error("Indeterminate result of x / 0.");
    if (!isFiniteBound(a) && !isFiniteBound(b))
      throw new Error("Indeterminate result of +-oo / +-oo.");
    if (!isFiniteBound(a)) {
      if (lt(a, 0n) === lt(b, 0n))
        return "oo";
      else
        return "-oo";
    }
    if (b === "-oo" || b === "oo")
      return 0n;
    return a / b;
  }
  function isFiniteBound(a) {
    return typeof a === "bigint";
  }
  function isFiniteType(a) {
    return isFiniteBound(a.low) && isFiniteBound(a.high);
  }
  function isConstantType(a) {
    return isFiniteType(a) && a.low === a.high;
  }
  function defaultValue(a) {
    switch (a.kind) {
      case "Array":
        return arrayConstructor([]);
      case "List":
        return listConstructor([]);
      case "Set":
        return setConstructor([]);
      case "Table":
        return tableConstructor([]);
      case "text":
        if (isFiniteBound(a.codepointLength.low) && a.codepointLength.low < 2 ** 32) {
          return text(" ".repeat(Number(a.codepointLength.low)));
        }
        break;
      case "integer":
        if (lt(a.high, 0n))
          return int(a.high);
        if (lt(0n, a.low))
          return int(a.low);
        return int(0);
    }
    throw new Error(`Unsupported default value for type ${toString(a)}`);
  }

  // src/IR/IR.ts
  function program(body) {
    return {
      kind: "Program",
      body
    };
  }

  // src/common/immutable.ts
  function replaceAtIndex(arr, index, ...insert) {
    const a = [...arr];
    a.splice(index, 1, ...insert);
    return a;
  }

  // src/common/Spine.ts
  var Spine2 = class {
    constructor(node, parent, pathFragment) {
      this.node = node;
      this.parent = parent;
      this.pathFragment = pathFragment;
      const root = parent?.root ?? parent ?? this;
      if (root.node.kind !== "Program")
        throw new Error(
          `Programming error: Root node should be a Program, but got ${root.node.kind}`
        );
      this.root = root;
    }
    root;
    get depth() {
      return this.parent === null ? 0 : 1 + this.parent.depth;
    }
    /** Get a list of all child spines. */
    getChildSpines() {
      return Array.from(getChildFragments(this.node)).map(
        (n) => this.getChild(n)
      );
    }
    /** Get one particular child spine. */
    getChild(pathFragment) {
      return new Spine2(getChild(this.node, pathFragment), this, pathFragment);
    }
    /** Return the spine (pointing to this node) determined from replacing a child
     * of this node with `newChild`. Replaces all of the ancestors of this
     * node, up to the root program, to get a fresh spine up to the program node. */
    withChildReplaced(newChild, pathFragment) {
      if (newChild === this.getChild(pathFragment).node)
        return this;
      const node = typeof pathFragment === "string" ? { ...this.node, [pathFragment]: newChild } : {
        ...this.node,
        [pathFragment.prop]: replaceAtIndex(
          this.node[pathFragment.prop],
          pathFragment.index,
          newChild
        )
      };
      return new Spine2(
        node,
        this.parent === null || this.pathFragment === null ? null : this.parent.withChildReplaced(node, this.pathFragment),
        this.pathFragment
      );
    }
    /** Return the spine (pointing to this node) determined from replacing this
     * node with `newNode`. Replaces all of the ancestors of this node, up to the
     * root program, to get a fresh spine up to the program node.
     * If `canonizeAndReturnRoot`, all `PolygolfOp`s up to the root are canonized
     * and the root spine is returned. */
    replacedWith(newNode, canonizeAndReturnRoot = false) {
      if (this.parent === null || this.pathFragment === null) {
        if (newNode.kind !== "Program")
          throw new Error(
            `Programming error: attempt to replace the root node with node of kind ${newNode.kind}`
          );
        return new Spine2(newNode, null, null);
      }
      if (newNode.kind === "Block" && this.parent.node.kind === "Block") {
        throw new Error(
          `Programming error: attempt to insert a Block into a Block`
        );
      }
      const parentNode = this.parent.node;
      const parent = canonizeAndReturnRoot && isPolygolfOp(parentNode) && typeof this.pathFragment === "object" ? this.parent.replacedWith(
        polygolfOp(
          parentNode.op,
          ...replaceAtIndex(
            parentNode.args,
            this.pathFragment.index,
            newNode
          )
        ),
        true
      ) : this.parent.withChildReplaced(newNode, this.pathFragment);
      return canonizeAndReturnRoot ? parent.root : parent.getChild(this.pathFragment);
    }
    /** A map of a function over all nodes in pre-order traversal order, followed
     * by removal of `undefined` return values. Returns a generator, so is a no-op
     * if the values are not used. Name inspired by Swift's `compactMap`. */
    *compactMap(func2) {
      const ret = func2(this.node, this);
      if (ret !== void 0)
        yield ret;
      for (const child of this.getChildSpines())
        yield* child.compactMap(func2);
    }
    /** Test whether this node and all children meet the provided condition. */
    everyNode(cond) {
      for (const val of this.compactMap(cond))
        if (!val)
          return false;
      return true;
    }
    /** Test whether this node, or some child, meets the provided condition. */
    someNode(cond) {
      for (const val of this.compactMap(cond))
        if (val)
          return true;
      return false;
    }
    /** Return the spine (pointing to this node) determined from replacing this
     * node and all of its children with nodes given by the provided `replacer`
     * function. Replaces all of the ancestors of this node, up to the
     * root program, to get a fresh spine up to the program node.
     *
     * @param skipThis if true, does not replace this node.
     * @param skipReplaced if true, does not recurse onto children of freshly replaced node
     * */
    withReplacer(replacer, skipThis = false, skipReplaced = false) {
      const ret = skipThis ? void 0 : replacer(this.node, this);
      if (ret === void 0) {
        let curr = this;
        if (isPolygolfOp(this.node)) {
          const newChildren = [];
          let someChildrenIsNew = false;
          for (const child of this.getChildSpines()) {
            const newChild = child.withReplacer(replacer, false, skipReplaced);
            newChildren.push(newChild.node);
            someChildrenIsNew ||= newChild !== child;
          }
          if (someChildrenIsNew)
            curr = curr.replacedWith(polygolfOp(this.node.op, ...newChildren));
        } else {
          for (const child of this.getChildSpines()) {
            const newChild = child.withReplacer(replacer, false, skipReplaced);
            if (newChild !== child) {
              curr = curr.withChildReplaced(newChild.node, child.pathFragment);
            }
          }
        }
        return curr;
      } else if (skipReplaced) {
        return this.replacedWith(ret);
      } else {
        return this.replacedWith(ret).withReplacer(replacer, true);
      }
    }
  };
  function programToSpine(node) {
    return new Spine2(node, null, null);
  }

  // src/frontend/parse.ts
  var import_nearley = __toESM(require_nearley());

  // src/frontend/lexer.ts
  var import_moo = __toESM(require_moo());
  var tokenTable = {
    integer: /-?[0-9]+/,
    string: /"(?:\\.|[^"])*"/,
    variable: /\$\w+/,
    type: /[A-Z][a-z]*/,
    argv_get: "argv_get",
    nullary: ["argv", "argc", "true", "false"],
    ninf: ["-oo", "-\u221E"],
    pinf: ["oo", "\u221E"],
    variant: "/",
    opalias: "<- + - * ^ & | ~ >> << == != <= < >= > => # mod rem div trunc_div".split(
      " "
    ),
    builtin: /[a-z0-9_]+/,
    lparen: "(",
    rparen: ")",
    lbrace: "{",
    rbrace: "}",
    colon: ":",
    range: "..",
    semicolon: ";",
    comment: {
      match: /%.*?(?:$|\n)/,
      lineBreaks: true
    },
    whitespace: {
      match: /\s/,
      lineBreaks: true
    }
  };
  var lexer = import_moo.default.compile(tokenTable);
  var currNext = lexer.next.bind(lexer);
  lexer.next = function() {
    let next = currNext();
    while (next?.type === "whitespace" || next?.type === "comment") {
      next = currNext();
    }
    return next;
  };
  var lexer_default = lexer;

  // src/frontend/grammar.ts
  function id2(d) {
    return d[0];
  }
  var grammar = {
    Lexer: lexer_default,
    ParserRules: [
      { "name": "main", "symbols": ["variant"], "postprocess": ([variant]) => program(variant) },
      { "name": "variant_child", "symbols": ["expr", { "literal": ";" }], "postprocess": id2 },
      { "name": "variant_child", "symbols": ["stmt"], "postprocess": id2 },
      { "name": "variant_last_child$ebnf$1", "symbols": [{ "literal": ";" }], "postprocess": id2 },
      { "name": "variant_last_child$ebnf$1", "symbols": [], "postprocess": () => null },
      { "name": "variant_last_child", "symbols": ["expr", "variant_last_child$ebnf$1"], "postprocess": id2 },
      { "name": "variant_last_child", "symbols": ["stmt"], "postprocess": id2 },
      { "name": "variant$ebnf$1", "symbols": [] },
      { "name": "variant$ebnf$1", "symbols": ["variant$ebnf$1", "variant_child"], "postprocess": (d) => d[0].concat([d[1]]) },
      { "name": "variant", "symbols": ["variant$ebnf$1", "variant_last_child"], "postprocess": ([exprs, expr]) => refSource(blockOrSingle([...exprs, expr]), [...exprs, expr][0]) },
      { "name": "variants$ebnf$1", "symbols": [] },
      { "name": "variants$ebnf$1$subexpression$1", "symbols": ["variant", { "literal": "/" }] },
      { "name": "variants$ebnf$1", "symbols": ["variants$ebnf$1", "variants$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]]) },
      {
        "name": "variants",
        "symbols": [{ "literal": "{" }, "variants$ebnf$1", "variant", { "literal": "}" }],
        "postprocess": ([start, vars, var2]) => refSource(variants([...vars.map(id2), var2]), start)
      },
      { "name": "expr$ebnf$1$subexpression$1", "symbols": [{ "literal": ":" }, "type_expr"] },
      { "name": "expr$ebnf$1", "symbols": ["expr$ebnf$1$subexpression$1"], "postprocess": id2 },
      { "name": "expr$ebnf$1", "symbols": [], "postprocess": () => null },
      { "name": "expr", "symbols": ["expr_inner", "expr$ebnf$1"], "postprocess": ([expr, type3]) => annotate(expr, type3) },
      { "name": "expr", "symbols": ["variants"], "postprocess": id2 },
      { "name": "expr_inner", "symbols": ["integer"], "postprocess": id2 },
      { "name": "expr_inner", "symbols": ["string"], "postprocess": id2 },
      { "name": "expr_inner", "symbols": ["variable"], "postprocess": id2 },
      { "name": "expr_inner", "symbols": ["nullary"], "postprocess": id2 },
      { "name": "expr_inner", "symbols": ["sexpr"], "postprocess": id2 },
      { "name": "sexpr$ebnf$1", "symbols": [] },
      { "name": "sexpr$ebnf$1", "symbols": ["sexpr$ebnf$1", "expr"], "postprocess": (d) => d[0].concat([d[1]]) },
      { "name": "sexpr", "symbols": [{ "literal": "(" }, "callee", "sexpr$ebnf$1", { "literal": ")" }], "postprocess": ([start, callee, exprs]) => refSource(sexpr(callee, exprs), start) },
      { "name": "sexpr", "symbols": [{ "literal": "(" }, "expr", "opalias", "expr", { "literal": ")" }], "postprocess": ([start, expr1, op, expr2]) => refSource(sexpr(op, [expr1, expr2]), start) },
      { "name": "stmt$ebnf$1", "symbols": ["expr"] },
      { "name": "stmt$ebnf$1", "symbols": ["stmt$ebnf$1", "expr"], "postprocess": (d) => d[0].concat([d[1]]) },
      { "name": "stmt", "symbols": ["callee", "stmt$ebnf$1", { "literal": ";" }], "postprocess": ([callee, exprs]) => refSource(sexpr(callee, exprs), callee) },
      { "name": "stmt", "symbols": ["expr", "opalias", "expr", { "literal": ";" }], "postprocess": ([expr1, op, expr2]) => refSource(sexpr(op, [expr1, expr2]), expr1) },
      { "name": "callee", "symbols": ["builtin"], "postprocess": id2 },
      { "name": "callee", "symbols": ["opalias"], "postprocess": id2 },
      { "name": "callee", "symbols": ["variable"], "postprocess": id2 },
      { "name": "integer", "symbols": [lexer_default.has("integer") ? { type: "integer" } : integer], "postprocess": (d) => refSource(int(BigInt(d[0])), d[0]) },
      { "name": "variable", "symbols": [lexer_default.has("variable") ? { type: "variable" } : variable], "postprocess": (d) => refSource(userIdentifier(d[0]), d[0]) },
      { "name": "builtin$subexpression$1", "symbols": [lexer_default.has("builtin") ? { type: "builtin" } : builtin] },
      { "name": "builtin$subexpression$1", "symbols": [{ "literal": "argv_get" }] },
      { "name": "builtin", "symbols": ["builtin$subexpression$1"], "postprocess": (d) => refSource(id(d[0][0].value, true), d[0][0]) },
      { "name": "opalias$subexpression$1", "symbols": [lexer_default.has("opalias") ? { type: "opalias" } : opalias] },
      { "name": "opalias$subexpression$1", "symbols": [{ "literal": ".." }] },
      { "name": "opalias", "symbols": ["opalias$subexpression$1"], "postprocess": (d) => refSource(id(d[0][0].value, true), d[0][0]) },
      { "name": "nullary", "symbols": [lexer_default.has("nullary") ? { type: "nullary" } : nullary], "postprocess": (d) => refSource(sexpr(id(d[0].value, true), []), d[0]) },
      { "name": "string", "symbols": [lexer_default.has("string") ? { type: "string" } : string], "postprocess": (d) => refSource(text(JSON.parse(d[0])), d[0]) },
      { "name": "type_expr", "symbols": ["type_range"], "postprocess": id2 },
      { "name": "type_expr", "symbols": ["type_simple"], "postprocess": id2 },
      { "name": "type_expr", "symbols": ["type_sexpr"], "postprocess": id2 },
      { "name": "ninf", "symbols": [lexer_default.has("ninf") ? { type: "ninf" } : ninf], "postprocess": (d) => d[0].value },
      { "name": "pinf", "symbols": [lexer_default.has("pinf") ? { type: "pinf" } : pinf], "postprocess": (d) => d[0].value },
      { "name": "type_range$subexpression$1", "symbols": ["ninf"] },
      { "name": "type_range$subexpression$1", "symbols": ["integer"] },
      { "name": "type_range$subexpression$2", "symbols": ["pinf"] },
      { "name": "type_range$subexpression$2", "symbols": ["integer"] },
      { "name": "type_range", "symbols": ["type_range$subexpression$1", { "literal": ".." }, "type_range$subexpression$2"], "postprocess": ([low, op, high]) => integerType2(low[0], high[0]) },
      { "name": "type_simple", "symbols": [lexer_default.has("type") ? { type: "type" } : type], "postprocess": (d) => typeSexpr(d[0], []) },
      { "name": "type_sexpr$ebnf$1$subexpression$1", "symbols": ["type_expr"] },
      { "name": "type_sexpr$ebnf$1$subexpression$1", "symbols": ["integer"] },
      { "name": "type_sexpr$ebnf$1", "symbols": ["type_sexpr$ebnf$1$subexpression$1"] },
      { "name": "type_sexpr$ebnf$1$subexpression$2", "symbols": ["type_expr"] },
      { "name": "type_sexpr$ebnf$1$subexpression$2", "symbols": ["integer"] },
      { "name": "type_sexpr$ebnf$1", "symbols": ["type_sexpr$ebnf$1", "type_sexpr$ebnf$1$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]]) },
      { "name": "type_sexpr", "symbols": [{ "literal": "(" }, lexer_default.has("type") ? { type: "type" } : type, "type_sexpr$ebnf$1", { "literal": ")" }], "postprocess": ([start, op, args]) => typeSexpr(op, args.map(id2)) }
    ],
    ParserStart: "main"
  };
  var grammar_default = grammar;

  // src/frontend/parse.ts
  var restrictedFrontend = true;
  function sexpr(callee, args) {
    if (!callee.builtin) {
      return functionCall(callee, args);
    }
    const opCode = canonicalOp(callee.name, args.length);
    function expectArity(low, high = low) {
      if (args.length < low || args.length > high) {
        throw new PolygolfError(
          `Syntax error. Invalid argument count in application of ${opCode}: Expected ${low}${low === high ? "" : ".." + String(high)} but got ${args.length}.`,
          callee.source
        );
      }
    }
    function assertIdentifier(e) {
      if (e.kind !== "Identifier")
        throw new PolygolfError(
          `Syntax error. Application first argument must be identifier, but got ${args[0].kind}`,
          e.source
        );
    }
    function assertInteger(e) {
      if (!isIntLiteral(e))
        throw new PolygolfError(
          `Syntax error. Expected integer literal, but got ${e.kind}`,
          e.source
        );
    }
    function assertIdentifiers(e) {
      e.forEach(assertIdentifier);
    }
    function assertKeyValues(e) {
      for (const x of e) {
        if (x.kind !== "KeyValue")
          throw new PolygolfError(
            `Syntax error. Application ${opCode} requires list of key-value pairs as argument`,
            x.source
          );
      }
    }
    function asString(e) {
      if (isTextLiteral(e))
        return e.value;
      throw new PolygolfError(
        `Syntax error. Expected string literal, but got ${e.kind}`,
        e.source
      );
    }
    function asArray(e) {
      if (e.kind === "Variants" && e.variants.length === 1) {
        return e.variants[0].kind === "Block" ? e.variants[0].children : [e.variants[0]];
      }
      throw new PolygolfError(
        `Syntax error. Expected single variant block, but got ${e.kind}`,
        e.source
      );
    }
    switch (opCode) {
      case "key_value":
        expectArity(2);
        return keyValue(args[0], args[1]);
      case "func": {
        expectArity(1, Infinity);
        const idents = args.slice(0, args.length);
        const expr = args[args.length - 1];
        assertIdentifiers(idents);
        return func(idents, expr);
      }
      case "assign":
        expectArity(2);
        assertIdentifier(args[0]);
        return assignment(args[0], args[1]);
      case "function_call": {
        expectArity(1, Infinity);
        assertIdentifier(args[0]);
        return functionCall(args[0], args.slice(1));
      }
      case "array":
        expectArity(1, Infinity);
        return arrayConstructor(args);
      case "list":
        return listConstructor(args);
      case "set":
        return setConstructor(args);
      case "table":
        assertKeyValues(args);
        return tableConstructor(args);
      case "conditional":
      case "unsafe_conditional":
        expectArity(3);
        return conditional(args[0], args[1], args[2], opCode === "conditional");
      case "while":
        expectArity(2);
        return whileLoop(args[0], args[1]);
      case "for": {
        expectArity(2, 5);
        let variable2 = id("_");
        let start = int(0n);
        let step = int(1n);
        let end, body;
        if (args.length === 5) {
          [variable2, start, end, step, body] = args;
        } else if (args.length === 4) {
          [variable2, start, end, body] = args;
        } else if (args.length === 3) {
          [variable2, end, body] = args;
        } else {
          [end, body] = args;
        }
        assertIdentifier(variable2);
        return forRange(
          variable2.name === "_" ? void 0 : variable2,
          start,
          end,
          step,
          body
        );
      }
      case "for_argv": {
        expectArity(3);
        const [variable2, upperBound, body] = args;
        assertIdentifier(variable2);
        assertInteger(upperBound);
        return forArgv(variable2, Number(upperBound.value), body);
      }
      case "if": {
        expectArity(2, 3);
        const condition = args[0];
        const consequent = args[1];
        const alternate = args[2];
        return ifStatement(condition, consequent, alternate);
      }
    }
    if (!restrictedFrontend)
      switch (opCode) {
        case "implicit_conversion":
          expectArity(2);
          return implicitConversion(asString(args[0]), args[1]);
        case "var_declaration":
          expectArity(1);
          assertIdentifier(args[0]);
          return varDeclaration(args[0], args[0].type);
        case "var_declaration_with_assignment":
          expectArity(1);
          return varDeclarationWithAssignment(args[0]);
        case "var_declaration_block":
          return varDeclarationBlock(args);
        case "many_to_many_assignment": {
          expectArity(2);
          const vars = asArray(args[0]);
          const exprs = asArray(args[1]);
          assertIdentifiers(vars);
          return manyToManyAssignment(vars, exprs);
        }
        case "one_to_many_assignment": {
          expectArity(2);
          const vars = asArray(args[0]);
          const expr = args[1];
          assertIdentifiers(vars);
          return oneToManyAssignment(vars, expr);
        }
        case "mutating_binary_op":
          expectArity(3);
          assertIdentifier(args[1]);
          return mutatingBinaryOp(asString(args[0]), args[1], args[2]);
        case "index_call":
        case "index_call_one_indexed":
          expectArity(2);
          return indexCall(args[0], args[1], opCode === "index_call_one_indexed");
        case "range_index_call":
        case "range_index_call_one_indexed":
          expectArity(4);
          return rangeIndexCall(
            args[0],
            args[1],
            args[2],
            args[3],
            opCode === "range_index_call_one_indexed"
          );
        case "property_call":
          expectArity(2);
          return propertyCall(args[0], asString(args[1]));
        case "method_call":
          expectArity(2, Infinity);
          return methodCall(args[0], asString(args[1]), ...args.slice(2));
        case "binary_op":
          expectArity(3);
          return binaryOp(asString(args[0]), args[1], args[2]);
        case "unary_op":
          expectArity(2);
          return unaryOp(asString(args[0]), args[1]);
        case "builtin":
        case "id":
          expectArity(1);
          return id(asString(args[0]), opCode === "builtin");
        case "import_statement":
          expectArity(2, Infinity);
          return importStatement(asString(args[0]), args.slice(1).map(asString));
        case "for_range_inclusive": {
          expectArity(5);
          const [variable2, start, end, step, body] = args;
          assertIdentifier(variable2);
          return forRange(
            variable2.name === "_" ? void 0 : variable2,
            start,
            end,
            step,
            body,
            true
          );
        }
        case "for_difference_range": {
          expectArity(5);
          const [variable2, start, difference, step, body] = args;
          assertIdentifier(variable2);
          return forDifferenceRange(
            variable2,
            start,
            difference,
            step,
            body,
            true
          );
        }
        case "for_each": {
          expectArity(3);
          const [variable2, collection, body] = args;
          assertIdentifier(variable2);
          return forEach(variable2, collection, body);
        }
        case "for_each_key": {
          expectArity(3);
          const [variable2, collection, body] = args;
          assertIdentifier(variable2);
          return forEachKey(variable2, collection, body);
        }
        case "for_each_pair": {
          expectArity(4);
          const [keyVariable, valueVariable, collection, body] = args;
          assertIdentifier(keyVariable);
          assertIdentifier(valueVariable);
          return forEachPair(keyVariable, valueVariable, collection, body);
        }
        case "for_c_like": {
          expectArity(4);
          const [init, condition, append, body] = args;
          return forCLike(init, condition, append, body);
        }
        case "for_no_index": {
          expectArity(3, 4);
          let start, end, step, body;
          if (args.length === 4) {
            [start, end, step, body] = args;
          } else {
            [start, end, body] = args;
            step = int(1n);
          }
          return forRange(void 0, start, end, step, body);
        }
        case "named_arg":
          expectArity(2);
          return namedArg(asString(args[0]), args[1]);
      }
    if (isOpCode(opCode) && (!restrictedFrontend || isFrontend(opCode))) {
      if (opCode === "argv_get" && restrictedFrontend) {
        assertInteger(args[0]);
      }
      if (isBinary(opCode)) {
        expectArity(2, isAssociative(opCode) ? Infinity : 2);
        return polygolfOp(opCode, ...args);
      }
      const ar = arity(opCode);
      expectArity(ar, ar === -1 ? Infinity : ar);
      return polygolfOp(opCode, ...args);
    }
    throw new PolygolfError(
      `Syntax error. Unrecognized builtin: ${opCode}`,
      callee.source
    );
  }
  var canonicalOpTable = {
    "+": "add",
    // neg, sub handled as special case in canonicalOp
    "*": "mul",
    "^": "pow",
    "&": "bit_and",
    "|": "bit_or",
    "<<": "bit_shift_left",
    ">>": "bit_shift_right",
    // bitxor, bitnot handled as special case in canonicalOp
    "==": "eq",
    "!=": "neq",
    "<=": "leq",
    "<": "lt",
    ">=": "geq",
    ">": "gt",
    "#": "list_length",
    "..": "concat"
  };
  function canonicalOp(op, arity2) {
    if (op === "<-")
      return "assign";
    if (op === "=>")
      return "key_value";
    if (op === "-")
      return arity2 < 2 ? "neg" : "sub";
    if (op === "~")
      return arity2 < 2 ? "bit_not" : "bit_xor";
    return canonicalOpTable[op] ?? op;
  }
  function userIdentifier(token) {
    const name = token.value.slice(1);
    return id(name, false);
  }
  function typeSexpr(callee, args) {
    function expectArity(low, high = low) {
      if (args.length < low || args.length > high) {
        throw new PolygolfError(
          `Syntax error. Invalid argument count in application of ${callee.value}: Expected ${low}${low === high ? "" : ".." + String(high)} but got ${args.length}.`,
          { line: callee.line, column: callee.col }
        );
      }
    }
    function assertNumber(e) {
      if (e.kind !== "IntegerLiteral")
        throw new PolygolfError(`Syntax error. Expected number, got type.`, {
          line: callee.line,
          column: callee.col
        });
    }
    function assertTypes(e) {
      e.forEach(assertType);
    }
    function assertType(e) {
      if (e.kind === "IntegerLiteral")
        throw new PolygolfError(`Syntax error. Expected type, got number.`, {
          line: callee.line,
          column: callee.col
        });
    }
    switch (callee.value) {
      case "Void":
        expectArity(0);
        return voidType;
      case "Int":
        expectArity(0);
        return integerType();
      case "Ascii":
      case "Text":
        expectArity(0, 1);
        if (args.length === 0)
          return textType(integerType(), callee.value === "Ascii");
        if (args[0].kind === "IntegerLiteral")
          return textType(Number(args[0].value), callee.value === "Ascii");
        if (args[0].kind === "integer")
          return textType(args[0], callee.value === "Ascii");
        throw new PolygolfError(
          `Syntax error. Expected integer or integer type, got ${toString(
            args[0]
          )}.`,
          {
            line: callee.line,
            column: callee.col
          }
        );
      case "Bool":
        expectArity(0);
        return booleanType;
      case "Array":
        expectArity(2);
        assertType(args[0]);
        assertNumber(args[1]);
        return arrayType(args[0], Number(args[1].value));
      case "List":
        expectArity(1);
        assertType(args[0]);
        return listType(args[0]);
      case "Table":
        expectArity(2);
        assertType(args[0]);
        assertType(args[1]);
        if (args[0].kind === "integer")
          return tableType(args[0], args[1]);
        if (args[0].kind === "text")
          return tableType(args[0], args[1]);
        throw new PolygolfError("Unexpected key type for table.");
      case "Set":
        expectArity(1);
        assertType(args[0]);
        return setType(args[0]);
      case "Func":
        expectArity(1, Infinity);
        assertTypes(args);
        return functionType(
          args.slice(0, args.length - 1),
          args[args.length - 1]
        );
      default:
        throw new PolygolfError(
          `Syntax error. Unrecognized type: ${callee.value}`,
          {
            line: callee.line,
            column: callee.col
          }
        );
    }
  }
  function annotate(expr, valueType) {
    if (valueType === null)
      return expr;
    return { ...expr, type: valueType[1] };
  }
  function integerType2(low, high) {
    return integerType(
      typeof low === "string" ? void 0 : low.value,
      typeof high === "string" ? void 0 : high.value
    );
  }
  function refSource(node, ref) {
    if (ref === void 0)
      return node;
    const source = "line" in ref ? { line: ref.line, column: ref.col } : ref.source;
    return {
      ...node,
      source
    };
  }
  function parse(code, restrictFrontend = true) {
    restrictedFrontend = restrictFrontend;
    const parser = new import_nearley.default.Parser(import_nearley.default.Grammar.fromCompiled(grammar_default));
    try {
      parser.feed(code);
    } catch (e) {
      if (e instanceof Error && "token" in e) {
        const token = e.token;
        const expected = [
          ...new Set(
            (e.message.match(/(?<=A ).*(?= based on:)/g) ?? []).map(
              (s) => s.replace(/\s+token/i, "")
            )
          )
        ];
        let message = `Unexpected token ${JSON.stringify(token.text)}.`;
        if (expected.length > 0) {
          message += ` Expected one of ${expected.join(", ")}.`;
        }
        throw new PolygolfError(message, {
          line: token.line,
          column: token.col
        });
      } else {
        throw e;
      }
    }
    const results = parser.results;
    if (results.length > 1) {
      throw new Error("Ambiguous parse of code");
    }
    if (results.length === 0) {
      const lines = code.split("\n");
      throw new PolygolfError("Unexpected end of code", {
        line: lines.length + 1,
        column: (lines.at(-1)?.length ?? 0) + 1
      });
    }
    return results[0];
  }

  // src/common/compile.ts
  var import_priority_queue = __toESM(require_priority_queue());

  // src/common/emit.ts
  function joinTrees(sep, groups) {
    return groups.flatMap((x, i) => i > 0 ? [sep, x] : [x]);
  }
  function emitTextLiteral(value, options = [
    [
      `"`,
      [
        [`\\`, `\\\\`],
        [`
`, `\\n`],
        [`\r`, `\\r`],
        [`"`, `\\"`]
      ]
    ]
  ]) {
    let result = "";
    for (const [delim, escapes] of options) {
      if (escapes.some((x) => x[1] === null && value.includes(x[0])))
        continue;
      let current = value;
      for (const [c, d] of escapes) {
        if (d === null)
          continue;
        current = current.replaceAll(c, d);
      }
      if (typeof delim === "string")
        current = delim + current + delim;
      else
        current = delim[0] + current + delim[1];
      if (result === "" || current.length < result.length)
        result = current;
    }
    return result;
  }
  function containsMultiExpr(exprs) {
    for (const expr of exprs) {
      if ("consequent" in expr || "children" in expr || "body" in expr) {
        return true;
      }
    }
    return false;
  }
  var EmitError = class extends PolygolfError {
    constructor(expr, detail) {
      if (detail === void 0 && "op" in expr && expr.op !== null)
        detail = expr.op;
      detail = detail === void 0 ? "" : ` (${detail})`;
      const message = `emit error - ${expr.kind}${detail} not supported.`;
      super(message, expr.source);
      this.name = "EmitError";
      Object.setPrototypeOf(this, EmitError.prototype);
    }
  };

  // src/languages/polygolf/emit.ts
  function emitProgram(program2) {
    return emitExpr(program2.body, true);
  }
  function emitVariants(expr, indent = false) {
    if (indent || expr.variants.some((x) => x.kind === "Block")) {
      return [
        "{",
        "$INDENT$",
        "\n",
        joinTrees(
          ["$DEDENT$", "\n", "/", "$INDENT$", "\n"],
          expr.variants.map((x) => emitExpr(x, true))
        ),
        "$DEDENT$",
        "\n",
        "}"
      ];
    }
    return [
      "{",
      joinTrees(
        "/",
        expr.variants.map((x) => emitExpr(x, true))
      ),
      "}"
    ];
  }
  function emitArrayOfExprs(exprs) {
    return [
      "{",
      joinTrees(
        [],
        exprs.map((x) => emitExpr(x, true))
      ),
      "}"
    ];
  }
  function emitExpr(expr, asStatement = false, indent = false) {
    let res = emitExprWithoutAnnotation(expr, asStatement, indent);
    if (asStatement) {
      if (expr.kind !== "Block")
        res = [res, ";"];
    } else if (expr.type !== void 0) {
      res = [res, ":", toString(expr.type)];
    }
    return res;
  }
  function emitExprWithoutAnnotation(expr, asStatement = false, indent = false) {
    function emitSexpr(op, ...args) {
      const isNullary = ["argv", "argc", "true", "false"].includes(op);
      if (op === "@")
        op = expr.kind;
      op = op.split(/\.?(?=[A-Z])/).join("_").toLowerCase();
      const result = [];
      if (!asStatement && !isNullary)
        result.push("(");
      if (indent)
        result.push("$INDENT$", "\n");
      if (opAliases[op] !== void 0 && args.length === 2) {
        let a = args[0];
        result.push(typeof a === "string" || !("kind" in a) ? a : emitExpr(a));
        result.push(opAliases[op]);
        a = args[1];
        result.push(typeof a === "string" || !("kind" in a) ? a : emitExpr(a));
      } else {
        op = opAliases[op] ?? op;
        result.push(op);
        result.push(
          joinTrees(
            [],
            args.map(
              (x) => typeof x === "string" || !("kind" in x) ? [x] : emitExpr(x)
            )
          )
        );
      }
      if (!asStatement) {
        if (indent)
          result.push("$DEDENT$", "\n");
        if (!isNullary)
          result.push(")");
      }
      return result;
    }
    switch (expr.kind) {
      case "Block":
        return joinTrees(
          "\n",
          expr.children.map((x) => emitExpr(x, true))
        );
      case "Variants":
        return emitVariants(expr, indent);
      case "KeyValue":
        return emitSexpr("key_value", expr.key, expr.value);
      case "Function":
        return emitSexpr("func", ...expr.args, expr.expr);
      case "PolygolfOp":
        return emitSexpr(expr.op, ...expr.args);
      case "Assignment":
        return emitSexpr("assign", expr.variable, expr.expr);
      case "FunctionCall": {
        const id3 = emitExpr(expr.func);
        if (typeof id3 === "string" && id3.startsWith("$")) {
          return emitSexpr(id3, ...expr.args);
        }
        return emitSexpr("@", id3, ...expr.args);
      }
      case "Identifier":
        if (expr.builtin) {
          return emitSexpr("Builtin", text(expr.name));
        } else if (/^\w+$/.test(expr.name)) {
          return "$" + expr.name;
        }
        return emitSexpr("id", text(expr.name));
      case "TextLiteral":
        return emitTextLiteral(expr.value);
      case "IntegerLiteral":
        return expr.value.toString();
      case "ArrayConstructor":
        return emitSexpr("array", ...expr.exprs);
      case "ListConstructor":
        return emitSexpr("list", ...expr.exprs);
      case "SetConstructor":
        return emitSexpr("set", ...expr.exprs);
      case "TableConstructor":
        return emitSexpr("table", ...expr.kvPairs);
      case "ConditionalOp":
        return emitSexpr(
          expr.isSafe ? "conditional" : "unsafe_conditional",
          expr.condition,
          expr.consequent,
          expr.alternate
        );
      case "WhileLoop":
        return emitSexpr(
          "while",
          expr.condition,
          emitExpr(expr.body, false, true)
        );
      case "ForRange": {
        if (expr.inclusive) {
          return emitSexpr(
            "for_range_inclusive",
            expr.variable ?? id("_"),
            expr.start,
            expr.end,
            expr.increment,
            emitExpr(expr.body, false, true)
          );
        }
        let args = [];
        if (!isIntLiteral(expr.increment, 1n))
          args = [expr.increment, ...args];
        args = [expr.end, ...args];
        if (!isIntLiteral(expr.start, 0n) || args.length > 1)
          args = [expr.start, ...args];
        if (expr.variable !== void 0 || args.length > 1)
          args = [expr.variable ?? id("_"), ...args];
        return emitSexpr("for", ...args, emitExpr(expr.body, false, true));
      }
      case "ForArgv":
        return emitSexpr(
          "for_argv",
          expr.variable,
          expr.argcUpperBound.toString(),
          emitExpr(expr.body, false, true)
        );
      case "IfStatement":
        return emitSexpr(
          "if",
          expr.condition,
          emitExpr(expr.consequent, false, true),
          ...expr.alternate === void 0 ? [] : emitExpr(expr.alternate, false, true)
        );
      case "ImplicitConversion":
        return emitSexpr("@", text(expr.behavesLike), expr.expr);
      case "VarDeclaration":
        return emitSexpr("@", { ...expr.variable, type: expr.variableType });
      case "VarDeclarationWithAssignment":
        return emitSexpr("@", expr.assignment);
      case "VarDeclarationBlock":
        return emitSexpr("@", ...expr.children.map((x) => emitExpr(x)));
      case "ManyToManyAssignment":
        return emitSexpr(
          "@",
          emitArrayOfExprs(expr.variables),
          emitArrayOfExprs(expr.exprs)
        );
      case "OneToManyAssignment":
        return emitSexpr("@", variants([block(expr.variables)]), expr.expr);
      case "MutatingBinaryOp":
        return emitSexpr("@", text(expr.name), expr.variable, expr.right);
      case "IndexCall":
        return emitSexpr(
          expr.oneIndexed ? "IndexCallOneIndexed" : "@",
          expr.collection,
          expr.index
        );
      case "RangeIndexCall":
        return emitSexpr(
          expr.oneIndexed ? "RangeIndexCallOneIndexed" : "@",
          expr.collection,
          expr.low,
          expr.high,
          expr.step
        );
      case "MethodCall":
        return emitSexpr("@", expr.object, text(expr.ident.name), ...expr.args);
      case "PropertyCall":
        return emitSexpr("@", expr.object, text(expr.ident.name));
      case "BinaryOp":
        return emitSexpr("@", text(expr.name), expr.left, expr.right);
      case "UnaryOp":
        return emitSexpr("@", text(expr.name), expr.arg);
      case "ImportStatement":
        return emitSexpr(
          "@",
          ...[expr.name, ...expr.modules].map((x) => JSON.stringify(x))
        );
      case "ForDifferenceRange":
        return emitSexpr(
          "@",
          expr.variable,
          expr.start,
          expr.difference,
          expr.increment,
          emitExpr(expr.body, false, true)
        );
      case "ForEach":
        return emitSexpr(
          "@",
          expr.variable,
          expr.collection,
          emitExpr(expr.body, false, true)
        );
      case "ForEachKey":
        return emitSexpr(
          "@",
          expr.variable,
          expr.table,
          emitExpr(expr.body, false, true)
        );
      case "ForEachPair":
        return emitSexpr(
          "@",
          expr.keyVariable,
          expr.valueVariable,
          expr.table,
          emitExpr(expr.body, false, true)
        );
      case "ForCLike":
        return emitSexpr(
          "@",
          expr.init,
          expr.condition,
          expr.append,
          emitExpr(expr.body, false, true)
        );
      case "NamedArg":
        return emitSexpr("@", text(expr.name), expr.value);
    }
  }
  var opAliases = {
    add: "+",
    neg: "-",
    sub: "-",
    mul: "*",
    pow: "^",
    bit_and: "&",
    bit_or: "|",
    bit_xor: "~",
    bit_not: "~",
    bit_shift_left: "<<",
    bit_shift_right: ">>",
    eq: "==",
    neq: "!=",
    leq: "<=",
    lt: "<",
    geq: ">=",
    gt: ">",
    list_length: "#",
    concat: "..",
    assign: "<-",
    key_value: "=>",
    mod: "mod",
    div: "div"
  };

  // src/languages/polygolf/index.ts
  var blocksAsVariants = {
    name: "blocksAsVariants",
    visit(node, spine) {
      if (node.kind === "Block" && spine.parent !== null && spine.parent.node.kind !== "Variants" && spine.parent.node.kind !== "Program")
        return variants([node]);
    }
  };
  var polygolfLanguage = {
    name: "Polygolf",
    extension: "polygolf",
    emitter: emitProgram,
    phases: [required(blocksAsVariants)],
    detokenizer: defaultDetokenizer(
      (a, b) => a !== "(" && b !== ")" && b !== ";" && b !== ":" && a !== ":" && a !== "\n" && b !== "\n",
      2
    )
  };
  var polygolf_default = polygolfLanguage;

  // src/common/compile.ts
  function compilationResult(language, result, history = [], warnings = []) {
    return {
      language,
      result,
      history,
      warnings
    };
  }
  function applyAllToAllAndGetCounts(program2, context, ...visitors) {
    const counts = [];
    let result = program2;
    let c;
    for (const visitor of visitors) {
      [result, c] = applyToAllAndGetCount(result, context, visitor);
      counts.push(c);
    }
    return [result, counts];
  }
  function applyToAllAndGetCount(program2, context, visitor) {
    const result = programToSpine(program2).withReplacer((n, s) => {
      const repl = visitor(n, s, context);
      return repl === void 0 ? void 0 : copySource(n, copyTypeAnnotation(n, repl));
    }).node;
    return [result, program2 === result ? 0 : 1];
  }
  function* applyToOne(spine, context, visitor) {
    for (const altProgram of spine.compactMap((n, s) => {
      const ret = visitor(n, s, context);
      if (ret !== void 0) {
        return s.replacedWith(copySource(n, copyTypeAnnotation(n, ret)), true).root.node;
      }
    })) {
      yield altProgram;
    }
  }
  function emit(language, program2, context) {
    return (language.detokenizer ?? defaultDetokenizer())(
      language.emitter(program2, context)
    );
  }
  function isError2(x) {
    return x instanceof Error;
  }
  function compile(source, options, ...languages2) {
    const obj = getObjectiveFunc(options);
    let program2;
    try {
      program2 = parse(source, options.restrictFrontend);
    } catch (e) {
      if (isError2(e))
        return [compilationResult("Polygolf", e)];
    }
    program2 = program2;
    let variants2 = expandVariants(program2).map((x) => {
      try {
        if (options.skipTypecheck !== false)
          typecheck(x);
        return x;
      } catch (e) {
        if (isError2(e))
          return compilationResult("Polygolf", e);
        throw e;
      }
    });
    const errorlessVariants = variants2.filter((x) => "body" in x);
    if (errorlessVariants.length === 0) {
      if (options.getAllVariants === true) {
        return variants2;
      } else {
        return [variants2[0]];
      }
    }
    if (options.getAllVariants !== true) {
      variants2 = errorlessVariants;
    }
    const result = [];
    for (const language of languages2) {
      const outputs = variants2.map(
        (x) => "body" in x ? compileVariant(x, options, language) : { ...x }
      );
      if (options.getAllVariants === true) {
        result.push(...outputs);
      } else {
        const res = outputs.reduce(shorterBy(obj));
        if (isError2(res.result) && variants2.length > 1)
          res.result.message = "No variant could be compiled: " + res.result.message;
        result.push(res);
      }
    }
    return result;
  }
  function compileVariant(program2, options, language) {
    const obj = getObjectiveFunc(options);
    const bestUnpacked = compileVariantNoPacking(program2, options, language);
    const packers = language.packers ?? [];
    if (options.objective !== "chars" || packers.length < 1 || isError2(bestUnpacked.result))
      return bestUnpacked;
    function packer(code) {
      if (code === null)
        return null;
      if ([...code].map((x) => x.charCodeAt(0)).some((x) => x > 127))
        return null;
      return packers.map((x) => x(code)).reduce((a, b) => obj(a) < obj(b) ? a : b);
    }
    const bestForPacking = compileVariantNoPacking(
      program2,
      {
        ...options,
        objective: (x) => charLength(packer(x))
      },
      language
    );
    if (isError2(bestForPacking.result))
      return bestUnpacked;
    const packed = packer(bestForPacking.result);
    if (packed != null && obj(packed) < obj(bestUnpacked.result)) {
      return { ...bestForPacking, result: packed };
    }
    return bestUnpacked;
  }
  function compileVariantNoPacking(program2, options, language) {
    const phases = language.phases;
    if (options.level === "nogolf" || options.level === "simple") {
      try {
        const warnings = [];
        const addWarning2 = (x) => warnings.push(x);
        const plugins = phases.filter(
          options.level === "nogolf" ? (x) => x.mode === "required" : (x) => x.mode !== "search"
        ).flatMap((x) => x.plugins);
        const [res, counts] = applyAllToAllAndGetCounts(
          program2,
          { addWarning: addWarning2, options },
          ...plugins.map((x) => x.visit)
        );
        return compilationResult(
          language.name,
          emit(language, res, { addWarning: addWarning2, options }),
          plugins.map((y, i) => [counts[i], y.name]),
          warnings
        );
      } catch (e) {
        if (isError2(e)) {
          return compilationResult(language.name, e);
        }
        throw e;
      }
    }
    const obj = getObjectiveFunc(options);
    function finish(prog, addWarning2, startPhase = 0) {
      const finishingPlugins = phases.slice(startPhase).filter((x) => x.mode !== "search").flatMap((x) => x.plugins);
      const [resProg, counts] = applyAllToAllAndGetCounts(
        prog,
        { addWarning: addWarning2, options },
        ...finishingPlugins.map((x) => x.visit)
      );
      return [
        emit(language, resProg, { addWarning: addWarning2, options }),
        finishingPlugins.map((x, i) => [counts[i], x.name])
      ];
    }
    let shortestSoFar;
    let lastError;
    let shortestSoFarLength = Infinity;
    const latestPhaseWeSawTheProg = /* @__PURE__ */ new Map();
    const queue = new import_priority_queue.MinPriorityQueue((x) => x.length);
    const globalWarnings = [];
    function enqueue(program3, startPhase, history, warnings) {
      if (startPhase >= language.phases.length)
        return;
      if (latestPhaseWeSawTheProg.size > 200)
        return;
      const stringified = stringify(program3);
      const latestSeen = latestPhaseWeSawTheProg.get(stringified);
      if (latestSeen === void 0 || latestSeen < startPhase) {
        let addWarning3 = function(x, isGlobal) {
          (isGlobal ? globalWarnings : warnings).push(x);
        };
        var addWarning2 = addWarning3;
        latestPhaseWeSawTheProg.set(stringified, startPhase);
        try {
          const length = obj(finish(program3, addWarning3, startPhase)[0]);
          const state = { program: program3, startPhase, length, history, warnings };
          if (length < shortestSoFarLength) {
            shortestSoFarLength = length;
            shortestSoFar = state;
          }
          queue.enqueue(state);
        } catch (e) {
          if (isError2(e)) {
            lastError = e;
          }
        }
      }
    }
    enqueue(program2, 0, [], []);
    while (!queue.isEmpty()) {
      let addWarning2 = function(x, isGlobal) {
        (isGlobal ? globalWarnings : warnings).push(x);
      };
      var addWarning = addWarning2;
      const state = queue.dequeue();
      const phase = language.phases[state.startPhase];
      const warnings = [...state.warnings];
      if (phase.mode !== "search") {
        const [res, counts] = applyAllToAllAndGetCounts(
          state.program,
          { addWarning: addWarning2, options },
          ...phase.plugins.map((x) => x.visit)
        );
        enqueue(
          res,
          state.startPhase + 1,
          [
            ...state.history,
            ...phase.plugins.map(
              (x, i) => [counts[i], x.name]
            )
          ],
          warnings
        );
      } else {
        enqueue(state.program, state.startPhase + 1, state.history, warnings);
        const spine = programToSpine(state.program);
        for (const plugin of phase.plugins) {
          for (const altProgram of applyToOne(
            spine,
            { addWarning: addWarning2, options },
            plugin.visit
          )) {
            enqueue(
              altProgram,
              state.startPhase,
              [...state.history, [1, plugin.name]],
              warnings
            );
          }
        }
      }
    }
    if (shortestSoFar === void 0) {
      return compilationResult(language.name, lastError);
    }
    globalWarnings.push(...shortestSoFar.warnings);
    const [result, finishingHist] = finish(
      shortestSoFar.program,
      (x) => {
        globalWarnings.push(x);
      },
      shortestSoFar.startPhase
    );
    return compilationResult(
      language.name,
      result,
      mergeRepeatedPlugins([...shortestSoFar.history, ...finishingHist]),
      globalWarnings
    );
  }
  function mergeRepeatedPlugins(history) {
    const result = [];
    for (const [c, name] of history) {
      if (name === result.at(-1)?.[1]) {
        result[result.length - 1][0] += c;
      } else {
        result.push([c, name]);
      }
    }
    return result;
  }
  function copyTypeAnnotation(from, to) {
    return to.kind !== "Program" && from.kind !== "Program" && from.type !== void 0 ? { ...to, type: from.type } : to;
  }
  function copySource(from, to) {
    return { ...to, source: from.source };
  }
  function typecheck(program2) {
    const spine = programToSpine(program2);
    spine.everyNode((x) => {
      if (x.kind !== "Program")
        getType(x, program2);
      return true;
    });
  }

  // src/plugins/loops.ts
  function forRangeToForRangeInclusive(skip1Step = false) {
    return {
      name: `forRangeToForRangeInclusive(${skip1Step ? "true" : "false"})`,
      visit(node) {
        if (node.kind === "ForRange" && !node.inclusive && (!skip1Step || !isIntLiteral(node.increment, 1n)))
          return forRange(
            node.variable,
            node.start,
            sub1(node.end),
            node.increment,
            node.body,
            true
          );
      }
    };
  }
  function forRangeToForEach(...ops) {
    if (ops.includes("text_get_byte") && ops.includes("text_get_codepoint"))
      throw new Error(
        "Programming error. Choose only one of 'text_get_byte' && 'text_get_codepoint'."
      );
    const lengthOpToGetOp = /* @__PURE__ */ new Map([
      ["array_length", "array_get"],
      ["list_length", "list_get"],
      ["text_byte_length", "text_get_byte"],
      ["array_length", "text_get_codepoint"]
    ]);
    return {
      name: "forRangeToForEach",
      visit(node, spine) {
        if (node.kind === "ForRange" && node.variable !== void 0 && !node.inclusive && isIntLiteral(node.start, 0n) && (isPolygolfOp(node.end) && ops.includes(lengthOpToGetOp.get(node.end.op)) && node.end.args[0].kind === "Identifier" || isIntLiteral(node.end))) {
          const indexVar = node.variable;
          const bodySpine = spine.getChild("body");
          const knownLength = isIntLiteral(node.end) ? Number(node.end.value) : void 0;
          const allowedOps = isIntLiteral(node.end) ? ops : [lengthOpToGetOp.get(node.end.op)];
          const collectionVar = isIntLiteral(node.end) ? void 0 : node.end.args[0];
          const indexedCollection = getIndexedCollection(
            bodySpine,
            indexVar,
            allowedOps,
            knownLength,
            collectionVar
          );
          if (indexedCollection !== null) {
            const elementIdentifier = id(node.variable.name + "+each");
            const newBody = bodySpine.withReplacer((n) => {
              if (isPolygolfOp(n) && n.args[0] === indexedCollection && n.args[1].kind === "Identifier" && !n.args[1].builtin && n.args[1].name === indexVar.name)
                return elementIdentifier;
            }).node;
            return forEach(elementIdentifier, indexedCollection, newBody);
          }
        }
      }
    };
  }
  function getIndexedCollection(spine, indexVar, allowedOps, knownLength, collectionVar) {
    let result = null;
    for (const x of spine.compactMap((n, s) => {
      const parent = s.parent.node;
      if (n.kind !== "Identifier" || n.builtin || n.name !== indexVar.name)
        return void 0;
      if (!isPolygolfOp(parent, ...allowedOps))
        return null;
      const collection = parent.args[0];
      if ((isTextLiteral(collection) || collection.kind === "ListConstructor") && literalLength(collection, allowedOps.includes("text_get_byte")) === knownLength)
        return collection;
      if (collectionVar !== void 0 && collection.kind === "Identifier" && collection.name === collectionVar.name && !collection.builtin)
        return collection;
      const collectionType = getType(collection, s.root.node);
      if (collectionType.kind === "Array" && collectionType.length === knownLength)
        return collection;
      return null;
    })) {
      if (x === null || result != null)
        return null;
      if (result === null)
        result = x;
    }
    return result;
  }
  function literalLength(expr, countTextBytes) {
    if (expr.kind === "ListConstructor")
      return expr.exprs.length;
    return (countTextBytes ? byteLength : charLength)(expr.value);
  }
  var forArgvToForEach = {
    name: "forArgvToForEach",
    visit(node) {
      if (node.kind === "ForArgv") {
        return forEach(node.variable, polygolfOp("argv"), node.body);
      }
    }
  };
  function forArgvToForRange(overshoot = true) {
    return {
      name: `forArgvToForRange(${overshoot ? "" : "false"})`,
      visit(node) {
        if (node.kind === "ForArgv") {
          const indexVar = id(node.variable.name + "+index");
          const newBody = block([
            assignment(node.variable, polygolfOp("argv_get", indexVar)),
            node.body
          ]);
          return forRange(
            indexVar,
            int(0),
            overshoot ? int(node.argcUpperBound) : polygolfOp("argc"),
            int(1),
            newBody
          );
        }
      }
    };
  }
  var shiftRangeOneUp = {
    name: "shiftRangeOneUp",
    visit(node, spine) {
      if (node.kind === "ForRange" && isIntLiteral(node.increment, 1n)) {
        const bodySpine = new Spine2(node.body, spine, "body");
        const newVar = node.variable === void 0 ? void 0 : id(node.variable.name + "+shift");
        const newBodySpine = bodySpine.withReplacer(
          (x) => newVar !== void 0 && isIdent(x, node.variable) ? sub1(newVar) : void 0
        );
        return forRange(
          newVar,
          add1(node.start),
          add1(node.end),
          int(1n),
          newBodySpine.node,
          node.inclusive
        );
      }
    }
  };
  function isIdent(node, ident) {
    return node.kind === "Identifier" && node.name === ident.name && node.builtin === ident.builtin;
  }
  function forRangeToForDifferenceRange(transformPredicate = () => true) {
    return {
      name: "forRangeToForDifferenceRange",
      visit(node, spine) {
        if (node.kind === "ForRange" && node.variable !== void 0 && transformPredicate(node, spine)) {
          return forDifferenceRange(
            node.variable,
            node.start,
            polygolfOp("sub", node.end, node.start),
            node.increment,
            node.body,
            node.inclusive
          );
        }
      }
    };
  }
  var forRangeToForRangeOneStep = {
    name: "forRangeToForRangeOneStep",
    visit(node, spine) {
      if (node.kind === "ForRange" && node.variable !== void 0 && isSubtype(getType(node.increment, spine.root.node), integerType(2n))) {
        const newVar = id(node.variable.name + "+1step");
        return forRange(
          newVar,
          int(0n),
          node.inclusive ? polygolfOp(
            "div",
            polygolfOp("sub", node.end, node.start),
            node.increment
          ) : add1(
            polygolfOp(
              "div",
              polygolfOp("sub", sub1(node.end), node.start),
              node.increment
            )
          ),
          int(1n),
          block([
            assignment(
              node.variable,
              polygolfOp(
                "add",
                polygolfOp("mul", newVar, node.increment),
                node.start
              )
            ),
            node.body
          ]),
          node.inclusive
        );
      }
    }
  };
  var removeUnusedForVar = {
    name: "removeUnusedForVar",
    visit(node, spine) {
      if (node.kind === "ForRange" && node.variable !== void 0) {
        const variable2 = node.variable;
        if (spine.everyNode((x) => x === variable2 || !isIdent(x, variable2))) {
          return forRange(
            void 0,
            node.start,
            node.end,
            node.increment,
            node.body,
            node.inclusive
          );
        }
      }
    }
  };

  // src/languages/lua/emit.ts
  function precedence(expr) {
    switch (expr.kind) {
      case "UnaryOp":
        return 11;
      case "BinaryOp":
        return binaryPrecedence(expr.name);
      case "TextLiteral":
      case "ArrayConstructor":
      case "TableConstructor":
        return 1e3;
    }
    return Infinity;
  }
  function binaryPrecedence(opname) {
    switch (opname) {
      case "^":
        return 12;
      case "*":
      case "//":
      case "%":
        return 10;
      case "+":
      case "-":
        return 9;
      case "..":
        return 8;
      case "<<":
      case ">>":
        return 7;
      case "&":
        return 6;
      case "~":
        return 5;
      case "|":
        return 4;
      case "<":
      case "<=":
      case "==":
      case "~=":
      case ">=":
      case ">":
        return 3;
      case "and":
        return 2;
      case "or":
        return 1;
    }
    throw new Error(
      `Programming error - unknown Lua binary operator '${opname}.'`
    );
  }
  function emitProgram2(program2) {
    return emit2(program2.body);
  }
  function joinExprs(delim, exprs, minPrec = -Infinity) {
    return joinTrees(
      delim,
      exprs.map((x) => emit2(x, minPrec))
    );
  }
  function emit2(expr, minimumPrec = -Infinity) {
    const prec = precedence(expr);
    function emitNoParens(e) {
      switch (e.kind) {
        case "Block":
          return joinExprs("\n", e.children);
        case "WhileLoop":
          return [`while`, emit2(e.condition), "do", emit2(e.body), "end"];
        case "OneToManyAssignment":
          return [joinExprs(",", e.variables), "=", emit2(e.expr)];
        case "ManyToManyAssignment":
          return [joinExprs(",", e.variables), "=", joinExprs(",", e.exprs)];
        case "ForRange": {
          if (!e.inclusive)
            throw new EmitError(e, "exclusive");
          return [
            "for",
            e.variable === void 0 ? "_" : emit2(e.variable),
            "=",
            emit2(e.start),
            ",",
            emit2(e.end),
            isIntLiteral(e.increment, 1n) ? [] : [",", emit2(e.increment)],
            "do",
            emit2(e.body),
            "end"
          ];
        }
        case "IfStatement":
          return [
            "if",
            emit2(e.condition),
            "then",
            emit2(e.consequent),
            e.alternate !== void 0 ? ["else", emit2(e.alternate)] : [],
            "end"
          ];
        case "Variants":
        case "ForEach":
        case "ForEachKey":
        case "ForEachPair":
        case "ForCLike":
          throw new EmitError(e);
        case "Assignment":
          return [emit2(e.variable), "=", emit2(e.expr)];
        case "Identifier":
          return [e.name];
        case "TextLiteral":
          return emitTextLiteral(e.value, [
            [
              `"`,
              [
                [`\\`, `\\\\`],
                [`
`, `\\n`],
                [`\r`, `\\r`],
                [`"`, `\\"`]
              ]
            ],
            [
              `'`,
              [
                [`\\`, `\\\\`],
                [`
`, `\\n`],
                [`\r`, `\\r`],
                [`'`, `\\'`]
              ]
            ],
            [
              [`[[`, `]]`],
              [
                [`[[`, null],
                [`]]`, null]
              ]
            ]
          ]);
        case "IntegerLiteral":
          return [e.value.toString()];
        case "FunctionCall":
          return [emit2(e.func), "(", joinExprs(",", e.args), ")"];
        case "MethodCall":
          return [
            emit2(e.object, Infinity),
            ":",
            emit2(e.ident),
            "(",
            joinExprs(",", e.args),
            ")"
          ];
        case "BinaryOp": {
          const rightAssoc = e.name === "^";
          return [
            emit2(e.left, prec + (rightAssoc ? 1 : 0)),
            e.name,
            emit2(e.right, prec + (rightAssoc ? 0 : 1))
          ];
        }
        case "UnaryOp":
          return [e.name, emit2(e.arg, prec)];
        case "IndexCall":
          if (!e.oneIndexed)
            throw new EmitError(e, "zero indexed");
          return [emit2(e.collection, Infinity), "[", emit2(e.index), "]"];
        case "ListConstructor":
        case "ArrayConstructor":
          return ["{", joinExprs(",", e.exprs), "}"];
        default:
          throw new EmitError(e);
      }
    }
    const inner = emitNoParens(expr);
    if (prec >= minimumPrec)
      return inner;
    return ["(", inner, ")"];
  }

  // src/plugins/ops.ts
  function mapOps(...opMap0) {
    const opMap = toOpMap(opMap0);
    return {
      name: "mapOps(...)",
      visit(node, spine) {
        if (isPolygolfOp(node)) {
          const op = node.op;
          const f = opMap.get(op);
          if (f !== void 0) {
            let replacement = typeof f === "function" ? f(node.args, spine) : f;
            if (replacement === void 0)
              return void 0;
            if ("op" in replacement && replacement.kind !== "PolygolfOp") {
              replacement = {
                ...replacement,
                op: node.op
              };
            }
            return { ...replacement, type: getType(node, spine) };
          }
        }
      }
    };
  }
  function toOpMap(opMap0) {
    const res = new Map(opMap0);
    for (const [a, b] of [
      ["unsafe_and", "and"],
      ["unsafe_or", "or"]
    ]) {
      if (!res.has(a) && res.has(b)) {
        res.set(a, res.get(b));
      }
    }
    return res;
  }
  function mapToUnaryAndBinaryOps(...opMap0) {
    const opMap = toOpMap(opMap0);
    return {
      ...mapOps(
        ...opMap0.map(
          ([op, name]) => [
            op,
            isBinary(op) ? (x) => asBinaryChain(op, x, opMap) : (x) => unaryOp(name, x[0])
          ]
        )
      ),
      name: `mapToUnaryAndBinaryOps(${JSON.stringify(opMap0)})`
    };
  }
  function asBinaryChain(op, exprs, names) {
    const negName = names.get("neg");
    if (op === "mul" && isIntLiteral(exprs[0], -1n) && negName !== void 0) {
      exprs = [unaryOp(negName, exprs[1]), ...exprs.slice(2)];
    }
    if (op === "add") {
      exprs = exprs.filter((x) => !isNegative(x)).concat(exprs.filter(isNegative));
    }
    let result = exprs[0];
    for (const expr of exprs.slice(1)) {
      const subName = names.get("sub");
      if (op === "add" && isNegative(expr) && subName !== void 0) {
        result = binaryOp(subName, result, polygolfOp("neg", expr));
      } else {
        result = binaryOp(names.get(op) ?? "?", result, expr);
      }
    }
    return result;
  }
  function useIndexCalls(oneIndexed = false, ops = [
    "array_get",
    "list_get",
    "table_get",
    "array_set",
    "list_set",
    "table_set"
  ]) {
    return {
      name: `useIndexCalls(${JSON.stringify(oneIndexed)}, ${JSON.stringify(
        ops
      )})`,
      visit(node) {
        if (isPolygolfOp(node, ...ops) && (node.args[0].kind === "Identifier" || node.op.endsWith("_get"))) {
          let indexNode;
          if (oneIndexed && !node.op.startsWith("table_")) {
            indexNode = indexCall(node.args[0], add1(node.args[1]), true);
          } else {
            indexNode = indexCall(node.args[0], node.args[1]);
          }
          if (node.op.endsWith("_get")) {
            return indexNode;
          } else if (node.op.endsWith("_set")) {
            return assignment(indexNode, node.args[2]);
          }
        }
      }
    };
  }
  function addMutatingBinaryOp(...opMap0) {
    const opMap = toOpMap(opMap0);
    return {
      name: `addMutatingBinaryOp(${JSON.stringify(opMap0)})`,
      visit(node) {
        if (node.kind === "Assignment" && isPolygolfOp(node.expr, ...BinaryOpCodes) && node.expr.args.length > 1 && opMap.has(node.expr.op)) {
          const op = node.expr.op;
          const args = node.expr.args;
          const name = opMap.get(op);
          const leftValueStringified = stringify(node.variable);
          const index = node.expr.args.findIndex(
            (x) => stringify(x) === leftValueStringified
          );
          if (index === 0 || index > 0 && isCommutative(op)) {
            const newArgs = args.filter((x, i) => i !== index);
            if (op === "add" && opMap.has("sub") && newArgs.every(isNegative)) {
              return mutatingBinaryOp(
                opMap.get("sub"),
                node.variable,
                polygolfOp("neg", polygolfOp(op, ...newArgs))
              );
            }
            return mutatingBinaryOp(
              name,
              node.variable,
              newArgs.length > 1 ? polygolfOp(op, ...newArgs) : newArgs[0]
            );
          }
        }
      }
    };
  }
  var flipBinaryOps = {
    name: "flipBinaryOps",
    visit(node) {
      if (isPolygolfOp(node, ...BinaryOpCodes)) {
        const flippedOpCode = flipOpCode(node.op);
        if (flippedOpCode !== null) {
          return polygolfOp(flippedOpCode, node.args[1], node.args[0]);
        }
      }
    }
  };
  var removeImplicitConversions = {
    name: "removeImplicitConversions",
    visit(node) {
      if (node.kind === "ImplicitConversion") {
        return node.expr;
      }
    }
  };
  var methodsAsFunctions = {
    name: "methodsAsFunctions",
    visit(node) {
      if (node.kind === "MethodCall") {
        return functionCall(propertyCall(node.object, node.ident), node.args);
      }
    }
  };
  var printIntToPrint = {
    ...mapOps(
      ["print_int", (x) => polygolfOp("print", polygolfOp("int_to_text", ...x))],
      [
        "println_int",
        (x) => polygolfOp("println", polygolfOp("int_to_text", ...x))
      ]
    ),
    name: "printIntToPrint"
  };

  // src/plugins/idents.ts
  function getIdentMap(spine, identGen) {
    const inputNames = [...getDeclaredIdentifiers(spine.node)];
    const outputNames = /* @__PURE__ */ new Set();
    const result = /* @__PURE__ */ new Map();
    for (const iv of inputNames) {
      for (const preferred of identGen.preferred(iv)) {
        if (!outputNames.has(preferred)) {
          outputNames.add(preferred);
          result.set(iv, preferred);
          break;
        }
      }
    }
    const shortNames = identGen.short;
    for (const iv of inputNames) {
      if (!result.has(iv)) {
        for (const short of shortNames) {
          if (!outputNames.has(short)) {
            outputNames.add(short);
            result.set(iv, short);
            break;
          }
        }
      }
    }
    let i = 0;
    for (const iv of inputNames) {
      if (!result.has(iv)) {
        while (true) {
          const general = identGen.general(i++);
          if (!outputNames.has(general)) {
            outputNames.add(general);
            result.set(iv, general);
            break;
          }
        }
      }
    }
    return result;
  }
  function renameIdents(identGen = defaultIdentGen) {
    return {
      name: "renameIdents(...)",
      visit(program2, spine) {
        if (program2.kind !== "Program")
          return;
        const identMap = getIdentMap(spine.root, identGen);
        return spine.withReplacer((node) => {
          if (node.kind === "Identifier" && !node.builtin) {
            const outputName = identMap.get(node.name);
            if (outputName === void 0)
              throw new Error("Programming error. Incomplete identMap.");
            return id(outputName);
          }
        }).node;
      }
    };
  }
  var defaultIdentGen = {
    preferred(original) {
      const firstLetter = [...original].find((x) => /[A-Za-z]/.test(x));
      if (firstLetter === void 0)
        return [];
      const lower = firstLetter.toLowerCase();
      const upper = firstLetter.toUpperCase();
      return [firstLetter, firstLetter === lower ? upper : lower];
    },
    short: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
    general: (i) => "v" + i.toString()
  };
  function alias(getExprKey, save = [1, 3]) {
    const aliasingSave = typeof save === "function" ? save : (key, freq) => (key.length - save[0]) * (freq - 1) - save[0] - save[1];
    const getKey = (node, spine) => node.kind === "Program" ? void 0 : getExprKey(node, spine);
    return {
      name: "alias(...)",
      visit(prog, spine) {
        if (prog.kind !== "Program")
          return;
        const timesUsed = /* @__PURE__ */ new Map();
        for (const key of spine.compactMap(getKey)) {
          timesUsed.set(key, (timesUsed.get(key) ?? 0) + 1);
        }
        const assignments = [];
        const replacedDeep = spine.withReplacer((node) => {
          const key = getKey(node, spine);
          if (key !== void 0 && aliasingSave(key, timesUsed.get(key)) > 0) {
            const alias2 = id(key + "+alias");
            if (assignments.every((x) => x.variable.name !== alias2.name))
              assignments.push(assignment(alias2, node));
            return alias2;
          }
        }).node;
        return program(block([...assignments, replacedDeep.body]));
      }
    };
  }

  // src/plugins/block.ts
  function blockChildrenCollectAndReplace(name, collectPredicate, transform, blockPredicate = () => true, transformPredicate = (exprs) => exprs.length > 1) {
    return {
      name,
      visit(node, spine) {
        if (node.kind === "Block" && blockPredicate(node, spine)) {
          const newNodes = [];
          let changed = false;
          let collected = [];
          for (const childSpine of spine.getChildSpines()) {
            const expr = childSpine.node;
            if (collectPredicate(expr, childSpine, collected)) {
              collected.push(expr);
            } else if (collectPredicate(expr, childSpine, [])) {
              if (transformPredicate(collected)) {
                newNodes.push(...transform(collected));
                changed = true;
              } else {
                newNodes.push(...collected);
              }
              collected = [expr];
            } else {
              if (transformPredicate(collected)) {
                newNodes.push(...transform(collected));
                changed = true;
              } else {
                newNodes.push(...collected);
              }
              collected = [];
              newNodes.push(expr);
            }
          }
          if (transformPredicate(collected)) {
            newNodes.push(...transform(collected));
            changed = true;
          } else {
            newNodes.push(...collected);
          }
          if (changed)
            return block(newNodes);
        }
      }
    };
  }
  var declared = /* @__PURE__ */ new Set();
  var addVarDeclarations = {
    name: "addVarDeclarations",
    visit(node) {
      if (node.kind === "Program")
        declared.clear();
      else if (node.kind === "Assignment") {
        if (node.variable.kind === "Identifier" && !declared.has(node.variable.name)) {
          declared.add(node.variable.name);
          return varDeclarationWithAssignment(node);
        }
      }
    }
  };
  function addOneToManyAssignments(blockPredicate = () => true) {
    return blockChildrenCollectAndReplace(
      "addOneToManyAssignments",
      (expr, spine, previous) => isAssignmentToIdentifier(expr) && previous.every((x) => x.variable.name !== expr.variable.name) && (previous.length < 1 || stringify(expr.expr) === stringify(previous[0].expr)),
      (exprs) => [
        oneToManyAssignment(
          exprs.map((x) => x.variable),
          exprs[0].expr
        )
      ],
      blockPredicate
    );
  }
  function addVarDeclarationOneToManyAssignments(blockPredicate = () => true) {
    return blockChildrenCollectAndReplace(
      "addVarDeclarationOneToManyAssignments",
      (expr, spine, previous) => expr.kind === "VarDeclarationWithAssignment" && isAssignmentToIdentifier(expr.assignment) && (previous.length < 1 || stringify(expr.assignment.expr) === stringify(previous[0].assignment.expr)),
      (exprs) => [
        varDeclarationWithAssignment(
          oneToManyAssignment(
            exprs.map((x) => x.assignment.variable),
            exprs[0].assignment.expr
          )
        )
      ],
      blockPredicate
    );
  }
  function referencesVariable(spine, variable2) {
    return spine.someNode(
      (x) => x.kind === "Identifier" && !x.builtin && x.name === variable2.name
    );
  }
  function isAssignment(x) {
    return x.kind === "Assignment";
  }
  function isAssignmentToIdentifier(x) {
    return isAssignment(x) && x.variable.kind === "Identifier";
  }
  function addManyToManyAssignments(blockPredicate = () => true) {
    return blockChildrenCollectAndReplace(
      "addManyToManyAssignments",
      (expr, spine, previous) => isAssignmentToIdentifier(expr) && !previous.some((x) => referencesVariable(spine, x.variable)),
      (exprs) => [
        manyToManyAssignment(
          exprs.map((x) => x.variable),
          exprs.map((x) => x.expr)
        )
      ],
      blockPredicate
    );
  }
  function addVarDeclarationManyToManyAssignments(blockPredicate = () => true) {
    return blockChildrenCollectAndReplace(
      "addVarDeclarationManyToManyAssignments",
      (expr, spine, previous) => expr.kind === "VarDeclarationWithAssignment" && isAssignmentToIdentifier(expr.assignment) && !previous.some((x) => referencesVariable(spine, x.assignment.variable)),
      (exprs) => [
        varDeclarationWithAssignment(
          manyToManyAssignment(
            exprs.map((x) => x.assignment.variable),
            exprs.map((x) => x.assignment.expr)
          )
        )
      ],
      blockPredicate
    );
  }
  function groupVarDeclarations(blockPredicate = () => true, transformPredicate = (collected) => collected.length > 1) {
    return blockChildrenCollectAndReplace(
      "groupVarDeclarations",
      (expr) => expr.kind === "VarDeclaration" || expr.kind === "VarDeclarationWithAssignment",
      (exprs) => [varDeclarationBlock(exprs)],
      blockPredicate,
      transformPredicate
    );
  }
  var noStandaloneVarDeclarations = {
    name: "noStandaloneVarDeclarations",
    visit(node, spine) {
      if ((node.kind === "VarDeclaration" || node.kind === "VarDeclarationWithAssignment") && spine.parent?.node.kind !== "VarDeclarationBlock") {
        return varDeclarationBlock([node]);
      }
    }
  };
  var tempVarToMultipleAssignment = {
    name: "tempVarToMultipleAssignment",
    visit(node) {
      if (node.kind === "Block") {
        const newNodes = [];
        let changed = false;
        for (let i = 0; i < node.children.length; i++) {
          const a = node.children[i];
          if (i >= node.children.length - 2) {
            newNodes.push(a);
            continue;
          }
          const b = node.children[i + 1];
          const c = node.children[i + 2];
          if (a.kind === "Assignment" && b.kind === "Assignment" && c.kind === "Assignment" && b.expr.kind === "Identifier" && c.variable.kind === "Identifier" && b.expr.name === c.variable.name && c.expr.kind === "Identifier" && a.variable.kind === "Identifier" && c.expr.name === a.variable.name) {
            newNodes.push(
              manyToManyAssignment([b.variable, c.variable], [b.expr, a.expr])
            );
            changed = true;
            i += 2;
          } else {
            newNodes.push(a);
          }
        }
        if (changed)
          return block(newNodes);
      }
    }
  };

  // src/plugins/print.ts
  var printLnToPrint = mapOps([
    "println",
    (x) => polygolfOp("print", polygolfOp("concat", x[0], text("\n")))
  ]);
  function golfLastPrint(toPrintln = true) {
    return {
      name: "golfLastPrint",
      visit(program2) {
        if (program2.kind !== "Program")
          return;
        const newOp = toPrintln ? "println" : "print";
        const oldOp = toPrintln ? "print" : "println";
        if (isPolygolfOp(program2.body, oldOp)) {
          return { ...program2, body: { ...program2.body, op: newOp } };
        } else if (program2.body.kind === "Block") {
          const oldChildren = program2.body.children;
          const lastStatement = oldChildren[oldChildren.length - 1];
          if (isPolygolfOp(lastStatement, oldOp)) {
            const newLastStatement = { ...lastStatement, op: newOp };
            const children = replaceAtIndex(
              oldChildren,
              oldChildren.length - 1,
              newLastStatement
            );
            return { ...program2, body: { ...program2.body, children } };
          }
        }
      }
    };
  }
  var implicitlyConvertPrintArg = {
    name: "implicitlyConvertPrintArg",
    visit(node, spine) {
      if (isPolygolfOp(node, "int_to_text") && isPolygolfOp(spine.parent.node, "print", "println")) {
        return implicitConversion(node.op, node.args[0]);
      }
    }
  };

  // src/plugins/textOps.ts
  function toBidirectionalMap(pairs) {
    return new Map([...pairs, ...pairs.map(([k, v]) => [v, k])]);
  }
  var textOpsEquivalenceAscii = toBidirectionalMap([
    ["text_codepoint_find", "text_byte_find"],
    ["text_get_codepoint", "text_get_byte"],
    ["text_get_codepoint_to_int", "text_get_byte_to_int"],
    ["text_codepoint_length", "text_byte_length"],
    ["text_codepoint_reversed", "text_byte_reversed"],
    ["text_get_codepoint_slice", "text_get_byte_slice"],
    ["codepoint_to_int", "text_byte_to_int"]
  ]);
  var integerOpsEquivalenceAscii = toBidirectionalMap([
    ["int_to_text_byte", "int_to_codepoint"]
  ]);
  function useEquivalentTextOp(useBytes = true, useCodepoints = true) {
    if (!useBytes && !useCodepoints)
      throw new Error(
        "Programming error. Choose at least one of bytes and codepoints."
      );
    return {
      name: `useEquivalentTextOp(${useBytes.toString()}, ${useCodepoints.toString()})`,
      visit(node, spine) {
        if (!isPolygolfOp(node))
          return;
        if (node.args.length < 1)
          return;
        const typeArg0 = getType(node.args[0], spine);
        if (!useBytes && node.op.includes("codepoint") || !useCodepoints && node.op.includes("byte"))
          return;
        if (typeArg0.kind === "text" && typeArg0.isAscii) {
          const alternative = textOpsEquivalenceAscii.get(node.op);
          if (alternative !== void 0)
            return { ...node, op: alternative };
        }
        if (isSubtype(typeArg0, integerType(0, 127))) {
          const alternative = integerOpsEquivalenceAscii.get(node.op);
          if (alternative !== void 0)
            return { ...node, op: alternative };
        }
      }
    };
  }
  var textGetToIntToTextGet = {
    ...mapOps(
      [
        "text_get_byte_to_int",
        (x) => polygolfOp("text_byte_to_int", polygolfOp("text_get_byte", ...x))
      ],
      [
        "text_get_codepoint_to_int",
        (x) => polygolfOp("codepoint_to_int", polygolfOp("text_get_codepoint", ...x))
      ]
    ),
    name: "textGetToIntToTextGet"
  };
  var textToIntToTextGetToInt = {
    ...mapOps(
      [
        "text_byte_to_int",
        (x) => isPolygolfOp(x[0], "text_get_byte") ? polygolfOp("text_get_byte_to_int", ...x[0].args) : void 0
      ],
      [
        "codepoint_to_int",
        (x) => isPolygolfOp(x[0], "text_get_codepoint") ? polygolfOp("text_get_codepoint_to_int", ...x[0].args) : void 0
      ]
    ),
    name: "textToIntToTextGetToInt"
  };
  var textGetToTextGetToIntToText = {
    ...mapOps(
      [
        "text_get_byte",
        (x) => polygolfOp(
          "int_to_text_byte",
          polygolfOp("text_get_byte_to_int", ...x)
        )
      ],
      [
        "text_get_codepoint",
        (x) => polygolfOp(
          "int_to_codepoint",
          polygolfOp("text_get_codepoint_to_int", ...x)
        )
      ]
    ),
    name: "textGetToTextGetToIntToText"
  };
  var textToIntToFirstIndexTextGetToInt = {
    ...mapOps(
      [
        "text_byte_to_int",
        (x) => polygolfOp("text_get_byte_to_int", x[0], int(0n))
      ],
      [
        "codepoint_to_int",
        (x) => polygolfOp("text_get_codepoint_to_int", x[0], int(0n))
      ]
    ),
    name: "textToIntToFirstIndexTextGetToInt"
  };
  function useMultireplace(singleCharInputsOnly = false) {
    return {
      name: "useMultireplace",
      visit(node) {
        if (isPolygolfOp(node, "text_replace", "text_multireplace") && isPolygolfOp(node.args[0], "text_replace", "text_multireplace")) {
          const a = node.args[0].args.slice(1);
          const b = node.args.slice(1);
          if (a.every((x) => isTextLiteral(x)) && b.every((x) => isTextLiteral(x))) {
            const aValues = a.map((x) => x.value);
            const bValues = b.map((x) => x.value);
            const aIn = aValues.filter((_, i) => i % 2 === 0);
            const aOut = aValues.filter((_, i) => i % 2 === 1);
            const bIn = bValues.filter((_, i) => i % 2 === 0);
            const bOut = bValues.filter((_, i) => i % 2 === 1);
            const aInSet = new Set(aIn.join());
            const aOutSet = new Set(aOut.join());
            const bInSet = new Set(bIn.join());
            const bOutSet = new Set(bOut.join());
            if ((!singleCharInputsOnly || [...aIn, ...bIn].every((x) => charLength(x) === 1)) && ![...aInSet].some((x) => bInSet.has(x)) && ![...bInSet].some((x) => aOutSet.has(x)) && ![...aInSet].some((x) => bOutSet.has(x))) {
              return polygolfOp("text_multireplace", ...node.args[0].args, ...b);
            }
          }
        }
      }
    };
  }
  var replaceToSplitAndJoin = {
    ...mapOps([
      "text_replace",
      ([x, y, z]) => polygolfOp("join", polygolfOp("text_split", x, y), z)
    ]),
    name: "replaceToSplitAndJoin"
  };

  // src/plugins/types.ts
  var assertInt64 = {
    name: "assertInt64",
    visit(node, spine) {
      if (node.kind === "Program")
        return;
      let type3;
      try {
        type3 = getType(node, spine);
      } catch {
        return;
      }
      if (isSubtype(type3, integerType()) && !isSubtype(type3, int64Type)) {
        throw new PolygolfError(
          `Integer value that doesn't provably fit into a int64 type encountered.`,
          node.source
        );
      }
      return void 0;
    }
  };

  // src/plugins/arithmetic.ts
  var modToRem = {
    name: "modToRem",
    visit(node, spine) {
      if (isPolygolfOp(node, "mod")) {
        return isSubtype(getType(node.args[1], spine), integerType(0)) ? polygolfOp("rem", ...node.args) : polygolfOp(
          "rem",
          polygolfOp("add", polygolfOp("rem", ...node.args), node.args[1]),
          node.args[1]
        );
      }
    }
  };
  var divToTruncdiv = {
    name: "divToTruncdiv",
    visit(node, spine) {
      if (isPolygolfOp(node, "div")) {
        return isSubtype(getType(node.args[1], spine), integerType(0)) ? polygolfOp("trunc_div", ...node.args) : void 0;
      }
    }
  };
  var truncatingOpsPlugins = [modToRem, divToTruncdiv];
  var equalityToInequality = {
    name: "equalityToInequality",
    visit(node, spine) {
      if (isPolygolfOp(node, "eq", "neq")) {
        const eq = node.op === "eq";
        const [a, b] = [node.args[0], node.args[1]];
        const [t1, t2] = [a, b].map((x) => getType(x, spine));
        if (isConstantType(t1)) {
          if (t1.low === t2.low) {
            return eq ? polygolfOp("gt", int(t1.low + 1n), b) : polygolfOp("lt", int(t1.low), b);
          }
          if (t1.low === t2.high) {
            return eq ? polygolfOp("lt", int(t1.low - 1n), b) : polygolfOp("gt", int(t1.low), b);
          }
        }
        if (isConstantType(t2)) {
          if (t1.low === t2.low) {
            return eq ? polygolfOp("lt", a, int(t2.low + 1n)) : polygolfOp("gt", a, int(t2.low));
          }
          if (t1.high === t2.low) {
            return eq ? polygolfOp("gt", a, int(t2.low - 1n)) : polygolfOp("lt", a, int(t2.low));
          }
        }
      }
    }
  };
  var removeBitnot = {
    ...mapOps(["bit_not", (x) => polygolfOp("sub", int(-1), x[0])]),
    name: "removeBitnot"
  };
  var addBitnot = {
    name: "addBitnot",
    visit(node) {
      if (isPolygolfOp(node, "add") && node.args.length === 2 && isIntLiteral(node.args[0])) {
        if (node.args[0].value === 1n)
          return polygolfOp("neg", polygolfOp("bit_not", node.args[1]));
        if (node.args[0].value === -1n)
          return polygolfOp("bit_not", polygolfOp("neg", node.args[1]));
      }
    }
  };
  var bitnotPlugins = [removeBitnot, addBitnot];
  var applyDeMorgans = {
    name: "applyDeMorgans",
    visit(node, spine) {
      if (isPolygolfOp(node, "and", "or", "unsafe_and", "unsafe_or")) {
        const negation = polygolfOp(
          node.op === "and" ? "or" : node.op === "or" ? "and" : node.op === "unsafe_and" ? "unsafe_or" : "unsafe_and",
          ...node.args.map((x) => polygolfOp("not", x))
        );
        if (getType(node, spine).kind === "void")
          return negation;
        return polygolfOp("not", negation);
      }
      if (isPolygolfOp(node, "bit_and", "bit_or")) {
        return polygolfOp(
          "bit_not",
          polygolfOp(
            node.op === "bit_and" ? "bit_or" : "bit_and",
            ...node.args.map((x) => polygolfOp("bit_not", x))
          )
        );
      }
    }
  };
  var useIntegerTruthiness = {
    name: "useIntegerTruthiness",
    visit(node, spine) {
      if (isPolygolfOp(node, "eq", "neq") && spine.parent.node.kind === "IfStatement" && spine.pathFragment === "condition") {
        const res = isIntLiteral(node.args[1], 0n) ? implicitConversion("int_to_bool", node.args[0]) : isIntLiteral(node.args[0], 0n) ? implicitConversion("int_to_bool", node.args[1]) : void 0;
        return res !== void 0 && node.op === "eq" ? polygolfOp("not", res) : res;
      }
    }
  };
  function powToMul(limit = 2) {
    return {
      name: `powToMul(${limit})`,
      visit(node) {
        if (isPolygolfOp(node, "pow")) {
          const [a, b] = node.args;
          if (isIntLiteral(b) && b.value > 1 && b.value <= limit) {
            return polygolfOp("mul", ...Array(Number(b.value)).fill(a));
          }
        }
      }
    };
  }
  var mulToPow = {
    name: "mulToPow",
    visit(node) {
      if (isPolygolfOp(node, "mul")) {
        const factors = /* @__PURE__ */ new Map();
        for (const e of node.args) {
          const stringified = stringify(e);
          factors.set(stringified, [
            e,
            1 + (factors.get(stringified)?.at(1) ?? 0)
          ]);
        }
        const pairs = [...factors.values()];
        if (pairs.some((pair) => pair[1] > 1)) {
          return polygolfOp(
            "mul",
            ...pairs.map(
              ([expr, exp]) => exp > 1 ? polygolfOp("pow", expr, int(exp)) : expr
            )
          );
        }
      }
    }
  };
  var powPlugins = [powToMul(), mulToPow];
  function bitShiftToMulOrDiv(literalOnly = true, toMul = true, toDiv = true) {
    return {
      name: `bitShiftToMulOrDiv(${[literalOnly, toMul, toDiv].map((x) => x ? "true" : "false").toString()})`,
      visit(node) {
        if (isPolygolfOp(node, "bit_shift_left", "bit_shift_right")) {
          const [a, b] = node.args;
          if (!literalOnly || isIntLiteral(b)) {
            if (node.op === "bit_shift_left" && toMul) {
              return polygolfOp("mul", a, polygolfOp("pow", int(2), b));
            }
            if (node.op === "bit_shift_right" && toDiv) {
              return polygolfOp("div", a, polygolfOp("pow", int(2), b));
            }
          }
        }
      }
    };
  }
  function getOddAnd2Exp(n) {
    let exp = 0n;
    while ((n & 1n) === 0n) {
      n >>= 1n;
      exp++;
    }
    return [n, exp];
  }
  function mulOrDivToBitShift(fromMul = true, fromDiv = true) {
    return {
      name: `mulOrDivToBitShift(${[fromMul, fromDiv].map((x) => x ? "true" : "false").toString()})`,
      visit(node) {
        if (isPolygolfOp(node, "div") && fromDiv) {
          const [a, b] = node.args;
          if (isIntLiteral(b)) {
            const [n, exp] = getOddAnd2Exp(b.value);
            if (exp > 1 && n === 1n) {
              return polygolfOp("bit_shift_right", a, int(exp));
            }
          }
          if (isPolygolfOp(b, "pow") && isIntLiteral(b.args[0], 2n)) {
            return polygolfOp("bit_shift_right", a, b.args[1]);
          }
        }
        if (isPolygolfOp(node, "mul") && fromMul) {
          if (isIntLiteral(node.args[0])) {
            const [n, exp] = getOddAnd2Exp(node.args[0].value);
            if (exp > 1) {
              return polygolfOp(
                "bit_shift_left",
                polygolfOp("mul", int(n), ...node.args.slice(1)),
                int(exp)
              );
            }
          }
          const powNode = node.args.find(
            (x) => isPolygolfOp(x, "pow") && isIntLiteral(x.args[0], 2n)
          );
          if (powNode !== void 0) {
            return polygolfOp(
              "bit_shift_left",
              polygolfOp("mul", ...node.args.filter((x) => x !== powNode)),
              powNode.args[1]
            );
          }
        }
      }
    };
  }
  var bitShiftPlugins = [bitShiftToMulOrDiv(), mulOrDivToBitShift()];

  // src/plugins/static.ts
  function golfStringListLiteral(useTextSplitWhitespace = true) {
    return {
      name: "golfStringListLiteral",
      visit(node) {
        if (node.kind === "ListConstructor" && node.exprs.every((x) => isTextLiteral(x))) {
          const strings = node.exprs.map((x) => x.value);
          const delim = getDelim(strings, useTextSplitWhitespace);
          return delim === true ? polygolfOp("text_split_whitespace", text(strings.join(" "))) : polygolfOp("text_split", text(strings.join(delim)), text(delim));
        }
      }
    };
  }
  function getDelim(strings, useTextSplitWhitespace = true) {
    const string2 = strings.join("");
    if (!/\s/.test(string2) && useTextSplitWhitespace)
      return true;
    for (let i2 = 32; i2 < 127; i2++) {
      const c = String.fromCharCode(i2);
      if (!string2.includes(c)) {
        return c;
      }
    }
    let i = 0;
    while (string2.includes(String(i))) {
      i++;
    }
    return String(i);
  }
  function listOpsToTextOps(...ops) {
    ops = ops.length > 0 ? ops : [
      "text_get_byte",
      "text_get_codepoint",
      "text_byte_find",
      "text_codepoint_find"
    ];
    return {
      name: `listOpsToTextOps(${JSON.stringify(ops)})`,
      visit(node) {
        if (isPolygolfOp(node, "list_get", "list_find") && node.args[0].kind === "ListConstructor" && node.args[0].exprs.every((x) => isTextLiteral(x))) {
          const texts = node.args[0].exprs.map((x) => x.value);
          const joined = text(texts.join(""));
          if (texts.every((x) => charLength(x) === 1)) {
            if (texts.every((x) => byteLength(x) === 1)) {
              if (node.op === "list_get" && ops.includes("text_get_byte"))
                return polygolfOp("text_get_byte", joined, node.args[1]);
              if (node.op === "list_find" && ops.includes("text_byte_find"))
                return polygolfOp("text_byte_find", joined, node.args[1]);
            }
            if (node.op === "list_get" && ops.includes("text_get_codepoint"))
              return polygolfOp("text_get_codepoint", joined, node.args[1]);
            if (node.op === "list_find" && ops.includes("text_codepoint_find"))
              return polygolfOp("text_codepoint_find", joined, node.args[1]);
          }
        }
      }
    };
  }

  // src/languages/lua/index.ts
  var luaLanguage = {
    name: "Lua",
    extension: "lua",
    emitter: emitProgram2,
    phases: [
      required(printIntToPrint),
      search(
        flipBinaryOps,
        golfLastPrint(),
        listOpsToTextOps("text_byte_find", "text_get_byte"),
        tempVarToMultipleAssignment,
        equalityToInequality,
        shiftRangeOneUp,
        ...bitnotPlugins,
        applyDeMorgans,
        useIntegerTruthiness,
        forRangeToForRangeOneStep,
        forArgvToForRange(),
        forRangeToForRangeInclusive(),
        implicitlyConvertPrintArg,
        useEquivalentTextOp(true, false),
        textToIntToFirstIndexTextGetToInt,
        mapOps([
          "text_to_int",
          (x) => polygolfOp("mul", int(1n), implicitConversion("text_to_int", x[0]))
        ]),
        mapOps([
          "text_to_int",
          (x) => polygolfOp("add", int(0n), implicitConversion("text_to_int", x[0]))
        ]),
        mapOps(
          [
            "argv_get",
            (x) => polygolfOp(
              "list_get",
              { ...builtin2("arg"), type: textType() },
              x[0]
            )
          ],
          ["text_get_byte_to_int", (x) => methodCall(x[0], "byte", add1(x[1]))],
          [
            "text_get_byte",
            (x) => methodCall(x[0], "sub", add1(x[1]), add1(x[1]))
          ],
          [
            "text_get_byte_slice",
            (x) => methodCall(x[0], "sub", x[1], add1(x[2]))
          ]
        ),
        useIndexCalls(true)
      ),
      required(
        forArgvToForRange(),
        forRangeToForRangeInclusive(),
        implicitlyConvertPrintArg,
        useEquivalentTextOp(true, false),
        textToIntToFirstIndexTextGetToInt,
        mapOps([
          "text_to_int",
          (x) => polygolfOp("mul", int(1n), implicitConversion("text_to_int", x[0]))
        ]),
        mapOps([
          "text_to_int",
          (x) => polygolfOp("add", int(0n), implicitConversion("text_to_int", x[0]))
        ]),
        mapOps(
          [
            "argv_get",
            (x) => polygolfOp(
              "list_get",
              { ...builtin2("arg"), type: textType() },
              x[0]
            )
          ],
          ["text_get_byte_to_int", (x) => methodCall(x[0], "byte", add1(x[1]))],
          [
            "text_get_byte",
            (x) => methodCall(x[0], "sub", add1(x[1]), add1(x[1]))
          ],
          [
            "text_get_byte_slice",
            (x) => methodCall(x[0], "sub", x[1], add1(x[2]))
          ]
        ),
        useIndexCalls(true),
        mapOps([
          "int_to_text",
          (x) => polygolfOp(
            "concat",
            text(""),
            implicitConversion("int_to_text", x[0])
          )
        ]),
        mapOps(
          [
            "join",
            (x) => functionCall("table.concat", isTextLiteral(x[1], "") ? [x[0]] : x)
          ],
          ["text_byte_length", (x) => methodCall(x[0], "len")],
          ["true", builtin2("true")],
          ["false", builtin2("false")],
          ["repeat", (x) => methodCall(x[0], "rep", x[1])],
          ["print", (x) => functionCall("io.write", x)],
          ["println", (x) => functionCall("print", x)],
          ["min", (x) => functionCall("math.min", x)],
          ["max", (x) => functionCall("math.max", x)],
          ["abs", (x) => functionCall("math.abs", x)],
          ["argv", (x) => builtin2("arg")],
          ["min", (x) => functionCall("math.min", x)],
          ["max", (x) => functionCall("math.max", x)],
          ["abs", (x) => functionCall("math.abs", x)],
          ["int_to_text_byte", (x) => functionCall("string.char", x)],
          [
            "text_replace",
            ([a, b, c]) => methodCall(
              a,
              "gsub",
              isTextLiteral(b) ? text(
                b.value.replace(
                  /(-|%|\^|\$|\(|\)|\.|\[|\]|\*|\+|\?)/g,
                  "%$1"
                )
              ) : methodCall(b, "gsub", text("(%W)"), text("%%%1")),
              isTextLiteral(c) ? text(c.value.replace("%", "%%")) : methodCall(c, "gsub", text("%%"), text("%%%%"))
            )
          ]
        ),
        mapToUnaryAndBinaryOps(
          ["pow", "^"],
          ["not", "not"],
          ["neg", "-"],
          ["list_length", "#"],
          ["bit_not", "~"],
          ["mul", "*"],
          ["div", "//"],
          ["mod", "%"],
          ["add", "+"],
          ["sub", "-"],
          ["concat", ".."],
          ["bit_shift_left", "<<"],
          ["bit_shift_right", ">>"],
          ["bit_and", "&"],
          ["bit_xor", "~"],
          ["bit_or", "|"],
          ["lt", "<"],
          ["leq", "<="],
          ["eq", "=="],
          ["neq", "~="],
          ["geq", ">="],
          ["gt", ">"],
          ["and", "and"],
          ["or", "or"]
        )
      ),
      simplegolf(
        alias((expr) => {
          switch (expr.kind) {
            case "IntegerLiteral":
              return expr.value.toString();
            case "TextLiteral":
              return `"${expr.value}"`;
          }
        })
      ),
      required(renameIdents(), assertInt64, removeImplicitConversions)
    ]
  };
  var lua_default = luaLanguage;

  // src/languages/nim/emit.ts
  function precedence2(expr) {
    switch (expr.kind) {
      case "UnaryOp":
        return 11;
      case "BinaryOp":
        return binaryPrecedence2(expr.name);
      case "FunctionCall":
        return 2;
      case "MethodCall":
        return 12;
    }
    return Infinity;
  }
  function binaryPrecedence2(opname) {
    switch (opname) {
      case "^":
        return 10;
      case "*":
      case "div":
      case "mod":
      case "%%":
      case "/%":
      case "shl":
      case "shr":
        return 9;
      case "+":
      case "-":
        return 8;
      case "&":
        return 7;
      case "..":
        return 6;
      case "<":
      case "<=":
      case "==":
      case "!=":
      case ">=":
      case ">":
        return 5;
      case "and":
        return 4;
      case "or":
      case "xor":
        return 3;
    }
    throw new Error(
      `Programming error - unknown Nim binary operator '${opname}.'`
    );
  }
  function emitProgram3(program2) {
    return emitMultiExpr(program2.body, true);
  }
  function emitMultiExpr(expr, isRoot = false) {
    const children = expr.kind === "Block" ? expr.children : [expr];
    if (isRoot) {
      return joinExprs2("\n", children);
    }
    let inner = [];
    let needsBlock = false;
    for (const child of children) {
      const needsNewline = "consequent" in child || "children" in child && (child.kind !== "VarDeclarationBlock" || child.children.length > 1) || "body" in child;
      needsBlock = needsBlock || needsNewline || child.kind.startsWith("VarDeclaration");
      inner.push(emit3(child));
      inner.push(needsNewline ? "\n" : ";");
    }
    inner = inner.slice(0, -1);
    if (needsBlock) {
      return ["$INDENT$", "\n", inner, "$DEDENT$"];
    }
    return inner;
  }
  function joinExprs2(delim, exprs, minPrec = -Infinity) {
    return joinTrees(
      delim,
      exprs.map((x) => emit3(x, minPrec))
    );
  }
  function emit3(expr, minimumPrec = -Infinity) {
    let prec = precedence2(expr);
    const e = expr;
    function emitNoParens() {
      switch (e.kind) {
        case "Block":
          return emitMultiExpr(e);
        case "VarDeclarationWithAssignment":
          return emit3(e.assignment);
        case "VarDeclarationBlock":
          if (e.children.length > 1)
            return [
              "var",
              "$INDENT$",
              e.children.map((x) => ["\n", emit3(x)]),
              "$DEDENT$"
            ];
          return ["var", emit3(e.children[0])];
        case "ImportStatement":
          return [e.name, joinTrees(",", e.modules)];
        case "WhileLoop":
          return [`while`, emit3(e.condition), ":", emitMultiExpr(e.body)];
        case "ForEach":
          return [
            `for`,
            emit3(e.variable),
            "in",
            emit3(e.collection),
            ":",
            emitMultiExpr(e.body)
          ];
        case "ForRange": {
          const start = isIntLiteral(e.start, 0n) ? [] : emit3(e.start);
          if (isIntLiteral(e.increment, 1n)) {
            return [
              "for",
              e.variable === void 0 ? "()" : emit3(e.variable),
              "in",
              start,
              "$GLUE$",
              e.inclusive ? ".." : "..<",
              emit3(e.end),
              ":",
              emitMultiExpr(e.body)
            ];
          }
          if (!e.inclusive) {
            throw new EmitError(e, "exlusive+step");
          }
          return [
            "for",
            e.variable === void 0 ? "()" : emit3(e.variable),
            "in",
            "countup",
            "$GLUE$",
            "(",
            emit3(e.start),
            ",",
            emit3(e.end),
            ",",
            emit3(e.increment),
            ")",
            ":",
            emitMultiExpr(e.body)
          ];
        }
        case "IfStatement":
          return [
            "if",
            emit3(e.condition),
            ":",
            emitMultiExpr(e.consequent),
            e.alternate !== void 0 ? ["else", ":", emitMultiExpr(e.alternate)] : []
          ];
        case "Variants":
        case "ForEachKey":
        case "ForEachPair":
        case "ForCLike":
          throw new EmitError(e);
        case "Assignment":
          return [emit3(e.variable), "=", emit3(e.expr)];
        case "ManyToManyAssignment":
          return [
            "(",
            joinExprs2(",", e.variables),
            ")",
            "=",
            "(",
            joinExprs2(",", e.exprs),
            ")"
          ];
        case "OneToManyAssignment":
          return [joinExprs2(",", e.variables), "=", emit3(e.expr)];
        case "MutatingBinaryOp":
          return [emit3(e.variable), "$GLUE$", e.name + "=", emit3(e.right)];
        case "Identifier":
          return e.name;
        case "TextLiteral":
          return emitTextLiteral(e.value, [
            [
              `"`,
              [
                [`\\`, `\\\\`],
                [`
`, `\\n`],
                [`\r`, `\\r`],
                [`"`, `\\"`]
              ]
            ],
            [`"""`, [[`"""`, null]]],
            [
              [`r"`, `"`],
              [
                [`"`, `""`],
                [`
`, null],
                [`\r`, null]
              ]
            ]
          ]);
        case "IntegerLiteral":
          return e.value.toString();
        case "FunctionCall":
          if (e.func.kind === "Identifier" && e.args.length === 1 && isTextLiteral(e.args[0])) {
            const raw = emitAsRawTextLiteral(e.args[0].value, e.func.name);
            if (raw !== null) {
              prec = Infinity;
              return raw;
            }
          }
          if (e.args.length > 1) {
            prec = 11.5;
          }
          if (e.args.length > 1 || e.args.length === 0)
            return [emit3(e.func), "$GLUE$", "(", joinExprs2(",", e.args), ")"];
          return [emit3(e.func), joinExprs2(",", e.args)];
        case "MethodCall":
          if (e.args.length > 1)
            return [
              emit3(e.object, prec),
              ".",
              e.ident.name,
              e.args.length > 0 ? ["$GLUE$", "(", joinExprs2(",", e.args), ")"] : []
            ];
          else {
            if (e.args.length === 1 && isTextLiteral(e.args[0])) {
              const raw = emitAsRawTextLiteral(e.args[0].value, e.ident.name);
              if (raw !== null) {
                prec = 12;
                return [emit3(e.object, prec), ".", raw];
              }
            }
            prec = 2;
            return [
              emit3(e.object, precedence2(e)),
              ".",
              e.ident.name,
              e.args.length > 0 ? joinExprs2(",", e.args) : []
            ];
          }
        case "BinaryOp": {
          const rightAssoc = e.name === "^";
          return [
            emit3(e.left, prec + (rightAssoc ? 1 : 0)),
            /[A-Za-z]/.test(e.name[0]) ? [] : "$GLUE$",
            e.name,
            emit3(e.right, prec + (rightAssoc ? 0 : 1))
          ];
        }
        case "UnaryOp":
          return [e.name, emit3(e.arg, prec)];
        case "ListConstructor":
          return ["@", "[", joinExprs2(",", e.exprs), "]"];
        case "ArrayConstructor":
          if (e.exprs.every(
            (x) => x.kind === "ArrayConstructor" && x.exprs.length === 2
          )) {
            const pairs = e.exprs;
            return [
              "{",
              joinTrees(
                ",",
                pairs.map((x) => [emit3(x.exprs[0]), ":", emit3(x.exprs[1])])
              ),
              "}"
            ];
          }
          return ["[", joinExprs2(",", e.exprs), "]"];
        case "TableConstructor":
          return [
            "{",
            joinTrees(
              ",",
              e.kvPairs.map((x) => [emit3(x.key), ":", emit3(x.value)])
            ),
            "}",
            ".",
            "toTable"
          ];
        case "IndexCall":
          if (e.oneIndexed)
            throw new EmitError(expr, "one indexed");
          return [emit3(e.collection, 12), "[", emit3(e.index), "]"];
        case "RangeIndexCall":
          if (e.oneIndexed)
            throw new EmitError(expr, "one indexed");
          if (!isIntLiteral(e.step, 1n))
            throw new EmitError(expr, "step");
          return [
            emit3(e.collection, 12),
            "[",
            emit3(e.low),
            "..<",
            emit3(e.high),
            "]"
          ];
        default:
          throw new EmitError(expr);
      }
    }
    const inner = emitNoParens();
    if (prec >= minimumPrec)
      return inner;
    return ["(", inner, ")"];
  }
  function emitAsRawTextLiteral(value, prefix = "r") {
    if (value.includes("\n") || value.includes("\r"))
      return null;
    return `${prefix}"${value.replaceAll(`"`, `""`)}"`;
  }

  // src/plugins/imports.ts
  function addImports(rules, output) {
    let rulesFunc;
    if (Array.isArray(rules)) {
      const map = new Map(rules);
      rulesFunc = function(x) {
        if (map.has(x.kind))
          return map.get(x.kind);
        if ((x.kind === "Identifier" && x.builtin || x.kind === "BinaryOp" || x.kind === "UnaryOp") && map.has(x.name)) {
          return map.get(x.name);
        }
      };
    } else
      rulesFunc = rules;
    const outputFunc = typeof output === "string" ? (x) => x.length > 0 ? importStatement(output, x) : void 0 : output;
    return {
      name: "addImports(...)",
      visit(node, spine) {
        if (node.kind !== "Program")
          return;
        const modules = spine.compactMap(
          (n, s) => n.kind === "Program" ? void 0 : rulesFunc(n, s)
        );
        const outputExpr = outputFunc([...new Set(modules)]);
        if (outputExpr !== void 0) {
          return program(block([outputExpr, node.body]));
        }
      }
    };
  }

  // src/languages/nim/plugins.ts
  var includes = [
    ["re", ["strutils"]],
    ["net", ["os", "strutils"]],
    ["math", ["since", "bitops", "fenv"]],
    ["tables", ["since", "hashes", "math", "algorithm"]],
    [
      "prelude",
      [
        "os",
        "strutils",
        "times",
        "parseutils",
        "hashes",
        "tables",
        "sets",
        "sequtils",
        "parseopt",
        "strformat"
      ]
    ]
  ];
  var addNimImports = addImports(
    [
      ["^", "math"],
      ["repeat", "strutils"],
      ["replace", "strutils"],
      ["multireplace", "strutils"],
      ["join", "strutils"],
      ["paramStr", "os"],
      ["commandLineParams", "os"],
      ["split", "strutils"],
      ["hash", "hashes"],
      ["TableConstructor", "tables"]
    ],
    (modules) => {
      if (modules.length < 1)
        return;
      for (const include of includes) {
        if (include[0].length > modules.join().length - 1)
          break;
        if (modules.every((x) => include[1].includes(x))) {
          return importStatement("include", [include[0]]);
        }
      }
      return importStatement("import", modules);
    }
  );
  var useUnsignedDivision = {
    name: "useUnsignedDivision",
    visit(node, spine) {
      if (isPolygolfOp(node, "trunc_div", "rem")) {
        return isSubtype(getType(node.args[0], spine), integerType(0)) && isSubtype(getType(node.args[0], spine), integerType(0)) ? polygolfOp(`unsigned_${node.op}`, ...node.args) : void 0;
      }
    }
  };
  var useUFCS = {
    name: "useUFCS",
    visit(node) {
      if (node.kind === "FunctionCall" && node.args.length > 0) {
        if (node.args.length === 1 && isTextLiteral(node.args[0])) {
          return;
        }
        const [obj, ...args] = node.args;
        if (obj.kind !== "BinaryOp" && obj.kind !== "UnaryOp" && node.func.kind === "Identifier") {
          return methodCall(obj, node.func, ...args);
        }
      }
    }
  };

  // src/plugins/packing.ts
  var useDecimalConstantPackedPrinter = {
    name: "useDecimalConstantPackedPrinter",
    visit(node) {
      if (isPolygolfOp(node, "print", "println") && isTextLiteral(node.args[0]) && isLargeDecimalConstant(node.args[0].value)) {
        const [prefix, main] = node.args[0].value.replace(".", ".,").split(",");
        const packed = packDecimal(main);
        return block([
          assignment("result", text(prefix)),
          forRangeCommon(
            ["packindex", 0, packed.length],
            assignment(
              "result",
              polygolfOp(
                "concat",
                id("result"),
                polygolfOp(
                  "text_get_byte_slice",
                  polygolfOp(
                    "int_to_text",
                    polygolfOp(
                      "add",
                      int(72n),
                      polygolfOp(
                        "text_byte_to_int",
                        polygolfOp("text_get_byte", text(packed), id("packindex"))
                      )
                    )
                  ),
                  int(1n),
                  int(2n)
                )
              )
            )
          ),
          print(id("result"))
        ]);
      }
    }
  };
  function isLargeDecimalConstant(output) {
    return /^\d\.\d*$/.test(output) && output.length > 200;
  }
  function packDecimal(decimal) {
    let result = "";
    for (let i = 0; i < decimal.length; i += 2) {
      result += String.fromCharCode(Number(decimal.substring(i, i + 2)) + 28);
    }
    return result;
  }
  var useLowDecimalListPackedPrinter = {
    name: "useLowDecimalListPackedPrinter",
    visit(node) {
      if (isPolygolfOp(node, "print", "println") && isTextLiteral(node.args[0])) {
        const packed = packLowDecimalList(node.args[0].value);
        if (packed === null)
          return;
        return forRangeCommon(
          ["packindex", 0, packed.length],
          print(polygolfOp("text_get_byte_to_int", text(packed), id("packindex")))
        );
      }
    }
  };
  function packLowDecimalList(value) {
    if (/^[\d+\n]+[\d+]$/.test(value)) {
      const nums = value.split("\n").map(Number);
      if (nums.every((x) => x > 0 && x < 256)) {
        return nums.map((x) => String.fromCharCode(x)).join("");
      }
    }
    return null;
  }
  function packSource2to1(source) {
    while (source.length % 2 !== 0)
      source += " ";
    let result = "";
    for (let i = 0; i < source.length; i += 2) {
      result += String.fromCharCode(
        source.charCodeAt(i) + source.charCodeAt(i + 1) * 256
      );
    }
    return result;
  }
  function packSource3to1(source) {
    while (source.length % 3 !== 0)
      source += "  ";
    let result = "";
    for (let i = 0; i < source.length; i += 3) {
      const a = [i, i + 1, i + 2].map((x) => source.charCodeAt(x) - 32);
      result += String.fromCodePoint(crt(a, [97, 98, 99]));
    }
    return result;
  }
  function crt(rem, num) {
    let sum = 0;
    const prod = num.reduce((a, c) => a * c, 1);
    for (let i = 0; i < num.length; i++) {
      const [ni, ri] = [num[i], rem[i]];
      const p = Math.floor(prod / ni);
      sum += ri * p * mulInv(p, ni);
    }
    return sum % prod;
  }
  function mulInv(a, b) {
    const b0 = b;
    let [x0, x1] = [0, 1];
    if (b === 1) {
      return 1;
    }
    while (a > 1) {
      const q = Math.floor(a / b);
      [a, b] = [b, a % b];
      [x0, x1] = [x1 - q * x0, x0];
    }
    if (x1 < 0) {
      x1 += b0;
    }
    return x1;
  }

  // src/plugins/tables.ts
  function tableHashing(hashFunc, hashNode = "hash", maxMod = 9999) {
    let hash2;
    if (typeof hashNode === "string") {
      hash2 = (x) => ({
        ...functionCall(hashNode, x),
        type: integerType(0, 2 ** 32 - 1)
      });
    } else {
      hash2 = hashNode;
    }
    return {
      name: "tableHashing(...)",
      visit(node, spine) {
        if (isPolygolfOp(node, "table_get") && node.args[0].kind === "TableConstructor") {
          const table = node.args[0];
          const getKey = node.args[1];
          const tableType2 = getType(table, spine);
          if (tableType2.kind === "Table" && tableType2.key.kind === "text" && table.kvPairs.every((x) => isTextLiteral(x.key))) {
            const searchResult = findHash(
              hashFunc,
              table.kvPairs.map((x) => [x.key.value, x.value]),
              maxMod
            );
            if (searchResult === null)
              return void 0;
            const [array, mod] = searchResult;
            let lastUsed = array.length - 1;
            while (array[lastUsed] === null)
              lastUsed--;
            return polygolfOp(
              "list_get",
              listConstructor(
                array.slice(0, lastUsed + 1).map((x) => x ?? defaultValue(tableType2.value))
              ),
              polygolfOp(
                "mod",
                mod === array.length ? hash2(getKey) : polygolfOp("mod", hash2(getKey), int(mod)),
                int(array.length)
              )
            );
          }
        }
      }
    };
  }
  function findHash(hashFunc, table, maxMod) {
    const hashedTable = table.map((x) => [
      hashFunc(x[0]),
      x[1]
    ]);
    const result = Array(table.length);
    for (let width = table.length; width < table.length * 4; width++) {
      for (let mod = width; mod <= maxMod; mod++) {
        result.fill(null);
        let collision = false;
        for (const [key, value] of hashedTable) {
          const i = key % mod % width;
          if (result[i] !== null) {
            collision = true;
            break;
          }
          result[i] = value;
        }
        if (!collision) {
          return [result, mod];
        }
      }
      result.push(null);
    }
    return null;
  }
  var tableToListLookup = {
    name: "tableToListLookup",
    visit(node) {
      if (isPolygolfOp(node, "table_get") && node.args[0].kind === "TableConstructor") {
        const keys = node.args[0].kvPairs.map((x) => x.key);
        if (keys.every((x) => isTextLiteral(x) || isIntLiteral(x)) && new Set(keys.map((x) => x.value)).size === keys.length) {
          const values = node.args[0].kvPairs.map((x) => x.value);
          const at = node.args[1];
          return polygolfOp(
            "list_get",
            listConstructor(values),
            polygolfOp("list_find", listConstructor(keys), at)
          );
        }
      }
    }
  };

  // src/languages/nim/hash.ts
  function rotl32(x, r) {
    return x << r | x >>> 32 - r;
  }
  function hash(text2) {
    const x = Buffer.from(text2, "utf8");
    const c1 = 3432918353;
    const c2 = 461845907;
    const n1 = 3864292196;
    const m1 = 2246822507;
    const m2 = 3266489909;
    const size = x.length;
    const stepSize = 4;
    const n = Math.floor(size / stepSize);
    let h1 = 0;
    let i = 0;
    let k1 = 0;
    while (i < n * stepSize) {
      k1 = 0;
      let j = stepSize;
      while (j-- > 0) {
        k1 = k1 << 8 | x[i + j];
      }
      i += stepSize;
      k1 = Math.imul(k1, c1);
      k1 = rotl32(k1, 15);
      k1 = Math.imul(k1, c2);
      h1 = h1 ^ k1;
      h1 = rotl32(h1, 13);
      h1 = h1 * 5 + n1;
    }
    k1 = 0;
    let rem = size % stepSize;
    while (rem-- > 0) {
      k1 = k1 << 8 | x[i + rem];
    }
    k1 = Math.imul(k1, c1);
    k1 = rotl32(k1, 15);
    k1 = Math.imul(k1, c2);
    h1 = h1 ^ k1;
    h1 = h1 ^ size;
    h1 = h1 ^ h1 >>> 16;
    h1 = Math.imul(h1, m1);
    h1 = h1 ^ h1 >>> 13;
    h1 = Math.imul(h1, m2);
    h1 = h1 ^ h1 >>> 16;
    return (h1 + 2 ** 32) % 2 ** 32;
  }
  var hash_default = hash;

  // src/languages/nim/index.ts
  var nimLanguage = {
    name: "Nim",
    extension: "nim",
    emitter: emitProgram3,
    phases: [
      required(printIntToPrint),
      search(
        flipBinaryOps,
        golfStringListLiteral(),
        listOpsToTextOps("text_byte_find", "text_get_byte"),
        golfLastPrint(),
        forRangeToForEach("array_get", "list_get", "text_get_byte"),
        tempVarToMultipleAssignment,
        useDecimalConstantPackedPrinter,
        useLowDecimalListPackedPrinter,
        tableHashing(hash_default),
        tableToListLookup,
        equalityToInequality,
        shiftRangeOneUp,
        forRangeToForRangeInclusive(),
        ...bitnotPlugins,
        applyDeMorgans,
        textToIntToTextGetToInt,
        forRangeToForRangeOneStep,
        useMultireplace(),
        forArgvToForEach,
        forArgvToForRange(),
        ...truncatingOpsPlugins,
        useIndexCalls(),
        useEquivalentTextOp(true, false),
        mapOps(
          ["argv", functionCall("commandLineParams")],
          ["argv_get", (x) => functionCall("paramStr", add1(x[0]))]
        )
      ),
      required(
        forArgvToForEach,
        forArgvToForRange(),
        ...truncatingOpsPlugins,
        useIndexCalls(),
        useEquivalentTextOp(true, false),
        mapOps(
          ["argv", functionCall("commandLineParams")],
          ["argv_get", (x) => functionCall("paramStr", add1(x[0]))]
        ),
        removeUnusedForVar,
        forRangeToForRangeInclusive(true),
        implicitlyConvertPrintArg,
        textToIntToFirstIndexTextGetToInt,
        mapOps([
          "text_get_byte_to_int",
          (x) => functionCall("ord", polygolfOp("text_get_byte", ...x))
        ]),
        mapOps(
          [
            "join",
            (x) => functionCall("join", isTextLiteral(x[1], "") ? [x[0]] : x)
          ],
          ["true", builtin2("true")],
          ["false", builtin2("false")],
          ["text_get_byte", (x) => indexCall(x[0], x[1])],
          [
            "text_get_byte_slice",
            (x) => rangeIndexCall(x[0], x[1], x[2], int(1n))
          ],
          ["text_split", (x) => functionCall("split", x)],
          ["text_split_whitespace", (x) => functionCall("split", x)],
          ["text_byte_length", (x) => functionCall("len", x)],
          ["repeat", (x) => functionCall("repeat", x)],
          ["max", (x) => functionCall("max", x)],
          ["min", (x) => functionCall("min", x)],
          ["abs", (x) => functionCall("abs", x)],
          ["text_to_int", (x) => functionCall("parseInt", x)],
          ["print", (x) => functionCall("write", builtin2("stdout"), x)],
          ["println", (x) => functionCall("echo", x)],
          ["min", (x) => functionCall("min", x)],
          ["max", (x) => functionCall("max", x)],
          ["abs", (x) => functionCall("abs", x)],
          ["bool_to_int", (x) => functionCall("int", x)],
          ["int_to_text_byte", (x) => functionCall("chr", x)],
          ["list_find", (x) => functionCall("find", x)],
          [
            "text_replace",
            (x) => functionCall("replace", isTextLiteral(x[2], "") ? [x[0], x[1]] : x)
          ],
          [
            "text_multireplace",
            (x) => functionCall(
              "multireplace",
              x[0],
              arrayConstructor(
                x.flatMap(
                  (_, i) => i % 2 > 0 ? [arrayConstructor(x.slice(i, i + 2))] : []
                )
                // Polygolf doesn't have array of tuples, so we use array of arrays instead
              )
            )
          ]
        ),
        useUnsignedDivision,
        addMutatingBinaryOp(
          ["add", "+"],
          ["mul", "*"],
          ["unsigned_rem", "%%"],
          ["unsigned_trunc_div", "/%"],
          ["mul", "*"],
          ["sub", "-"],
          ["concat", "&"]
        ),
        mapToUnaryAndBinaryOps(
          ["bit_not", "not"],
          ["not", "not"],
          ["neg", "-"],
          ["int_to_text", "$"],
          ["pow", "^"],
          ["mul", "*"],
          ["trunc_div", "div"],
          ["rem", "mod"],
          ["unsigned_rem", "%%"],
          ["unsigned_trunc_div", "/%"],
          ["bit_shift_left", "shl"],
          ["bit_shift_right", "shr"],
          ["add", "+"],
          ["sub", "-"],
          ["concat", "&"],
          ["lt", "<"],
          ["leq", "<="],
          ["eq", "=="],
          ["neq", "!="],
          ["geq", ">="],
          ["gt", ">"],
          ["and", "and"],
          ["bit_and", "and"],
          ["or", "or"],
          ["bit_or", "or"],
          ["bit_xor", "xor"]
        ),
        useUnsignedDivision,
        addNimImports
      ),
      simplegolf(
        alias(
          (expr) => {
            switch (expr.kind) {
              case "IntegerLiteral":
                return expr.value.toString();
              case "TextLiteral":
                return `"${expr.value}"`;
            }
          },
          [1, 7]
        )
      ),
      required(
        renameIdents(),
        addVarDeclarations,
        addVarDeclarationOneToManyAssignments(),
        addVarDeclarationManyToManyAssignments((_, spine) => spine.depth > 2),
        addManyToManyAssignments((_, spine) => spine.depth > 2),
        groupVarDeclarations((_, spine) => spine.depth <= 2),
        noStandaloneVarDeclarations,
        assertInt64,
        removeImplicitConversions,
        useUFCS
      )
    ],
    detokenizer: defaultDetokenizer((a, b) => {
      const left = a[a.length - 1];
      const right = b[0];
      if (/[A-Za-z0-9_]/.test(left) && /[A-Za-z0-9_]/.test(right))
        return true;
      const symbols = "=+-*/<>@$~&%|!?^.:\\";
      if (symbols.includes(left) && symbols.includes(right))
        return true;
      if (/[A-Za-z]/.test(left) && !["var", "in", "else", "if", "while", "for"].includes(a) && (symbols + `"({`).includes(right) && !["=", ":", ".", "::"].includes(b))
        return true;
      return false;
    })
  };
  var nim_default = nimLanguage;

  // src/languages/python/emit.ts
  function precedence3(expr) {
    switch (expr.kind) {
      case "UnaryOp":
        return unaryPrecedence(expr.name);
      case "BinaryOp":
        return binaryPrecedence3(expr.name);
    }
    return Infinity;
  }
  function binaryPrecedence3(opname) {
    switch (opname) {
      case "**":
        return 12;
      case "*":
      case "//":
      case "%":
        return 10;
      case "+":
      case "-":
        return 9;
      case "<<":
      case ">>":
        return 8;
      case "&":
        return 7;
      case "^":
        return 6;
      case "|":
        return 5;
      case "<":
      case "<=":
      case "==":
      case "!=":
      case ">=":
      case ">":
        return 4;
      case "and":
        return 2;
      case "or":
        return 1;
    }
    throw new Error(
      `Programming error - unknown Python binary operator '${opname}'.`
    );
  }
  function unaryPrecedence(opname) {
    switch (opname) {
      case "-":
      case "~":
        return 11;
      case "not":
        return 3;
    }
    throw new Error(
      `Programming error - unknown Python unary operator '${opname}.'`
    );
  }
  function emitProgram4(program2) {
    return emitMultiExpr2(program2.body, true);
  }
  function emitMultiExpr2(baseExpr, isRoot = false) {
    const children = baseExpr.kind === "Block" ? baseExpr.children : [baseExpr];
    if (isRoot) {
      return joinExprs3("\n", children);
    }
    if (containsMultiExpr(children)) {
      return ["$INDENT$", "\n", joinExprs3("\n", children), "$DEDENT$"];
    }
    return joinExprs3(";", children);
  }
  function joinExprs3(delim, exprs, minPrec = -Infinity) {
    return joinTrees(
      delim,
      exprs.map((x) => emit4(x, minPrec))
    );
  }
  function emit4(expr, minimumPrec = -Infinity) {
    const prec = precedence3(expr);
    function emitNoParens(e) {
      switch (e.kind) {
        case "Block":
          return emitMultiExpr2(expr);
        case "ImportStatement":
          return [e.name, joinTrees(",", e.modules)];
        case "WhileLoop":
          return [`while`, emit4(e.condition), ":", emitMultiExpr2(e.body)];
        case "ForEach":
          return [
            `for`,
            emit4(e.variable),
            "in",
            emit4(e.collection),
            ":",
            emitMultiExpr2(e.body)
          ];
        case "ForRange": {
          const start = emit4(e.start);
          const start0 = isIntLiteral(e.start, 0n);
          const end = emit4(e.end);
          const increment = emit4(e.increment);
          const increment1 = isIntLiteral(e.increment, 1n);
          return e.variable === void 0 && start0 && increment1 ? [
            "for",
            "_",
            "in",
            emit4(binaryOp("*", text("X"), e.end)),
            ":",
            emitMultiExpr2(e.body)
          ] : [
            "for",
            emit4(e.variable ?? id("_")),
            "in",
            "range",
            "(",
            start0 && increment1 ? [] : [start, ","],
            end,
            increment1 ? [] : [",", increment],
            ")",
            ":",
            emitMultiExpr2(e.body)
          ];
        }
        case "IfStatement":
          return [
            "if",
            emit4(e.condition),
            ":",
            emitMultiExpr2(e.consequent),
            e.alternate === void 0 ? [] : e.alternate.kind === "IfStatement" ? ["\n", "el", "$GLUE$", emit4(e.alternate)] : ["\n", "else", ":", emitMultiExpr2(e.alternate)]
          ];
        case "Variants":
        case "ForEachKey":
        case "ForEachPair":
        case "ForCLike":
          throw new EmitError(expr);
        case "Assignment":
          return [emit4(e.variable), "=", emit4(e.expr)];
        case "ManyToManyAssignment":
          return [joinExprs3(",", e.variables), "=", joinExprs3(",", e.exprs)];
        case "OneToManyAssignment":
          return [e.variables.map((v) => [emit4(v), "="]), emit4(e.expr)];
        case "MutatingBinaryOp":
          return [emit4(e.variable), e.name + "=", emit4(e.right)];
        case "NamedArg":
          return [e.name, "=", emit4(e.value)];
        case "Identifier":
          return e.name;
        case "TextLiteral":
          return emitPythonTextLiteral(e.value);
        case "IntegerLiteral":
          return e.value.toString();
        case "FunctionCall":
          return [
            emit4(e.func),
            "(",
            e.args.length > 1 && e.args.every((x) => isTextLiteral(x) && charLength(x.value) === 1) ? [
              "*",
              emit4(
                text(e.args.map((x) => x.value).join(""))
              )
            ] : joinExprs3(",", e.args),
            ")"
          ];
        case "PropertyCall":
          return [emit4(e.object), ".", emit4(e.ident)];
        case "BinaryOp": {
          const rightAssoc = e.name === "**";
          return [
            emit4(e.left, prec + (rightAssoc ? 1 : 0)),
            e.name,
            emit4(e.right, prec + (rightAssoc ? 0 : 1))
          ];
        }
        case "UnaryOp":
          return [e.name, emit4(e.arg, prec)];
        case "ListConstructor":
          return ["[", joinExprs3(",", e.exprs), "]"];
        case "TableConstructor":
          return [
            "{",
            joinTrees(
              ",",
              e.kvPairs.map((x) => [emit4(x.key), ":", emit4(x.value)])
            ),
            "}"
          ];
        case "IndexCall":
          if (e.oneIndexed)
            throw new EmitError(expr, "one indexed");
          return [emit4(e.collection, Infinity), "[", emit4(e.index), "]"];
        case "RangeIndexCall": {
          if (e.oneIndexed)
            throw new EmitError(expr, "one indexed");
          const low = emit4(e.low);
          const low0 = isIntLiteral(e.low, 0n);
          const high = emit4(e.high);
          const step = emit4(e.step);
          const step1 = isIntLiteral(e.step, 1n);
          return [
            emit4(e.collection, Infinity),
            "[",
            ...low0 ? [] : low,
            ":",
            high,
            step1 ? [] : [":", ...step],
            "]"
          ];
        }
        default:
          throw new EmitError(expr);
      }
    }
    const inner = emitNoParens(expr);
    if (prec >= minimumPrec)
      return inner;
    return ["(", inner, ")"];
  }
  function emitPythonTextLiteral(x) {
    return emitTextLiteral(x, [
      [
        `"`,
        [
          [`\\`, `\\\\`],
          [`
`, `\\n`],
          [`\r`, `\\r`],
          [`"`, `\\"`]
        ]
      ],
      [
        `'`,
        [
          [`\\`, `\\\\`],
          [`
`, `\\n`],
          [`\r`, `\\r`],
          [`'`, `\\'`]
        ]
      ],
      [
        `"""`,
        [
          [`\\`, `\\\\`],
          [`"""`, `\\"""`]
        ]
      ]
    ]);
  }

  // src/languages/python/index.ts
  var pythonLanguage = {
    name: "Python",
    extension: "py",
    emitter: emitProgram4,
    phases: [
      required(printIntToPrint),
      search(
        golfStringListLiteral(),
        listOpsToTextOps("text_codepoint_find", "text_get_codepoint"),
        tempVarToMultipleAssignment,
        forRangeToForEach("array_get", "list_get", "text_get_codepoint"),
        golfLastPrint(),
        equalityToInequality,
        useDecimalConstantPackedPrinter,
        useLowDecimalListPackedPrinter,
        textToIntToTextGetToInt,
        ...bitnotPlugins,
        applyDeMorgans,
        useIntegerTruthiness,
        forRangeToForRangeOneStep,
        tableToListLookup,
        useMultireplace(true),
        forArgvToForEach,
        useEquivalentTextOp(false, true),
        useIndexCalls()
      ),
      required(
        forArgvToForEach,
        removeUnusedForVar,
        useEquivalentTextOp(false, true),
        mapOps(
          ["argv", (x) => builtin2("sys.argv[1:]")],
          [
            "argv_get",
            (x) => polygolfOp(
              "list_get",
              { ...builtin2("sys.argv"), type: listType(textType()) },
              add1(x[0])
            )
          ]
        ),
        useIndexCalls(),
        textGetToIntToTextGet,
        implicitlyConvertPrintArg,
        mapOps(
          ["true", int(1)],
          ["false", int(0)],
          ["abs", (x) => functionCall("abs", x)],
          ["list_length", (x) => functionCall("len", x)],
          ["list_find", (x) => methodCall(x[0], "index", x[1])],
          ["join", (x) => methodCall(x[1], "join", x[0])],
          ["join", (x) => methodCall(text(""), "join", x[0])],
          ["sorted", (x) => functionCall("sorted", x[0])],
          [
            "text_codepoint_reversed",
            (x) => rangeIndexCall(x[0], builtin2(""), builtin2(""), int(-1))
          ],
          ["codepoint_to_int", (x) => functionCall("ord", x)],
          ["text_get_codepoint", (x) => indexCall(x[0], x[1])],
          ["int_to_codepoint", (x) => functionCall("chr", x)],
          ["max", (x) => functionCall("max", x)],
          ["min", (x) => functionCall("min", x)],
          [
            "text_get_codepoint_slice",
            (x) => rangeIndexCall(x[0], x[1], add1(x[2]), int(1))
          ],
          ["text_codepoint_length", (x) => functionCall("len", x)],
          ["int_to_text", (x) => functionCall("str", x)],
          ["text_split", (x) => methodCall(x[0], "split", x[1])],
          ["text_split_whitespace", (x) => methodCall(x[0], "split")],
          ["text_to_int", (x) => functionCall("int", x)],
          ["println", (x) => functionCall("print", x)],
          [
            "print",
            (x) => {
              return functionCall(
                "print",
                x[0].kind !== "ImplicitConversion" ? [namedArg("end", x[0])] : [x[0], namedArg("end", text(""))]
              );
            }
          ],
          ["text_replace", (x) => methodCall(x[0], "replace", x[1], x[2])],
          [
            "text_multireplace",
            (x) => methodCall(
              x[0],
              "translate",
              tableConstructor(
                x.flatMap(
                  (_, i, x2) => i % 2 > 0 ? [
                    keyValue(
                      int(x2[i].value.codePointAt(0)),
                      charLength(x2[i + 1].value) === 1 && x2[i + 1].value.codePointAt(0) < 100 ? int(x2[i + 1].value.codePointAt(0)) : x2[i + 1]
                    )
                  ] : []
                )
              )
            )
          ]
        ),
        addMutatingBinaryOp(
          ["add", "+"],
          ["concat", "+"],
          ["sub", "-"],
          ["mul", "*"],
          ["mul", "*"],
          ["repeat", "*"],
          ["div", "//"],
          ["mod", "%"],
          ["pow", "**"],
          ["bit_and", "&"],
          ["bit_xor", "^"],
          ["bit_or", "|"],
          ["bit_shift_left", "<<"],
          ["bit_shift_right", ">>"]
        ),
        mapToUnaryAndBinaryOps(
          ["pow", "**"],
          ["neg", "-"],
          ["bit_not", "~"],
          ["mul", "*"],
          ["repeat", "*"],
          ["div", "//"],
          ["mod", "%"],
          ["add", "+"],
          ["concat", "+"],
          ["sub", "-"],
          ["bit_shift_left", "<<"],
          ["bit_shift_right", ">>"],
          ["bit_and", "&"],
          ["bit_xor", "^"],
          ["bit_or", "|"],
          ["lt", "<"],
          ["leq", "<="],
          ["eq", "=="],
          ["neq", "!="],
          ["geq", ">="],
          ["gt", ">"],
          ["not", "not"],
          ["and", "and"],
          ["or", "or"]
        ),
        methodsAsFunctions,
        addOneToManyAssignments()
      ),
      simplegolf(
        alias((expr, spine) => {
          switch (expr.kind) {
            case "Identifier":
              return expr.builtin && (spine.parent?.node.kind !== "PropertyCall" || spine.pathFragment !== "ident") ? expr.name : void 0;
            case "PropertyCall":
              return isTextLiteral(expr.object) && expr.ident.builtin ? `"${expr.object.value}".${expr.ident.name}` : void 0;
            case "IntegerLiteral":
              return expr.value.toString();
            case "TextLiteral":
              return `"${expr.value}"`;
          }
        })
      ),
      required(
        renameIdents(),
        addImports(
          [
            ["sys.argv[1:]", "sys"],
            ["sys.argv", "sys"]
          ],
          "import"
        ),
        removeImplicitConversions
      )
    ],
    packers: [
      (x) => `exec(bytes(${emitPythonTextLiteral(packSource2to1(x))},'u16')[2:])`,
      (x) => {
        if ([...x].map((x2) => x2.charCodeAt(0)).some((x2) => x2 < 32))
          return null;
        return `exec(bytes(ord(c)%i+32for c in${emitPythonTextLiteral(
          packSource3to1(x)
        )}for i in b'abc'))`;
      }
    ]
  };
  var python_default = pythonLanguage;

  // src/languages/swift/emit.ts
  function precedence4(expr) {
    switch (expr.kind) {
      case "UnaryOp":
        return unaryPrecedence2(expr.name);
      case "BinaryOp":
        return binaryPrecedence4(expr.name);
    }
    return Infinity;
  }
  function binaryPrecedence4(opname) {
    switch (opname) {
      case "<<":
      case ">>":
        return 6;
      case "*":
      case "/":
      case "%":
      case "&":
        return 5;
      case "+":
      case "-":
      case "|":
      case "^":
        return 4;
      case "<":
      case "<=":
      case "==":
      case "!=":
      case ">=":
      case ">":
        return 3;
      case "&&":
        return 2;
      case "||":
        return 1;
    }
    throw new Error(
      `Programming error - unknown Swift binary operator '${opname}.'`
    );
  }
  function unaryPrecedence2(opname) {
    return 7;
  }
  function emitProgram5(program2) {
    return emitMultiExpr3(program2.body, true);
  }
  function joinExprs4(delim, exprs, minPrec = -Infinity) {
    return joinTrees(
      delim,
      exprs.map((x) => emit5(x, minPrec))
    );
  }
  function emit5(expr, minimumPrec = -Infinity) {
    const prec = precedence4(expr);
    function emitNoParens(e) {
      switch (e.kind) {
        case "VarDeclarationBlock":
          return ["var", joinExprs4(",", e.children)];
        case "VarDeclarationWithAssignment":
          return emit5(e.assignment);
        case "Block":
          return emitMultiExpr3(e);
        case "ImportStatement":
          return [e.name, joinTrees(",", e.modules)];
        case "WhileLoop":
          return [`while`, emit5(e.condition), emitMultiExpr3(e.body)];
        case "ForEach":
          return [
            `for`,
            emit5(e.variable),
            "in",
            emit5(e.collection),
            emitMultiExpr3(e.body)
          ];
        case "ForRange": {
          const start = emit5(e.start);
          const end = emit5(e.end);
          return [
            "for",
            e.variable === void 0 ? "_" : emit5(e.variable),
            "in",
            isIntLiteral(e.increment, 1n) ? [start, e.inclusive ? "..." : "..<", end] : [
              "stride",
              "(",
              joinTrees(",", [
                ["from:", start],
                ["to:", end],
                ["by:", emit5(e.increment)]
              ]),
              ")"
            ],
            emitMultiExpr3(e.body)
          ];
        }
        case "IfStatement":
          return [
            "if",
            emit5(e.condition),
            emitMultiExpr3(e.consequent),
            e.alternate !== void 0 ? ["else", emitMultiExpr3(e.alternate)] : []
          ];
        case "Variants":
        case "ForEachKey":
        case "ForEachPair":
        case "ForCLike":
          throw new EmitError(e);
        case "Assignment":
          return [emit5(e.variable), "=", emit5(e.expr)];
        case "MutatingBinaryOp":
          return [emit5(e.variable), e.name + "=", emit5(e.right)];
        case "NamedArg":
          return [e.name, ":", emit5(e.value)];
        case "Identifier":
          return e.name;
        case "TextLiteral":
          return emitTextLiteral(e.value, [
            [
              `"`,
              [
                [`\\`, `\\\\`],
                ...unicode01to09repls,
                [`
`, `\\n`],
                ...unicode0Bto1Frepls,
                [`"`, `\\"`]
              ]
            ],
            [
              [`"""
`, `
"""`],
              [
                [`\\`, `\\\\`],
                ...unicode01to09repls,
                ...unicode0Bto1Frepls,
                [`"""`, `\\"""`]
              ]
            ]
          ]);
        case "IntegerLiteral":
          return e.value.toString();
        case "FunctionCall":
          if (e.func.kind === "Identifier" && e.func.name === "!")
            return [emit5(e.args[0]), "!"];
          return [emit5(e.func), "(", joinExprs4(",", e.args), ")"];
        case "PropertyCall":
          return [emit5(e.object), ".", e.ident.name];
        case "MethodCall":
          return [
            emit5(e.object),
            ".",
            e.ident.name,
            "(",
            joinExprs4(", ", e.args),
            ")"
          ];
        case "ConditionalOp":
          return [
            emit5(e.condition),
            "?",
            emit5(e.consequent),
            ":",
            emit5(e.alternate)
          ];
        case "BinaryOp": {
          return [emit5(e.left, prec), e.name, emit5(e.right, prec + 1)];
        }
        case "UnaryOp":
          return [e.name, emit5(e.arg, prec)];
        case "ListConstructor":
          return ["[", joinExprs4(",", e.exprs), "]"];
        case "TableConstructor":
          return [
            "[",
            joinTrees(
              ",",
              e.kvPairs.map((x) => [emit5(x.key), ":", emit5(x.value)])
            ),
            "]"
          ];
        case "IndexCall":
          return [
            emit5(e.collection, Infinity),
            "[",
            emit5(e.index),
            "]",
            e.collection.kind === "TableConstructor" ? "!" : ""
          ];
        default:
          throw new EmitError(expr);
      }
    }
    const inner = emitNoParens(expr);
    if (prec >= minimumPrec)
      return inner;
    return ["(", inner, ")"];
  }
  function emitMultiExpr3(baseExpr, isRoot = false) {
    const children = baseExpr.kind === "Block" ? baseExpr.children : [baseExpr];
    if (isRoot) {
      return joinExprs4("\n", children);
    }
    return ["{", joinExprs4("\n", children), "}"];
  }
  var unicode01to09repls = [
    [``, `\\u{1}`],
    [``, `\\u{2}`],
    [``, `\\u{3}`],
    [``, `\\u{4}`],
    [``, `\\u{5}`],
    [``, `\\u{6}`],
    [`\x07`, `\\u{7}`],
    [`\b`, `\\u{8}`],
    [`	`, `\\u{9}`]
  ];
  var unicode0Bto1Frepls = [
    [`\v`, `\\u{b}`],
    [`\f`, `\\u{c}`],
    [`\r`, `\\u{d}`],
    [``, `\\u{e}`],
    [``, `\\u{f}`],
    [``, `\\u{10}`],
    [``, `\\u{11}`],
    [``, `\\u{12}`],
    [``, `\\u{13}`],
    [``, `\\u{14}`],
    [``, `\\u{15}`],
    [``, `\\u{16}`],
    [``, `\\u{17}`],
    [``, `\\u{18}`],
    [``, `\\u{19}`],
    [``, `\\u{1a}`],
    [`\x1B`, `\\u{1b}`],
    [``, `\\u{1c}`],
    [``, `\\u{1d}`],
    [``, `\\u{1e}`],
    [``, `\\u{1f}`]
  ];

  // src/languages/swift/index.ts
  var swiftLanguage = {
    name: "Swift",
    extension: "swift",
    emitter: emitProgram5,
    phases: [
      required(printIntToPrint),
      search(
        flipBinaryOps,
        golfStringListLiteral(false),
        listOpsToTextOps(),
        golfLastPrint(),
        equalityToInequality,
        forRangeToForRangeInclusive(),
        ...bitnotPlugins,
        applyDeMorgans,
        forRangeToForRangeOneStep,
        useEquivalentTextOp(true, true),
        replaceToSplitAndJoin,
        textToIntToTextGetToInt,
        forArgvToForEach,
        ...truncatingOpsPlugins,
        mapOps(
          ["argv", builtin2("CommandLine.arguments[1...]")],
          [
            "argv_get",
            (x) => polygolfOp(
              "list_get",
              builtin2("CommandLine.arguments"),
              add1(x[0])
            )
          ],
          [
            "codepoint_to_int",
            (x) => polygolfOp("text_get_codepoint_to_int", x[0], int(0n))
          ],
          [
            "text_byte_to_int",
            (x) => polygolfOp("text_get_byte_to_int", x[0], int(0n))
          ],
          [
            "text_get_byte",
            (x) => polygolfOp(
              "int_to_text_byte",
              polygolfOp("text_get_byte_to_int", ...x)
            )
          ]
        ),
        useIndexCalls()
      ),
      required(
        forArgvToForEach,
        ...truncatingOpsPlugins,
        mapOps(
          ["argv", builtin2("CommandLine.arguments[1...]")],
          [
            "argv_get",
            (x) => polygolfOp(
              "list_get",
              builtin2("CommandLine.arguments"),
              add1(x[0])
            )
          ],
          [
            "codepoint_to_int",
            (x) => polygolfOp("text_get_codepoint_to_int", x[0], int(0n))
          ],
          [
            "text_byte_to_int",
            (x) => polygolfOp("text_get_byte_to_int", x[0], int(0n))
          ],
          [
            "text_get_byte",
            (x) => polygolfOp(
              "int_to_text_byte",
              polygolfOp("text_get_byte_to_int", ...x)
            )
          ]
        ),
        useIndexCalls(),
        implicitlyConvertPrintArg,
        mapOps(
          [
            "join",
            (x) => methodCall(
              x[0],
              "joined",
              ...isTextLiteral(x[1], "") ? [] : [namedArg("separator", x[1])]
            )
          ],
          [
            "text_get_byte_to_int",
            (x) => functionCall(
              "Int",
              indexCall(functionCall("Array", propertyCall(x[0], "utf8")), x[1])
            )
          ],
          [
            "text_get_codepoint",
            (x) => functionCall(
              "String",
              indexCall(functionCall("Array", x[0]), x[1])
            )
          ],
          [
            "text_get_codepoint_to_int",
            (x) => propertyCall(
              indexCall(
                functionCall("Array", propertyCall(x[0], "unicodeScalars")),
                x[1]
              ),
              "value"
            )
          ],
          [
            "int_to_text_byte",
            (x) => functionCall(
              "String",
              functionCall("!", functionCall("UnicodeScalar", x))
            )
          ],
          [
            "int_to_codepoint",
            (x) => functionCall(
              "String",
              functionCall("!", functionCall("UnicodeScalar", x))
            )
          ],
          ["text_codepoint_length", (x) => propertyCall(x[0], "count")],
          [
            "text_byte_length",
            (x) => propertyCall(propertyCall(x[0], "utf8"), "count")
          ],
          ["int_to_text", (x) => functionCall("String", x)],
          [
            "text_split",
            (x) => methodCall(x[0], "split", namedArg("separator", x[1]))
          ],
          [
            "repeat",
            (x) => functionCall(
              "String",
              namedArg("repeating", x[0]),
              namedArg("count", x[1])
            )
          ],
          [
            "pow",
            (x) => functionCall(
              "Int",
              functionCall(
                "pow",
                functionCall("Double", x[0]),
                functionCall("Double", x[1])
              )
            )
          ],
          ["println", (x) => functionCall("print", x)],
          [
            "print",
            (x) => functionCall("print", x, namedArg("terminator", text("")))
          ],
          ["text_to_int", (x) => functionCall("!", functionCall("Int", x))],
          ["max", (x) => functionCall("max", x)],
          ["min", (x) => functionCall("min", x)],
          ["abs", (x) => functionCall("abs", x)],
          ["true", builtin2("true")],
          ["false", builtin2("false")],
          [
            "text_replace",
            (x) => methodCall(
              x[0],
              "replacingOccurrences",
              namedArg("of", x[1]),
              namedArg("with", x[2])
            )
          ]
        ),
        addMutatingBinaryOp(
          ["add", "+"],
          ["sub", "-"],
          ["mul", "*"],
          ["trunc_div", "/"],
          ["rem", "%"],
          ["bit_and", "&"],
          ["bit_or", "|"],
          ["bit_xor", "^"],
          ["bit_shift_left", "<<"],
          ["bit_shift_right", ">>"]
        ),
        mapToUnaryAndBinaryOps(
          ["not", "!"],
          ["neg", "-"],
          ["bit_not", "~"],
          ["bit_shift_left", "<<"],
          ["bit_shift_right", ">>"],
          ["mul", "*"],
          ["trunc_div", "/"],
          ["rem", "%"],
          ["bit_and", "&"],
          ["add", "+"],
          ["sub", "-"],
          ["bit_or", "|"],
          ["bit_xor", "^"],
          ["concat", "+"],
          ["lt", "<"],
          ["leq", "<="],
          ["eq", "=="],
          ["neq", "!="],
          ["geq", ">="],
          ["gt", ">"],
          ["and", "&&"],
          ["or", "||"]
        ),
        addImports(
          [
            ["pow", "Foundation"],
            ["replacingOccurrences", "Foundation"]
          ],
          "import"
        )
      ),
      simplegolf(
        alias((expr) => {
          switch (expr.kind) {
            case "IntegerLiteral":
              return expr.value.toString();
            case "TextLiteral":
              return `"${expr.value}"`;
          }
        })
      ),
      required(
        renameIdents(),
        addVarDeclarations,
        groupVarDeclarations(),
        noStandaloneVarDeclarations,
        assertInt64,
        removeImplicitConversions
      )
    ],
    // Custom detokenizer reflects Swift's whitespace rules, namely binary ops needing equal amount of whitespace on both sides
    detokenizer: function(tokenTree) {
      function isAlphaNum(s) {
        return /[A-Za-z0-9]/.test(s);
      }
      function needsWhiteSpaceOnBothSides(token, nextToken) {
        return /^[-+*/<>=^*|~]+$/.test(token) && /[-~]/.test(nextToken[0]) || token === `&` && /[*+-]/.test(nextToken[0]) || token === `!=`;
      }
      function needsWhiteSpace(prevToken, token) {
        return isAlphaNum(prevToken[prevToken.length - 1]) && isAlphaNum(token[0]) || [`if`, `in`, `while`].includes(prevToken) && token[0] !== `(` || token[0] === `?` || needsWhiteSpaceOnBothSides(prevToken, token);
      }
      const tokens = flattenTree(tokenTree);
      let result = tokens[0];
      for (let i = 1; i < tokens.length; i++) {
        if (needsWhiteSpace(tokens[i - 1], tokens[i]) || i + 1 < tokens.length && needsWhiteSpaceOnBothSides(tokens[i], tokens[i + 1]))
          result += " ";
        result += tokens[i];
      }
      return result.trim();
    }
  };
  var swift_default = swiftLanguage;

  // src/languages/golfscript/emit.ts
  function emitProgram6(program2) {
    function emitMultiExpr4(baseExpr, parent) {
      const children = baseExpr.kind === "Block" ? baseExpr.children : [baseExpr];
      if (["Program", "ForRange", "ForDifferenceRange", "ForEach"].includes(
        parent.kind
      )) {
        return children.map((stmt) => emitStatement(stmt, baseExpr));
      }
      return ["{", children.map((stmt) => emitStatement(stmt, baseExpr)), "}"];
    }
    function emitStatement(stmt, parent) {
      switch (stmt.kind) {
        case "Block":
          return emitMultiExpr4(stmt, parent);
        case "ImportStatement":
          return [stmt.name, ...stmt.modules];
        case "WhileLoop":
          return [
            emitMultiExpr4(stmt.condition, stmt),
            emitMultiExpr4(stmt.body, stmt),
            "while"
          ];
        case "ForRange": {
          if (stmt.inclusive)
            throw new EmitError(stmt, "inclusive");
          if (!isSubtype(getType(stmt.start, program2), integerType(0)))
            throw new EmitError(stmt, "potentially negative low");
          if (stmt.variable === void 0)
            throw new EmitError(stmt, "indexless");
          return [
            emitExpr2(stmt.end),
            ",",
            isIntLiteral(stmt.start, 0n) ? [] : [emitExpr2(stmt.start), ">"],
            isIntLiteral(stmt.increment, 1n) ? [] : [emitExpr2(stmt.increment), "%"],
            "{",
            ":",
            emitExpr2(stmt.variable),
            ";",
            emitMultiExpr4(stmt.body, stmt),
            "}",
            "%"
          ];
        }
        case "ForDifferenceRange": {
          if (stmt.inclusive)
            throw new EmitError(stmt, "inclusive");
          return [
            emitExpr2(stmt.difference),
            ",",
            isIntLiteral(stmt.increment, 1n) ? [] : [emitExpr2(stmt.increment), "%"],
            "{",
            isIntLiteral(stmt.start) && stmt.start.value < 0n ? [emitExpr2(int(-stmt.start.value)), "-"] : [emitExpr2(stmt.start), "+"],
            ":",
            emitExpr2(stmt.variable),
            ";",
            emitMultiExpr4(stmt.body, stmt),
            "}",
            "%"
          ];
        }
        case "ForEach":
          return [
            emitExpr2(stmt.collection),
            "{",
            ":",
            emitExpr2(stmt.variable),
            ";",
            emitMultiExpr4(stmt.body, stmt),
            "}",
            "%"
          ];
        case "IfStatement":
          return [
            emitExpr2(stmt.condition),
            emitMultiExpr4(stmt.consequent, stmt),
            stmt.alternate !== void 0 ? emitMultiExpr4(stmt.alternate, stmt) : "{}",
            "if"
          ];
        case "Variants":
        case "ForEachKey":
        case "ForEachPair":
        case "ForCLike":
          throw new EmitError(stmt);
        default:
          return emitExpr2(stmt);
      }
    }
    function emitExpr2(expr) {
      switch (expr.kind) {
        case "Assignment":
          return [emitExpr2(expr.expr), ":", emitExpr2(expr.variable), ";"];
        case "Identifier":
          return expr.name;
        case "TextLiteral":
          return emitTextLiteral(expr.value, [
            [
              `"`,
              [
                [`\\`, `\\\\`],
                [`"`, `\\"`]
              ]
            ],
            [
              `"`,
              [
                [`\\`, `\\\\`],
                [`'`, `\\'`]
              ]
            ]
          ]);
        case "IntegerLiteral":
          return expr.value.toString();
        case "BinaryOp":
          return [emitExpr2(expr.left), emitExpr2(expr.right), expr.name];
        case "UnaryOp":
          return [emitExpr2(expr.arg), expr.name];
        case "ListConstructor":
          return ["[", expr.exprs.map(emitExpr2), "]"];
        case "ConditionalOp":
          return [
            emitExpr2(expr.condition),
            emitExpr2(expr.consequent),
            emitExpr2(expr.alternate),
            "if"
          ];
        case "RangeIndexCall": {
          if (expr.oneIndexed)
            throw new EmitError(expr, "one indexed");
          return [
            emitExpr2(expr.collection),
            emitExpr2(expr.high),
            "<",
            emitExpr2(expr.low),
            ">",
            isIntLiteral(expr.step, 1n) ? [] : [emitExpr2(expr.step), "%"]
          ];
        }
        default:
          throw new EmitError(expr);
      }
    }
    return emitStatement(program2.body, program2);
  }

  // src/languages/golfscript/index.ts
  var golfscriptLanguage = {
    name: "Golfscript",
    extension: "gs",
    emitter: emitProgram6,
    phases: [
      required(printIntToPrint),
      search(
        flipBinaryOps,
        golfLastPrint(),
        equalityToInequality,
        ...bitnotPlugins,
        ...powPlugins,
        applyDeMorgans,
        forRangeToForRangeOneStep,
        forArgvToForEach,
        bitShiftToMulOrDiv(false, true, true)
      ),
      required(
        forArgvToForEach,
        bitShiftToMulOrDiv(false, true, true),
        useEquivalentTextOp(true, false),
        textGetToTextGetToIntToText,
        forRangeToForDifferenceRange(
          (node, spine) => !isSubtype(getType(node.start, spine.root.node), integerType(0))
        ),
        implicitlyConvertPrintArg,
        replaceToSplitAndJoin
      ),
      simplegolf(
        alias((expr) => {
          switch (expr.kind) {
            case "IntegerLiteral":
              return expr.value.toString();
            case "TextLiteral":
              return `"${expr.value}"`;
          }
        })
      ),
      required(
        mapOps([
          "argv_get",
          (x) => polygolfOp("list_get", polygolfOp("argv"), x[0])
        ]),
        mapOps(
          ["argv", builtin2("a")],
          ["true", int(1)],
          ["false", int(0)],
          ["print", (x) => x[0]],
          [
            "text_get_byte_slice",
            (x) => rangeIndexCall(x[0], x[1], add1(x[2]), int(1))
          ],
          ["neg", (x) => polygolfOp("mul", x[0], int(-1))],
          [
            "max",
            (x) => polygolfOp(
              "list_get",
              polygolfOp("sorted", listConstructor(x)),
              int(1)
            )
          ],
          [
            "min",
            (x) => polygolfOp(
              "list_get",
              polygolfOp("sorted", listConstructor(x)),
              int(0)
            )
          ],
          [
            "leq",
            (x) => polygolfOp(
              "lt",
              ...isIntLiteral(x[0]) ? [sub1(x[0]), x[1]] : [x[0], add1(x[1])]
            )
          ],
          [
            "geq",
            (x) => polygolfOp(
              "gt",
              ...isIntLiteral(x[0]) ? [add1(x[0]), x[1]] : [x[0], sub1(x[1])]
            )
          ]
        ),
        mapToUnaryAndBinaryOps(
          ["println", "n"],
          ["not", "!"],
          ["bit_not", "~"],
          ["mul", "*"],
          ["div", "/"],
          ["trunc_div", "/"],
          ["mod", "%"],
          ["bit_and", "&"],
          ["add", "+"],
          ["sub", "-"],
          ["bit_or", "|"],
          ["bit_xor", "^"],
          ["concat", "+"],
          ["lt", "<"],
          ["eq", "="],
          ["gt", ">"],
          ["and", "and"],
          ["or", "or"],
          ["text_get_byte_to_int", "="],
          ["text_byte_length", ","],
          ["text_byte_to_int", ")"],
          ["int_to_text", "`"],
          ["text_split", "/"],
          ["repeat", "*"],
          ["pow", "?"],
          ["text_to_int", "~"],
          ["abs", "abs"],
          ["list_push", "+"],
          ["list_get", "="],
          ["list_length", ","],
          ["join", "*"],
          ["sorted", "$"]
        ),
        mapOps(
          ["neq", (x) => unaryOp("!", binaryOp("=", x[0], x[1]))],
          ["text_byte_reversed", (x) => binaryOp("%", x[0], int(-1))],
          ["int_to_text_byte", (x) => binaryOp("+", listConstructor(x), text(""))]
        ),
        addImports(
          [["a", "a"]],
          (x) => x.length > 0 ? assignment(x[0], builtin2("")) : void 0
        ),
        renameIdents({
          // Custom Ident generator prevents `n` from being used as an ident, as it is predefined to newline and breaks printing if modified
          preferred(original) {
            const firstLetter = [...original].find((x) => /[A-Za-z]/.test(x));
            if (firstLetter === void 0)
              return [];
            if (/n/i.test(firstLetter))
              return ["N", "m", "M"];
            const lower = firstLetter.toLowerCase();
            const upper = firstLetter.toUpperCase();
            return [firstLetter, firstLetter === lower ? upper : lower];
          },
          short: "abcdefghijklmopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
          general: (i) => "v" + i.toString()
        }),
        removeImplicitConversions
      )
    ],
    detokenizer: defaultDetokenizer(
      (a, b) => a !== "" && b !== "" && (/[A-Za-z0-9_]/.test(a[a.length - 1]) && /[A-Za-z0-9_]/.test(b[0]) || a[a.length - 1] === "-" && /[0-9]/.test(b[0]))
    )
  };
  var golfscript_default = golfscriptLanguage;

  // src/languages/languages.ts
  var languages = [
    golfscript_default,
    lua_default,
    nim_default,
    python_default,
    swift_default,
    polygolf_default
  ];
  var languages_default = languages;

  // src/polygolf.ts
  globalThis.compile = compile;
  globalThis.languages = languages_default;
  globalThis.Buffer = {
    byteLength(s, encoding) {
      return new TextEncoder().encode(s).length;
    },
    from(s, encoding) {
      return new TextEncoder().encode(s);
    }
  };
})();
/*! Bundled license information:

@datastructures-js/heap/src/heap.js:
  (**
   * @license MIT
   * @copyright 2020 Eyas Ranjous <eyas.ranjous@gmail.com>
   *
   * @class
   *)

@datastructures-js/heap/src/minHeap.js:
  (**
   * @license MIT
   * @copyright 2020 Eyas Ranjous <eyas.ranjous@gmail.com>
   *)

@datastructures-js/heap/src/maxHeap.js:
  (**
   * @license MIT
   * @copyright 2020 Eyas Ranjous <eyas.ranjous@gmail.com>
   *)

@datastructures-js/priority-queue/src/minPriorityQueue.js:
  (**
   * @copyright 2020 Eyas Ranjous <eyas.ranjous@gmail.com>
   * @license MIT
   *)

@datastructures-js/priority-queue/src/maxPriorityQueue.js:
  (**
   * @copyright 2020 Eyas Ranjous <eyas.ranjous@gmail.com>
   * @license MIT
   *)

@datastructures-js/priority-queue/src/priorityQueue.js:
  (**
   * @copyright 2020 Eyas Ranjous <eyas.ranjous@gmail.com>
   * @license MIT
   *)
*/
