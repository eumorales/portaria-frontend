package com.gilbertomorales.portaria.service;

import com.gilbertomorales.portaria.model.User;
import com.gilbertomorales.portaria.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public Optional<User> findById(String id) {
        return userRepository.findById(id);
    }

    public Optional<User> findByMatricula(String matricula) {
        return userRepository.findByMatricula(matricula);
    }

    public User save(User user) {
        if (userRepository.existsByMatricula(user.getMatricula())) {
            throw new RuntimeException("Já existe um usuário com esta matrícula");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Já existe um usuário com este email");
        }
        return userRepository.save(user);
    }

    public User update(String id, User user) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // Verifica se a matrícula não está sendo usada por outro usuário
        if (!existingUser.getMatricula().equals(user.getMatricula()) &&
                userRepository.existsByMatricula(user.getMatricula())) {
            throw new RuntimeException("Já existe um usuário com esta matrícula");
        }

        // Verifica se o email não está sendo usado por outro usuário
        if (!existingUser.getEmail().equals(user.getEmail()) &&
                userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Já existe um usuário com este email");
        }

        user.setId(id);
        return userRepository.save(user);
    }

    public void deleteById(String id) {
        userRepository.deleteById(id);
    }
}
