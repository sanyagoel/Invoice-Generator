const deleteClientt = (btn)=>{
    //console.log('clicked!');
    const csrf = btn.dataset.csrf;
    const clientID = btn.dataset.clientid;
    console.log(btn.parentNode)


    const clientElement = btn.closest('article');

    fetch('/deleteClient/' + clientID,{
        method : 'DELETE',
        headers  : {
            'csrf-token' : csrf
        }
    }).then((result)=>{
        console.log(result);
        clientElement.parentNode.removeChild(clientElement);
    }).catch((err)=>{
        console.log(err);
    })
}

