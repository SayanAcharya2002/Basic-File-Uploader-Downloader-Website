const { Console } = require('console');
const fs=require('fs');
const path=require('path')

let path_accounts='./accounts.json';

function get_accounts(){
  let data=fs.readFileSync(path.resolve(__dirname,path_accounts),{encoding:'utf-8'});
  data=JSON.parse(data);
  return data;
}

function save_accounts(data){
  console.log(data);
  fs.writeFileSync(path.resolve(__dirname,path_accounts),JSON.stringify(data))
}

module.exports={get_accounts,save_accounts};