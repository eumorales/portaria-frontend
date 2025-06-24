"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Header } from "@/components/header";
import { api, type LimparReservasResponse } from "@/lib/api";
import {
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Package,
  Clock,
  RotateCcw,
  Home,
} from "lucide-react";

import Link from "next/link";

export default function LimparPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resultado, setResultado] = useState<LimparReservasResponse | null>(
    null
  );
  const [confirmacao, setConfirmacao] = useState(false);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleLimpar = async () => {
    if (!confirmacao) {
      setError("Você deve confirmar a operação antes de prosseguir");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setResultado(null);

    try {
      const response = await api.limparTodasReservas();
      setResultado(response);
      setSuccess("Todas as reservas foram removidas com sucesso!");
      setConfirmacao(false);
    } catch (error) {
      console.error("Erro ao limpar reservas:", error);
      setError("Erro ao limpar reservas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const resetPage = () => {
    setError("");
    setSuccess("");
    setResultado(null);
    setConfirmacao(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trash2 className="h-12 w-12 text-red-600" />
            <h1 className="text-4xl font-bold text-gray-900">Limpar Sistema</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Esta operação irá remover todas as reservas ativas e histórico do
            sistema
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

        {resultado && (
          <Card className="mb-8 bg-white shadow-lg border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-6 w-6" />
                Operação Concluída com Sucesso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">
                    {resultado.reservasAtivasRemovidas}
                  </p>
                  <p className="text-sm text-gray-600">
                    Reservas Ativas Removidas
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">
                    {resultado.totalReservasRemovidas}
                  </p>
                  <p className="text-sm text-gray-600">
                    Total de Reservas Removidas
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Package className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">
                    {resultado.itensDisponibilizados}
                  </p>
                  <p className="text-sm text-gray-600">
                    Itens Disponibilizados
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-xs font-medium text-gray-600">
                    {new Date(resultado.timestamp).toLocaleString("pt-BR")}
                  </p>
                  <p className="text-sm text-gray-600">Data/Hora da Operação</p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-green-100 rounded-lg">
                <p className="text-green-800 font-medium">
                  {resultado.message}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {!resultado && (
          <Card className="max-w-2xl mx-auto bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-6 w-6" />
                Atenção: Operação Irreversível
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">
                  Esta operação irá:
                </h3>
                <ul className="space-y-2 text-red-700">
                  <li className="flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Remover todas as reservas ativas do sistema
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Apagar todo o histórico de reservas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Marcar todos os itens como disponíveis
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    <strong>Esta ação não pode ser desfeita!</strong>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="confirmacao"
                    checked={confirmacao}
                    onChange={(e) => setConfirmacao(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label
                    htmlFor="confirmacao"
                    className="text-sm font-medium text-gray-700"
                  >
                    Eu entendo que esta operação é irreversível.
                  </label>
                </div>

                <div className="flex gap-4">
                  <Link href="/" className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Home className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </Link>
                  <Button
                    onClick={handleLimpar}
                    disabled={!confirmacao || loading}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Limpando...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Limpar Todas as Reservas
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {resultado && (
          <div className="max-w-md mx-auto space-y-4">
            <Link href="/">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Home className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </Link>
            <Button onClick={resetPage} variant="outline" className="w-full">
              <RotateCcw className="h-4 w-4 mr-2" />
              Realizar Nova Limpeza
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
