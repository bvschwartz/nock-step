nock-step
===

This project lets you watch a nock expression get processed step by step in a browser.

what is nock?
---
This project won't make any sense unless you know about nock.  Nock is the virtual machine of [Urbit](http://urbit.org). The complete [spec](https://github.com/urbit/urbit/blob/master/Spec/nock/5.txt) fits on a page. Nock-step uses the terminology from the [nock reference](https://github.com/urbit/urbit/blob/master/urb/zod/pub/doc/nock/reference.md).

running nock-step
---
The only user interface element at this time is the "Step" button. You specify the nock expression in the url.  For example, an expression to increment the number 99 is [99 [4 0 1]].  So run the web page with the query string "?nock=[99 [4 0 1]]". Like [this](https://bvschwartz.github.io/nock-step/?nock=[99+[4+0+1]]).

nock-step examples:
---
* [Decrement 1](https://bvschwartz.github.io/nock-step/?nock=[1+[2+[[[[1+[6+[[5+[[4+[0+3]]+[0+5]]]+[[0+3]+[2+[[[0+2]+[4+[0+3]]]+[0+4]]]]]]]+[0+1]]+[1+0]]+[1+[2+[[0+1]+[0+4]]]]]]])
* [Decrement 10](https://bvschwartz.github.io/nock-step/?nock=[10+[2+[[[[1+[6+[[5+[[4+[0+3]]+[0+5]]]+[[0+3]+[2+[[[0+2]+[4+[0+3]]]+[0+4]]]]]]]+[0+1]]+[1+0]]+[1+[2+[[0+1]+[0+4]]]]]]])
* [Decrement 100](https://bvschwartz.github.io/nock-step/?nock=[100+[2+[[[[1+[6+[[5+[[4+[0+3]]+[0+5]]]+[[0+3]+[2+[[[0+2]+[4+[0+3]]]+[0+4]]]]]]]+[0+1]]+[1+0]]+[1+[2+[[0+1]+[0+4]]]]]]])

note:
---
For the convenience of running directly out of github (using GitHub Pages), the repo contains `bundle.js` buit by `browserify ux.js > bundle.js`.

