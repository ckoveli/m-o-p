function inputFilled(input, label){
    if(input.value !== ''){
        label.style.top = '-25px';
    }else{
        label.style.top = '0';
    }
}
function updateSlider(id, on, off){
    if(id == '2step'){
        if(document.getElementById(id+off).style.display == 'none'){
            document.getElementById(id+off).style.display = '';
            document.getElementById(id+on).style.display = 'none';
            document.getElementById(id).checked = false;
            updateSecurity();
            
            for(let i=0; i<2; i++){
                document.querySelector('.accept-2step').getElementsByTagName('p')[i].style.color = '#dcdcdc';
            }
            for(let i=0; i<2; i++){
                document.querySelector('.accept-2step').getElementsByTagName('p')[i].style.pointerEvents = 'none';
            }
        }else{
            document.getElementById(id+off).style.display = 'none';
            document.getElementById(id+on).style.display = '';
            document.getElementById(id).checked = true;
            updateSecurity();

            for(let i=0; i<2; i++){
                document.querySelector('.accept-2step').getElementsByTagName('p')[i].style.color = '#505050';
            }
            for(let i=0; i<2; i++){
                document.querySelector('.accept-2step').getElementsByTagName('p')[i].style.pointerEvents = 'auto';
            }
        }
    }else{
        if(id == 'securityQuestion'){
            if(document.getElementById(id+on).style.display == 'none'){
                document.getElementById(id+on).style.display = '';
                document.getElementById(id+off).style.display = 'none';
                document.getElementById(id).checked = true;
                document.querySelector('.input-data').style.display = '';

                if(document.getElementById('securityCode-on').style.display == ''){
                    document.getElementById('securityCode-on').style.display = 'none';
                    document.getElementById('securityCode-off').style.display = '';
                    document.getElementById('securityCode').checked = false;
                    updateSecurity();
                }
                updateSecurity();
            }else{
                document.getElementById(id+on).style.display = 'none';
                document.getElementById(id+off).style.display = '';
                document.getElementById(id).checked = false;
                document.querySelector('.input-data').style.display = 'none';
                updateSecurity();
            }
        }
        if(id == 'securityCode'){
            if(document.getElementById(id+on).style.display == 'none'){
                document.getElementById(id+on).style.display = '';
                document.getElementById(id+off).style.display = 'none';
                document.getElementById(id).checked = true;

                if(document.getElementById('securityQuestion-on').style.display == ''){
                    document.getElementById('securityQuestion-on').style.display = 'none';
                    document.getElementById('securityQuestion-off').style.display = '';
                    document.getElementById('securityQuestion').checked = false;
                    document.querySelector('.input-data').style.display = 'none';
                    updateSecurity();
                }
                updateSecurity();
            }else{
                document.getElementById(id+on).style.display = 'none';
                document.getElementById(id+off).style.display = '';
                document.getElementById(id).checked = false;
                updateSecurity();
            }
        }
    }
}
async function updateSecurity(){
    const twoStepVerification = document.getElementById('2step').checked,
    securityCode = document.getElementById('securityCode').checked,
    securityQuestion = document.getElementById('securityQuestion').checked,
    securityQuestionQuestion = document.getElementById('securityQuestionQuestion').value,
    securityQuestionAnswer = document.getElementById('securityQuestionAnswer').value

    const options = {
        method: 'PUT',
        headers: {
                'Content-Type': 'application/json'
            },
        body: JSON.stringify({
            setting: 'settings/_security',
            twoStepVerification: twoStepVerification,
            securityCode: securityCode,
            securityQuestion: securityQuestion,
            securityQuestionQuestion: securityQuestionQuestion,
            securityQuestionAnswer: securityQuestionAnswer
        })
    }
    await fetch('/admin/settings', options);
}