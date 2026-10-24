package com.example.PaseoAPP.mapeadores;

import com.example.PaseoAPP.enums.Rol;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.Locale;

@Converter
public class ConversorRol implements AttributeConverter<Rol, String> {

    @Override
    public String convertToDatabaseColumn(Rol rol) {
        return rol == null ? null : rol.name();
    }

    @Override
    public Rol convertToEntityAttribute(String valor) {
        if (valor == null) return null;
        return switch (valor.trim().toUpperCase(Locale.ROOT)) {
            case "ADMIN", "ADMINISTRADOR" -> Rol.ADMINISTRADOR;
            case "USER", "USUARIO", "CLIENTE", "INQUILINO" -> Rol.USUARIO;
            default -> throw new IllegalArgumentException("Rol almacenado desconocido: " + valor);
        };
    }
}
