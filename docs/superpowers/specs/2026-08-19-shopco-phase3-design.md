# PROMPT MASTER — SHOP.CO PHASE 3
# PRODUCTION-READY COMMERCE BACKEND + FRONTEND INTEGRATION
# ONE-SHOT IMPLEMENTATION

Você está trabalhando no projeto SHOP.CO.

Repository:
https://github.com/oluisvi/shop-co-ecommerce

Production:
https://shop-co-store.vercel.app

Sua tarefa é executar integralmente a FASE 3 do projeto.

Esta fase deve transformar o SHOP.CO, que atualmente é um frontend funcional de e-commerce de moda, em uma aplicação fullstack com uma fundação de commerce backend real, banco de dados, catálogo persistente, estoque, pedidos e integração completa com o frontend existente.

IMPORTANTE:

O frontend atual já passou por uma revitalização visual extensa e está aprovado.

NÃO redesenhe a aplicação.

NÃO faça uma nova UI.

NÃO substitua a identidade visual.

NÃO altere desnecessariamente tipografia, layout, hero, animações, footer, newsletter ou arquitetura visual.

O objetivo desta fase é adicionar infraestrutura e funcionalidades reais por trás da experiência já existente.

A implementação deve ser production-ready, mas sem adicionar complexidade desnecessária.

---

# 1. CONTEXTO ATUAL DO PROJETO

O SHOP.CO é um fashion e-commerce frontend construído com:

- Next.js 15
- React 19
- TypeScript
- CSS
- Three.js
- React Context
- localStorage
- Vercel

O frontend atual possui:

- homepage editorial
- hero 3D com Three.js
- modelo GLB local
- catálogo com 12 produtos
- busca
- filtros
- sorting
- páginas individuais de produto
- rotas /products/[slug]
- carrinho funcional
- persistência via localStorage
- subtotal
- quantidade
- cart drawer acessível
- newsletter demonstrativa
- reviews
- responsive design
- reduced motion
- acessibilidade
- testes automatizados

O catálogo atualmente é local e está presente no frontend.

A estrutura atual de Product deve ser estudada e reutilizada como referência de domínio.

Não quebre URLs existentes.

Slugs atuais devem continuar funcionando.

---

# 2. OBJETIVO DA FASE 3

Criar uma arquitetura fullstack sólida para que o frontend deixe de depender de dados estáticos e passe a consumir dados reais de uma API.

Ao final desta fase devemos ter:

Frontend existente
        ↓
Commerce API
        ↓
PostgreSQL
        ↓
Products
Categories
Variants
Inventory
Orders

O projeto deve continuar funcionando normalmente mesmo depois da migração.

---

# 3. PRIMEIRO PASSO OBRIGATÓRIO — AUDITORIA

ANTES DE ALTERAR QUALQUER CÓDIGO:

Analise integralmente o repositório.

Leia:

- package.json
- estrutura src
- páginas
- componentes
- contexto de commerce
- catálogo atual
- tipos
- testes
- configuração Next.js
- persistência do carrinho
- rotas de produtos
- scripts
- documentação existente

Identifique:

- contrato Product atual
- estrutura do catálogo
- funcionamento do carrinho
- onde preços são calculados
- como slugs são utilizados
- como filtros funcionam
- como páginas estáticas são geradas
- dependências existentes
- possíveis riscos de integração

Não reescreva funcionalidades que já funcionam.

Adapte o backend ao frontend sempre que isso fizer sentido.

---

# 4. ESTRATÉGIA DE IMPLEMENTAÇÃO

Prefira preservar o frontend atual e adicionar o backend com o menor impacto estrutural possível.

Stack preferencial:

Backend:
- NestJS
- TypeScript
- Prisma
- PostgreSQL

Validation:
- class-validator
- class-transformer

Database:
- PostgreSQL
- DATABASE_URL via environment

API:
- REST

Testing:
- Jest ou ferramenta padrão do NestJS

Não introduza GraphQL.

Não introduza microservices.

Não introduza Redis sem necessidade real.

Não introduza Kafka.

Não introduza event sourcing.

