import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { database } from '@/lib/firebase';
import { ref, push, serverTimestamp, set } from 'firebase/database';
import { testFirebaseConnection } from '@/lib/firebase-test';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, TestTube } from 'lucide-react';

const CreateRoom = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const result = await testFirebaseConnection();
      if (result.success) {
        toast({
          title: "✅ Conexão OK",
          description: "Firebase está funcionando corretamente",
        });
      } else {
        toast({
          title: "❌ Problema de Conexão",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Erro no Teste",
        description: "Não foi possível testar a conexão",
        variant: "destructive",
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome.trim()) {
      toast({
        title: "Erro",
        description: "Informe o nome da sala",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Iniciando criação da sala...');
      const codigo = generateRoomCode();
      console.log('Código gerado:', codigo);
      
      console.log('Conectando ao Firebase Realtime Database...');
      const salasRef = ref(database, 'salas');
      const newSalaRef = push(salasRef);

      // Importar 'set' do firebase/database
      await set(newSalaRef, {
        nome: nome.trim(),
        codigo,
        status: 'aberta',
        criadaEm: serverTimestamp(),
      });

      console.log('Sala criada com sucesso! ID:', newSalaRef.key);
      toast({
        title: "Sala criada com sucesso!",
        description: `Código da sala: ${codigo}`,
      });

      navigate(`/admin/room/${newSalaRef.key}`);
    } catch (error: any) {
      console.error('Erro detalhado ao criar sala:', error);
      console.error('Tipo do erro:', typeof error);
      console.error('Código do erro:', error.code);
      console.error('Mensagem:', error.message);
      
      let errorMessage = "Erro desconhecido";
      
      if (error.code === 'PERMISSION_DENIED') {
        errorMessage = "Sem permissão para criar salas. Verifique as regras do Firebase.";
      } else if (error.code === 'UNAVAILABLE') {
        errorMessage = "Firebase indisponível. Verifique sua conexão com a internet.";
      } else if (error.code === 'UNAUTHENTICATED') {
        errorMessage = "Usuário não autenticado. Faça login novamente.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao criar sala",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 p-6">
      <div className="container mx-auto max-w-2xl">
        <Button
          onClick={() => navigate('/admin/dashboard')}
          variant="ghost"
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Dashboard
        </Button>

        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="text-2xl">Criar Nova Sala</CardTitle>
            <CardDescription>
              Crie uma sala para organizar suas votações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Sala</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Assembleia Extraordinária - Janeiro 2024"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Um código único será gerado automaticamente
                </p>
              </div>

              <div className="space-y-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Criando sala...' : 'Criar Sala'}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  {testingConnection ? 'Testando...' : 'Testar Conexão Firebase'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateRoom;
