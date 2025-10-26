import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

const CreateRoom = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
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
      const codigo = generateRoomCode();
      const docRef = await addDoc(collection(db, 'salas'), {
        nome: nome.trim(),
        codigo,
        status: 'aberta',
        criadaEm: serverTimestamp(),
      });

      toast({
        title: "Sala criada com sucesso!",
        description: `Código da sala: ${codigo}`,
      });

      navigate(`/admin/room/${docRef.id}`);
    } catch (error: any) {
      console.error('Erro ao criar sala:', error);
      toast({
        title: "Erro ao criar sala",
        description: error.message || "Verifique a configuração do Firebase",
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

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Criando sala...' : 'Criar Sala'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateRoom;
