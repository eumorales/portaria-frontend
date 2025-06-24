"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Header } from "@/components/header";
import { api, type ReservaResponse } from "@/lib/api";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Package,
} from "lucide-react";

export default function ReservasPage() {
  const [reservas, setReservas] = useState<ReservaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchReservas();
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

  const fetchReservas = async () => {
    try {
      setLoading(true);
      const data = await api.getReservas();

      const sortedData = [...data].sort((a, b) => {
        if (a.status === "DEVOLVIDO" && b.status === "DEVOLVIDO") {
          return (
            new Date(b.dataDevolucao!).getTime() -
            new Date(a.dataDevolucao!).getTime()
          );
        }
        if (a.status === "DEVOLVIDO") return 1;
        if (b.status === "DEVOLVIDO") return -1;

        return (
          new Date(b.dataReserva).getTime() - new Date(a.dataReserva).getTime()
        );
      });

      setReservas(sortedData);
    } catch (error) {
      setError("Erro ao carregar reservas");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RESERVADO":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "RETIRADO":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "DEVOLVIDO":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "RESERVADO":
        return <Clock className="h-4 w-4" />;
      case "RETIRADO":
        return <Package className="h-4 w-4" />;
      case "DEVOLVIDO":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <XCircle className="h-4 w-4" />;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getReservasAtivas = () =>
    reservas.filter((r) => r.status !== "DEVOLVIDO");

  const getReservasFinalizadas = () => {
    return reservas
      .filter((r) => r.status === "DEVOLVIDO")
      .sort(
        (a, b) =>
          new Date(b.dataDevolucao!).getTime() -
          new Date(a.dataDevolucao!).getTime()
      );
  };

  if (loading && reservas.length === 0) {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gerenciar Reservas
          </h1>
          <p className="text-gray-600">
            Visualize e acompanhe todas as reservas do sistema
          </p>
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {reservas.length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Reservadas</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {reservas.filter((r) => r.status === "RESERVADO").length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Retiradas</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {reservas.filter((r) => r.status === "RETIRADO").length}
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
                  <p className="text-sm text-gray-600">Devolvidas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {reservas.filter((r) => r.status === "DEVOLVIDO").length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Reservas Ativas ({getReservasAtivas().length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getReservasAtivas().length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhuma reserva ativa no momento
              </p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {getReservasAtivas().map((reserva) => (
                  <Card
                    key={reserva.id}
                    className="border-l-4 border-l-orange-400"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-lg">
                          {reserva.nomeItem}
                        </h4>
                        <Badge className={getStatusColor(reserva.status)}>
                          {getStatusIcon(reserva.status)}
                          <span className="ml-1">{reserva.status}</span>
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="h-4 w-4" />
                          <span>
                            {reserva.nomeUsuario} ({reserva.matriculaUsuario})
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Reservado: {formatDateTime(reserva.dataReserva)}
                          </span>
                        </div>

                        {reserva.dataRetirada && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Package className="h-4 w-4" />
                            <span>
                              Retirado: {formatDateTime(reserva.dataRetirada)}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Histórico de Reservas ({getReservasFinalizadas().length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getReservasFinalizadas().length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhuma reserva finalizada ainda
              </p>
            ) : (
              <div className="space-y-4">
                {getReservasFinalizadas().map((reserva) => (
                  <Card
                    key={reserva.id}
                    className="border-l-4 border-l-green-400"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-lg">
                          {reserva.nomeItem}
                        </h4>
                        <Badge className={getStatusColor(reserva.status)}>
                          {getStatusIcon(reserva.status)}
                          <span className="ml-1">{reserva.status}</span>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="flex items-center gap-2 text-gray-600 mb-1">
                            <User className="h-4 w-4" />
                            <span className="font-medium">Usuário</span>
                          </div>
                          <p>{reserva.nomeUsuario}</p>
                          <p className="text-gray-500">
                            ({reserva.matriculaUsuario})
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 text-gray-600 mb-1">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">Período</span>
                          </div>
                          <p>
                            Reservado: {formatDateTime(reserva.dataReserva)}
                          </p>
                          {reserva.dataRetirada && (
                            <p>
                              Retirado: {formatDateTime(reserva.dataRetirada)}
                            </p>
                          )}
                          {reserva.dataDevolucao && (
                            <p>
                              Devolvido: {formatDateTime(reserva.dataDevolucao)}
                            </p>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 text-gray-600 mb-1">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">Duração</span>
                          </div>
                          {reserva.dataDevolucao && reserva.dataRetirada && (
                            <p>
                              {Math.round(
                                (new Date(reserva.dataDevolucao).getTime() -
                                  new Date(reserva.dataRetirada).getTime()) /
                                  (1000 * 60 * 60 * 24)
                              )}{" "}
                              dias
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {reservas.length === 0 && (
          <Card className="bg-white shadow-lg">
            <CardContent className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma reserva encontrada
              </h3>
              <p className="text-gray-600">
                As reservas aparecerão aqui quando forem criadas
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
