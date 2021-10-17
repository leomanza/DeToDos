# DeToDos
DeToDos - Decentralized ToDo List "Para Todos"

Colaborative todo app on ipfs 

This project enable collaborative ToDo list/task among peers.

Techs: NextJs - web3.storage (IPFS/Filecoin). 
---

## Getting Started

### Generate a web3.storage API token
1. Create a [web3.storage account](https://web3.storage/login/)
2. Create a API token for the your DeTodos app

### Local environment
1. set NEXT_PUBLIC_WEB3_STORAGE_TOKEN env variable with the token created before
```json
module.exports = {
  ...
  env: {
    NEXT_PUBLIC_WEB3_STORAGE_TOKEN:'YOUR_APP_WEB3_API_TOKEN'
  }
}
```
2. run the development server:

```bash
npm run dev
# or
yarn dev
```

### Prod environment
1. deploy
```bash
vercel
```
2. add env variable
```bash
vercel env add NEXT_PUBLIC_WEB3_STORAGE_TOKEN
```
copy/paste API token