Não introduza CQRS apenas por arquitetura.

Mantenha a solução simples, modular e escalável.

---

# 5. ORGANIZAÇÃO DO BACKEND

Crie uma organização coerente.

Exemplo aceitável:

server/

ou

apps/api/

Escolha com base na estrutura atual do projeto.

Não reorganize todo o frontend apenas para criar um monorepo se isso não for necessário.

Estrutura esperada conceitualmente:

api
├── src
│   ├── modules
│   │   ├── products
│   │   ├── categories
│   │   ├── inventory
│   │   └── orders
│   │
│   ├── common
│   ├── config
│   ├── prisma
│   └── main
│
├── prisma
│   ├── schema.prisma
│   └── seed.ts
│
└── tests

---

# 6. CONFIGURAÇÃO

Criar configuração centralizada.

Implementar:

- environment validation
- DATABASE_URL
- PORT
- FRONTEND_URL
- NODE_ENV

Criar:

.env.example

Nunca versionar secrets.

Configuração inválida deve falhar rapidamente durante startup.

---

# 7. DATABASE

Usar PostgreSQL.

Usar Prisma como ORM.

O banco precisa representar um commerce real sem ficar excessivamente complexo.

Crie no mínimo os seguintes conceitos.

---

# Product

Campos sugeridos:

id
slug
name
description
status
categoryId
createdAt
updatedAt

Status possível:

ACTIVE
DRAFT
ARCHIVED

slug deve ser:

- único
- indexado
- estável

---

# Category

id
slug
name
createdAt
updatedAt

slug único.

---

# ProductVariant

Representa combinações vendáveis.

Campos possíveis:

id
productId
sku
color
size
price
compareAtPrice
active
createdAt
updatedAt

Não armazene dinheiro usando float.

Use Decimal ou inteiro em cents.

Escolha uma estratégia e aplique consistentemente.

---

# ProductImage

id
productId
url
alt
position

Permitir múltiplas imagens por produto.

---

# Inventory

Campos sugeridos:

id
variantId
quantity
reservedQuantity
updatedAt

Não permitir estoque negativo.

---

# Order

Campos sugeridos:

id
orderNumber
status

email
firstName
lastName

subtotal
shipping
discount
total

currency

createdAt
updatedAt

Status inicial possível:

CREATED
PENDING_PAYMENT
PAID
PROCESSING
SHIPPED
DELIVERED
CANCELLED

Nesta fase pagamentos ainda NÃO serão implementados.

---

# OrderItem

Representa snapshot da compra.

Campos:

id
orderId
productId opcional
variantId opcional

productName
variantName
sku

unitPrice
quantity
totalPrice

IMPORTANTE:

OrderItem deve armazenar snapshot de preço e nome.

Um pedido histórico não pode mudar se o produto for alterado no futuro.

---

# Address

Pode ser entidade própria ou embedded dependendo da arquitetura escolhida.

Deve contemplar:

firstName
lastName
addressLine1
addressLine2
city
state
postalCode
country

---

# 8. MIGRATIONS

Criar migration inicial.

Não depender de db push como estratégia de produção.

Usar migrations versionadas.

Documentar:

development migration

production migration

seed

---

# 9. SEED DATABASE

O catálogo atual do frontend possui aproximadamente 12 produtos.

Reutilize esses produtos.

Crie um seed que converta o catálogo atual em dados reais do banco.

Preserve:

- nomes
- slugs
- preços
- descontos
- imagens
- categorias
- cores
- tamanhos

Quando alguma informação não existir para determinado produto, crie valores coerentes apenas quando necessários para funcionamento técnico.

Não invente dezenas de produtos.

O objetivo inicial é migrar os produtos atuais para persistência real.

---

# 10. PRODUCTS API

Criar:

GET /products

Suportar:

search
category
sort
maxPrice
limit
page

Exemplo:

GET /products?search=shirt&category=t-shirts&sort=price-asc

Retorno deve possuir:

items
pagination

---

Criar:

GET /products/:slug

Retornar:

produto
imagens
variantes
categoria
estoque disponível

Produto inexistente:

404

---

# 11. CATEGORIES API

