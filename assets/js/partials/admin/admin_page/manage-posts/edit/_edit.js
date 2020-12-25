function executeCommand(btn){
    let cmd = btn.dataset['command'];
    if(cmd === 'createlink'){
        let url = prompt("Link: ", "http:\/\/");
        document.execCommand(cmd, false, url);
    }else{
        document.execCommand(cmd, false, null);
    }
}
function uploadTitleImage(){
    document.getElementById('inputTitleImage').click();
}
function viewTitleImage(event){
    let reader = new FileReader();
    reader.onload = ()=>{
        document.querySelector('.picture').src = reader.result;
    }
    reader.readAsDataURL(event.target.files[0]);
}
function commentsStyle(cb){
    if(cb.checked == false){
        document.querySelector('.card').querySelector('table').style.display = 'none';
        document.querySelector('.comments-title').style.display = 'none';
    }else{
        document.querySelector('.card').querySelector('table').style.display = '';
        document.querySelector('.comments-title').style.display = 'block';
    }
}
async function save(id){
    const newPicture = document.querySelector('.picture').src,
    title = document.querySelector('.title').value,
    subtitle = document.querySelector('.subtitle').value,
    body = document.querySelector('.body').innerHTML,
    preview = document.querySelector('.body').innerText,
    commentsEnabled = document.querySelector('.commentsEnabled').checked;        
    const options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            newTitle: title, 
            newPreview: `${preview.slice(0, 100)}...`,  
            newSubtitle: subtitle, 
            newBody: body, 
            newPicture: newPicture || picture,
            newCommentsEnabled: commentsEnabled
        })
    }

    await fetch(`/admin/uredi/${id}`, options).then(res => res.json()).then((res)=>{
        document.querySelector('.alert-box').style.transform = 'translate(-50%, 0)';
        document.getElementById('message').innerText = 'Sačuvano!';
        document.querySelector('.alert-box').getElementsByTagName('button')[0].addEventListener('click', ()=>{
            window.location.href = `/poezija/${res.slug}`;
        });
    });
}
function showReplies(id, cnt){
    if(document.querySelector(`.replies-partial.id${id}`).style.display == 'none'){
        document.querySelector(`.replies-partial.id${id}`).style.display = '';
        if(cnt>1){
            document.querySelector(`.show-hide-replies.id${id}`).innerHTML = `Sakrij ${cnt} odgovora <span class="show-hide-icon">\u25B2</span>`;
        }else{
            document.querySelector(`.show-hide-replies.id${id}`).innerHTML = 'Sakrij odgovor <span class="show-hide-icon">\u25B2</span>'
        }
    }else{
        document.querySelector(`.replies-partial.id${id}`).style.display = 'none';
        if(cnt>1){
            document.querySelector(`.show-hide-replies.id${id}`).innerHTML = `Prikaži ${cnt} odgovora <span class="show-hide-icon">\u25BC</span>`;
        }else{
            document.querySelector(`.show-hide-replies.id${id}`).innerHTML = 'Prikaži odgovor <span class="show-hide-icon">\u25BC</span>'
        }
    }
}
async function deleteComment(e, id){
    e.preventDefault();

    await fetch(`/admin/komentar/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => res.json()).then((res)=>{
        document.getElementById('comments-partial').innerHTML = res.partial;
        document.querySelector('.comments-title').innerHTML = res.comCount;
    });
}
async function deleteReply(e, id){
    e.preventDefault();

    await fetch(`/admin/odgovor/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => res.json()).then((res)=>{
        document.querySelector(`.replies-partial.id${id.split(',')[2]}`).innerHTML = res.partial;
        document.querySelector('.comments-title').innerHTML = res.comCount;
    });
}