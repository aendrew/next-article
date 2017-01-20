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

## Run

Run article through the router (localhost:5050):

```
make run
```

### Run with content from CAPI test environment or an S3 bucket of mock content

```
make run-experimental-capi
```
or
```
make run-experimental-s3
```

This is primarily to allow development of 'Rich Journalism' features before they appear in CAPI production.
When using these commands a GET request to the `/content/<UUID>` route of this app will fetch experimental content from the specified source, use es-interface* to model that content in the same way that CAPI content is currently (in production) modelled upon ingestion into the Next ES cluster, and then render an article with that modelled content. It's a bypass for the Next ES cluster, essentially.

The S3 bucket of mock api responses is called `rj-xcapi-mock`. If you want to add an object, its key should be its UUID, it should be `'Content-type: application/json'` and it should allow read permissions to all (for now, at least).

*via es-interface's 'preview' endpoint
