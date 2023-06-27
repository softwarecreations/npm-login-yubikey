[![NPM downloads](http://img.shields.io/npm/dt/npm-login-yubikey.svg)](https://npmjs.org/package/npm-login-yubikey)
[![Version](https://img.shields.io/npm/v/npm-login-yubikey.svg)](https://www.npmjs.com/package/npm-login-yubikey)
[![Dependencies](https://img.shields.io/librariesio/release/npm/npm-login-yubikey)](https://libraries.io/npm/npm-login-yubikey)
[![License](https://img.shields.io/npm/l/npm-login-yubikey)](https://npmjs.org/package/npm-login-yubikey)
![Code size](https://img.shields.io/github/languages/code-size/softwarecreations/npm-login-yubikey.svg)

# npm-login-yubikey

Login to NPM, semi or fully automated, headless, scripted, non-interactive with a YubiCo YubiKey for 2FA (two factor authentication)

## Project goals
* No dependencies
* Small, simple, easy to audit, yourself

Inspired by my previous project
> * Original version: https://www.npmjs.com/package/npm-automated-login-totp
> * Paranoid version: https://www.npmjs.com/package/npm-login-yubikey < You are here

Read that readme before using this.

## Installation - 2 minute setup
Example username is: `bob`

1. `npm install -g npm-login-yubikey`

2. Install yubikey-manager aka `ykman`
> * Debian/Ubuntu/PopOS `apt install yubikey-manager`
> * Fedora/Redhat `yum install yubikey-manager`
> * In Python: `pip install --user yubikey-manager`
> * Windows `choco install yubikey-manager`
> * Mac `brew install ykman`

3. Enable 2FA on your NPM account
> * (on a secure computer with YubiKey plugged in)
> * Open your NPMjs.com profile page
> * https://www.npmjs.com/settings/bob/profile > Two-Factor Authentication

4. Click the link that says "Can't scan and need to type in the text code? Click here."
> Let's pretend it says Your two-factor secret is: FOOBAR

5. Save your secret as 'npm' into your YubiKey
> * (leave out --touch if you want fully-automated, instead of semi-automated)
> * `ykman oath accounts add --touch npm FOOBAR`

6. Set environment variables for when you run `npm-login-yubikey`
> On Linux, you could add this to your `~/.profile` or `~/.bashrc`
> On Windows/Mac, figure it out then please PR this Readme.
> ```
> export NPM_USER='bob'
> export NPM_PASS='best-password-ever'
> export NPM_EMAIL='bob@email.com'
> export NPM_OTPNAME='npm'
> ```

7. Close and reopen terminal

8. Run `npm-login-yubikey`
> You should see: Logged in as bob on https://registry.npmjs.org/

## Notes
* Tested with YubiKey 5 Nano
* We call the TOTP key 'npm' but you can call it whatever you like.

### Provide 1 or more additional login options - optional
```
export NPM_EXTRA0='--registry=https://foo.com'
export NPM_EXTRA1='--scope=@orgname'
# ...
export NPM_EXTRA9='--future=proof'
```

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
