import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useArtilharia, Jogador } from '@/hooks/useArtilharia';
import { Plus, Edit, Trash2, Minus, Trophy, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const ArtilhariaManager = () => {
  const {
    jogadores,
    addJogador,
    updateJogador,
    deleteJogador,
    adicionarGol,
    removerGol,
    resetArtilharia
  } = useArtilharia();
  const { toast } = useToast();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingJogador, setEditingJogador] = useState<Jogador | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
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

  const handleSyncSupabase = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para salvar no banco de dados.",
        variant: "destructive",
      });
      return;
    }

    if (!window.confirm('Deseja salvar a lista atual de artilharia no banco de dados? Isso substituirá os dados salvos anteriormente.')) {
      return;
    }

    setIsImporting(true);
    try {
      // 1. Primeiro remove os dados antigos para evitar duplicatas ou conflitos
      const { error: deleteError } = await supabase
        .from('artilharia')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // 2. Prepara os dados atuais (o que está na tela) para inserção
      const dataToSave = jogadores.map(j => ({
        nome: j.nome,
        gols: j.gols,
        posicao: j.posicao || null,
        user_id: user.id
      }));

      if (dataToSave.length > 0) {
        const { error: insertError } = await supabase
          .from('artilharia')
          .insert(dataToSave);

        if (insertError) throw insertError;
      }

      toast({
        title: "Dados salvos!",
        description: "Sua lista de artilharia foi sincronizada com o banco de dados.",
        variant: "default",
      });
    } catch (error: any) {
      console.error('Erro ao sincronizar artilharia:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleResetAll = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para realizar esta ação.",
        variant: "destructive",
      });
      return;
    }

    if (!window.confirm('TEM CERTEZA? Isso irá deletar TODOS os jogadores da artilharia do banco de dados e do seu celular. Esta ação não pode ser desfeita!')) {
      return;
    }

    setIsResetting(true);
    try {
      // Deleta do Supabase
      const { error } = await supabase
        .from('artilharia')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      // Deleta do localStorage e estado local
      await resetArtilharia();

      toast({
        title: "Artilharia Zerada",
        description: "Todos os dados foram removidos com sucesso.",
        variant: "default",
      });
    } catch (error: any) {
      console.error('Erro ao zerar artilharia:', error);
      toast({
        title: "Erro",
        description: `Não foi possível zerar os dados: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Artilharia</h2>
          <p className="text-muted-foreground">Gerencie os jogadores e seus gols</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button
            onClick={handleSyncSupabase}
            disabled={isImporting || !user}
            className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none"
          >
            <Database className="w-4 h-4 mr-2" />
            <span className="truncate">{isImporting ? 'Salvando...' : 'Salvar'}</span>
          </Button>
          <Button
            onClick={handleResetAll}
            variant="destructive"
            disabled={isResetting || !user}
            className="flex-1 sm:flex-none"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            <span className="truncate">{isResetting ? 'Zerando...' : 'Zerar Tudo'}</span>
          </Button>
          <Button
            onClick={() => {
              setShowForm(true);
              setEditingJogador(null);
              setFormData({ nome: '', gols: 0, posicao: '' });
            }}
            variant="outline"
            className="flex-1 sm:flex-none"
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
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white text-white">
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
                    <TableHead className="hidden sm:table-cell">Posição</TableHead>
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
                      <TableCell className="hidden sm:table-cell">{jogador.posicao || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => removerGol(jogador.id)}
                            disabled={jogador.gols === 0}
                            className="h-7 w-7 sm:h-8 sm:w-8"
                          >
                            <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          <span className="text-lg sm:text-xl font-bold min-w-[2rem] sm:min-w-[3rem] text-center">
                            {jogador.gols}
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => adicionarGol(jogador.id)}
                            className="h-7 w-7 sm:h-8 sm:w-8"
                          >
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
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

