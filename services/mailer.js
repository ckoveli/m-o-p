const Admin = require('../models/admin');
const nodemailer = require('nodemailer');

const info = async(type, data)=>{
    const admin = await Admin.findOne({name: 'artvel'});
    if(admin.notifications.receiveNotifications == true){
        switch(type){
            case 'post':
                if(admin.usersReceiveNotifications == true){
                    if(admin.followers.length>0){
                        
                    }
                }
                break;
            case 'comment':
                if(admin.notifications.comments == true){
                    await sendEmail({
                        sender: '"Mesec Od Papira" <info@mesecodpapira.com>',
                        recipient: admin.mail,
                        subject: 'Imate nov komentar',
                        html: `<p>Korisnik "${data.username == '' ? 'Anoniman' : data.username}" je dodao komentar na pesmi <a href="http://mesecodpapira.com/poezija/${data.slug}">"${data.post}"</a>.</p>
                        <h3>"${data.username == '' ? 'Anoniman' : data.username}" je komentarisao:</h3>
                        <p>"${data.comment}".</p>
                        <h3>Datum: </h3><p style="display: inline-block">${data.date}</p>`
                    }); 
                    return
                }
                break;
            case 'reply':
                if(data.commentType == 'admin'){
                    if(admin.notifications.myReplies == true){
                        const replyUsername = data.username == '' ? 'Anoniman' : data.username;
                        await sendEmail({
                            sender: '"Mesec Od Papira" <info@mesecodpapira.com>',
                            recipient: admin.mail,
                            subject: `Korisnik "${replyUsername}" je odgovorio/la na vaš komentar`,
                            html: `<p>Korisnik "${replyUsername}" je odgovorio/la na vaš komentar, pesma <a href="http://mesecodpapira.com/poezija/${data.slug}">"${data.post}"</a>.</p>
                            <h3>Vaš Komentar:</h3>
                            <p><i>"${data.comment}".</i></p>
                            <h3>Odgovor korisnika "${replyUsername}":</h3>
                            <p><i>"${data.reply}".</i></p>
                            <h3>Datum: </h3><p style="display: inline-block">${data.date}</p>`
                        });
                    }
                }else{
                    if(admin.notifications.otherReplies == true){
                        const commentUsername = data.commentUsername == '' ? 'Anoniman' : data.commentUsername;
                        const replyUsername = data.username == '' ? 'Anoniman' : data.username;
                        await sendEmail({
                            sender: '"Mesec Od Papira" <info@mesecodpapira.com>',
                            recipient: admin.mail,
                            subject: `Korisnik "${replyUsername}" je odgovorio/la na komentar korisnika "${commentUsername}"`,
                            html: `<p>Korisnik "${replyUsername}" je odgovorio/la na komentar korisnika "${commentUsername}", pesma <a href="http://mesecodpapira.com/poezija/${data.slug}">"${data.post}"</a>.</p>
                            <h3>Komentar korisnika "${commentUsername}":</h3>
                            <p><i>"${data.comment}".</i></p>
                            <h3>Odgovor korisnika "${replyUsername}":</h3>
                            <p><i>"${data.reply}".</i></p>
                            <h3>Datum: </h3><p style="display: inline-block">${data.date}</p>`
                        });
                    }
                }
                break;
            case 'subscribe':
                if(admin.notifications.registeredUsers == true){
                    await sendEmail({
                        sender: '"Mesec Od Papira" <info@mesecodpapira.com>',
                        recipient: admin.mail,
                        subject: 'Imate novog pratioca',
                        html: `<p>Korisnik sa imejlom <i>${data.email}</i> se prijavo na obaveštenja sa vašeg sajta.</p>
                        <h3>Datum: </h3><p style="display: inline-block">${data.date}</p>`
                    })
                }
                break;
        }
    }
    if(type == 'two-step'){
        await sendEmail({
            sender: '"Mesec Od Papira" <info@mesecodpapira.com',
            recipient: admin.mail,
            subject: 'Verifikacioni kod',
            html: `<p>Zdravo Kristina, vaš verifikacioni kod je ${data.code}</p>`
        });
    }
}

async function sendEmail(data){
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    const mailOptions = {
        from: data.sender,
        to: data.recipient,
        subject: data.subject,
        text: '',
        html: data.html
    }
    try{
        transporter.sendMail(mailOptions, (err, info)=>{
            if(err) return console.log(err);
    
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        });
    }catch(e){
        console.log(e);
    }
}

module.exports = {
    info: info
}

