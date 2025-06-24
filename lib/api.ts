// Requisicões

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export interface User {
  id: string;
  nome: string;
  tipo: "ALUNO" | "PROFESSOR" | "PORTEIRO";
  matricula: string;
  email: string;
}

export interface Item {
  id: string;
  nome: string;
  tipo: "CHAVE" | "CONTROLE" | "OUTRO";
  disponivel: boolean;
  localizacao: string;
}

export interface ReservaResponse {
  id: string;
  itemId: string;
  nomeItem: string;
  usuarioId: string;
  nomeUsuario: string;
  matriculaUsuario: string;
  dataReserva: string;
  dataRetirada?: string;
  dataDevolucao?: string;
  status: "RESERVADO" | "RETIRADO" | "DEVOLVIDO";
}

export interface ReservaRequest {
  itemId: string;
  matriculaUsuario: string;
}

export interface RetiradaDevolucaoRequest {
  matriculaUsuario: string;
}

export interface LimparReservasResponse {
  message: string;
  reservasAtivasRemovidas: number;
  totalReservasRemovidas: number;
  itensDisponibilizados: number;
  timestamp: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      if (
        response.status === 204 ||
        response.headers.get("content-length") === "0"
      ) {
        return undefined as T;
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const text = await response.text();
        if (text.trim() === "") {
          return undefined as T;
        }
        return JSON.parse(text);
      }

      return undefined as T;
    } catch (error) {
      console.error("API Request Error:", error);
      throw error;
    }
  }

  async getDashboard() {
    return this.request<{
      itensDisponiveis: number;
      totalItens: number;
      reservasAtivas: number;
      totalReservas: number;
    }>("/portaria/dashboard");
  }

  async getUsers(): Promise<User[]> {
    return this.request<User[]>("/users");
  }

  async getUserById(id: string): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  async getUserByMatricula(matricula: string): Promise<User> {
    return this.request<User>(`/users/matricula/${matricula}`);
  }

  async createUser(user: Omit<User, "id">): Promise<User> {
    return this.request<User>("/users", {
      method: "POST",
      body: JSON.stringify(user),
    });
  }

  async updateUser(id: string, user: Omit<User, "id">): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(user),
    });
  }

  async deleteUser(id: string): Promise<void> {
    await this.request<void>(`/users/${id}`, {
      method: "DELETE",
    });
  }

  async getItems(): Promise<Item[]> {
    return this.request<Item[]>("/items");
  }

  async getAvailableItems(): Promise<Item[]> {
    return this.request<Item[]>("/items/disponiveis");
  }

  async getItemById(id: string): Promise<Item> {
    return this.request<Item>(`/items/${id}`);
  }

  async createItem(item: Omit<Item, "id">): Promise<Item> {
    return this.request<Item>("/items", {
      method: "POST",
      body: JSON.stringify(item),
    });
  }

  async updateItem(id: string, item: Omit<Item, "id">): Promise<Item> {
    return this.request<Item>(`/items/${id}`, {
      method: "PUT",
      body: JSON.stringify(item),
    });
  }

  async toggleItemAvailability(id: string, disponivel: boolean): Promise<Item> {
    return this.request<Item>(
      `/items/${id}/disponibilidade?disponivel=${disponivel}`,
      {
        method: "PATCH",
      }
    );
  }

  async deleteItem(id: string): Promise<void> {
    await this.request<void>(`/items/${id}`, {
      method: "DELETE",
    });
  }

  async getReservas(): Promise<ReservaResponse[]> {
    return this.request<ReservaResponse[]>("/reservas");
  }

  async getReservasByMatricula(matricula: string): Promise<ReservaResponse[]> {
    return this.request<ReservaResponse[]>(
      `/reservas/usuario/matricula/${matricula}`
    );
  }

  async getReservasAtivasByMatricula(
    matricula: string
  ): Promise<ReservaResponse[]> {
    return this.request<ReservaResponse[]>(
      `/reservas/ativas/matricula/${matricula}`
    );
  }

  async createReserva(reserva: ReservaRequest): Promise<ReservaResponse> {
    return this.request<ReservaResponse>("/reservas", {
      method: "POST",
      body: JSON.stringify(reserva),
    });
  }

  async registrarRetirada(
    reservaId: string,
    request: RetiradaDevolucaoRequest
  ): Promise<ReservaResponse> {
    return this.request<ReservaResponse>(`/reservas/${reservaId}/retirada`, {
      method: "PATCH",
      body: JSON.stringify(request),
    });
  }

  async registrarDevolucao(
    reservaId: string,
    request: RetiradaDevolucaoRequest
  ): Promise<ReservaResponse> {
    return this.request<ReservaResponse>(`/reservas/${reservaId}/devolucao`, {
      method: "PATCH",
      body: JSON.stringify(request),
    });
  }

  async limparTodasReservas(): Promise<LimparReservasResponse> {
    return this.request<LimparReservasResponse>("/portaria/limpar", {
      method: "DELETE",
    });
  }

  async lerCracha(matricula: string): Promise<User> {
    return this.request<User>(`/portaria/cracha/${matricula}`);
  }

  async reservarPorCracha(
    matricula: string,
    itemId: string
  ): Promise<ReservaResponse> {
    return this.request<ReservaResponse>(
      `/portaria/cracha/${matricula}/reservar/${itemId}`,
      {
        method: "POST",
      }
    );
  }

  async retirarPorCracha(
    matricula: string,
    reservaId: string
  ): Promise<ReservaResponse> {
    return this.request<ReservaResponse>(
      `/portaria/cracha/${matricula}/retirar/${reservaId}`,
      {
        method: "POST",
      }
    );
  }

  async devolverPorCracha(
    matricula: string,
    reservaId: string
  ): Promise<ReservaResponse> {
    return this.request<ReservaResponse>(
      `/portaria/cracha/${matricula}/devolver/${reservaId}`,
      {
        method: "POST",
      }
    );
  }

  async consultarReservasAtivasPorCracha(
    matricula: string
  ): Promise<ReservaResponse[]> {
    return this.request<ReservaResponse[]>(
      `/portaria/cracha/${matricula}/reservas-ativas`
    );
  }
}

export const api = new ApiService();
