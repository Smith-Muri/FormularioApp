package com.example.PaseoAPP.repositorios;

import com.example.PaseoAPP.modelos.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IRepositorioReserva extends JpaRepository<Reserva, UUID> {

    Optional<Reserva> findByFecha(String fecha);

    List<Reserva> findByEspacio_Id(UUID espacioId);

    boolean existsByEspacio_Id(UUID espacioId);

    List<Reserva> findByOrderByFechaAsc();

    Optional<Reserva> findByIdAndUsuario_Correo(UUID id, String correo);

}
