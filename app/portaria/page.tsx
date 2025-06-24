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
  UserIcon,
  Calendar,
  Package,
  CheckCircle,
  XCircle,
  CreditCard,
  ArrowLeft,
  Plus,
  Download,
  RotateCcw,
} from "lucide-react";

export default function PortariaPage() {
  const [matricula, setMatricula] = useState("");
  const [usuario, setUsuario] = useState<User | null>(null);
  const [reservasAtivas, setReservasAtivas] = useState<ReservaResponse[]>([]);
  const [itensDisponiveis, setItensDisponiveis] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const matriculaInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (matriculaInputRef.current) {
      matriculaInputRef.current.focus();
    }
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

  const resetToSearch = () => {
    setMatricula("");
    setUsuario(null);
    setReservasAtivas([]);
    setItensDisponiveis([]);
    setError("");
    setSuccess("");
    setTimeout(() => {
      if (matriculaInputRef.current) {
        matriculaInputRef.current.focus();
      }
    }, 100);
  };

  const buscarUsuario = async () => {
    if (!matricula.trim()) {
      setError("Digite uma matrícula");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const user = await api.lerCracha(matricula);
      const reservas = await api.consultarReservasAtivasPorCracha(matricula);
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

  const fazerReserva = async (itemId: string) => {
    if (!usuario?.matricula || !itemId) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const reserva = await api.reservarPorCracha(usuario.matricula, itemId);
      setSuccess(`Reserva realizada: ${reserva.nomeItem}`);

      const reservas = await api.consultarReservasAtivasPorCracha(
        usuario.matricula
      );
      const itens = await api.getAvailableItems();
      setReservasAtivas(reservas);
      setItensDisponiveis(itens);
    } catch (error) {
      setError("Erro ao fazer reserva");
    } finally {
      setLoading(false);
    }
  };

  const registrarRetirada = async (reservaId: string) => {
    if (!usuario?.matricula || !reservaId) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const reserva = await api.retirarPorCracha(usuario.matricula, reservaId);
      setSuccess(`Retirada registrada: ${reserva.nomeItem}`);

      const reservas = await api.consultarReservasAtivasPorCracha(
        usuario.matricula
      );
      setReservasAtivas(reservas);
    } catch (error) {
      setError("Erro ao registrar retirada");
    } finally {
      setLoading(false);
    }
  };

  const registrarDevolucao = async (reservaId: string) => {
    if (!usuario?.matricula || !reservaId) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const reserva = await api.devolverPorCracha(usuario.matricula, reservaId);
      setSuccess(`Devolução registrada: ${reserva.nomeItem}`);

      const reservas = await api.consultarReservasAtivasPorCracha(
        usuario.matricula
      );
      const itens = await api.getAvailableItems();
      setReservasAtivas(reservas);
      setItensDisponiveis(itens);
    } catch (error) {
      setError("Erro ao registrar devolução");
    } finally {
      setLoading(false);
    }
  };

  const handleMatriculaSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      e.preventDefault();
      buscarUsuario();
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
            {!usuario
              ? "Escaneie ou digite a matrícula para começar"
              : "Gerencie as reservas do usuário"}
          </p>
        </div>

        {!usuario && (
          <Card className="mb-8 bg-white shadow-lg max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Leitura de Crachá
              </CardTitle>
              <CardDescription>
                Escaneie o crachá ou digite a matrícula do usuário
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                  onClick={buscarUsuario}
                  disabled={loading || !matricula.trim()}
                  className="bg-blue-600 hover:bg-blue-700 px-8"
                >
                  {loading ? "Buscando..." : "Buscar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50 max-w-4xl mx-auto">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50 max-w-4xl mx-auto">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {usuario && (
          <>
            <Card className="mb-8 bg-white shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <UserIcon className="h-12 w-12 text-purple-600 bg-purple-100 rounded-full p-2" />
                    <div>
                      <CardTitle className="text-2xl">{usuario.nome}</CardTitle>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-gray-600">
                          Matrícula: <strong>{usuario.matricula}</strong>
                        </span>
                        <Badge className={getTipoColor(usuario.tipo)}>
                          {usuario.tipo}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={resetToSearch}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Buscar Outro Usuário
                  </Button>
                </div>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    Reservas Ativas ({reservasAtivas.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {reservasAtivas.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhuma reserva ativa</p>
                    </div>
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
                                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1"
                              >
                                <Download className="h-3 w-3" />
                                Registrar Retirada
                              </Button>
                            )}
                            {reserva.status === "RETIRADO" && (
                              <Button
                                size="sm"
                                onClick={() => registrarDevolucao(reserva.id)}
                                disabled={loading}
                                className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                              >
                                <RotateCcw className="h-3 w-3" />
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

              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-green-600" />
                    Itens Disponíveis ({itensDisponiveis.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {itensDisponiveis.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        Nenhum item disponível no momento
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {itensDisponiveis.map((item) => (
                        <div
                          key={item.id}
                          className="border rounded-lg p-4 hover:bg-gray-50"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-lg">
                              {item.nome}
                            </h4>
                            <Badge variant="outline">{item.tipo}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            Localização: {item.localizacao}
                          </p>
                          <Button
                            size="sm"
                            onClick={() => fazerReserva(item.id)}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" />
                            Fazer Reserva
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
