import * as babel from '@babel/parser';
import traverse from '@babel/traverse';
import { File } from '@babel/types'; // File型をインポート
import { Expression } from '@babel/types';
import { ObjectMethod } from '@babel/types';
import { ObjectProperty } from '@babel/types';
import { SpreadElement } from '@babel/types';
import { get } from 'http';

class VariableData {
  public _name: string;//変数名
  public _value: string | undefined;//変数の値 現在未使用だけど今後使うかもなので一応定義だけしておく
  public _description: string | undefined;//変数の説明
  public _nestVariableData: VariableData[] = [];//ネストされた変数情報を格納するための配列//FIXME:まだ未使用 将来的にネスト↓オブジェクトのために使いたい
  public _type: string | undefined;//変数の種類 f sf tf mpのいずれか
  public location: string = "";

  public constructor(_name: string, _value: string | undefined, type: string | undefined, description: string = "", nestVariableData: VariableData[] = []) {
    this._name = _name;
    this._value = _value;
    this._type = type;
    this._description = description;
    this._nestVariableData = nestVariableData;
  }
}


function getNestedObject(property: any, parentName: string = ''): VariableData[] {
  let nestedObjects: VariableData[] = [];
  if (property.type === 'ObjectExpression') {
    property.properties.forEach((prop: any) => {
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


const temp: any[] = []
const objects: VariableData[] = [];
const ast = babel.parse(
  `
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
traverse(ast, {
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
          const nestedObjects: VariableData[] = getNestedObject(path.node);

          if (lastObject._nestVariableData.length <= 0) {
            // objects.pop();
            lastObject._nestVariableData = nestedObjects;
            // objects.push(lastObject);//ここでネストしたオブジェクトをプッシュしている クラスに入れるとしたら、ここで再帰処理とか使ってnestObjectに入れる感じになるのかなあ？
            console.log("--------------------")
          }
          // const hoge = getNestedObject(property);
          // console.log(hoge)
          // temp.push(hoge);
          // // const nestObjectList = getNestObject(property);
          // // lastObject._nestVariableData = nestObjectList;
        }
      } else {
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
console.log(objects)
// console.log(temp)
console.log("終了するよ")
process.exit();