Criar:

GET /categories

Retornar categorias ativas com dados necessários para filtros.

---

# 12. INVENTORY

O estoque deve ser controlado no servidor.

Nunca confie em quantidade enviada pelo frontend.

Antes de criar um pedido:

validar:

- produto existe
- variant existe
- produto está ativo
- variant está ativa
- estoque disponível >= quantidade

Quantidade inválida deve gerar erro 400.

Estoque insuficiente:

409 Conflict ou código equivalente semanticamente apropriado.

---

# 13. ORDERS

Criar:

POST /orders

Payload conceitual:

customer
shippingAddress
items

O frontend NÃO deve enviar preço confiável.

Frontend envia apenas:

variantId
quantity

O backend deve:

1. buscar variant no banco
2. obter preço real
3. validar estoque
4. calcular subtotal
5. calcular shipping
6. calcular total
7. criar order
8. criar order items
9. persistir snapshots
10. retornar pedido criado

Use transação de banco.

Nunca permita que o frontend determine o preço final.

---

# 14. SHIPPING

Nesta fase, mantenha shipping simples.

Exemplo aceitável:

flat rate

ou

free shipping acima de determinado valor.

Centralize a regra.

Não espalhe números mágicos.

Não integre transportadoras reais nesta fase.

---

# 15. CHECKOUT FRONTEND

Criar checkout utilizando o visual existente.

Não redesenhar o site.

Criar rota:

/checkout

Fluxo:

Cart
↓
Checkout
↓
Contact
↓
Shipping address
↓
Order summary
↓
Create Order
↓
Order confirmation

O checkout NÃO terá pagamento real nesta fase.

Após criação:

mostrar confirmação de pedido.

Exemplo:

Order #SHOP-000123

Não fingir que pagamento ocorreu.

Se status for PENDING_PAYMENT ou CREATED, mostre isso corretamente.

---

# 16. CHECKOUT VALIDATION

Campos necessários:

email
firstName
lastName
address
city
state
postalCode
country

Usar validação real.

Mostrar erros claros.

Não aceitar formulário inválido.

Garantir acessibilidade.

---

# 17. FRONTEND API CLIENT

Criar uma camada centralizada para API.

Não espalhar fetch por dezenas de componentes.

Exemplo:

src/lib/api/

products.ts
categories.ts
orders.ts
client.ts

ou estrutura equivalente.

Criar:

API_BASE_URL

via env.

Exemplo:

NEXT_PUBLIC_API_URL

---

# 18. MIGRAÇÃO DO CATÁLOGO

O frontend atualmente importa produtos de um arquivo local.

Migrar progressivamente para API.

Depois da migração:

Home
Categories
Product Detail
Search
Filters

devem consumir a API.

Não duplicar lógica de catálogo desnecessariamente.

---

# 19. TYPES

Defina contratos claros.

Evite:

any

unknown sem narrowing

casts desnecessários

Compartilhe tipos quando isso for simples.

Mas não crie uma arquitetura excessivamente complexa de packages compartilhados apenas por causa de alguns DTOs.

---

# 20. CARRINHO

Preserve o comportamento atual do carrinho.

Carrinho continua funcionando para guest users.

Persistência local pode continuar via localStorage.

Entretanto:

não persista objetos completos de produto como fonte de verdade.

Idealmente persista:

variantId
quantity

Quando possível.

Ao abrir carrinho ou checkout:

dados atuais do produto devem ser obtidos da API.

Servidor continua sendo autoridade sobre:

price
availability
inventory

---

# 21. CART RECONCILIATION

Implemente tratamento para situações como:

produto removido

variant desativada

preço alterado

estoque insuficiente

Ao chegar ao checkout:

o carrinho deve ser reconciliado com dados reais da API.

Nunca assumir que localStorage possui dados válidos.

---

# 22. ERROR HANDLING

Backend deve possuir tratamento padronizado de erros.

Formato consistente.

Exemplo:

{
  "statusCode": 404,
  "code": "PRODUCT_NOT_FOUND",
  "message": "Product not found"
}

Não retornar stack traces em produção.

---

