package com.gilbertomorales.portaria.repository;

import com.gilbertomorales.portaria.model.Reserva;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReservaRepository extends MongoRepository<Reserva, String> {

    List<Reserva> findByItemId(String itemId);

    List<Reserva> findByUsuarioId(String usuarioId);

    List<Reserva> findByMatriculaUsuario(String matriculaUsuario);

    Optional<Reserva> findByItemIdAndDataDevolucaoIsNull(String itemId);

    List<Reserva> findByUsuarioIdAndDataDevolucaoIsNull(String usuarioId);

    List<Reserva> findByMatriculaUsuarioAndDataDevolucaoIsNull(String matriculaUsuario);
}
