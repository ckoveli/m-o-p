function inputFilled(input, label){
    if(input.value !== ''){
        label.style.top = '-25px';
    }else{
        label.style.top = '0';
    }
}
function changePass(e, form){
    e.preventDefault();
    if(document.querySelector('.new-pass').getElementsByTagName('input')[0].value !== document.querySelector('.new-pass-again').getElementsByTagName('input')[0].value){
        document.querySelector('.new-pass').getElementsByTagName('label')[0].style.color = 'red';

        document.querySelector('.new-pass-again').getElementsByTagName('label')[0].style.color = 'red';
        document.getElementById('error-newpassagain').style.display = 'block';
        document.getElementById('error-newpassagain').getElementsByTagName('label')[0].innerText = 'Lozinke se ne poklapaju!';
    }else{
        const formData = new FormData(form);
        const searchParams = new URLSearchParams();
    
        for(const pair of formData){
            searchParams.append(pair[0], pair[1]);
        }
    
        document.querySelector('.old-pass').getElementsByTagName('label')[0].style.color = 'gray';
        document.getElementById('error-oldpass').style.display = 'none';
        document.querySelector('.new-pass').getElementsByTagName('label')[0].style.color = 'gray';
        document.querySelector('.new-pass-again').getElementsByTagName('label')[0].style.color = 'gray';
        document.getElementById('error-newpassagain').style.display = 'none';


        fetch('/admin/lozinka', {
            method: 'POST',
            body: searchParams
        }).then(res => res.json()).then((res)=>{
            if(res.error){
                document.querySelector('.old-pass').getElementsByTagName('label')[0].style.color = 'red';
                document.getElementById('error-oldpass').style.display = 'block';
                document.getElementById('error-oldpass').getElementsByTagName('label')[0].innerText = res.error.title;
            }else window.location.href = res.path;
        });
    }
}