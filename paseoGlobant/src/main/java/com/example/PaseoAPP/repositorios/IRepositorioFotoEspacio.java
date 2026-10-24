package com.example.PaseoAPP.repositorios;

import com.example.PaseoAPP.modelos.FotoEspacio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface IRepositorioFotoEspacio extends JpaRepository<FotoEspacio, UUID> {
}
