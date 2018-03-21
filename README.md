# shooting-bullet-rain, just download and play!!

It's a shooting game written mainly in javascript.

There is also a score record server. You can host it yourself.

## platform

Chrome, Firefox, IE11, Edge

Some parts of codes use "const", and I realize some browsers don't support.

FPS may different according to the browser you use.

If you have a powerful computer, you can reduce the value of "consts.updatePeriod" in "js/_script-conf.js"

## how to play

Go to https://aaaaagold.github.io/shooting-bullet-rain/index.html for non-download play, but the javascript is written in .html
Or download this repository and open "index-download.html". The javascript is written in different files in folder: "js"

## server.js? score record server?

"server/server.js" is the score record server. Use node(nodejs) to run it at "server" folder

You can conncect to server locally by default, but you can also alter
 - "consts.rankServer" in "js/_script-conf.js" at line 7
 - "const host" and "const port" in "server/server.js" at line 8 and 9 respectively

to make them can be access by remote

## soundtracks

Soundtracks are not done by me. All soundtracks are gathered from some old games. This is just for demo, for handing in homework, and for a work record.

As source code is here, you can replace anything as you like.
