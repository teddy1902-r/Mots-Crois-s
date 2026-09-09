const COLS=14, ROWS=9;
const blocked=new Set(new Set(['0,0', '0,2', '0,4', '0,6', '0,8', '1,6', '2,0', '4,0', '4,5', '5,7', '6,0', '6,3', '7,2', '7,8', '8,0', '8,4', '9,6', '10,0', '10,1', '10,2', '11,5', '11,7', '12,0', '12,4', '13,3']));
const solution=[[None, 'S', None, 'P', None, 'E', None, 'K', None, 'B', None, 'G', None, 'G'], ['D', 'E', 'T', 'R', 'A', 'C', 'T', 'E', 'U', 'R', None, 'R', 'A', 'I'], [None, 'C', 'R', 'O', 'I', 'R', 'E', None, 'R', 'I', 'R', 'A', 'I', 'S'], ['C', 'H', 'A', 'N', 'G', 'E', None, 'B', 'E', 'S', 'A', 'C', 'E', None], [None, 'E', 'C', 'O', 'U', 'T', 'A', 'I', None, 'E', 'S', 'E', None, 'C'], ['A', 'R', 'T', 'S', None, 'E', 'I', 'D', 'E', 'R', 'S', None, 'T', 'A'], [None, None, 'E', 'T', 'E', 'R', 'N', 'E', 'L', None, 'I', 'R', 'A', 'N'], ['C', 'A', 'R', 'I', 'S', None, 'E', 'T', 'U', 'V', 'E', None, 'P', 'O'], [None, 'C', 'A', 'C', 'T', 'U', 'S', None, 'S', 'E', 'D', 'U', 'I', 'T']];
const board=document.getElementById('board'),status=document.getElementById('status');
function key(r,c){return `r${r}c${c}`}
for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
 if(blocked.has(`${r},${c}`))continue;
 const x=document.createElement('input');x.className='cell';x.maxLength=1;
 x.autocomplete='off';x.dataset.r=r;x.dataset.c=c;
 x.style.left=(c*100/COLS)+'%';x.style.top=(r*100/ROWS)+'%';
 x.value=localStorage.getItem(key(r,c))||'';
 x.addEventListener('input',()=>{x.value=x.value.replace(/[^a-zA-ZÀ-ÿ]/g,'').slice(-1).toUpperCase();
 localStorage.setItem(key(r,c),x.value);x.classList.remove('correct','wrong');update();if(x.value)next(r,c)});
 x.addEventListener('keydown',e=>{if(e.key==='ArrowRight')focus(r,c+1);if(e.key==='ArrowLeft')focus(r,c-1);if(e.key==='ArrowDown')focus(r+1,c);if(e.key==='ArrowUp')focus(r-1,c);});
 board.appendChild(x);
}
function focus(r,c){const e=document.querySelector(`[data-r="${r}"][data-c="${c}"]`);if(e)e.focus()}
function next(r,c){for(let n=c+1;n<COLS;n++)if(!blocked.has(`${r},${n}`)){focus(r,n);return}}
function update(){const n=[...document.querySelectorAll('.cell')].filter(x=>x.value).length;status.textContent=`${n} case${n>1?'s':''} remplie${n>1?'s':''}`}
function check(){
 let ok=0,total=0;
 document.querySelectorAll('.cell').forEach(x=>{let r=+x.dataset.r,c=+x.dataset.c,s=solution[r][c];if(!s)return;
 total++;x.classList.remove('correct','wrong');if(x.value){if(x.value===s){x.classList.add('correct');ok++}else x.classList.add('wrong')}})
 alert(ok===total ? '🎉 Bravo ! La grille est entièrement correcte.' : `${ok} bonne${ok>1?'s':''} réponse${ok>1?'s':''} sur ${total}. Les cases vertes sont correctes, les rouges sont à corriger.`);
}
function clearGrid(){if(!confirm('Effacer toutes les réponses ?'))return;document.querySelectorAll('.cell').forEach(x=>{x.value='';x.classList.remove('correct','wrong');localStorage.removeItem(key(x.dataset.r,x.dataset.c))});update()}
update();