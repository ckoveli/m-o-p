function executeCommand(btn){
    let cmd = btn.dataset['command'];
    if(cmd === 'createlink'){
        let url = prompt("Link: ", "http:\/\/");
        document.execCommand(cmd, false, url);
    }else{
        document.execCommand(cmd, false, null);
    }
}
function upload(){
    document.getElementById('inputFile').click();
}
function viewImage(event){
    let reader = new FileReader();
    reader.onload = ()=>{
        document.querySelector('.picture').src = reader.result;
    }
    reader.readAsDataURL(event.target.files[0]);
}
async function publish(){
    const picture = document.querySelector('.picture').src,
    type = document.querySelector('.select').value,
    title = document.querySelector('.title').value,
    subtitle = document.querySelector('.subtitle').value,
    body = document.querySelector('.body').innerHTML,
    preview = document.querySelector('.body').innerText,
    commentsEnabled = document.querySelector('.commentsEnabled').checked;

    if(type == '' || title == '' || body == ''){
        alert('Popuni obavezna polja pls');
        return;
    }else{
        const date = new Date();
        const month = new Array();
        month[0] = 'Januar';
        month[1] = 'Februar';
        month[2] = 'Mart';
        month[3] = 'April';
        month[4] = 'Maj';
        month[5] = 'Jun';
        month[6] = 'Jul';
        month[7] = 'Avgust';
        month[8] = 'Septembar';
        month[9] = 'Oktobar';
        month[10] = 'Novembar';
        month[11] = 'Decembar';

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                date: `${date.getDate()}. ${month[date.getMonth()]} ${date.getFullYear()}`,
                type: type,
                title: title, 
                preview: `${preview.slice(0, 100)}...`, 
                subtitle: subtitle, 
                body: body, 
                picture: picture,
                commentsEnabled: commentsEnabled
            })
        }
        await fetch('/admin/objavi', options).then(res => res.json()).then((res)=>{
            document.querySelector('.alert-box').style.transform = 'translate(-50%, 0)';
            document.getElementById('message').innerText = 'Objavljeno!';
            document.querySelector('.alert-box').getElementsByTagName('button')[0].addEventListener('click', ()=>{
                window.location.href = `/poezija/${res.slug}`;
            });
        });
    }
}