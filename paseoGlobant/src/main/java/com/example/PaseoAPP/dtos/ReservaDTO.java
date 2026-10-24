package com.example.PaseoAPP.dtos;

import java.util.UUID;

public record ReservaDTO(
        UUID id,
        UUID espacioId,
        String espacioNombre,
        String fecha,
        String tiempo
) {}
