# ShoppingCart

Aplicativo mobile de carrinho de compras desenvolvido com Expo, React Native e Expo Router.

## Funcionalidades

- Navegacao por abas: inicio, busca, carrinho e perfil
- Listagem de produtos
- Busca por nome e por categoria
- Marcar e desmarcar produtos como favoritos
- Tela de detalhes do produto
- Carrinho com controle de quantidade
- Calculo automatico de subtotal, entrega e total em Real
- Fluxo de checkout, envio e pagamento
- Tela de perfil com editar perfil e sair da conta
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

Se precisar usar outra URL, configure:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000
```

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
GET    /cupom
POST   /cupom
PUT    /cupom/:id
DELETE /cupom/:id
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
