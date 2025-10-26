import { database } from './firebase';
import { ref, set, get, push, serverTimestamp } from 'firebase/database';

export const testFirebaseConnection = async () => {
  try {
    console.log('🔍 Testando conexão com Firebase Realtime Database...');
    
    // Teste 1: Verificar se consegue acessar uma referência
    console.log('📋 Teste 1: Acessando referência de teste...');
    const testRef = ref(database, 'test');
    console.log('✅ Referência acessada com sucesso');
    
    // Teste 2: Tentar adicionar um documento de teste
    console.log('📝 Teste 2: Adicionando dados de teste...');
    const testDataRef = push(testRef);
    await set(testDataRef, {
      test: true,
      timestamp: serverTimestamp(),
      message: 'Teste de conectividade RTDB'
    });
    console.log('✅ Dados adicionados com sucesso:', testDataRef.key);
    
    // Teste 3: Tentar ler dados
    console.log('📖 Teste 3: Lendo dados...');
    const snapshot = await get(testRef);
    console.log('✅ Dados lidos com sucesso:', snapshot.exists() ? 'dados encontrados' : 'nenhum dado');
    
    // Teste 4: Verificar se consegue acessar as referências principais
    console.log('🏠 Teste 4: Verificando referências principais...');
    
    const salasRef = ref(database, 'salas');
    const votacoesRef = ref(database, 'votacoes');
    const votosRef = ref(database, 'votos');
    const participantesRef = ref(database, 'participantes');
    
    console.log('✅ Todas as referências principais acessíveis');
    
    console.log('🎉 Todos os testes de conectividade passaram!');
    return { success: true, message: 'Firebase Realtime Database conectado com sucesso' };
    
  } catch (error: any) {
    console.error('❌ Erro no teste de conectividade:', error);
    console.error('Código do erro:', error.code);
    console.error('Mensagem:', error.message);
    
    let errorMessage = 'Erro desconhecido';
    
    if (error.code === 'PERMISSION_DENIED') {
      errorMessage = 'Sem permissão para acessar o Firebase. Verifique as regras de segurança.';
    } else if (error.code === 'UNAVAILABLE') {
      errorMessage = 'Firebase indisponível. Verifique sua conexão com a internet.';
    } else if (error.code === 'UNAUTHENTICATED') {
      errorMessage = 'Usuário não autenticado.';
    } else if (error.code === 'INVALID_ARGUMENT') {
      errorMessage = 'Argumentos inválidos para o Firebase.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return { 
      success: false, 
      message: errorMessage,
      code: error.code,
      details: error
    };
  }
};

// Função para testar apenas a conectividade básica
export const testBasicConnection = async () => {
  try {
    console.log('🔍 Testando conectividade básica...');
    const testRef = ref(database, 'test');
    await get(testRef);
    console.log('✅ Conectividade básica OK');
    return true;
  } catch (error) {
    console.error('❌ Erro na conectividade básica:', error);
    return false;
  }
};
