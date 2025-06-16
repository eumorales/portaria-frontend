package com.gilbertomorales.portaria.service;

import com.gilbertomorales.portaria.model.Item;
import com.gilbertomorales.portaria.model.enums.TipoItem;
import com.gilbertomorales.portaria.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;

    public List<Item> findAll() {
        return itemRepository.findAll();
    }

    public List<Item> findDisponiveis() {
        return itemRepository.findByDisponivelTrue();
    }

    public List<Item> findByTipo(TipoItem tipo) {
        return itemRepository.findByTipo(tipo);
    }

    public List<Item> findDisponiveisByTipo(TipoItem tipo) {
        return itemRepository.findByDisponivelTrueAndTipo(tipo);
    }

    public Optional<Item> findById(String id) {
        return itemRepository.findById(id);
    }

    public Item save(Item item) {
        return itemRepository.save(item);
    }

    public Item update(String id, Item item) {
        if (!itemRepository.existsById(id)) {
            throw new RuntimeException("Item não encontrado");
        }
        item.setId(id);
        return itemRepository.save(item);
    }

    public void deleteById(String id) {
        itemRepository.deleteById(id);
    }

    public Item marcarComoIndisponivel(String id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item não encontrado"));
        item.setDisponivel(false);
        return itemRepository.save(item);
    }

    public Item marcarComoDisponivel(String id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item não encontrado"));
        item.setDisponivel(true);
        return itemRepository.save(item);
    }
}
