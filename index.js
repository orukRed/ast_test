"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const babel = __importStar(require("@babel/parser"));
const traverse_1 = __importDefault(require("@babel/traverse"));
const objects = [];
const ast = babel.parse(`
  f.tmp_index = "message";
  f.cg_index = 12;
  f.top = 100;
  f.left = 60;
  f.hoge = {
    foo:{
        bar:1
    }
  };  
`, {
    allowAwaitOutsideFunction: true,
    allowUndeclaredExports: true,
    errorRecovery: true,
    allowSuperOutsideMethod: true,
});
const variablePrefixList = ["f", "sf", "tf", "mp"];
let hoge = "";
(0, traverse_1.default)(ast, {
    enter: (path) => {
        // console.log(JSON.stringify(path.node, null, 2))
    },
    Identifier(path) {
        // console.log('Identifier', path.node.name);
    },
    MemberExpression(path) {
        const left = path.node;
        if (left.object.type === 'Identifier' && variablePrefixList.includes(left.object.name)) {
            if (left.property.type === 'Identifier') {
                // 'f.' をキー名の先頭に追加してプロパティ名を取得
                const propertyName = 'f.' + left.property.name;
                // console.log("MemberExpression", propertyName); // ここで取得したプロパティ名を使用
                objects.push(propertyName);
                // console.log(JSON.stringify(path.node, null, 2))
                // hoge = propertyName;
            }
        }
    },
    ObjectExpression: (path) => {
        const lastIndex = objects.length - 1;
        // console.log(JSON.stringify(path.node, null, 2))
        path.node.properties.forEach(property => {
            // SpreadElementには`key`プロパティがないため、ObjectMethodまたはObjectPropertyであることを確認します
            if (property.type === 'ObjectMethod' || property.type === 'ObjectProperty') {
                console.log(path.node);
                console.log(property.key);
                if (property.key.type === 'Identifier') {
                    objects.push(property.key.name);
                }
            }
            else {
                // SpreadElementの場合の処理
                console.log('SpreadElementはkeyプロパティを持ちません。');
            }
        });
    },
});
// console.log("astを出力するよ")
// console.log(JSON.stringify(ast, null, 2));
// console.log("objectsを出力するよ")
// console.log(JSON.stringify(objects, null, 2))
console.log(objects);
console.log("終了するよ");
process.exit();
//# sourceMappingURL=index.js.map