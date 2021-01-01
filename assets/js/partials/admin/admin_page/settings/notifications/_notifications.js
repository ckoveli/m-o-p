function updateSlider(id, on, off){
    if(id == 'receiveNotifications'){
        if(document.getElementById(id+off).style.display == 'none'){
            document.getElementById(id+off).style.display = '';
            document.getElementById(id+on).style.display = 'none';
            document.getElementById('notificationsMail').value = document.getElementById('notificationsMailDefault').value;
            document.getElementById('notificationsMail').style.color = getComputedStyle(document.body).getPropertyValue('--border-color');
            document.getElementById('notificationsMail').disabled = true;
            document.getElementById('notificationsMailCheck').style.display = 'none';
            document.getElementById(id).checked = false;
            updateNotifications();

            for(let i=0; i<5; i++){
                document.querySelector('.accept-notifications').getElementsByTagName('p')[i].style.color = getComputedStyle(document.body).getPropertyValue('--border-color');
            }
            for(let i=0; i<8; i++){
                document.querySelector('.accept-notifications').getElementsByTagName('p')[i].style.pointerEvents = 'none';
            }
        }else{
            document.getElementById(id+off).style.display = 'none';
            document.getElementById(id+on).style.display = '';
            document.getElementById('notificationsMail').style.color = getComputedStyle(document.body).getPropertyValue('--p-color');
            document.getElementById('notificationsMail').disabled = false;
            document.getElementById(id).checked = true;
            updateNotifications();

            for(let i=0; i<5; i++){
                document.querySelector('.accept-notifications').getElementsByTagName('p')[i].style.color = getComputedStyle(document.body).getPropertyValue('--p-color');
            }
            for(let i=0; i<8; i++){
                document.querySelector('.accept-notifications').getElementsByTagName('p')[i].style.pointerEvents = 'auto';
            }
        }
    }else{
        if(document.getElementById(id+on).style.display == 'none'){
            document.getElementById(id+on).style.display = '';
            document.getElementById(id+off).style.display = 'none';
            document.getElementById(id).checked = true;
            updateNotifications();
        }else{
            document.getElementById(id+on).style.display = 'none';
            document.getElementById(id+off).style.display = '';
            document.getElementById(id).checked = false;
            updateNotifications();
        }
    }
}
async function updateNotifications(){
    const receiveNotifications = document.getElementById('receiveNotifications').checked,
    receiveComments = document.getElementById('receiveComments').checked,
    receiveMyReplies = document.getElementById('receiveMyReplies').checked,
    receiveOtherReplies = document.getElementById('receiveOtherReplies').checked,
    receiveRegisteredUsers = document.getElementById('receiveRegisteredUsers').checked,
    usersReceiveNotifications = document.getElementById('usersReceiveNotifications').checked,
    notificationsMail = document.getElementById('notificationsMail').value;

    const options = {
        method: 'PUT',
        headers: {
                'Content-Type': 'application/json'
            },
        body: JSON.stringify({
            setting: 'settings/_notifications',
            receiveNotifications: receiveNotifications,
            comments: receiveComments,
            myReplies: receiveMyReplies,
            otherReplies: receiveOtherReplies,
            registeredUsers: receiveRegisteredUsers,
            usersReceiveNotifications: usersReceiveNotifications,
            notificationsMail: notificationsMail
        })
    }

    await fetch('/admin/settings', options);
}