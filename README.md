# Finanças do Casal

Uma aplicação web para gerenciar finanças e listas de compras em família, desenvolvida com Next.js, TypeScript e Supabase.

## 🚀 Funcionalidades

- **Controle de Despesas**: Registre e acompanhe despesas por categoria
- **Despesas a Vencer**: Gerencie contas futuras e recorrentes
- **Entradas**: Registre salários e outras receitas
- **Metas Financeiras**: Defina limites de gastos por categoria
- **Lista de Compras**: Organize suas compras com categorização
- **Resumo Mensal**: Visualize despesas futuras por mês
- **Sistema de Casais**: Compartilhe dados com seu parceiro(a)

## 📱 Responsividade

O projeto foi completamente otimizado para funcionar em todos os dispositivos:

### ✅ Melhorias Implementadas

- **Mobile-First Design**: Layout adaptativo que funciona perfeitamente em smartphones
- **Touch-Friendly**: Botões e elementos otimizados para toque (mínimo 44px)
- **Navegação Mobile**: Menu hambúrguer para dispositivos móveis
- **Cards Responsivos**: Grid adaptativo que se ajusta ao tamanho da tela
- **Textos Escaláveis**: Tipografia que se adapta ao dispositivo
- **Diálogos Otimizados**: Modais que funcionam bem em telas pequenas
- **Safe Area Support**: Suporte para notch e áreas seguras do dispositivo

### 📐 Breakpoints Utilizados

- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (sm - lg)
- **Desktop**: > 1024px (lg+)

### 🎨 Componentes Responsivos

- **Dashboard**: Cards em grid adaptativo, menu mobile
- **Formulários**: Campos otimizados para mobile
- **Tabelas**: Layout flexível para diferentes tamanhos
- **Navegação**: Tabs e botões adaptativos
- **Diálogos**: Modais com tamanho responsivo

## 🛠️ Tecnologias

- **Frontend**: Next.js 15, React, TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deploy**: Vercel

## 🚀 Como Executar

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd financas-casal
```

2. Instale as dependências:
```bash
npm install
# ou
pnpm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

4. Execute o projeto:
```bash
npm run dev
# ou
pnpm dev
```

5. Acesse: http://localhost:3000

## 📋 Pré-requisitos

- Node.js 18+
- Conta no Supabase
- Banco de dados PostgreSQL configurado

## 🔧 Configuração do Supabase

1. Crie um projeto no Supabase
2. Configure as tabelas necessárias (veja scripts/ na pasta scripts)
3. Configure as políticas de segurança
4. Adicione as variáveis de ambiente

## 📱 Teste de Responsividade

Para testar a responsividade:

1. **Chrome DevTools**: F12 → Toggle Device Toolbar
2. **Teste em dispositivos reais**: Smartphone, tablet, desktop
3. **Orientação**: Teste em portrait e landscape
4. **Navegadores**: Chrome, Safari, Firefox, Edge

### ✅ Checklist de Responsividade

- [x] Layout adaptativo para mobile
- [x] Menu hambúrguer funcional
- [x] Cards em grid responsivo
- [x] Formulários otimizados para touch
- [x] Diálogos com tamanho adequado
- [x] Textos escaláveis
- [x] Botões com tamanho mínimo para touch
- [x] Navegação por tabs responsiva
- [x] Safe area support
- [x] Scroll suave em mobile
- [x] Focus states para acessibilidade

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório. 