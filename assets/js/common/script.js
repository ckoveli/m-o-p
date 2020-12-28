const searchBtn = document.querySelector('.searchBtn'),
input = document.querySelector('.input'),
mobile = document.querySelector('.mobile'),
links = document.querySelector('.links'),
navLinks = document.querySelectorAll('.links li');
window.onscroll = function() {stickyNav()};

function switchMode(){
    if(document.body.classList.contains('dark')){
        document.body.classList.remove('dark');
        document.cookie = '_mode=null; path=/';
    }else{
        document.body.classList.toggle('dark');
        document.cookie = '_mode=dark; path=/';
    }
}

const nav = document.querySelector('nav'),
sticky = nav.offsetTop;

function stickyNav() {
  if (window.pageYOffset >= sticky) {
    nav.classList.add('sticky')
  } else {
    nav.classList.remove('sticky');
  }
}

window.addEventListener('mouseup', (event)=>{
    if(event.target == document.querySelector('.close')){
        input.value = '';
        input.focus();
        document.querySelector('.search-results').innerHTML = '';
        return;
    }
    if(event.target !== input && event.target !== document.querySelector('.close')){
        input.blur();
        if(!!document.querySelector('.close')){
            document.querySelector('.close').click();
            document.querySelector('.search-results').style.visibility = 'hidden';
        }		    
    }
});
const navSlide = ()=>{
    mobile.addEventListener('click', ()=>{
        links.classList.toggle('linksActive');
        navLinks.forEach((link, index)=>{
            if(link.style.animation){
                link.style.animation = '';
            }else{
                link.style.animation = `navLinkFade 0.5s ease forwards ${index/5 + 0.5}s`;
            }
        });
        mobile.classList.toggle('toggle');
    });
}
searchBtn.addEventListener('click', ()=>{
    input.classList.toggle('inputClicked');
    searchBtn.classList.toggle('close');
});
input.addEventListener('focus', ()=>{
    searchBtn.click();
    document.querySelector('.search-results').style.visibility = 'visible';
});
async function searchResults(){
    const allSpace = arr => arr.every(val => val === ' ');
    if(allSpace(Array.from(input.value)) == false){
        document.querySelector('.search-results').innerHTML = '<tr><td class="loader-row" colspan="3"><div class="loader"></div></td></tr>';
        
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({q: input.value})
        }
        await fetch('/pretraga', options).then(res => res.json()).then((res)=>{
            document.querySelector('.search-results').innerHTML = res.results;
        });
    }else{
        document.querySelector('.search-results').innerHTML = '';
    }
}
navSlide();