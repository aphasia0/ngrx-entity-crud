"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const testing_1 = require("@angular-devkit/schematics/testing");
const json_utils_1 = require("./json-utils");
describe('json-utils', () => {
    const a = 'a';
    const b = 'b';
    const m = 'm';
    const z = 'z';
    const filePath = '/temp';
    let tree;
    function runTest(testFn, obj, indent) {
        const content = JSON.stringify(obj, null, indent);
        tree.create(filePath, content);
        const ast = core_1.parseJsonAst(content);
        const rec = tree.beginUpdate(filePath);
        testFn(rec, ast);
        tree.commitUpdate(rec);
        const result = tree.readContent(filePath);
        // Clean up the tree by deleting the file.
        tree.delete(filePath);
        return result;
    }
    beforeEach(() => {
        tree = new testing_1.UnitTestTree(new schematics_1.HostTree());
    });
    describe('appendPropertyInAstObject', () => {
        it('should insert multiple props with different indentations', () => {
            const cases = [
                // initial | prop | want | indent
                [{}, z, { z }, 0],
                [{ z }, m, { z, m }, 0],
                [{ m, z }, a, { m, z, a }, 0],
                [{ a, m, z }, b, { a, m, z, b }, 0],
                [{}, z, { z }, 2],
                [{ z }, m, { z, m }, 2],
                [{ m, z }, a, { m, z, a }, 2],
                [{ a, m, z }, b, { a, m, z, b }, 2],
                [{}, z, { z }, 4],
                [{ z }, m, { z, m }, 4],
                [{ m, z }, a, { m, z, a }, 4],
                [{ a, m, z }, b, { a, m, z, b }, 4],
            ];
            for (const c of cases) {
                const [initial, prop, want, indent] = c;
                const got = runTest((rec, ast) => {
                    expect(ast.kind).toBe('object');
                    json_utils_1.appendPropertyInAstObject(rec, ast, prop, prop, indent);
                }, initial, indent);
                expect(got).toBe(JSON.stringify(want, null, indent));
                expect(JSON.parse(got)).toEqual(want);
            }
        });
    });
    describe('insertPropertyInAstObjectInOrder', () => {
        it('should insert a first prop', () => {
            const indent = 2;
            const result = runTest((rec, ast) => {
                expect(ast.kind).toBe('object');
                json_utils_1.insertPropertyInAstObjectInOrder(rec, ast, a, a, indent);
            }, { m, z }, indent);
            expect(result).toBe(JSON.stringify({ a, m, z }, null, indent));
            expect(JSON.parse(result)).toEqual({ a, m, z });
        });
        it('should insert a middle prop', () => {
            const indent = 2;
            const result = runTest((rec, ast) => {
                expect(ast.kind).toBe('object');
                json_utils_1.insertPropertyInAstObjectInOrder(rec, ast, m, m, indent);
            }, { a, z }, indent);
            expect(result).toBe(JSON.stringify({ a, m, z }, null, indent));
            expect(JSON.parse(result)).toEqual({ a, m, z });
        });
        it('should insert a last prop', () => {
            const indent = 2;
            const result = runTest((rec, ast) => {
                expect(ast.kind).toBe('object');
                json_utils_1.insertPropertyInAstObjectInOrder(rec, ast, z, z, indent);
            }, { a, m }, indent);
            expect(result).toBe(JSON.stringify({ a, m, z }, null, indent));
            expect(JSON.parse(result)).toEqual({ a, m, z });
        });
        it('should insert multiple props with different indentations', () => {
            const cases = [
                // initial | prop | want | indent
                [{}, z, { z }, 0],
                [{ z }, m, { m, z }, 0],
                [{ m, z }, a, { a, m, z }, 0],
                [{ a, m, z }, b, { a, b, m, z }, 0],
                [{}, z, { z }, 2],
                [{ z }, m, { m, z }, 2],
                [{ m, z }, a, { a, m, z }, 2],
                [{ a, m, z }, b, { a, b, m, z }, 2],
                [{}, z, { z }, 4],
                [{ z }, m, { m, z }, 4],
                [{ m, z }, a, { a, m, z }, 4],
                [{ a, m, z }, b, { a, b, m, z }, 4],
            ];
            for (const c of cases) {
                const [initial, prop, want, indent] = c;
                const got = runTest((rec, ast) => {
                    expect(ast.kind).toBe('object');
                    json_utils_1.insertPropertyInAstObjectInOrder(rec, ast, prop, prop, indent);
                }, initial, indent);
                expect(got).toBe(JSON.stringify(want, null, indent));
                expect(JSON.parse(got)).toEqual(want);
            }
        });
    });
    describe('removePropertyInAstObject', () => {
        it('should remove a first prop', () => {
            const indent = 2;
            const result = runTest((rec, ast) => {
                expect(ast.kind).toBe('object');
                json_utils_1.removePropertyInAstObject(rec, ast, a);
            }, { a, m, z }, indent);
            expect(result).toBe(JSON.stringify({ m, z }, null, indent));
            expect(JSON.parse(result)).toEqual({ m, z });
        });
        it('should remove a middle prop', () => {
            const indent = 2;
            const result = runTest((rec, ast) => {
                expect(ast.kind).toBe('object');
                json_utils_1.removePropertyInAstObject(rec, ast, m);
            }, { a, m, z }, indent);
            expect(result).toBe(JSON.stringify({ a, z }, null, indent));
            expect(JSON.parse(result)).toEqual({ a, z });
        });
        it('should remove a last prop', () => {
            const indent = 2;
            const result = runTest((rec, ast) => {
                expect(ast.kind).toBe('object');
                json_utils_1.removePropertyInAstObject(rec, ast, z);
            }, { a, m, z }, indent);
            expect(result).toBe(JSON.stringify({ a, m }, null, indent));
            expect(JSON.parse(result)).toEqual({ a, m });
        });
        it('should remove only prop', () => {
            const indent = 2;
            const result = runTest((rec, ast) => {
                expect(ast.kind).toBe('object');
                json_utils_1.removePropertyInAstObject(rec, ast, a);
            }, { a }, indent);
            expect(result).toBe(JSON.stringify({}, null, indent));
            expect(JSON.parse(result)).toEqual({});
        });
    });
    describe('appendValueInAstArray', () => {
        it('should insert multiple props with different indentations', () => {
            const cases = [
                // initial | value | want | indent
                [[], z, [z], 0],
                [[z], m, [z, m], 0],
                [[m, z], a, [m, z, a], 0],
                [[a, m, z], b, [a, m, z, b], 0],
                [[], z, [z], 2],
                [[z], m, [z, m], 2],
                [[m, z], a, [m, z, a], 2],
                [[a, m, z], b, [a, m, z, b], 2],
                [[], z, [z], 4],
                [[z], m, [z, m], 4],
                [[m, z], a, [m, z, a], 4],
                [[a, m, z], b, [a, m, z, b], 4],
            ];
            for (const c of cases) {
                const [initial, value, want, indent] = c;
                const got = runTest((rec, ast) => {
                    expect(ast.kind).toBe('array');
                    json_utils_1.appendValueInAstArray(rec, ast, value, indent);
                }, initial, indent);
                expect(got).toBe(JSON.stringify(want, null, indent));
                expect(JSON.parse(got)).toEqual(want);
            }
        });
    });
});
//# sourceMappingURL=json-utils_spec.js.map