function executeCommand(btn){
    let cmd = btn.dataset['command'];
    if(cmd === 'createlink'){
        let url = prompt("Link: ", "http:\/\/");
        document.execCommand(cmd, false, url);
    }else{
        document.execCommand(cmd, false, null);
    }
}