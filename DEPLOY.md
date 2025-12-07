# Deploy no EasyPanel

## Pré-requisitos

- Servidor com EasyPanel instalado
- Git configurado no servidor ou acesso ao repositório

## Opção 1: Deploy via Git (Recomendado)

1. No EasyPanel, crie um novo **App**
2. Selecione **GitHub** ou **GitLab** como source
3. Conecte seu repositório
4. O EasyPanel detectará automaticamente o `Dockerfile`
5. Configure as variáveis de ambiente se necessário:
   - `GEMINI_API_KEY` (se usado no build)
6. Clique em **Deploy**

## Opção 2: Deploy via Docker Compose

1. No EasyPanel, crie um novo **App**
2. Selecione **Docker Compose**
3. Cole o conteúdo do `docker-compose.yml`
4. Clique em **Deploy**

## Opção 3: Deploy Manual via SSH

```bash
# Clone o repositório no servidor
git clone <seu-repositorio> gerente-de-bolso
cd gerente-de-bolso

# Build e run
docker-compose up -d --build
```

## Configurando Domínio

1. Após o deploy, vá em **Domains** no EasyPanel
2. Adicione seu domínio personalizado
3. O EasyPanel gerará automaticamente o certificado SSL via Let's Encrypt

## Variáveis de Ambiente

Se precisar passar a `GEMINI_API_KEY` durante o build:

1. No EasyPanel, vá em **Environment**
2. Adicione:
   ```
   GEMINI_API_KEY=sua-chave-aqui
   ```
3. Modifique o Dockerfile para usar ARG:
   ```dockerfile
   ARG GEMINI_API_KEY
   ENV GEMINI_API_KEY=$GEMINI_API_KEY
   ```

## Verificando o Deploy

Após o deploy, acesse a URL fornecida pelo EasyPanel para verificar se a aplicação está rodando corretamente.

## Troubleshooting

- **Build falha**: Verifique se todas as dependências estão no `package.json`
- **Página em branco**: Verifique o console do navegador para erros de JavaScript
- **404 em rotas**: O `nginx.conf` já está configurado para SPA routing
