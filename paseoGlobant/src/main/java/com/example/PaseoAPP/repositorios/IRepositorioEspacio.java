package com.example.PaseoAPP.repositorios;

import com.example.PaseoAPP.modelos.Espacio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
import jakarta.persistence.LockModeType;

@Repository
public interface IRepositorioEspacio extends JpaRepository<Espacio, UUID> {

    Optional<Espacio> findByNombre(String nombre);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select espacio from Espacio espacio where espacio.id = :id")
    Optional<Espacio> bloquearPorId(@Param("id") UUID id);
}
