import * as babel from '@babel/parser';
import traverse from '@babel/traverse';
import { File } from '@babel/types'; // File型をインポート
import { Expression } from '@babel/types';
import { ObjectMethod } from '@babel/types';
import { ObjectProperty } from '@babel/types';
import { SpreadElement } from '@babel/types';

function getObjectProperties(node: Expression, parentKey: string = '') {
  if (node.type === 'ObjectExpression') {
    const properties: any = {};
    node.properties.forEach((prop: any) => {
      const keyName = parentKey + prop.key.name; // 親のキー名を含める
      if (prop.value.type === 'ObjectExpression') {
        properties[keyName] = getObjectProperties(prop.value, keyName + '.'); // 再帰的に呼び出す際にキー名を渡す
      } else {
        properties[keyName] = prop.value.value; // リテラル値の取得
      }
    });
    return properties;
  }
}


const ast = babel.parse(
  `
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
const objects: any = [];

traverse(ast, {
  enter: (path) => {
    if (path.isAssignmentExpression()) {
      const left = path.node.left;
      if (left.type === 'MemberExpression' && left.object.type === 'Identifier' && left.object.name === 'f') {
        if (left.property.type === 'Identifier') {
          const object: any = {};
          // 'f.' をキー名の先頭に追加
          object['f.' + left.property.name] = getObjectProperties(path.node.right);
          objects.push(object);
        }
      }
    }
  },
});
console.log("objectsを出力するよ")
console.log(objects)
