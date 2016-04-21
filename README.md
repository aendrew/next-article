# Next Article

[![Circle CI](https://circleci.com/gh/Financial-Times/next-article/tree/master.svg?style=svg)](https://circleci.com/gh/Financial-Times/next-article) [![Coverage Status](https://coveralls.io/repos/github/Financial-Times/next-article/badge.svg?branch=master)](https://coveralls.io/github/Financial-Times/next-article?branch=master)

## Installation

```
git clone https://github.com/Financial-Times/next-article.git
cd next-article
make install
make build
```

## Dependencies

Please install [`next-router`](https://github.com/Financial-Times/next-router) globally. If you can't view the [`next-router`](https://github.com/Financial-Times/next-router) project, please ask someone from Next to add you as a collaborator.

Next article also requires the [libxslt](http://xmlsoft.org/libxslt/) C library - and more specifically its [processing tool](http://xmlsoft.org/XSLT/xsltproc2.html). See the [XSLT section](#xslt) below for more information.

## Run

Run article through the router (localhost:5050):

```
make run
```

## XSLT

### Local install

If you're a Mac user you can install libxslt with [Homebrew](http://brew.sh/), just run `brew update && brew install libxslt`. If you're into Linux then the libxslt package is also available through Aptitude, Yum, RPM etc.

### Heroku

We include a precompiled binary for Heroku in this repo. Because we don't use [buildpacks](https://devcenter.heroku.com/articles/buildpacks) pre-installing dependencies is not an option. Creating a new binary is relatively straightforward - download source, unpack, compile and pack up the result:

```sh
heroku run bash --app <app-name>
$ curl http://xmlsoft.org/sources/libxslt-1.1.28.tar.gz -o /tmp/libxslt.tar.gz
$ tar -C /tmp -xvf /tmp/libxslt.tar.gz
$ cd /tmp/libxslt-1.1.28
$ ./configure --prefix=/app/libxslt && make && make install
$ tar -cvzf /app/heroku-libxslt.tar.gz /app/libxslt/bin/
$ scp /app/heroku-libxslt.tar.gz send@the:file/somewhere
```

Only the `xsltproc` binary is required.
