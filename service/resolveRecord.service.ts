import { promises as dns, type MxRecord } from 'node:dns';

export const resolveRecord = async (domain: string): Promise<MxRecord[]> => {
    try {

        return await dns.resolveMx(domain);

    } catch (error) {

        console.error(`Error resolving MX records for domain ${domain}:`, error);
        return []; // Return an empty array if there's an error

    }
}