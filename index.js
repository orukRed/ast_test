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
class VariableData {
    constructor(_name, _value, type, description = "", nestVariableData = []) {
        this._nestVariableData = []; //ネストされた変数情報を格納するための配列//FIXME:まだ未使用 将来的にネスト↓オブジェクトのために使いたい
        this.location = "";
        this._name = _name;
        this._value = _value;
        this._type = type;
        this._description = description;
        this._nestVariableData = nestVariableData;
    }
}
function getNestedObject(property, parentName = '') {
    let nestedObjects = [];
    if (property.type === 'ObjectExpression') {
        property.properties.forEach((prop) => {
            if (prop.key && prop.key.type === 'Identifier') {
                const name = parentName ? `${parentName}.${prop.key.name}` : prop.key.name;
                const value = prop.value.type === 'ObjectExpression' ? undefined : prop.value.value;
                const variableData = new VariableData(name, value, undefined);
                if (prop.value.type === 'ObjectExpression') {
                    variableData._nestVariableData = getNestedObject(prop.value, name);
                }
                nestedObjects.push(variableData);
            }
        });
    }
    return nestedObjects;
}
//----------------------------------------------------------------------------------
//----------------------------------------------------------------------------------
//----------------------------------------------------------------------------------
//----------------------------------------------------------------------------------
//----------------------------------------------------------------------------------
//----------------------------------------------------------------------------------
const temp = [];
const objects = [];
const ast = babel.parse(`
  f.tmp_index = "message";
  f.cg_index = 12;
  f.top = 100;
  f.left = 60;
  f.hoge = {
    foo:{
        bar:1
    },
    piyo:[1,2,3],
    fufa:["a","b","c"]
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
                const variableData = new VariableData(propertyName, undefined, "f");
                objects.push(variableData);
                // console.log(JSON.stringify(path.node, null, 2))
                // hoge = propertyName;
            }
        }
    },
    ObjectExpression: (path) => {
        const lastIndex = objects.length - 1;
        const lastObject = objects[lastIndex];
        // console.log(JSON.stringify(path.node, null, 2))
        path.node.properties.forEach(property => {
            // SpreadElementには`key`プロパティがないため、ObjectMethodまたはObjectPropertyであることを確認します
            if (property.type === 'ObjectMethod' || property.type === 'ObjectProperty') {
                // console.log(path.node)
                // console.log(property.key);
                if (property.key.type === 'Identifier') {
                    const nestedObjects = getNestedObject(path.node);
                    if (lastObject._nestVariableData.length <= 0) {
                        // objects.pop();
                        lastObject._nestVariableData = nestedObjects;
                        // objects.push(lastObject);//ここでネストしたオブジェクトをプッシュしている クラスに入れるとしたら、ここで再帰処理とか使ってnestObjectに入れる感じになるのかなあ？
                        console.log("--------------------");
                    }
                    // const hoge = getNestedObject(property);
                    // console.log(hoge)
                    // temp.push(hoge);
                    // // const nestObjectList = getNestObject(property);
                    // // lastObject._nestVariableData = nestObjectList;
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
// console.log(temp)
console.log("終了するよ");
process.exit();
//# sourceMappingURL=index.js.map