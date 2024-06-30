import * as babel from '@babel/parser';
import traverse from '@babel/traverse';
import { File } from '@babel/types'; // File型をインポート
import { Expression } from '@babel/types';
import { ObjectMethod } from '@babel/types';
import { ObjectProperty } from '@babel/types';
import { SpreadElement } from '@babel/types';



const objects: any = [];
const ast = babel.parse(
  `
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
traverse(ast, {
  enter: (path) => {

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
        console.log("MemberExpression", propertyName); // ここで取得したプロパティ名を使用
        objects.push(propertyName);
      }
    }
  }
});
// console.log("astを出力するよ")
// console.log(JSON.stringify(ast, null, 2));
// console.log("objectsを出力するよ")
// console.log(JSON.stringify(objects, null, 2))
console.log(objects)
console.log("終了するよ")
process.exit();