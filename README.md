# ShoppingCart

Aplicativo de carrinho de compras desenvolvido com Expo, React Native, Expo Router e uma API JSON local em Express.

## Funcionalidades

- Navegacao por abas: inicio, busca, carrinho e perfil
- Listagem, busca e detalhes de produtos
- Favoritos persistidos localmente
- Carrinho com controle de quantidade e contador no icone
- Cupons ativos com uso unico
- Checkout com endereco, entrega, pagamento e resumo de valores
- Frete por metodo de entrega: regular, expressa ou retirada
- Conclusao de compra com registro em pedidos
- Tela de notificacoes do usuario
- Push notifications via Firebase Cloud Messaging em build Android nativa
- Painel administrativo para produtos e cupons
- Validacoes em cadastro/edicao de produtos e cupons
- Modais de confirmacao para exclusao
- Mensagens de sucesso temporarias

## Tecnologias

- Expo SDK 54
- React Native
- TypeScript
- Expo Router
- React Navigation
- Expo Notifications
- Firebase Cloud Messaging
- Express
- Firebase Admin SDK

## Requisitos

- Node.js e npm
- Conta Expo/EAS para gerar build Android com push real
- Projeto Firebase com app Android configurado
- `google-services.json` na raiz do projeto
- `shopping-api/firebase-service-account.json` para a API enviar push via FCM

Os arquivos `google-services.json`, `shopping-api/firebase-service-account.json` e `.env.local` ficam fora do Git por seguranca.

## Configuracao local

Instale as dependencias do app:

```bash
npm install
```

Instale as dependencias da API:

```bash
cd shopping-api
npm install
```

Crie `.env.local` na raiz do app apontando para a API. Para celular fisico, use o IP do computador na rede:

```env
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:3000
```

Exemplo:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.5:3000
```

## Como rodar no navegador

Em um terminal, suba a API:

```bash
npm run api:dev
```

Em outro terminal, rode o app web:

```bash
npm run web
```

O navegador permite testar produtos, admin, carrinho, checkout, pedidos e notificacoes internas. Push Firebase real exige build Android nativa.

## Como rodar com push Firebase real

1. Faca login no Expo:

```bash
npx eas-cli@latest login
```

2. Gere a build Android de desenvolvimento:

```bash
npm run build:android:dev
```

3. Instale o APK gerado pelo EAS no Android.

4. Deixe a API rodando:

```bash
npm run api:dev
```

5. Inicie o Metro para dev client:

```bash
npm run dev-client
```

6. Abra o app instalado no Android e aceite a permissao de notificacoes.

Quando a compra for concluida, a API registra uma notificacao interna e envia push via Firebase para os tokens registrados.

## Firebase

O app Android usa o package:

```text
com.mateus.shoppingcart
```

Arquivos esperados:

```text
google-services.json
shopping-api/firebase-service-account.json
```

Para build remota no EAS, o arquivo `google-services.json` tambem deve estar cadastrado como variavel de arquivo no EAS:

```text
GOOGLE_SERVICES_JSON
```

## Scripts principais

```bash
npm start
npm run web
npm run android
npm run ios
npm run lint
npm run api:dev
npm run dev-client
npm run build:android:dev
```

## API

Endpoints principais:

```text
GET    /produto
POST   /produto
PUT    /produto/:id
DELETE /produto/:id

GET    /cupom
POST   /cupom
PUT    /cupom/:id
DELETE /cupom/:id

GET    /carrinho
GET    /carrinho/resumo?cupom=CODIGO&entrega=regular
POST   /carrinho
PUT    /carrinho/:id
DELETE /carrinho/:id
DELETE /carrinho
POST   /carrinho/finalizar

GET    /pedido
GET    /notificacao
GET    /push-token
POST   /push-token
```

## Estrutura

```text
app/          Rotas e layouts do Expo Router
screens/      Telas da aplicacao
components/   Componentes reutilizaveis
contexts/     Estados compartilhados
hooks/        Hooks reutilizaveis
services/     Cliente da API e push notifications
shopping-api/ API JSON consumida pelo app
assets/       Imagens e icones
```

## Validacao

```bash
npm run lint
npx tsc --noEmit
cd shopping-api
npm run build
```
