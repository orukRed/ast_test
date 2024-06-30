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
function getObjectProperties(node, parentKey = '') {
    if (node.type === 'ObjectExpression') {
        const properties = {};
        node.properties.forEach((prop) => {
            const keyName = parentKey + prop.key.name; // 親のキー名を含める
            if (prop.value.type === 'ObjectExpression') {
                properties[keyName] = getObjectProperties(prop.value, keyName + '.'); // 再帰的に呼び出す際にキー名を渡す
            }
            else {
                properties[keyName] = prop.value.value; // リテラル値の取得
            }
        });
        return properties;
    }
}
const ast = babel.parse(`
  f.tmp_index = 0;
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
const objects = [];
(0, traverse_1.default)(ast, {
    enter: (path) => {
        if (path.isAssignmentExpression()) {
            const left = path.node.left;
            if (left.type === 'MemberExpression' && left.object.type === 'Identifier' && left.object.name === 'f') {
                if (left.property.type === 'Identifier') {
                    const object = {};
                    // 'f.' をキー名の先頭に追加
                    object['f.' + left.property.name] = getObjectProperties(path.node.right);
                    objects.push(object);
                }
            }
        }
    },
});
console.log("objectsを出力するよ");
console.log(objects);
