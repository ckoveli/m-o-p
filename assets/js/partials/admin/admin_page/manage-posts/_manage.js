async function deletePost(id){
    await fetch(`/admin/objave/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => res.json()).then((res)=>{
        document.getElementById('posts-partial').innerHTML = res.data;
    });
}