# 23. LOGGING

Adicionar logging básico estruturado.

Registrar:

startup
database errors
order creation failure
unexpected exceptions

Nunca logar:

passwords
secrets
dados sensíveis completos

---

# 24. SECURITY FOUNDATION

Implementar:

helmet
CORS configurado
validation pipe
payload size adequado
environment validation
input sanitization quando necessário

Não confiar em dados do cliente.

Não criar autenticação nesta fase.

Não implementar rate limiter complexo se não houver necessidade, mas arquitetura deve permitir inclusão futura.

---

# 25. DATABASE INDEXES

Adicionar índices coerentes para:

Product.slug
Product.status
Category.slug
Variant.sku
Order.orderNumber
Order.createdAt

E demais consultas frequentes identificadas durante implementação.

---

# 26. CONCURRENCY / INVENTORY

Evite overselling trivial durante criação de pedido.

Use transação e atualização segura de estoque.

Se necessário use:

atomic update

ou condição equivalente.

Dois pedidos concorrentes não devem conseguir consumir a mesma última unidade facilmente.

Não implemente sistema complexo de reservas temporárias ainda.

---

# 27. TRANSACTIONS

Criação de order e alteração de estoque devem ser atômicas.

Se qualquer operação falhar:

rollback.

---

# 28. ACCESSIBILITY

Não perder nenhuma acessibilidade existente.

Checkout deve possuir:

labels
focus states
keyboard navigation
error association
aria-live quando apropriado

---

# 29. PERFORMANCE

Não piorar a experiência atual.

Evitar:

requests duplicadas
N+1 queries
fetch desnecessário
payloads gigantes

Use select/include do Prisma conscientemente.

---

# 30. TESTING BACKEND

Criar testes para:

ProductsService

product filtering

product slug lookup

order calculations

price validation

inventory validation

order creation

insufficient stock

invalid variant

transaction behavior quando possível

---

# 31. FRONTEND TESTING

Atualizar/adicionar testes para:

API mapping

cart reconciliation

checkout validation

order payload

erro de estoque

erro de produto indisponível

---

# 32. EXISTING TESTS

Todos os testes existentes devem continuar passando.

Baseline anterior do projeto:

40 tests passing.

Não reduza cobertura removendo testes.

Não delete testes apenas para fazer CI passar.

---

# 33. QUALITY GATES

Antes de considerar a fase concluída, executar:

npm test

npm run typecheck

npm run lint

npm run build

e testes do backend.

Se o backend possuir workspace próprio:

execute os comandos equivalentes.

Não declare sucesso se algum comando estiver falhando.

---

# 34. DOCUMENTATION

Atualizar README.

Adicionar:

Architecture

Backend

Database

Environment variables

Local development

Migrations

Seed

API endpoints

Checkout

Testing

Deployment

---

# 35. ENV EXAMPLE

Criar arquivo .env.example contendo apenas placeholders.

Exemplo:

DATABASE_URL=
PORT=
FRONTEND_URL=
NEXT_PUBLIC_API_URL=

Nunca colocar credentials reais.

---

# 36. LOCAL DEVELOPMENT

Idealmente permitir execução simples.

Exemplo:

frontend

npm run dev

backend

npm run start:dev

Opcionalmente criar Docker Compose APENAS para PostgreSQL local se fizer sentido.

Não containerizar toda a aplicação sem necessidade.

---

# 37. DEPLOYMENT

Frontend:

Vercel

Backend:

arquitetura deve ser compatível com plataformas Node comuns.

Banco:

PostgreSQL gerenciado.

Não acople código a um fornecedor específico.

Use DATABASE_URL.

---

# 38. NÃO IMPLEMENTAR NESTA FASE

Explicitamente fora de escopo:

Stripe
PayPal
pagamentos reais
OAuth
login
registro
user accounts
admin dashboard
wishlist
coupons complexos
email transacional
recommendation AI
analytics
Redis
queues
microservices
GraphQL

Não faça scope creep.

---

# 39. PRESERVAR UX EXISTENTE

Muito importante.

Não alterar sem necessidade:

