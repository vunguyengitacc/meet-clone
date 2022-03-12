const nodemailer = require('nodemailer');

const createContent = (content) => {
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

const sendMail = (target, subject, content) => {
  let mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'ngha.vu.dev@gmail.com',
      pass: '123456@bscJ',
    },
  });

  let mailDetails = {
    from: 'ngha.vu.dev@gmail.com',
    to: target,
    subject: subject,
    html: createContent(content),
  };

  mailTransporter.sendMail(mailDetails, function (err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log('Email sent successfully');
    }
  });
};

export { sendMail };
