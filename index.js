#!/usr/bin/env node
'use strict';
const { spawn, execSync } = require('child_process');

const username  = process.env.NPM_USER;
const password  = process.env.NPM_PASS;
const email     = process.env.NPM_EMAIL;
const otpName   = process.env.NPM_OTPNAME || 'npm';
const verbose   = Number(process.env.NPM_VERBOSE || 0); // provide 1 or 0
const quiet     = Number(process.env.NPM_VERBOSE || 0); // provide 1 or 0

let npmP=null, yubiP=null;
const exitError = s => {
  process.stderr.write(colors.red(`Error: ${s}\n`));
  if (npmP  !==null)   npmP.stdin.end();
  if (yubiP!==null) yubiP.stdin.end();
  process.exit(1);
};

const doNpmLogin = otp => {
  const npmArgsA = ['login', '--auth-type=legacy', `--otp=${otp}`];
  let count=0, haveLoggedIn=0; // count helps us confirm that the order that we do things makes sense.

  for (let i=0; i<10; ++i) if (process.env[`NPM_EXTRA${i}`]) npmArgsA.push(process.env[`NPM_EXTRA${i}`]);

  npmP = spawn('npm', npmArgsA, { stdio:'pipe', shell:true }); // redefine npmP (created above exitError)

  npmP.on('exit', code => {
    if (!haveLoggedIn || verbose) console.log(`NPM HAS ENDED BY ITSELF, with code: ${code}`);
    process.exit(code);
  });

  const assertIsStep = step => {
    if (count++ <= step) return;
    exitError(`count:${count} > step:${step}`);
  };

  const npmWrite = s => {
    if (verbose) console.log(`TO NPM: ${s}`);
    npmP.stdin.write(s + '\n');
  };

  const bit = x => x ? 1 : 0;

  // if you think the code could be simplified, you're right. But remember that NPM has changed a few times, and the code must be flexible enough to keep working with minor changes to NPM's user interface.

  npmP.stderr.on('data', data => {
    const line = data.toString().replace(/npm *\n/i,'npm').replace(/npm[ -]?notice\n/i,'npm notice').trim();
    if (line.match(/^(npm)? ?(notice)?$/i)) return;
    if (line.match(/check your email/i)) exitError(`You have not configured TOTP on your NPM account, enable 2FA or whatever.`);
    const isLoginMsg   = bit(line.match(/log[ -]?in on /i));
    const isAuthMsg    = bit(line.match(/one[ -]?time[ -]password|OTP|auth(enticator)?[ -]app/i));
    const isAddUserMsg = bit(line.match(/adduser.+split.+login.+register.+alias.+command/i)); // silence this NPM warning that we have already taken care of: npm WARN adduser `adduser` will be split into `login` and `register in a future version. `adduser` will become an alias of `register`. `login` (currently an alias) will become its own command.
    const isUnknownMsg = bit(!isLoginMsg && !isAuthMsg && !isAddUserMsg);
    if (!quiet && (verbose || isUnknownMsg)) {
      console.log(`isLoginMsg:${isLoginMsg}, isAuthMsg:${isAuthMsg}, isAddUserMsg:${isAddUserMsg}, isUnknownMsg:${isUnknownMsg}`);
      console.log(`NPM UNKNOWN STDERR: ${line}`);
    }
  }); // npmP.stderr.on('data'


  npmP.stdout.on('data', data => {
    const npmS = data.toString();
    if (verbose) console.log('VERBOSE PASSTHROUGH: ' + npmS);
    if (npmS.match(/check your email/i)) {
      exitError(`You have not configured TOTP on your NPM account, enable 2FA or whatever.`);
    } else if (npmS.match(/username/i)) {
      assertIsStep(0);
      npmWrite(username);
    } else if (npmS.match(/password/i)) {
      assertIsStep(1);
      npmWrite(password);
    } else if (npmS.match(/email/i)) {
      assertIsStep(2);
      npmWrite(email);
    } else if (npmS.match(/logged in (as|on)/i)) {
      haveLoggedIn = 1;
      if (!quiet) console.log(npmS.trim().replace('in on',`in as ${username} on`));
    } else if (npmS.match(/.*err.*/i)) {
      console.log(`Unknown error`)
      npmP.stdin.end();
    } else if (!verbose && !quiet) { // if it is verbose then we already showed it above with VERBOSE PASSTHROUGH
      console.log((npmS.match(/npm notice/i) ? 'NOTICE' : 'Unknown NPM output') + ' (NOT QUIET): ' + npmS);
    }
  }); // /npmP.stdout.on('data'
}; // /doNpmLogin

const getYubiKeyOtpAndLogin = () => {
  yubiP = spawn('ykman', ['oath','accounts','code'], { stdio:'pipe', shell:true }); // redefine yubiP (created above exitError)
  yubiP.stderr.on('data', errData => {
    const errS = errData.toString();
    if (errS.match(/touch.+?yubi/i)) {
      console.log(`Touch your YubiKey to get '${otpName}' OTP`);
      if (!verbose) return;
    }
    console.log(`YubiKey error said: ${errS}`);
  });
  yubiP.stdout.on('data', yubiData => {
    const yubiS = yubiData.toString();
    if (verbose) console.log(`YubiKey said: ${yubiS}`);
    if (yubiS.match(/touch.+?yubi/i)) return console.log(`Touch your YubiKey to get '${otpName}' OTP`);
    if (yubiS.match(/\w+\s+(\d{6})/)) {
      const linesA = yubiS.split('\n');
      const otpRegex = yubiS.match(RegExp(`${otpName}\\s+(\\d{6})`));
      if (otpRegex!==null) {
        const otp = otpRegex[1];
        if (!quiet) console.log(`YubiKey gave '${otpName}' OTP: ${otp}`);
        doNpmLogin(otp);
      } else {
        console.log(`YubiKey didn't give OTP name '${otpName}'\nOnly:\n${yubiS}`);
      }
    }
  });
};

try {
  execSync('ykman --version');
} catch (err) {
  exitError("Please ensure that 'ykman' aka 'yubikey-manager' is installed.");
}
getYubiKeyOtpAndLogin();