Hero 3D
Three.js
Home layout
Typography
Footer
Newsletter
Reviews
Product Cards
Motion
Responsive design

Backend deve servir à interface existente.

Não adaptar a interface ao backend de forma preguiçosa.

---

# 40. COMPATIBILIDADE DE ROTAS

Preservar:

/

/categories

/products/[slug]

Adicionar:

/checkout

e rota de confirmação se necessário.

---

# 41. COMMITS

Use commits pequenos e semanticamente claros.

Exemplos:

chore: scaffold commerce api

feat: add prisma commerce schema

feat: implement product catalog api

feat: add inventory validation

feat: implement order creation

feat: integrate storefront with commerce api

feat: add checkout flow

test: cover commerce domain

docs: document fullstack architecture

---

# 42. BRANCH

Crie uma branch dedicada.

Sugestão:

feat/commerce-backend-phase-3

Não altere main diretamente.

Não faça merge automaticamente.

Ao final abra PR ou prepare tudo para PR.

---

# 43. PR FINAL

Ao final gerar um resumo com:

Architecture

Database schema

API endpoints

Frontend integration

Checkout flow

Inventory behavior

Testing

Environment variables

Migration instructions

Deployment requirements

Known limitations

Next phase

---

# 44. DEFINITION OF DONE

A Fase 3 somente está concluída se:

[ ] backend NestJS funcional
[ ] PostgreSQL integrado
[ ] Prisma configurado
[ ] migration versionada
[ ] database seed funcional
[ ] catálogo migrado para database
[ ] Products API funcional
[ ] Categories API funcional
[ ] inventory funcional
[ ] Orders API funcional
[ ] preços calculados no servidor
[ ] inventory validado no servidor
[ ] frontend consumindo API
[ ] filtros continuam funcionando
[ ] busca continua funcionando
[ ] product detail continua funcionando
[ ] cart continua funcionando
[ ] cart reconciliado com API
[ ] checkout funcional
[ ] order creation funcional
[ ] nenhum pagamento falso
[ ] frontend visual preservado
[ ] acessibilidade preservada
[ ] testes existentes continuam passando
[ ] novos testes adicionados
[ ] typecheck passa
[ ] lint passa
[ ] frontend build passa
[ ] backend build passa
[ ] documentação atualizada
[ ] env example atualizado
[ ] nenhum secret commitado

---

# 45. NEXT PHASE

Não implementar agora.

A próxima fase será:

SHOP.CO PHASE 4 — PAYMENTS + CUSTOMER ACCOUNTS

Possível escopo futuro:

Stripe
payment intents / checkout sessions
webhooks
payment confirmation
authentication
customer account
order history
transactional email
admin tooling

Prepare a arquitetura atual para permitir isso sem implementar agora.

---

# 46. MODO DE EXECUÇÃO

Esta é uma execução ONE-SHOT.

Não pare após criar apenas o backend.

Não pare após criar apenas o schema.

Não pare após criar apenas endpoints.

Execute a fase completa.

Fluxo esperado:

AUDIT
↓
ARCHITECTURE
↓
DATABASE
↓
MIGRATIONS
↓
SEED
↓
PRODUCT API
↓
CATEGORY API
↓
INVENTORY
↓
ORDER DOMAIN
↓
CHECKOUT
↓
FRONTEND INTEGRATION
↓
TESTS
↓
BUILD
↓
DOCUMENTATION
↓
FINAL REPORT

Se descobrir problema real durante implementação:

investigue
corrija
teste novamente

Não aplique soluções temporárias silenciosamente.

Não remova funcionalidades existentes para facilitar implementação.

Se houver uma decisão arquitetural pequena, escolha a solução mais simples e segura.

Pare apenas se existir um blocker que realmente impeça execução e que não possa ser resolvido inspecionando o repositório.

---

# RESULTADO ESPERADO

Ao final, SHOP.CO deve deixar de ser apenas:

"frontend de e-commerce funcional"

e passar a ser:

"fullstack commerce application com catálogo persistente, estoque controlado no servidor, pedidos reais e checkout integrado."

Tudo isso preservando a experiência visual atual.

Execute agora.