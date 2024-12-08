import { fileURLToPath } from 'url';
import path from 'path';
import {writeFileSync} from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appPath = path.resolve(__dirname, '../../');

export function getRootPath() {
    return appPath;
}

export function getLogDirectoryPath() {
    return getRootPath() + '/logs';
}

export function smartLog(data: any, tag: string|undefined = undefined) {
    try {
        const dataString = JSON.stringify(data, null, 2);
        smartLogString(dataString, tag);
    } catch (e) {
        console.error(e)
    }
}

export function smartLogString(data: string, tag: string|undefined = undefined) {
    try {
        let fileName = 'log_';
        if (tag) {
            fileName += `_${tag}__`;
        }

        fileName += getCurrentTime();
        const logPath = getLogDirectoryPath() + '/' + fileName;

        writeFileSync(logPath, data);
    } catch (e) {
        console.error(e)
    }
}

function getCurrentTime() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed, so add 1
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}_${month}_${day}___${hours}_${minutes}_${seconds}`;
}