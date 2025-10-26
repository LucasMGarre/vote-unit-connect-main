import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Room, Votation } from '@/types/room';
import { ArrowLeft, Plus, X, Copy, Check, Trash2, StopCircle, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const RoomManagement = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [votations, setVotations] = useState<Votation[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);

  // Form states
  const [pergunta, setPergunta] = useState('');
  const [alternativas, setAlternativas] = useState(['', '']);
  const [isAnonima, setIsAnonima] = useState(true);

  const roomLink = `${window.location.origin}/enter-room`;

  useEffect(() => {
    if (!id) return;

    const fetchRoom = async () => {
      const docRef = doc(db, 'salas', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setRoom({
          id: docSnap.id,
          ...docSnap.data(),
          criadaEm: docSnap.data().criadaEm?.toDate(),
        } as Room);
      }
      setLoading(false);
    };

    fetchRoom();

    const q = query(collection(db, 'votacoes'), where('salaId', '==', id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const votationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        criadaEm: doc.data().criadaEm?.toDate(),
      })) as Votation[];
      
      setVotations(votationsData);
    });

    return () => unsubscribe();
  }, [id]);

  const copyCode = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.codigo);
    setCopied(true);
    toast({
      title: "Código copiado!",
      description: `Código: ${room.codigo}`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const addAlternativa = () => {
    setAlternativas([...alternativas, '']);
  };

  const removeAlternativa = (index: number) => {
    if (alternativas.length > 2) {
      setAlternativas(alternativas.filter((_, i) => i !== index));
    }
  };

  const updateAlternativa = (index: number, value: string) => {
    const newAlternativas = [...alternativas];
    newAlternativas[index] = value;
    setAlternativas(newAlternativas);
  };

  const handleCreateVotation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const alternativasValidas = alternativas.filter(alt => alt.trim() !== '');
    
    if (alternativasValidas.length < 2) {
      toast({
        title: "Erro",
        description: "É necessário pelo menos 2 alternativas válidas",
        variant: "destructive",
      });
      return;
    }

    try {
      await addDoc(collection(db, 'votacoes'), {
        salaId: id,
        pergunta: pergunta.trim(),
        alternativas: alternativasValidas,
        status: 'aberta',
        isAnonima,
        criadaEm: serverTimestamp(),
      });

      toast({
        title: "Votação criada!",
        description: "Os participantes já podem votar",
      });

      setPergunta('');
      setAlternativas(['', '']);
      setIsAnonima(true);
      setShowDialog(false);
    } catch (error) {
      toast({
        title: "Erro ao criar votação",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const handleEndVotation = async (votationId: string) => {
    if (!window.confirm('Deseja encerrar esta votação?')) return;

    try {
      await updateDoc(doc(db, 'votacoes', votationId), {
        status: 'encerrada',
        encerradadaEm: new Date(),
      });
      
      toast({
        title: "Votação encerrada",
      });
    } catch (error) {
      toast({
        title: "Erro ao encerrar",
        variant: "destructive",
      });
    }
  };

  const handleDeleteVotation = async (votationId: string) => {
    if (!window.confirm('Deseja excluir esta votação?')) return;

    try {
      await deleteDoc(doc(db, 'votacoes', votationId));
      toast({
        title: "Votação excluída",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!room) {
    return <div className="min-h-screen flex items-center justify-center">Sala não encontrada</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 p-6">
      <div className="container mx-auto max-w-4xl">
        <Button
          onClick={() => navigate('/admin/dashboard')}
          variant="ghost"
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Dashboard
        </Button>

        <div className="space-y-6">
          <Card className="shadow-elevated">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{room.nome}</CardTitle>
                  <CardDescription>
                    <Badge variant="default" className="text-lg py-1 px-3">
                      Código: {room.codigo}
                    </Badge>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Button onClick={copyCode} variant="outline" className="flex-1 gap-2">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Código Copiado!' : 'Copiar Código'}
                </Button>
                <Button onClick={() => navigate(`/admin/room/${id}/participants`)} variant="outline" className="gap-2">
                  <Users className="h-4 w-4" />
                  Ver Participantes
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Compartilhe o código para os moradores entrarem na sala: <strong>{roomLink}</strong>
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Votações da Sala</CardTitle>
                  <CardDescription>{votations.length} votação(ões)</CardDescription>
                </div>
                <Dialog open={showDialog} onOpenChange={setShowDialog}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Nova Votação
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Criar Votação</DialogTitle>
                      <DialogDescription>
                        Adicione uma nova votação nesta sala
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateVotation} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="pergunta">Pergunta</Label>
                        <Input
                          id="pergunta"
                          placeholder="Ex: Aprovar a reforma?"
                          value={pergunta}
                          onChange={(e) => setPergunta(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-4">
                        <Label>Alternativas</Label>
                        {alternativas.map((alt, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              placeholder={`Alternativa ${index + 1}`}
                              value={alt}
                              onChange={(e) => updateAlternativa(index, e.target.value)}
                              required
                            />
                            {alternativas.length > 2 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => removeAlternativa(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addAlternativa}
                          className="w-full gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Adicionar Alternativa
                        </Button>
                      </div>

                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <Label htmlFor="anonima">Votação Anônima</Label>
                          <p className="text-sm text-muted-foreground">
                            Não solicitar nome do votante
                          </p>
                        </div>
                        <Switch
                          id="anonima"
                          checked={isAnonima}
                          onCheckedChange={setIsAnonima}
                        />
                      </div>

                      <Button type="submit" className="w-full">
                        Criar Votação
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {votations.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma votação criada ainda
                </p>
              ) : (
                <div className="space-y-3">
                  {votations.map((votation) => (
                    <Card key={votation.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold">{votation.pergunta}</h3>
                            <div className="flex gap-2 mt-2">
                              <Badge variant={votation.status === 'aberta' ? 'default' : 'secondary'}>
                                {votation.status === 'aberta' ? 'Aberta' : 'Encerrada'}
                              </Badge>
                              {votation.isAnonima && (
                                <Badge variant="outline">🔒 Anônima</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => navigate(`/admin/votation/${votation.id}/results`)}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            Ver Resultados
                          </Button>
                          {votation.status === 'aberta' && (
                            <Button
                              onClick={() => handleEndVotation(votation.id)}
                              variant="outline"
                              size="sm"
                            >
                              <StopCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            onClick={() => handleDeleteVotation(votation.id)}
                            variant="outline"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RoomManagement;
