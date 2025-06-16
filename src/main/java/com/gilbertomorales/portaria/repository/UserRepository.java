package com.gilbertomorales.portaria.repository;

import com.gilbertomorales.portaria.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByMatricula(String matricula);

    boolean existsByMatricula(String matricula);

    boolean existsByEmail(String email);
}
