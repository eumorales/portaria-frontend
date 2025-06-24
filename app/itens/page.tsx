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
import { api, type Item } from "@/lib/api";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Key,
  Radio,
  Box,
  MapPin,
} from "lucide-react";

export default function ItensPage() {
  const [itens, setItens] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: "",
    tipo: "CHAVE" as "CHAVE" | "CONTROLE" | "OUTRO",
    localizacao: "",
    disponivel: true,
  });

  useEffect(() => {
    fetchItens();
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

  const fetchItens = async () => {
    try {
      setLoading(true);
      const data = await api.getItems();
      setItens(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar itens:", error);
      setError("Erro ao carregar itens");
      setItens([]);
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
      if (editingItem) {
        const updatedItem = await api.updateItem(editingItem.id, formData);
        setSuccess("Item atualizado com sucesso!");
        setItens((prev) =>
          prev.map((item) => (item.id === editingItem.id ? updatedItem : item))
        );
      } else {
        const newItem = await api.createItem(formData);
        setSuccess("Item criado com sucesso!");
        setItens((prev) => [...prev, newItem]);
      }

      setIsDialogOpen(false);
      setEditingItem(null);
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar item:", error);
      setError("Erro ao salvar item");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setFormData({
      nome: item.nome || "",
      tipo: item.tipo || "CHAVE",
      localizacao: item.localizacao || "",
      disponivel: item.disponivel ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este item?")) return;

    setDeletingItemId(id);
    setError("");
    setSuccess("");

    try {
      setItens((prev) => prev.filter((item) => item.id !== id));

      await api.deleteItem(id);
      setSuccess("Item excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir item:", error);
      setError("Erro ao excluir item");

      await fetchItens();
    } finally {
      setDeletingItemId(null);
    }
  };

  const toggleDisponibilidade = async (id: string, disponivel: boolean) => {
    setError("");
    setSuccess("");

    try {
      const updatedItem = await api.toggleItemAvailability(id, !disponivel);
      setSuccess(
        `Item ${
          !disponivel ? "disponibilizado" : "indisponibilizado"
        } com sucesso!`
      );
      setItens((prev) =>
        prev.map((item) => (item.id === id ? updatedItem : item))
      );
    } catch (error) {
      console.error("Erro ao alterar disponibilidade:", error);
      setError("Erro ao alterar disponibilidade");
    }
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      tipo: "CHAVE",
      localizacao: "",
      disponivel: true,
    });
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "CHAVE":
        return <Key className="h-4 w-4" />;
      case "CONTROLE":
        return <Radio className="h-4 w-4" />;
      case "OUTRO":
        return <Box className="h-4 w-4" />;
      default:
        return <Box className="h-4 w-4" />;
    }
  };

  const getTipoBadgeColor = (tipo: string) => {
    switch (tipo) {
      case "CHAVE":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "CONTROLE":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "OUTRO":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading && itens.length === 0) {
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
              Gerenciar Itens
            </h1>
            <p className="text-gray-600">
              Controle todos os itens disponíveis para reserva
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={openCreateDialog}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Editar Item" : "Novo Item"}
                </DialogTitle>
                <DialogDescription>
                  {editingItem
                    ? "Edite as informações do item"
                    : "Preencha os dados do novo item"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome do Item</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    placeholder="Ex: Chave da Sala 101"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tipo">Tipo</Label>
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
                      <SelectItem value="CHAVE">Chave</SelectItem>
                      <SelectItem value="CONTROLE">Controle</SelectItem>
                      <SelectItem value="OUTRO">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="localizacao">Localização</Label>
                  <Input
                    id="localizacao"
                    value={formData.localizacao}
                    onChange={(e) =>
                      setFormData({ ...formData, localizacao: e.target.value })
                    }
                    placeholder="Ex: Armário A1, Gaveta 3"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="disponivel"
                    checked={formData.disponivel}
                    onChange={(e) =>
                      setFormData({ ...formData, disponivel: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="disponivel">Item disponível</Label>
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
                      : editingItem
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Itens</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {itens.length}
                  </p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Disponíveis</p>
                  <p className="text-2xl font-bold text-green-600">
                    {itens.filter((i) => i.disponivel).length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Em Uso</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {itens.filter((i) => !i.disponivel).length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {itens.map((item) => (
            <Card
              key={item.id}
              className={`bg-white shadow-lg hover:shadow-xl transition-all duration-200 border-0 ${
                deletingItemId === item.id
                  ? "opacity-50 pointer-events-none"
                  : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2 leading-tight">
                      {item.nome}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    <Badge
                      className={getTipoBadgeColor(item.tipo)}
                      variant="secondary"
                    >
                      <div className="flex items-center gap-1">
                        {getTipoIcon(item.tipo)}
                        <span className="text-xs font-medium">{item.tipo}</span>
                      </div>
                    </Badge>
                    {item.disponivel ? (
                      <div
                        className="w-3 h-3 bg-green-500 rounded-full border-2 border-green-200"
                        title="Disponível"
                      />
                    ) : (
                      <div
                        className="w-3 h-3 bg-red-500 rounded-full border-2 border-red-200"
                        title="Em uso"
                      />
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="line-clamp-1">{item.localizacao}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">Status:</span>
                    <Badge
                      variant="secondary"
                      className={
                        item.disponivel
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-red-100 text-red-800 border-red-200"
                      }
                    >
                      {item.disponivel ? "Disponível" : "Em uso"}
                    </Badge>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(item)}
                      className="flex-1 h-8 text-xs"
                      disabled={deletingItemId === item.id}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant={item.disponivel ? "secondary" : "default"}
                      onClick={() =>
                        toggleDisponibilidade(item.id, item.disponivel)
                      }
                      className="flex-1 h-8 text-xs"
                      disabled={deletingItemId === item.id}
                    >
                      {item.disponivel ? "Indisponibilizar" : "Disponibilizar"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingItemId === item.id}
                      className="h-8 px-2"
                    >
                      {deletingItemId === item.id ? (
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

        {itens.length === 0 && !loading && (
          <Card className="bg-white shadow-lg">
            <CardContent className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum item encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                Comece criando seu primeiro item
              </p>
              <Button
                onClick={openCreateDialog}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Item
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
