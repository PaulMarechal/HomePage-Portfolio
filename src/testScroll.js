let speed = 0;
let position = 0; 
let rounded = 0;
let block = document.getElementById('block');
let elems = [...document.querySelectorAll('.n')];

window.addEventListener('wheel', (e)=>{
    // console.log(e);
    speed += e.deltaY*0.0003;
})

let objs = Array(5).fill({dist:0})

function raf() {
    // console.log(position);
    position += speed;
    speed *= 0.8;

    objs.forEach((o,i)=>{
        o.dist = (position - i)
        o.dist = Math.abs(o.dist);
        elems[i].style.transform = `scale(${o.dist})`
    })

    rounded = Math.round(position);

    let diff = (rounded - position);

    position += Math.sign(diff)*Math.pow(Math.abs(diff), 0.7)*0.015;

    block.style.transform = `translate(0, ${position*100 + 50}px)`
    window.requestAnimationFrame(raf)
}

raf();
