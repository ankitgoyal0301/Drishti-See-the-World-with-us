import { sendEmail } from './send-email';

sendEmail(
    'goyalankit3129@gmail.com',
    'Greeting!',
    'I think you are fucked up how many letters you get.'
).then(() => {
    console.log('Our email successful provided to device mail ');
});