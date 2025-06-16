package com.gilbertomorales.portaria.controller;

import com.gilbertomorales.portaria.model.Item;
import com.gilbertomorales.portaria.model.enums.TipoItem;
import com.gilbertomorales.portaria.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ItemController {

    private final ItemService itemService;

    @GetMapping
    public ResponseEntity<List<Item>> getAllItems() {
        List<Item> items = itemService.findAll();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/disponiveis")
    public ResponseEntity<List<Item>> getItensDisponiveis() {
        List<Item> items = itemService.findDisponiveis();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<Item>> getItensByTipo(@PathVariable TipoItem tipo) {
        List<Item> items = itemService.findByTipo(tipo);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/disponiveis/tipo/{tipo}")
    public ResponseEntity<List<Item>> getItensDisponiveisByTipo(@PathVariable TipoItem tipo) {
        List<Item> items = itemService.findDisponiveisByTipo(tipo);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Item> getItemById(@PathVariable String id) {
        return itemService.findById(id)
                .map(item -> ResponseEntity.ok(item))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Item> createItem(@Valid @RequestBody Item item) {
        Item savedItem = itemService.save(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedItem);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Item> updateItem(@PathVariable String id, @Valid @RequestBody Item item) {
        try {
            Item updatedItem = itemService.update(id, item);
            return ResponseEntity.ok(updatedItem);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/disponibilidade")
    public ResponseEntity<Item> toggleDisponibilidade(@PathVariable String id, @RequestParam boolean disponivel) {
        try {
            Item item = disponivel ?
                    itemService.marcarComoDisponivel(id) :
                    itemService.marcarComoIndisponivel(id);
            return ResponseEntity.ok(item);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable String id) {
        itemService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
