# ShoppingCart

Aplicativo mobile de carrinho de compras desenvolvido com Expo, React Native e Expo Router.

## Funcionalidades

- Navegacao por abas: inicio, busca, carrinho e perfil
- Listagem de produtos
- Busca por nome e por categoria
- Marcar e desmarcar produtos como favoritos
- Tela de detalhes do produto
- Carrinho com controle de quantidade
- Contador de itens no icone do carrinho
- Calculo automatico de subtotal, entrega e total em Real
- Mensagem de confirmacao ao adicionar produto no carrinho
- Fluxo de checkout, envio e pagamento
- Tela de perfil com atalhos para pedidos, cupons, favoritos e painel admin
- Telas separadas de pedidos, cupons e favoritos sem menu inferior
- Favoritos persistidos no armazenamento local do app
- Painel administrativo para criar, editar, excluir e buscar produtos e cupons

## Tecnologias

- Expo
- React Native
- TypeScript
- Expo Router
- React Navigation
- Expo Vector Icons

## Como executar

Antes de abrir o app, suba a API JSON que fica na pasta `shopping-api`:

```bash
cd shopping-api
npm install
npm run dev
```

Por padrao a API roda em:

```text
http://localhost:3000
```

Se estiver usando Expo Go em um celular fisico, configure a URL com o IP local do computador na rede Wi-Fi:

```bash
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:3000
```

Exemplo:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.6:3000
```

No navegador ou em emuladores locais, `http://localhost:3000` normalmente funciona.

Instale as dependencias:

```bash
npm install
```

Inicie o projeto:

```bash
npm start
```

Depois, use as opcoes do terminal para abrir no Expo Go, Android, iOS ou web.

## Scripts

```bash
npm start
npm run android
npm run ios
npm run web
npm run lint
```

## Estrutura

```text
app/          Rotas e layouts do Expo Router
screens/      Telas da aplicacao
components/   Componentes reutilizaveis
constants/    Dados e constantes
contexts/     Estados compartilhados
hooks/        Hooks reutilizaveis
services/     Cliente da API
shopping-api/ API JSON consumida pelo app
assets/       Imagens e icones
```

## API

O app consome os endpoints da `shopping-api`:

```text
GET    /produto
GET    /produto/:id
POST   /produto
PUT    /produto/:id
DELETE /produto/:id
GET    /cupom
GET    /cupom/:id
POST   /cupom
PUT    /cupom/:id
DELETE /cupom/:id
GET    /carrinho
GET    /carrinho/resumo
POST   /carrinho
PUT    /carrinho/:id
DELETE /carrinho/:id
DELETE /carrinho
```

## Validacao

Execute o lint:

```bash
npm run lint
```

Execute a checagem de tipos:

```bash
npx tsc --noEmit
```
