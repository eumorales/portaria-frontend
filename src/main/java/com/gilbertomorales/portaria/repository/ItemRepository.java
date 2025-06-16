package com.gilbertomorales.portaria.repository;

import com.gilbertomorales.portaria.model.Item;
import com.gilbertomorales.portaria.model.enums.TipoItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends MongoRepository<Item, String> {

    List<Item> findByDisponivelTrue();

    List<Item> findByTipo(TipoItem tipo);

    List<Item> findByDisponivelTrueAndTipo(TipoItem tipo);
}
