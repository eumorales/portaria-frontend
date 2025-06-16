"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Header } from "@/components/header";
import { api, type User, type ReservaResponse, type Item } from "@/lib/api";
import {
  Search,
  UserIcon,
  Calendar,
  Package,
  CheckCircle,
  XCircle,
  CreditCard,
} from "lucide-react";

type OperationMode = "buscar" | "reservar" | "retirar" | "devolver";

export default function PortariaPage() {
  const [matricula, setMatricula] = useState("");
  const [usuario, setUsuario] = useState<User | null>(null);
  const [reservasAtivas, setReservasAtivas] = useState<ReservaResponse[]>([]);
  const [itensDisponiveis, setItensDisponiveis] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [operationMode, setOperationMode] = useState<OperationMode>("buscar");
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [selectedReservaId, setSelectedReservaId] = useState<string>("");

  // Refs para os inputs
  const matriculaInputRef = useRef<HTMLInputElement>(null);
  const operationInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus no input principal quando a página carrega
  useEffect(() => {
    if (matriculaInputRef.current) {
      matriculaInputRef.current.focus();
    }
  }, []);

  // Auto-focus no input de operação quando necessário
  useEffect(() => {
    if (operationMode !== "buscar" && operationInputRef.current) {
      operationInputRef.current.focus();
    }
  }, [operationMode]);

  // Limpar alertas após 5 segundos
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const resetToSearch = () => {
    setOperationMode("buscar");
    setSelectedItemId("");
    setSelectedReservaId("");
    setMatricula("");
    setUsuario(null);
    setReservasAtivas([]);
    setItensDisponiveis([]);
    setTimeout(() => {
      if (matriculaInputRef.current) {
        matriculaInputRef.current.focus();
      }
    }, 100);
  };

  const buscarUsuario = async (matriculaParam?: string) => {
    const matriculaToUse = matriculaParam || matricula;
    if (!matriculaToUse.trim()) {
      setError("Digite uma matrícula");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const user = await api.lerCracha(matriculaToUse);
      const reservas = await api.consultarReservasAtivasPorCracha(
        matriculaToUse
      );
      const itens = await api.getAvailableItems();

      setUsuario(user);
      setReservasAtivas(reservas);
      setItensDisponiveis(itens);
      setSuccess(`Usuário encontrado: ${user.nome}`);
    } catch (error) {
      setError("Usuário não encontrado ou erro na consulta");
      setUsuario(null);
      setReservasAtivas([]);
      setItensDisponiveis([]);
    } finally {
      setLoading(false);
    }
  };

  const fazerReserva = async (itemId: string, matriculaParam?: string) => {
    const matriculaToUse = matriculaParam || usuario?.matricula;
    if (!matriculaToUse || !itemId) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const reserva = await api.reservarPorCracha(matriculaToUse, itemId);
      setSuccess(`Reserva realizada: ${reserva.nomeItem}`);

      // Atualizar dados
      const reservas = await api.consultarReservasAtivasPorCracha(
        matriculaToUse
      );
      const itens = await api.getAvailableItems();
      setReservasAtivas(reservas);
      setItensDisponiveis(itens);

      // Voltar para busca após 2 segundos
      setTimeout(resetToSearch, 2000);
    } catch (error) {
      setError("Erro ao fazer reserva");
    } finally {
      setLoading(false);
    }
  };

  const registrarRetirada = async (
    reservaId: string,
    matriculaParam?: string
  ) => {
    const matriculaToUse = matriculaParam || usuario?.matricula;
    if (!matriculaToUse || !reservaId) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const reserva = await api.retirarPorCracha(matriculaToUse, reservaId);
      setSuccess(`Retirada registrada: ${reserva.nomeItem}`);

      // Atualizar dados
      const reservas = await api.consultarReservasAtivasPorCracha(
        matriculaToUse
      );
      setReservasAtivas(reservas);

      // Voltar para busca após 2 segundos
      setTimeout(resetToSearch, 2000);
    } catch (error) {
      setError("Erro ao registrar retirada");
    } finally {
      setLoading(false);
    }
  };

  const registrarDevolucao = async (
    reservaId: string,
    matriculaParam?: string
  ) => {
    const matriculaToUse = matriculaParam || usuario?.matricula;
    if (!matriculaToUse || !reservaId) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const reserva = await api.devolverPorCracha(matriculaToUse, reservaId);
      setSuccess(`Devolução registrada: ${reserva.nomeItem}`);

      // Atualizar dados
      const reservas = await api.consultarReservasAtivasPorCracha(
        matriculaToUse
      );
      const itens = await api.getAvailableItems();
      setReservasAtivas(reservas);
      setItensDisponiveis(itens);

      // Voltar para busca após 2 segundos
      setTimeout(resetToSearch, 2000);
    } catch (error) {
      setError("Erro ao registrar devolução");
    } finally {
      setLoading(false);
    }
  };

  // Handler para o input principal (matrícula)
  const handleMatriculaSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      e.preventDefault();
      buscarUsuario();
    }
  };

  // Handler para o input de operação (quando não está no modo buscar)
  const handleOperationSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      e.preventDefault();
      const value = e.currentTarget.value.trim();

      if (operationMode === "reservar") {
        // Buscar item por ID ou nome
        const item = itensDisponiveis.find(
          (i) =>
            i.id === value || i.nome.toLowerCase().includes(value.toLowerCase())
        );
        if (item) {
          fazerReserva(item.id, value);
        } else {
          setError("Item não encontrado");
        }
      } else if (operationMode === "retirar") {
        // Buscar reserva para retirada
        const reserva = reservasAtivas.find(
          (r) => r.id === value || r.matriculaUsuario === value
        );
        if (reserva && reserva.status === "RESERVADO") {
          registrarRetirada(reserva.id, value);
        } else {
          setError("Reserva não encontrada ou já retirada");
        }
      } else if (operationMode === "devolver") {
        // Buscar reserva para devolução
        const reserva = reservasAtivas.find(
          (r) => r.id === value || r.matriculaUsuario === value
        );
        if (reserva && reserva.status === "RETIRADO") {
          registrarDevolucao(reserva.id, value);
        } else {
          setError("Reserva não encontrada ou não está retirada");
        }
      }

      // Limpar o campo
      e.currentTarget.value = "";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RESERVADO":
        return "bg-yellow-100 text-yellow-800";
      case "RETIRADO":
        return "bg-blue-100 text-blue-800";
      case "DEVOLVIDO":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTipoColor = (tipo: string) => {
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sistema de Portaria
          </h1>
          <p className="text-gray-600">
            Escaneie o crachá para realizar operações
          </p>
        </div>

        {/* Modo de Operação */}
        <Card className="mb-6 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Modo de Operação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={operationMode === "buscar" ? "default" : "outline"}
                onClick={() => {
                  resetToSearch();
                  setOperationMode("buscar");
                }}
                className={
                  operationMode === "buscar"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : ""
                }
              >
                Buscar Usuário
              </Button>
              <Button
                variant={operationMode === "reservar" ? "default" : "outline"}
                onClick={() => setOperationMode("reservar")}
                className={
                  operationMode === "reservar"
                    ? "bg-green-600 hover:bg-green-700"
                    : ""
                }
              >
                Fazer Reserva
              </Button>
              <Button
                variant={operationMode === "retirar" ? "default" : "outline"}
                onClick={() => setOperationMode("retirar")}
                className={
                  operationMode === "retirar"
                    ? "bg-orange-600 hover:bg-orange-700"
                    : ""
                }
              >
                Registrar Retirada
              </Button>
              <Button
                variant={operationMode === "devolver" ? "default" : "outline"}
                onClick={() => setOperationMode("devolver")}
                className={
                  operationMode === "devolver"
                    ? "bg-purple-600 hover:bg-purple-700"
                    : ""
                }
              >
                Registrar Devolução
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Input Principal */}
        <Card className="mb-8 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-600" />
              {operationMode === "buscar" &&
                "Leitura de Crachá - Buscar Usuário"}
              {operationMode === "reservar" &&
                "Escaneie o crachá para fazer reserva"}
              {operationMode === "retirar" &&
                "Escaneie o crachá para registrar retirada"}
              {operationMode === "devolver" &&
                "Escaneie o crachá para registrar devolução"}
            </CardTitle>
            <CardDescription>
              {operationMode === "buscar" &&
                "Escaneie ou digite a matrícula do usuário"}
              {operationMode === "reservar" &&
                "Escaneie o crachá do usuário que fará a reserva"}
              {operationMode === "retirar" &&
                "Escaneie o crachá do usuário que retirará o item"}
              {operationMode === "devolver" &&
                "Escaneie o crachá do usuário que devolverá o item"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {operationMode === "buscar" ? (
              <div className="flex gap-4">
                <Input
                  ref={matriculaInputRef}
                  placeholder="Escaneie o crachá ou digite a matrícula..."
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  onKeyPress={handleMatriculaSubmit}
                  className="flex-1 text-lg py-3"
                  disabled={loading}
                />
                <Button
                  onClick={() => buscarUsuario()}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 px-8"
                >
                  {loading ? "Buscando..." : "Buscar"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Input
                  ref={operationInputRef}
                  placeholder="Escaneie o crachá..."
                  onKeyPress={handleOperationSubmit}
                  className="text-lg py-3"
                  disabled={loading}
                />
                <Button
                  onClick={resetToSearch}
                  variant="outline"
                  className="w-full"
                >
                  Voltar para Busca
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alertas */}
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

        {/* Informações do Usuário */}
        {usuario && (
          <Card className="mb-8 bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-purple-600" />
                Informações do Usuário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nome</p>
                  <p className="font-semibold text-lg">{usuario.nome}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Matrícula</p>
                  <p className="font-semibold text-lg">{usuario.matricula}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tipo</p>
                  <Badge className={getTipoColor(usuario.tipo)}>
                    {usuario.tipo}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Reservas Ativas */}
          {usuario && (
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  Reservas Ativas ({reservasAtivas.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reservasAtivas.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Nenhuma reserva ativa encontrada
                  </p>
                ) : (
                  <div className="space-y-4">
                    {reservasAtivas.map((reserva) => (
                      <div
                        key={reserva.id}
                        className="border rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-lg">
                            {reserva.nomeItem}
                          </h4>
                          <Badge className={getStatusColor(reserva.status)}>
                            {reserva.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Reservado em:{" "}
                          {new Date(reserva.dataReserva).toLocaleString(
                            "pt-BR"
                          )}
                        </p>
                        {reserva.dataRetirada && (
                          <p className="text-sm text-gray-600 mb-3">
                            Retirado em:{" "}
                            {new Date(reserva.dataRetirada).toLocaleString(
                              "pt-BR"
                            )}
                          </p>
                        )}
                        <div className="flex gap-2">
                          {reserva.status === "RESERVADO" && (
                            <Button
                              size="sm"
                              onClick={() => registrarRetirada(reserva.id)}
                              disabled={loading}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Registrar Retirada
                            </Button>
                          )}
                          {reserva.status === "RETIRADO" && (
                            <Button
                              size="sm"
                              onClick={() => registrarDevolucao(reserva.id)}
                              disabled={loading}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Registrar Devolução
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Itens Disponíveis */}
          {usuario && (
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-600" />
                  Itens Disponíveis ({itensDisponiveis.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {itensDisponiveis.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Nenhum item disponível no momento
                  </p>
                ) : (
                  <div className="space-y-4">
                    {itensDisponiveis.map((item) => (
                      <div
                        key={item.id}
                        className="border rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-lg">{item.nome}</h4>
                          <Badge variant="outline">{item.tipo}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Localização: {item.localizacao}
                        </p>
                        <Button
                          size="sm"
                          onClick={() => fazerReserva(item.id)}
                          disabled={loading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Fazer Reserva
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
