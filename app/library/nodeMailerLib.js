const nodemailer = require('nodemailer');

// Generate SMTP service account from ethereal.email
/* nodemailer.createTestAccount((err, account) => {
    console.log(account);
    if (err) {
        console.error('Failed to create a testing account. ' + err.message);
        return process.exit(1);
    } */

let mailer = (data)=>{
    // Create a SMTP transporter object
    let transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: 'rzs4p2afeeijzhe5@ethereal.email',
            pass: 'GzS6P25X5EChqexaqA'
        },
        tls: {
          rejectUnauthorized: false
        }
    });

    // Message object
    /* let message = {
        from: 'Admin <rzs4p2afeeijzhe5@ethereal.email>',
        to: 'Recipient <ballakkurkarthik1@gmail.com>',
        subject: 'welcome',
        text: 'Hi ',
        html: '<p><b>Hello</b> to myself!</p>'
    }; */
     let message = {
        from: 'Admin <rzs4p2afeeijzhe5@ethereal.email>',
        to: `${data.firstName} <${data.email}>`,
        subject: `${data.subject}`,
        text: `hi ${data.firstName} ${data.message}`,
        html:`<p>hi ${data.firstName} ${data.message}</p>`
    };

    transporter.sendMail(message, (err, info) => {
        if (err) {
            console.log('Error occurred. ' + err.message);
            return process.exit(1);
        }

        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    });
}
module.exports = {
    mailer
}