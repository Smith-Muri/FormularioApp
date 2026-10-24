package com.example.PaseoAPP.dtos;

import java.util.UUID;

public record SolicitudReserva(
        UUID espacioId,
        String fecha,
        String tiempo
) {}
