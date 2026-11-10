import net from "node:net";

enum SMTPStageName {
    CHECK_CONNECTION_ESTABLISHED,
    SEND_EHLO,
    SEND_MAIL_FROM,
    SEND_RCPT_TO,
    SEND_QUIT
};

export const testInboxOnServer = async (smtpHostName: string, emailInbox: string) => {
    return new Promise((resolve, reject) => {
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
                nextStage: SMTPStageName.CHECK_CONNECTION_ESTABLISHED
            }
        };

        const socket = net.createConnection(25, smtpHostName);
        let currentStageName: SMTPStageName = SMTPStageName.CHECK_CONNECTION_ESTABLISHED;

        socket.on("data", (data: Buffer) => {
            const response = data.toString('utf-8');
            const currentStage = SMTPStages[currentStageName];

            switch (currentStageName) {
                case SMTPStageName.CHECK_CONNECTION_ESTABLISHED:
                    if (!response.startsWith(currentStage.expectedResponse.toString())) {
                        console.error(response);
                        reject(new Error(`Failed to connect to ${smtpHostName}.`));
                    }

                    currentStageName = currentStage.nextStage;
                    break;

                case SMTPStageName.SEND_EHLO:
                case SMTPStageName.SEND_MAIL_FROM:
                case SMTPStageName.SEND_RCPT_TO:
                    const expectedResponse = SMTPStages[currentStageName].expectedResponse;
                    const responseCode = parseInt(data.toString('utf-8').substring(0, 3), 10);
                    if (responseCode === expectedResponse) {
                        currentStageName = currentStage.nextStage;
                    } else {
                        console.error(response);
                        reject(new Error(`Failed to connect to ${smtpHostName}.`));
                    }
            }
        });
        

        socket.on("connect", () => {
            console.log(`Connected to: ${smtpHostName}`);
        });
    });
}