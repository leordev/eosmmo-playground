# EOS MMO Server

Just a proof of concept of a MMO based on EOS chain.

## TCP Game Server

It listens to your gameservers and handle the players actions.

```
npm install -g typescript ts-node ts-node-dev
cd services/gameserver
yarn install
ts-node-dev src/tcp.ts
```

## Frontend

This will be the auth panel and marketplace page.

## Backend API

Will handle Frontend Requests...

## demux <3

As always will listen to chain events and execute effects.
