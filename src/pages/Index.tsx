import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Vote, Shield, BarChart3, Users } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: 'Seguro e Confiável',
      description: 'Um voto por unidade com validação em tempo real',
    },
    {
      icon: BarChart3,
      title: 'Resultados em Tempo Real',
      description: 'Acompanhe os votos conforme são registrados',
    },
    {
      icon: Users,
      title: 'Fácil de Usar',
      description: 'Interface simples para moradores e administradores',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Vote className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Sistema de Votação
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Plataforma digital para votações em assembleias de condomínios de forma segura e transparente
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-elevated transition-all">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="max-w-md mx-auto space-y-4">
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle className="text-center">Acesso Administrativo</CardTitle>
              <CardDescription className="text-center">
                Gerencie votações e visualize resultados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/admin/login')} className="w-full" size="lg">
                Entrar como Administrador
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Recebeu um código de sala?
              </p>
              <Button onClick={() => navigate('/enter-room')} variant="outline" size="lg" className="w-full">
                Entrar na Sala de Votação
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
