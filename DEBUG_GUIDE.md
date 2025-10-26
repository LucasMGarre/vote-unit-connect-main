# 🔧 Guia de Debug - Vote Unit Connect

## 🐛 Problemas Comuns e Soluções

### 1. Carregamento Infinito na Criação de Salas

**Sintomas:**
- Botão "Criando sala..." fica carregando indefinidamente
- Nenhuma sala é criada
- Console mostra erros de Firebase

**Possíveis Causas:**
1. **Problemas de conectividade com Firebase**
2. **Regras de segurança do Firestore muito restritivas**
3. **Usuário não autenticado**
4. **Configuração incorreta do Firebase**

**Soluções:**

#### Passo 1: Testar Conexão Firebase
1. Vá para a página "Criar Nova Sala"
2. Clique no botão "Testar Conexão Firebase"
3. Verifique o console do navegador (F12)
4. Observe as mensagens de log

#### Passo 2: Verificar Console do Navegador
Abra o console (F12) e procure por:
- ✅ Mensagens de sucesso (verde)
- ❌ Mensagens de erro (vermelho)
- 🔍 Logs de debug

#### Passo 3: Verificar Regras do Firestore
No console do Firebase, vá para Firestore > Rules e verifique se as regras permitem escrita:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura/escrita para usuários autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 2. Problemas de Conexão nas Salas

**Sintomas:**
- Não consegue entrar na sala com o código
- Erro "Sala não encontrada"
- Carregamento infinito na busca

**Soluções:**

#### Passo 1: Verificar Código da Sala
1. Certifique-se de que o código está correto (maiúsculas)
2. Verifique se a sala está com status "aberta"
3. Teste com um código conhecido

#### Passo 2: Verificar Logs
No console do navegador, procure por:
```
Buscando sala com código: ABC123
Resultado da busca: 1 salas encontradas
Sala encontrada: [ID] {dados da sala}
```

### 3. Erros de Permissão

**Códigos de Erro Comuns:**
- `permission-denied`: Regras do Firestore muito restritivas
- `unavailable`: Firebase indisponível
- `unauthenticated`: Usuário não logado

**Soluções:**
1. Verificar se está logado como administrador
2. Verificar regras do Firestore
3. Verificar conexão com internet

## 🔍 Ferramentas de Debug

### Console do Navegador
- **F12** para abrir DevTools
- **Console** para ver logs e erros
- **Network** para ver requisições

### Logs Adicionados
O sistema agora inclui logs detalhados:
- 🔍 Início de operações
- ✅ Sucessos
- ❌ Erros com detalhes
- 📊 Dados de debug

### Botão de Teste
Na página "Criar Nova Sala", use o botão "Testar Conexão Firebase" para diagnosticar problemas.

## 🚀 Como Testar

### Teste Completo do Sistema:
1. **Login** como administrador
2. **Criar sala** (usar botão de teste se necessário)
3. **Copiar código** da sala
4. **Abrir nova aba** (modo incógnito)
5. **Entrar na sala** com o código
6. **Verificar** se consegue acessar

### Teste de Conectividade:
1. Vá para "Criar Nova Sala"
2. Clique "Testar Conexão Firebase"
3. Verifique resultado no console
4. Se falhar, verifique regras do Firestore

## 📞 Suporte

Se os problemas persistirem:
1. Verifique o console do navegador
2. Teste a conectividade Firebase
3. Verifique as regras de segurança
4. Confirme se está logado corretamente

## 🔧 Configurações Avançadas

### Variáveis de Ambiente
Para maior segurança, configure variáveis de ambiente:

1. Crie arquivo `.env.local` na raiz do projeto
2. Adicione suas configurações do Firebase
3. Nunca commite este arquivo

### Regras de Firestore Recomendadas
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Salas - apenas usuários autenticados podem criar/ler
    match /salas/{salaId} {
      allow read, write: if request.auth != null;
    }
    
    // Votações - apenas usuários autenticados
    match /votacoes/{votacaoId} {
      allow read, write: if request.auth != null;
    }
    
    // Votos - leitura para todos, escrita apenas para participantes
    match /votos/{votoId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Participantes - leitura para todos, escrita apenas para participantes
    match /participantes/{participanteId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```
