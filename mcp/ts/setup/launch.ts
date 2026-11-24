import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';

// Part of the security core of the account pages (see session.ts for the threat model): how the
// form URL travels from this process to the user's browser without ever being on a command line.

// The launcher is given the PATH of the launch file, never the form URL: a command line is
// readable by every local user (ps, /proc/<pid>/cmdline) for as long as the process lives, and
// a freshly started browser keeps its argv for its whole life. The path is ONE argv element
// and no shell is involved on any platform, so nothing in it can be interpreted. Windows uses
// rundll32's handler rather than `cmd /c start`, whose argument goes through cmd.exe's parser.
export function browserCommand (platform: string, file: string): { command: string, args: string[] } {
    if (platform === 'darwin') {
        return { 'command': 'open', 'args': [ file ] };
    }
    if (platform === 'win32') {
        // by absolute path: a bare command name is looked up in the working directory before
        // PATH on Windows, so a rundll32.exe planted there would otherwise be the one that runs
        const systemRoot = process.env['SystemRoot'] || process.env['windir'] || 'C:\\Windows';
        return { 'command': path.win32.join (systemRoot, 'System32', 'rundll32.exe'), 'args': [ 'url.dll,FileProtocolHandler', file ] };
    }
    return { 'command': 'xdg-open', 'args': [ file ] };
}

// Where the launch file's private directory is created. The temp directory, except where
// snap is installed: a snap-packaged browser (the default Firefox and Chromium on Ubuntu)
// runs with its own private /tmp and may not read hidden directories under home, so the one
// place it and every other browser can read is a non-hidden directory in home. It exists for
// the seconds between the launch and the first page load.
export function defaultLaunchRoots (): string[] {
    if (process.platform === 'linux' && fs.existsSync ('/snap/bin')) {
        return [ os.homedir (), os.tmpdir () ];
    }
    return [ os.tmpdir () ];
}

// The page the browser is launched on: it only forwards to the form. The token it carries is
// 32 hex characters and the port a number, so there is nothing to escape.
export function launchPage (url: string): string {
    return '<!doctype html>\n<meta charset="utf-8">\n<meta name="referrer" content="no-referrer">\n'
        + '<meta http-equiv="refresh" content="0;url=' + url + '">\n'
        + '<title>Opening the CCXT account setup…</title>\n'
        + '<p>Opening the account setup form… <a rel="noreferrer" href="' + url + '">Continue</a> if nothing happens.</p>\n';
}

export function openInBrowser (file: string): Promise<void> {
    return new Promise ((resolve, reject) => {
        if (process.platform !== 'darwin' && process.platform !== 'win32' && !process.env['DISPLAY'] && !process.env['WAYLAND_DISPLAY']) {
            reject (new Error ('no graphical session'));
            return;
        }
        const { command, args } = browserCommand (process.platform, file);
        let settled = false;
        const settle = (error?: Error) => {
            if (!settled) {
                settled = true;
                if (error === undefined) {
                    resolve ();
                } else {
                    reject (error);
                }
            }
        };
        let child;
        try {
            child = spawn (command, args, { 'detached': true, 'stdio': 'ignore', 'windowsHide': true });
        } catch (e: any) {
            // the message is rebuilt rather than forwarded: a spawn error may quote its argv
            settle (new Error ('could not start ' + command));
            return;
        }
        child.on ('error', () => settle (new Error ('could not start ' + command)));
        // launchers exit right after handing the file over; a non-zero status means they found
        // no browser. One that is still running after the grace period is taken as launched.
        child.on ('exit', (code) => settle ((code === 0 || code === null) ? undefined : new Error (command + ' exited with status ' + code)));
        const grace = setTimeout (() => settle (), 1500);
        grace.unref ();
        child.unref ();
    });
}
