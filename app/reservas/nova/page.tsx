"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/header";
import { api, type Item, type User } from "@/lib/api";
import { Plus, CheckCircle, XCircle, UserIcon, Package } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NovaReservaPage() {
  const router = useRouter();
  const [itensDisponiveis, setItensDisponiveis] = useState<Item[]>([]);
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    itemId: "",
    matriculaUsuario: "",
  });

  useEffect(() => {
    fetchData();
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itens, users] = await Promise.all([
        api.getAvailableItems(),
        api.getUsers(),
      ]);
      setItensDisponiveis(itens);
      setUsuarios(users);
    } catch (error) {
      setError("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.itemId || !formData.matriculaUsuario) {
      setError("Preencha todos os campos");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.createReserva(formData);
      setSuccess("Reserva criada com sucesso!");

      setFormData({
        itemId: "",
        matriculaUsuario: "",
      });

      fetchData();

      setTimeout(() => {
        router.push("/reservas");
      }, 2000);
    } catch (error) {
      setError("Erro ao criar reserva");
    } finally {
      setLoading(false);
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "CHAVE":
        return "bg-blue-100 text-blue-800";
      case "CONTROLE":
        return "bg-purple-100 text-purple-800";
      case "OUTRO":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTipoUsuarioColor = (tipo: string) => {
    switch (tipo) {
      case "ALUNO":
        return "bg-blue-100 text-blue-800";
      case "PROFESSOR":
        return "bg-purple-100 text-purple-800";
      case "PORTEIRO":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Nova Reserva
          </h1>
          <p className="text-gray-600">
            Crie uma nova reserva selecionando um item e usuário
          </p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-600" />
                Criar Reserva
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="itemId">Selecionar Item</Label>
                  <Select
                    value={formData.itemId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, itemId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha um item disponível" />
                    </SelectTrigger>
                    <SelectContent>
                      {itensDisponiveis.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          <div className="flex items-center gap-2">
                            <span>{item.nome}</span>
                            <Badge
                              className={getTipoColor(item.tipo)}
                              variant="secondary"
                            >
                              {item.tipo}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="matriculaUsuario">Matrícula do Usuário</Label>
                  <Input
                    id="matriculaUsuario"
                    value={formData.matriculaUsuario}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        matriculaUsuario: e.target.value,
                      })
                    }
                    placeholder="Digite a matrícula do usuário"
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/reservas")}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {loading ? "Criando..." : "Criar Reserva"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Itens Disponíveis ({itensDisponiveis.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {itensDisponiveis.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Nenhum item disponível no momento
                  </p>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {itensDisponiveis.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          formData.itemId === item.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() =>
                          setFormData({ ...formData, itemId: item.id })
                        }
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{item.nome}</h4>
                          <Badge
                            className={getTipoColor(item.tipo)}
                            variant="secondary"
                          >
                            {item.tipo}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.localizacao}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-purple-600" />
                  Usuários Cadastrados ({usuarios.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {usuarios.map((usuario) => (
                    <div
                      key={usuario.id}
                      className="flex justify-between items-center p-2 border rounded hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-medium">{usuario.nome}</p>
                        <p className="text-sm text-gray-600">
                          {usuario.matricula}
                        </p>
                      </div>
                      <Badge
                        className={getTipoUsuarioColor(usuario.tipo)}
                        variant="secondary"
                      >
                        {usuario.tipo}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
