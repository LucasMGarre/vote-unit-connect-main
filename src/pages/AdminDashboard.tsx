import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Room } from '@/types/room';
import { Plus, LogOut, BarChart3, Trash2, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
      return;
    }

    const q = query(collection(db, 'salas'), orderBy('criadaEm', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        criadaEm: doc.data().criadaEm?.toDate(),
      })) as Room[];
      
      setRooms(roomsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const handleDelete = async (roomId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta sala?')) {
      try {
        await deleteDoc(doc(db, 'salas', roomId));
        toast({
          title: "Sala excluída",
          description: "A sala foi removida com sucesso",
        });
      } catch (error) {
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir a sala",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5">
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
            <p className="text-muted-foreground">Gerencie suas salas de votação</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/admin/create-room')} className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Sala
            </Button>
            <Button onClick={handleLogout} variant="outline" className="gap-2">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">Carregando salas...</p>
        ) : rooms.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma sala criada</h3>
              <p className="text-muted-foreground mb-4">Crie sua primeira sala para começar</p>
              <Button onClick={() => navigate('/admin/create-room')} className="gap-2">
                <Plus className="h-4 w-4" />
                Criar Sala
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <Card key={room.id} className="hover:shadow-elevated transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">{room.nome}</CardTitle>
                    <Badge variant={room.status === 'aberta' ? 'default' : 'secondary'}>
                      {room.status === 'aberta' ? 'Aberta' : 'Encerrada'}
                    </Badge>
                  </div>
                  <CardDescription>
                    <span className="font-mono text-lg">Código: {room.codigo}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Button
                    onClick={() => navigate(`/admin/room/${room.id}`)}
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Gerenciar
                  </Button>
                  <Button
                    onClick={() => handleDelete(room.id)}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
