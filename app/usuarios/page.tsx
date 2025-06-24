"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/header";
import { api, type User } from "@/lib/api";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Mail,
  BadgeIcon as IdCard,
  GraduationCap,
  UserCheck,
  Shield,
} from "lucide-react";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: "",
    tipo: "ALUNO" as "ALUNO" | "PROFESSOR" | "PORTEIRO",
    matricula: "",
    email: "",
  });

  useEffect(() => {
    fetchUsuarios();
  }, []);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      setError("Erro ao carregar usuários");
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (editingUser) {
        const updatedUser = await api.updateUser(editingUser.id, formData);
        setSuccess("Usuário atualizado com sucesso!");
        setUsuarios((prev) =>
          prev.map((user) => (user.id === editingUser.id ? updatedUser : user))
        );
      } else {
        const newUser = await api.createUser(formData);
        setSuccess("Usuário criado com sucesso!");
        setUsuarios((prev) => [...prev, newUser]);
      }

      setIsDialogOpen(false);
      setEditingUser(null);
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      setError("Erro ao salvar usuário");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      nome: user.nome || "",
      tipo: user.tipo || "ALUNO",
      matricula: user.matricula || "",
      email: user.email || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

    setDeletingUserId(id);
    setError("");
    setSuccess("");

    try {
      setUsuarios((prev) => prev.filter((user) => user.id !== id));

      await api.deleteUser(id);
      setSuccess("Usuário excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      setError("Erro ao excluir usuário");

      await fetchUsuarios();
    } finally {
      setDeletingUserId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      tipo: "ALUNO",
      matricula: "",
      email: "",
    });
  };

  const openCreateDialog = () => {
    setEditingUser(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "ALUNO":
        return <GraduationCap className="h-4 w-4" />;
      case "PROFESSOR":
        return <UserCheck className="h-4 w-4" />;
      case "PORTEIRO":
        return <Shield className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getTipoBadgeColor = (tipo: string) => {
    switch (tipo) {
      case "ALUNO":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PROFESSOR":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "PORTEIRO":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading && usuarios.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gerenciar Usuários
            </h1>
            <p className="text-gray-600">
              Controle todos os usuários do sistema
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={openCreateDialog}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? "Editar Usuário" : "Novo Usuário"}
                </DialogTitle>
                <DialogDescription>
                  {editingUser
                    ? "Edite as informações do usuário"
                    : "Preencha os dados do novo usuário"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    placeholder="Ex: Gilberto Morales"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tipo">Tipo de Usuário</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, tipo: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALUNO">Aluno</SelectItem>
                      <SelectItem value="PROFESSOR">Professor</SelectItem>
                      <SelectItem value="PORTEIRO">Porteiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="matricula">Matrícula</Label>
                  <Input
                    id="matricula"
                    value={formData.matricula}
                    onChange={(e) =>
                      setFormData({ ...formData, matricula: e.target.value })
                    }
                    placeholder="Ex: 2023010187"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="Ex: eu@gilbertomorales.com"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading
                      ? "Salvando..."
                      : editingUser
                      ? "Atualizar"
                      : "Criar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {usuarios.length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Alunos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {usuarios.filter((u) => u.tipo === "ALUNO").length}
                  </p>
                </div>
                <GraduationCap className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Professores</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {usuarios.filter((u) => u.tipo === "PROFESSOR").length}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Porteiros</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {usuarios.filter((u) => u.tipo === "PORTEIRO").length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {usuarios.map((usuario) => (
            <Card
              key={usuario.id}
              className={`bg-white shadow-lg hover:shadow-xl transition-all duration-200 border-0 ${
                deletingUserId === usuario.id
                  ? "opacity-50 pointer-events-none"
                  : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2 leading-tight">
                      {usuario.nome}
                    </CardTitle>
                  </div>
                  <Badge
                    className={getTipoBadgeColor(usuario.tipo)}
                    variant="secondary"
                  >
                    <div className="flex items-center gap-1">
                      {getTipoIcon(usuario.tipo)}
                      <span className="text-xs font-medium">
                        {usuario.tipo}
                      </span>
                    </div>
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <IdCard className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="font-medium">{usuario.matricula}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="line-clamp-1">{usuario.email}</span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(usuario)}
                      className="flex-1 h-8 text-xs"
                      disabled={deletingUserId === usuario.id}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(usuario.id)}
                      disabled={deletingUserId === usuario.id}
                      className="h-8 px-2"
                    >
                      {deletingUserId === usuario.id ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {usuarios.length === 0 && !loading && (
          <Card className="bg-white shadow-lg">
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum usuário encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                Comece criando seu primeiro usuário
              </p>
              <Button
                onClick={openCreateDialog}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Usuário
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
