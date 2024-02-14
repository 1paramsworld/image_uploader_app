const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'param270604@gmail.com', 
        pass: 'pmli gtxp xctm ppzj' 
    }
});

const sixDigitRandomNumber = Math.floor(100000 + Math.random() * 900000);


const mailOptions = {
    
    from: 'param270604@gmail.com',
    to: 'jainish2107@gmail.com',
    subject: `${sixDigitRandomNumber}`, 
    text:`"here is your otp:${sixDigitRandomNumber}"`

};
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Email sent:', info.response);
    }
})
