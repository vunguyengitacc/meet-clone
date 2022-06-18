const nodemailer = require('nodemailer');

const createInviteContent = (content) => {
  return `
    <div>
        <div style="        
            width: 50%;
            margin-left: 25%;
            margin-bottom: 10px;
            padding: 20px;
            border-radius: 10px;
            border: 1px solid black;
        ">
            <div style="
                width: 100%;
                height: auto    
            ">
                REMINDER FROM <b> LET'S MEET </b>
            </div>
            <div>
                ${content}
            </div>
        </div>
    </div>
  `;
};

const createVerifyEmailContent = (content) => {
  return `
    <div>
        <div style="        
            width: 50%;
            margin-left: 25%;
            margin-bottom: 10px;
            padding: 20px;
            border-radius: 10px;
            border: 1px solid black;
        ">
            <div style="
                width: 100%;
                height: auto    
            ">
                PLEASE VERIFY YOU EMAIL FROM <b> LET'S MEET </b>
            </div>
            <div>
                ${content}
            </div>
        </div>
    </div>
  `;
};

const sendMail = (target, subject, content) => {
  let mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_NAME,
      pass: process.env.MAIL_PASS,
    },
  });

  let mailDetails = {
    from: 'ngha.vu.dev@gmail.com',
    to: target,
    subject: subject,
    html: createInviteContent(content),
  };

  mailTransporter.sendMail(mailDetails, function (err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log('Email sent successfully');
    }
  });
};

const sendVerifyMail = (target, subject, content) => {
  let mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_NAME,
      pass: process.env.MAIL_PASS,
    },
  });

  let mailDetails = {
    from: 'ngha.vu.dev@gmail.com',
    to: target,
    subject: subject,
    html: createVerifyEmailContent(content),
  };

  mailTransporter.sendMail(mailDetails, function (err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log('Email sent successfully');
    }
  });
};


export { sendMail, sendVerifyMail };
