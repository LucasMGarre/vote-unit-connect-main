import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { database } from '@/lib/firebase';
import { ref, query, orderByChild, equalTo, get, push, serverTimestamp, set } from 'firebase/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { DoorOpen } from 'lucide-react';

const EnterRoom = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'code' | 'identity'>('code');
  const [codigo, setCodigo] = useState('');
  const [bloco, setBloco] = useState('');
  const [apartamento, setApartamento] = useState('');
  const [loading, setLoading] = useState(false);
  const [roomId, setRoomId] = useState('');

  const handleCheckCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Buscando sala com código:', codigo.toUpperCase());
      const salasRef = ref(database, 'salas');
      const salaQuery = query(salasRef, orderByChild('codigo'), equalTo(codigo.toUpperCase()));

      const snapshot = await get(salaQuery);
      console.log('Resultado da busca:', snapshot.exists() ? 'sala encontrada' : 'nenhuma sala encontrada');
      
      if (!snapshot.exists()) {
        toast({
          title: "Sala não encontrada",
          description: "Verifique o código e tente novamente",
          variant: "destructive",
        });
        return;
      }

      // Verificar se a sala está aberta
      const salaData = snapshot.val();
      const salaId = Object.keys(salaData)[0];
      const sala = salaData[salaId];
      
      if (sala.status !== 'aberta') {
        toast({
          title: "Sala encerrada",
          description: "Esta sala não está mais aberta para votação",
          variant: "destructive",
        });
        return;
      }

      console.log('Sala encontrada:', salaId, sala);
      setRoomId(salaId);
      setStep('identity');
    } catch (error: any) {
      console.error('Erro ao buscar sala:', error);
      console.error('Código do erro:', error.code);
      
      let errorMessage = "Erro ao buscar sala";
      
      if (error.code === 'PERMISSION_DENIED') {
        errorMessage = "Sem permissão para acessar salas.";
      } else if (error.code === 'UNAVAILABLE') {
        errorMessage = "Firebase indisponível. Verifique sua conexão.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao buscar sala",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnterRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const unidade = `${bloco.toUpperCase()}-${apartamento}`;
      console.log('Registrando participante:', { salaId: roomId, unidade });

      // Registrar participante
      const participantesRef = ref(database, 'participantes');
      const newParticipanteRef = push(participantesRef);

      await set(newParticipanteRef, {
        salaId: roomId,
        unidade,
        bloco: bloco.toUpperCase(),
        apartamento,
        entradaEm: serverTimestamp(),
      });

      console.log('Participante registrado com sucesso');
      toast({
        title: "Entrada confirmada!",
        description: "Você entrou na sala de votação",
      });

      navigate(`/room/${roomId}/vote`, { state: { unidade } });
    } catch (error: any) {
      console.error('Erro ao entrar na sala:', error);
      console.error('Código do erro:', error.code);
      
      let errorMessage = "Erro ao entrar na sala";
      
      if (error.code === 'PERMISSION_DENIED') {
        errorMessage = "Sem permissão para entrar na sala.";
      } else if (error.code === 'UNAVAILABLE') {
        errorMessage = "Firebase indisponível. Verifique sua conexão.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao entrar na sala",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 p-4">
      <div className="container mx-auto max-w-md py-8">
        <Card className="shadow-elevated">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <DoorOpen className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">
              {step === 'code' ? 'Entrar na Sala' : 'Identificação'}
            </CardTitle>
            <CardDescription>
              {step === 'code' 
                ? 'Digite o código fornecido pelo administrador'
                : 'Informe os dados da sua unidade'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'code' ? (
              <form onSubmit={handleCheckCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código da Sala</Label>
                  <Input
                    id="codigo"
                    placeholder="Ex: ABC123"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                    className="text-center text-xl font-bold tracking-wider"
                    maxLength={6}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Verificando...' : 'Continuar'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleEnterRoom} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bloco">Bloco</Label>
                    <Input
                      id="bloco"
                      placeholder="Ex: A"
                      value={bloco}
                      onChange={(e) => setBloco(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apartamento">Apartamento</Label>
                    <Input
                      id="apartamento"
                      placeholder="Ex: 101"
                      value={apartamento}
                      onChange={(e) => setApartamento(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Entrando...' : 'Entrar na Sala'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnterRoom;
