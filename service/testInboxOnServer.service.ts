import net from "node:net";

enum SMTPStageName {
    CHECK_CONNECTION_ESTABLISHED,
    SEND_EHLO,
    SEND_MAIL_FROM,
    SEND_RCPT_TO,
    SEND_QUIT
};



export const testInboxOnServer = async (smtpHostName: string, emailInbox: string) => {
    const SMTPStages = {
        [SMTPStageName.CHECK_CONNECTION_ESTABLISHED]: {
            expectedResponse: 220,
            nextStage: SMTPStageName.SEND_EHLO
        },
        [SMTPStageName.SEND_EHLO]: {
            command: `EHLO mail.example.com\r\n`,
            expectedResponse: 250,
            nextStage: SMTPStageName.SEND_MAIL_FROM
        },
        [SMTPStageName.SEND_MAIL_FROM]: {
            command: `MAIL FROM:<name@example.org>\r\n`,
            expectedResponse: 250,
            nextStage: SMTPStageName.SEND_RCPT_TO
        },
        [SMTPStageName.SEND_RCPT_TO]: {
            command: `RCPT TO:<other@example.com>\r\n`,
            expectedResponse: 250,
            nextStage: SMTPStageName.SEND_QUIT
        },
        [SMTPStageName.SEND_QUIT]: {
            command: `QUIT\r\n`,
            expectedResponse: 221,
        }
    }

    return new Promise((resolve, reject) => {
        const socket = net.createConnection(25, smtpHostName);

        socket.on("data", (data: Buffer) => {
            console.log(data.toString('utf-8'));
        });

        socket.on("error", (err: Error) => {
            console.error(err);
            reject(err);
        });

        socket.on("connect", () => {
            console.log(`Connected to: ${smtpHostName}`);
        });
    });
}