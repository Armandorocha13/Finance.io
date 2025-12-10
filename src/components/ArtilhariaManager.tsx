import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useArtilharia, Jogador } from '@/hooks/useArtilharia';
import { Plus, Edit, Trash2, Minus, Trophy, Upload, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { jogadoresData } from '@/utils/populateArtilharia';
import { importArtilhariaToSupabase } from '@/utils/importArtilhariaToSupabase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const ArtilhariaManager: React.FC = () => {
  const { jogadores, addJogador, updateJogador, deleteJogador, adicionarGol, removerGol } = useArtilharia();
  const { toast } = useToast();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingJogador, setEditingJogador] = useState<Jogador | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    gols: 0,
    posicao: '',
  });

  const posicoes = [
    'Goleiro',
    'Zagueiro',
    'Lateral',
    'Volante',
    'Meia',
    'Atacante',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome) return;

    if (editingJogador) {
      updateJogador(editingJogador.id, {
        nome: formData.nome,
        gols: formData.gols,
        posicao: formData.posicao || undefined,
      });
      setEditingJogador(null);
    } else {
      addJogador({
        nome: formData.nome,
        gols: formData.gols,
        posicao: formData.posicao || undefined,
      });
    }

    setFormData({ nome: '', gols: 0, posicao: '' });
    setShowForm(false);
  };

  const handleEdit = (jogador: Jogador) => {
    setEditingJogador(jogador);
    setFormData({
      nome: jogador.nome,
      gols: jogador.gols,
      posicao: jogador.posicao || '',
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({ nome: '', gols: 0, posicao: '' });
    setShowForm(false);
    setEditingJogador(null);
  };

  const handleImportJogadores = () => {
    if (window.confirm('Deseja importar todos os jogadores? Isso irá adicionar os jogadores à lista existente.')) {
      const newJogadores = jogadoresData.map((data, index) => ({
        id: `${Date.now()}-${index}`,
        nome: data.jogador,
        gols: data.gols,
        posicao: undefined,
      }));

      const existing = localStorage.getItem('artilharia');
      const existingJogadores = existing ? JSON.parse(existing) : [];
      
      // Verifica se já existem jogadores com os mesmos nomes
      const existingNames = new Set(existingJogadores.map((j: Jogador) => j.nome.toLowerCase()));
      const jogadoresToAdd = newJogadores.filter(j => !existingNames.has(j.nome.toLowerCase()));
      
      if (jogadoresToAdd.length === 0) {
        toast({
          title: "Nenhum jogador novo",
          description: "Todos os jogadores já estão cadastrados.",
          variant: "default",
        });
        return;
      }

      const allJogadores = [...existingJogadores, ...jogadoresToAdd];
      localStorage.setItem('artilharia', JSON.stringify(allJogadores));
      
      toast({
        title: "Jogadores importados!",
        description: `${jogadoresToAdd.length} jogadores foram adicionados com sucesso.`,
        variant: "default",
      });
      
      // Recarrega a página para atualizar a lista
      window.location.reload();
    }
  };

  const handleImportToSupabase = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para importar para o banco de dados.",
        variant: "destructive",
      });
      return;
    }

    if (!window.confirm('Deseja importar todos os jogadores para o banco de dados Supabase? Isso irá adicionar os jogadores à tabela Artilharia.')) {
      return;
    }

    setIsImporting(true);
    try {
      const result = await importArtilhariaToSupabase(user.id);
      
      if (result.success) {
        toast({
          title: "Importação concluída!",
          description: result.message,
          variant: "default",
        });
        // Recarrega a página para atualizar a lista
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast({
          title: "Erro na importação",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: `Erro ao importar: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Artilharia</h2>
          <p className="text-muted-foreground">Gerencie os jogadores e seus gols</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleImportJogadores}
            variant="outline"
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar (Local)
          </Button>
          <Button
            onClick={handleImportToSupabase}
            variant="outline"
            disabled={isImporting || !user}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
          >
            <Database className="w-4 h-4 mr-2" />
            {isImporting ? 'Importando...' : 'Importar (Banco)'}
          </Button>
          <Button
            onClick={() => {
              setShowForm(true);
              setEditingJogador(null);
              setFormData({ nome: '', gols: 0, posicao: '' });
            }}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Jogador
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="bg-card/10 backdrop-blur-lg border-border">
          <CardHeader>
            <CardTitle className="text-foreground">
              {editingJogador ? 'Editar Jogador' : 'Novo Jogador'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Jogador *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Nome completo"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="posicao">Posição</Label>
                  <Select
                    value={formData.posicao}
                    onValueChange={(value) => setFormData({ ...formData, posicao: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a posição" />
                    </SelectTrigger>
                    <SelectContent>
                      {posicoes.map((pos) => (
                        <SelectItem key={pos} value={pos}>
                          {pos}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gols">Gols</Label>
                  <Input
                    id="gols"
                    type="number"
                    value={formData.gols}
                    onChange={(e) => setFormData({ ...formData, gols: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingJogador ? 'Atualizar' : 'Adicionar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card/10 backdrop-blur-lg border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Lista de Artilharia
          </CardTitle>
        </CardHeader>
        <CardContent>
          {jogadores.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum jogador cadastrado ainda.</p>
              <p className="text-sm">Adicione jogadores para começar a acompanhar a artilharia!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Jogador</TableHead>
                    <TableHead>Posição</TableHead>
                    <TableHead className="text-center">Gols</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jogadores.map((jogador, index) => (
                    <TableRow key={jogador.id}>
                      <TableCell className="font-bold">
                        {index === 0 && jogador.gols > 0 ? (
                          <Trophy className="w-5 h-5 text-yellow-500" />
                        ) : (
                          index + 1
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{jogador.nome}</TableCell>
                      <TableCell>{jogador.posicao || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => removerGol(jogador.id)}
                            disabled={jogador.gols === 0}
                            className="h-8 w-8"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="text-xl font-bold min-w-[3rem] text-center">
                            {jogador.gols}
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => adicionarGol(jogador.id)}
                            className="h-8 w-8"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(jogador)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteJogador(jogador.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ArtilhariaManager;

