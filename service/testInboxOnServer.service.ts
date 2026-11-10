import net from "node:net";

export const testInboxOnServer = async (smtpHostName: string, emailInbox: string) => {
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