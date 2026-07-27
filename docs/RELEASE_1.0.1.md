# LifeOS 1.0.1

## Correção do build do frontend

- Configura explicitamente o registry oficial do npm.
- Aumenta os timeouts de download.
- Habilita as tentativas internas do npm.
- Repete `npm install` automaticamente até cinco vezes em caso de falha transitória.
- Usa `--prefer-offline` para reaproveitar pacotes já presentes no cache da camada.
- Executa `npm run typecheck` antes do build do Next.js.

A alteração trata falhas como `ECONNRESET` sem esconder erros permanentes: após cinco tentativas, o build ainda falha com uma mensagem clara.
