function executeCommand(btn){
    let cmd = btn.dataset['command'];
    if(cmd === 'createlink'){
        let url = prompt("Link: ", "http:\/\/");
        document.execCommand(cmd, false, url);
    }else{
        document.execCommand(cmd, false, null);
    }
}
function updateProfile(){
    const options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            setting: 'settings/_profile',
            title: document.querySelector('.title').value,
            body: document.querySelector('.body').innerHTML
        })
    }
    fetch('/admin/settings', options);
}