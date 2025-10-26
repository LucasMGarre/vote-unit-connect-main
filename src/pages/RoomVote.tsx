import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { database } from '@/lib/firebase';
import { ref, query, orderByChild, equalTo, onValue, push, serverTimestamp, get, set } from 'firebase/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Votation } from '@/types/room';
import { toast } from '@/hooks/use-toast';
import { CheckCircle2, Vote as VoteIcon } from 'lucide-react';

const RoomVote = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const unidade = location.state?.unidade || '';
  
  const [votations, setVotations] = useState<Votation[]>([]);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: number }>({});
  const [nomeVotante, setNomeVotante] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    console.log('Carregando votações da sala:', id);
    const votacoesRef = ref(database, 'votacoes');
    const votacoesQuery = query(
      votacoesRef, 
      orderByChild('salaId'), 
      equalTo(id)
    );
    
    const unsubscribe = onValue(votacoesQuery, async (snapshot) => {
      if (snapshot.exists()) {
        const votationsData: Votation[] = [];
        snapshot.forEach((childSnapshot) => {
          const votationData = childSnapshot.val();
          // Apenas votações abertas
          if (votationData.status === 'aberta') {
            votationsData.push({
              id: childSnapshot.key!,
              salaId: votationData.salaId,
              pergunta: votationData.pergunta,
              alternativas: votationData.alternativas,
              status: votationData.status,
              isAnonima: votationData.isAnonima,
              criadaEm: new Date(votationData.criadaEm),
            });
          }
        });
        
        console.log('Votações abertas encontradas:', votationsData.length);
        setVotations(votationsData);

        // Verificar quais votações o usuário já votou
        const votedSet = new Set<string>();
        for (const votation of votationsData) {
          const votesRef = ref(database, 'votos');
          const votesQuery = query(
            votesRef,
            orderByChild('votacaoId'),
            equalTo(votation.id)
          );
          
          const votesSnapshot = await get(votesQuery);
          if (votesSnapshot.exists()) {
            votesSnapshot.forEach((voteSnapshot) => {
              const voteData = voteSnapshot.val();
              if (voteData.unidade === unidade) {
                votedSet.add(votation.id);
              }
            });
          }
        }
        
        console.log('Votações já votadas:', votedSet.size);
        setVotedIds(votedSet);
      } else {
        console.log('Nenhuma votação encontrada');
        setVotations([]);
        setVotedIds(new Set());
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id, unidade]);

  const handleVote = async (votationId: string, isAnonima: boolean) => {
    if (selectedOptions[votationId] === undefined) {
      toast({
        title: "Selecione uma opção",
        variant: "destructive",
      });
      return;
    }

    if (!isAnonima && !nomeVotante.trim()) {
      toast({
        title: "Informe seu nome",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Registrando voto...');
      const votosRef = ref(database, 'votos');
      const newVotoRef = push(votosRef);

      await set(newVotoRef, {
        votacaoId: votationId,
        salaId: id,
        unidade,
        escolha: selectedOptions[votationId],
        nomeVotante: isAnonima ? null : nomeVotante.trim(),
        timestamp: serverTimestamp(),
      });

      console.log('Voto registrado:', newVotoRef.key);
      setVotedIds(new Set(votedIds).add(votationId));
      
      toast({
        title: "Voto registrado!",
        description: "Seu voto foi computado com sucesso",
      });
    } catch (error: any) {
      console.error('Erro ao votar:', error);
      toast({
        title: "Erro ao votar",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-primary/5">
        <p>Carregando votações...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 p-4">
      <div className="container mx-auto max-w-2xl py-8 space-y-6">
        <Card className="shadow-elevated">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sala de Votação</CardTitle>
            <CardDescription>
              Unidade: <strong>{unidade}</strong>
            </CardDescription>
          </CardHeader>
        </Card>

        {votations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12">
              <VoteIcon className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma votação disponível</h3>
              <p className="text-muted-foreground text-center">
                Aguarde o administrador criar as votações
              </p>
            </CardContent>
          </Card>
        ) : (
          votations.map((votation) => {
            const hasVoted = votedIds.has(votation.id);

            return (
              <Card key={votation.id} className="shadow-elevated">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{votation.pergunta}</CardTitle>
                    {hasVoted && (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Votado
                      </Badge>
                    )}
                  </div>
                  {votation.isAnonima && (
                    <Badge variant="outline">🔒 Anônima</Badge>
                  )}
                </CardHeader>
                <CardContent>
                  {hasVoted ? (
                    <p className="text-center text-muted-foreground py-4">
                      Você já votou nesta questão
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {!votation.isAnonima && (
                        <div className="space-y-2">
                          <Label htmlFor={`nome-${votation.id}`}>Seu Nome</Label>
                          <Input
                            id={`nome-${votation.id}`}
                            placeholder="Digite seu nome"
                            value={nomeVotante}
                            onChange={(e) => setNomeVotante(e.target.value)}
                          />
                        </div>
                      )}

                      <RadioGroup
                        value={selectedOptions[votation.id]?.toString()}
                        onValueChange={(value) => 
                          setSelectedOptions({
                            ...selectedOptions,
                            [votation.id]: parseInt(value)
                          })
                        }
                      >
                        {votation.alternativas.map((alt, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                          >
                            <RadioGroupItem value={index.toString()} id={`${votation.id}-${index}`} />
                            <Label
                              htmlFor={`${votation.id}-${index}`}
                              className="flex-1 cursor-pointer text-base font-medium"
                            >
                              {alt}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>

                      <Button
                        onClick={() => handleVote(votation.id, votation.isAnonima)}
                        className="w-full"
                      >
                        Confirmar Voto
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RoomVote;
