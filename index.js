//setTimeout(()=>{document.getElementById("heading").innerText=`random title 1`;},2000)

let listy=[];

function func(){
  document.getElementById('heading').innerText='clicked';
}

function submit_name(){
  listy.push(document.getElementById('inp1').value)
  render_names(listy)
  console.log(listy)
}

function render_names(l){
  document.getElementById('names').textContent=`${l}`
}