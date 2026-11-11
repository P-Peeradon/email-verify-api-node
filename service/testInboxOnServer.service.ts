import net from "node:net";

enum SMTPStageName {
    CHECK_CONNECTION_ESTABLISHED,
    SEND_EHLO,
    SEND_MAIL_FROM,
    SEND_RCPT_TO,
    SEND_QUIT
};

type SMTPStage = {
    command?: string;
    expectedResponse: number;
    nextStage?: SMTPStageName;
};

export const testInboxOnServer = async (smtpHostName: string, emailInbox: string) => {
    return new Promise((resolve, reject) => {
        const SMTPStages: {[key: string]: SMTPStage} = {
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
        };

        const socket = net.createConnection(25, smtpHostName);
        let currentStageName: SMTPStageName = SMTPStageName.CHECK_CONNECTION_ESTABLISHED; 

        socket.on("data", (data: Buffer) => {
            const response = data.toString('utf-8');
            let currentStage = SMTPStages[currentStageName];

            switch (currentStageName) {

                case SMTPStageName.CHECK_CONNECTION_ESTABLISHED: {
                    if (!response.startsWith(currentStage?.expectedResponse?.toString() ?? "000")) {
                        console.error(response);
                        return reject(new Error(`Failed to connect to ${smtpHostName}.`));
                    }

                    if (!currentStage?.nextStage) {
                        return reject(new Error(`No next stage defined for ${currentStageName}.`));
                    }

                    currentStageName = currentStage?.nextStage;
                    currentStage = SMTPStages[currentStageName];

                    if (!currentStage?.command) {
                        return reject(new Error("Implementation error."));
                    }

                    socket.write(currentStage?.command || "", () => {
                        console.log(`----> ${currentStage?.command}`);
                    });
                    break;

                }

                case SMTPStageName.SEND_EHLO: {
                    if (!response.startsWith(currentStage?.expectedResponse?.toString() ?? "000")) {
                        console.error(response);
                        return reject(new Error(`Failed to connect to ${smtpHostName}.`));
                    }
                    
                }

            }
        });
        

        socket.on("connect", () => {
            console.log(`Connected to: ${smtpHostName}`);
        });
    });
}