"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Package, Calendar, Activity, Search } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/header";
import { api } from "@/lib/api";
import Image from "next/image";

interface DashboardData {
  itensDisponiveis: number;
  totalItens: number;
  reservasAtivas: number;
  totalReservas: number;
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await api.getDashboard();
        setDashboardData(data);
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
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

      <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-blue-100">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <Image
                src="/ufn-banner.png"
                alt="Universidade Franciscana - UFN"
                width={400}
                height={120}
                className="h-20 md:h-24 w-auto"
                priority
              />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-blue-50 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Itens Disponíveis
              </CardTitle>
              <Package className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {dashboardData?.itensDisponiveis || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                de {dashboardData?.totalItens || 0} itens totais
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Reservas Ativas
              </CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {dashboardData?.reservasAtivas || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                reservas em andamento
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Reservas
              </CardTitle>
              <Activity className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {dashboardData?.totalReservas || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                reservas realizadas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taxa de Ocupação
              </CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {dashboardData
                  ? Math.round(
                      ((dashboardData.totalItens -
                        dashboardData.itensDisponiveis) /
                        dashboardData.totalItens) *
                        100
                    ) || 0
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">itens em uso</p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-white shadow-lg hover:shadow-xl transition-all hover:scale-105 border-t-4 border-t-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-blue-600" />
                  Leitura de Crachá
                </CardTitle>
                <CardDescription>
                  Consulte usuários e faça operações via matrícula
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/portaria">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Acessar Portaria
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg hover:shadow-xl transition-all hover:scale-105 border-t-4 border-t-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-600" />
                  Gerenciar Itens
                </CardTitle>
                <CardDescription>
                  Adicione, edite e controle a disponibilidade dos itens
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/itens">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Ver Itens
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg hover:shadow-xl transition-all hover:scale-105 border-t-4 border-t-purple-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Gerenciar Usuários
                </CardTitle>
                <CardDescription>
                  Cadastre e gerencie usuários do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/usuarios">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Ver Usuários
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
