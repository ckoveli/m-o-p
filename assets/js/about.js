const gear = document.querySelector('.gear img'),
settings = document.querySelector('.settings'),
blur = document.querySelector('.blur');
gear.addEventListener('click', ()=>{
    settings.style.display = 'block';
    blur.style.display = 'block';
});
window.addEventListener('mouseup', (event)=>{
    if(settings.style.display == 'block' && event.target !== settings){
        settings.style.display = 'none';
        blur.style.display = 'none';
    }
});