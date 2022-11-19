# npm-login-yubikey

Login to NPM, semi or fully automated, headless, scripted, non-interactive with a YubiCo YubiKey for 2FA (two factor authentication)

## Project goals
* No dependencies
* Small, simple, easy to audit, yourself

Inspired by my previous project
Original version: https://github.com/softwarecreations/npm-automated-login-totp
Paranoid version: https://github.com/softwarecreations/npm-login-yubikey < You are here

Read that readme before using this.

## Installation - 2 minute setup
Example username is: `bob`

1. `npm install -g npm-login-yubikey`

2. Install yubikey-manager aka ykman
On Debian you'd just run `apt install yubikey-manager`
On Windows/Mac, figure it out then please PR this Readme.

3. (On a secure computer with YubiKey plugged in) Enable 2FA on your NPM account
Open your NPMjs.com profile page
https://www.npmjs.com/settings/bob/profile > Two-Factor Authentication

4. Click the thing that says "Can't scan and need to type in the text code? Click here."
Let's pretend it says Your two-factor secret is
FOOBAR

5. Save your secret as 'npm' into your YubiKey
(leave out --touch if you want fully-automated, instead of semi-automated)
`ykman oath accounts add --touch npm FOOBAR`

6. Set environment variables for when you run `npm-login-yubikey`
On Linux, you could add this to your `~/.profile` or `~/.bashrc`
On Windows/Mac, figure it out then please PR this Readme.
```
export NPM_USER='bob'
export NPM_PASS='best-password-ever'
export NPM_EMAIL='bob@email.com'
export NPM_OTPNAME='npm'
```

7. Close and reopen terminal

8. Run `npm-login-yubikey`
You should see: Logged in as bob on https://registry.npmjs.org/

## Notes
* Tested with YubiKey 5 Nano
* We call the TOTP key 'npm' but you can call it whatever you like.

Have fun!

### Say thanks
Star the repo
https://github.com/softwarecreations/npm-login-yubikey

### Get notified of significant project changes
Subscribe to this issue https://github.com/softwarecreations/npm-login-yubikey/issues/1

### PR's or issues
Welcome

### License
MIT
