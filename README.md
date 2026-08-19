# Welcome to TN 👋

## Get started

npx expo start -c --tunnel
npx expo start --localhost -c

## connect to device port

adb reverse tcp:8081 tcp:8081
adb reverse tcp:4005 tcp:4005

## like

## development build

eas build --profile development

## development build just for android

eas build --profile development --platform android

## for see the error log:

example log: "logFiles": [
"https://storage.googleapis.com/eas-workflows-production/logs/b50a5b2e-c16d-4cda-962e-24676e8fd1e1/208f3bf8-8e06-48a2-af42-3e1f1320f12d/2026-06-26T18%3A42%3A858a9057f58f15a0e47b4335f8ce6d864685d489"
],
eas build:view 208f3bf8-8e06-48a2-af42-3e1f1320f12d

فقط تازمانی که مچ تمام نشده میتوان لایک کرد

your connection to this site is not scure

---

////////////////////////////////////////////////////////////////////////////////////////////////////////
EAS_LOCAL_BUILD_WORKINGDIR=~/eas-build-temp eas build --platform android --profile development --local

rouzbehghanavatiyan@IT-Ghanavatiyan:~/projects/tn$ ls
README.md app app.json build-1786858741652.apk build.json declarations.d.ts eas.json eslint.config.js google-services.json ios node_modules package-lock.json package.json scripts src tamagui.config.ts tsconfig.json
rouzbehghanavatiyan@IT-Ghanavatiyan:~/projects/tn$ cd
rouzbehghanavatiyan@IT-Ghanavatiyan:~$ ls
android-sdk projects
rouzbehghanavatiyan@IT-Ghanavatiyan:~$ mkdir -p ~/tmp-build
rouzbehghanavatiyan@IT-Ghanavatiyan:~$ ls
android-sdk projects tmp-build
rouzbehghanavatiyan@IT-Ghanavatiyan:~$ export TMPDIR=~/tmp-build
rouzbehghanavatiyan@IT-Ghanavatiyan:~$ ls
android-sdk projects tmp-build
rouzbehghanavatiyan@IT-Ghanavatiyan:~$ echo "TMPDIR is now: $TMPDIR"
TMPDIR is now: /home/rouzbehghanavatiyan/tmp-build
rouzbehghanavatiyan@IT-Ghanavatiyan:~$ rm -rf /tmp/rouzbehghanavatiyan
rouzbehghanavatiyan@IT-Ghanavatiyan:~$ rm -rf ~/.gradle/caches
rouzbehghanavatiyan@IT-Ghanavatiyan:~$ df -h /tmp
Filesystem Size Used Avail Use% Mounted on
tmpfs 7.9G 3.3M 7.9G 1% /tmp
rouzbehghanavatiyan@IT-Ghanavatiyan:~$ echo 'export TMPDIR=$HOME/tmp-build' >> ~/.bashrc
rouzbehghanavatiyan@IT-Ghanavatiyan:~$ source ~/.bashrc
rouzbehghanavatiyan@IT-Ghanavatiyan:~$ df -h /tmp
Filesystem Size Used Avail Use% Mounted on
tmpfs 7.9G 3.3M 7.9G 1% /tmp
rouzbehghanavatiyan@IT-Ghanavatiyan:~$ cd ~/projects/tn
rouzbehghanavatiyan@IT-Ghanavatiyan:~/projects/tn$ echo "TMPDIR is: $TMPDIR"
TMPDIR is: /home/rouzbehghanavatiyan/tmp-build
rouzbehghanavatiyan@IT-Ghanavatiyan:~/projects/tn$ eas build --platform android --local
★ eas-cli@22.0.0 is now available.
To upgrade, run:
npm install -g eas-cli
Proceeding with outdated version.

Resolved "production" environment for the build. Learn more: https://docs.expo.dev/eas/environment-variables/#setting-the-environment-for-your-builds
No environment variables with visibility "Plain text" and "Sensitive" found for the "production" environment on EAS.

^C
rouzbehghanavatiyan@IT-Ghanavatiyan:~/projects/tn$ ^C
rouzbehghanavatiyan@IT-Ghanavatiyan:~/projects/tn$ ^C
rouzbehghanavatiyan@IT-Ghanavatiyan:~/projects/tn$
