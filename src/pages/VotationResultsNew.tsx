import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Votation, Vote } from '@/types/room';
import { ArrowLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const VotationResultsNew = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [votation, setVotation] = useState<Votation | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchVotation = async () => {
      const docRef = doc(db, 'votacoes', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setVotation({
          id: docSnap.id,
          ...docSnap.data(),
          criadaEm: docSnap.data().criadaEm?.toDate(),
        } as Votation);
      }
      setLoading(false);
    };

    fetchVotation();

    const q = query(collection(db, 'votos'), where('votacaoId', '==', id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const votesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      })) as Vote[];
      
      setVotes(votesData);
    });

    return () => unsubscribe();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!votation) {
    return <div className="min-h-screen flex items-center justify-center">Votação não encontrada</div>;
  }

  const totalVotes = votes.length;
  const chartData = votation.alternativas.map((alt, index) => {
    const count = votes.filter(v => v.escolha === index).length;
    return {
      name: alt,
      votos: count,
      percentual: totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(1) : 0,
    };
  });

  const COLORS = ['hsl(217 91% 60%)', 'hsl(142 76% 36%)', 'hsl(47 96% 53%)', 'hsl(0 84% 60%)', 'hsl(280 65% 60%)'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 p-6">
      <div className="container mx-auto max-w-4xl">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        <div className="space-y-6">
          <Card className="shadow-elevated">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{votation.pergunta}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Badge variant={votation.status === 'aberta' ? 'default' : 'secondary'}>
                      {votation.status === 'aberta' ? 'Em andamento' : 'Encerrada'}
                    </Badge>
                    {votation.isAnonima && (
                      <Badge variant="outline">🔒 Anônima</Badge>
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle>Resultados</CardTitle>
              <CardDescription>Total de votos: {totalVotes}</CardDescription>
            </CardHeader>
            <CardContent>
              {totalVotes === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum voto registrado ainda
                </p>
              ) : (
                <>
                  <div className="h-80 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="votos" radius={[8, 8, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-3">
                    {chartData.map((data, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <span className="font-medium">{data.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">{data.votos} votos</span>
                          <Badge>{data.percentual}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {!votation.isAnonima && votes.length > 0 && (
            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle>Registro de Votos</CardTitle>
                <CardDescription>Lista de votantes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {votes.map((vote) => (
                    <div key={vote.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{vote.nomeVotante || 'Não informado'}</p>
                        <p className="text-sm text-muted-foreground">Unidade: {vote.unidade}</p>
                      </div>
                      <Badge variant="outline">
                        {votation.alternativas[vote.escolha]}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default VotationResultsNew;
