# Pähkinä

[![Build Status](https://travis-ci.org/Kauhsa/pahkina.svg?branch=master)](https://travis-ci.org/Kauhsa/pahkina)

An exercise in tinkering with TypeScript, React etc. See it live here:
http://ugly-growth.surge.sh/

Tested with Chrome 53, node v6.5.0, npm 3.10.3 and OSX 10.11.6.

## Everything notable

- Single-page TypeScript application made with React – it doesn't have a backend
  at all, actually.
- Code editor that shows errors in your CSV on real-time!
- Computing offloaded to Web Worker thread, so calculating wages from even a
  large dataset shouldn't block the rendering thread. Well, if you copy a
  humongous CSV file to the ACE editor, that might hang the rendering thread
  regardless ;)
- Shows slightly more information about the wages than was requested. Wage
  entries are clickable!

## Not so notable

- No tests for frontend. Boo!
- I'm slightly scared that there's still bugs lurking in the wage calculation.
  :-)
- Does not react to overlapping shifts or different names with same ID.

## Discoveries

- JS annoyances leak a lot to TypeScript – well, that's not surprising, but lack
  of integer types etc. is annoying. In general, Java & Scala and other actually
  strongly typed languages.
- Everything doesn't have TypeScript type declarations. Even things that do can
  be pretty weird to work with – imports do surprising things.
- Java 8 Date API wipes the floor with moment.js, and I didn't quickly find a
  better candidate. Time zone always lurking in objects, everything is mutable,
  etc.
- React is very good with TypeScript – no need for goofy `.propTypes` stuff.

## Stuff I was thinking

- The code is prepared to have wage parameters fully configured (wages, when
  overtime and evening times are etc.), which makes it a bit complex, but
  changing the parameters is exposed to the frontend.

## Testing and running

First, install packages (I'm assuming that you have node & npm already installed):
```
$ npm install
```

The application can be started with running the following and then opening
browser in http://localhost:8080/webpack-dev-server/:
```
$ npm run start
```

You can run tests once with:
```
$ npm test
```

Or, if you want to keep running tests whenever the code is changed:
```
$ npm run test-watch
```

## Directory structure

Tests are as `.spec.ts` files alongside other source, not in their own folder.

```
├── README.md
├── declarations                    # dummy declarations needed for TypeScript to stop complaining
├── dist                            # compiled and webpacked application goes here (doesn't exist initially)
├── karma.conf.js                   # test runner config
├── package.json                    # dependencies & scripts
├── src                             # source code
│   ├── frontend                    # all source related to frontend app
│   │   ├── components              # React components
│   │   └── wageCalculationWorker   # Web worker for calculating wages
│   ├── hourEntry                   # CSV parsing
│   └── paymentCalculator           # Wage calculation
├── tsconfig.json                   # TypeScript compiler settings
└── webpack.config.js               # Webpack configuration (tests change this slightly)
```
