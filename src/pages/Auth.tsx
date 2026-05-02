import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff, DollarSign, Mail, Sparkles } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isMagic, setIsMagic] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const { signIn, signUp, signInWithMagicLink, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redireciona para home se já estiver autenticado
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          let errorMessage = 'Erro ao fazer login. Tente novamente.';
          if (error.message.includes('Invalid login credentials') || error.message.includes('Invalid credentials')) {
            errorMessage = 'Email ou senha incorretos. Verifique suas credenciais.';
          } else if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
            errorMessage = 'Email não confirmado. Verifique sua caixa de entrada e confirme seu email antes de fazer login.';
          } else if (error.message.includes('User not found')) {
            errorMessage = 'Usuário não encontrado. Verifique se o email está correto.';
          } else {
            errorMessage = error.message || errorMessage;
          }
          toast({ title: 'Erro de Login', description: errorMessage, variant: 'destructive' });
        } else {
          toast({ title: 'Login realizado!', description: 'Bem-vindo de volta ao Vaidoso FC!' });
          setTimeout(() => navigate('/'), 500);
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes('User already registered')) {
            toast({ title: 'Usuário já existe', description: 'Este email já está cadastrado. Faça login ou use outro email.', variant: 'destructive' });
          } else {
            toast({ title: 'Erro no Cadastro', description: error.message, variant: 'destructive' });
          }
        } else {
          toast({ title: 'Cadastro realizado!', description: 'Conta criada com sucesso! Redirecionando...' });
          setTimeout(() => navigate('/'), 1500);
        }
      }
    } catch {
      toast({ title: 'Erro', description: 'Ocorreu um erro inesperado. Tente novamente.', variant: 'destructive' });
    }

    setLoading(false);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await signInWithMagicLink(email);
      if (error) {
        toast({ title: 'Erro', description: error.message || 'Não foi possível enviar o link.', variant: 'destructive' });
      } else {
        setMagicSent(true);
      }
    } catch {
      toast({ title: 'Erro', description: 'Ocorreu um erro inesperado.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };



  // Exibe loading durante verificação de autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se já está autenticado, não renderiza nada (será redirecionado)
  if (user) return null;

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a0a] flex items-center justify-center p-6">
      {/* Animated background elements */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-green-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute -bottom-8 right-20 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-6000"></div>
        <div className="absolute inset-0 bg-[#0a0a0a] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src="/logo.png" alt="Vaidoso FC" className="w-36 h-36 object-contain drop-shadow-2xl mix-blend-plus-lighter" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Vaidoso FC</h1>
          <p className="text-slate-300">Gestão financeira e artilharia do clube</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-white">
              {isMagic ? 'Link por Email' : (isLogin ? 'Login' : 'Criar Conta')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">



            {/* ── Magic Link ── */}
            {isMagic ? (
              magicSent ? (
                <div className="text-center space-y-3 py-4">
                  <Mail className="w-10 h-10 text-green-400 mx-auto" />
                  <p className="text-white font-semibold">Link enviado!</p>
                  <p className="text-slate-300 text-sm">
                    Verifique o email <strong className="text-green-400">{email}</strong> e clique no link para entrar.
                  </p>
                  <Button
                    variant="ghost"
                    onClick={() => { setMagicSent(false); setEmail(''); }}
                    className="text-slate-400 hover:text-white hover:bg-white/10 text-sm"
                  >
                    Usar outro email
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div>
                    <Label htmlFor="magic-email" className="text-white">Email</Label>
                    <Input
                      id="magic-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Digite seu email"
                      className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                      required
                    />
                    <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-green-400" />
                      Enviaremos um link de acesso. Sem senha!
                    </p>
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-xl"
                  >
                    {loading ? 'Enviando...' : 'Enviar Magic Link ✨'}
                  </Button>
                </form>
              )
            ) : (
              /* ── Formulário Email + Senha ── */
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <Label htmlFor="fullName" className="text-white">Nome Completo</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Digite seu nome completo"
                      className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                      required={!isLogin}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Digite seu email"
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-white">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Digite sua senha"
                      className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white hover:bg-white/10"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-xl"
                >
                  {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
                </Button>
              </form>
            )}

            {/* ── Links de navegação ── */}
            <div className="mt-4 text-center space-y-2">
              {/* Alternar login/cadastro */}
              {!isMagic && (
                <div>
                  <p className="text-slate-300">
                    {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => { setIsLogin(!isLogin); setPassword(''); setFullName(''); }}
                    className="text-green-400 hover:text-green-300 hover:bg-white/10 mt-1"
                  >
                    {isLogin ? 'Criar conta' : 'Fazer login'}
                  </Button>
                </div>
              )}

              {/* Alternar entre email+senha e magic link */}
              <Button
                type="button"
                variant="ghost"
                onClick={() => { setIsMagic(!isMagic); setMagicSent(false); setEmail(''); }}
                className="text-slate-400 hover:text-green-300 hover:bg-white/10 text-sm"
              >
                {isMagic ? '← Voltar para login com senha' : '✨ Entrar sem senha (Magic Link)'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
